import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { EmptyState } from '../common/EmptyState';
import {
  Calendar,
  MapPin,
  Wallet,
  Luggage,
  CheckSquare,
  ArrowRight,
  Compass,
  Camera,
  X,
  Upload,
} from 'lucide-react';
import { ImagePicker } from '../common/ImagePicker';
import { GLOBAL_PRESET_COVERS } from '../../data/sampleTrip';
import { resolveValidImageUrl, handleImageError } from '../../utils/imageUtils';

interface HomeTabProps {
  onOpenNewTripModal: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onOpenNewTripModal }) => {
  const {
    activeTrip,
    destinations,
    stats,
    setActiveTab,
    formatCurrency,
    updateTrip,
  } = useTravel();

  const [isEditCoverOpen, setIsEditCoverOpen] = useState(false);
  const [newCover, setNewCover] = useState<string | undefined>(activeTrip?.coverImage);

  if (!activeTrip) {
    return (
      <EmptyState
        icon="🗾"
        title="Bạn chưa tạo chuyến đi nào"
        description="Hãy bắt đầu xây dựng hành trình đầu tiên của mình! Lên kế hoạch, sắp xếp đồ đạc và lưu giữ kỷ niệm khó quên."
        actionLabel="Tạo chuyến đi"
        onAction={onOpenNewTripModal}
      />
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const nights = Math.max(0, stats.totalDays - 1);

  const handleOpenEditCover = () => {
    setNewCover(activeTrip.coverImage || '');
    setIsEditCoverOpen(true);
  };

  const handleSaveCover = () => {
    updateTrip(activeTrip.id, {
      coverImage: newCover || '',
    });
    setIsEditCoverOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <section className="group relative rounded-2xl overflow-hidden shadow-sm border border-stone-200/80 bg-stone-900 min-h-[260px] sm:min-h-[310px] flex flex-col justify-end p-6 sm:p-8">
        {activeTrip.coverImage ? (
          <img
            src={resolveValidImageUrl(activeTrip.coverImage)}
            alt={activeTrip.title}
            className="absolute inset-0 w-full h-full object-cover opacity-65 transition-transform duration-500 group-hover:scale-[1.01]"
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e)}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#1A2238] via-[#242D45] to-[#121724]">
            {/* Elegant washi geometric pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-stone-950/90 via-stone-950/45 to-transparent" />

        {/* Change Cover Photo Button */}
        <button
          onClick={handleOpenEditCover}
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/70 hover:bg-stone-900 text-stone-200 hover:text-white text-xs backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-md"
          title="Tải ảnh bìa mới từ thiết bị hoặc chỉnh sửa ảnh"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{activeTrip.coverImage ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span>
        </button>

        <div className="relative z-10 max-w-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="hanko-stamp text-[10px] sm:text-xs px-2 py-0.5 border-white text-white">
              旅の手帖
            </span>
            <span className="text-xs tracking-wider uppercase text-stone-300 font-medium">
              Sổ tay du lịch cá nhân
            </span>
          </div>

          <h2 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
            {activeTrip.title}
          </h2>

          <p className="text-sm sm:text-base text-stone-200 font-medium mb-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-white font-semibold">
              <MapPin className="w-4 h-4 text-[#FCEBED]" />
              {activeTrip.destination}
            </span>
            {destinations.length > 0 && (
              <>
                <span className="text-stone-400">·</span>
                <span className="text-[#FCEBED] font-normal">
                  {destinations.map((d) => d.city).join(' → ')}
                </span>
              </>
            )}
          </p>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-300 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FCEBED]" />
              <span>
                {formatDate(activeTrip.startDate)} – {formatDate(activeTrip.endDate)}
              </span>
            </span>
            <span className="text-stone-500">·</span>
            <span className="font-mono tabular-nums font-semibold text-white">
              {stats.totalDays} ngày {nights} đêm
            </span>
          </div>
        </div>
      </section>

      {/* Edit Cover Photo Modal */}
      {isEditCoverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsEditCoverOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-lg font-bold text-stone-900 mb-1">
              Ảnh bìa chuyến đi
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Tải ảnh từ máy ảnh hoặc thư viện thiết bị của bạn
            </p>

            <ImagePicker
              value={newCover}
              onChange={setNewCover}
              label="Tải ảnh bìa"
              helperText="Ưu tiên ảnh thực tế từ chuyến đi của bạn"
              aspectRatio="wide"
              presets={GLOBAL_PRESET_COVERS}
            />

            <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditCoverOpen(false)}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCover}
                className="px-5 py-2 text-xs font-medium text-white bg-[#B83A2E] hover:bg-[#96291F] rounded-lg transition-colors cursor-pointer"
              >
                Lưu ảnh bìa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Phases Flow Bar */}
      <section className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Hành trình 4 giai đoạn
          </h3>
          <span className="text-xs text-stone-400">Từ ý tưởng đến kỷ niệm</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('route')}
            className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] hover:border-[#B83A2E] text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-[#B83A2E] mb-1 flex items-center justify-between">
              <span>01. Lên kế hoạch</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-stone-600">Tạo chuyến đi & xây dựng lộ trình các điểm đến</p>
          </button>

          <button
            onClick={() => setActiveTab('prep')}
            className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] hover:border-[#B83A2E] text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
              <span>02. Chuẩn bị</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-stone-600">Lịch trình, ngân sách, hành lý & công việc</p>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] hover:border-[#B83A2E] text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
              <span>03. Trải nghiệm</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-stone-600">Theo dõi lịch trình thực tế & cập nhật chi tiêu</p>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] hover:border-[#B83A2E] text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
              <span>04. Lưu giữ</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[11px] text-stone-600">Viết nhật ký, ảnh kỷ niệm & cảm nhận cá nhân</p>
          </button>
        </div>
      </section>

      {/* Overview Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Spots */}
        <div
          onClick={() => setActiveTab('places')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs hover:border-stone-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Địa điểm</span>
            <MapPin className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {stats.placeCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {destinations.length} chặng dừng
          </p>
        </div>

        {/* Metric 2: Days */}
        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs hover:border-stone-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Thời gian</span>
            <Calendar className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {stats.totalDays}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.activityCount} hoạt động
          </p>
        </div>

        {/* Metric 3: Budget */}
        <div
          onClick={() => setActiveTab('budget')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs hover:border-stone-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Ngân sách</span>
            <Wallet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-lg font-bold text-stone-900 tabular-nums truncate" title={formatCurrency(stats.totalBudget)}>
            {formatCurrency(stats.totalBudget)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            Đã chi: {formatCurrency(stats.totalSpent)}
          </p>
        </div>

        {/* Metric 4: Luggage */}
        <div
          onClick={() => setActiveTab('luggage')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs hover:border-stone-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Hành lý</span>
            <Luggage className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {stats.luggagePercentage}%
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.luggagePacked}/{stats.luggageTotal} món đồ
          </p>
        </div>

        {/* Metric 5: Prep checklist */}
        <div
          onClick={() => setActiveTab('prep')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs hover:border-stone-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Việc chuẩn bị</span>
            <CheckSquare className="w-4 h-4 text-[#B83A2E] group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-2xl font-bold text-stone-900 tabular-nums">
            {stats.prepPercentage}%
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.prepCompleted}/{stats.prepTotal} công việc
          </p>
        </div>
      </section>

      {/* Progress Bars */}
      <section className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Tiến độ sẵn sàng cho chuyến đi
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Được tính toán dựa trên mức độ hoàn thành công việc và sắp xếp hành lý
            </p>
          </div>
          <span className="font-mono text-xl font-bold text-[#B83A2E]">
            {stats.overallPrepProgress}%
          </span>
        </div>

        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden mb-6 p-0.5">
          <div
            className="h-full bg-linear-to-r from-[#B83A2E] via-[#D3524B] to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${stats.overallPrepProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#B83A2E]" />
                Việc chuẩn bị ({stats.prepCompleted}/{stats.prepTotal})
              </span>
              <span className="font-mono font-semibold">{stats.prepPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B83A2E] rounded-full transition-all duration-300"
                style={{ width: `${stats.prepPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-stone-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-amber-600" />
                Hành lý đóng gói ({stats.luggagePacked}/{stats.luggageTotal})
              </span>
              <span className="font-mono font-semibold">{stats.luggagePercentage}%</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${stats.luggagePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Route & Destination Sneak Peek */}
      <section className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#B83A2E]" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Lộ trình di chuyển
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('route')}
            className="text-xs font-medium text-[#B83A2E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Quản lý hành trình</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {destinations.map((stop, idx) => (
              <div
                key={stop.id}
                className="border border-stone-200 rounded-xl overflow-hidden bg-[#FAF8F5] flex flex-col justify-between"
              >
                {stop.image ? (
                  <div className="h-32 w-full overflow-hidden relative">
                    <img
                      src={stop.image}
                      alt={stop.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-[#1A2238]/80 text-white text-[11px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                      Chặng {idx + 1}
                    </div>
                  </div>
                ) : (
                  <div className="h-16 w-full bg-stone-200/60 flex items-center px-3 text-stone-400 text-xs">
                    <span className="font-mono">Chặng {idx + 1}</span>
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-editorial font-bold text-base text-stone-900">
                      {stop.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {formatDate(stop.arrivalDate)} – {formatDate(stop.departureDate)}
                    </p>
                    {stop.highlights && stop.highlights.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {stop.highlights.slice(0, 3).map((h, i) => (
                          <span
                            key={i}
                            className="text-[11px] text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="mt-3 text-left text-xs text-[#B83A2E] hover:underline font-medium cursor-pointer"
                  >
                    Xem lịch trình →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-stone-500 bg-[#FAF8F5] rounded-xl border border-dashed border-stone-300">
            <p>Chưa có chặng dừng chân nào trong hành trình này.</p>
            <button
              onClick={() => setActiveTab('route')}
              className="mt-2 text-[#B83A2E] hover:underline font-medium"
            >
              + Thêm điểm đến đầu tiên
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
