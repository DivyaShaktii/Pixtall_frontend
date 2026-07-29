import fs from 'fs';
const gltfData = JSON.parse(fs.readFileSync('temp.gltf', 'utf8'));

console.log("Images:");
gltfData.images.forEach((img, i) => {
  console.log(`Image ${i}: ${img.name || img.uri || 'unknown'}`);
});

console.log("\nTextures:");
gltfData.textures.forEach((tex, i) => {
  console.log(`Texture ${i}: uses Image ${tex.source}`);
});

console.log("\nMaterials using textures:");
gltfData.materials.forEach((mat, i) => {
  const pbr = mat.pbrMetallicRoughness;
  if (pbr && pbr.baseColorTexture) {
    console.log(`Material ${i} (${mat.name}): baseColorTex = ${pbr.baseColorTexture.index}`);
  }
  if (mat.emissiveTexture) {
    console.log(`Material ${i} (${mat.name}): emissiveTex = ${mat.emissiveTexture.index}`);
  }
});
