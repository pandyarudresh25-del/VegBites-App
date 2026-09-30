import os
import re

def fix_file(path, depth):
    prefix = '../' * depth
    local_img = f"require('{prefix}assets/images/gujarati_thali.jpg')"
    local_avatar = f"require('{prefix}assets/images/icon.png')"
    
    with open(path, 'r') as f:
        content = f.read()
        
    # Replace all unsplash image objects in arrays
    # like image: 'https://...' -> image: require(...)
    content = re.sub(r"image:\s*'https://images\.unsplash\.com/[^']*'", f"image: {local_img}", content)
    content = re.sub(r"image:\s*\{\s*uri:\s*'https://images\.unsplash\.com/[^']*'\s*\}", f"image: {local_img}", content)
    
    # Replace source={{uri: 'https://...'}} -> source={require(...)}
    content = re.sub(r"source=\{\{\s*uri:\s*'https://images\.unsplash\.com/[^']*'\s*\}\}", f"source={{{local_img}}}", content)
    
    # Replace avatars (photo-159956...) specifically if needed, but above covers it.
    
    with open(path, 'w') as f:
        f.write(content)

files_to_fix = [
    ('src/app/(customer)/restaurant/item.tsx', 4),
    ('src/app/(customer)/restaurant/[id].tsx', 4),
    ('src/app/(customer)/addons.tsx', 3),
    ('src/app/(customer)/subscription.tsx', 3),
    ('src/app/(customer)/checkout.tsx', 3),
    ('src/app/(customer)/address.tsx', 3),
    ('src/app/(customer)/reels.tsx', 3),
    ('src/app/(customer)/profile.tsx', 3),
    ('src/app/(customer)/tracking/[id].tsx', 4),
    ('src/app/(customer)/tiffins/index.tsx', 4),
    ('src/app/(customer)/tiffins/vendors.tsx', 4),
    ('src/app/(vendor)/menu.tsx', 3),
]

for f, d in files_to_fix:
    if os.path.exists(f):
        fix_file(f, d)

print("Images replaced!")
