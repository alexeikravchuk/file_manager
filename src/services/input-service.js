import readline from './readline.js';

class InputService {
	#operationsMap = new Map();
	#state;
	#errorCb;

	init(params) {
		const { state, errorCb } = params;
		this.#state = state;
		this.#errorCb = errorCb;

		readline.on('line', (line) => {
			if (line) {
				this.onMessage(line.trim());
			}

			this.#errorCb('');
		});
	}

	setOperation(command, handler) {
		this.#operationsMap.set(command, handler);
	}

	deleteOperation(command) {
		this.#operationsMap.delete(command);
	}

	onMessage(message) {
		const [command, ...args] = message.split(' ');

		if (command === '.exit') {
			return readline.close();
		}

		const handler = this.#operationsMap.get(command);

		if (handler) {
			handler(args);
		} else {
			const text = 'Invalid input';
			this.#errorCb(text);
		}
	}
}

export default new InputService();
