import type { ProjectileGroup, SpaceshipGroup } from "~/scenes/core/BaseScene";

interface collisionManagerClientOptions {
    projectileGroup: ProjectileGroup;
    allGroup: SpaceshipGroup;
}

export class BaseCollisionManager {
    projectileGroup: ProjectileGroup;
    allGroup: SpaceshipGroup;

    constructor(clientOptions: collisionManagerClientOptions) {
        const { projectileGroup, allGroup } = clientOptions;
        this.projectileGroup = projectileGroup;
        this.allGroup = allGroup;
    }

    isPointInCircle = (
        point: { x: number; y: number },
        circle: { x: number; y: number; r: number }
    ) => {
        const { x, y } = point;
        const { x: circleX, y: circleY, r: radius } = circle;

        return (x - circleX) ** 2 + (y - circleY) ** 2 <= radius ** 2;
    };
}
