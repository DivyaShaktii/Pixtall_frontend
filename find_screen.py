import json
import struct
import sys

def parse_glb(filepath):
    with open(filepath, 'rb') as f:
        magic, version, length = struct.unpack('<4sII', f.read(12))
        chunk_length, chunk_type = struct.unpack('<II', f.read(8))
        json_data = f.read(chunk_length).decode('utf-8')
        gltf = json.loads(json_data)
        
        # Read the binary buffer
        bin_chunk_length, bin_chunk_type = struct.unpack('<II', f.read(8))
        bin_data = f.read(bin_chunk_length)
        return gltf, bin_data

def get_accessor_data(gltf, bin_data, accessor_idx):
    accessor = gltf['accessors'][accessor_idx]
    buffer_view_idx = accessor['bufferView']
    buffer_view = gltf['bufferViews'][buffer_view_idx]
    
    offset = buffer_view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    count = accessor['count']
    
    # We only need min and max for bounding box!
    if 'min' in accessor and 'max' in accessor:
        return accessor['min'], accessor['max']
    return None, None

def main():
    gltf, bin_data = parse_glb('public/models/macbook_pro_m5_max_16_inch_2026.glb')
    
    print("Looking for meshes that could be the screen (Aspect ratio ~1.5 - 1.8, thin depth)...")
    for mesh_idx, mesh in enumerate(gltf.get('meshes', [])):
        name = mesh.get('name', f'Mesh_{mesh_idx}')
        for prim_idx, prim in enumerate(mesh.get('primitives', [])):
            if 'POSITION' in prim.get('attributes', {}):
                acc_idx = prim['attributes']['POSITION']
                amin, amax = get_accessor_data(gltf, bin_data, acc_idx)
                if amin and amax:
                    width = amax[0] - amin[0]
                    height = amax[1] - amin[1]
                    depth = amax[2] - amin[2]
                    
                    # A screen is usually wide and tall but very thin
                    if width > 0.1 and height > 0.1:
                        if depth < (width * 0.1): # Very thin
                            aspect = width / height
                            if 1.4 < aspect < 1.8:
                                print(f"Found candidate! Name: {name}, Width: {width:.4f}, Height: {height:.4f}, Depth: {depth:.4f}, Aspect: {aspect:.2f}, Min: {amin}, Max: {amax}")

if __name__ == '__main__':
    main()
