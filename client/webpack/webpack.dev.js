const { merge } = require("webpack-merge");
const path = require("path");

const common = require("./webpack.common");

const dev = {
    mode: "development",
    stats: "errors-warnings",
    devtool: "eval",
    devServer: {
        // Auto-open browser
        open: false,
    },

    module: {
        rules: [
            {
                test: /\.tsx?$|\.jsx?$/,
                include: path.join(__dirname, "../src"),
                loader: "ts-loader",
            },
        ],
    },
};

module.exports = merge(common, dev);
