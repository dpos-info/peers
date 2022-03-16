const NETWORKS = {
	"ark.devnet": {
		api: "https://dapi.ark.io/api/peers",
		defaultPort: 4003,
	},
	"ark.mainnet": {
		api: "https://api.ark.io/api/peers",
		defaultPort: 4003,
	},
	"sxp.mainnet": {
		api: "https://sxp.mainnet.sh/api/peers",
		defaultPort: 6003,
	},
	"sxp.testnet": {
		api: "https://sxp.testnet.sh/api/peers",
		defaultPort: 6003,
	},
};

export const getConfig = (network: keyof typeof NETWORKS) => NETWORKS[network];
