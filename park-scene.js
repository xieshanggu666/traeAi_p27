class ParkScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sunLight = null;
        this.ambientLight = null;
        this.currentView = 'aerial';
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.characters = [];
        this.animals = [];
        this.shops = [];
        this.customers = [];
        this.trafficSystem = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.infoPopup = null;
        
        this.PARK_SIZE = 120;
        this.GROUND_SIZE = 200;
        
        this.animationSystem = {
            fps: 60,
            maxAnimationSize: 1024 * 1024,
            blendTime: 0.2,
            states: {
                IDLE: 'idle',
                WALK: 'walk',
                RUN: 'run',
                REST: 'rest',
                FLY: 'fly'
            },
            directions: {
                FORWARD: 'forward',
                BACKWARD: 'backward',
                LEFT: 'left',
                RIGHT: 'right'
            }
        };
        
        this.keys = {};
        this.controlledCharacter = null;
        
        this.performanceMonitor = {
            frameCount: 0,
            fps: 0,
            lastFpsUpdate: 0,
            animationFrameTime: 0,
            maxFrameTime: 0
        };
        
        this.init();
    }

    hideLoading() {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
            loadingEl.style.visibility = 'hidden';
            loadingEl.style.opacity = '0';
            loadingEl.style.pointerEvents = 'none';
            console.log('✅ 加载层已隐藏');
        }
    }

    init() {
        try {
            console.log('开始初始化公园场景...');
            
            setTimeout(() => this.hideLoading(), 100);
            setTimeout(() => this.hideLoading(), 1000);
            setTimeout(() => this.hideLoading(), 3000);
            
            this.createScene();
            console.log('✓ 场景创建完成');
            
            this.createCamera();
            console.log('✓ 相机创建完成');
            
            this.createRenderer();
            console.log('✓ 渲染器创建完成');
            
            this.createControls();
            console.log('✓ 控制器创建完成');
            
            this.createLighting();
            console.log('✓ 光照系统创建完成');
            
            this.createGround();
            console.log('✓ 地面创建完成');
            
            this.createLandscape();
            console.log('✓ 景观元素创建完成');
            
            this.createPaths();
            console.log('✓ 路径创建完成');
            
            this.createFacilities();
            console.log('✓ 设施创建完成');
            
            this.createLightingSystem();
            console.log('✓ 照明系统创建完成');
            
            this.createCharacters();
            console.log('✓ 人物角色创建完成');
            
            this.createAnimals();
            console.log('✓ 动物角色创建完成');
            
            this.createShops();
            console.log('✓ 商铺建筑创建完成');
            
            this.createCustomers();
            console.log('✓ 客户角色创建完成');
            
            this.trafficSystem = new TrafficSystem(this.scene, this.PARK_SIZE, this.GROUND_SIZE);
            this.trafficSystem.createRoadNetwork();
            console.log('✓ 公路网络创建完成');
            
            this.trafficSystem.createTrafficLights();
            console.log('✓ 红绿灯系统创建完成');
            
            this.trafficSystem.createVehicles();
            console.log('✓ 车辆模型创建完成');
            
            this.setupEventListeners();
            console.log('✓ 事件监听器创建完成');
            
            this.setupKeyboardControls();
            console.log('✓ 键盘控制器创建完成');
            
            this.animate();
            console.log('✓ 渲染循环启动');
            
            console.log('🎉 公园3D场景初始化完成！');
            
            this.hideLoading();
            setTimeout(() => this.hideLoading(), 200);
            
        } catch (error) {
            console.error('❌ 场景初始化失败:', error);
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.innerHTML = '<div style="color: #e74c3c; font-weight: bold;">场景加载失败</div><div style="font-size: 12px; margin-top: 10px;">' + error.message + '</div>';
            }
        }
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 300);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.setCameraView('aerial');
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    createControls() {
        if (typeof THREE.OrbitControls === 'undefined') {
            console.warn('OrbitControls 未加载，使用基础相机控制');
            return;
        }
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 150;
    }

    createLighting() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
        this.sunLight.position.set(50, 80, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 4096;
        this.sunLight.shadow.mapSize.height = 4096;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 300;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);

        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3d5c3d, 0.4);
        this.scene.add(hemiLight);
    }

    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#4a7c23');
        gradient.addColorStop(0.5, '#5a8c33');
        gradient.addColorStop(1, '#3d6b1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        for (let i = 0; i < 20000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2 + 1;
            const green = Math.floor(Math.random() * 60) + 80;
            ctx.fillStyle = `rgba(${Math.floor(green * 0.4)}, ${green}, ${Math.floor(green * 0.2)}, ${Math.random() * 0.3 + 0.1})`;
            ctx.fillRect(x, y, size, size * 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
        return texture;
    }

    createGround() {
        const grassTexture = this.createGrassTexture();
        
        const groundGeo = new THREE.PlaneGeometry(this.GROUND_SIZE, this.GROUND_SIZE, 100, 100);
        const positions = groundGeo.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 0.5 + Math.random() * 0.2;
            positions.setZ(i, z);
        }
        groundGeo.computeVertexNormals();
        
        const groundMat = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const parkBorderGeo = new THREE.BoxGeometry(this.PARK_SIZE + 4, 0.3, 4);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 });
        
        const border1 = new THREE.Mesh(parkBorderGeo, borderMat);
        border1.position.set(0, 0.15, this.PARK_SIZE / 2 + 2);
        border1.castShadow = true;
        border1.receiveShadow = true;
        this.scene.add(border1);
        
        const border2 = border1.clone();
        border2.position.set(0, 0.15, -this.PARK_SIZE / 2 - 2);
        this.scene.add(border2);
        
        const border3 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, this.PARK_SIZE + 4), borderMat);
        border3.position.set(this.PARK_SIZE / 2 + 2, 0.15, 0);
        border3.castShadow = true;
        border3.receiveShadow = true;
        this.scene.add(border3);
        
        const border4 = border3.clone();
        border4.position.set(-this.PARK_SIZE / 2 - 2, 0.15, 0);
        this.scene.add(border4);
    }

    createTree(x, z, scale = 1) {
        const treeGroup = new THREE.Group();
        
        const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 3 * scale, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5 * scale;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        const foliageColors = [0x228B22, 0x2E8B57, 0x3CB371, 0x2E8B57];
        const layers = 3;
        
        for (let i = 0; i < layers; i++) {
            const radius = (2.5 - i * 0.5) * scale;
            const height = 2 * scale;
            const foliageGeo = new THREE.ConeGeometry(radius, height, 8);
            const foliageMat = new THREE.MeshStandardMaterial({
                color: foliageColors[i % foliageColors.length],
                roughness: 0.8
            });
            const foliage = new THREE.Mesh(foliageGeo, foliageMat);
            foliage.position.y = (3 + i * 1.2) * scale;
            foliage.castShadow = true;
            foliage.receiveShadow = true;
            treeGroup.add(foliage);
        }
        
        treeGroup.position.set(x, 0, z);
        return treeGroup;
    }

    createFlowerBed(x, z, radius, flowerColor) {
        const bedGroup = new THREE.Group();
        
        const soilGeo = new THREE.CylinderGeometry(radius, radius + 0.5, 0.3, 32);
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9 });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.position.y = 0.15;
        soil.receiveShadow = true;
        bedGroup.add(soil);
        
        const borderGeo = new THREE.TorusGeometry(radius + 0.25, 0.15, 8, 32);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.7 });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.rotation.x = Math.PI / 2;
        border.position.y = 0.3;
        border.castShadow = true;
        bedGroup.add(border);
        
        const flowerCount = Math.floor(radius * 15);
        for (let i = 0; i < flowerCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (radius - 0.5);
            const fx = Math.cos(angle) * dist;
            const fz = Math.sin(angle) * dist;
            
            const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
            const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.set(fx, 0.5, fz);
            bedGroup.add(stem);
            
            const petalCount = 5 + Math.floor(Math.random() * 3);
            for (let j = 0; j < petalCount; j++) {
                const petalGeo = new THREE.SphereGeometry(0.08, 8, 8);
                const petalMat = new THREE.MeshStandardMaterial({ 
                    color: flowerColor,
                    emissive: flowerColor,
                    emissiveIntensity: 0.1
                });
                const petal = new THREE.Mesh(petalGeo, petalMat);
                const petalAngle = (j / petalCount) * Math.PI * 2;
                petal.position.set(
                    fx + Math.cos(petalAngle) * 0.1,
                    0.7 + Math.random() * 0.1,
                    fz + Math.sin(petalAngle) * 0.1
                );
                petal.scale.set(1, 0.7, 1);
                bedGroup.add(petal);
            }
        }
        
        bedGroup.position.set(x, 0, z);
        return bedGroup;
    }

    createPond(x, z, radius) {
        const pondGroup = new THREE.Group();
        
        const pondGeo = new THREE.CylinderGeometry(radius, radius + 1, 1, 32);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4da6ff,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.3
        });
        const pond = new THREE.Mesh(pondGeo, waterMat);
        pond.position.y = -0.3;
        pond.receiveShadow = true;
        pondGroup.add(pond);
        
        const edgeGeo = new THREE.TorusGeometry(radius + 0.5, 0.3, 8, 32);
        const edgeMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.rotation.x = Math.PI / 2;
        edge.position.y = 0.1;
        edge.castShadow = true;
        pondGroup.add(edge);
        
        for (let i = 0; i < 5; i++) {
            const lilyGeo = new THREE.CircleGeometry(0.4, 16);
            const lilyMat = new THREE.MeshStandardMaterial({ 
                color: 0x228B22,
                side: THREE.DoubleSide,
                roughness: 0.6
            });
            const lily = new THREE.Mesh(lilyGeo, lilyMat);
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (radius - 1);
            lily.position.set(
                Math.cos(angle) * dist,
                0.02,
                Math.sin(angle) * dist
            );
            lily.rotation.x = -Math.PI / 2;
            lily.rotation.z = Math.random() * Math.PI;
            pondGroup.add(lily);
        }
        
        pondGroup.position.set(x, 0, z);
        return pondGroup;
    }

    createLandscape() {
        const treePositions = [
            [-45, -35], [-40, 20], [-35, -15], [-30, 40],
            [40, -40], [35, 25], [45, 5], [25, -25],
            [-15, 45], [10, 35], [-25, -45], [5, -35],
            [-50, 0], [50, 0], [0, 50], [0, -50],
            [-20, -20], [20, 15], [-10, 25], [15, -15],
            [-35, 35], [30, -40], [-45, 10], [40, -10]
        ];
        
        treePositions.forEach(([x, z], i) => {
            const scale = 0.8 + Math.random() * 0.6;
            this.scene.add(this.createTree(x, z, scale));
        });
        
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const scale = 0.5 + Math.random() * 0.5;
            this.scene.add(this.createTree(x, z, scale));
        }
        
        const flowerBeds = [
            { x: -20, z: 0, r: 4, color: 0xFF69B4 },
            { x: 20, z: 0, r: 4, color: 0xFF6347 },
            { x: 0, z: 25, r: 3.5, color: 0xFFD700 },
            { x: -15, z: -25, r: 3, color: 0x9370DB },
            { x: 15, z: -20, r: 3, color: 0x00CED1 }
        ];
        
        flowerBeds.forEach(bed => {
            this.scene.add(this.createFlowerBed(bed.x, bed.z, bed.r, bed.color));
        });
        
        this.scene.add(this.createPond(0, -15, 8));
    }

    createBench(x, z, rotation = 0) {
        const benchGroup = new THREE.Group();
        
        const woodMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.7
        });
        
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x4A4A4A,
            roughness: 0.5,
            metalness: 0.6
        });
        
        const seatGeo = new THREE.BoxGeometry(2, 0.1, 0.5);
        const seat = new THREE.Mesh(seatGeo, woodMat);
        seat.position.y = 0.45;
        seat.castShadow = true;
        seat.receiveShadow = true;
        benchGroup.add(seat);
        
        const backGeo = new THREE.BoxGeometry(2, 0.5, 0.08);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.set(0, 0.75, -0.2);
        back.castShadow = true;
        back.receiveShadow = true;
        benchGroup.add(back);
        
        const legPositions = [
            [-0.8, 0.2, 0.2], [0.8, 0.2, 0.2],
            [-0.8, 0.2, -0.2], [0.8, 0.2, -0.2]
        ];
        
        legPositions.forEach(pos => {
            const legGeo = new THREE.BoxGeometry(0.08, 0.45, 0.08);
            const leg = new THREE.Mesh(legGeo, metalMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            benchGroup.add(leg);
        });
        
        benchGroup.position.set(x, 0, z);
        benchGroup.rotation.y = rotation;
        return benchGroup;
    }

    createGazebo(x, z) {
        const gazeboGroup = new THREE.Group();
        
        const floorGeo = new THREE.CylinderGeometry(5, 5.2, 0.3, 8);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.8 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.y = 0.15;
        floor.receiveShadow = true;
        floor.castShadow = true;
        gazeboGroup.add(floor);
        
        const columnMat = new THREE.MeshStandardMaterial({ color: 0xF5F5DC, roughness: 0.7 });
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const colGeo = new THREE.CylinderGeometry(0.2, 0.25, 4, 8);
            const col = new THREE.Mesh(colGeo, columnMat);
            col.position.set(
                Math.cos(angle) * 4.2,
                2.3,
                Math.sin(angle) * 4.2
            );
            col.castShadow = true;
            gazeboGroup.add(col);
        }
        
        const roofGeo = new THREE.ConeGeometry(6, 2.5, 8);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.6 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 5.5;
        roof.castShadow = true;
        gazeboGroup.add(roof);
        
        const finialGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const finialMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8 });
        const finial = new THREE.Mesh(finialGeo, finialMat);
        finial.position.y = 7;
        gazeboGroup.add(finial);
        
        const railGeo = new THREE.TorusGeometry(4.2, 0.08, 8, 32);
        const railMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.rotation.x = Math.PI / 2;
        rail.position.y = 1;
        gazeboGroup.add(rail);
        
        gazeboGroup.position.set(x, 0, z);
        return gazeboGroup;
    }

    createPlayground(x, z) {
        const pgGroup = new THREE.Group();
        
        const groundGeo = new THREE.BoxGeometry(25, 0.2, 20);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = 0.1;
        ground.receiveShadow = true;
        pgGroup.add(ground);
        
        const borderGeo = new THREE.BoxGeometry(26, 0.3, 0.3);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        const border1 = new THREE.Mesh(borderGeo, borderMat);
        border1.position.set(0, 0.15, 10);
        border1.castShadow = true;
        pgGroup.add(border1);
        const border2 = border1.clone();
        border2.position.set(0, 0.15, -10);
        pgGroup.add(border2);
        
        const border3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 20), borderMat);
        border3.position.set(12.5, 0.15, 0);
        border3.castShadow = true;
        pgGroup.add(border3);
        const border4 = border3.clone();
        border4.position.set(-12.5, 0.15, 0);
        pgGroup.add(border4);
        
        const slideMat = new THREE.MeshStandardMaterial({ color: 0xFF6347, roughness: 0.5 });
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x4169E1, roughness: 0.4, metalness: 0.3 });
        
        const platformGeo = new THREE.BoxGeometry(3, 0.2, 3);
        const platform = new THREE.Mesh(platformGeo, slideMat);
        platform.position.set(-5, 2.6, 3);
        platform.castShadow = true;
        platform.receiveShadow = true;
        pgGroup.add(platform);
        
        const polePositions = [
            [-6.5, 1.3, 4.5], [-3.5, 1.3, 4.5],
            [-6.5, 1.3, 1.5], [-3.5, 1.3, 1.5]
        ];
        polePositions.forEach(pos => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8), poleMat);
            pole.position.set(pos[0], pos[1], pos[2]);
            pole.castShadow = true;
            pgGroup.add(pole);
        });
        
        const slideGeo = new THREE.BoxGeometry(0.8, 0.15, 5);
        const slide = new THREE.Mesh(slideGeo, slideMat);
        slide.position.set(-5, 1.5, -1);
        slide.rotation.x = -Math.PI / 6;
        slide.castShadow = true;
        pgGroup.add(slide);
        
        const sideGeo = new THREE.BoxGeometry(0.1, 0.3, 5);
        const side1 = new THREE.Mesh(sideGeo, slideMat);
        side1.position.set(-5.35, 1.6, -1);
        side1.rotation.x = -Math.PI / 6;
        pgGroup.add(side1);
        const side2 = side1.clone();
        side2.position.set(-4.65, 1.6, -1);
        pgGroup.add(side2);
        
        const ladderGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
        for (let i = 0; i < 5; i++) {
            const rung = new THREE.Mesh(ladderGeo, poleMat);
            rung.position.set(-5, 0.5 + i * 0.5, 4.8);
            rung.castShadow = true;
            pgGroup.add(rung);
        }
        
        const swingPole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5, 8), poleMat);
        swingPole1.position.set(5, 2.5, -5);
        swingPole1.castShadow = true;
        pgGroup.add(swingPole1);
        const swingPole2 = swingPole1.clone();
        swingPole2.position.set(8, 2.5, -5);
        pgGroup.add(swingPole2);
        
        const swingTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, 0.2), poleMat);
        swingTop.position.set(6.5, 5, -5);
        swingTop.castShadow = true;
        pgGroup.add(swingTop);
        
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        const seatMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00, roughness: 0.6 });
        
        for (let i = 0; i < 2; i++) {
            const offsetX = 5.8 + i * 1.4;
            const rope1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 6), ropeMat);
            rope1.position.set(offsetX, 3.5, -5);
            pgGroup.add(rope1);
            const rope2 = rope1.clone();
            rope2.position.set(offsetX, 3.5, -4.3);
            pgGroup.add(rope2);
            
            const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.5), seatMat);
            seat.position.set(offsetX, 2.2, -4.65);
            seat.castShadow = true;
            pgGroup.add(seat);
        }
        
        pgGroup.position.set(x, 0, z);
        return pgGroup;
    }

    createFacilities() {
        const benchPositions = [
            { x: -25, z: 5, r: 0 },
            { x: 25, z: 5, r: Math.PI },
            { x: -10, z: -10, r: Math.PI / 4 },
            { x: 10, z: -10, r: -Math.PI / 4 },
            { x: 0, z: 35, r: Math.PI },
            { x: -35, z: -20, r: Math.PI / 2 },
            { x: 35, z: -20, r: -Math.PI / 2 }
        ];
        
        benchPositions.forEach(pos => {
            this.scene.add(this.createBench(pos.x, pos.z, pos.r));
        });
        
        this.scene.add(this.createGazebo(0, 35));
        
        this.scene.add(this.createPlayground(30, 25));
    }

    createPaths() {
        const pathMat = new THREE.MeshStandardMaterial({ 
            color: 0xD2B48C,
            roughness: 0.9
        });
        
        const mainPath1Geo = new THREE.BoxGeometry(this.PARK_SIZE - 10, 4, 0.1);
        const mainPath1 = new THREE.Mesh(mainPath1Geo, pathMat);
        mainPath1.position.set(0, 0.06, 0);
        mainPath1.receiveShadow = true;
        this.scene.add(mainPath1);
        
        const mainPath2Geo = new THREE.BoxGeometry(4, this.PARK_SIZE - 10, 0.1);
        const mainPath2 = new THREE.Mesh(mainPath2Geo, pathMat);
        mainPath2.position.set(0, 0.06, 0);
        mainPath2.receiveShadow = true;
        this.scene.add(mainPath2);
        
        const curvePath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-40, 0.06, -30),
            new THREE.Vector3(-30, 0.06, -20),
            new THREE.Vector3(-20, 0.06, -30),
            new THREE.Vector3(-10, 0.06, -25),
            new THREE.Vector3(0, 0.06, -30)
        ]);
        
        const pathPoints = curvePath.getPoints(50);
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];
            const dir = new THREE.Vector3().subVectors(p2, p1);
            const len = dir.length();
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            
            const segGeo = new THREE.BoxGeometry(len, 0.1, 2.5);
            const seg = new THREE.Mesh(segGeo, pathMat);
            seg.position.copy(mid);
            seg.rotation.y = Math.atan2(dir.x, dir.z);
            seg.receiveShadow = true;
            this.scene.add(seg);
        }
        
        const secondaryPaths = [
            { x: 0, z: 25, w: 3, l: 15, rot: 0 },
            { x: -20, z: 10, w: 2.5, l: 20, rot: Math.PI / 2 },
            { x: 20, z: 10, w: 2.5, l: 20, rot: Math.PI / 2 },
            { x: 30, z: -10, w: 2.5, l: 25, rot: Math.PI / 3 },
            { x: -30, z: -10, w: 2.5, l: 25, rot: -Math.PI / 3 }
        ];
        
        secondaryPaths.forEach(p => {
            const pathGeo = new THREE.BoxGeometry(p.l, 0.1, p.w);
            const path = new THREE.Mesh(pathGeo, pathMat);
            path.position.set(p.x, 0.06, p.z);
            path.rotation.y = p.rot;
            path.receiveShadow = true;
            this.scene.add(path);
        });
    }

    createStreetLamp(x, z) {
        const lampGroup = new THREE.Group();
        
        const poleGeo = new THREE.CylinderGeometry(0.1, 0.15, 4, 8);
        const poleMat = new THREE.MeshStandardMaterial({ 
            color: 0x2F4F4F,
            roughness: 0.5,
            metalness: 0.7
        });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2;
        pole.castShadow = true;
        lampGroup.add(pole);
        
        const armGeo = new THREE.BoxGeometry(0.8, 0.08, 0.08);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(0.4, 3.8, 0);
        lampGroup.add(arm);
        
        const fixtureGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const fixtureMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFE0,
            emissive: 0xFFFFAA,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixture.position.set(0.8, 3.6, 0);
        lampGroup.add(fixture);
        
        const pointLight = new THREE.PointLight(0xFFFACD, 0.8, 15);
        pointLight.position.set(0.8, 3.5, 0);
        lampGroup.add(pointLight);
        
        lampGroup.position.set(x, 0, z);
        return lampGroup;
    }

    createLightingSystem() {
        const lampPositions = [
            [-30, 0], [30, 0], [0, 30], [0, -30],
            [-15, 15], [15, 15], [-15, -15], [15, -15],
            [-40, 20], [40, 20], [-40, -20], [40, -20]
        ];
        
        lampPositions.forEach(([x, z]) => {
            this.scene.add(this.createStreetLamp(x, z));
        });
    }

    createElderlyMan(x, z, rotation = 0) {
        const personGroup = new THREE.Group();
        
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFD5B5, roughness: 0.8 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x4A90D9, roughness: 0.7 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2F4F4F, roughness: 0.8 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2C2C2C, roughness: 0.7 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8);
        const body = new THREE.Mesh(bodyGeo, shirtMat);
        body.position.y = 1.1;
        body.castShadow = true;
        personGroup.add(body);
        
        const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.75;
        head.castShadow = true;
        personGroup.add(head);
        
        const hairGeo = new THREE.SphereGeometry(0.23, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.82;
        personGroup.add(hair);
        
        const beardGeo = new THREE.SphereGeometry(0.15, 12, 8);
        const beard = new THREE.Mesh(beardGeo, hairMat);
        beard.position.set(0, 1.62, 0.15);
        beard.scale.set(1, 0.8, 0.6);
        personGroup.add(beard);
        
        const legGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.6, 8);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.12, 0.4, 0);
        leftLeg.castShadow = true;
        personGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.12, 0.4, 0);
        rightLeg.castShadow = true;
        personGroup.add(rightLeg);
        
        const shoeGeo = new THREE.BoxGeometry(0.12, 0.06, 0.2);
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.set(-0.12, 0.06, 0.02);
        leftShoe.castShadow = true;
        personGroup.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
        rightShoe.position.set(0.12, 0.06, 0.02);
        rightShoe.castShadow = true;
        personGroup.add(rightShoe);
        
        const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.5, 8);
        const leftArm = new THREE.Mesh(armGeo, shirtMat);
        leftArm.position.set(-0.32, 1.15, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        personGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, shirtMat);
        rightArm.position.set(0.32, 1.15, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        personGroup.add(rightArm);
        
        const caneGeo = new THREE.CylinderGeometry(0.02, 0.025, 1.2, 6);
        const caneMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        const cane = new THREE.Mesh(caneGeo, caneMat);
        cane.position.set(0.35, 0.6, 0.15);
        cane.rotation.z = -0.1;
        cane.castShadow = true;
        personGroup.add(cane);
        
        const caneHandleGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16);
        const caneHandle = new THREE.Mesh(caneHandleGeo, caneMat);
        caneHandle.position.set(0.32, 1.2, 0.15);
        caneHandle.rotation.y = Math.PI / 2;
        personGroup.add(caneHandle);
        
        personGroup.position.set(x, 0, z);
        personGroup.rotation.y = rotation;
        personGroup.userData = { 
            type: 'character', 
            name: '张爷爷',
            walkSpeed: 0,
            swayOffset: Math.random() * Math.PI * 2,
            characterType: 'elderly'
        };
        
        this.buildCharacterSkeleton(personGroup, 'elderly');
        
        const bones = personGroup.userData.bones;
        if (bones) {
            if (bones.head) {
                head.position.set(0, 0, 0);
                hair.position.set(0, 0.07, 0);
                beard.position.set(0, -0.13, 0.15);
                bones.head.add(head);
                bones.head.add(hair);
                bones.head.add(beard);
            }
            if (bones.chest) {
                body.position.set(0, 0, 0);
                body.scale.set(1, 1.1, 1);
                bones.chest.add(body);
            }
            if (bones.leftArm) {
                leftArm.position.set(0, 0, 0);
                leftArm.rotation.set(0, 0, 0.3);
                bones.leftArm.add(leftArm);
            }
            if (bones.rightArm) {
                rightArm.position.set(0, 0, 0);
                rightArm.rotation.set(0, 0, -0.3);
                bones.rightArm.add(rightArm);
            }
            if (bones.leftLeg) {
                leftLeg.position.set(0, 0, 0);
                bones.leftLeg.add(leftLeg);
                leftShoe.position.set(0, -0.3, 0.02);
                bones.leftLeg.add(leftShoe);
            }
            if (bones.rightLeg) {
                rightLeg.position.set(0, 0, 0);
                bones.rightLeg.add(rightLeg);
                rightShoe.position.set(0, -0.3, 0.02);
                bones.rightLeg.add(rightShoe);
            }
        }
        
        return personGroup;
    }

    createChild(x, z, rotation = 0) {
        const personGroup = new THREE.Group();
        
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFE0C3, roughness: 0.8 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.7 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x4ECDC4, roughness: 0.8 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x2C1810, roughness: 0.9 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.55, 8);
        const body = new THREE.Mesh(bodyGeo, shirtMat);
        body.position.y = 0.85;
        body.castShadow = true;
        personGroup.add(body);
        
        const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.35;
        head.castShadow = true;
        personGroup.add(head);
        
        const hairGeo = new THREE.SphereGeometry(0.19, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.42;
        personGroup.add(hair);
        
        const capGeo = new THREE.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xFFD93D, roughness: 0.6 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 1.45;
        personGroup.add(cap);
        
        const capBrimGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
        const capBrim = new THREE.Mesh(capBrimGeo, capMat);
        capBrim.position.set(0, 1.38, 0.15);
        capBrim.rotation.x = Math.PI / 2;
        personGroup.add(capBrim);
        
        const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.45, 8);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.1, 0.32, 0);
        leftLeg.castShadow = true;
        personGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.1, 0.32, 0);
        rightLeg.castShadow = true;
        personGroup.add(rightLeg);
        
        const shoeGeo = new THREE.BoxGeometry(0.1, 0.05, 0.16);
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.set(-0.1, 0.05, 0.02);
        leftShoe.castShadow = true;
        personGroup.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
        rightShoe.position.set(0.1, 0.05, 0.02);
        rightShoe.castShadow = true;
        personGroup.add(rightShoe);
        
        const armGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.4, 8);
        const leftArm = new THREE.Mesh(armGeo, shirtMat);
        leftArm.position.set(-0.25, 0.9, 0);
        leftArm.rotation.z = 0.5;
        leftArm.castShadow = true;
        personGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, shirtMat);
        rightArm.position.set(0.25, 0.9, 0);
        rightArm.rotation.z = -0.5;
        rightArm.castShadow = true;
        personGroup.add(rightArm);
        
        const balloonGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const balloonMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF69B4, 
            emissive: 0xFF69B4,
            emissiveIntensity: 0.1,
            roughness: 0.3
        });
        const balloon = new THREE.Mesh(balloonGeo, balloonMat);
        balloon.position.set(0.3, 1.8, 0);
        balloon.castShadow = true;
        personGroup.add(balloon);
        
        const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4);
        const stringMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const string = new THREE.Mesh(stringGeo, stringMat);
        string.position.set(0.28, 1.45, 0);
        personGroup.add(string);
        
        personGroup.position.set(x, 0, z);
        personGroup.rotation.y = rotation;
        personGroup.userData = { 
            type: 'character', 
            name: '小明',
            walkSpeed: 0.02,
            swayOffset: Math.random() * Math.PI * 2,
            jumpOffset: Math.random() * Math.PI * 2,
            characterType: 'child'
        };
        
        this.buildCharacterSkeleton(personGroup, 'child');
        
        const bones = personGroup.userData.bones;
        if (bones) {
            if (bones.hips) bones.hips.scale.set(0.7, 0.7, 0.7);
            if (bones.head) {
                head.position.set(0, 0, 0);
                hair.position.set(0, 0.07, 0);
                cap.position.set(0, 0.1, 0);
                capBrim.position.set(0, 0.03, 0.15);
                bones.head.add(head);
                bones.head.add(hair);
                bones.head.add(cap);
                bones.head.add(capBrim);
            }
            if (bones.chest) {
                body.position.set(0, 0, 0);
                body.scale.set(1, 0.8, 1);
                bones.chest.add(body);
            }
            if (bones.leftArm) {
                leftArm.position.set(0, 0, 0);
                leftArm.rotation.set(0, 0, 0.5);
                bones.leftArm.add(leftArm);
            }
            if (bones.rightArm) {
                rightArm.position.set(0, 0, 0);
                rightArm.rotation.set(0, 0, -0.5);
                bones.rightArm.add(rightArm);
                balloon.position.set(0.05, -0.1, 0.1);
                string.position.set(0, -0.3, 0);
                bones.rightForearm.add(balloon);
                bones.rightForearm.add(string);
            }
            if (bones.leftLeg) {
                leftLeg.position.set(0, 0, 0);
                bones.leftLeg.add(leftLeg);
                leftShoe.position.set(0, -0.25, 0.02);
                bones.leftLeg.add(leftShoe);
            }
            if (bones.rightLeg) {
                rightLeg.position.set(0, 0, 0);
                bones.rightLeg.add(rightLeg);
                rightShoe.position.set(0, -0.25, 0.02);
                bones.rightLeg.add(rightShoe);
            }
        }
        
        return personGroup;
    }

    createAuntie(x, z, rotation = 0) {
        const personGroup = new THREE.Group();
        
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFD5B5, roughness: 0.8 });
        const dressMat = new THREE.MeshStandardMaterial({ color: 0x9B59B6, roughness: 0.7 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1C1C1C, roughness: 0.9 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2C2C2C, roughness: 0.7 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.9, 8);
        const body = new THREE.Mesh(bodyGeo, dressMat);
        body.position.y = 1.15;
        body.castShadow = true;
        personGroup.add(body);
        
        const collarGeo = new THREE.TorusGeometry(0.23, 0.04, 8, 16);
        const collarMat = new THREE.MeshStandardMaterial({ color: 0xF1C40F, roughness: 0.6 });
        const collar = new THREE.Mesh(collarGeo, collarMat);
        collar.position.y = 1.65;
        collar.rotation.x = Math.PI / 2;
        personGroup.add(collar);
        
        const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.85;
        head.castShadow = true;
        personGroup.add(head);
        
        const hairGeo = new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.92;
        personGroup.add(hair);
        
        const bunGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const bun = new THREE.Mesh(bunGeo, hairMat);
        bun.position.set(0, 2.05, -0.1);
        personGroup.add(bun);
        
        const legGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.55, 8);
        const leftLeg = new THREE.Mesh(legGeo, dressMat);
        leftLeg.position.set(-0.12, 0.38, 0);
        leftLeg.castShadow = true;
        personGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, dressMat);
        rightLeg.position.set(0.12, 0.38, 0);
        rightLeg.castShadow = true;
        personGroup.add(rightLeg);
        
        const shoeGeo = new THREE.BoxGeometry(0.11, 0.05, 0.18);
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.set(-0.12, 0.05, 0.02);
        leftShoe.castShadow = true;
        personGroup.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
        rightShoe.position.set(0.12, 0.05, 0.02);
        rightShoe.castShadow = true;
        personGroup.add(rightShoe);
        
        const armGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.5, 8);
        const leftArm = new THREE.Mesh(armGeo, dressMat);
        leftArm.position.set(-0.3, 1.2, 0);
        leftArm.rotation.z = 0.2;
        leftArm.castShadow = true;
        personGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, dressMat);
        rightArm.position.set(0.3, 1.2, 0);
        rightArm.rotation.z = -0.2;
        rightArm.castShadow = true;
        personGroup.add(rightArm);
        
        const bagGeo = new THREE.BoxGeometry(0.2, 0.25, 0.1);
        const bagMat = new THREE.MeshStandardMaterial({ color: 0xE67E22, roughness: 0.6 });
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(-0.4, 0.9, 0);
        bag.castShadow = true;
        personGroup.add(bag);
        
        const bagStrapGeo = new THREE.TorusGeometry(0.15, 0.015, 6, 16);
        const bagStrap = new THREE.Mesh(bagStrapGeo, bagMat);
        bagStrap.position.set(-0.3, 1.3, 0);
        bagStrap.rotation.y = Math.PI / 2;
        personGroup.add(bagStrap);
        
        personGroup.position.set(x, 0, z);
        personGroup.rotation.y = rotation;
        personGroup.userData = { 
            type: 'character', 
            name: '李阿姨',
            walkSpeed: 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            characterType: 'auntie'
        };
        
        this.buildCharacterSkeleton(personGroup, 'auntie');
        
        const bones = personGroup.userData.bones;
        if (bones) {
            if (bones.head) {
                head.position.set(0, 0, 0);
                hair.position.set(0, 0.07, 0);
                bun.position.set(0, 0.2, -0.1);
                bones.head.add(head);
                bones.head.add(hair);
                bones.head.add(bun);
            }
            if (bones.chest) {
                body.position.set(0, 0, 0);
                body.scale.set(1, 1.1, 1);
                collar.position.set(0, 0.5, 0);
                collar.rotation.x = Math.PI / 2;
                bones.chest.add(body);
                bones.chest.add(collar);
            }
            if (bones.leftArm) {
                leftArm.position.set(0, 0, 0);
                leftArm.rotation.set(0, 0, 0.2);
                bones.leftArm.add(leftArm);
                bag.position.set(-0.1, 0, 0);
                bagStrap.position.set(0, 0.1, 0);
                bagStrap.rotation.y = Math.PI / 2;
                bones.leftShoulder.add(bag);
                bones.leftShoulder.add(bagStrap);
            }
            if (bones.rightArm) {
                rightArm.position.set(0, 0, 0);
                rightArm.rotation.set(0, 0, -0.2);
                bones.rightArm.add(rightArm);
            }
            if (bones.leftLeg) {
                leftLeg.position.set(0, 0, 0);
                bones.leftLeg.add(leftLeg);
                leftShoe.position.set(0, -0.3, 0.02);
                bones.leftLeg.add(leftShoe);
            }
            if (bones.rightLeg) {
                rightLeg.position.set(0, 0, 0);
                bones.rightLeg.add(rightLeg);
                rightShoe.position.set(0, -0.3, 0.02);
                bones.rightLeg.add(rightShoe);
            }
        }
        
        return personGroup;
    }

    createDog(x, z, rotation = 0) {
        const dogGroup = new THREE.Group();
        
        const furMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.9 });
        const earMat = new THREE.MeshStandardMaterial({ color: 0xB8956E, roughness: 0.9 });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x2C2C2C, roughness: 0.5 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1C1C1C, roughness: 0.3 });
        const tongueMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.6 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 12);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.y = 0.4;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        dogGroup.add(body);
        
        const bodyFront = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), furMat);
        bodyFront.position.set(0.2, 0.4, 0);
        bodyFront.castShadow = true;
        dogGroup.add(bodyFront);
        
        const bodyBack = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), furMat);
        bodyBack.position.set(-0.2, 0.4, 0);
        bodyBack.castShadow = true;
        dogGroup.add(bodyBack);
        
        const headGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0.35, 0.5, 0);
        head.castShadow = true;
        dogGroup.add(head);
        
        const snoutGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8);
        const snout = new THREE.Mesh(snoutGeo, furMat);
        snout.position.set(0.45, 0.45, 0);
        snout.rotation.z = Math.PI / 2;
        dogGroup.add(snout);
        
        const noseGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0.52, 0.47, 0);
        dogGroup.add(nose);
        
        const tongueGeo = new THREE.BoxGeometry(0.06, 0.01, 0.04);
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.position.set(0.48, 0.4, 0);
        dogGroup.add(tongue);
        
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
        leftEye.position.set(0.4, 0.55, 0.07);
        dogGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
        rightEye.position.set(0.4, 0.55, -0.07);
        dogGroup.add(rightEye);
        
        const leftEarGeo = new THREE.ConeGeometry(0.06, 0.12, 6);
        const leftEar = new THREE.Mesh(leftEarGeo, earMat);
        leftEar.position.set(0.3, 0.65, 0.08);
        leftEar.rotation.z = -0.5;
        dogGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(leftEarGeo, earMat);
        rightEar.position.set(0.3, 0.65, -0.08);
        rightEar.rotation.z = 0.5;
        dogGroup.add(rightEar);
        
        const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8);
        const legPositions = [
            [0.15, 0.15, 0.1], [0.15, 0.15, -0.1],
            [-0.15, 0.15, 0.1], [-0.15, 0.15, -0.1]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, furMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            dogGroup.add(leg);
        });
        
        const pawGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const pawMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 });
        [[0.15, 0.01, 0.1], [0.15, 0.01, -0.1],
         [-0.15, 0.01, 0.1], [-0.15, 0.01, -0.1]].forEach(pos => {
            const paw = new THREE.Mesh(pawGeo, pawMat);
            paw.position.set(pos[0], pos[1], pos[2]);
            paw.scale.set(1, 0.5, 1);
            dogGroup.add(paw);
        });
        
        const tailGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.25, 6);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.position.set(-0.35, 0.5, 0);
        tail.rotation.z = 0.8;
        tail.castShadow = true;
        dogGroup.add(tail);
        
        const collarGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
        const collarMat = new THREE.MeshStandardMaterial({ color: 0xE74C3C, roughness: 0.5 });
        const collar = new THREE.Mesh(collarGeo, collarMat);
        collar.position.set(0.22, 0.45, 0);
        collar.rotation.y = Math.PI / 2;
        dogGroup.add(collar);
        
        const tagGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8);
        const tagMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.3 });
        const tag = new THREE.Mesh(tagGeo, tagMat);
        tag.position.set(0.22, 0.34, 0);
        tag.rotation.x = Math.PI / 2;
        dogGroup.add(tag);
        
        dogGroup.position.set(x, 0, z);
        dogGroup.rotation.y = rotation;
        dogGroup.userData = { 
            type: 'animal', 
            name: '小黄',
            walkSpeed: 0.025,
            wagOffset: Math.random() * Math.PI * 2,
            animalType: 'dog'
        };
        
        this.buildAnimalSkeleton(dogGroup, 'dog');
        
        const bones = dogGroup.userData.bones;
        if (bones) {
            if (bones.hips) bones.hips.scale.set(1.2, 1.2, 1.2);
            if (bones.head) {
                head.position.set(0, 0, 0);
                leftEar.position.set(-0.05, 0.08, 0.07);
                rightEar.position.set(0.05, 0.08, 0.07);
                leftEye.position.set(-0.05, 0.03, 0.1);
                rightEye.position.set(0.05, 0.03, 0.1);
                nose.position.set(0, -0.02, 0.12);
                tongue.position.set(0, -0.06, 0.1);
                bones.head.add(head);
                bones.head.add(leftEar);
                bones.head.add(rightEar);
                bones.head.add(leftEye);
                bones.head.add(rightEye);
                bones.head.add(nose);
                bones.head.add(tongue);
            }
            if (bones.chest) {
                body.position.set(0, 0, 0);
                body.rotation.z = Math.PI / 2;
                bodyFront.position.set(0.15, 0, 0);
                bodyBack.position.set(-0.15, 0, 0);
                collar.position.set(0.2, 0, 0);
                collar.rotation.y = Math.PI / 2;
                tag.position.set(0.2, -0.1, 0);
                tag.rotation.x = Math.PI / 2;
                bones.chest.add(body);
                bones.chest.add(bodyFront);
                bones.chest.add(bodyBack);
                bones.chest.add(collar);
                bones.chest.add(tag);
            }
            if (bones.tail3) {
                tail.position.set(0, 0, 0);
                tail.rotation.z = 0;
                bones.tail3.add(tail);
            }
        }
        
        return dogGroup;
    }

    createCat(x, z, rotation = 0) {
        const catGroup = new THREE.Group();
        
        const furMat = new THREE.MeshStandardMaterial({ color: 0xE8A857, roughness: 0.9 });
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0xC67C2E, roughness: 0.9 });
        const noseMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.5 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.3, emissive: 0x90EE90, emissiveIntensity: 0.1 });
        const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.7 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 12);
        const body = new THREE.Mesh(bodyGeo, furMat);
        body.position.y = 0.28;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        catGroup.add(body);
        
        const bodyFront = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), furMat);
        bodyFront.position.set(0.175, 0.28, 0);
        bodyFront.castShadow = true;
        catGroup.add(bodyFront);
        
        const bodyBack = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), furMat);
        bodyBack.position.set(-0.175, 0.28, 0);
        bodyBack.castShadow = true;
        catGroup.add(bodyBack);
        
        for (let i = 0; i < 4; i++) {
            const stripeGeo = new THREE.BoxGeometry(0.02, 0.2, 0.08);
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.set(-0.1 + i * 0.08, 0.38, 0);
            stripe.rotation.z = 0.2;
            catGroup.add(stripe);
        }
        
        const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const head = new THREE.Mesh(headGeo, furMat);
        head.position.set(0.28, 0.35, 0);
        head.castShadow = true;
        catGroup.add(head);
        
        const leftEarGeo = new THREE.ConeGeometry(0.05, 0.1, 6);
        const leftEar = new THREE.Mesh(leftEarGeo, furMat);
        leftEar.position.set(0.23, 0.48, 0.07);
        leftEar.rotation.z = -0.3;
        catGroup.add(leftEar);
        
        const leftInnerEar = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), innerEarMat);
        leftInnerEar.position.set(0.23, 0.46, 0.07);
        leftInnerEar.rotation.z = -0.3;
        catGroup.add(leftInnerEar);
        
        const rightEar = new THREE.Mesh(leftEarGeo, furMat);
        rightEar.position.set(0.23, 0.48, -0.07);
        rightEar.rotation.z = 0.3;
        catGroup.add(rightEar);
        
        const rightInnerEar = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), innerEarMat);
        rightInnerEar.position.set(0.23, 0.46, -0.07);
        rightInnerEar.rotation.z = 0.3;
        catGroup.add(rightInnerEar);
        
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
        leftEye.position.set(0.33, 0.38, 0.05);
        catGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
        rightEye.position.set(0.33, 0.38, -0.05);
        catGroup.add(rightEye);
        
        const noseGeo = new THREE.SphereGeometry(0.02, 8, 8);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0.38, 0.33, 0);
        catGroup.add(nose);
        
        const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
        const whiskerGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.12, 4);
        for (let i = 0; i < 3; i++) {
            const whiskerL = new THREE.Mesh(whiskerGeo, whiskerMat);
            whiskerL.position.set(0.4, 0.3 - i * 0.02, 0.06);
            whiskerL.rotation.z = -0.3 + i * 0.15;
            catGroup.add(whiskerL);
            
            const whiskerR = new THREE.Mesh(whiskerGeo, whiskerMat);
            whiskerR.position.set(0.4, 0.3 - i * 0.02, -0.06);
            whiskerR.rotation.z = 0.3 - i * 0.15;
            catGroup.add(whiskerR);
        }
        
        const legGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.2, 8);
        const legPositions = [
            [0.12, 0.1, 0.07], [0.12, 0.1, -0.07],
            [-0.12, 0.1, 0.07], [-0.12, 0.1, -0.07]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, furMat);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            catGroup.add(leg);
        });
        
        const pawGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const pawMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.7 });
        [[0.12, 0.005, 0.07], [0.12, 0.005, -0.07],
         [-0.12, 0.005, 0.07], [-0.12, 0.005, -0.07]].forEach(pos => {
            const paw = new THREE.Mesh(pawGeo, pawMat);
            paw.position.set(pos[0], pos[1], pos[2]);
            paw.scale.set(1, 0.4, 1);
            catGroup.add(paw);
        });
        
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.25, 0.25, 0),
            new THREE.Vector3(-0.35, 0.4, 0),
            new THREE.Vector3(-0.4, 0.55, 0.05),
            new THREE.Vector3(-0.38, 0.7, 0.1)
        ]);
        const tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.025, 8, false);
        const tail = new THREE.Mesh(tailGeo, furMat);
        tail.castShadow = true;
        catGroup.add(tail);
        
        catGroup.position.set(x, 0, z);
        catGroup.rotation.y = rotation;
        catGroup.userData = { 
            type: 'animal', 
            name: '小花',
            walkSpeed: 0.015,
            tailOffset: Math.random() * Math.PI * 2,
            animalType: 'cat'
        };
        
        this.buildAnimalSkeleton(catGroup, 'cat');
        
        const bones = catGroup.userData.bones;
        if (bones) {
            if (bones.head) {
                head.position.set(0, 0, 0);
                leftEar.position.set(-0.05, 0.1, 0.05);
                rightEar.position.set(0.05, 0.1, 0.05);
                leftInnerEar.position.set(-0.05, 0.1, 0.06);
                rightInnerEar.position.set(0.05, 0.1, 0.06);
                leftEye.position.set(-0.04, 0.03, 0.08);
                rightEye.position.set(0.04, 0.03, 0.08);
                nose.position.set(0, -0.02, 0.1);
                bones.head.add(head);
                bones.head.add(leftEar);
                bones.head.add(rightEar);
                bones.head.add(leftInnerEar);
                bones.head.add(rightInnerEar);
                bones.head.add(leftEye);
                bones.head.add(rightEye);
                bones.head.add(nose);
            }
            if (bones.chest) {
                body.position.set(0, 0, 0);
                body.rotation.z = Math.PI / 2;
                bodyFront.position.set(0.12, 0, 0);
                bodyBack.position.set(-0.12, 0, 0);
                bones.chest.add(body);
                bones.chest.add(bodyFront);
                bones.chest.add(bodyBack);
                for (let i = 0; i < 4; i++) {
                    if (catGroup.children.find(c => c.geometry && c.geometry.type === 'BoxGeometry' && c.position.x === -0.1 + i * 0.08)) {
                        const stripe = catGroup.children.find(c => c.geometry && c.geometry.type === 'BoxGeometry' && c.position.x === -0.1 + i * 0.08);
                        if (stripe) {
                            stripe.position.set(-0.1 + i * 0.08, 0.1, 0);
                            bones.chest.add(stripe);
                        }
                    }
                }
            }
            if (bones.tail3) {
                tail.position.set(0, 0, 0);
                bones.tail3.add(tail);
            }
        }
        
        return catGroup;
    }

    createPigeon(x, z, rotation = 0) {
        const birdGroup = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.7 });
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.7 });
        const headMat = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.7 });
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xFFA500, roughness: 0.5 });
        const footMat = new THREE.MeshStandardMaterial({ color: 0xFF6B35, roughness: 0.6 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.12;
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        birdGroup.add(body);
        
        const bodyFront = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), bodyMat);
        bodyFront.position.set(0.05, 0.12, 0);
        bodyFront.castShadow = true;
        birdGroup.add(bodyFront);
        
        const bodyBack = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), bodyMat);
        bodyBack.position.set(-0.05, 0.12, 0);
        bodyBack.castShadow = true;
        birdGroup.add(bodyBack);
        
        const headGeo = new THREE.SphereGeometry(0.05, 12, 12);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0.1, 0.18, 0);
        head.castShadow = true;
        birdGroup.add(head);
        
        const neckGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.06, 8);
        const neck = new THREE.Mesh(neckGeo, bodyMat);
        neck.position.set(0.06, 0.16, 0);
        neck.rotation.z = -0.5;
        birdGroup.add(neck);
        
        const beakGeo = new THREE.ConeGeometry(0.02, 0.06, 6);
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0.14, 0.17, 0);
        beak.rotation.z = -Math.PI / 2;
        birdGroup.add(beak);
        
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFFA500, emissive: 0xFFA500, emissiveIntensity: 0.2 });
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), eyeMat);
        eye.position.set(0.11, 0.2, 0.03);
        birdGroup.add(eye);
        
        const leftWingGeo = new THREE.BoxGeometry(0.12, 0.02, 0.08);
        const leftWing = new THREE.Mesh(leftWingGeo, wingMat);
        leftWing.position.set(0, 0.18, 0.06);
        leftWing.userData.isWing = true;
        leftWing.castShadow = true;
        birdGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(leftWingGeo, wingMat);
        rightWing.position.set(0, 0.18, -0.06);
        rightWing.userData.isWing = true;
        rightWing.castShadow = true;
        birdGroup.add(rightWing);
        
        const tailGeo = new THREE.BoxGeometry(0.06, 0.01, 0.06);
        const tail = new THREE.Mesh(tailGeo, wingMat);
        tail.position.set(-0.1, 0.12, 0);
        birdGroup.add(tail);
        
        const legGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 4);
        const leftLeg = new THREE.Mesh(legGeo, footMat);
        leftLeg.position.set(0.03, 0.03, 0.02);
        birdGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, footMat);
        rightLeg.position.set(0.03, 0.03, -0.02);
        birdGroup.add(rightLeg);
        
        const footGeo = new THREE.BoxGeometry(0.04, 0.005, 0.03);
        const leftFoot = new THREE.Mesh(footGeo, footMat);
        leftFoot.position.set(0.03, 0.002, 0.02);
        birdGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeo, footMat);
        rightFoot.position.set(0.03, 0.002, -0.02);
        birdGroup.add(rightFoot);
        
        birdGroup.position.set(x, 0, z);
        birdGroup.rotation.y = rotation;
        birdGroup.userData = { 
            type: 'animal', 
            name: '小鸽子',
            walkSpeed: 0.01,
            wingOffset: Math.random() * Math.PI * 2,
            hopOffset: Math.random() * Math.PI * 2,
            animalType: 'pigeon'
        };
        
        this.buildAnimalSkeleton(birdGroup, 'pigeon');
        
        const bones = birdGroup.userData.bones;
        if (bones) {
            if (bones.head) {
                head.position.set(0, 0, 0);
                beak.position.set(0, -0.02, 0.08);
                eye.position.set(0.02, 0.02, 0.03);
                bones.head.add(head);
                bones.head.add(beak);
                bones.head.add(eye);
            }
            if (bones.body) {
                body.position.set(0, 0, 0);
                body.rotation.z = Math.PI / 2;
                bodyFront.position.set(0.05, 0, 0);
                bodyBack.position.set(-0.05, 0, 0);
                tail.position.set(-0.1, 0, 0);
                bones.body.add(body);
                bones.body.add(bodyFront);
                bones.body.add(bodyBack);
                bones.body.add(tail);
            }
            if (bones.leftWing && bones.rightWing) {
                leftWing.position.set(0, 0, 0);
                rightWing.position.set(0, 0, 0);
                leftWing.rotation.z = 0;
                rightWing.rotation.z = 0;
                bones.leftWing.add(leftWing);
                bones.rightWing.add(rightWing);
            }
            if (bones.leftLeg && bones.rightLeg) {
                leftLeg.position.set(0, 0, 0);
                rightLeg.position.set(0, 0, 0);
                leftFoot.position.set(0, -0.03, 0);
                rightFoot.position.set(0, -0.03, 0);
                bones.leftLeg.add(leftLeg);
                bones.leftLeg.add(leftFoot);
                bones.rightLeg.add(rightLeg);
                bones.rightLeg.add(rightFoot);
            }
        }
        
        return birdGroup;
    }

    createCharacters() {
        const characters = [
            { x: -5, z: 38, r: Math.PI, create: this.createElderlyMan.bind(this) },
            { x: 32, z: 28, r: -Math.PI / 2, create: this.createChild.bind(this) },
            { x: -10, z: 5, r: Math.PI / 4, create: this.createAuntie.bind(this) },
            { x: 15, z: -15, r: 0, create: this.createAuntie.bind(this) }
        ];
        
        characters.forEach(char => {
            const character = char.create(char.x, char.z, char.r);
            this.characters.push(character);
            this.scene.add(character);
        });
    }

    createAnimals() {
        const animals = [
            { x: -3, z: 37, r: Math.PI, create: this.createDog.bind(this) },
            { x: 10, z: -12, r: Math.PI / 2, create: this.createCat.bind(this) },
            { x: 5, z: -8, r: 0, create: this.createPigeon.bind(this) },
            { x: 8, z: -5, r: Math.PI, create: this.createPigeon.bind(this) },
            { x: 2, z: -10, r: -Math.PI / 4, create: this.createPigeon.bind(this) }
        ];
        
        animals.forEach(anim => {
            const animal = anim.create(anim.x, anim.z, anim.r);
            this.animals.push(animal);
            this.scene.add(animal);
        });
    }

    createSignboard(text, bgColor, textColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 256, 128);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 252, 124);
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createConvenienceStore(x, z, rotation = 0) {
        const shopGroup = new THREE.Group();
        
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x4ECDC4, roughness: 0.7 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.6 });
        const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1, 
            metalness: 0.3 
        });
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        
        const bodyGeo = new THREE.BoxGeometry(12, 4, 8);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 2;
        body.castShadow = true;
        body.receiveShadow = true;
        shopGroup.add(body);
        
        const roofGeo = new THREE.BoxGeometry(14, 0.5, 10);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4.25;
        roof.castShadow = true;
        shopGroup.add(roof);
        
        const windowGeo = new THREE.BoxGeometry(3, 2, 0.1);
        const windowPositions = [
            [-3.5, 2.5, 4.06], [0, 2.5, 4.06], [3.5, 2.5, 4.06],
            [-3.5, 2.5, -4.06], [0, 2.5, -4.06], [3.5, 2.5, -4.06]
        ];
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(pos[0], pos[1], pos[2]);
            shopGroup.add(window);
        });
        
        const doorGeo = new THREE.BoxGeometry(2, 3, 0.15);
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.5, 4.08);
        shopGroup.add(door);
        
        const signTexture = this.createSignboard('24h便利店', '#FF6B6B', '#FFFFFF');
        const signGeo = new THREE.PlaneGeometry(5, 2.5);
        const signMat = new THREE.MeshStandardMaterial({ 
            map: signTexture, 
            side: THREE.DoubleSide,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.2
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 5.5, 4.1);
        shopGroup.add(sign);
        
        const lightGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFAA,
            emissive: 0xFFFFAA,
            emissiveIntensity: 0.8
        });
        const light1 = new THREE.Mesh(lightGeo, lightMat);
        light1.position.set(-4, 4.5, 3.5);
        shopGroup.add(light1);
        const light2 = light1.clone();
        light2.position.set(4, 4.5, 3.5);
        shopGroup.add(light2);
        
        const pointLight1 = new THREE.PointLight(0xFFFACD, 0.6, 20);
        pointLight1.position.set(-4, 4, 3.5);
        shopGroup.add(pointLight1);
        const pointLight2 = pointLight1.clone();
        pointLight2.position.set(4, 4, 3.5);
        shopGroup.add(pointLight2);
        
        shopGroup.position.set(x, 0, z);
        shopGroup.rotation.y = rotation;
        shopGroup.userData = {
            type: 'shop',
            name: '24h便利店',
            description: '全天24小时营业，提供日用品、零食、饮料等',
            openTime: '00:00 - 24:00',
            category: '便利店'
        };
        return shopGroup;
    }

    createCoffeeShop(x, z, rotation = 0) {
        const shopGroup = new THREE.Group();
        
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 });
        const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0xB0E0E6, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1 
        });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.7 });
        
        const bodyGeo = new THREE.BoxGeometry(10, 3.5, 9);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 1.75;
        body.castShadow = true;
        body.receiveShadow = true;
        shopGroup.add(body);
        
        const roofGeo = new THREE.ConeGeometry(8, 2.5, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4.75;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        shopGroup.add(roof);
        
        const windowGeo = new THREE.BoxGeometry(2.5, 1.8, 0.1);
        const windowPositions = [
            [-2.5, 2.5, 4.56], [2.5, 2.5, 4.56],
            [-2.5, 2.5, -4.56], [2.5, 2.5, -4.56]
        ];
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(pos[0], pos[1], pos[2]);
            shopGroup.add(window);
        });
        
        const doorGeo = new THREE.BoxGeometry(1.8, 2.8, 0.15);
        const door = new THREE.Mesh(doorGeo, woodMat);
        door.position.set(0, 1.4, 4.58);
        shopGroup.add(door);
        
        const signTexture = this.createSignboard('咖啡屋', '#8B4513', '#FFD700');
        const signGeo = new THREE.PlaneGeometry(4, 2);
        const signMat = new THREE.MeshStandardMaterial({ 
            map: signTexture, 
            side: THREE.DoubleSide,
            emissive: 0xFFD700,
            emissiveIntensity: 0.15
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 5.8, 0);
        sign.rotation.y = Math.PI / 2;
        shopGroup.add(sign);
        
        const umbrellaGeo = new THREE.ConeGeometry(2, 0.8, 8);
        const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xFF6347, roughness: 0.6 });
        const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
        umbrella.position.set(-5, 3, 3);
        umbrella.castShadow = true;
        shopGroup.add(umbrella);
        
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(-5, 1.5, 3);
        shopGroup.add(pole);
        
        const umbrella2 = umbrella.clone();
        umbrella2.position.set(5, 3, 3);
        umbrella2.material.color.setHex(0x4169E1);
        shopGroup.add(umbrella2);
        const pole2 = pole.clone();
        pole2.position.set(5, 1.5, 3);
        shopGroup.add(pole2);
        
        shopGroup.position.set(x, 0, z);
        shopGroup.rotation.y = rotation;
        shopGroup.userData = {
            type: 'shop',
            name: '阳光咖啡屋',
            description: '提供精品咖啡、甜点、轻食，环境优雅舒适',
            openTime: '07:00 - 22:00',
            category: '咖啡厅'
        };
        return shopGroup;
    }

    createBookstore(x, z, rotation = 0) {
        const shopGroup = new THREE.Group();
        
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xFAEBD7, roughness: 0.7 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x2F4F4F, roughness: 0.6 });
        const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0xADD8E6, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1 
        });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        
        const bodyGeo = new THREE.BoxGeometry(11, 4.5, 8.5);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 2.25;
        body.castShadow = true;
        body.receiveShadow = true;
        shopGroup.add(body);
        
        const roofGeo = new THREE.BoxGeometry(13, 0.6, 10.5);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4.8;
        roof.castShadow = true;
        shopGroup.add(roof);
        
        const windowGeo = new THREE.BoxGeometry(2, 2.5, 0.1);
        const windowPositions = [
            [-3, 3, 4.31], [3, 3, 4.31],
            [-3, 3, -4.31], [3, 3, -4.31]
        ];
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(pos[0], pos[1], pos[2]);
            shopGroup.add(window);
        });
        
        const doorGeo = new THREE.BoxGeometry(2.2, 3.5, 0.15);
        const door = new THREE.Mesh(doorGeo, woodMat);
        door.position.set(0, 1.75, 4.33);
        shopGroup.add(door);
        
        const signTexture = this.createSignboard('书香阁', '#2F4F4F', '#FFD700');
        const signGeo = new THREE.PlaneGeometry(4.5, 2);
        const signMat = new THREE.MeshStandardMaterial({ 
            map: signTexture, 
            side: THREE.DoubleSide 
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 6, 4.35);
        shopGroup.add(sign);
        
        const bookshelfGeo = new THREE.BoxGeometry(0.8, 2.5, 0.3);
        const bookshelfMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const bookColors = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6, 0x1ABC9C];
        for (let i = 0; i < 3; i++) {
            const shelf = new THREE.Mesh(bookshelfGeo, bookshelfMat);
            shelf.position.set(-4.5 + i * 4.5, 2, 3.8);
            shopGroup.add(shelf);
            
            for (let j = 0; j < 6; j++) {
                const bookGeo = new THREE.BoxGeometry(0.1, 0.4, 0.25);
                const bookMat = new THREE.MeshStandardMaterial({ 
                    color: bookColors[(i + j) % bookColors.length] 
                });
                const book = new THREE.Mesh(bookGeo, bookMat);
                book.position.set(-4.5 + i * 4.5 - 0.2 + (j % 3) * 0.2, 1.2 + Math.floor(j / 3) * 0.8, 3.95);
                shopGroup.add(book);
            }
        }
        
        shopGroup.position.set(x, 0, z);
        shopGroup.rotation.y = rotation;
        shopGroup.userData = {
            type: 'shop',
            name: '书香阁书店',
            description: '各类图书、文具、文创产品，设有阅读区',
            openTime: '09:00 - 21:00',
            category: '书店'
        };
        return shopGroup;
    }

    createFlowerShop(x, z, rotation = 0) {
        const shopGroup = new THREE.Group();
        
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xFFE4E1, roughness: 0.7 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xFF69B4, roughness: 0.6 });
        const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0xE0FFFF, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1 
        });
        const pinkMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.7 });
        
        const bodyGeo = new THREE.BoxGeometry(9, 3.5, 7);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 1.75;
        body.castShadow = true;
        body.receiveShadow = true;
        shopGroup.add(body);
        
        const roofGeo = new THREE.ConeGeometry(7, 2, 6);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 4.5;
        roof.rotation.y = Math.PI / 6;
        roof.castShadow = true;
        shopGroup.add(roof);
        
        const windowGeo = new THREE.BoxGeometry(2.2, 1.6, 0.1);
        const windowPositions = [
            [-2, 2.5, 3.56], [2, 2.5, 3.56]
        ];
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(pos[0], pos[1], pos[2]);
            shopGroup.add(window);
        });
        
        const doorGeo = new THREE.BoxGeometry(1.6, 2.8, 0.15);
        const door = new THREE.Mesh(doorGeo, pinkMat);
        door.position.set(0, 1.4, 3.58);
        shopGroup.add(door);
        
        const signTexture = this.createSignboard('花语轩', '#FF69B4', '#FFFFFF');
        const signGeo = new THREE.PlaneGeometry(3.5, 1.8);
        const signMat = new THREE.MeshStandardMaterial({ 
            map: signTexture, 
            side: THREE.DoubleSide,
            emissive: 0xFF69B4,
            emissiveIntensity: 0.1
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 5.5, 3.6);
        shopGroup.add(sign);
        
        const flowerColors = [0xFF69B4, 0xFF6347, 0xFFD700, 0x9370DB, 0x00CED1, 0xFF1493];
        for (let i = 0; i < 8; i++) {
            const potGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.3, 8);
            const potMat = new THREE.MeshStandardMaterial({ color: 0xCD853F });
            const pot = new THREE.Mesh(potGeo, potMat);
            const angle = (i / 8) * Math.PI * 2;
            const radius = 5;
            pot.position.set(
                x + Math.cos(angle) * radius,
                0.15,
                z + Math.sin(angle) * radius
            );
            pot.castShadow = true;
            this.scene.add(pot);
            
            for (let j = 0; j < 5; j++) {
                const flowerGeo = new THREE.SphereGeometry(0.1, 8, 8);
                const flowerMat = new THREE.MeshStandardMaterial({ 
                    color: flowerColors[(i + j) % flowerColors.length],
                    emissive: flowerColors[(i + j) % flowerColors.length],
                    emissiveIntensity: 0.1
                });
                const flower = new THREE.Mesh(flowerGeo, flowerMat);
                flower.position.set(
                    x + Math.cos(angle) * radius + (Math.random() - 0.5) * 0.3,
                    0.5 + Math.random() * 0.3,
                    z + Math.sin(angle) * radius + (Math.random() - 0.5) * 0.3
                );
                this.scene.add(flower);
            }
        }
        
        shopGroup.position.set(x, 0, z);
        shopGroup.rotation.y = rotation;
        shopGroup.userData = {
            type: 'shop',
            name: '花语轩花店',
            description: '鲜花、花束、盆栽、园艺用品，承接花艺定制',
            openTime: '08:00 - 20:00',
            category: '花店'
        };
        return shopGroup;
    }

    createIceCreamShop(x, z, rotation = 0) {
        const shopGroup = new THREE.Group();
        
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xE0FFFF, roughness: 0.7 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB, roughness: 0.6 });
        const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0xADD8E6, 
            transparent: true, 
            opacity: 0.7, 
            roughness: 0.1 
        });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
        
        const bodyGeo = new THREE.BoxGeometry(8, 3, 7);
        const body = new THREE.Mesh(bodyGeo, wallMat);
        body.position.y = 1.5;
        body.castShadow = true;
        body.receiveShadow = true;
        shopGroup.add(body);
        
        const roofGeo = new THREE.SphereGeometry(5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 3;
        roof.castShadow = true;
        shopGroup.add(roof);
        
        const windowGeo = new THREE.BoxGeometry(2, 1.5, 0.1);
        const windowPositions = [
            [-1.8, 2.2, 3.56], [1.8, 2.2, 3.56]
        ];
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(pos[0], pos[1], pos[2]);
            shopGroup.add(window);
        });
        
        const doorGeo = new THREE.BoxGeometry(1.5, 2.4, 0.15);
        const door = new THREE.Mesh(doorGeo, whiteMat);
        door.position.set(0, 1.2, 3.58);
        shopGroup.add(door);
        
        const signTexture = this.createSignboard('冰淇淋店', '#87CEEB', '#FF69B4');
        const signGeo = new THREE.PlaneGeometry(3.5, 1.5);
        const signMat = new THREE.MeshStandardMaterial({ 
            map: signTexture, 
            side: THREE.DoubleSide 
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 6, 3.6);
        shopGroup.add(sign);
        
        const coneGeo = new THREE.ConeGeometry(0.3, 1, 8);
        const coneMat = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const iceCreamColors = [0xFF69B4, 0x8B4513, 0x90EE90, 0xFFFF00, 0xFF6347];
        
        for (let i = 0; i < 3; i++) {
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.set(-3 + i * 3, 5.5, 2);
            cone.rotation.x = Math.PI;
            shopGroup.add(cone);
            
            const scoopGeo = new THREE.SphereGeometry(0.35, 16, 16);
            const scoopMat = new THREE.MeshStandardMaterial({ 
                color: iceCreamColors[i],
                roughness: 0.4
            });
            const scoop = new THREE.Mesh(scoopGeo, scoopMat);
            scoop.position.set(-3 + i * 3, 5, 2);
            shopGroup.add(scoop);
        }
        
        shopGroup.position.set(x, 0, z);
        shopGroup.rotation.y = rotation;
        shopGroup.userData = {
            type: 'shop',
            name: '梦幻冰淇淋店',
            description: '各种口味冰淇淋、冷饮、甜品，夏日消暑好去处',
            openTime: '10:00 - 22:00',
            category: '甜品店'
        };
        return shopGroup;
    }

    createShops() {
        const shopConfigs = [
            { x: 95, z: 0, r: Math.PI, create: this.createConvenienceStore.bind(this) },
            { x: -95, z: 0, r: 0, create: this.createBookstore.bind(this) },
            { x: 0, z: 95, r: Math.PI, create: this.createCoffeeShop.bind(this) },
            { x: 0, z: -95, r: 0, create: this.createFlowerShop.bind(this) },
            { x: 75, z: 75, r: -Math.PI * 3 / 4, create: this.createIceCreamShop.bind(this) }
        ];
        
        shopConfigs.forEach(config => {
            const shop = config.create(config.x, config.z, config.r);
            this.shops.push(shop);
            this.scene.add(shop);
        });
    }

    createShopper(x, z, rotation = 0, type = 'adult') {
        const personGroup = new THREE.Group();
        
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFD5B5, roughness: 0.8 });
        
        let bodyColor, pantsColor, hairColor, heightScale;
        
        if (type === 'adult') {
            bodyColor = 0x3498DB;
            pantsColor = 0x2C3E50;
            hairColor = 0x2C1810;
            heightScale = 1;
        } else if (type === 'woman') {
            bodyColor = 0xE91E63;
            pantsColor = 0x8B4513;
            hairColor = 0x1C1C1C;
            heightScale = 0.95;
        } else if (type === 'teen') {
            bodyColor = 0x9C27B0;
            pantsColor = 0x34495E;
            hairColor = 0x4A235A;
            heightScale = 0.85;
        } else {
            bodyColor = 0xFF9800;
            pantsColor = 0x795548;
            hairColor = 0x2C1810;
            heightScale = 0.7;
        }
        
        const shirtMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
        const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x2C2C2C, roughness: 0.7 });
        
        const bodyGeo = new THREE.CylinderGeometry(0.22 * heightScale, 0.28 * heightScale, 0.75 * heightScale, 8);
        const body = new THREE.Mesh(bodyGeo, shirtMat);
        body.position.y = 1.0 * heightScale;
        body.castShadow = true;
        personGroup.add(body);
        
        const headGeo = new THREE.SphereGeometry(0.2 * heightScale, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.65 * heightScale;
        head.castShadow = true;
        personGroup.add(head);
        
        const hairGeo = new THREE.SphereGeometry(0.21 * heightScale, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.72 * heightScale;
        personGroup.add(hair);
        
        if (type === 'woman') {
            const bunGeo = new THREE.SphereGeometry(0.1 * heightScale, 12, 12);
            const bun = new THREE.Mesh(bunGeo, hairMat);
            bun.position.set(0, 1.85 * heightScale, -0.1 * heightScale);
            personGroup.add(bun);
        }
        
        const legGeo = new THREE.CylinderGeometry(0.07 * heightScale, 0.08 * heightScale, 0.55 * heightScale, 8);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.12 * heightScale, 0.38 * heightScale, 0);
        leftLeg.castShadow = true;
        personGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.12 * heightScale, 0.38 * heightScale, 0);
        rightLeg.castShadow = true;
        personGroup.add(rightLeg);
        
        const shoeGeo = new THREE.BoxGeometry(0.11 * heightScale, 0.05 * heightScale, 0.18 * heightScale);
        const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
        leftShoe.position.set(-0.12 * heightScale, 0.05 * heightScale, 0.02 * heightScale);
        leftShoe.castShadow = true;
        personGroup.add(leftShoe);
        
        const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
        rightShoe.position.set(0.12 * heightScale, 0.05 * heightScale, 0.02 * heightScale);
        rightShoe.castShadow = true;
        personGroup.add(rightShoe);
        
        const armGeo = new THREE.CylinderGeometry(0.05 * heightScale, 0.045 * heightScale, 0.5 * heightScale, 8);
        const leftArm = new THREE.Mesh(armGeo, shirtMat);
        leftArm.position.set(-0.3 * heightScale, 1.1 * heightScale, 0);
        leftArm.rotation.z = 0.2;
        leftArm.castShadow = true;
        personGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeo, shirtMat);
        rightArm.position.set(0.3 * heightScale, 1.1 * heightScale, 0);
        rightArm.rotation.z = -0.2;
        rightArm.castShadow = true;
        personGroup.add(rightArm);
        
        if (type === 'woman' || type === 'adult') {
            const bagGeo = new THREE.BoxGeometry(0.2 * heightScale, 0.25 * heightScale, 0.1 * heightScale);
            const bagMat = new THREE.MeshStandardMaterial({ color: 0xE67E22, roughness: 0.6 });
            const bag = new THREE.Mesh(bagGeo, bagMat);
            bag.position.set(-0.4 * heightScale, 0.8 * heightScale, 0);
            bag.castShadow = true;
            personGroup.add(bag);
        }
        
        if (type === 'child') {
            const balloonGeo = new THREE.SphereGeometry(0.15 * heightScale, 16, 16);
            const balloonMat = new THREE.MeshStandardMaterial({ 
                color: 0xFF69B4, 
                emissive: 0xFF69B4,
                emissiveIntensity: 0.1,
                roughness: 0.3
            });
            const balloon = new THREE.Mesh(balloonGeo, balloonMat);
            balloon.position.set(0.3 * heightScale, 2.1 * heightScale, 0);
            balloon.castShadow = true;
            personGroup.add(balloon);
            
            const stringGeo = new THREE.CylinderGeometry(0.005 * heightScale, 0.005 * heightScale, 0.5 * heightScale, 4);
            const stringMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const string = new THREE.Mesh(stringGeo, stringMat);
            string.position.set(0.28 * heightScale, 1.75 * heightScale, 0);
            personGroup.add(string);
        }
        
        personGroup.position.set(x, 0, z);
        personGroup.rotation.y = rotation;
        personGroup.userData = { 
            type: 'customer', 
            name: type === 'adult' ? '张先生' : type === 'woman' ? '李女士' : type === 'teen' ? '小王' : '小朋友',
            walkSpeed: 0.015 + Math.random() * 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            customerType: type,
            targetShop: null,
            waitTime: 0
        };
        return personGroup;
    }

    createCustomers() {
        const customerTypes = ['adult', 'woman', 'teen', 'child'];
        const customerConfigs = [];
        
        const shopPositions = [
            { x: 88, z: 0, r: Math.PI },
            { x: -88, z: 0, r: 0 },
            { x: 0, z: 88, r: Math.PI },
            { x: 0, z: -88, r: 0 },
            { x: 70, z: 70, r: -Math.PI * 3 / 4 }
        ];
        
        shopPositions.forEach(pos => {
            for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * 15;
                const offsetZ = (Math.random() - 0.5) * 15;
                customerConfigs.push({
                    x: pos.x + offsetX,
                    z: pos.z + offsetZ,
                    r: pos.r + (Math.random() - 0.5) * 0.5,
                    type: customerTypes[Math.floor(Math.random() * customerTypes.length)]
                });
            }
        });
        
        for (let i = 0; i < 5; i++) {
            customerConfigs.push({
                x: (Math.random() - 0.5) * 180,
                z: (Math.random() - 0.5) * 180,
                r: Math.random() * Math.PI * 2,
                type: customerTypes[Math.floor(Math.random() * customerTypes.length)]
            });
        }
        
        customerConfigs.forEach(config => {
            const customer = this.createShopper(config.x, config.z, config.r, config.type);
            this.customers.push(customer);
            this.scene.add(customer);
        });
    }

    setCameraView(viewName) {
        this.currentView = viewName;
        
        const views = {
            aerial: { pos: new THREE.Vector3(80, 100, 80), target: new THREE.Vector3(0, 0, 0) },
            landscape: { pos: new THREE.Vector3(15, 8, 25), target: new THREE.Vector3(0, 2, 0) },
            facility: { pos: new THREE.Vector3(-8, 3, 8), target: new THREE.Vector3(-20, 1, 5) },
            playground: { pos: new THREE.Vector3(40, 8, 35), target: new THREE.Vector3(30, 2, 25) },
            shops: { pos: new THREE.Vector3(120, 70, 120), target: new THREE.Vector3(0, 0, 0) },
            convenience: { pos: new THREE.Vector3(110, 15, 5), target: new THREE.Vector3(95, 3, 0) },
            coffee: { pos: new THREE.Vector3(5, 15, 110), target: new THREE.Vector3(0, 3, 95) },
            bookstore: { pos: new THREE.Vector3(-110, 15, 5), target: new THREE.Vector3(-95, 3, 0) },
            flower: { pos: new THREE.Vector3(5, 15, -110), target: new THREE.Vector3(0, 3, -95) },
            icecream: { pos: new THREE.Vector3(90, 15, 90), target: new THREE.Vector3(75, 3, 75) },
            free: { pos: new THREE.Vector3(50, 30, 50), target: new THREE.Vector3(0, 5, 0) }
        };
        
        const view = views[viewName] || views.aerial;
        
        if (!this.controls) {
            this.camera.position.copy(view.pos);
            this.camera.lookAt(view.target);
            return;
        }
        
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const endPos = view.pos;
        const endTarget = view.target;
        
        const duration = 1000;
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPos, endPos, eased);
            if (this.controls) {
                this.controls.target.lerpVectors(startTarget, endTarget, eased);
                this.controls.update();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }

    updateTimeOfDay(hour) {
        const t = (hour - 6) / 12;
        
        const sunAngle = t * Math.PI;
        const sunHeight = Math.sin(sunAngle) * 80 + 10;
        const sunDist = Math.cos(sunAngle) * 60;
        
        this.sunLight.position.set(sunDist, sunHeight, 30);
        
        if (hour < 8 || hour > 17) {
            this.sunLight.intensity = 0.5;
            this.ambientLight.intensity = 0.3;
            this.scene.background = new THREE.Color(0x4A6FA5);
            this.scene.fog.color.setHex(0x4A6FA5);
        } else if (hour < 10 || hour > 15) {
            this.sunLight.intensity = 0.9;
            this.ambientLight.intensity = 0.45;
            this.scene.background = new THREE.Color(0x9FC5E8);
            this.scene.fog.color.setHex(0x9FC5E8);
        } else {
            this.sunLight.intensity = 1.2;
            this.ambientLight.intensity = 0.5;
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog.color.setHex(0x87CEEB);
        }
        
        if (hour < 7 || hour > 18) {
            this.sunLight.color.setHex(0xFF8C69);
        } else {
            this.sunLight.color.setHex(0xFFF5E6);
        }
    }

    exportHighResImage() {
        const exportWidth = 3000;
        const exportHeight = 2000;
        
        const originalSize = {
            width: this.renderer.getSize().width,
            height: this.renderer.getSize().height
        };
        const originalPixelRatio = this.renderer.getPixelRatio();
        
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(exportWidth, exportHeight, false);
        this.camera.aspect = exportWidth / exportHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.render(this.scene, this.camera);
        
        const dataURL = this.renderer.domElement.toDataURL('image/png', 1.0);
        
        this.renderer.setPixelRatio(originalPixelRatio);
        this.renderer.setSize(originalSize.width, originalSize.height);
        this.camera.aspect = originalSize.width / originalSize.height;
        this.camera.updateProjectionMatrix();
        
        const link = document.createElement('a');
        link.download = `公园3D效果图_${this.currentView}_${new Date().toLocaleDateString()}.png`;
        link.href = dataURL;
        link.click();
    }

    createInfoPopup() {
        const popup = document.createElement('div');
        popup.id = 'shop-info-popup';
        popup.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.98);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: none;
            max-width: 320px;
            pointer-events: auto;
        `;
        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 id="popup-title" style="margin: 0; color: #2c5530; font-size: 18px;">商铺名称</h3>
                <button id="popup-close" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #666; padding: 0 5px;">×</button>
            </div>
            <div id="popup-category" style="display: inline-block; background: #4a7c59; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 12px;">类别</div>
            <p id="popup-description" style="margin: 0 0 12px 0; color: #555; line-height: 1.6; font-size: 14px;">描述内容</p>
            <div style="display: flex; align-items: center; gap: 8px; color: #666; font-size: 13px;">
                <span>🕐</span>
                <span id="popup-time">营业时间: 00:00 - 24:00</span>
            </div>
        `;
        document.body.appendChild(popup);
        
        popup.querySelector('#popup-close').addEventListener('click', () => {
            popup.style.display = 'none';
        });
        
        return popup;
    }

    showShopInfo(shop, event) {
        const data = shop.userData;
        
        if (!this.infoPopup) {
            this.infoPopup = this.createInfoPopup();
        }
        
        this.infoPopup.querySelector('#popup-title').textContent = data.name;
        this.infoPopup.querySelector('#popup-category').textContent = data.category;
        this.infoPopup.querySelector('#popup-description').textContent = data.description;
        this.infoPopup.querySelector('#popup-time').textContent = `营业时间: ${data.openTime}`;
        
        this.infoPopup.style.left = `${event.clientX + 15}px`;
        this.infoPopup.style.top = `${event.clientY + 15}px`;
        this.infoPopup.style.display = 'block';
        
        setTimeout(() => {
            const rect = this.infoPopup.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                this.infoPopup.style.left = `${event.clientX - rect.width - 15}px`;
            }
            if (rect.bottom > window.innerHeight) {
                this.infoPopup.style.top = `${event.clientY - rect.height - 15}px`;
            }
        }, 10);
    }

    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const allMeshes = [];
        this.shops.forEach(shop => {
            shop.traverse((child) => {
                if (child.isMesh) {
                    allMeshes.push(child);
                }
            });
        });
        
        const intersects = this.raycaster.intersectObjects(allMeshes);
        
        if (intersects.length > 0) {
            let clickedShop = null;
            let obj = intersects[0].object;
            
            while (obj && !clickedShop) {
                if (obj.userData && obj.userData.type === 'shop') {
                    clickedShop = obj;
                }
                obj = obj.parent;
            }
            
            if (clickedShop) {
                this.showShopInfo(clickedShop, event);
            } else if (this.infoPopup) {
                this.infoPopup.style.display = 'none';
            }
        } else if (this.infoPopup) {
            this.infoPopup.style.display = 'none';
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setCameraView(e.target.dataset.view);
            });
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportHighResImage();
        });
        
        const timeSlider = document.getElementById('time-slider');
        const timeValue = document.getElementById('time-value');
        
        timeSlider.addEventListener('input', (e) => {
            const hour = parseFloat(e.target.value);
            const hours = Math.floor(hour);
            const minutes = Math.floor((hour - hours) * 60);
            timeValue.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            this.updateTimeOfDay(hour);
        });
        
        this.renderer.domElement.addEventListener('click', (e) => {
            this.onMouseClick(e);
        });
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Tab') {
                e.preventDefault();
                this.switchControlledCharacter();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        if (this.characters.length > 0) {
            this.controlledCharacter = this.characters[1];
            console.log('🎮 键盘控制已启用，按WASD移动角色，Tab切换角色');
        }
    }

    switchControlledCharacter() {
        const allControllables = [...this.characters, ...this.animals];
        if (allControllables.length === 0) return;
        
        const currentIndex = allControllables.indexOf(this.controlledCharacter);
        const nextIndex = (currentIndex + 1) % allControllables.length;
        this.controlledCharacter = allControllables[nextIndex];
        
        const name = this.controlledCharacter.userData.name || '未知角色';
        console.log(`🎯 已切换控制: ${name}`);
    }

    createAnimationStateMachine() {
        return {
            currentState: 'idle',
            previousState: 'idle',
            currentDirection: 'forward',
            blendWeight: 1,
            blendSpeed: 5,
            stateTime: 0,
            moveSpeed: 0,
            targetMoveSpeed: 0,
            
            setState(newState, direction = 'forward') {
                if (this.currentState !== newState) {
                    this.previousState = this.currentState;
                    this.currentState = newState;
                    this.blendWeight = 0;
                    this.stateTime = 0;
                }
                this.currentDirection = direction;
            },
            
            update(delta, isMoving, moveDirection) {
                this.stateTime += delta;
                this.blendWeight = Math.min(1, this.blendWeight + delta * this.blendSpeed);
                
                this.targetMoveSpeed = isMoving ? (this.currentState === 'run' ? 1 : 0.5) : 0;
                this.moveSpeed += (this.targetMoveSpeed - this.moveSpeed) * delta * 8;
                
                if (isMoving && moveDirection) {
                    this.currentDirection = moveDirection;
                    if (this.currentState === 'idle') {
                        this.setState('walk', moveDirection);
                    }
                } else if (!isMoving && this.currentState !== 'idle' && this.currentState !== 'rest') {
                    this.setState('idle');
                }
            },
            
            getBlendedValue(prevValue, currValue) {
                return prevValue * (1 - this.blendWeight) + currValue * this.blendWeight;
            }
        };
    }

    createSkeletonBone(name, position, rotation) {
        const bone = new THREE.Group();
        bone.name = name;
        bone.position.copy(position || new THREE.Vector3());
        if (rotation) bone.rotation.set(rotation.x, rotation.y, rotation.z);
        bone.userData.isBone = true;
        return bone;
    }

    buildCharacterSkeleton(personGroup, characterType) {
        const bones = {};
        
        bones.hips = this.createSkeletonBone('hips', new THREE.Vector3(0, 0.5, 0));
        personGroup.add(bones.hips);
        
        bones.spine = this.createSkeletonBone('spine', new THREE.Vector3(0, 0.35, 0));
        bones.hips.add(bones.spine);
        
        bones.chest = this.createSkeletonBone('chest', new THREE.Vector3(0, 0.25, 0));
        bones.spine.add(bones.chest);
        
        bones.neck = this.createSkeletonBone('neck', new THREE.Vector3(0, 0.15, 0));
        bones.chest.add(bones.neck);
        
        bones.head = this.createSkeletonBone('head', new THREE.Vector3(0, 0.2, 0));
        bones.neck.add(bones.head);
        
        bones.leftShoulder = this.createSkeletonBone('leftShoulder', new THREE.Vector3(-0.25, 0, 0));
        bones.chest.add(bones.leftShoulder);
        
        bones.leftArm = this.createSkeletonBone('leftArm', new THREE.Vector3(0, -0.2, 0));
        bones.leftShoulder.add(bones.leftArm);
        
        bones.leftForearm = this.createSkeletonBone('leftForearm', new THREE.Vector3(0, -0.2, 0));
        bones.leftArm.add(bones.leftForearm);
        
        bones.rightShoulder = this.createSkeletonBone('rightShoulder', new THREE.Vector3(0.25, 0, 0));
        bones.chest.add(bones.rightShoulder);
        
        bones.rightArm = this.createSkeletonBone('rightArm', new THREE.Vector3(0, -0.2, 0));
        bones.rightShoulder.add(bones.rightArm);
        
        bones.rightForearm = this.createSkeletonBone('rightForearm', new THREE.Vector3(0, -0.2, 0));
        bones.rightArm.add(bones.rightForearm);
        
        bones.leftHip = this.createSkeletonBone('leftHip', new THREE.Vector3(-0.12, 0, 0));
        bones.hips.add(bones.leftHip);
        
        bones.leftLeg = this.createSkeletonBone('leftLeg', new THREE.Vector3(0, -0.3, 0));
        bones.leftHip.add(bones.leftLeg);
        
        bones.leftCalf = this.createSkeletonBone('leftCalf', new THREE.Vector3(0, -0.3, 0));
        bones.leftLeg.add(bones.leftCalf);
        
        bones.rightHip = this.createSkeletonBone('rightHip', new THREE.Vector3(0.12, 0, 0));
        bones.hips.add(bones.rightHip);
        
        bones.rightLeg = this.createSkeletonBone('rightLeg', new THREE.Vector3(0, -0.3, 0));
        bones.rightHip.add(bones.rightLeg);
        
        bones.rightCalf = this.createSkeletonBone('rightCalf', new THREE.Vector3(0, -0.3, 0));
        bones.rightLeg.add(bones.rightCalf);
        
        personGroup.userData.bones = bones;
        personGroup.userData.animationState = this.createAnimationStateMachine();
        
        return bones;
    }

    buildAnimalSkeleton(animalGroup, animalType) {
        const bones = {};
        
        if (animalType === 'dog' || animalType === 'cat') {
            bones.hips = this.createSkeletonBone('hips', new THREE.Vector3(0, 0.3, 0));
            animalGroup.add(bones.hips);
            
            bones.spine1 = this.createSkeletonBone('spine1', new THREE.Vector3(0, 0.05, 0.1));
            bones.hips.add(bones.spine1);
            
            bones.spine2 = this.createSkeletonBone('spine2', new THREE.Vector3(0, 0.05, 0.15));
            bones.spine1.add(bones.spine2);
            
            bones.chest = this.createSkeletonBone('chest', new THREE.Vector3(0, 0.05, 0.15));
            bones.spine2.add(bones.chest);
            
            bones.neck = this.createSkeletonBone('neck', new THREE.Vector3(0, 0.1, 0.1));
            bones.chest.add(bones.neck);
            
            bones.head = this.createSkeletonBone('head', new THREE.Vector3(0, 0.1, 0.1));
            bones.neck.add(bones.head);
            
            bones.tail1 = this.createSkeletonBone('tail1', new THREE.Vector3(0, 0, -0.1));
            bones.hips.add(bones.tail1);
            
            bones.tail2 = this.createSkeletonBone('tail2', new THREE.Vector3(0, 0.02, -0.1));
            bones.tail1.add(bones.tail2);
            
            bones.tail3 = this.createSkeletonBone('tail3', new THREE.Vector3(0, 0.03, -0.08));
            bones.tail2.add(bones.tail3);
            
            bones.leftFrontShoulder = this.createSkeletonBone('leftFrontShoulder', new THREE.Vector3(-0.1, 0, 0.2));
            bones.chest.add(bones.leftFrontShoulder);
            
            bones.leftFrontLeg = this.createSkeletonBone('leftFrontLeg', new THREE.Vector3(0, -0.15, 0));
            bones.leftFrontShoulder.add(bones.leftFrontLeg);
            
            bones.leftFrontPaw = this.createSkeletonBone('leftFrontPaw', new THREE.Vector3(0, -0.15, 0));
            bones.leftFrontLeg.add(bones.leftFrontPaw);
            
            bones.rightFrontShoulder = this.createSkeletonBone('rightFrontShoulder', new THREE.Vector3(0.1, 0, 0.2));
            bones.chest.add(bones.rightFrontShoulder);
            
            bones.rightFrontLeg = this.createSkeletonBone('rightFrontLeg', new THREE.Vector3(0, -0.15, 0));
            bones.rightFrontShoulder.add(bones.rightFrontLeg);
            
            bones.rightFrontPaw = this.createSkeletonBone('rightFrontPaw', new THREE.Vector3(0, -0.15, 0));
            bones.rightFrontLeg.add(bones.rightFrontPaw);
            
            bones.leftBackHip = this.createSkeletonBone('leftBackHip', new THREE.Vector3(-0.1, 0, -0.05));
            bones.hips.add(bones.leftBackHip);
            
            bones.leftBackLeg = this.createSkeletonBone('leftBackLeg', new THREE.Vector3(0, -0.15, 0));
            bones.leftBackHip.add(bones.leftBackLeg);
            
            bones.leftBackPaw = this.createSkeletonBone('leftBackPaw', new THREE.Vector3(0, -0.15, 0));
            bones.leftBackLeg.add(bones.leftBackPaw);
            
            bones.rightBackHip = this.createSkeletonBone('rightBackHip', new THREE.Vector3(0.1, 0, -0.05));
            bones.hips.add(bones.rightBackHip);
            
            bones.rightBackLeg = this.createSkeletonBone('rightBackLeg', new THREE.Vector3(0, -0.15, 0));
            bones.rightBackHip.add(bones.rightBackLeg);
            
            bones.rightBackPaw = this.createSkeletonBone('rightBackPaw', new THREE.Vector3(0, -0.15, 0));
            bones.rightBackLeg.add(bones.rightBackPaw);
        } else if (animalType === 'pigeon') {
            bones.body = this.createSkeletonBone('body', new THREE.Vector3(0, 0.1, 0));
            animalGroup.add(bones.body);
            
            bones.neck = this.createSkeletonBone('neck', new THREE.Vector3(0, 0.05, 0.05));
            bones.body.add(bones.neck);
            
            bones.head = this.createSkeletonBone('head', new THREE.Vector3(0, 0.05, 0.05));
            bones.neck.add(bones.head);
            
            bones.leftWing = this.createSkeletonBone('leftWing', new THREE.Vector3(-0.08, 0, 0));
            bones.body.add(bones.leftWing);
            
            bones.leftWingTip = this.createSkeletonBone('leftWingTip', new THREE.Vector3(-0.12, 0, 0));
            bones.leftWing.add(bones.leftWingTip);
            
            bones.rightWing = this.createSkeletonBone('rightWing', new THREE.Vector3(0.08, 0, 0));
            bones.body.add(bones.rightWing);
            
            bones.rightWingTip = this.createSkeletonBone('rightWingTip', new THREE.Vector3(0.12, 0, 0));
            bones.rightWing.add(bones.rightWingTip);
            
            bones.tail = this.createSkeletonBone('tail', new THREE.Vector3(0, 0, -0.08));
            bones.body.add(bones.tail);
            
            bones.leftLeg = this.createSkeletonBone('leftLeg', new THREE.Vector3(-0.03, -0.05, 0));
            bones.body.add(bones.leftLeg);
            
            bones.rightLeg = this.createSkeletonBone('rightLeg', new THREE.Vector3(0.03, -0.05, 0));
            bones.body.add(bones.rightLeg);
        }
        
        animalGroup.userData.bones = bones;
        animalGroup.userData.animationState = this.createAnimationStateMachine();
        
        return bones;
    }

    attachMeshToBone(mesh, bone, offset) {
        mesh.position.copy(offset || new THREE.Vector3());
        bone.add(mesh);
    }

    animateHumanCharacter(character, time, delta) {
        const state = character.userData.animationState;
        const bones = character.userData.bones;
        
        if (!state || !bones) return;
        
        let isMoving = false;
        let moveDirection = 'forward';
        let moveX = 0;
        let moveZ = 0;
        
        if (character === this.controlledCharacter) {
            if (this.keys['KeyW']) { moveZ = -1; isMoving = true; moveDirection = 'forward'; }
            if (this.keys['KeyS']) { moveZ = 1; isMoving = true; moveDirection = 'backward'; }
            if (this.keys['KeyA']) { moveX = -1; isMoving = true; moveDirection = 'left'; }
            if (this.keys['KeyD']) { moveX = 1; isMoving = true; moveDirection = 'right'; }
            if (this.keys['ShiftLeft'] && isMoving) {
                state.setState('run', moveDirection);
            } else if (isMoving) {
                state.setState('walk', moveDirection);
            }
            
            if (moveX !== 0 || moveZ !== 0) {
                const angle = Math.atan2(moveX, moveZ);
                const targetRotation = angle;
                character.rotation.y += (targetRotation - character.rotation.y) * delta * 10;
                
                const speed = state.currentState === 'run' ? 3 : 1.5;
                character.position.x += Math.sin(targetRotation) * speed * delta;
                character.position.z += Math.cos(targetRotation) * speed * delta;
                
                character.position.x = Math.max(-this.PARK_SIZE / 2 + 2, Math.min(this.PARK_SIZE / 2 - 2, character.position.x));
                character.position.z = Math.max(-this.PARK_SIZE / 2 + 2, Math.min(this.PARK_SIZE / 2 - 2, character.position.z));
            }
        }
        
        state.update(delta, isMoving, moveDirection);
        
        const cycleSpeed = state.currentState === 'run' ? 12 : state.currentState === 'walk' ? 6 : 0;
        const cycle = time * cycleSpeed;
        const amplitude = state.currentState === 'run' ? 0.6 : state.currentState === 'walk' ? 0.4 : 0;
        
        const idleSway = Math.sin(time * 1.5) * 0.02;
        const idleBreath = Math.sin(time * 2) * 0.01;
        
        if (bones.hips) {
            const walkBob = Math.abs(Math.sin(cycle)) * amplitude * 0.1;
            bones.hips.position.y = 0.5 + idleSway + walkBob;
            bones.hips.rotation.z = Math.sin(cycle) * amplitude * 0.1;
        }
        
        if (bones.spine) {
            bones.spine.rotation.x = idleBreath;
        }
        
        if (bones.chest) {
            bones.chest.rotation.x = -idleBreath * 0.5;
        }
        
        if (bones.head) {
            bones.head.rotation.x = Math.sin(time * 1.2) * 0.03;
            bones.head.rotation.y = Math.sin(time * 0.8) * 0.02;
        }
        
        if (bones.leftArm && bones.rightArm) {
            const armSwing = Math.sin(cycle) * amplitude;
            bones.leftArm.rotation.x = state.currentState === 'idle' ? Math.sin(time * 2) * 0.1 : -armSwing;
            bones.rightArm.rotation.x = state.currentState === 'idle' ? -Math.sin(time * 2) * 0.1 : armSwing;
            
            if (bones.leftForearm) bones.leftForearm.rotation.x = state.currentState === 'idle' ? 0.2 : Math.abs(Math.sin(cycle)) * 0.3;
            if (bones.rightForearm) bones.rightForearm.rotation.x = state.currentState === 'idle' ? 0.2 : Math.abs(Math.sin(cycle + Math.PI)) * 0.3;
        }
        
        if (bones.leftLeg && bones.rightLeg) {
            const legSwing = Math.sin(cycle) * amplitude;
            bones.leftLeg.rotation.x = state.currentState === 'idle' ? 0 : legSwing;
            bones.rightLeg.rotation.x = state.currentState === 'idle' ? 0 : -legSwing;
            
            if (bones.leftCalf) bones.leftCalf.rotation.x = state.currentState === 'idle' ? 0 : Math.max(0, -Math.sin(cycle)) * 0.8;
            if (bones.rightCalf) bones.rightCalf.rotation.x = state.currentState === 'idle' ? 0 : Math.max(0, Math.sin(cycle)) * 0.8;
        }
    }

    animateDogCharacter(animal, time, delta) {
        const state = animal.userData.animationState;
        const bones = animal.userData.bones;
        
        if (!state || !bones) return;
        
        let isMoving = false;
        let moveDirection = 'forward';
        
        if (animal === this.controlledCharacter) {
            if (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD']) {
                isMoving = true;
            }
            if (this.keys['ShiftLeft'] && isMoving) {
                state.setState('run', moveDirection);
            } else if (isMoving) {
                state.setState('walk', moveDirection);
            }
        }
        
        if (!isMoving && Math.random() < 0.001) {
            if (state.currentState === 'idle') {
                state.setState('rest');
            } else if (state.currentState === 'rest' && Math.random() < 0.01) {
                state.setState('idle');
            }
        }
        
        state.update(delta, isMoving, moveDirection);
        
        const cycleSpeed = state.currentState === 'run' ? 15 : state.currentState === 'walk' ? 7 : 0;
        const cycle = time * cycleSpeed;
        const amplitude = state.currentState === 'run' ? 0.8 : state.currentState === 'walk' ? 0.5 : 0;
        
        if (bones.hips) {
            const walkBob = Math.abs(Math.sin(cycle)) * amplitude * 0.08;
            bones.hips.position.y = 0.3 + walkBob;
            bones.hips.rotation.z = Math.sin(cycle) * amplitude * 0.15;
        }
        
        if (bones.spine1 && bones.spine2) {
            bones.spine1.rotation.z = Math.sin(cycle) * amplitude * 0.1;
            bones.spine2.rotation.z = -Math.sin(cycle) * amplitude * 0.05;
        }
        
        if (bones.tail1 && bones.tail2 && bones.tail3) {
            const wagSpeed = state.currentState === 'run' ? 12 : state.currentState === 'walk' ? 8 : 4;
            const wagAmount = state.currentState === 'rest' ? 0.1 : 0.4;
            bones.tail1.rotation.y = Math.sin(time * wagSpeed) * wagAmount;
            bones.tail2.rotation.y = Math.sin(time * wagSpeed + 0.3) * wagAmount * 0.8;
            bones.tail3.rotation.y = Math.sin(time * wagSpeed + 0.6) * wagAmount * 0.6;
            
            if (state.currentState === 'rest') {
                bones.tail1.rotation.x = -0.5;
                bones.tail2.rotation.x = -0.3;
            } else {
                bones.tail1.rotation.x = 0;
                bones.tail2.rotation.x = 0;
            }
        }
        
        if (bones.head && bones.neck) {
            if (state.currentState === 'rest') {
                bones.neck.rotation.x = 0.3;
                bones.head.rotation.x = 0.2;
            } else {
                bones.neck.rotation.x = 0;
                bones.head.rotation.x = Math.sin(time * 1.5) * 0.05;
                bones.head.rotation.y = Math.sin(time) * 0.03;
            }
        }
        
        if (bones.leftFrontLeg && bones.rightFrontLeg && bones.leftBackLeg && bones.rightBackLeg) {
            const phase = state.currentState === 'run' ? 0 : Math.PI;
            bones.leftFrontLeg.rotation.x = Math.sin(cycle) * amplitude;
            bones.rightFrontLeg.rotation.x = Math.sin(cycle + Math.PI) * amplitude;
            bones.leftBackLeg.rotation.x = Math.sin(cycle + phase) * amplitude;
            bones.rightBackLeg.rotation.x = Math.sin(cycle + phase + Math.PI) * amplitude;
            
            if (bones.leftFrontPaw) bones.leftFrontPaw.rotation.x = Math.max(0, -Math.sin(cycle)) * 0.3;
            if (bones.rightFrontPaw) bones.rightFrontPaw.rotation.x = Math.max(0, -Math.sin(cycle + Math.PI)) * 0.3;
            if (bones.leftBackPaw) bones.leftBackPaw.rotation.x = Math.max(0, -Math.sin(cycle + phase)) * 0.3;
            if (bones.rightBackPaw) bones.rightBackPaw.rotation.x = Math.max(0, -Math.sin(cycle + phase + Math.PI)) * 0.3;
        }
    }

    animateCatCharacter(animal, time, delta) {
        const state = animal.userData.animationState;
        const bones = animal.userData.bones;
        
        if (!state || !bones) return;
        
        let isMoving = false;
        
        if (animal === this.controlledCharacter) {
            if (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD']) {
                isMoving = true;
            }
        }
        
        if (!isMoving && Math.random() < 0.002) {
            if (state.currentState === 'idle') {
                state.setState('rest');
            } else if (state.currentState === 'rest' && Math.random() < 0.005) {
                state.setState('idle');
            }
        }
        
        state.update(delta, isMoving, 'forward');
        
        const cycleSpeed = state.currentState === 'walk' ? 5 : 0;
        const cycle = time * cycleSpeed;
        const amplitude = state.currentState === 'walk' ? 0.4 : 0;
        
        if (bones.hips) {
            const walkBob = Math.abs(Math.sin(cycle)) * amplitude * 0.06;
            bones.hips.position.y = 0.3 + walkBob;
            bones.hips.rotation.z = Math.sin(cycle) * amplitude * 0.1;
        }
        
        if (bones.spine1 && bones.spine2) {
            bones.spine1.rotation.x = Math.sin(time * 0.5) * 0.05;
            bones.spine2.rotation.x = -Math.sin(time * 0.5) * 0.03;
        }
        
        if (bones.tail1 && bones.tail2 && bones.tail3) {
            const tailSpeed = state.currentState === 'rest' ? 1 : state.currentState === 'walk' ? 3 : 2;
            const tailAmount = state.currentState === 'rest' ? 0.2 : 0.3;
            bones.tail1.rotation.y = Math.sin(time * tailSpeed) * tailAmount;
            bones.tail1.rotation.x = state.currentState === 'rest' ? 0.5 : 0;
            bones.tail2.rotation.y = Math.sin(time * tailSpeed + 0.5) * tailAmount * 0.8;
            bones.tail3.rotation.y = Math.sin(time * tailSpeed + 1) * tailAmount * 0.6;
        }
        
        if (bones.head && bones.neck) {
            if (state.currentState === 'rest') {
                bones.neck.rotation.x = 0.4;
                bones.head.rotation.x = 0.1;
                bones.head.rotation.y = Math.sin(time * 0.3) * 0.05;
            } else {
                bones.neck.rotation.x = 0;
                bones.head.rotation.x = Math.sin(time * 2) * 0.03;
            }
        }
        
        if (bones.leftFrontLeg && bones.rightFrontLeg && bones.leftBackLeg && bones.rightBackLeg) {
            bones.leftFrontLeg.rotation.x = Math.sin(cycle) * amplitude;
            bones.rightFrontLeg.rotation.x = Math.sin(cycle + Math.PI) * amplitude;
            bones.leftBackLeg.rotation.x = Math.sin(cycle + Math.PI * 0.8) * amplitude;
            bones.rightBackLeg.rotation.x = Math.sin(cycle + Math.PI * 1.8) * amplitude;
        }
    }

    animatePigeonCharacter(animal, time, delta) {
        const state = animal.userData.animationState;
        const bones = animal.userData.bones;
        
        if (!state || !bones) return;
        
        let isMoving = false;
        let isFlying = false;
        
        if (animal === this.controlledCharacter) {
            if (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD']) {
                isMoving = true;
            }
            if (this.keys['Space']) {
                isFlying = true;
                state.setState('fly');
            }
        }
        
        if (!isFlying && !isMoving && Math.random() < 0.005) {
            if (state.currentState === 'idle') {
                state.setState('rest');
            } else if (state.currentState === 'rest' && Math.random() < 0.02) {
                state.setState('idle');
            }
        }
        
        if (isFlying) {
            state.setState('fly');
        } else if (isMoving && state.currentState !== 'fly') {
            state.setState('walk');
        } else if (!isMoving && state.currentState === 'walk') {
            state.setState('idle');
        }
        
        state.update(delta, isMoving || isFlying, 'forward');
        
        if (state.currentState === 'fly') {
            animal.position.y = 2 + Math.sin(time * 2) * 0.5;
        } else {
            animal.position.y = 0;
        }
        
        if (bones.leftWing && bones.rightWing && bones.leftWingTip && bones.rightWingTip) {
            const wingSpeed = state.currentState === 'fly' ? 15 : state.currentState === 'walk' ? 3 : 1;
            const wingAmount = state.currentState === 'fly' ? 1.2 : state.currentState === 'walk' ? 0.2 : 0.05;
            
            bones.leftWing.rotation.z = Math.sin(time * wingSpeed) * wingAmount;
            bones.rightWing.rotation.z = -Math.sin(time * wingSpeed) * wingAmount;
            bones.leftWingTip.rotation.z = Math.sin(time * wingSpeed + 0.3) * wingAmount * 0.5;
            bones.rightWingTip.rotation.z = -Math.sin(time * wingSpeed + 0.3) * wingAmount * 0.5;
        }
        
        if (bones.body) {
            const bobSpeed = state.currentState === 'fly' ? 4 : state.currentState === 'walk' ? 6 : 1;
            bones.body.position.y = 0.1 + Math.sin(time * bobSpeed) * (state.currentState === 'fly' ? 0.05 : 0.02);
        }
        
        if (bones.head && bones.neck) {
            const headBob = state.currentState === 'walk' ? Math.sin(time * 8) * 0.03 : Math.sin(time * 2) * 0.01;
            bones.neck.position.y = 0.05 + headBob;
        }
        
        if (state.currentState === 'walk' && bones.leftLeg && bones.rightLeg) {
            const cycle = time * 8;
            bones.leftLeg.rotation.x = Math.sin(cycle) * 0.3;
            bones.rightLeg.rotation.x = Math.sin(cycle + Math.PI) * 0.3;
        }
    }

    animateCharacter(character, time) {
        const data = character.userData;
        const sway = Math.sin(time * 2 + data.swayOffset) * 0.02;
        
        character.position.y = sway;
        
        if (data.name === '小明') {
            const jump = Math.abs(Math.sin(time * 3 + data.jumpOffset)) * 0.05;
            character.position.y += jump;
            
            if (character.children[13]) {
                character.children[13].position.y = 1.8 + Math.sin(time * 2) * 0.1;
            }
        }
        
        const leftArm = character.children[8];
        const rightArm = character.children[9];
        if (leftArm) leftArm.rotation.z = 0.3 + Math.sin(time * 3 + data.swayOffset) * 0.2;
        if (rightArm) rightArm.rotation.z = -0.3 - Math.sin(time * 3 + data.swayOffset) * 0.2;
    }

    animateAnimal(animal, time) {
        const data = animal.userData;
        
        if (data.name === '小黄') {
            const tail = animal.children[15];
            if (tail) {
                tail.rotation.y = Math.sin(time * 5 + data.wagOffset) * 0.5;
            }
            animal.position.y = Math.sin(time * 2 + data.wagOffset) * 0.01;
        }
        
        if (data.name === '小花') {
            const tail = animal.children[22];
            if (tail) {
                tail.rotation.y = Math.sin(time * 1.5 + data.tailOffset) * 0.3;
            }
            animal.position.y = Math.sin(time * 1.2 + data.tailOffset) * 0.008;
        }
        
        if (data.name === '小鸽子') {
            const leftWing = animal.children[6];
            const rightWing = animal.children[7];
            if (leftWing) leftWing.rotation.z = Math.sin(time * 8 + data.wingOffset) * 0.4;
            if (rightWing) rightWing.rotation.z = -Math.sin(time * 8 + data.wingOffset) * 0.4;
            
            const hop = Math.abs(Math.sin(time * 4 + data.hopOffset)) * 0.02;
            animal.position.y = hop;
        }
    }

    animateShop(shop, time) {
        const data = shop.userData;
        
        shop.traverse((obj) => {
            if (obj instanceof THREE.PointLight) {
                obj.intensity = 0.5 + Math.sin(time * 1.5 + obj.position.x) * 0.2;
            }
        });
        
        if (data.name === '梦幻冰淇淋店') {
            const sign = shop.children.find(c => c.geometry && c.geometry.type === 'PlaneGeometry' && c.material.map);
            if (sign) {
                sign.material.emissiveIntensity = 0.1 + Math.sin(time * 2) * 0.1;
            }
        }
    }

    animateCustomer(customer, time) {
        const data = customer.userData;
        const sway = Math.sin(time * 2 + data.swayOffset) * 0.015;
        
        customer.position.y = sway;
        
        const leftArm = customer.children[8];
        const rightArm = customer.children[9];
        const leftLeg = customer.children[4];
        const rightLeg = customer.children[5];
        
        if (leftArm) leftArm.rotation.z = 0.2 + Math.sin(time * 3 + data.swayOffset) * 0.15;
        if (rightArm) rightArm.rotation.z = -0.2 - Math.sin(time * 3 + data.swayOffset) * 0.15;
        if (leftLeg) leftLeg.rotation.x = Math.sin(time * 3 + data.swayOffset) * 0.1;
        if (rightLeg) rightLeg.rotation.x = -Math.sin(time * 3 + data.swayOffset) * 0.1;
        
        if (data.customerType === 'child') {
            const balloon = customer.children.find(c => c.material && c.material.emissive && c.material.emissive.getHex() === 0xFF69B4);
            if (balloon) {
                balloon.position.y = 2.1 * 0.7 + Math.sin(time * 2 + data.swayOffset) * 0.1;
                balloon.position.x = 0.3 * 0.7 + Math.sin(time * 1.5 + data.swayOffset) * 0.05;
            }
        }
    }

    runAnimationTests() {
        console.log('🧪 开始动画系统测试...');
        
        console.log('📊 帧率测试: 当前FPS =', this.performanceMonitor.fps);
        console.log('⏱️  最大帧耗时:', this.performanceMonitor.maxFrameTime.toFixed(3), 'ms');
        
        let totalBones = 0;
        let animatedCharacters = 0;
        
        this.characters.forEach(char => {
            if (char.userData.bones) {
                animatedCharacters++;
                totalBones += Object.keys(char.userData.bones).length;
            }
        });
        
        this.animals.forEach(animal => {
            if (animal.userData.bones) {
                animatedCharacters++;
                totalBones += Object.keys(animal.userData.bones).length;
            }
        });
        
        console.log('🦴 骨骼系统:');
        console.log('   - 带动画的角色数:', animatedCharacters);
        console.log('   - 总骨骼数:', totalBones);
        
        console.log('🎬 动画状态机测试:');
        if (this.characters.length > 0 && this.characters[0].userData.animationState) {
            const state = this.characters[0].userData.animationState;
            console.log('   - 状态机存在: ✅');
            console.log('   - 当前状态:', state.currentState);
            console.log('   - 混合权重:', state.blendWeight.toFixed(2));
        }
        
        const fileSize = new Blob([JSON.stringify(this.characters) + JSON.stringify(this.animals)]).size;
        console.log('📦 角色数据大小:', (fileSize / 1024).toFixed(2), 'KB');
        console.log('✅ 动画系统测试完成!');
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const frameStartTime = performance.now();
        const time = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();
        
        this.performanceMonitor.frameCount++;
        if (time - this.performanceMonitor.lastFpsUpdate >= 1) {
            this.performanceMonitor.fps = this.performanceMonitor.frameCount;
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastFpsUpdate = time;
            
            if (time < 5) {
                console.log(`🎮 FPS: ${this.performanceMonitor.fps} | 控制角色: ${this.controlledCharacter?.userData?.name || '无'}`);
            }
        }
        
        this.scene.traverse((obj) => {
            if (obj instanceof THREE.PointLight && !obj.userData.isShopLight) {
                obj.intensity = 0.6 + Math.sin(time * 2 + obj.position.x) * 0.2;
            }
        });
        
        this.characters.forEach(char => {
            if (char.userData.bones && char.userData.animationState) {
                this.animateHumanCharacter(char, time, delta);
            } else {
                this.animateCharacter(char, time);
            }
        });
        
        this.animals.forEach(animal => {
            if (animal.userData.bones && animal.userData.animationState) {
                const animalType = animal.userData.animalType;
                if (animalType === 'dog') {
                    this.animateDogCharacter(animal, time, delta);
                } else if (animalType === 'cat') {
                    this.animateCatCharacter(animal, time, delta);
                } else if (animalType === 'pigeon') {
                    this.animatePigeonCharacter(animal, time, delta);
                }
            } else {
                this.animateAnimal(animal, time);
            }
        });
        
        this.shops.forEach(shop => {
            this.animateShop(shop, time);
        });
        
        this.customers.forEach(customer => {
            this.animateCustomer(customer, time);
        });
        
        if (this.trafficSystem) {
            this.trafficSystem.update(time, delta);
        }
        
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
        
        const frameEndTime = performance.now();
        const frameTime = frameEndTime - frameStartTime;
        this.performanceMonitor.animationFrameTime = frameTime;
        this.performanceMonitor.maxFrameTime = Math.max(this.performanceMonitor.maxFrameTime, frameTime);
    }
}

window.addEventListener('load', () => {
    const parkScene = new ParkScene();
    
    setTimeout(() => {
        if (parkScene.runAnimationTests) {
            parkScene.runAnimationTests();
        }
    }, 3000);
    
    window.parkScene = parkScene;
    console.log('💡 提示: 在控制台输入 parkScene.runAnimationTests() 运行动画测试');
    console.log('🎮 控制说明: WASD移动 | Shift奔跑 | Tab切换角色 | 空格(鸽子)飞行');
});
