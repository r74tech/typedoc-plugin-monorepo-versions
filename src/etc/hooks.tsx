/**
 * Typdoc hooks and injections for typedoc-plugin-versions
 *
 * @module
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Application, JSX, type RendererHooks } from 'typedoc';

/**
 * Injects browser js to control the behaviour of the new `select` DOM element
 * @param app
 * @param getIsMonorepo Lazy getter evaluated at render time
 */
export function injectSelectJs(
	app: Application,
	getIsMonorepo: () => boolean = () => false,
) {
	app.renderer.hooks.on('body.end', (ctx) => {
		const mono = getIsMonorepo();
		const attrs: Record<string, string> = {
			id: 'plugin-versions-script',
			src: ctx.relativeURL('assets/versionsMenu.js'),
			type: 'module',
		};
		if (mono) {
			attrs['data-monorepo'] = 'true';
		}
		return <script {...attrs}></script>;
	});
}

export type ValidHookLocation = keyof RendererHooks | 'false';

const validHookLocations: ValidHookLocation[] = [
	'head.begin',
	'head.end',
	'body.begin',
	'body.end',
	'content.begin',
	'content.end',
	'sidebar.begin',
	'sidebar.end',
	'pageSidebar.begin',
	'pageSidebar.end',
	'footer.begin',
	'footer.end',
	'comment.beforeTags',
	'comment.afterTags',
] as const;

/**
 * Injects the new `select` dropdown into the HTML.
 * domLocation and isMonorepo are resolved lazily via getter functions
 * so that typedoc.json values are available at render time.
 * @param app
 * @param getDomLocation Lazy getter for domLocation
 * @param getIsMonorepo Lazy getter for isMonorepo
 */
export function injectSelectHtml(
	app: Application,
	getDomLocation: () => ValidHookLocation = () => 'false',
	getIsMonorepo: () => boolean = () => false,
) {
	// Register on all possible hook locations; the callbacks check at render time
	// which location was actually requested and only render for that one.
	// This avoids needing to know the location at registration time.

	// Default location (pageSidebar.begin with styles)
	app.renderer.hooks.on('head.end', () => {
		const domLocation = getDomLocation();
		if (
			validHookLocations.indexOf(domLocation) > -1 &&
			domLocation !== 'false'
		)
			return <></>;
		return (
			<style>{`
				.tsd-ext-version-select .settings-label {
					margin: 0.75rem 0.75rem 0.75rem 0;
				}
			`}</style>
		);
	});

	app.renderer.hooks.on('pageSidebar.begin', () => {
		const domLocation = getDomLocation();
		const mono = getIsMonorepo();
		if (
			validHookLocations.indexOf(domLocation) > -1 &&
			domLocation !== 'false'
		)
			return <></>;
		return (
			<div class="tsd-ext-version-select">
				{mono && (
					<>
						<label
							class="settings-label"
							for="plugin-packages-select"
						>
							Package
						</label>
						<select
							id="plugin-packages-select"
							name="packages"
						></select>
					</>
				)}
				<label class="settings-label" for="plugin-versions-select">
					Version
				</label>
				<select id="plugin-versions-select" name="versions"></select>
			</div>
		);
	});

	// Custom hook location (includes head.end and pageSidebar.begin
	// so that domLocation can explicitly target those locations too)
	for (const loc of validHookLocations) {
		if (loc === 'false') continue;
		app.renderer.hooks.on(loc, () => {
			const domLocation = getDomLocation();
			const mono = getIsMonorepo();
			if (domLocation !== loc) return <></>;
			return (
				<>
					{mono && (
						<select
							id="plugin-packages-select"
							name="packages"
						></select>
					)}
					<select
						id="plugin-versions-select"
						name="versions"
					></select>
				</>
			);
		});
	}
}
