"""Generate Kaggle writeup cover image 560x280 for TraceFork."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "web-app" / "public" / "favicon.png"
OUT_PATH = ROOT / "docs" / "kaggle-cover-560x280.png"

W, H = 560, 280
SCALE = 3  # supersample for sharper output

# Brand palette
BG_TOP = (12, 18, 28)
BG_BOTTOM = (18, 32, 48)
TEAL = (45, 241, 219)
TEAL_DIM = (45, 212, 191)
MUTED = (148, 163, 184)
WHITE = (241, 245, 249)

# Layout (1x coordinates)
TEXT_RIGHT_LIMIT = 318
LOGO_SIZE = 172
LOGO_X = W - LOGO_SIZE - 28
LOGO_Y = (H - LOGO_SIZE) // 2 - 6


def s(n: float) -> int:
    return int(round(n * SCALE))


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def make_background(sw: int, sh: int) -> Image.Image:
    img = Image.new("RGB", (sw, sh))
    px = img.load()
    for y in range(sh):
        t = y / max(sh - 1, 1)
        color = (
            lerp(BG_TOP[0], BG_BOTTOM[0], t),
            lerp(BG_TOP[1], BG_BOTTOM[1], t),
            lerp(BG_TOP[2], BG_BOTTOM[2], t),
        )
        for x in range(sw):
            px[x, y] = color
    return img


def draw_grid(draw: ImageDraw.ImageDraw, sw: int, sh: int) -> None:
    step = s(20)
    grid = (35, 52, 72)
    for x in range(0, sw, step):
        draw.line([(x, 0), (x, sh)], fill=grid, width=s(1))
    for y in range(0, sh, step):
        draw.line([(0, y), (sw, y)], fill=grid, width=s(1))

    draw.ellipse(
        [s(-80), s(40), s(80), s(240)],
        fill=(TEAL_DIM[0] // 6, TEAL_DIM[1] // 5, TEAL_DIM[2] // 5),
    )


def load_fonts() -> tuple[ImageFont.FreeTypeFont, ImageFont.FreeTypeFont, ImageFont.FreeTypeFont, ImageFont.FreeTypeFont]:
    try:
        title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", s(34))
        body = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", s(12.5))
        mono = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", s(11))
        badge = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", s(9.5))
    except OSError:
        default = ImageFont.load_default()
        title = body = mono = badge = default
    return title, body, mono, badge


def paste_logo(base: Image.Image) -> None:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    size = s(LOGO_SIZE)
    logo = logo.resize((size, size), Image.Resampling.LANCZOS)
    x = s(LOGO_X)
    y = s(LOGO_Y)
    pad = s(14)
    plate = Image.new("RGBA", (size + pad * 2, size + pad * 2), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle(
        [0, 0, size + pad * 2 - 1, size + pad * 2 - 1],
        radius=s(20),
        fill=(20, 30, 44, 220),
        outline=(45, 212, 191, 100),
        width=s(2),
    )
    base.paste(plate, (x - pad, y - pad), plate)
    base.paste(logo, (x, y), logo)


def draw_pills(draw: ImageDraw.ImageDraw, badge_f: ImageFont.FreeTypeFont) -> None:
    pills = ["Gemini Agents", "Firestore", "MCP Tools", "Firebase Hosting"]
    gap_x = s(4)
    gap_y = s(5)
    x = s(32)
    y = s(162)
    row_h = s(22)
    max_x = s(TEXT_RIGHT_LIMIT)

    for pill in pills:
        tw = int(draw.textlength(pill, font=badge_f)) + s(16)
        if x + tw > max_x and x > s(32):
            x = s(32)
            y += row_h + gap_y
        draw.rounded_rectangle(
            [x, y, x + tw, y + row_h],
            radius=s(10),
            fill=(25, 40, 58),
            outline=(51, 65, 85),
            width=s(1),
        )
        draw.text((x + s(8), y + s(5)), pill, fill=MUTED, font=badge_f)
        x += tw + gap_x


def main() -> None:
    sw, sh = W * SCALE, H * SCALE
    img = make_background(sw, sh)
    draw = ImageDraw.Draw(img)
    draw_grid(draw, sw, sh)

    title_f, body_f, mono_f, badge_f = load_fonts()

    draw.rounded_rectangle(
        [s(28), s(22), s(170), s(46)],
        radius=s(10),
        fill=(20, 35, 50),
        outline=TEAL_DIM,
        width=s(1),
    )
    draw.text((s(40), s(26)), "KAGGLE CAPSTONE 2026", fill=TEAL, font=badge_f)

    draw.text((s(32), s(56)), "TraceFork", fill=WHITE, font=title_f)
    draw.text((s(32), s(98)), "AI Supply Chain Intelligence", fill=TEAL_DIM, font=body_f)

    draw.text((s(32), s(124)), "Trace batches · Detect cold-chain breaches", fill=MUTED, font=body_f)
    draw.text((s(32), s(141)), "Simulate recalls", fill=MUTED, font=body_f)

    draw_pills(draw, badge_f)

    draw.text((s(32), s(238)), "tracefork-3f5ac.web.app", fill=TEAL_DIM, font=mono_f)

    draw.line([(s(32), s(220)), (s(270), s(220))], fill=TEAL_DIM, width=s(2))
    for i, dx in enumerate([0, 68, 136, 204]):
        cx = s(32 + dx)
        color = TEAL if i < 3 else (248, 113, 113)
        r = s(4)
        draw.ellipse([cx - r, s(216), cx + r, s(224)], fill=color)

    paste_logo(img)

    img = img.resize((W, H), Image.Resampling.LANCZOS)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_PATH, "PNG", compress_level=1)
    print(f"Saved: {OUT_PATH} ({W}x{H}, supersampled {SCALE}x)")


if __name__ == "__main__":
    main()
