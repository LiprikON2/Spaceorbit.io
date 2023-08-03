import React, { useState } from "react";
import { Accordion, type MantineColor } from "@mantine/core";
import { AccordionControl } from "./components";

export const AccordionButton = ({
    label,
    color,
    onClick,

    children,
}: {
    label: string;
    color: MantineColor;
    onClick?: () => void;
    children: (collapsed: boolean) => React.ReactNode;
}) => {
    const [value, setValue] = useState<string | null>(null);
    const isCollapsed = value === null;

    return (
        <Accordion
            value={value}
            variant="separated"
            transitionDuration={300}
            styles={(theme) => {
                const buttonStyles = theme.fn.variant({
                    color,
                    variant: "light",
                });

                return {
                    chevron: { display: "none" },
                    label: {
                        textAlign: "center",
                        fontSize: theme.fontSizes.lg,
                        fontWeight: 600,
                    },
                    control: {
                        padding: 0,
                        height: "3.125rem",
                        paddingLeft: `calc(3.125rem + ${theme.spacing.xs})`,
                        borderRadius: theme.fn.radius(theme.defaultRadius),
                        ...buttonStyles,
                        "&:hover": {
                            background: buttonStyles.hover,
                        },
                    },
                    item: {
                        backgroundColor: "transparent",
                        border: "none",
                    },
                    content: {
                        padding: "1rem",
                    },
                    panel: {
                        marginTop: theme.spacing.xs,
                    },
                };
            }}
        >
            <Accordion.Item value={label}>
                <AccordionControl
                    onClick={onClick}
                    onChevronClick={() => {
                        if (value === null) setValue(label);
                        else setValue(null);
                    }}
                    isExpanded={value === label}
                >
                    {label}
                </AccordionControl>

                <Accordion.Panel>{children(isCollapsed)}</Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
};
