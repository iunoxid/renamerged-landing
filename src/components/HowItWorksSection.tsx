import { FolderOpen, Settings, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    icon: FolderOpen,
    title: 'Pilih Folder Input',
    description: 'Browse atau paste path folder yang berisi PDF faktur pajak hasil download dari Coretax. Bisa ratusan file sekaligus.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Atur Mode & Format',
    description: 'Pilih mode (Rename Saja/Merge PDF) dan format penamaan: Nama Lawan - Tanggal - Referensi - Nomor Faktur. Folder Output otomatis dibuat atau custom sesuai kebutuhan.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Proses & Selesai',
    description: 'Klik Mulai Proses. Aplikasi akan scan PDF, rename otomatis sesuai format, dan gabung file (jika mode Merge) dalam hitungan detik. Hasil tersimpan di folder Output.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-850 to-slate-900/95" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            Cara Kerja
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            Hanya 3 langkah sederhana untuk menghemat waktu Anda berjam-jam
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-stretch gap-8 md:gap-0">
          {steps.map((step, index) => (
            <>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group flex-1"
              >
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8 hover:border-purple-500/50 transition-all duration-300 h-full hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                  <div className="absolute -top-6 sm:-top-8 left-6 sm:left-8">
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-all"
                      >
                        <step.icon className="text-white" size={20} />
                      </motion.div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 sm:mt-12">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all">
                      {step.title}
                    </h3>

                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/0 to-blue-600/0 group-hover:from-purple-600/20 group-hover:via-purple-500/20 group-hover:to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center flex-shrink-0 w-12">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  >
                    <ArrowRight className="text-purple-400" size={32} strokeWidth={3} />
                  </motion.div>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
