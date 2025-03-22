import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { addAsset } from '../../store/portfolioSlice';
import { CurrencyModal } from '../CurrencyModal/CurrencyModal';
import styles from './AddAssetForm.module.scss';

interface AddAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetForm: React.FC<AddAssetFormProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<{ symbol: string; price: number } | null>(null);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCurrency || !amount) return;

    dispatch(addAsset({
      symbol: selectedCurrency.symbol,
      amount: parseFloat(amount),
      currentPrice: selectedCurrency.price,
      change24h: 0,
    }));

    setSelectedCurrency(null);
    setAmount('');
    onClose();
  };

  const handleCurrencySelect = (currency: { symbol: string; price: number }) => {
    setSelectedCurrency(currency);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.header}>
          <h2>Добавить актив</h2>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Валюта</label>
            <button
              type="button"
              className={styles.currencySelector}
              onClick={() => setIsCurrencyModalOpen(true)}
            >
              {selectedCurrency ? (
                <span>
                  {selectedCurrency.symbol} - ${selectedCurrency.price.toFixed(2)}
                </span>
              ) : (
                'Выберите валюту'
              )}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="amount">Количество</label>
            <input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!selectedCurrency || !amount}
          >
            Добавить
          </motion.button>
        </form>

        <CurrencyModal
          isOpen={isCurrencyModalOpen}
          onClose={() => setIsCurrencyModalOpen(false)}
          onSelect={handleCurrencySelect}
        />
      </div>
    </div>
  );
}; 