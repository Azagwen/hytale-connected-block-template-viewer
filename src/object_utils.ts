import * as THREE from "three";

const loader = new THREE.TextureLoader();

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

export {
    loadTexture,
    textTexture,
    MeshContainer,
    makePlane,
    makeCube
}