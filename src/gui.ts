import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

export class ViewportPanel extends GUI {
    private fieldObjects: Set<Field> = new Set();
    fields: { [k: string]: Field };
    [k: string]: unknown;
    
    constructor() {
        super();
        this.fieldObjects.add(new NumberField("value", 0, 0, 10, 1));
        this.fields = {};

        this.setup();
    }
    setup() {
        this.fieldObjects.forEach((field) => {
            this.fields[field.name] = field;
            field.addTo(this);
        })
    }
}

interface Field {
    name: string;
    get value();
    set value(val: any);
    addTo(panel: GUI): void;
}

class NumberField implements Field {
    private _value: number;
    min: number;
    max: number;
    step: number;
    name: string;

    constructor(name: string, defaultValue: number = 0, min: number, max: number, step: number) {
        this._value = defaultValue;
        this.min = min;
        this.max = max;
        this.step = step;
        this.name = name;
    }
    get value() {
        return this._value;
    }
    set value(val: number) {
        this._value = Math.max(this.min, Math.min(this.max, val));
    }
    addTo(panel: GUI): void {
        panel.add(this, "value" as any, this.min, this.max, this.step);
    }
}