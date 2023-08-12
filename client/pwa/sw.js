/**
 * You should only modify this, if you know what you are doing.
 * This phaser template is using workbox (https://developers.google.com/web/tools/workbox/)
 * to precache all assets.
 * It uses the InjectManifest function from 'workbox-webpack-plugin' inside
 * webpack/webpack.common.js
 */
import { precacheAndRoute } from "workbox-precaching";

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

addEventListener("message", (messageEvent) => {
    if (messageEvent.data === "skipWaiting") return skipWaiting();
});

addEventListener("fetch", (event) => {
    event.respondWith(
        (async () => {
            if (
                event.request.mode === "navigate" &&
                event.request.method === "GET" &&
                registration.waiting &&
                (await clients.matchAll()).length < 2
            ) {
                registration.waiting.postMessage("skipWaiting");
                return new Response("", { headers: { Refresh: "0" } });
            }
            return (await caches.match(event.request)) || fetch(event.request);
        })()
    );
});
