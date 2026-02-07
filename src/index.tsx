import React from "react";
import { createRoot } from "react-dom/client";
import * as E from "./elements";
import * as View from "./viewport"

function app() {
    const scene = new View.ViewportScene();
    View.sceneObjects.setupScene(scene);

    const controls = document.getElementById("controls");
    const root = createRoot(controls!);
    root.render((
        <form>
            <E.NumberField label="Test Field" value={0} min={0} max={10} />
            <E.CheckBoxField label="Test Checkbox" value={false} /> 
            <E.CheckBoxField label="Test Checkbox 2" value={true} /> 
            <E.OptionsField label="Test Options" options={["a", "b", "c"]} /> 
            <E.JsonFileField /> 
        </form>
    ))
}

app();