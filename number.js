export const num = (min, max) => {
	return Math.random() * (max - min) + min;
};
export const int = (min, max) => {
	return parseInt(num(min, max));
};
export const round = (n) => {
	return Math.round(n * 10) / 10;
};
