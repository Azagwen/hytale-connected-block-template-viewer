import * as THREE from "three";
import * as ObjUtils from "./object_utils.ts";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// colors
const color_x_pos = 0xFF8F8F;
const color_x_neg = 0x8FFFFF;
const color_y_pos = 0x8FFF8F;
const color_y_neg = 0xFF8FFF;
const color_z_pos = 0x8F8FFF;
const color_z_neg = 0xFFFF8F;

// Face Texture
const tex_up = ObjUtils.textTexture("UP");
const tex_down = ObjUtils.textTexture("DOWN");
const tex_north = ObjUtils.textTexture("NORTH", "#4F4F4F", "#FFFF8F");
const tex_south = ObjUtils.textTexture("SOUTH", "#4F4F4F", "#8F8FFF");
const tex_east = ObjUtils.textTexture("EAST", "#4F4F4F", "#FF8F8F");
const tex_west = ObjUtils.textTexture("WEST", "#4F4F4F", "#8FFFFF");

const sceneObjects = {
    floorPlanes: new Array<THREE.Mesh>(),
    faceTagCube: undefined as THREE.Object3D | undefined,
    neighborCubes: new Array<THREE.Object3D>(),
    makeLabelledCube: function(
        position: THREE.Vector3,
        upTxt: string | null, downTxt: string | null, 
        northTxt: string | null, southTxt: string | null, 
        westTxt: string | null, eastTxt: string | null
    ) {
        let size = new THREE.Vector3(1, 1, 1);
        let r1 = Math.PI / 2;
        let r2 = Math.PI;
        let pp = 0.5; 
        let pn = -pp;
        let x = position.x;
        let y = position.y;
        let z = position.z;

        let containerObj = new THREE.Object3D();
        let addPlane = function(position: THREE.Vector3, rotation: THREE.Vector3, color: number, text: string | null) {
            if (text) {
                let texture = ObjUtils.textTexture(text);
                let plane = ObjUtils.makePlane(true, position, rotation, size, color, texture, texture);
                containerObj.add(plane);
            }
        }

        addPlane(new THREE.Vector3( 0+x, pp+y,  0+z), new THREE.Vector3(-r1,   0, 0), color_y_pos, upTxt);
        addPlane(new THREE.Vector3( 0+x, pn+y,  0+z), new THREE.Vector3( r1,   0, 0), color_y_neg, downTxt);
        addPlane(new THREE.Vector3( 0+x,  0+y, pn+z), new THREE.Vector3(  0,  r2, 0), color_z_neg, northTxt);
        addPlane(new THREE.Vector3( 0+x,  0+y, pp+z), new THREE.Vector3(  0,   0, 0), color_z_pos, southTxt);
        addPlane(new THREE.Vector3(pp+x,  0+y,  0+z), new THREE.Vector3(  0,  r1, 0), color_x_pos, eastTxt);
        addPlane(new THREE.Vector3(pn+x,  0+y,  0+z), new THREE.Vector3(  0, -r1, 0), color_x_neg, westTxt);

        return containerObj;
    },
    makeFaceTagCube: function(
        upTxt: string | null, downTxt: string | null, 
        northTxt: string | null, southTxt: string | null, 
        westTxt: string | null, eastTxt: string | null
    ) {
        let realPos = new THREE.Vector3(0, 0.5, 0);
        let obj = this.makeLabelledCube(realPos, upTxt, downTxt, northTxt, southTxt, westTxt, eastTxt);
        let baseCube = ObjUtils.makeCube(realPos, new THREE.Vector3(0.999, 0.999, 0.999), 0xFFFFFF, 0.5);

        obj.add(baseCube);
        this.faceTagCube = obj;
    },
    makeNeighborCube: function(
        position: THREE.Vector3,
        tint: number,
        upTxt: string | null, downTxt: string | null, 
        northTxt: string | null, southTxt: string | null, 
        westTxt: string | null, eastTxt: string | null
    ) {
        let realPos = new THREE.Vector3(0, 0.5, 0).add(position);
        let obj = this.makeLabelledCube(new THREE.Vector3(0, 0.5, 0).add(position), upTxt, downTxt, northTxt, southTxt, westTxt, eastTxt);
        let baseCube = ObjUtils.makeCube(realPos, new THREE.Vector3(0.999, 0.999, 0.999), tint, 0.5);

        obj.add(baseCube);
        this.neighborCubes.push(obj);
    },
    makeFloorPlanes: function() {
        let size = new THREE.Vector3(1, 1, 1);
        let rotation = new THREE.Vector3(-Math.PI / 2, 0, 0);

        this.floorPlanes.push(
            ObjUtils.makePlane(false, new THREE.Vector3( 0, 0, -1), rotation, size, 0xFFFFFF, tex_north, tex_north),
            ObjUtils.makePlane(false, new THREE.Vector3( 0, 0,  1), rotation, size, 0xFFFFFF, tex_south, tex_south),
            ObjUtils.makePlane(false, new THREE.Vector3(-1, 0,  0), rotation, size, 0xFFFFFF, tex_west, tex_west),
            ObjUtils.makePlane(false, new THREE.Vector3( 1, 0,  0), rotation, size, 0xFFFFFF, tex_east, tex_east),
            ObjUtils.makePlane(false, new THREE.Vector3(-1, 0, -1), rotation, size, 0x3F3F3F),
            ObjUtils.makePlane(false, new THREE.Vector3( 1, 0, -1), rotation, size, 0x3F3F3F),
            ObjUtils.makePlane(false, new THREE.Vector3( 0, 0,  0), rotation, size, 0x3F3F3F),
            ObjUtils.makePlane(false, new THREE.Vector3(-1, 0,  1), rotation, size, 0x3F3F3F),
            ObjUtils.makePlane(false, new THREE.Vector3( 1, 0,  1), rotation, size, 0x3F3F3F)
        );
    },
    setupScene: function(scene: THREE.Scene) {
        this.makeFloorPlanes();
        scene.add(...this.floorPlanes.map((obj) => obj));
    }
}

class ViewportScene extends THREE.Scene {
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
        this.controls.target.set(0, 1, 0);
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
        if (this.pickedObject && ("material" in this.pickedObject) && (this.pickedObject as any).rayPickable) {    
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

            if (("material" in this.pickedObject) && (this.pickedObject as any).rayPickable) {
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

export {
    ViewportScene,
    sceneObjects
}