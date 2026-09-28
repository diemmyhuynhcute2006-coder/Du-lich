import heroImage from '../assets/images/hero_japan_travel_1790356369416.jpg';
import tokyoImage from '../assets/images/tokyo_city_view_1790356383307.jpg';
import kyotoImage from '../assets/images/kyoto_torii_path_1790356396193.jpg';
import osakaImage from '../assets/images/osaka_food_street_1790356407097.jpg';
import swissAlpsImage from '../assets/images/swiss_alps_landscape_1790358100239.jpg';
import europeanCityImage from '../assets/images/european_city_view_1790358113664.jpg';

export const ASSET_IMAGES = {
  hero: heroImage,
  tokyo: tokyoImage,
  kyoto: kyotoImage,
  osaka: osakaImage,
  swissAlps: swissAlpsImage,
  europeanCity: europeanCityImage,
};

export const DEFAULT_FALLBACK_IMAGE = heroImage;

/**
 * Resolves any image URL to a production-safe URL on Vercel.
 * Fixes legacy dev paths (like '/src/assets/images/...') that return 404 in production,
 * and maps them directly to Vite-bundled hashed assets or public paths.
 */
export const resolveValidImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const cleanUrl = url.trim();

  // If already a base64 data URL from user upload, use directly
  if (cleanUrl.startsWith('data:image/')) {
    return cleanUrl;
  }

  // If external HTTP / HTTPS URL, use directly
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // If blob URL, use directly
  if (cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // Map any legacy or named paths to bundled assets
  const lower = cleanUrl.toLowerCase();
  if (lower.includes('swiss_alps') || lower.includes('alps') || lower.includes('switzerland')) {
    return swissAlpsImage;
  }
  if (lower.includes('european_city') || lower.includes('europe') || lower.includes('pho_co')) {
    return europeanCityImage;
  }
  if (lower.includes('tokyo')) {
    return tokyoImage;
  }
  if (lower.includes('kyoto')) {
    return kyotoImage;
  }
  if (lower.includes('osaka')) {
    return osakaImage;
  }
  if (lower.includes('hero_japan') || lower.includes('japan_travel') || lower.includes('phu_si')) {
    return heroImage;
  }

  // If path starts with public images folder, return as valid root path
  if (cleanUrl.startsWith('/images/')) {
    return cleanUrl;
  }

  // If raw /src/ path slipped through, fallback to bundled hero
  if (cleanUrl.startsWith('/src/')) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  return cleanUrl;
};

/**
 * Handle img onError event safely without infinite loop
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_FALLBACK_IMAGE
) => {
  const target = e.currentTarget;
  if (target && target.src !== fallback) {
    target.onerror = null; // Prevent infinite fallback loops
    target.src = fallback;
  }
};

/**
 * Utility to process, compress and resize user-uploaded images.
 * Uses ObjectURL for fast, memory-safe loading on mobile and desktop.
 * Ensures base64 strings stay compact (typically 40KB - 90KB) so localStorage doesn't hit quota limits.
 */
export const processImageFile = (
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.78
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error('File tải lên không phải là định dạng hình ảnh hợp lệ (JPEG, PNG, WebP)'));
      return;
    }

    // Use ObjectURL instead of FileReader for much better performance and memory safety
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể tải hoặc giải mã hình ảnh này'));
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          reject(new Error('Kích thước hình ảnh không hợp lệ'));
          return;
        }

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If canvas context not available, fallback to basic read
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Lỗi xử lý hình ảnh'));
          reader.readAsDataURL(file);
          return;
        }

        // Fill white background so transparent PNGs don't become black rectangles in JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Render image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed jpeg data URL
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // If string is still large (> 400KB), recompress at lower quality to safeguard localStorage
        if (compressedDataUrl.length > 400000) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
        }

        resolve(compressedDataUrl);
      } catch (err: any) {
        reject(new Error(err?.message || 'Lỗi khi nén hình ảnh'));
      }
    };

    img.src = objectUrl;
  });
};
