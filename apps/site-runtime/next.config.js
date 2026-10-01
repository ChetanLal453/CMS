/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@uadmin/shared'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "react$": require.resolve("react"),
        "react-dom$": require.resolve("react-dom"),
        "react/jsx-runtime": require.resolve("react/jsx-runtime"),
        "react/jsx-dev-runtime": require.resolve("react/jsx-dev-runtime"),
      };
    }
    return config;
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
