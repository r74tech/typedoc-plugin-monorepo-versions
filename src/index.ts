/**
 * Entry point for typedoc-plugin-versions
 *
 * @module
 */

import { Application, ParameterType, RendererEvent } from 'typedoc';

import path from 'path';
import fs from 'fs-extra';
import * as vUtils from './etc/utils.js';
import * as vHooks from './etc/hooks.js';
import type { versionsOptions } from './types.js';
export * from './types.js';

/**
 * The default Typedoc [plugin hook](https://typedoc.org/guides/development/#plugins).
 * @param app
 */
export function load(app: Application) {
	app.options.addDeclaration({
		help: 'Options for typedoc-plugin-versions',
		name: 'versions',
		type: ParameterType.Object,
		defaultValue: {
			stable: 'auto',
			dev: 'auto',
			domLocation: 'false',
			packageFile: 'package.json',
			makeRelativeLinks: false,
			monorepo: undefined,
		},
	});

	const vOptions = app.options.getValue("versions") as versionsOptions;

	if (vOptions.monorepo) {
		if (!vOptions.monorepo.name || !/^[a-zA-Z0-9_-]+$/.test(vOptions.monorepo.name)) {
			throw new Error('monorepo.name is required and must contain only alphanumeric characters, hyphens, and underscores');
		}
		if (!vOptions.monorepo.root) {
			throw new Error('monorepo.root is required');
		}
	}

	const isMonorepo = !!vOptions.monorepo;

	vHooks.injectSelectJs(app, isMonorepo);
	vHooks.injectSelectHtml(app, vOptions.domLocation!, isMonorepo);

	const packageFile = vOptions.packageFile ?? 'package.json';
	const packagePath = path.join(process.cwd(), packageFile);
	const packageVersion = fs.readJSONSync(packagePath).version;
	const { rootPath, packageRootPath, targetPath } = vUtils.getPaths(app, packageVersion, vOptions.monorepo);

	// The doc root for version management: packageRootPath in monorepo mode, rootPath in single mode
	const versionRoot = packageRootPath ?? rootPath;

	app.on("bootstrapEnd", (instance) => {
		if (targetPath) instance.options['_values']['out'] = targetPath;
	});

	app.renderer.on(RendererEvent.END, () => {
		vUtils.handleAssets(targetPath);
		vUtils.handleJeckyll(rootPath, targetPath);

		const metadata = vUtils.refreshMetadata(
			vUtils.loadMetadata(versionRoot),
			versionRoot,
			vOptions.stable,
			vOptions.dev,
			vOptions.packageFile,
		);

		vUtils.makeAliasLink(
			'stable',
			versionRoot,
			metadata.stable! ?? metadata.dev,
			vOptions.makeRelativeLinks,
		);
		vUtils.makeAliasLink(
			'dev',
			versionRoot,
			metadata.dev! ?? metadata.stable,
			vOptions.makeRelativeLinks,
		);
		vUtils.makeMinorVersionLinks(
			metadata.versions!,
			versionRoot,
			vOptions.makeRelativeLinks,
		);

		const jsVersionKeys = vUtils.makeJsKeys(metadata);
		fs.writeFileSync(path.join(versionRoot, 'versions.js'), jsVersionKeys);

		// Package-level index.html: redirect to stable/ or dev/
		fs.writeFileSync(
			path.join(versionRoot, 'index.html'),
			`<meta http-equiv="refresh" content="0; url=${
				metadata.stable ? 'stable/' : 'dev/'
			}"/>`,
		);

		vUtils.saveMetadata(metadata, versionRoot);

		if (isMonorepo) {
			const pkgsMeta = vUtils.loadPackagesMetadata(rootPath);
			if (!pkgsMeta.packages.includes(vOptions.monorepo!.name)) {
				pkgsMeta.packages.push(vOptions.monorepo!.name);
				pkgsMeta.packages.sort();
			}
			vUtils.savePackagesMetadata(pkgsMeta, rootPath);

			fs.writeFileSync(
				path.join(rootPath, 'packages.js'),
				vUtils.makePackagesJs(pkgsMeta.packages),
			);

			fs.writeFileSync(
				path.join(rootPath, 'index.html'),
				vUtils.makePackagesIndexHtml(pkgsMeta.packages),
			);
		}
	});

	return vOptions;
}

export { vUtils as utils, vHooks as hook };
