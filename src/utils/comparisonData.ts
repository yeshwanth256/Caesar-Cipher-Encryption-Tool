/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CipherComparison } from '../types';

export const cipherComparisonData: CipherComparison[] = [
  {
    name: 'Caesar Cipher',
    type: 'Classical',
    securityLevel: 'None (Broken)',
    complexity: 'O(N)',
    keySize: '1 integer (0 - 25)',
    vulnerabilities: 'Brute-force (25 attempts max), single-letter frequency analysis, index of coincidence.',
    bestUse: 'Educational modeling, introducing basic shift mathematics.'
  },
  {
    name: 'Vigenère Cipher',
    type: 'Classical',
    securityLevel: 'None (Broken)',
    complexity: 'O(N * K)',
    keySize: 'Variable string (Key)',
    vulnerabilities: 'Kasiski examination (finding key length), Friedman test, polyalphabetic frequency analysis.',
    bestUse: 'Teaching the transition from monoalphabetic to polyalphabetic ciphers.'
  },
  {
    name: 'Playfair Cipher',
    type: 'Classical',
    securityLevel: 'None (Broken)',
    complexity: 'O(N)',
    keySize: '5x5 Grid (25 chars)',
    vulnerabilities: 'Double-letter analysis, bigram frequency distribution analysis, digital brute-forcing.',
    bestUse: 'Historical interest (extensively used in WWI by British military forces).'
  },
  {
    name: 'Rail Fence Cipher',
    type: 'Classical',
    securityLevel: 'None (Broken)',
    complexity: 'O(N)',
    keySize: '1 integer (Rails count)',
    vulnerabilities: 'Anagramming, brute forcing small rail counts, spacing patterns easily reveal transposition.',
    bestUse: 'Teaching transposition (permutation) principles separate from substitution.'
  },
  {
    name: 'AES-256 (GCM)',
    type: 'Modern',
    securityLevel: 'Very High',
    complexity: 'O(N) with Feistel/SPN',
    keySize: '256 bits (32 bytes)',
    vulnerabilities: 'Side-channel attacks (timing, power analysis), poor initialization vector (IV) reuse.',
    bestUse: 'Securing disk contents, HTTPS/TLS web traffic, military-grade secrets, database storage.'
  },
  {
    name: 'Fernet (AES-128-CBC + HMAC)',
    type: 'Modern',
    securityLevel: 'Very High',
    complexity: 'O(N) with Feistel/SPN',
    keySize: '128-bit Encryption key + 128-bit Signing key',
    vulnerabilities: 'Ciphertext padding attacks (if padding oracle is exposed), IV predictability.',
    bestUse: 'Python-based quick application messaging, state tokens, high-security payloads.'
  }
];
