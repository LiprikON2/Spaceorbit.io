import React, { useEffect, useState } from "react";
import {
    Container,
    Modal,
    NumberInput,
    SegmentedControl,
    Space,
    Text,
    Stack,
    Switch,
    Tabs,
    Title,
    Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { autorun, reaction } from "mobx";

import { Button } from "~/ui/components";
import { SliderInput } from "./components";
import { useGame, useSettings } from "~/ui/hooks";
import { VolumeKeys } from "~/game/managers/SoundManager";
import { observer } from "mobx-react-lite";

export const SettingsModal = observer(
    ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
        const {
            computed: {
                player,
                scene: { soundManager, inputManager, entityManager },
            },
        } = useGame();
        const {
            settings,
            setMasterVolumeSetting,
            setEffectsVolumeSetting,
            setMusicVolumeSetting,
            setGraphicsSettingsSetting,
            setToFollowCursorSetting,
        } = useSettings();

        // useEffect(() => {
        //     return autorun(() => {
        //         console.log("wow! toFollowCursor", inputManager.toFollowCursor);
        //     });
        // }, []);
        // reaction(
        //     () => inputManager.toFollowCursor,
        //     (toFollowCursor) => {
        //         console.log("wow! toFollowCursor", toFollowCursor);
        //     }
        // );

        const addEngine = () => {
            player.exhausts.createExhaust();
        };
        const removeEngine = () => {
            player.exhausts.removeExhaust();
        };
        const addLaser = (slot: number) => {
            player.weapons.createWeapon("laser", slot);
        };
        const addGatling = (slot: number) => {
            player.weapons.createWeapon("gatling", slot);
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
            touchControlToggle();
        };
        const [touchControlChecked, { toggle: touchControlToggle }] = useDisclosure(
            settings.isTouchMode
        );
        const [activeTab, setActiveTab] = useState<string | null>("audio");

        // const toggleFollowCursor = () => {
        //     inputManager.setFollowCursor(!settings.toFollowCursor);
        //     setToFollowCursorSetting(!settings.toFollowCursor);
        // };
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
                                    {/* <Tabs.Tab value="cheats">Cheats</Tabs.Tab> */}
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
                                                    { label: "Low", value: "0.5" },
                                                    { label: "Medium", value: "0.75" },
                                                    { label: "High", value: "1" },
                                                ]}
                                                transitionDuration={0}
                                                value={String(settings.graphicsSettings)}
                                                onChange={handleGraphicSettings}
                                            />

                                            <Select
                                                label="Resolution"
                                                data={[
                                                    { value: "auto", label: "auto" },
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
                                                // checked={settings.toFollowCursor}
                                                // onChange={toggleFollowCursor}
                                                checked={inputManager.toFollowCursor}
                                                onChange={() =>
                                                    inputManager.setFollowCursor(
                                                        !inputManager.toFollowCursor
                                                    )
                                                }
                                            />

                                            <Title order={3}>Touch</Title>
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
                                    <Stack spacing="md">
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
    }
);
