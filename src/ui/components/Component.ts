import { ComponentProps } from '../types';

export abstract class Component<P extends ComponentProps = ComponentProps> {
  protected element: HTMLElement | null = null;
  protected props: P;
  protected children: Component[] = [];

  constructor(props: P = {} as P) {
    this.props = props;
  }

  /**
   * Abstract method to render the component
   * Must return an HTMLElement
   */
  protected abstract render(): HTMLElement;

  /**
   * Mount the component to a parent element
   */
  public mount(parent: HTMLElement): void {
    this.element = this.render();
    parent.appendChild(this.element);
    this.onMount();
  }

  /**
   * Unmount the component from its parent
   */
  public unmount(): void {
    this.onUnmount();
    
    // Unmount all children first
    this.children.forEach(child => child.unmount());
    this.children = [];
    
    // Remove from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.element = null;
  }

  /**
   * Update component props and re-render
   */
  public update(newProps: Partial<P>): void {
    const oldProps = this.props;
    this.props = { ...this.props, ...newProps };
    
    if (this.shouldUpdate(oldProps, this.props)) {
      this.rerender();
    }
  }

  /**
   * Re-render the component in place
   */
  protected rerender(): void {
    if (!this.element || !this.element.parentNode) return;
    
    const parent = this.element.parentNode as HTMLElement;
    const nextSibling = this.element.nextSibling;
    
    this.unmount();
    
    this.element = this.render();
    if (nextSibling) {
      parent.insertBefore(this.element, nextSibling);
    } else {
      parent.appendChild(this.element);
    }
    
    this.onMount();
  }

  /**
   * Lifecycle hook called after component is mounted
   */
  protected onMount(): void {
    // Override in subclasses if needed
  }

  /**
   * Lifecycle hook called before component is unmounted
   */
  protected onUnmount(): void {
    // Override in subclasses if needed
  }

  /**
   * Determine if component should update
   */
  protected shouldUpdate(oldProps: P, newProps: P): boolean {
    return JSON.stringify(oldProps) !== JSON.stringify(newProps);
  }

  /**
   * Helper to create DOM elements
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs: Record<string, any> = {},
    ...children: (string | HTMLElement | Component)[]
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else if (key === 'disabled' || key === 'checked' || key === 'selected') {
        // Boolean attributes - set or remove based on value
        if (value) {
          element.setAttribute(key, '');
        } else {
          element.removeAttribute(key);
        }
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Append children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (child instanceof Component) {
        this.children.push(child);
        child.mount(element);
      }
    });
    
    return element;
  }

  /**
   * Get the component's root element
   */
  public getElement(): HTMLElement | null {
    return this.element;
  }
}
