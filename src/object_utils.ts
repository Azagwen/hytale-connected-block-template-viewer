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
    let size = 32;
    let doubleMargin = margin * 2;
    let font = `${size}px AzaFont`;
    let ctx = document.createElement("canvas").getContext("2d");

    if (ctx) {
        ctx.font = font;
        let lines = text.split("<br>");
        let textSize = ctx.measureText(lines.reduce((a, b) => a.length > b.length ? a : b));

        // set canvas size
        ctx.canvas.width = textSize.width + doubleMargin;
        ctx.canvas.height = textSize.width + doubleMargin;
        
        // white bg
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // render text (styling)
        ctx.textBaseline = "middle";
        ctx.font = font;
        ctx.fillStyle = txtColor;
        
        // render text (actual rendering)
        let canvasCenter = ctx.canvas.height / 2;
        let lineHeight = size + size / 2;
        let paragraphHeight = lineHeight * lines.length;
        let paragraphCenter = paragraphHeight / 2;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            ctx.fillText(line, margin, (canvasCenter - paragraphCenter) + (lineHeight * i) + (lineHeight / 2));
        }

        // finalize texture and return it
        let texture = new THREE.CanvasTexture(ctx.canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.magFilter = THREE.NearestFilter;

        return texture;
    }

    return new THREE.CanvasTexture();
}

function makeBillBoard(position: THREE.Vector3, size: THREE.Vector2, tint: number, opacity: number, tex?: THREE.Texture): THREE.Sprite {
    const material = new THREE.SpriteMaterial( {color: tint, map: tex ? tex : null, opacity: opacity, transparent: true, alphaTest: 0.01} );
    let sprite = new THREE.Sprite(material);
    
    sprite.scale.x = size.x;
    sprite.scale.y = size.y;

    sprite.position.x = position.x;
    sprite.position.y = position.y;
    sprite.position.z = position.z;

    return sprite;
}

function makeOutlineCube(position: THREE.Vector3, size: THREE.Vector3, tint: number): THREE.LineSegments;
function makeOutlineCube(position: THREE.Vector3, size: THREE.Vector3, tint: number, opacity: number): THREE.LineSegments;
function makeOutlineCube(position: THREE.Vector3, size: THREE.Vector3, tint: number, opacity: number = 1.0): THREE.LineSegments {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const lineMat = new THREE.LineBasicMaterial( { color: tint, linewidth: 4, opacity: opacity, transparent: true } );
    const wireframe = new THREE.LineSegments( new THREE.EdgesGeometry(geometry), lineMat );

    wireframe.position.x = position.x;
    wireframe.position.y = position.y;
    wireframe.position.z = position.z;
    
    return wireframe;
}

function makeCube(position: THREE.Vector3, size: THREE.Vector3, tint: number): THREE.Mesh;
function makeCube(position: THREE.Vector3, size: THREE.Vector3, tint: number, opacity: number): THREE.Mesh;
function makeCube(position: THREE.Vector3, size: THREE.Vector3, tint: number, opacity: number = 1.0, tex?: THREE.Texture): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial( {color: tint, map: tex ? tex : null, opacity: opacity, transparent: true} );
    const mesh = new THREE.Mesh(geometry, material);  

    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    
    return mesh;
}

function makePlane(rayPickable: boolean, position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number): THREE.Mesh;
function makePlane(rayPickable: boolean, position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number, tex?: THREE.Texture): THREE.Mesh;
function makePlane(rayPickable: boolean, position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number, texUpper: THREE.Texture, texLower: THREE.Texture): THREE.Mesh;
function makePlane(rayPickable: boolean, position: THREE.Vector3, rotation: THREE.Vector3, size: THREE.Vector3, tint: number, texUpper?: THREE.Texture, texLower?: THREE.Texture): THREE.Mesh {
    const doubleFaced = texLower != undefined;
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const materialSettings = {
        color: tint, 
        map: texUpper ? texUpper : null, 
        side: doubleFaced ? THREE.FrontSide : THREE.DoubleSide, 
        transparent: true
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
        const materialLower = new THREE.MeshBasicMaterial( {color: tint, map: texLower, transparent: true} );
        const meshLower = new THREE.Mesh(geometry, materialLower);
        meshLower.rotation.y = Math.PI;
        meshUpper.add(meshLower);

        (meshLower as any).rayPickable = rayPickable
    }

    (meshUpper as any).rayPickable = rayPickable
 
    return meshUpper;
}

export {
    loadTexture,
    textTexture,
    MeshContainer,
    makePlane,
    makeCube,
    makeOutlineCube,
    makeBillBoard
}