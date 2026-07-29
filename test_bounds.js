import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// We can parse the GLTF JSON to see the bounding box directly from the accessors!
const data = fs.readFileSync('public/models/macbook_pro_m5_max_16_inch_2026.glb');
const jsonChunkLength = data.readUInt32LE(12);
const jsonChunkData = data.subarray(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonChunkData.toString('utf8'));

[10, 15, 44, 48].forEach(idx => {
  const mesh = gltf.meshes[idx];
  const prim = mesh.primitives[0];
  const positionAccessor = gltf.accessors[prim.attributes.POSITION];
  
  console.log(`Mesh ${idx} (${mesh.name}):`);
  console.log(`  Min:`, positionAccessor.min);
  console.log(`  Max:`, positionAccessor.max);
});

