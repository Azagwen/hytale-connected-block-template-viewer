import { array } from "three/tsl";
import type * as Schema from "./@types/custom_connected_block_template";
import React, { useState, type ChangeEvent } from "react";

//TODO: Figure out how to dispatch events to the THREEjs Scene from React
//      - Update: this is nearly done, the UI reacts to itself beautifully atm, but still no scene updates

function FaRegularIcon({ iconName }: { iconName: string }) {
    return <i className={`icon fa-regular fa-${iconName}`}></i>
}

function FaSolidIcon({ iconName }: { iconName: string }) {
    return <i className={`icon fa-solid fa-${iconName}`}></i>
}

type NumberFieldSettings = {
    changedCallback: (value: number) => {};
    label: string;
    value: number;
    min: number;
    max: number;
}

function NumberField({ changedCallback, label, value, min, max }: NumberFieldSettings) {
    const setClampedValue = (value: number) => {
        let val = value;
        val = Math.min(max, val);
        val = Math.max(min, val);

        changedCallback(val);
    }
    
    const inputChanged = (event: ChangeEvent<HTMLInputElement>) => setClampedValue(Number(event.target.value));
    const decrement = () => setClampedValue(value - 1);
    const increment = () => setClampedValue(value + 1);

    return (
        <div className="field number-field">
            <label>{label}</label>
            <div>
                <button onClick={decrement} type="button"><FaSolidIcon iconName="minus" /></button>
                <input onChange={inputChanged} type="number" value={value} min={min} max={max} />
                <button onClick={increment} type="button"><FaSolidIcon iconName="plus" /></button>
            </div>
        </div>
    )
}

type CheckBoxFieldSettings = {
    changedCallback: (checked: boolean) => {};
    label: string;
    value: boolean;
}

function CheckBoxField({ changedCallback, label, value }: CheckBoxFieldSettings) {
    const [checked, setChecked] = useState(value);
    const onIcon = <FaSolidIcon iconName={"square-check"} />;
    const offIcon = <FaRegularIcon iconName={"square"} />

    const getIcon = () => checked ? onIcon : offIcon;
    const toggle = (event: ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        changedCallback(checked);
    };
    
    return (
        <div className="field checkbox-field">
            <input type="checkbox" checked={checked} onChange={toggle} />
            <span className="checkbox-faker">
                {getIcon()}
                {label}
            </span>
        </div>
    )
}

type OptionsFieldSettings = {
    changedCallback: (pickedOption: string) => {};
    label: string;
    options: string[];
}

function OptionsField({ changedCallback, label, options }: OptionsFieldSettings) {
    const [pick, setPick] = useState(options[1]);
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const pickOption = (event: ChangeEvent<HTMLSelectElement>) => {
        changedCallback(event.target.value);
        setPick(event.target.value);
    };

    return (
        <div className="field select-field">
            <label className="select-field-title">{label}</label>
            <select className="select-field-input" value={pick} onChange={pickOption}>
                {options.map((option) => (
                    <option key={option} value={option}>{capitalize(option)}</option>
                ))}
            </select>
        </div>
    )
}

type JsonFieldSettings = {
    changedCallback: (json: string) => {};
}

function JsonFileField({ changedCallback }: JsonFieldSettings) {
    const jsonChanged = (event: ChangeEvent<HTMLInputElement>) => {
        let files = event.target.files;
        if (!files) return;

        let file = files[0];
        let reader = new FileReader();
        let jsonContent = ""

        reader.addEventListener("load", (event) => {
            let bfile = event.target?.result;
             if (typeof bfile === "string") {
                jsonContent = bfile;
                changedCallback(jsonContent);
            }
        });

        if (file) reader.readAsText(file);
    }

    return  (
        <div className="field json-field">
            <input className="json-input" onChange={jsonChanged} type="file" accept=".json" multiple={false} />
            <button className="json-reload-button" type="button" disabled={true}>
                <FaSolidIcon iconName="arrow-rotate-right" />
            </button>
        </div>
    )
}

type JsonDisplaySettings = {
    patternClicked: (index: number) => {};
    content: Schema.CustomConnectedBlockTemplateAsset;
    shape: string;
    patternIndex: number;
}

type ruleDisplay = { 
    string: string; 
    object: Schema.RuleToMatch;
}

type patternDisplay = { 
    header: string;
    rulesKey: string;
    rules: ruleDisplay[];
    rulesFooter: string;
    footer: string;
}

type faceTagArrDisplay = { 
    string: string; 
    direction: string;
}

type faceTagDisplay = { 
    header: string;
    faceTagsKey: string;
    faceTags: faceTagArrDisplay[];
    faceTagsFooter: string;
    footer: string;
}

type shapeDisplay = { 
    header: faceTagDisplay;
    patternsKey: string;
    patterns: patternDisplay[];
    patternsFooter: string;
    footer: string;
}

function JsonDisplay({ patternClicked, content, shape, patternIndex }: JsonDisplaySettings) {
    const faceTagsKeyRegex = /(?<![ ]+)(  \"FaceTags": \{\n)([a-zA-Z0-9\,\"\[\]\s\n:?!]+)(  \}[\,]?)/gm;
    const faceTagArrDelimiterRegex = /(?<=    \]),\n(?=    (?:\")?)/gm;
    const patternsKeyRegex = /(  \"PatternsToMatchAnyOf": \[\n)([\D\d]+)(  \]\n)/gm;
    const patternObjDelimiterRegex = /(?:(?<![ ]+)(?<=    \}),\n(?=    \{))/gm;
    const rulesKeyRegex = /(      \"RulesToMatch": \[\n)([\D\d]+)(      \]\n)/gm;
    const ruleObjDelimiterRegex = /(?:(?<![ ]+)(?<=        \}),\n(?=        \{))/gm;

    const faceTagNorthRegex = /(    \"North\": \[\n)/gm;
    const faceTagSouthRegex = /(    \"South\": \[\n)/gm;
    const faceTagWestRegex = /(    \"West\": \[\n)/gm;
    const faceTagEastRegex = /(    \"East\": \[\n)/gm;
    const faceTagDownRegex = /(    \"Down\": \[\n)/gm;
    const faceTagUpRegex = /(    \"Up\": \[\n)/gm;

    // Do I need to explain this?
    const getShapeObj = () => {
        if (content.Shapes && shape) {
            return {... content.Shapes[shape]};
        }
        return {};
    }

    // Use Regex to slice our JSON into pieces we can use inside HTML elements :)
    const getShapeString = (): shapeDisplay => {
        const string = JSON.stringify(getShapeObj(), null, 2);
        const subStr = string.split(patternsKeyRegex);

        let faceTagDisplay: faceTagDisplay = { header: "", faceTagsKey: "", faceTags: [], faceTagsFooter: "", footer: "" };
        if (subStr[0]) {
            let faceTagSubStr = subStr[0].split(faceTagsKeyRegex);

            // Split our facetag block string into its individual values
            let arrDisplays: faceTagArrDisplay[] = [];
            if (faceTagSubStr[2]) {
                let faceTagStrings = faceTagSubStr[2].split(faceTagArrDelimiterRegex);

                // Gather Facetag display data
                for (let i = 0; i < faceTagStrings.length; i++) {
                    let faceTagString = faceTagStrings[i];
                    let direction = "";

                    // Match our facetag JSON string's key against each possible direction
                    if (faceTagString.match(faceTagNorthRegex)) direction = "North";
                    else if (faceTagString.match(faceTagSouthRegex)) direction = "South";
                    else if (faceTagString.match(faceTagWestRegex)) direction = "West";
                    else if (faceTagString.match(faceTagEastRegex)) direction = "East";
                    else if (faceTagString.match(faceTagDownRegex)) direction = "Down";
                    else if (faceTagString.match(faceTagUpRegex)) direction = "Up";

                    arrDisplays.push({ string: faceTagString, direction: direction });
                }
            }

            faceTagDisplay = {
                header: faceTagSubStr[0],
                faceTagsKey: faceTagSubStr[1],
                faceTags: arrDisplays,
                faceTagsFooter: faceTagSubStr[3],
                footer: faceTagSubStr[4],
            }
        }

        // Gather pattern display data for this shape.
        let patterns: patternDisplay[] = [];
        if (subStr[2]) {
            let patternStrings = subStr[2].split(patternObjDelimiterRegex);

            for (let i = 0; i < patternStrings.length; i++) {
                let patternSubStr = patternStrings[i].split(rulesKeyRegex);

                // Gather rule display data for this pattern.
                let rules: ruleDisplay[] = [];
                if (patternSubStr[2]) {
                    let ruleStrings = patternSubStr[2].split(ruleObjDelimiterRegex);

                    for (let i = 0; i < ruleStrings.length; i++) {
                        rules.push({ string: ruleStrings[i], object: JSON.parse(ruleStrings[i]) })
                    }
                }

                // Build pattern display type after Gathering rules (or skipping them).
                patterns[i] = {
                    header: patternSubStr[0],
                    rulesKey: patternSubStr[1],
                    rules: rules,
                    rulesFooter: patternSubStr[3],
                    footer: patternSubStr[4]
                };
            }
        };

        // Build shape display type from our above data.
        return {
            header: faceTagDisplay, 
            patternsKey: subStr[1],
            patterns: patterns,
            patternsFooter: subStr[3], 
            footer: subStr[4]
        };
    }

    const shapeString = getShapeString();
    return (
        <>
            <p id="json-display-title">Shape JSON view</p>
            <div id="json-display">
                {shapeString.header.header}
                {shapeString.header.faceTagsKey}
                {shapeString.header.faceTags.map((data, index) => { // Create face tag elements colored as their direction.
                    let isLast = index == (shapeString.header.faceTags.length - 1);
                    let comma = isLast ? "" : ",";

                    return <i className={`face-tag-${data.direction.toLowerCase()}`}>{data.string}{comma}</i>
                })}
                {shapeString.header.faceTagsFooter}
                {shapeString.header.footer}
                {shapeString.patternsKey}
                {shapeString.patterns.map((pattern, index) => { // Create clickable pattern elements to aid navigation in a user friendly way.
                    let isLast = index == (shapeString.patterns.length - 1);
                    let activeSuffix = (index == patternIndex ? " active" : "");
                    let comma = isLast ? "" : ",";
                    let title = `Click me to see pattern ${index + 1}`;
                    
                    return <i className={"pattern-str" + activeSuffix} title={title} onClick={() => patternClicked(index)}>
                        {pattern.header}
                        {pattern.rulesKey}
                        {pattern.rules.map((data, index) => { // Create rule elements based on the rule's inclusive or exclusive nature.
                            let isLast = index == (pattern.rules.length - 1);
                            let className = "rule-str";
                            let comma = isLast ? "" : ",";

                            if (data.object.IncludeOrExclude !== undefined) {
                                switch (data.object.IncludeOrExclude) {
                                    case "Exclude": className = "rule-exclude-str"; break;
                                    case "Include": className = "rule-include-str"; break;
                                }
                            }

                            return <i className={className}>{data.string}{comma}</i>
                        })}
                        {pattern.rulesFooter}
                        {pattern.footer}

                        {comma}
                    </i>
                })}
                {shapeString.patternsFooter}
                {shapeString.footer}
            </div>
        </>
    )
}

export {
    NumberField,
    CheckBoxField,
    OptionsField,
    JsonFileField,
    JsonDisplay
}