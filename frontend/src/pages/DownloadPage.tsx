import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { getAppConfig } from '../config';

interface DownloadVersion {
  id: string;
  version: string;
  file_name: string;
  architecture: '32-bit' | '64-bit';
  download_url: string;
  sort_order: number;
  is_active: boolean;
}

interface DownloadBatch {
  version: string;
  items: DownloadVersion[];
}

async function buildFallbackDownloads(): Promise<DownloadVersion[]> {
  const config = await getAppConfig();
  return [
    {
      id: 'fallback-x64',
      version: config.appVersion,
      file_name: `Renamerged-v${config.appVersion}-win-x64.zip`,
      architecture: '64-bit',
      download_url: config.downloadUrl,
      sort_order: 1,
      is_active: true,
    },
  ];
}

export default function DownloadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<DownloadVersion[]>([]);
  const [batches, setBatches] = useState<DownloadBatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gateToken = searchParams.get('gate');
    if (!gateToken) {
      navigate('/', { replace: true });
      return;
    }

    async function loadDownloads() {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-catalog`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'X-Download-Gate': gateToken,
          },
        });

        let payload: any = null;
        try {
          payload = await response.json();
        } catch {
          // ignore parse error
        }

        if (!response.ok) {
          throw new Error(payload?.error || payload?.message || 'Akses daftar download tidak valid atau expired');
        }

        const rows = (payload?.data || []) as DownloadVersion[];
        if (rows.length > 0) {
          setDownloads(rows);
        } else {
          setDownloads(await buildFallbackDownloads());
        }
      } catch (err) {
        console.error('Failed to load download versions:', err);
        setDownloads([]);
        setError((err as Error).message || 'Gagal memuat daftar download');
      } finally {
        setLoading(false);
      }
    }

    loadDownloads();
  }, [navigate, searchParams]);

  useEffect(() => {
    const grouped = new Map<string, DownloadBatch>();

    for (const item of downloads) {
      const existing = grouped.get(item.version);
      if (!existing) {
        grouped.set(item.version, {
          version: item.version,
          items: [item],
        });
      } else {
        existing.items.push(item);
      }
    }

    const nextBatches = Array.from(grouped.values()).map((batch) => ({
      ...batch,
      items: batch.items.sort((a, b) => {
        if (a.architecture === b.architecture) return a.file_name.localeCompare(b.file_name);
        return a.architecture === '64-bit' ? -1 : 1;
      }),
    }));

    setBatches(nextBatches);
  }, [downloads]);

  const handleDownload = async (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-download`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Failed to track download:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">Menyiapkan halaman download...</p>
          <p className="text-sm text-slate-400 mt-2">Validasi akses sedang diproses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800">
            <h1 className="text-2xl font-bold">Download Renamerged</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Pilih versi file yang ingin Anda unduh (Windows 10/11)
            </p>
          </div>

          <div className="px-6 py-4 bg-blue-500/10 border-b border-blue-500/20 flex items-start gap-3">
            <ShieldCheck className="text-blue-400 mt-0.5" size={18} />
            <p className="text-sm text-blue-200">
              Halaman ini menggunakan akses sementara setelah verifikasi. Jika halaman tidak bisa dibuka lagi, kembali ke beranda lalu klik tombol download.
            </p>
          </div>

          {error && (
            <div className="px-6 py-3 text-sm text-amber-200 bg-amber-500/10 border-b border-amber-500/20">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="p-6 space-y-4">
              {batches.length === 0 ? (
                <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
                  Tidak ada versi download aktif saat ini.
                </div>
              ) : (
                batches.map((batch) => (
                  <div
                    key={batch.version}
                    className="rounded-xl border border-slate-700 bg-slate-950/40 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Version {batch.version}</h3>
                      <span className="text-xs text-slate-400">{batch.items.length} varian</span>
                    </div>

                    <div className="p-4 space-y-3">
                      {batch.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <button
                            onClick={() => handleDownload(item.download_url)}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200 text-left"
                          >
                            {item.file_name}
                            <ExternalLink size={15} />
                          </button>
                          <span className="inline-flex w-fit px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                            {item.architecture}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-slate-300 underline"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
