/**
 * Version processing utilities
 *
 * @module
 */

import path from 'path';
import fs from 'fs-extra';
import semver from 'semver';
import type { version, semanticAlias } from '../types.js';

/**
 * Normalizes a version string to semantic format (e.g. "v1.2.3" or "v1.2.3-alpha.1").
 * @param version The version string to normalize.
 * @returns The normalized {@link version}.
 */
export function getSemanticVersion(version: string): version {
	if (!version) {
		throw new Error('Package version was not found');
	}

	const semVer = semver.coerce(version, { loose: true });
	if (!semVer) {
		throw new Error(`version is not semantically formatted: ${version}`);
	}

	const prerelease = semver.prerelease(version, true);
	return prerelease
		? `v${semVer.version}-${semver.prerelease(version, true)!.join('.')}`
		: `v${semVer.version}`;
}

/**
 * Drops the patch from a semantic version string.
 * @returns A minor version string in the form "v0.0".
 */
export function getMinorVersion(version: string): version {
	version = getSemanticVersion(version);
	const { major, minor } = semver.coerce(version, { loose: true })!;
	return `v${major}.${minor}`;
}

/**
 * Gets the {@link semanticAlias alias} of the given version, e.g. 'stable' or 'dev'.
 * @remarks
 * Versions lower than 1.0.0 or with a pre-release label (e.g. 1.0.0-alpha.1)
 * will be considered 'dev'. All other versions will be considered 'stable'.
 */
export function getVersionAlias(
	version: string,
	stable: 'auto' | version = 'auto',
	dev: 'auto' | version = 'auto',
): semanticAlias {
	version = getSemanticVersion(version);
	if (stable !== 'auto' && version === getSemanticVersion(stable))
		return 'stable';
	else if (dev !== 'auto' && version === getSemanticVersion(dev))
		return 'dev';
	else return semver.satisfies(version, '>=1.0.0', true) ? 'stable' : 'dev';
}

/**
 * Gets the latest valid {@link version} for a given {@link semanticAlias alias}.
 */
export function getLatestVersion(
	alias: semanticAlias,
	versions: version[],
	stable: 'auto' | version = 'auto',
	dev: 'auto' | version = 'auto',
): version | undefined {
	return [...versions]
		.sort(semver.rcompare)
		.find((v) => getVersionAlias(v, stable, dev) === alias);
}

/**
 * Gets a list of semantic versions from a list of directories.
 */
export function getVersions(directories: string[]): version[] {
	return directories
		.filter((dir) => semver.coerce(dir, { loose: true }))
		.map((dir) => getSemanticVersion(dir));
}

/**
 * Parses the root document directory for all semantically named sub-directories.
 */
export function getPackageDirectories(docRoot: string): string[] {
	return fs.readdirSync(docRoot).filter((file: string) => {
		const filePath = path.join(docRoot, file);
		return (
			fs.pathExistsSync(filePath) &&
			fs.statSync(filePath).isDirectory() &&
			semver.valid(file, true) !== null
		);
	}) as string[];
}

/**
 * Gets the {@link version} a given symlink is pointing to.
 */
export function getSymlinkVersion(
	symlink: string,
	docRoot: string,
): version | undefined {
	const symlinkPath = path.join(docRoot, symlink);
	if (
		fs.pathExistsSync(symlinkPath) &&
		fs.lstatSync(symlinkPath).isSymbolicLink()
	) {
		const rawTarget = fs.readlinkSync(symlinkPath);
		const targetPath = path.isAbsolute(rawTarget)
			? rawTarget
			: path.resolve(docRoot, rawTarget);
		if (
			fs.pathExistsSync(targetPath) &&
			fs.statSync(targetPath).isDirectory()
		) {
			return getSemanticVersion(path.basename(targetPath));
		}
	}
}

/**
 * Gets the package version from the specified package.json file.
 */
export function getPackageVersion(packageFile: string) {
	const packagePath = path.join(process.cwd(), packageFile);
	const pack = fs.readJSONSync(packagePath);
	return pack.version;
}

/** Regex for matching semantic patch version */
export const verRegex = /^(v\d+|\d+).\d+.\d+/;
/** Regex for matching semantic minor version */
export const minorVerRegex = /^(v\d+|\d+).\d+$/;
