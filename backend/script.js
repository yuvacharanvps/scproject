// 1. GLOBAL STATE MANAGEMENT
const appData = {
    budget: 0,
    transactions: [],
    accounts: [],
    goals: [],
    charts: { expenseBar: null, expenseRadial: null, sipLineChart: null },
    ui: {
        currentView: 'landing',
        isMobile: window.innerWidth <= 768
    }
};
// 2. UTILITY & HELPER FUNCTIONS
const formatINR = (num) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};
const sel = (id) => document.getElementById(id);
const generateUUID = () => {
    return 'tx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
const getCategoryIcon = (cat) => {
    const icons = { 'Housing': '🏠', 'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 'Utilities': '⚡', 'Other': '📌' };
    return icons[cat] || '📌';
};
// 3. THREE.JS 3D CINEMATIC LAUNCH ENGINE
let scene, camera, renderer, particles, animationId;

function initThreeJS() {
    const container = sel('three-container');
    if (!container) return;

    // Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030407, 0.001);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x030407, 1);
    container.appendChild(renderer.domElement);

    // Particle System (The "Launch" Effect)
    const geometry = new THREE.BufferGeometry();
    const particleCount = 15000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00E5FF); // Cyan
    const color2 = new THREE.Color(0x7C3AED); // Purple

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Spherical distribution
        const radius = 800 + Math.random() * 1200;
	const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
	positions[i + 2] = radius * Math.cos(phi);

        // Mix colors
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colors[i] = mixedColor.r;
	colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

   particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Helper function to create massive, glowing symbol textures natively
    function createSymbolTexture(text, color) {
	const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
        ctx.font = '900 850px "Outfit", sans-serif';

        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
	ctx.fillStyle = '#ffffff';
        ctx.fillText(text, 512, 512);

        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 16;
	    return tex;
    }

    // 3D Extrusion Engine (Faux-Volumetric Stacking for Text)
    function create3DTextGroup(texture, coreColor) {
        const group = new THREE.Group();
        const layers = 25; // Number of slices
        const thickness = 3; // Gap between slices
        
        for (let i = 0; i < layers; i++) {
            const isCap = (i === 0 || i === layers - 1);
            const mat = new THREE.MeshBasicMaterial({ 
                map: texture, 
                transparent: true, 
                alphaTest: 0.1, // Crops the transparent pixels to create solid edges
                color: isCap ? 0xffffff : coreColor, // White faces, colored 3D depth
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(450, 450), mat);
            mesh.position.z = (i - layers/2) * thickness;
            group.add(mesh);
        }
        return group;
    }
    
    // 3D Rupee
    const rupeeTex = createSymbolTexture('₹', '#00E5FF');
    const rupeeMesh = create3DTextGroup(rupeeTex, 0x00E5FF);
    rupeeMesh.position.x = -250;
    scene.add(rupeeMesh);
    window.rupeeMesh = rupeeMesh;

    // 3D Dollar
    const dollarTex = createSymbolTexture('$', '#a78bfa');
    const dollarMesh = create3DTextGroup(dollarTex, 0x7C3AED);
    dollarMesh.position.x = 250;
    scene.add(dollarMesh);
    window.dollarMesh = dollarMesh;

    // Grid Helper for High-Tech look
    const grid = new THREE.GridHelper(2000, 40, 0x00E5FF, 0x00E5FF);
    grid.position.y = -400;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    
    // Resize Handler
    window.addEventListener('resize', onWindowResize, false);

    // Start Animation Loop
    animateThreeJS();
    
    // Launch Sequence Timeline
    triggerLaunchSequence();
}

function animateThreeJS() {
    animationId = requestAnimationFrame(animateThreeJS);
    
    // Spin particles and core
    if (particles) {
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;
    }
    // Spin currency symbols horizontally only
    if (window.rupeeMesh) {
        window.rupeeMesh.rotation.y += 0.03; // Horizontal only
    }
    if (window.dollarMesh) {
        window.dollarMesh.rotation.y -= 0.03; // Horizontal only
    }

     
    // Dramatic Camera Zoom
    if (camera.position.z > 400) {
        camera.position.z -= 4; // Zoom in fast
    }
     
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function triggerLaunchSequence() {
    // After 4.0 seconds, reveal the UI over the 3D canvas
    setTimeout(() => {
        sel('view-landing').classList.remove('hidden');
        sel('view-landing').style.opacity = '0';
	sel('view-landing').style.transition = 'opacity 1s ease';
        
        // Trigger reflow
        void sel('view-landing').offsetWidth;
        sel('view-landing').style.opacity = '1';
    }, 4000);
}

function destroyThreeJS() {
    if (animationId) cancelAnimationFrame(animationId); 
    const container = sel('three-container');
    if (container) {
        container.style.opacity = '0';
        setTimeout(() => {
            container.remove();
            // Show normal background
            sel('global-bg').classList.remove('hidden');
        }, 1500);
    }
}
//hello sailesh
