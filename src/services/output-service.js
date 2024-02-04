import { EOL } from 'node:os';
import { stdout } from 'node:process';
import { getStyledText } from '../utils/getStyledText.js';
import readline from './readline.js';

class OutputService {
	#state;

	init(params) {
		const { state } = params;
		this.#state = state;

		readline.on('close', () => {
			const { username } = this.#state.getValue('args');
			stdout.write(EOL + `Thank you for using File Manager, ${username}, goodbye!`);
		});
	}

	printCurrentDir() {
		const currentDir = this.#state.getValue('currentDir');

		readline.setPrompt(`You are currently in ${currentDir}> `);
		readline.prompt();
	}

	write(text) {
		stdout.write(text);
	}

	writeError(text) {
		const line = getStyledText(text, 'red', this.write);
		this.write(line + EOL);
	}
}

export default new OutputService();
