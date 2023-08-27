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
import { useGame, useSettings } from "~/ui/hooks";
import { VolumeKeys } from "~/game/managers/SoundManager";

export const SettingsModal = observer(
    ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
        const {
            gameManager,
            computed: {
                scene: { soundManager },
            },
        } = useGame();
        const {
            settings,
            setMasterVolumeSetting,
            setEffectsVolumeSetting,
            setMusicVolumeSetting,
            setGraphicsSettingsSetting,
        } = useSettings();

        const setVolume = (key: VolumeKeys, volume: number) => {
            soundManager.setVolume(key, volume);
            if (key === "masterVolume") {
                setMasterVolumeSetting(volume);
            } else if (key === "musicVolume") {
                setMusicVolumeSetting(volume);
            } else if (key === "effectsVolume") {
                setEffectsVolumeSetting(volume);
            }
        };
        const handleGraphicSettings = (value: string) => {
            setGraphicsSettingsSetting(value);
        };
        const [activeTab, setActiveTab] = useState<string | null>("audio");

        return (
            <>
                <Modal.Root
                    className="modal"
                    opened={opened}
                    onClose={onClose}
                    title="Game Settings"
                >
                    <Modal.Overlay />
                    <Modal.Content>
                        <Modal.Header>
                            <Title order={2}>Game Settings</Title>
                            <Modal.CloseButton />
                        </Modal.Header>
                        <Modal.Body>
                            <Tabs
                                value={activeTab}
                                onTabChange={setActiveTab}
                                color="cyan"
                                defaultValue="audio"
                            >
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
                                                onChangeEnd={(value) =>
                                                    setVolume("masterVolume", value)
                                                }
                                                defaultValue={settings.masterVolume}
                                                value={settings.masterVolume}
                                            />
                                            <SliderInput
                                                label="Music Volume"
                                                min={0}
                                                max={0.025}
                                                onChangeEnd={(value) =>
                                                    setVolume("musicVolume", value)
                                                }
                                                defaultValue={settings.musicVolume}
                                                value={settings.musicVolume}
                                            />
                                            <SliderInput
                                                label="Effects Volume"
                                                min={0}
                                                max={0.1}
                                                onChangeEnd={(value) =>
                                                    setVolume("effectsVolume", value)
                                                }
                                                defaultValue={settings.effectsVolume}
                                                value={settings.effectsVolume}
                                            />
                                        </Stack>
                                    </Container>
                                </Tabs.Panel>
                                <Tabs.Panel value="graphics">
                                    <Container>
                                        <Stack spacing="md">
                                            <Title order={3}>General</Title>
                                            <Text>Lighting</Text>
                                            <SegmentedControl
                                                color="cyan"
                                                data={[
                                                    { label: "Low", value: "low" },
                                                    { label: "Medium", value: "medium" },
                                                    { label: "High", value: "high" },
                                                ]}
                                                transitionDuration={0}
                                                value={settings.graphicsSettings}
                                                onChange={handleGraphicSettings}
                                            />

                                            <Select
                                                label="Resolution"
                                                data={[
                                                    { value: "auto", label: "Auto" },
                                                    { value: "1920x1080", label: "1920x1080" },
                                                ]}
                                                defaultValue="auto"
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
                                                checked={gameManager.game.settings.toFollowCursor}
                                                onChange={() =>
                                                    gameManager.game.settings.setToFollowCursor(
                                                        !gameManager.game.settings.toFollowCursor
                                                    )
                                                }
                                            />

                                            <Title order={3}>Touch</Title>
                                            <Switch
                                                label="Enable touch controls"
                                                checked={gameManager.game.settings.touchMode}
                                                onChange={() =>
                                                    gameManager.game.settings.setTouchMode(
                                                        !gameManager.game.settings.touchMode
                                                    )
                                                }
                                            />
                                        </Stack>
                                    </Container>
                                </Tabs.Panel>
                            </Tabs>
                        </Modal.Body>
                    </Modal.Content>
                </Modal.Root>
            </>
        );
    }
);
