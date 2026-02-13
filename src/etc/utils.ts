/**
 * Re-export all utilities for backward compatibility.
 *
 * @module
 */

export {
	getSemanticVersion,
	getMinorVersion,
	getVersionAlias,
	getLatestVersion,
	getVersions,
	getPackageDirectories,
	getSymlinkVersion,
	getPackageVersion,
	verRegex,
	minorVerRegex,
} from './version.js';

export {
	getMetadataPath,
	loadMetadata,
	refreshMetadata,
	refreshMetadataVersions,
	refreshMetadataAlias,
	saveMetadata,
} from './metadata.js';

export {
	makeAliasLink,
	makeMinorVersionLinks,
	getPaths,
	handleJeckyll,
	handleAssets,
} from './filesystem.js';

export { makeJsKeys } from './js-generator.js';
