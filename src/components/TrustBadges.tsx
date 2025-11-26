import { Shield, Award, Monitor, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  {
    icon: Monitor,
    title: 'Windows Compatible',
    subtitle: '10/11',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Shield,
    title: 'Security Verified',
    subtitle: 'VirusTotal Clean',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: MapPin,
    title: 'Made in Indonesia',
    subtitle: 'Bangga Karya Lokal',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Award,
    title: '100% Free',
    subtitle: 'No Hidden Cost',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function TrustBadges() {
  return (
    <section className="relative py-12 sm:py-16 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-20 rounded-xl sm:rounded-2xl blur-lg group-hover:opacity-30 transition-all`} />

              <div className="relative bg-slate-800/70 backdrop-blur-sm border-2 border-slate-700/50 group-hover:border-slate-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all">
                <div className={`inline-flex p-3 sm:p-4 rounded-xl bg-gradient-to-br ${badge.color} mb-2 sm:mb-3 shadow-lg`}>
                  <badge.icon className="text-white" size={24} />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                  {badge.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-400">
                  {badge.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
