import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Cloud,
  Sparkles,
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, showToast } = useTravel();
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
      console.error('Google Sign-In error:', err);
      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.');
      } else if (code === 'auth/cancelled-popup-request') {
        // User opened another popup, silent
      } else if (code === 'auth/network-request-failed') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn.');
      } else {
        setError(err.message || 'Không thể đăng nhập bằng tài khoản Google. Vui lòng thử lại.');
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
            Đăng nhập tài khoản
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto leading-relaxed">
            Kết nối với tài khoản Google để tự động đồng bộ và lưu trữ hành trình du lịch của bạn an toàn trên đám mây.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Action */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-800 text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 group"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span>{isLoading ? 'Đang kết nối Google...' : 'Tiếp tục với tài khoản Google'}</span>
          </button>
        </div>

        {/* Benefits Note */}
        <div className="mt-6 pt-5 border-t border-stone-200/80 text-[11px] text-stone-600 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tự động liên kết hành trình hiện tại trên máy vào tài khoản Google</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Lưu trữ vĩnh viễn trên cơ sở dữ liệu đám mây Cloud Firestore</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đồng bộ tức thì trên tất cả máy tính và điện thoại của bạn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
