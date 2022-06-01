import { Divider, Modal, SegmentedControl, Slider, Switch, Tabs, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect, useState } from "react";

import { getGame } from "../game";
import Button from "./components/button";

const SettingsModal = ({ settings, setSettings, opened, onClose }) => {
    const addEngine = () => {
        const scene = getGame().scene.keys.MainScene;
        if (scene) {
            scene.player.exhausts.createExhaust();
        }
    };
    const addLaser = (slot) => {
        const scene = getGame().scene.keys.MainScene;
        if (scene) {
            scene.player.weapons.createLaser(slot);
        }
    };

    const addGatling = (slot) => {
        const scene = getGame().scene.keys.MainScene;
        if (scene) {
            scene.player.weapons.createGatling(slot);
        }
    };

    const setVolume = (key, newValue) => {
        const soundManager = getGame().scene.keys.MainScene.soundManager;
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
        const inputManager = getGame().scene.keys.MainScene.inputManager;
        if (inputManager) {
            inputManager.toggleTouchControls();
            handleTouchControls.toggle();
        }
    };
    console.log("th", settings.enableTouchControls);
    const [touchControlChecked, handleTouchControls] = useDisclosure(settings.enableTouchControls);
    const [activeTab, setActiveTab] = useState(0);
    return (
        <>
            <Modal
                className="modal"
                opened={opened}
                onClose={onClose}
                title={<Title order={4}>Game Settings</Title>}
            >
                <Tabs active={activeTab} onTabChange={setActiveTab} children={undefined}>
                    <Tabs.Tab label="Audio">
                        <div className="group group-vertical">
                            <div className="group group-vertical">
                                <Title order={6}>Master Volume</Title>
                                <Slider
                                    className="slider"
                                    color="cyan"
                                    label={(value) => `${(value * 100).toFixed(0)}%`}
                                    marks={[
                                        { value: 0, label: "0%" },
                                        { value: 0.25, label: "25%" },
                                        { value: 0.5, label: "50%" },
                                        { value: 0.75, label: "75%" },
                                        { value: 1, label: "100%" },
                                    ]}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    onChangeEnd={(value) => setVolume("masterVolume", value)}
                                    defaultValue={settings.masterVolume}
                                />
                                <Title order={6}>Music Volume</Title>
                                <Slider
                                    className="slider"
                                    color="cyan"
                                    label={(value) => `${(value * 2000).toFixed(0)}%`}
                                    marks={[
                                        { value: 0, label: "0%" },
                                        { value: 0.0125, label: "25%" },
                                        { value: 0.025, label: "50%" },
                                        { value: 0.0375, label: "75%" },
                                        { value: 0.05, label: "100%" },
                                    ]}
                                    min={0}
                                    max={0.05}
                                    step={0.0005}
                                    onChangeEnd={(value) => setVolume("musicVolume", value)}
                                    defaultValue={settings.musicVolume}
                                />
                                <Title order={6}>Effects Volume</Title>
                                <Slider
                                    className="slider"
                                    color="cyan"
                                    label={(value) => `${(value * 1000).toFixed(0)}%`}
                                    marks={[
                                        { value: 0, label: "0%" },
                                        { value: 0.025, label: "25%" },
                                        { value: 0.05, label: "50%" },
                                        { value: 0.075, label: "75%" },
                                        { value: 0.1, label: "100%" },
                                    ]}
                                    min={0}
                                    max={0.1}
                                    step={0.001}
                                    onChangeEnd={(value) => setVolume("effectsVolume", value)}
                                    defaultValue={settings.effectsVolume}
                                />
                            </div>
                        </div>
                    </Tabs.Tab>
                    <Tabs.Tab label="Graphics">
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
                    </Tabs.Tab>
                    <Tabs.Tab label="Controls">
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
                    </Tabs.Tab>
                    <Tabs.Tab label="Ship">
                        <div className="group group-vertical">
                            <div className="group group-vertical">
                                <Title order={6}>Modules</Title>
                                <Button className="addEngine" onClick={addEngine}>
                                    Add: Engine
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
                    </Tabs.Tab>
                </Tabs>
            </Modal>
        </>
    );
};

export default SettingsModal;
