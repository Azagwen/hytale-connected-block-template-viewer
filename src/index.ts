import * as THREE from "three";
import { ViewportScene } from "./viewport";
import * as GUI from "./gui";

// colors
const color_x_pos = 0xFF8F8F;
const color_x_neg = 0x8FFFFF;
const color_y_pos = 0x8FFF8F;
const color_y_neg = 0xFF8FFF;
const color_z_pos = 0x8F8FFF;
const color_z_neg = 0xFFFF8F;

// Face Texture
const loader = new THREE.TextureLoader();
const tex_up = textTexture("UP");
const tex_down = textTexture("DOWN");
const tex_north = textTexture("NORTH", "#4F4F4F", "#FFFF8F");
const tex_south = textTexture("SOUTH", "#4F4F4F", "#8F8FFF");
const tex_east = textTexture("EAST", "#4F4F4F", "#FF8F8F");
const tex_west = textTexture("WEST", "#4F4F4F", "#8FFFFF");

function loadTexture(path: string) {
    let texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;

    return texture;
}

class MeshContainer {
    mesh: THREE.Mesh;
    highlighted: boolean = false;

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh;
    }
}

function textTexture(text: string): THREE.CanvasTexture;
function textTexture(text: string, bgColor?: string, txtColor?: string): THREE.CanvasTexture;
function textTexture(text: string, bgColor: string = "#fff", txtColor: string = "hsl(0, 0%, 25%)"): THREE.CanvasTexture {
    let margin = 4;
    let size = 16;
    let doubleMargin = margin * 2;
    let ctx = document.createElement("canvas").getContext("2d");
    let font = `${size}px AzaFont`;

    if (ctx) {
        ctx.font = font;
        let textSize = ctx.measureText(text);

        // set canvas size
        ctx.canvas.width = textSize.width + doubleMargin;
        ctx.canvas.height = textSize.width + doubleMargin;
        
        // white bg
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // render text
        ctx.textBaseline = "middle";
        ctx.font = font;
        ctx.fillStyle = txtColor;
        ctx.fillText(text, margin, ctx.canvas.height / 2);

        let texture = new THREE.CanvasTexture(ctx.canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;

        return texture;
    }

    return new THREE.CanvasTexture();
}

function makeCube(position: THREE.Vector3, size: THREE.Vector3, tint: number, tex: THREE.Texture): MeshContainer {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshPhongMaterial( {color: tint, map: tex} );
    const mesh = new THREE.Mesh(geometry, material);  

    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    
    return { mesh: mesh, highlighted: false } as MeshContainer;
}

function makePlane(position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number): MeshContainer;
function makePlane(position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number, tex?: THREE.Texture): MeshContainer;
function makePlane(position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number, texUpper: THREE.Texture, texLower: THREE.Texture): MeshContainer;
function makePlane(position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number, texUpper?: THREE.Texture, texLower?: THREE.Texture): MeshContainer {
    const doubleFaced = texLower != undefined;
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const materialSettings = {
        color: tint, 
        map: texUpper ? texUpper : null, 
        side: doubleFaced ? THREE.FrontSide : THREE.DoubleSide
    };
    const materialUpper = new THREE.MeshBasicMaterial(materialSettings);
    const meshUpper = new THREE.Mesh(geometry, materialUpper);

    // Position
    meshUpper.position.x = position.x;
    meshUpper.position.y = position.y;
    meshUpper.position.z = position.z;

    // Rotate
    meshUpper.rotation.x = rotation.x;
    meshUpper.rotation.y = rotation.y;
    meshUpper.rotation.z = rotation.z;
    
    // Create second face if specified
    if (doubleFaced) {
        const materialLower = new THREE.MeshBasicMaterial( {color: tint, map: texLower} );
        const meshLower = new THREE.Mesh(geometry, materialLower);
        meshLower.rotation.y = Math.PI;
        meshUpper.add(meshLower);
    }
 
    return { mesh: meshUpper, highlighted: false } as MeshContainer;
}

const sceneObjects = {
    floorPlanes: new Array<MeshContainer>(),
    faceTagCube: undefined as THREE.Object3D | undefined,
    makeFaceTagCube: function(upTxt: string | null, downTxt: string | null, northTxt: string | null, southTxt: string | null, westTxt: string | null, eastTxt: string | null) {
        let size = new THREE.Vector3(1, 1, 1);
        let r1 = Math.PI / 2;
        let r2 = r1 * 2;
        let pp = 0.5; 
        let pn = -pp;

        let containerObj = new THREE.Object3D();
        let addPlane = function(position: THREE.Vector3, rotation: THREE.Vector3, color: number, text: string | null) {
            if (text) {
                let texture = textTexture(text);
                let plane = makePlane(position, rotation, size, color, texture, texture);
                containerObj.add(plane.mesh);
            }
        }

        addPlane(new THREE.Vector3(0, pp + 0.5,  0), new THREE.Vector3(-r1,   0, 0), color_y_pos, upTxt);
        addPlane(new THREE.Vector3(0, pn + 0.5,  0), new THREE.Vector3( r1,   0, 0), color_y_neg, downTxt);
        addPlane(new THREE.Vector3(0,      0.5, pn), new THREE.Vector3(  0,  r2, 0), color_z_neg, northTxt);
        addPlane(new THREE.Vector3(0,      0.5, pp), new THREE.Vector3(  0,   0, 0), color_z_pos, southTxt);
        addPlane(new THREE.Vector3(pp,     0.5,  0), new THREE.Vector3(  0,  r1, 0), color_x_pos, eastTxt);
        addPlane(new THREE.Vector3(pn,     0.5,  0), new THREE.Vector3(  0, -r1, 0), color_x_neg, westTxt);
        
        
        this.faceTagCube = containerObj;
    },
    makeFloorPlanes: function() {
        let size = new THREE.Vector3(1, 1, 1);
        let rotation = new THREE.Vector3(-Math.PI / 2, 0, 0);

        this.floorPlanes.push(
            makePlane(new THREE.Vector3( 0, 0, -1), rotation, size, 0xFFFFFF, tex_north, tex_north),
            makePlane(new THREE.Vector3( 0, 0,  1), rotation, size, 0xFFFFFF, tex_south, tex_south),
            makePlane(new THREE.Vector3(-1, 0,  0), rotation, size, 0xFFFFFF, tex_west, tex_west),
            makePlane(new THREE.Vector3( 1, 0,  0), rotation, size, 0xFFFFFF, tex_east, tex_east),
            makePlane(new THREE.Vector3(-1, 0, -1), rotation, size, 0x4F4F4F),
            makePlane(new THREE.Vector3( 1, 0, -1), rotation, size, 0x4F4F4F),
            makePlane(new THREE.Vector3( 0, 0,  0), rotation, size, 0x4F4F4F),
            makePlane(new THREE.Vector3(-1, 0,  1), rotation, size, 0x4F4F4F),
            makePlane(new THREE.Vector3( 1, 0,  1), rotation, size, 0x4F4F4F)
            // makePlane(new THREE.Vector3(-1, 0, -1), rotation, size, 0x7FFF7F),
            // makePlane(new THREE.Vector3( 1, 0, -1), rotation, size, 0xFFBF7F),
            // makePlane(new THREE.Vector3( 0, 0,  0), rotation, size, 0x8F8F8F),
            // makePlane(new THREE.Vector3(-1, 0,  1), rotation, size, 0x7FbFFF),
            // makePlane(new THREE.Vector3( 1, 0,  1), rotation, size, 0xFF7FFF)
        );
    },
    setupScene: function(scene: THREE.Scene) {
        this.makeFloorPlanes();
        scene.add(...this.floorPlanes.map((obj) => obj.mesh));
    }
}

function main() {
    const scene = new ViewportScene();
    sceneObjects.setupScene(scene);

    GUI.initControls();
    GUI.Data.controls.shapesField.addListener(() => {
        if (sceneObjects.faceTagCube) scene.remove(sceneObjects.faceTagCube);

        let shape = GUI.Data.controls.shapesField.getPickedOption();
        let json = GUI.Data.cachedJson.obj as any;
        let faceTags = json.Shapes[shape].FaceTags;

        let up: string | null = faceTags?.Up?.join("\n");
        let down: string | null = faceTags?.Down?.join("\n");
        let north: string | null = faceTags?.North?.join("\n");
        let south: string | null = faceTags?.South?.join("\n");
        let west: string | null = faceTags?.West?.join("\n");
        let east: string | null = faceTags?.East?.join("\n");

        sceneObjects.makeFaceTagCube(up, down, north, south, west, east);
        if (sceneObjects.faceTagCube) scene.add(sceneObjects.faceTagCube);
    })
}

main();