import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, MapPin, Monitor, Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface DownloadLog {
  id: string;
  downloaded_at: string;
  ip_hash: string | null;
  user_agent: string | null;
}

const ITEMS_PER_PAGE = 10;

export default function RecentDownloads() {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadRecentDownloads();
  }, [page]);

  const loadRecentDownloads = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { count } = await supabase
        .from('download_logs')
        .select('*', { count: 'exact', head: true });

      const { data, error } = await supabase
        .from('download_logs')
        .select('*')
        .order('downloaded_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setTotalCount(count || 0);
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading recent downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown' };

    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return { browser, os };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const maskIP = (hash: string | null) => {
    if (!hash) return 'Unknown';
    return `${hash.substring(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Download className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold text-white">Recent Downloads</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Page {page} of {totalPages} ({totalCount} total downloads)
          </p>
        </div>

        <button
          onClick={loadRecentDownloads}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className="text-slate-300" />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No downloads recorded yet.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">IP Hash</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Browser</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">OS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const { browser, os } = parseUserAgent(log.user_agent);
                  const isRecent = new Date().getTime() - new Date(log.downloaded_at).getTime() < 300000;

                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                        isRecent ? 'bg-green-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-sm text-white">
                            {formatDate(log.downloaded_at)}
                          </span>
                          {isRecent && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-300 font-mono">
                            {maskIP(log.ip_hash)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Monitor size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-300">{browser}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-300">{os}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-lg transition-colors"
                title="Previous"
              >
                <ChevronLeft size={18} />
              </button>

              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`dots-${index}`} className="px-3 py-2 text-slate-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum as number)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-lg transition-colors"
                title="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
