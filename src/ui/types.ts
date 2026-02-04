// Message types for Figma plugin communication
export interface PluginMessage {
  type: string;
  [key: string]: any;
}

export interface LoadFaviconMessage extends PluginMessage {
  type: 'load-favicon';
  domain: string;
  size: string;
}

export interface SaveSizeMessage extends PluginMessage {
  type: 'save-size';
  size: string;
}

export interface DeleteDomainMessage extends PluginMessage {
  type: 'delete-domain';
  domain: string;
}

export interface GetHistoryMessage extends PluginMessage {
  type: 'get-history';
}

export interface FaviconLoadedMessage extends PluginMessage {
  type: 'favicon-loaded';
}

export interface ErrorMessage extends PluginMessage {
  type: 'error';
  message: string;
}

export interface HistoryLoadedMessage extends PluginMessage {
  type: 'history-loaded';
  history: string[];
}

export interface SizeLoadedMessage extends PluginMessage {
  type: 'size-loaded';
  size: string;
}

// Settings types
export interface Settings {
  selectedSize: '32' | '120';
  replaceAllFills: boolean;
  addBlackOverlay: boolean;
}

export interface SaveSettingsMessage extends PluginMessage {
  type: 'save-settings';
  settings: Settings;
}

export interface SettingsLoadedMessage extends PluginMessage {
  type: 'settings-loaded';
  settings: Settings;
}

// Component props types
export interface ComponentProps {
  [key: string]: any;
}

// App state
export interface AppState {
  currentView: 'main' | 'settings';
  selectedSize: '32' | '120';
  replaceAllFills: boolean;
  addBlackOverlay: boolean;
  isLoading: boolean;
  history: string[];
  searchTerm: string;
  message?: {
    text: string;
    type: 'error' | 'success';
  };
}
