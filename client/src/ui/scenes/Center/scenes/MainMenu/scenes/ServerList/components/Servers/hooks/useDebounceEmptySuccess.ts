import { useEffect, useState } from "react";

export const useDebounceEmptySuccess = (status, list, timeout = 1000) => {
    const [populated, setPopulated] = useState(false);
    const isPopulatingServers = status === "success" && !list.length && !populated;
    useEffect(() => {
        if (isPopulatingServers) {
            const timeId = setTimeout(() => {
                setPopulated(true);
            }, timeout);

            return () => {
                clearTimeout(timeId);
            };
        }
    }, [isPopulatingServers]);

    return [isPopulatingServers] as [boolean];
};
