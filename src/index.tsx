import React from "react";
import { createRoot } from "react-dom/client";
import * as E from "./elements";
import * as View from "./viewport"

function renderControls() {
    const scene = new View.ViewportScene();
    View.sceneObjects.setupScene(scene);

    const controls = document.getElementById("controls");
    const root = createRoot(controls!);
    root.render((
        <>
            <form>
                <E.JsonFileField />
                <E.OptionsField label="Shape" options={[]} /> 
                <E.CheckBoxField label="Display Pattern" value={false} /> 
                <E.NumberField label="Pattern Index" value={0} min={0} max={0} />
            </form>
            <E.JsonDisplay />
        </>
    ))
}

renderControls();