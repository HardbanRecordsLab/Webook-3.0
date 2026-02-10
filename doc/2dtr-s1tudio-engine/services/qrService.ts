
/**
 * QR Server API Service
 * Strategy: Generate production-ready interactive assets (QR Codes).
 * No API Key required.
 */

export const generateQRCodeUrl = (data: string): string => {
  const encodedData = encodeURIComponent(data);
  // Using 1000x1000 for high-quality DTP print reproduction
  return `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodedData}&margin=10&format=png`;
};
