import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Polyfill for three.js in Node
global.self = global;
global.window = { innerWidth: 1024, innerHeight: 768 };
global.document = { createElement: () => ({ style: {} }) };

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

const data = fs.readFileSync('public/models/macbook_pro_m5_max_16_inch_2026.glb');
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

loader.parse(arrayBuffer, '', (gltf) => {
    let target = null;
    gltf.scene.traverse((child) => {
        if (child.isMesh && child.name === 'Object_10') {
            target = child;
        }
    });

    if (target) {
        target.geometry.computeBoundingBox();
        const bbox = target.geometry.boundingBox;
        
        const dummy = new THREE.Object3D();
        dummy.position.set(
            (bbox.max.x + bbox.min.x) / 2,
            (bbox.max.y + bbox.min.y) / 2,
            bbox.max.z + 0.05
        );
        target.add(dummy);
        
        // Emulate what we did in React
        gltf.scene.updateMatrixWorld(true);
        
        console.log("target.position (Local to its parent):", target.position);
        console.log("target.parent name:", target.parent ? target.parent.name : "None");
        console.log("dummy.position (Local to target):", dummy.position);
        
        const worldPos = new THREE.Vector3();
        dummy.getWorldPosition(worldPos);
        console.log("dummy.getWorldPosition (World space):", worldPos);
        
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        dummy.matrixWorld.decompose(position, quaternion, scale);
        
        console.log("dummy.matrixWorld.decompose position:", position);
        console.log("dummy.matrixWorld.decompose scale:", scale);
        
        // Print the path
        let curr = target;
        const path = [];
        while (curr) {
            path.push(`${curr.name} (pos: ${curr.position.x.toFixed(2)}, ${curr.position.y.toFixed(2)}, ${curr.position.z.toFixed(2)})`);
            curr = curr.parent;
        }
        console.log("Hierarchy:\n  " + path.reverse().join("\n  -> "));
    }
}, (err) => {
    console.error(err);
});
