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
			const byeMessage = getStyledText(`Thank you for using File Manager, ${username}, goodbye!`, 'bold');
			stdout.write(EOL + byeMessage);
			process.exit(0);
		});
	}

	printCurrentDir() {
		const currentDir = this.#state.getValue('currentDir');
		const styledMessage = getStyledText(`You are currently in ${currentDir}`, 'yellow');
		readline.setPrompt(`${styledMessage}${EOL}> `);
		readline.prompt();
	}

	write(text) {
		return new Promise((resolve) => {
			stdout.write(text, resolve);
		});
	}

	async writeError(text) {
		if (!text) {
			return;
		}

		const line = getStyledText(text, 'red', this.write);
		await this.write(line + EOL);
	}

	writeInvalidInput() {
		return this.writeError('Invalid input');
	}
}

export default new OutputService();
