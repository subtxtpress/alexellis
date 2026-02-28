#!/usr/bin/env python3
"""Generate DHS dashboard favicon PNGs and OG preview image."""

from PIL import Image, ImageDraw, ImageFont
import math, os

# ── Palette ─────────────────────────────────────────────────────────────────
NAVY   = (6,   11,  20)
TEAL   = (18,  64,  60)
RUST   = (192, 78,  1)
WHITE  = (245, 245, 245)
CREAM  = (244, 229, 196)
SILVER = (216, 218, 219)

# ── Fonts ───────────────────────────────────────────────────────────────────
FONT_DIR  = '/System/Library/Fonts/Supplemental'
SYS_FONTS = '/System/Library/Fonts'

def font(name, size):
    try:
        return ImageFont.truetype(name, size)
    except Exception:
        return ImageFont.load_default()

GEORGIA_BOLD = f'{FONT_DIR}/Georgia Bold.ttf'
COURIER_NEW  = f'{FONT_DIR}/Courier New.ttf'
HELVETICA    = f'{SYS_FONTS}/HelveticaNeue.ttc'

# ── Gradient helpers ──────────────────────────────────────────────────────────
def lerp_color(c0, c1, t):
    return tuple(int(c0[i]*(1-t) + c1[i]*t) for i in range(3))

def draw_gradient_ellipse(base_img, cx, cy, r, c0, c1, alpha=255):
    """Paint a horizontal gradient (c0 → c1) circle onto base_img."""
    cx, cy, r = int(cx), int(cy), int(r)
    w = r*2 + 4
    h = r*2 + 4
    ox, oy = cx - r - 2, cy - r - 2

    grad = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gd   = ImageDraw.Draw(grad)
    for x in range(w):
        t = x / max(w - 1, 1)
        col = lerp_color(c0, c1, t) + (255,)
        gd.line([(x, 0), (x, h-1)], fill=col)

    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, w-1, h-1], fill=alpha)
    grad.putalpha(mask)
    base_img.paste(grad, (ox, oy), grad)

def draw_gradient_rect(base_img, x0, y0, x1, y1, c0, c1, alpha=255, vertical=False):
    """Paint a horizontal or vertical gradient rectangle onto base_img."""
    w = x1 - x0
    h = y1 - y0
    layer = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    steps = h if vertical else w
    for i in range(steps):
        t = i / max(steps - 1, 1)
        col = lerp_color(c0, c1, t) + (alpha,)
        if vertical:
            ld.line([(0, i), (w-1, i)], fill=col)
        else:
            ld.line([(i, 0), (i, h-1)], fill=col)
    base_img.paste(layer, (x0, y0), layer)

# ── Bezier / eye helpers ──────────────────────────────────────────────────────
def quadratic_bezier_points(p0, p1, p2, steps=80):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t**2*p2[0]
        y = (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t**2*p2[1]
        pts.append((x, y))
    return pts

def eye_polygon(scale=1.0, ox=0, oy=0):
    upper = quadratic_bezier_points((97,256),(256,122),(415,256))
    lower = quadratic_bezier_points((415,256),(256,390),(97,256))
    return [(ox + x*scale, oy + y*scale) for x,y in upper + lower]

def draw_eye(base_img, draw, scale, ox, oy, alpha=255):
    """Draw the compound eye; iris uses G03 gradient."""
    poly = eye_polygon(scale, ox, oy)
    draw.polygon(poly, fill=(*CREAM, alpha))

    cx = ox + 256*scale
    cy = oy + 256*scale
    r_iris  = 53*scale
    r_pupil = 22*scale
    r_glint = 8*scale

    # Iris — G03 (silver → rust)
    draw_gradient_ellipse(base_img, cx, cy, r_iris, SILVER, RUST, alpha=alpha)

    # Pupil
    draw.ellipse([cx-r_pupil, cy-r_pupil, cx+r_pupil, cy+r_pupil],
                 fill=(*NAVY, alpha))
    # Glint
    gx, gy = ox + 247*scale, oy + 247*scale
    draw.ellipse([gx-r_glint, gy-r_glint, gx+r_glint, gy+r_glint],
                 fill=(*WHITE, int(alpha*0.9)))

# ── Favicon PNGs ─────────────────────────────────────────────────────────────
def make_icon(size):
    img  = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = max(2, int(size * 72/512))
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius,
                            fill=(*NAVY, 255))

    pad   = size * 0.1
    scale = (size - pad*2) / 512
    ox    = pad - 97*scale
    oy    = (size - 512*scale) / 2

    draw_eye(img, draw, scale, ox, oy)
    return img

SIZES   = [16, 32, 180, 192, 512]
OUT_DIR = os.path.join(os.path.dirname(__file__), 'icons')

for sz in SIZES:
    icon = make_icon(sz)
    icon.save(os.path.join(OUT_DIR, f'icon-{sz}.png'), 'PNG')
    print(f'  ✓ icon-{sz}.png')

icon32 = make_icon(32)
icon16 = make_icon(16)
icon32.save(os.path.join(OUT_DIR, 'favicon.ico'), format='ICO',
            sizes=[(32,32),(16,16)])
print(f'  ✓ favicon.ico')

# ── OG Image 1280×720 ────────────────────────────────────────────────────────
W, H = 1280, 720
og   = Image.new('RGBA', (W, H), (*NAVY, 255))
draw = ImageDraw.Draw(og, 'RGBA')

# Teal radial wash (top-left)
for i in range(120, 0, -1):
    alpha = int(55 * (i/120) ** 1.4)
    r = int(i * 8)
    draw.ellipse([-r//2, -r//2, r, r], fill=(*TEAL, alpha))

# Top bar — G03 (silver → rust)
draw_gradient_rect(og, 0, 0, W, 5, SILVER, RUST, alpha=255)

# Scan lines
for y in range(3, H, 4):
    draw.rectangle([0, y, W, y], fill=(*TEAL, 10))

# Eye watermark — top right (low opacity)
eye_display = 200
eye_scale   = eye_display / 512
eye_ox      = W - 72 - eye_display - 97*eye_scale
eye_oy      = 48

# Draw the almond + pupil/glint at low alpha via a temp layer
tmp = Image.new('RGBA', (W, H), (0, 0, 0, 0))
tmp_draw = ImageDraw.Draw(tmp)
poly = eye_polygon(eye_scale, eye_ox, eye_oy)
tmp_draw.polygon(poly, fill=(*CREAM, 45))
draw_gradient_ellipse(tmp, eye_ox + 256*eye_scale, eye_oy + 256*eye_scale,
                      53*eye_scale, SILVER, RUST, alpha=45)
cx_e = eye_ox + 256*eye_scale
cy_e = eye_oy + 256*eye_scale
r_p  = 22*eye_scale
tmp_draw.ellipse([cx_e-r_p, cy_e-r_p, cx_e+r_p, cy_e+r_p],
                 fill=(*NAVY, 45))
og.alpha_composite(tmp)

# Decorative grid — right side (teal + silver only, no flat rust)
grid_x = W - 80 - 4*42
grid_y = H // 2 - 2*42
pattern = [
    [1,0,2,0],
    [0,2,1,2],
    [2,1,0,1],
    [0,0,2,0],
    [1,2,0,1],
]
for row, cols in enumerate(pattern):
    for col, kind in enumerate(cols):
        cx = grid_x + col*42
        cy = grid_y + row*42
        if kind == 1:   # silver accent
            draw.rounded_rectangle([cx, cy, cx+32, cy+32], radius=3,
                                   fill=(*SILVER, 35), outline=(*SILVER, 25))
        elif kind == 2: # teal
            draw.rounded_rectangle([cx, cy, cx+32, cy+32], radius=3,
                                   fill=(*TEAL, 80), outline=(*TEAL, 50))
        else:           # empty
            draw.rounded_rectangle([cx, cy, cx+32, cy+32], radius=3,
                                   outline=(*CREAM, 30))

# ── Text ─────────────────────────────────────────────────────────────────────
content_x = 80

# Subheading — silver accent bar
sub_y = H - 72
draw.rectangle([content_x, sub_y-10, content_x+3, sub_y+12],
               fill=(*SILVER, 200))
sub_font = font(HELVETICA, 18)
draw.text((content_x+16, sub_y-2), 'Mapping the Surveillance Infrastructure',
          font=sub_font, fill=(*SILVER, 165))

# H1
h1_font = font(GEORGIA_BOLD, 80)
h1_y    = sub_y - 100
draw.text((content_x, h1_y), 'Dept. of Homeland Security',
          font=h1_font, fill=(*SILVER, 255))

# Eyebrow — silver dot
eb_y    = h1_y - 40
eb_font = font(COURIER_NEW, 13)
draw.ellipse([content_x, eb_y+1, content_x+8, eb_y+9], fill=(*SILVER, 200))
draw.text((content_x+16, eb_y), 'SUBTXT PRESS \u2014 INVESTIGATIVE REPORTING',
          font=eb_font, fill=(*CREAM, 255))

# Site label bottom-right
site_font = font(COURIER_NEW, 13)
site_text = 'subtxtpress.github.io'
bbox = draw.textbbox((0, 0), site_text, font=site_font)
tw   = bbox[2] - bbox[0]
draw.text((W-80-tw, H-72), site_text, font=site_font, fill=(*SILVER, 90))

# Save
og_rgb  = og.convert('RGB')
og_path = os.path.join(os.path.dirname(__file__), 'img', 'dhs-dashboard.png')
og_rgb.save(og_path, 'PNG', optimize=True)
print(f'  ✓ img/dhs-dashboard.png')

print('\nAll assets generated.')
