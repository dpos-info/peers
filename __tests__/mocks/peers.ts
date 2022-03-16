import { IPeer } from "../../src/interfaces";

export const dummyPeersWebhooksApi: IPeer[] = [
	{
		ip: "1.1.1.1",
		port: 4001,
		ports: {
			"@arkecosystem/core-webhooks": 4104,
			"@arkecosystem/core-api": 4103,
		},
		plugins: {
			"@arkecosystem/core-api": {
				port: 4103,
				enabled: true,
				estimateTotalCount: false,
			},
			"@arkecosystem/core-webhooks": {
				port: 4104,
				enabled: true,
			},
		},
		version: "2.5.0",
		latency: 200,
	},
	{
		ip: "2.2.2.2",
		port: 4001,
		ports: {
			"@arkecosystem/core-webhooks": 4104,
			"@arkecosystem/core-api": 4103,
		},
		plugins: {
			"@arkecosystem/core-api": {
				port: 4103,
				enabled: true,
				estimateTotalCount: true,
			},
			"@arkecosystem/core-webhooks": {
				port: 4104,
				enabled: true,
			},
		},
		version: "2.6.0",
		latency: 100,
	},
];

export const dummyPeersPublicApi: IPeer[] = [
	{
		ip: "1.1.1.1",
		port: 4001,
		ports: {
			"@arkecosystem/core-webhooks": -1,
			"@arkecosystem/core-api": 4103,
		},
		plugins: {
			"@arkecosystem/core-api": {
				port: 4103,
				enabled: true,
				estimateTotalCount: false,
			},
			"@arkecosystem/core-webhooks": {
				port: 4104,
				enabled: false,
			},
		},
		version: "2.5.0",
		latency: 200,
	},
	{
		ip: "2.2.2.2",
		port: 4001,
		ports: {
			"@arkecosystem/core-api": 4103,
		},
		plugins: {
			"@arkecosystem/core-api": {
				port: 4103,
				enabled: true,
				estimateTotalCount: true,
			},
			"@arkecosystem/core-webhooks": {
				port: 4104,
				enabled: false,
			},
		},
		version: "2.6.0",
		latency: 100,
	},
];
