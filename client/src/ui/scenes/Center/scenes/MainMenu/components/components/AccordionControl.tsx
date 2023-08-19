import React from "react";
import { Accordion, type AccordionControlProps, Box, ActionIcon } from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

export const AccordionControl = ({
    onChevronClick,
    isExpanded,
    ...rest
}: AccordionControlProps & {
    isExpanded: boolean;
    onChevronClick: () => void;
}) => {
    return (
        <Box
            sx={(theme) => ({
                display: "flex",
                gap: theme.spacing.xs,
                alignItems: "center",
                height: "3.125rem",
            })}
        >
            {/* Main Button */}
            <Accordion.Control {...rest} />
            {/* Chevron button */}
            <ActionIcon
                className="mantine-Accordion-chevron"
                onClick={onChevronClick}
                size="lg"
                variant="light"
                style={{ width: "100%", height: "100%", maxWidth: "3.125rem" }}
            >
                <Box
                    sx={(theme) => ({
                        height: "24px",
                        transition: `transform 200ms ${theme.transitionTimingFunction}`,
                        ...(isExpanded && { transform: "rotate(180deg)" }),
                    })}
                >
                    <ChevronDown strokeWidth={3} />
                </Box>
            </ActionIcon>
        </Box>
    );
};
