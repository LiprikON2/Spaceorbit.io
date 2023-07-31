// TODO
// export const backendUrl = `${location.protocol}//192.168.1.246:${3010}`;
export const backendUrl = `http://192.168.1.246:${3010}`;
// export const backendUrl = `https://8549-104-28-230-247.ngrok-free.app`;

// https://github.com/TanStack/query/discussions/562
export class FetchError extends Error {
    constructor(public res: Response, message?: string) {
        super(message);
    }
}

export const getFromBackend = async (pathSegments: string[] | string, token = "") => {
    let url: string;

    if (typeof pathSegments === "string") url = pathSegments;
    else url = `${backendUrl}/${pathSegments.join("/")}`;

    const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    console.log("GET ->", url);
    if (!res.ok) {
        throw new FetchError(res, res.statusText);
    }

    const json = await res.json();
    return { json, ok: res.ok };
};

export const postToBackend = async (
    pathSegments: string[] | string,
    method = "POST",
    body = {},
    token = ""
) => {
    let url: string;

    if (typeof pathSegments === "string") url = pathSegments;
    else url = `${backendUrl}/${pathSegments.join("/")}`;

    const res = await fetch(url, {
        method,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
    });
    console.log("POST ->", url);

    const json = await res.json();
    console.log("<-", json);
    // Handle empty responses
    if (res.status === 204) return { json: {}, ok: res.ok };
    return { json, ok: res.ok };
};
