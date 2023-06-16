import { useQuery } from "@tanstack/react-query";
import { getFromBackend } from "../../backend/api";

const getMe = async (token) => await getFromBackend(["users", "me"], token);

const useGetMe = (token) => {
    return useQuery(["user"], () => getMe(token), {
        select: ({ json }) => json,
        useErrorBoundary: false,
        enabled: !!token,
    });
};

export default useGetMe;
