import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// read the glb json again
const data = fs.readFileSync('public/models/macbook_pro_m5_max_16_inch_2026.glb');
const jsonChunkLength = data.readUInt32LE(12);
const jsonChunkData = data.subarray(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonChunkData.toString('utf8'));

// The actual vertices are in the binary chunk. We need to load it properly with THREE to get bounding boxes.
// But we can't easily load it in Node without a mock DOM.
