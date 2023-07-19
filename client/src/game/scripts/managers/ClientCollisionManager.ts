import { BaseCollisionManager } from "./BaseCollisionManager";
import type { Projectile } from "~/objects/Sprite/Spaceship/components";

export class ClientCollisionManager extends BaseCollisionManager {
    update() {
        if (!this.projectileGroup.getLength()) return;

        const projectiles = this.projectileGroup.getChildren();

        projectiles.forEach((projectile) => {
            projectile.owner.enemies.forEach((enemy) => {
                const projectilePoint = { x: projectile.x, y: projectile.y };
                const enemyHasShields = enemy.status.shields > 0;
                if (enemyHasShields) {
                    const hitboxCircle = {
                        x: enemy.x,
                        y: enemy.y,
                        r: enemy.shields.body.radius,
                    };

                    const didHitShield = this.isPointInCircle(projectilePoint, hitboxCircle);
                    if (didHitShield) {
                        // TODO reuse projectiles
                        console.log("didHitShield", enemy.shields.body.radius, didHitShield);
                        enemy.getHit(projectile);
                        projectile.destroy();

                        const hitData = {
                            enemyId: enemy.id,
                            projectileId: projectile.id,
                            projectilePoint,
                            hitboxCircle,
                        };

                        projectile.owner.emit("hit:dealed", hitData);
                    }
                } else {
                    const hitboxCircle = {
                        x: enemy.x,
                        y: enemy.y,
                        r: enemy.body.radius,
                    };
                    const didHitBody = this.isPointInCircle(projectilePoint, hitboxCircle);

                    if (didHitBody) {
                        // TODO reuse projectiles
                        console.log("didHitBody", enemy.body.radius, didHitBody);
                        enemy.getHit(projectile);
                        projectile.destroy();

                        // TODO uncomment
                        // this.ship.emit(
                        //     "hit:dealed",
                        //     projectile.id,
                        //     projectilePoint,
                        //     hitboxCircle
                        // );
                    }
                }
            });
        });
    }
}
