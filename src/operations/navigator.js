import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { readdir, access } from 'node:fs/promises';

export default class Navigator {
	#state;

	constructor(state) {
		this.#state = state;
		this.#init();
	}

	#init() {
		const homeDir = homedir();
		this.#state.setValue('homeDir', homeDir);
		this.#state.setValue('currentDir', homeDir);
	}

	navigateUp() {
		return this.changeDir('..');
	}

	async changeDir(path) {
		const currentDir = this.#state.getValue('currentDir');
		const newDir = resolve(currentDir, path);

		try {
			await access(newDir);
			this.#state.setValue('currentDir', newDir);
			return newDir;
		} catch {
			throw new Error('Directory does not exist');
		}
	}

	async listDir(output) {
		const currentDir = this.#state.getValue('currentDir');
		const dirents = await readdir(currentDir, { withFileTypes: true });
		await output.writeFilesTable(dirents);
		return dirents;
	}
}
