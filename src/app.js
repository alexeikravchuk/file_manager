import { argv } from 'node:process';
import { Navigator } from './operations/navigator.js';
import inputHandler from './services/input-service.js';
import outputHandler from './services/output-service.js';

export default class App {
	#state;
	navigator;

	constructor(state) {
		this.#state = state;
		this.navigator = new Navigator(state);
		this.input = inputHandler;
		this.output = outputHandler;

		this.init();
	}

	init() {
		const { input, output } = this;
		const state = this.#state;

		const args = this.#parseArgs(argv.slice(2));
		state.setValue('args', args);

		this.#defineOperations();

		output.write(`Welcome to the File Manager, ${args.username}!\n`);
		output.init({ state });

		output.printCurrentDir();

		input.init({ state, errorCb: output.writeError.bind(output) });
	}

	#defineOperations() {
		inputHandler.setOperation('up', this.navigator.navigateUp.bind(this));
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

}
