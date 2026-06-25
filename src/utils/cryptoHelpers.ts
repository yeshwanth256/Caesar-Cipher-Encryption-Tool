/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Classical Caesar Cipher ---
export function caesarEncrypt(text: string, shift: number, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"): string {
  if (!text) return "";
  let result = "";
  const upperAlphabet = alphabet.toUpperCase();
  const lowerAlphabet = alphabet.toLowerCase();
  const n = alphabet.length;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let idx = upperAlphabet.indexOf(char);
    if (idx !== -1) {
      result += upperAlphabet[(idx + shift) % n < 0 ? ((idx + shift) % n) + n : (idx + shift) % n];
    } else {
      idx = lowerAlphabet.indexOf(char);
      if (idx !== -1) {
        result += lowerAlphabet[(idx + shift) % n < 0 ? ((idx + shift) % n) + n : (idx + shift) % n];
      } else {
        // Support numbers or special chars if not in alphabet
        result += char;
      }
    }
  }
  return result;
}

export function caesarDecrypt(text: string, shift: number, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"): string {
  // Decrypt is simply encrypt with negative shift
  return caesarEncrypt(text, -shift, alphabet);
}

// English letter frequencies for scoring brute-force results (source: Wikipedia)
const ENGLISH_FREQ: Record<string, number> = {
  E: 12.02, T: 9.10, A: 8.12, O: 7.68, I: 7.31, N: 6.95, S: 6.28, R: 6.02, H: 5.92,
  D: 4.32, L: 3.98, U: 2.88, C: 2.71, M: 2.61, F: 2.30, Y: 2.11, W: 2.09, G: 2.03,
  P: 1.82, B: 1.49, V: 1.11, K: 0.69, X: 0.17, Q: 0.11, J: 0.10, Z: 0.07
};

export interface BruteForceResult {
  shift: number;
  text: string;
  score: number; // Higher is more likely English
}

export function caesarBruteForce(text: string, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"): BruteForceResult[] {
  if (!text) return [];
  const results: BruteForceResult[] = [];
  const n = alphabet.length;

  // Try all possible shifts
  for (let shift = 0; shift < n; shift++) {
    const decrypted = caesarDecrypt(text, shift, alphabet);
    
    // Score based on letter frequency overlap
    let score = 0;
    const cleanText = decrypted.toUpperCase();
    let letterCount = 0;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (ENGLISH_FREQ[char] !== undefined) {
        score += ENGLISH_FREQ[char];
        letterCount++;
      }
    }

    // Normalize score by letters found
    const avgScore = letterCount > 0 ? score / letterCount : 0;

    results.push({
      shift,
      text: decrypted,
      score: avgScore
    });
  }

  // Sort with highest scores (most likely English) first
  return results.sort((a, b) => b.score - a.score);
}

// Letter frequency analysis for any string
export interface FreqAnalysisChar {
  char: string;
  count: number;
  percentage: number;
  englishPercentage: number;
}

export function calculateFrequency(text: string): FreqAnalysisChar[] {
  if (!text) return [];
  const counts: Record<string, number> = {};
  let totalLetters = 0;

  const upperText = text.toUpperCase();
  for (let i = 0; i < upperText.length; i++) {
    const char = upperText[i];
    if (char >= 'A' && char <= 'Z') {
      counts[char] = (counts[char] || 0) + 1;
      totalLetters++;
    }
  }

  const results: FreqAnalysisChar[] = [];
  for (let charCode = 65; charCode <= 90; charCode++) {
    const char = String.fromCharCode(charCode);
    const count = counts[char] || 0;
    const percentage = totalLetters > 0 ? (count / totalLetters) * 100 : 0;
    results.push({
      char,
      count,
      percentage: Math.round(percentage * 100) / 100,
      englishPercentage: ENGLISH_FREQ[char] || 0
    });
  }

  return results;
}


// --- Vigenère Cipher ---
export function vigenereEncrypt(text: string, key: string): string {
  if (!text || !key) return text;
  let result = "";
  let keyIdx = 0;
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleanKey.length === 0) return text;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char >= 'A' && char <= 'Z') {
      const textVal = char.charCodeAt(0) - 65;
      const keyVal = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
      result += String.fromCharCode(((textVal + keyVal) % 26) + 65);
      keyIdx++;
    } else if (char >= 'a' && char <= 'z') {
      const textVal = char.charCodeAt(0) - 97;
      const keyVal = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
      result += String.fromCharCode(((textVal + keyVal) % 26) + 97);
      keyIdx++;
    } else {
      result += char;
    }
  }
  return result;
}

export function vigenereDecrypt(text: string, key: string): string {
  if (!text || !key) return text;
  let result = "";
  let keyIdx = 0;
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleanKey.length === 0) return text;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char >= 'A' && char <= 'Z') {
      const textVal = char.charCodeAt(0) - 65;
      const keyVal = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
      result += String.fromCharCode(((textVal - keyVal + 26) % 26) + 65);
      keyIdx++;
    } else if (char >= 'a' && char <= 'z') {
      const textVal = char.charCodeAt(0) - 97;
      const keyVal = cleanKey[keyIdx % cleanKey.length].charCodeAt(0) - 65;
      result += String.fromCharCode(((textVal - keyVal + 26) % 26) + 97);
      keyIdx++;
    } else {
      result += char;
    }
  }
  return result;
}


// --- Rail Fence Cipher ---
export function railFenceEncrypt(text: string, rails: number): string {
  if (!text || rails <= 1) return text;
  
  // Create matrix representation
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1; // 1 = down, -1 = up

  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text[i]);
    
    // Update rail pointer
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  // Join rails
  return fence.map(r => r.join("")).join("");
}

export function railFenceDecrypt(text: string, rails: number): string {
  if (!text || rails <= 1) return text;

  // Mark positions in the fence matrix
  const fence: boolean[][] = Array.from({ length: rails }, () => Array(text.length).fill(false));
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < text.length; i++) {
    fence[rail][i] = true;
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  // Fill in characters in marked positions
  let textIdx = 0;
  const filledFence: string[][] = Array.from({ length: rails }, () => Array(text.length).fill(""));

  for (let r = 0; r < rails; r++) {
    for (let c = 0; c < text.length; c++) {
      if (fence[r][c] && textIdx < text.length) {
        filledFence[r][c] = text[textIdx++];
      }
    }
  }

  // Read matrix in zigzag path
  let result = "";
  rail = 0;
  direction = 1;

  for (let i = 0; i < text.length; i++) {
    result += filledFence[rail][i];
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return result;
}

export function getRailFenceVisual(text: string, rails: number): string[][] {
  const visual: string[][] = Array.from({ length: rails }, () => Array(text.length).fill(" "));
  if (!text || rails <= 1) return visual;

  let rail = 0;
  let direction = 1;

  for (let i = 0; i < text.length; i++) {
    visual[rail][i] = text[i];
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  return visual;
}


// --- Playfair Cipher ---
export function generatePlayfairMatrix(key: string): string[][] {
  // Normalize key: uppercase, replace J with I, remove non-alphabetic
  const normalizedKey = key.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const seen = new Set<string>();
  const alphabetString = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // 25 letters, J omitted

  const sequence: string[] = [];

  // Add key letters
  for (let i = 0; i < normalizedKey.length; i++) {
    const char = normalizedKey[i];
    if (!seen.has(char)) {
      seen.add(char);
      sequence.push(char);
    }
  }

  // Fill remaining letters
  for (let i = 0; i < alphabetString.length; i++) {
    const char = alphabetString[i];
    if (!seen.has(char)) {
      seen.add(char);
      sequence.push(char);
    }
  }

  // Convert to 5x5 grid
  const matrix: string[][] = [];
  for (let i = 0; i < 5; i++) {
    matrix.push(sequence.slice(i * 5, i * 5 + 5));
  }
  return matrix;
}

export function playfairEncrypt(text: string, key: string): string {
  if (!text) return "";
  const matrix = generatePlayfairMatrix(key);
  
  // Find positions
  const findPos = (char: string) => {
    const c = char === 'J' ? 'I' : char;
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 5; col++) {
        if (matrix[r][col] === c) return { r, col };
      }
    }
    return { r: 0, col: 0 };
  };

  // Prepare text: clean, split into bigrams, pad with X if same or odd length
  let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  const bigrams: string[] = [];
  
  let i = 0;
  while (i < cleanText.length) {
    const char1 = cleanText[i];
    let char2 = "";
    if (i + 1 < cleanText.length) {
      char2 = cleanText[i + 1];
      if (char1 === char2) {
        // Double letter, insert X
        bigrams.push(char1 + "X");
        i++;
      } else {
        bigrams.push(char1 + char2);
        i += 2;
      }
    } else {
      // Odd letter, pad with X
      bigrams.push(char1 + "X");
      i++;
    }
  }

  let result = "";
  for (const bigram of bigrams) {
    const p1 = findPos(bigram[0]);
    const p2 = findPos(bigram[1]);

    if (p1.r === p2.r) {
      // Same row: shift right circular
      result += matrix[p1.r][(p1.col + 1) % 5];
      result += matrix[p2.r][(p2.col + 1) % 5];
    } else if (p1.col === p2.col) {
      // Same column: shift down circular
      result += matrix[(p1.r + 1) % 5][p1.col];
      result += matrix[(p2.r + 1) % 5][p2.col];
    } else {
      // Rectangle: swap columns
      result += matrix[p1.r][p2.col];
      result += matrix[p2.r][p1.col];
    }
  }

  return result;
}

export function playfairDecrypt(text: string, key: string): string {
  if (!text) return "";
  const matrix = generatePlayfairMatrix(key);

  const findPos = (char: string) => {
    const c = char === 'J' ? 'I' : char;
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 5; col++) {
        if (matrix[r][col] === c) return { r, col };
      }
    }
    return { r: 0, col: 0 };
  };

  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleanText.length % 2 !== 0) return "ERROR: Invalid ciphertext length for Playfair.";

  let result = "";
  for (let i = 0; i < cleanText.length; i += 2) {
    const p1 = findPos(cleanText[i]);
    const p2 = findPos(cleanText[i + 1]);

    if (p1.r === p2.r) {
      // Same row: shift left circular
      result += matrix[p1.r][(p1.col - 1 + 5) % 5];
      result += matrix[p2.r][(p2.col - 1 + 5) % 5];
    } else if (p1.col === p2.col) {
      // Same column: shift up circular
      result += matrix[(p1.r - 1 + 5) % 5][p1.col];
      result += matrix[(p2.r - 1 + 5) % 5][p2.col];
    } else {
      // Rectangle: swap columns
      result += matrix[p1.r][p2.col];
      result += matrix[p2.r][p1.col];
    }
  }

  return result;
}


// --- Password Tools ---
export interface PasswordAnalysis {
  score: number; // 0 to 4
  strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
  entropy: number;
  suggestions: string[];
}

export function analyzePassword(password: string): PasswordAnalysis {
  const suggestions: string[] = [];
  if (!password) {
    return { score: 0, strength: 'WEAK', entropy: 0, suggestions: ["Enter a password to analyze."] };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasLower) { poolSize += 26; } else { suggestions.push("Add lowercase letters."); }
  if (hasUpper) { poolSize += 26; } else { suggestions.push("Add uppercase letters."); }
  if (hasDigit) { poolSize += 10; } else { suggestions.push("Add numerical digits."); }
  if (hasSpecial) { poolSize += 33; } else { suggestions.push("Add special characters."); }

  const length = password.length;
  if (length < 8) {
    suggestions.push("Increase length to at least 8 characters (ideally 12+).");
  }

  // Shannon Entropy: L * log2(Pool)
  const entropy = length > 0 && poolSize > 0 ? Math.round(length * Math.log2(poolSize) * 10) / 10 : 0;

  let score = 0;
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (poolSize >= 62) score++; // contains lower, upper, and numbers
  if (hasSpecial && length >= 10) score++;

  let strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG' = 'WEAK';
  if (entropy < 40) strength = 'WEAK';
  else if (entropy < 60) strength = 'MEDIUM';
  else if (entropy < 80) strength = 'STRONG';
  else strength = 'VERY_STRONG';

  return {
    score: strength === 'WEAK' ? 1 : strength === 'MEDIUM' ? 2 : strength === 'STRONG' ? 3 : 4,
    strength,
    entropy,
    suggestions: suggestions.length === 0 ? ["Your password looks highly secure! Keep it safe."] : suggestions
  };
}

export function generatePassword(length = 16, upper = true, lower = true, numbers = true, special = true): string {
  const uChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lChars = "abcdefghijklmnopqrstuvwxyz";
  const nChars = "0123456789";
  const sChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let allowed = "";
  let mandatory: string[] = [];

  if (upper) { allowed += uChars; mandatory.push(uChars[Math.floor(Math.random() * uChars.length)]); }
  if (lower) { allowed += lChars; mandatory.push(lChars[Math.floor(Math.random() * lChars.length)]); }
  if (numbers) { allowed += nChars; mandatory.push(nChars[Math.floor(Math.random() * nChars.length)]); }
  if (special) { allowed += sChars; mandatory.push(sChars[Math.floor(Math.random() * sChars.length)]); }

  if (!allowed) return "";

  const passChars: string[] = [];
  // Add mandatory characters first to guarantee strength
  for (const c of mandatory) {
    if (passChars.length < length) passChars.push(c);
  }

  while (passChars.length < length) {
    const idx = Math.floor(Math.random() * allowed.length);
    passChars.push(allowed[idx]);
  }

  // Shuffle characters
  for (let i = passChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passChars[i], passChars[j]] = [passChars[j], passChars[i]];
  }

  return passChars.join("");
}
