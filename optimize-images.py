# optimize-images.py — ужимает фото HOLOD26 под правила сайта и делает .webp
# Запуск: pip install pillow  →  python optimize-images.py путь/к/holod-26.kz/images
# Кладите фото с нужными именами (регистр не важен, .jpeg/.png тоже можно) — скрипт
# обрежет по центру до нужного размера, пересохранит в .jpg строчными и создаст .webp.
import sys, os
from PIL import Image, ImageOps

RULES = [  # (путь-префикс, ширина, высота, лимит КБ)
    ("hero-", 1600, 900, 150),
    ("portfolio/", 640, 400, 60),
    ("reviews/", 600, 800, 80),
    ("og-banner", 1200, 630, 120),
]

def rule_for(rel):
    for pre, w, h, kb in RULES:
        if rel.startswith(pre): return w, h, kb
    return None

def save_limited(im, path, fmt, kb):
    for q in range(84, 44, -4):
        im.save(path, fmt, quality=q, optimize=True, **({"progressive": True} if fmt == "JPEG" else {"method": 6}))
        if os.path.getsize(path) <= kb * 1024: return q
    return q

def main(root):
    for dp, _, files in os.walk(root):
        for f in files:
            name, ext = os.path.splitext(f)
            if ext.lower() not in (".jpg", ".jpeg", ".png") or f in ("logo.png", "favicon.png"): continue
            src = os.path.join(dp, f)
            rel = os.path.relpath(src, root).replace("\\", "/").lower()
            r = rule_for(rel)
            if not r: continue
            w, h, kb = r
            im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            im = ImageOps.fit(im, (w, h), Image.LANCZOS)
            base = os.path.join(dp, name.lower().replace(" ", "-").replace("_", "-"))
            if os.path.abspath(src) != os.path.abspath(base + ".jpg"): os.remove(src)
            q = save_limited(im, base + ".jpg", "JPEG", kb)
            if not rel.startswith("og-banner"): save_limited(im, base + ".webp", "WEBP", kb)
            print(f"{os.path.relpath(base, root)}.jpg  {w}x{h}  q{q}  {os.path.getsize(base + '.jpg') // 1024} КБ")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "images")
