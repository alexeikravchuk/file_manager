import { EOL } from 'node:os';
import { resolve, basename } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { writeFile, rename, unlink } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import Accumulator from '../utils/Accumulator.js';
import { getStyledText } from '../utils/getStyledText.js';

export default class FileEditor {
	#state;
	#output;

	constructor(state, output) {
		this.#state = state;
		this.#output = output;
	}

	async read(fileName) {
		if (!fileName) {
			return this.#output.writeInvalidInput();
		}

		const currentDir = this.#state.getValue('currentDir');
		const output = this.#output;
		const filePath = resolve(currentDir, fileName);

		try {
			const fileStream = createReadStream(filePath);
			const accumulator = new Accumulator();

			await pipeline(fileStream, accumulator);

			const content = accumulator.buffer.toString();
			const contentStyled = getStyledText(content, 'green');
			output.write(contentStyled + EOL);

		} catch (e) {
			return Promise.reject(e.message);
		}
	}

	add(fileName, ...content) {
		if (!fileName) {
			return this.#output.writeInvalidInput();
		}

		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);

		return writeFile(filePath, content.join(' '), { flag: 'wx' });
	}

	rename(oldName, newName) {
		if (!oldName || !newName) {
			return this.#output.writeInvalidInput();
		}

		const currentDir = this.#state.getValue('currentDir');
		const oldPath = resolve(currentDir, oldName);
		const newPath = resolve(currentDir, newName);

		return rename(oldPath, newPath);
	}

	async copy(fileName, newDirPath) {
		if (!fileName || !newDirPath) {
			return this.#output.writeInvalidInput();
		}

		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);
		const fileNameWithoutPath = basename(fileName);

		const newFilePath = resolve(currentDir, newDirPath, fileNameWithoutPath);

		try {
			const fileStream = createReadStream(filePath);
			const writeStream = createWriteStream(newFilePath, { flags: 'wx' });

			await pipeline(fileStream, writeStream);
			return true;
		} catch (e) {
			return Promise.reject(e.message);
		}
	}

	async move(fileName, newDirPath) {
		const isSuccess = await this.copy(fileName, newDirPath);

		if (isSuccess) {
			await this.delete(fileName);
			return true;
		}
	}

	delete(fileName) {
		if (!fileName) {
			return this.#output.writeInvalidInput();
		}

		const currentDir = this.#state.getValue('currentDir');
		const filePath = resolve(currentDir, fileName);

		return unlink(filePath);
	}
}