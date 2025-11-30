import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useFAQ } from '../hooks/useFAQ';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { faqs, loading } = useFAQ();

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No FAQs available at the moment.
            </div>
          ) : (
            faqs.map((faq, index) => (
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
            ))
          )}
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
