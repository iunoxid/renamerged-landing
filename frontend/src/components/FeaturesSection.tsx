import { Shield, Zap, Merge, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Shield,
    title: '100% Offline & Aman',
    description: 'Data tidak pernah diunggah ke cloud atau internet. Semua proses dilakukan di komputer Anda. Privasi dan keamanan data faktur pajak terjamin sepenuhnya.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Coretax Ready',
    description: 'Mendukung format file dari sistem Coretax terbaru DJP. Aplikasi rename faktur pajak yang terus diperbarui mengikuti regulasi terkini.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Merge,
    title: 'Smart Rename & Merge',
    description: 'Otomatis ganti nama file berdasarkan isi faktur (Nomor, Tanggal, Nama Lawan). Gabung PDF faktur otomatis jika Lawan Transaksi sama.',
    color: 'from-purple-500 to-blue-500',
  },
  {
    icon: SlidersHorizontal,
    title: 'Drag & Drop Customization',
    description: 'Atur format nama file sesuka hati dengan sistem drag & drop intuitif. Scan PDF faktur pajak dan ekstrak data secara otomatis.',
    color: 'from-blue-500 to-purple-500',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/90" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            Fitur Unggulan
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            Tools Coretax Indonesia yang dirancang khusus untuk Admin Pajak, Akuntan, dan Staff Finance
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />

              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 sm:p-8 h-full hover:border-purple-500/40 transition-all">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="text-white" size={28} />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>

                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
