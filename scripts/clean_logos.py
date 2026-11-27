import re

def optimize_shure():
    with open('public/brands/shure.svg', 'r', encoding='utf-8') as f:
        c = f.read()
    # Remove white background path
    c = re.sub(r'<path fill="#fff" d="M0 0h192\.756v192\.756H0V0z"/>', '', c)
    # Change fill of the logo path to #0F172A
    c = c.replace('<path d="M32.609', '<path fill="#0F172A" d="M32.609')
    # Change viewBox to tightly enclose the logo: x: 0 to 192, y: 70 to 118 (h: 48)
    c = re.sub(r'viewBox="[^"]+"', 'viewBox="2 72 189 44"', c)
    c = re.sub(r'width="[^"]+"', 'width="189"', c)
    c = re.sub(r'height="[^"]+"', 'height="44"', c)
    with open('public/brands/shure_clean.svg', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Shure clean SVG created.")

def optimize_sennheiser():
    with open('public/brands/sennheiser.svg', 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r'<path fill="#fff" d="M0 0h192\.756v192\.756H0V0z"/>', '', c)
    # The paths inside sennheiser are the word SENNHEISER and the logo
    c = c.replace('<path d="M18.031', '<path fill="#0F172A" d="M18.031')
    c = c.replace('<path d="M', '<path fill="#0F172A" d="M')
    # Sennheiser y coordinates are around 80 to 105
    c = re.sub(r'viewBox="[^"]+"', 'viewBox="2 78 189 30"', c)
    c = re.sub(r'width="[^"]+"', 'width="189"', c)
    c = re.sub(r'height="[^"]+"', 'height="30"', c)
    with open('public/brands/sennheiser_clean.svg', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Sennheiser clean SVG created.")

def optimize_jbl():
    with open('public/brands/jbl.svg', 'r', encoding='utf-8') as f:
        c = f.read()
    c = re.sub(r'<path fill="#fff" d="M0 0h192\.756v192\.756H0V0z"/>', '', c)
    # JBL has the red badge and white letters
    # The badge is around x: 45 to 145, y: 40 to 150
    # Let's inspect coordinates
    with open('public/brands/jbl_clean.svg', 'w', encoding='utf-8') as f:
        f.write(c)
    print("JBL clean SVG created.")

optimize_shure()
optimize_sennheiser()
optimize_jbl()
