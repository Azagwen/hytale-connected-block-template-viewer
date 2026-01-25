import * as THREE from "three";
import { ViewportScene } from "./viewport";
import { ViewportPanel } from "./gui";

// Face Texture
const loader = new THREE.TextureLoader();
const texture = loadTexture( "/outlined_face.png" );
const texture_north = loadTexture( "/outlined_face_north.png" );
const texture_south = loadTexture( "/outlined_face_south.png" );
const texture_east = loadTexture( "/outlined_face_east.png" );
const texture_west = loadTexture( "/outlined_face_west.png" );

function loadTexture(path: string) {
    let texture = loader.load( path );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;

    return texture;
}

function makeCube(scene: THREE.Scene, position: THREE.Vector3, size: THREE.Vector3, tint: number, tex: THREE.Texture): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshPhongMaterial( {color: tint, map: tex} );
    const mesh = new THREE.Mesh(geometry, material);  

    scene.add(mesh);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    
    return mesh;
}

function makePlane(scene: THREE.Scene, position: THREE.Vector3, size: THREE.Vector3, tint: number, texUpper: THREE.Texture, texLower: THREE.Texture): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const materialUpper = new THREE.MeshBasicMaterial( {color: tint, map: texUpper} );
    const materialLower = new THREE.MeshBasicMaterial( {color: tint, map: texLower} );
    const meshUpper = new THREE.Mesh(geometry, materialUpper);
    const meshLower = new THREE.Mesh(geometry, materialLower);

    meshUpper.position.x = position.x;
    meshUpper.position.y = position.y;
    meshUpper.position.z = position.z;

    // orient up
    meshUpper.rotation.x = -Math.PI / 2;
    meshLower.rotation.x = Math.PI;

    meshUpper.add(meshLower);
    scene.add(meshUpper);
 
    return meshUpper;
}

function main() {
    const scene = new ViewportScene();
    const floorPlanes = [
        makePlane(scene, new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 1, 1), 0xFF88FF, texture,       texture),
        makePlane(scene, new THREE.Vector3( 0, 0, -1), new THREE.Vector3(1, 1, 1), 0x8888FF, texture_north, texture),
        makePlane(scene, new THREE.Vector3( 1, 0, -1), new THREE.Vector3(1, 1, 1), 0xFF88FF, texture,       texture),
        makePlane(scene, new THREE.Vector3(-1, 0,  0), new THREE.Vector3(1, 1, 1), 0xFF8888, texture_west,  texture),
        makePlane(scene, new THREE.Vector3( 0, 0,  0), new THREE.Vector3(1, 1, 1), 0x888888, texture,       texture),
        makePlane(scene, new THREE.Vector3( 1, 0,  0), new THREE.Vector3(1, 1, 1), 0xFF8888, texture_east,  texture),
        makePlane(scene, new THREE.Vector3(-1, 0,  1), new THREE.Vector3(1, 1, 1), 0xFF88FF, texture,       texture),
        makePlane(scene, new THREE.Vector3( 0, 0,  1), new THREE.Vector3(1, 1, 1), 0x8888FF, texture_south, texture),
        makePlane(scene, new THREE.Vector3( 1, 0,  1), new THREE.Vector3(1, 1, 1), 0xFF88FF, texture,       texture)
    ];
    // const gui = new ViewportPanel();
}

main();