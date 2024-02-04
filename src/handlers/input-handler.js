import * as readline from 'node:readline/promises';
import { EOL, homedir } from 'node:os';
import { stdin as input, stdout as output, argv } from 'node:process';
import state from '../state.js';
import { getStyledText } from '../utils/getStyledText.js';

class InputHandler {
	#rl;
	#handlersMap = new Map();

	constructor() {
		this.init();

		this.start().then(() => {
			const { username } = state.getValue('args');

			output.write(`Thank you for using File Manager, ${username}, goodbye!`);
		});
	}

	init() {
		const args = this.#parseArgs(argv.slice(2));
		state.setValue('args', args);

		const homeDir = homedir();
		state.setValue('homeDir', homeDir);
		state.setValue('currentDir', homeDir);
	}

	async start() {
		const rl = this.#rl = readline.createInterface({ input, output });

		const { username } = state.getValue('args');
		output.write(`Welcome to the File Manager, ${username}!${EOL}`);
		this.#writeCurrentDir();

		for await (const line of rl) {
			this.onMessage(line);
		}
	}

	#parseArgs(args) {
		const result = { username: 'Username' };

		const validArgs = args.map((arg, idx) => arg.startsWith('--') ? arg : null).filter(arg => arg !== null);

		validArgs.forEach(arg => {
			const [key, value] = arg.slice(2).split('=');
			result[key] = value;
		});

		return result;
	}

	setHandler(command, handler) {
		this.#handlersMap.set(command, handler);
	}

	deleteHandler(command) {
		this.#handlersMap.delete(command);
	}

	onMessage(message) {
		const [command, ...args] = message.split(' ');

		if (command === '.exit') {
			return this.#rl.close();
		}

		const handler = this.#handlersMap.get(command);
		if (handler) {
			handler(args);
		} else {
			const text = getStyledText('Invalid input', 'red');
			output.write(text + EOL);
		}

		this.#writeCurrentDir();
	}

	#writeCurrentDir() {
		const currentDir = state.getValue('currentDir');

		this.#rl.setPrompt(`You are currently in ${currentDir}> `);
		this.#rl.prompt();
	}
}

export default new InputHandler();
