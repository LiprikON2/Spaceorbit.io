import {
    Container,
    Modal,
    NumberInput,
    SegmentedControl,
    Space,
    Stack,
    Switch,
    Tabs,
    Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";

import { Button } from "~/ui/components";
import { SliderInput } from "./components";
import { useGame, useSettings } from "~/ui/hooks";
import { VolumeKeys } from "~/game/managers/SoundManager";

export const SettingsModal = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
    const {
        computed: {
            player,
            scene: { soundManager, inputManager: inputManager, entityManager },
        },
    } = useGame();
    const {
        settings,
        setMasterVolumeSetting,
        setEffectsVolumeSetting,
        setMusicVolumeSetting,
        setGraphicsSettingsSetting,
    } = useSettings();

    const addEngine = () => {
        player.exhausts.createExhaust();
    };
    const removeEngine = () => {
        player.exhausts.removeExhaust();
    };
    const addLaser = (slot: number) => {
        player.weapons.createLaser(slot);
    };
    const addGatling = (slot: number) => {
        player.weapons.createGatling(slot);
    };

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

    const toggleTouchControls = () => {
        inputManager.toggleTouchControls();
        handleTouchControls.toggle();
    };
    const [touchControlChecked, handleTouchControls] = useDisclosure(settings.isTouchMode);
    const [activeTab, setActiveTab] = useState<string | null>("audio");

    // const sendMobs = (e) => {
    //     e.preventDefault();
    //     const { mobGroup } = entityManager;
    //     entityManager.spawnMobs(mobsCount);

    //     mobGroup.getChildren().forEach((mob) => {
    //         mob.moveTo(x, y);
    //         mob.setPointer(x, y);
    //     });
    // };

    // const teleport = () => {
    //     player.teleport(x, y);
    // };

    // const [x, setx] = useState(120);
    // const [y, sety] = useState(120);
    // const [mobsCount, setMobsCount] = useState(0);

    return (
        <>
            <Modal.Root className="modal" opened={opened} onClose={onClose} title="Game Settings">
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
                                {/* <Tabs.Tab value="cheats">Cheats</Tabs.Tab> */}
                            </Tabs.List>
                            <Tabs.Panel value="audio">
                                <Container>
                                    <Stack>
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
                                            onChangeEnd={(value) => setVolume("musicVolume", value)}
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
                                    <Stack>
                                        <Title order={3}>General</Title>
                                        <SegmentedControl
                                            color="cyan"
                                            data={[
                                                { label: "Low", value: "0.5" },
                                                { label: "Medium", value: "0.75" },
                                                { label: "High", value: "1" },
                                            ]}
                                            transitionDuration={0}
                                            value={String(settings.graphicsSettings)}
                                            onChange={handleGraphicSettings}
                                        />
                                    </Stack>
                                </Container>
                            </Tabs.Panel>
                            <Tabs.Panel value="controls">
                                <Container>
                                    <Stack>
                                        <Title order={3}>Mobile</Title>
                                        <Switch
                                            label="Enable touch controls"
                                            checked={touchControlChecked}
                                            onChange={toggleTouchControls}
                                        />
                                    </Stack>
                                </Container>
                            </Tabs.Panel>
                            {/* <Tabs.Panel value="cheats">
                                <Container>
                                    <Stack>
                                        <Title order={3}>General</Title>

                                        <form onSubmit={sendMobs}>
                                            <NumberInput
                                                onChange={(value) => setMobsCount(Number(value))}
                                                defaultValue={mobsCount}
                                                placeholder="You better not put 1000..."
                                                label="Mobs Count"
                                            />
                                            <NumberInput
                                                onChange={(value) => setx(Number(value))}
                                                defaultValue={x}
                                                placeholder="x"
                                                label="x"
                                            />
                                            <NumberInput
                                                onChange={(value) => sety(Number(value))}
                                                defaultValue={y}
                                                placeholder="y"
                                                label="y"
                                            />
                                            <Space h="md" />
                                            <Button type="submit">Send mobs at x, y</Button>
                                            <Space h="md" />
                                            <Button onClick={teleport}>Teleport to x, y</Button>
                                        </form>
                                    </Stack>
                                </Container>
                            </Tabs.Panel> */}
                        </Tabs>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};
