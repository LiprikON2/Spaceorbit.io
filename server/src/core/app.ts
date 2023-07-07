import express from "express";
import bodyParserErrorHandler from "express-body-parser-error-handler";
import listEndpoints from "express-list-endpoints";
import geckos from "@geckos.io/server";
import { createServer } from "http";

import routes from "~/server/routes";
import { isAuthenticated, logger, correctContentType } from "~/server/middleware";
import { serverConfig, GameServer } from "~/server/game";

export const app = express();
const server = createServer(app);

const geckosServer = geckos({ cors: { allowAuthorization: true, origin: "*" } });
geckosServer.addServer(server);

const game = new GameServer(geckosServer, serverConfig);

const rootRoutes = express.Router();
rootRoutes.use(routes);

/* Handle json body in 'Content-Type: application/json' requests */
app.use(express.json());

/* Handle json body parsing errors */
app.use(bodyParserErrorHandler());

app.use(logger("server"));

app.use(correctContentType);

// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    // res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Content-Type");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // Pass to next layer of middleware
    next();
});

app.use("/", rootRoutes);

app.use("/endpoints", (req, res) => {
    const endpoints = listEndpoints(app);
    const endpointsStr = endpoints
        .map((endpoint) =>
            endpoint.methods.map((method) => `${method} ${endpoint.path}`).join("\n")
        )
        .join("\n\n");

    res.send(endpointsStr);
});

// Workaround to allow websockets on development using vite-plugin-node
// https://github.com/axe-me/vite-plugin-node/issues/22#issuecomment-1547114428
export const [serverListener] = server.listeners("request");

if (import.meta.env.PROD) {
    server.listen(3010);
}
