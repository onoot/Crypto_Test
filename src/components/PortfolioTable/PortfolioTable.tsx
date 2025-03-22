import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { binanceWebSocket } from '../../services/binanceWebSocket';
import { updatePrice } from '../../store/portfolioSlice';
import { PriceChart } from '../PriceChart/PriceChart';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import styles from './PortfolioTable.module.scss';

interface RealTimeData {
  price: number;
  change24h: number;
}

interface PriceHistory {
  timestamp: string;
  [key: string]: number | string;
}

const COLORS = [
  '#6366f1', // Основной цвет
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#a4de6c',
  '#d0ed57',
  '#83a6ed',
  '#8dd1e1',
  '#ff6b6b'
];

export const PortfolioTable: React.FC = () => {
  const dispatch = useDispatch();
  const assets = useSelector((state: RootState) => state.portfolio.assets);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState<Map<string, RealTimeData>>(new Map());
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

  useEffect(() => {
    const symbols = assets.map(asset => asset.symbol);
    const unsubscribes = symbols.map(symbol =>
      binanceWebSocket.subscribe((updatedSymbol, price, change24h) => {
        if (updatedSymbol === symbol) {
          setRealTimeData(prev => {
            const newMap = new Map(prev);
            newMap.set(symbol, { price, change24h });
            return newMap;
          });
          
          // Обновляем историю цен
          const now = new Date();
          setPriceHistory(prev => {
            const newPoint = {
              timestamp: now.toLocaleTimeString(),
              [symbol]: price,
            };
            
            const newHistory = [...prev, newPoint];
            if (newHistory.length > 50) { // Храним последние 50 точек
              return newHistory.slice(-50);
            }
            return newHistory;
          });
          
          dispatch(updatePrice({ symbol, price, change24h }));
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [assets, dispatch]);

  const calculateTotalValue = (amount: number, symbol: string) => {
    const currentPrice = realTimeData.get(symbol)?.price || 0;
    return amount * currentPrice;
  };

  const totalPortfolioValue = assets.reduce(
    (total, asset) => total + calculateTotalValue(asset.amount, asset.symbol),
    0
  );

  const calculateTotalChange24h = () => {
    if (assets.length === 0) return 0;
    
    const totalChange = assets.reduce((sum, asset) => {
      const realTime = realTimeData.get(asset.symbol);
      const change24h = realTime?.change24h || asset.change24h;
      const value = calculateTotalValue(asset.amount, asset.symbol);
      return sum + (value * change24h / 100);
    }, 0);

    return (totalChange / totalPortfolioValue) * 100;
  };

  const totalChange24h = calculateTotalChange24h();

  // Подготовка данных для графика
  const chartData = assets.map(asset => {
    const totalValue = calculateTotalValue(asset.amount, asset.symbol);
    return {
      name: asset.symbol,
      value: totalValue,
      percentage: ((totalValue / totalPortfolioValue) * 100).toFixed(2)
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Портфель</h2>
        <div className={styles.totalInfo}>
          <div className={styles.totalValue}>
            ${totalPortfolioValue.toFixed(2)}
          </div>
          <div className={`${styles.totalChange} ${totalChange24h >= 0 ? styles.positive : styles.negative}`}>
            {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* График изменения цен */}
      <div className={styles.priceChart}>
        <h3>Изменение цен</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="timestamp"
              interval="preserveStartEnd"
              minTickGap={50}
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px'
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Цена']}
            />
            <Legend 
              wrapperStyle={{ color: 'var(--text-primary)' }}
            />
            {assets.map((asset, index) => (
              <Line
                key={asset.symbol}
                type="monotone"
                dataKey={asset.symbol}
                name={`${asset.symbol}/USDT`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* График распределения активов */}
      <div className={styles.portfolioChart}>
        <h3>Распределение активов</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percentage }) => `${name} (${percentage}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Стоимость']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Валюта</th>
              <th>Количество</th>
              <th>Цена</th>
              <th>Изменение (24ч)</th>
              <th>Общая стоимость</th>
              <th>Доля в портфеле</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => {
              const realTime = realTimeData.get(asset.symbol);
              const currentPrice = realTime?.price || asset.currentPrice;
              const change24h = realTime?.change24h || asset.change24h;
              const totalValue = calculateTotalValue(asset.amount, asset.symbol);
              const portfolioShare = (totalValue / totalPortfolioValue) * 100;

              return (
                <tr
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={selectedSymbol === asset.symbol ? styles.selected : ''}
                >
                  <td>{asset.symbol}</td>
                  <td>{asset.amount.toFixed(8)}</td>
                  <td>${currentPrice.toFixed(2)}</td>
                  <td className={change24h >= 0 ? styles.positive : styles.negative}>
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </td>
                  <td>${totalValue.toFixed(2)}</td>
                  <td>{portfolioShare.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedSymbol && (
        <div className={styles.chartSection}>
          <PriceChart symbol={selectedSymbol} />
        </div>
      )}
    </div>
  );
}; 