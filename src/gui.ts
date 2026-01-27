interface Field {
    getDom(): HTMLElement
}

class OptionsField implements Field {
    private options: string[];
    private selectedOptions?: string;
    private selectElement: HTMLSelectElement;
    private optionPickedEvent = new CustomEvent("optionPicked");

    constructor(options: string[]) {
        this.options = options;
        this.selectElement = document.createElement("select");

        this.selectElement.addEventListener("change", () => this.setSelectedOption());
    }
    getDom(): HTMLSelectElement {
        this.addOptionElements();
        return this.selectElement;
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
    addListener(listenerConsumer: EventListenerOrEventListenerObject) {
        this.selectElement.addEventListener("optionPicked", listenerConsumer);
    }
    dispatchOptionPicked() {
        this.selectElement.dispatchEvent(this.optionPickedEvent);
    }
}

class JsonFileField implements Field {
    private inputElement: HTMLInputElement;
    private jsonContent?: string;
    private jsonDeliveredEvent = new CustomEvent("jsonDelivered");

    constructor() {
        this.inputElement = document.createElement("input");

        this.inputElement.addEventListener("change", () => {
            let file = this.inputElement.files?.item(0);
            let reader = new FileReader();

            reader.addEventListener("load", (event) => {
                let bfile = event.target?.result;

                if (typeof bfile === "string") {
                    this.jsonContent = bfile;
                    this.inputElement.dispatchEvent(this.jsonDeliveredEvent);
                }
            });

            if (file) reader.readAsText(file);
        });
    }
    getDom(): HTMLInputElement {
        this.inputElement.accept = ".json";
        this.inputElement.type = "file";
        this.inputElement.multiple = false;

        return this.inputElement;
    }
    getJsonContent(): string {
        if (this.jsonContent) return this.jsonContent;
        return "";
    }
    addListener(listenerConsumer: EventListenerOrEventListenerObject) {
        this.inputElement.addEventListener("jsonDelivered", listenerConsumer);
    }
}

const Data = {
    cachedJson: {
        str: "",
        obj: undefined
    },
    controls: {
        jsonFileField: new JsonFileField(),
        shapesField: new OptionsField([])
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
    Data.controls.jsonFileField.addListener(() => {
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
    Data.controls.shapesField.addListener(() => {
        let shape = Data.controls.shapesField.getPickedOption();

        if (Data.cachedJson.obj) {
            let shapeData = Data.cachedJson.obj["Shapes"] as any;
            let shapeObj = shapeData[shape];
            let shapeStr = JSON.stringify(shapeObj, null, 4);

            console.log(shapeStr);
            jsonDisplay.textContent = shapeStr;
        }
    })

    // Add fields to panel
    let fields = [];
    fields.push(Data.controls.jsonFileField);
    fields.push(Data.controls.shapesField);
    fields.forEach((field) => form.appendChild(field.getDom()));
}

export {
    initControls,
    Data
}
