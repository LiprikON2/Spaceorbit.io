import { DebounceChargeBar } from "~/game/utils/ChargeBar";
import type { Multipliers, Spaceship } from "../Spaceship";

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
export interface StatusClientOptions {}

export class Status {
    healthBar: DebounceChargeBar;
    shieldsBar: DebounceChargeBar;

    ship: Spaceship;
    baseStats: BaseStats;
    multipliers: Multipliers;

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
        const { x: vx, y: vy } = this.ship.boundingBox.body.velocity;
        const speed = Math.sqrt(vx ** 2 + vy ** 2);
        return speed;
    }

    constructor(serverOptions: StatusServerOptions, clientOptions?: StatusClientOptions) {
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
    }

    damageHealth(damage: number) {
        this.healthBar.setValue(this.healthBar.value - damage);
        this.healthBar.resetIncreaseDebounce();
    }
    damageShields(damage: number) {
        this.shieldsBar.setValue(this.shieldsBar.value - damage);
        this.shieldsBar.resetIncreaseDebounce();
    }

    setToMaxHealth() {
        this.healthBar.setValue(this.maxHealth);
    }

    setToMaxShields() {
        this.shieldsBar.setValue(this.maxHealth);
    }

    set(newStatus: { health: number; shields: number }) {}

    update(time: number, delta: number) {
        if (this.ship.activity === "moving") {
            this.healthBar.resetIncreaseDebounce();
        }

        this.healthBar.update(time, delta);
        this.shieldsBar.update(time, delta);
    }
}
