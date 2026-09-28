import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { Place, PlaceCategory } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Heart,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  X,
  Compass,
} from 'lucide-react';
import { GLOBAL_PRESET_COVERS } from '../../data/sampleTrip';
import { ImagePicker } from '../common/ImagePicker';
import { resolveValidImageUrl, handleImageError } from '../../utils/imageUtils';

const CATEGORIES: { id: PlaceCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: '✨' },
  { id: 'sightseeing', label: '🏛️ Tham quan', icon: '🏛️' },
  { id: 'food', label: '🍜 Ẩm thực', icon: '🍜' },
  { id: 'shopping', label: '🛍️ Mua sắm', icon: '🛍️' },
  { id: 'entertainment', label: '🎡 Giải trí', icon: '🎡' },
  { id: 'stay', label: '🏨 Lưu trú', icon: '🏨' },
  { id: 'nature', label: '🌲 Thiên nhiên', icon: '🌲' },
  { id: 'other', label: '📌 Khác', icon: '📌' },
];

export const PlacesTab: React.FC = () => {
  const {
    activeTrip,
    places,
    destinations,
    addPlace,
    updatePlace,
    deletePlace,
    toggleFavoritePlace,
    showToast,
  } = useTravel();

  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('sightseeing');
  const [plannedDate, setPlannedDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  if (!activeTrip) {
    return (
      <EmptyState
        icon="📍"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để lưu danh sách địa điểm."
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingPlace(null);
    setName('');
    setAddress('');
    setCity(destinations[0]?.city || activeTrip.destination);
    setCategory('sightseeing');
    setPlannedDate('');
    setTime('');
    setNote('');
    setImage(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Place) => {
    setEditingPlace(p);
    setName(p.name);
    setAddress(p.address || '');
    setCity(p.city);
    setCategory(p.category);
    setPlannedDate(p.plannedDate || '');
    setTime(p.time || '');
    setNote(p.note || '');
    setImage(p.image);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      showToast('⚠️ Vui lòng nhập tên địa điểm và thành phố', 'warning');
      return;
    }

    if (editingPlace) {
      updatePlace(editingPlace.id, {
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim(),
        category,
        plannedDate: plannedDate || undefined,
        time: time || undefined,
        note: note.trim() || undefined,
        image,
      });
    } else {
      addPlace({
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim(),
        category,
        plannedDate: plannedDate || undefined,
        time: time || undefined,
        note: note.trim() || undefined,
        image,
        isFavorite: false,
      });
    }
    setIsModalOpen(false);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Filter places
  const filteredPlaces = places.filter((p) => {
    if (onlyFavorites && !p.isFavorite) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

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
            <span className="hanko-stamp text-xs px-1.5 py-0.5">名所</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Địa điểm muốn tham quan
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Bộ sưu tập các danh lam thắng cảnh, quán ăn ngon, tụ điểm giải trí và phong cảnh thiên nhiên
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm địa điểm</span>
        </button>
      </div>

      {/* Filter Chips & Favorite Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A2238] text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
            onlyFavorites
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>Yêu thích ({places.filter((p) => p.isFavorite).length})</span>
        </button>
      </div>

      {/* Places Grid */}
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => {
            const catObj = CATEGORIES.find((c) => c.id === place.category);
            return (
              <div
                key={place.id}
                className="group bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:border-stone-300 hover:shadow-sm"
              >
                <div>
                  {/* Photo with heart button */}
                  {place.image ? (
                    <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                      <img
                        src={resolveValidImageUrl(place.image)}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e)}
                      />
                      <button
                        onClick={() => toggleFavoritePlace(place.id)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-xs text-stone-600 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
                        title={place.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích (♡)'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            place.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[11px] px-2 py-0.5 rounded backdrop-blur-xs">
                        {catObj?.label || place.category}
                      </div>
                    </div>
                  ) : (
                    <div className="relative p-4 pb-2 flex items-center justify-between border-b border-stone-100 bg-[#FAF8F5]">
                      <span className="text-xs bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-700">
                        {catObj?.label || place.category}
                      </span>
                      <button
                        onClick={() => toggleFavoritePlace(place.id)}
                        className="p-1.5 rounded-full text-stone-400 hover:text-rose-600 cursor-pointer"
                        title={place.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích (♡)'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            place.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mb-1">
                      <MapPin className="w-3 h-3 text-[#B83A2E]" />
                      <span className="truncate">{place.city}</span>
                      {place.address && (
                        <>
                          <span>·</span>
                          <span className="truncate">{place.address}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-editorial text-lg font-bold text-stone-900 leading-snug">
                      {place.name}
                    </h3>

                    {(place.plannedDate || place.time) && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-stone-600 font-mono">
                        {place.plannedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{formatDateDisplay(place.plannedDate)}</span>
                          </span>
                        )}
                        {place.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{place.time}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {place.note && (
                      <p className="mt-2.5 text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {place.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-2.5 border-t border-stone-100 bg-[#FAF8F5]/60 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(place)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    title="Chỉnh sửa địa điểm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(place.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa địa điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📍"
          title={onlyFavorites ? 'Không có địa điểm yêu thích nào' : 'Chưa có địa điểm nào'}
          description={
            onlyFavorites
              ? 'Bấm biểu tượng trái tim (♡) tại các địa điểm bạn ưng ý nhất để lưu vào danh sách yêu thích.'
              : 'Lưu các địa điểm danh lam, nhà hàng, quán cà phê hoặc điểm check-in muốn ghé thăm.'
          }
          actionLabel={onlyFavorites ? undefined : 'Thêm địa điểm đầu tiên'}
          onAction={onlyFavorites ? undefined : handleOpenAdd}
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
              {editingPlace ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm muốn tham quan'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Lưu giữ thông tin, hình ảnh và ghi chú trải nghiệm
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tên địa điểm <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Đỉnh núi Matterhorn, Cầu Chapel, hoặc Nhà hàng địa phương..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Thành phố / Khu vực <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ví dụ: Lucerne, Zurich, Zermatt..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Phân loại địa điểm
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Địa chỉ chi tiết (nếu có)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: Kapellbrücke, 6002 Luzern"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Ngày dự kiến ghé thăm
                  </label>
                  <input
                    type="date"
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Thời gian / Giờ mở cửa
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ví dụ: 09:00 - 18:00 hoặc Buổi chiều"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                  />
                </div>
              </div>

              {/* Image uploader */}
              <div>
                <ImagePicker
                  value={image}
                  onChange={setImage}
                  label="Hình ảnh địa điểm"
                  helperText="Tải ảnh từ máy hoặc chọn ảnh phong cảnh"
                  aspectRatio="wide"
                  presets={relevantPresets}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ghi chú hoặc lời khuyên
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Nên đến sớm trước 10h để vắng khách, mua vé trực tuyến..."
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
                  {editingPlace ? 'Lưu thay đổi' : 'Thêm địa điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa địa điểm"
        message="Bạn có chắc chắn muốn xóa địa điểm này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa địa điểm"
        onConfirm={() => {
          if (deleteTargetId) deletePlace(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
