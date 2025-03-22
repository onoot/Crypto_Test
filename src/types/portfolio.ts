export interface Asset {
  id: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  totalValue: number;
  change24h: number;
  portfolioShare: number;
}

export interface PortfolioState {
  assets: Asset[];
  totalValue: number;
  isLoading: boolean;
  error: string | null;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
} 