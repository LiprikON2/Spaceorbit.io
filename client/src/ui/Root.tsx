import "core-js/actual";
import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import type { MantineTheme } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { App } from "./App";

const theme: Partial<MantineTheme> = {
    colorScheme: "dark",
    focusRingStyles: {
        // reset styles are applied to <button /> and <a /> elements
        // in &:focus:not(:focus-visible) selector to mimic
        // default browser behavior for native <button /> and <a /> elements
        resetStyles: () => ({ outline: "none" }),

        // styles applied to all elements expect inputs based on Input component
        // styled are added with &:focus selector
        styles: (theme) => ({ outline: `2px solid ${theme.colors.orange[5]}` }),

        // focus styles applied to components that are based on Input
        // styled are added with &:focus selector
        inputStyles: (theme) => ({ outline: `2px solid ${theme.colors.orange[5]}` }),
    },
    components: {
        Button: {
            defaultProps: {
                variant: "outline",
                color: "gray",
                size: "lg",
            },
        },
        Group: {
            defaultProps: {
                spacing: "xs",
            },
        },
        Container: {
            defaultProps: {
                p: "xl",
            },
        },
        Progress: {
            defaultProps: {
                color: "cyan",
                size: "xl",
                style: { width: "100%" },
            },
            styles: {
                bar: { transition: "width 1500ms linear" },
            },
        },
        Loader: {
            defaultProps: {
                color: "cyan",
                variant: "dots",
            },
        },
        Modal: {
            styles: {
                inner: {
                    paddingInline: "5vw",
                    width: "calc(100% - 10vw)",
                },
            },
        },
        Tabs: {
            styles: {
                tabsList: {
                    flexWrap: "nowrap",
                },
            },
        },
        Paper: {
            defaultProps: {
                shadow: "xs",
                radius: "md",
                p: "lg",
                withBorder: true,
                style: {
                    width: "100%",
                },
            },
        },
        Textarea: {
            defaultProps: {
                autosize: true,
                maxRows: 2,
            },
        },
        Stack: {
            defaultProps: {
                spacing: "xs",
            },
        },
    },
    // TODO
    // headings: {
    //     sizes: {
    //         h1: {
    //             fontSize: "1 rem",
    //             fontWeight: "bold",
    //             lineHeight: "normal",
    //         },
    //         h2: Heading,
    //         h3: Heading,
    //         h4: Heading,
    //         h5: Heading,
    //         h6: Heading,
    //     },
    // },
};

const queryClient = new QueryClient();

const container = document.getElementById("phaser-game");
const root = createRoot(container!);

root.render(
    <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </MantineProvider>
);

// Stops clicking-through of the UI
// https://github.com/photonstorm/phaser/issues/4447
const events = ["mouseup", "mousedown", "touchstart", "touchmove", "touchend", "touchcancel"];
events.forEach((event) => {
    container.addEventListener(event, (e) => e.stopPropagation());
});
