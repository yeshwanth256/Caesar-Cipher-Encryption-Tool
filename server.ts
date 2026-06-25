/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { LogEntry, SecurityMetrics } from './src/types';
import {
  caesarEncrypt,
  caesarDecrypt,
  caesarBruteForce,
  vigenereEncrypt,
  vigenereDecrypt,
  calculateFrequency,
  analyzePassword,
  generatePassword,
  playfairEncrypt,
  playfairDecrypt,
  generatePlayfairMatrix,
  railFenceEncrypt,
  railFenceDecrypt
} from './src/utils/cryptoHelpers';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Master key for encrypted logging (simulated secure key vault)
const MASTER_LOGGING_KEY = crypto.scryptSync(process.env.GEMINI_API_KEY || 'default-cryptos-master-key-2026', 'salt-cryptos', 32);

// In-memory security logs with true AES-256 encrypted payload details
let securityLogs: LogEntry[] = [
  {
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'SYSTEM_START',
    category: 'SECURITY',
    level: 'INFO',
    operator: 'SYSTEM',
    detailsEncrypted: encryptPayload({ info: 'Security Engine v2.4.0 active. Encryption vectors fully mapped.' }),
    ipAddress: '127.0.0.1',
    status: 'SUCCESS'
  },
  {
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    action: 'AES_NI_HANDSHAKE',
    category: 'AUTH',
    level: 'INFO',
    operator: 'ADMIN_GHOST',
    detailsEncrypted: encryptPayload({ info: 'Intel AES-NI instruction set handshake confirmed.' }),
    ipAddress: '192.168.1.42',
    status: 'SUCCESS'
  },
  {
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'VULNERABILITY_SCAN',
    category: 'SECURITY',
    level: 'WARNING',
    operator: 'SECURITY_OPERATOR',
    detailsEncrypted: encryptPayload({ threat: 'MD5 implementation flagged in Hashing module. Integrity verification recommended.' }),
    ipAddress: '192.168.1.101',
    status: 'SUCCESS'
  }
];

// In-memory threat metrics
let threatMetrics: SecurityMetrics = {
  totalRequests: 142,
  threatsDetected: 3,
  incidentsResolved: 3,
  algorithmUsage: {
    'Caesar': 45,
    'Vigenère': 32,
    'Playfair': 12,
    'Rail Fence': 18,
    'AES-256': 25,
    'Fernet': 10
  },
  incidentTrend: [
    { date: '06-20', threats: 1, requests: 24 },
    { date: '06-21', threats: 0, requests: 30 },
    { date: '06-22', threats: 2, requests: 45 },
    { date: '06-23', threats: 1, requests: 52 },
    { date: '06-24', threats: 3, requests: 142 }
  ],
  severityDistribution: [
    { level: 'INFO', count: 120 },
    { level: 'WARNING', count: 18 },
    { level: 'CRITICAL', count: 4 }
  ]
};

// Helper to encrypt security log payloads
function encryptPayload(data: object): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', MASTER_LOGGING_KEY, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    return 'ENCRYPTION_FAILED';
  }
}

// Helper to decrypt security log payloads
function decryptPayload(encryptedStr: string): object {
  try {
    if (!encryptedStr || encryptedStr === 'ENCRYPTION_FAILED') return { error: 'No encrypted payload' };
    const parts = encryptedStr.split(':');
    if (parts.length !== 2) return { error: 'Invalid encrypted format' };
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', MASTER_LOGGING_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (err) {
    return { error: 'Decryption failed (Invalid master key or tempered ciphertext)' };
  }
}

// Log actions dynamically
function addSecurityLog(
  action: string,
  category: LogEntry['category'],
  level: LogEntry['level'],
  operator: string,
  payload: object,
  ipAddress: string,
  status: LogEntry['status']
) {
  const encrypted = encryptPayload(payload);
  const newLog: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    category,
    level,
    operator,
    detailsEncrypted: encrypted,
    ipAddress,
    status
  };
  securityLogs.unshift(newLog);

  // Update metrics
  threatMetrics.totalRequests++;
  if (level === 'CRITICAL' || level === 'WARNING') {
    threatMetrics.threatsDetected++;
  }
  if (status === 'BLOCKED') {
    threatMetrics.threatsDetected++;
  }

  // Cap logs at 50 to prevent overflow
  if (securityLogs.length > 50) {
    securityLogs.pop();
  }
}

// --- Classical Ciphers Endpoints ---

app.post('/encrypt/caesar', (req: Request, res: Response) => {
  const { text, shift, alphabet, operator = 'USER', ip = '127.0.0.1' } = req.body;
  const shiftVal = parseInt(shift, 10) || 3;
  const customAlphabet = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  const result = caesarEncrypt(text, shiftVal, customAlphabet);
  
  addSecurityLog('CAESAR_ENCRYPT', 'CIPHER', 'INFO', operator, {
    plaintext: text,
    ciphertext: result,
    shift: shiftVal,
    alphabet: customAlphabet
  }, ip, 'SUCCESS');

  res.json({ result });
});

app.post('/decrypt/caesar', (req: Request, res: Response) => {
  const { text, shift, alphabet, operator = 'USER', ip = '127.0.0.1' } = req.body;
  const shiftVal = parseInt(shift, 10) || 3;
  const customAlphabet = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const result = caesarDecrypt(text, shiftVal, customAlphabet);

  addSecurityLog('CAESAR_DECRYPT', 'CIPHER', 'INFO', operator, {
    ciphertext: text,
    plaintext: result,
    shift: shiftVal,
    alphabet: customAlphabet
  }, ip, 'SUCCESS');

  res.json({ result });
});

app.post('/bruteforce/caesar', (req: Request, res: Response) => {
  const { text, alphabet, operator = 'USER', ip = '127.0.0.1' } = req.body;
  const customAlphabet = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const results = caesarBruteForce(text, customAlphabet);

  addSecurityLog('CAESAR_BRUTEFORCE', 'CIPHER', 'WARNING', operator, {
    ciphertext: text,
    resultsCount: results.length,
    mostLikely: results[0] ? results[0].text : ''
  }, ip, 'SUCCESS');

  res.json({ results });
});

app.post('/encrypt/vigenere', (req: Request, res: Response) => {
  const { text, key, operator = 'USER', ip = '127.0.0.1' } = req.body;
  const result = vigenereEncrypt(text, key);

  addSecurityLog('VIGENERE_ENCRYPT', 'CIPHER', 'INFO', operator, {
    plaintext: text,
    ciphertext: result,
    key
  }, ip, 'SUCCESS');

  res.json({ result });
});

app.post('/decrypt/vigenere', (req: Request, res: Response) => {
  const { text, key, operator = 'USER', ip = '127.0.0.1' } = req.body;
  const result = vigenereDecrypt(text, key);

  addSecurityLog('VIGENERE_DECRYPT', 'CIPHER', 'INFO', operator, {
    ciphertext: text,
    plaintext: result,
    key
  }, ip, 'SUCCESS');

  res.json({ result });
});

// --- Modern Encryption Module (AES-256 and Fernet equivalents) ---

app.post('/encrypt/aes', (req: Request, res: Response) => {
  const { text, key, mode = 'gcm', operator = 'USER', ip = '127.0.0.1' } = req.body;
  
  if (!text || !key) {
    return res.status(400).json({ error: 'Text and key are required.' });
  }

  try {
    // Generate derived 256-bit key from the user key string
    const derivedKey = crypto.scryptSync(key, 'salt-aes', 32);
    const iv = crypto.randomBytes(12); // GCM standard IV size is 96-bits

    if (mode === 'gcm') {
      const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag().toString('hex');
      
      const payload = {
        iv: iv.toString('hex'),
        ciphertext: encrypted,
        tag: tag
      };

      const result = Buffer.from(JSON.stringify(payload)).toString('base64');

      addSecurityLog('AES_GCM_ENCRYPT', 'CIPHER', 'INFO', operator, {
        plaintextLength: text.length,
        ciphertextHex: encrypted,
        tag: tag
      }, ip, 'SUCCESS');

      res.json({ result });
    } else {
      // Fernet representation: base64 payload containing:
      // IV (16 bytes) + AES-128-CBC Ciphertext + HMAC-SHA256 signature
      const fernetIv = crypto.randomBytes(16);
      const fernetDerivedKey = crypto.scryptSync(key, 'fernet-salt-enc', 16); // AES-128
      const fernetSigningKey = crypto.scryptSync(key, 'fernet-salt-sign', 16); // HMAC-SHA256

      const cipher = crypto.createCipheriv('aes-128-cbc', fernetDerivedKey, fernetIv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Create signature of IV + Ciphertext
      const hmac = crypto.createHmac('sha256', fernetSigningKey);
      hmac.update(fernetIv.toString('hex') + encrypted);
      const signature = hmac.digest('hex');

      const fernetPayload = {
        iv: fernetIv.toString('hex'),
        ciphertext: encrypted,
        signature: signature
      };

      const result = Buffer.from(JSON.stringify(fernetPayload)).toString('base64');

      addSecurityLog('FERNET_ENCRYPT', 'CIPHER', 'INFO', operator, {
        plaintextLength: text.length,
        ciphertextHex: encrypted,
        signature: signature
      }, ip, 'SUCCESS');

      res.json({ result });
    }
  } catch (error: any) {
    addSecurityLog('AES_ENCRYPT_ERROR', 'CIPHER', 'CRITICAL', operator, {
      error: error.message
    }, ip, 'FAILED');
    res.status(500).json({ error: 'AES Encryption error: ' + error.message });
  }
});

app.post('/decrypt/aes', (req: Request, res: Response) => {
  const { text, key, mode = 'gcm', operator = 'USER', ip = '127.0.0.1' } = req.body;

  if (!text || !key) {
    return res.status(400).json({ error: 'Text and key are required.' });
  }

  try {
    const rawPayload = Buffer.from(text, 'base64').toString('utf8');
    const payload = JSON.parse(rawPayload);
    const derivedKey = crypto.scryptSync(key, 'salt-aes', 32);

    if (mode === 'gcm') {
      const iv = Buffer.from(payload.iv, 'hex');
      const tag = Buffer.from(payload.tag, 'hex');
      const encryptedText = payload.ciphertext;

      const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      addSecurityLog('AES_GCM_DECRYPT', 'CIPHER', 'INFO', operator, {
        decryptedLength: decrypted.length
      }, ip, 'SUCCESS');

      res.json({ result: decrypted });
    } else {
      // Fernet mode
      const iv = Buffer.from(payload.iv, 'hex');
      const encryptedText = payload.ciphertext;
      const signature = payload.signature;

      const fernetDerivedKey = crypto.scryptSync(key, 'fernet-salt-enc', 16);
      const fernetSigningKey = crypto.scryptSync(key, 'fernet-salt-sign', 16);

      // Verify signature first
      const hmac = crypto.createHmac('sha256', fernetSigningKey);
      hmac.update(payload.iv + encryptedText);
      const calculatedSig = hmac.digest('hex');

      if (calculatedSig !== signature) {
        throw new Error('HMAC Signature verification failed! Payload has been tampered.');
      }

      const decipher = crypto.createDecipheriv('aes-128-cbc', fernetDerivedKey, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      addSecurityLog('FERNET_DECRYPT', 'CIPHER', 'INFO', operator, {
        decryptedLength: decrypted.length
      }, ip, 'SUCCESS');

      res.json({ result: decrypted });
    }
  } catch (error: any) {
    addSecurityLog('AES_DECRYPT_ERROR', 'CIPHER', 'CRITICAL', operator, {
      error: error.message
    }, ip, 'FAILED');
    res.status(500).json({ error: 'AES Decryption error: ' + error.message });
  }
});

// --- Hashing Module Endpoints ---

app.post('/hash', (req: Request, res: Response) => {
  const { text, algorithm, operator = 'USER', ip = '127.0.0.1' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Plaintext input is required for hashing.' });
  }

  try {
    const start = process.hrtime();
    const hash = crypto.createHash(algorithm).update(text).digest('hex');
    const diff = process.hrtime(start);
    const timeNs = diff[0] * 1e9 + diff[1];
    const timeMs = (timeNs / 1e6).toFixed(4);

    const isVulnerable = algorithm === 'md5';

    addSecurityLog('HASH_GENERATION', 'HASH', isVulnerable ? 'WARNING' : 'INFO', operator, {
      algorithm,
      hashLength: hash.length,
      timeMs,
      vulnerable: isVulnerable
    }, ip, 'SUCCESS');

    res.json({
      hash,
      length: hash.length * 4, // length in bits
      timeMs
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Hash failed: ' + error.message });
  }
});

// --- Password Security Check Endpoints ---

app.post('/password/check', (req: Request, res: Response) => {
  const { password, operator = 'USER', ip = '127.0.0.1' } = req.body;
  const analysis = analyzePassword(password);

  const level: LogEntry['level'] = analysis.strength === 'WEAK' ? 'WARNING' : 'INFO';

  addSecurityLog('PASSWORD_CHECK', 'PASSWORD', level, operator, {
    strength: analysis.strength,
    entropy: analysis.entropy,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }, ip, 'SUCCESS');

  res.json(analysis);
});

// --- File Encryption Simulator ---
// Securely encrypts file content and packages it as an educational encrypted JSON file
app.post('/file/encrypt', (req: Request, res: Response) => {
  const { fileName, fileContent, algorithm, key, operator = 'USER', ip = '127.0.0.1' } = req.body;
  if (!fileName || !fileContent || !key) {
    return res.status(400).json({ error: 'Filename, file content, and security key are required.' });
  }

  try {
    const derivedKey = crypto.scryptSync(key, 'file-salt-2026', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
    
    let encrypted = cipher.update(fileContent, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const encryptedContainer = {
      originalName: fileName,
      algorithm: algorithm || 'AES-256-CBC',
      iv: iv.toString('hex'),
      payload: encrypted,
      checksum: crypto.createHash('sha256').update(fileContent).digest('hex'),
      secureStamp: 'CRYPTOS_SECURE_VAULT_2.4.0'
    };

    const payloadString = JSON.stringify(encryptedContainer, null, 2);

    addSecurityLog('FILE_ENCRYPTED', 'FILE', 'INFO', operator, {
      fileName,
      fileSize: fileContent.length,
      checksum: encryptedContainer.checksum
    }, ip, 'SUCCESS');

    res.json({
      encryptedFileName: `${fileName}.enc`,
      encryptedContent: payloadString
    });
  } catch (error: any) {
    addSecurityLog('FILE_ENCRYPT_ERROR', 'FILE', 'CRITICAL', operator, {
      fileName,
      error: error.message
    }, ip, 'FAILED');
    res.status(500).json({ error: 'File encryption error: ' + error.message });
  }
});

app.post('/file/decrypt', (req: Request, res: Response) => {
  const { fileContent, key, operator = 'USER', ip = '127.0.0.1' } = req.body;
  if (!fileContent || !key) {
    return res.status(400).json({ error: 'Encrypted container content and security key are required.' });
  }

  try {
    const container = JSON.parse(fileContent);
    if (container.secureStamp !== 'CRYPTOS_SECURE_VAULT_2.4.0' || !container.payload) {
      throw new Error('Invalid or corrupted encrypted container format. Must be a valid .enc file produced by CRYPTOS.');
    }

    const derivedKey = crypto.scryptSync(key, 'file-salt-2026', 32);
    const iv = Buffer.from(container.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);

    let decrypted = decipher.update(container.payload, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // Verify integrity
    const currentChecksum = crypto.createHash('sha256').update(decrypted).digest('hex');
    if (currentChecksum !== container.checksum) {
      throw new Error('Integrity check failed! Plaintext checksum mismatch.');
    }

    addSecurityLog('FILE_DECRYPTED', 'FILE', 'INFO', operator, {
      originalName: container.originalName,
      checksum: currentChecksum
    }, ip, 'SUCCESS');

    res.json({
      fileName: container.originalName,
      decryptedContent: decrypted,
      checksum: currentChecksum
    });
  } catch (error: any) {
    addSecurityLog('FILE_DECRYPT_ERROR', 'FILE', 'CRITICAL', operator, {
      error: error.message
    }, ip, 'FAILED');
    res.status(500).json({ error: 'File decryption error: ' + error.message });
  }
});

// --- Security Audit Logging & Real-time Metrics ---

app.get('/api/logs', (req: Request, res: Response) => {
  const operatorRole = req.query.role as string || 'USER';
  
  // Implements True Role-Based Decryption:
  // If request is made by ADMIN or SECURITY_OPERATOR, details are dynamically decrypted and loaded!
  // If made by USER, the encrypted hexadecimal payload is served to demonstrate strict data privacy/encryption boundaries.
  const mappedLogs = securityLogs.map(log => {
    const canDecrypt = operatorRole === 'ADMIN' || operatorRole === 'SECURITY_OPERATOR';
    if (canDecrypt) {
      return {
        ...log,
        detailsDecrypted: decryptPayload(log.detailsEncrypted)
      };
    } else {
      return {
        ...log,
        detailsDecrypted: { info: '[CONFIDENTIAL: Encrypted payload. Requires SECURITY_OPERATOR or ADMIN privilege level to decrypt.]' }
      };
    }
  });

  res.json({
    logs: mappedLogs,
    metrics: threatMetrics
  });
});

app.post('/api/logs/resolve', (req: Request, res: Response) => {
  const { logId, operator = 'ADMIN_GHOST' } = req.body;
  const log = securityLogs.find(l => l.id === logId);
  if (log) {
    log.level = 'INFO';
    addSecurityLog('THREAT_RESOLVED', 'SECURITY', 'INFO', operator, {
      resolvedLogId: logId,
      action: log.action
    }, '127.0.0.1', 'SUCCESS');

    threatMetrics.incidentsResolved++;
  }
  res.json({ success: true });
});

// Serve static assets from the build directory (Vite build output)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// Fallback to index.html for React SPA router support
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

// Port configuration (Hardcoded port 3000 mandatory)
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CRYPTOS_CORE] Secure full-stack server operating on http://localhost:${PORT}`);
});
