import glob
import re

for f in sorted(glob.glob('public/brands/*.svg')):
    with open(f, 'r', encoding='utf-8') as fp:
        c = fp.read()
    vb = re.search(r'viewBox="([^"]+)"', c)
    fills = set(re.findall(r'fill="([^"]+)"', c))
    styles = set(re.findall(r'fill:\s*([^;"]+)', c))
    print(f"{f}:")
    print(f"  viewBox: {vb.group(1) if vb else 'None'}")
    print(f"  fills: {fills}")
    print(f"  styles: {styles}")
