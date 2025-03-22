import { store } from '../store/store';
import { updatePrice } from '../store/portfolioSlice';

class WebSocketService {
  private ws: WebSocket | null = null;
  private symbols: string[] = [];

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  connect(symbols: string[]) {
    this.symbols = symbols;
    const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
    this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        const symbol = data.data.s;
        const price = parseFloat(data.data.c);
        const change24h = parseFloat(data.data.P);
        store.dispatch(updatePrice({ symbol, price, change24h }));
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

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private reconnect() {
    setTimeout(() => {
      if (this.symbols.length > 0) {
        this.connect(this.symbols);
      }
    }, 5000);
  }
}

export const wsService = new WebSocketService(); 