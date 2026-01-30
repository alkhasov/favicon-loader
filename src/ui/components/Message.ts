import { Component } from './Component';

export interface MessageProps {
  text?: string;
  type?: 'error' | 'success';
  visible?: boolean;
}

export class Message extends Component<MessageProps> {
  private hideTimeout?: number;

  protected render(): HTMLElement {
    const classes = ['message'];
    
    if (this.props.visible) {
      classes.push('show');
    }
    
    if (this.props.type) {
      classes.push(this.props.type);
    }

    return this.createElement(
      'div',
      {
        className: classes.join(' '),
        id: 'message',
      },
      this.props.text || ''
    );
  }

  protected onMount(): void {
    if (this.props.visible && this.props.type === 'error') {
      this.scheduleHide();
    }
  }

  protected onUnmount(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  private scheduleHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = window.setTimeout(() => {
      this.update({ visible: false });
    }, 3000);
  }

  public update(newProps: Partial<MessageProps>): void {
    super.update(newProps);
    
    if (newProps.visible && this.props.type === 'error') {
      this.scheduleHide();
    }
  }
}
