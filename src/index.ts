import * as THREE from "three";
import * as Viewport from "./viewport";
import * as GUI from "./gui";

function main() {
    const scene = new Viewport.ViewportScene();
    Viewport.sceneObjects.setupScene(scene);

    let listener = () => {
        if (Viewport.sceneObjects.faceTagCube) scene.remove(Viewport.sceneObjects.faceTagCube);
        if (Viewport.sceneObjects.neighborCubes?.length) Viewport.sceneObjects.neighborCubes.forEach((obj) => scene.remove(obj));
        Viewport.sceneObjects.neighborCubes.length = 0;
        
        let shape = GUI.Data.controls.shapesField.getPickedOption();
        let json = GUI.Data.cachedJson.obj as any;
        if (GUI.Data.controls.showPatternsField.getCheckedState()) {
            let patterns = json.Shapes[shape].PatternsToMatchAnyOf;

            if (patterns) patterns.forEach((obj: any) => {
                let rules = obj.RulesToMatch;

                if (rules?.length) rules.forEach((obj1: any) => {
                    let offset = obj1.Position;
                    let faceTags = obj1.FaceTags;
                    let includeOrExclude = obj1.IncludeOrExclude;
                    
                    let tint = 0xFF8F8F;
                    if (includeOrExclude === "Include") tint = 0x8FFF8F;

                    let pos = new THREE.Vector3(offset.X * 1.25, offset.Y * 1.25, offset.Z * 1.25);
                    let up: string | null = faceTags?.Up?.join("\n");
                    let down: string | null = faceTags?.Down?.join("\n");
                    let north: string | null = faceTags?.North?.join("\n");
                    let south: string | null = faceTags?.South?.join("\n");
                    let west: string | null = faceTags?.West?.join("\n");
                    let east: string | null = faceTags?.East?.join("\n");

                    Viewport.sceneObjects.makeNeighborCube(pos, tint, up, down, north, south, west, east);
                })
            });

            Viewport.sceneObjects.neighborCubes.forEach((obj) => scene.add(obj));
        }
        else {
            let faceTags = json.Shapes[shape].FaceTags;

            let up: string | null = faceTags?.Up?.join("\n");
            let down: string | null = faceTags?.Down?.join("\n");
            let north: string | null = faceTags?.North?.join("\n");
            let south: string | null = faceTags?.South?.join("\n");
            let west: string | null = faceTags?.West?.join("\n");
            let east: string | null = faceTags?.East?.join("\n");

            Viewport.sceneObjects.makeFaceTagCube(up, down, north, south, west, east);
            if (Viewport.sceneObjects.faceTagCube) scene.add(Viewport.sceneObjects.faceTagCube);
        }

        scene.render();
    }

    GUI.initControls();
    GUI.Data.controls.shapesField.addChangedListener(listener);
    GUI.Data.controls.showPatternsField.addChangedListener(listener);
}

main();