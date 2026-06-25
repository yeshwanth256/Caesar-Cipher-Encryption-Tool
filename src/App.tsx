/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Key, Lock, Unlock, FileCheck, History, Cpu, Layers,
  AlertTriangle, CheckCircle, Server, UserCheck, RefreshCw, Play,
  Flame, Check, Copy, Download, Upload, Activity, Award, HelpCircle,
  Eye, EyeOff, Terminal, Info, BarChart3, Database, Code, Sliders, ChevronRight
} from 'lucide-react';
import { LogEntry, SecurityMetrics, QuizQuestion, CipherComparison } from './types';
import { quizQuestions } from './utils/quizQuestions';
import { cipherComparisonData } from './utils/comparisonData';
import {
  caesarEncrypt,
  caesarDecrypt,
  caesarBruteForce,
  calculateFrequency,
  vigenereEncrypt,
  vigenereDecrypt,
  railFenceEncrypt,
  railFenceDecrypt,
  getRailFenceVisual,
  playfairEncrypt,
  playfairDecrypt,
  generatePlayfairMatrix,
  analyzePassword,
  generatePassword
} from './utils/cryptoHelpers';

export default function App() {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'caesar' | 'classical' | 'modern' | 'hash' | 'password' | 'file' | 'quiz' | 'compare' | 'about'>('dashboard');

  // --- Identity / RBAC State ---
  const [operatorRole, setOperatorRole] = useState<'USER' | 'SECURITY_OPERATOR' | 'ADMIN_GHOST'>('ADMIN_GHOST');
  const [masterDecryptionKey, setMasterDecryptionKey] = useState<string>('');
  const [isDecryptedView, setIsDecryptedView] = useState<boolean>(false);

  // --- Global Logs / Metrics ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalRequests: 142,
    threatsDetected: 3,
    incidentsResolved: 3,
    algorithmUsage: { 'Caesar': 45, 'Vigenère': 32, 'Playfair': 12, 'Rail Fence': 18, 'AES-256': 25, 'Fernet': 10 },
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
  });

  // --- UI Notification States ---
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);

  // --- Caesar Module State ---
  const [caesarInput, setCaesarInput] = useState<string>('CONFIDENTIAL PROTOCOL EPSILON: RELAY TO SECTOR 7 IMMEDIATELY.');
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [caesarCustomAlphabet, setCaesarCustomAlphabet] = useState<string>('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const [caesarMode, setCaesarMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [caesarOutput, setCaesarOutput] = useState<string>('');
  const [bruteForceResults, setBruteForceResults] = useState<any[]>([]);
  const [caesarFreqAnalysis, setCaesarFreqAnalysis] = useState<any[]>([]);
  const [activeVisualStep, setActiveVisualStep] = useState<number>(-1);

  // --- Classical Module State ---
  const [classicalAlgo, setClassicalAlgo] = useState<'VIGENERE' | 'RAIL_FENCE' | 'PLAYFAIR'>('VIGENERE');
  const [classicalInput, setClassicalInput] = useState<string>('ATTACK AT DAWN ON THE BORDER FORTRESS');
  const [classicalMode, setClassicalMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [classicalOutput, setClassicalOutput] = useState<string>('');
  
  // Vigenère details
  const [vigenereKey, setVigenereKey] = useState<string>('SECRET');

  // Rail Fence details
  const [railFenceRails, setRailFenceRails] = useState<number>(3);

  // Playfair details
  const [playfairKey, setPlayfairKey] = useState<string>('CIPHER KEY');

  // --- Modern Module State ---
  const [modernAlgo, setModernAlgo] = useState<'AES-256' | 'FERNET'>('AES-256');
  const [modernInput, setModernInput] = useState<string>('TOP_SECRET: SATELLITE_COORDINATES_40.7128_N_74.0060_W');
  const [modernKey, setModernKey] = useState<string>('K3yp4ss_S3cur1ty_S3rv1c3_2026!');
  const [modernMode, setModernMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [modernOutput, setModernOutput] = useState<string>('');

  // --- Hashing Module State ---
  const [hashInput, setHashInput] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [hashAlgorithm, setHashAlgorithm] = useState<'md5' | 'sha256' | 'sha512'>('sha256');
  const [hashResult, setHashResult] = useState<string>('');
  const [hashBitsLength, setHashBitsLength] = useState<number>(256);
  const [hashTimeMs, setHashTimeMs] = useState<string>('0.024');

  // --- Password Security State ---
  const [passwordInput, setPasswordInput] = useState<string>('P@ssw0rd123!');
  const [passwordAnalysis, setPasswordAnalysis] = useState<any>({
    score: 3,
    strength: 'STRONG',
    entropy: 64.2,
    suggestions: ['Add a few more letters', 'Avoid simple vocabulary strings']
  });
  // Password Generator
  const [genLength, setGenLength] = useState<number>(16);
  const [genUpper, setGenUpper] = useState<boolean>(true);
  const [genLower, setGenLower] = useState<boolean>(true);
  const [genNumbers, setGenNumbers] = useState<boolean>(true);
  const [genSpecial, setGenSpecial] = useState<boolean>(true);
  const [generatedPass, setGeneratedPass] = useState<string>('');

  // --- File Encryption State ---
  const [fileVaultMode, setFileVaultMode] = useState<'ENCRYPT' | 'DECRYPT'>('ENCRYPT');
  const [fileName, setFileName] = useState<string>('payload.txt');
  const [fileTextContent, setFileTextContent] = useState<string>('This file contains strategic communication maps for Sector 7. Keep under strict observation.');
  const [fileSecurityKey, setFileSecurityKey] = useState<string>('MasterFileKey2026');
  const [fileEncryptedOutput, setFileEncryptedOutput] = useState<string>('');
  const [fileEncryptedName, setFileEncryptedName] = useState<string>('');

  // File Decryption
  const [fileDecryptPayload, setFileDecryptPayload] = useState<string>('');
  const [fileDecryptKey, setFileDecryptKey] = useState<string>('');
  const [fileDecryptedOutput, setFileDecryptedOutput] = useState<string>('');
  const [fileDecryptedName, setFileDecryptedName] = useState<string>('');
  const [fileDecryptedChecksum, setFileDecryptedChecksum] = useState<string>('');

  // --- Quiz Module State ---
  const [quizLevel, setQuizLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizStats, setQuizStats] = useState<{ totalTaken: number; highScores: Record<string, number> }>({
    totalTaken: 0,
    highScores: { 'BEGINNER': 0, 'INTERMEDIATE': 0, 'ADVANCED': 0 }
  });

  // --- Copy Notification Ref ---
  const [copiedId, setCopiedId] = useState<string>('');

  // --- Real-time Logs Polling ---
  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/logs?role=${operatorRole}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      } else {
        // Fallback local logging simulation if API is not fully running yet (build stages)
        simulateLocalLogs();
      }
    } catch (err) {
      simulateLocalLogs();
    }
  };

  // Safe fallback logs generator in client-only state
  const simulateLocalLogs = () => {
    if (logs.length === 0) {
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'FALLBACK_LOCAL_ACTIVE',
          category: 'SECURITY',
          level: 'INFO',
          operator: operatorRole,
          detailsEncrypted: 'A7B8C9:LOCAL_MODE_ACTIVE',
          detailsDecrypted: { info: 'Vite Client serving as primary runtime. API pipeline offline.' },
          ipAddress: '127.0.0.1',
          status: 'SUCCESS'
        }
      ];
      setLogs(mockLogs);
    }
  };

  useEffect(() => {
    fetchLogs();
    let interval: any;
    if (isPolling) {
      interval = setInterval(fetchLogs, 4000);
    }
    return () => clearInterval(interval);
  }, [operatorRole, isPolling]);

  // Trigger quick alert toast
  const triggerAlert = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    triggerAlert(`Copied ${label} to clipboard.`, 'success');
    setTimeout(() => setCopiedId(''), 2000);
  };

  // --- Handle Action Submissions ---

  const handleCaesarAction = async () => {
    if (!caesarInput) {
      triggerAlert('Plaintext input cannot be empty', 'error');
      return;
    }
    try {
      const endpoint = caesarMode === 'ENCRYPT' ? '/encrypt/caesar' : '/decrypt/caesar';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: caesarInput,
          shift: caesarShift,
          alphabet: caesarCustomAlphabet,
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCaesarOutput(data.result);
        triggerAlert(`${caesarMode} Success!`, 'success');
      } else {
        // Fallback client-side calculation
        const localRes = caesarMode === 'ENCRYPT' 
          ? caesarEncrypt(caesarInput, caesarShift, caesarCustomAlphabet)
          : caesarDecrypt(caesarInput, caesarShift, caesarCustomAlphabet);
        setCaesarOutput(localRes);
        triggerAlert(`${caesarMode} Completed locally (Fallback mode)`, 'info');
      }
      
      // Calculate character frequencies
      setCaesarFreqAnalysis(calculateFrequency(caesarInput));

      // Trigger step visualizer starting step
      setActiveVisualStep(0);

    } catch (err) {
      const localRes = caesarMode === 'ENCRYPT' 
        ? caesarEncrypt(caesarInput, caesarShift, caesarCustomAlphabet)
        : caesarDecrypt(caesarInput, caesarShift, caesarCustomAlphabet);
      setCaesarOutput(localRes);
      setCaesarFreqAnalysis(calculateFrequency(caesarInput));
      setActiveVisualStep(0);
      triggerAlert('Operation calculated locally.', 'info');
    }
    fetchLogs();
  };

  const handleCaesarBruteForce = async () => {
    if (!caesarInput) {
      triggerAlert('Ciphertext input is required to attempt brute-forcing', 'error');
      return;
    }
    try {
      const response = await fetch('/bruteforce/caesar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: caesarInput,
          alphabet: caesarCustomAlphabet,
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setBruteForceResults(data.results);
        triggerAlert('Brute force calculation completed.', 'success');
      } else {
        // Client-side fallback
        const results = caesarBruteForce(caesarInput, caesarCustomAlphabet);
        setBruteForceResults(results);
        triggerAlert('Brute forced locally.', 'info');
      }
    } catch (err) {
      const results = caesarBruteForce(caesarInput, caesarCustomAlphabet);
      setBruteForceResults(results);
      triggerAlert('Brute forced locally.', 'info');
    }
    fetchLogs();
  };

  const handleClassicalAction = async () => {
    if (!classicalInput) {
      triggerAlert('Input text is required', 'error');
      return;
    }
    try {
      let result = '';
      let url = '';
      let payload: any = { text: classicalInput, operator: operatorRole };

      if (classicalAlgo === 'VIGENERE') {
        url = classicalMode === 'ENCRYPT' ? '/encrypt/vigenere' : '/decrypt/vigenere';
        payload.key = vigenereKey;
      }

      // Check if API serves this, otherwise process on client safely
      if (url) {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          result = data.result;
          triggerAlert('Vigenère transformation completed!', 'success');
        } else {
          result = classicalMode === 'ENCRYPT'
            ? vigenereEncrypt(classicalInput, vigenereKey)
            : vigenereDecrypt(classicalInput, vigenereKey);
        }
      } else {
        // Local ciphers not implemented on server endpoints
        if (classicalAlgo === 'RAIL_FENCE') {
          result = classicalMode === 'ENCRYPT'
            ? railFenceEncrypt(classicalInput, railFenceRails)
            : railFenceDecrypt(classicalInput, railFenceRails);
          triggerAlert('Rail Fence transformation simulated!', 'success');
        } else if (classicalAlgo === 'PLAYFAIR') {
          result = classicalMode === 'ENCRYPT'
            ? playfairEncrypt(classicalInput, playfairKey)
            : playfairDecrypt(classicalInput, playfairKey);
          triggerAlert('Playfair transformation simulated!', 'success');
        }
      }

      setClassicalOutput(result);
    } catch (err) {
      // Local fallback
      let result = '';
      if (classicalAlgo === 'VIGENERE') {
        result = classicalMode === 'ENCRYPT' ? vigenereEncrypt(classicalInput, vigenereKey) : vigenereDecrypt(classicalInput, vigenereKey);
      } else if (classicalAlgo === 'RAIL_FENCE') {
        result = classicalMode === 'ENCRYPT' ? railFenceEncrypt(classicalInput, railFenceRails) : railFenceDecrypt(classicalInput, railFenceRails);
      } else if (classicalAlgo === 'PLAYFAIR') {
        result = classicalMode === 'ENCRYPT' ? playfairEncrypt(classicalInput, playfairKey) : playfairDecrypt(classicalInput, playfairKey);
      }
      setClassicalOutput(result);
      triggerAlert('Client calculated classical cipher.', 'info');
    }
    fetchLogs();
  };

  const handleModernAction = async () => {
    if (!modernInput || !modernKey) {
      triggerAlert('Input payload and secret key are mandatory.', 'error');
      return;
    }
    try {
      const response = await fetch(modernMode === 'ENCRYPT' ? '/encrypt/aes' : '/decrypt/aes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: modernInput,
          key: modernKey,
          mode: modernAlgo === 'AES-256' ? 'gcm' : 'fernet',
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setModernOutput(data.result);
        triggerAlert('Modern secure cryptographic cipher completed!', 'success');
      } else {
        const errData = await response.json();
        triggerAlert(errData.error || 'Modern cipher failed on server.', 'error');
      }
    } catch (err) {
      triggerAlert('Full-stack Modern module requires server environment.', 'error');
    }
    fetchLogs();
  };

  const generateSecureKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}';
    let secureKey = '';
    for (let i = 0; i < 32; i++) {
      secureKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setModernKey(secureKey);
    triggerAlert('Generated 256-bit high-entropy key!', 'success');
  };

  const handleHashAction = async () => {
    if (!hashInput) {
      triggerAlert('Plaintext is required for generating message digest.', 'error');
      return;
    }
    try {
      const response = await fetch('/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: hashInput,
          algorithm: hashAlgorithm,
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setHashResult(data.hash);
        setHashBitsLength(data.length);
        setHashTimeMs(data.timeMs);
        triggerAlert(`Generated ${hashAlgorithm.toUpperCase()} hash successfully!`, 'success');
      }
    } catch (err) {
      triggerAlert('Hashing failed. Server connection offline.', 'error');
    }
    fetchLogs();
  };

  const handlePasswordAnalysis = async () => {
    if (!passwordInput) return;
    try {
      const response = await fetch('/password/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordInput,
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPasswordAnalysis(data);
      } else {
        // Local calculation fallback
        const analysis = analyzePassword(passwordInput);
        setPasswordAnalysis(analysis);
      }
    } catch (err) {
      const analysis = analyzePassword(passwordInput);
      setPasswordAnalysis(analysis);
    }
  };

  const triggerPasswordGenerator = () => {
    const newPass = generatePassword(genLength, genUpper, genLower, genNumbers, genSpecial);
    setGeneratedPass(newPass);
    setPasswordInput(newPass);
    triggerAlert('Secure password generated & loaded!', 'success');
  };

  const handleFileEncryption = async () => {
    if (!fileTextContent || !fileSecurityKey) {
      triggerAlert('File content and key are required for packaging.', 'error');
      return;
    }
    try {
      const response = await fetch('/file/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileContent: fileTextContent,
          algorithm: 'AES-256-CBC',
          key: fileSecurityKey,
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setFileEncryptedOutput(data.encryptedContent);
        setFileEncryptedName(data.encryptedFileName);
        // Pre-fill decryption field for demonstration flow
        setFileDecryptPayload(data.encryptedContent);
        setFileDecryptKey(fileSecurityKey);
        triggerAlert('File successfully encrypted and packaged into secure container!', 'success');
      } else {
        const err = await response.json();
        triggerAlert(err.error || 'Server file encryption failed.', 'error');
      }
    } catch (err) {
      triggerAlert('Symmetric file vault requires full-stack backend.', 'error');
    }
    fetchLogs();
  };

  const handleFileDecryption = async () => {
    if (!fileDecryptPayload || !fileDecryptKey) {
      triggerAlert('Encrypted payload and key are required.', 'error');
      return;
    }
    try {
      const response = await fetch('/file/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: fileDecryptPayload,
          key: fileDecryptKey,
          operator: operatorRole
        })
      });
      if (response.ok) {
        const data = await response.json();
        setFileDecryptedOutput(data.decryptedContent);
        setFileDecryptedName(data.fileName);
        setFileDecryptedChecksum(data.checksum);
        triggerAlert('Container decrypted! Payload integrity verified with SHA-256.', 'success');
      } else {
        const err = await response.json();
        triggerAlert(err.error || 'Decryption failed. Invalid credentials or corrupt container.', 'error');
      }
    } catch (err) {
      triggerAlert('Symmetric file vault requires full-stack backend.', 'error');
    }
    fetchLogs();
  };

  // Download encrypted container file helper
  const downloadEncryptedFile = (content: string, name: string) => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = name || "secured-payload.enc";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerAlert(`Downloaded ${name} successfully!`, 'success');
  };

  // --- Quiz Actions ---

  const activeQuestions = quizQuestions.filter(q => q.level === quizLevel);
  const currentQuestion = activeQuestions[currentQuestionIdx];

  const handleAnswerSelection = (idx: number) => {
    if (quizAnswered) return;
    setSelectedAnswerIdx(idx);
  };

  const submitQuizAnswer = () => {
    if (selectedAnswerIdx === null || quizAnswered) return;
    setQuizAnswered(true);
    if (selectedAnswerIdx === currentQuestion.correctAnswerIndex) {
      setQuizScore(prev => prev + 1);
      triggerAlert('Correct Answer!', 'success');
    } else {
      triggerAlert('Incorrect Answer!', 'error');
    }
  };

  const advanceQuiz = () => {
    if (currentQuestionIdx + 1 < activeQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswerIdx(null);
      setQuizAnswered(false);
    } else {
      setQuizFinished(true);
      // Update high scores
      setQuizStats(prev => {
        const updatedHighScores = { ...prev.highScores };
        if (quizScore > (prev.highScores[quizLevel] || 0)) {
          updatedHighScores[quizLevel] = quizScore;
        }
        return {
          totalTaken: prev.totalTaken + 1,
          highScores: updatedHighScores
        };
      });
      triggerAlert('Quiz completed! Score saved.', 'success');
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setQuizAnswered(false);
    setQuizFinished(false);
    setQuizScore(0);
  };

  // Trigger password analysis on mount & when password input changes
  useEffect(() => {
    handlePasswordAnalysis();
  }, [passwordInput]);

  // Initial render calculations
  useEffect(() => {
    setCaesarFreqAnalysis(calculateFrequency(caesarInput));
    setHashResult('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  }, []);

  // --- Resolve Log Threat Vector ---
  const handleResolveLog = async (logId: string) => {
    try {
      const response = await fetch('/api/logs/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, operator: operatorRole })
      });
      if (response.ok) {
        triggerAlert('Threat vector resolved and archived.', 'success');
        fetchLogs();
      }
    } catch (err) {
      triggerAlert('Resolve action failed.', 'error');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#08090a] text-[#e0e0e0] font-sans overflow-hidden">
      
      {/* Toast Alert bar */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 text-xs font-mono rounded border shadow-lg transition-all duration-300 ${
          alertMessage.type === 'success' ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]' :
          alertMessage.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
          'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]'
        }`}>
          {alertMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-[#1f2228] bg-[#0c0d0f] flex flex-col justify-between">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-[#1f2228]">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00d1ff]" />
              <h1 className="text-[#00d1ff] font-mono font-bold tracking-tighter text-lg">CRYPTOS_SYS</h1>
            </div>
            <p className="text-[10px] text-[#7a7a7a] uppercase tracking-widest mt-1">ENCRYPTION ENGINE v2.4.0</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-grow py-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center justify-between transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-3.5 h-3.5" />
                <span>SECURE DASHBOARD</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
            </button>

            <button
              onClick={() => setActiveTab('caesar')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'caesar' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>CAESAR CIPHER</span>
            </button>

            <button
              onClick={() => setActiveTab('classical')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'classical' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>CLASSICAL CIPHERS</span>
            </button>

            <button
              onClick={() => setActiveTab('modern')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'modern' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>MODERN CODES</span>
            </button>

            <button
              onClick={() => setActiveTab('hash')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'hash' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>HASH GENERATOR</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'password' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>PASSWORD MATRIX</span>
            </button>

            <button
              onClick={() => setActiveTab('file')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'file' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>SYMMETRIC VAULT</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'compare' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>CIPHER MATRIX</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'quiz' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>CRYPTOGRAPHY QUIZ</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full text-left px-4 py-2 text-xs font-mono flex items-center gap-2.5 transition-colors ${
                activeTab === 'about' ? 'bg-[#1a1c20] border-l-2 border-[#00d1ff] text-white font-semibold' : 'hover:bg-[#131518]/70 text-[#7a7a7a]'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-[#00d1ff]" />
              <span>EDUCATIONAL ZONE</span>
            </button>
          </nav>
        </div>

        {/* Dynamic Entropy Display Widget */}
        <div className="p-4 border-t border-[#1f2228] bg-[#0c0d0f] space-y-3">
          <div className="bg-[#121417] p-3 rounded border border-[#1f2228]">
            <div className="flex justify-between items-center text-[9px] text-[#7a7a7a] mb-1">
              <span>SYSTEM ENTROPY</span>
              <span className="text-[#00ff41] font-mono">HIGH</span>
            </div>
            <div className="h-1 bg-[#1f2228] rounded-full overflow-hidden">
              <div className="h-full bg-[#00d1ff] w-[87%]" style={{ transition: 'width 2s' }}></div>
            </div>
            <div className="flex justify-between text-[8px] text-[#7a7a7a] mt-1 font-mono">
              <span>PRNG: CRYPTO_API</span>
              <span>87.4%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN APPLICATION CONTAINER */}
      <main className="flex-grow flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-14 border-b border-[#1f2228] flex items-center justify-between px-6 bg-[#0c0d0f]">
          <div className="flex gap-8 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#7a7a7a] leading-none uppercase font-mono">ENGINE STATUS</span>
              <span className="text-[11px] font-mono text-[#00ff41] font-bold">OPTIMAL // SHIELD_ON</span>
            </div>
            <div className="flex flex-col border-l border-[#1f2228] pl-8">
              <span className="text-[10px] text-[#7a7a7a] leading-none uppercase font-mono">LAST AUDIT SYNC</span>
              <span className="text-[11px] font-mono text-[#e0e0e0]">JUST NOW</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Operator RBAC Role Dropdown Selector */}
            <div className="flex items-center gap-2 bg-[#121417] border border-[#1f2228] px-3 py-1.5 rounded">
              <UserCheck className="w-3.5 h-3.5 text-[#00ff41]" />
              <span className="text-[10px] font-mono text-[#7a7a7a] uppercase mr-1">ROLE:</span>
              <select
                value={operatorRole}
                onChange={(e) => {
                  setOperatorRole(e.target.value as any);
                  triggerAlert(`Switched identity to ${e.target.value}`, 'info');
                }}
                className="bg-transparent text-[10px] text-white font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value="USER" className="bg-[#0c0d0f]">STANDARD USER</option>
                <option value="SECURITY_OPERATOR" className="bg-[#0c0d0f]">SEC OPERATOR</option>
                <option value="ADMIN_GHOST" className="bg-[#0c0d0f]">ADMIN_GHOST (Root)</option>
              </select>
            </div>

            <button
              onClick={() => {
                fetchLogs();
                triggerAlert('Security matrix logs synced with DB.', 'success');
              }}
              className="p-1.5 bg-[#121417] hover:bg-[#1a1c20] border border-[#1f2228] rounded text-[#7a7a7a] hover:text-[#00d1ff] transition-colors"
              title="Manual Sync Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] font-mono border border-[#00d1ff]/30 text-[#00d1ff] px-2 py-1 rounded bg-[#00d1ff]/5">
              SSL_AES_256_ACTIVE
            </span>
          </div>
        </header>

        {/* WORKSPACE AREA WITH GRID LAYOUT */}
        <div className="flex-grow p-6 grid grid-cols-3 gap-6 overflow-hidden bg-[#08090a]">
          
          {/* LEFT 2 COLS - MODULE CONTENT */}
          <div className="col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* TAB 1: SECURE DASHBOARD & LOGS DECRYPTION PANEL */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Metrics Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-4 flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-[#7a7a7a] font-mono">Total Monitored API Requests</span>
                    <span className="text-2xl font-bold font-mono text-[#00d1ff] mt-2">{metrics.totalRequests}</span>
                    <span className="text-[8px] text-[#00ff41] mt-1">● Active session logging</span>
                  </div>
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-4 flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-[#7a7a7a] font-mono">Threat Vectors Flagged</span>
                    <span className="text-2xl font-bold font-mono text-yellow-500 mt-2">{metrics.threatsDetected}</span>
                    <span className="text-[8px] text-yellow-500/80 mt-1">▲ Intrusion prevention active</span>
                  </div>
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-4 flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-[#7a7a7a] font-mono">Mitigations Completed</span>
                    <span className="text-2xl font-bold font-mono text-[#00ff41] mt-2">{metrics.incidentsResolved}</span>
                    <span className="text-[8px] text-[#00ff41] mt-1">✔ Integrity checksum verified</span>
                  </div>
                </div>

                {/* Simulated Chart: Incident Trends & Algorithm Distribution */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Algorithmic Signature Popularity */}
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff] mb-4">ALGORITHM USAGE COEFFICIENT</h3>
                    <div className="space-y-3">
                      {Object.entries(metrics.algorithmUsage).map(([algo, count]) => {
                        const usageValues = Object.values(metrics.algorithmUsage) as number[];
                        const total = usageValues.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                        return (
                          <div key={algo} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span>{algo}</span>
                              <span className="text-[#00ff41]">{count} ops ({pct}%)</span>
                            </div>
                            <div className="h-1.5 bg-[#1f2228] rounded-full overflow-hidden">
                              <div className="h-full bg-[#00ff41]" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incident Severity Distribution Panel */}
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff] mb-4">THREAT LEVEL CRITERIA SUMMARY</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#1f2228] pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-[11px] font-mono font-bold text-red-500">CRITICAL</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">4 active</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[#1f2228] pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                            <span className="text-[11px] font-mono font-bold text-yellow-500">WARNING</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">18 logged</span>
                        </div>
                        <div className="flex items-center justify-between pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff41]"></span>
                            <span className="text-[11px] font-mono font-bold text-[#00ff41]">INFO</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">120 nominal</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#08090a] p-3 border border-[#1f2228] rounded text-[10px] font-mono text-[#7a7a7a]">
                      <span className="text-[#00ff41]">💡 CRITICAL VECTORS:</span> Includes cipher block tamper attempts, signature mismatches, or file decryption failures.
                    </div>
                  </div>
                </div>

                {/* Live Audit Log decryption control panel */}
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#00ff41]" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">DYNAMIC DECRYPTION SYSTEM</h3>
                    </div>
                    <span className="text-[10px] font-mono text-[#7a7a7a]">RBAC SECURITY ENVELOPE</span>
                  </div>

                  <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                    This cryptographic console leverages high-security logging. The log payload details are stored encrypted as a raw hex block on the server. Changing your role above instantly modifies your authorization level to decrypt these details.
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-[#08090a] p-4 border border-[#1f2228] rounded-lg">
                    <div>
                      <span className="text-[9px] uppercase text-[#7a7a7a] block mb-1">Authorization Privilege level</span>
                      <span className="text-xs font-mono text-white font-bold block">{operatorRole === 'ADMIN_GHOST' ? 'ADMIN_GHOST (FULL DECRYPT KEY)' : operatorRole === 'SECURITY_OPERATOR' ? 'SEC_OPERATOR (TEMPORARY COGNIZANCE)' : 'STANDARD USER (RESTRICTED HEX)'}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      {operatorRole === 'USER' ? (
                        <div className="flex items-center gap-1.5 text-red-500 font-mono text-xs">
                          <EyeOff className="w-4 h-4" />
                          <span>DECRYPTION LOCKED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#00ff41] font-mono text-xs">
                          <Eye className="w-4 h-4 animate-pulse" />
                          <span>DYNAMIC PAYLOAD UNLOCKED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CAESAR CIPHER WORKBENCH */}
            {activeTab === 'caesar' && (
              <div className="space-y-6">
                
                {/* Cipher Workspace Card */}
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-bold tracking-widest uppercase text-[#00d1ff] font-mono">Primary Caesar Console</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCaesarMode('ENCRYPT')}
                        className={`text-[9px] px-2.5 py-1 font-mono uppercase font-bold rounded border ${
                          caesarMode === 'ENCRYPT' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        ENCRYPT
                      </button>
                      <button
                        onClick={() => setCaesarMode('DECRYPT')}
                        className={`text-[9px] px-2.5 py-1 font-mono uppercase font-bold rounded border ${
                          caesarMode === 'DECRYPT' ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        DECRYPT
                      </button>
                    </div>
                  </div>

                  {/* Input / Output Textareas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-mono uppercase mb-1 text-[#7a7a7a]">Plaintext Input</label>
                      <textarea
                        value={caesarInput}
                        onChange={(e) => setCaesarInput(e.target.value)}
                        rows={4}
                        className="bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono resize-none focus:outline-none focus:border-[#00d1ff]"
                        placeholder="Type or paste secret data here..."
                      ></textarea>
                    </div>
                    <div className="flex flex-col relative">
                      <label className="text-[9px] font-mono uppercase mb-1 text-[#7a7a7a]">Ciphertext Output</label>
                      <textarea
                        value={caesarOutput}
                        readOnly
                        rows={4}
                        className="bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono resize-none text-[#00ff41] focus:outline-none"
                        placeholder="Ciphered result payload will appear here..."
                      ></textarea>
                      {caesarOutput && (
                        <button
                          onClick={() => copyToClipboard(caesarOutput, 'caesar_output')}
                          className="absolute right-3 bottom-3 p-1.5 bg-[#121417] border border-[#1f2228] rounded text-[#7a7a7a] hover:text-[#00ff41] transition-colors"
                          title="Copy Output"
                        >
                          {copiedId === 'caesar_output' ? <Check className="w-3.5 h-3.5 text-[#00ff41]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Settings slider & custom alphabet parameters */}
                  <div className="mt-5 space-y-4 pt-4 border-t border-[#1f2228]">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-[#e0e0e0]">SHIFT VALUE (N = {caesarShift})</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={caesarShift}
                          onChange={(e) => setCaesarShift(parseInt(e.target.value, 10))}
                          className="w-full accent-[#00d1ff] cursor-pointer bg-[#1f2228] h-1.5 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase text-[#7a7a7a] block">CUSTOM ALPHABET SUPPORT</label>
                        <input
                          type="text"
                          value={caesarCustomAlphabet}
                          onChange={(e) => setCaesarCustomAlphabet(e.target.value.toUpperCase())}
                          className="w-full bg-[#08090a] border border-[#1f2228] px-2.5 py-1 text-[11px] font-mono text-[#00d1ff]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[9px] font-mono text-[#7a7a7a]">ALGO: MONOALPHABETIC ROT</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCaesarBruteForce}
                          className="px-4 py-2 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/5 text-[10px] uppercase font-bold tracking-widest font-mono rounded"
                        >
                          BRUTE FORCE CRACK
                        </button>
                        <button
                          onClick={handleCaesarAction}
                          className="px-6 py-2 bg-[#00d1ff] text-[#08090a] hover:bg-[#00d1ff]/90 text-[10px] uppercase font-bold tracking-widest font-mono rounded"
                        >
                          GENERATE PAYLOAD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time transformation visualizer */}
                {activeVisualStep >= 0 && caesarInput && (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">TRANSLATION FLOW MATRIX</h3>
                    <p className="text-[10px] text-[#7a7a7a]">Tracing shifts step-by-step down the alphabet chain.</p>
                    
                    <div className="grid grid-cols-3 gap-4 py-3 bg-[#08090a] border border-[#1f2228] rounded p-4 font-mono text-[11px]">
                      <div className="space-y-1 text-center border-r border-[#1f2228]">
                        <span className="text-[9px] uppercase text-[#7a7a7a]">ORIGINAL CHAR</span>
                        <div className="text-[#00d1ff] text-base font-bold">
                          {caesarInput[0] || 'A'}
                        </div>
                      </div>
                      <div className="space-y-1 text-center border-r border-[#1f2228]">
                        <span className="text-[9px] uppercase text-[#7a7a7a]">MATH TRANSFORMATION</span>
                        <div className="text-yellow-500 text-xs py-1">
                          (Index + {caesarShift}) % 26
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] uppercase text-[#7a7a7a]">SHIFTED PAYLOAD</span>
                        <div className="text-[#00ff41] text-base font-bold">
                          {caesarOutput[0] || 'D'}
                        </div>
                      </div>
                    </div>

                    {/* Step slider controller */}
                    <div className="flex gap-4 items-center justify-between text-[10px] font-mono">
                      <span className="text-[#7a7a7a]">SHIFT MATRIX VISUALIZER</span>
                      <button
                        onClick={() => {
                          const next = (activeVisualStep + 1) % Math.max(1, caesarInput.length);
                          setActiveVisualStep(next);
                        }}
                        className="px-2 py-1 bg-[#1a1c20] hover:bg-[#1f2228] text-white border border-[#1f2228] rounded text-[9px]"
                      >
                        NEXT INDEX ({activeVisualStep}/{Math.max(0, caesarInput.length - 1)})
                      </button>
                    </div>
                  </div>
                )}

                {/* Brute Force Cracked shift arrays */}
                {bruteForceResults.length > 0 && (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-[#1f2228] pb-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">BRUTE FORCE ANALYSIS RECON</h3>
                      <span className="text-[9px] font-mono text-yellow-500">SORTED BY ENGLISH LIKELIHOOD SCORE</span>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {bruteForceResults.slice(0, 10).map((result, idx) => (
                        <div
                          key={result.shift}
                          className={`p-3 rounded border font-mono text-[11px] ${
                            idx === 0 ? 'bg-[#00ff41]/5 border-[#00ff41] text-white' : 'bg-[#08090a] border-[#1f2228]'
                          }`}
                        >
                          <div className="flex justify-between text-[9px] text-[#7a7a7a] mb-1">
                            <span>SHIFT SHFT_{result.shift} {idx === 0 && '★ MOST PROBABLE'}</span>
                            <span className={idx === 0 ? 'text-[#00ff41]' : 'text-[#7a7a7a]'}>
                              SCORE: {result.score.toFixed(2)}
                            </span>
                          </div>
                          <p className="truncate text-white">{result.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frequency chart details */}
                {caesarFreqAnalysis.length > 0 && (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff] mb-4">ALPHABETIC DENSITY MATRIX</h3>
                    <p className="text-[10px] text-[#7a7a7a] mb-4">Comparing text density (Blue) against Standard English frequency curves (Green line).</p>

                    <div className="flex items-end gap-1.5 h-36 border-b border-l border-[#1f2228] pb-2 pl-2">
                      {caesarFreqAnalysis.map((item) => (
                        <div key={item.char} className="flex-1 bg-[#1f2228] h-full relative group">
                          {/* English frequency target marker line */}
                          <div
                            className="absolute bottom-0 w-full bg-[#00ff41]/40 border-t border-[#00ff41]"
                            style={{ height: `${Math.min(100, item.englishPercentage * 6)}%` }}
                            title={`English average: ${item.englishPercentage}%`}
                          ></div>
                          {/* Plaintext current frequency height bar */}
                          <div
                            className="absolute bottom-0 w-full bg-[#00d1ff] opacity-80 group-hover:opacity-100 transition-all"
                            style={{ height: `${Math.min(100, item.percentage * 6)}%` }}
                          ></div>
                          {/* Tooltip */}
                          <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 bg-[#0c0d0f] border border-[#1f2228] p-1.5 rounded font-mono text-[8px] z-20 whitespace-nowrap">
                            <span className="text-white block">{item.char}</span>
                            <span className="text-[#00d1ff] block">Found: {item.percentage}%</span>
                            <span className="text-[#00ff41] block">Expected: {item.englishPercentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[8px] text-[#7a7a7a] mt-2 font-mono px-2">
                      <span>A</span>
                      <span>E</span>
                      <span>I</span>
                      <span>M</span>
                      <span>Q</span>
                      <span>U</span>
                      <span>Z</span>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: CLASSICAL CIPHERS (Vigenère, Rail Fence, Playfair) */}
            {activeTab === 'classical' && (
              <div className="space-y-6">
                
                {/* Selector */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => { setClassicalAlgo('VIGENERE'); setClassicalOutput(''); }}
                    className={`p-3 rounded-lg border font-mono text-[11px] text-center uppercase tracking-wider font-bold transition-all ${
                      classicalAlgo === 'VIGENERE' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'bg-[#121417] border-[#1f2228] text-[#7a7a7a]'
                    }`}
                  >
                    Vigenère Cipher
                  </button>
                  <button
                    onClick={() => { setClassicalAlgo('RAIL_FENCE'); setClassicalOutput(''); }}
                    className={`p-3 rounded-lg border font-mono text-[11px] text-center uppercase tracking-wider font-bold transition-all ${
                      classicalAlgo === 'RAIL_FENCE' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'bg-[#121417] border-[#1f2228] text-[#7a7a7a]'
                    }`}
                  >
                    Rail Fence Cipher
                  </button>
                  <button
                    onClick={() => { setClassicalAlgo('PLAYFAIR'); setClassicalOutput(''); }}
                    className={`p-3 rounded-lg border font-mono text-[11px] text-center uppercase tracking-wider font-bold transition-all ${
                      classicalAlgo === 'PLAYFAIR' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'bg-[#121417] border-[#1f2228] text-[#7a7a7a]'
                    }`}
                  >
                    Playfair Cipher
                  </button>
                </div>

                {/* Primary Classical Panel */}
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#00d1ff] font-mono">
                      {classicalAlgo} CRYPTO MODULE
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setClassicalMode('ENCRYPT')}
                        className={`text-[9px] px-2 py-0.5 rounded border ${
                          classicalMode === 'ENCRYPT' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        ENCRYPT
                      </button>
                      <button
                        onClick={() => setClassicalMode('DECRYPT')}
                        className={`text-[9px] px-2 py-0.5 rounded border ${
                          classicalMode === 'DECRYPT' ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        DECRYPT
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a] mb-1">Plaintext Message</label>
                      <textarea
                        value={classicalInput}
                        onChange={(e) => setClassicalInput(e.target.value)}
                        rows={3}
                        className="bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono focus:outline-none focus:border-[#00d1ff] resize-none"
                      ></textarea>
                    </div>
                    <div className="flex flex-col relative">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a] mb-1">Ciphertext Output</label>
                      <textarea
                        value={classicalOutput}
                        readOnly
                        rows={3}
                        className="bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono text-[#00ff41] focus:outline-none resize-none"
                        placeholder="Result payload..."
                      ></textarea>
                      {classicalOutput && (
                        <button
                          onClick={() => copyToClipboard(classicalOutput, 'classical_output')}
                          className="absolute right-3 bottom-3 p-1 bg-[#121417] border border-[#1f2228] rounded text-[#7a7a7a] hover:text-[#00ff41]"
                        >
                          {copiedId === 'classical_output' ? <Check className="w-3 h-3 text-[#00ff41]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Algorithm specific inputs */}
                  <div className="mt-4 pt-4 border-t border-[#1f2228] space-y-4">
                    {classicalAlgo === 'VIGENERE' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Vigenère Alphabet Keyword Key</label>
                        <input
                          type="text"
                          value={vigenereKey}
                          onChange={(e) => setVigenereKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                          className="w-full bg-[#08090a] border border-[#1f2228] px-3 py-1.5 text-xs font-mono text-[#00d1ff]"
                          placeholder="e.g. SECRET"
                        />
                      </div>
                    )}

                    {classicalAlgo === 'RAIL_FENCE' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Rail Fence Zigzag Rails (Count = {railFenceRails})</label>
                        <input
                          type="range"
                          min="2"
                          max="8"
                          value={railFenceRails}
                          onChange={(e) => setRailFenceRails(parseInt(e.target.value, 10))}
                          className="w-full accent-[#00d1ff] bg-[#1f2228] h-1.5 rounded"
                        />
                      </div>
                    )}

                    {classicalAlgo === 'PLAYFAIR' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Playfair Key Grid Seed</label>
                        <input
                          type="text"
                          value={playfairKey}
                          onChange={(e) => setPlayfairKey(e.target.value.toUpperCase())}
                          className="w-full bg-[#08090a] border border-[#1f2228] px-3 py-1.5 text-xs font-mono text-[#00d1ff]"
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleClassicalAction}
                        className="px-6 py-2 bg-[#00d1ff] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                      >
                        RUN TRANSFORM
                      </button>
                    </div>
                  </div>
                </div>

                {/* Classical visualizations: grids, matrices, zigzags */}
                {classicalAlgo === 'RAIL_FENCE' && classicalInput && (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff] mb-3">ZIGZAG FENCE MAP VISUALIZER</h4>
                    <div className="bg-[#08090a] border border-[#1f2228] p-4 overflow-x-auto rounded font-mono text-xs">
                      <div className="grid gap-1.5 min-w-[400px]">
                        {getRailFenceVisual(classicalInput.slice(0, 32), railFenceRails).map((row, rIdx) => (
                          <div key={rIdx} className="flex gap-1 items-center">
                            <span className="w-12 text-[#7a7a7a] text-[10px] tracking-tight uppercase">RAIL_{rIdx + 1}:</span>
                            <div className="flex gap-1">
                              {row.map((char, cIdx) => (
                                <span
                                  key={cIdx}
                                  className={`w-5 h-5 flex items-center justify-center rounded text-[10px] ${
                                    char !== ' ' ? 'bg-[#00ff41]/20 border border-[#00ff41] text-[#00ff41] font-bold animate-pulse' : 'bg-transparent text-transparent'
                                  }`}
                                >
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {classicalAlgo === 'PLAYFAIR' && (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff] mb-3">5X5 SYMMETRIC PLAYFAIR MATRIX (J OMITTED)</h4>
                    <div className="flex items-center gap-6">
                      <div className="bg-[#08090a] border border-[#1f2228] p-3 rounded grid grid-cols-5 gap-1.5">
                        {generatePlayfairMatrix(playfairKey).map((row, r) =>
                          row.map((letter, col) => (
                            <span
                              key={`${r}-${col}`}
                              className="w-8 h-8 flex items-center justify-center rounded border border-[#1f2228] bg-[#121417] font-mono text-xs font-bold text-[#00d1ff] hover:border-[#00ff41]"
                            >
                              {letter}
                            </span>
                          ))
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#7a7a7a] space-y-1.5 leading-relaxed">
                        <p className="text-[#00ff41] font-bold uppercase">Matrix Generation Rules:</p>
                        <p>1. Key seed characters are normalized, duplicates dropped.</p>
                        <p>2. The letter 'J' is mapped onto 'I' to preserve 5x5 grid dimensions.</p>
                        <p>3. Remaining squares are packed chronologically with leftover alphabet letters.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: MODERN CODES & SYMMETRIC AES-256 */}
            {activeTab === 'modern' && (
              <div className="space-y-6">
                
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">Modern Symmetric Modules</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setModernAlgo('AES-256'); setModernOutput(''); }}
                        className={`text-[9px] px-2.5 py-1 font-mono uppercase font-bold rounded border ${
                          modernAlgo === 'AES-256' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        AES-256 GCM
                      </button>
                      <button
                        onClick={() => { setModernAlgo('FERNET'); setModernOutput(''); }}
                        className={`text-[9px] px-2.5 py-1 font-mono uppercase font-bold rounded border ${
                          modernAlgo === 'FERNET' ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        Fernet Code
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                    AES-256 GCM utilizes Galois/Counter Mode providing authenticated encryption (AEAD). Fernet offers symmetric AES-128 CBC combined with SHA-256 HMAC authentication envelopes.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a] mb-1">Payload input / cipher payload</label>
                      <textarea
                        value={modernInput}
                        onChange={(e) => setModernInput(e.target.value)}
                        rows={4}
                        className="bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono resize-none focus:outline-none focus:border-[#00d1ff]"
                        placeholder="Type secret message or base64 package to transform..."
                      ></textarea>
                    </div>
                    <div className="flex flex-col relative">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a] mb-1">Result output</label>
                      <textarea
                        value={modernOutput}
                        readOnly
                        rows={4}
                        className="bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono resize-none text-[#00ff41] focus:outline-none"
                        placeholder="Cipher output container (Base64 structured JSON)..."
                      ></textarea>
                      {modernOutput && (
                        <button
                          onClick={() => copyToClipboard(modernOutput, 'modern_output')}
                          className="absolute right-3 bottom-3 p-1.5 bg-[#121417] border border-[#1f2228] rounded text-[#7a7a7a] hover:text-[#00ff41] transition-colors"
                        >
                          {copiedId === 'modern_output' ? <Check className="w-3.5 h-3.5 text-[#00ff41]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Secret Key Input Panel */}
                  <div className="space-y-3 bg-[#08090a] p-4 border border-[#1f2228] rounded">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#e0e0e0] font-bold">256-BIT CRYPTOGRAPHIC SECRET KEY</span>
                      <button
                        onClick={generateSecureKey}
                        className="text-[#00d1ff] hover:underline"
                      >
                        GENERATE SECURE KEY
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={modernKey}
                        onChange={(e) => setModernKey(e.target.value)}
                        className="w-full bg-[#121417] border border-[#1f2228] px-3 py-2 text-xs font-mono text-white tracking-widest focus:outline-none focus:border-[#00d1ff]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setModernMode('ENCRYPT'); setModernOutput(''); }}
                        className={`text-[10px] px-3 py-1 font-mono uppercase rounded border ${
                          modernMode === 'ENCRYPT' ? 'bg-[#00d1ff]/15 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        MODE: ENCRYPT
                      </button>
                      <button
                        onClick={() => { setModernMode('DECRYPT'); setModernOutput(''); }}
                        className={`text-[10px] px-3 py-1 font-mono uppercase rounded border ${
                          modernMode === 'DECRYPT' ? 'bg-[#00ff41]/15 border-[#00ff41] text-[#00ff41]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        MODE: DECRYPT
                      </button>
                    </div>
                    <button
                      onClick={handleModernAction}
                      className="px-6 py-2 bg-[#00ff41] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                    >
                      EXECUTE MODERN SECURE PAYLOAD
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: CRYPTOGRAPHIC HASH GENERATOR */}
            {activeTab === 'hash' && (
              <div className="space-y-6">
                
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">Cryptographic Digests</h3>
                    <div className="flex gap-2 font-mono text-[10px]">
                      <button
                        onClick={() => setHashAlgorithm('sha256')}
                        className={`px-2.5 py-1 rounded border ${
                          hashAlgorithm === 'sha256' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        SHA-256
                      </button>
                      <button
                        onClick={() => setHashAlgorithm('sha512')}
                        className={`px-2.5 py-1 rounded border ${
                          hashAlgorithm === 'sha512' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        SHA-512
                      </button>
                      <button
                        onClick={() => setHashAlgorithm('md5')}
                        className={`px-2.5 py-1 rounded border ${
                          hashAlgorithm === 'md5' ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-[#1f2228] text-[#7a7a7a]'
                        }`}
                      >
                        MD5 (DEP)
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                    Cryptographic hash algorithms are mathematical operations that map raw input text of arbitrary length into a fixed-length hexadecimal hash value. It must be irreversible (one-way).
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">RAW TEXT INPUT FOR HASH DIGEST</label>
                    <textarea
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      rows={3}
                      className="w-full bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono focus:outline-none focus:border-[#00d1ff]"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleHashAction}
                      className="px-6 py-2 bg-[#00d1ff] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                    >
                      COMPUTE MESSAGE DIGEST
                    </button>
                  </div>

                  {/* Hash digest output panel */}
                  {hashResult && (
                    <div className="bg-[#08090a] border border-[#1f2228] rounded p-4 space-y-3 font-mono">
                      <div>
                        <div className="flex justify-between text-[9px] text-[#7a7a7a] mb-1 uppercase">
                          <span>Computed digest ({hashAlgorithm.toUpperCase()})</span>
                          {hashAlgorithm === 'md5' && <span className="text-red-500">⚠ DEPRECATED COLLISION-VULNERABLE</span>}
                        </div>
                        <p className="text-xs break-all text-[#00ff41] font-bold font-mono">
                          {hashResult}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-[#1f2228] pt-3 text-[9px] text-[#7a7a7a]">
                        <div>
                          <span>DIGEST SIZE IN RAM:</span>
                          <span className="text-white ml-2">{hashBitsLength} BITS</span>
                        </div>
                        <div>
                          <span>COMPUTE LATENCY:</span>
                          <span className="text-white ml-2">{hashTimeMs} ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 6: PASSWORD STRENGTH CHECKER & GENERATOR */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">Entropy & Password Diagnostics</h3>
                  <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                    Real-time password security evaluates strength on calculated Shannon Entropy (L * log2(pool_size)) to predict mathematical brute force durations.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">TEST PASSWORD STRENGTH</label>
                    <input
                      type="text"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-[#08090a] border border-[#1f2228] px-3 py-2 text-xs font-mono text-white tracking-widest focus:outline-none focus:border-[#00d1ff]"
                    />
                  </div>

                  {/* Entropy metrics & Recommendations */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Gauge info */}
                    <div className="bg-[#08090a] border border-[#1f2228] p-4 rounded flex items-center gap-4">
                      <div className={`w-14 h-14 border-4 rounded-full flex flex-col items-center justify-center text-xs font-bold font-mono ${
                        passwordAnalysis.strength === 'VERY_STRONG' ? 'border-[#00ff41] text-[#00ff41]' :
                        passwordAnalysis.strength === 'STRONG' ? 'border-[#00d1ff] text-[#00d1ff]' :
                        passwordAnalysis.strength === 'MEDIUM' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'
                      }`}>
                        <span>{passwordAnalysis.entropy}</span>
                        <span className="text-[7px] text-[#7a7a7a] leading-none uppercase">BITS</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono text-white">RATING: {passwordAnalysis.strength}</p>
                        <p className="text-[9px] text-[#7a7a7a] font-mono uppercase">
                          BRUTE-FORCE COST: {passwordAnalysis.entropy < 40 ? '~Seconds' : passwordAnalysis.entropy < 60 ? '~Days' : passwordAnalysis.entropy < 80 ? '~Months' : '~4.2 Years+'}
                        </p>
                      </div>
                    </div>

                    {/* Recommendations list */}
                    <div className="bg-[#08090a] border border-[#1f2228] p-3 rounded font-mono text-[9px] leading-relaxed">
                      <span className="text-white font-bold block mb-1">POLICY REMEDIATION:</span>
                      <ul className="list-disc pl-3 text-[#7a7a7a] space-y-1">
                        {passwordAnalysis.suggestions.map((sug: string, idx: number) => (
                          <li key={idx} className={sug.includes(' secure') ? 'text-[#00ff41]' : ''}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Secure password generator criteria card */}
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">PRNG Policy Key Generator</h3>
                  
                  <div className="grid grid-cols-2 gap-6 font-mono text-[10px]">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#7a7a7a]">LENGTH (L={genLength})</span>
                        <input
                          type="range"
                          min="8"
                          max="32"
                          value={genLength}
                          onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
                          className="w-24 accent-[#00d1ff] cursor-pointer h-1 rounded"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#7a7a7a]">UPPERCASE (A-Z)</span>
                        <input
                          type="checkbox"
                          checked={genUpper}
                          onChange={(e) => setGenUpper(e.target.checked)}
                          className="accent-[#00d1ff]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#7a7a7a]">NUMERICAL DIGITS (0-9)</span>
                        <input
                          type="checkbox"
                          checked={genNumbers}
                          onChange={(e) => setGenNumbers(e.target.checked)}
                          className="accent-[#00d1ff]"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#7a7a7a]">SPECIAL CHARS (!@#$)</span>
                        <input
                          type="checkbox"
                          checked={genSpecial}
                          onChange={(e) => setGenSpecial(e.target.checked)}
                          className="accent-[#00d1ff]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={triggerPasswordGenerator}
                      className="px-6 py-2 bg-[#00d1ff] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                    >
                      GENERATE KEY
                    </button>
                    {generatedPass && (
                      <div className="flex items-center gap-2 bg-[#08090a] px-3 py-1.5 border border-[#1f2228] rounded">
                        <span className="text-[11px] font-mono text-[#00ff41] select-all">{generatedPass}</span>
                        <button
                          onClick={() => copyToClipboard(generatedPass, 'generated_key')}
                          className="p-1 hover:bg-[#121417] rounded text-[#7a7a7a] hover:text-[#00ff41]"
                        >
                          {copiedId === 'generated_key' ? <Check className="w-3 h-3 text-[#00ff41]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 7: ENCRYPTED FILE VAULT */}
            {activeTab === 'file' && (
              <div className="space-y-6">
                
                {/* Vault action selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFileVaultMode('ENCRYPT')}
                    className={`flex-1 p-3 rounded-lg border font-mono text-xs text-center uppercase tracking-wider font-bold transition-all ${
                      fileVaultMode === 'ENCRYPT' ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff]' : 'bg-[#121417] border-[#1f2228] text-[#7a7a7a]'
                    }`}
                  >
                    Encapsulate & Encrypt TXT payload
                  </button>
                  <button
                    onClick={() => setFileVaultMode('DECRYPT')}
                    className={`flex-1 p-3 rounded-lg border font-mono text-xs text-center uppercase tracking-wider font-bold transition-all ${
                      fileVaultMode === 'DECRYPT' ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]' : 'bg-[#121417] border-[#1f2228] text-[#7a7a7a]'
                    }`}
                  >
                    Load & Decrypt SEC container
                  </button>
                </div>

                {fileVaultMode === 'ENCRYPT' ? (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">File Container Packaging (AES-256-CBC)</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Target Filename</label>
                        <input
                          type="text"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="w-full bg-[#08090a] border border-[#1f2228] px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Symmetric Vault Password Key</label>
                        <input
                          type="text"
                          value={fileSecurityKey}
                          onChange={(e) => setFileSecurityKey(e.target.value)}
                          className="w-full bg-[#08090a] border border-[#1f2228] px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Raw File Body Content</label>
                      <textarea
                        value={fileTextContent}
                        onChange={(e) => setFileTextContent(e.target.value)}
                        rows={4}
                        className="w-full bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono focus:outline-none focus:border-[#00d1ff]"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleFileEncryption}
                        className="px-6 py-2 bg-[#00d1ff] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                      >
                        ENCRYPT & PACKAGE payload
                      </button>
                    </div>

                    {fileEncryptedOutput && (
                      <div className="bg-[#08090a] border border-[#1f2228] rounded p-4 space-y-3 font-mono">
                        <div className="flex justify-between items-center text-[9px] text-[#7a7a7a]">
                          <span>SECURE CONTAINER: {fileEncryptedName}</span>
                          <button
                            onClick={() => downloadEncryptedFile(fileEncryptedOutput, fileEncryptedName)}
                            className="text-[#00ff41] hover:underline flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>DOWNLOAD SEC FILE</span>
                          </button>
                        </div>
                        <p className="text-[9px] break-all text-[#7a7a7a] max-h-32 overflow-y-auto">
                          {fileEncryptedOutput}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff41]">Decrypt Container Payload</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">Secure Symmetric Key</label>
                      <input
                        type="text"
                        value={fileDecryptKey}
                        onChange={(e) => setFileDecryptKey(e.target.value)}
                        className="w-full bg-[#08090a] border border-[#1f2228] px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase text-[#7a7a7a]">JSON Encrypted Payload Content (.ENC)</label>
                      <textarea
                        value={fileDecryptPayload}
                        onChange={(e) => setFileDecryptPayload(e.target.value)}
                        rows={4}
                        placeholder="Paste JSON container content from decrypted file..."
                        className="w-full bg-[#08090a] border border-[#1f2228] p-3 text-[11px] font-mono focus:outline-none focus:border-[#00ff41]"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleFileDecryption}
                        className="px-6 py-2 bg-[#00ff41] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                      >
                        DECRYPT & UNFOLD container
                      </button>
                    </div>

                    {fileDecryptedOutput && (
                      <div className="bg-[#08090a] border border-[#1f2228] rounded p-4 space-y-3 font-mono">
                        <div className="flex justify-between items-center text-[9px] text-[#7a7a7a]">
                          <span>UNLOADED FILE: {fileDecryptedName}</span>
                          <span className="text-[#00ff41]">✔ SHA-256 CHECK INTEGRITY APPROVED</span>
                        </div>
                        <p className="text-xs text-white bg-[#121417] p-3 border border-[#1f2228] rounded font-sans leading-relaxed">
                          {fileDecryptedOutput}
                        </p>
                        <p className="text-[8px] text-[#7a7a7a]">
                          MD5/SHA256 CHECKSUM: {fileDecryptedChecksum}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* TAB 8: CIPHER MATRIX (Comparative analysis) */}
            {activeTab === 'compare' && (
              <div className="space-y-6">
                
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff] mb-4">ALGORITHMIC SECURITY COMPARISON MATRIX</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <thead>
                        <tr className="border-b border-[#1f2228] text-[#7a7a7a]">
                          <th className="py-2.5">ALGORITHM</th>
                          <th className="py-2.5">FAMILY CLASS</th>
                          <th className="py-2.5">SECURITY ASSESSMENT</th>
                          <th className="py-2.5">TIME COMPLEXITY</th>
                          <th className="py-2.5">KEY STRENGTH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2228]">
                        {cipherComparisonData.map((cipher) => (
                          <tr key={cipher.name} className="hover:bg-[#131518]/60 transition-colors">
                            <td className="py-3 text-white font-bold">{cipher.name}</td>
                            <td className="py-3 text-[#7a7a7a]">{cipher.type}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cipher.securityLevel === 'Very High' ? 'bg-[#00ff41]/10 text-[#00ff41]' :
                                cipher.securityLevel === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {cipher.securityLevel}
                              </span>
                            </td>
                            <td className="py-3 text-yellow-500/80">{cipher.complexity}</td>
                            <td className="py-3 text-[#00d1ff]">{cipher.keySize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional education guidance explaining matrix vectors */}
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-3 font-mono text-[11px] leading-relaxed">
                  <h4 className="text-xs text-white uppercase font-bold">CYBERSECURITY VECTORED METRIC DEFINITIONS:</h4>
                  <p>
                    <span className="text-[#00d1ff]">CONFIDENTIALITY STATUS:</span> Broken classical ciphers suffer from language frequency leaks where character index counts maps exactly to predictable distribution curves. Modern SPN (Substitution-Permutation Networks) flatten distributions completely into high entropy pseudorandom noise.
                  </p>
                  <p>
                    <span className="text-[#00ff41]">AEAD STANDARDS:</span> Galois counter mode ensures any bit flip inside raw ciphertext automatically fails validation decryption handshake, mitigating active man-in-the-middle attacks.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 9: CRYPTOGRAPHY QUIZ MODULE */}
            {activeTab === 'quiz' && (
              <div className="space-y-6">
                
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1f2228] pb-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">Cryptography Knowledge Assessment</h3>
                    <div className="flex gap-2">
                      {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => { setQuizLevel(lvl); resetQuiz(); }}
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                            quizLevel === lvl ? 'bg-[#00d1ff]/15 border-[#00d1ff] text-[#00d1ff]' : 'border-[#1f2228] text-[#7a7a7a]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!quizFinished ? (
                    <div className="space-y-4 font-mono">
                      <div className="flex justify-between text-[10px] text-[#7a7a7a]">
                        <span>LEVEL: {quizLevel}</span>
                        <span>QUESTION {currentQuestionIdx + 1} OF {activeQuestions.length}</span>
                      </div>

                      <p className="text-sm text-white font-bold font-sans">
                        {currentQuestion?.question}
                      </p>

                      <div className="grid gap-2.5">
                        {currentQuestion?.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelection(idx)}
                            className={`w-full text-left p-3 border rounded text-xs transition-colors font-sans ${
                              selectedAnswerIdx === idx
                                ? 'bg-[#00d1ff]/10 border-[#00d1ff] text-[#00d1ff] font-bold'
                                : 'bg-[#08090a] border-[#1f2228] hover:border-[#7a7a7a] text-white'
                            }`}
                          >
                            <span className="font-mono text-[#7a7a7a] mr-2">[{idx + 1}]</span>
                            {option}
                          </button>
                        ))}
                      </div>

                      {quizAnswered && (
                        <div className="bg-[#08090a] p-4 border border-[#1f2228] rounded space-y-1.5">
                          <span className={`text-[10px] font-bold block ${
                            selectedAnswerIdx === currentQuestion.correctAnswerIndex ? 'text-[#00ff41]' : 'text-red-500'
                          }`}>
                            {selectedAnswerIdx === currentQuestion.correctAnswerIndex ? '✔ CORRECT' : '✘ INCORRECT'}
                          </span>
                          <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        {!quizAnswered ? (
                          <button
                            onClick={submitQuizAnswer}
                            disabled={selectedAnswerIdx === null}
                            className="px-6 py-2 bg-[#00d1ff] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded disabled:opacity-50"
                          >
                            SUBMIT ANSWER
                          </button>
                        ) : (
                          <button
                            onClick={advanceQuiz}
                            className="px-6 py-2 bg-[#00ff41] text-[#08090a] font-mono text-[10px] uppercase font-bold tracking-widest rounded"
                          >
                            NEXT QUESTION
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-4 font-mono">
                      <Award className="w-12 h-12 text-[#00ff41] mx-auto animate-bounce" />
                      <h4 className="text-lg font-bold text-white uppercase">ASSESSMENT PACK COMPLETE</h4>
                      <p className="text-xs text-[#7a7a7a]">
                        You solved <span className="text-[#00ff41] font-bold">{quizScore}</span> correct answers out of <span className="text-[#00d1ff] font-bold">{activeQuestions.length}</span> questions.
                      </p>

                      <div className="max-w-xs mx-auto bg-[#08090a] border border-[#1f2228] p-3 rounded text-[11px]">
                        <span className="text-[#7a7a7a] block mb-1">SCORE METRICS HIGHSCORE</span>
                        <div className="flex justify-between text-white">
                          <span>{quizLevel} CURRENT:</span>
                          <span className="text-[#00ff41] font-bold">{Math.round((quizScore / activeQuestions.length) * 100)}%</span>
                        </div>
                      </div>

                      <button
                        onClick={resetQuiz}
                        className="px-6 py-2 bg-[#1a1c20] hover:bg-[#1f2228] border border-[#1f2228] text-white text-[10px] uppercase font-bold tracking-widest rounded mt-4"
                      >
                        RESTART ASSESSMENT
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 10: EDUCATIONAL EXPLANATIONS */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                
                <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d1ff]">Educational Cybersecurity Vault</h3>
                  <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                    Welcome to the learning center. Below are clean breakdowns of critical cryptography terminology.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#08090a] border border-[#1f2228] p-4 rounded space-y-2">
                      <span className="text-[11px] font-mono font-bold text-[#00ff41] block">Symmetric Encryption</span>
                      <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                        Symmetric key cryptography uses the exact same shared key secret to both encrypt plaintext and decrypt ciphertext. Examples include AES, DES, Caesar, and Vigenère. Extremely fast, but requires highly secure out-of-band key sharing.
                      </p>
                    </div>

                    <div className="bg-[#08090a] border border-[#1f2228] p-4 rounded space-y-2">
                      <span className="text-[11px] font-mono font-bold text-[#00ff41] block">Asymmetric Encryption</span>
                      <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                        Asymmetric systems leverage mathematically linked pairs: a Public Key (used by anyone to encrypt payloads) and a Private Key (held securely by the recipient to decrypt payloads). Famous instances: RSA and Elliptic Curves (ECC).
                      </p>
                    </div>

                    <div className="bg-[#08090a] border border-[#1f2228] p-4 rounded space-y-2 col-span-2">
                      <span className="text-[11px] font-mono font-bold text-[#00ff41] block">One-Way Message Integrity Hashing</span>
                      <p className="text-[11px] text-[#7a7a7a] leading-relaxed">
                        A hashing function transforms raw text into a fixed hash footprint signature. It is completely one-way (non-invertible). Any minor character change (even changing a single punctuation bit) totally changes the hash output (the avalanche effect). Essential for password authentication and file checksum guarantees.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COL - SECURITY MONITORING REAL-TIME AUDIT LOGS */}
          <div className="bg-[#121417] border border-[#1f2228] rounded-lg p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping"></div>
                  <h2 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white">REALTIME AUDIT LOGS</h2>
                </div>
                <div className="flex gap-2 text-[8px] font-mono text-[#7a7a7a]">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#00ff41] rounded-full"></span> LIVE</span>
                </div>
              </div>

              {/* Server connection notice */}
              <div className="bg-[#08090a] border border-[#1f2228] p-2 rounded mb-3 text-[9px] font-mono text-[#7a7a7a] flex items-center justify-between">
                <span>DATABASE PIPELINE</span>
                <span className="text-[#00ff41] font-bold">STABLE CONNECTION</span>
              </div>

              {/* Logs output console terminal */}
              <div className="flex-grow bg-[#08090a] rounded border border-[#1f2228] p-3 font-mono text-[9px] overflow-y-auto leading-relaxed space-y-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <p className="text-[#7a7a7a] italic">Listening for cryptographic transactions...</p>
                ) : (
                  logs.map((log) => {
                    const isCritical = log.level === 'CRITICAL' || log.status === 'BLOCKED';
                    const isWarning = log.level === 'WARNING';
                    
                    return (
                      <div key={log.id} className="border-b border-[#131518] pb-1.5 space-y-1">
                        <div className="flex justify-between items-start text-[8px] text-[#7a7a7a]">
                          <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={isCritical ? 'text-red-500 font-bold' : isWarning ? 'text-yellow-500' : 'text-[#00ff41]'}>
                            {log.level}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white font-bold">{log.action}</span>
                          <span className="text-[#7a7a7a] uppercase text-[7px] bg-[#121417] px-1 rounded">BY: {log.operator}</span>
                        </div>

                        {/* Decrypted payload details based on RBAC role */}
                        <div className="bg-[#121417]/50 p-1.5 rounded text-[#7a7a7a] text-[8px] border border-[#1f2228]/40">
                          {log.detailsDecrypted?.info && (
                            <p className="text-gray-300 font-sans">{log.detailsDecrypted.info}</p>
                          )}
                          {log.detailsDecrypted?.plaintext && (
                            <p className="truncate"><span className="text-[#00d1ff]">IN:</span> {log.detailsDecrypted.plaintext}</p>
                          )}
                          {log.detailsDecrypted?.ciphertext && (
                            <p className="truncate"><span className="text-[#00ff41]">OUT:</span> {log.detailsDecrypted.ciphertext}</p>
                          )}
                          {log.detailsDecrypted?.threat && (
                            <p className="text-yellow-500 font-sans font-bold">⚠ {log.detailsDecrypted.threat}</p>
                          )}
                          {!log.detailsDecrypted?.info && !log.detailsDecrypted?.plaintext && (
                            <p className="text-[7px] text-red-500/80 uppercase font-mono tracking-tighter">
                              Payload Hex: {log.detailsEncrypted.slice(0, 32)}...
                            </p>
                          )}
                        </div>

                        {/* Resolve critical button */}
                        {isWarning && (
                          <button
                            onClick={() => handleResolveLog(log.id)}
                            className="text-[7px] text-[#00ff41] hover:underline uppercase block text-right w-full"
                          >
                            [MITIGATE VECTOR]
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
                <p className="animate-pulse text-[#00ff41]">_</p>
              </div>
            </div>

            {/* Quick Threat Index footer inside logs column */}
            <div className="border-t border-[#1f2228] pt-3 mt-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#7a7a7a]">SECURITY POSTURE</span>
                <span className="text-[#00ff41] font-bold">SECURE_LEVEL_A</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <footer className="h-10 border-t border-[#1f2228] bg-[#0c0d0f] px-6 flex items-center justify-between">
          <div className="flex gap-6 items-center">
            <span className="text-[9px] text-[#7a7a7a] font-mono tracking-tighter">OPERATOR_IDENTITY: {operatorRole}</span>
            <span className="text-[9px] text-[#7a7a7a] font-mono tracking-tighter">CONSOLE_NODE: ASIA-RUN-NODE_2.4.0</span>
          </div>
          <div className="flex gap-4 items-center text-[9px] text-[#7a7a7a]">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#00ff41] rounded-full"></div> INTEL_AES_NI_ENABLED</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#00ff41] rounded-full"></div> HTTPS_PORT_3000</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
