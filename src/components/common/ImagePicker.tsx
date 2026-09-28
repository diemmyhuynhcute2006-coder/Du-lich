import React, { useRef, useState } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon, Check } from 'lucide-react';
import { processImageFile, resolveValidImageUrl, handleImageError } from '../../utils/imageUtils';

export interface PresetOption {
  label: string;
  url: string;
}

interface ImagePickerProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  presets?: PresetOption[];
  allowRemove?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  label = 'Hình ảnh',
  helperText = 'Tải ảnh từ thiết bị của bạn (JPEG, PNG, WebP)',
  aspectRatio = 'wide',
  presets = [],
  allowRemove = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    try {
      const compressedDataUrl = await processImageFile(file);
      onChange(compressedDataUrl);
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const isUserUploaded = value && value.startsWith('data:image');

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'wide'
      ? 'h-36 sm:h-44'
      : 'min-h-[140px]';

  return (
    <div className="space-y-2">
      {/* Label and Status */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
          <span>{label}</span>
          {isUserUploaded && (
            <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Ảnh tải lên từ thiết bị
            </span>
          )}
        </label>
        <span className="text-[11px] text-stone-500">{helperText}</span>
      </div>

      {/* Main Upload Box / Preview */}
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {value ? (
          <div
            className={`group relative rounded-xl overflow-hidden border border-stone-300 bg-stone-100 ${aspectClass} transition-all`}
          >
            <img
              src={resolveValidImageUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e)}
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-900 text-xs font-medium rounded-lg shadow-md hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Đổi ảnh khác</span>
              </button>

              {allowRemove && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-lg shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              )}
            </div>

            {/* Quick delete button on top-right */}
            {allowRemove && (
              <button
                type="button"
                onClick={handleRemove}
                title="Xóa ảnh"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/70 text-white hover:bg-rose-600 transition-colors group-hover:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-stone-300 hover:border-[#B83A2E] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-white/70 hover:bg-[#FAF8F5] transition-all ${aspectClass}`}
          >
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-stone-500" />
            </div>
            <p className="text-xs font-semibold text-stone-800">
              {isProcessing ? 'Đang xử lý hình ảnh...' : 'Nhấn để tải ảnh từ thiết bị của bạn'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Hỗ trợ chụp từ camera hoặc chọn file trong máy
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Preset options if provided */}
      {presets.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-medium text-stone-500 block mb-1.5">
            Hoặc chọn ảnh phong cảnh mẫu phù hợp:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onChange(preset.url)}
                  className={`group relative rounded-lg overflow-hidden border-2 text-left aspect-4/3 transition-all ${
                    isSelected
                      ? 'border-[#B83A2E] ring-2 ring-[#B83A2E]/30 scale-[1.02]'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveValidImageUrl(preset.url)}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e)}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate leading-tight">
                      {preset.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[#B83A2E] text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
