import { useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

export const INITIAL_DEMO_STATE = {
  step: 'upload_start',
  model: 'male',
  category: '',
  scene: '',
  size: '',
  count: 4,
};

export function useDemoTimeline(shouldReduceMotion = false) {
  const [demoState, setDemoState] = useState(INITIAL_DEMO_STATE);
  const [cursor, setCursor] = useState({ x: '90%', y: '110%', opacity: 0, click: false });
  const [ripples, setRipples] = useState([]);

  const setCursorPos = useCallback((x, y, opacity = 1) => {
    setCursor(prev => ({ ...prev, x, y, opacity, click: false }));
  }, []);

  const triggerClick = useCallback(() => {
    setCursor(prev => ({ ...prev, click: true }));
    const id = Date.now();
    setRipples(prev => [...prev, id]);
    setTimeout(() => setCursor(prev => ({ ...prev, click: false })), 200);
    setTimeout(() => setRipples(prev => prev.filter(r => r !== id)), 1000);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDemoState({
        step: 'result',
        model: 'female',
        category: 'accessories',
        scene: 'luxury',
        size: '4:5',
        count: 4,
      });
      return;
    }

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

    // Step 1: Upload state (bag image)
    tl.call(() => {
      setDemoState(INITIAL_DEMO_STATE);
      setCursorPos('90%', '110%', 0);
    });
    tl.to({}, { duration: 0.4 });
    tl.call(() => setCursorPos('90%', '19%', 1));
    tl.to({}, { duration: 1.2 }); // Smooth cursor movement to upload target
    tl.call(triggerClick);
    tl.to({}, { duration: 0.2 });
    tl.call(() => setDemoState(prev => ({ ...prev, step: 'upload_done' })));
    tl.to({}, { duration: 1.5 });

    // Step 2: Auto-advance to model preference selection (male)
    tl.call(() => setCursorPos('84%', '54%', 1));
    tl.to({}, { duration: 1.0 }); // Cursor ease to model tab
    tl.call(triggerClick);
    tl.to({}, { duration: 0.2 });
    tl.call(() => setDemoState(prev => ({ ...prev, step: 'configure_model', model: 'male' })));
    
    // Show model selection modal
    tl.to({}, { duration: 0.5 });
    tl.call(() => setDemoState(prev => ({ ...prev, step: 'show_model_modal' })));
    tl.to({}, { duration: 2.5 });
    tl.call(() => setDemoState(prev => ({ ...prev, step: 'configure_model' }))); // Close modal
    tl.to({}, { duration: 0.5 });

    // Step 3: Auto-advance to size (4:5) & image count selection
    tl.call(() => setCursorPos('85%', '84%', 1));
    tl.to({}, { duration: 1.0 }); // Cursor ease to size dropdown
    tl.call(triggerClick);
    tl.to({}, { duration: 0.2 });
    tl.call(() => setDemoState(prev => ({ 
      ...prev, 
      step: 'configure_settings_size', 
      category: 'accessories',
      scene: 'luxury',
      size: '4:5', 
      count: 4 
    })));
    tl.to({}, { duration: 1.5 });

    // Step 4: Click "Generate"
    tl.call(() => setCursorPos('90%', '94%', 1));
    tl.to({}, { duration: 0.9 }); // Cursor ease to Generate button
    tl.call(triggerClick);
    tl.to({}, { duration: 0.2 });
    tl.call(() => setDemoState(prev => ({ ...prev, step: 'click_generate' })));
    tl.to({}, { duration: 0.3 });

    // Step 5: Reveal generated result thumbnails immediately
    tl.call(() => {
      setCursorPos('92%', '92%', 0); // Hide cursor
      setDemoState(prev => ({ ...prev, step: 'result' }));
    });
    tl.to({}, { duration: 4.0 }); // Pause at result before looping

    return () => {
      tl.kill();
    };
  }, [shouldReduceMotion, setCursorPos, triggerClick]);

  return { demoState, cursor, ripples };
}
