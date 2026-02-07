import React, { useState, type ChangeEvent } from "react";

//TODO: Figure out how to dispatch events to the THREEjs Scene from React

function FaRegularIcon({ iconName }: { iconName: string }) {
    return <i className={`icon fa-regular fa-${iconName}`}></i>
}

function FaSolidIcon({ iconName }: { iconName: string }) {
    return <i className={`icon fa-solid fa-${iconName}`}></i>
}

type NumberFieldSettings = {
    label: string;
    value: number;
    min: number;
    max: number;
}

function NumberField({ label, value, min, max }: NumberFieldSettings) {
    const [data, updateData] = useState({ value: value, min: min, max: max});

    const setDataValue = (value: number) => {
        let val = value;
        val = Math.min(data.max, val);
        val = Math.max(data.min, val);

        updateData({ value: val, min: data.min, max: data.max });
    }
    
    const inputChanged = (event: ChangeEvent<HTMLInputElement>) => setDataValue(Number(event.target.value));
    const decrement = () => setDataValue(data.value - 1);
    const increment = () => setDataValue(data.value + 1);

    return (
        <div className="field number-field">
            <label>{label}</label>
            <div>
                <button onClick={decrement} type="button"><FaSolidIcon iconName="minus" /></button>
                <input onChange={inputChanged} type="number" value={data.value} min={data.min} max={data.max} />
                <button onClick={increment} type="button"><FaSolidIcon iconName="plus" /></button>
            </div>
        </div>
    )
}

type CheckBoxFieldSettings = {
    label: string;
    value: boolean;
}

function CheckBoxField({ label, value }: CheckBoxFieldSettings) {
    const [checked, setChecked] = useState(value);
    const onIcon = <FaSolidIcon iconName={"square-check"} />;
    const offIcon = <FaRegularIcon iconName={"square"} />

    const getIcon = () => checked ? onIcon : offIcon;
    const toggle = (event: ChangeEvent<HTMLInputElement>) => setChecked(event.target.checked);
    
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
    label: string;
    options: string[];
}

function OptionsField({ label, options }: OptionsFieldSettings) {
    const [pick, setPick] = useState(options[1]);
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const pickOption = (event: ChangeEvent<HTMLSelectElement>) => setPick(event.target.value);

    return (
        <div className="field select-field">
            <label className="select-field-title">{label}</label>
            <select className="select-field-input" value={pick} onChange={pickOption}>
                {options.map((option) => (
                    <option value={option}>{capitalize(option)}</option>
                ))}
            </select>
        </div>
    )
}

function JsonFileField() {
    return (
        <div className="field json-field">
            <input className="json-input" type="file" accept=".json" multiple={false} />
            <button className="json-reload-button" type="button" disabled={true}>
                <FaSolidIcon iconName="arrow-rotate-right" />
            </button>
        </div>
    )
}

function JsonDisplay() {
    return (
        <>
            <p id="json-display-title">Shape JSON view</p>
            <div id="json-display"></div>
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