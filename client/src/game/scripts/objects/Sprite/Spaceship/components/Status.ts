import type { Multipliers, Spaceship } from "../Spaceship";
import { EveryTick, DebounceChargeBar } from "~/game/utils";
import { HealthbarUI } from "~/game/objects";
import type { BaseScene } from "~/game/scenes/core";

export interface StatusState {
    health: number;
    shields: number;
}

interface BaseStats {
    health: number;
    hitboxRadius: number;
    speed: number;
}

export interface StatusServerOptions {
    ship: Spaceship;
    baseStats: BaseStats;
    multipliers: Multipliers;
}
export interface StatusClientOptions {
    scene: BaseScene;
}

export class Status {
    ship: Spaceship;
    scene: BaseScene;
    baseStats: BaseStats;
    multipliers: Multipliers;

    healthBar: DebounceChargeBar;
    shieldsBar: DebounceChargeBar;

    healthbarUI: HealthbarUI;
    shieldbarUI: HealthbarUI;
    followText: Phaser.GameObjects.Text;

    everyTick = new EveryTick(10);

    get maxHealth() {
        const healthMultiplier = this.multipliers.health;
        return this.baseStats.health * healthMultiplier;
    }
    get maxShields() {
        const shieldsMultiplier = this.multipliers.shields;
        return 10000 * shieldsMultiplier;
    }
    get maxSpeed() {
        // Each additional engine gives 20% speed boost
        const speedBoost = 0.2;
        const { speed } = this.baseStats;
        const countOfAdditionalEngines = this.ship.exhausts.engineCount - 1;
        const speedMultiplier = this.multipliers.speed;

        const shipSpeed = speed + speed * speedBoost * countOfAdditionalEngines;
        return shipSpeed * speedMultiplier;
    }

    get health() {
        return this.healthBar.value;
    }
    get shields() {
        return this.shieldsBar.value;
    }
    get speed() {
        const { x: vx, y: vy } = this.ship.staticBox.body.velocity;
        const speed = Math.sqrt(vx ** 2 + vy ** 2);
        return speed;
    }

    constructor(serverOptions: StatusServerOptions, clientOptions: StatusClientOptions) {
        const { scene } = clientOptions;
        this.scene = scene;
        const { ship } = serverOptions;
        this.ship = ship;

        const { baseStats } = serverOptions;
        this.baseStats = baseStats;

        const { multipliers } = serverOptions;
        this.multipliers = multipliers;

        this.healthBar = new DebounceChargeBar({
            value: this.maxHealth,
            maxValue: this.maxHealth,

            increaseDebouncingTime: 10,
            increasePerSecond: this.maxHealth * 0.02,
            state: "increasing",

            decreasePerSecond: 0,
        });
        this.shieldsBar = new DebounceChargeBar({
            value: this.maxShields,
            maxValue: this.maxShields,

            increaseDebouncingTime: 7,
            increasePerSecond: this.maxShields * 0.04,
            state: "increasing",

            decreasePerSecond: 0,
        });

        const shieldbarOffsetY = this.ship.body.height * this.ship.scale + 50;
        this.shieldbarUI = new HealthbarUI({
            y: shieldbarOffsetY,
            ship: this.ship,
            scene: this.scene,

            fillColor: 0x00ffe1,
        });
        const healthbarOffsetY = shieldbarOffsetY + 15;
        // const healthbarOffsetY = shieldbarOffsetY + 25;
        this.healthbarUI = new HealthbarUI({
            y: healthbarOffsetY,
            ship: this.ship,
            scene: this.scene,
            toFlip: true,

            fillColor: 0x00ab17,
        });

        const textOffsetY = healthbarOffsetY + 30;
        this.followText = this.scene.add
            .text(this.ship.x, this.ship.y + textOffsetY, this.ship.name, {
                color: "rgba(255, 255, 255, 0.75)",
                fontSize: "1.75rem",
                fontFamily: "Kanit",
            })
            .setAlign("center")
            .setOrigin(0.5)
            .setAlpha(1)
            .setDepth(this.ship.depth + 5);

        this.ship.staticBox.pin([this.followText, this.shieldbarUI.box, this.healthbarUI.box], {
            syncRotation: false,
        });
    }

    damageHealth(damage: number) {
        this.healthBar.setValue(this.healthBar.value - Math.abs(damage));
        this.resetDebounce();
    }
    damageShields(damage: number) {
        this.shieldsBar.setValue(this.shieldsBar.value - Math.abs(damage));
        this.resetDebounce();
    }

    /**
     * Resets debounce progress to 0
     */
    resetDebounce() {
        this.healthBar.resetIncreaseDebounce();
        this.shieldsBar.resetIncreaseDebounce();
    }

    healHealth(heal: number) {
        this.healthBar.setValue(this.healthBar.value + Math.abs(heal));
    }
    healShields(heal: number) {
        this.shieldsBar.setValue(this.shieldsBar.value + Math.abs(heal));
    }

    setToMaxHealth() {
        this.healthBar.setValue(this.maxHealth);
        this.healthBar.resetIncreaseDebounce();
    }

    setToMaxShields() {
        this.shieldsBar.setValue(this.maxShields);
        this.shieldsBar.resetIncreaseDebounce();
    }

    getState() {
        return { health: this.health, shields: this.shields };
    }

    update(time: number, delta: number) {
        if (this.ship.activity === "moving") {
            this.healthBar.resetIncreaseDebounce();
        }

        this.everyTick.update(time, delta, () => {
            if (this.healthBar.isIncreasing || this.shieldsBar.isIncreasing) {
                this.ship.emit("entity:heal", this.ship.id);
            }
        });

        this.healthBar.update(time, delta);
        this.shieldsBar.update(time, delta);

        this.updateUI();
    }

    updateUI() {
        this.healthbarUI.setProgress(this.healthBar.normalizedValue);
        this.shieldbarUI.setProgress(this.shieldsBar.normalizedValue);
    }
}
