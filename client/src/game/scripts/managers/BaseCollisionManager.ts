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
     * Uses approximation ot find the closest point on ellipse from arbitrary point
     * https://stackoverflow.com/a/46007540
     */
    closestPointOnEllipse(width, height, p: [number, number]) {
        let px = Math.abs(p[0]);
        let py = Math.abs(p[1]);

        let tx = 0.707;
        let ty = 0.707;

        let a = width / 2;
        let b = height / 2;

        for (let x = 0; x < 3; x++) {
            let x_val = a * tx;
            let y = b * ty;

            let ex = ((a * a - b * b) * Math.pow(tx, 3)) / a;
            let ey = ((b * b - a * a) * Math.pow(ty, 3)) / b;

            let rx = x_val - ex;
            let ry = y - ey;

            let qx = px - ex;
            let qy = py - ey;

            let r = Math.hypot(ry, rx);
            let q = Math.hypot(qy, qx);

            tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
            ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
            let t = Math.hypot(ty, tx);
            tx /= t;
            ty /= t;
        }
        return [copySign(a * tx, p[0]), copySign(b * ty, p[1])];
    }

    // getVectorToClosestEllipseFoci(
    //     point: { x: number; y: number },
    //     ellipse: { x: number; y: number; width: number; height: number }
    // ) {
    //     const { x, y } = point;
    //     const { x: ellipseX, y: ellipseY, width, height } = ellipse;

    //     const a = width / 2;
    //     const b = height / 2;

    //     const c = (a ** 2 - b ** 2) ** 0.5;

    //     const isXMajor = width > height;

    //     let focus1: { x: number; y: number }, focus2: { x: number; y: number };
    //     if (isXMajor) {
    //         // Left focus
    //         focus1 = { x: ellipseX - c, y: ellipseY };
    //         // Right focus
    //         focus2 = { x: ellipseX + c, y: ellipseY };
    //     } else {
    //         // Top focus
    //         focus1 = { x: ellipseX, y: ellipseY + c };
    //         // Bottom focus
    //         focus2 = { x: ellipseX, y: ellipseY - c };
    //     }

    //     return { focus1, focus2, isXMajor, isYMajor: !isXMajor };
    // }

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
