import { X, Download, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { APP_CONFIG } from '../config';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleDownload = async () => {
    if (isAgreed && recaptchaToken) {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-download`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to track download:', error);
      }

      window.open(APP_CONFIG.downloadUrl, '_blank');
      onClose();
      setIsAgreed(false);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const isDownloadEnabled = isAgreed && recaptchaToken;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 max-w-md w-full overflow-hidden mx-4"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />

            <div className="relative p-4 sm:p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="text-gray-400" size={20} />
              </button>

              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl">
                  <Download className="text-white" size={32} />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
                Download Renamerged
              </h3>
              <p className="text-sm sm:text-base text-gray-400 text-center mb-6 sm:mb-8">
                Version {APP_CONFIG.appVersion} untuk Windows 10/11
              </p>

              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <label className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors border border-transparent hover:border-purple-500/30">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-700 border-2 border-purple-500/30 checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer appearance-none"
                    />
                    {isAgreed && (
                      <CheckCircle className="absolute text-white pointer-events-none" size={20} />
                    )}
                  </div>
                  <span className="text-sm sm:text-base text-gray-300 flex-1 select-none">
                    Saya setuju menggunakan aplikasi ini untuk keperluan pribadi dan tidak akan memperjualbelikannya
                  </span>
                </label>

                <div className="flex justify-center p-2 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-x-auto">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    theme="dark"
                  />
                </div>
              </div>

              <motion.button
                whileHover={isDownloadEnabled ? { scale: 1.02 } : {}}
                whileTap={isDownloadEnabled ? { scale: 0.98 } : {}}
                onClick={handleDownload}
                disabled={!isDownloadEnabled}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base transition-all ${
                  isDownloadEnabled
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-slate-800/50 text-gray-400 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Download size={20} />
                {isDownloadEnabled ? 'Download Sekarang' : 'Selesaikan verifikasi untuk download'}
              </motion.button>

              <p className="text-gray-500 text-xs text-center mt-4">
                File size: {APP_CONFIG.fileSize} • Format: .exe • Kompatibel: Windows 10/11
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
