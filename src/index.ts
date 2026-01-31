import * as THREE from "three";
import * as View from "./viewport";
import * as GUI from "./gui";
import type * as Schema from "./@types/custom_connected_block_template";

function unpackFaceTags(faceTags: any): (string | null)[] {
    let up: string | null = faceTags?.Up?.join("<br>");
    let down: string | null = faceTags?.Down?.join("<br>");
    let north: string | null = faceTags?.North?.join("<br>");
    let south: string | null = faceTags?.South?.join("<br>");
    let west: string | null = faceTags?.West?.join("<br>");
    let east: string | null = faceTags?.East?.join("<br>");
    return [up, down, north, south, west, east];
}

function addOneRuleBox (rule: Schema.RuleToMatch) {
    let offset = rule.Position;
    let faceTags = rule.FaceTags;
    let shapes = rule.Shapes;
    let includeOrExclude = rule.IncludeOrExclude;

    let tint = 0xFF8F8F;
    if (includeOrExclude === "Include") tint = 0x8FFF8F;
    let pos = new THREE.Vector3(offset!.X * 1.125, offset!.Y * 1.125, offset!.Z * 1.125);
    let tags = unpackFaceTags(faceTags);

    if (shapes?.length) {
        let shapeText = shapes?.join("<br>");
        View.sceneObjects.makeShapeLabel(pos, shapeText);
    }

    View.sceneObjects.makeNeighborCube(pos, tint, tags[0], tags[1], tags[2], tags[3], tags[4], tags[5]);
}

function addFaceTagBox (scene: View.ViewportScene, faceTags: Schema.FaceTags | undefined) {
    let tags = unpackFaceTags(faceTags);

    View.sceneObjects.makeFaceTagCube(tags[0], tags[1], tags[2], tags[3], tags[4], tags[5]);
    scene.add(View.sceneObjects.faceTagCube!); // we can assert this exists, we just added it.
}

function addNeighborCubes(scene: View.ViewportScene) {
    if (View.sceneObjects.shapeLabels.length) scene.add(...View.sceneObjects.shapeLabels);
    if (View.sceneObjects.neighborCubes.length) scene.add(...View.sceneObjects.neighborCubes);
}

function setMaxPatterns(patternAmount: number) {
    GUI.Data.controls.patternIndexField.setMax(patternAmount - 1);
}

function processJson(scene: View.ViewportScene) {
    let json = GUI.Data.cachedJson.obj as any;
    let shapeId = GUI.Data.controls.shapesField.getPickedOption();
    let patternIndex = GUI.Data.controls.patternIndexField.getValue();

    let shape: Schema.Shape = json.Shapes[shapeId];

    if (GUI.Data.controls.showPatternsField.getCheckedState()) {
        let patterns = shape.PatternsToMatchAnyOf;

        if (patterns && (patternIndex < patterns.length)) {
            let pattern = patterns[patternIndex];
            setMaxPatterns(patternIndex);

            let rules = pattern.RulesToMatch;
            if (rules) {
                for (let rule of rules) {
                    addOneRuleBox(rule);
                }
            }
        }

        addNeighborCubes(scene);
    }
    else {
        let faceTags = shape.FaceTags;
        addFaceTagBox(scene, faceTags)
    }
}

function main() {
    const scene = new View.ViewportScene();
    View.sceneObjects.setupScene(scene);

    let listener = () => {
        View.sceneObjects.emptyScene(scene);

        if (!GUI.Data.controls.showFloorGridField.getCheckedState()) {
            View.sceneObjects.makeFloorPlanes();
            scene.add(...View.sceneObjects.floorPlanes);
        }

        processJson(scene);
        
        scene.render();
    }

    GUI.initControls();

    GUI.Data.controls.shapesField.addChangedListener(listener);
    GUI.Data.controls.showPatternsField.addChangedListener(listener);
    GUI.Data.controls.showFloorGridField.addChangedListener(listener);
    GUI.Data.controls.patternIndexField.addChangedListener(listener);

    GUI.Data.controls.showFloorGridField.addChangedListener(() => scene.render());
}

main();