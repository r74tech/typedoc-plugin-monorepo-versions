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
	getPackagesMetadataPath,
	loadPackagesMetadata,
	savePackagesMetadata,
} from './metadata.js';

export {
	makeAliasLink,
	makeMinorVersionLinks,
	getPaths,
	handleJeckyll,
	handleAssets,
} from './filesystem.js';

export {
	makeJsKeys,
	makePackagesJs,
	makePackagesIndexHtml,
} from './js-generator.js';
