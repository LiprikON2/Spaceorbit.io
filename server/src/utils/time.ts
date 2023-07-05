export const getIsoTime = () => {
    const now = new Date();
    const isoTime = now.toISOString();
    return isoTime;
};
