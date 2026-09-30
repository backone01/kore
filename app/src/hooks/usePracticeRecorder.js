import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Practice voice recorder — handles MediaRecorder lifecycle
 * + revokeObjectURL to prevent memory leak
 */
export function usePracticeRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const revoke = useCallback((url) => {
    if (url) try { URL.revokeObjectURL(url); } catch {}
  }, []);

  const clearRecording = useCallback(() => {
    setRecordedUrl(prev => {
      revoke(prev);
      return null;
    });
  }, [revoke]);

  const toggle = useCallback(async () => {
    if (isRecording) {
      if (recorderRef.current) recorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        if (recordedUrl) {
          revoke(recordedUrl);
          setRecordedUrl(null);
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        chunksRef.current = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setRecordedUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(t => t.stop());
        };
        recorderRef.current = rec;
        rec.start();
        setIsRecording(true);
      } catch {
        alert('Akses mikrofon tidak diizinkan. Periksa izin di browser Anda.');
      }
    }
  }, [isRecording, recordedUrl, revoke]);

  useEffect(() => {
    return () => { if (recordedUrl) revoke(recordedUrl); };
  }, [recordedUrl, revoke]);

  return { isRecording, recordedUrl, toggle, clearRecording, setRecordedUrl };
}
