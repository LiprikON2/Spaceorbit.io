// TODO
const backendUrl = "http://192.168.1.246:3010";

export const getFromBackend = async (pathSegments: string[] = [], token = "") => {
    const path = pathSegments.join("/");

    const res = await fetch(`${backendUrl}/${path}`, {
        method: "GET",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    console.log("GET ->", `${backendUrl}/${path}`);
    if (!res.ok) throw new Error(res.statusText);
    return { json: await res.json(), ok: res.ok };
};

export const postToBackend = async (pathSegments = [], method = "POST", body = {}, token = "") => {
    let path = pathSegments.join("/");

    const res = await fetch(`${backendUrl}/${path}`, {
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
    console.log("POST ->", `${backendUrl}/${path}`);
    const json = await res.json();
    console.log("<-", json);

    // Handle empty responses
    if (res.status === 204) return { json: {}, ok: res.ok };
    return { json, ok: res.ok };
};

// export const getLocalStorageToken = () => {
//     return JSON.parse(localStorage.getItem("token")!);
// };
// export const getSessionStorageToken = () => {
//     return JSON.parse(sessionStorage.getItem("token")!);
// };

// export const getToken = () => {
//     return getSessionStorageToken() ?? getLocalStorageToken();
// };

// export const setSessionStorageToken = (token) => {
//     sessionStorage.setItem("token", JSON.stringify(token));
// };
