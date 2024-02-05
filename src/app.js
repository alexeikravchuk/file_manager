import { argv } from 'node:process';
import Navigator from './operations/navigator.js';
import FileEditor from './operations/file-editor.js';
import OsInfo from './operations/os-info.js';
import inputHandler from './services/input-service.js';
import outputHandler from './services/output-service.js';

export default class App {
	#state;
	#navigator;
	#fileEditor;
	#osInfo;

	constructor(state) {
		this.#state = state;
		this.#navigator = new Navigator(state);
		this.#fileEditor = new FileEditor(state);
		this.#osInfo = new OsInfo();
		this.input = inputHandler;
		this.output = outputHandler;

		this.init();
	}

	init() {
		const { input, output } = this;
		const state = this.#state;

		const args = this.#parseArgs(argv.slice(2));
		state.setValue('args', args);

		this.#defineOperations();

		output.write(`Welcome to the File Manager, ${args.username}!\n`);
		output.init({ state });

		output.printCurrentDir();

		const inputErrorCb = (message) => {
			output.writeError(message).then(() => output.printCurrentDir());
		};
		input.init({ state, errorCb: inputErrorCb });
	}

	#defineOperations() {
		const navigator = this.#navigator;
		const fileEditor = this.#fileEditor;
		const os = this.#osInfo;

		const operations = {
			up: navigator.navigateUp.bind(navigator),
			cd: navigator.changeDir.bind(navigator),
			ls: navigator.listDir.bind(navigator, this.output),
			cat: fileEditor.read.bind(fileEditor, this.output),
			add: fileEditor.add.bind(fileEditor),
			rn: fileEditor.rename.bind(fileEditor),
			cp: fileEditor.copy.bind(fileEditor),
			mv: fileEditor.move.bind(fileEditor),
			rm: fileEditor.delete.bind(fileEditor),
			os: os.getOsInfo.bind(os, this.output),
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
