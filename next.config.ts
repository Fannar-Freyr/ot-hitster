import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: ['127.0.0.1'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'mosaic.scdn.co',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'image-cdn-ak.spotifycdn.com',
				port: '',
			},
			{
				protocol: 'https',
				hostname: 'image-cdn-fa.spotifycdn.com',
				port: '',
			},
		],
	},
};

export default nextConfig;
