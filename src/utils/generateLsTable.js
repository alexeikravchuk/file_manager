import { EOL } from 'node:os';

const INDEX = '(index)';
const NAME = 'Name';
const TYPE = 'Type';
const DIRECTORY = 'directory';
const FILE = 'file';
const SYMLINK = 'symlink';
const INDEX_LENGTH = INDEX.length + 2;
const NAME_LENGTH = NAME.length + 20;
const TYPE_LENGTH = DIRECTORY.length + 4;

export const generateLsTable = (dirents) => {
	let table = generateHeader();

	const sortedDirents = dirents.slice().sort((a, b) => {
		if (a.isDirectory() && !b.isDirectory()) {
			return -1;
		}
		if (!a.isDirectory() && b.isDirectory()) {
			return 1;
		}
		return a.name.localeCompare(b.name);
	});


	sortedDirents.forEach((dirent, index) => {
		const name = dirent.name;
		const type = dirent.isDirectory() ? DIRECTORY : dirent.isSymbolicLink() ? SYMLINK : FILE;

		table += getRow(index, name, type, true);
	});

	return table + BOTTOM_LINE;
};

const TOP_LINE = `${'┌'}${'─'.repeat(INDEX_LENGTH)}${'┬'}${'─'.repeat(NAME_LENGTH)}${'┬'}${'─'.repeat(TYPE_LENGTH)}${'┐'}${EOL}`;
const MID_LINE = `${'├'}${'─'.repeat(INDEX_LENGTH)}${'┼'}${'─'.repeat(NAME_LENGTH)}${'┼'}${'─'.repeat(TYPE_LENGTH)}${'┤'}${EOL}`;
const BOTTOM_LINE = `${'└'}${'─'.repeat(INDEX_LENGTH)}${'┴'}${'─'.repeat(NAME_LENGTH)}${'┴'}${'─'.repeat(TYPE_LENGTH)}${'┘'}${EOL}`;

const getRow = (index, name, type, styled=false) => {
	const nameTruncated = name.length > NAME_LENGTH ? name.slice(0, NAME_LENGTH - 3) + '...' : name;

	const indexSpace = (INDEX_LENGTH - index.toString().length) * 0.5 >> 0;
	const nameSpace = (NAME_LENGTH  - nameTruncated.length) * 0.5 >> 0;
	const typeSpace = (TYPE_LENGTH - type.length) * 0.5 >> 0;

	let indexText = `${' '.repeat(indexSpace)}${index}${' '.repeat(indexSpace)}`;
	let nameText = `${' '.repeat(nameSpace)}${nameTruncated}${' '.repeat(nameSpace)}`;
	let typeText = `${' '.repeat(typeSpace)}${type}${' '.repeat(typeSpace)}`;

	if (indexText.length < INDEX_LENGTH) {
		indexText += ' ';
	}
	if (nameText.length < NAME_LENGTH) {
		nameText += ' ';
	}
	if (typeText.length < TYPE_LENGTH) {
		typeText += ' ';
	}

	return `${'│'}${indexText}${'│'}${nameText}${'│'}${typeText}${'│'}${EOL}`;
};


const generateHeader = () => {
	return TOP_LINE + getRow(INDEX, NAME, TYPE) + MID_LINE;
};