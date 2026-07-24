# Translate Image Browser Extension

Browser extension that translates text on images using OCR and swaps the image source directly on the page.

Translate pair: `auto` -> `ru` (auto-detected source language to Russian).

## Features

- Adds a context menu action on images: **Toggle image translate**.
- Runs OCR + translation through Yandex endpoints (via `ya-ocr`).
- Toggles translated/original image on repeated clicks.
- Caches translated result per image URL for faster repeated usage.

## How It Works

1. Right-click an image and choose **Toggle image translate**.
2. Background script sends the image URL to OCR client.
3. Returned translated SVG is converted to a `data:image/svg+xml;base64,...` URL.
4. Content script replaces matching `<img src="...">` elements on the page.
5. Repeating the action restores the original image.

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Development

Start extension development build:

```bash
npm run dev
```

Start Firefox development build:

```bash
npm run dev:firefox
```

## Build

Build production package:

```bash
npm run build
```

Build for Firefox:

```bash
npm run build:firefox
```

Create ZIP package:

```bash
npm run zip
```

Create Firefox ZIP package:

```bash
npm run zip:firefox
```

## Type Check

```bash
npm run compile
```

## Permissions

The extension requests:

- `contextMenus` to add image context action.
- `activeTab` and `scripting` to inject content script on demand.
- `declarativeNetRequest` to adjust request headers for OCR/translate endpoints.
- `host_permissions: ["<all_urls>"]` to work on any site.

## Project Structure

```text
src/
	entrypoints/
		background.ts   # context menu + OCR request + toggle message
		content.ts      # image replacement and restore logic
	utils/
		fetch.ts        # declarativeNetRequest session rule
		messaging.ts    # typed message protocol between scripts
```

## Limitations

- `blob:`, `file:`, and `data:` image URLs are not translated unless already translated.
- Translation quality depends on source image quality and OCR recognition.

## Tech Stack

- [WXT](https://wxt.dev/) for extension development/build.
- TypeScript.
- `@webext-core/messaging` for typed extension messaging.
- `ya-ocr` client for OCR + translation requests.
