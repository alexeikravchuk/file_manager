import { EOL } from 'node:os';
import { argv } from 'node:process';
import Navigator from './operations/navigator.js';
import FileEditor from './operations/file-editor.js';
import OsInfo from './operations/os-info.js';
import Hash from './operations/hash.js';
import Compressor from './operations/compressor.js';
import inputHandler from './services/input-service.js';
import outputHandler from './services/output-service.js';
import { getStyledText } from './utils/getStyledText.js';

export default class App {
	#state;
	#navigator;
	#fileEditor;
	#osInfo;
	#hash;
	#compressor;

	constructor(state) {
		this.input = inputHandler;
		this.output = outputHandler;

		this.#state = state;

		this.#navigator = new Navigator(state, outputHandler);
		this.#fileEditor = new FileEditor(state, outputHandler);
		this.#osInfo = new OsInfo(outputHandler);
		this.#hash = new Hash(state, outputHandler);
		this.#compressor = new Compressor(state, outputHandler);

		this.init();
	}

	init() {
		const { input, output } = this;
		const state = this.#state;

		const args = this.#parseArgs(argv.slice(2));
		state.setValue('args', args);

		this.#defineOperations();

		const welcomeMessage = getStyledText(`Welcome to the File Manager, ${args.username}!`, 'bold');
		output.write(welcomeMessage + EOL);
		output.init({ state });

		output.printCurrentDir();

		const inputErrorCb = async (message) => {
			await output.writeError(message);
			await output.printCurrentDir();
		};
		input.init({ state, errorCb: inputErrorCb });
	}

	#defineOperations() {
		const navigator = this.#navigator;
		const fileEditor = this.#fileEditor;
		const os = this.#osInfo;
		const hash = this.#hash;
		const compressor = this.#compressor;

		const operations = {
			up: navigator.navigateUp.bind(navigator),
			cd: navigator.changeDir.bind(navigator),
			ls: navigator.listDir.bind(navigator),
			cat: fileEditor.read.bind(fileEditor),
			add: fileEditor.add.bind(fileEditor),
			rn: fileEditor.rename.bind(fileEditor),
			cp: fileEditor.copy.bind(fileEditor),
			mv: fileEditor.move.bind(fileEditor),
			rm: fileEditor.delete.bind(fileEditor),
			os: os.getOsInfo.bind(os),
			hash: hash.getHash.bind(hash),
			compress: compressor.compress.bind(compressor),
			decompress: compressor.decompress.bind(compressor),
		};

		const wrapHandler = (handler) => {
			return (args) => {
				return Promise.resolve(handler(...args)).catch(e => {
					this.output.writeError('Operation failed');
				}).finally(() => {
					this.output.printCurrentDir();
				});
			};
		};

		Object.entries(operations).forEach(([command, handler]) => {
			this.input.setOperation(command, wrapHandler(handler));
		});
	}

	#parseArgs(args) {
		const result = { username: 'Username' };

		const validArgs = args.map((arg, idx) => arg.startsWith('--') ? arg : null).filter(arg => arg !== null);

		validArgs.forEach(arg => {
			const [key, value] = arg.slice(2).split('=');
			result[key] = value;
		});

		return result;
	}

}
