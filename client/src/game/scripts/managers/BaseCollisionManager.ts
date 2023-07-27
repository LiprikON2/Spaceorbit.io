import type { Projectile } from "~/objects/Sprite/Spaceship/components";
import type { ProjectileGroup, SpaceshipGroup } from "~/managers/BaseEntityManager";

interface CollisionManagerClientOptions {
    projectileGroup: ProjectileGroup;
    entityGroup: SpaceshipGroup;
}

export interface ClientHitData {
    enemyId: string;
    weaponId: number;
    firedFromPoint: { x: number; y: number };
    projectilePoint: { x: number; y: number };
    time: number;
}

export class BaseCollisionManager {
    projectileGroup: ProjectileGroup;
    entityGroup: SpaceshipGroup;

    constructor(clientOptions: CollisionManagerClientOptions) {
        const { projectileGroup, entityGroup } = clientOptions;
        this.projectileGroup = projectileGroup;
        this.entityGroup = entityGroup;
    }

    isPointInCircle = (
        point: { x: number; y: number },
        circle: { x: number; y: number; r: number }
    ) => {
        const { x, y } = point;
        const { x: circleX, y: circleY, r: radius } = circle;

        return (x - circleX) ** 2 + (y - circleY) ** 2 <= radius ** 2;
    };

    emitOnHit(projectile: Projectile) {
        projectile.owner.enemies.forEach((enemy) => {
            if (enemy.active) {
                const projectilePoint = { x: projectile.x, y: projectile.y };
                const { hitboxCircle } = enemy;

                const didHit = this.isPointInCircle(projectilePoint, hitboxCircle);
                if (didHit) {
                    // TODO reuse projectiles
                    projectile.destroy();

                    const hitData: Partial<ClientHitData> = {
                        enemyId: enemy.id,
                        weaponId: projectile.firedFrom.id,
                        firedFromPoint: projectile.firedFromPoint,
                        projectilePoint,
                    };

                    projectile.owner.emit("entity:hit", hitData);
                }
            }
        });
    }

    update(time: number, delta: number) {
        if (!this.projectileGroup.getLength()) return;
        const projectiles = this.projectileGroup.getChildren();

        projectiles.forEach((projectile) => this.emitOnHit(projectile));
    }
}
