import { createReadStream, createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { createBrotliCompress, createBrotliDecompress, constants as ZLIB_CONSTANTS } from 'node:zlib';
import { resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';

export default class Compressor {
	#state;
	#output;

	constructor(state, output) {
		this.#state = state;
		this.#output = output;
	}

	async compress(filePath, destinationPath) {
		if (!filePath || !destinationPath) {
			return this.#output.writeInvalidInput();
		}

		return this.#runBrotliPipeline(filePath, destinationPath, true);
	}

	decompress(filePath, destinationPath) {
		if (!filePath || !destinationPath) {
			return this.#output.writeInvalidInput();
		}

		return this.#runBrotliPipeline(filePath, destinationPath, false);
	}

	async #runBrotliPipeline(filePath, destinationPath, isCompressing = true) {
		const currentDir = this.#state.getValue('currentDir');
		const inputFilePath = resolve(currentDir, filePath);
		const outputFilePath = resolve(currentDir, destinationPath);

		const options = {
			flush: ZLIB_CONSTANTS.BROTLI_OPERATION_PROCESS,
			params: {
				[ZLIB_CONSTANTS.BROTLI_PARAM_MODE]: ZLIB_CONSTANTS.BROTLI_MODE_TEXT,
			},
		};

		try {
			await access(inputFilePath);

			const readStream = createReadStream(inputFilePath);
			const writeStream = createWriteStream(outputFilePath, { flags: 'wx' });
			const brotliStream = isCompressing ? createBrotliCompress(options) : createBrotliDecompress(options);

			await pipeline(readStream, brotliStream, writeStream);
			return outputFilePath;
		} catch (e) {
			console.log(e);
			return Promise.reject(e.message);
		}
	}
}
