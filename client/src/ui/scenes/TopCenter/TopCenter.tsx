import styled from "@emotion/styled";
import { Title } from "@mantine/core";
import React from "react";

const StyledTitle = styled(Title)`
    --responsive-size: clamp(5rem, 1rem + 8vw, 9rem);

    font-size: var(--responsive-size);
    margin-bottom: calc(var(--responsive-size) * 0.2);
    letter-spacing: 0.6rem;

    /* text-shadow: teal 4px 4px; */
    /* -webkit-text-stroke: 2px teal; */
    /* color: #99e6f2; */
`;

export const TopCenter = ({ GroupComponent }) => {
    return (
        <GroupComponent>
            <StyledTitle
                order={1}
                c="cyan.2"
                sx={(theme) => ({
                    WebkitTextStroke: `${theme.colors.cyan[8]} 2px`,
                    textShadow: `
                        ${theme.colors.cyan[8]} 1px 1px,
                        ${theme.colors.cyan[8]} 2px 2px,
                        ${theme.colors.cyan[8]} 3px 3px,
                        ${theme.colors.cyan[8]} 4px 4px,
                        black 0 10px 8px
                    `,
                })}
            >
                Spaceorbit
            </StyledTitle>
        </GroupComponent>
    );
};
