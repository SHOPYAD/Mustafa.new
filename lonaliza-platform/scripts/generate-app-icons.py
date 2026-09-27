#!/usr/bin/env python3
import os
import sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_ICON = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "public/icon.png")
APP_DIR = os.path.join(ROOT, "Lonalizamobilapp")
RES_DIR = os.path.join(APP_DIR, "android/app/src/main/res")
STORE_DIR = os.path.join(ROOT, "public/app/store-assets")

def make_round_icon(img):
    size = img.size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    round_img = Image.new("RGBA", size, (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def main():
    if not os.path.exists(SRC_ICON):
        print(f"Source icon not found: {SRC_ICON}")
        return 1

    img = Image.open(SRC_ICON).convert("RGBA")
    print(f"Loaded master icon: {SRC_ICON} ({img.size[0]}x{img.size[1]})")

    os.makedirs(STORE_DIR, exist_ok=True)

    # 1. Google Play Console Master Icon (512x512)
    play_icon = img.resize((512, 512), Image.Resampling.LANCZOS)
    play_icon_path = os.path.join(STORE_DIR, "google-play-icon-512.png")
    play_icon.save(play_icon_path, "PNG")
    print(f"Saved: {play_icon_path}")

    # 2. Apple App Store Master Icon (1024x1024, RGB no alpha)
    ios_master = Image.new("RGB", (1024, 1024), (46, 16, 101)) # Luxury brand royal purple background
    resized_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    ios_master.paste(resized_1024, (0, 0), mask=resized_1024.split()[3])
    ios_icon_path = os.path.join(STORE_DIR, "app-store-icon-1024.png")
    ios_master.save(ios_icon_path, "PNG")
    print(f"Saved: {ios_icon_path}")

    # 3. Android Mipmap Densities
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, size in densities.items():
        out_dir = os.path.join(RES_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)

        # Standard icon
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        out_path = os.path.join(out_dir, "ic_launcher.png")
        resized.save(out_path, "PNG")

        # Round icon
        round_icon = make_round_icon(resized)
        round_path = os.path.join(out_dir, "ic_launcher_round.png")
        round_icon.save(round_path, "PNG")

        print(f"Generated Android {folder}: {size}x{size}")

    # 4. iOS AppIcon.appiconset
    ios_xcassets = os.path.join(APP_DIR, "ios/Runner/Assets.xcassets/AppIcon.appiconset")
    if os.path.exists(ios_xcassets):
        ios_sizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024]
        for s in ios_sizes:
            ios_resized = ios_master.resize((s, s), Image.Resampling.LANCZOS)
            ios_resized.save(os.path.join(ios_xcassets, f"Icon-App-{s}x{s}.png"), "PNG")
        print("Updated iOS xcassets icons.")

    print("All app icons generated successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
