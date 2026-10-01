import React, { useState, useRef } from 'react';
import { useTravel } from '../../context/TravelContext';
import { Currency } from '../../types/travel';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Settings,
  Coins,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  BarChart3,
  Calendar,
  MapPin,
  Clock,
  Wallet,
  Luggage,
  CheckSquare,
  BookOpen,
  Info,
  Cloud,
  ShieldCheck,
  LogIn,
  LogOut,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    activeTrip,
    currency,
    setCurrency,
    stats,
    deleteTrip,
    resetToSampleData,
    clearAllData,
    formatCurrency,
    showToast,
    user,
    username,
    openAuthModal,
    logout,
    isSyncing,
  } = useTravel();

  const [isDeleteTripOpen, setIsDeleteTripOpen] = useState(false);
  const [isResetDataOpen, setIsResetDataOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        localStorageDump: {
          trips: localStorage.getItem('hanh_trinh_travel_app_v2_trips'),
          destinations: localStorage.getItem('hanh_trinh_travel_app_v2_destinations'),
          activities: localStorage.getItem('hanh_trinh_travel_app_v2_activities'),
          places: localStorage.getItem('hanh_trinh_travel_app_v2_places'),
          expenses: localStorage.getItem('hanh_trinh_travel_app_v2_expenses'),
          luggage: localStorage.getItem('hanh_trinh_travel_app_v2_luggage'),
          prepTasks: localStorage.getItem('hanh_trinh_travel_app_v2_prepTasks'),
          journals: localStorage.getItem('hanh_trinh_travel_app_v2_journals'),
        },
      };
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hanh-trinh-du-lich-${activeTrip?.title || 'backup'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✅ Đã xuất dữ liệu chuyến đi thành file JSON');
    } catch (e) {
      showToast('⚠️ Không thể xuất dữ liệu', 'warning');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json?.localStorageDump) {
          const dump = json.localStorageDump;
          if (dump.trips) localStorage.setItem('hanh_trinh_travel_app_v2_trips', dump.trips);
          if (dump.destinations) localStorage.setItem('hanh_trinh_travel_app_v2_destinations', dump.destinations);
          if (dump.activities) localStorage.setItem('hanh_trinh_travel_app_v2_activities', dump.activities);
          if (dump.places) localStorage.setItem('hanh_trinh_travel_app_v2_places', dump.places);
          if (dump.expenses) localStorage.setItem('hanh_trinh_travel_app_v2_expenses', dump.expenses);
          if (dump.luggage) localStorage.setItem('hanh_trinh_travel_app_v2_luggage', dump.luggage);
          if (dump.prepTasks) localStorage.setItem('hanh_trinh_travel_app_v2_prepTasks', dump.prepTasks);
          if (dump.journals) localStorage.setItem('hanh_trinh_travel_app_v2_journals', dump.journals);
          window.location.reload();
        }
      } catch (err) {
        showToast('⚠️ File dữ liệu không đúng định dạng', 'warning');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Tab Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <span className="hanko-stamp text-xs px-1.5 py-0.5">設定</span>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            Thống kê & Cài đặt hệ thống
          </h2>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Xem tổng quan số liệu thống kê, tùy chỉnh đơn vị tiền tệ và sao lưu dữ liệu
        </p>
      </div>

      {/* Section: Tài khoản & Dữ liệu riêng biệt */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B83A2E]" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Tài khoản & Dữ liệu riêng biệt
            </h3>
          </div>
          {user && (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tài khoản đã kích hoạt</span>
            </span>
          )}
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-stone-200">
            <div className="flex items-center gap-3 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#B83A2E]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#1A2238] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {(user.displayName || username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-stone-900 truncate">
                  {user.displayName || username || 'Tài khoản người dùng'}
                </h4>
                <p className="text-xs text-stone-500 font-mono truncate">Tài khoản: @{username}</p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium mt-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Dữ liệu hành trình được lưu trữ độc lập theo tài khoản</span>
                  {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600 ml-1" />}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Bạn đang sử dụng chế độ Khách</span>
              </div>
              <p className="text-xs text-amber-800 mt-1 max-w-xl leading-relaxed">
                Đăng ký một tài khoản riêng (chỉ cần Tên tài khoản và Mật khẩu) để lưu giữ hành trình riêng biệt, không bị ảnh hưởng khi có người khác sử dụng cùng trình duyệt.
              </p>
            </div>
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập / Đăng ký</span>
            </button>
          </div>
        )}
      </div>

      {/* Section XIX: Thống kê chuyến đi tổng thể */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <BarChart3 className="w-5 h-5 text-[#B83A2E]" />
          <h3 className="font-editorial text-lg font-bold text-stone-900">
            Tổng quan số liệu thống kê ({activeTrip?.title || 'Chuyến đi'})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tổng số ngày</span>
            </div>
            <div className="font-mono text-xl font-bold text-stone-900">
              {stats.totalDays} ngày
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Địa điểm tham quan</span>
            </div>
            <div className="font-mono text-xl font-bold text-stone-900">
              {stats.placeCount} địa điểm
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Số hoạt động</span>
            </div>
            <div className="font-mono text-xl font-bold text-stone-900">
              {stats.activityCount} hoạt động
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>Bài viết nhật ký</span>
            </div>
            <div className="font-mono text-xl font-bold text-stone-900">
              {stats.journalCount} bài viết
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tổng ngân sách</span>
            </div>
            <div className="font-mono text-base font-bold text-stone-900 truncate">
              {formatCurrency(stats.totalBudget)}
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Wallet className="w-3.5 h-3.5 text-[#B83A2E]" />
              <span>Chi phí đã sử dụng</span>
            </div>
            <div className="font-mono text-base font-bold text-[#B83A2E] truncate">
              {formatCurrency(stats.totalSpent)}
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <Luggage className="w-3.5 h-3.5 text-amber-600" />
              <span>Tiến độ hành lý</span>
            </div>
            <div className="font-mono text-xl font-bold text-stone-900">
              {stats.luggagePercentage}% ({stats.luggagePacked}/{stats.luggageTotal})
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiến độ công việc</span>
            </div>
            <div className="font-mono text-xl font-bold text-stone-900">
              {stats.prepPercentage}% ({stats.prepCompleted}/{stats.prepTotal})
            </div>
          </div>
        </div>
      </div>

      {/* Section XX: Đơn vị tiền tệ */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Coins className="w-5 h-5 text-amber-500" />
          <h3 className="font-editorial text-lg font-bold text-stone-900">
            Đơn vị tiền tệ hiển thị
          </h3>
        </div>

        <p className="text-xs text-stone-500">
          Chọn đơn vị tiền tệ phù hợp cho bảng tính ngân sách và chi tiêu của bạn
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {(['VND', 'JPY', 'USD'] as Currency[]).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                currency === curr
                  ? 'border-[#B83A2E] bg-[#FCEBED] text-[#B83A2E] shadow-xs'
                  : 'border-stone-200 bg-[#FAF8F5] text-stone-700 hover:border-stone-400'
              }`}
            >
              <div>{curr}</div>
              <div className="text-[10px] font-normal text-stone-500 mt-0.5">
                {curr === 'VND' ? 'Việt Nam Đồng (đ)' : curr === 'JPY' ? 'Yên Nhật (¥)' : 'Đô la Mỹ ($)'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Settings className="w-5 h-5 text-stone-700" />
          <h3 className="font-editorial text-lg font-bold text-stone-900">
            Quản lý dữ liệu & Sao lưu
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-stone-600" />
                <span>Sao lưu xuất file JSON</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Tải toàn bộ hành trình, lịch trình, danh sách hành lý và nhật ký về máy của bạn.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A2238] text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors cursor-pointer self-start"
            >
              <span>Xuất dữ liệu</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-stone-600" />
                <span>Phục hồi từ file JSON</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Nhập lại file sao lưu JSON trước đó để tiếp tục theo dõi chuyến đi.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 text-stone-800 text-xs font-medium rounded-lg hover:bg-stone-100 transition-colors cursor-pointer self-start"
              >
                <span>Tải file lên</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dangerous Operations */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Vùng nguy hiểm
          </h4>

          <div className="flex flex-wrap items-center gap-3">
            {activeTrip && (
              <button
                onClick={() => setIsDeleteTripOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa chuyến đi hiện tại</span>
              </button>
            )}

            <button
              onClick={() => setIsResetDataOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 border border-stone-200 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu mẫu Nhật Bản</span>
            </button>

            <button
              onClick={() => setIsClearAllOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-500 hover:text-rose-700 transition-colors cursor-pointer ml-auto"
            >
              <span>Xóa sạch toàn bộ dữ liệu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Current Trip Confirmation (Section XX.4: “Bạn có chắc chắn muốn xóa chuyến đi này không?”) */}
      <ConfirmModal
        isOpen={isDeleteTripOpen}
        title="Xác nhận xóa chuyến đi"
        message="Bạn có chắc chắn muốn xóa chuyến đi này không? Mọi thông tin lịch trình, điểm đến, chi phí và nhật ký liên quan sẽ bị xóa hoàn toàn."
        confirmLabel="Xóa chuyến đi"
        onConfirm={() => {
          if (activeTrip) deleteTrip(activeTrip.id);
          setIsDeleteTripOpen(false);
        }}
        onClose={() => setIsDeleteTripOpen(false)}
      />

      {/* Reset Data Confirmation */}
      <ConfirmModal
        isOpen={isResetDataOpen}
        title="Khôi phục dữ liệu mẫu"
        message="Bạn có muốn tải lại chuyến đi mẫu Nhật Bản 2027 với đầy đủ lịch trình Tokyo - Kyoto - Osaka không?"
        confirmLabel="Khôi phục mẫu"
        isDestructive={false}
        onConfirm={() => {
          resetToSampleData();
          setIsResetDataOpen(false);
        }}
        onClose={() => setIsResetDataOpen(false)}
      />

      {/* Clear All Confirmation */}
      <ConfirmModal
        isOpen={isClearAllOpen}
        title="Xóa toàn bộ dữ liệu"
        message="Bạn có chắc chắn muốn xóa sạch toàn bộ các chuyến đi và dữ liệu đã lưu trong trình duyệt không?"
        confirmLabel="Xóa toàn bộ"
        onConfirm={() => {
          clearAllData();
          setIsClearAllOpen(false);
        }}
        onClose={() => setIsClearAllOpen(false)}
      />
    </div>
  );
};
