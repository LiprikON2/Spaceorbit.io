const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const { EnvironmentPlugin } = require("webpack");

module.exports = {
    entry: ["./src/ui/Root.tsx"],
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
    },
    resolve: {
        extensions: [
            ".ts",
            ".tsx",
            ".js",
            ".jpg",
            ".jpeg",
            ".png",
            ".svg",
            ".webp",
            ".mp3",
            ".json",
        ],
        alias: {
            "~/game": path.resolve(__dirname, "../src/game/scripts"),
            "~/scenes": path.resolve(__dirname, "../src/game/scripts/scenes"),
            "~/managers": path.resolve(__dirname, "../src/game/scripts/managers"),
            "~/objects": path.resolve(__dirname, "../src/game/scripts/objects"),
            "~/assets": path.resolve(__dirname, "../src/game/assets"),

            "~/ui": path.resolve(__dirname, "../src/ui"),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "postcss-loader",
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|webp|mp3|json|ttf)$/i,
                type: "asset/resource",
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                    filename: "[name].bundle.js",
                },
            },
        },
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({ gameName: "Spaceorbit.io", template: "src/index.html", dev: true }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/game/assets", to: "assets" },
                { from: "pwa", to: "" },
                // { from: "src/favicon.ico", to: "" },
            ],
        }),
        // new EnvironmentPlugin(["NODE_ENV"]),
    ],
};
