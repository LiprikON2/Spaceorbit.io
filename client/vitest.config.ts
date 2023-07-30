import { defineConfig } from "vitest/config";

import webpackConfig from "./webpack/webpack.common";

const webpackAliases = webpackConfig.resolve.alias;

export default defineConfig({
    test: {
        globals: true,
        coverage: {
            reporter: ["text", "html"],
        },
    },

    resolve: {
        alias: webpackAliases,
    },
});
