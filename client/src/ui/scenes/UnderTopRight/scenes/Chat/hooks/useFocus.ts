import { useRef } from "react";

export const useFocus = (): [React.MutableRefObject<any>, () => void] => {
    const ref = useRef<any | null>(null);
    const focus = () => {
        ref.current && ref.current.focus();
    };

    return [ref, focus];
};
