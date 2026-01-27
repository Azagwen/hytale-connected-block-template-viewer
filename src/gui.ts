interface Field {
    element: HTMLElement
    fieldChangedEvent: CustomEvent;
    getDom(): HTMLElement,
    addChangedListener(listenerConsumer: EventListenerOrEventListenerObject): void
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
    element: HTMLSelectElement;
    fieldChangedEvent = new CustomEvent("optionPicked");

    constructor(options: string[]) {
        this.options = options;
        this.element = document.createElement("select");

        this.element.addEventListener("change", () => this.setSelectedOption());
    }
    getDom(): HTMLSelectElement {
        this.addOptionElements();
        return this.element;
    }
    overwriteOptions(newOptions: string[]) {
        this.options = newOptions;
        this.addOptionElements();

        if (!this.selectedOptions) this.setSelectedOption();
    }
    private addOptionElements() {
        let optionElements: HTMLOptionElement[] = this.options.map((value) => {
            let elem = document.createElement("option");
            elem.value = value;
            elem.text = value.charAt(0).toUpperCase() + value.slice(1)
            return elem;
        })

        optionElements.forEach((option) => this.element.add(option));
    }
    private setSelectedOption() {
        let options = this.element.selectedOptions;

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
    element: HTMLInputElement;
    fieldChangedEvent = new CustomEvent("jsonDelivered");

    constructor() {
        this.element = document.createElement("input");
        this.element.accept = ".json";
        this.element.type = "file";
        this.element.multiple = false;

        this.element.addEventListener("change", () => {
            let file = this.element.files?.item(0);
            let reader = new FileReader();

            reader.addEventListener("load", (event) => {
                let bfile = event.target?.result;

                if (typeof bfile === "string") {
                    this.jsonContent = bfile;
                    this.element.dispatchEvent(this.fieldChangedEvent);
                }
            });

            if (file) reader.readAsText(file);
        });
    }
    getDom(): HTMLInputElement {
        return this.element;
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
        shapesField: new OptionsField([]),
        showPatternsField: new CheckBoxField("Showing: Face Tags", "Showing: Patterns")
    }
}

function initControls() {
    let formContainer = document.getElementById("controls");
    let form = document.createElement("form");
    let jsonDisplay = document.createElement("div");

    jsonDisplay.id = "json_display";
    formContainer?.appendChild(form);
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
    fields.forEach((field) => form.appendChild(field.getDom()));
}

export {
    initControls,
    Data
}
