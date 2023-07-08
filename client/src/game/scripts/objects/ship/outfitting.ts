import type { Spaceship } from "./spaceship";

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
export default class Outfitting {
    scene: Phaser.Scene;
    ship: Spaceship;
    #outfit: Outfit;

    constructor(scene: Phaser.Scene, ship: Spaceship, outfit: Outfit) {
        this.scene = scene;
        this.ship = ship;
        this.#outfit = outfit;

        this.reoutfit();
    }

    reoutfit(newOutfit?) {
        if (newOutfit && this.isValidOutfit(newOutfit)) {
            this.#outfit = newOutfit;
        }
        const extraWeapons = this.updateWeapons();
        const extraEngines = this.updateEngines();

        const extraItems = [...extraWeapons, ...extraEngines];

        this.updateInventory(extraItems);
    }
    isValidOutfit(newOutfit) {
        // TODO prevent cheating
        return true;
    }

    getOutfit() {
        return this.#outfit;
    }

    updateWeapons() {
        let extraWeapons: any[] = [];

        let weapons = this.#outfit.weapons ?? [];
        weapons = weapons.filter((weapon, index) => {
            const doesFit = this.ship.weapons.placeWeapon(weapon?.itemName, index);
            const isExtraItem = !doesFit && weapon !== null;
            if (isExtraItem) {
                extraWeapons.push(weapon);
            }
            return !isExtraItem;
        });
        this.#outfit.weapons = this.fillEmptySlots(weapons, this.ship.weapons.getWeaponCount());

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
        const auxiliaryEngineSize = this.ship.exhausts.getSlotCount() - 1;
        this.#outfit.engines = this.fillEmptySlots(engines, auxiliaryEngineSize);
        return extraEngines;
    }
    updateInventory(extraItems) {
        const inventorySize = 36;
        let inventory = this.#outfit.inventory;
        inventory = inventory.concat(extraItems);
        this.#outfit.inventory = this.fillEmptySlots(inventory, inventorySize);
    }

    fillEmptySlots(array, upToCount) {
        if (upToCount >= array.length) {
            const emptySlotsToAdd = upToCount - array.length;
            const emptySlots = Array(emptySlotsToAdd).fill(null);

            array = array.concat(emptySlots);
        }
        return array;
    }
}
