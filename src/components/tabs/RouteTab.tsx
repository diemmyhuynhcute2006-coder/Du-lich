import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { DestinationStop } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  X,
  Compass,
} from 'lucide-react';
import { GLOBAL_PRESET_COVERS } from '../../data/sampleTrip';
import { ImagePicker } from '../common/ImagePicker';
import { resolveValidImageUrl, handleImageError } from '../../utils/imageUtils';

export const RouteTab: React.FC = () => {
  const {
    activeTrip,
    destinations,
    addDestination,
    updateDestination,
    deleteDestination,
    moveDestination,
    showToast,
  } = useTravel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<DestinationStop | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);

  if (!activeTrip) {
    return (
      <EmptyState
        icon="🗾"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để bắt đầu xây dựng hành trình."
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingStop(null);
    setName('');
    setCity('');
    setArrivalDate(activeTrip.startDate || '');
    setDepartureDate(activeTrip.endDate || '');
    setImage(undefined);
    setNotes('');
    setHighlights([]);
    setHighlightInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stop: DestinationStop) => {
    setEditingStop(stop);
    setName(stop.name);
    setCity(stop.city);
    setArrivalDate(stop.arrivalDate);
    setDepartureDate(stop.departureDate);
    setImage(stop.image);
    setNotes(stop.notes || '');
    setHighlights(stop.highlights || []);
    setHighlightInput('');
    setIsModalOpen(true);
  };

  const handleAddHighlight = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (highlightInput.trim() && !highlights.includes(highlightInput.trim())) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (item: string) => {
    setHighlights(highlights.filter((h) => h !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !arrivalDate || !departureDate) {
      showToast('⚠️ Vui lòng nhập đầy đủ thông tin điểm đến', 'warning');
      return;
    }

    if (editingStop) {
      updateDestination(editingStop.id, {
        name: name.trim(),
        city: city.trim(),
        arrivalDate,
        departureDate,
        image,
        notes: notes.trim() || undefined,
        highlights,
      });
    } else {
      addDestination({
        name: name.trim(),
        city: city.trim(),
        arrivalDate,
        departureDate,
        image,
        notes: notes.trim() || undefined,
        highlights,
      });
    }
    setIsModalOpen(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Filter presets based on trip destination
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
            <span className="hanko-stamp text-xs px-1.5 py-0.5">行程</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Hành trình & Lộ trình di chuyển
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Sắp xếp thứ tự các điểm dừng chân, ngày lưu trú và địa điểm muốn tham quan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm điểm đến</span>
        </button>
      </div>

      {/* Visual Sequence Chain */}
      {destinations.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs font-semibold text-stone-700">
            <span className="text-stone-400 font-normal shrink-0">Lộ trình:</span>
            {destinations.map((stop, idx) => (
              <React.Fragment key={stop.id}>
                <span className="bg-[#FAF8F5] border border-stone-200 px-3 py-1.5 rounded-lg whitespace-nowrap text-stone-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#1A2238] text-white text-[10px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span>{stop.city}</span>
                </span>
                {idx < destinations.length - 1 && (
                  <span className="text-stone-400 font-normal">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Destination Cards List */}
          <div className="space-y-4">
            {destinations.map((stop, index) => (
              <div
                key={stop.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all hover:border-stone-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  {/* Photo Section */}
                  {stop.image ? (
                    <div className="md:col-span-4 h-48 md:h-auto relative overflow-hidden bg-stone-100">
                      <img
                        src={resolveValidImageUrl(stop.image)}
                        alt={stop.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e)}
                      />
                      <div className="absolute top-3 left-3 bg-[#1A2238]/85 text-white text-xs font-mono px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-1.5">
                        <span>Chặng {index + 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="md:col-span-3 h-24 md:h-auto relative bg-[#FAF8F5] border-r border-stone-200 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#1A2238] text-white text-sm font-mono flex items-center justify-center mb-1">
                        {index + 1}
                      </div>
                      <span className="text-xs font-semibold text-stone-700">{stop.city}</span>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className={`${stop.image ? 'md:col-span-8' : 'md:col-span-9'} p-5 sm:p-6 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                              {stop.city}
                            </span>
                          </div>
                          <h3 className="font-editorial text-xl font-bold text-stone-900 mt-0.5">
                            {stop.name}
                          </h3>
                        </div>

                        {/* Order & Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveDestination(stop.id, 'up')}
                            disabled={index === 0}
                            className={`p-1.5 rounded-lg border text-stone-600 transition-colors ${
                              index === 0
                                ? 'opacity-30 cursor-not-allowed border-stone-200'
                                : 'hover:bg-stone-100 hover:text-stone-900 border-stone-200 cursor-pointer'
                            }`}
                            title="Di chuyển lên trước"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveDestination(stop.id, 'down')}
                            disabled={index === destinations.length - 1}
                            className={`p-1.5 rounded-lg border text-stone-600 transition-colors ${
                              index === destinations.length - 1
                                ? 'opacity-30 cursor-not-allowed border-stone-200'
                                : 'hover:bg-stone-100 hover:text-stone-900 border-stone-200 cursor-pointer'
                            }`}
                            title="Di chuyển xuống sau"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(stop)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer ml-1"
                            title="Chỉnh sửa điểm đến"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(stop.id)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa điểm đến"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-stone-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B83A2E]" />
                          <span>Đến: <strong>{formatDate(stop.arrivalDate)}</strong></span>
                        </span>
                        <span>–</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>Rời đi: <strong>{formatDate(stop.departureDate)}</strong></span>
                        </span>
                      </div>

                      {/* Highlights */}
                      {stop.highlights && stop.highlights.length > 0 && (
                        <div className="mt-4">
                          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                            Địa điểm muốn tham quan
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {stop.highlights.map((item, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs bg-[#FAF8F5] border border-stone-200 text-stone-800 px-2.5 py-1 rounded-lg"
                              >
                                <MapPin className="w-3 h-3 text-[#B83A2E]" />
                                <span>{item}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {stop.notes && (
                        <p className="mt-3 text-xs text-stone-600 leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-stone-200/60">
                          {stop.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon="📍"
          title="Chưa có điểm đến nào trong hành trình"
          description="Bắt đầu chia hành trình của bạn thành các chặng dừng chân (ví dụ: Zurich → Lucerne → Zermatt hoặc Tokyo → Kyoto)."
          actionLabel="Thêm điểm đến đầu tiên"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              {editingStop ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến mới'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Cung cấp thông tin ngày lưu trú và các danh thắng muốn ghé thăm
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Tên điểm đến <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Cố đô Lucerne hoặc Thủ đô Zurich"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Thành phố / Khu vực <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ví dụ: Lucerne, Zurich, Kyoto..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Ngày đến <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Ngày rời đi <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>
              </div>

              {/* Image uploader */}
              <div>
                <ImagePicker
                  value={image}
                  onChange={setImage}
                  label="Ảnh điểm đến"
                  helperText="Tải ảnh từ máy hoặc chọn ảnh mẫu"
                  aspectRatio="wide"
                  presets={relevantPresets}
                />
              </div>

              {/* Highlights tag input */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Địa điểm muốn tham quan (nhấn Thêm)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Ví dụ: Cầu Chapel, Hồ Lucerne, Đỉnh Pilatus..."
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddHighlight()}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>

                {highlights.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs bg-stone-200 text-stone-800 px-2 py-0.5 rounded"
                      >
                        <span>{h}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(h)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ghi chú chặng
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú về khách sạn, cách di chuyển, vé tàu..."
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
                  {editingStop ? 'Lưu thay đổi' : 'Thêm điểm đến'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa điểm đến"
        message="Bạn có chắc chắn muốn xóa điểm đến này khỏi hành trình không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa điểm đến"
        onConfirm={() => {
          if (deleteTargetId) deleteDestination(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
