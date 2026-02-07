import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecuritySection() {
  return (
    <section id="security" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900 to-slate-900/95" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            Keamanan & Lisensi
          </h2>
          <p className="text-base sm:text-lg text-gray-400 px-4">
            Transparansi dan kepercayaan adalah prioritas kami
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="text-green-400" size={28} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  100% Freeware
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Aplikasi ini gratis untuk digunakan selamanya, tanpa biaya tersembunyi, tanpa iklan, tanpa batasan fitur.
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                <CheckCircle size={18} />
                <span>Tidak ada registrasi atau login</span>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                <CheckCircle size={18} />
                <span>Tidak ada batasan jumlah file</span>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base">
                <CheckCircle size={18} />
                <span>Gratis untuk penggunaan pribadi</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Lock className="text-purple-400" size={28} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Closed Source
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Untuk melindungi hak kekayaan intelektual, source code aplikasi ini tidak dipublikasikan.
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <div className="flex items-center gap-2 text-purple-400 text-sm sm:text-base">
                <Lock size={18} />
                <span>Melindungi inovasi dan teknologi</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-sm sm:text-base">
                <Lock size={18} />
                <span>Mencegah penyalahgunaan</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-sm sm:text-base">
                <Lock size={18} />
                <span>Menjamin kualitas dan keamanan</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/30 backdrop-blur-sm border border-amber-500/50 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl flex-shrink-0">
              <AlertCircle className="text-amber-500" size={28} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Larangan Penting
              </h3>
              <p className="text-sm sm:text-lg text-gray-200 leading-relaxed mb-4">
                Aplikasi ini <strong className="text-amber-400">DILARANG KERAS</strong> untuk diperjualbelikan, didistribusikan ulang dengan tujuan komersial, atau dimodifikasi tanpa izin.
              </p>
              <p className="text-gray-400">
                Silakan bagikan link website ini kepada teman atau rekan kerja yang membutuhkan. Dukungan Anda sangat berarti untuk pengembangan aplikasi ini.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
