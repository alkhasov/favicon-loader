"use strict";
// Show UI
figma.showUI(__html__, { width: 320, height: 500 });
// Maximum number of domains in history
const MAX_HISTORY_SIZE = 30;
const HISTORY_KEY = "domainHistory";
const SIZE_KEY = "faviconSize";
// Handle relaunch button
if (figma.command === 'load-favicon') {
    // Plugin opened via relaunch button - just show UI
}
// Domain normalization function
function normalizeDomain(domain) {
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
// Load and send size preference
async function loadAndSendSize() {
    const size = await figma.clientStorage.getAsync(SIZE_KEY) || '32';
    figma.ui.postMessage({ type: 'size-loaded', size });
}
// Save size preference
async function saveSize(size) {
    await figma.clientStorage.setAsync(SIZE_KEY, size);
}
// Save domain to history
async function saveDomainToHistory(domain) {
    let history = await figma.clientStorage.getAsync(HISTORY_KEY) || [];
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
async function deleteDomainFromHistory(domain) {
    let history = await figma.clientStorage.getAsync(HISTORY_KEY) || [];
    // Remove domain
    history = history.filter(d => d !== domain);
    await figma.clientStorage.setAsync(HISTORY_KEY, history);
    // Send updated history to UI
    figma.ui.postMessage({ type: 'history-loaded', history });
}
// Load favicon
async function loadFavicon(domain, size = '32') {
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
    }
    catch (error) {
        console.error('Error loading favicon:', error);
        throw error;
    }
}
// Insert favicon to selected element
async function insertFaviconToElement(imageData) {
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
    // Get current fills
    const currentFills = Array.isArray(node.fills) ? [...node.fills] : [];
    // Create new image fill
    const newFill = {
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash
    };
    // Add new fill to existing ones
    node.fills = [...currentFills, newFill];
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
            if (!domain) {
                figma.ui.postMessage({
                    type: 'error',
                    message: 'Please enter a domain'
                });
                return;
            }
            // Load favicon with selected size
            const imageData = await loadFavicon(domain, size);
            // Insert into element
            await insertFaviconToElement(imageData);
            // Save to history
            await saveDomainToHistory(normalizeDomain(domain));
            // Send success message (silent - no UI display)
            figma.ui.postMessage({
                type: 'favicon-loaded'
            });
        }
        catch (error) {
            console.error('Error:', error);
            figma.ui.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Error loading favicon'
            });
        }
    }
    else if (msg.type === 'save-size') {
        await saveSize(msg.size);
    }
    else if (msg.type === 'delete-domain') {
        await deleteDomainFromHistory(msg.domain);
    }
    else if (msg.type === 'close') {
        figma.closePlugin();
    }
    else if (msg.type === 'get-history') {
        await loadAndSendHistory();
    }
};
// Load history and size on startup
loadAndSendHistory();
loadAndSendSize();
