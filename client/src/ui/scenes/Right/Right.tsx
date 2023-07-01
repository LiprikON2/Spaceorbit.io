import React, { useEffect, useState } from "react";
import { Device } from "@capacitor/device";
import { Stack, Text } from "@mantine/core";
import styled from "@emotion/styled";

import { useSettings } from "~/ui/hooks";

const StyledStack = styled(Stack)`
    gap: 0;
    min-width: 12rem;
    font-size: 0.75rem;
    opacity: 0.5;
`;

export const Right = ({ GroupComponent }) => {
    const { settings } = useSettings();

    const [deviceInfo, setDeviceInfo] = useState({});
    const logDeviceInfo = async () => {
        const info = await Device.getInfo();
        setDeviceInfo(info);
    };

    useEffect(() => {
        logDeviceInfo();
    }, []);

    return (
        <>
            <GroupComponent>
                <StyledStack>
                    {settings.showDeviceInfo &&
                        Object.entries(deviceInfo).map(([key, value]) => (
                            <Text key={key} color="white" size="xs">
                                {`${key}: ${value}`}
                            </Text>
                        ))}
                </StyledStack>
            </GroupComponent>
        </>
    );
};
