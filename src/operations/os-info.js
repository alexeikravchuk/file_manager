import { EOL, cpus, homedir } from 'node:os';

export default class OsInfo {
	#info;

	constructor() {
		this.init().then(info => this.#info = info);
	}

	async init() {
		const info = {
			'--EOL': EOL,
			'--cpus': cpus(),
			'--homedir': homedir(),
			'--username': '',
		};

		return info;
	}

	async getOsInfo(output, key) {
		const info = this.#info[key];
		if (info) {
			return output.write(info);
		}

		await output.writeError('Invalid key');
	}

	#getCpusInfo() {
		return this.#info['--cpus'];
	}
}