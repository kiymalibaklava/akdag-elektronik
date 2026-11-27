import re
import xml.etree.ElementTree as ET

def find_bounds_from_path(d):
    # Extract numbers from SVG path d
    nums = [float(x) for x in re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', d)]
    # Rough approximation of x, y coordinates
    # We can use svgpathtools or simple min/max of even/odd numbers if available
    xs = nums[0::2]
    ys = nums[1::2]
    if len(xs) > 10 and len(ys) > 10:
        return min(xs), max(xs), min(ys), max(ys)
    return None

print("Checking SVGs...")
