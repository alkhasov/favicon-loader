import { Component } from './Component';
import { Settings } from '../types';
import { SettingsItem } from './SettingsItem';
import { SizeSelector } from './SizeSelector';
import { Switcher } from './Switcher';
import { Button } from './Button';

export interface SettingsPageProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export class SettingsPage extends Component<SettingsPageProps> {
  private currentSettings: Settings;
  private sizeSelectorItem!: SettingsItem;
  private sizeSelector!: SizeSelector;
  private replaceAllFillsItem!: SettingsItem;
  private replaceAllFillsSwitcher!: Switcher;
  private addBlackOverlayItem!: SettingsItem;
  private addBlackOverlaySwitcher!: Switcher;
  private saveButton!: Button;

  constructor(props: SettingsPageProps) {
    super(props);
    // Copy settings to allow editing without affecting original
    this.currentSettings = { ...props.settings };
  }

  protected render(): HTMLElement {
    const container = this.createElement('div', { className: 'settings-page' });

    // Title
    const title = this.createElement('h1', {
      className: 'settings-title',
    }, 'Settings');

    container.appendChild(title);

    // Settings list
    const settingsList = this.createElement('div', { className: 'settings-list' });

    // 1. Favicon size setting
    this.sizeSelectorItem = new SettingsItem({
      title: 'Favicon size',
      description: "If it's available on domain",
    });
    this.sizeSelectorItem.mount(settingsList);

    this.sizeSelector = new SizeSelector({
      selectedSize: this.currentSettings.selectedSize,
      onSizeChange: (size) => {
        this.currentSettings.selectedSize = size;
        this.sizeSelector.update({ selectedSize: size });
      },
    });
    const sizeControl = this.sizeSelectorItem.getControlContainer();
    if (sizeControl) {
      this.sizeSelector.mount(sizeControl);
    }

    // 2. Replace all fills setting
    this.replaceAllFillsItem = new SettingsItem({
      title: 'Replace all fills with favicon',
      description: 'Reduce cluttering',
    });
    this.replaceAllFillsItem.mount(settingsList);

    this.replaceAllFillsSwitcher = new Switcher({
      checked: this.currentSettings.replaceAllFills,
      onChange: (checked) => {
        this.currentSettings.replaceAllFills = checked;
        this.replaceAllFillsSwitcher.update({ checked });
      },
    });
    const replaceControl = this.replaceAllFillsItem.getControlContainer();
    if (replaceControl) {
      this.replaceAllFillsSwitcher.mount(replaceControl);
    }

    // 3. Add 5% black on top setting
    this.addBlackOverlayItem = new SettingsItem({
      title: 'Add 5% black on top',
      description: 'Looks better most of the time',
    });
    this.addBlackOverlayItem.mount(settingsList);

    this.addBlackOverlaySwitcher = new Switcher({
      checked: this.currentSettings.addBlackOverlay,
      onChange: (checked) => {
        this.currentSettings.addBlackOverlay = checked;
        this.addBlackOverlaySwitcher.update({ checked });
      },
    });
    const overlayControl = this.addBlackOverlayItem.getControlContainer();
    if (overlayControl) {
      this.addBlackOverlaySwitcher.mount(overlayControl);
    }

    container.appendChild(settingsList);

    // Save button
    const buttonContainer = this.createElement('div', { className: 'settings-button-container' });
    
    this.saveButton = new Button({
      text: 'OK',
      onClick: () => {
        this.props.onSave(this.currentSettings);
      },
    });
    this.saveButton.mount(buttonContainer);

    container.appendChild(buttonContainer);

    return container;
  }

  public update(newProps: Partial<SettingsPageProps>): void {
    if (newProps.settings) {
      this.currentSettings = { ...newProps.settings };
    }
    super.update(newProps);
  }
}
