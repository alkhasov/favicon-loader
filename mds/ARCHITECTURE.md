# Component Architecture Documentation

## Overview

The UI has been refactored from a monolithic `ui.html` file into a modular component-based architecture using TypeScript classes.

## Structure

```
src/ui/
├── index.ts              # Entry point - initializes the app
├── App.ts                # Main app component - orchestrates UI, routing, and Figma messaging
├── types.ts              # Shared TypeScript types and interfaces
├── styles.css            # Global CSS styles
├── state/
│   └── Store.ts          # Centralized state management with pub/sub
└── components/
    ├── Component.ts      # Base component class with lifecycle methods
    ├── Button.ts         # Reusable button component
    ├── DomainInput.ts    # Domain input field with validation
    ├── SizeSelector.ts   # Size toggle (32/120)
    ├── Message.ts        # Error/success message display
    ├── HistoryList.ts    # History container component
    ├── HistoryItem.ts    # Individual history item
    ├── Switcher.ts       # Toggle switch component for boolean settings
    ├── SettingsItem.ts   # Individual settings row (title, description, control)
    ├── SettingsPage.ts   # Settings page with all configurable options
    └── Footer.ts         # Footer with settings link and version
```

## Key Concepts

### Component Base Class

All components extend the `Component` base class which provides:

- **Lifecycle methods**: `render()`, `mount()`, `unmount()`, `onMount()`, `onUnmount()`
- **State management**: `update()`, `rerender()`, `shouldUpdate()`
- **DOM helpers**: `createElement()` for building elements declaratively
- **Child management**: Automatic cleanup of child components

Example:
```typescript
export class Button extends Component<ButtonProps> {
  protected render(): HTMLElement {
    return this.createElement('button', {
      className: 'button',
      onClick: this.props.onClick,
    }, this.props.text);
  }
}
```

### State Management (Store)

The `Store` class provides centralized state management using a pub/sub pattern:

- **State**: `currentView`, `selectedSize`, `replaceAllFills`, `addBlackOverlay`, `isLoading`, `history`, `searchTerm`, `message`
- **Methods**: `getState()`, `setState()`, `subscribe()`
- **Convenience methods**: `setSelectedSize()`, `setLoading()`, `setHistory()`, `setCurrentView()`, `setSettings()`, `getSettings()`, etc.

### View Navigation

The app supports multiple views controlled by `currentView` state:
- `'main'` - Main view with domain input and history
- `'settings'` - Settings page with configurable options

### Settings

Settings are persisted in Figma's client storage and include:
- `selectedSize` - Favicon size ('32' or '120')
- `replaceAllFills` - Whether to replace all existing fills (default: false)
- `addBlackOverlay` - Whether to add 5% black overlay on top (default: false)

Components subscribe to state changes and update automatically:

```typescript
this.unsubscribe = store.subscribe((state) => {
  this.button.update({ disabled: state.isLoading });
});
```

### Figma Plugin Communication

All Figma plugin messaging is centralized in `App.ts`:

- **Outgoing**: `sendMessage()` posts messages to the plugin backend
- **Incoming**: `handlePluginMessage()` processes messages from the backend
- **Message types**: Defined in `types.ts` for type safety

## Build System

### Scripts

- `npm run build` - Build both plugin and UI
- `npm run build:plugin` - Compile TypeScript plugin code
- `npm run build:ui` - Bundle UI and generate `ui.html`
- `npm run watch` - Watch plugin TypeScript files
- `npm run watch:ui` - Watch and rebuild UI on changes

### Build Process

1. **esbuild** bundles `src/ui/index.ts` → `dist/ui.js`
2. **build-ui.js** script:
   - Reads bundled JS from `dist/ui.js`
   - Reads CSS from `src/ui/styles.css`
   - Injects both into HTML template
   - Writes final `ui.html` to project root

The generated `ui.html` is a self-contained file with inlined CSS and JavaScript.

## Component Communication

### Parent → Child
Direct method calls or props updates:
```typescript
this.button.update({ disabled: true });
```

### Child → Parent
Callback functions passed via props:
```typescript
new Button({
  onClick: () => this.handleClick()
});
```

### Global State
Through the Store for shared state across components:
```typescript
store.setLoading(true);
```

## Adding New Components

1. Create `src/ui/components/MyComponent.ts`
2. Extend `Component<MyComponentProps>`
3. Implement `render()` method
4. Define props interface
5. Import and use in parent component

Example:
```typescript
import { Component } from './Component';

export interface MyComponentProps {
  label: string;
  onClick: () => void;
}

export class MyComponent extends Component<MyComponentProps> {
  protected render(): HTMLElement {
    return this.createElement('div', {
      className: 'my-component',
      onClick: this.props.onClick,
    }, this.props.label);
  }
}
```

## Component Reference

### Switcher
Toggle switch for boolean settings.

Props:
- `checked: boolean` - Current state
- `onChange: (checked: boolean) => void` - Change handler
- `disabled?: boolean` - Optional disabled state

### SettingsItem
A settings row with title, description, and control area.

Props:
- `title: string` - Setting name
- `description: string` - Help text

Methods:
- `getControlContainer()` - Returns the container element for mounting child controls

### SettingsPage
The settings view with all configurable options.

Props:
- `settings: Settings` - Current settings values
- `onSave: (settings: Settings) => void` - Save handler

### Footer
Footer component with optional settings link.

Props:
- `showSettingsLink: boolean` - Show/hide the settings link
- `onSettingsClick: () => void` - Handler when settings link clicked

## Benefits

- **Modularity**: Each component is self-contained and reusable
- **Type Safety**: Full TypeScript types for props and state
- **Maintainability**: Clear separation of concerns
- **Testability**: Components can be tested in isolation
- **Developer Experience**: Modern class-based architecture
- **No Runtime Dependencies**: Pure TypeScript, no external UI libraries
