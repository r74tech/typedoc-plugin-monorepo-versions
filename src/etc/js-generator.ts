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
 */
export function makeJsKeys(metadata: metadata): string {
	const alias = metadata.stable ? 'stable' : 'dev';
	const keys = [
		alias,
		...metadata
			.versions!.map((v) => getMinorVersion(v))
			.filter((v, i, s) => s.indexOf(v) === i),
	];
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
 */
export function makePackagesIndexHtml(packages: string[]): string {
	const listItems = packages
		.map((p) => `		<li><a href="${p}/stable/">${p}</a></li>`)
		.join('\n');
	return [
		'<!DOCTYPE html>',
		'<html lang="en">',
		'<head>',
		'	<meta charset="UTF-8">',
		'	<title>API Documentation</title>',
		'</head>',
		'<body>',
		'	<h1>Packages</h1>',
		'	<ul>',
		listItems,
		'	</ul>',
		'</body>',
		'</html>',
	]
		.join('\n')
		.concat('\n');
}
