import isUrl from "is-url-superb";
import ky from "ky-universal";
import orderBy from "lodash.orderby";
import { satisfies } from "semver";

import { IPeer, IPeerResponse, IPluginOptions } from "./interfaces";
import { getConfig } from "./networks";
import { validatePort, validateProperty } from "./utils";

export class PeerDiscovery {
	readonly #host: string;
	#peers: IPeer[];
	#version: string | undefined;
	#latency: number | undefined;
	#orderBy: string[] = ["latency", "desc"];

	private constructor(host: string) {
		this.#host = host;
	}

	public static async new(networkOrHost: string): Promise<PeerDiscovery> {
		if (!networkOrHost || typeof networkOrHost !== "string") {
			throw new Error("No network or host provided");
		}

		let host: string;

		if (isUrl(networkOrHost)) {
			host = [networkOrHost, "peers"].join(networkOrHost.endsWith("/") ? "" : "/");
		} else {
			host = getConfig(networkOrHost);

			if (!host) {
				throw new Error(`No configuration found for '${networkOrHost}'`);
			}
		}

		const peerDiscovery = new PeerDiscovery(host);

		await peerDiscovery.refresh();

		return peerDiscovery;
	}

	public async refresh(): Promise<PeerDiscovery> {
		const peers: IPeer[] = [];

		try {
			const body: any = await ky.get(this.#host).json();

			for (const peer of body.data as IPeerResponse[]) {
				const pluginName: string | undefined = Object.keys(peer.ports).find((key: string) =>
					/core-api$/i.test(key),
				);

				let port: number;

				if (pluginName) {
					const apiPort = peer.ports[pluginName];

					if (validatePort(apiPort)) {
						port = apiPort;
					}
				}

				if (port) {
					peers.push(peer);
				}
			}
		} catch {
			throw new Error("Failed to discover any peers.");
		}

		if (!peers.length) {
			throw new Error("No peers found");
		}

		this.#peers = peers;

		return this;
	}

	public getPeers(): IPeer[] {
		return this.#peers;
	}

	public withVersion(version: string): PeerDiscovery {
		this.#version = version;

		return this;
	}

	public withLatency(latency: number): PeerDiscovery {
		this.#latency = latency;

		return this;
	}

	public sortBy(key: string, direction = "desc"): PeerDiscovery {
		this.#orderBy = [key, direction];

		return this;
	}

	public findPeers(opts: { additional?: string[] } = {}): IPeer[] {
		const peers = this.#applyOptions();

		return peers.map((peer: IPeer) => this.#transformPeer(peer, opts));
	}

	public findPeersWithPlugin(
		name: string,
		opts: { exactMatch?: boolean; additional?: string[]; pluginOptions?: IPluginOptions } = {},
	): IPeer[] {
		const peers: IPeer[] = [];

		for (const peer of this.#peers) {
			const pluginName: string | undefined = Object.keys(peer.ports).find((key: string) => {
				let regex: RegExp;

				if (opts.exactMatch) {
					regex = new RegExp(`^${name}$`);
				} else {
					regex = new RegExp(`${name}$`, "i");
				}

				return regex.test(key);
			});

			if (pluginName) {
				const pluginOptions = {
					enabled: true,
					port: undefined,
					...(opts.pluginOptions ?? {}),
				};

				const { port: pluginPort, ...properties }: IPluginOptions = peer.plugins[pluginName];

				let isMatch = true;

				for (const [property, value] of Object.entries(pluginOptions)) {
					if (property === "port") {
						isMatch = validatePort(peer.ports[pluginName], value as number);

						if (isMatch) {
							continue;
						}

						break;
					}

					isMatch = validateProperty(properties[property], value);

					if (isMatch) {
						continue;
					}

					break;
				}

				if (!isMatch) {
					continue;
				}

				const peerData: IPeer = this.#transformPeer({ ...peer, port: pluginPort }, opts);

				peers.push(peerData);
			}
		}

		return peers;
	}

	public findPeersWithoutEstimates(opts: { additional?: string[] } = {}): IPeer[] {
		return this.findPeersWithPlugin("core-api", { pluginOptions: { estimateTotalCount: false }, ...opts });
	}

	#applyOptions(): IPeer[] {
		let peers: IPeer[] = this.#peers;

		if (this.#version) {
			peers = peers.filter((peer: IPeer) => satisfies(peer.version, this.#version));
		}

		if (this.#latency) {
			peers = peers.filter((peer: IPeer) => peer.latency <= this.#latency);
		}

		return orderBy(peers, [this.#orderBy[0]], [this.#orderBy[1] as any]);
	}

	#transformPeer(peer: IPeer, opts: { additional?: string[] }): IPeer {
		const peerData: IPeer = {
			ip: peer.ip,
			port: peer.port,
		};

		if (opts.additional && Array.isArray(opts.additional)) {
			for (const additional of opts.additional) {
				if (typeof peer[additional] === "undefined") {
					continue;
				}

				peerData[additional] = peer[additional];
			}
		}

		return peerData;
	}
}
