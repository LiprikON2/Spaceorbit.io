const path = require("path");
const { mergeWithCustomize, unique } = require("webpack-merge");
const { InjectManifest } = require("workbox-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const common = require("./webpack.common");

// const WebpackObfuscator = require('webpack-obfuscator')

const prod = {
    mode: "production",
    stats: "errors-warnings",
    output: {
        filename: "[name].[contenthash].bundle.js",
        chunkFilename: "[name].[contenthash].chunk.js",
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    filename: "[name].[contenthash].bundle.js",
                },
            },
        },
    },
    plugins: [
        // disabled by default (uncomment to active)
        // new WebpackObfuscator(
        //   {
        //     rotateStringArray: true,
        //     stringArray: true,
        //     stringArrayThreshold: 0.75
        //   },
        //   ['vendors.*.js', 'sw.js']
        // ),
        new HtmlWebpackPlugin({
            gameName: "Spaceorbit.io",
            template: "src/index.html",
            dev: false,
        }),

        new InjectManifest({
            swSrc: path.resolve(__dirname, "../pwa/sw.js"),
            swDest: "sw.js",
            // PWA asset caching size limit (for offline)
            maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$|\.jsx?$/,
                include: path.join(__dirname, "../src"),
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            // ignores typescript errors on build
                            transpileOnly: true,
                        },
                    },
                ],
            },
        ],
    },
};

module.exports = mergeWithCustomize({
    customizeArray: unique(
        "plugins",
        ["HtmlWebpackPlugin"],
        (plugin) => plugin.constructor && plugin.constructor.name
    ),
})(common, prod);
