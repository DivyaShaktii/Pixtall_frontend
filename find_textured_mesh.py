import json
import struct

def get_textured_meshes():
    with open('public/models/macbook_pro_m5_max_16_inch_2026.glb', 'rb') as f:
        magic, version, length = struct.unpack('<4sII', f.read(12))
        chunk_length, chunk_type = struct.unpack('<II', f.read(8))
        json_data = f.read(chunk_length).decode('utf-8')
        gltf = json.loads(json_data)
        
        # Find materials with textures
        textured_mats = set()
        for i, mat in enumerate(gltf.get('materials', [])):
            pbr = mat.get('pbrMetallicRoughness', {})
            if 'baseColorTexture' in pbr:
                textured_mats.add(i)
                print(f"Material {i} ({mat.get('name')}) has a baseColorTexture!")

        # Find meshes using these materials
        print("\nMeshes using these materials:")
        for mesh_idx, mesh in enumerate(gltf.get('meshes', [])):
            for prim in mesh.get('primitives', []):
                mat_idx = prim.get('material')
                if mat_idx in textured_mats:
                    print(f"Mesh '{mesh.get('name', f'Mesh_{mesh_idx}')}' uses Material {mat_idx}")

if __name__ == '__main__':
    get_textured_meshes()
