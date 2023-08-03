import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

    if (event.httpMethod === "GET") {
        const res = await fetch(`https://api.ngrok.com/endpoints`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Ngrok-Version": "2",
                Authorization: `Bearer ${process.env.NGROK_API}`,
            },
        });
        const json = await res.json();

        if ("endpoints" in json) {
            const servers = json["endpoints"].map((endpoint) => endpoint.public_url);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ servers }),
            };
        }
        return { statusCode: 500 };
    }

    return { statusCode: 400 };
};
