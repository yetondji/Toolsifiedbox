#!/usr/bin/env python3
"""
Simple script to convert SVG opengraph images in `assets/icons/` to PNG (1200x630)
Requires: cairosvg
Usage:
  pip install cairosvg
  python scripts/generate_opengraph_pngs.py
"""
import os
import sys

try:
    from cairosvg import svg2png
except Exception as e:
    print("cairosvg is not installed. Install with: pip install cairosvg")
    sys.exit(1)

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icons')
BASE_DIR = os.path.abspath(BASE_DIR)

if not os.path.isdir(BASE_DIR):
    print('Icons directory not found:', BASE_DIR)
    sys.exit(1)

print('Converting SVGs in:', BASE_DIR)
count = 0
for name in os.listdir(BASE_DIR):
    if not name.lower().endswith('.svg'):
        continue
    svg_path = os.path.join(BASE_DIR, name)
    png_name = name[:-4] + '.png'
    png_path = os.path.join(BASE_DIR, png_name)
    try:
        svg2png(url=svg_path, write_to=png_path, output_width=1200, output_height=630)
        print('Wrote', png_path)
        count += 1
    except Exception as ex:
        print('Failed converting', svg_path, '->', ex)

print(f'Done. Converted {count} files.')
