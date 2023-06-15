/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        require("autoprefixer"),
        require("postcss-nested"),
        require("postcss-preset-env")({
            stage: 0,
            minimumVendorImplementations: 0,
        }),
    ],
};

module.exports = config;
