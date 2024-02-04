import { homedir } from 'node:os';

export class Navigator {
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
		const currentDir = this.#state.getValue('currentDir');
		const parentDir = currentDir.split('/').slice(0, -1).join('/');

		this.#state.setValue('currentDir', parentDir);
	}
}
