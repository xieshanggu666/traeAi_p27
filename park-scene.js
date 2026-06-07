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
        
        this.PARK_SIZE = 120;
        this.GROUND_SIZE = 200;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLighting();
        this.createGround();
        this.createLandscape();
        this.createPaths();
        this.createFacilities();
        this.createLightingSystem();
        this.setupEventListeners();
        this.animate();
        
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
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
            ctx.fillStyle = `rgba(${Math.floor(green * 0.4}, ${green}, ${Math.floor(green * 0.2)}, ${Math.random() * 0.3 + 0.1})`;
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

    setCameraView(viewName) {
        this.currentView = viewName;
        
        const views = {
            aerial: { pos: new THREE.Vector3(80, 100, 80), target: new THREE.Vector3(0, 0, 0) },
            landscape: { pos: new THREE.Vector3(15, 8, 25), target: new THREE.Vector3(0, 2, 0) },
            facility: { pos: new THREE.Vector3(-8, 3, 8), target: new THREE.Vector3(-20, 1, 5) },
            playground: { pos: new THREE.Vector3(40, 8, 35), target: new THREE.Vector3(30, 2, 25) },
            free: { pos: new THREE.Vector3(50, 30, 50), target: new THREE.Vector3(0, 5, 0) }
        };
        
        const view = views[viewName] || views.aerial;
        
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
            this.controls.target.lerpVectors(startTarget, endTarget, eased);
            this.controls.update();
            
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
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        this.scene.traverse((obj) => {
            if (obj instanceof THREE.PointLight) {
                obj.intensity = 0.6 + Math.sin(time * 2 + obj.position.x) * 0.2;
            }
        });
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new ParkScene();
});
