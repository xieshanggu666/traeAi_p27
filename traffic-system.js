class TrafficSystem {
    constructor(scene, parkSize, groundSize) {
        this.scene = scene;
        this.PARK_SIZE = parkSize;
        this.GROUND_SIZE = groundSize;
        this.MAIN_ROAD_WIDTH = 8;
        this.SECONDARY_ROAD_WIDTH = 5;
        this.ROAD_OFFSET = 75;
        
        this.vehicles = [];
        this.trafficLights = [];
        this.roadNetwork = null;
        this.roadPaths = [];
    }

    createAsphaltTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 256, 256);
        
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const gray = Math.floor(Math.random() * 40) + 30;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${Math.random() * 0.3 + 0.1})`;
            ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createRoadMarking(isDashed = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, 256, 32);
        
        if (isDashed) {
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 8; i++) {
                ctx.fillRect(i * 32, 12, 20, 8);
            }
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 12, 256, 8);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createCrosswalk() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, 512, 128);
        
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 10; i++) {
            if (i % 2 === 0) {
                ctx.fillRect(i * 51.2, 0, 40, 128);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createRoadNetwork() {
        const roadGroup = new THREE.Group();
        this.roadNetwork = roadGroup;
        
        const asphaltTexture = this.createAsphaltTexture();
        asphaltTexture.repeat.set(4, 4);
        
        const roadMat = new THREE.MeshStandardMaterial({
            map: asphaltTexture,
            roughness: 0.95,
            metalness: 0.05
        });
        
        const centerMarkingMat = new THREE.MeshStandardMaterial({
            map: this.createRoadMarking(true),
            transparent: true,
            roughness: 0.8,
            depthWrite: false
        });
        
        const edgeMarkingMat = new THREE.MeshStandardMaterial({
            map: this.createRoadMarking(false),
            transparent: true,
            roughness: 0.8,
            depthWrite: false
        });
        
        const crosswalkMat = new THREE.MeshStandardMaterial({
            map: this.createCrosswalk(),
            transparent: true,
            roughness: 0.8,
            depthWrite: false
        });

        const offset = this.ROAD_OFFSET;
        const secondaryOffset = offset / 2;

        const createStraightRoad = (x, z, width, length, rotation) => {
            const roadGeo = new THREE.BoxGeometry(length, 0.4, width);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(x, 0.8, z);
            road.rotation.y = rotation;
            road.receiveShadow = true;
            roadGroup.add(road);
            
            if (width >= this.MAIN_ROAD_WIDTH) {
                const centerGeo = new THREE.PlaneGeometry(length, 0.15);
                const centerLine = new THREE.Mesh(centerGeo, centerMarkingMat);
                centerLine.position.set(x, 1.01, z);
                centerLine.rotation.x = -Math.PI / 2;
                centerLine.rotation.y = rotation;
                roadGroup.add(centerLine);
            }
            
            const edgeGeo = new THREE.PlaneGeometry(length, 0.08);
            const edge1 = new THREE.Mesh(edgeGeo, edgeMarkingMat);
            const edge2 = new THREE.Mesh(edgeGeo, edgeMarkingMat);
            
            if (rotation === 0) {
                edge1.position.set(x, 1.01, z + width / 2 - 0.1);
                edge2.position.set(x, 1.01, z - width / 2 + 0.1);
            } else {
                edge1.position.set(x + width / 2 - 0.1, 1.01, z);
                edge2.position.set(x - width / 2 + 0.1, 1.01, z);
            }
            edge1.rotation.x = -Math.PI / 2;
            edge2.rotation.x = -Math.PI / 2;
            edge1.rotation.y = rotation;
            edge2.rotation.y = rotation;
            roadGroup.add(edge1, edge2);
        };

        const createIntersection = (x, z, size) => {
            const intersectionGeo = new THREE.BoxGeometry(size, 0.4, size);
            const intersection = new THREE.Mesh(intersectionGeo, roadMat);
            intersection.position.set(x, 0.8, z);
            intersection.receiveShadow = true;
            roadGroup.add(intersection);
            
            const crosswalkGeo = new THREE.PlaneGeometry(6, 3);
            
            const positions = [
                { x: 0, z: size / 2 + 1.5, rot: 0 },
                { x: 0, z: -size / 2 - 1.5, rot: 0 },
                { x: size / 2 + 1.5, z: 0, rot: Math.PI / 2 },
                { x: -size / 2 - 1.5, z: 0, rot: Math.PI / 2 }
            ];
            
            positions.forEach(pos => {
                const crosswalk = new THREE.Mesh(crosswalkGeo, crosswalkMat);
                crosswalk.position.set(x + pos.x, 1.02, z + pos.z);
                crosswalk.rotation.x = -Math.PI / 2;
                crosswalk.rotation.y = pos.rot;
                roadGroup.add(crosswalk);
            });
        };

        const mainIntersectionSize = this.MAIN_ROAD_WIDTH + 4;
        const secIntersectionSize = this.SECONDARY_ROAD_WIDTH + 3;

        createStraightRoad(0, offset, this.MAIN_ROAD_WIDTH, offset * 2 + 10, 0);
        createStraightRoad(0, -offset, this.MAIN_ROAD_WIDTH, offset * 2 + 10, 0);
        createStraightRoad(offset, 0, this.MAIN_ROAD_WIDTH, offset * 2 + 10, Math.PI / 2);
        createStraightRoad(-offset, 0, this.MAIN_ROAD_WIDTH, offset * 2 + 10, Math.PI / 2);

        createIntersection(offset, offset, mainIntersectionSize);
        createIntersection(-offset, offset, mainIntersectionSize);
        createIntersection(offset, -offset, mainIntersectionSize);
        createIntersection(-offset, -offset, mainIntersectionSize);

        createStraightRoad(0, secondaryOffset, this.SECONDARY_ROAD_WIDTH, offset * 1.8, 0);
        createStraightRoad(0, -secondaryOffset, this.SECONDARY_ROAD_WIDTH, offset * 1.8, 0);
        createStraightRoad(secondaryOffset, 0, this.SECONDARY_ROAD_WIDTH, offset * 1.8, Math.PI / 2);
        createStraightRoad(-secondaryOffset, 0, this.SECONDARY_ROAD_WIDTH, offset * 1.8, Math.PI / 2);

        createIntersection(secondaryOffset, secondaryOffset, secIntersectionSize);
        createIntersection(-secondaryOffset, secondaryOffset, secIntersectionSize);
        createIntersection(secondaryOffset, -secondaryOffset, secIntersectionSize);
        createIntersection(-secondaryOffset, -secondaryOffset, secIntersectionSize);

        const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x8B8682, roughness: 0.95 });
        
        const createSidewalk = (x, z, w, l, rot) => {
            const sidewalkGeo = new THREE.BoxGeometry(l, 0.25, w);
            const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
            sidewalk.position.set(x, 0.725, z);
            sidewalk.rotation.y = rot;
            sidewalk.receiveShadow = true;
            roadGroup.add(sidewalk);
        };

        const sidewalkWidth = 3;
        createSidewalk(0, offset + this.MAIN_ROAD_WIDTH / 2 + sidewalkWidth / 2 + 0.5, sidewalkWidth, offset * 2 + 10, 0);
        createSidewalk(0, -offset - this.MAIN_ROAD_WIDTH / 2 - sidewalkWidth / 2 - 0.5, sidewalkWidth, offset * 2 + 10, 0);
        createSidewalk(offset + this.MAIN_ROAD_WIDTH / 2 + sidewalkWidth / 2 + 0.5, 0, sidewalkWidth, offset * 2 + 10, Math.PI / 2);
        createSidewalk(-offset - this.MAIN_ROAD_WIDTH / 2 - sidewalkWidth / 2 - 0.5, 0, sidewalkWidth, offset * 2 + 10, Math.PI / 2);

        this.scene.add(roadGroup);
        this.defineRoadPaths();
    }

    /**
     * 定义车辆行驶路径
     * 
     * 功能描述：
     * 创建4条环形行驶路径（外环顺时针、外环逆时针、内环顺时针、内环逆时针），
     * 确保所有车辆都在公园周边的公路上行驶，不会穿越公园区域。
     * 
     * 路径设计说明：
     * - 每条路径由一系列三维坐标点(Vector3)组成
     * - 路径点顺序决定了车辆行驶方向
     * - 转弯处设置平滑过渡点，避免直角转弯
     * - 使用模运算实现路径循环
     * 
     * 关键变量：
     * - offset: 主干道距离中心的偏移量(75单位)
     * - secondaryOffset: 次干道距离中心的偏移量(37.5单位)
     * - laneOffsetMain: 主干道车道偏移量(2单位)，用于区分双向车道
     * - laneOffsetSec: 次干道车道偏移量(1.5单位)
     * - turnRadius: 主干道转弯半径(6单位)
     * - turnRadiusSec: 次干道转弯半径(4单位)
     */
    defineRoadPaths() {
        const offset = this.ROAD_OFFSET;
        const secondaryOffset = offset / 2;
        const laneOffsetMain = 2;
        const laneOffsetSec = 1.5;
        const turnRadius = 6;
        const turnRadiusSec = 4;

        this.roadPaths = [
            {
                name: 'outer_ring_clockwise',
                points: [
                    new THREE.Vector3(offset + laneOffsetMain, 0, -offset + turnRadius),
                    new THREE.Vector3(offset + laneOffsetMain, 0, offset - turnRadius),
                    new THREE.Vector3(offset + turnRadius, 0, offset + laneOffsetMain),
                    new THREE.Vector3(-offset - turnRadius, 0, offset + laneOffsetMain),
                    new THREE.Vector3(-offset - laneOffsetMain, 0, offset - turnRadius),
                    new THREE.Vector3(-offset - laneOffsetMain, 0, -offset + turnRadius),
                    new THREE.Vector3(-offset - turnRadius, 0, -offset - laneOffsetMain),
                    new THREE.Vector3(offset + turnRadius, 0, -offset - laneOffsetMain),
                    new THREE.Vector3(offset + laneOffsetMain, 0, -offset + turnRadius)
                ],
                loop: true,
                connectTo: null
            },
            {
                name: 'outer_ring_counterclockwise',
                points: [
                    new THREE.Vector3(offset - turnRadius, 0, -offset - laneOffsetMain),
                    new THREE.Vector3(-offset + turnRadius, 0, -offset - laneOffsetMain),
                    new THREE.Vector3(-offset - laneOffsetMain, 0, -offset + turnRadius),
                    new THREE.Vector3(-offset - laneOffsetMain, 0, offset - turnRadius),
                    new THREE.Vector3(-offset + turnRadius, 0, offset + laneOffsetMain),
                    new THREE.Vector3(offset - turnRadius, 0, offset + laneOffsetMain),
                    new THREE.Vector3(offset + laneOffsetMain, 0, offset - turnRadius),
                    new THREE.Vector3(offset + laneOffsetMain, 0, -offset + turnRadius),
                    new THREE.Vector3(offset - turnRadius, 0, -offset - laneOffsetMain)
                ],
                loop: true,
                connectTo: null
            },
            {
                name: 'inner_ring_clockwise',
                points: [
                    new THREE.Vector3(secondaryOffset + laneOffsetSec, 0, -secondaryOffset + turnRadiusSec),
                    new THREE.Vector3(secondaryOffset + laneOffsetSec, 0, secondaryOffset - turnRadiusSec),
                    new THREE.Vector3(secondaryOffset + turnRadiusSec, 0, secondaryOffset + laneOffsetSec),
                    new THREE.Vector3(-secondaryOffset - turnRadiusSec, 0, secondaryOffset + laneOffsetSec),
                    new THREE.Vector3(-secondaryOffset - laneOffsetSec, 0, secondaryOffset - turnRadiusSec),
                    new THREE.Vector3(-secondaryOffset - laneOffsetSec, 0, -secondaryOffset + turnRadiusSec),
                    new THREE.Vector3(-secondaryOffset - turnRadiusSec, 0, -secondaryOffset - laneOffsetSec),
                    new THREE.Vector3(secondaryOffset + turnRadiusSec, 0, -secondaryOffset - laneOffsetSec),
                    new THREE.Vector3(secondaryOffset + laneOffsetSec, 0, -secondaryOffset + turnRadiusSec)
                ],
                loop: true,
                connectTo: null
            },
            {
                name: 'inner_ring_counterclockwise',
                points: [
                    new THREE.Vector3(secondaryOffset - turnRadiusSec, 0, -secondaryOffset - laneOffsetSec),
                    new THREE.Vector3(-secondaryOffset + turnRadiusSec, 0, -secondaryOffset - laneOffsetSec),
                    new THREE.Vector3(-secondaryOffset - laneOffsetSec, 0, -secondaryOffset + turnRadiusSec),
                    new THREE.Vector3(-secondaryOffset - laneOffsetSec, 0, secondaryOffset - turnRadiusSec),
                    new THREE.Vector3(-secondaryOffset + turnRadiusSec, 0, secondaryOffset + laneOffsetSec),
                    new THREE.Vector3(secondaryOffset - turnRadiusSec, 0, secondaryOffset + laneOffsetSec),
                    new THREE.Vector3(secondaryOffset + laneOffsetSec, 0, secondaryOffset - turnRadiusSec),
                    new THREE.Vector3(secondaryOffset + laneOffsetSec, 0, -secondaryOffset + turnRadiusSec),
                    new THREE.Vector3(secondaryOffset - turnRadiusSec, 0, -secondaryOffset - laneOffsetSec)
                ],
                loop: true,
                connectTo: null
            }
        ];
    }

    createTrafficLight(x, z, rotation, intersectionId) {
        const lightGroup = new THREE.Group();
        
        const poleMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.5,
            metalness: 0.7
        });
        
        const poleGeo = new THREE.CylinderGeometry(0.15, 0.2, 5, 8);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.5;
        pole.castShadow = true;
        lightGroup.add(pole);
        
        const armGeo = new THREE.BoxGeometry(2.5, 0.12, 0.12);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(1.25, 4.5, 0);
        arm.castShadow = true;
        lightGroup.add(arm);
        
        const housingGeo = new THREE.BoxGeometry(0.8, 2, 0.5);
        const housingMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.6
        });
        const housing = new THREE.Mesh(housingGeo, housingMat);
        housing.position.set(2.5, 4.5, 0);
        housing.castShadow = true;
        lightGroup.add(housing);
        
        const lightColors = [0xff0000, 0xffff00, 0x00ff00];
        const lightPositions = [0.7, 0, -0.7];
        
        const lights = [];
        lightPositions.forEach((ly, i) => {
            const lightGeo = new THREE.CircleGeometry(0.2, 16);
            const lightMat = new THREE.MeshStandardMaterial({
                color: lightColors[i],
                emissive: lightColors[i],
                emissiveIntensity: i === 0 ? 1 : 0.1,
                transparent: true,
                opacity: 0.95
            });
            const lightMesh = new THREE.Mesh(lightGeo, lightMat);
            lightMesh.position.set(2.5, 4.5 + ly, 0.26);
            lightMesh.userData = { colorIndex: i, isOn: i === 0 };
            lights.push(lightMesh);
            lightGroup.add(lightMesh);
        });
        
        const pedHousingGeo = new THREE.BoxGeometry(0.5, 0.8, 0.3);
        const pedHousing = new THREE.Mesh(pedHousingGeo, housingMat);
        pedHousing.position.set(0.3, 3.5, 0.25);
        pedHousing.castShadow = true;
        lightGroup.add(pedHousing);
        
        const pedLightGeo = new THREE.CircleGeometry(0.12, 12);
        const pedRedMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.95
        });
        const pedGreenMat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.95
        });
        
        const pedRed = new THREE.Mesh(pedLightGeo, pedRedMat);
        pedRed.position.set(0.3, 3.7, 0.41);
        pedRed.userData = { isRed: true, isOn: true };
        lightGroup.add(pedRed);
        
        const pedGreen = new THREE.Mesh(pedLightGeo, pedGreenMat);
        pedGreen.position.set(0.3, 3.3, 0.41);
        pedGreen.userData = { isRed: false, isOn: false };
        lightGroup.add(pedGreen);
        
        const countCanvas = document.createElement('canvas');
        countCanvas.width = 64;
        countCanvas.height = 32;
        const countCtx = countCanvas.getContext('2d');
        countCtx.fillStyle = '#000';
        countCtx.fillRect(0, 0, 64, 32);
        countCtx.fillStyle = '#ff0000';
        countCtx.font = 'bold 24px Arial';
        countCtx.textAlign = 'center';
        countCtx.fillText('30', 32, 24);
        
        const countTexture = new THREE.CanvasTexture(countCanvas);
        const countGeo = new THREE.PlaneGeometry(0.4, 0.2);
        const countMat = new THREE.MeshStandardMaterial({
            map: countTexture,
            transparent: true,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const countdown = new THREE.Mesh(countGeo, countMat);
        countdown.position.set(2.5, 3.2, 0.26);
        countdown.userData = { canvas: countCanvas, ctx: countCtx, texture: countTexture, value: 30 };
        lightGroup.add(countdown);
        
        lightGroup.position.set(x, 0, z);
        lightGroup.rotation.y = rotation;
        lightGroup.userData = {
            type: 'trafficLight',
            intersectionId: intersectionId,
            lights: lights,
            pedRed: pedRed,
            pedGreen: pedGreen,
            countdown: countdown.userData,
            currentState: 'red',
            timer: 0,
            phaseDuration: { red: 30, yellow: 3, green: 25 }
        };
        
        return lightGroup;
    }

    createTrafficLights() {
        const offset = this.ROAD_OFFSET;
        const secondaryOffset = offset / 2;
        
        const lightConfigs = [
            { x: offset + 4, z: offset + 4, rot: -Math.PI * 3 / 4, id: 0 },
            { x: -offset - 4, z: offset + 4, rot: -Math.PI / 4, id: 0 },
            { x: offset + 4, z: -offset - 4, rot: Math.PI * 3 / 4, id: 0 },
            { x: -offset - 4, z: -offset - 4, rot: Math.PI / 4, id: 0 },
            
            { x: secondaryOffset + 3, z: secondaryOffset + 3, rot: -Math.PI * 3 / 4, id: 1 },
            { x: -secondaryOffset - 3, z: secondaryOffset + 3, rot: -Math.PI / 4, id: 1 },
            { x: secondaryOffset + 3, z: -secondaryOffset - 3, rot: Math.PI * 3 / 4, id: 1 },
            { x: -secondaryOffset - 3, z: -secondaryOffset - 3, rot: Math.PI / 4, id: 1 }
        ];
        
        lightConfigs.forEach(config => {
            const light = this.createTrafficLight(config.x, config.z, config.rot, config.id);
            this.trafficLights.push(light);
            this.scene.add(light);
        });
    }

    /**
     * 创建车辆模型
     * 
     * 功能描述：
     * 根据指定类型和颜色创建3D车辆模型，包括轿车和公交车两种类型。
     * 模型包含车身、车窗、车轮、车灯等组件。
     * 
     * 重要注意：
     * 车辆模型的默认车头朝向为 +X 轴方向（前灯位于 x=1.01 位置）
     * 这一点在计算车辆旋转角度时必须考虑，需要加上 PI/2 的偏移量
     * 
     * @param {string} type - 车辆类型：'sedan'(轿车) 或 'bus'(公交车)
     * @param {number} color - 车身颜色，十六进制颜色值
     * @returns {THREE.Group} 包含车辆所有组件的Group对象
     * 
     * userData属性说明：
     * - type: 对象类型，固定为 'vehicle'
     * - vehicleType: 车辆具体类型
     * - wheels: 车轮Mesh数组，用于动画旋转
     * - baseSpeed: 基础行驶速度
     * - currentSpeed: 当前行驶速度
     * - pathIndex: 当前所在路径索引
     * - pathPointIndex: 当前路径点索引
     * - progress: 当前路段的行驶进度(0-1)
     * - currentPath: 当前行驶路径对象
     * - isWaiting: 是否在等待(红灯或前车)
     */
    createCar(type = 'sedan', color = 0xe74c3c) {
        const carGroup = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.7
        });
        
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.3
        });
        
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        });
        
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            roughness: 0.3,
            metalness: 0.8
        });
        
        let bodyGeo, body, cabinGeo, cabin;
        
        if (type === 'sedan') {
            bodyGeo = new THREE.BoxGeometry(2, 0.5, 0.9);
            body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.35;
            body.castShadow = true;
            carGroup.add(body);
            
            cabinGeo = new THREE.BoxGeometry(0.9, 0.4, 0.8);
            cabin = new THREE.Mesh(cabinGeo, glassMat);
            cabin.position.set(-0.1, 0.75, 0);
            cabin.castShadow = true;
            carGroup.add(cabin);
            
            const hoodGeo = new THREE.BoxGeometry(0.6, 0.15, 0.85);
            const hood = new THREE.Mesh(hoodGeo, bodyMat);
            hood.position.set(0.8, 0.45, 0);
            carGroup.add(hood);
            
            const trunkGeo = new THREE.BoxGeometry(0.4, 0.2, 0.85);
            const trunk = new THREE.Mesh(trunkGeo, bodyMat);
            trunk.position.set(-0.8, 0.5, 0);
            carGroup.add(trunk);
        } else if (type === 'bus') {
            bodyGeo = new THREE.BoxGeometry(5, 1.5, 1.4);
            body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 1;
            body.castShadow = true;
            carGroup.add(body);
            
            for (let i = 0; i < 4; i++) {
                const windowGeo = new THREE.BoxGeometry(0.8, 0.7, 0.05);
                const windowLeft = new THREE.Mesh(windowGeo, glassMat);
                const windowRight = new THREE.Mesh(windowGeo, glassMat);
                windowLeft.position.set(-1.5 + i * 1.2, 1.2, 0.73);
                windowRight.position.set(-1.5 + i * 1.2, 1.2, -0.73);
                carGroup.add(windowLeft, windowRight);
            }
            
            const frontGeo = new THREE.BoxGeometry(0.3, 1, 1.3);
            const front = new THREE.Mesh(frontGeo, glassMat);
            front.position.set(2.55, 1.1, 0);
            carGroup.add(front);
        }
        
        const wheelRadius = type === 'sedan' ? 0.2 : 0.35;
        const wheelWidth = type === 'sedan' ? 0.15 : 0.2;
        const wheelPositions = type === 'sedan' 
            ? [[0.6, 0.2, 0.5], [-0.6, 0.2, 0.5], [0.6, 0.2, -0.5], [-0.6, 0.2, -0.5]]
            : [[1.8, 0.35, 0.8], [-1.8, 0.35, 0.8], [1.8, 0.35, -0.8], [-1.8, 0.35, -0.8]];
        
        const wheels = [];
        wheelPositions.forEach(pos => {
            const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 12);
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.rotation.z = Math.PI / 2;
            wheel.castShadow = true;
            carGroup.add(wheel);
            
            const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 6);
            const rim = new THREE.Mesh(rimGeo, rimMat);
            rim.position.copy(wheel.position);
            rim.rotation.z = Math.PI / 2;
            carGroup.add(rim);
            
            wheels.push(wheel);
        });
        
        if (type === 'sedan') {
            const headlightGeo = new THREE.BoxGeometry(0.05, 0.12, 0.15);
            const headlightMat = new THREE.MeshStandardMaterial({
                color: 0xffffcc,
                emissive: 0xffffaa,
                emissiveIntensity: 0.3
            });
            const hl1 = new THREE.Mesh(headlightGeo, headlightMat);
            const hl2 = new THREE.Mesh(headlightGeo, headlightMat);
            hl1.position.set(1.01, 0.35, 0.25);
            hl2.position.set(1.01, 0.35, -0.25);
            carGroup.add(hl1, hl2);
            
            const taillightMat = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.2
            });
            const tl1 = new THREE.Mesh(headlightGeo, taillightMat);
            const tl2 = new THREE.Mesh(headlightGeo, taillightMat);
            tl1.position.set(-1.01, 0.35, 0.25);
            tl2.position.set(-1.01, 0.35, -0.25);
            carGroup.add(tl1, tl2);
        }
        
        carGroup.userData = {
            type: 'vehicle',
            vehicleType: type,
            wheels: wheels,
            baseSpeed: type === 'sedan' ? 0.06 : 0.04,
            currentSpeed: type === 'sedan' ? 0.06 : 0.04,
            pathIndex: 0,
            pathPointIndex: 0,
            progress: 0,
            currentPath: null,
            isWaiting: false
        };
        
        return carGroup;
    }

    /**
     * 创建并初始化所有车辆
     * 
     * 功能描述：
     * 根据配置创建多辆不同类型、不同颜色的车辆，分布在不同的行驶路径上。
     * 每辆车被放置在路径的指定位置，并根据行驶方向正确设置初始朝向。
     * 
     * 实现逻辑：
     * 1. 定义车辆配置数组，指定每辆车的路径、类型、颜色、初始位置
     * 2. 遍历配置创建每辆车
     * 3. 根据路径点计算初始位置和朝向
     * 4. 将车辆添加到场景和车辆管理数组中
     * 
     * 关键注意：
     * 车辆模型默认朝向为 +X 方向，而 Math.atan2(dir.x, dir.z) 计算的是
     * 从 +Z 方向开始的旋转角度。因此需要加上 Math.PI/2 偏移量，
     * 使车头正确指向运动方向。
     * 
     * 旋转角度公式推导：
     * - Three.js 中 rotation.y = 0 时，物体正面朝向 +Z 轴
     * - 我们的车辆模型正面朝向 +X 轴
     * - 因此需要额外旋转 90 度(PI/2)使车头与运动方向一致
     * - 最终公式：rotation.y = Math.atan2(dir.x, dir.z) + Math.PI / 2
     */
    createVehicles() {
        const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe91e63];
        
        const vehicleConfigs = [
            { pathIdx: 0, type: 'sedan', color: colors[0], pointIdx: 0, progress: 0.1 },
            { pathIdx: 0, type: 'sedan', color: colors[1], pointIdx: 2, progress: 0.3 },
            { pathIdx: 0, type: 'bus', color: 0xffd700, pointIdx: 5, progress: 0.5 },
            { pathIdx: 1, type: 'sedan', color: colors[2], pointIdx: 1, progress: 0.2 },
            { pathIdx: 1, type: 'sedan', color: colors[3], pointIdx: 4, progress: 0.6 },
            { pathIdx: 1, type: 'bus', color: 0x4169e1, pointIdx: 6, progress: 0.4 },
            { pathIdx: 2, type: 'sedan', color: colors[4], pointIdx: 0, progress: 0.2 },
            { pathIdx: 2, type: 'sedan', color: colors[5], pointIdx: 3, progress: 0.5 },
            { pathIdx: 3, type: 'sedan', color: colors[6], pointIdx: 1, progress: 0.3 },
            { pathIdx: 3, type: 'bus', color: 0x32cd32, pointIdx: 5, progress: 0.7 }
        ];
        
        vehicleConfigs.forEach(config => {
            const vehicle = this.createCar(config.type, config.color);
            const data = vehicle.userData;
            data.pathIndex = config.pathIdx;
            data.pathPointIndex = config.pointIdx;
            data.progress = config.progress;
            data.currentPath = this.roadPaths[config.pathIdx];
            
            const path = data.currentPath;
            const p1 = path.points[config.pointIdx];
            const p2 = path.points[(config.pointIdx + 1) % path.points.length];
            
            vehicle.position.lerpVectors(p1, p2, config.progress);
            vehicle.position.y = 1.0;
            
            const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
            vehicle.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI / 2;
            
            this.vehicles.push(vehicle);
            this.scene.add(vehicle);
        });
    }

    updateTrafficLights(time) {
        this.trafficLights.forEach((lightGroup, index) => {
            const data = lightGroup.userData;
            const phaseOffset = (data.intersectionId * 0.5 + (index % 2) * 0.5) % 1;
            const cycleTime = (time * 0.5 + phaseOffset * 58) % 58;
            
            let state, remaining;
            if (cycleTime < 30) {
                state = 'red';
                remaining = 30 - Math.floor(cycleTime);
            } else if (cycleTime < 33) {
                state = 'yellow';
                remaining = 33 - Math.floor(cycleTime);
            } else {
                state = 'green';
                remaining = 58 - Math.floor(cycleTime);
            }
            
            if (data.currentState !== state) {
                data.currentState = state;
                data.lights.forEach((light, i) => {
                    const isOn = (state === 'red' && i === 0) || 
                                 (state === 'yellow' && i === 1) || 
                                 (state === 'green' && i === 2);
                    light.material.emissiveIntensity = isOn ? 1 : 0.1;
                    light.userData.isOn = isOn;
                });
                
                const pedCanGo = state === 'green';
                data.pedRed.material.emissiveIntensity = pedCanGo ? 0.1 : 1;
                data.pedGreen.material.emissiveIntensity = pedCanGo ? 1 : 0.1;
                data.pedRed.userData.isOn = !pedCanGo;
                data.pedGreen.userData.isOn = pedCanGo;
            }
            
            if (data.countdown.value !== remaining) {
                data.countdown.value = remaining;
                const ctx = data.countdown.ctx;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 64, 32);
                ctx.fillStyle = state === 'red' ? '#ff0000' : state === 'yellow' ? '#ffff00' : '#00ff00';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(remaining.toString().padStart(2, '0'), 32, 24);
                data.countdown.texture.needsUpdate = true;
            }
        });
    }

    getTrafficLightStateNearPosition(x, z) {
        const threshold = 15;
        for (let light of this.trafficLights) {
            const dist = Math.sqrt(
                Math.pow(x - light.position.x, 2) +
                Math.pow(z - light.position.z, 2)
            );
            if (dist < threshold) {
                return light.userData.currentState;
            }
        }
        return 'green';
    }

    /**
     * 更新所有车辆的位置和状态
     * 
     * 功能描述：
     * 每帧调用，更新所有车辆的位置、速度、朝向。实现路径跟随、
     * 交通信号灯检测、前车避撞等核心车辆运动逻辑。
     * 
     * @param {number} time - 场景运行的总时间(秒)，用于动画同步
     * @param {number} delta - 距上一帧的时间间隔(秒)，用于帧率无关的运动计算
     * 
     * 运动轨迹算法实现逻辑：
     * 1. 路径点插值：车辆在相邻两个路径点之间线性插值移动
     *    - 使用 progress (0-1) 表示在当前路段上的位置
     *    - position = lerp(p1, p2, progress)
     * 
     * 2. 进度更新：根据车速和时间增量更新行驶进度
     *    - progress += speed * delta * 速度系数
     *    - 当 progress >= 1 时，切换到下一路段
     * 
     * 3. 朝向计算：根据路径方向计算车辆旋转角度
     *    - 方向向量 dir = p2 - p1
     *    - 基础旋转角 = atan2(dir.x, dir.z) (从+Z轴到dir的角度)
     *    - 加上 PI/2 偏移，因为车辆模型默认朝向+X轴
     *    - 最终 rotation.y = atan2(dir.x, dir.z) + PI/2
     * 
     * 4. 交通规则：
     *    - 检测前方交通信号灯状态
     *    - 检测与前车的安全距离
     *    - 需要停车时减速，无需停车时加速
     * 
     * 关键变量说明：
     * - safeDistance: 车辆之间保持的最小安全距离
     * - shouldStop: 是否需要停车的标志位
     * - data.progress: 当前路段行驶进度(0-1)
     * - data.pathPointIndex: 当前所在路径点的索引
     * - data.currentSpeed: 当前行驶速度
     * - data.baseSpeed: 车辆正常行驶的基准速度
     */
    updateVehicles(time, delta) {
        const safeDistance = 5;
        
        this.vehicles.forEach(vehicle => {
            const data = vehicle.userData;
            const path = data.currentPath;
            
            if (!path) return;
            
            const p1 = path.points[data.pathPointIndex];
            const nextIdx = (data.pathPointIndex + 1) % path.points.length;
            const p2 = path.points[nextIdx];
            
            let shouldStop = false;
            
            const futurePos = new THREE.Vector3().lerpVectors(p1, p2, Math.min(data.progress + 0.15, 1));
            const lightState = this.getTrafficLightStateNearPosition(futurePos.x, futurePos.z);
            
            if ((lightState === 'red' || lightState === 'yellow') && data.progress > 0.6) {
                shouldStop = true;
            }
            
            for (let other of this.vehicles) {
                if (other === vehicle) continue;
                
                const dist = vehicle.position.distanceTo(other.position);
                if (dist < safeDistance) {
                    const toOther = new THREE.Vector3().subVectors(other.position, vehicle.position);
                    const travelDir = new THREE.Vector3().subVectors(p2, p1).normalize();
                    const dot = toOther.normalize().dot(travelDir);
                    
                    if (dot > 0.5) {
                        shouldStop = true;
                        break;
                    }
                }
            }
            
            if (shouldStop) {
                data.currentSpeed = Math.max(0, data.currentSpeed - delta * 0.15);
            } else {
                data.currentSpeed = Math.min(data.baseSpeed, data.currentSpeed + delta * 0.08);
            }
            
            if (data.currentSpeed > 0.001) {
                data.progress += data.currentSpeed * 0.02;
                
                if (data.progress >= 1) {
                    data.progress = 0;
                    data.pathPointIndex = (data.pathPointIndex + 1) % path.points.length;
                }
                
                const currentP1 = path.points[data.pathPointIndex];
                const currentNextIdx = (data.pathPointIndex + 1) % path.points.length;
                const currentP2 = path.points[currentNextIdx];
                
                vehicle.position.lerpVectors(currentP1, currentP2, data.progress);
                vehicle.position.y = 1.0;
                
                const dir = new THREE.Vector3().subVectors(currentP2, currentP1).normalize();
                if (dir.length() > 0.1) {
                    const targetRot = Math.atan2(dir.x, dir.z) + Math.PI / 2;
                    vehicle.rotation.y = targetRot;
                }
                
                data.wheels.forEach(wheel => {
                    wheel.rotation.x += data.currentSpeed * 4;
                });
            }
        });
    }

    update(time, delta) {
        this.updateTrafficLights(time);
        this.updateVehicles(time, delta);
    }
}
