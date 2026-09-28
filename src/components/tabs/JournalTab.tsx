import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { JournalEntry, JournalMood } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Calendar,
  MapPin,
  Trash2,
  Edit2,
  X,
  BookOpen,
  Quote,
  Smile,
} from 'lucide-react';
import { GLOBAL_PRESET_COVERS } from '../../data/sampleTrip';
import { ImagePicker } from '../common/ImagePicker';
import { resolveValidImageUrl, handleImageError } from '../../utils/imageUtils';

const MOODS: { id: JournalMood; label: string; stamp: string }[] = [
  { id: 'peaceful', label: 'Bình yên', stamp: '静' },
  { id: 'wonderful', label: 'Tuyệt vời', stamp: '景' },
  { id: 'excited', label: 'Hào hứng', stamp: '興' },
  { id: 'reflective', label: 'Chiêm nghiệm', stamp: '想' },
  { id: 'tasty', label: 'Mỹ vị', stamp: '味' },
];

export const JournalTab: React.FC = () => {
  const {
    activeTrip,
    journals,
    destinations,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    showToast,
  } = useTravel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [reflections, setReflections] = useState('');
  const [mood, setMood] = useState<JournalMood>('peaceful');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  if (!activeTrip) {
    return (
      <EmptyState
        icon="📖"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để viết nhật ký hành trình."
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingJournal(null);
    setTitle('');
    setLocation(destinations[0]?.city || activeTrip.destination);
    setDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setReflections('');
    setMood('peaceful');
    setSelectedImage(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (j: JournalEntry) => {
    setEditingJournal(j);
    setTitle(j.title);
    setLocation(j.location);
    setDate(j.date);
    setContent(j.content);
    setReflections(j.reflections || '');
    setMood(j.mood || 'peaceful');
    setSelectedImage(j.images && j.images[0] ? j.images[0] : undefined);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !content.trim()) {
      showToast('⚠️ Vui lòng nhập tiêu đề, địa điểm và nội dung nhật ký', 'warning');
      return;
    }

    const imagesList = selectedImage ? [selectedImage] : [];

    if (editingJournal) {
      updateJournalEntry(editingJournal.id, {
        title: title.trim(),
        location: location.trim(),
        date,
        content: content.trim(),
        reflections: reflections.trim() || undefined,
        mood,
        images: imagesList,
      });
    } else {
      addJournalEntry({
        title: title.trim(),
        location: location.trim(),
        date,
        content: content.trim(),
        reflections: reflections.trim() || undefined,
        mood,
        images: imagesList,
      });
    }
    setIsModalOpen(false);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const isTripJapan = activeTrip.destination.toLowerCase().includes('nhật') || activeTrip.destination.toLowerCase().includes('japan');
  const relevantPresets = GLOBAL_PRESET_COVERS.filter((p) => {
    if (isTripJapan) return p.country === 'Nhật Bản';
    return p.country !== 'Nhật Bản';
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="hanko-stamp text-xs px-1.5 py-0.5">記録</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Nhật ký hành trình & Kỷ niệm
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Lưu giữ những khoảnh khắc đáng nhớ, câu chuyện và cảm xúc sau mỗi ngày khám phá
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Viết nhật ký mới</span>
        </button>
      </div>

      {/* Journal Stories List */}
      {journals.length > 0 ? (
        <div className="space-y-8">
          {journals.map((entry) => {
            const moodObj = MOODS.find((m) => m.id === entry.mood);
            return (
              <article
                key={entry.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all hover:border-stone-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  {/* Visual Image / Stamp Column */}
                  {entry.images && entry.images.length > 0 && entry.images[0] ? (
                    <div className="md:col-span-4 h-64 md:h-auto relative overflow-hidden bg-stone-100">
                      <img
                        src={resolveValidImageUrl(entry.images[0])}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e)}
                      />
                      {moodObj && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-white bg-[#B83A2E] text-white flex items-center justify-center font-bold text-sm shadow-md">
                          {moodObj.stamp}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="md:col-span-2 hidden md:flex flex-col items-center justify-center p-6 border-r border-stone-100 bg-[#FAF8F5]/60">
                      <div className="w-12 h-12 rounded-full border-2 border-[#B83A2E] text-[#B83A2E] flex items-center justify-center font-bold text-xl shadow-xs">
                        {moodObj?.stamp || '旅'}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-2 font-medium">
                        {moodObj?.label || 'Nhật ký'}
                      </span>
                    </div>
                  )}

                  {/* Text Content Column */}
                  <div className={`${entry.images && entry.images[0] ? 'md:col-span-8' : 'md:col-span-10'} p-6 sm:p-8 flex flex-col justify-between`}>
                    <div>
                      {/* Meta header */}
                      <div className="flex items-center justify-between text-xs text-stone-500 mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#B83A2E]" />
                            <strong className="text-stone-700">{formatDateDisplay(entry.date)}</strong>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span>{entry.location}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Chỉnh sửa nhật ký"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(entry.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Entry Title */}
                      <h3 className="font-editorial text-2xl font-bold text-stone-900 leading-snug mb-3">
                        {entry.title}
                      </h3>

                      {/* Body paragraph */}
                      <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line space-y-2">
                        {entry.content}
                      </div>

                      {/* Personal Reflection quote box */}
                      {entry.reflections && (
                        <div className="mt-4 p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#B83A2E] text-xs text-stone-600 italic relative">
                          <Quote className="w-4 h-4 text-[#B83A2E]/30 absolute top-2 right-2" />
                          <p className="font-editorial text-stone-800">
                            "{entry.reflections}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📖"
          title="Hành trình của bạn chưa có câu chuyện nào"
          description="Viết lại những kỷ niệm đẹp, món ăn ngon hay trải nghiệm ấn tượng trên từng chặng đường."
          actionLabel="Viết bài nhật ký đầu tiên"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Journal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              {editingJournal ? 'Chỉnh sửa bài nhật ký' : 'Viết nhật ký hành trình'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Ghi lại cảm xúc, câu chuyện và hình ảnh đáng nhớ
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tiêu đề câu chuyện <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Một buổi sáng yên bình bên hồ Lucerne..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Địa điểm <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ví dụ: Lucerne, Thụy Sĩ hoặc Paris, Pháp..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Ngày ghi lại <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>
              </div>

              {/* Mood selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Tâm trạng & Cảm nhận chủ đạo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        mood === m.id
                          ? 'border-[#B83A2E] bg-[#FCEBED] text-[#B83A2E] shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full mx-auto border border-current flex items-center justify-center font-bold text-xs mb-1">
                        {m.stamp}
                      </div>
                      <div className="text-[11px] font-medium truncate">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Picker */}
              <div>
                <ImagePicker
                  value={selectedImage}
                  onChange={setSelectedImage}
                  label="Hình ảnh kỷ niệm"
                  helperText="Tải ảnh từ máy hoặc chọn ảnh phong cảnh"
                  aspectRatio="wide"
                  presets={relevantPresets}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Nội dung nhật ký <span className="text-[#B83A2E]">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Hôm nay chuyến đi như thế nào? Bạn đã gặp gỡ ai, nhìn thấy cảnh đẹp gì, và có trải nghiệm nào đáng nhớ nhất..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Cảm nhận hoặc bài học cá nhân (Quote)
                </label>
                <input
                  type="text"
                  value={reflections}
                  onChange={(e) => setReflections(e.target.value)}
                  placeholder="Ví dụ: Du lịch không chỉ để nhìn ngắm, mà là để cảm nhận sự bình yên của tâm hồn..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#B83A2E] hover:bg-[#96291F] rounded-lg cursor-pointer"
                >
                  {editingJournal ? 'Lưu thay đổi' : 'Đăng nhật ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa nhật ký"
        message="Bạn có chắc chắn muốn xóa bài viết nhật ký này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa bài viết"
        onConfirm={() => {
          if (deleteTargetId) deleteJournalEntry(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
