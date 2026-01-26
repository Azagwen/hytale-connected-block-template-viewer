import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class ViewportScene extends THREE.Scene {
    canvas: HTMLCanvasElement;
    renderer: THREE.WebGLRenderer;
    pickHelper = new PickHelper();
    camera: THREE.OrthographicCamera;
    controls: OrbitControls;

    constructor() {
        super();

        let canvas = document.getElementById("viewport") as HTMLCanvasElement;
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer( {antialias: true, canvas} );

        // Camera setup
        let camParams = { size: 1, near: 0.1, far: 50 };
        this.camera = new THREE.OrthographicCamera(-camParams.size, camParams.size, camParams.size, -camParams.size, camParams.near, camParams.far);
        this.camera.position.x = -2;
        this.camera.position.y = 2;
        this.camera.position.z = 2;
        this.camera.zoom = 0.2;
        
        // Controls setup
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.target.set(0, 0, 0);
        this.controls.enablePan = false;
        this.controls.update();
    
        // Event listeners
        window.addEventListener("mousemove", (e) => this.pickHelper.setPickPosition(e, this.canvas));
        window.addEventListener("mouseout", this.pickHelper.clearPickPosition);
        window.addEventListener("mouseleave", this.pickHelper.clearPickPosition);
        window.addEventListener("resize", () => this.render());
        window.addEventListener("mousemove", () => this.render());
        this.controls.addEventListener("change", () => this.render());
    }
    resizeRendererToDisplaySize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight; 

        const needResize = this.canvas.width !== width || this.canvas.height !== height;
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }   

        return needResize;
    }
    render() {
        if (!this) return; // just to avoid smearing red over the console when loading the scene

        if (this.resizeRendererToDisplaySize()) {
            const aspect = this.canvas.clientWidth / this.canvas.clientHeight

			this.camera.left = -aspect;
			this.camera.right = aspect;
            this.camera.updateProjectionMatrix();
        }

        this.pickHelper.pick(this, this.camera);
        this.renderer.render(this, this.camera);
    }
}

// taken from https://threejs.org/manual/?q=controls#en/picking and modified
class PickHelper {
    raycaster: THREE.Raycaster;
    pickedObject?: THREE.Object3D;
    pickedObjectSavedColor: number;
    pickPosition: THREE.Vector2;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = undefined;
        this.pickedObjectSavedColor = 0;
        this.pickPosition = new THREE.Vector2();
    }
    pick(scene: THREE.Scene, camera: THREE.Camera) {
        // restore the color if there is a picked object
        if (this.pickedObject && ("material" in this.pickedObject)) {    
            let material = this.pickedObject.material as THREE.MeshBasicMaterial;
            material.color.setHex(this.pickedObjectSavedColor);

            this.pickedObject = undefined;
        }
 
        // cast a ray through the frustum
        this.raycaster.setFromCamera(this.pickPosition, camera);

        // get the list of objects the ray intersected
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);

        if (intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0].object; // pick the first object. It"s the closest one

            if ("material" in this.pickedObject) {
                let material = this.pickedObject.material as THREE.MeshBasicMaterial;

                this.pickedObjectSavedColor = material.color.getHex(); // save its color
                material.color.setHex(material.color.add(new THREE.Color(0.5, 0.5, 0.5)).getHex()); // set its emissive color to flashing red/yellow
            }
        }
    }
    clearPickPosition() {
        if (!this.pickPosition) return;
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
    }
    setPickPosition(event: MouseEvent, canvas: HTMLCanvasElement) {
        let pos = this.getCanvasRelativePosition(event, canvas);
        this.pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        this.pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
    }
    getCanvasRelativePosition(event: MouseEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) * canvas.width  / rect.width,
            y: (event.clientY - rect.top ) * canvas.height / rect.height,
        };
    }
}