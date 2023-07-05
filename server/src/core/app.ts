import express from "express";
import routes from "~/routes";
import bodyParserErrorHandler from "express-body-parser-error-handler";
import listEndpoints from "express-list-endpoints";
import geckos from "@geckos.io/server";
import { createServer } from "http";

import { isAuthenticated, logger, correctContentType } from "~/middleware";
import { getIsoTime } from "~/utils";

export const app = express();
const server = createServer(app);

// const game = new PhaserGame(server);
const io = geckos({ cors: { allowAuthorization: true, origin: "*" } });
io.addServer(server);

io.onConnection((channel) => {
    console.log("Channel connected");

    channel.on("message", (data) => {
        console.log("Message:", data);
        channel.broadcast.emit("message", data);
    });

    channel.emit("ready");
    channel.emit(
        "message",
        { nick: "Server", message: "Welcome!", isoTime: getIsoTime() },
        { reliable: true }
    );
});

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
