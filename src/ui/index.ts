import { App } from './App';

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('app');
  
  if (appRoot) {
    const app = new App();
    app.mount(appRoot);
  }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM still loading, event listener will handle it
} else {
  // DOM already loaded
  const appRoot = document.getElementById('app');
  
  if (appRoot) {
    const app = new App();
    app.mount(appRoot);
  }
}
