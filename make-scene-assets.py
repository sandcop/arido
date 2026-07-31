import io, re, os

# The three terrain bands must span the full width of the section. An SVG used as a
# background image still applies its own preserveAspectRatio when mapping its viewBox
# into the area CSS gives it, and the default (xMidYMid meet) letterboxes the artwork
# centered instead of stretching it. These "-w" copies opt into stretching; the
# originals are left untouched.
SRC = "assets/desierto/SVG"
for name in ("desierto_1", "desierto2", "desierto3"):
    with io.open(os.path.join(SRC, name + ".svg"), "r", encoding="utf-8") as f:
        svg = f.read()

    assert "preserveAspectRatio" not in svg, name + " already sets preserveAspectRatio"
    out, n = re.subn(r"(<svg\b)", r'\1 preserveAspectRatio="none"', svg, count=1)
    assert n == 1, "no <svg> tag found in " + name

    dest = os.path.join(SRC, name + "-w.svg")
    with io.open(dest, "w", encoding="utf-8") as f:
        f.write(out)
    print("wrote", dest)


# ---- table crop -------------------------------------------------------------
# mesa2.png pads the wood with transparency (top 46.9%, bottom 9.8%). Under
# background-size:cover the slice that survives depends on the box aspect, so the
# visible wood landed at a different offset on every breakpoint and drifted away from
# the bean floor and the desert's ground line. Cropping to the wood makes it stable.
from PIL import Image

im = Image.open("assets/mesa2.png").convert("RGBA")
alpha = im.split()[3]
w, h = im.size

def opaque_rows():
    rows = []
    for y in range(h):
        if max(alpha.crop((0, y, w, y + 1)).get_flattened_data()) > 40:
            rows.append(y)
    return rows

rows = opaque_rows()
top, bottom = rows[0], rows[-1]
im.crop((0, top, w, bottom + 1)).save("assets/mesa2-wood.png")
print("wrote assets/mesa2-wood.png rows %d..%d (%dx%d)" % (top, bottom, w, bottom + 1 - top))
