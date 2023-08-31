import React, { useEffect, useState } from "react";
import { Device } from "@capacitor/device";
import { Stack, Text } from "@mantine/core";
import styled from "@emotion/styled";

import { useGame } from "~/ui/hooks";
import { observer } from "mobx-react-lite";
import type { StyledGroup } from "~/ui/App";

const StyledStack = styled(Stack)`
    gap: 0;
    min-width: 12rem;
    font-size: 0.75rem;
    opacity: 0.5;
`;

export const Right = observer(({ GroupComponent }: { GroupComponent: StyledGroup }) => {
    const {
        computed: { settings },
    } = useGame();

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
                            <Text key={key} color="white" size="sm">
                                {`${key}: ${value}`}
                            </Text>
                        ))}
                </StyledStack>
            </GroupComponent>
        </>
    );
});
