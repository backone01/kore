import os
import sys
import json
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')

model = WhisperModel("base", device="cpu", compute_type="int8")

videos = [
    ("tt_01", "7671645051256163604"),
    ("tt_02", "7672680769407421716"),
    ("tt_03", "7687266120943897877"),
    ("tt_04", "7687665506869890324"),
    ("tt_05", "7688384292216425749"),
]

all_transcripts = {}

for label, vid in videos:
    audio_file = os.path.join("tiktok_downloads", f"{vid}.mp3")
    if not os.path.exists(audio_file):
        audio_file = os.path.join("tiktok_downloads", f"{vid}.mp4")
    
    print(f"==================================================")
    print(f"Transcribing {label} ({vid})...")
    print(f"==================================================")
    
    segments, info = model.transcribe(audio_file, language="ko", beam_size=5, word_timestamps=False)
    seg_list = []
    for s in segments:
        seg_data = {
            "start": round(s.start, 2),
            "end": round(s.end, 2),
            "text": s.text.strip()
        }
        seg_list.append(seg_data)
        print(f"[{seg_data['start']:06.2f} - {seg_data['end']:06.2f}] {seg_data['text']}")
    
    all_transcripts[label] = {
        "vid": vid,
        "language": info.language,
        "segments": seg_list
    }

with open("tiktok_transcriptions.json", "w", encoding="utf-8") as f:
    json.dump(all_transcripts, f, ensure_ascii=False, indent=2)

print("\nTranscription complete! Saved to tiktok_transcriptions.json")
