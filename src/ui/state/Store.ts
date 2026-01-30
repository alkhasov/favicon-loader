import { AppState } from '../types';

type StateListener<T = AppState> = (state: T) => void;

export class Store {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();

  constructor(initialState: AppState) {
    this.state = initialState;
  }

  /**
   * Get the current state
   */
  public getState(): AppState {
    return { ...this.state };
  }

  /**
   * Update the state and notify listeners
   */
  public setState(partial: Partial<AppState>): void {
    const oldState = this.state;
    this.state = { ...this.state, ...partial };
    
    // Only notify if state actually changed
    if (JSON.stringify(oldState) !== JSON.stringify(this.state)) {
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to state changes
   * Returns an unsubscribe function
   */
  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.getState());
    });
  }

  // Convenience methods for specific state updates

  public setSelectedSize(size: '32' | '120'): void {
    this.setState({ selectedSize: size });
  }

  public setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  public setHistory(history: string[]): void {
    this.setState({ history });
  }

  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  public setMessage(text: string, type: 'error' | 'success'): void {
    this.setState({ message: { text, type } });
  }

  public clearMessage(): void {
    this.setState({ message: undefined });
  }
}

// Create a singleton store instance
export const store = new Store({
  selectedSize: '32',
  isLoading: false,
  history: [],
  searchTerm: '',
  message: undefined,
});
