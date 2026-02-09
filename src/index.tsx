import type * as Schema from "./@types/custom_connected_block_template";
import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import * as E from "./elements";
import * as View from "./viewport";
import * as THREE from "three";

function unpackFaceTags(faceTags: any): (string | null)[] {
    let up: string | null = faceTags?.Up?.join("<br>");
    let down: string | null = faceTags?.Down?.join("<br>");
    let north: string | null = faceTags?.North?.join("<br>");
    let south: string | null = faceTags?.South?.join("<br>");
    let west: string | null = faceTags?.West?.join("<br>");
    let east: string | null = faceTags?.East?.join("<br>");
    return [up, down, north, south, west, east];
}

function addOneRuleBox(rule: Schema.RuleToMatch): void {
    let offset = rule.Position;
    let faceTags = rule.FaceTags;
    let shapes = rule.Shapes;
    let includeOrExclude = rule.IncludeOrExclude;
    let types = rule.BlockTypes;
    let typeLists = rule.BlockTypeLists;
    let normals = rule.PlacementNormals;

    let tint = includeOrExclude === "Include" ? 0x8FFF8F : 0xFF8F8F;
    let x = (offset && offset.X ? offset.X : 0) * 1.125;
    let y = (offset && offset.Y ? offset.Y : 0) * 1.125;
    let z = (offset && offset.Z ? offset.Z : 0) * 1.125;
    let pos = new THREE.Vector3(x, y, z);
    let tags = unpackFaceTags(faceTags);

    let texts: string[] = [];
    if (shapes?.length) texts.push(...shapes);
    if (types?.length) texts.push(...types);
    if (typeLists?.length) texts.push(...typeLists);
    if (normals?.length) texts.push(...normals);
    View.sceneObjects.makeShapeLabel(pos, texts.join("<br>"));

    View.sceneObjects.makeNeighborCube(pos, tint, tags[0], tags[1], tags[2], tags[3], tags[4], tags[5]);
}

function addFaceTagBox(scene: View.ViewportScene, faceTags: Schema.FaceTags | undefined): void {
    let tags = unpackFaceTags(faceTags);

    View.sceneObjects.makeFaceTagCube(tags[0], tags[1], tags[2], tags[3], tags[4], tags[5]);
    scene.add(View.sceneObjects.faceTagCube!); // we can assert this exists, we just added it.
}

function addNeighborCubes(scene: View.ViewportScene): void {
    if (View.sceneObjects.shapeLabels.length) scene.add(...View.sceneObjects.shapeLabels);
    if (View.sceneObjects.neighborCubes.length) scene.add(...View.sceneObjects.neighborCubes);
}

function updateScene(scene: View.ViewportScene, props: SceneUpdateInfo): void {
    View.sceneObjects.emptyScene(scene);
    
    if (props.showFloor) {
        View.sceneObjects.makeFloorPlanes();
        scene.add(...View.sceneObjects.floorPlanes);
    }
    
    if (props.json && props.json.Shapes) {
        let shapeObj: Schema.Shape = props.json.Shapes[props.shape];
        let patterns = shapeObj.PatternsToMatchAnyOf;

        if (props.showPattern && patterns) {

            if (patterns && (props.patternIndex < patterns.length)) {
                let pattern = patterns[props.patternIndex];

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
            let faceTags = shapeObj.FaceTags;
            addFaceTagBox(scene, faceTags)
        }

    };
    
    scene.render();
}

type FormProperties = {
    sceneChangedCallback: ({json, shape, showPattern, patternIndex}: SceneUpdateInfo) => {};
}

function FormContent({ sceneChangedCallback }: FormProperties) {
    const [jsonObj, setJsonObj] = useState<Schema.CustomConnectedBlockTemplateAsset>({});
    const [shapeList, setShapeList] = useState(new Array<string>);
    const [maxPatternIndex, setMaxPatternIndex] = useState(0);

    const [shape, setShape] = useState("");
    const [showPattern, setShowPattern] = useState(false);
    const [patternIndex, setPatternIndex] = useState(0);

    const [showFloor, setShowFloor] = useState(true);
    const [highlightTags, setHighlightTags] = useState(true);
    const [highlightRules, setHighlightRules] = useState(true);

    // Sets all default values when a JSON is loaded in.
    const jsonChanged = async (json: string) => {
        let obj = JSON.parse(json) as Schema.CustomConnectedBlockTemplateAsset;

        if (obj) {
            let shapeData = obj.Shapes;
            let shapes: string[] = [];
            
            for (let key in shapeData) shapes.push(key);

            // Set & Reset data States
            setShapeList(shapes);
            setShape(shapes[0]);
            updateMaxPattern(obj, shapes[0]);
            setPatternIndex(0);
            sceneChangedCallback({ json: obj, shape: shapes[0], showPattern: showPattern, patternIndex: 0, showFloor: showFloor, highlightTags: highlightTags, highlightRules: highlightRules });
        }
        else {
            sceneChangedCallback({ json: {}, shape: "", showPattern: showPattern, patternIndex: 0, showFloor: showFloor, highlightTags: highlightTags, highlightRules: highlightRules });
        }

        // Set json States
        setJsonObj(obj);
    };

    // Reads the current shape's pattern count if available.
    const updateMaxPattern = (obj: Schema.CustomConnectedBlockTemplateAsset, shape: string) => {
        if (!obj.Shapes) return;
        if (!obj.Shapes[shape].PatternsToMatchAnyOf) return;
        let patternCount = obj.Shapes[shape].PatternsToMatchAnyOf.length;

        setMaxPatternIndex(patternCount - 1);
    };

    // Also updates max pattern given shapes don't all have the same amount of them.
    // And set pattern to first too, in case we have less than before.
    const shapeChanged = async (value: string) => {
        setShape(value);
        updateMaxPattern(jsonObj, value);
        setPatternIndex(0);
        sceneChangedCallback({ json: jsonObj, shape: value, showPattern: showPattern, patternIndex: 0, showFloor: showFloor, highlightTags: highlightTags, highlightRules: highlightRules});
    };

    const showPatternToggled = async (value: boolean) => {
        setShowPattern(value);
        sceneChangedCallback({ json: jsonObj, shape: shape, showPattern: value, patternIndex: patternIndex, showFloor: showFloor, highlightTags: highlightTags, highlightRules: highlightRules});
    }

    const patternIndexChanged = async (value: number) => {
        setPatternIndex(value);
        sceneChangedCallback({ json: jsonObj, shape: shape, showPattern: showPattern, patternIndex: value, showFloor: showFloor, highlightTags: highlightTags, highlightRules: highlightRules});
    }

    const showFloorToggled = async (value: boolean) => {
        setShowFloor(value);
        sceneChangedCallback({ json: jsonObj, shape: shape, showPattern: showPattern, patternIndex: patternIndex, showFloor: value, highlightTags: highlightTags, highlightRules: highlightRules});
    }

    const highlightTagsToggled = async (value: boolean) => setHighlightTags(value);
    const highlightRulesToggled = async (value: boolean) => setHighlightRules(value);

    return (
        <>
            <section id="control-fields">
                <E.JsonFileField changedCallback={jsonChanged} />
                <E.OptionsField changedCallback={shapeChanged} label="Shape" options={shapeList} />
                <E.NumberField changedCallback={patternIndexChanged} label="Pattern Index" value={patternIndex} min={0} max={maxPatternIndex} />
                <E.CheckBoxField changedCallback={showPatternToggled} label="Display Patterns" value={false} />
                <E.FieldContainerField title="Display Options" contents={(
                    <>
                    <E.CheckBoxField changedCallback={showFloorToggled} label="Display Floor Planes" value={true} />
                    <E.CheckBoxField changedCallback={highlightTagsToggled} label="Highlight Face Tags" value={true} />
                    <E.CheckBoxField changedCallback={highlightRulesToggled} label="Highlight Rules" value={true} />
                    </>
                )} />
            </section>
            <E.JsonDisplay patternClicked={patternIndexChanged} content={jsonObj} shape={shape} patternIndex={patternIndex} highlightTags={highlightTags} highlightRules={highlightRules} />
        </>
    )

}

type SceneUpdateInfo = {
    json: Schema.CustomConnectedBlockTemplateAsset;
    shape: string;
    showPattern: boolean;
    patternIndex: number;
    showFloor: boolean;
    highlightTags: boolean;
    highlightRules: boolean;
}

export default function main() {
    const scene = new View.ViewportScene();
    View.sceneObjects.setupScene(scene);

    const formChanged = async (props: SceneUpdateInfo) => updateScene(scene, props);

    const controls = document.getElementById("controls");
    const root = createRoot(controls!);
    root.render(<FormContent sceneChangedCallback={formChanged} />)
}

main();