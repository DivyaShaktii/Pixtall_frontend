import fs from 'fs';
import * as THREE from 'three';

// minimal polyfill
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

// Override texture loader to ignore textures
THREE.TextureLoader.prototype.load = function(url, onLoad) {
    if (onLoad) onLoad(new THREE.Texture());
    return new THREE.Texture();
};
THREE.ImageBitmapLoader.prototype.load = function(url, onLoad) {
    if (onLoad) onLoad({ width: 1, height: 1, close: () => {} });
    return {};
};

loader.parse(arrayBuffer, '', (gltf) => {
    let target = null;
    gltf.scene.traverse((child) => {
        if (child.isMesh && child.name === 'Object_10') {
            target = child;
        }
    });

    if (target) {
        const geom = target.geometry;
        geom.computeVertexNormals();
        
        const posAttr = geom.attributes.position;
        const normAttr = geom.attributes.normal;
        
        console.log(`Object_10 geometry has ${posAttr.count} vertices.`);
        
        // Print first 3 vertices and normals
        for (let i = 0; i < 3; i++) {
            const px = posAttr.getX(i);
            const py = posAttr.getY(i);
            const pz = posAttr.getZ(i);
            
            const nx = normAttr.getX(i);
            const ny = normAttr.getY(i);
            const nz = normAttr.getZ(i);
            
            console.log(`Vertex ${i}: pos(${px.toFixed(4)}, ${py.toFixed(4)}, ${pz.toFixed(4)}) normal(${nx.toFixed(4)}, ${ny.toFixed(4)}, ${nz.toFixed(4)})`);
        }
        
        // Let's compute actual physical height on the surface (distance between min and max Y taking Z into account)
        geom.computeBoundingBox();
        const bbox = geom.boundingBox;
        console.log(`Bounding Box: min(${bbox.min.x.toFixed(4)}, ${bbox.min.y.toFixed(4)}, ${bbox.min.z.toFixed(4)}) max(${bbox.max.x.toFixed(4)}, ${bbox.max.y.toFixed(4)}, ${bbox.max.z.toFixed(4)})`);
    } else {
        console.log("Object_10 not found");
    }
});
