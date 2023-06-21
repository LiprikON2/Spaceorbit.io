import "core-js/actual";
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const queryClient = new QueryClient();

const container = document.getElementById("phaser-game");
const root = createRoot(container!);

root.render(
    <MantineProvider
        theme={{
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
            },
        }}
        children
    >
        <QueryClientProvider client={queryClient}>
            <App queryClient={queryClient} />
        </QueryClientProvider>
    </MantineProvider>
);

// Stops clicking-through of the UI
// https://github.com/photonstorm/phaser/issues/4447
const events = ["mouseup", "mousedown", "touchstart", "touchmove", "touchend", "touchcancel"];
events.forEach((event) => {
    container!.addEventListener(event, (e) => e.stopPropagation());
});
