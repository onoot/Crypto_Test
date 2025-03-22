import { BinanceWebSocketMessage } from '../types/binance';

type ChartDataCallback = (symbol: string, price: number, timestamp: number) => void;

interface ChartDataPoint {
  price: number;
  timestamp: number;
}

class ChartWebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<ChartDataCallback>> = new Map();
  private reconnectTimeout: number = 5000;
  private chartData: Map<string, ChartDataPoint[]> = new Map();
  private maxDataPoints: number = 100;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  public subscribe(symbol: string, callback: ChartDataCallback): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.chartData.set(symbol, []);
      this.connect([symbol]);
    }

    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.add(callback);
    }

    return () => {
      const symbolSubscribers = this.subscribers.get(symbol);
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback);
        if (symbolSubscribers.size === 0) {
          this.subscribers.delete(symbol);
          this.chartData.delete(symbol);
          this.reconnect();
        }
      }
    };
  }

  private connect(symbols: string[]): void {
    if (this.ws) {
      this.ws.close();
    }

    const streams = symbols.map(symbol => `${symbol.toLowerCase()}usdt@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const message: BinanceWebSocketMessage = JSON.parse(event.data);
        const symbol = message.data.s.replace('USDT', '');
        const price = parseFloat(message.data.c);
        const timestamp = message.data.E; 

        
        const symbolData = this.chartData.get(symbol) || [];
        symbolData.push({ price, timestamp });

        
        if (symbolData.length > this.maxDataPoints) {
          symbolData.shift();
        }

        this.chartData.set(symbol, symbolData);

        
        const subscribers = this.subscribers.get(symbol);
        if (subscribers) {
          subscribers.forEach(callback => callback(symbol, price, timestamp));
        }
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
    const symbols = Array.from(this.subscribers.keys());
    if (symbols.length > 0) {
      setTimeout(() => this.connect(symbols), this.reconnectTimeout);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public getChartData(symbol: string): ChartDataPoint[] {
    return this.chartData.get(symbol) || [];
  }
}

export const chartWebSocket = new ChartWebSocketService(); 