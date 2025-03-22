import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { binanceWebSocket } from '../../services/binanceWebSocket';
import { binanceApi } from '../../services/binanceApi';
import styles from './CurrencyModal.module.scss';

interface Currency {
  symbol: string;
  price: number;
  change24h: number;
}

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
}

const SUPPORTED_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'LTC', 'ADA',
  'XRP', 'LINK', 'DOT', 'SOL', 'MATIC'
];

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialPrices = async () => {
      setIsLoading(true);
      const priceMap = await binanceApi.getInitialPrices(SUPPORTED_SYMBOLS);
      
      const initialCurrencies = SUPPORTED_SYMBOLS
        .map(symbol => {
          const data = priceMap.get(symbol);
          if (data) {
            return {
              symbol,
              price: data.price,
              change24h: data.change24h
            };
          }
          return null;
        })
        .filter((c): c is Currency => c !== null);

      setCurrencies(initialCurrencies);
      setIsLoading(false);
    };

    if (isOpen) {
      loadInitialPrices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = binanceWebSocket.subscribe((symbol, price, change24h) => {
      setCurrencies(prev => {
        const index = prev.findIndex(c => c.symbol === symbol);
        if (index === -1) {
          return [...prev, { symbol, price, change24h }];
        }
        const newCurrencies = [...prev];
        newCurrencies[index] = { symbol, price, change24h };
        return newCurrencies;
      });
    });

    return () => unsubscribe();
  }, [isOpen]);

  const filteredCurrencies = currencies.filter(currency =>
    currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-modal-title"
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        role="document"
      >
        <div className={styles.header}>
          <h2 id="currency-modal-title">Выберите криптовалюту</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Закрыть окно выбора валюты"
          >
            ×
          </button>
        </div>

        <div className={styles.search}>
          <input
            type="text"
            placeholder="Поиск валюты..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Поиск валюты"
            role="searchbox"
          />
        </div>

        <div 
          className={styles.currencyList}
          role="listbox"
          aria-label="Список доступных валют"
        >
          {isLoading ? (
            <div 
              className={styles.loading}
              role="status"
              aria-live="polite"
            >
              Загрузка...
            </div>
          ) : (
            filteredCurrencies.map(currency => (
              <motion.div
                key={currency.symbol}
                className={styles.currencyItem}
                onClick={() => {
                  onSelect(currency);
                  onClose();
                }}
                whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                role="option"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onSelect(currency);
                    onClose();
                  }
                }}
                aria-label={`${currency.symbol}: цена ${currency.price.toFixed(2)} долларов, изменение ${currency.change24h >= 0 ? 'плюс' : 'минус'} ${Math.abs(currency.change24h).toFixed(2)}%`}
              >
                <div className={styles.symbol}>{currency.symbol}</div>
                <div className={styles.price}>${currency.price.toFixed(2)}</div>
                <div 
                  className={`${styles.change} ${currency.change24h >= 0 ? styles.positive : styles.negative}`}
                >
                  {currency.change24h >= 0 ? '+' : ''}{currency.change24h.toFixed(2)}%
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}; 