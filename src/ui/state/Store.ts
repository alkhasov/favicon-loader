import { AppState, Settings } from '../types';

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

  // View navigation

  public setCurrentView(view: 'main' | 'settings'): void {
    this.setState({ currentView: view });
  }

  // Settings methods

  public setReplaceAllFills(replaceAllFills: boolean): void {
    this.setState({ replaceAllFills });
  }

  public setAddBlackOverlay(addBlackOverlay: boolean): void {
    this.setState({ addBlackOverlay });
  }

  public getSettings(): Settings {
    const state = this.getState();
    return {
      selectedSize: state.selectedSize,
      replaceAllFills: state.replaceAllFills,
      addBlackOverlay: state.addBlackOverlay,
    };
  }

  public setSettings(settings: Settings): void {
    this.setState({
      selectedSize: settings.selectedSize,
      replaceAllFills: settings.replaceAllFills,
      addBlackOverlay: settings.addBlackOverlay,
    });
  }
}

// Create a singleton store instance
export const store = new Store({
  currentView: 'main',
  selectedSize: '32',
  replaceAllFills: false,
  addBlackOverlay: false,
  isLoading: false,
  history: [],
  searchTerm: '',
  message: undefined,
});
