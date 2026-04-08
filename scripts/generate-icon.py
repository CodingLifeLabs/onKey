#!/usr/bin/env python3
"""Generate OnKey app icon as 128x128 PNG"""
import struct, zlib

def create_png(width, height, pixels):
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))

    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            idx = (y * width + x) * 4
            raw += bytes(pixels[idx:idx+4])

    idat = chunk(b'IDAT', zlib.compress(raw, 9))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def draw_rounded_rect(pixels, w, h, r, color):
    for y in range(h):
        for x in range(w):
            # Check if inside rounded rect
            inside = True
            if x < r and y < r:
                if (x - r)**2 + (y - r)**2 > r**2: inside = False
            elif x >= w - r and y < r:
                if (x - (w-r-1))**2 + (y - r)**2 > r**2: inside = False
            elif x < r and y >= h - r:
                if (x - r)**2 + (y - (h-r-1))**2 > r**2: inside = False
            elif x >= w - r and y >= h - r:
                if (x - (w-r-1))**2 + (y - (h-r-1))**2 > r**2: inside = False

            idx = (y * w + x) * 4
            if inside:
                pixels[idx] = color[0]
                pixels[idx+1] = color[1]
                pixels[idx+2] = color[2]
                pixels[idx+3] = color[3]

def draw_circle(pixels, w, cx, cy, radius, color, thickness=0):
    """Draw circle outline or filled circle"""
    for y in range(w):
        for x in range(w):
            dist = ((x - cx)**2 + (y - cy)**2) ** 0.5
            if thickness > 0:
                if abs(dist - radius) <= thickness / 2:
                    idx = (y * w + x) * 4
                    pixels[idx] = color[0]
                    pixels[idx+1] = color[1]
                    pixels[idx+2] = color[2]
                    pixels[idx+3] = color[3]
            else:
                if dist <= radius:
                    idx = (y * w + x) * 4
                    pixels[idx] = color[0]
                    pixels[idx+1] = color[1]
                    pixels[idx+2] = color[2]
                    pixels[idx+3] = color[3]

def draw_rect(pixels, w, x1, y1, x2, y2, color):
    for y in range(max(0, y1), min(w, y2+1)):
        for x in range(max(0, x1), min(w, x2+1)):
            idx = (y * w + x) * 4
            pixels[idx] = color[0]
            pixels[idx+1] = color[1]
            pixels[idx+2] = color[2]
            pixels[idx+3] = color[3]

size = 128
pixels = [0] * (size * size * 4)

# Primary color: #2563EB (blue-600)
primary = (37, 99, 235, 255)
white = (255, 255, 255, 255)

# Background: rounded rect
draw_rounded_rect(pixels, size, size, 28, primary)

# Key icon (simplified)
# Key head: circle outline at top
cx, cy = 64, 46
head_r = 20
line_w = 7

# Key head (ring)
draw_circle(pixels, size, cx, cy, head_r, white, line_w)

# Key shaft: vertical line down from circle
shaft_x = cx - line_w // 2
draw_rect(pixels, size, shaft_x, cy + head_r - 5, shaft_x + line_w - 1, 90, white)

# Key teeth: 2 horizontal notches
teeth_w = 12
# Tooth 1
draw_rect(pixels, size, shaft_x + line_w - 1, 75, shaft_x + line_w + teeth_w, 75 + line_w - 1, white)
# Tooth 2
draw_rect(pixels, size, shaft_x + line_w - 1, 86, shaft_x + line_w + teeth_w - 3, 86 + line_w - 1, white)

png_data = create_png(size, size, pixels)

with open('/Users/coffeetoast/claude/onkey/public/onkey-icon.png', 'wb') as f:
    f.write(png_data)

print(f"Icon saved: {len(png_data)} bytes ({len(png_data)/1024:.1f} KB)")
