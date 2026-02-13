/**
 * Frontend JavaScript generation utilities
 *
 * @module
 */

import type { metadata } from '../types.js';
import { getMinorVersion } from './version.js';

/**
 * Creates a string of JavaScript defining an array of all the versions
 * to be included in the frontend select.
 * @param showPatch When true, list individual patch versions instead of minor-only.
 */
export function makeJsKeys(metadata: metadata, showPatch = false): string {
	const alias = metadata.stable ? 'stable' : 'dev';
	const versionKeys = showPatch
		? metadata.versions!.filter((v, i, s) => s.indexOf(v) === i)
		: metadata
				.versions!.map((v) => getMinorVersion(v))
				.filter((v, i, s) => s.indexOf(v) === i);
	const keys = [alias, ...versionKeys];
	if (alias !== 'dev' && metadata.dev) {
		keys.push('dev');
	}
	const lines = [
		'"use strict"',
		'export const DOC_VERSIONS = [',
		...keys.map((v) => `	'${v}',`),
		'];',
	];
	return lines.join('\n').concat('\n');
}

/**
 * Creates a string of JavaScript defining an array of all packages
 * to be included in the frontend package select.
 */
export function makePackagesJs(packages: string[]): string {
	const lines = [
		'"use strict"',
		'export const DOC_PACKAGES = [',
		...packages.map((p) => `	'${p}',`),
		'];',
	];
	return lines.join('\n').concat('\n');
}

/**
 * Creates an HTML page listing all packages with links.
 * Styled to match the TypeDoc default theme with light/dark mode support.
 */
export function makePackagesIndexHtml(packages: string[]): string {
	const cards = packages
		.map(
			(p) =>
				`		<a class="pkg-card" href="${p}/stable/">\n` +
				`			<span class="pkg-name">${p}</span>\n` +
				`			<span class="pkg-arrow">\u2192</span>\n` +
				`		</a>`,
		)
		.join('\n');
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>API Documentation</title>
	<style>
		:root {
			--bg: #f2f4f8;
			--bg-card: #fff;
			--text: #222;
			--text-sub: #5e5e5e;
			--link: #1f70c2;
			--border: #e0e3e8;
			--hover-bg: #eef1f6;
			--font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
		}
		@media (prefers-color-scheme: dark) {
			:root {
				--bg: #2b2e33;
				--bg-card: #1e2024;
				--text: #f5f5f5;
				--text-sub: #ddd;
				--link: #00aff4;
				--border: #3e4148;
				--hover-bg: #363940;
			}
		}
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: var(--font);
			background: var(--bg);
			color: var(--text);
			min-height: 100vh;
			display: flex;
			flex-direction: column;
		}
		header {
			background: var(--bg-card);
			border-bottom: 1px solid var(--border);
			padding: 0.75rem 1.5rem;
		}
		header h1 {
			font-size: 1rem;
			font-weight: 600;
		}
		main {
			flex: 1;
			max-width: 48rem;
			width: 100%;
			margin: 0 auto;
			padding: 2rem 1.5rem;
		}
		h2 {
			font-size: 1.25rem;
			font-weight: 600;
			margin-bottom: 1rem;
		}
		.pkg-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
			gap: 0.75rem;
		}
		.pkg-card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 1rem 1.25rem;
			background: var(--bg-card);
			border: 1px solid var(--border);
			border-radius: 8px;
			text-decoration: none;
			color: var(--text);
			transition: background 0.15s, border-color 0.15s;
		}
		.pkg-card:hover {
			background: var(--hover-bg);
			border-color: var(--link);
		}
		.pkg-name { font-weight: 500; }
		.pkg-arrow { color: var(--text-sub); font-size: 1.1rem; }
		.pkg-card:hover .pkg-arrow { color: var(--link); }
		footer {
			text-align: center;
			padding: 1rem;
			color: var(--text-sub);
			font-size: 0.8rem;
			border-top: 1px solid var(--border);
		}
		footer a { color: var(--link); text-decoration: none; }
	</style>
</head>
<body>
	<header><h1>API Documentation</h1></header>
	<main>
		<h2>Packages</h2>
		<div class="pkg-grid">
${cards}
		</div>
	</main>
	<footer>Generated using <a href="https://typedoc.org/" target="_blank">TypeDoc</a></footer>
</body>
</html>
`;
}
