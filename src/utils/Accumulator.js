import { Transform } from 'stream';

export default class Accumulator extends Transform {
	constructor() {
		super();
		this.buffer = Buffer.alloc(0);
	}

	_transform(chunk, encoding, callback) {
		this.buffer = Buffer.concat([this.buffer, chunk]);
		callback();
	}

	_flush(callback) {
		this.push(this.buffer);
		callback();
	}
}
