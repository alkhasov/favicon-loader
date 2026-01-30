import { Component } from './components/Component';
import { DomainInput } from './components/DomainInput';
import { SizeSelector } from './components/SizeSelector';
import { Button } from './components/Button';
import { Message } from './components/Message';
import { HistoryList } from './components/HistoryList';
import { store } from './state/Store';
import {
  PluginMessage,
  FaviconLoadedMessage,
  ErrorMessage,
  HistoryLoadedMessage,
  SizeLoadedMessage,
} from './types';

export class App extends Component {
  private domainInput!: DomainInput;
  private sizeSelector!: SizeSelector;
  private loadButton!: Button;
  private messageComponent!: Message;
  private historyList!: HistoryList;
  private unsubscribe?: () => void;

  constructor() {
    super({});
    this.setupMessageListener();
    this.requestInitialData();
  }

  protected render(): HTMLElement {
    const root = this.createElement('div', { className: 'container' });

    // Domain input
    this.domainInput = new DomainInput({
      placeholder: 'example.com',
      onInput: (value) => {
        store.setSearchTerm(value.trim().toLowerCase());
      },
      onEnter: (value) => {
        this.loadFavicon(value);
      },
    });
    this.domainInput.mount(root);

    // Actions row (size selector + button)
    const actionsRow = this.createElement('div', { className: 'actions-row' });

    const state = store.getState();
    
    this.sizeSelector = new SizeSelector({
      selectedSize: state.selectedSize,
      onSizeChange: (size) => {
        store.setSelectedSize(size);
        this.sendMessage({ type: 'save-size', size });
      },
    });
    this.sizeSelector.mount(actionsRow);

    this.loadButton = new Button({
      text: 'Load Favicon',
      disabled: state.isLoading,
      onClick: () => {
        this.loadFavicon(this.domainInput.getValue());
      },
    });
    this.loadButton.mount(actionsRow);

    root.appendChild(actionsRow);

    // Message component
    this.messageComponent = new Message({
      text: state.message?.text,
      type: state.message?.type,
      visible: !!state.message,
    });
    this.messageComponent.mount(root);

    // History list
    this.historyList = new HistoryList({
      history: state.history,
      searchTerm: state.searchTerm,
      onItemClick: (domain) => {
        this.loadFavicon(domain);
      },
      onItemDelete: (domain) => {
        this.sendMessage({ type: 'delete-domain', domain });
      },
    });
    this.historyList.mount(root);

    return root;
  }

  protected onMount(): void {
    // Subscribe to store changes
    this.unsubscribe = store.subscribe((state) => {
      this.handleStateChange(state);
    });
  }

  protected onUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private handleStateChange(state: ReturnType<typeof store.getState>): void {
    // Update components based on state changes
    this.sizeSelector.update({ selectedSize: state.selectedSize });

    this.loadButton.update({
      text: state.isLoading ? 'Loading...' : 'Load Favicon',
      disabled: state.isLoading,
    });

    this.messageComponent.update({
      text: state.message?.text,
      type: state.message?.type,
      visible: !!state.message,
    });

    this.historyList.update({
      history: state.history,
      searchTerm: state.searchTerm,
      onItemClick: (domain) => this.loadFavicon(domain),
      onItemDelete: (domain) => this.sendMessage({ type: 'delete-domain', domain }),
    });
  }

  private loadFavicon(domain: string): void {
    const trimmedDomain = domain.trim();

    if (!trimmedDomain) {
      store.setMessage('Please enter a domain', 'error');
      return;
    }

    const state = store.getState();
    store.setLoading(true);
    store.clearMessage();

    this.sendMessage({
      type: 'load-favicon',
      domain: trimmedDomain,
      size: state.selectedSize,
    });
  }

  private setupMessageListener(): void {
    window.onmessage = (event) => {
      const msg: PluginMessage = event.data.pluginMessage;
      this.handlePluginMessage(msg);
    };
  }

  private handlePluginMessage(msg: PluginMessage): void {
    switch (msg.type) {
      case 'favicon-loaded':
        this.handleFaviconLoaded(msg as FaviconLoadedMessage);
        break;
      case 'error':
        this.handleError(msg as ErrorMessage);
        break;
      case 'history-loaded':
        this.handleHistoryLoaded(msg as HistoryLoadedMessage);
        break;
      case 'size-loaded':
        this.handleSizeLoaded(msg as SizeLoadedMessage);
        break;
    }
  }

  private handleFaviconLoaded(_msg: FaviconLoadedMessage): void {
    store.setLoading(false);
    this.domainInput.clear();
    store.setSearchTerm('');
  }

  private handleError(msg: ErrorMessage): void {
    store.setLoading(false);
    store.setMessage(msg.message || 'Error occurred', 'error');
  }

  private handleHistoryLoaded(msg: HistoryLoadedMessage): void {
    store.setHistory(msg.history);
  }

  private handleSizeLoaded(msg: SizeLoadedMessage): void {
    store.setSelectedSize(msg.size as '32' | '120');
  }

  private sendMessage(msg: PluginMessage): void {
    parent.postMessage({ pluginMessage: msg }, '*');
  }

  private requestInitialData(): void {
    this.sendMessage({ type: 'get-history' });
  }
}
