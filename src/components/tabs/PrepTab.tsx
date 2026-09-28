import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { PrepTask } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';

const QUICK_TASKS = [
  'Đặt vé máy bay / phương tiện di chuyển',
  'Đặt phòng khách sạn / nơi lưu trú',
  'Kiểm tra hạn hộ chiếu & visa',
  'Đổi ngoại tệ / Chuẩn bị thẻ thanh toán',
  'Mua SIM / eSIM du lịch 4G',
  'Mua bảo hiểm du lịch quốc tế',
  'Cài ứng dụng bản đồ & tra cứu phương tiện',
];

export const PrepTab: React.FC = () => {
  const {
    activeTrip,
    prepTasks,
    stats,
    addPrepTask,
    updatePrepTask,
    deletePrepTask,
    togglePrepTask,
    showToast,
  } = useTravel();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PrepTask | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  if (!activeTrip) {
    return (
      <EmptyState
        icon="✅"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để lên danh sách việc cần chuẩn bị."
      />
    );
  }

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setDueDate('');
    setNote('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: PrepTask) => {
    setEditingTask(t);
    setTitle(t.title);
    setDueDate(t.dueDate || '');
    setNote(t.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('⚠️ Vui lòng nhập tên công việc cần chuẩn bị', 'warning');
      return;
    }

    if (editingTask) {
      updatePrepTask(editingTask.id, {
        title: title.trim(),
        dueDate: dueDate || undefined,
        note: note.trim() || undefined,
      });
    } else {
      addPrepTask({
        title: title.trim(),
        dueDate: dueDate || undefined,
        note: note.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  const handleQuickAdd = (taskTitle: string) => {
    if (prepTasks.some((t) => t.title === taskTitle)) {
      showToast('Công việc này đã có trong danh sách', 'info');
      return;
    }
    addPrepTask({
      title: taskTitle,
      dueDate: activeTrip.startDate,
    });
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="hanko-stamp text-xs px-1.5 py-0.5">準備</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Những việc cần hoàn thành trước chuyến đi
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi thủ tục visa, vé máy bay, đổi ngoại tệ và đặt phòng khách sạn
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm công việc</span>
        </button>
      </div>

      {/* Progress Box */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-editorial text-base font-bold text-stone-900">
              Tiến độ hoàn thành công việc
            </h3>
            <p className="text-xs text-stone-500">
              Đã xong {stats.prepCompleted}/{stats.prepTotal} công việc chuẩn bị
            </p>
          </div>
          <span className="font-mono text-2xl font-bold text-[#B83A2E] tabular-nums">
            {stats.prepPercentage}%
          </span>
        </div>

        {/* Visual Bar */}
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-[#B83A2E] transition-all duration-300 rounded-full"
            style={{ width: `${stats.prepPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Add Suggestions */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B83A2E]" />
          <span>Gợi ý việc cần làm phổ biến:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TASKS.map((task, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAdd(task)}
              className="text-xs bg-[#FAF8F5] hover:bg-stone-200/80 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
            >
              + {task}
            </button>
          ))}
        </div>
      </div>

      {/* Prep Tasks List */}
      {prepTasks.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {prepTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors ${
                task.isCompleted ? 'bg-stone-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => togglePrepTask(task.id)}
                  className="text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer p-0.5 shrink-0"
                  title={task.isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300" />
                  )}
                </button>

                <div className="min-w-0">
                  <span
                    className={`text-sm font-medium ${
                      task.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-500">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 font-mono text-stone-600">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        Hạn chót: {formatDateDisplay(task.dueDate)}
                      </span>
                    )}
                    {task.note && <span>{task.note}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 rounded hover:bg-stone-100"
                  title="Chỉnh sửa công việc"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(task.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100"
                  title="Xóa công việc"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="✅"
          title="Chưa có công việc chuẩn bị nào"
          description="Hãy tạo các đầu việc quan trọng như đổi tiền, mua eSIM, đặt vé máy bay hoặc kiểm tra visa."
          actionLabel="Thêm công việc đầu tiên"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Task Modal */}
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
              {editingTask ? 'Chỉnh sửa việc chuẩn bị' : 'Thêm việc cần làm'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Đặt lời nhắc hạn chót để không bỏ lỡ thủ tục trước ngày bay
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tên công việc <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đổi 50.000 Yên Nhật tại phố Hà Trung"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Hạn hoàn thành (Dự kiến)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ghi chú chi tiết
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Tỉ giá tham khảo, giấy tờ cần mang theo..."
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
                  {editingTask ? 'Lưu thay đổi' : 'Thêm công việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa công việc"
        message="Bạn có chắc chắn muốn xóa công việc này khỏi danh sách chuẩn bị không?"
        confirmLabel="Xóa công việc"
        onConfirm={() => {
          if (deleteTargetId) deletePrepTask(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
