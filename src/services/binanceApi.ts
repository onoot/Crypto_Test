interface Ticker24hr {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  closeTime: number;
}

class BinanceApiService {
  private baseUrl = 'https://api.binance.com/api/v3';

  async get24hrTickers(): Promise<Ticker24hr[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching 24hr tickers:', error);
      return [];
    }
  }

  async getInitialPrices(symbols: string[]): Promise<Map<string, { price: number, change24h: number }>> {
    try {
      const tickers = await this.get24hrTickers();
      const priceMap = new Map();

      symbols.forEach(symbol => {
        const ticker = tickers.find(t => t.symbol === `${symbol}USDT`);
        if (ticker) {
          priceMap.set(symbol, {
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent)
          });
        }
      });

      return priceMap;
    } catch (error) {
      console.error('Error getting initial prices:', error);
      return new Map();
    }
  }
}

export const binanceApi = new BinanceApiService(); 