import { Component } from './Component';

export interface SizeSelectorProps {
  selectedSize: '32' | '120';
  onSizeChange: (size: '32' | '120') => void;
}

export class SizeSelector extends Component<SizeSelectorProps> {
  private size32Btn!: HTMLButtonElement;
  private size120Btn!: HTMLButtonElement;

  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'size-selector' });

    this.size32Btn = this.createElement(
      'button',
      {
        className: `size-option ${this.props.selectedSize === '32' ? 'active' : ''}`,
        'data-size': '32',
        id: 'size32',
        onClick: () => this.props.onSizeChange('32'),
      },
      '32'
    ) as HTMLButtonElement;

    this.size120Btn = this.createElement(
      'button',
      {
        className: `size-option ${this.props.selectedSize === '120' ? 'active' : ''}`,
        'data-size': '120',
        id: 'size120',
        onClick: () => this.props.onSizeChange('120'),
      },
      '120'
    ) as HTMLButtonElement;

    container.appendChild(this.size32Btn);
    container.appendChild(this.size120Btn);

    return container;
  }

  /**
   * Override update to efficiently update the visual state without full rerender
   */
  public update(newProps: Partial<SizeSelectorProps>): void {
    const sizeChanged = newProps.selectedSize !== undefined && newProps.selectedSize !== this.props.selectedSize;
    
    // Update props
    this.props = { ...this.props, ...newProps };
    
    // Directly update DOM for size change
    if (sizeChanged && this.size32Btn && this.size120Btn) {
      if (this.props.selectedSize === '32') {
        this.size32Btn.classList.add('active');
        this.size120Btn.classList.remove('active');
      } else {
        this.size32Btn.classList.remove('active');
        this.size120Btn.classList.add('active');
      }
    }
  }
}
