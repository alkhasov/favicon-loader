import { Component } from './components/Component';
import { DomainInput } from './components/DomainInput';
import { SizeSelector } from './components/SizeSelector';
import { Button } from './components/Button';
import { Message } from './components/Message';
import { HistoryList } from './components/HistoryList';
import { SettingsPage } from './components/SettingsPage';
import { Footer } from './components/Footer';
import { store } from './state/Store';
import {
  PluginMessage,
  FaviconLoadedMessage,
  ErrorMessage,
  HistoryLoadedMessage,
  SettingsLoadedMessage,
  Settings,
} from './types';

export class App extends Component {
  private domainInput!: DomainInput;
  private loadButton!: Button;
  private messageComponent!: Message;
  private historyList!: HistoryList;
  private settingsPage!: SettingsPage;
  private footer!: Footer;
  private mainContainer!: HTMLElement;
  private unsubscribe?: () => void;
  private currentView: 'main' | 'settings' = 'main';

  constructor() {
    super({});
    this.setupMessageListener();
    this.requestInitialData();
  }

  protected render(): HTMLElement {
    const root = this.createElement('div', { className: 'app-root' });
    const state = store.getState();
    this.currentView = state.currentView;

    if (state.currentView === 'main') {
      this.renderMainView(root, state);
    } else {
      this.renderSettingsView(root, state);
    }

    // Footer
    this.footer = new Footer({
      showSettingsLink: state.currentView === 'main',
      onSettingsClick: () => {
        store.setCurrentView('settings');
      },
    });
    this.footer.mount(root);

    return root;
  }

  private renderMainView(root: HTMLElement, state: ReturnType<typeof store.getState>): void {
    this.mainContainer = this.createElement('div', { className: 'container' });

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
    this.domainInput.mount(this.mainContainer);

    // Actions row (button only now, size is in settings)
    const actionsRow = this.createElement('div', { className: 'actions-row' });

    this.loadButton = new Button({
      text: 'Load favicon',
      disabled: state.isLoading,
      onClick: () => {
        this.loadFavicon(this.domainInput.getValue());
      },
    });
    this.loadButton.mount(actionsRow);

    this.mainContainer.appendChild(actionsRow);

    // Message component
    this.messageComponent = new Message({
      text: state.message?.text,
      type: state.message?.type,
      visible: !!state.message,
    });
    this.messageComponent.mount(this.mainContainer);

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
    this.historyList.mount(this.mainContainer);

    root.appendChild(this.mainContainer);
  }

  private renderSettingsView(root: HTMLElement, state: ReturnType<typeof store.getState>): void {
    this.settingsPage = new SettingsPage({
      settings: store.getSettings(),
      onSave: (settings: Settings) => {
        this.saveSettings(settings);
        store.setCurrentView('main');
      },
    });
    this.settingsPage.mount(root);
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
    // Check if view changed - need full rerender
    if (state.currentView !== this.currentView) {
      this.rerender();
      return;
    }

    // Update components based on state changes (main view only)
    if (state.currentView === 'main') {
      this.loadButton?.update({
        text: state.isLoading ? 'Loading...' : 'Load favicon',
        disabled: state.isLoading,
      });

      this.messageComponent?.update({
        text: state.message?.text,
        type: state.message?.type,
        visible: !!state.message,
      });

      this.historyList?.update({
        history: state.history,
        searchTerm: state.searchTerm,
        onItemClick: (domain) => this.loadFavicon(domain),
        onItemDelete: (domain) => this.sendMessage({ type: 'delete-domain', domain }),
      });
    }

    // Update footer
    this.footer?.update({
      showSettingsLink: state.currentView === 'main',
      onSettingsClick: () => store.setCurrentView('settings'),
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
      replaceAllFills: state.replaceAllFills,
      addBlackOverlay: state.addBlackOverlay,
    });
  }

  private saveSettings(settings: Settings): void {
    store.setSettings(settings);
    this.sendMessage({ type: 'save-settings', settings });
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
      case 'settings-loaded':
        this.handleSettingsLoaded(msg as SettingsLoadedMessage);
        break;
    }
  }

  private handleFaviconLoaded(_msg: FaviconLoadedMessage): void {
    store.setLoading(false);
    this.domainInput?.clear();
    store.setSearchTerm('');
  }

  private handleError(msg: ErrorMessage): void {
    store.setLoading(false);
    store.setMessage(msg.message || 'Error occurred', 'error');
  }

  private handleHistoryLoaded(msg: HistoryLoadedMessage): void {
    store.setHistory(msg.history);
  }

  private handleSettingsLoaded(msg: SettingsLoadedMessage): void {
    store.setSettings(msg.settings);
  }

  private sendMessage(msg: PluginMessage): void {
    parent.postMessage({ pluginMessage: msg }, '*');
  }

  private requestInitialData(): void {
    this.sendMessage({ type: 'get-history' });
    this.sendMessage({ type: 'get-settings' });
  }
}
