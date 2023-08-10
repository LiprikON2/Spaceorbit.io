import React from "react";
import styled from "@emotion/styled";
import { Title } from "@mantine/core";

import background from "~/assets/ui/background-space.webp";
import galaxy from "~/assets/ui/galaxy.webp";

const StyledTitle = styled(Title)`
    margin-bottom: calc(var(--responsive-size) * 0.25);

    font-size: var(--responsive-size);
    letter-spacing: 0.6rem;
    user-select: none;

    background-image: url(${background});
    background-position: 50% 21%;
    background-size: 196%;

    background-clip: text;
    color: #00000096;

    animation: wobble 12s infinite linear;

    @keyframes wobble {
        0% {
            transform: translate(0, 0) rotate3d(0, 0, 1, 0deg);
            background-size: 196%;
        }
        12% {
            transform: translate(-0.5%, -0.12%) rotate3d(0, 0, 1, -1deg);
            background-size: 206%;
        }
        25% {
            transform: translate(-0.75%, -0.25%) rotate3d(0, 0, 1, -2deg);
            background-size: 216%;
        }
        37% {
            transform: translate(-0.5%, -0.12%) rotate3d(0, 0, 1, -1deg);
            background-size: 206%;
        }
        50% {
            transform: translate(0, 0) rotate3d(0, 0, 1, 0deg);
            background-size: 196%;
        }
        62% {
            transform: translate(0.5%, 0.12%) rotate3d(0, 0, 1, 1deg);
            background-size: 206%;
        }
        75% {
            transform: translate(0.75%, 0.25%) rotate3d(0, 0, 1, 2deg);
            background-size: 216%;
        }
        87% {
            transform: translate(0.5%, 0.12%) rotate3d(0, 0, 1, 1deg);
            background-size: 206%;
        }
        100% {
            transform: translate(0, 0) rotate3d(0, 0, 1, 0deg);
            background-size: 196%;
        }
    }
`;

export const TopCenter = ({ GroupComponent }) => {
    const StyledGroupComponent = styled(GroupComponent)`
        --responsive-size: clamp(5rem, 1rem + 8vw, 9rem);

        margin-top: calc(var(--responsive-size) * 0.5);
        position: relative;

        &::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            background-image: url(${galaxy});
            background-position: 50%;
            background-size: calc(var(--responsive-size) * 7) calc(var(--responsive-size) * 2.5);
            background-repeat: no-repeat;

            height: 200%;
            width: 100%;
            z-index: -1;

            animation: opacity-breath 3s infinite ease;

            @keyframes opacity-breath {
                0% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.85;
                }
                100% {
                    opacity: 1;
                }
            }
        }
    `;
    return (
        <StyledGroupComponent>
            <StyledTitle
                order={1}
                sx={(theme) => ({
                    WebkitTextStroke: `${theme.colors.cyan[8]} 2px`,
                    filter: `
                        drop-shadow(4px 4px 0 ${theme.colors.cyan[8]})
                        drop-shadow(4px 4px 0 black)
                    `,
                })}
            >
                Spaceorbit
            </StyledTitle>
        </StyledGroupComponent>
    );
};
