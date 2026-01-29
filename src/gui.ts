
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
        let max = Number(this.inputElement.max);
        let min = Number(this.inputElement.min);

        this.value = Number(this.inputElement.value) + amount;
        this.value = Math.min(max, Math.max(this.value, min))
        this.inputElement.value = `${this.value}`;
        this.element.dispatchEvent(this.fieldChangedEvent);
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
}

class CheckBoxField extends AbstractField {
    private inputElement: HTMLInputElement;
    private fakeBoxElement: HTMLSpanElement;
    private checked: boolean = false;
    private labels = { off: "", on: ""}

    constructor(off_label?: string, on_label?: string) {
        super("checkboxUpdated", "checkbox-field");

        this.inputElement = document.createElement("input");
        this.inputElement.type = "checkbox";

        if (off_label) this.labels.off = off_label;
        if (on_label) this.labels.on = on_label;

        this.fakeBoxElement = document.createElement("span");
        this.fakeBoxElement.classList = "checkbox-faker";
        if (this.labels.off) this.fakeBoxElement.textContent = this.labels.off;
        
        this.element.appendChild(this.inputElement);
        this.element.appendChild(this.fakeBoxElement);
        this.inputElement.addEventListener("change", () => {
            this.checked = this.inputElement.checked;

            if (this.checked && this.labels.on) {
                this.fakeBoxElement.textContent = this.labels.on;
            }
            else if (this.labels.off) {
                this.fakeBoxElement.textContent = this.labels.off;
            }

            this.element.dispatchEvent(this.fieldChangedEvent);
        });
    }
    getCheckedState(): boolean {
        return this.checked;
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

        // Container to keep input and button on the same line
        this.element.appendChild(this.inputElement);
        this.element.appendChild(this.reloadButton);

        this.inputElement.addEventListener("change", () => {
            let file = this.inputElement.files?.item(0);
            if (file) {
                this.lastFile = file;
                this.loadFile(file);
                this.reloadButton.disabled = false;
            }
        }); 
        this.reloadButton.onclick = () => {
            if (this.lastFile) {
                this.loadFile(this.lastFile);
            }
        };
    }
    private loadFile(file: File) {
        let reader = new FileReader();
        reader.addEventListener("load", (event) => {
            let bfile = event.target?.result;
             if (typeof bfile === "string") {
                this.jsonContent = bfile;
                this.element.dispatchEvent(this.fieldChangedEvent);
            }
        });

        reader.readAsText(file);
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
        showPatternsField: new CheckBoxField("Showing: Face Tags", "Showing: Patterns"),
        patternIndex: new NumberField("Pattern Index")
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
    Data.controls.shapesField.addChangedListener(() => {
        let shape = Data.controls.shapesField.getPickedOption();

        if (Data.cachedJson.obj) {
            let shapeData = Data.cachedJson.obj["Shapes"] as any;
            let shapeObj = shapeData[shape];
            let shapeStr = JSON.stringify(shapeObj, null, 4);

            jsonDisplay.textContent = shapeStr;
        }
    })

    // Add fields to panel
    let fields = [];
    fields.push(Data.controls.jsonFileField);
    fields.push(Data.controls.shapesField);
    fields.push(Data.controls.showPatternsField);
    fields.push(Data.controls.patternIndex);
    fields.forEach((field) => form.appendChild(field.getDom()));
}

export {
    initControls,
    Data
}
