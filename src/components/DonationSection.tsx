import { Coffee, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DonationSection() {
  const [showQR, setShowQR] = useState(false);

  return (
    <section id="donasi" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900/95" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-6 py-3 mb-8">
            <Coffee className="text-purple-400" size={20} />
            <span className="text-purple-300 font-medium">Dukung Pengembang</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Aplikasi Ini Gratis Selamanya
          </h2>

          <p className="text-gray-400 text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Jika aplikasi ini membantu pekerjaan Anda dan menghemat waktu berjam-jam, Anda bisa mentraktir saya kopi sebagai bentuk apresiasi.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQR(!showQR)}
            className="group relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/50 transition-all max-w-md mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Donasi via QRIS</h3>
              <p className="text-gray-400">Scan QR Code untuk donasi</p>
            </div>
          </motion.button>

          <motion.div
            initial={false}
            animate={{
              height: showQR ? 'auto' : 0,
              opacity: showQR ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto mb-8 shadow-2xl">
              <img
                src="/image.png"
                alt="QRIS Code untuk Donasi"
                className="w-full h-auto rounded-lg"
              />
              <p className="text-gray-600 text-sm mt-4">Scan dengan aplikasi mobile banking atau e-wallet Anda</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
          >
            <p className="text-gray-400 leading-relaxed">
              <strong className="text-white">Catatan:</strong> Donasi bersifat sukarela dan tidak wajib. Aplikasi tetap gratis dan akan terus mendapat update tanpa biaya apapun.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
