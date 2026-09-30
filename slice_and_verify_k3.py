import os
import sys
import json
import av

sys.stdout.reconfigure(encoding='utf-8')

def slice_audio(in_path, out_path, start_sec, end_sec):
    in_container = av.open(in_path)
    in_stream = in_container.streams.audio[0]
    out_container = av.open(out_path, mode='w')
    out_stream = out_container.add_stream('mp3', rate=in_stream.rate)
    
    start_pts = int(start_sec / in_stream.time_base)
    end_pts = int(end_sec / in_stream.time_base)
    
    in_container.seek(start_pts, stream=in_stream)
    for frame in in_container.decode(in_stream):
        if frame.pts < start_pts:
            continue
        if frame.pts > end_pts:
            break
        frame.pts = None
        for packet in out_stream.encode(frame):
            out_container.mux(packet)
            
    for packet in out_stream.encode(None):
        out_container.mux(packet)
        
    out_container.close()
    in_container.close()

out_dir = "app/public/audio/03_k3_keselamatan_pabrik"
os.makedirs(out_dir, exist_ok=True)

# 1-10 from tt_03 (7687266120943897877.mp3)
tt03_src = "tiktok_downloads/7687266120943897877.mp3"
slices_01_10 = [
    # 01
    ("01_Tanya_보호구가_무엇인가요.mp3", 0.8, 4.8),
    ("01_Jawab_작업자의_신체를_보호하기_위한_장비나_용품입니다.mp3", 5.5, 16.0),
    # 02
    ("02_Tanya_보호구에는_어떤_종류가_있나요.mp3", 17.5, 22.3),
    ("02_Jawab_안전모_안전화_안전대_보안면_귀마개_방진마스크_방독마스크_방열복_방한복_등이_있습니다.mp3", 22.5, 35.0),
    # 03
    ("03_Tanya_안전모는_무엇입니까.mp3", 36.5, 40.5),
    ("03_Jawab_부딪치거나_떨어졌을_때_머리를_보호하는_모자입니다.mp3", 41.5, 48.5),
    # 04
    ("04_Tanya_안전화는_무엇입니까.mp3", 48.5, 54.0),
    ("04_Jawab_떨어지는_공구나_뾰족한_물건으로부터_발을_보호하는_신발입니다.mp3", 55.5, 63.0),
    # 05
    ("05_Tanya_안전대는_무엇입니까.mp3", 64.5, 68.8),
    ("05_Jawab_높은_곳에서_바닥으로_떨어지는_것을_막는_장비입니다.mp3", 69.5, 76.0),
    # 06
    ("06_Tanya_보안면은_무엇입니까.mp3", 78.5, 82.8),
    ("06_Jawab_불꽃이나_날아오는_물체로부터_얼굴과_눈을_보호하는_장비입니다.mp3", 83.5, 91.0),
    # 07
    ("07_Tanya_귀마개는_무엇입니까.mp3", 92.5, 96.8),
    ("07_Jawab_시끄럽고_큰_소리가_나는_장소에서_귀를_보호하는_용품입니다.mp3", 97.5, 104.5),
    # 08
    ("08_Tanya_방진마스크는_무엇입니까.mp3", 104.5, 109.8),
    ("08_Jawab_공기_중에_있는_먼지로부터_입과_코를_보호하는_용품입니다.mp3", 111.5, 118.0),
    # 09
    ("09_Tanya_방독마스크는_무엇입니까.mp3", 119.5, 123.8),
    ("09_Jawab_공기_중에_있는_화학물질로부터_입과_코를_보호하는_용품입니다.mp3", 125.5, 132.0),
    # 10
    ("10_Tanya_방열복은_무엇입니까.mp3", 134.5, 138.8),
    ("10_Jawab_매우_뜨거운_장소에서_열과_불로부터_몸을_보호하는_작업복입니다.mp3", 140.5, 146.8),
]

for filename, s, e in slices_01_10:
    out_path = os.path.join(out_dir, filename)
    print(f"Slicing {filename} [{s}s - {e}s]...")
    slice_audio(tt03_src, out_path, s, e)

# 11-20 from tt_04 (7687665506869890324.mp3)
tt04_src = "tiktok_downloads/7687665506869890324.mp3"
slices_11_20 = [
    # 11
    ("11_Tanya_방한복은_무엇입니까.mp3", 0.0, 5.2),
    ("11_Jawab_매우_추운_장소에서_몸_온도를_유지하기_위한_보온용_작업복입니다.mp3", 5.2, 14.0),
    # 12
    ("12_Tanya_보호구를_왜_착용하여야_할까요.mp3", 14.0, 21.0),
    ("12_Jawab_작업자의_생명과_건강을_지키기_위한_가장_기본적이고_필수적인_조치이기_때문입니다.mp3", 21.0, 29.5),
    # 13
    ("13_Tanya_머리를_보호하기_위해_착용하는_보호구는_무엇인가요.mp3", 29.5, 41.0),
    ("13_Jawab_안전모를_착용해야_하며_턱끈을_조여야_합니다.mp3", 41.0, 52.5),
    # 14
    ("14_Tanya_높은_장소에서_작업_시_안전모_외에_착용해야_하는_보호구는_무엇인가요.mp3", 53.0, 64.0),
    ("14_Jawab_안전대를_착용하고_안전대_부착설비에_고리를_체결해야_합니다.mp3", 64.0, 75.0),
    # 15
    ("15_Tanya_비상구가_무엇인가요.mp3", 75.0, 81.5),
    ("15_Jawab_갑작스러운_사고가_일어났을_때_신속하게_대피할_수_있도록_마련된_출입구입니다.mp3", 81.5, 93.0),
    # 16
    ("16_Tanya_대피로는_무엇인가요.mp3", 93.0, 100.0),
    ("16_Jawab_위급_상황_시_작업자가_신속하고_안전하게_빠져나갈_수_있도록_확보된_이동_경로입니다.mp3", 100.0, 111.0),
    # 17
    ("17_Tanya_비상구_등_대피로는_왜_확인해야_할까요.mp3", 111.5, 120.0),
    ("17_Jawab_사고_발생_시_생명을_지키기_위한_기본_수칙으로_신속한_이동이_가능하기_때문입니다.mp3", 120.0, 131.5),
    # 18
    ("18_Tanya_소화기란_무엇이며_소화기의_색상은_어떻게_되나요.mp3", 131.5, 142.0),
    ("18_Jawab_불을_끄기_위한_도구로_보통은_붉은색입니다.mp3", 142.0, 153.0),
    # 19
    ("19_Tanya_안전보건표지는_무엇인가요.mp3", 154.5, 161.5),
    ("19_Jawab_위험_요인을_알리고_안전한_행동을_유도하기_위해_사용하는_시각적_표지입니다.mp3", 161.5, 171.5),
    # 20
    ("20_Tanya_안전보건표지에는_어떤_종류가_있을까요.mp3", 172.5, 180.2),
    ("20_Jawab_금지_표지_경고_표지_지시_표시_안내_표지가_있습니다.mp3", 180.5, 196.5),
]

for filename, s, e in slices_11_20:
    out_path = os.path.join(out_dir, filename)
    print(f"Slicing {filename} [{s}s - {e}s]...")
    slice_audio(tt04_src, out_path, s, e)

print("\nAll 40 files sliced successfully into 03_k3_keselamatan_pabrik!")
