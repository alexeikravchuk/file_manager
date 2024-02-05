import { cpus, EOL, homedir, userInfo, arch } from 'node:os';
import { getStyledText } from '../utils/getStyledText.js';

export default class OsInfo {
	#info;

	constructor() {
		this.init().then(info => this.#info = info);
	}

	async init() {
		return {
			'--EOL': EOL,
			'--cpus': this.#getCpusInfo(),
			'--homedir': homedir(),
			'--username': userInfo().username,
			'--architecture': arch(),
		};
	}

	async getOsInfo(output, key) {
		const info = this.#info[key];
		if (info) {
			return console.log(info);
		}

		await output.writeError('Invalid input');
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