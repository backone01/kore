/**
 * Audio & TTS Helper (Korean & Indonesian)
 * Menyediakan pemutaran Text-To-Speech alami untuk bahasa Korea dan bahasa Indonesia.
 * 
 * - Bahasa Indonesia: Menggunakan audio streaming Google Translate TTS (suara wanita Indonesia alami)
 *   yang bekerja 100% di semua browser/OS (Windows, Mac, Android, iOS) tanpa perlu instal voice pack Windows.
 *   Disertai fallback otomatis ke Web SpeechSynthesis.
 * - Bahasa Korea: Menggunakan Web SpeechSynthesis (suara SunHi/InJoon/Google Neural),
 *   dengan fallback ke Google Translate TTS (ko).
 */

let currentIndonesianAudio = null;
let isIndonesianAudioCanceled = false;

export function getBestKoreanVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const ko = voices.filter(v => v.lang === 'ko-KR' || v.lang === 'ko_KR' || (v.lang && v.lang.startsWith('ko')));
  if (!ko.length) return null;

  try {
    const savedName = localStorage.getItem('kore_tts_voice_name');
    if (savedName) {
      const found = ko.find(v => v.name === savedName);
      if (found) return found;
    }
  } catch {}

  const natural = ko.find(v => v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('SunHi') || v.name.includes('InJoon'));
  if (natural) return natural;
  const google = ko.find(v => v.name.includes('Google') || v.name.includes('한국'));
  if (google) return google;
  return ko[0];
}

export function getBestIndonesianVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const idVoices = voices.filter(v => 
    v.lang === 'id-ID' || v.lang === 'id_ID' || (v.lang && v.lang.toLowerCase().startsWith('id'))
  );
  if (!idVoices.length) return null;

  // Prioritaskan Microsoft Natural/Online (Gadis/Ardi) atau Google Bahasa Indonesia
  const natural = idVoices.find(v => 
    v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Gadis') || v.name.includes('Ardi')
  );
  if (natural) return natural;
  const google = idVoices.find(v => v.name.includes('Google') || v.name.includes('Indonesia'));
  if (google) return google;
  return idVoices[0];
}

export function stopTTS() {
  isIndonesianAudioCanceled = true;
  if (currentIndonesianAudio) {
    try {
      currentIndonesianAudio.pause();
      currentIndonesianAudio.currentTime = 0;
      currentIndonesianAudio.onended = null;
      currentIndonesianAudio.onerror = null;
      currentIndonesianAudio.onplay = null;
    } catch {}
    currentIndonesianAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Memecah teks panjang menjadi potongan kalimat <= maxLen karakter
 * agar aman diputar oleh Google TTS endpoint tanpa terpotong.
 */
function splitTextIntoChunks(text, maxLen = 140) {
  if (!text) return [];
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?,\n]+[.!?,\n]*/g) || [text];
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > maxLen) {
      if (cur.trim()) chunks.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.length > 0 ? chunks : [text];
}

function fallbackSpeechSynthesis(text, { speed = 1.0, onStart, onEnd, onError } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || isIndonesianAudioCanceled) {
    if (onError) onError();
    else if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID';
    const voice = getBestIndonesianVoice();
    if (voice) u.voice = voice;
    u.pitch = 1.0;
    u.rate = Math.max(0.7, Math.min(1.3, speed));
    if (onStart) u.onstart = onStart;
    u.onend = () => {
      if (onEnd && !isIndonesianAudioCanceled) onEnd();
    };
    u.onerror = (e) => {
      if (onError) onError(e);
      else if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(u);
  } catch (err) {
    if (onError) onError(err);
    else if (onEnd) onEnd();
  }
}

/**
 * Memutar audio arti/terjemahan bahasa Indonesia dengan suara alami (Google TTS Audio).
 * Bekerja langsung di semua browser tanpa memerlukan instalasi paket suara di Windows/HP.
 */
export function speakIndonesianTTS(text, { speed = 1.0, onStart, onEnd, onError } = {}) {
  stopTTS();
  if (!text) {
    if (onEnd) onEnd();
    return;
  }

  // Bersihkan karakter simbol, kurung, atau tanda petik agar pelafalan lancar
  const clean = text
    .replace(/[\[\]\(\)\{\}"“”«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) {
    if (onEnd) onEnd();
    return;
  }

  isIndonesianAudioCanceled = false;
  const chunks = splitTextIntoChunks(clean, 140);
  if (!chunks.length) {
    if (onEnd) onEnd();
    return;
  }

  let chunkIndex = 0;
  let hasTriggeredStart = false;

  const playNextChunk = () => {
    if (isIndonesianAudioCanceled) return;

    if (chunkIndex >= chunks.length) {
      currentIndonesianAudio = null;
      if (onEnd) onEnd();
      return;
    }

    const currentText = chunks[chunkIndex];
    chunkIndex++;

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(currentText)}`;
      const audio = new Audio(url);
      currentIndonesianAudio = audio;
      try { audio.playbackRate = speed; } catch {}

      audio.onplay = () => {
        if (!hasTriggeredStart) {
          hasTriggeredStart = true;
          if (onStart) onStart();
        }
      };

      audio.onended = () => {
        if (!isIndonesianAudioCanceled) {
          playNextChunk();
        }
      };

      audio.onerror = () => {
        // Fallback ke Web SpeechSynthesis jika offline / koneksi internet terputus
        currentIndonesianAudio = null;
        fallbackSpeechSynthesis(clean, { speed, onStart: !hasTriggeredStart ? onStart : null, onEnd, onError });
      };

      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          currentIndonesianAudio = null;
          fallbackSpeechSynthesis(clean, { speed, onStart: !hasTriggeredStart ? onStart : null, onEnd, onError });
        });
      }
    } catch {
      currentIndonesianAudio = null;
      fallbackSpeechSynthesis(clean, { speed, onStart: !hasTriggeredStart ? onStart : null, onEnd, onError });
    }
  };

  playNextChunk();
}

/**
 * Memutar audio pelafalan bahasa Korea dengan SpeechSynthesis (atau fallback Google TTS)
 */
export function speakKoreanTTS(text, { speed = 0.8, onStart, onEnd, onError } = {}) {
  stopTTS();
  if (!text) {
    if (onEnd) onEnd();
    return;
  }
  const clean = text.replace(/["“”«»]/g, '').trim();
  const voice = getBestKoreanVoice();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window && voice) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'ko-KR';
      u.voice = voice;
      u.pitch = 1.02;
      u.rate = Math.max(0.5, Math.min(1.4, 0.82 * speed));
      if (onStart) u.onstart = onStart;
      u.onend = () => { if (onEnd) onEnd(); };
      u.onerror = () => {
        playGoogleAudio(clean, 'ko', { speed: 0.85 * speed, onStart, onEnd, onError });
      };
      window.speechSynthesis.speak(u);
      return;
    } catch {
      // lanjut ke fallback Google TTS
    }
  }

  playGoogleAudio(clean, 'ko', { speed: 0.85 * speed, onStart, onEnd, onError });
}

function playGoogleAudio(text, lang, { speed = 1.0, onStart, onEnd, onError } = {}) {
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    currentIndonesianAudio = audio;
    try { audio.playbackRate = speed; } catch {}
    if (onStart) audio.onplay = onStart;
    audio.onended = () => {
      currentIndonesianAudio = null;
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      currentIndonesianAudio = null;
      if (onError) onError();
      else if (onEnd) onEnd();
    };
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        currentIndonesianAudio = null;
        if (onError) onError();
        else if (onEnd) onEnd();
      });
    }
  } catch {
    currentIndonesianAudio = null;
    if (onError) onError();
    else if (onEnd) onEnd();
  }
}
