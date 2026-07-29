import fs from 'fs';
const data = fs.readFileSync('public/models/macbook_pro_m5_max_16_inch_2026.glb');
const jsonChunkLength = data.readUInt32LE(12);
const jsonChunkData = data.subarray(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonChunkData.toString('utf8'));

gltf.meshes.forEach((mesh, idx) => {
  const prim = mesh.primitives[0];
  const positionAccessor = gltf.accessors[prim.attributes.POSITION];
  const w = positionAccessor.max[0] - positionAccessor.min[0];
  const h = positionAccessor.max[1] - positionAccessor.min[1];
  const d = positionAccessor.max[2] - positionAccessor.min[2];
  if (w > 10 && h > 5) {
    console.log(`Mesh ${idx} (${mesh.name}): ${w.toFixed(1)} x ${h.toFixed(1)} x ${d.toFixed(1)}`);
  }
});

