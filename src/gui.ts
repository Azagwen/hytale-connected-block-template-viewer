interface Field {
    getDom(): HTMLElement
}

class OptionsField implements Field {
    private options: string[];
    private selectElement: HTMLSelectElement;

    constructor(options: string[]) {
        this.options = options;
        this.selectElement = document.createElement("select");
    }
    getDom(): HTMLSelectElement {
        this.addOptionElements();
        return this.selectElement;
    }
    overwriteOptions(newOptions: string[]) {
        this.options = newOptions;
        this.addOptionElements();
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
}

class JsonFileField implements Field {
    inputElement: HTMLInputElement;
    private jsonContent?: string;
    private jsonDeliveredEvent = new CustomEvent("jsonDelivered");

    constructor() {
        this.inputElement = document.createElement("input");

        this.inputElement.addEventListener("change", () => {
            let file = this.getFile();
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
    getFile() {
        return this.inputElement.files?.item(0);
    }
    getJsonContent(): string {
        if (this.jsonContent) {
            return this.jsonContent;
        }

        return "";
    }
}

export function initControls() {
    let formContainer = document.getElementById("controls");
    let form = document.createElement("form");
    let json: any = undefined;
    formContainer?.appendChild(form);

    // Fields that we need to access
    let jsonFileField = new JsonFileField();
    let shapesField = new OptionsField([]);

    // Setup JSON reading
    jsonFileField.inputElement.addEventListener("jsonDelivered", () => {
        json = JSON.parse(jsonFileField.getJsonContent());
        console.log(json);

        let keys: string[] = [];
        for (let key in json["Shapes"]) keys.push(key);
        shapesField.overwriteOptions(keys);
    })

    // Add fields to panel
    let fields = [];
    fields.push(jsonFileField);
    fields.push(shapesField);
    fields.forEach((field) => form.appendChild(field.getDom()));
}
