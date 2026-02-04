import { Component } from './Component';

export interface FooterProps {
  onSettingsClick: () => void;
  showSettingsLink: boolean;
}

export class Footer extends Component<FooterProps> {
  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'version-footer' });

    if (this.props.showSettingsLink) {
      // Main page: only show "Change settings" link
      const settingsLink = this.createElement('a', {
        className: 'footer-link',
        href: '#',
        onClick: (e: Event) => {
          e.preventDefault();
          this.props.onSettingsClick();
        },
      }, 'Change settings');

      container.appendChild(settingsLink);
    } else {
      // Settings page: only show version text
      const version = this.createElement('span', {
        className: 'footer-version',
      }, 'Version 4 February 2026');

      container.appendChild(version);
    }

    return container;
  }
}
