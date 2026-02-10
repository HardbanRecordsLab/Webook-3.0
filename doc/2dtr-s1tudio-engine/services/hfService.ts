
export const generateHFImage = async (prompt: string, style: string): Promise<string | null> => {
  // Strategia: Wykorzystujemy Pollinations jako darmowy i niesamowicie szybki interfejs 
  // do silników Stable Diffusion (Hugging Face). Zero obciążenia lokalnego.
  const enhancedPrompt = `High-end editorial illustration, ${style} style, professional DTP quality, highly detailed, cinematic lighting, ${prompt}`;
  const encoded = encodeURIComponent(enhancedPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  
  // Zwracamy bezpośredni URL - przeglądarka pobierze go tylko wtedy, gdy będzie widoczny
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&seed=${seed}&nologo=true&enhance=true`;
};
