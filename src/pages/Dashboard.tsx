
import React, { useState, useMemo, useEffect } from 'react';
import { useCommodityData, type CommodityId, COMMODITIES_CONFIG } from '../hooks/useCommodityData';
import { type TimeRange, formatNumber, movingAverage, mean, type PriceData } from '../utils/formatters';
import { MetricCard } from '../components/MetricCard';
import { ChartCard } from '../components/ChartCard';
import { ExternalLink, Database, Clock, RefreshCw, BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RANGES: { key: TimeRange; label: string }[] = [
  { key: '10y', label: '10年' },
  { key: '5y', label: '5年' },
  { key: '3y', label: '3年' },
  { key: '1y', label: '1年' },
  { key: '6m', label: '6月' },
];

export const Dashboard: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('3y');
  const [activeCommodity, setActiveCommodity] = useState<CommodityId>('palm-oil');
  const [lastSync, setLastSync] = useState<string>('檢索中...');

  // 10y 用於計算背景大序列，range 用於前端切割顯示
  const { filteredData: rawAllData, source, isLoading, unit, label } = useCommodityData(activeCommodity, '10y' as TimeRange);

  useEffect(() => {
    fetch('/data/sync_meta.json')
      .then(r => r.json())
      .then(json => setLastSync(json.lastUpdated))
      .catch(() => setLastSync('手動本地模式'));
  }, [isLoading]);

  const metrics = useMemo(() => {
    // 雖然 TS 目前能從 Hook 推斷，但這裡我們強制宣告類別防止編譯錯誤
    const allData: PriceData[] = rawAllData;
    if (!allData || !allData.length) return null;

    const allPrices = allData.map(d => d.price);
    const allMA30 = movingAverage(allPrices, 30);
    
    const lastDate = new Date(allData[allData.length - 1].date);
    const startDate = new Date(lastDate);
    if (range === '6m') startDate.setMonth(startDate.getMonth() - 6);
    else if (range === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else if (range === '5y') startDate.setFullYear(startDate.getFullYear() - 5);
    else if (range === '10y') startDate.setFullYear(startDate.getFullYear() - 10);
    else startDate.setFullYear(startDate.getFullYear() - 3);

    const filteredPoints = allData.map((d, i) => ({
      date: d.date, price: d.price, ma30: allMA30[i]
    })).filter(p => new Date(p.date) >= startDate);

    const prices = filteredPoints.map(p => p.price);
    const dates = filteredPoints.map(p => p.date);
    const ma30Series = filteredPoints.map(p => p.ma30);

    const latestPrice = prices[prices.length - 1];
    const prevPrice = prices.length > 1 ? prices[prices.length - 2] : latestPrice;
    
    const avg7 = mean(prices.slice(-7));
    const avg30 = mean(prices.slice(-30));

    const dailyDiff = Number((latestPrice - prevPrice).toFixed(2));
    const dailyPct = prevPrice ? Number(((dailyDiff / prevPrice) * 100).toFixed(2)) : 0;
    const diffMA30Pct = avg30 ? Number((((latestPrice - avg30) / avg30) * 100).toFixed(2)) : 0;
    
    let kpiPill: 'default' | 'success' | 'warning' | 'danger' = 'warning';
    let kpiText = `接近 30MA ${diffMA30Pct}%`;
    if (diffMA30Pct >= 5) {
      kpiPill = 'danger'; kpiText = `高於 30MA ${diffMA30Pct}%`;
    } else if (diffMA30Pct <= -5) {
      kpiPill = 'success'; kpiText = `低於 30MA ${Math.abs(diffMA30Pct)}%`;
    }

    return {
      latestPrice, avg7, avg30, dailyDiff, dailyPct, diffMA30Pct, dates, prices, ma30Series, kpiPill, kpiText
    };
  }, [rawAllData, range]);

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 px-4 py-6 md:px-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg ring-1 ring-blue-400/30">
                    <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Markets <span className="text-blue-500">Live</span>
                  </h1>
                </div>
            </div>
            
            <div className="flex items-center gap-4 text-[11px] font-black tracking-widest text-slate-400 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 self-start md:self-center">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                數據最後更新於：<span className="text-blue-200">{lastSync}</span>
            </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row gap-2 overflow-hidden ring-1 ring-white/5">
            <div className="flex-1 flex gap-2 p-1">
                {(Object.keys(COMMODITIES_CONFIG) as CommodityId[]).map((id) => (
                    <button 
                        key={id} 
                        onClick={() => setActiveCommodity(id)} 
                        className={`flex-1 min-w-0 px-4 py-3.5 rounded-[1.4rem] text-sm font-bold transition-all duration-500 truncate ${activeCommodity === id ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
                    >
                        {COMMODITIES_CONFIG[id].label}
                    </button>
                ))}
            </div>
            <div className="bg-white/10 w-px h-10 self-center hidden md:block"></div>
            <div className="flex-1 flex gap-1 p-1 bg-black/20 rounded-[1.6rem] m-1">
                {RANGES.map((r) => (
                    <button 
                        key={r.key} 
                        onClick={() => setRange(r.key)} 
                        className={`flex-1 px-3 py-2.5 rounded-2xl text-[11px] font-black transition-all ${range === r.key ? 'bg-white text-blue-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard 
              label={`當前結算價 (${unit})`} 
              value={formatNumber(metrics.latestPrice)} 
              pillText={metrics.diffMA30Pct >= 0 ? `高於 30MA ${metrics.diffMA30Pct}%` : `低於 30MA ${Math.abs(metrics.diffMA30Pct)}%`}
              pillVariant={metrics.diffMA30Pct > 0 ? 'success' : 'danger'}
            />
            <MetricCard 
              label="今日漲跌幅" 
              value={`${metrics.dailyDiff > 0 ? '+' : ''}${formatNumber(metrics.dailyDiff)}`}
              subValue={(
                <div className="flex items-center">
                    {metrics.dailyDiff > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : metrics.dailyDiff < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-1" /> : <Minus className="w-3.5 h-3.5 mr-1" />}
                    {metrics.dailyDiff > 0 ? '+' : ''}{metrics.dailyPct}%
                </div>
              )}
              subValueColor={metrics.dailyDiff > 0 ? 'text-rose-500' : metrics.dailyDiff < 0 ? 'text-emerald-500' : 'text-slate-500'}
              pillText={metrics.dailyPct > 0 ? "BULLISH" : metrics.dailyPct < 0 ? "BEARISH" : "STABLE"}
              pillVariant={metrics.dailyPct > 0 ? 'danger' : metrics.dailyPct < 0 ? 'success' : 'default'}
            />
            <MetricCard label="7D 動態均價" value={formatNumber(metrics.avg7 || 0)} pillText="滾動 7 交易日" />
            <MetricCard label="30D 動態均價" value={formatNumber(metrics.avg30 || 0)} pillText="滾動 30 交易日" />
             
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.08] ring-1 ring-white/5">
                <div className="text-[11px] font-black text-slate-500 self-start w-full tracking-[0.2em] uppercase mb-1">Status (30MA)</div>
                <div className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-700 group-hover:scale-110 ${
                  metrics.kpiPill === 'danger' ? 'bg-gradient-to-tr from-rose-600 to-rose-400' :
                  metrics.kpiPill === 'success' ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400' :
                  'bg-gradient-to-tr from-amber-500 to-amber-300'
                }`}>
                    <div className="absolute inset-0 rounded-full animate-ping bg-inherit opacity-20"></div>
                </div>
                <span className="text-[11px] font-black text-white/90 uppercase bg-black/40 px-3 py-1 rounded-full border border-white/10">{metrics.kpiText}</span>
            </div>
          </div>
        )}

        {metrics && (
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-4 md:p-10 border border-white/10 shadow-3xl overflow-hidden ring-1 ring-white/10">
              <div className="mb-8 flex items-center justify-between">
                 <div className="flex flex-col">
                    <h2 className="text-xl font-black text-white tracking-tight">{label} 指標與 30MA 動態趨勢</h2>
                 </div>
                 <RefreshCw className="w-5 h-5 text-slate-600 animate-[spin_8s_linear_infinite]" />
              </div>
              <div className="w-full">
                <ChartCard dates={metrics.dates} prices={metrics.prices} ma30={metrics.ma30Series} title="" />
              </div>
          </div>
        )}

        <footer className="mt-12 text-center text-[10px] font-black tracking-[0.4em] text-slate-700 uppercase pt-8 border-t border-white/5">
            Advanced Analytics · Phase 1 Finalized
        </footer>
      </div>
    </main>
  );
};
