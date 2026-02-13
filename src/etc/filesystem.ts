/**
 * File system operation utilities
 *
 * @module
 */

import path from 'path';
import fs from 'fs-extra';
import semver from 'semver';
import type { version, semanticAlias, monorepoOptions } from '../types.js';
import { Application } from 'typedoc';
import { fileURLToPath } from 'url';
import {
	getSemanticVersion,
	getMinorVersion,
	getVersionAlias,
} from './version.js';

/**
 * Creates a symlink for an alias.
 */
export function makeAliasLink(
	alias: semanticAlias,
	docRoot: string,
	pegVersion: version,
	makeRelativeSymlinks?: boolean,
): void {
	pegVersion = getSemanticVersion(pegVersion);
	const source = path.join(docRoot, pegVersion);
	const target = path.join(docRoot, alias);

	if (!fs.pathExistsSync(source))
		throw new Error(`Document directory does not exist: ${pegVersion}`);

	if (fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink())
		fs.unlinkSync(target);

	if (makeRelativeSymlinks) {
		const relSource = path.relative(path.dirname(target), source);
		fs.ensureSymlinkSync(relSource, target, 'junction');
	} else {
		fs.ensureSymlinkSync(source, target, 'junction');
	}
}

/**
 * Creates symlinks for minor versions pointing to the latest patch release.
 */
export function makeMinorVersionLinks(
	versions: version[],
	docRoot: string,
	makeRelativeSymlinks?: boolean,
	stable: 'auto' | version = 'auto',
	dev: 'auto' | version = 'auto',
): void {
	for (const version of versions
		.map((version) => {
			const highestStablePatch = versions.find(
				(v) =>
					getVersionAlias(v, stable, dev) === 'stable' &&
					semver.satisfies(
						v,
						`${semver.major(version)}.${semver.minor(version)}.x`,
						{ includePrerelease: true },
					),
			);
			return (
				highestStablePatch ??
				versions.find((v) =>
					semver.satisfies(
						v,
						`${semver.major(version)}.${semver.minor(version)}.x`,
						{ includePrerelease: true },
					),
				)
			);
		})
		.filter((v, i, s) => s.indexOf(v) === i)) {
		const target = path.join(docRoot, getMinorVersion(version!));
		const src = path.join(docRoot, version!);

		if (fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink())
			fs.unlinkSync(target);

		if (makeRelativeSymlinks) {
			const relSrc = path.relative(path.dirname(target), src);
			fs.ensureSymlinkSync(relSrc, target, 'junction');
		} else {
			fs.ensureSymlinkSync(src, target, 'junction');
		}
	}
}

/**
 * Resolve the root document path and document build path.
 * In monorepo mode, returns an additional packageRootPath.
 */
export function getPaths(
	app: Application,
	version: string,
	monorepo?: monorepoOptions,
) {
	if (monorepo) {
		const rootPath = path.resolve(process.cwd(), monorepo.root);
		const packageRootPath = path.join(rootPath, monorepo.name);
		return {
			rootPath,
			packageRootPath,
			targetPath: path.join(packageRootPath, getSemanticVersion(version)),
		};
	}
	const defaultRootPath = path.join(process.cwd(), 'docs');
	const rootPath = app.options.getValue('out') || defaultRootPath;
	return {
		rootPath,
		packageRootPath: undefined,
		targetPath: path.join(rootPath, getSemanticVersion(version)),
	};
}

/**
 * Moves .nojekyll flag file to the documentation root folder.
 */
export function handleJeckyll(rootPath: string, targetPath: string): void {
	const srcJeckPath = path.join(targetPath, '.nojekyll');
	const targetJeckPath = path.join(rootPath, '.nojekyll');
	if (fs.existsSync(targetJeckPath)) fs.removeSync(targetJeckPath);
	if (fs.existsSync(srcJeckPath)) fs.moveSync(srcJeckPath, targetJeckPath);
}

/**
 * Copies static assets to the document build folder.
 */
export function handleAssets(
	targetPath: string,
	srcDir: string = path.dirname(fileURLToPath(import.meta.url)),
) {
	const sourceAsset = path.join(srcDir, '../assets/versionsMenu.js');
	fs.ensureDirSync(path.join(targetPath, 'assets'));
	fs.copyFileSync(
		sourceAsset,
		path.join(targetPath, 'assets/versionsMenu.js'),
	);
}
