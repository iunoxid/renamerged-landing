import { Download, Zap, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../config';
import DownloadCounter from './DownloadCounter';

interface HeroSectionProps {
  onDownloadClick: () => void;
}

export default function HeroSection({ onDownloadClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20" />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2"
            >
              <Zap className="text-purple-400" size={16} />
              <span className="text-purple-300 text-sm font-medium">100% Offline • 100% Gratis</span>
            </motion.div>

            <DownloadCounter />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Solusi Auto Rename & Merge Faktur Pajak Coretax
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-base sm:text-lg md:text-xl mb-8 leading-relaxed"
          >
            Kelola ribuan PDF faktur pajak tanpa internet. Data 100% aman di komputer Anda. Aplikasi Windows Gratis untuk produktivitas maksimal.
          </motion.p>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onDownloadClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-purple-600 to-blue-600 px-6 md:px-10 py-4 md:py-5 rounded-xl font-bold text-base md:text-xl text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-2xl shadow-purple-500/50"
              >
                <Download size={20} className="md:w-[26px] md:h-[26px]" />
                <span className="hidden sm:inline">Download Sekarang (Windows .exe)</span>
                <span className="sm:hidden">Download Sekarang</span>
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-sm italic mt-3 md:hidden"
            >
              Disarankan download melalui Laptop/PC Desktop
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">
                Kompatibel dengan Windows 10/11
              </p>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1">
                <Check className="text-gray-400" size={14} />
                <span className="text-gray-400 text-sm">File size: {APP_CONFIG.fileSize}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-green-400" size={18} />
              <span className="text-green-400 text-sm font-medium">100% Clean & Safe (Scanned by VirusTotal)</span>
            </div>
            <a
              href={APP_CONFIG.virusTotalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline inline-block transition-colors"
            >
              Lihat Bukti Scan
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-2xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400 text-xs ml-2">Renamerged.exe</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/20">
              <img
                src="/Screenshot 2025-11-26 084158.png"
                alt="Renamerged Application Interface"
                className="w-full h-auto"
              />
            </div>
          </div>

          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full w-32 h-32 blur-3xl opacity-50"
          />
        </motion.div>
      </div>
    </section>
  );
}
