/**
 * NLP Text Preprocessor
 * Handles normalization, technical-token preservation, stopword removal,
 * lightweight stemming, and n-gram extraction in pure TypeScript.
 */

export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so',
  'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'also', 'used', 'using', 'worked', 'working', 'including', 'various', 'etc', 'eg', 'well', 'good', 'year', 'years'
]);
export const STOP_WORDS = STOPWORDS;

/**
 * Common technical compounds that should not be split on punctuation
 */
const COMPOUND_PRESERVE: Record<string, string> = {
  'c++': 'cplusplus',
  'c#': 'csharp',
  'node.js': 'nodejs',
  'vue.js': 'vuejs',
  'react.js': 'reactjs',
  'next.js': 'nextjs',
  'staad.pro': 'staadpro',
  'is 456': 'is456',
  'is 1893': 'is1893',
  'ci/cd': 'cicd',
  'rest api': 'restapi',
  'restful api': 'restapi',
  'rest apis': 'restapi',
  'machine learning': 'machinelearning',
  'deep learning': 'deeplearning',
  'data science': 'datascience',
  'apache spark': 'apachespark',
  'embedded c': 'embeddedc',
  'arm cortex': 'armcortex',
  'verilog hdl': 'veriloghdl',
  'solid works': 'solidworks',
};

/**
 * Normalizes text: lowercases, expands technical compounds, trims excess whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  let lower = text.toLowerCase();

  // Replace known compound terms
  for (const [key, replacement] of Object.entries(COMPOUND_PRESERVE)) {
    lower = lower.split(key).join(replacement);
  }

  // Remove URLs, emails, phone numbers
  lower = lower.replace(/https?:\/\/\S+/g, ' ');
  lower = lower.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ');
  lower = lower.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, ' ');

  // Clean special characters but preserve letters, numbers, and technical underscores
  lower = lower.replace(/[^a-z0-9\s_-]/g, ' ');
  return lower.replace(/\s+/g, ' ').trim();
}

/**
 * Tokenizes normalized text into array of word tokens.
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((token) => token.length >= 2);
}

/**
 * Removes stopwords from token list.
 */
export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter((t) => !STOPWORDS.has(t));
}

/**
 * Lightweight technical stemmer (reduces common technical suffixes without breaking keywords)
 */
export function stemToken(token: string): string {
  if (token.length <= 4) return token;

  // Don't stem critical tech abbreviations
  if (['react', 'node', 'flask', 'spark', 'kicad', 'ansys', 'etabs'].includes(token)) {
    return token;
  }

  if (token.endsWith('ational')) return token.slice(0, -5) + 'e';
  if (token.endsWith('ization')) return token.slice(0, -5) + 'e';
  if (token.endsWith('tional')) return token.slice(0, -4);
  if (token.endsWith('ative')) return token.slice(0, -5);
  if (token.endsWith('ently')) return token.slice(0, -4);
  if (token.endsWith('ency')) return token.slice(0, -4) + 'ent';
  if (token.endsWith('ence')) return token.slice(0, -4) + 'ent';
  if (token.endsWith('ment')) return token.slice(0, -4);
  if (token.endsWith('ness')) return token.slice(0, -4);
  if (token.endsWith('able')) return token.slice(0, -4);
  if (token.endsWith('ible')) return token.slice(0, -4);
  if (token.endsWith('ing') && token.length > 5) return token.slice(0, -3);
  if (token.endsWith('ies') && token.length > 5) return token.slice(0, -3) + 'y';
  if (token.endsWith('ed') && token.length > 4) return token.slice(0, -2);
  if (token.endsWith('es') && token.length > 4) return token.slice(0, -2);
  if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) return token.slice(0, -1);

  return token;
}

/**
 * Extracts n-grams (bigrams and trigrams) from token sequence
 */
export function extractNgrams(tokens: string[], n: number = 2): string[] {
  if (tokens.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Generates term frequency map for a document
 */
export function getTermFrequencyMap(tokens: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const token of tokens) {
    const stemmed = stemToken(token);
    map[stemmed] = (map[stemmed] || 0) + 1;
  }
  return map;
}

/**
 * Full preprocessing pipeline returning clean tokens, stems, and ngrams
 */
export function preprocessDocument(rawText: string) {
  const normalized = normalizeText(rawText);
  const rawTokens = tokenize(rawText);
  const filteredTokens = removeStopwords(rawTokens);
  const stemmedTokens = filteredTokens.map(stemToken);
  const bigrams = extractNgrams(filteredTokens, 2);
  const trigrams = extractNgrams(filteredTokens, 3);
  const termFreqs = getTermFrequencyMap(filteredTokens);

  return {
    raw: rawText,
    normalized,
    rawTokens,
    filteredTokens,
    stemmedTokens,
    bigrams,
    trigrams,
    termFreqs,
  };
}
