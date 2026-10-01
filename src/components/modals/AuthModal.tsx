import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import { validateUsername } from '../../services/localAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithUsername,
    signUpWithUsername,
    showToast,
  } = useTravel();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically sanitize: trim whitespace, keep lower/upper letters, digits, and underscores
    const raw = e.target.value.replace(/\s+/g, '');
    setUsername(raw);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate username format
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      setError(usernameValidation.error || 'Tên tài khoản không hợp lệ');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithUsername(username, password, displayName);
        showToast(`Tạo tài khoản ${username} thành công! Hành trình đã được liên kết.`, 'success');
      } else {
        await signInWithUsername(username, password);
        showToast(`Đăng nhập thành công! Đang tải hành trình của bạn.`, 'success');
      }
      onClose();
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#B83A2E]/10 border border-[#B83A2E]/20 text-[#B83A2E] flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            {mode === 'signin' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản'}
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
            {mode === 'signin'
              ? 'Nhập tên tài khoản và mật khẩu để tiếp tục quản lý hành trình du lịch.'
              : 'Tạo tài khoản riêng biệt để lưu trữ vĩnh viễn và đồng bộ dữ liệu trên đám mây.'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl bg-stone-200/70 p-1 mb-5">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Username & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tên tài khoản (Username) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Tên tài khoản
              </label>
              <span className="text-[10px] text-stone-400 font-mono">3–20 ký tự</span>
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Ví dụ: diemmy2006, travel_lover"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E] font-medium"
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Chỉ dùng chữ cái không dấu, số và gạch dưới (_), không khoảng trắng.
            </p>
          </div>

          {/* Họ tên hiển thị (Chỉ hiện khi Đăng ký, tùy chọn) */}
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Tên hiển thị <span className="text-stone-400 font-normal">(tùy chọn)</span>
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Diễm My"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E]"
                />
              </div>
            </div>
          )}

          {/* Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Mật khẩu
              </label>
              <span className="text-[10px] text-stone-400 font-mono">Tối thiểu 6 ký tự</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu (Chỉ hiện khi Đăng ký) */}
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Xác nhận lại mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E]"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#B83A2E] hover:bg-[#9E2F25] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký tài khoản</span>
              </>
            )}
          </button>
        </form>

        {/* Cloud feature perks note */}
        <div className="mt-5 pt-4 border-t border-stone-200/80 text-[11px] text-stone-500 space-y-1.5">
          <div className="flex items-center gap-1.5 text-stone-600">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Mỗi người dùng có một cơ sở dữ liệu riêng tư và an toàn</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tự động liên kết hành trình hiện tại trên máy vào tài khoản mới</span>
          </div>
        </div>
      </div>
    </div>
  );
};
