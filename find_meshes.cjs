const fs = require('fs');
const { parse } = require('@loaders.gl/core');
const { GLTFLoader } = require('@loaders.gl/gltf');
const THREE = require('three');

// We need a DOM-less Three.js GLTF parser.
// Actually, it's easier to just write a temporary React component to log the meshes!
