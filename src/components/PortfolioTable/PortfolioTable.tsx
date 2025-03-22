import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { binanceWebSocket } from '../../services/binanceWebSocket';
import { updatePrice, removeAsset } from '../../store/portfolioSlice';
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
    <div className={styles.container} role="main" aria-label="Портфель криптовалют">
      <div className={styles.header}>
        <h2 id="portfolio-title">Портфель</h2>
        <div className={styles.totalInfo} aria-labelledby="portfolio-title">
          <div className={styles.totalValue} aria-label="Общая стоимость портфеля">
            ${totalPortfolioValue.toFixed(2)}
          </div>
          <div 
            className={`${styles.totalChange} ${totalChange24h >= 0 ? styles.positive : styles.negative}`}
            aria-label={`Изменение за 24 часа: ${totalChange24h >= 0 ? 'плюс' : 'минус'} ${Math.abs(totalChange24h).toFixed(2)}%`}
          >
            {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* График изменения цен */}
      <div className={styles.priceChart} role="region" aria-label="График изменения цен">
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
      <div className={styles.portfolioChart} role="region" aria-label="Распределение активов">
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
        <table 
          className={styles.table}
          role="grid"
          aria-label="Список активов портфеля"
        >
          <thead>
            <tr role="row">
              <th role="columnheader" scope="col">Валюта</th>
              <th role="columnheader" scope="col">Количество</th>
              <th role="columnheader" scope="col">Цена</th>
              <th role="columnheader" scope="col">Изменение (24ч)</th>
              <th role="columnheader" scope="col">Общая стоимость</th>
              <th role="columnheader" scope="col">Доля в портфеле</th>
              <th role="columnheader" scope="col">Действия</th>
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
                  className={selectedSymbol === asset.symbol ? styles.selected : ''}
                  role="row"
                  aria-selected={selectedSymbol === asset.symbol}
                >
                  <td 
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    role="gridcell"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedSymbol(asset.symbol)}
                    aria-label={`Валюта ${asset.symbol}`}
                  >
                    {asset.symbol}
                  </td>
                  <td 
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    role="gridcell"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedSymbol(asset.symbol)}
                    aria-label={`Количество: ${asset.amount.toFixed(8)}`}
                  >
                    {asset.amount.toFixed(8)}
                  </td>
                  <td 
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    role="gridcell"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedSymbol(asset.symbol)}
                    aria-label={`Текущая цена: ${currentPrice.toFixed(2)} долларов`}
                  >
                    ${currentPrice.toFixed(2)}
                  </td>
                  <td 
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    role="gridcell"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedSymbol(asset.symbol)}
                    className={change24h >= 0 ? styles.positive : styles.negative}
                    aria-label={`Изменение за 24 часа: ${change24h >= 0 ? 'плюс' : 'минус'} ${Math.abs(change24h).toFixed(2)}%`}
                  >
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </td>
                  <td 
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    role="gridcell"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedSymbol(asset.symbol)}
                    aria-label={`Общая стоимость: ${totalValue.toFixed(2)} долларов`}
                  >
                    ${totalValue.toFixed(2)}
                  </td>
                  <td 
                    onClick={() => setSelectedSymbol(asset.symbol)}
                    role="gridcell"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setSelectedSymbol(asset.symbol)}
                    aria-label={`Доля в портфеле: ${portfolioShare.toFixed(2)}%`}
                  >
                    {portfolioShare.toFixed(2)}%
                  </td>
                  <td role="gridcell">
                    <button
                      className={styles.deleteButton}
                      onClick={() => dispatch(removeAsset(asset.id))}
                      aria-label={`Удалить ${asset.symbol} из портфеля`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedSymbol && (
        <div 
          className={styles.chartSection} 
          role="region" 
          aria-label={`Детальный график ${selectedSymbol}`}
        >
          <PriceChart symbol={selectedSymbol} />
        </div>
      )}
    </div>
  );
}; 