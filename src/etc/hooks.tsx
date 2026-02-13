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
 * @param isMonorepo
 */
export function injectSelectJs(app: Application, isMonorepo = false) {
	app.renderer.hooks.on('body.end', (ctx) => {
		const attrs: Record<string, string> = {
			id: 'plugin-versions-script',
			src: ctx.relativeURL('assets/versionsMenu.js'),
			type: 'module',
		};
		if (isMonorepo) {
			attrs['data-monorepo'] = 'true';
			attrs['data-packages-url'] = ctx.relativeURL('packages.js');
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
 * Injects the new `select` dropdown into the HTML
 * @param app
 * @param domLocation
 * @param isMonorepo
 */
export function injectSelectHtml(
	app: Application,
	domLocation: ValidHookLocation,
	isMonorepo = false,
) {
	if (validHookLocations.indexOf(domLocation) > -1) {
		if (domLocation === 'false') return;
		app.renderer.hooks.on(domLocation, () => (
			<>
				{isMonorepo && (
					<select
						id="plugin-packages-select"
						name="packages"
					></select>
				)}
				<select id="plugin-versions-select" name="versions"></select>
			</>
		));
	} else {
		app.renderer.hooks.on('head.end', () => (
			<style>{`
				.tsd-ext-version-select .settings-label {
					margin: 0.75rem 0.75rem 0.75rem 0;
				}
			`}</style>
		));

		app.renderer.hooks.on('pageSidebar.begin', () => (
			<div class="tsd-ext-version-select">
				{isMonorepo && (
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
		));
	}
}
