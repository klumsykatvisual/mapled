import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { textureLoad } from "three/src/nodes/accessors/TextureNode.js";

// initialize the scene
const scene = new THREE.Scene();


const loadStageTex = new THREE.TextureLoader()
const stageTex = loadStageTex.load('/gltf/texture/3.Hue 2 E UV0755.png')
// CRITICAL: glTF uses a different UV coordinate orientation than standard Three.js
stageTex.flipY = false; 
stageTex.colorSpace = THREE.SRGBColorSpace;// Keeps colors vibrant and accurate


// const stageMaterial = new THREE.MeshStandardMaterial({
//   map: stageTex
// })


const loader = new GLTFLoader();
loader.load('./gltf/3DstageFFtest.glb', (gltf) => {
  // console.log(gltf)
  const stageGeometry = gltf.scene;
  
  // stageGeometry.position.set(0,0,0)
  stageGeometry.traverse((child) => {
    if (child.isMesh && child.material) {
      
      // const prevMaterial = child.material;
      // child.material = new THREE.MeshStandardMaterial({
      //   map: prevMaterial.map,
      //   roughness: .5,
      //   metalness: .8,
      //   envMapIntensity: 10
      // });
    
    // const mat = child.material;
    // // 1. Use the model's existing base texture for emission
    // mat.emissiveMap = mat.map;
    // // 2. Set emissive intensity (1.0 makes it fully emit its own texture color)
    // mat.emissiveIntensity = 1;
    // // 3. Optional: Add a subtle glow/tint color
    // mat.emissive.setHex(0xffffff); 
    // // Update materials after changing properties
    // mat.needsUpdate = true;   
   

    // // Apply texture to the existing material channel
    // child.material.map = stageTex;
    // // Tell Three.js the material needs to re-compile with the new texture
    // child.material.needsUpdate = true;
      
    // If the material has an emissive component, boost its intensity
    // if (child.material.emissive) {
    //   // Turn off standard tone mapping on this material to prevent clipping
    //   child.material.toneMapped = false; 
        
    //   // Multiply intensity to push color past 1.0 for high bloom saturation
    //   child.material.emissiveIntensity = 100; 
        
    // }
    }
  });
  
  scene.add(stageGeometry)
})

// add objects to the scene
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: "green" });

// const stageMaterial = new THREE.MeshStandardMaterial()
// stageMaterial.color = new THREE.Color('green')
// const stageMesh = new THREE.Mesh(stageGeometry, stageMaterial)
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);

//light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4444444, 6)
scene.add(hemiLight)



// initialize the camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

// const aspectRatio = window.innerWidth / window.innerHeight;
// const camera = new THREE.OrthographicCamera(
//   -1 * aspectRatio,
//   1 * aspectRatio,
//   1,
//   -1,
//   0.1,
//   200
// );

camera.position.z = 40;
camera.position.y = 3;
// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// instantiate the controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// controls.autoRotate = true;


// real-time resize canvas
window.addEventListener('resize', () =>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight);
})

// render the scene
const renderloop = () => {
  controls.update();  
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
