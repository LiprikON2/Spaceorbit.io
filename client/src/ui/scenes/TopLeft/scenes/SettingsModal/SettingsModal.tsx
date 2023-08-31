import React, { useState } from "react";
import {
    Container,
    Modal,
    SegmentedControl,
    Text,
    Stack,
    Switch,
    Tabs,
    Title,
    Select,
} from "@mantine/core";
import { observer } from "mobx-react-lite";

import { SliderInput } from "./components";
import { useGame } from "~/ui/hooks";

export const SettingsModal = observer(
    ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
        const {
            computed: { settings },
        } = useGame();

        const [activeTab, setActiveTab] = useState<string | null>("audio");

        return (
            <Modal.Root opened={opened} onClose={onClose} title="Game Settings">
                <Modal.Overlay />
                <Modal.Content>
                    <Modal.Header>
                        <Title order={2}>Game Settings</Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs value={activeTab} onTabChange={setActiveTab} defaultValue="audio">
                            <Tabs.List>
                                <Tabs.Tab value="audio">Audio</Tabs.Tab>
                                <Tabs.Tab value="graphics">Graphics</Tabs.Tab>
                                <Tabs.Tab value="controls">Controls</Tabs.Tab>
                            </Tabs.List>
                            <Tabs.Panel value="audio">
                                <Container>
                                    <Stack spacing="md">
                                        <Title order={3}>Volume</Title>
                                        <SliderInput
                                            label="Master Volume"
                                            min={0}
                                            max={1}
                                            onChangeEnd={settings.setMasterVolume}
                                            value={settings.masterVolume}
                                        />
                                        <SliderInput
                                            label="Music Volume"
                                            min={0}
                                            max={0.025}
                                            onChangeEnd={settings.setMusicVolume}
                                            value={settings.musicVolume}
                                        />
                                        <SliderInput
                                            label="Effects Volume"
                                            min={0}
                                            max={0.1}
                                            onChangeEnd={settings.setEffectsVolume}
                                            value={settings.effectsVolume}
                                        />
                                    </Stack>
                                </Container>
                            </Tabs.Panel>
                            <Tabs.Panel value="graphics">
                                <Container>
                                    <Stack spacing="md">
                                        <Title order={3}>General</Title>

                                        <Select
                                            label="Resolution"
                                            data={[
                                                { value: "auto", label: "Auto" },
                                                { value: "1920x1080", label: "1920x1080" },
                                            ]}
                                            defaultValue="auto"
                                        />
                                        <Text>Lighting</Text>
                                        <SegmentedControl
                                            color="cyan"
                                            data={[
                                                { label: "Low", value: "low" },
                                                { label: "Medium", value: "medium" },
                                                { label: "High", value: "high" },
                                            ]}
                                            transitionDuration={0}
                                            onChange={settings.setGraphicsSettings}
                                            value={settings.graphicsSettings}
                                        />
                                        <Title order={3}>Debug</Title>

                                        <Switch
                                            label="Show device info"
                                            checked={settings.showDeviceInfo}
                                            onChange={() =>
                                                settings.setShowDeviceInfo(!settings.showDeviceInfo)
                                            }
                                        />
                                    </Stack>
                                </Container>
                            </Tabs.Panel>
                            <Tabs.Panel value="controls">
                                <Container>
                                    <Stack spacing="md">
                                        <Title order={3}>Camera</Title>
                                        <Switch
                                            label="Make camera follow the cursor"
                                            checked={settings.toFollowCursor}
                                            onChange={() =>
                                                settings.setToFollowCursor(!settings.toFollowCursor)
                                            }
                                        />

                                        <Title order={3}>Touch</Title>
                                        <Switch
                                            label="Enable touch controls"
                                            checked={settings.touchMode}
                                            onChange={() =>
                                                settings.setTouchMode(!settings.touchMode)
                                            }
                                        />
                                    </Stack>
                                </Container>
                            </Tabs.Panel>
                        </Tabs>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        );
    }
);
