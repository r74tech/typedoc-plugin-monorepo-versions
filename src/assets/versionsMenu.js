import { DOC_VERSIONS } from '../../versions.js';

const scriptEl = document.getElementById('plugin-versions-script');
const isMonorepo = scriptEl?.dataset.monorepo === 'true';

const versionSelect = document.getElementById('plugin-versions-select');
const packageSelect = document.getElementById('plugin-packages-select');

DOC_VERSIONS.forEach((version) => {
	const option = document.createElement('option');
	option.value = version;
	option.innerHTML = version;
	versionSelect.appendChild(option);
});

const locationSplit = location.pathname.split('/');

if (isMonorepo && packageSelect) {
	try {
		// versions.js is at {root}/{package}/versions.js (imported via ../../versions.js)
		// packages.js is at {root}/packages.js — one level above versions.js
		const versionsDir = new URL('../../', import.meta.url);
		const packagesUrl = new URL('../packages.js', versionsDir).href;
		const { DOC_PACKAGES } = await import(packagesUrl);

		DOC_PACKAGES.forEach((pkg) => {
			const option = document.createElement('option');
			option.value = pkg;
			option.innerHTML = pkg;
			packageSelect.appendChild(option);
		});

		// Detect current package from URL: /{package}/{version}/...
		const currentPackage = DOC_PACKAGES.find((pkg) =>
			locationSplit.includes(pkg),
		);
		if (currentPackage) {
			packageSelect.value = currentPackage;
		}

		packageSelect.onchange = () => {
			const newPkg = packageSelect.value;
			// Navigate to the new package's stable page
			const pkgIndex = locationSplit.indexOf(currentPackage);
			if (pkgIndex > -1) {
				const newPaths = [...locationSplit];
				newPaths[pkgIndex] = newPkg;
				// Reset to stable when switching packages
				if (pkgIndex + 1 < newPaths.length) {
					newPaths[pkgIndex + 1] = 'stable';
					newPaths.length = pkgIndex + 2;
				}
				const newUrl = new URL(
					newPaths.join('/'),
					window.location.origin,
				);
				window.location.assign(newUrl);
			}
		};
	} catch {
		// Fallback: hide package select if packages.js fails to load
		packageSelect.style.display = 'none';
	}
}

const thisVersion = locationSplit.find((path) =>
	['stable', 'dev', ...DOC_VERSIONS].includes(path),
);
versionSelect.value = DOC_VERSIONS.includes(thisVersion)
	? thisVersion
	: DOC_VERSIONS[0];
versionSelect.onchange = () => {
	const newPath = window.location.pathname.replace(
		`/${thisVersion}/`,
		`/${versionSelect.value}/`,
	);
	window.location.assign(new URL(newPath, window.location.origin));
};

// Remove dropdown options where the current page doesn't exist in that version.
// Checks the exact page path (not just index.html) so switching always succeeds.
(async () => {
	const packageRoot = new URL('../../', import.meta.url).href;
	// Path relative to the version root (e.g. "types/WikitextMode.html")
	const versionIdx = locationSplit.indexOf(thisVersion);
	const pagePath =
		versionIdx > -1 ? locationSplit.slice(versionIdx + 1).join('/') : '';

	const checks = [...versionSelect.options].map(async (option) => {
		const ver = option.value;
		if (ver === 'stable' || ver === 'dev') return;
		const checkPath = pagePath || 'index.html';
		try {
			const res = await fetch(
				new URL(`${ver}/${checkPath}`, packageRoot).href,
				{ method: 'HEAD' },
			);
			if (!res.ok) option.remove();
		} catch {
			option.remove();
		}
	});
	await Promise.all(checks);
})();
