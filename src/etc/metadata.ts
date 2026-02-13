/**
 * Metadata I/O utilities
 *
 * @module
 */

import path from 'path';
import fs from 'fs-extra';
import semver from 'semver';
import type { version, semanticAlias, metadata, packagesMetadata } from '../types.js';
import {
	getSemanticVersion,
	getLatestVersion,
	getVersions,
	getPackageDirectories,
	getSymlinkVersion,
	getPackageVersion,
} from './version.js';

/**
 * Gets the docs metadata file path.
 */
export function getMetadataPath(docRoot: string): string {
	return path.join(docRoot, '.typedoc-plugin-versions');
}

/**
 * Loads the docs metadata file and retrieves its data.
 */
export function loadMetadata(docRoot: string): metadata {
	try {
		return fs.readJsonSync(getMetadataPath(docRoot));
	} catch {
		return {};
	}
}

/**
 * Audits and updates a given {@link metadata} object.
 */
export function refreshMetadata(
	metadata: metadata,
	docRoot: string,
	stable = 'auto',
	dev = 'auto',
	packageFile = 'package.json',
): metadata {
	const validate = (v: string) => (v === 'auto' ? v : getSemanticVersion(v));
	const vStable = validate(stable);
	const vDev = validate(dev);

	const versions = refreshMetadataVersions(
		[...(metadata.versions ?? []), metadata.stable!, metadata.dev!],
		docRoot,
		packageFile,
	) as version[];

	return {
		versions,
		stable: refreshMetadataAlias('stable', versions, vStable, vDev),
		dev: refreshMetadataAlias('dev', versions, vStable, vDev),
	};
}

/**
 * Audits an array of versions, ensuring they all still exist, and adds newly found versions.
 */
export function refreshMetadataVersions(
	versions: version[],
	docRoot: string,
	packageFile: string,
) {
	return (
		[
			...versions
				.filter((version) => {
					try {
						const vPath = path.join(docRoot, version);
						return (
							fs.pathExistsSync(vPath) &&
							fs.statSync(vPath).isDirectory() &&
							semver.valid(version, true) !== null
						);
					} catch {
						return false;
					}
				})
				.map((version) => getSemanticVersion(version)),

			...getVersions(getPackageDirectories(docRoot)),

			getSemanticVersion(getPackageVersion(packageFile)),

			getSymlinkVersion('stable', docRoot),
			getSymlinkVersion('dev', docRoot),
		]
			.filter((v, i, s) => v !== undefined && s.indexOf(v) === i)
			.sort((a, b) => semver.rcompare(a!, b!))
	);
}

/**
 * Refreshes a version alias (e.g. 'stable' or 'dev').
 */
export function refreshMetadataAlias(
	alias: semanticAlias,
	versions: version[],
	stable: 'auto' | version = 'auto',
	dev: 'auto' | version = 'auto',
): version | undefined {
	const option = alias === 'stable' ? stable : dev;
	if (
		option &&
		option !== 'auto' &&
		versions.includes(getSemanticVersion(option))
	) {
		return getSemanticVersion(option);
	} else {
		const latest = getLatestVersion(alias, versions, stable, dev);
		if (
			latest &&
			(alias !== 'dev' ||
				!getLatestVersion('stable', versions, stable, dev) ||
				semver.gte(
					latest,
					getLatestVersion('stable', versions, stable, dev)!,
					true,
				))
		) {
			return getSemanticVersion(latest);
		}
	}
}

/**
 * Saves a given {@link metadata} object to disk.
 */
export function saveMetadata(metadata: metadata, docRoot: string): void {
	fs.writeJsonSync(getMetadataPath(docRoot), metadata);
}

/**
 * Gets the packages metadata file path.
 */
export function getPackagesMetadataPath(docRoot: string): string {
	return path.join(docRoot, '.typedoc-plugin-packages');
}

/**
 * Loads the packages metadata file.
 */
export function loadPackagesMetadata(docRoot: string): packagesMetadata {
	try {
		return fs.readJsonSync(getPackagesMetadataPath(docRoot));
	} catch {
		return { packages: [] };
	}
}

/**
 * Saves a given {@link packagesMetadata} object to disk.
 */
export function savePackagesMetadata(meta: packagesMetadata, docRoot: string): void {
	fs.writeJsonSync(getPackagesMetadataPath(docRoot), meta);
}
