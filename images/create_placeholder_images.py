"""
Generate simple ASL alphabet placeholder images
"""
try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    # Create signs directory
    os.makedirs('signs', exist_ok=True)
    
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    print("Generating ASL alphabet images...")
    
    for letter in letters:
        # Create image
        img = Image.new('RGB', (300, 400), color=(74, 144, 226))
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fallback to default
        try:
            font_large = ImageFont.truetype("arial.ttf", 120)
            font_small = ImageFont.truetype("arial.ttf", 40)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Draw letter
        draw.text((150, 150), letter, fill='white', font=font_large, anchor='mm')
        
        # Draw hand emoji
        draw.text((150, 320), '✋', fill='white', font=font_small, anchor='mm')
        
        # Save
        output_file = f"signs/{letter.lower()}.png"
        img.save(output_file)
        print(f"✓ Generated {letter}")
    
    print(f"\n✓ All {len(letters)} images generated in 'signs/' directory!")
    print("\nTo use real ASL photos:")
    print("1. Download ASL images from https://www.startasl.com/american-sign-language-alphabet/")
    print("2. Save them as a.png, b.png, c.png, etc. in the 'signs/' folder")
    print("3. Refresh your browser")
    
except ImportError:
    print("PIL/Pillow not installed.")
    print("\nInstalling Pillow...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    print("\nNow run this script again!")
