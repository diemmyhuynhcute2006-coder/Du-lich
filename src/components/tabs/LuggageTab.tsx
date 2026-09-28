import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { LuggageItem, LuggageCategory } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  CheckCircle2,
  Circle,
  Shirt,
  FileText,
  Sparkles,
  Pill,
  Zap,
  Backpack,
  Package,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

const LUGGAGE_CATEGORIES: {
  id: LuggageCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'clothes', label: '👕 Quần áo', icon: <Shirt className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'documents', label: '🪪 Giấy tờ', icon: <FileText className="w-3.5 h-3.5 text-rose-500" /> },
  { id: 'cosmetics', label: '💄 Mỹ phẩm', icon: <Sparkles className="w-3.5 h-3.5 text-pink-500" /> },
  { id: 'medicine', label: '💊 Thuốc & Y tế', icon: <Pill className="w-3.5 h-3.5 text-emerald-500" /> },
  { id: 'electronics', label: '🔌 Đồ điện tử', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'personal', label: '🎒 Vật dụng cá nhân', icon: <Backpack className="w-3.5 h-3.5 text-purple-500" /> },
  { id: 'other', label: '📦 Khác', icon: <Package className="w-3.5 h-3.5 text-stone-500" /> },
];

const ESSENTIAL_ITEMS: { name: string; category: LuggageCategory; quantity?: string }[] = [
  { name: 'Hộ chiếu / CCCD / Giấy tờ tùy thân', category: 'documents', quantity: '1 bộ' },
  { name: 'Điện thoại di động & Cáp sạc', category: 'electronics', quantity: '1 bộ' },
  { name: 'Củ sạc chuyển đổi chân cắm quốc tế', category: 'electronics', quantity: '1 cái' },
  { name: 'Pin sạc dự phòng', category: 'electronics', quantity: '1 cái' },
  { name: 'Quần áo phù hợp thời tiết chuyến đi', category: 'clothes', quantity: '5 bộ' },
  { name: 'Áo khoác giữ ấm / Trang phục ngoài', category: 'clothes', quantity: '1 cái' },
  { name: 'Thuốc hạ sốt & Thuốc men cá nhân', category: 'medicine', quantity: '1 túi' },
  { name: 'Bàn chải, kem đánh răng & Đồ vệ sinh cá nhân', category: 'cosmetics', quantity: '1 bộ' },
];

export const LuggageTab: React.FC = () => {
  const {
    activeTrip,
    luggage,
    stats,
    addLuggageItem,
    updateLuggageItem,
    deleteLuggageItem,
    toggleLuggageItem,
    showToast,
  } = useTravel();

  const [activeFilter, setActiveFilter] = useState<LuggageCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LuggageItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LuggageCategory>('clothes');
  const [quantity, setQuantity] = useState('1');

  if (!activeTrip) {
    return (
      <EmptyState
        icon="🧳"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để chuẩn bị hành lý."
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('clothes');
    setQuantity('1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LuggageItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('⚠️ Vui lòng nhập tên món đồ cần mang theo', 'warning');
      return;
    }

    if (editingItem) {
      updateLuggageItem(editingItem.id, {
        name: name.trim(),
        category,
        quantity: quantity.trim() || undefined,
      });
    } else {
      addLuggageItem({
        name: name.trim(),
        category,
        quantity: quantity.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  const handleQuickAddEssentials = () => {
    let addedCount = 0;
    ESSENTIAL_ITEMS.forEach((item) => {
      if (!luggage.some((l) => l.name === item.name)) {
        addLuggageItem(item);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showToast(`✅ Đã thêm ${addedCount} món đồ thiết yếu vào vali`);
    } else {
      showToast('Tất cả món đồ thiết yếu đã có trong danh sách', 'info');
    }
  };

  const filteredLuggage = luggage.filter(
    (item) => activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="hanko-stamp text-xs px-1.5 py-0.5">荷物</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Chuẩn bị hành lý & Đồ dùng
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Không bỏ quên giấy tờ tùy thân, đồ điện tử, thuốc men và trang phục
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {luggage.length < 5 && (
            <button
              onClick={handleQuickAddEssentials}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-stone-200"
              title="Thêm nhanh các món đồ thiết yếu (hộ chiếu, sạc pin, thuốc...)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gợi ý đồ thiết yếu</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm món đồ</span>
          </button>
        </div>
      </div>

      {/* Progress Showcase Box (Mục XVI.3: Đã chuẩn bị 8/10 món 80%) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-editorial text-base font-bold text-stone-900">
              Tiến độ đóng gói vali
            </h3>
            <p className="text-xs text-stone-500">
              Đã chuẩn bị {stats.luggagePacked}/{stats.luggageTotal} món đồ
            </p>
          </div>
          <span className="font-mono text-2xl font-bold text-[#B83A2E] tabular-nums">
            {stats.luggagePercentage}%
          </span>
        </div>

        {/* Visual Bar */}
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-amber-500 to-[#B83A2E] transition-all duration-300 rounded-full"
            style={{ width: `${stats.luggagePercentage}%` }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#1A2238] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
          }`}
        >
          Tất cả ({luggage.length})
        </button>
        {LUGGAGE_CATEGORIES.map((cat) => {
          const count = luggage.filter((i) => i.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeFilter === cat.id
                  ? 'bg-[#1A2238] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span className="text-[10px] font-mono opacity-80">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Checklist items list */}
      {filteredLuggage.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {filteredLuggage.map((item) => {
            const cat = LUGGAGE_CATEGORIES.find((c) => c.id === item.category);
            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors ${
                  item.isPacked ? 'bg-stone-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleLuggageItem(item.id)}
                    className="text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer p-0.5 shrink-0"
                    title={item.isPacked ? 'Đã cho vào vali' : 'Chưa cho vào vali'}
                  >
                    {item.isPacked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span
                      className={`text-sm font-medium ${
                        item.isPacked ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                      <span>{cat?.label || item.category}</span>
                      {item.quantity && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-stone-600 font-medium">
                            Số lượng: {item.quantity}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                    title="Chỉnh sửa món đồ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100"
                    title="Xóa món đồ"
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
          icon="🧳"
          title="Chưa có món đồ nào"
          description="Hãy tạo checklist hành lý (hộ chiếu, sạc điện thoại, áo khoác ấm, thuốc men...) để yên tâm lên đường."
          actionLabel="Thêm món đồ đầu tiên"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Luggage Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              {editingItem ? 'Chỉnh sửa món đồ' : 'Thêm đồ vào vali'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Phân loại rõ ràng giúp bạn đóng gói nhanh chóng và không thất lạc
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tên món đồ <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hộ chiếu, Củ sạc chuyển đổi chân dẹt..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Phân loại
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LuggageCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs"
                >
                  {LUGGAGE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Số lượng hoặc quy cách
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ví dụ: 1 cái, 4 bộ, 1 túi mini..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#B83A2E] hover:bg-[#96291F] rounded-lg"
                >
                  {editingItem ? 'Lưu thay đổi' : 'Thêm vào hành lý'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa món đồ"
        message="Bạn có chắc chắn muốn xóa món đồ này khỏi danh sách hành lý không?"
        confirmLabel="Xóa món đồ"
        onConfirm={() => {
          if (deleteTargetId) deleteLuggageItem(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
