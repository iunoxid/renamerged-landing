import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Calendar, Download } from 'lucide-react';

interface DownloadData {
  date: string;
  count: number;
}

interface TimeRange {
  label: string;
  days: number;
}

const timeRanges: TimeRange[] = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

export default function DownloadChart() {
  const [data, setData] = useState<DownloadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[0]);
  const [totalDownloads, setTotalDownloads] = useState(0);

  useEffect(() => {
    loadData();
  }, [selectedRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedRange.days);

      const { data: logs, error } = await supabase
        .from('download_logs')
        .select('downloaded_at')
        .gte('downloaded_at', startDate.toISOString())
        .order('downloaded_at', { ascending: true });

      if (error) throw error;

      const groupedData: { [key: string]: number } = {};

      for (let i = 0; i < selectedRange.days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - selectedRange.days + i + 1);
        const dateStr = date.toISOString().split('T')[0];
        groupedData[dateStr] = 0;
      }

      logs?.forEach((log) => {
        const dateStr = new Date(log.downloaded_at).toISOString().split('T')[0];
        if (groupedData[dateStr] !== undefined) {
          groupedData[dateStr]++;
        }
      });

      const chartData = Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
      }));

      setData(chartData);
      setTotalDownloads(logs?.length || 0);
    } catch (error) {
      console.error('Error loading download data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold text-white">Download Statistics</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">Track downloads over time</p>
        </div>

        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.days}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedRange.days === range.days
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Download size={16} />
            <span>Total Downloads</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalDownloads}</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp size={16} />
            <span>Average/Day</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {totalDownloads > 0 ? (totalDownloads / selectedRange.days).toFixed(1) : '0.0'}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Calendar size={16} />
            <span>Peak Day</span>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {data.length > 0 ? Math.max(...data.map(d => d.count)) : 0}
          </p>
        </div>
      </div>

      <div className="relative h-64 mt-8">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isToday = item.date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center gap-2 group relative"
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isToday
                      ? 'bg-green-500 hover:bg-green-400'
                      : 'bg-blue-500 hover:bg-blue-400'
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="font-bold">{item.count} downloads</div>
                    <div className="text-slate-400">{formatDate(item.date)}</div>
                  </div>
                </div>

                {(index % Math.ceil(data.length / 7) === 0 || isToday) && (
                  <span className="text-xs text-slate-400 rotate-0">
                    {formatDate(item.date)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 -ml-8">
          <span>{maxCount}</span>
          {maxCount > 1 && <span>{Math.floor(maxCount / 2)}</span>}
          <span>0</span>
        </div>
      </div>
    </div>
  );
}
