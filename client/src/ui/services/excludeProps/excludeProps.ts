import isPropValid from "@emotion/is-prop-valid";

// https://emotion.sh/docs/styled#customizing-prop-forwarding
export const excludeProps = (excluded: string[] = [], ensureIsValidAttribute = false) => {
    if (!ensureIsValidAttribute) {
        return (prop) => !excluded.includes(prop);
    } else {
        return (prop) => isPropValid(prop) && !excluded.includes(prop);
    }
};
