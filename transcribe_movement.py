import os
import json
import sys
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')

model = WhisperModel("base", device="cpu", compute_type="int8")

m_dir = "app/public/audio/02_perintah_gerak_fisik"
files = sorted(os.listdir(m_dir))

transcriptions = {}
for f in files:
    if not f.endswith(".mp3"):
        continue
    fpath = os.path.join(m_dir, f)
    segments, info = model.transcribe(fpath, language="ko", beam_size=5)
    text = " ".join([s.text.strip() for s in segments])
    transcriptions[f] = text
    print(f"FILE: {f}")
    print(f"STT : {text}\n")

with open("transcriptions_movement.json", "w", encoding="utf-8") as out:
    json.dump(transcriptions, out, ensure_ascii=False, indent=2)

print("Saved to transcriptions_movement.json")
