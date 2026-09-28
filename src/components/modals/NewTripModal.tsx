import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { X, Calendar, MapPin, Sparkles, Globe } from 'lucide-react';
import {
  GLOBAL_PRESET_COVERS,
  SWISS_ALPS_IMAGE,
  HERO_IMAGE,
  EUROPEAN_CITY_IMAGE,
} from '../../data/sampleTrip';
import { ImagePicker } from '../common/ImagePicker';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({ isOpen, onClose }) => {
  const { createTrip, showToast } = useTravel();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [budgetGoal, setBudgetGoal] = useState('30000000');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !startDate || !endDate) {
      showToast('⚠️ Vui lòng nhập đầy đủ thông tin chuyến đi', 'warning');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('⚠️ Ngày kết thúc phải sau ngày bắt đầu', 'warning');
      return;
    }

    // Determine appropriate fallback cover image if none was provided
    let finalCover = coverImage;
    if (!finalCover) {
      const lowerDest = destination.toLowerCase();
      if (lowerDest.includes('thụy sĩ') || lowerDest.includes('switzerland') || lowerDest.includes('alps')) {
        finalCover = SWISS_ALPS_IMAGE;
      } else if (lowerDest.includes('nhật') || lowerDest.includes('japan')) {
        finalCover = HERO_IMAGE;
      } else if (lowerDest.includes('châu âu') || lowerDest.includes('pháp') || lowerDest.includes('ý') || lowerDest.includes('europe') || lowerDest.includes('paris')) {
        finalCover = EUROPEAN_CITY_IMAGE;
      } else {
        finalCover = SWISS_ALPS_IMAGE;
      }
    }

    createTrip({
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      coverImage: finalCover || '',
      budgetGoal: Number(budgetGoal) || 0,
      note: note.trim() || undefined,
    });

    onClose();
    // Reset form
    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setCoverImage(undefined);
    setNote('');
  };

  const handleFillSample = (type: 'swiss' | 'japan') => {
    if (type === 'swiss') {
      setTitle('Hành trình Thụy Sĩ mùa hè 2027');
      setDestination('Thụy Sĩ (Zurich - Lucerne - Zermatt)');
      setStartDate('2027-07-05');
      setEndDate('2027-07-14');
      setCoverImage(SWISS_ALPS_IMAGE);
      setBudgetGoal('65000000');
      setNote('Chuyến đi khám phá dãy núi Alps, đi tàu ngắm cảnh Glacier Express và thưởng thức phô mai Thụy Sĩ.');
      showToast('Đã điền gợi ý chuyến đi Thụy Sĩ', 'info');
    } else {
      setTitle('Hành trình Mùa thu Kyoto & Tokyo 2027');
      setDestination('Nhật Bản (Tokyo - Kyoto - Osaka)');
      setStartDate('2027-10-15');
      setEndDate('2027-10-23');
      setCoverImage(HERO_IMAGE);
      setBudgetGoal('35000000');
      setNote('Chuyến đi ngắm lá đỏ Momiji tại các cố đô và thưởng thức ẩm thực.');
      showToast('Đã điền gợi ý chuyến đi Nhật Bản', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors p-1"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="hanko-stamp text-xs px-1.5 py-0.5">新規</span>
              <h2 className="font-editorial text-xl font-bold text-stone-900">
                Tạo chuyến du lịch mới
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Phù hợp cho mọi quốc gia và phong cách du lịch của bạn
            </p>
          </div>

          {/* Quick sample fillers */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-stone-400">Mẫu:</span>
            <button
              type="button"
              onClick={() => handleFillSample('swiss')}
              className="text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded transition-colors"
            >
              🇨🇭 Thụy Sĩ
            </button>
            <button
              type="button"
              onClick={() => handleFillSample('japan')}
              className="text-xs text-[#B83A2E] hover:text-[#96291F] bg-[#FCEBED] border border-rose-200 px-2 py-0.5 rounded transition-colors"
            >
              🇯🇵 Nhật Bản
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Tên chuyến đi <span className="text-[#B83A2E]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Chuyến đi Thụy Sĩ 2027 hoặc Khám phá Châu Âu"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:border-[#B83A2E] focus:ring-1 focus:ring-[#B83A2E] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Điểm đến chính (Quốc gia / Thành phố) <span className="text-[#B83A2E]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ví dụ: Thụy Sĩ, Pháp, Ý, Việt Nam, Nhật Bản..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:border-[#B83A2E] focus:ring-1 focus:ring-[#B83A2E] transition-colors"
              />
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Ngày bắt đầu <span className="text-[#B83A2E]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:border-[#B83A2E] focus:ring-1 focus:ring-[#B83A2E] transition-colors"
                />
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Ngày kết thúc <span className="text-[#B83A2E]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:border-[#B83A2E] focus:ring-1 focus:ring-[#B83A2E] transition-colors"
                />
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Ngân sách dự kiến (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="100000"
              value={budgetGoal}
              onChange={(e) => setBudgetGoal(e.target.value)}
              placeholder="30000000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:border-[#B83A2E] focus:ring-1 focus:ring-[#B83A2E] transition-colors font-mono"
            />
          </div>

          {/* Cover image uploader & selector */}
          <div className="pt-1">
            <ImagePicker
              value={coverImage}
              onChange={setCoverImage}
              label="Ảnh bìa chuyến đi"
              helperText="Tải ảnh từ máy (ưu tiên) hoặc chọn phong cảnh phù hợp"
              aspectRatio="wide"
              presets={GLOBAL_PRESET_COVERS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Ghi chú hoặc lời nhắc cho chuyến đi
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Chuẩn bị trang phục ấm, đặt vé tàu ngắm cảnh trước..."
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm focus:outline-hidden focus:border-[#B83A2E] focus:ring-1 focus:ring-[#B83A2E] transition-colors"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-[#B83A2E] hover:bg-[#96291F] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Tạo chuyến đi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
