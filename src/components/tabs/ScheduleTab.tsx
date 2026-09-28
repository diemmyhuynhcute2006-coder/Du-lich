import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { Activity, ActivityType } from '../../types/travel';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle,
  Circle,
  Calendar,
  Utensils,
  Camera,
  Car,
  ShoppingBag,
  Hotel,
  X,
} from 'lucide-react';

const ACTIVITY_TYPES: { id: ActivityType; label: string; icon: React.ReactNode }[] = [
  { id: 'sightseeing', label: 'Tham quan', icon: <Camera className="w-3.5 h-3.5" /> },
  { id: 'food', label: 'Ăn uống', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'transport', label: 'Di chuyển', icon: <Car className="w-3.5 h-3.5" /> },
  { id: 'shopping', label: 'Mua sắm', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'stay', label: 'Lưu trú', icon: <Hotel className="w-3.5 h-3.5" /> },
  { id: 'other', label: 'Khác', icon: <Clock className="w-3.5 h-3.5" /> },
];

export const ScheduleTab: React.FC = () => {
  const {
    activeTrip,
    activities,
    stats,
    destinations,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleActivityComplete,
    showToast,
  } = useTravel();

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [time, setTime] = useState('09:00');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<ActivityType>('sightseeing');
  const [note, setNote] = useState('');

  if (!activeTrip) {
    return (
      <EmptyState
        icon="📅"
        title="Chưa có chuyến đi nào"
        description="Vui lòng tạo hoặc chọn một chuyến đi để lập lịch trình chi tiết."
      />
    );
  }

  const daysList = Array.from({ length: Math.max(1, stats.totalDays) }, (_, i) => i + 1);

  // Get date for day number
  const getDateForDay = (dayNum: number): string => {
    if (!activeTrip.startDate) return '';
    const date = new Date(activeTrip.startDate);
    date.setDate(date.getDate() + (dayNum - 1));
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleOpenAdd = (dayNum?: number) => {
    setEditingActivity(null);
    setDayNumber(dayNum || selectedDay);
    setTime('09:00');
    setTitle('');
    setLocation(destinations[0]?.city || activeTrip.destination);
    setType('sightseeing');
    setNote('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: Activity) => {
    setEditingActivity(act);
    setDayNumber(act.dayNumber);
    setTime(act.time);
    setTitle(act.title);
    setLocation(act.location);
    setType(act.type);
    setNote(act.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time || !location.trim()) {
      showToast('⚠️ Vui lòng nhập đầy đủ giờ, hoạt động và địa điểm', 'warning');
      return;
    }

    const activityDate = getDateForDay(dayNumber);

    if (editingActivity) {
      updateActivity(editingActivity.id, {
        dayNumber,
        date: activityDate,
        time,
        title: title.trim(),
        location: location.trim(),
        type,
        note: note.trim() || undefined,
      });
    } else {
      addActivity({
        dayNumber,
        date: activityDate,
        time,
        title: title.trim(),
        location: location.trim(),
        type,
        note: note.trim() || undefined,
        isCompleted: false,
      });
    }
    setIsModalOpen(false);
  };

  const currentDayActivities = activities.filter((a) => a.dayNumber === selectedDay);

  // Find destination matching current day
  const currentStop = destinations.find((d) => {
    const dayDate = getDateForDay(selectedDay);
    return dayDate >= d.arrivalDate && dayDate <= d.departureDate;
  }) || destinations[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="hanko-stamp text-xs px-1.5 py-0.5">日程</span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Lịch trình theo từng ngày
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Biết rõ mình sẽ đi đâu, làm gì và thưởng thức món gì trong từng khung giờ
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd(selectedDay)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-medium rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hoạt động Ngày {selectedDay}</span>
        </button>
      </div>

      {/* Day Selector Tabs (horizontal scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {daysList.map((day) => {
          const isSelected = selectedDay === day;
          const dayDate = getDateForDay(day);
          const dayActs = activities.filter((a) => a.dayNumber === day);
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-medium shrink-0 transition-all text-left flex flex-col cursor-pointer ${
                isSelected
                  ? 'bg-[#1A2238] text-white border-[#1A2238] shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <span>Ngày {day}</span>
                {dayActs.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {dayActs.length}
                  </span>
                )}
              </div>
              <span className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                {formatDateDisplay(dayDate)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Day Header Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FCEBED] text-[#B83A2E] flex flex-col items-center justify-center font-bold">
            <span className="text-[10px] uppercase font-semibold leading-none">Day</span>
            <span className="text-xl font-mono leading-none">{selectedDay}</span>
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              NGÀY {selectedDay} – {currentStop?.city ? currentStop.city.toUpperCase() : activeTrip.destination.toUpperCase()}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{formatDateDisplay(getDateForDay(selectedDay))}</span>
              {currentStop && (
                <>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-600">{currentStop.name}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-500 hidden sm:block">
          <span className="font-mono font-bold text-stone-900">
            {currentDayActivities.filter((a) => a.isCompleted).length}/{currentDayActivities.length}
          </span>{' '}
          hoạt động hoàn tất
        </div>
      </div>

      {/* Activities Timeline / Table View */}
      {currentDayActivities.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-[#FAF8F5] text-stone-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Xong</th>
                  <th className="py-3.5 px-4 w-24">Thời gian</th>
                  <th className="py-3.5 px-4">Hoạt động</th>
                  <th className="py-3.5 px-4">Địa điểm</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Phân loại</th>
                  <th className="py-3.5 px-4 w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {currentDayActivities.map((act) => {
                  const typeObj = ACTIVITY_TYPES.find((t) => t.id === act.type);
                  return (
                    <tr
                      key={act.id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        act.isCompleted ? 'bg-stone-50/50' : ''
                      }`}
                    >
                      {/* Checkbox toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleActivityComplete(act.id)}
                          className="text-stone-400 hover:text-emerald-600 transition-colors p-1"
                          title="Đánh dấu hoàn thành"
                        >
                          {act.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300" />
                          )}
                        </button>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 font-mono font-bold text-stone-800 text-sm whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{act.time}</span>
                        </span>
                      </td>

                      {/* Activity Title & Note */}
                      <td className="py-3 px-4">
                        <div
                          className={`font-semibold text-stone-900 text-sm ${
                            act.isCompleted ? 'line-through text-stone-400' : ''
                          }`}
                        >
                          {act.title}
                        </div>
                        {act.note && (
                          <p className="text-stone-500 text-xs mt-0.5 max-w-md">{act.note}</p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-stone-700">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#B83A2E] shrink-0" />
                          <span>{act.location}</span>
                        </span>
                      </td>

                      {/* Type badge */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {typeObj?.icon}
                          <span>{typeObj?.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(act)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                            title="Sửa hoạt động"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(act.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100"
                            title="Xóa hoạt động"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title={`Chưa có lịch trình cho Ngày ${selectedDay}`}
          description="Hãy thêm hoạt động đầu tiên (ăn sáng, tham quan danh thắng, cà phê, dạo phố...) cho ngày này!"
          actionLabel={`Thêm hoạt động Ngày ${selectedDay}`}
          onAction={() => handleOpenAdd(selectedDay)}
        />
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-xl font-bold text-stone-900 mb-1">
              {editingActivity ? 'Chỉnh sửa hoạt động' : `Thêm hoạt động Ngày ${dayNumber}`}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Cập nhật mốc thời gian, tên công việc và địa điểm di chuyển
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Ngày số <span className="text-[#B83A2E]">*</span>
                  </label>
                  <select
                    value={dayNumber}
                    onChange={(e) => setDayNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs"
                  >
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        Ngày {d} ({formatDateDisplay(getDateForDay(d))})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Thời gian (Giờ:Phút) <span className="text-[#B83A2E]">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tên hoạt động <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Tham quan danh thắng, đi dạo phố cổ hoặc ăn tối"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Địa điểm <span className="text-[#B83A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: Khu phố cổ, quảng trường trung tâm hoặc bảo tàng"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-xs focus:outline-hidden focus:border-[#B83A2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Loại hoạt động
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVITY_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        type === t.id
                          ? 'border-[#B83A2E] bg-[#FCEBED] text-[#B83A2E]'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Ghi chú hoặc lời dặn
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Vé đã đặt trước, cần mang ô, lưu ý giờ mở cửa..."
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
                  {editingActivity ? 'Lưu thay đổi' : 'Thêm vào lịch trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Xóa hoạt động"
        message="Bạn có chắc chắn muốn xóa hoạt động này khỏi lịch trình không?"
        confirmLabel="Xóa hoạt động"
        onConfirm={() => {
          if (deleteTargetId) deleteActivity(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
