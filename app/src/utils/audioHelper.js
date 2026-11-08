/**
 * Audio & TTS Helper (Korean & Indonesian)
 * Menyediakan pemutaran Text-To-Speech alami untuk bahasa Korea dan bahasa Indonesia.
 */

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
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function speakKoreanTTS(text, { speed = 0.8, onStart, onEnd, onError } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    const voice = getBestKoreanVoice();
    if (voice) u.voice = voice;
    u.pitch = 1.02;
    u.rate = Math.max(0.5, Math.min(1.4, 0.82 * speed));
    if (onStart) u.onstart = onStart;
    u.onend = () => { if (onEnd) onEnd(); };
    u.onerror = () => { if (onError) onError(); else if (onEnd) onEnd(); };
    window.speechSynthesis.speak(u);
  } catch (err) {
    if (onError) onError(err);
    else if (onEnd) onEnd();
  }
}

export function speakIndonesianTTS(text, { speed = 1.0, onStart, onEnd, onError } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    // Hilangkan karakter tanda kutip berlebihan agar intonasi TTS lancar
    const cleanText = text.replace(/["“”«»]/g, '').trim();
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = 'id-ID';
    const voice = getBestIndonesianVoice();
    if (voice) u.voice = voice;
    u.pitch = 1.0;
    u.rate = Math.max(0.7, Math.min(1.3, speed));
    if (onStart) u.onstart = onStart;
    u.onend = () => { if (onEnd) onEnd(); };
    u.onerror = () => { if (onError) onError(); else if (onEnd) onEnd(); };
    window.speechSynthesis.speak(u);
  } catch (err) {
    if (onError) onError(err);
    else if (onEnd) onEnd();
  }
}
