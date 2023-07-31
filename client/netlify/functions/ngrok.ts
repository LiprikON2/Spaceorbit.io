exports.handler = async (event, context) => {
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
    const servers = json["endpoints"].map((endpoint) => endpoint.public_url);

    return {
        statusCode: 200,
        body: JSON.stringify({ servers }),
    };
};
