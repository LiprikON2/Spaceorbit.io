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

const copySign = (x, y) => (Math.sign(x) === Math.sign(y) ? x : -x);
export class BaseCollisionManager {
    projectileGroup: ProjectileGroup;
    entityGroup: SpaceshipGroup;

    constructor(clientOptions: CollisionManagerClientOptions) {
        const { projectileGroup, entityGroup } = clientOptions;
        this.projectileGroup = projectileGroup;
        this.entityGroup = entityGroup;
    }

    isPointInCircle(point: { x: number; y: number }, circle: { x: number; y: number; r: number }) {
        const { x, y } = point;
        const { x: circleX, y: circleY, r: radius } = circle;

        return (x - circleX) ** 2 + (y - circleY) ** 2 <= radius ** 2;
    }

    isPointInEllipse(
        point: { x: number; y: number },
        ellipse: { x: number; y: number; width: number; height: number }
    ) {
        const { x, y } = point;
        const { x: ellipseX, y: ellipseY, width, height } = ellipse;

        const a = width / 2;
        const b = height / 2;

        return (x - ellipseX) ** 2 / a ** 2 + (y - ellipseY) ** 2 / b ** 2 <= 1;
    }

    /**
     * From arbitrary point, uses an approximation to find the closest point on the ellipse
     * https://stackoverflow.com/a/46007540
     */
    closestPointOnEllipse(
        point: { x: number; y: number },
        ellipse: { x: number; y: number; width: number; height: number }
    ): [number, number] {
        const px = Math.abs(point.x - ellipse.x);
        const py = Math.abs(point.y - ellipse.y);

        let tx = 0.707;
        let ty = 0.707;

        const a = ellipse.width / 2;
        const b = ellipse.height / 2;

        for (let x = 0; x < 3; x++) {
            const xVal = a * tx;
            const y = b * ty;

            let ex = ((a * a - b * b) * tx ** 3) / a;
            const ey = ((b * b - a * a) * ty ** 3) / b;

            const rx = xVal - ex;
            const ry = y - ey;

            const qx = px - ex;
            const qy = py - ey;

            const r = Math.hypot(ry, rx);
            const q = Math.hypot(qy, qx);

            tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
            ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
            const t = Math.hypot(ty, tx);
            tx /= t;
            ty /= t;
        }
        return [copySign(a * tx, point.x - ellipse.x), copySign(b * ty, point.y - ellipse.y)];
    }

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
