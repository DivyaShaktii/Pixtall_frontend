import fs from 'fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// We can't easily use three.js GLTFLoader in Node without a polyfill.
// Let's just parse the JSON of the GLTF.
const gltfData = JSON.parse(fs.readFileSync('temp.gltf', 'utf8'));

console.log("Meshes:");
gltfData.meshes.forEach((mesh, i) => {
  console.log(`Mesh ${i}: ${mesh.name}`);
  if (mesh.primitives) {
    mesh.primitives.forEach((prim, j) => {
      const mat = gltfData.materials[prim.material];
      console.log(`  Prim ${j}: Material = ${mat ? mat.name : 'none'}`);
    });
  }
});

console.log("\nNodes:");
gltfData.nodes.forEach((node, i) => {
  if (node.mesh !== undefined) {
    console.log(`Node ${i}: ${node.name} -> Mesh ${node.mesh}`);
  }
});
