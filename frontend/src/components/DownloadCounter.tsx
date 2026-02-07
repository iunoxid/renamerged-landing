import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function DownloadCounter() {
  const [downloads, setDownloads] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDownloadCount = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-download`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDownloads(data.downloads || 0);
        }
      } catch (error) {
        console.error('Failed to fetch download count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloadCount();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2"
      >
        <Download size={16} className="text-gray-400 animate-pulse" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </motion.div>
    );
  }

  if (downloads === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-full px-4 py-2"
    >
      <Download size={16} className="text-purple-400" />
      <span className="text-purple-300 text-sm font-medium">
        {downloads.toLocaleString('id-ID')} downloads
      </span>
    </motion.div>
  );
}
