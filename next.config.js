/** @type {import('next').NextConfig} */
const nextConfig = {
        experimental: {
          serverActions: true,  // Enable server actions
        },
    env: {
        BaseURL : "https://qwqp4upxb2s2e5snuna7sw77me0pfxnj.lambda-url.ap-south-1.on.aws/"
    }
};

module.exports = nextConfig;
