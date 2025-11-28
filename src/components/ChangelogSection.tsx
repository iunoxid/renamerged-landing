import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Wrench, Calendar, ChevronDown } from 'lucide-react';

interface ChangelogVersion {
  version: string;
  date: string;
  penambahan: string[];
  perubahan: string[];
  perbaikan: string[];
}

interface ChangelogData {
  versions: ChangelogVersion[];
}

export default function ChangelogSection() {
  const [changelog, setChangelog] = useState<ChangelogData | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['3.0.0']));
  const [showAllVersions, setShowAllVersions] = useState(false);

  const INITIAL_VISIBLE_COUNT = 3;

  useEffect(() => {
    fetch('/changelog.json')
      .then((res) => res.json())
      .then((data) => setChangelog(data))
      .catch((err) => console.error('Error loading changelog:', err));
  }, []);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  if (!changelog) {
    return null;
  }

  const initialVersions = changelog.versions.slice(0, INITIAL_VISIBLE_COUNT);
  const olderVersions = changelog.versions.slice(INITIAL_VISIBLE_COUNT);
  const hasMoreVersions = olderVersions.length > 0;

  return (
    <section id="changelog" className="py-20 bg-gradient-to-br from-blue-50 via-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 pb-1 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            Changelog
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Riwayat pembaruan dan perbaikan aplikasi Renamerged
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
          {initialVersions.map((version, index) => {
            const isExpanded = expandedVersions.has(version.version);
            const hasContent =
              version.penambahan.length > 0 ||
              version.perubahan.length > 0 ||
              version.perbaikan.length > 0;

            return (
              <div
                key={version.version}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              >
                <button
                  onClick={() => toggleVersion(version.version)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg">
                      v{version.version}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} />
                      <span className="text-sm">{version.date}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-6">
                    {version.penambahan.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Plus className="text-green-600" size={20} />
                          <h3 className="font-semibold text-gray-800">Penambahan</h3>
                        </div>
                        <ul className="space-y-2 ml-7 list-disc list-outside marker:text-green-600">
                          {version.penambahan.map((item, i) => (
                            <li key={i} className="text-gray-600 pl-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {version.perubahan.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <RefreshCw className="text-blue-600" size={20} />
                          <h3 className="font-semibold text-gray-800">Perubahan</h3>
                        </div>
                        <ul className="space-y-2 ml-7 list-disc list-outside marker:text-blue-600">
                          {version.perubahan.map((item, i) => (
                            <li key={i} className="text-gray-600 pl-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {version.perbaikan.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="text-orange-600" size={20} />
                          <h3 className="font-semibold text-gray-800">Perbaikan</h3>
                        </div>
                        <ul className="space-y-2 ml-7 list-disc list-outside marker:text-orange-600">
                          {version.perbaikan.map((item, i) => (
                            <li key={i} className="text-gray-600 pl-2">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!hasContent && (
                      <p className="text-gray-500 italic text-center py-4">
                        Tidak ada perubahan pada versi ini
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}

          <motion.div
            initial={false}
            animate={{
              height: showAllVersions ? 'auto' : 0,
              opacity: showAllVersions ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden mt-6"
          >
            <div className="space-y-6">
              {olderVersions.map((version) => {
                const isExpanded = expandedVersions.has(version.version);
                const hasContent =
                  version.penambahan.length > 0 ||
                  version.perubahan.length > 0 ||
                  version.perbaikan.length > 0;

                return (
                  <div
                    key={version.version}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <button
                      onClick={() => toggleVersion(version.version)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg">
                          v{version.version}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={18} />
                          <span className="text-sm">{version.date}</span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </motion.div>
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? 'auto' : 0,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-6">
                        {version.penambahan.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Plus className="text-green-600" size={20} />
                              <h3 className="font-semibold text-gray-800">Penambahan</h3>
                            </div>
                            <ul className="space-y-2 ml-7 list-disc list-outside marker:text-green-600">
                              {version.penambahan.map((item, i) => (
                                <li key={i} className="text-gray-600 pl-2">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {version.perubahan.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <RefreshCw className="text-blue-600" size={20} />
                              <h3 className="font-semibold text-gray-800">Perubahan</h3>
                            </div>
                            <ul className="space-y-2 ml-7 list-disc list-outside marker:text-blue-600">
                              {version.perubahan.map((item, i) => (
                                <li key={i} className="text-gray-600 pl-2">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {version.perbaikan.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Wrench className="text-orange-600" size={20} />
                              <h3 className="font-semibold text-gray-800">Perbaikan</h3>
                            </div>
                            <ul className="space-y-2 ml-7 list-disc list-outside marker:text-orange-600">
                              {version.perbaikan.map((item, i) => (
                                <li key={i} className="text-gray-600 pl-2">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {!hasContent && (
                          <p className="text-gray-500 italic text-center py-4">
                            Tidak ada perubahan pada versi ini
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          </div>

          {hasMoreVersions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center pt-4"
            >
              <button
                onClick={() => setShowAllVersions(!showAllVersions)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <span className="font-medium">
                  {showAllVersions ? 'Sembunyikan Changelog Lama' : 'Lihat Changelog Lama'}
                </span>
                <motion.div
                  animate={{ rotate: showAllVersions ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
