import { stemToken, STOP_WORDS } from '../textPreprocessor';

export interface PreprocessedAnswer {
  rawText: string;
  normalizedText: string;
  sentences: string[];
  clauses: string[];
  tokens: string[];
  stemmedTokens: string[];
  stemSet: Set<string>;
  negatedPhrases: string[];
  negatedTokenSet: Set<string>;
  wordCount: number;
  reasoningConnectorCount: number;
  technicalTermCount: number;
}

const COMMON_ABBREVIATIONS: Record<string, string> = {
  'db': 'database',
  'dbs': 'databases',
  'rdbms': 'relational database management system',
  'az': 'availability zone',
  'azs': 'availability zones',
  'bmd': 'bending moment diagram',
  'sfd': 'shear force diagram',
  'bms': 'battery management system',
  'pmsm': 'permanent magnet synchronous motor',
  'ccm': 'continuous conduction mode',
  'dcm': 'discontinuous conduction mode',
  'sld': 'single line diagram',
  'rcc': 'reinforced concrete',
  'fpga': 'field programmable gate array',
  'rtos': 'real time operating system',
  'rest': 'representational state transfer',
  'api': 'application programming interface',
  'apis': 'application programming interfaces',
  'sql': 'structured query language',
  'nosql': 'non relational database',
  'vm': 'virtual machine',
  'vms': 'virtual machines',
  'os': 'operating system',
  'oss': 'operating systems',
  'cpu': 'central processing unit',
  'ram': 'random access memory',
  'io': 'input output',
  'i/o': 'input output',
  'pr': 'pull request',
  'ci': 'continuous integration',
  'cd': 'continuous deployment',
  'fsm': 'finite state machine',
  'op-amp': 'operational amplifier',
  'opamp': 'operational amplifier',
  'ic': 'internal combustion',
  'abs': 'anti lock braking system',
  'ev': 'electric vehicle',
  'evs': 'electric vehicles',
  'fea': 'finite element analysis',
  'cad': 'computer aided design',
  'gdt': 'geometric dimensioning and tolerancing',
  'gd&t': 'geometric dimensioning and tolerancing',
  'sbc': 'safe bearing capacity',
  'spt': 'standard penetration test',
  'udl': 'uniformly distributed load',
};

const REASONING_CONNECTORS = [
  'because',
  'therefore',
  'as a result',
  'since',
  'due to',
  'hence',
  'consequently',
  'thus',
  'leads to',
  'resulting in',
  'whereas',
  'in contrast',
  'which causes',
  'in order to',
  'so that',
  'this ensures',
  'this prevents',
  'which means'
];

const NEGATION_INDICATORS = [
  'not',
  'no',
  'never',
  "doesn't",
  "does not",
  "isn't",
  "is not",
  "aren't",
  "are not",
  "won't",
  "will not",
  "cannot",
  "can't",
  "without",
  "fails to",
  "neither",
  "nor"
];

/**
 * Normalizes text, expands technical abbreviations, segments into sentences and clauses,
 * and analyzes negation contexts.
 */
export function preprocessAnswer(rawAnswer: string): PreprocessedAnswer {
  if (!rawAnswer || !rawAnswer.trim()) {
    return {
      rawText: '',
      normalizedText: '',
      sentences: [],
      clauses: [],
      tokens: [],
      stemmedTokens: [],
      stemSet: new Set(),
      negatedPhrases: [],
      negatedTokenSet: new Set(),
      wordCount: 0,
      reasoningConnectorCount: 0,
      technicalTermCount: 0,
    };
  }

  const raw = rawAnswer.trim();

  // 1. Sentence segmentation
  const sentences = raw
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 2. Clause segmentation
  const clauses: string[] = [];
  for (const s of sentences) {
    const sClauses = s
      .split(/[,;:—–]|(\s+(?:and|but|or|because|whereas|although|however|since)\s+)/i)
      .map((c) => (c || '').trim())
      .filter((c) => c.length > 2);
    clauses.push(...sClauses);
  }

  // 3. Lowercase & preserve technical characters
  let normalized = raw.toLowerCase();

  // Expand known abbreviations safely around word boundaries
  for (const [abbr, expansion] of Object.entries(COMMON_ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    normalized = normalized.replace(regex, expansion);
  }

  // 4. Tokenization (preserving technical symbols like C++, O(n), IS 456)
  const rawMatches: string[] = normalized.match(/[a-z0-9_+#.-]+/g) || [];
  const tokenList: string[] = [];

  for (const raw of rawMatches) {
    // Strip leading/trailing punctuation except + or # for C++, C#
    const clean = raw.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, '');
    if (clean.length > 1 && !STOP_WORDS.has(clean)) {
      tokenList.push(clean);
      // If hyphenated like non-idempotent, also index subparts
      if (clean.includes('-')) {
        const parts = clean.split('-').filter((p) => p.length > 1 && !STOP_WORDS.has(p));
        for (const p of parts) tokenList.push(p);
      }
    }
  }

  const tokens: string[] = tokenList;
  const stemmedTokens = tokens.map(stemToken);
  const stemSet = new Set(stemmedTokens);

  // 5. Negation analysis: identify phrases where negation inverts meaning
  const negatedPhrases: string[] = [];
  const negatedTokenSet = new Set<string>();

  for (const clause of clauses) {
    const lowerClause = clause.toLowerCase();
    for (const neg of NEGATION_INDICATORS) {
      const idx = lowerClause.indexOf(neg);
      if (idx !== -1) {
        const afterNeg = lowerClause.substring(idx);
        negatedPhrases.push(afterNeg);
        const negRaw: string[] = afterNeg.match(/[a-z0-9_+#.-]+/g) || [];
        for (const nr of negRaw) {
          const cleanNt = nr.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, '');
          if (cleanNt.length > 1 && !STOP_WORDS.has(cleanNt)) {
            negatedTokenSet.add(stemToken(cleanNt));
          }
        }
      }
    }
  }

  // 6. Reasoning connector analysis
  let reasoningConnectorCount = 0;
  const lowerNorm = normalized;
  for (const conn of REASONING_CONNECTORS) {
    if (lowerNorm.includes(conn)) {
      reasoningConnectorCount++;
    }
  }

  const rawWords = raw.split(/\s+/).filter(Boolean);

  return {
    rawText: raw,
    normalizedText: normalized,
    sentences,
    clauses,
    tokens,
    stemmedTokens,
    stemSet,
    negatedPhrases,
    negatedTokenSet,
    wordCount: rawWords.length,
    reasoningConnectorCount,
    technicalTermCount: tokens.length,
  };
}
