import nock from "nock";
import { PeerDiscovery } from "../src/discovery";
import { dummyPeersPublicApi, dummyPeersWebhooksApi } from "./mocks/peers";

beforeEach(() => {
	nock.cleanAll();
});

describe("PeerDiscovery", () => {
	describe("new instance", () => {
		it("should fail if no network or host is provided", async () => {
			await expect(PeerDiscovery.new(undefined)).rejects.toThrowError(new Error("No network or host provided"));
		});

		describe("host", () => {
			it("should fetch peers", async () => {
				nock("http://127.0.0.1").get("/api/peers").reply(200, {
					data: dummyPeersWebhooksApi,
				});

				const peerDiscovery: PeerDiscovery = await PeerDiscovery.new("http://127.0.0.1/api");

				expect(peerDiscovery.getPeers()).toEqual(dummyPeersWebhooksApi);
			});

			it("should fetch peers if host ends with slash", async () => {
				nock("http://127.0.0.1").get("/api/peers").reply(200, {
					data: dummyPeersWebhooksApi,
				});

				const peerDiscovery: PeerDiscovery = await PeerDiscovery.new("http://127.0.0.1/api/");

				expect(peerDiscovery.getPeers()).toEqual(dummyPeersWebhooksApi);
			});

			it("should fail if the seed list is empty", async () => {
				nock("http://127.0.0.1").get("/api/peers").reply(200, {
					data: [],
				});

				await expect(PeerDiscovery.new("http://127.0.0.1/api")).rejects.toThrowError(
					new Error("No peers found"),
				);
			});
		});

		describe("config", () => {
			it("should fetch peers", async () => {
				nock("https://dapi.ark.io").get("/api/peers").reply(200, { data: dummyPeersPublicApi });

				const peerDiscovery: PeerDiscovery = await PeerDiscovery.new("ark.devnet");

				expect(peerDiscovery.getPeers()).toEqual(dummyPeersPublicApi);
			});

			it("should fail if network is not configured", async () => {
				await expect(PeerDiscovery.new("failnet")).rejects.toThrowError(
					new Error("No configuration found for 'failnet'"),
				);
			});

			it("should fail if a 404 response is received", async () => {
				nock("https://dapi.ark.io").get("/api/peers").reply(404);

				await expect(PeerDiscovery.new("ark.devnet")).rejects.toThrowError(
					new Error("Failed to discover any peers."),
				);
			});

			it("should fail if the seed list is empty", async () => {
				nock("https://dapi.ark.io").get("/api/peers").reply(200, { data: [] });

				await expect(PeerDiscovery.new("ark.devnet")).rejects.toThrowError(new Error("No peers found"));
			});
		});
	});

	describe("findPeers", () => {
		let peerDiscovery: PeerDiscovery;
		const validPeers = dummyPeersWebhooksApi.map((peer) => ({ ip: peer.ip, port: peer.port }));

		beforeEach(async () => {
			nock("http://127.0.0.1").get("/api/peers").reply(200, {
				data: dummyPeersWebhooksApi,
			});

			peerDiscovery = await PeerDiscovery.new("http://127.0.0.1/api");
		});

		it("should find peers", () => {
			expect(peerDiscovery.findPeers()).toEqual(validPeers);
		});

		it("should filter by version", () => {
			expect(peerDiscovery.withVersion("2.6.0").findPeers()).toEqual([validPeers[1]]);

			expect(peerDiscovery.withVersion(">=2.5.0").findPeers()).toEqual(validPeers);
		});

		it("should filter by latency", () => {
			expect(peerDiscovery.withLatency(150).findPeers()).toEqual([validPeers[1]]);

			expect(peerDiscovery.withLatency(250).findPeers()).toEqual(validPeers);
		});

		it("should sort by latency asc", () => {
			expect(peerDiscovery.sortBy("latency", "asc").findPeers()).toEqual([validPeers[1], validPeers[0]]);
		});

		it("should sort by version desc", () => {
			expect(peerDiscovery.sortBy("version").findPeers()).toEqual([validPeers[1], validPeers[0]]);
		});
	});

	describe("findPeersWithPlugin", () => {
		let peerDiscovery: PeerDiscovery;

		beforeEach(async () => {
			nock("http://127.0.0.1").get("/api/peers").reply(200, {
				data: dummyPeersWebhooksApi,
			});

			peerDiscovery = await PeerDiscovery.new("http://127.0.0.1/api");
		});

		it("should find peers", () => {
			const validPeers = dummyPeersWebhooksApi.map((peer) => ({ ip: peer.ip, port: 4104 }));
			expect(peerDiscovery.findPeersWithPlugin("core-webhooks")).toEqual(validPeers);
		});

		it("should find peers with exact match", () => {
			const validPeers = dummyPeersWebhooksApi.map((peer) => ({ ip: peer.ip, port: 4104 }));
			expect(peerDiscovery.findPeersWithPlugin("@arkecosystem/core-webhooks", { exactMatch: true })).toEqual(
				validPeers,
			);
		});

		it("should find peers with a given port", () => {
			const validPeers = dummyPeersWebhooksApi.map((peer) => ({ ip: peer.ip, port: 4104 }));
			expect(peerDiscovery.findPeersWithPlugin("core-webhooks", { pluginOptions: { port: 4104 } })).toEqual(
				validPeers,
			);
		});

		it("should return empty list if no peer found with a given port", () => {
			expect(peerDiscovery.findPeersWithPlugin("core-webhooks", { pluginOptions: { port: 5555 } })).toEqual([]);
		});

		it("should get additional peer data", () => {
			const validPeers = dummyPeersWebhooksApi.map((peer) => ({
				ip: peer.ip,
				port: 4104,
				version: peer.version,
			}));
			expect(
				peerDiscovery.findPeersWithPlugin("core-webhooks", {
					additional: ["version"],
				}),
			).toEqual(validPeers);
		});

		it("should ignore additional peer data that does not exist", () => {
			const validPeers = dummyPeersWebhooksApi.map((peer) => ({ ip: peer.ip, port: 4104 }));
			expect(
				peerDiscovery.findPeersWithPlugin("core-webhooks", {
					additional: ["fake"],
				}),
			).toEqual(validPeers);
		});
	});

	describe("findPeersWithoutEstimates", () => {
		let peerDiscovery: PeerDiscovery;
		beforeEach(async () => {
			nock("http://127.0.0.1").get("/api/peers").reply(200, {
				data: dummyPeersWebhooksApi,
			});

			peerDiscovery = await PeerDiscovery.new("http://127.0.0.1/api");
		});

		it("should find peers without estimates", () => {
			nock(/.+/).get("/api/peers").reply(200, {
				data: dummyPeersPublicApi,
			});

			const validPeers = dummyPeersPublicApi.map((peer) => ({ ip: peer.ip, port: 4103 }))[0];
			expect(peerDiscovery.findPeersWithoutEstimates()).toEqual([validPeers]);
		});
	});
});
