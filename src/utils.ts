const validateProperty = (a: any, b?: any): boolean => a === b;

const validatePort = (a: number, b?: number): boolean => {
	if (b === undefined) {
		return a >= 1 && a <= 65535;
	}

	return validateProperty(a, b);
};

export { validatePort, validateProperty };
