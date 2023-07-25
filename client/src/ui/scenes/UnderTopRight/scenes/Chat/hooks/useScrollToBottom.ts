import { DependencyList, useEffect, useRef } from "react";

/**
 * Scrolls viewport to the bottom when dependencies are updated
 */
export const useScrollToBottom = (dependencies: DependencyList) => {
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
