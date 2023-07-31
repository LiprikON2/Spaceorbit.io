exports.handler = async (event, context) => {
    console.log("event", event);
    console.log("context", context);
    //Securely access environment variables here
    console.log("process.env.ngrok_api", process.env.ngrok_api);

    return {
        statusCode: 200,
        body: JSON.stringify({ api: process.env.ngrok_api }),
    };
};
