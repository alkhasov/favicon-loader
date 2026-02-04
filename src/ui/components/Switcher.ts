import { Component } from './Component';

export interface SwitcherProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export class Switcher extends Component<SwitcherProps> {
  protected render(): HTMLElement {
    const container = this.createElement('button', {
      className: `switcher ${this.props.checked ? 'active' : ''} ${this.props.disabled ? 'disabled' : ''}`,
      onClick: () => {
        if (!this.props.disabled) {
          this.props.onChange(!this.props.checked);
        }
      },
      disabled: this.props.disabled,
      type: 'button',
      'aria-checked': this.props.checked ? 'true' : 'false',
      role: 'switch',
    });

    const knob = this.createElement('div', {
      className: 'switcher-knob',
    });

    container.appendChild(knob);

    return container;
  }

  /**
   * Override update to efficiently update the visual state without full rerender
   */
  public update(newProps: Partial<SwitcherProps>): void {
    const checkedChanged = newProps.checked !== undefined && newProps.checked !== this.props.checked;
    
    // Update props
    this.props = { ...this.props, ...newProps };
    
    // Directly update DOM for checked state change
    if (checkedChanged && this.element) {
      if (this.props.checked) {
        this.element.classList.add('active');
      } else {
        this.element.classList.remove('active');
      }
      this.element.setAttribute('aria-checked', this.props.checked ? 'true' : 'false');
    }
  }
}
