export default class GenericText extends Phaser.GameObjects.Text {
    textString;
    constructor(scene, dict) {
        super(scene, 10, 10, "", { color: "white", fontSize: "2rem" });
        scene.add.existing(this);
        this.setOrigin(0);

        this.textString = "";
        for (const [key, value] of Object.entries(dict)) {
            this.textString += `${key}: ${value}\n`;
        }
    }

    public update() {
        this.setText(this.textString);
    }
}
