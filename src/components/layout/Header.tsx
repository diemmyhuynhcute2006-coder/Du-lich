import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import {
  Menu,
  Plus,
  Calendar,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  User as UserIcon,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenNewTripModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenNewTripModal,
}) => {
  const {
    activeTrip,
    stats,
    user,
    username,
    isSyncing,
    openAuthModal,
    logout,
  } = useTravel();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getInitials = (name?: string | null, uName?: string | null) => {
    if (name) {
      const parts = name.trim().split(' ');
      return parts[parts.length - 1][0].toUpperCase();
    }
    if (uName) return uName[0].toUpperCase();
    return 'U';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Zone 1: Mobile toggle + Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-stone-700 hover:text-stone-900 rounded-lg lg:hidden cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <span className="font-editorial text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Hành trình khám phá
          </span>
          <span className="hidden sm:inline-block text-xs font-serif text-[#B83A2E] font-semibold tracking-wider">
            旅の手帖
          </span>
        </div>
      </div>

      {/* Zone 2: Active Trip Summary Metadata (clean, unboxed text per constitution) */}
      {activeTrip ? (
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-600">
          <span className="font-semibold text-stone-800">{activeTrip.title}</span>
          <span aria-hidden="true" className="text-stone-400">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>
              {formatDate(activeTrip.startDate)} – {formatDate(activeTrip.endDate)}
            </span>
          </span>
          <span aria-hidden="true" className="text-stone-400">·</span>
          <span className="font-mono tabular-nums font-medium text-stone-700">
            {stats.totalDays} ngày {Math.max(0, stats.totalDays - 1)} đêm
          </span>
        </div>
      ) : (
        <div className="hidden md:block text-xs text-stone-500 italic">
          Chưa chọn chuyến đi
        </div>
      )}

      {/* Zone 3: Primary Action & User Account */}
      <div className="flex items-center gap-2.5">
        {/* Account Sync Status Indicator */}
        {user ? (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800"
            title={isSyncing ? 'Đang lưu dữ liệu hành trình...' : 'Dữ liệu đã được lưu trữ an toàn trong tài khoản'}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="font-medium">Đã lưu tài khoản</span>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Đăng ký hoặc đăng nhập để tạo dữ liệu hành trình riêng biệt"
          >
            <UserIcon className="w-3 h-3 text-amber-600" />
            <span>Chưa đăng nhập (Khách)</span>
          </button>
        )}

        {/* User Account / Login Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-stone-200/60 border border-stone-200 transition-colors cursor-pointer text-left"
              aria-label="Tài khoản"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-7 h-7 rounded-full object-cover border border-stone-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1A2238] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {getInitials(user.displayName, username)}
                </div>
              )}
              <div className="hidden lg:block">
                <span className="text-xs font-semibold text-stone-800 block leading-tight max-w-[120px] truncate">
                  {user.displayName || username || 'Người dùng'}
                </span>
                <span className="text-[10px] text-emerald-700 block leading-tight font-medium">
                  @{username || 'user'}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-stone-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {user.displayName || username || 'Người dùng'}
                    </p>
                    <p className="text-[11px] text-stone-500 font-mono truncate mt-0.5">
                      @{username || 'user'}
                    </p>
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-2 text-[11px] text-stone-600 flex items-center justify-between">
                      <span>Trạng thái lưu:</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Tài khoản riêng
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#B83A2E]" />
            <span>Đăng nhập / Đăng ký</span>
          </button>
        )}

        {/* Primary Action Button: Tạo chuyến đi */}
        <button
          onClick={onOpenNewTripModal}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium text-white bg-[#B83A2E] hover:bg-[#96291F] rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo chuyến đi</span>
        </button>
      </div>
    </header>
  );
};
