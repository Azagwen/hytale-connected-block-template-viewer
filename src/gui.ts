import type * as Schema from "./@types/custom_connected_block_template";

abstract class AbstractField {
    private eventName: string;
    element: HTMLDivElement;
    fieldChangedEvent: CustomEvent<any>;

    constructor(eventName: string, className: string) {
        this.eventName = eventName;
        this.fieldChangedEvent = new CustomEvent(this.eventName);
        this.element = document.createElement("div");
        this.element.classList = `field ${className}`;
    }
    getDom(): HTMLDivElement {
        return this.element;
    }
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject): void {
        this.element.addEventListener(this.eventName, listenerConsumer);
    }

}

class FieldContainer {
    private containerElement: HTMLDivElement;
    private detailsElement: HTMLDetailsElement;
    private contentElement: HTMLDivElement;
    private fields: AbstractField[];

    constructor(title: string, fields: AbstractField[]) {
        this.containerElement = document.createElement("div");
        this.detailsElement = document.createElement("details");
        this.contentElement = document.createElement("div");
        this.fields = fields;

        let closedIcon = `<i class="icon fa-solid fa-caret-right"></i>${title}`;
        let openIcon = `<i class="icon fa-solid fa-caret-down"></i>${title}`
        let summary = document.createElement("summary");
        summary.innerHTML = closedIcon;
        summary.classList = "field";

        this.detailsElement.addEventListener("toggle", () => {
            let isOpen = this.detailsElement.open;
            summary.innerHTML = isOpen ? openIcon : closedIcon;
        })
        this.containerElement.classList = "field-container";
        this.detailsElement.appendChild(summary);

        this.containerElement.appendChild(this.detailsElement);
        this.containerElement.appendChild(this.contentElement);
    }
    getDom() {
        for (let elem of this.fields) {
            this.contentElement.appendChild(elem.getDom());
        }

        return this.containerElement;
    }
}

class NumberField extends AbstractField {
    private inputElement: HTMLInputElement;
    private incrementButtonElement: HTMLButtonElement;
    private decrementButtonElement: HTMLButtonElement;
    private fieldContainerElement: HTMLDivElement;
    private titleElement: HTMLLabelElement;
    private value: number = 0;

    constructor(label: string) {
        super("valueChanged", "number-field");

        this.titleElement = document.createElement("label");
        this.titleElement.textContent = label;

        this.inputElement = document.createElement("input");
        this.inputElement.type = "number";
        this.inputElement.value = "0";
        this.inputElement.min = "0";

        this.incrementButtonElement = document.createElement("button");
        this.incrementButtonElement.textContent = "+";
        this.incrementButtonElement.type = "button";
        this.incrementButtonElement.onclick = () => this.onButtonClicked(1);

        this.decrementButtonElement = document.createElement("button");
        this.decrementButtonElement.textContent = "-";
        this.decrementButtonElement.type = "button";
        this.decrementButtonElement.onclick = () => this.onButtonClicked(-1);

        this.fieldContainerElement = document.createElement("div");
        this.fieldContainerElement.appendChild(this.decrementButtonElement);
        this.fieldContainerElement.appendChild(this.inputElement);
        this.fieldContainerElement.appendChild(this.incrementButtonElement);

        this.element.appendChild(this.titleElement);
        this.element.appendChild(this.fieldContainerElement);

        this.inputElement.onchange =  () => this.onInputChanged();
    }
    private onButtonClicked(amount: number) {
        this.setValue(this.value + amount);
    }
    private onInputChanged() {
        this.value = Number(this.inputElement.value);
        this.element.dispatchEvent(this.fieldChangedEvent);
    }
    setMax(value: number) {
        this.inputElement.max = `${value}`;
    }
    getValue(): number {
        return this.value;
    }
    setValue(newVal: number): void {
        let max = Number(this.inputElement.max);
        let min = Number(this.inputElement.min);

        this.value = newVal;
        this.value = Math.min(max, Math.max(this.value, min))
        this.inputElement.value = `${this.value}`;
        this.element.dispatchEvent(this.fieldChangedEvent);
    }
}

class CheckBoxField extends AbstractField {
    private inputElement: HTMLInputElement;
    private fakeBoxElement: HTMLSpanElement;
    private checked: boolean = false;

    constructor(title: string, checked = false) {
        super("checkboxUpdated", "checkbox-field");
        let offIcon = `<i class="icon fa-regular fa-square"></i>${title}`;
        let onIcon = `<i class="icon fa-solid fa-square-check"></i>${title}`

        this.inputElement = document.createElement("input");
        this.inputElement.type = "checkbox";

        this.fakeBoxElement = document.createElement("span");
        this.fakeBoxElement.classList = "checkbox-faker";
        this.fakeBoxElement.innerHTML = checked ? onIcon : offIcon;

        this.setCheckedState(checked);
        
        this.element.appendChild(this.inputElement);
        this.element.appendChild(this.fakeBoxElement);
        this.inputElement.addEventListener("change", () => {
            this.checked = this.inputElement.checked;

            if (this.checked) {
                this.fakeBoxElement.innerHTML = onIcon;
            }
            else {
                this.fakeBoxElement.innerHTML = offIcon;
            }

            this.element.dispatchEvent(this.fieldChangedEvent);
        });
    }
    getCheckedState(): boolean {
        return this.checked;
    }
    setCheckedState(value: boolean): void {
        this.inputElement.checked = value;
        this.checked = value;
    }
}

class OptionsField extends AbstractField {
    private selectElement: HTMLSelectElement;
    private titleElement: HTMLLabelElement;
    private options: string[];
    private selectedOptions?: string;

    constructor(label: string, options: string[]) {
        super("optionPicked", "select-field")
        this.options = options;
        this.selectElement = document.createElement("select");
        this.selectElement.classList = "select-field-input"

        this.titleElement = document.createElement("label");
        this.titleElement.textContent = label;
        this.titleElement.classList = "select-field-title";

        this.element.appendChild(this.titleElement);
        this.element.appendChild(this.selectElement);
        this.element.addEventListener("change", () => this.setSelectedOption());
    }
    getDom(): HTMLDivElement {
        this.addOptionElements();
        return super.getDom();
    }
    overwriteOptions(newOptions: string[]) {
        this.options = newOptions;
        this.selectElement.length = 0;
        this.addOptionElements();

        if (this.selectedOptions && this.options.includes(this.selectedOptions)) {
            this.selectElement.value = this.selectedOptions;
            this.dispatchOptionPicked();
        }
        else {
             this.setSelectedOption();
        }
    }
    private addOptionElements() {
        let optionElements: HTMLOptionElement[] = this.options.map((value) => {
            let elem = document.createElement("option");
            elem.value = value;
            elem.text = value.charAt(0).toUpperCase() + value.slice(1)
            return elem;
        })

        optionElements.forEach((option) => this.selectElement.add(option));
    }
    private setSelectedOption() {
        let options = this.selectElement.selectedOptions;

        if (options.length) {
            this.selectedOptions = options[0].label;
            this.dispatchOptionPicked();
        }
    }
    getPickedOption(): string {
        if (this.selectedOptions) return this.selectedOptions;
        return "";
    }
    dispatchOptionPicked() {
        this.element.dispatchEvent(this.fieldChangedEvent);
    }
}

class JsonFileField extends AbstractField {
    private jsonContent?: string;
    private lastFile?: File;
    private inputElement: HTMLInputElement;
    private reloadButton: HTMLButtonElement;

    constructor() {
        super("jsonDelivered", "json-field");

        this.inputElement = document.createElement("input")
        this.inputElement.accept = ".json";
        this.inputElement.type = "file";
        this.inputElement.multiple = false;
        this.inputElement.classList = "json-input"

        this.reloadButton = document.createElement("button");
        this.reloadButton.textContent = "⟳";
        this.reloadButton.type = "button";
        this.reloadButton.classList = "json-reload-button"
        this.reloadButton.disabled = true;

        this.element.appendChild(this.inputElement);
        this.element.appendChild(this.reloadButton);

        this.inputElement.addEventListener("change", () => {
            let file = this.getCurrentInputFile();
            
            if (file) {
                this.lastFile = file;
                this.loadFile();
                this.reloadButton.disabled = false;
            }
        }); 
        this.reloadButton.onclick = () => {
            if (this.lastFile) {
                this.loadFile();
            }
        };
    }
    private loadFile() {
        let file = this.getCurrentInputFile();
        let reader = new FileReader();

        reader.addEventListener("load", (event) => {
            let bfile = event.target?.result;
             if (typeof bfile === "string") {
                this.jsonContent = bfile;
                this.element.dispatchEvent(this.fieldChangedEvent);
            }
        });

        if (file) reader.readAsText(file);
    }
    getCurrentInputFile(): File | null | undefined {
        return this.inputElement.files?.item(0);
    }
    getJsonContent(): string {
        if (this.jsonContent) return this.jsonContent;
        return "";
    }
}

const Data = {
    cachedJson: {
        str: "",
        obj: undefined
    },
    controls: {
        jsonFileField: new JsonFileField(),
        shapesField: new OptionsField("Shape Selector", []),
        showPatternsField: new CheckBoxField("Show Patterns"),
        showFloorGridField: new CheckBoxField("Disable Floor Grid"),
        patternIndexField: new NumberField("Pattern Index"),
        showFaceTagHighlights: new CheckBoxField("Highlight Facetags", true),
        showRuleHighlights: new CheckBoxField("Highlight Rules", true)
    },
    updateJsonDisplay: function() {
        let display = document.getElementById("json_display");
        let shape = Data.controls.shapesField.getPickedOption();
        let indent = 2;
        let s4 = "  ";
        let s8 = "    ";
        let st = "      ";
        let se = "        ";

        let handleRules = (key: string, potentialRule: any) => {
            if (key === "RulesToMatch") {
                let rules = potentialRule as Schema.RuleToMatch[];
                let type = "rule";
                
                let result = "";
                for (let i = 0; i < rules.length; i++) {
                    let rule = rules[i];
                    let data = `data-${type}-index=${i}`;
                    let clazz = `${type}-str`;
                    let comma = ",";

                    if (rule.IncludeOrExclude === "Include") clazz = `${type}-include-str`;
                    if (rule.IncludeOrExclude === "Exclude") clazz = `${type}-exclude-str`;
                    if (!Data.controls.showRuleHighlights.getCheckedState()) clazz = `${type}-disabled-str`;
                    if (i == rules.length - 1) comma = "";
                    
                    result += `<i class=${clazz} ${data}>${se}${JSON.stringify(rule, null, indent)}${comma}</i>`
                }

                return `[${result.replaceAll("\n", `<br>${se}`)}${st}]`;
            }
            return potentialRule;
        }
        
        let handlePatterns = (patterns: Schema.Pattern[]) => {
            let type = "pattern";

            let result = "";
            for (let i = 0; i < patterns.length; i++) {
                let pattern = patterns[i];
                let data = `data-${type}-index=${i}`;
                let title = `title="Click me to see ${type} ${i}"`;
                let clazz = `${type}-str`;
                let comma = ",";

                let patternIndex = Data.controls.patternIndexField.getValue();
                if (i === patternIndex) clazz += " active";
                if (i == patterns.length - 1) comma = "";

                result += `<i class="${clazz}" ${data} ${title}>${s8}${JSON.stringify(pattern, handleRules, indent)}${comma}</i>`;
            }
             
            let finalresult = `[${result.replaceAll("\n", `<br>${s8}`)}${s4}]`;
            finalresult = finalresult.replaceAll("\\n", `<br>${st}`);
            finalresult = finalresult.replaceAll("\\\"", `"`);

            return finalresult
        }

        let replacer = (key: string, value: any) => {
            if (key === "PatternsToMatchAnyOf") {
                let patterns = value as Schema.Pattern[];
                return handlePatterns(patterns);
            }
            if (key === "FaceTags" && Data.controls.showFaceTagHighlights.getCheckedState()) {
                let faceTags = value as Schema.FaceTags;

                
                let faceTagStrs: string[] = [];
                let tryAddDirection = (dir: string, arr: string[] | undefined, comma = false) => { 
                    let c = ",";
                    if (!comma) c = "";

                    if (arr) {
                        faceTagStrs.push(`<i class="face-tag-${dir.toLowerCase()}">${s8}"${dir}": ${JSON.stringify(arr, null, indent)}${c}</i>`);
                    }
                }
                tryAddDirection("North", faceTags.North, Boolean(faceTags.South));
                tryAddDirection("South", faceTags.South, Boolean(faceTags.West));
                tryAddDirection("West", faceTags.West, Boolean(faceTags.East));
                tryAddDirection("East", faceTags.East, Boolean(faceTags.Down));
                tryAddDirection("Down", faceTags.Down, Boolean(faceTags.Up));
                tryAddDirection("Up", faceTags.Up);

                return `{<br>${faceTagStrs.join("")}${s4}}`.replaceAll("\n", `<br>${s8}`);
            }

            return value;
        }

        if (Data.cachedJson.obj && display) {
            let json = Data.cachedJson.obj as Schema.CustomConnectedBlockTemplateAsset;
            let shapeObj = json.Shapes![shape];

            // Fattest strigify around, followed by its ugly replaceAll chain to rectify the strigify's output
            let jsonString = JSON.stringify(shapeObj, replacer, indent);
            jsonString = jsonString.replaceAll("\\\"", `"`); // remove \" where it occurs 
            jsonString = jsonString.replaceAll(`"[`, "["); // remove "[ where it occurs 
            jsonString = jsonString.replaceAll(`]"`, "]"); // remove ]" where it occurs 
            jsonString = jsonString.replaceAll(`"{`, "{"); // remove "{ where it occurs 
            jsonString = jsonString.replaceAll(`}"`, "}"); // remove }" where it occurs 

            display.innerHTML = jsonString;
        }

        let patternElements = document.querySelectorAll(".pattern-str") as NodeListOf<HTMLLIElement>;
        if (!patternElements) return;
        for (let elem of patternElements) {
            elem.addEventListener("click", () => {
                Data.controls.patternIndexField.setValue(Number(elem.dataset.patternIndex));
            })
        }
    }
}

function initControls() {
    let formContainer = document.getElementById("controls");
    let form = document.createElement("form");
    let jsonDisplayTitle = document.createElement("p");
    let jsonDisplay = document.createElement("div");

    jsonDisplayTitle.textContent = "Shape JSON view";
    jsonDisplayTitle.id = "json_display_title";
    jsonDisplay.id = "json_display";
    formContainer?.appendChild(form);
    formContainer?.appendChild(jsonDisplayTitle);
    formContainer?.appendChild(jsonDisplay);

    // Setup JSON reading
    Data.controls.jsonFileField.addChangedListener(() => {
        Data.cachedJson.str = Data.controls.jsonFileField.getJsonContent();
        Data.cachedJson.obj = JSON.parse(Data.cachedJson.str);

        if (Data.cachedJson.obj) {
            let shapeData = Data.cachedJson.obj["Shapes"] as any;
            let keys: string[] = [];
            
            for (let key in shapeData) keys.push(key);
            Data.controls.shapesField.overwriteOptions(keys);
        }
    })

    // Read shapes trigger
    Data.controls.shapesField.addChangedListener(Data.updateJsonDisplay);
    Data.controls.patternIndexField.addChangedListener(Data.updateJsonDisplay);
    Data.controls.showFaceTagHighlights.addChangedListener(Data.updateJsonDisplay);
    Data.controls.showRuleHighlights.addChangedListener(Data.updateJsonDisplay);

    // Add fields to panel
    let fields = [];
    fields.push(Data.controls.jsonFileField);
    fields.push(Data.controls.shapesField);
    fields.push(Data.controls.showPatternsField);
    fields.push(Data.controls.patternIndexField);
    fields.push(new FieldContainer("Further Options", [
        Data.controls.showFloorGridField,
        Data.controls.showFaceTagHighlights,
        Data.controls.showRuleHighlights
    ]));
    fields.forEach((field) => form.appendChild(field.getDom()));
}

export {
    initControls,
    Data
}
