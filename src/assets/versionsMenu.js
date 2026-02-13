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
		const packagesUrl = new URL(
			scriptEl.dataset.packagesUrl,
			document.baseURI,
		).href;
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
	const newPaths = window.location.pathname.replace(
		`/${thisVersion}/`,
		`/${versionSelect.value}/`,
	);
	const newUrl = new URL(newPaths, window.location.origin);
	window.location.assign(newUrl);
};
