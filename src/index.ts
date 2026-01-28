import * as THREE from "three";
import * as View from "./viewport";
import * as GUI from "./gui";

function main() {
    const scene = new View.ViewportScene();
    View.sceneObjects.setupScene(scene);

    let listener = () => {
        if (View.sceneObjects.faceTagCube) scene.remove(View.sceneObjects.faceTagCube);
        if (View.sceneObjects.neighborCubes?.length) View.sceneObjects.neighborCubes.forEach((obj) => scene.remove(obj));
        View.sceneObjects.neighborCubes.length = 0;

        let unpackFaceTags = function(faceTags: any): (string | null)[] {
            let up: string | null = faceTags?.Up?.join("<br>");
            let down: string | null = faceTags?.Down?.join("<br>");
            let north: string | null = faceTags?.North?.join("<br>");
            let south: string | null = faceTags?.South?.join("<br>");
            let west: string | null = faceTags?.West?.join("<br>");
            let east: string | null = faceTags?.East?.join("<br>");
            return [up, down, north, south, west, east];
        }
        
        let shape = GUI.Data.controls.shapesField.getPickedOption();
        let json = GUI.Data.cachedJson.obj as any;
        let patternIndex = GUI.Data.controls.patternIndex.getValue();
        if (GUI.Data.controls.showPatternsField.getCheckedState()) {
            let patterns = json.Shapes[shape].PatternsToMatchAnyOf;

            if (patterns) {
                if (patternIndex >= patterns.length) {
                    scene.render();
                    return;
                };
                GUI.Data.controls.patternIndex.setMax(patterns.length - 1);

                let patternObj = patterns[patternIndex];
                let rules = patternObj.RulesToMatch;

                if (rules?.length) rules.forEach((ruleObj: any) => {
                    let offset = ruleObj.Position;
                    let faceTags = ruleObj.FaceTags;
                    let includeOrExclude = ruleObj.IncludeOrExclude;

                    let tint = 0xFF8F8F;
                    if (includeOrExclude === "Include") tint = 0x8FFF8F;
                    let pos = new THREE.Vector3(offset.X * 1.25, offset.Y * 1.25, offset.Z * 1.25);
                    let tags = unpackFaceTags(faceTags);

                    View.sceneObjects.makeNeighborCube(pos, tint, tags[0], tags[1], tags[2], tags[3], tags[4], tags[5]);
                })
            }

            View.sceneObjects.neighborCubes.forEach((obj) => scene.add(obj));
        }
        else {
            let faceTags = json.Shapes[shape].FaceTags;
            let tags = unpackFaceTags(faceTags);

            View.sceneObjects.makeFaceTagCube(tags[0], tags[1], tags[2], tags[3], tags[4], tags[5]);
            if (View.sceneObjects.faceTagCube) scene.add(View.sceneObjects.faceTagCube);
        }

        scene.render();
    }

    GUI.initControls();
    GUI.Data.controls.shapesField.addChangedListener(listener);
    GUI.Data.controls.showPatternsField.addChangedListener(listener);
    GUI.Data.controls.patternIndex.addChangedListener(listener);
}

main();