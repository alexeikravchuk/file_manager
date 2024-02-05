import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream';
import Accumulator from '../utils/Accumulator.js';

export default class FileEditor {
	#state;

	constructor(state) {
		this.#state = state;
	}

	read(output, fileName) {
		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);


		return new Promise((resolve, reject) => {
			try {
				const fileStream = createReadStream(filePath);

				const accumulator = new Accumulator();

				pipeline(
					fileStream,
					accumulator,
					(err) => {
						if (err) {
							reject();
						} else {
							const content = accumulator.buffer.toString();
							console.log(content);
							resolve();
						}
					},
				);
			} catch {
				reject();
			}
		});
	}
}