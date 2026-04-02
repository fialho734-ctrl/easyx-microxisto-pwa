// PDF Assets - Base64 encoded images and fonts for PDF generation
// These are placeholder values - replace with actual base64 assets for production

// Minimal 1x1 transparent PNG for placeholders
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const PDF_ASSETS = {
  topDecoration: TRANSPARENT_PNG,
  logoMicroXisto: TRANSPARENT_PNG
};

// Placeholder font - empty base64 string (jsPDF will fallback to helvetica)
export const EUROSTILE_FONT = '';
