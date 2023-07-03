import { useEffect, useRef } from "react";

export const useScrollToBottom = (dependencies) => {
    const ref = useRef<HTMLDivElement>(null);
    const scrollToBottom = () =>
        ref.current.scrollTo({
            top: ref.current.scrollHeight,
            behavior: "smooth",
        });

    useEffect(() => {
        scrollToBottom();
    }, dependencies);
    return ref;
};
