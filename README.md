
# Next.js Route Autocomplete VS Code Extension

**Status:** In Development — For Learning Purposes Only

## Overview
This Visual Studio Code extension provides intelligent autocompletion for Next.js routes (App Router and Pages Router) in JavaScript and TypeScript projects. It is designed to help developers quickly insert valid route paths when using Next.js navigation functions and components.

> **Note:** This extension is under active development and was created for educational and experimentation purposes. It is not production-ready.

## Features
- Autocomplete for routes in:
  - `router.push("")`, `router.replace("")`, `redirect("")`, `notFound()`
  - `<Link href="">` and similar components
- Supports both static and dynamic routes (e.g., `/blog/[slug]`)
- Watches for file changes in `/app`, `/pages`, `src/app`, and `src/pages`
- Suggestions update automatically as you add, remove, or rename route files
- Works with JavaScript, TypeScript, and React (JSX/TSX)

## How It Works
- On activation, the extension scans your project for valid Next.js route files.
- It builds a route map from files in `/app`, `/pages`, `src/app`, and `src/pages`.
- When you type in a supported context, it suggests all valid routes found.
- Dynamic routes are shown as `/blog/[slug]` and, when selected, insert as `/blog/${slug}`.
- The extension listens for file changes and updates suggestions in real time.

## Usage
1. Install dependencies:
	```
	npm install
	```
2. Compile the extension:
	```
	npm run compile
	```
3. Open the project in VS Code.
4. Press `F5` to launch the Extension Development Host.
5. Open a Next.js project and try typing in any supported context (see Features).
6. Check the Extension Host output for debug logs.

## Limitations
- This extension is experimental and may not cover all Next.js edge cases.
- Only intended for learning and demonstration.
- Not recommended for production use.

## License
MIT
# NextLinkAuto
