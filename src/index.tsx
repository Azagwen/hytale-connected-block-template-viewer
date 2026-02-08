import type * as Schema from "./@types/custom_connected_block_template";
import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import * as E from "./elements";
import * as View from "./viewport";

type FormProperties = {
    changedCallback: (json: string, shape: string, showPattern: boolean, patternIndex: number) => {};
}

function FormContent({ changedCallback }: FormProperties) {
    const [jsonObj, setJsonObj] = useState<Schema.CustomConnectedBlockTemplateAsset>({});
    const [shapeList, setShapeList] = useState(new Array<string>);
    const [maxPatternIndex, setMaxPatternIndex] = useState(0);
    const [shape, setShape] = useState("");
    const [showPattern, setShowPattern] = useState(false);
    const [patternIndex, setPatternIndex] = useState(0);

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
    const shapeChanged = async (shape: string) => {
        setShape(shape);
        updateMaxPattern(jsonObj, shape);
        setPatternIndex(0);
    };

    const showPatternToggled = async (showPattern: boolean) => setShowPattern(showPattern);
    const patternIndexChanged = async (patternIndex: number) => setPatternIndex(patternIndex);

    return (
        <>
            <form>
                <E.JsonFileField changedCallback={jsonChanged} />
                <E.OptionsField changedCallback={shapeChanged} label="Shape" options={shapeList} /> 
                <E.CheckBoxField changedCallback={showPatternToggled} label="Display Pattern" value={false} /> 
                <E.NumberField changedCallback={patternIndexChanged} label="Pattern Index" value={patternIndex} min={0} max={maxPatternIndex} />
            </form>
            <E.JsonDisplay patternClicked={patternIndexChanged} content={jsonObj} shape={shape} patternIndex={patternIndex} />
        </>
    )

}

function renderControls() {
    const scene = new View.ViewportScene();
    View.sceneObjects.setupScene(scene);

    const formChanged = async () => {};

    const controls = document.getElementById("controls");
    const root = createRoot(controls!);
    root.render(<FormContent changedCallback={formChanged} />)
}

renderControls();