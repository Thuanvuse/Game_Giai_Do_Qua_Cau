// --- GAME STATE ---
const PEOPLE_DATA = [
    { id: 'An', speed: 1, color: '#4facfe', side: 0 },
    { id: 'Bình', speed: 2, color: '#00ffaa', side: 0 },
    { id: 'Chi', speed: 7, color: '#f1fa8c', side: 0 },
    { id: 'Dũng', speed: 10, color: '#ff5e62', side: 0 }
];

let state = {
    flashlightSide: 0,
    selected: [],
    totalTime: 0,
    isAnimating: false,
    people: [],
    allAtFinish: false
};

// DOM Elements
const uiTime = document.getElementById('time-display');
const btnGo = document.getElementById('go-btn');
const btnReset = document.getElementById('reset-btn');
const msgDisplay = document.getElementById('message');
const containerStart = document.getElementById('chars-start');
const containerEnd = document.getElementById('chars-end');
const sideStart = document.getElementById('start-side');
const sideEnd = document.getElementById('end-side');

// --- THREE.JS SETUP ---
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a18); // Brighter night sky
scene.fog = new THREE.FogExp2(0x0a0a18, 0.015); // Less thick fog

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-45, 35, 45); // Even further away initial position

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Load OrbitControls from global namespace
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 15;
controls.maxDistance = 80; // Increased max zoom out distance

// --- LIGHTING ---
const ambient = new THREE.AmbientLight(0x3a4560, 0.7); // Increased for overall visibility
scene.add(ambient);

const moon = new THREE.DirectionalLight(0x6080ff, 0.8); // Brighter moon
moon.position.set(-30, 40, -30);
moon.castShadow = true;
scene.add(moon);

// Helper to create Lampposts
const createLamppost = (x, z, color) => {
    const group = new THREE.Group();
    
    // Pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    pole.position.y = 4;
    group.add(pole);

    // Lamp Head (The glowing part)
    const lampHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 2 
        })
    );
    lampHead.position.y = 8;
    group.add(lampHead);

    // Light from the lamp
    const light = new THREE.PointLight(color, 120, 35);
    light.position.y = 8;
    light.castShadow = true;
    group.add(light);

    group.position.set(x, 0, z);
    scene.add(group);
};

// Add lampposts to each bank
createLamppost(-8, 18, 0x4facfe); // Start bank left
createLamppost(8, 18, 0x4facfe);  // Start bank right
createLamppost(-8, -18, 0x00ffaa); // End bank left
createLamppost(8, -18, 0x00ffaa);  // End bank right

// Flashlight (Stronger and clearer)
const flashlight = new THREE.SpotLight(0xfff5ee, 1200);
flashlight.angle = Math.PI / 6;
flashlight.penumbra = 0.3;
flashlight.decay = 1.1;
flashlight.distance = 60;
flashlight.castShadow = true;

// Small point light to illuminate the holder
const flashlightGlow = new THREE.PointLight(0xfff5ee, 50, 8);
scene.add(flashlightGlow);

flashlight.position.set(0, 7, 18);
const flashlightTarget = new THREE.Object3D();
flashlightTarget.position.set(0, 0, 10);
scene.add(flashlightTarget);
flashlight.target = flashlightTarget;
scene.add(flashlight);

// --- ENVIRONMENT ---
const waterGeo = new THREE.PlaneGeometry(120, 60, 64, 64);
const waterMat = new THREE.MeshStandardMaterial({
    color: 0x050c1a,
    metalness: 0.9,
    roughness: 0.15,
    transparent: true,
    opacity: 0.95
});
const water = new THREE.Mesh(waterGeo, waterMat);
water.rotation.x = -Math.PI / 2;
water.position.y = -2;
water.receiveShadow = true;
scene.add(water);

// Bridge
const bridge = new THREE.Group();
const plankGeo = new THREE.BoxGeometry(4.5, 0.25, 1.2);
const plankMat = new THREE.MeshStandardMaterial({ color: 0x150d07, roughness: 1.0 }); // Even darker wood

for (let z = -15; z <= 15; z += 1.4) {
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(0, 0, z);
    plank.rotation.x = (Math.random() - 0.5) * 0.04;
    plank.rotation.z = (Math.random() - 0.5) * 0.04;
    plank.position.y = (Math.random() - 0.5) * 0.15;
    plank.castShadow = true;
    plank.receiveShadow = true;
    bridge.add(plank);
}

// Rail ropes
const ropeGeo = new THREE.CylinderGeometry(0.12, 0.12, 35);
const ropeMat = new THREE.MeshStandardMaterial({ color: 0x0a0604 });
const ropeL = new THREE.Mesh(ropeGeo, ropeMat);
ropeL.rotation.x = Math.PI/2; ropeL.position.set(-2.1, 1, 0);
const ropeR = new THREE.Mesh(ropeGeo, ropeMat);
ropeR.rotation.x = Math.PI/2; ropeR.position.set(2.1, 1, 0);
bridge.add(ropeL, ropeR);

// Posts
for (let pos of [{x:-2.1,z:16},{x:2.1,z:16},{x:-2.1,z:-16},{x:2.1,z:-16},{x:-2.1,z:0},{x:2.1,z:0}]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), ropeMat);
    p.position.set(pos.x, -0.5, pos.z);
    p.castShadow = true;
    bridge.add(p);
}
scene.add(bridge);

// Banks & Rocks
const bankMat = new THREE.MeshStandardMaterial({ color: 0x0a140a, roughness: 1 });
const startBank = new THREE.Mesh(new THREE.BoxGeometry(50, 6, 12), bankMat);
startBank.position.set(0, -3, 21); // Moved closer
startBank.receiveShadow = true;
scene.add(startBank);

const endBank = new THREE.Mesh(new THREE.BoxGeometry(50, 6, 12), bankMat);
endBank.position.set(0, -3, -21); // Moved closer
endBank.receiveShadow = true;
scene.add(endBank);

// Decorative rocks on banks
const rockGeo = new THREE.IcosahedronGeometry(1.5, 0);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
for(let i=0; i<12; i++) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const side = Math.random() > 0.5 ? 20 : -20;
    rock.position.set((Math.random()-0.5)*30, 0, side + (Math.random()-0.5)*5);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(Math.random()+0.3, Math.random()+0.3, Math.random()+0.3);
    scene.add(rock);
}

// Stars
const starsGeo = new THREE.BufferGeometry();
const starsCount = 1500;
const starPos = new Float32Array(starsCount * 3);
for(let i=0; i<starsCount*3; i+=3) {
    starPos[i] = (Math.random()-0.5) * 180;
    starPos[i+1] = Math.random() * 60 + 5;
    starPos[i+2] = (Math.random()-0.5) * 180;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({size: 0.12, color: 0xffffff, transparent: true, opacity: 0.6})));

// --- CHARACTERS ---
const createPerson = (data, index) => {
    const group = new THREE.Group();
    
    // Body (Using CylinderGeometry for cross-browser / offline compatibility in r128)
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.5 })
    );
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffe0bd })
    );
    head.position.y = 2.2;
    head.castShadow = true;
    group.add(head);

    // Position
    const startZ = 20 + (index * 1.5);
    const startX = (index - 1.5) * 1.8;
    group.position.set(startX, 0, startZ);
    
    scene.add(group);
    return {
        ...data,
        mesh: group,
        startX, startZ,
        endX: (index - 1.5) * 1.8,
        endZ: -(20 + (index * 1.5)),
        walkTween: null
    };
};

state.people = PEOPLE_DATA.map((d, i) => createPerson(d, i));

// --- GAME LOGIC ---
const updateUI = () => {
    containerStart.innerHTML = '';
    containerEnd.innerHTML = '';
    
    state.people.forEach(p => {
        const isSelected = state.selected.includes(p.id);
        const card = document.createElement('div');
        card.className = `char-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => toggleSelect(p.id);
        card.innerHTML = `
            <div class="avatar" style="background: ${p.color}"></div>
            <div class="name">${p.id}</div>
            <div class="speed">${p.speed}m</div>
        `;
        p.side === 0 ? containerStart.appendChild(card) : containerEnd.appendChild(card);
    });

    sideStart.className = `side ${state.flashlightSide === 0 ? 'active-side has-flashlight' : ''}`;
    sideEnd.className = `side ${state.flashlightSide === 1 ? 'active-side has-flashlight' : ''}`;
    
    uiTime.innerText = state.totalTime.toString().padStart(2, '0');
    
    btnGo.disabled = state.selected.length === 0 || state.isAnimating;
    msgDisplay.innerText = state.selected.length === 0 ? "Chọn 1 hoặc 2 người..." : "Sẵn sàng di chuyển!";
    
    checkWin();
};

const toggleSelect = (id) => {
    if (state.isAnimating) return;
    const p = state.people.find(x => x.id === id);
    const idx = state.selected.indexOf(id);

    if (idx > -1) {
        state.selected.splice(idx, 1);
        gsap.to(p.mesh.position, { y: 0, duration: 0.3 });
    } else {
        if (p.side !== state.flashlightSide) return showTempMsg("Bên này không có đèn!", true);
        if (state.selected.length >= 2) return showTempMsg("Tối đa 2 người!", true);
        state.selected.push(id);
        gsap.to(p.mesh.position, { y: 0.5, duration: 0.4, yoyo: true, repeat: -1 });
    }
    updateUI();
};

const showTempMsg = (txt, err) => {
    msgDisplay.innerText = txt;
    msgDisplay.style.color = err ? "#ff5555" : "#00ffaa";
    setTimeout(() => { msgDisplay.style.color = ""; updateUI(); }, 2000);
};

btnGo.onclick = () => {
    if (state.isAnimating) return;
    state.isAnimating = true;

    const walkers = state.selected.map(id => state.people.find(p => p.id === id));
    walkers.sort((a,b) => b.speed - a.speed);
    const timeStep = walkers[0].speed;
    state.totalTime += timeStep;

    const targetZ = state.flashlightSide === 0 ? -18 : 18;
    const tl = gsap.timeline({
        onComplete: () => {
            walkers.forEach((p, i) => {
                p.side = state.flashlightSide === 0 ? 1 : 0;
                gsap.killTweensOf(p.mesh.position);
                p.mesh.position.y = 0;
                // Snap exactly
                const finalZ = state.flashlightSide === 0 ? p.endZ : p.startZ;
                const finalX = state.flashlightSide === 0 ? p.endX : p.startX;
                gsap.to(p.mesh.position, { x: finalX, z: finalZ, duration: 0.5 });
            });
            state.flashlightSide = state.flashlightSide === 0 ? 1 : 0;
            state.selected = [];
            state.isAnimating = false;
            updateUI();
        }
    });

    // Characters walking animation
    walkers.forEach((p, i) => {
        const off = (i - (walkers.length-1)/2) * 1.5;
        tl.to(p.mesh.position, { x: off, duration: 0.6 }, 0);
        tl.to(p.mesh.position, { z: targetZ, duration: 2.5, ease: "power1.inOut" }, 0.6);
        
        // Bobbing while walking
        gsap.to(p.mesh.position, { y: 0.3, duration: 0.2, repeat: 12, yoyo: true, ease: "sine.inOut" });
        gsap.to(p.mesh.rotation, { z: 0.1, duration: 0.2, repeat: 12, yoyo: true, ease: "sine.inOut" });
    });

    // Flashlight follow logic
    const firstWalker = walkers[0];
    const isGoingToEnd = state.flashlightSide === 0;
    const endZ = isGoingToEnd ? -20 : 20;

    // Flashlight starts at current group position
    flashlight.position.set(firstWalker.mesh.position.x, 6, firstWalker.mesh.position.z);
    flashlightTarget.position.set(firstWalker.mesh.position.x, 0, firstWalker.mesh.position.z - (isGoingToEnd ? 5 : -5));

    // Move flashlight along with the group
    tl.to([flashlight.position, flashlightGlow.position], { 
        x: firstWalker.mesh.position.x,
        z: endZ, 
        duration: 2.5, 
        ease: "power1.inOut" 
    }, 0.6);

    tl.to(flashlightTarget.position, { 
        z: endZ - (isGoingToEnd ? 10 : -10), 
        duration: 2.5, 
        ease: "power1.inOut" 
    }, 0.6);

    // Re-update UI after state change inside completion
    const oldComplete = tl.eventCallback("onComplete");
    tl.eventCallback("onComplete", () => {
        if(oldComplete) oldComplete();
        // Ensure flashlight stays at the new bank
        const finalZ = isGoingToEnd ? -22 : 22;
        flashlight.position.set(0, 7, finalZ);
        flashlightGlow.position.set(0, 7, finalZ);
        flashlightTarget.position.set(0, 0, isGoingToEnd ? -25 : 25);
    });

    updateUI();
};

const checkWin = () => {
    if (state.people.every(p => p.side === 1) && !state.isAnimating) {
        const overlay = document.getElementById('result-overlay');
        const box = overlay.querySelector('.result-box');
        document.getElementById('result-time').innerText = `${state.totalTime} Phút`;
        
        box.classList.remove('success', 'fail');
        if (state.totalTime === 17) {
            box.classList.add('success');
            document.getElementById('result-title').innerText = "KỶ LỤC TUYỆT VỜI! 🏆";
            document.getElementById('result-desc').innerText = "Bạn đã tìm ra chiến thuật tối ưu nhất (17p).";
        } else {
            box.classList.add('fail');
            document.getElementById('result-title').innerText = "HÃY THỬ LẠI ⏳";
            document.getElementById('result-desc').innerText = "Qua được rồi, nhưng chưa phải nhanh nhất.";
        }
        overlay.classList.remove('hidden');
    }
};

const reset = () => {
    state.totalTime = 0; state.flashlightSide = 0; state.selected = []; state.isAnimating = false;
    state.people.forEach((p,i) => {
        p.side = 0;
        gsap.killTweensOf(p.mesh.position);
        p.mesh.position.set(p.startX, 0, p.startZ);
        p.mesh.rotation.z = 0;
    });
    flashlight.position.set(0, 7, 22);
    flashlightGlow.position.set(0, 7, 22);
    flashlightTarget.position.set(0, 0, 15);
    uiTime.innerText = "00";
    document.getElementById('result-overlay').classList.add('hidden');
    updateUI();
};

btnReset.onclick = reset;
document.getElementById('close-result').onclick = reset;

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    
    // Water waves
    const pos = water.geometry.attributes.position;
    for(let i=0; i<pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        pos.setZ(i, Math.sin(x*0.4 + t*1.5) * 0.12 + Math.cos(y*0.4 + t*1.2) * 0.1);
    }
    pos.needsUpdate = true;
    
    // Subtle flashlight flicker
    const flicker = Math.sin(t * 15) * 40;
    flashlight.intensity = 1200 + flicker;
    flashlightGlow.intensity = 50 + flicker * 0.05;

    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize UI
updateUI();

// Intro button setup
document.getElementById('start-game-btn').onclick = () => {
    document.getElementById('intro-overlay').classList.add('hidden');
};
