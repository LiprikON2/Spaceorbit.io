import type { Reward, Multipliers, Spaceship } from "~/game/objects/Sprite/Spaceship";
import { EveryTick, DebounceChargeBar } from "~/game/utils";
import { HealthbarUI } from "~/game/objects";
import type { BaseScene } from "~/game/scenes/core";
import { AttackerRecord } from "./components";

export interface StatusState {
    hullHp: number;
    shieldsHp: number;
}

interface BaseStats {
    hullHp: number;
    hitboxRadius: number;
    speed: number;
}

export interface StatusServerOptions {
    ship: Spaceship;
    baseStats: BaseStats;
    multipliers: Multipliers;
    attackerReward: Reward;
}
export interface StatusClientOptions {
    scene: BaseScene;
}

export class Status {
    ship: Spaceship;
    scene: BaseScene;
    baseStats: BaseStats;
    multipliers: Multipliers;

    healthbar: DebounceChargeBar;
    shieldbar: DebounceChargeBar;

    healthbarUI: HealthbarUI;
    shieldbarUI: HealthbarUI;
    followText: Phaser.GameObjects.Text;

    attackerReward: Reward;

    everyTick = new EveryTick(10);
    attackerRecord = new AttackerRecord();

    get maxHullHp() {
        const healthMultiplier = this.multipliers.hullHp;
        return this.baseStats.hullHp * healthMultiplier;
    }
    get maxShieldsHp() {
        const shieldsMultiplier = this.multipliers.shieldsHp;
        return 10000 * shieldsMultiplier;
    }

    get maxHp() {
        return this.maxHullHp + this.maxShieldsHp;
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

    get hullHp() {
        return this.healthbar.value;
    }
    get shieldsHp() {
        return this.shieldbar.value;
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

        const { attackerReward } = serverOptions;
        this.attackerReward = attackerReward;

        this.healthbar = new DebounceChargeBar({
            value: this.maxHullHp,
            maxValue: this.maxHullHp,

            increaseDebouncingTime: 10,
            increasePerSecond: this.maxHullHp * 0.02,
            state: "increasing",

            decreasePerSecond: 0,
        });
        this.shieldbar = new DebounceChargeBar({
            value: this.maxShieldsHp,
            maxValue: this.maxShieldsHp,

            increaseDebouncingTime: 7,
            increasePerSecond: this.maxShieldsHp * 0.04,
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

    damageHull(damage: number) {
        const damageDealed = this.healthbar.setValue(this.healthbar.value - Math.abs(damage));
        this.resetDebounce();

        return damageDealed;
    }
    damageShields(damage: number) {
        const damageDealed = this.shieldbar.setValue(this.shieldbar.value - Math.abs(damage));
        this.resetDebounce();

        return damageDealed;
    }

    getAttackerRewards(percentageIncrement = 0.05) {
        const contributions = this.attackerRecord.calcContributions(this.maxHp);
        const rewards = Object.entries(contributions).map(([contributor, contribution]) => {
            const roundedPercentage =
                Math.ceil(contribution.percentage / percentageIncrement) * percentageIncrement;

            const exp = roundedPercentage * this.attackerReward.exp;
            const currency = roundedPercentage * this.attackerReward.currency;
            const attackerReward: Reward = { exp, currency };

            return [contributor, attackerReward] as [string, Reward];
        });

        return rewards;
    }

    /**
     * Resets debounce progress to 0
     */
    resetDebounce() {
        this.healthbar.resetIncreaseDebounce();
        this.shieldbar.resetIncreaseDebounce();
    }

    reset() {
        this.setToMaxHullHp();
        this.setToMaxShieldsHp();
    }

    healHull(heal: number) {
        this.healthbar.setValue(this.healthbar.value + Math.abs(heal));
    }
    healShields(heal: number) {
        this.shieldbar.setValue(this.shieldbar.value + Math.abs(heal));
    }

    setToMaxHullHp() {
        this.healthbar.setValue(this.maxHullHp);
        this.healthbar.resetIncreaseDebounce();
    }

    setToMaxShieldsHp() {
        this.shieldbar.setValue(this.maxShieldsHp);
        this.shieldbar.resetIncreaseDebounce();
    }

    getState(): StatusState {
        return { hullHp: this.hullHp, shieldsHp: this.shieldsHp };
    }

    update(time: number, delta: number) {
        if (this.ship.isAuthority) this.updateCalculations(time, delta);
        this.updateUI();
    }

    updateCalculations(time: number, delta: number) {
        if (this.ship.activity === "moving") {
            this.healthbar.resetIncreaseDebounce();
        }

        this.everyTick.update(time, delta, () => {
            if (this.healthbar.isIncreasing || this.shieldbar.isIncreasing) {
                this.ship.emit("entity:heal", this.ship.id);
            }
        });

        this.healthbar.update(time, delta);
        this.shieldbar.update(time, delta);
    }

    updateUI() {
        this.healthbarUI.setProgress(this.healthbar.normalizedValue);
        this.shieldbarUI.setProgress(this.shieldbar.normalizedValue);
    }
}
