import { Component } from './Component';

export interface DomainInputProps {
  value?: string;
  placeholder?: string;
  onInput?: (value: string) => void;
  onEnter?: (value: string) => void;
}

export class DomainInput extends Component<DomainInputProps> {
  private inputElement?: HTMLInputElement;

  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'input-group' });
    
    const label = this.createElement('label', { for: 'domain' }, 'Enter domain');
    
    const input = this.createElement('input', {
      type: 'text',
      id: 'domain',
      placeholder: this.props.placeholder || 'example.com',
      value: this.props.value || '',
      autocomplete: 'off',
      autofocus: true,
      onInput: (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (this.props.onInput) {
          this.props.onInput(target.value);
        }
      },
      onKeypress: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          const target = e.target as HTMLInputElement;
          if (this.props.onEnter) {
            this.props.onEnter(target.value);
          }
        }
      },
    }) as HTMLInputElement;
    
    this.inputElement = input;
    
    container.appendChild(label);
    container.appendChild(input);
    
    return container;
  }

  public getValue(): string {
    return this.inputElement?.value || '';
  }

  public setValue(value: string): void {
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }

  public clear(): void {
    this.setValue('');
  }

  public focus(): void {
    this.inputElement?.focus();
  }

  protected onMount(): void {
    // Auto-focus the input when component mounts
    // Use setTimeout to ensure DOM is fully ready (needed for Figma plugin iframe)
    setTimeout(() => this.focus(), 50);
  }
}
