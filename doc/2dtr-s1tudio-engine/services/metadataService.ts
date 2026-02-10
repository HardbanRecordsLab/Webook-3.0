
/**
 * OpenLibrary API Service
 * Strategy: Offload metadata entry and high-res cover sourcing.
 * No API Key required.
 */

export interface BookMetadata {
  title: string;
  authors: string[];
  coverUrl?: string;
  description?: string;
  publishDate?: string;
}

export const fetchBookMetadata = async (query: string): Promise<BookMetadata | null> => {
  try {
    // Determine if query is ISBN or Title
    const isIsbn = /^[0-9xX-]{10,17}$/.test(query.replace(/-/g, ''));
    const searchParam = isIsbn ? `isbn:${query}` : `title:${query}`;
    
    const response = await fetch(`https://openlibrary.org/search.json?${searchParam.includes('isbn') ? 'q=' + searchParam : 'title=' + encodeURIComponent(query)}&limit=1`);
    const data = await response.json();

    if (data.docs && data.docs.length > 0) {
      const doc = data.docs[0];
      return {
        title: doc.title,
        authors: doc.author_name || ['Unknown Author'],
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
        publishDate: doc.publish_date ? doc.publish_date[0] : undefined,
      };
    }
    return null;
  } catch (error) {
    console.error("Metadata Fetch Error:", error);
    return null;
  }
};
