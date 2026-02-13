import { beforeAll, afterAll, mock } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import { docsPath, stubVersions } from './stubs/stubs.js';

mock.module('console', () => ({
	error: () => {},
	warn: () => {},
	log: () => {},
}));

beforeAll(() => {
	deleteFolders([docsPath]);
	fs.mkdirSync(docsPath);
	stubVersions.forEach((version) => {
		fs.mkdirSync(path.join(docsPath, version));
	});
});

afterAll(() => {
	deleteFolders([docsPath]);
});

const deleteFolders = (folders: string[]) => {
	folders.forEach((folder) => {
		if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true });
	});
};
