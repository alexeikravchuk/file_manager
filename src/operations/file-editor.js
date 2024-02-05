import { resolve, basename } from 'node:path';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { writeFile, rename, unlink, stat } from 'node:fs/promises';
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

	async copy(fileName, newDirPath) {
		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);
		const fileNameWithoutPath = basename(fileName);

		const newFilePath = resolve(currentDir, newDirPath, fileNameWithoutPath);

		return new Promise((resolve, reject) => {
			try {
				const fileStream = createReadStream(filePath);
				const writeStream = createWriteStream(newFilePath);

				pipeline(
					fileStream,
					writeStream,
					(err) => {
						if (err) {
							reject(err.message);
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

	async move(fileName, newDirPath) {
		await this.copy(fileName, newDirPath);
		return this.delete(fileName);
	}

	delete(fileName) {
		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);

		return unlink(filePath);
	}
}