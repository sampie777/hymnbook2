import os
from fontTools.merge import Merger
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont
from fontTools.ttLib.scaleUpem import scale_upem

# This script merges missing glyphs from Noto Sans into Roboto-Regular
# to create a new font called Roboto-Regular-Extended.
# Roboto is missing some extended characters, like '⁀'

roboto_path = "fonts/Roboto-Regular.ttf"
noto_path = "NotoSans-Regular.ttf"
output_path = "fonts/Roboto-Regular-Extended.ttf"
temp_subset_path = "NotoSans-MissingOnly.ttf"

try:
    print("1. Loading fonts...")
    roboto_font = TTFont(roboto_path)
    noto_font = TTFont(noto_path)

    # Extract Unicode character sets
    roboto_unicodes = set(roboto_font.getBestCmap().keys())
    noto_unicodes = set(noto_font.getBestCmap().keys())

    # Find every single character present in Noto but absent from Roboto
    missing_unicodes = noto_unicodes - roboto_unicodes
    print(f"Found {len(missing_unicodes)} missing Unicode characters in Noto Sans.")

    # 2. Scale Noto Sans to 2048 UPM to match Roboto's coordinate grid
    print("2. Rescaling Noto Sans to 2048 unitsPerEm...")
    scale_upem(noto_font, 2048)

    # 3. Subset Noto Sans to ONLY contain the missing characters
    print("3. Subsetting Noto Sans to missing characters only...")
    options = Options()
    # Retain layout features for the missing characters
    options.layout_features = ["*"]
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=missing_unicodes)
    subsetter.subset(noto_font)

    noto_font.save(temp_subset_path)

    # 4. Merge: Roboto is master, followed by the stripped Noto font
    print("4. Merging missing glyphs into Roboto...")
    merger = Merger()
    merged_font = merger.merge([roboto_path, temp_subset_path])

    # 5. Update font metadata so iOS and Android use Roboto-Regular-Extended
    print("5. Setting PostScript and Family metadata...")
    for record in merged_font["name"].names:
        if record.nameID == 1:  # Font Family
            record.string = "Roboto".encode(record.getEncoding())
        elif record.nameID == 4:  # Full Name
            record.string = "Roboto-Regular-Extended".encode(record.getEncoding())
        elif record.nameID == 6:  # PostScript Name (crucial for iOS)
            record.string = "Roboto-Regular-Extended".encode(record.getEncoding())

    merged_font.save(output_path)
    print(f"SUCCESS: Exported cleanly to {output_path}")

finally:
    # Clean up the intermediate subset font
    if os.path.exists(temp_subset_path):
        os.remove(temp_subset_path)
        print(f"Cleaned up temporary file: {temp_subset_path}")