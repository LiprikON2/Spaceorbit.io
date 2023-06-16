import { useQuery } from "@tanstack/react-query";
import { getFromBackend } from "../../backend/api";

const getMe = async (token) => await getFromBackend(["users", "me"], token);

const useGetMe = (token) => {
    return useQuery(["user"], () => getMe(token), {
        select: ({ json }) => json,
        onError: (error) => {
            console.log("useGetMe error", error);
            // if (logout) logout();
        },
        useErrorBoundary: false,
        enabled: !!token,
    });
};

export default useGetMe;
