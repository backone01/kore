import os
import sys
import json
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')

model = WhisperModel("base", device="cpu", compute_type="int8")
k3_dir = "app/public/audio/03_k3_keselamatan_pabrik"

# Verify 01 to 20
files = sorted([f for f in os.listdir(k3_dir) if f.startswith(tuple(f"{i:02d}_" for i in range(1, 21)))])

print(f"Verifying {len(files)} sliced files...")
results = {}
for f in files:
    fpath = os.path.join(k3_dir, f)
    segs, info = model.transcribe(fpath, language="ko", beam_size=5)
    text = " ".join([s.text.strip() for s in segs])
    results[f] = text
    print(f"{f}")
    print(f"  -> {text}\n")

with open("verified_sliced_k3.json", "w", encoding="utf-8") as out:
    json.dump(results, out, ensure_ascii=False, indent=2)

print("Saved to verified_sliced_k3.json")
