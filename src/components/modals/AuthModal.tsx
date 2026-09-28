import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    showToast,
  } = useTravel();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      showToast('Đăng nhập thành công với tài khoản Google!', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setError(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, name.trim());
        showToast('Tạo tài khoản thành công! Dữ liệu đã được liên kết.', 'success');
      } else {
        await signInWithEmail(email.trim(), password);
        showToast('Đăng nhập thành công! Đang tải hành trình của bạn.', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Địa chỉ email không đúng định dạng.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Tính năng đăng nhập email chưa được bật trên Firebase Console. Bạn có thể dùng nút Đăng nhập bằng Google bên dưới!');
      } else {
        setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
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
            {mode === 'signin' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
            Lưu trữ hành trình, chặng đi, chi tiêu và kỷ niệm an toàn trên đám mây, khôi phục mọi lúc mọi nơi.
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-xl bg-stone-200/70 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
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
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Google One-Click Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-800 text-sm font-medium rounded-xl border border-stone-300 shadow-xs transition-colors cursor-pointer mb-5 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Tiếp tục với Google (Nhanh nhất)</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-stone-300 w-full" />
          <span className="bg-[#FAF8F5] px-3 text-[11px] text-stone-500 uppercase tracking-wider font-medium">
            Hoặc bằng email
          </span>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in">
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Tên của bạn
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Minh Anh"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B83A2E]/20 focus:border-[#B83A2E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#B83A2E] hover:bg-[#9E2F25] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
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
            <span>Tự động đồng bộ và sao lưu dữ liệu mọi lúc</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Mỗi người dùng có dữ liệu riêng tư, an toàn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
