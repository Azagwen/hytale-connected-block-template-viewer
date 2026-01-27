import * as Viewport from "./viewport";
import * as GUI from "./gui";

function main() {
    const scene = new Viewport.ViewportScene();
    Viewport.sceneObjects.setupScene(scene);

    GUI.initControls();
    GUI.Data.controls.shapesField.addListener(() => {
        if (Viewport.sceneObjects.faceTagCube) scene.remove(Viewport.sceneObjects.faceTagCube);

        let shape = GUI.Data.controls.shapesField.getPickedOption();
        let json = GUI.Data.cachedJson.obj as any;
        let faceTags = json.Shapes[shape].FaceTags;

        let up: string | null = faceTags?.Up?.join("\n");
        let down: string | null = faceTags?.Down?.join("\n");
        let north: string | null = faceTags?.North?.join("\n");
        let south: string | null = faceTags?.South?.join("\n");
        let west: string | null = faceTags?.West?.join("\n");
        let east: string | null = faceTags?.East?.join("\n");

        Viewport.sceneObjects.makeFaceTagCube(up, down, north, south, west, east);
        if (Viewport.sceneObjects.faceTagCube) scene.add(Viewport.sceneObjects.faceTagCube);
    })
}

main();