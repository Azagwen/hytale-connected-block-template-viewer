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

function JsonDisplay({ patternClicked, content, shape, patternIndex }: JsonDisplaySettings) {
    const patternsKeyRegex = /(  \"PatternsToMatchAnyOf": \[\n)([\D\d]+)(  \]\n)/gm;
    const patternObjDelimiterRegex = /(?:(?<![ ]+)(?<=    \}),\n(?=    \{))/gm;
    const rulesKeyRegex = /(      \"RulesToMatch": \[\n)([\D\d]+)(      \]\n)/gm;
    const ruleObjDelimiterRegex = /(?:(?<![ ]+)(?<=        \}),\n(?=        \{))/gm;

    // Do I need to explain this?
    const getShapeObj = () => {
        if (content.Shapes && shape) {
            return {... content.Shapes[shape]};
        }
        return {};
    }

    // Use Regex to slice our JSON into pieces we can use inside HTML elements :)
    const getShapeString = () => {
        const string = JSON.stringify(getShapeObj(), null, 2);
        const subStr = string.split(patternsKeyRegex);

        let patterns: string[] = [];
        let rulesDict: {[k: number]: Schema.RuleToMatch[]} = {};
        if (subStr[2]) {
            patterns = subStr[2].split(patternObjDelimiterRegex);
            for (let i = 0; i < patterns.length; i++) {
                let rulesBlock = patterns[i].split(rulesKeyRegex)[2];

                rulesDict[i] = rulesBlock.split(ruleObjDelimiterRegex).map((str) => JSON.parse(str));
            }
        };

        return {
            header: subStr[0], 
            patternsKey: subStr[1],
            patterns: patterns, 
            rulesMap: rulesDict, 
            patternsCloser: subStr[3], 
            jsonCloser: subStr[4]
        };
    }

    const shapeString = getShapeString();
    return (
        <>
            <p id="json-display-title">Shape JSON view</p>
            <div id="json-display">
                {shapeString.header}
                {shapeString.patternsKey}

                {shapeString.patterns.map((string, index) => {
                    let isLast = index == (shapeString.patterns.length - 1);
                    let activeSuffix = (index == patternIndex ? " active" : "");
                    let comma = isLast ? "" : ",";
                    
                    return <i className={"pattern-str" + activeSuffix} onClick={() => patternClicked(index)}>{string}{comma}</i>
                })}

                {shapeString.patternsCloser}
                {shapeString.jsonCloser}
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