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

export const SettingsModal = ({ opened, onClose }) => {
    const {
        computed: {
            player,
            scene: { soundManager, inputManager, mobManager },
        },
    } = useGame();
    const {
        settings,
        setMasterVolumeSetting,
        setEffectsVolumeSetting,
        setMusicVolumeSetting,
        setGraphicsSettingsSetting,
    } = useSettings();

    // TODELETE: Mutating state!
    const addEngine = () => {
        player.exhausts.createExhaust();
    };
    const removeEngine = () => {
        player.exhausts.removeExhaust();
    };
    const addLaser = (slot) => {
        player.weapons.createLaser(slot);
    };
    const addGatling = (slot) => {
        player.weapons.createGatling(slot);
    };

    const setVolume = (key, volume) => {
        const isValidKey =
            key === "masterVolume" || key === "musicVolume" || key === "effectsVolume";

        if (isValidKey) {
            soundManager.setVolume(key, volume);
            if (key === "masterVolume") {
                setMasterVolumeSetting(volume);
            } else if (key === "musicVolume") {
                setMusicVolumeSetting(volume);
            } else if (key === "effectsVolume") {
                setEffectsVolumeSetting(volume);
            }
        }
    };
    const handleGraphicSettings = (value) => {
        setGraphicsSettingsSetting(value);
    };

    const toggleTouchControls = () => {
        inputManager.toggleTouchControls();
        handleTouchControls.toggle();
    };
    const [touchControlChecked, handleTouchControls] = useDisclosure(settings.enableTouchControls);
    const [activeTab, setActiveTab] = useState<string | null>("audio");

    // TODELETE: Mutating state!
    const sendMobs = (e) => {
        e.preventDefault();
        const { mobs } = mobManager;
        mobManager.spawnMobs(mobsCount, [player]);

        mobs.forEach((mob) => {
            mob.moveTo(x, y);
            mob.lookAtPoint(x, y);
        });
    };

    // TODELETE: Mutating state!
    const teleport = () => {
        player.x = x;
        player.y = y;
        player.shields.x = x;
        player.shields.y = y;
    };

    const [x, setx] = useState(120);
    const [y, sety] = useState(120);
    const [mobsCount, setMobsCount] = useState(0);

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
                                <Tabs.Tab value="ship">Ship</Tabs.Tab>
                                <Tabs.Tab value="cheats">Cheats</Tabs.Tab>
                            </Tabs.List>
                            <Tabs.Panel value="audio">
                                <Container>
                                    <Stack>
                                        <Title order={3}>Volume</Title>
                                        <SliderInput
                                            title="Master Volume"
                                            min={0}
                                            max={1}
                                            onChangeEnd={(value) =>
                                                setVolume("masterVolume", value)
                                            }
                                            defaultValue={settings.masterVolume}
                                        />
                                        <SliderInput
                                            title="Music Volume"
                                            min={0}
                                            max={0.025}
                                            onChangeEnd={(value) => setVolume("musicVolume", value)}
                                            defaultValue={settings.musicVolume}
                                        />
                                        <SliderInput
                                            title="Effects Volume"
                                            min={0}
                                            max={0.1}
                                            onChangeEnd={(value) =>
                                                setVolume("effectsVolume", value)
                                            }
                                            defaultValue={settings.effectsVolume}
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
                            <Tabs.Panel value="ship">
                                <Container>
                                    <Stack>
                                        <Title order={3}>Modules</Title>
                                        <Button className="addEngine" onClick={addEngine}>
                                            Add: Engine
                                        </Button>
                                        <Button className="addEngine" onClick={removeEngine}>
                                            Remove: Engine
                                        </Button>
                                        <Button className="addWeapon" onClick={() => addLaser(0)}>
                                            Add: Weapon slot 1 - Laser
                                        </Button>
                                        <Button className="addWeapon" onClick={() => addLaser(1)}>
                                            Add: Weapon slot 2 - Laser
                                        </Button>
                                        <Button className="addWeapon" onClick={() => addLaser(2)}>
                                            Add: Weapon slot 3 - Laser
                                        </Button>
                                        <Button className="addWeapon" onClick={() => addGatling(0)}>
                                            Add: Weapon slot 1 - Gatling Gun
                                        </Button>
                                        <Button className="addWeapon" onClick={() => addGatling(1)}>
                                            Add: Weapon slot 2 - Gatling Gun
                                        </Button>
                                        <Button className="addWeapon" onClick={() => addGatling(2)}>
                                            Add: Weapon slot 3 - Gatling Gun
                                        </Button>
                                    </Stack>
                                </Container>
                            </Tabs.Panel>
                            <Tabs.Panel value="cheats">
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
                            </Tabs.Panel>
                        </Tabs>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
};
