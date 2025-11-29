import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppConfig } from '../hooks/useAppConfig';

interface NavbarProps {
  onDownloadClick: () => void;
}

export default function Navbar({ onDownloadClick }: NavbarProps) {
  const { config } = useAppConfig();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <img
              src="/assets/logo/favicon-96x96.png"
              alt="Renamerged Logo"
              className="w-8 h-8 mt-1.5"
            />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent leading-normal pb-0.5">
                Renamerged
              </span>
              <span className="text-xs text-gray-500 leading-none">v{config.appVersion}</span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              Fitur
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              Cara Kerja
            </button>
            <button
              onClick={() => scrollToSection('keamanan')}
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              Keamanan
            </button>
            <button
              onClick={() => scrollToSection('donasi')}
              className="text-gray-300 hover:text-purple-400 transition-colors"
            >
              Donasi
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownloadClick}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 rounded-lg font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/50"
            >
              <Download size={18} />
              Download Versi Terbaru
            </motion.button>
          </div>

          <button
            onClick={onDownloadClick}
            className="md:hidden flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg font-semibold text-white text-sm"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
