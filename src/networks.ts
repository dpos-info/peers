const NETWORKS = {
	ark: {
		devnet: "https://dapi.ark.io/api/peers",
		mainnet: "https://api.ark.io/api/peers",
	},
	sxp: {
		mainnet: "https://sxp.mainnet.sh/api/peers",
		testnet: "https://sxp.testnet.sh/api/peers",
	},
};

export const getConfig = (value: string): string | undefined => {
	const [coin, network] = value.split(".");

	if (!Object.keys(NETWORKS).includes(coin)) {
		return undefined;
	}

	return NETWORKS[coin][network];
};
