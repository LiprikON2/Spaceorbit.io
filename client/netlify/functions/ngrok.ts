exports.handler = async (event, context) => {
    console.log("event", event);
    console.log("context", context);
    console.log("process.env.ngrok_api", process.env.NGROK_API);

    return {
        statusCode: 200,
        body: JSON.stringify({ api: `hmm: ${process.env.NGROK_API}` }),
    };
};
