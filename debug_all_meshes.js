import fs from 'fs';
import * as THREE from 'three';

global.self = global;
global.window = { innerWidth: 1024, innerHeight: 768 };
global.document = { createElement: () => ({ style: {} }) };

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(dracoLoader);

const data = fs.readFileSync('public/models/macbook_pro_m5_max_16_inch_2026.glb');
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

THREE.TextureLoader.prototype.load = function(url, onLoad) {
    if (onLoad) onLoad(new THREE.Texture());
    return new THREE.Texture();
};

loader.parse(arrayBuffer, '', (gltf) => {
    console.log("Parsing complete. Finding all meshes...");
    gltf.scene.updateMatrixWorld(true);

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.geometry.computeBoundingBox();
            const bbox = child.geometry.boundingBox;
            const width = bbox.max.x - bbox.min.x;
            const height = bbox.max.y - bbox.min.y;
            const depth = bbox.max.z - bbox.min.z;
            
            const worldPos = new THREE.Vector3();
            child.getWorldPosition(worldPos);
            
            console.log(`Mesh: ${child.name}`);
            console.log(`  Width: ${width.toFixed(3)}, Height: ${height.toFixed(3)}, Depth: ${depth.toFixed(3)}`);
            console.log(`  WorldPos: ${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)}`);
            console.log(`  Material: ${child.material.name}`);
        }
    });
});
