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
				return this.onMessage(line.trim());
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
			const mergedArgs = this.#checkStringsOnArgs(args);
			handler(mergedArgs);
		} else {
			const text = 'Invalid input';
			this.#errorCb(text);
		}
	}

	#checkStringsOnArgs(args) {
		const regex = /"([^"]+)"|'([^']+)'|(\S+)/g;
		let match;
		const paths = [];

		let line = args.join(' ');

		while ((match = regex.exec(line)) !== null) {
			const path = match[1] || match[2] || match[3];
			paths.push(path);
		}

		return paths;
	}
}

export default new InputService();
