/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Enable server actions
  },
  env: {
    BaseURL:
      'https://sw3px4kmhm3irjwvvq5bfsoupi0wtxmj.lambda-url.ap-south-1.on.aws/',
  },
};

module.exports = nextConfig;
