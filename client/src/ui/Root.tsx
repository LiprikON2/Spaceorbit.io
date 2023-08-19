import "core-js/actual";
import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import type { MantineTheme } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { App } from "./App";
import { CustomFonts } from "./components/CustomFonts";

const fontFamilyDisplay =
    "Carter One, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji";
const fontFamilyRegular =
    "Kanit, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji";
const fontFamilyMonospace =
    "Tomorrow, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace";

// https://github.com/mantinedev/mantine/blob/master/src/mantine-styles/src/theme/default-theme.ts
const theme: Partial<MantineTheme> = {
    colorScheme: "dark",
    loader: "dots",
    primaryColor: "cyan",

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
                tabLabel: {
                    fontFamily: fontFamilyMonospace,
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
        Slider: {
            styles: {
                markLabel: {
                    fontFamily: fontFamilyMonospace,
                },
                thumb: {
                    fontFamily: fontFamilyMonospace,
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
        Chip: {
            styles: {
                label: {
                    fontWeight: 300,
                    fontFamily: fontFamilyMonospace,
                },
            },
        },

        Accordion: {
            styles: (theme) => ({
                label: {
                    fontSize: theme.fontSizes.xl,
                    fontWeight: 600,
                    fontFamily: fontFamilyDisplay,
                },
            }),
        },

        SegmentedControl: {
            styles: {
                label: {
                    fontFamily: fontFamilyMonospace,
                },
            },
        },

        Input: {
            styles: {
                input: {
                    "&::placeholder": {
                        fontFamily: fontFamilyMonospace,
                    },
                },
            },
        },
        PasswordInput: {
            styles: {
                innerInput: {
                    "&::placeholder": {
                        fontFamily: fontFamilyMonospace,
                    },
                },
            },
        },
        Button: {
            defaultProps: {
                variant: "outline",
                color: "gray",
                size: "lg",
                fz: "xl",
                ff: fontFamilyDisplay,
            },
        },
    },

    fontFamily: fontFamilyRegular,
    fontFamilyMonospace,

    headings: {
        fontFamily: fontFamilyDisplay,
        fontWeight: 500,
        sizes: {
            h1: { fontSize: "2.125rem", lineHeight: 1.3, fontWeight: undefined },
            h2: { fontSize: "1.625rem", lineHeight: 1.35, fontWeight: undefined },
            h3: { fontSize: "1.375rem", lineHeight: 1.4, fontWeight: undefined },
            h4: { fontSize: "1.125rem", lineHeight: 1.45, fontWeight: undefined },
            h5: { fontSize: "1rem", lineHeight: 1.5, fontWeight: undefined },
            h6: { fontSize: "0.875rem", lineHeight: 1.5, fontWeight: undefined },
        },
    },
};

const queryClient = new QueryClient();

const container = document.getElementById("phaser-game");
const root = createRoot(container!);

root.render(
    <MantineProvider theme={theme}>
        <CustomFonts />
        <QueryClientProvider client={queryClient}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
            {/* {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />} */}
        </QueryClientProvider>
    </MantineProvider>
);

// Stops clicking-through of the UI
// https://github.com/photonstorm/phaser/issues/4447
// const events = ["mouseup", "mousedown", "touchstart", "touchmove", "touchend", "touchcancel"];
// events.forEach((event) => {
//     container.addEventListener(event, (e) => e.stopPropagation());
// });
