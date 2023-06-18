import { Modal, NumberInput, SegmentedControl, Space, Switch, Tabs, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState } from "react";

import { game } from "~/game";
import { Button } from "~/ui/components";
import { Slider } from "./components";

export const SettingsModal = ({ settings, setSettings, opened, onClose }) => {
    const addEngine = () => {
        const scene = game.scene.keys.MainScene;
        if (scene) {
            scene.player.exhausts.createExhaust();
        }
    };
    const removeEngine = () => {
        const scene = game.scene.keys.MainScene;
        if (scene) {
            scene.player.exhausts.removeExhaust();
        }
    };
    const addLaser = (slot) => {
        const scene = game.scene.keys.MainScene;
        if (scene) {
            scene.player.weapons.createLaser(slot);
        }
    };

    const addGatling = (slot) => {
        const scene = game.scene.keys.MainScene;
        if (scene) {
            scene.player.weapons.createGatling(slot);
        }
    };

    const setVolume = (key, newValue) => {
        const soundManager = game.scene.keys.MainScene.soundManager;
        const isValidKey =
            key === "masterVolume" || key === "musicVolume" || key === "effectsVolume";

        if (soundManager && isValidKey) {
            soundManager.setVolume(key, newValue);
            setSettings((pervSettings) => ({ ...pervSettings, [key]: newValue }));
        }
    };
    const handleGraphicSettings = (newValue) => {
        setSettings((pervSettings) => ({ ...pervSettings, graphicsSettings: newValue }));
    };

    const toggleTouchControls = () => {
        const inputManager = game.scene.keys.MainScene.inputManager;
        if (inputManager) {
            inputManager.toggleTouchControls();
            handleTouchControls.toggle();
        }
    };
    const [touchControlChecked, handleTouchControls] = useDisclosure(settings.enableTouchControls);
    const [activeTab, setActiveTab] = useState(0);

    // TEMP

    const sendMobs = (e) => {
        e.preventDefault();
        const scene = game.scene.keys.MainScene;
        const mobManager = scene?.mobManager;
        const player = scene?.player;
        const mobs = mobManager?.mobs;
        mobManager.spawnMobs(mobsCount, [player]);

        mobs.forEach((mob) => {
            mob.moveTo(x, y);
            mob.lookAtPoint(x, y);
        });
    };

    const teleport = () => {
        const player = game.scene.keys.MainScene?.player;

        if (player) {
            player.x = x;
            player.y = y;
            player.shields.x = x;
            player.shields.y = y;
        }
    };

    const [x, setx] = useState(120);
    const [y, sety] = useState(120);
    const [mobsCount, setMobsCount] = useState(0);

    return (
        <>
            <Modal
                className="modal"
                opened={opened}
                onClose={onClose}
                title={<Title order={4}>Game Settings</Title>}
            >
                <Tabs
                    active={activeTab}
                    onTabChange={setActiveTab}
                    color="cyan"
                    defaultValue="audio"
                    children={undefined}
                >
                    <Tabs.List>
                        <Tabs.Tab value="audio">Audio</Tabs.Tab>
                        <Tabs.Tab value="graphics">Graphics</Tabs.Tab>
                        <Tabs.Tab value="controls">Controls</Tabs.Tab>
                        <Tabs.Tab value="ship">Ship</Tabs.Tab>
                        <Tabs.Tab value="cheats">Cheats</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="audio">
                        <div className="group group-vertical">
                            <div className="group group-vertical">
                                <Slider
                                    title="Master Volume"
                                    min={0}
                                    max={1}
                                    onChangeEnd={(value) => setVolume("masterVolume", value)}
                                    defaultValue={settings.masterVolume}
                                />
                                <Slider
                                    title="Music Volume"
                                    min={0}
                                    max={0.025}
                                    onChangeEnd={(value) => setVolume("musicVolume", value)}
                                    defaultValue={settings.musicVolume}
                                />
                                <Slider
                                    title="Effects Volume"
                                    min={0}
                                    max={0.1}
                                    onChangeEnd={(value) => setVolume("effectsVolume", value)}
                                    defaultValue={settings.effectsVolume}
                                />
                            </div>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="graphics">
                        <div className="group group-vertical">
                            <div className="group group-vertical">
                                <Title order={6}>General</Title>
                                <SegmentedControl
                                    color="cyan"
                                    data={[
                                        { label: "Low", value: 0.5 },
                                        { label: "Medium", value: 0.75 },
                                        { label: "High", value: 1 },
                                    ]}
                                    transitionDuration={0}
                                    value={settings.graphicsSettings}
                                    onChange={handleGraphicSettings}
                                />
                            </div>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="controls">
                        <div className="group group-vertical">
                            <div className="group group-vertical">
                                <Title order={6}>Mobile</Title>
                                <Switch
                                    label="Enable touch controls"
                                    checked={touchControlChecked}
                                    onChange={toggleTouchControls}
                                />
                            </div>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="ship">
                        <div className="group group-vertical">
                            <div className="group group-vertical">
                                <Title order={6}>Modules</Title>
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
                            </div>
                        </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="cheats">
                        <div className="group group-vertical">
                            <form onSubmit={sendMobs}>
                                <NumberInput
                                    onChange={(value) => setMobsCount(value)}
                                    defaultValue={mobsCount}
                                    placeholder="You better not put 1000..."
                                    label="Mobs Count"
                                />
                                <NumberInput
                                    onChange={(value) => setx(value)}
                                    defaultValue={x}
                                    placeholder="x"
                                    label="x"
                                />
                                <NumberInput
                                    onChange={(value) => sety(value)}
                                    defaultValue={y}
                                    placeholder="y"
                                    label="y"
                                />
                                <Space h="md" />
                                <Button type="submit">Send mobs at x, y</Button>
                                <Space h="md" />
                                <Button onClick={teleport}>Teleport to x, y</Button>
                            </form>
                        </div>
                    </Tabs.Panel>
                </Tabs>
            </Modal>
        </>
    );
};
