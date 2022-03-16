export interface IPluginOptions {
	port?: number;
	enabled?: boolean;
	[key: string]: any;
}

export interface IPlugins {
	[key: string]: IPluginOptions;
}

export interface IPeer {
	ip: string;
	port: number;
	ports?: Record<string, number>;
	plugins?: IPlugins;
	version?: string;
	height?: number;
	latency?: number;
}

export interface IPeerResponse {
	ip: string;
	port: number;
	ports: Record<string, number>;
	plugins?: IPlugins;
	version: string;
	height: number;
	latency: number;
}
