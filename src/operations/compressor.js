import { createReadStream, createWriteStream } from 'node:fs';
import { createBrotliCompress, createBrotliDecompress, constants as ZLIB_CONSTANTS } from 'node:zlib';
import { resolve } from 'node:path';
import { pipeline } from 'node:stream';

export default class Compressor {
	#state;

	constructor(state) {
		this.#state = state;
	}

	compress(filePath, destinationPath) {
		return new Promise((resolve, reject) => {
			this.#runBrotliPipeline({
				filePath,
				destinationPath,
				isCompressing: true,
				cb: (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				},
			});
		});
	}

	decompress(filePath, destinationPath) {
		return new Promise((resolve, reject) => {
			this.#runBrotliPipeline({
				filePath,
				destinationPath,
				isCompressing: false,
				cb: (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				},
			});
		});
	}

	#runBrotliPipeline(params) {
		const { filePath, destinationPath, isCompressing = true, cb } = params;

		const currentDir = this.#state.getValue('currentDir');
		const inputFilePath = resolve(currentDir, filePath);
		const outputFilePath = resolve(currentDir, destinationPath);

		const readStream = createReadStream(inputFilePath);
		const writeStream = createWriteStream(outputFilePath, { flags: 'wx' });


		const options = {
			flush: ZLIB_CONSTANTS.BROTLI_OPERATION_PROCESS,
			params: {
				[ZLIB_CONSTANTS.BROTLI_PARAM_MODE]: ZLIB_CONSTANTS.BROTLI_MODE_TEXT,
			},
		};

		const brotliStream = isCompressing ? createBrotliCompress(options) : createBrotliDecompress(options);

		return pipeline(readStream, brotliStream, writeStream, cb);
	}
}