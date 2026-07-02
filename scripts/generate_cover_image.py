"""Generate Kaggle writeup cover image 560x280 for TraceFork."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "web-app" / "public" / "favicon.png"
OUT_PATH = ROOT / "docs" / "kaggle-cover-560x280.png"

W, H = 560, 280

# Brand palette
BG_TOP = (12, 18, 28)
BG_BOTTOM = (18, 32, 48)
TEAL = (45, 241, 219)
TEAL_DIM = (45, 212, 191)
MUTED = (148, 163, 184)
WHITE = (241, 245, 249)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def make_background() -> Image.Image:
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        t = y / max(H - 1, 1)
        color = (
            lerp(BG_TOP[0], BG_BOTTOM[0], t),
            lerp(BG_TOP[1], BG_BOTTOM[1], t),
            lerp(BG_TOP[2], BG_BOTTOM[2], t),
        )
        for x in range(W):
            px[x, y] = color
    return img


def draw_grid(draw: ImageDraw.ImageDraw) -> None:
    step = 20
    grid = (35, 52, 72)
    for x in range(0, W, step):
        draw.line([(x, 0), (x, H)], fill=grid, width=1)
    for y in range(0, H, step):
        draw.line([(0, y), (W, y)], fill=grid, width=1)

    # Accent glow left
    for i in range(120, 0, -4):
        alpha = int(18 * (i / 120))
        draw.ellipse(
            [(-80, 40), (80, 240)],
            fill=(TEAL_DIM[0] // 6, TEAL_DIM[1] // 5, TEAL_DIM[2] // 5),
        )


def load_fonts() -> tuple[ImageFont.FreeTypeFont, ...]:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    title = body = mono = badge = None
    for path in candidates:
        if not Path(path).exists():
            continue
        try:
            if title is None and "bd" in path.lower() or "segoeuib" in path.lower():
                title = ImageFont.truetype(path, 34)
            if body is None and "segoeui.ttf" in path.lower():
                body = ImageFont.truetype(path, 13)
            if mono is None and "consola" in path.lower():
                mono = ImageFont.truetype(path, 11)
        except OSError:
            pass
    try:
        title = title or ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 34)
        body = body or ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
        mono = mono or ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 11)
        badge = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 10)
    except OSError:
        default = ImageFont.load_default()
        title = body = mono = badge = default
    return title, body, mono, badge


def paste_logo(base: Image.Image) -> None:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    size = 148
    logo = logo.resize((size, size), Image.Resampling.LANCZOS)
    x = W - size - 36
    y = (H - size) // 2 - 8
    # soft plate behind logo
    plate = Image.new("RGBA", (size + 24, size + 24), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle(
        [0, 0, size + 23, size + 23],
        radius=22,
        fill=(20, 30, 44, 210),
        outline=(45, 212, 191, 90),
        width=2,
    )
    base.paste(plate, (x - 12, y - 12), plate)
    base.paste(logo, (x, y), logo)


def main() -> None:
    img = make_background()
    draw = ImageDraw.Draw(img)
    draw_grid(draw)

    title_f, body_f, mono_f, badge_f = load_fonts()

    # Top badge
    draw.rounded_rectangle([28, 24, 168, 46], radius=10, fill=(20, 35, 50), outline=TEAL_DIM, width=1)
    draw.text((40, 28), "KAGGLE CAPSTONE 2026", fill=TEAL, font=badge_f)

    # Title block
    draw.text((32, 58), "TraceFork", fill=WHITE, font=title_f)
    draw.text((32, 100), "AI Supply Chain Intelligence", fill=TEAL_DIM, font=body_f)

    tagline = "Trace batches · Detect cold-chain breaches · Simulate recalls"
    draw.text((32, 128), tagline, fill=MUTED, font=body_f)

    # Tech pills
    pills = ["Gemini Agents", "Firestore", "MCP Tools", "Firebase Hosting"]
    x = 32
    y = 168
    for pill in pills:
        tw = draw.textlength(pill, font=badge_f) + 18
        draw.rounded_rectangle([x, y, x + tw, y + 22], radius=11, fill=(25, 40, 58), outline=(51, 65, 85))
        draw.text((x + 9, y + 5), pill, fill=MUTED, font=badge_f)
        x += int(tw) + 8
        if x > 320:
            x = 32
            y += 28

    draw.text((32, 238), "tracefork-3f5ac.web.app", fill=TEAL_DIM, font=mono_f)

    # Decorative trace line
    draw.line([(32, 220), (280, 220)], fill=(45, 212, 191, 128), width=2)
    for i, dx in enumerate([0, 70, 140, 210]):
        cx = 32 + dx
        draw.ellipse([cx - 4, 216, cx + 4, 224], fill=TEAL if i < 3 else (248, 113, 113))

    paste_logo(img)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_PATH, "PNG", optimize=True)
    print(f"Saved: {OUT_PATH} ({W}x{H})")


if __name__ == "__main__":
    main()
