interface collisionManagerClientOptions {
    projectileGroup: Phaser.GameObjects.Group;
    allGroup: Phaser.GameObjects.Group;
}

export class BaseCollisionManager {
    projectileGroup: Phaser.GameObjects.Group;
    allGroup: Phaser.GameObjects.Group;

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
