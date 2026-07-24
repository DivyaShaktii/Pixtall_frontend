import fs from 'fs';

const path = '/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/App.jsx';
const content = fs.readFileSync(path, 'utf8');

// Find the block from line 268 to 517
const lines = content.split('\n');
const startIdx = 267; // 0-indexed, line 268
const endIdx = 517; // 0-indexed, line 518 (exclusive)

const originalBlock = lines.slice(startIdx, endIdx).join('\n');

const styles = `
    @scope ([data-impeccable-variant="1"]) {
      :scope > .page-body {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 24px;
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }
      :scope .studio-dashboard { display: contents; }
      :scope .canvas-panel {
        grid-column: 1;
        grid-row: 1;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        background: var(--cloud);
        min-height: calc(100vh - 120px);
      }
      :scope .upload-panel {
        grid-column: 2;
        grid-row: 1;
        align-self: start;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        width: 100%;
        margin-bottom: 24px;
      }
      :scope .studio-config-bar {
        grid-column: 2;
        grid-row: 2;
        position: static;
        flex-direction: column;
        width: 100%;
        border-radius: var(--radius-lg);
        padding: 24px;
        backdrop-filter: none;
        border: 1px solid var(--line);
        background: var(--paper);
        box-shadow: none;
      }
      :scope .config-fields-strip { flex-direction: column; width: 100%; align-items: stretch; gap: 16px; }
      :scope .config-v-divider { display: none; }
      :scope .config-export-zone { width: 100%; flex-direction: column; gap: 12px; margin-top: 16px; }
      :scope .config-export-zone button { width: 100%; }
    }

    @scope ([data-impeccable-variant="2"]) {
      :scope > .page-body {
        display: grid;
        grid-template-columns: 340px 1fr;
        gap: 32px;
        padding: 32px;
        max-width: 1400px;
        margin: 0 auto;
      }
      :scope .studio-dashboard { display: contents; }
      :scope .canvas-panel {
        grid-column: 2;
        grid-row: 1;
        min-height: calc(100vh - 120px);
      }
      :scope .upload-panel {
        grid-column: 1;
        grid-row: 1;
        align-self: start;
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        width: 100%;
      }
      :scope .studio-config-bar {
        grid-column: 1;
        grid-row: 2;
        position: static;
        flex-direction: column;
        width: 100%;
        background: var(--cloud);
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        padding: 24px;
      }
      :scope .config-fields-strip { flex-direction: column; width: 100%; align-items: stretch; gap: 16px; }
      :scope .config-v-divider { display: none; }
      :scope .config-export-zone { width: 100%; flex-direction: column; margin-top: 16px; }
      :scope .config-export-zone button { width: 100%; }
    }

    @scope ([data-impeccable-variant="3"]) {
      :scope > .page-body {
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      :scope .studio-dashboard { width: 100%; max-width: 1200px; margin-bottom: 120px; }
      :scope .canvas-panel { border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
      :scope .upload-panel { border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
      :scope .studio-config-bar {
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 100px;
        padding: 12px 32px;
        background: rgba(14,14,16, 0.95);
        color: #fff;
        box-shadow: var(--shadow-lg);
        width: auto;
      }
      :scope .config-fields-strip label { color: #aaa; }
      :scope .config-v-divider { background: #333; }
      :scope .nav-btn, :scope .model-compact-btn, :scope select { background: transparent; color: #fff; border-color: #333; }
      :scope .model-compact-btn.active { background: #fff; color: #000; }
    }
`;

// Build the replacement text
const replacement = [
  '<div data-impeccable-variants="c2e0b84c" data-impeccable-variant-count="3" style={{display: \'contents\'}}>',
  '  <style data-impeccable-css="c2e0b84c">{`' + styles + '`}</style>',
  '  <div data-impeccable-variant="1" style={{display: \'contents\'}}>',
  originalBlock,
  '  </div>',
  '  <div data-impeccable-variant="2" style={{display: \'none\'}}>',
  originalBlock,
  '  </div>',
  '  <div data-impeccable-variant="3" style={{display: \'none\'}}>',
  originalBlock,
  '  </div>',
  '</div>'
].join('\n');

// Reconstruct the file
const newLines = [
  ...lines.slice(0, startIdx),
  replacement,
  ...lines.slice(endIdx)
];

fs.writeFileSync(path, newLines.join('\n'));
console.log('Successfully replaced block with variants');
