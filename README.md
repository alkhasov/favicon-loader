# Favicon Loader

A Figma plugin that lets you quickly load favicons from any domain and apply them as fills to selected elements.

![Plugin Preview](assets/plugin-slide.png)

## Features

- Load favicons from any domain and apply as image fill to selected elements
- Two size options: 32px and 120px (preference is remembered)
- Domain history with up to 30 recent domains
- Click history items to quickly reload favicons
- Delete individual items from history
- Smart domain normalization (handles URLs, removes www, etc.)
- Relaunch button on elements for quick access
- Uses reliable Yandex Favicon API

## Installation

1. Clone this repository or download the files
2. Open Figma Desktop App
3. Go to **Plugins** → **Development** → **Import plugin from manifest**
4. Select the `manifest.json` file from this project
5. The plugin is now ready to use!

## Usage

1. Select an element in your Figma canvas (rectangle, frame, etc.)
2. Open the plugin from **Plugins** → **Development** → **Favicon Loader**
3. Enter a domain name (e.g., `github.com` or `figma.com`)
4. Choose a size: **32** or **120**
5. Click **Load Favicon**
6. The favicon will be applied as an image fill to the selected element

You can also click on any domain in the history list to quickly load that favicon again.

## How It Works

The plugin fetches favicons using the [Yandex Favicon API](https://favicon.yandex.net/), which provides reliable, high-quality favicons for virtually any domain. The fetched image is applied as an image fill to the currently selected element, preserving any existing fills.

After applying a favicon, the element gets a relaunch button that lets you quickly open the plugin again to load another favicon.

## License

MIT

---

Built with the Figma Plugin API
