export interface PriceData {
  date: string;
  price: number;
}

export type TimeRange = '10y' | '5y' | '3y' | '1y' | '6m';

export const formatNumber = (num: number): string => 
  Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const mean = (arr: number[]): number | null => 
  arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;

export const movingAverage = (values: number[], windowSize: number): (number | null)[] => {
  const result: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) result.push(null);
    else result.push(mean(values.slice(i - windowSize + 1, i + 1)));
  }
  return result;
};

// 產生模擬資料的函式
export const generateFallbackData = (): PriceData[] => {
  const result: PriceData[] = [];
  const start = new Date("2014-01-02");
  const today = new Date();
  let i = 0;

  while (start <= today) {
    const day = start.getDay();
    if (day !== 0 && day !== 6) {
      const t = i / 22;
      let price = 3950 + Math.sin(t) * 180 + Math.sin(t / 2.7) * 240 + Math.sin(t / 7.5) * 120 
                  + (i > 180 ? 220 : 0) + (i > 280 ? -260 : 0) + (i > 360 ? 140 : 0) 
                  + (i > 470 ? -180 : 0) + (i > 540 ? 260 : 0) + (Math.random() - 0.5) * 120;
      price = Math.max(3550, Math.min(5350, price));
      result.push({ date: start.toISOString().slice(0, 10), price: Number(price.toFixed(2)) });
      i++;
    }
    start.setDate(start.getDate() + 1);
  }
  
  const lastNudges = [35, 60, 88, 95, 120];
  lastNudges.forEach((nudge, j) => {
    const idx = result.length - 1 - j;
    if (idx >= 0) result[idx].price = Number((result[idx].price + nudge).toFixed(2));
  });

  return result;
};
