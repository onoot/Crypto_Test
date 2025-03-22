import { BinanceTickerData } from '../types/binance';

type PriceCallback = (symbol: string, price: number, change24h: number) => void;

class BinanceWebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Set<PriceCallback> = new Set();
  private reconnectTimeout: number = 5000;
  private symbols: string[] = [
    'btcusdt', 'ethusdt', 'bnbusdt', 'ltcusdt', 'adausdt',
    'xrpusdt', 'linkusdt', 'dotusdt', 'solusdt', 'maticusdt'
  ];

  constructor() {
    this.connect();
  }

  public subscribe(callback: PriceCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private connect(): void {
    if (this.ws) {
      this.ws.close();
    }

    const streams = this.symbols.map(symbol => `${symbol}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const data: BinanceTickerData = message.data;
        const symbol = data.s.replace('USDT', '');
        const price = parseFloat(data.c);
        const change24h = parseFloat(data.P);

        this.subscribers.forEach(callback => callback(symbol, price, change24h));
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.reconnect();
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.reconnect();
    };
  }

  private reconnect(): void {
    setTimeout(() => this.connect(), this.reconnectTimeout);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const binanceWebSocket = new BinanceWebSocketService(); 