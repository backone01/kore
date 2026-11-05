/**
 * Fisher-Yates unbiased shuffle : O(n)
 * Replaces biased `arr.sort(() => 0.5 - Math.random())`
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomSample(arr, count) {
  return shuffle(arr).slice(0, count);
}

/**
 * Generates an authentic, physically logical sequence of physical movement commands (따라하세요).
 * CRITICAL RULE: A "turunkan" (내리세요) command MUST ONLY appear AFTER
 * the corresponding hand has been raised ("올리세요")!
 * E.g.:
 * - 오른손 올리세요 -> 오른손 내리세요
 * - 오른손 올리세요 -> 왼손 올리세요 -> 양손 내리세요
 * - 양손 올리세요 -> 양손 내리세요
 * Mixed with natural directional commands (앞으로 가세요, 돌아서세요, etc.)
 */
export function getLogicalMovementSequence(pool, count = 4) {
  if (!pool || !pool.length) return [];

  // 1. Kategori Pandangan / Arah Kepala (Langkah 1: Wajib Arah Pandangan Murni)
  const lookCommands = pool.filter(q => 
    (q.id?.startsWith('cmd_06') || q.id?.startsWith('cmd_07') || q.id?.startsWith('cmd_08') || q.id?.startsWith('cmd_09') || q.id?.startsWith('cmd_10')) ||
    (q.question_ko?.includes('보세요') && /오른쪽으로|왼쪽으로|위로|아래로|앞으로/.test(q.question_ko) && !q.question_ko.includes('손') && !q.question_ko.includes('귀'))
  );

  // 2. Pasangan Gerak Tangan: WAJIB NAIK DULU BARU TURUN (Langkah 2 & 3)
  const rUp = pool.find(q => q.id === 'cmd_11' || (q.question_ko?.includes('오른손') && q.question_ko?.includes('올리') && !q.question_ko?.includes('내리')));
  const rDown = pool.find(q => q.id === 'cmd_12' || (q.question_ko?.includes('오른손') && q.question_ko?.includes('내리') && !q.question_ko?.includes('올리')));
  
  const lUp = pool.find(q => q.id === 'cmd_13' || (q.question_ko?.includes('왼손') && q.question_ko?.includes('올리') && !q.question_ko?.includes('내리')));
  const lDown = pool.find(q => q.id === 'cmd_14' || (q.question_ko?.includes('왼손') && q.question_ko?.includes('내리') && !q.question_ko?.includes('올리')));
  
  const bothUp = pool.find(q => q.id === 'cmd_15' || (q.question_ko?.includes('양손') && q.question_ko?.includes('올리') && !q.question_ko?.includes('내리')));
  const bothDown = pool.find(q => q.id === 'cmd_16' || (q.question_ko?.includes('양손') && q.question_ko?.includes('내리') && !q.question_ko?.includes('올리')));

  const handPairOptions = [
    { up: bothUp, down: bothDown }, // Kedua tangan naik -> turun
    { up: rUp, down: rDown },       // Tangan kanan naik -> turun
    { up: lUp, down: lDown }        // Tangan kiri naik -> turun
  ].filter(p => p.up && p.down);

  // 3. Gerak Refleks Tubuh Berdiri (Langkah 4 - tanpa duduk/jongkok karena belum transisi)
  const bodyCommands = pool.filter(q => 
    !q.question_ko?.includes('앉') &&
    !q.question_ko?.includes('일어나') &&
    !q.question_ko?.includes('손') &&
    !q.question_ko?.includes('올리') &&
    !q.question_ko?.includes('내리') &&
    !q.question_ko?.includes('보세요')
  );

  const step1 = shuffle(lookCommands.length ? lookCommands : pool)[0];
  const chosenHandPair = shuffle(handPairOptions)[0];
  const step2 = chosenHandPair.up;
  const step3 = chosenHandPair.down;
  const step4 = shuffle(bodyCommands.length ? bodyCommands : pool.filter(q => q.id !== step1?.id && q.id !== step2?.id && q.id !== step3?.id))[0];

  const sequence = [step1, step2, step3, step4].filter(Boolean);

  // Fallback jika ada yang kosong
  if (sequence.length < count) {
    const usedIds = new Set(sequence.map(s => s.id));
    const remain = pool.filter(q => !usedIds.has(q.id));
    return [...sequence, ...shuffle(remain).slice(0, count - sequence.length)];
  }

  return sequence.slice(0, count);
}
