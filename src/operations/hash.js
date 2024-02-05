import { createReadStream } from 'node:fs';
import { EOL } from 'node:os';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream';

export default class Hash {
	#state;

	constructor(state) {
		this.#state = state;
	}

	async getHash(output, filePath) {
		const currentDir = this.#state.getValue('currentDir');
		const fullPath = resolve(currentDir, filePath);

		const stream = createReadStream(fullPath);
		const hash = createHash('sha256');

		return new Promise((res, rej) => {
			pipeline(stream, hash, (err) => {
				if (err) {
					return rej(err);
				}

				const hexHash = hash.digest('hex');
				process.stdout.write(hexHash + EOL);
				res();
			});
		});

	}
}