import { useEffect, useState } from "react";

/**
 * Used to account for when query is successful, but state has not updated yet and is empty
 * @param status
 * @param list
 * @param timeout
 * @returns
 */
export const useDebounceEmptySuccess = (status, list, timeout = 1000) => {
    const [populated, setPopulated] = useState(false);
    // const isPopulatingServers = status === "success" && !list.length && !populated;
    // TODELETE
    const isPopulatingServers = status === "success" && !populated;
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
