import { Component } from './Component';

export interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export class Button extends Component<ButtonProps> {
  protected render(): HTMLElement {
    return this.createElement(
      'button',
      {
        className: `button ${this.props.className || ''}`,
        disabled: this.props.disabled || false,
        onClick: this.props.onClick,
      },
      this.props.text
    );
  }
}
