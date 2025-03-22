import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Asset, PortfolioState, PriceUpdate } from '../types/portfolio';
import { v4 as uuidv4 } from 'uuid';

// Загружаем начальное состояние из localStorage
const loadState = (): PortfolioState => {
  try {
    const savedState = localStorage.getItem('portfolio');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (err) {
    console.error('Ошибка при загрузке состояния:', err);
  }
  return {
    assets: [],
    totalValue: 0,
    isLoading: false,
    error: null,
  };
};

const initialState: PortfolioState = loadState();

// Функция для сохранения состояния в localStorage
const saveState = (state: PortfolioState) => {
  try {
    localStorage.setItem('portfolio', JSON.stringify(state));
  } catch (err) {
    console.error('Ошибка при сохранении состояния:', err);
  }
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Omit<Asset, 'id' | 'totalValue' | 'portfolioShare'>>) => {
      const newAsset = {
        ...action.payload,
        id: uuidv4(),
        totalValue: action.payload.amount * action.payload.currentPrice,
        portfolioShare: 0,
      };
      state.assets.push(newAsset);
      state.totalValue = state.assets.reduce((sum, asset) => sum + asset.totalValue, 0);
      
      // Пересчитываем доли в портфеле
      state.assets.forEach(asset => {
        asset.portfolioShare = (asset.totalValue / state.totalValue) * 100;
      });

      saveState(state);
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter(asset => asset.id !== action.payload);
      state.totalValue = state.assets.reduce((sum, asset) => sum + asset.totalValue, 0);
      
      // Пересчитываем доли в портфеле
      if (state.assets.length > 0) {
        state.assets.forEach(asset => {
          asset.portfolioShare = (asset.totalValue / state.totalValue) * 100;
        });
      }

      saveState(state);
    },
    updatePrice: (state, action: PayloadAction<PriceUpdate>) => {
      const asset = state.assets.find(a => a.symbol === action.payload.symbol);
      if (asset) {
        const oldPrice = asset.currentPrice;
        asset.currentPrice = action.payload.price;
        asset.totalValue = asset.amount * asset.currentPrice;
        asset.change24h = action.payload.change24h;
        
        state.totalValue = state.assets.reduce((sum, asset) => sum + asset.totalValue, 0);
        
        // Пересчитываем доли в портфеле
        state.assets.forEach(asset => {
          asset.portfolioShare = (asset.totalValue / state.totalValue) * 100;
        });

        saveState(state);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addAsset, removeAsset, updatePrice, setLoading, setError } = portfolioSlice.actions;
export default portfolioSlice.reducer; 