import { Component } from './Component';

export interface SettingsItemProps {
  title: string;
  description: string;
}

export class SettingsItem extends Component<SettingsItemProps> {
  private controlContainer: HTMLElement | null = null;

  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'settings-item' });

    // Info section (title + description)
    const info = this.createElement('div', { className: 'settings-item-info' });

    const title = this.createElement('p', {
      className: 'settings-item-title',
    }, this.props.title);

    const description = this.createElement('p', {
      className: 'settings-item-description',
    }, this.props.description);

    info.appendChild(title);
    info.appendChild(description);

    // Control container (for child component)
    this.controlContainer = this.createElement('div', {
      className: 'settings-item-control',
    });

    container.appendChild(info);
    container.appendChild(this.controlContainer);

    return container;
  }

  /**
   * Get the control container to mount child components
   */
  public getControlContainer(): HTMLElement | null {
    return this.controlContainer;
  }
}
