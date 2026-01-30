import { Component } from './Component';
import { HistoryItem } from './HistoryItem';

export interface HistoryListProps {
  history: string[];
  searchTerm: string;
  onItemClick: (domain: string) => void;
  onItemDelete: (domain: string) => void;
}

export class HistoryList extends Component<HistoryListProps> {
  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'history-section' });
    
    const listContainer = this.createElement('div', {
      className: 'history-list',
      id: 'historyList',
    });

    if (!this.props.history || this.props.history.length === 0) {
      const emptyDiv = this.createElement('div', { className: 'history-empty' }, 'No history');
      listContainer.appendChild(emptyDiv);
    } else {
      let hasVisibleItems = false;

      this.props.history.forEach(domain => {
        const searchTerm = this.props.searchTerm.toLowerCase();
        const matches = !searchTerm || domain.toLowerCase().includes(searchTerm);
        
        if (matches) {
          hasVisibleItems = true;
        }

        const item = new HistoryItem({
          domain,
          onClick: this.props.onItemClick,
          onDelete: this.props.onItemDelete,
          hidden: !matches,
        });

        item.mount(listContainer);
      });

      // Show "No matches" if search term exists but no matches
      if (this.props.searchTerm && !hasVisibleItems) {
        const noMatchDiv = this.createElement('div', { className: 'history-empty' }, 'No matching domains');
        listContainer.appendChild(noMatchDiv);
      }
    }

    container.appendChild(listContainer);

    return container;
  }
}
