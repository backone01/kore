import asyncio
import edge_tts

async def main():
    # 1. Examiner asks candidate to do self-intro
    comm1 = edge_tts.Communicate("자기소개를 해 보세요.", "ko-KR-InJoonNeural")
    await comm1.save("E:/code/proyek/kore/app/public/audio/examiner_jagisoge.mp3")
    
    # 2. Examiner tells candidate to sit down
    comm2 = edge_tts.Communicate("네, 잘했습니다. 자리에 앉으세요.", "ko-KR-InJoonNeural")
    await comm2.save("E:/code/proyek/kore/app/public/audio/examiner_sit_down.mp3")
    
    print("All examiner audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
