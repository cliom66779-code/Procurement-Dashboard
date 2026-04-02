import React, { useEffect, useRef } from 'react';

interface ChartCardProps {
  dates: string[];
  prices: number[];
  ma30: (number | null)[];
  title: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ dates, prices, ma30, title }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-expect-error - Plotly is loaded via CDN globally
    if (chartRef.current && typeof window !== 'undefined' && window.Plotly) {
      const tracePrice = {
        x: dates,
        y: prices,
        type: 'scatter',
        mode: 'lines',
        name: '價格',
        line: { color: '#2563eb', width: 3 },
        hovertemplate: "日期：%{x}<br>價格：%{y:,.2f} MYR/TONNE<extra></extra>"
      };

      const traceMA30 = {
        x: dates,
        y: ma30,
        type: 'scatter',
        mode: 'lines',
        name: '30MA',
        line: { color: '#ef4444', width: 2.2 },
        hovertemplate: "日期：%{x}<br>30MA：%{y:,.2f}<extra></extra>"
      };

      const layout = {
        autosize: true,
        margin: { l: 50, r: 20, t: 10, b: 40 },
        hovermode: "x unified",
        showlegend: false,
        xaxis: { tickfont: { color: "#64748b" }, gridcolor: "rgba(0,0,0,0)" },
        yaxis: { tickfont: { color: "#64748b" }, gridcolor: "#ea580c10", tickformat: ",.0f" }
      };

      const config = { displayModeBar: false, responsive: true };

      // @ts-expect-error - Plotly typing fallback
      window.Plotly.newPlot(chartRef.current, [tracePrice, traceMA30], layout, config);
    }
  }, [dates, prices, ma30]);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 mt-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      <div ref={chartRef} className="w-full h-[400px] md:h-[470px]"></div>
      <div className="mt-4 text-xs text-slate-500">
        KPI 僅為行情觀察燈號：以最新價格相對 30 日均價之偏離幅度顯示。
      </div>
    </div>
  );
};
