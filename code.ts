// Show UI
figma.showUI(__html__, { width: 320, height: 500 });

// Maximum number of domains in history
const MAX_HISTORY_SIZE = 100;
const HISTORY_KEY = "domainHistory";
const SETTINGS_KEY = "pluginSettings";

// Settings interface
interface PluginSettings {
  selectedSize: '32' | '120';
  replaceAllFills: boolean;
  addBlackOverlay: boolean;
}

// Default settings
const DEFAULT_SETTINGS: PluginSettings = {
  selectedSize: '32',
  replaceAllFills: false,
  addBlackOverlay: false,
};

// Handle relaunch button
if (figma.command === 'load-favicon') {
  // Plugin opened via relaunch button - just show UI
}

// Domain normalization function
function normalizeDomain(domain: string): string {
  let normalized = domain.trim().toLowerCase();
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');
  // Remove www.
  normalized = normalized.replace(/^www\./, '');
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  // Remove path
  normalized = normalized.split('/')[0];
  
  return normalized;
}

// Load history and send to UI
async function loadAndSendHistory() {
  const history = await figma.clientStorage.getAsync(HISTORY_KEY) || [];
  figma.ui.postMessage({ type: 'history-loaded', history });
}

// Load and send settings
async function loadAndSendSettings() {
  const stored = await figma.clientStorage.getAsync(SETTINGS_KEY);
  const settings: PluginSettings = stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
  figma.ui.postMessage({ type: 'settings-loaded', settings });
}

// Save settings
async function saveSettings(settings: PluginSettings) {
  await figma.clientStorage.setAsync(SETTINGS_KEY, settings);
}

// Save domain to history
async function saveDomainToHistory(domain: string) {
  let history: string[] = await figma.clientStorage.getAsync(HISTORY_KEY) || [];
  
  // Remove duplicates if any
  history = history.filter(d => d !== domain);
  
  // Add to beginning
  history.unshift(domain);
  
  // Limit size
  if (history.length > MAX_HISTORY_SIZE) {
    history = history.slice(0, MAX_HISTORY_SIZE);
  }
  
  await figma.clientStorage.setAsync(HISTORY_KEY, history);
  
  // Send updated history to UI
  figma.ui.postMessage({ type: 'history-loaded', history });
}

// Delete domain from history
async function deleteDomainFromHistory(domain: string) {
  let history: string[] = await figma.clientStorage.getAsync(HISTORY_KEY) || [];
  
  // Remove domain
  history = history.filter(d => d !== domain);
  
  await figma.clientStorage.setAsync(HISTORY_KEY, history);
  
  // Send updated history to UI
  figma.ui.postMessage({ type: 'history-loaded', history });
}

// Load favicon
async function loadFavicon(domain: string, size: string = '32') {
  const normalizedDomain = normalizeDomain(domain);
  const url = `https://favicon.yandex.net/favicon/v2/${normalizedDomain}?size=${size}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    return uint8Array;
  } catch (error) {
    console.error('Error loading favicon:', error);
    throw error;
  }
}

// Insert favicon to selected element
async function insertFaviconToElement(
  imageData: Uint8Array,
  replaceAllFills: boolean = false,
  addBlackOverlay: boolean = false
) {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    throw new Error('Please select an element');
  }
  
  const node = selection[0];
  
  // Check if element supports fills
  if (!('fills' in node)) {
    throw new Error('Selected element doesn\'t support fills');
  }
  
  // Create image
  const image = figma.createImage(imageData);
  
  // Get current fills or start fresh based on replaceAllFills setting
  const currentFills = replaceAllFills ? [] : (Array.isArray(node.fills) ? [...node.fills] : []);
  
  // Create new image fill
  const newFill: ImagePaint = {
    type: 'IMAGE',
    scaleMode: 'FIT',
    imageHash: image.hash
  };
  
  // Build the fills array
  const fills: Paint[] = [...currentFills, newFill];
  
  // Add 5% black overlay on top if enabled
  if (addBlackOverlay) {
    const blackOverlay: SolidPaint = {
      type: 'SOLID',
      color: { r: 0, g: 0, b: 0 },
      opacity: 0.05
    };
    fills.push(blackOverlay);
  }
  
  // Apply fills
  node.fills = fills;
  
  // Set relaunch button on the node
  if ('setRelaunchData' in node) {
    node.setRelaunchData({ 'load-favicon': 'Load another favicon' });
  }
  
  return node;
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'load-favicon') {
    try {
      const domain = msg.domain;
      const size = msg.size || '32';
      const replaceAllFills = msg.replaceAllFills || false;
      const addBlackOverlay = msg.addBlackOverlay || false;
      
      if (!domain) {
        figma.ui.postMessage({ 
          type: 'error', 
          message: 'Please enter a domain' 
        });
        return;
      }
      
      // Load favicon with selected size
      const imageData = await loadFavicon(domain, size);
      
      // Insert into element with settings
      await insertFaviconToElement(imageData, replaceAllFills, addBlackOverlay);
      
      // Save to history
      await saveDomainToHistory(normalizeDomain(domain));
      
      // Send success message (silent - no UI display)
      figma.ui.postMessage({ 
        type: 'favicon-loaded'
      });
      
    } catch (error) {
      console.error('Error:', error);
      figma.ui.postMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Error loading favicon' 
      });
    }
  } else if (msg.type === 'save-settings') {
    await saveSettings(msg.settings);
  } else if (msg.type === 'get-settings') {
    await loadAndSendSettings();
  } else if (msg.type === 'delete-domain') {
    await deleteDomainFromHistory(msg.domain);
  } else if (msg.type === 'close') {
    figma.closePlugin();
  } else if (msg.type === 'get-history') {
    await loadAndSendHistory();
  }
};

// Load history and settings on startup
loadAndSendHistory();
loadAndSendSettings();
