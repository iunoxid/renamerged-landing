import { Shield, ShieldCheck, Lock, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityTransparencySection() {

  return (
    <section id="keamanan" className="relative py-24 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-850 to-slate-900/90" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Transparansi Keamanan
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Kami menjunjung tinggi transparansi. File aplikasi telah dipindai oleh 70+ antivirus global dan dinyatakan bersih dari Malware/Trojan.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">VirusTotal Verified</h3>
                  <p className="text-green-400 font-medium">0/72 Deteksi Malware</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-grow">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-green-400 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Dipindai oleh 70+ Vendor Antivirus</h4>
                    <p className="text-gray-400 text-sm">Termasuk Microsoft, Kaspersky, Avast, BitDefender, Norton, dan vendor terpercaya lainnya.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="text-green-400 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-white font-semibold mb-1">100% Offline & Private</h4>
                    <p className="text-gray-400 text-sm">Tidak ada koneksi internet, tidak ada pengiriman data. Semua proses di komputer Anda.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-green-400 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-white font-semibold mb-1">No Hidden Scripts</h4>
                    <p className="text-gray-400 text-sm">Kode program bersih, tidak ada script injeksi atau aktivitas latar belakang yang mencurigakan.</p>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href="https://www.virustotal.com/gui/file/659ee926078262e08fedc9c6744ba37ebf03580bf203b332609f094d6fc0d162/detection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold text-white transition-colors mb-4"
                >
                  <Shield size={20} />
                  Lihat Hasil Scan Langsung (VirusTotal)
                </a>

                <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-4 mt-4">
                  <p className="text-gray-500 text-sm leading-relaxed">
                    <span className="font-semibold text-gray-400">Note:</span> Deteksi minor (1-2 vendor) adalah False Positive umum pada aplikasi baru. Vendor keamanan utama (Microsoft, Google, Kaspersky, BitDefender) menyatakan aplikasi ini 100% AMAN.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
