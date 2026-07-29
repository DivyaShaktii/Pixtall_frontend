import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

function toArray(buffer) {
  return new Uint8Array(buffer).buffer;
}

// Since we run in Node without a full DOM/WebGL, let's just inspect the JSON of the GLB.
const data = fs.readFileSync('public/models/macbook_pro_m5_max_16_inch_2026.glb');
const magic = data.readUInt32LE(0);
if (magic !== 0x46546C67) throw new Error("Not a GLB");

const jsonChunkLength = data.readUInt32LE(12);
const jsonChunkType = data.readUInt32LE(16);
const jsonChunkData = data.subarray(20, 20 + jsonChunkLength);

const jsonStr = jsonChunkData.toString('utf8');
const gltf = JSON.parse(jsonStr);

gltf.meshes.forEach((mesh, i) => {
    console.log(`Mesh ${i}: ${mesh.name}`);
    if (mesh.primitives) {
        mesh.primitives.forEach((prim, j) => {
            const material = gltf.materials[prim.material];
            console.log(`  Prim ${j}: Material=${material ? material.name : 'none'} ${material && material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture ? 'HAS_TEXTURE' : ''}`);
        });
    }
});

