import { createReadStream } from 'node:fs';
import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';

import { getStyledText } from '../utils/getStyledText.js';

export default class Hash {
	#state;
	#output;

	constructor(state, output) {
		this.#state = state;
		this.#output = output;
	}

	async getHash(filePath) {
		const currentDir = this.#state.getValue('currentDir');
		const fullPath = resolve(currentDir, filePath);

		const stream = createReadStream(fullPath);
		const hash = createHash('sha256');

		try {
			await pipeline(stream, hash);

			const hexHash = hash.digest('hex');
			const hexHashStyled = getStyledText(hexHash, 'blue');
			this.#output.write(hexHashStyled + EOL);
		} catch {
			return Promise.reject();
		}
	}
}
