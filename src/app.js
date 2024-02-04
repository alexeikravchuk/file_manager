import inputHandler from './handlers/input-handler.js';


export default class App {
	#state;
	inputHandler;

	constructor(state) {
		this.#state = state;
	}

	init() {
		this.inputHandler = inputHandler;
	}
}
