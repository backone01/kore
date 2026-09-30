import sys
import io

sys.stdout.reconfigure(encoding='utf-8')

from faster_whisper import WhisperModel

print("Loading Whisper model (base, cpu, int8)...")
model = WhisperModel("base", device="cpu", compute_type="int8")

test_files = [
    ("01_wawancara_data_diri", "app/public/audio/01_wawancara_data_diri/01_이름이_무엇입니까_(Siapa_nama_Anda).mp3"),
    ("01_wawancara_data_diri", "app/public/audio/01_wawancara_data_diri/02_이름이_뭐예요_(Siapa_nama_Anda_santai).mp3"),
    ("02_perintah_gerak_fisik", "app/public/audio/02_perintah_gerak_fisik/01_오른쪽으로_가세요_(Jalan_ke_kanan).mp3"),
    ("02_perintah_gerak_fisik", "app/public/audio/02_perintah_gerak_fisik/05_돌아서세요_(Putar_balik_badan).mp3"),
    ("03_k3_keselamatan_pabrik", "app/public/audio/03_k3_keselamatan_pabrik/21_Tanya_안전보건표지를_왜_확인해야_할까요.mp3"),
    ("03_k3_keselamatan_pabrik", "app/public/audio/03_k3_keselamatan_pabrik/22_Jawab_빨간색입니다.mp3"),
    ("08_simulasi_resmi_hrdk", "app/public/audio/08_simulasi_resmi_hrdk/examiner_tool_q.mp3"),
    ("08_simulasi_resmi_hrdk", "app/public/audio/08_simulasi_resmi_hrdk/examiner_sign_q.mp3")
]

for cat, path in test_files:
    segments, info = model.transcribe(path, language="ko", beam_size=5)
    transcribed_text = " ".join([s.text.strip() for s in segments])
    print(f"[{cat}]")
    print(f"  File     : {path.split('/')[-1]}")
    print(f"  Whisper STT : {transcribed_text}")
    print(f"  Confidence  : {info.language_probability:.2f}")
    print("-" * 60)
