const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    // entry: ["./src/scripts/game.ts"],
    entry: ["./src/scripts/ui/index.tsx"],
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$|\.jsx?$/,
                include: path.join(__dirname, "../src"),
                loader: "ts-loader",
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                // use: [MiniCssExtractPlugin.loader, "css-loader"],
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
        new HtmlWebpackPlugin({ gameName: "Spaceorbit.io", template: "src/index.html" }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
                { from: "pwa", to: "" },
                { from: "src/favicon.ico", to: "" },
            ],
        }),
    ],
};
