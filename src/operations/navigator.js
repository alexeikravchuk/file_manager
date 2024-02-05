import { EOL, homedir } from 'node:os';
import { resolve } from 'node:path';
import { readdir, access } from 'node:fs/promises';
import { generateLsTable } from '../utils/generateLsTable.js';

export default class Navigator {
	#state;
	#output;

	constructor(state, output) {
		this.#state = state;
		this.#output = output;

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
		if (!path) {
			return this.#output.writeInvalidInput();
		}

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

	async listDir() {
		const currentDir = this.#state.getValue('currentDir');
		const dirents = await readdir(currentDir, { withFileTypes: true });
		const table = generateLsTable(dirents);
		await this.#output.write(table + EOL);
		return dirents;
	}
}
