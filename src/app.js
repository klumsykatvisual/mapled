import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MODEL_PATH = './src/gltf/2026_ShiningShanghai_3DBase.glb';
const TEXTURE_FOLDER = './src/gltf/texture/';

// =============================================================
//  CONFIG: YOUR FILE NAMES
// =============================================================
const TEXTURE_FILES = [
    "1.Black&White.png",
    "2.Blue.png",
    "3.SunSet.png",
    "4.DarkCyan.png",
    "5.Thay Ma Gom.png"
];
// =============================================================

let scene, camera, renderer, controls, loadedModelScene;
const textureLoader = new THREE.TextureLoader();

initGraphicsPipeline();
loadGLTFModel();
buildTextureUI();
setupMenuInteractions();

function initGraphicsPipeline() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111113);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    window.addEventListener('resize', onWindowResize);
    animate();
}

function loadGLTFModel() {
    const loader = new GLTFLoader();
    loader.load(MODEL_PATH, (gltf) => {
        loadedModelScene = gltf.scene; // Save the entire model group
        scene.add(loadedModelScene);

        console.log("--- SCANNING MODEL MATERIALS ---");
        loadedModelScene.traverse((child) => {
            if (child.isMesh) {
                // Log material names to browser inspector console to verify exact matching
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => console.log("Found Material Name:", mat.name));
                } else if (child.material) {
                    console.log("Found Material Name:", child.material.name);
                }
            }
        });
        console.log("--------------------------------");

        const box = new THREE.Box3().setFromObject(loadedModelScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        controls.target.copy(center);
        camera.position.set(center.x, center.y + (maxDim * 0), center.z + (maxDim * 1));
        controls.update();

        const loaderOverlay = document.getElementById('loading-screen');
        loaderOverlay.style.opacity = '0';
        setTimeout(() => loaderOverlay.style.display = 'none', 400);
    });
}

function buildTextureUI() {
    const listElement = document.getElementById('texture-list');
    const counterElement = document.getElementById('counter');
    
    counterElement.innerText = `${TEXTURE_FILES.length} Map Leds`;
    listElement.innerHTML = '';

    const sortedFiles = [...TEXTURE_FILES].sort((a, b) => {
        const getNum = (filename) => {
            const match = filename.match(/^(\d+)/);
            return match ? parseInt(match[1], 10) : Infinity;
        };
        return getNum(a) - getNum(b);
    });

    sortedFiles.forEach(filename => {
        const fullImagePath = `${TEXTURE_FOLDER}${filename}`;
        const cleanName = filename.substring(0, filename.lastIndexOf('.')) || filename;

        const li = document.createElement('li');
        li.className = 'texture-item';

        const img = document.createElement('img');
        img.src = fullImagePath;

        const textLabel = document.createElement('span');
        textLabel.innerText = cleanName;

        li.appendChild(img);
        li.appendChild(textLabel);

        li.addEventListener('click', () => {
            applyNewTexture(fullImagePath);
        });

        listElement.appendChild(li);
    });
}

function applyNewTexture(url) {
    if (!loadedModelScene) {
        console.error("Model has not finished loading yet.");
        return;
    }
    
    textureLoader.load(url, (texture) => {
        texture.flipY = false; 
        texture.colorSpace = THREE.SRGBColorSpace;

        let materialFound = false;

        // Helper logic to find and swap specific asset mapping
        const checkAndUpdateMaterial = (mat) => {
            if (mat && mat.name === 'MAPLED') {
                mat.map = texture;
                mat.needsUpdate = true;
                materialFound = true;
            }
        };

        // Scan the entire model structure for 'MAP LED'
        loadedModelScene.traverse((child) => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => checkAndUpdateMaterial(mat));
                } else {
                    checkAndUpdateMaterial(child.material);
                }
            }
        });

        if (!materialFound) {
            console.warn("Texture loaded, but no material named 'MAP LED' was found in this model.");
        }
    });
}

function setupMenuInteractions() {
    const sidebar = document.getElementById('sidebar');
    const btnOpen = document.getElementById('menu-toggle-open');
    const btnClose = document.getElementById('menu-toggle-close');

    btnOpen.addEventListener('click', () => {
        sidebar.classList.add('show');
    });

    btnClose.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}