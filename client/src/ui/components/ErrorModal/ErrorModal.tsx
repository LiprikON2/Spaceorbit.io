import React, { useEffect } from "react";
import { Modal, Space, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { Errors } from "./components";
import { Button } from "../ToggleButton";

export const ErrorModal = ({ errors, clearErrors }) => {
    const [opened, { close, open }] = useDisclosure(false);

    useEffect(() => {
        if (errors.length) {
            open();
        }
    }, [errors]);

    const dismiss = () => {
        close();

        const timeUntilModalIsDismissed = 500;
        setTimeout(() => clearErrors(), timeUntilModalIsDismissed);
    };

    return (
        <Modal.Root opened={opened} onClose={dismiss} centered size="auto" padding="sm">
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header py={0}>
                    <Title order={2}>Error</Title>
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body>
                    <Space h="md" />
                    <Stack align="flex-end" spacing="lg">
                        <Errors errors={errors} />
                        <Button style={{ minWidth: "5rem" }} compact onClick={dismiss}>
                            Ok
                        </Button>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
