/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    additionalData: `@use "src/styles/_variables.scss" as *;`
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb'
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apia-plataform.s3.sa-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      },
    )

    fileLoaderRule.exclude = /\.svg$/i

    return config
  }
};

export default nextConfig;

