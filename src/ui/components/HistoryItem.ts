import { Component } from './Component';

export interface HistoryItemProps {
  domain: string;
  onClick: (domain: string) => void;
  onDelete: (domain: string) => void;
  hidden?: boolean;
}

export class HistoryItem extends Component<HistoryItemProps> {
  protected render(): HTMLElement {
    const classes = ['history-item'];
    
    if (this.props.hidden) {
      classes.push('hidden');
    }

    const item = this.createElement(
      'div',
      {
        className: classes.join(' '),
        'data-domain': this.props.domain,
        onClick: (e: Event) => {
          const target = e.target as HTMLElement;
          if (!target.classList.contains('delete-btn')) {
            this.props.onClick(this.props.domain);
          }
        },
      }
    );

    const domainSpan = this.createElement(
      'span',
      {
        className: 'history-item-domain',
      },
      this.props.domain
    );

    const deleteBtn = this.createElement(
      'button',
      {
        className: 'delete-btn',
        'data-domain': this.props.domain,
        onClick: (e: Event) => {
          e.stopPropagation();
          this.props.onDelete(this.props.domain);
        },
      },
      '×'
    );

    item.appendChild(domainSpan);
    item.appendChild(deleteBtn);

    return item;
  }
}
