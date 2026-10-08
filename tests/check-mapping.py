#!/usr/bin/env python3
"""Check XML files, then run the mapping's Node/Acorn regression tests."""
import json
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
xml_files = sorted(root.glob("controllers/*.xml")) + sorted(root.glob("effects/chains/*.xml"))
for path in xml_files:
    ET.parse(path)
print(f"XML well-formedness: {len(xml_files)} files passed", flush=True)

preset = ET.parse(root / "controllers/Pioneer-DDJ-FLX4-2.0.midi.xml")
controls = preset.findall(".//control")
bindings = sorted({control.findtext("key") for control in controls
                   if any(option.tag.lower() == "script-binding"
                          for option in control.findall("options/*"))})
assert all(control.findtext("key") in bindings for control in controls
           if control.findtext("key", "").startswith("PioneerDDJFLX4."))
files = [element.attrib for element in preset.findall(".//scriptfiles/file")]
subprocess.run(["node", str(root / "tests/mapping.test.cjs"), json.dumps(bindings), json.dumps(files)],
               cwd=root, check=True)
