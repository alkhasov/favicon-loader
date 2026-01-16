// Show the UI
figma.showUI(__html__, { width: 320, height: 240 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'grab-favicon') {
    try {
      const domain = msg.domain;
      
      // Construct favicon URL
      const faviconUrl = `https://favicon.yandex.net/favicon/v2/${domain}/?size=32`;
      
      try {
        // Fetch image data
        const imageData = await fetchImageData(faviconUrl);
        
        // Create an image fill
        const image = figma.createImage(imageData);
        
        // Create a rectangle node with the image
        const rect = figma.createRectangle();
        rect.name = `Favicon - ${domain}`;
        rect.resize(32, 32);
        
        // Set the fill as an image
        rect.fills = [{
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash
        }];
        
        // Get viewport center or cursor position 
        const viewportCenter = figma.viewport.center;
        
        // Position the node at the viewport center
        rect.x = viewportCenter.x - 16;
        rect.y = viewportCenter.y - 16;
        
        // Add the node to the current page
        figma.currentPage.appendChild(rect);
        
        // Select the newly created node
        figma.currentPage.selection = [rect];
        figma.viewport.scrollAndZoomIntoView([rect]);
        
        // Notify UI of success
        figma.ui.postMessage({ type: 'success' });
        
      } catch (error) {
        // Handle any errors
        figma.ui.postMessage({ 
          type: 'error', 
          message: 'Failed to download favicon. Please check the domain.'
        });
      }
    } catch (error) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: 'An error occurred. Please try again.'
      });
    }
  }
};

// Function to fetch image data
async function fetchImageData(url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Note: Due to Figma plugin sandbox restrictions, direct fetch might not work
// In that case, we'd need to use figma.ui.postMessage to handle the network request
// in the UI context and then pass the result back to the plugin
