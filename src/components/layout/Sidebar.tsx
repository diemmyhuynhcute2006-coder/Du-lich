import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { ActiveTab } from '../../types/travel';
import {
  Home,
  MapPin,
  Calendar,
  Compass,
  Wallet,
  Luggage,
  CheckSquare,
  BookOpen,
  Settings,
  Plus,
  ChevronDown,
  LogIn,
  LogOut,
  Cloud,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  onOpenNewTripModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
  onOpenNewTripModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    trips,
    activeTripId,
    setActiveTripId,
    activeTrip,
    stats,
    user,
    username,
    openAuthModal,
    logout,
  } = useTravel();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: '1. Trang chủ', icon: <Home className="w-4 h-4" /> },
    { id: 'route', label: '2. Hành trình', icon: <Compass className="w-4 h-4" />, badge: stats.destinationCount > 0 ? stats.destinationCount : undefined },
    { id: 'schedule', label: '3. Lịch trình', icon: <Calendar className="w-4 h-4" />, badge: stats.activityCount > 0 ? stats.activityCount : undefined },
    { id: 'places', label: '4. Địa điểm', icon: <MapPin className="w-4 h-4" />, badge: stats.placeCount > 0 ? stats.placeCount : undefined },
    { id: 'budget', label: '5. Ngân sách', icon: <Wallet className="w-4 h-4" /> },
    { id: 'luggage', label: '6. Hành lý', icon: <Luggage className="w-4 h-4" />, badge: `${stats.luggagePacked}/${stats.luggageTotal}` },
    { id: 'prep', label: '7. Việc chuẩn bị', icon: <CheckSquare className="w-4 h-4" />, badge: `${stats.prepCompleted}/${stats.prepTotal}` },
    { id: 'journal', label: '8. Nhật ký', icon: <BookOpen className="w-4 h-4" />, badge: stats.journalCount > 0 ? stats.journalCount : undefined },
    { id: 'settings', label: '9. Cài đặt', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#1A2238] text-stone-100 flex flex-col border-r border-[#263353] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#263353]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#B83A2E] font-bold text-xl shadow-xs select-none">
              旅
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-editorial text-base font-bold text-stone-100 tracking-tight leading-tight truncate">
                Hành Trình
              </h1>
              <p className="text-[11px] text-stone-400 tracking-wider">
                Khám phá vùng đất mới
              </p>
            </div>
          </div>

          {/* Active Trip Selector / Switcher */}
          <div className="mt-4 pt-3 border-t border-[#263353]/50">
            <div className="text-[10px] uppercase font-semibold text-stone-400 mb-1.5 flex items-center justify-between">
              <span>Chuyến đi hiện tại</span>
              <button
                onClick={onOpenNewTripModal}
                className="text-[11px] text-[#E87A88] hover:text-white flex items-center gap-1 transition-colors"
                title="Tạo chuyến đi mới"
              >
                <Plus className="w-3 h-3" />
                <span>Mới</span>
              </button>
            </div>

            {trips.length > 0 ? (
              <div className="relative">
                <select
                  value={activeTripId || ''}
                  onChange={(e) => setActiveTripId(e.target.value)}
                  className="w-full appearance-none bg-[#232D48] text-stone-200 text-xs rounded-lg px-3 py-2 pr-8 border border-[#2e3b5e] hover:border-stone-500 focus:outline-hidden focus:border-[#B83A2E] truncate transition-colors cursor-pointer"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#1A2238] text-stone-200">
                      {t.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            ) : (
              <button
                onClick={onOpenNewTripModal}
                className="w-full text-left text-xs text-stone-400 bg-[#232D48] px-3 py-2 rounded-lg border border-dashed border-stone-600 hover:text-white hover:border-stone-400 transition-colors"
              >
                + Bấm để tạo chuyến đi đầu tiên
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#B83A2E] text-white shadow-xs'
                    : 'text-stone-300 hover:bg-[#232D48] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={isActive ? 'text-white' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono tabular-nums ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-[#232D48] text-stone-300 border border-[#2e3b5e]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Trip Preparation Progress Bar widget */}
        {activeTrip && (
          <div className="p-4 mx-3 mb-4 rounded-xl bg-[#232D48]/80 border border-[#2e3b5e]">
            <div className="flex items-center justify-between text-xs text-stone-300 mb-2">
              <span className="font-medium">Chuẩn bị chuyến đi</span>
              <span className="font-mono font-bold text-stone-100">{stats.overallPrepProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#1A2238] rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#B83A2E] to-[#E87A88] transition-all duration-300 rounded-full"
                style={{ width: `${stats.overallPrepProgress}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
              <span>Hành lý: {stats.luggagePacked}/{stats.luggageTotal}</span>
              <span>Việc: {stats.prepCompleted}/{stats.prepTotal}</span>
            </div>
          </div>
        )}

        {/* User Account / Cloud Sync Widget in Sidebar */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-[#232D48] border border-[#2e3b5e]">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-stone-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#B83A2E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {(user.displayName || username || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-200 truncate leading-tight">
                    {user.displayName || username || 'Người dùng'}
                  </p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 leading-tight mt-0.5">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>@{username || 'user'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-[#1A2238] rounded-lg transition-colors cursor-pointer shrink-0"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#B83A2E] hover:bg-[#96291F] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập / Đăng ký</span>
            </button>
          )}
        </div>

        {/* Footer brand stamp */}
        <div className="px-5 py-3 border-t border-[#263353]/80 flex items-center justify-between text-[11px] text-stone-400">
          <span>Sổ tay du lịch cá nhân</span>
          <span className="font-serif text-[#B83A2E] font-bold text-xs">令和</span>
        </div>
      </aside>
    </>
  );
};
