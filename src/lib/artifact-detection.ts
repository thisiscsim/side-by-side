/**
 * Artifact Detection Utility
 * Uses weighted keyword scoring to detect whether a user message
 * should trigger a draft or review artifact
 */

interface KeywordWeight {
  word: string;
  weight: number;
  variants?: string[];
}

// Draft-related keywords with weights
const draftKeywords: KeywordWeight[] = [
  { word: 'draft', weight: 1.0, variants: ['drafting', 'drafted', 'drafts'] },
  { word: 'document', weight: 0.9, variants: ['documentation', 'doc', 'docs'] },
  { word: 'write', weight: 0.8, variants: ['writing', 'written', 'wrote'] },
  { word: 'memo', weight: 0.9, variants: ['memorandum', 'memos'] },
  { word: 'create', weight: 0.7, variants: ['creating', 'creation', 'created'] },
  { word: 'compose', weight: 0.8, variants: ['composing', 'composition', 'composed'] },
  { word: 'letter', weight: 0.85, variants: ['letters'] },
  { word: 'report', weight: 0.85, variants: ['reports', 'reporting'] },
  { word: 'brief', weight: 0.85, variants: ['briefs', 'briefing'] },
  { word: 'prepare', weight: 0.7, variants: ['preparing', 'preparation', 'prepared'] },
  { word: 'generate', weight: 0.7, variants: ['generating', 'generation', 'generated'] },
  { word: 'produce', weight: 0.7, variants: ['producing', 'production', 'produced'] },
  { word: 'outline', weight: 0.75, variants: ['outlining', 'outlined'] },
  { word: 'summary', weight: 0.75, variants: ['summarize', 'summarizing', 'summaries'] }
];

// Review/table-related keywords with weights
const reviewKeywords: KeywordWeight[] = [
  { word: 'review', weight: 1.0, variants: ['reviewing', 'reviewed', 'reviews'] },
  { word: 'table', weight: 0.9, variants: ['tables', 'tabular', 'tabulate'] },
  { word: 'extract', weight: 0.8, variants: ['extraction', 'extracting', 'extracted'] },
  { word: 'analyze', weight: 0.8, variants: ['analysis', 'analyzing', 'analyzed', 'analyse'] },
  { word: 'spreadsheet', weight: 0.9, variants: ['spreadsheets'] },
  { word: 'data', weight: 0.6, variants: ['dataset', 'datasets'] },
  { word: 'columns', weight: 0.7, variants: ['column', 'cols', 'col'] },
  { word: 'rows', weight: 0.7, variants: ['row'] },
  { word: 'grid', weight: 0.75, variants: ['grids'] },
  { word: 'comparison', weight: 0.75, variants: ['compare', 'comparing', 'compared'] },
  { word: 'matrix', weight: 0.8, variants: ['matrices'] },
  { word: 'chart', weight: 0.7, variants: ['charts', 'charting'] },
  { word: 'list', weight: 0.65, variants: ['listing', 'lists', 'listed'] },
  { word: 'organize', weight: 0.7, variants: ['organizing', 'organized', 'organization'] }
];

/**
 * Calculate the artifact score for a message based on weighted keywords
 * @param message The user's message
 * @param keywords The keyword weights to check against
 * @returns The calculated score
 */
function calculateArtifactScore(message: string, keywords: KeywordWeight[]): number {
  const lowerMessage = message.toLowerCase();
  let score = 0;
  const foundKeywords: string[] = [];
  
  for (const keywordObj of keywords) {
    const allVariants = [keywordObj.word, ...(keywordObj.variants || [])];
    
    for (const variant of allVariants) {
      // Use word boundaries to avoid partial matches (e.g., "data" in "update")
      const regex = new RegExp(`\\b${variant}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        score += keywordObj.weight;
        foundKeywords.push(variant);
        break; // Only count once per keyword group
      }
    }
  }
  
  // Bonus for multiple keyword matches (synergy effect)
  if (foundKeywords.length > 1) {
    score += 0.2 * (foundKeywords.length - 1);
  }
  
  return score;
}

/**
 * Detect artifact type based on weighted keyword scoring
 * @param message The user's message
 * @returns 'draft' | 'review' | null
 */
export function detectArtifactType(message: string): 'draft' | 'review' | null {
  const draftScore = calculateArtifactScore(message, draftKeywords);
  const reviewScore = calculateArtifactScore(message, reviewKeywords);
  
  // Threshold for minimum score to trigger an artifact
  const threshold = 0.6;
  
  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Artifact Detection:', {
      message,
      draftScore,
      reviewScore,
      threshold
    });
  }
  
  // Return the highest scoring type if it meets the threshold
  if (draftScore >= threshold && draftScore > reviewScore) {
    return 'draft';
  }
  if (reviewScore >= threshold && reviewScore > draftScore) {
    return 'review';
  }
  
  // If scores are tied and above threshold, use context clues
  if (draftScore >= threshold && reviewScore >= threshold && draftScore === reviewScore) {
    // Look for more specific action words that might indicate intent
    const actionWords = message.toLowerCase();
    if (actionWords.includes('write') || actionWords.includes('compose') || actionWords.includes('draft')) {
      return 'draft';
    }
    if (actionWords.includes('extract') || actionWords.includes('analyze') || actionWords.includes('table')) {
      return 'review';
    }
  }
  
  return null;
}

/**
 * Get detailed scoring information for debugging/testing
 * @param message The user's message
 * @returns Detailed scoring breakdown
 */
export function getArtifactScoreDetails(message: string): {
  draftScore: number;
  reviewScore: number;
  suggestedType: 'draft' | 'review' | null;
  draftKeywordsFound: string[];
  reviewKeywordsFound: string[];
} {
  const lowerMessage = message.toLowerCase();
  const draftKeywordsFound: string[] = [];
  const reviewKeywordsFound: string[] = [];
  
  // Find matching keywords for draft
  for (const keywordObj of draftKeywords) {
    const allVariants = [keywordObj.word, ...(keywordObj.variants || [])];
    for (const variant of allVariants) {
      const regex = new RegExp(`\\b${variant}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        draftKeywordsFound.push(variant);
        break;
      }
    }
  }
  
  // Find matching keywords for review
  for (const keywordObj of reviewKeywords) {
    const allVariants = [keywordObj.word, ...(keywordObj.variants || [])];
    for (const variant of allVariants) {
      const regex = new RegExp(`\\b${variant}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        reviewKeywordsFound.push(variant);
        break;
      }
    }
  }
  
  const draftScore = calculateArtifactScore(message, draftKeywords);
  const reviewScore = calculateArtifactScore(message, reviewKeywords);
  const suggestedType = detectArtifactType(message);
  
  return {
    draftScore,
    reviewScore,
    suggestedType,
    draftKeywordsFound,
    reviewKeywordsFound
  };
}