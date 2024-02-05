import { EOL } from 'node:os';
import { stdout } from 'node:process';
import { generateLsTable } from '../utils/generateLsTable.js';
import { getStyledText } from '../utils/getStyledText.js';
import readline from './readline.js';

class OutputService {
	#state;

	init(params) {
		const { state } = params;
		this.#state = state;
		this.writeStream = stdout;

		readline.on('close', () => {
			const { username } = this.#state.getValue('args');
			stdout.write(EOL + `Thank you for using File Manager, ${username}, goodbye!`);
			process.exit(0);
		});
	}

	printCurrentDir() {
		const currentDir = this.#state.getValue('currentDir');

		readline.setPrompt(`You are currently in ${currentDir}> `);
		readline.prompt();
	}

	write(text) {
		return new Promise((resolve) => {
			stdout.write(text, resolve);
		});
	}

	async writeFilesTable(dirents) {
		try {
			const table = generateLsTable(dirents);
			await console.log(table);
		} catch (e) {
			console.log(e);
		}
	}

	async writeError(text) {
		if (!text) {
			return;
		}

		const line = getStyledText(text, 'red', this.write);
		await this.write(line + EOL);
	}
}

export default new OutputService();
