# @dpos-info/peers

[![Latest Version](https://badgen.now.sh/npm/v/@dpos-info/peers)](https://www.npmjs.com/package/@dpos-info/peers)
[![License: MIT](https://badgen.now.sh/badge/license/MIT/green)](https://opensource.org/licenses/MIT)

> A simple peer discovery client for ARK Core based blockchains.

## Installation

```bash
yarn add @dpos-info/peers
```

## Usage

### Initialise with Network or Host

```ts
import { PeerDiscovery } from "@dpos-info/peers";

peerDiscovery = await PeerDiscovery.new("ark.devnet");

// or

peerDiscovery = await PeerDiscovery.new("http://dapi.ark.io/api");
```

Available networks:

- `ark.mainnet`
- `ark.devnet`
- `sxp.mainnet`
- `sxp.testnet`

### Configure Version or Latency

```ts
peers = peerDiscovery.withVersion(">=3.0.0").withLatency(300);
```

### Find Peers

```ts
peers = await peerDiscovery.findPeers();

// with additional options

peers = await peerDiscovery.findPeers({
	additional: ["ports"],
});
```

### Find Peers with Plugin

```ts
peers = await peerDiscovery.findPeersWithPlugin("core-api");

// with plugin options

peers = await peerDiscovery.findPeersWithPlugin("core-api", {
	pluginOptions: { estimateTotalCount: false },
});
```

## Testing

```bash
yarn test
```

## Security

If you discover a security vulnerability within this package, please send an e-mail to security@dpos.info.

## License

[MIT](LICENSE)
