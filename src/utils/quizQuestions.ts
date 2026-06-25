/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    level: 'BEGINNER',
    question: 'Which of the following classical ciphers uses a shift value to encrypt letters?',
    options: ['Vigenère Cipher', 'Caesar Cipher', 'Playfair Cipher', 'AES'],
    correctAnswerIndex: 1,
    explanation: 'The Caesar Cipher is a classical monoalphabetic substitution cipher where each letter in the plaintext is shifted by a fixed number of positions down the alphabet.'
  },
  {
    id: 2,
    level: 'BEGINNER',
    question: 'What is the standard name of a message that has NOT yet been encrypted?',
    options: ['Ciphertext', 'Hashtext', 'Plaintext', 'Cleartype'],
    correctAnswerIndex: 2,
    explanation: 'Unencrypted, readable information is referred to as plaintext. Once encrypted, it is called ciphertext.'
  },
  {
    id: 3,
    level: 'BEGINNER',
    question: 'Which hashing algorithm is commonly considered insecure and deprecated for password hashing due to collision vulnerabilities?',
    options: ['SHA-256', 'SHA-512', 'MD5', 'bcrypt'],
    correctAnswerIndex: 2,
    explanation: 'MD5 is highly vulnerable to collision attacks (where two different inputs yield the exact same hash) and can be cracked in seconds, making it obsolete for security purposes.'
  },
  {
    id: 4,
    level: 'INTERMEDIATE',
    question: 'How does the Vigenère Cipher improve upon the vulnerabilities of a simple Caesar Cipher?',
    options: [
      'It uses an asymmetric key pair instead of a symmetric single key.',
      'It is a polyalphabetic substitution cipher, flattening letter frequency curves.',
      'It automatically hashes the key before encryption.',
      'It operates on binary blocks of 128-bits.'
    ],
    correctAnswerIndex: 1,
    explanation: 'By using a keyword to shift letters dynamically, Vigenère acts as a polyalphabetic cipher, meaning the same plaintext letter can map to different ciphertext letters, preventing standard single-letter frequency analysis.'
  },
  {
    id: 5,
    level: 'INTERMEDIATE',
    question: 'Which symmetric key encryption standard was chosen by NIST in 2001 to replace the aging DES algorithm?',
    options: ['RSA', 'AES', 'Blowfish', 'Diffie-Hellman'],
    correctAnswerIndex: 1,
    explanation: 'The Advanced Encryption Standard (AES) was selected by the National Institute of Standards and Technology (NIST) in 2001 following a multi-year competition won by the Rijndael cipher.'
  },
  {
    id: 6,
    level: 'INTERMEDIATE',
    question: 'In a Rail Fence Cipher of rail count 3, what is the encryption pattern?',
    options: [
      'Letters are grouped in blocks of 3 and transposed.',
      'Letters are written diagonally down and up in a zigzag wave, then read row by row.',
      'A 3x3 key grid is generated for swapping letter pairs.',
      'Every 3rd character is completely removed.'
    ],
    correctAnswerIndex: 1,
    explanation: 'The Rail Fence Cipher is a form of transposition cipher that writes characters in a diagonal zigzag pattern across a number of "rails" and then reads them horizontally row-by-row.'
  },
  {
    id: 7,
    level: 'ADVANCED',
    question: 'Why is AES-GCM preferred over AES-CBC in modern web architectures like TLS 1.3?',
    options: [
      'GCM uses shorter key lengths to achieve equal security.',
      'GCM is an authenticated encryption mode (AEAD) providing both confidentiality and integrity.',
      'GCM does not require any Initialization Vector (IV).',
      'GCM is completely immune to quantum computer brute-forcing.'
    ],
    correctAnswerIndex: 1,
    explanation: 'AES-GCM (Galois/Counter Mode) provides Authenticated Encryption with Associated Data (AEAD). Unlike CBC mode, it detects any unauthorized tamper attempts of ciphertext without requiring a separate HMAC construction.'
  },
  {
    id: 8,
    level: 'ADVANCED',
    question: 'What is a collision attack in the context of cryptographic hash functions?',
    options: [
      'Flooding a server with hash requests to cause a denial-of-service.',
      'Finding two distinct inputs that produce the exact same output hash.',
      'Overwriting a private key in active RAM using a buffer overflow.',
      'Comparing a leaked password hash against a pre-computed dictionary table.'
    ],
    correctAnswerIndex: 1,
    explanation: 'A hash collision occurs when two different inputs produce identical hashes. A cryptographically secure hash function must be collision-resistant.'
  },
  {
    id: 9,
    level: 'ADVANCED',
    question: 'In the Playfair Cipher, if a bigram letters fall in different rows and different columns, how are they encrypted?',
    options: [
      'They are shifted right and down circular.',
      'They form a rectangle, and each is replaced by the letter in its own row but in the column of the other letter.',
      'They are mapped to the mirror opposites in the diagonal axes.',
      'They are skipped entirely.'
    ],
    correctAnswerIndex: 1,
    explanation: 'In the Playfair Cipher, letters of a bigram forming a rectangle are replaced by characters in the same row but in the column matching the other letter. Row order is maintained.'
  }
];
