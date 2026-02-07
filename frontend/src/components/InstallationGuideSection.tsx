import { AlertCircle, MousePointer, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '1',
    icon: AlertCircle,
    title: 'Peringatan Windows Muncul',
    description: 'Jika muncul layar biru "Windows protected your PC", jangan khawatir. Ini normal karena aplikasi belum memiliki digital signature.',
    color: 'from-yellow-600 to-orange-600',
    iconColor: 'text-yellow-400',
  },
  {
    number: '2',
    icon: MousePointer,
    title: 'Klik "More Info"',
    description: 'Cari dan klik tulisan kecil "More info" di bagian bawah layar peringatan Windows SmartScreen.',
    color: 'from-blue-600 to-cyan-600',
    iconColor: 'text-blue-400',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Klik "Run Anyway"',
    description: 'Setelah klik "More info", tombol "Run anyway" akan muncul. Klik tombol tersebut untuk menjalankan aplikasi. Aplikasi 100% aman dan berjalan offline.',
    color: 'from-green-600 to-emerald-600',
    iconColor: 'text-green-400',
  },
];

export default function InstallationGuideSection() {
  return (
    <section id="panduan" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-900/95" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-4">
            <Info className="text-blue-400" size={16} />
            <span className="text-blue-300 text-sm font-medium">Panduan Penting</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            Cara Mengatasi Peringatan Windows SmartScreen
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Windows SmartScreen mungkin menampilkan peringatan karena aplikasi ini belum memiliki digital signature. Ikuti 3 langkah mudah ini untuk menginstall aplikasi dengan aman.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all h-full">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50`}>
                    <step.icon className="text-white" size={24} />
                  </div>
                </div>

                <div className="text-center mt-6 mb-4">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-sm mb-4`}>
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                </div>

                <p className="text-gray-400 leading-relaxed text-center">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <Info className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-2">Mengapa Peringatan Ini Muncul?</h4>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Windows SmartScreen menampilkan peringatan untuk aplikasi yang belum memiliki digital signature dari Microsoft.
                  Digital signature membutuhkan biaya tahunan yang cukup besar (~USD $400/tahun). Karena aplikasi ini 100% gratis,
                  kami belum menggunakan digital signature untuk menjaga aplikasi tetap gratis untuk semua pengguna.
                </p>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Aplikasi sudah diverifikasi aman oleh 70+ antivirus di VirusTotal (0/72 deteksi)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Masih ada pertanyaan? Hubungi kami melalui tombol <span className="text-blue-400">"Hubungi Dev"</span> di menu atas.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
