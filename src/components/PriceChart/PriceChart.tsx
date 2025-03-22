import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { binanceWebSocket } from '../../services/binanceWebSocket';
import styles from './PriceChart.module.scss';

interface PriceChartProps {
  symbol: string;
}

interface DataPoint {
  timestamp: string;
  price: number;
}

const MAX_DATA_POINTS = 50;

export const PriceChart: React.FC<PriceChartProps> = ({ symbol }) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const addDataPoint = useCallback((price: number) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();

    setDataPoints(prevPoints => {
      const newPoints = [...prevPoints, { timestamp, price }];
      if (newPoints.length > MAX_DATA_POINTS) {
        return newPoints.slice(-MAX_DATA_POINTS);
      }
      return newPoints;
    });
  }, []);

  useEffect(() => {
    setDataPoints([]); 
    
    const unsubscribe = binanceWebSocket.subscribe((updatedSymbol, price, change24h) => {
      if (updatedSymbol === symbol) {
        setCurrentPrice(price);
        addDataPoint(price);
      }
    });

    return () => unsubscribe();
  }, [symbol, addDataPoint]);

  const minPrice = Math.min(...dataPoints.map(p => p.price)) * 0.9995;
  const maxPrice = Math.max(...dataPoints.map(p => p.price)) * 1.0005;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.priceHeader}>
        <h3>{symbol}/USDT</h3>
        <div className={styles.currentPrice}>
          ${currentPrice.toFixed(2)}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={dataPoints}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={[minPrice || 'auto', maxPrice || 'auto']}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Цена']}
            labelFormatter={(label) => `Время: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            name={`${symbol}/USDT`}
            stroke="#8884d8"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 