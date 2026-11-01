/**
 * PORTFÓLIO MATEUS HIDEKI — RECRIAÇÃO DO CRYSTALLIZE (prism-on.tokyo)
 * Motor 3D Three.js: Girar, Congelar, Quebrar (Shatter), Fotografar (Capture) e Reiniciar.
 * Controles: Setas do Teclado, Barra de Espaço, Enter, C, R, Mouse Drag e Touch.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Ícones Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Inicializar Sistema de Áudio Procedural
    initAudioSystem();

    // 3. Inicializar Experiência 3D do Crystallize
    initCrystallizeEngine();

    // 4. Inicializar Gavetas (Drawers) de Projetos e Contato
    initDrawers();
});

/* ==========================================================================
   1. SISTEMA DE ÁUDIO SINTETIZADO (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let isAudioActive = false;
let ambientGain = null;

function initAudioSystem() {
    const btnAudio = document.getElementById('btnAudioToggle');
    if (!btnAudio) return;

    btnAudio.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            setupAmbientSound();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        isAudioActive = !isAudioActive;
        btnAudio.classList.toggle('active', isAudioActive);

        if (isAudioActive) {
            ambientGain.gain.setTargetAtTime(0.035, audioCtx.currentTime, 0.4);
            playSoundEffect('freeze');
        } else {
            ambientGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
        }
    });

    function setupAmbientSound() {
        ambientGain = audioCtx.createGain();
        ambientGain.gain.setValueAtTime(0, audioCtx.currentTime);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, audioCtx.currentTime);

        const osc1 = audioCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(216, audioCtx.currentTime);

        const osc2 = audioCtx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(324, audioCtx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(ambientGain);
        ambientGain.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
    }
}

// Efeitos Sonoros Glaciais Procedurais
function playSoundEffect(type) {
    if (!audioCtx || !isAudioActive) return;
    try {
        const now = audioCtx.currentTime;

        if (type === 'shatter') {
            // Som de quebra de vidro/cristal de alta intensidade
            const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.45, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseBuffer.length; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = audioCtx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const noiseFilter = audioCtx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(2800, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.45);

            const noiseGain = audioCtx.createGain();
            noiseGain.gain.setValueAtTime(0.25, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            whiteNoise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            whiteNoise.start(now);

            // Harmônicos agudos de impacto
            [1200, 1850, 2400, 3100].forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.02);
                gain.gain.setValueAtTime(0.08, now + idx * 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.02);
                osc.stop(now + 0.55);
            });
        } else if (type === 'freeze') {
            // Ressonância harmônica de congelamento
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.7);
        } else if (type === 'capture') {
            // Efeito mecânico de obturador fotográfico
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.setValueAtTime(300, now + 0.04);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'rebuild') {
            // Tom ascendente de recristalização
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(280, now);
            osc.frequency.exponentialRampToValueAtTime(650, now + 0.5);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.85);
        }
    } catch (e) {
        // Áudio executado sem travar
    }
}

/* ==========================================================================
   2. MOTOR TRIDIMENSIONAL CRYSTALLIZE (THREE.JS)
   ========================================================================== */
function initCrystallizeEngine() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // --- CENA & RENDERER ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a192f, 0.075);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, window.innerWidth < 768 ? 7.2 : 5.8);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true, // Essencial para a função de fotografar (capture)
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- ILUMINAÇÃO DO CENÁRIO ---
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    fillLight.position.set(-5, -2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa5e8ff, 3.2);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // Duas Luzes Pontuais Orbitais para Cintilação
    const orbLight1 = new THREE.PointLight(0xffffff, 3.5, 14);
    scene.add(orbLight1);

    const orbLight2 = new THREE.PointLight(0x38bdf8, 3.0, 12);
    scene.add(orbLight2);

    // --- CRISTAL PRINCIPAL (INTACT SNOWFLAKE) ---
    let snowflakeGeometry = createDetailedSnowflakeGeometry();

    const snowflakeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uFreeze: { value: 0.0 }, // 0.0 normal, 1.0 congelado brilhante
            uColorGlacier: { value: new THREE.Color(0x071b33) },
            uColorIce: { value: new THREE.Color(0xa5e8ff) },
            uColorHighlight: { value: new THREE.Color(0xffffff) },
            uColorPrism: { value: new THREE.Color(0x38bdf8) },
            uLightPos1: { value: new THREE.Vector3(4, 3, 4) },
            uLightPos2: { value: new THREE.Vector3(-4, -2, -3) }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uFreeze;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec3 vWorldPosition;
            varying float vDist;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec3 pos = position;
                vDist = length(pos.xy);

                // Pulso sutil de congelamento
                if (uFreeze > 0.5) {
                    pos += normal * 0.02 * sin(uTime * 4.0);
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                vViewPosition = -mvPosition.xyz;
                vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform float uFreeze;
            uniform vec3 uColorGlacier;
            uniform vec3 uColorIce;
            uniform vec3 uColorHighlight;
            uniform vec3 uColorPrism;
            uniform vec3 uLightPos1;
            uniform vec3 uLightPos2;

            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec3 vWorldPosition;
            varying float vDist;

            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                // Luzes pontuais
                vec3 lDir1 = normalize(uLightPos1 - vWorldPosition);
                vec3 lDir2 = normalize(uLightPos2 - vWorldPosition);

                vec3 half1 = normalize(lDir1 + viewDir);
                vec3 half2 = normalize(lDir2 + viewDir);

                float specP = mix(48.0, 72.0, uFreeze);
                float spec1 = pow(max(dot(normal, half1), 0.0), specP);
                float spec2 = pow(max(dot(normal, half2), 0.0), 32.0);

                // Fresnel
                float nDotV = max(dot(normal, viewDir), 0.0);
                float fresnel = pow(1.0 - nDotV, 2.5);

                // Dispersão prismática nas bordas
                float fresnelR = pow(1.0 - max(dot(normal, viewDir * 0.96), 0.0), 3.0);
                float fresnelG = fresnel;
                float fresnelB = pow(1.0 - max(dot(normal, viewDir * 1.04), 0.0), 2.2);
                vec3 rainbowRim = vec3(fresnelR * 0.9, fresnelG * 1.1, fresnelB * 1.35);

                // Micro-cintilação de diamante
                vec3 spCoord = floor(vWorldPosition * 26.0);
                float spNoise = hash(spCoord);
                float spGlint = pow(max(dot(normal, half1), 0.0), 14.0) * spNoise;
                spGlint = pow(spGlint, 8.0) * 14.0;

                // Gradiente glacial do centro para as pontas
                float distNorm = clamp(vDist / 2.8, 0.0, 1.0);
                vec3 baseColor = mix(uColorGlacier, uColorIce, distNorm * 0.85 + 0.15);

                if (uFreeze > 0.5) {
                    baseColor = mix(baseColor, vec3(1.0), 0.25);
                }

                vec3 finalColor = baseColor;
                finalColor += rainbowRim * (uColorIce * 0.9);
                finalColor += uColorHighlight * (spec1 * 1.9 + spGlint);
                finalColor += uColorPrism * (spec2 * 0.9);
                finalColor += vec3(0.12, 0.28, 0.48) * pow(fresnel, 4.0);

                float alpha = mix(0.95, 0.78, distNorm * 0.3);
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });

    const snowflakeMesh = new THREE.Mesh(snowflakeGeometry, snowflakeMaterial);
    const crystalGroup = new THREE.Group();
    crystalGroup.add(snowflakeMesh);
    scene.add(crystalGroup);

    // --- SISTEMA FÍSICO DE QUEBRA (SHATTER FRAGMENT ENGINE) ---
    const TOTAL_SHARDS = 360;
    const shards = [];
    const shardGroup = new THREE.Group();
    scene.add(shardGroup);

    const shardGeo1 = new THREE.OctahedronGeometry(0.12, 0);
    const shardGeo2 = new THREE.TetrahedronGeometry(0.14, 0);

    const shardMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xa5e8ff,
        transmission: 0.88,
        opacity: 0.9,
        transparent: true,
        roughness: 0.08,
        metalness: 0.1,
        clearcoat: 1.0,
        ior: 1.45
    });

    for (let i = 0; i < TOTAL_SHARDS; i++) {
        const geo = (i % 2 === 0) ? shardGeo1 : shardGeo2;
        const mesh = new THREE.Mesh(geo, shardMaterial);
        mesh.visible = false;
        shardGroup.add(mesh);

        shards.push({
            mesh: mesh,
            active: false,
            pos: new THREE.Vector3(),
            vel: new THREE.Vector3(),
            rotVel: new THREE.Vector3(),
            scale: Math.random() * 0.7 + 0.5
        });
    }

    // --- NUVEM DE MICRO-BRILHOS CONGELADOS ESPACIAIS ---
    const sparkCount = 140;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount * 3; i++) {
        sparkPositions[i] = (Math.random() - 0.5) * 14;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
        color: 0xa5e8ff,
        size: 0.045,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    // --- ESTADOS DO CRYSTALLIZE ---
    // 'ROTATING', 'FROZEN', 'SHATTERED'
    let currentState = 'ROTATING';
    const statePill = document.getElementById('statePill');
    const stateText = document.getElementById('stateText');
    const shardCountDisplay = document.getElementById('shardCountDisplay');
    const crystalSeedDisplay = document.getElementById('crystalSeedDisplay');
    const btnFreezeName = document.getElementById('btnFreezeName');
    const btnFreeze = document.getElementById('btnFreeze');

    function updateStateUI(newState) {
        currentState = newState;
        if (stateText) stateText.textContent = newState;

        if (statePill) {
            statePill.classList.remove('frozen', 'shattered');
            if (newState === 'FROZEN') statePill.classList.add('frozen');
            if (newState === 'SHATTERED') statePill.classList.add('shattered');
        }

        if (btnFreezeName && btnFreeze) {
            if (newState === 'FROZEN') {
                btnFreezeName.textContent = 'UNFREEZE';
                btnFreeze.classList.add('active');
            } else {
                btnFreezeName.textContent = 'FREEZE';
                btnFreeze.classList.remove('active');
            }
        }
    }

    // Gerar novo identificador de Seed
    function generateSeed() {
        const hex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
        if (crystalSeedDisplay) crystalSeedDisplay.textContent = `#${hex}`;
    }
    generateSeed();

    // --- CONTROLE DE ROTAÇÃO FÍSICA (MOMENTUM & INÉRCIA) ---
    let rotX = 0;
    let rotY = 0;
    let rotVelX = 0;
    let rotVelY = 0.012; // Rotação contínua inicial

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    // Mouse Drag
    canvas.addEventListener('mousedown', (e) => {
        if (currentState === 'FROZEN') return;
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || currentState === 'FROZEN') return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        rotVelY += deltaX * 0.002;
        rotVelX += deltaY * 0.002;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch Drag (Mobile)
    canvas.addEventListener('touchstart', (e) => {
        if (currentState === 'FROZEN' || e.touches.length === 0) return;
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || currentState === 'FROZEN' || e.touches.length === 0) return;
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;

        rotVelY += deltaX * 0.003;
        rotVelX += deltaY * 0.003;
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Controles por Teclas de Seta
    const keysPressed = {};
    window.addEventListener('keydown', (e) => {
        // Se estiver em um input ou drawer aberto, ignore
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        keysPressed[e.code] = true;

        if (e.code === 'ArrowLeft') {
            rotVelY -= 0.015;
            e.preventDefault();
        } else if (e.code === 'ArrowRight') {
            rotVelY += 0.015;
            e.preventDefault();
        } else if (e.code === 'ArrowUp') {
            rotVelX -= 0.015;
            e.preventDefault();
        } else if (e.code === 'ArrowDown') {
            rotVelX += 0.015;
            e.preventDefault();
        } else if (e.code === 'Space') {
            toggleFreeze();
            e.preventDefault();
        } else if (e.code === 'Enter') {
            triggerShatter();
            e.preventDefault();
        } else if (e.code === 'KeyC') {
            triggerCapture();
            e.preventDefault();
        } else if (e.code === 'KeyR') {
            triggerRestart();
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.code] = false;
    });

    // --- FUNÇÃO CONGELAR (FREEZE) ---
    function toggleFreeze() {
        if (currentState === 'SHATTERED') return;

        if (currentState === 'ROTATING') {
            rotVelX = 0;
            rotVelY = 0;
            updateStateUI('FROZEN');
            snowflakeMaterial.uniforms.uFreeze.value = 1.0;
            playSoundEffect('freeze');
            showToast('CRISTAL CONGELADO');
        } else if (currentState === 'FROZEN') {
            rotVelY = 0.015;
            updateStateUI('ROTATING');
            snowflakeMaterial.uniforms.uFreeze.value = 0.0;
            playSoundEffect('freeze');
            showToast('ROTAÇÃO REATIVADA');
        }
    }

    // --- FUNÇÃO QUEBRAR (SHATTER) ---
    const shockwaveRing = document.getElementById('shockwave-ring');

    function triggerShatter() {
        if (currentState === 'SHATTERED') return;

        updateStateUI('SHATTERED');
        snowflakeMesh.visible = false;
        playSoundEffect('shatter');

        // Disparar onda de choque
        if (shockwaveRing) {
            shockwaveRing.classList.remove('wave-active');
            void shockwaveRing.offsetWidth; // Forçar reflow
            shockwaveRing.classList.add('wave-active');
        }

        // Tremor de câmera
        cameraShakeTimer = 0.45;

        // Ativar os 360 fragmentos no espaço 3D a partir do formato do cristal
        const positions = snowflakeGeometry.attributes.position;
        const posCount = positions.count;

        for (let i = 0; i < TOTAL_SHARDS; i++) {
            const s = shards[i];
            s.active = true;
            s.mesh.visible = true;

            // Posição de origem baseada nos vértices do cristal
            const vIndex = Math.floor((i / TOTAL_SHARDS) * posCount);
            const origX = positions.getX(vIndex);
            const origY = positions.getY(vIndex);
            const origZ = positions.getZ(vIndex);

            s.pos.set(origX, origY, origZ);
            s.pos.applyEuler(crystalGroup.rotation);

            s.mesh.position.copy(s.pos);
            s.mesh.scale.set(s.scale, s.scale, s.scale);

            // Vetor de explosão radial para fora + gravidade sutil
            const dir = s.pos.clone().normalize();
            if (dir.length() === 0) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

            const speed = 0.06 + Math.random() * 0.12;
            s.vel.copy(dir).multiplyScalar(speed);
            s.vel.y += (Math.random() - 0.3) * 0.03;

            s.rotVel.set(
                (Math.random() - 0.5) * 0.15,
                (Math.random() - 0.5) * 0.15,
                (Math.random() - 0.5) * 0.15
            );
        }

        if (shardCountDisplay) shardCountDisplay.textContent = TOTAL_SHARDS;
        showToast('CRISTAL FRAGMENTADO // ENTER');
    }

    // --- FUNÇÃO FOTOGRAFAR (CAPTURE) ---
    const shutterFlash = document.getElementById('shutter-flash');

    function triggerCapture() {
        playSoundEffect('capture');

        // Efeito de flash do obturador
        if (shutterFlash) {
            shutterFlash.classList.add('flash-active');
            setTimeout(() => {
                shutterFlash.classList.remove('flash-active');
            }, 80);
        }

        // Renderizar quadro e gerar download de imagem PNG
        renderer.render(scene, camera);
        try {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `crystallize-mateus-hideki-${Date.now()}.png`;
            link.href = dataURL;
            link.click();
            showToast('FOTOGRAFIA SALVA EM PNG');
        } catch (e) {
            showToast('IMAGEM CAPTURADA');
        }
    }

    // --- FUNÇÃO NOVO CRISTAL / REINICIAR (RESTART) ---
    function triggerRestart() {
        playSoundEffect('rebuild');
        generateSeed();

        // Recolher fragmentos
        shards.forEach(s => {
            s.active = false;
            s.mesh.visible = false;
        });

        // Reconstruir geometria com leve variação de escala
        snowflakeMesh.visible = true;
        snowflakeMaterial.uniforms.uFreeze.value = 0.0;
        rotVelY = 0.012;
        rotVelX = 0;

        crystalGroup.rotation.set(0, 0, 0);
        updateStateUI('ROTATING');

        if (shardCountDisplay) shardCountDisplay.textContent = '0';
        showToast('NOVO CRISTAL CRIADO');
    }

    // Botões do HUD Bottom
    const btnFreezeEl = document.getElementById('btnFreeze');
    const btnShatterEl = document.getElementById('btnShatter');
    const btnCaptureEl = document.getElementById('btnCapture');
    const btnRestartEl = document.getElementById('btnRestart');

    if (btnFreezeEl) btnFreezeEl.addEventListener('click', toggleFreeze);
    if (btnShatterEl) btnShatterEl.addEventListener('click', triggerShatter);
    if (btnCaptureEl) btnCaptureEl.addEventListener('click', triggerCapture);
    if (btnRestartEl) btnRestartEl.addEventListener('click', triggerRestart);

    // --- LOOP PRINCIPAL DE ANIMAÇÃO ---
    let cameraShakeTimer = 0;
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const delta = clock.getDelta();

        // 1. Rotação Física do Cristal Intacto
        if (currentState !== 'FROZEN') {
            // Amortecimento / Fricção
            rotVelX *= 0.95;
            rotVelY = rotVelY * 0.96 + (isDragging ? 0 : 0.0004); // Mantém rotação base suave

            rotX += rotVelX;
            rotY += rotVelY;

            crystalGroup.rotation.x = rotX;
            crystalGroup.rotation.y = rotY;
            crystalGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;
        }

        // 2. Luzes Orbitais
        const lTime = elapsedTime * 1.2;
        orbLight1.position.set(Math.cos(lTime) * 4.4, Math.sin(lTime * 0.8) * 3.2, Math.sin(lTime) * 4.4);
        orbLight2.position.set(-Math.cos(lTime * 0.9) * 3.8, -Math.sin(lTime * 1.1) * 2.8, -Math.sin(lTime * 0.9) * 3.8);
        snowflakeMaterial.uniforms.uLightPos1.value.copy(orbLight1.position);
        snowflakeMaterial.uniforms.uLightPos2.value.copy(orbLight2.position);
        snowflakeMaterial.uniforms.uTime.value = elapsedTime;

        // 3. Atualizar Física dos Fragmentos (se quebrado)
        if (currentState === 'SHATTERED') {
            for (let i = 0; i < TOTAL_SHARDS; i++) {
                const s = shards[i];
                if (!s.active) continue;

                // Resistência do ar + gravidade suave
                s.vel.multiplyScalar(0.985);
                s.vel.y -= 0.0006;

                s.pos.add(s.vel);
                s.mesh.position.copy(s.pos);

                s.mesh.rotation.x += s.rotVel.x;
                s.mesh.rotation.y += s.rotVel.y;
                s.mesh.rotation.z += s.rotVel.z;
            }
        }

        // 4. Tremor de Câmera na Quebra
        if (cameraShakeTimer > 0) {
            cameraShakeTimer -= 0.02;
            camera.position.x = (Math.random() - 0.5) * cameraShakeTimer * 0.5;
            camera.position.y = (Math.random() - 0.5) * cameraShakeTimer * 0.5;
        } else {
            camera.position.x = 0;
            camera.position.y = 0;
        }

        // 5. Rotação dos Micro-brilhos
        sparkPoints.rotation.y = elapsedTime * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    // Redimensionamento
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.position.z = window.innerWidth < 768 ? 7.2 : 5.8;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* ==========================================================================
   3. GEOMETRIA FRACTAL DENDRÍTICA DO FLÔCO DE GELO
   ========================================================================== */
function createDetailedSnowflakeGeometry() {
    const geometries = [];

    // Núcleo Central: Placa Hexagonal Escalonada
    const corePlate1 = new THREE.CylinderGeometry(0.65, 0.65, 0.16, 6);
    corePlate1.rotateX(Math.PI / 2);
    geometries.push(corePlate1);

    const corePlate2 = new THREE.CylinderGeometry(0.92, 0.92, 0.09, 6);
    corePlate2.rotateX(Math.PI / 2);
    corePlate2.rotateZ(Math.PI / 6);
    geometries.push(corePlate2);

    // Diamante Central em Bipirâmide (Octaedro Facetado)
    const innerJewel = new THREE.OctahedronGeometry(0.42, 0);
    innerJewel.scale(1.0, 1.0, 1.5);
    geometries.push(innerJewel);

    // Os 6 Braços Primários com Estrutura Fractal Dendrítica
    for (let i = 0; i < 6; i++) {
        const armAngle = (i * Math.PI) / 3;

        // Cristal de Ligação Inter-Braços (Web Diamante em 30 graus)
        const webAngle = armAngle + Math.PI / 6;
        const webCrystal = new THREE.OctahedronGeometry(0.22, 0);
        webCrystal.scale(0.8, 1.4, 0.5);
        webCrystal.rotateZ(webAngle);
        webCrystal.translate(Math.cos(webAngle) * 0.72, Math.sin(webAngle) * 0.72, 0);
        geometries.push(webCrystal);

        // Haste Principal
        const spineGeo = new THREE.BoxGeometry(2.8, 0.14, 0.18);
        spineGeo.translate(1.4, 0, 0);
        spineGeo.rotateZ(armAngle);
        geometries.push(spineGeo);

        // Ponta de Diamante em Lança
        const tipGeo = new THREE.OctahedronGeometry(0.25, 0);
        tipGeo.scale(2.2, 0.7, 0.7);
        tipGeo.translate(2.85, 0, 0);
        tipGeo.rotateZ(armAngle);
        geometries.push(tipGeo);

        // Nó de Diamante Intermediário (r = 1.25)
        const nodeJewel = new THREE.OctahedronGeometry(0.18, 0);
        nodeJewel.scale(1.2, 0.7, 0.7);
        nodeJewel.translate(Math.cos(armAngle) * 1.25, Math.sin(armAngle) * 1.25, 0);
        nodeJewel.rotateZ(armAngle);
        geometries.push(nodeJewel);

        // Nível 1: Agulhas Proximais (r = 0.95)
        const r1 = 0.95;
        const c1A = createBranchNeedle(0.72, 0.08);
        c1A.rotateZ(armAngle + Math.PI / 3);
        c1A.translate(Math.cos(armAngle) * r1, Math.sin(armAngle) * r1, 0);
        geometries.push(c1A);

        const c1B = createBranchNeedle(0.72, 0.08);
        c1B.rotateZ(armAngle - Math.PI / 3);
        c1B.translate(Math.cos(armAngle) * r1, Math.sin(armAngle) * r1, 0);
        geometries.push(c1B);

        // Nível 2: Ramos Dendríticos com Sub-Agulhas Duplas (r = 1.65)
        const r2 = 1.65;
        const c2A = createBranchNeedle(1.1, 0.095);
        c2A.rotateZ(armAngle + Math.PI / 3);
        c2A.translate(Math.cos(armAngle) * r2, Math.sin(armAngle) * r2, 0);
        geometries.push(c2A);

        const c2B = createBranchNeedle(1.1, 0.095);
        c2B.rotateZ(armAngle - Math.PI / 3);
        c2B.translate(Math.cos(armAngle) * r2, Math.sin(armAngle) * r2, 0);
        geometries.push(c2B);

        // Sub-agulhas no Ramo 2A
        const s2A1 = createBranchNeedle(0.42, 0.06);
        s2A1.rotateZ(armAngle);
        s2A1.translate(
            Math.cos(armAngle) * r2 + Math.cos(armAngle + Math.PI / 3) * 0.45,
            Math.sin(armAngle) * r2 + Math.sin(armAngle + Math.PI / 3) * 0.45,
            0
        );
        geometries.push(s2A1);

        const s2A2 = createBranchNeedle(0.32, 0.05);
        s2A2.rotateZ(armAngle);
        s2A2.translate(
            Math.cos(armAngle) * r2 + Math.cos(armAngle + Math.PI / 3) * 0.8,
            Math.sin(armAngle) * r2 + Math.sin(armAngle + Math.PI / 3) * 0.8,
            0
        );
        geometries.push(s2A2);

        // Sub-agulhas no Ramo 2B
        const s2B1 = createBranchNeedle(0.42, 0.06);
        s2B1.rotateZ(armAngle);
        s2B1.translate(
            Math.cos(armAngle) * r2 + Math.cos(armAngle - Math.PI / 3) * 0.45,
            Math.sin(armAngle) * r2 + Math.sin(armAngle - Math.PI / 3) * 0.45,
            0
        );
        geometries.push(s2B1);

        const s2B2 = createBranchNeedle(0.32, 0.05);
        s2B2.rotateZ(armAngle);
        s2B2.translate(
            Math.cos(armAngle) * r2 + Math.cos(armAngle - Math.PI / 3) * 0.8,
            Math.sin(armAngle) * r2 + Math.sin(armAngle - Math.PI / 3) * 0.8,
            0
        );
        geometries.push(s2B2);

        // Nível 3: Agulhas Secundárias (r = 2.22)
        const r3 = 2.22;
        const c3A = createBranchNeedle(0.65, 0.075);
        c3A.rotateZ(armAngle + Math.PI / 3);
        c3A.translate(Math.cos(armAngle) * r3, Math.sin(armAngle) * r3, 0);
        geometries.push(c3A);

        const c3B = createBranchNeedle(0.65, 0.075);
        c3B.rotateZ(armAngle - Math.PI / 3);
        c3B.translate(Math.cos(armAngle) * r3, Math.sin(armAngle) * r3, 0);
        geometries.push(c3B);

        // Nível 4: Espinhos Distais (r = 2.58)
        const r4 = 2.58;
        const c4A = createBranchNeedle(0.42, 0.06);
        c4A.rotateZ(armAngle + Math.PI / 3);
        c4A.translate(Math.cos(armAngle) * r4, Math.sin(armAngle) * r4, 0);
        geometries.push(c4A);

        const c4B = createBranchNeedle(0.42, 0.06);
        c4B.rotateZ(armAngle - Math.PI / 3);
        c4B.translate(Math.cos(armAngle) * r4, Math.sin(armAngle) * r4, 0);
        geometries.push(c4B);
    }

    return mergeBufferGeometries(geometries);
}

function createBranchNeedle(length, thickness) {
    const geo = new THREE.ConeGeometry(thickness, length, 4);
    geo.rotateZ(-Math.PI / 2);
    geo.translate(length / 2, 0, 0);
    return geo;
}

function mergeBufferGeometries(geometries) {
    const nonIndexed = geometries.map(g => g.index ? g.toNonIndexed() : g.clone());
    let totalVertices = 0;

    nonIndexed.forEach(g => {
        totalVertices += g.attributes.position.count;
    });

    const positions = new Float32Array(totalVertices * 3);
    const normals = new Float32Array(totalVertices * 3);
    let offset = 0;

    nonIndexed.forEach(g => {
        const pos = g.attributes.position;
        const norm = g.attributes.normal;
        const count = pos.count;

        for (let i = 0; i < count; i++) {
            positions[(offset + i) * 3] = pos.getX(i);
            positions[(offset + i) * 3 + 1] = pos.getY(i);
            positions[(offset + i) * 3 + 2] = pos.getZ(i);

            if (norm) {
                normals[(offset + i) * 3] = norm.getX(i);
                normals[(offset + i) * 3 + 1] = norm.getY(i);
                normals[(offset + i) * 3 + 2] = norm.getZ(i);
            }
        }
        offset += count;
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    merged.computeVertexNormals();

    return merged;
}

/* ==========================================================================
   4. GAVETAS FLYOUT (PROJETOS & CONTATO)
   ========================================================================== */
function initDrawers() {
    const btnOpenProjects = document.getElementById('btnOpenProjects');
    const btnCloseProjects = document.getElementById('btnCloseProjects');
    const projectsDrawer = document.getElementById('projectsDrawer');
    const projectsBackdrop = document.getElementById('projectsBackdrop');

    const btnOpenContact = document.getElementById('btnOpenContact');
    const btnCloseContact = document.getElementById('btnCloseContact');
    const contactDrawer = document.getElementById('contactDrawer');
    const contactBackdrop = document.getElementById('contactBackdrop');

    function openDrawer(drawer) {
        if (!drawer) return;
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        playSoundEffect('freeze');
    }

    function closeDrawer(drawer) {
        if (!drawer) return;
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
    }

    if (btnOpenProjects) btnOpenProjects.addEventListener('click', () => openDrawer(projectsDrawer));
    if (btnCloseProjects) btnCloseProjects.addEventListener('click', () => closeDrawer(projectsDrawer));
    if (projectsBackdrop) projectsBackdrop.addEventListener('click', () => closeDrawer(projectsDrawer));

    if (btnOpenContact) btnOpenContact.addEventListener('click', () => openDrawer(contactDrawer));
    if (btnCloseContact) btnCloseContact.addEventListener('click', () => closeDrawer(contactDrawer));
    if (contactBackdrop) contactBackdrop.addEventListener('click', () => closeDrawer(contactDrawer));

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer(projectsDrawer);
            closeDrawer(contactDrawer);
        }
    });
}

// Notificação Toast
let toastTimeout = null;
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}
