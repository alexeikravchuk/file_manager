import { cpus, EOL, homedir, userInfo, arch } from 'node:os';
import { getStyledText } from '../utils/getStyledText.js';

export default class OsInfo {
	#info;
	#output;

	constructor(output) {
		this.#output = output;
		this.init().then(info => this.#info = info);
	}

	async init() {
		return {
			'--EOL': getStyledText(JSON.stringify(EOL), 'cyan'),
			'--cpus': this.#getCpusInfo(),
			'--homedir': getStyledText(homedir(), 'cyan'),
			'--username': getStyledText(userInfo().username, 'cyan'),
			'--architecture': getStyledText(arch(), 'cyan'),
		};
	}

	async getOsInfo(key) {
		const output = this.#output;

		const info = this.#info[key];

		if (info !== undefined) {
			return output.write(info + EOL);
		}

		return output.writeError('Invalid input');
	}

	#getCpusInfo() {

		const info = cpus().map(cpu => {
			const { model, speed } = cpu;
			const modelStyled = getStyledText(`'${model.trim()}'`, 'cyan');
			const speedStyled = getStyledText(`'${speed > 1000 ? speed * 0.001 : speed} GHz'`, 'yellow');
			return `  { model: ${modelStyled}, speed: ${speedStyled} }`;
		}).join(`,${EOL}`);

		return `[${EOL}${info}${EOL}]`;
	}
}
