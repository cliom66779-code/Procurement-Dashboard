
import { useState, useEffect, useMemo } from 'react';
import { type PriceData, type TimeRange } from '../utils/formatters';

// 定義支援的品項
export type CommodityId = 'palm-oil' | 'soybeans' | 'wheat' | 'sugar';

const GITHUB_RAW = 'https://raw.githubusercontent.com/cliom66779-code/Procurement-Dashboard/main/public/data';

export const COMMODITIES_CONFIG: Record<CommodityId, { label: string, file: string, unit: string }> = {
  'palm-oil': { label: '棕櫚油', file: 'palm_oil_prices.json', unit: 'MYR/TONNE' },
  'soybeans': { label: '黃豆', file: 'soybeans_prices.json', unit: 'USd/bu' },
  'wheat': { label: '小麥', file: 'wheat_prices.json', unit: 'USd/bu' },
  'sugar': { label: '糖', file: 'sugar_prices.json', unit: 'USd/lb' },
};

export const useCommodityData = (commodityId: CommodityId, range: TimeRange) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [source, setSource] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(true);

  const config = COMMODITIES_CONFIG[commodityId];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${GITHUB_RAW}/${config.file}?t=${new Date().getTime()}`);
        if (!res.ok) throw new Error("API Fetch failed");
        const raw = await res.json();
        
        const validData = raw
          .filter((d: any) => d.date && !Number.isNaN(Number(d.price)))
          .map((d: any) => ({ date: d.date, price: Number(d.price) }))
          .sort((a: PriceData, b: PriceData) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setData(validData);
        setSource("Trading Economics");
      } catch (err) {
        console.error(`Failed to load ${commodityId} data:`, err);
        setData([]);
        setSource("Error loading data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [commodityId, config.file]);

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const lastDate = new Date(data[data.length - 1].date);
    const startDate = new Date(lastDate);
    
    if (range === '6m') startDate.setMonth(startDate.getMonth() - 6);
    else if (range === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    else if (range === '5y') startDate.setFullYear(startDate.getFullYear() - 5);
    else if (range === '10y') startDate.setFullYear(startDate.getFullYear() - 10);
    else startDate.setFullYear(startDate.getFullYear() - 3);

    return data.filter(d => new Date(d.date) >= startDate);
  }, [data, range]);

  return { filteredData, source, isLoading, unit: config.unit, label: config.label };
};
