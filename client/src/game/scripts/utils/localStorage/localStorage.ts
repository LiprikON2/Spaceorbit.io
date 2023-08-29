export const setSessionStorage = (key, value) => {
    sessionStorage.setItem(key, serializeJSON(value));
};
export const getSessionStorage = (key) => {
    return deserializeJSON(sessionStorage.getItem(key) ?? "{}");
};

export const setLocalStorage = (key, value) => {
    localStorage.setItem(key, serializeJSON(value));
};
export const getLocalStorage = (key) => {
    return deserializeJSON(localStorage.getItem(key) ?? "{}");
};

export const serializeJSON = (value: any) => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        throw new Error("Failed to serialize the value");
    }
};

export const deserializeJSON = (value: string) => {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};
