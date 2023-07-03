import React, { useEffect, useState } from "react";
import { getHotkeyHandler, useHotkeys, useListState } from "@mantine/hooks";
import { Box, ScrollArea, Stack, Textarea, Title } from "@mantine/core";

import { useGame } from "~/ui/hooks";
import { useFocus, useScrollToBottom } from "./hooks";
import { ChatEntry } from "./components";

const isoToLocalTime = (isoString) => {
    const date = new Date(isoString);
    const localTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return localTime;
};

const getCurrentTime = () => {
    const now = new Date();
    const isoTime = now.toISOString();
    const localTime = isoToLocalTime(isoTime);

    return { isoTime, localTime };
};

export const Chat = () => {
    const [chatInputRef, focusChatInput] = useFocus();
    useHotkeys([["T", focusChatInput]]);

    const {
        gameManager,
        computed: {
            player: { nick },
        },
    } = useGame();

    const { channel } = gameManager.game;

    const handleBlur = (e) => {
        if (e.target instanceof HTMLElement) e.target.blur();
        gameManager.unlockInput();
    };
    const handleFocus = () => gameManager.lockInput();

    useEffect(() => {
        channel.on("message", (data) => {
            console.log("Recived message!", data);
        });
    }, []);

    const [message, setMessage] = useState("");
    const [chatEntires, { append: addChatEntry }] = useListState([]);
    const chatViewportRef = useScrollToBottom([chatEntires]);

    const sendMessage = () => {
        if (message) {
            const { isoTime, localTime } = getCurrentTime();
            channel.emit("message", { nick, message, isoTime }, { reliable: true });
            addChatEntry({ nick, message, localTime });
            setMessage("");
        }
    };

    return (
        <Box mx="sm">
            <Title order={4}>Chat</Title>
            <ScrollArea
                viewportRef={chatViewportRef}
                w="20rem"
                h="10rem"
                py="0.25rem"
                offsetScrollbars
            >
                <Stack align="flex-start" pr="1rem" pb="0.25rem" spacing="0.25rem">
                    {chatEntires.map(({ nick, message, localTime }, index) => (
                        <ChatEntry
                            key={index}
                            nick={nick}
                            message={message}
                            localTime={localTime}
                        />
                    ))}
                </Stack>
            </ScrollArea>
            <Textarea
                ref={chatInputRef}
                value={message}
                placeholder="Your message..."
                onChange={(e) => setMessage(e.currentTarget.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={getHotkeyHandler([
                    ["Enter", sendMessage],
                    ["Escape", handleBlur],
                ])}
                mt="0.5rem"
                variant="unstyled"
            />
        </Box>
    );
};
