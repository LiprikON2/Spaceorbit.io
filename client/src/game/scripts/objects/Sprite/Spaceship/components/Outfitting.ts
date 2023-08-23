import type { Spaceship } from "../Spaceship";
import type { WeaponType } from "./Weapons";

export interface Item {
    itemName: string;
    itemType: string;
    label: string;
    color: string;
}

export interface Outfit {
    weapons: Item[];
    engines: Item[];
    inventory: Item[];
}
export class Outfitting {
    scene: Phaser.Scene;
    ship: Spaceship;
    #outfit: Outfit;

    get inventorySlotCount() {
        return 36;
    }
    get weaponSlotCount() {
        return this.ship.weapons.weaponCount;
    }
    get engineSlotCount() {
        const auxiliaryEngineCount = this.ship.exhausts.slotCount - 1;
        return auxiliaryEngineCount;
    }

    get outfit() {
        return this.#outfit;
    }

    setOutfit(newOutfit: Outfit, toEmit = true) {
        if (this.isValid(newOutfit)) {
            const nonOverflowedOutfit = this.#pushExtraItemsToInv(newOutfit);
            const completeOutfit = this.#fillEmptySlotsOutfit(nonOverflowedOutfit);

            this.#outfit = completeOutfit;
            this.#syncEngines(completeOutfit.engines);
            this.#syncWeapons(completeOutfit.weapons);

            if (toEmit) this.ship.emit("entity:reoutfit", completeOutfit);
            return true;
        }
        return false;
    }

    constructor(scene: Phaser.Scene, ship: Spaceship, outfit: Outfit) {
        this.scene = scene;
        this.ship = ship;

        this.setOutfit(outfit, false);
    }

    isValid(newOutfit: Outfit) {
        const isWpnInvPresent = Array.isArray(newOutfit.weapons);
        const isEngInvPresent = Array.isArray(newOutfit.engines);
        const isInvPresent = Array.isArray(newOutfit.inventory);

        const areAllInvTypesPresent = isWpnInvPresent && isEngInvPresent && isInvPresent;

        if (areAllInvTypesPresent) {
            return true;
        }
        return false;
    }

    getItems(outfit: Outfit = this.outfit) {
        const allItems = [...outfit.weapons, ...outfit.engines, ...outfit.inventory].filter(
            (item) => item !== null
        );
        return allItems;
    }

    diffOutfitItems(newOutfit: Outfit, currentOutfit: Outfit = this.outfit): [Item[], Item[]] {
        const allItemsOutfit1 = this.getItems(newOutfit);
        const allItemsOutfit2 = this.getItems(currentOutfit);

        const itemsAdded = allItemsOutfit1.filter(
            ({ itemName: newItem }) =>
                !allItemsOutfit2.some(({ itemName: currentItem }) => newItem === currentItem)
        );
        const itemsRemoved = allItemsOutfit2.filter(
            ({ itemName: currentItem }) =>
                !allItemsOutfit1.some(({ itemName: newItem }) => newItem === currentItem)
        );

        return [itemsAdded, itemsRemoved];
    }

    add(items: Item[], to: keyof Outfit = "inventory") {
        const updatedItems = [...this.outfit[to], ...items];

        const updatedOutfit = {
            ...this.outfit,
            [to]: updatedItems,
        };

        this.setOutfit(updatedOutfit);
    }

    #fillEmptySlotsOutfit(outfit: Outfit) {
        const { engines, weapons, inventory } = outfit;
        return {
            engines: this.#fillEmptySlotsItems(engines, this.engineSlotCount),
            weapons: this.#fillEmptySlotsItems(weapons, this.weaponSlotCount),
            inventory: this.#fillEmptySlotsItems(inventory, this.inventorySlotCount),
        };
    }

    #fillEmptySlotsItems(items: Item[], upToCount: number) {
        if (upToCount >= items.length) {
            const emptySlotsToAdd = upToCount - items.length;
            const emptySlots = Array(emptySlotsToAdd).fill(null);

            items = [...items, ...emptySlots];
        }
        return items;
    }
    #syncWeapons(weapons: Item[]) {
        weapons.forEach((weapon, index) =>
            this.ship.weapons.fillSlot((weapon?.itemName ?? null) as WeaponType, index)
        );
    }
    #syncEngines(engines: Item[]) {
        engines.forEach((engine, index) => this.ship.exhausts.placeEngine(engine?.itemName, index));
    }

    #pushExtraItemsToInv(outfit: Outfit) {
        const [weapons, extraWeapons] = this.#splitExtraWeapons(outfit.weapons);
        const [engines, extraEngines] = this.#splitExtraEngines(outfit.engines);

        const extraItems = [...extraWeapons, ...extraEngines];
        const inventory = [...outfit.inventory, ...extraItems];

        return {
            weapons,
            engines,
            inventory,
        };
    }
    #splitExtraWeapons(weapons: Item[]): [Item[], Item[]] {
        let extraWeapons: Item[] = [];

        const weaponsInv = weapons.filter((weapon, index) => {
            const doesFit = this.ship.weapons.canBePlaced(weapon?.itemName, index);
            const isExtraItem = !doesFit && weapon !== null;
            if (isExtraItem) extraWeapons.push(weapon);

            return !isExtraItem;
        });

        return [weaponsInv, extraWeapons];
    }
    #splitExtraEngines(engines: Item[]): [Item[], Item[]] {
        let extraEngines: Item[] = [];

        const enginesInv = engines.filter((engine, index) => {
            const doesFit = this.ship.exhausts.canBePlaced(engine?.itemName, index);
            const isExtraItem = !doesFit && engine !== null;
            if (isExtraItem) extraEngines.push(engine);

            return !isExtraItem;
        });

        return [enginesInv, extraEngines];
    }
}
