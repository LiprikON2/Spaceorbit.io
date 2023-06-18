const { merge } = require("webpack-merge");
const common = require("./webpack.common");

const dev = {
    mode: "development",
    stats: "errors-warnings",
    devtool: "eval",
    devServer: {
        // Auto-open browser
        open: false,
    },
};

module.exports = merge(common, dev);
