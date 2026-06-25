/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'CIPHER' | 'HASH' | 'PASSWORD' | 'FILE' | 'SECURITY' | 'AUTH';
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  operator: string; // User Role
  detailsEncrypted: string; // Encrypted with master key
  detailsDecrypted?: {
    plaintext?: string;
    ciphertext?: string;
    algorithm?: string;
    extra?: string;
    info?: string;
    threat?: string;
    [key: string]: any;
  };
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
}

export interface SecurityMetrics {
  totalRequests: number;
  threatsDetected: number;
  incidentsResolved: number;
  algorithmUsage: Record<string, number>;
  incidentTrend: { date: string; threats: number; requests: number }[];
  severityDistribution: { level: 'INFO' | 'WARNING' | 'CRITICAL'; count: number }[];
}

export interface QuizQuestion {
  id: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface CipherComparison {
  name: string;
  type: 'Classical' | 'Modern' | 'Symmetric' | 'Hash';
  securityLevel: 'None (Broken)' | 'Low' | 'Medium' | 'Very High';
  complexity: 'O(N)' | 'O(N * K)' | 'O(N) with Feistel/SPN' | 'O(1) / O(N)';
  keySize: string;
  vulnerabilities: string;
  bestUse: string;
}
