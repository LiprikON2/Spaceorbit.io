import type { Spaceship } from "../Spaceship";

export interface Item {
    itemName: string;
    itemType: string;
    label: string;
    color: string;
}

export interface Outfit {
    weapons: Item[];
    engines: any[];
    inventory: Item[];
}
export class Outfitting {
    scene: Phaser.Scene;
    ship: Spaceship;
    #outfit: Outfit;

    constructor(scene: Phaser.Scene, ship: Spaceship, outfit: Outfit) {
        this.scene = scene;
        this.ship = ship;
        this.#outfit = outfit;

        this.reoutfit();
    }

    reoutfit(newOutfit?: Outfit) {
        if (newOutfit && this.isOutfitValid(newOutfit)) {
            this.#outfit = newOutfit;
        }
        const extraWeapons = this.updateWeapons();
        const extraEngines = this.updateEngines();

        const extraItems = [...extraWeapons, ...extraEngines];

        this.updateInventory(extraItems);
    }
    isOutfitValid(newOutfit: Outfit) {
        // TODO validation
        return true;
    }

    getOutfit() {
        return this.#outfit;
    }

    updateWeapons() {
        let extraWeapons: Item[] = [];

        let weapons = this.#outfit.weapons ?? [];
        weapons = weapons.filter((weapon, index) => {
            const doesFit = this.ship.weapons.placeWeapon(weapon?.itemName, index);
            const isExtraItem = !doesFit && weapon !== null;
            if (isExtraItem) {
                extraWeapons.push(weapon);
            }
            return !isExtraItem;
        });
        this.#outfit.weapons = this.fillEmptySlots(weapons, this.ship.weapons.weaponCount);

        return extraWeapons;
    }
    updateEngines() {
        let extraEngines: any[] = [];

        let engines = this.#outfit.engines ?? [];
        engines = engines.filter((engine, index) => {
            const doesFit = this.ship.exhausts.placeEngine(engine?.itemName, index);
            const isExtraItem = !doesFit && engine !== null;
            if (isExtraItem) {
                extraEngines.push(engine);
            }
            return !isExtraItem;
        });
        const auxiliaryEngineSize = this.ship.exhausts.slotCount - 1;
        this.#outfit.engines = this.fillEmptySlots(engines, auxiliaryEngineSize);
        return extraEngines;
    }
    updateInventory(extraItems: Item[]) {
        const inventorySize = 36;
        let inventory = this.#outfit.inventory;
        inventory = inventory.concat(extraItems);
        this.#outfit.inventory = this.fillEmptySlots(inventory, inventorySize);
    }

    fillEmptySlots(items: Item[], upToCount: number) {
        if (upToCount >= items.length) {
            const emptySlotsToAdd = upToCount - items.length;
            const emptySlots = Array(emptySlotsToAdd).fill(null);

            items = items.concat(emptySlots);
        }
        return items;
    }
}
