interface Field {
    element: HTMLElement
    fieldChangedEvent: CustomEvent;
    getDom(): HTMLElement,
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject): void
}
class NumberField implements Field {
    private inputElement: HTMLInputElement;
    private incrementButtonElement: HTMLButtonElement;
    private decrementButtonElement: HTMLButtonElement;
    private fieldContainer: HTMLDivElement;
    private value: number = 0;
    element: HTMLParagraphElement;
    fieldChangedEvent = new CustomEvent("valueChanged");

    constructor(label: string) {
        this.inputElement = document.createElement("input");
        this.inputElement.type = "number";
        this.inputElement.value = "0";
        this.inputElement.min = "0";

        let consumer = (amount: number) => {
            let max = Number(this.inputElement.max);
            let min = Number(this.inputElement.min);

            this.value = Number(this.inputElement.value) + amount;
            this.value = Math.min(max, Math.max(this.value, min))
            this.inputElement.value = `${this.value}`;
            this.element.dispatchEvent(this.fieldChangedEvent);
        }

        this.incrementButtonElement = document.createElement("button");
        this.incrementButtonElement.textContent = "+";
        this.incrementButtonElement.type = "button";
        this.incrementButtonElement.onclick = () => consumer(1);

        this.decrementButtonElement = document.createElement("button");
        this.decrementButtonElement.textContent = "-";
        this.decrementButtonElement.type = "button";
        this.decrementButtonElement.onclick = () => consumer(-1);

        this.fieldContainer = document.createElement("div");
        this.fieldContainer.appendChild(this.decrementButtonElement);
        this.fieldContainer.appendChild(this.inputElement);
        this.fieldContainer.appendChild(this.incrementButtonElement);

        this.element = document.createElement("p");
        this.element.textContent = label;
        this.element.classList = "number-field"
        this.element.appendChild(this.fieldContainer);

        this.inputElement.addEventListener("change", () => {
            this.value = Number(this.inputElement.value);
            this.element.dispatchEvent(this.fieldChangedEvent);
        });
    }
    getDom(): HTMLParagraphElement {
        return this.element;
    }
    setMax(value: number) {
        this.inputElement.max = `${value}`;
    }
    getValue(): number {
        return this.value;
    }
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject) {
        this.element.addEventListener("valueChanged", listenerConsumer);
    }
}

class CheckBoxField implements Field {
    private inputElement: HTMLInputElement;
    private fakeBoxElement: HTMLSpanElement;
    private checked: boolean = false;
    private labels = { off: "", on: ""}
    element: HTMLLabelElement;
    fieldChangedEvent = new CustomEvent("checkboxUpdated");

    constructor(off_label?: string, on_label?: string) {
        this.inputElement = document.createElement("input");
        this.inputElement.type = "checkbox";

        if (off_label) this.labels.off = off_label;
        if (on_label) this.labels.on = on_label;

        this.fakeBoxElement = document.createElement("span");
        this.fakeBoxElement.classList = "checkbox-faker";
        if (this.labels.off) this.fakeBoxElement.textContent = this.labels.off;
        
        this.element = document.createElement("label");
        this.element.classList = "checkbox-div";
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
    getDom(): HTMLLabelElement {
        return this.element;
    }
    getCheckedState(): boolean {
        return this.checked;
    }
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject) {
        this.element.addEventListener("checkboxUpdated", listenerConsumer);
    }
}

class OptionsField implements Field {
    private options: string[];
    private selectedOptions?: string;
    private selectElement: HTMLSelectElement;
    element: HTMLLabelElement;
    fieldChangedEvent = new CustomEvent("optionPicked");

    constructor(label: string, options: string[]) {
        this.options = options;
        this.selectElement = document.createElement("select");
        this.selectElement.classList = "select-field-input"
        
        this.element = document.createElement("label");
        this.element.textContent = label;
        this.element.classList = "select-field-container";
        this.element.appendChild(this.selectElement);
        this.element.addEventListener("change", () => this.setSelectedOption());
    }
    getDom(): HTMLLabelElement {
        this.addOptionElements();
        return this.element;
    }
    overwriteOptions(newOptions: string[]) {
        this.options = newOptions;
        this.selectElement.length = 0;
        this.addOptionElements();

        if (this.selectedOptions && this.options.includes(this.selectedOptions)) {
            this.selectElement.value = this.selectedOptions;
            this.dispatchOptionPicked();
        }else{
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
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject) {
        this.element.addEventListener("optionPicked", listenerConsumer);
    }
    dispatchOptionPicked() {
        this.element.dispatchEvent(this.fieldChangedEvent);
    }
}

class JsonFileField implements Field {
    private jsonContent?: string;
    private lastFile?: File;
    element: HTMLInputElement;
    reloadButton: HTMLButtonElement;
    private container: HTMLDivElement;
    fieldChangedEvent = new CustomEvent("jsonDelivered");
    
    constructor() {
        this.element = document.createElement("input");
        this.element.accept = ".json";
        this.element.type = "file";
        this.element.multiple = false;

        // Create reload button
        this.reloadButton = document.createElement("button");
        this.reloadButton.textContent = "⟳";
        this.reloadButton.type = "button";
        this.reloadButton.disabled = true;

        // Container to keep input and button on the same line
        this.container = document.createElement("div");
        this.container.classList = "json-file-field";
        this.container.appendChild(this.element);
        this.container.appendChild(this.reloadButton);

        this.element.addEventListener("change", () => {
            let file = this.element.files?.item(0);
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
    getDom(): HTMLDivElement {
        return this.container;
    }
    getJsonContent(): string {
        if (this.jsonContent) return this.jsonContent;
        return "";
    }
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject) {
        this.element.addEventListener("jsonDelivered", listenerConsumer);
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
