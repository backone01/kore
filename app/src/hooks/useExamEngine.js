import { useState, useRef, useCallback, useMemo } from 'react';
import { getRandomSample } from '../utils/shuffle.js';
import { getAssetUrl } from '../utils/assetHelper.js';

/**
 * Exam engine — 17 soal 50 poin Revisi HRD Korea
 * Extracted from App.jsx to reduce monolith (934→1383 LOC)
 */
export function useExamEngine(questionsData, stopAllAudio) {
  const [examPhase, setExamPhase] = useState('intro'); // intro | running | summary
  const [examQuestions, setExamQuestions] = useState([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examStepStatus, setExamStepStatus] = useState('asking');
  const [examTimeLeft, setExamTimeLeft] = useState(7);
  const [examRecordings, setExamRecordings] = useState({});
  const [selfRatings, setSelfRatings] = useState({});

  const examAudioRef = useRef(new Audio());
  const timerRef = useRef(null);
  const tokenRef = useRef(0);

  const examScoreSummary = useMemo(() => {
    let totalScore = 0;
    let ratedCount = 0;
    const maxScore = 50;
    const categoryScores = {
      intro: { earned: 0, max: 2, label: 'Perkenalan Diri' },
      instructions: { earned: 0, max: 15, label: '5 Instruksi Kerja' },
      tools: { earned: 0, max: 5, label: '5 Perkakas Manufaktur' },
      safety: { earned: 0, max: 10, label: '2 Pertanyaan K3 Mendalam' },
      ncs: { earned: 0, max: 18, label: 'Sikap Kerja & NCS' },
    };
    examQuestions.forEach((q, idx) => {
      const rating = selfRatings[idx];
      if (rating) ratedCount += 1;
      if (rating === 'pass') {
        totalScore += q.points || 0;
        if (categoryScores[q.part]) categoryScores[q.part].earned += q.points || 0;
      }
    });
    return {
      totalScore, maxScore, ratedCount,
      categoryScores,
      isPassedExam: totalScore >= 30,
      isComplete: ratedCount === examQuestions.length && examQuestions.length > 0,
    };
  }, [examQuestions, selfRatings]);

  const finishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    examAudioRef.current.onended = null;
    examAudioRef.current.onerror = null;
    examAudioRef.current.pause();
    if (stopAllAudio) stopAllAudio();
    setExamPhase('summary');
  }, [stopAllAudio]);

  const exitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    examAudioRef.current.onended = null;
    examAudioRef.current.onerror = null;
    examAudioRef.current.pause();
    if (stopAllAudio) stopAllAudio();
    setExamPhase('intro');
  }, [stopAllAudio]);

  const executeStep = useCallback((stepIdx, list, currentToken) => {
    const q = list[stepIdx];
    if (!q) { finishExam(); return; }
    tokenRef.current += 1;
    const token = tokenRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    setExamIndex(stepIdx);
    setExamStepStatus('asking');
    setExamTimeLeft(q.duration || 7);
    examAudioRef.current.onended = null;
    examAudioRef.current.onerror = null;
    examAudioRef.current.pause();
    examAudioRef.current.currentTime = 0;

    let hasAdvanced = false;
    const advance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      if (tokenRef.current !== token) return;
      beginAnswerPhase(stepIdx, q.duration || 7, list, token);
    };

    const audioSrc = q.audio_q || (q.category === 'piktogram' ? '/audio/examiner_sign_q.mp3' : '/audio/examiner_tool_q.mp3');
    examAudioRef.current.src = getAssetUrl(audioSrc);
    examAudioRef.current.onended = advance;
    examAudioRef.current.onerror = () => setTimeout(advance, 2000);
    examAudioRef.current.play().catch(() => setTimeout(advance, 2000));
  }, [finishExam]);

  const beginAnswerPhase = useCallback(async (stepIdx, duration, list, stepToken) => {
    if (tokenRef.current !== stepToken) return;
    setExamStepStatus('answering');
    setExamTimeLeft(duration);
    let stream = null;
    let recorder = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setExamRecordings(prev => {
          const old = prev[stepIdx];
          if (old) try { URL.revokeObjectURL(old); } catch {}
          return { ...prev, [stepIdx]: url };
        });
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
    } catch { console.warn('Mikrofon tidak aktif dalam simulasi.'); }

    let timeLeft = duration;
    timerRef.current = setInterval(() => {
      if (tokenRef.current !== stepToken) {
        clearInterval(timerRef.current);
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        return;
      }
      timeLeft -= 1;
      setExamTimeLeft(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timerRef.current);
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        if (stepIdx + 1 < list.length) executeStep(stepIdx + 1, list, stepToken);
        else finishExam();
      }
    }, 1000);
  }, [executeStep, finishExam]);

  const skipTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (examIndex + 1 < examQuestions.length) executeStep(examIndex + 1, examQuestions);
    else finishExam();
  }, [examIndex, examQuestions, executeStep, finishExam]);

  const startRealExam = useCallback(() => {
    if (stopAllAudio) stopAllAudio();
    const nameQs = questionsData.filter(q => q.category === 'wawancara' && q.question_ko.includes('이름'));
    const ageQs = questionsData.filter(q => q.category === 'wawancara' && (q.question_ko.includes('살') || q.question_ko.includes('생년월일')));
    const qName = nameQs.length ? getRandomSample(nameQs, 1)[0] : questionsData.find(q => q.id === 'q_01');
    const qAge = ageQs.length ? getRandomSample(ageQs, 1)[0] : questionsData.find(q => q.id === 'q_05');
    const workPool = questionsData.filter(q => q.category === 'gerak_fisik');
    const selectedInstructions = getRandomSample(workPool, 5);
    const toolsPool = questionsData.filter(q => q.category === 'alat_manufaktur');
    const selectedTools = getRandomSample(toolsPool, 5);
    const safetyPool = questionsData.filter(q => q.category === 'k3_safety');
    const selectedSafety = getRandomSample(safetyPool, 2);
    const mathPool = questionsData.filter(q => q.category === 'matematika');
    const qMath = getRandomSample(mathPool, 1)[0] || questionsData.find(q => q.category === 'matematika');
    const conflictPool = questionsData.filter(q => q.category === 'wawancara' && (q.question_ko.includes('실수') || q.question_ko.includes('불량품') || q.question_ko.includes('동료') || q.question_ko.includes('상사')));
    const qConflict = getRandomSample(conflictPool, 1)[0] || questionsData.find(q => q.id === 'q_38');
    const motPool = questionsData.filter(q => (q.category === 'wawancara' || q.category === 'simulasi_hrdk') && (q.question_ko.includes('한국') || q.question_ko.includes('힘들')));
    const qMotivation = getRandomSample(motPool, 1)[0] || questionsData.find(q => q.id === 'q_34');

    const examSet = [
      { section: 'Bagian 1: Perkenalan Diri (1/2)', part: 'intro', partTitle: 'Perkenalan Diri (Self-Introduction)', points: 1, duration: 7, ...qName },
      { section: 'Bagian 1: Perkenalan Diri (2/2)', part: 'intro', partTitle: 'Perkenalan Diri (Self-Introduction)', points: 1, duration: 7, ...qAge },
      ...selectedInstructions.map((item, idx) => ({ section: `Bagian 2: Instruksi Kerja (${idx + 1}/5)`, part: 'instructions', partTitle: 'Instruksi Kerja (Work Instructions)', points: 3, duration: 6, ...item })),
      ...selectedTools.map((item, idx) => ({ section: `Bagian 3: Perkakas Manufaktur (${idx + 1}/5)`, part: 'tools', partTitle: 'Tebak Perkakas (Tools)', points: 1, duration: 6, ...item })),
      ...selectedSafety.map((item, idx) => ({ section: `Bagian 4: Pertanyaan K3 Mendalam (${idx + 1}/2)`, part: 'safety', partTitle: 'Pertanyaan K3 Mendalam (In-Depth Safety)', points: 5, duration: 9, ...item })),
      { section: 'Bagian 5: Sikap & Percakapan Kerja (1/3)', part: 'ncs', partTitle: 'Dasar Berhitung Cepat Pabrik', points: 4, duration: 8, ...qMath },
      { section: 'Bagian 5: Sikap & Percakapan Kerja (2/3)', part: 'ncs', partTitle: 'Sikap Mengatasi Masalah & Insiden Pabrik', points: 7, duration: 8, ...qConflict },
      { section: 'Bagian 5: Sikap & Percakapan Kerja (3/3)', part: 'ncs', partTitle: 'Motivasi & Komitmen Bekerja di Korea', points: 7, duration: 8, ...qMotivation },
    ].filter(Boolean);

    setExamQuestions(examSet);
    setExamIndex(0);
    setExamRecordings({});
    setSelfRatings({});
    setExamPhase('running');
    // defer to next tick so state is committed
    setTimeout(() => executeStep(0, examSet), 0);
  }, [questionsData, stopAllAudio, executeStep]);

  return {
    examPhase, setExamPhase, examQuestions, examIndex, examStepStatus, examTimeLeft,
    examRecordings, setExamRecordings, selfRatings, setSelfRatings,
    examScoreSummary, examAudioRef, timerRef, tokenRef,
    startRealExam, executeStep, beginAnswerPhase, skipTimer, finishExam, exitExam
  };
}
