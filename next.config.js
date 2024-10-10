/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        BaseURL : "https://sw3px4kmhm3irjwvvq5bfsoupi0wtxmj.lambda-url.ap-south-1.on.aws/",
        BaseURLAuth : "https://apis.testkdlakshya.uchhal.in/auth",
        AUTH0_LOGIN_REDIRECT_URL: "http://localhost:3000/",
        AUTH0_LOGOUT_REDIRECT_URL: "http://localhost:3000/",
        DOMAIN_NAME: "dev-p3hppyisuuaems5y",
    }
};

module.exports = nextConfig;
