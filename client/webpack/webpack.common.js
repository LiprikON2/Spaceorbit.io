const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: ["./src/ui/main.tsx"],
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "~/game": path.resolve(__dirname, "../src/game/scripts"),
            "~/hooks": path.resolve(__dirname, "../src/ui/hooks"),
            "~/backend": path.resolve(__dirname, "../src/backend/"),
            "~/scenes": path.resolve(__dirname, "../src/game/scripts/scenes"),
            "~/managers": path.resolve(__dirname, "../src/game/scripts/managers"),
            "~/objects": path.resolve(__dirname, "../src/game/scripts/objects"),
            "~/components": path.resolve(__dirname, "../src/ui/components"),
        },
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
                { from: "src/game/assets", to: "assets" },
                { from: "pwa", to: "" },
                { from: "src/favicon.ico", to: "" },
            ],
        }),
    ],
};
