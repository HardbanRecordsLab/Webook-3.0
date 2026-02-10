
/**
 * Datamuse API Service
 * Strategy: Semantic Intelligence for high-end editing and copywriting.
 * No API Key required.
 */

export interface SemanticResult {
  word: string;
  score: number;
}

export const getSynonyms = async (word: string): Promise<SemanticResult[]> => {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=10`);
    return await response.json();
  } catch (error) {
    console.error("Semantic Error:", error);
    return [];
  }
};

export const getRelatedWords = async (word: string): Promise<SemanticResult[]> => {
  try {
    const response = await fetch(`https://api.datamuse.com/words?ml=${word}&max=10`);
    return await response.json();
  } catch (error) {
    return [];
  }
};
