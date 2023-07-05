import React, { useEffect } from "react";
import { Modal, Space, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { Errors } from "./components";

export const ErrorModal = ({ errors, clearErrors }) => {
    const [opened, { close, open }] = useDisclosure(false);

    useEffect(() => {
        if (errors.length) {
            open();
        }
    }, [errors]);

    const handleClose = () => {
        close();
        clearErrors();
    };

    return (
        <Modal.Root opened={opened} onClose={handleClose} centered size="auto">
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header py={0}>
                    <Title c="red" order={2}>
                        Error
                    </Title>
                    <Modal.CloseButton />
                </Modal.Header>
                <Modal.Body>
                    <Space h="md" />
                    <Errors errors={errors} />
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
