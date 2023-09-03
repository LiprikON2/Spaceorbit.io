interface Attacker {
    id: string;
    damage: number;
    // type: "shields" | "hull";
}

interface Contributions {
    [attackerId: string]: Contribution;
}

interface Contribution {
    damage: number;
    percentage: number;
}

export class AttackerRecord {
    #attackers: Attacker[] = [];
    constructor() {}

    get attackers() {
        return this.#attackers.slice().reverse();
    }

    add(damage: number, attackerId: string) {
        this.#attackers.push({ id: attackerId, damage });
    }

    clear() {
        this.#attackers = [];
    }

    calcContributions(upToHealth: number) {
        const contributions: Contributions = {};
        const attackers = this.attackers;

        let cumDamage = 0;
        let i = 0;
        while (cumDamage < upToHealth && i < attackers.length) {
            const attacker = attackers[i];

            const maxPossibleDamage = upToHealth - cumDamage;
            const effectiveDamage = Math.min(attacker.damage, maxPossibleDamage);
            cumDamage += effectiveDamage;

            if (!(attacker.id in contributions))
                contributions[attacker.id] = { damage: 0, percentage: 0 };
            contributions[attacker.id].damage += effectiveDamage;
            contributions[attacker.id].percentage += effectiveDamage / upToHealth;

            i++;
        }

        this.clear();

        return contributions;
    }
}
