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
  const [hovered, setHovered] = useState<DownloadData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

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
  const hasAnyDownloads = data.some(d => d.count > 0);
  const chartBounds = { left: 20, top: 20, width: 960, height: 220 };
  const points = data.map((d, i) => {
    const step = data.length > 1 ? chartBounds.width / (data.length - 1) : 0;
    const x = chartBounds.left + i * step;
    const y = chartBounds.top + chartBounds.height - (d.count / maxCount) * chartBounds.height;
    return { x, y, count: d.count, date: d.date };
  });

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
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            No data available
          </div>
        ) : !hasAnyDownloads ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            No downloads in this range
          </div>
        ) : (
          <div
            className="absolute inset-0"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setTooltipPos({ x, y });

              if (data.length > 0) {
                const scaleX = 1000 / rect.width;
                const svgX = x * scaleX;
                const relativeX = Math.max(chartBounds.left, Math.min(svgX, chartBounds.left + chartBounds.width));
                const idx = Math.round(
                  ((relativeX - chartBounds.left) / chartBounds.width) * (data.length - 1)
                );
                const clamped = Math.max(0, Math.min(data.length - 1, idx));
                setHovered(data[clamped]);
              }
            }}
            onMouseLeave={() => {
              setTooltipPos(null);
              setHovered(null);
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 1000 260" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((p) => (
                <line
                  key={p}
                  x1="0"
                  y1={20 + (1 - p) * 220}
                  x2="1000"
                  y2={20 + (1 - p) * 220}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                />
              ))}

              {(() => {
                const line = points.map((p) => `${p.x},${p.y}`).join(' ');
                const area = `${chartBounds.left},${chartBounds.top + chartBounds.height} ${line} ${chartBounds.left + chartBounds.width},${chartBounds.top + chartBounds.height}`;
                const hoveredPoint = hovered
                  ? points.find((p) => p.date === hovered.date)
                  : null;

                return (
                  <>
                    <polyline
                      fill="url(#lineFill)"
                      stroke="none"
                      points={area}
                    />
                    <polyline
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="3"
                      points={line}
                    />
                    {hoveredPoint && (
                      <>
                        <line
                          x1={hoveredPoint.x}
                          y1={chartBounds.top}
                          x2={hoveredPoint.x}
                          y2={chartBounds.top + chartBounds.height}
                          stroke="rgba(148, 163, 184, 0.4)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx={hoveredPoint.x}
                          cy={hoveredPoint.y}
                          r={6}
                          fill="rgba(34, 197, 94, 0.25)"
                        />
                        <circle
                          cx={hoveredPoint.x}
                          cy={hoveredPoint.y}
                          r={3}
                          fill="#22c55e"
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                      </>
                    )}
                    {points.map((p, i) => (
                      <circle
                        key={p.date}
                        cx={p.x}
                        cy={p.y}
                        r={i === points.length - 1 ? 4 : 3}
                        fill={i === points.length - 1 ? '#22c55e' : '#60a5fa'}
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
            {hovered && tooltipPos && (
              <div
                className="absolute bg-slate-900/90 border border-slate-700 rounded px-3 py-2 text-xs text-white pointer-events-none"
                style={{
                  left: Math.min(tooltipPos.x + 12, 860),
                  top: Math.max(tooltipPos.y - 40, 8),
                }}
              >
                <div className="font-semibold">{hovered.count} downloads</div>
                <div className="text-slate-400">{formatDate(hovered.date)}</div>
              </div>
            )}
          </div>
        )}

        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500 -ml-8">
          <span>{maxCount}</span>
          {maxCount > 1 && <span>{Math.floor(maxCount / 2)}</span>}
          <span>0</span>
        </div>
      </div>

      {data.length > 0 && (
        <div className="mt-2 grid grid-cols-7 gap-2 text-xs text-slate-400">
          {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).slice(0, 7).map((item) => (
            <div key={item.date} className="text-center">
              {formatDate(item.date)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
