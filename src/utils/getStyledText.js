const colors = {
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
};

const reset = '\x1b[0m';
export const getStyledText = (text, color) => {

	const colorCode = colors[color] || '';

	return `${colorCode}${text}${reset}`;
};

// export const styledPartLength = (colors.red + reset).length;