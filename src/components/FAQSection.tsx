import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Apakah aplikasi ini benar-benar gratis?',
    answer: 'Ya, 100% Gratis untuk selamanya (Freeware). Tidak ada fitur berbayar. Dukungan dana hanya melalui donasi sukarela.',
  },
  {
    question: 'Apakah bisa dijalankan di MacOS atau HP?',
    answer: 'Saat ini Renamerged hanya tersedia khusus untuk sistem operasi Windows (10 dan 11).',
  },
  {
    question: 'Bagaimana cara update ke versi baru?',
    answer: 'Cukup kunjungi website ini lagi, download versi terbaru, dan jalankan. Settingan lama Anda tidak akan hilang.',
  },
  {
    question: 'Apakah data faktur saya aman?',
    answer: 'Sangat aman. Aplikasi bekerja offline tanpa internet. File PDF Anda tidak pernah keluar dari komputer Anda.',
  },
  {
    question: 'Apakah bisa untuk scan PDF dari kamera/scanner?',
    answer: 'TIDAK. Renamerged hanya support file PDF hasil download dari Coretax DJP. Tidak support scan PDF. Jika kesusahan mendapatkan Faktur Pajaknya, tinggal cari di Faktur Keluaran (sebagai penjual) atau Faktur Masukan (sebagai pembeli) di dashboard Coretax.',
  },
  {
    question: 'Berapa banyak file PDF yang bisa diproses sekaligus?',
    answer: 'Tidak ada batasan! Anda bisa memproses ratusan bahkan ribuan file PDF sekaligus. Kecepatan pemrosesan tergantung pada spesifikasi komputer Anda.',
  },
  {
    question: 'Bagaimana cara kerja fitur Merge PDF?',
    answer: 'Fitur Merge PDF menggabungkan semua file PDF dalam folder input menjadi satu file PDF besar. File akan digabung sesuai urutan nama file setelah di-rename. Sangat berguna untuk membuat arsip bulanan atau tahunan.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-850 to-slate-900" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
            FAQ - Cara Rename Faktur Pajak Coretax
          </h2>
          <p className="text-gray-400 text-lg">
            Pertanyaan seputar cara ubah nama faktur pajak sekaligus banyak file
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="text-purple-400" size={24} />
                  </motion.div>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-400 leading-relaxed mt-4 pt-4 border-t border-purple-500/10">
                    {faq.answer}
                  </p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-8"
        >
          <h3 className="text-xl font-semibold text-white mb-3">
            Masih ada pertanyaan?
          </h3>
          <p className="text-gray-400 mb-6">
            Jangan ragu untuk menghubungi kami melalui Telegram
          </p>
          <a
            href="https://t.me/iunoin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-blue-500/50"
          >
            Hubungi Kami di Telegram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
