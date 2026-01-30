import { Component } from './Component';

export interface SizeSelectorProps {
  selectedSize: '32' | '120';
  onSizeChange: (size: '32' | '120') => void;
}

export class SizeSelector extends Component<SizeSelectorProps> {
  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'size-selector' });

    const size32Btn = this.createElement(
      'button',
      {
        className: `size-option ${this.props.selectedSize === '32' ? 'active' : ''}`,
        'data-size': '32',
        id: 'size32',
        onClick: () => this.props.onSizeChange('32'),
      },
      '32'
    );

    const size120Btn = this.createElement(
      'button',
      {
        className: `size-option ${this.props.selectedSize === '120' ? 'active' : ''}`,
        'data-size': '120',
        id: 'size120',
        onClick: () => this.props.onSizeChange('120'),
      },
      '120'
    );

    container.appendChild(size32Btn);
    container.appendChild(size120Btn);

    return container;
  }
}
