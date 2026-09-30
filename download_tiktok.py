import os
import sys
import json
import yt_dlp

sys.stdout.reconfigure(encoding='utf-8')

urls = [
    ("tt_01", "https://www.tiktok.com/@epstopikvn.com/video/7671645051256163604"),
    ("tt_02", "https://www.tiktok.com/@epstopikvn.com/video/7672680769407421716"),
    ("tt_03", "https://www.tiktok.com/@epstopikvn.com/video/7687266120943897877"),
    ("tt_04", "https://www.tiktok.com/@epstopikvn.com/video/7687665506869890324"),
    ("tt_05", "https://www.tiktok.com/@epstopikvn.com/video/7688384292216425749"),
]

output_dir = "tiktok_downloads"
os.makedirs(output_dir, exist_ok=True)

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': os.path.join(output_dir, '%(id)s.%(ext)s'),
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'quiet': False,
    'no_warnings': False,
}

# If ffmpeg is not available, download as original audio/video
for key, url in urls:
    print(f"Downloading {key}: {url}...")
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            print(f"Success: {key} -> {info.get('title', 'Unknown')}")
    except Exception as e:
        print(f"Error downloading {key} with audio extraction: {e}")
        # Fallback to direct download without postprocessor
        try:
            fallback_opts = {
                'outtmpl': os.path.join(output_dir, '%(id)s.%(ext)s'),
            }
            with yt_dlp.YoutubeDL(fallback_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                print(f"Fallback success: {key} -> {info.get('title', 'Unknown')}")
        except Exception as e2:
            print(f"Fallback also failed for {key}: {e2}")

print("Download step completed. Files in", output_dir, ":")
print(os.listdir(output_dir))
