import type * as Schema from "./@types/custom_connected_block_template";
import React, { useState, type ChangeEvent } from "react";

function FaRegularIcon({ iconName }: { iconName: string }) {
    return <i className={`icon fa-regular fa-${iconName}`}></i>
}

function FaSolidIcon({ iconName }: { iconName: string }) {
    return <i className={`icon fa-solid fa-${iconName}`}></i>
}

type FieldContainerFieldSettings = {
    title: string
    contents: React.JSX.Element;
}

function FieldContainerField({ title, contents }: FieldContainerFieldSettings) {
    const [open, setOpen] = useState(false)
    const closedIcon = <FaSolidIcon iconName="caret-right" />;
    const openIcon = <FaSolidIcon iconName="caret-down" />;

    const toggleDetails = (event: React.ToggleEvent<HTMLDetailsElement>) => {
        setOpen(event.newState === "open");
    }

    const getIcon = () => open ? openIcon : closedIcon;

    return (
        <div className="field-container">
            <details onToggle={toggleDetails}>
                <summary className="field">{getIcon()}{title}</summary>
            </details>
            <div>
                {contents}
            </div>
        </div>
    )
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
        changedCallback(event.target.checked);
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

// section: JSON display elements begin

type KeyedStringListSettings = {
    listKey: string;
    list: string[] | undefined;
    flush?: boolean;
    addComma?: boolean;
    classes?: string[];
}

function KeyedStringList({ listKey, list, addComma = false, classes = [], flush = true }: KeyedStringListSettings) {
    if (!list) return (<></>);

    const comma = addComma ? "," : "";
    const entries = list.map((tag, index) => {
        let isLast = (index == (list.length - 1));
        let comma = isLast ? "" : ",";

        return <p className="indent-block">"{tag}"{comma}<br /></p>;
    })

    const clazz = [(flush ? "flush-block" : "indent-block")]
    clazz.push(...classes);

    return (
        <li className={clazz.join(" ")}>
            "{listKey}": {"["}
            {entries}
            {"]"}{comma}
        </li>
    )
}

type FaceTagBlockSettings = {
    content: Schema.FaceTags | undefined;
    flush: boolean;
    highlight: boolean;
}

function FaceTagList({ content, flush, highlight }: FaceTagBlockSettings) {
    if (!content) return (<></>);
    const tagsObj = (content as any);

    const keys = ["North", "South", "West", "East", "Down", "Up"];
    const foundKeys = keys.map((key) => { if (key in content) return key }).filter((item) => { if (item !== undefined) return item }); // Help
    const entries = foundKeys.map((key, index) => {
        if (!key) return (<></>);
        let isLast = (index == (foundKeys.length - 1));
        let clazz = highlight ? `face-tag-${key.toLowerCase()} ` : "face-tag";

        return <KeyedStringList listKey={key!} list={tagsObj[key!]} classes={[clazz]} addComma={!isLast} flush={false} />;
    });

    return (
        <ul className={flush ? "flush-block" : "indent-block"}>
            "FaceTags": {"{"}
            {entries}
            {"}"}
        </ul>
    )
}

type PatternRuleBlockSettings = {
    rule: Schema.RuleToMatch | undefined;
    addComma: boolean;
    highlight?: boolean;
}

function PatternRuleBlock({ rule, addComma, highlight = true }: PatternRuleBlockSettings) {
    if (!rule) return (<></>);
    const comma = addComma ? "," : "";

    let className = "rule-str";
    if (rule.IncludeOrExclude === "Include") className = "rule-include-str";
    if (rule.IncludeOrExclude === "Exclude") className = "rule-exclude-str";
    if (!highlight) className = "rule-disabled-str";

    return (
        <li className={`${className} indent-block`}>
            {"{"}
            <ul className="indent-block">
                "Position": {"{"}
                <li className="indent-block">"X": {rule.Position?.X ? rule.Position.X : 0},</li>
                <li className="indent-block">"Y": {rule.Position?.Y ? rule.Position.Y : 0},</li>
                <li className="indent-block">"Z": {rule.Position?.Z ? rule.Position.Z : 0}</li>
                {"}"}, <br />
                "IncludeOrExclude": "{rule.IncludeOrExclude}", <br />
                <FaceTagList content={rule.FaceTags} flush={true} highlight={false} />
                <KeyedStringList listKey="BlockTypes" list={rule.BlockTypes} />{}
                <KeyedStringList listKey="BlockTypeLists" list={rule.BlockTypeLists} />{}
                <KeyedStringList listKey="Shapes" list={rule.Shapes} />{}
                {/* {rule.PlacementNormals} */}
            </ul>
            {"}"}{comma}
        </li>
    )
}

type PatternRuleListSettings = {
    rules: Schema.RuleToMatch[] | undefined;
    highlight: boolean;
}

function PatternRuleList({ rules, highlight }: PatternRuleListSettings) {
    if (!rules) return (<></>);

    const entries = rules.map((rule, index) => {
        let isLast = (index == (rules.length - 1));

        return <PatternRuleBlock rule={rule} addComma={!isLast} highlight={highlight} />
    })

    return (
        <ul className="flush-block">
            "RulesToMatch": {"["}
            {entries}
            {"]"}
        </ul>
    )
}

type PatternBlockSettings = {
    patternClicked: (index: number) => {};
    pattern: Schema.Pattern;
    isLast: boolean;
    index: number;
    activeIndex: number;
    highlightRules: boolean;
}

function PatternBlock({ patternClicked, pattern, isLast, index, activeIndex, highlightRules }: PatternBlockSettings) {
    const comma = isLast ? "" : ",";
    const activeClass = (activeIndex == index) ? "active" : "";

    return (
        <section className={`indent-block pattern-str ${activeClass}`} onClick={() => patternClicked(index)}>
            {"{"}
            <section className="indent-block">
                "Type": "{pattern.Type}", <br />
                "RequireFaceTagsMatchingRoll": {pattern.RequireFaceTagsMatchingRoll ? "true" : "false"}, <br />
                "TransformRulesToOrientation": {pattern.TransformRulesToOrientation ? "true" : "false"}, <br />
                "YawToApplyAddReplacedBlockType": "{pattern.YawToApplyAddReplacedBlockType}", <br />
                <PatternRuleList rules={pattern.RulesToMatch} highlight={highlightRules} />
            </section>
            {"}"}{comma}
        </section>
    );
}

type PatternListSettings = {
    patternClicked: (index: number) => {};
    patterns: Schema.Pattern[] | undefined
    activeIndex: number;
    highlightRules: boolean;
}

function PatternList({ patternClicked, patterns, activeIndex, highlightRules }: PatternListSettings) {
    if (!patterns) return (<></>);

    const entries = patterns.map((pattern, index) => {
        let isLast = (index == (patterns.length - 1));

        return <PatternBlock patternClicked={patternClicked} pattern={pattern} isLast={isLast} index={index} activeIndex={activeIndex} highlightRules={highlightRules} />;
    })
        
    return (
        <ul className="indent-block">
            "PatternsToMatchAnyOf": {"["}
            {entries}
            {"]"}
        </ul>
    )

}

type JsonDisplaySettings = {
    patternClicked: (index: number) => {};
    content: Schema.CustomConnectedBlockTemplateAsset;
    shape: string;
    patternIndex: number;
    highlightTags: boolean;
    highlightRules: boolean;
}

function JsonDisplay({ patternClicked, content, shape, patternIndex, highlightTags, highlightRules }: JsonDisplaySettings) {
    const shapeObj: Schema.Shape = content.Shapes ? content.Shapes![shape] : {};

    return (
        <>
            <p id="json-display-title">Shape JSON view</p>
            <div id="json-display">
                {"{"}
                <FaceTagList content={shapeObj.FaceTags} flush={false} highlight={highlightTags} />
                <PatternList patternClicked={patternClicked} patterns={shapeObj.PatternsToMatchAnyOf} activeIndex={patternIndex} highlightRules={highlightRules} />
                {"}"}
            </div>
        </>
    )
}

// section ends: JSON display elements

export {
    NumberField,
    CheckBoxField,
    OptionsField,
    JsonFileField,
    JsonDisplay,
    FieldContainerField
}