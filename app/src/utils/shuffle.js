/**
 * Fisher-Yates unbiased shuffle — O(n)
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
export function getLogicalMovementSequence(pool, count = 5) {
  if (!pool || !pool.length) return [];

  const rUp = pool.find(q => q.question_ko?.includes('오른손') && q.question_ko?.includes('올리'));
  const rDown = pool.find(q => q.question_ko?.includes('오른손') && q.question_ko?.includes('내리'));
  const lUp = pool.find(q => q.question_ko?.includes('왼손') && q.question_ko?.includes('올리'));
  const lDown = pool.find(q => q.question_ko?.includes('왼손') && q.question_ko?.includes('내리'));
  const bothUp = pool.find(q => q.question_ko?.includes('양손') && q.question_ko?.includes('올리'));
  const bothDown = pool.find(q => q.question_ko?.includes('양손') && q.question_ko?.includes('내리'));

  const generalCommands = pool.filter(q => 
    !q.question_ko?.includes('손') && 
    !q.question_ko?.includes('올리') && 
    !q.question_ko?.includes('내리')
  );

  const shuffledGeneral = shuffle(generalCommands);

  // Define realistic pairings of hand actions
  const handPairs = [
    // Skenario 1: Naik kanan -> Turun kanan
    () => [rUp, rDown].filter(Boolean),
    // Skenario 2: Naik kiri -> Turun kiri
    () => [lUp, lDown].filter(Boolean),
    // Skenario 3: Naik kanan -> Naik kiri -> Turun kedua tangan
    () => [rUp, lUp, bothDown].filter(Boolean),
    // Skenario 4: Naik kedua tangan -> Turun kedua tangan
    () => [bothUp, bothDown].filter(Boolean)
  ];

  // Pick 1 hand action routine
  const chosenHandRoutine = shuffle(handPairs)[0]();
  
  const result = [];
  let genIdx = 0;

  // Insert 1st general movement (e.g. jalan atau lihat arah) jika ada
  if (shuffledGeneral[genIdx]) {
    result.push(shuffledGeneral[genIdx++]);
  }

  // Insert hand movements in strict order
  for (const h of chosenHandRoutine) {
    result.push(h);
    // After hands are down, insert another movement if space permits
    if (h === rDown || h === lDown || h === bothDown) {
      if (shuffledGeneral[genIdx] && result.length < count) {
        result.push(shuffledGeneral[genIdx++]);
      }
    }
  }

  // Fill remaining slots up to count with general movements
  while (result.length < count && genIdx < shuffledGeneral.length) {
    result.push(shuffledGeneral[genIdx++]);
  }

  return result.slice(0, count);
}
