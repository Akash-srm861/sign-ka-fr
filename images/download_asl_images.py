"""
Download ASL alphabet images from LifePrint.com
"""
import urllib.request
import os

# Create signs directory if it doesn't exist
os.makedirs('signs', exist_ok=True)

# ASL alphabet letters
letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
           'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

print("Downloading ASL alphabet images...")

for letter in letters:
    url = f"https://www.lifeprint.com/asl101/images-signs/{letter}.jpg"
    output_file = f"signs/{letter}.png"
    
    try:
        print(f"Downloading {letter.upper()}... ", end='')
        urllib.request.urlretrieve(url, output_file)
        print("✓")
    except Exception as e:
        print(f"✗ ({str(e)})")

print("\nDone! Images saved to 'signs/' directory")
