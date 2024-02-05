import { resolve } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { writeFile, rename } from 'node:fs/promises';
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

	add(fileName, content = '') {
		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);

		return writeFile(filePath, content);
	}

	rename(oldName, newName) {
		const currentDir = this.#state.getValue('currentDir');
		const oldPath = resolve(currentDir, oldName);
		const newPath = resolve(currentDir, newName);

		return rename(oldPath, newPath);
	}

	copy(fileName, newFileName) {
		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);
		const newFilePath = resolve(currentDir, newFileName);

		return new Promise((resolve, reject) => {
			try {
				const fileStream = createReadStream(filePath);
				const writeStream = createWriteStream(newFilePath);

				pipeline(
					fileStream,
					writeStream,
					(err) => {
						if (err) {
							reject();
						} else {
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