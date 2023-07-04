import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { PhaserGame } from "./game/game.js";
import listEndpoints from "express-list-endpoints";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const app = express();
export const server = http.createServer(app);

// const server = app.listen(1444);

const game = new PhaserGame(server);
const port = 3010;

app.use(cors());

app.use((error, req, res, next) => {
    const { method, url, statusCode } = req;

    console.log("error", error, method, statusCode, url);
});
app.use((req, res, next) => {
    const { method, url, statusCode } = req;
    console.log("normal", method, statusCode, url);
});

// app.use("/", (req, res) => res.json({ truly: "nice" }));

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "../index.html"));
// });

app.get("/getState", (req, res) => {
    console.log("getState!!!");
    try {
        let gameScene = game.scene.keys["GameScene"];
        return res.json({ state: gameScene.getState() });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.use("/endpoints", (req, res) => {
    const endpoints = listEndpoints(app);
    const endpointsStr = endpoints
        .map((endpoint) =>
            endpoint.methods.map((method) => `${method} ${endpoint.path}`).join("\n")
        )
        .join("\n\n");

    res.send("Endpoints:\n" + endpointsStr);
});

console.log("Express is listening on http://localhost:" + port);
// server.listen(port, () => {
//     console.log("Express is listening on http://localhost:" + port);
// });
