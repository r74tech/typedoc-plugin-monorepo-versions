import { beforeAll, afterAll, mock } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import {
	docsPath,
	stubVersions,
	monorepoDocsPath,
	monorepoPackages,
	monorepoVersionsPkgA,
	monorepoVersionsPkgB,
} from './stubs/stubs.js';

mock.module('console', () => ({
	error: () => {},
	warn: () => {},
	log: () => {},
}));

beforeAll(() => {
	deleteFolders([docsPath, monorepoDocsPath]);

	// Single-mode stubs
	fs.mkdirSync(docsPath);
	stubVersions.forEach((version) => {
		fs.mkdirSync(path.join(docsPath, version));
	});

	// Monorepo stubs
	fs.mkdirSync(monorepoDocsPath, { recursive: true });
	for (const pkg of monorepoPackages) {
		const pkgDir = path.join(monorepoDocsPath, pkg);
		fs.mkdirSync(pkgDir, { recursive: true });
		const versions =
			pkg === 'pkg-a' ? monorepoVersionsPkgA : monorepoVersionsPkgB;
		for (const ver of versions) {
			fs.mkdirSync(path.join(pkgDir, ver), { recursive: true });
		}
	}
});

afterAll(() => {
	deleteFolders([docsPath, monorepoDocsPath]);
});

const deleteFolders = (folders: string[]) => {
	folders.forEach((folder) => {
		if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true });
	});
};
