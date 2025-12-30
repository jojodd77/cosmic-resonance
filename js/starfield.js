// 3D星空场景管理器
class StarField3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        
        this.stars = [];
        this.constellations = [];
        this.isInteracting = false;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // 设置渲染器
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // 设置相机位置
        this.camera.position.z = 5;
        
        // 创建星空
        this.createStarField();
        this.createConstellations();
        
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // 添加点光源
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // 随机位置
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            
            // 随机颜色（偏白色和蓝色）
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.3, Math.random() * 0.5 + 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.stars.push(stars);
    }

    createConstellations() {
        // 北斗七星数据
        const bigDipper = {
            name: '北斗七星',
            description: '中国古代天文学中的重要星宿，属于紫微垣，具有指示方向的作用。',
            stars: [
                { name: '天枢', position: [2, 1, 0], brightness: 1.2 },
                { name: '天璇', position: [1.8, 0.8, 0], brightness: 1.1 },
                { name: '天玑', position: [1.5, 0.5, 0], brightness: 1.0 },
                { name: '天权', position: [1.2, 0.2, 0], brightness: 0.9 },
                { name: '玉衡', position: [0.8, -0.1, 0], brightness: 1.1 },
                { name: '开阳', position: [0.5, -0.4, 0], brightness: 1.0 },
                { name: '摇光', position: [0.2, -0.7, 0], brightness: 1.0 }
            ]
        };

        // 猎户座数据
        const orion = {
            name: '猎户座',
            description: '西方天文学中的著名星座，代表希腊神话中的猎人俄里翁。',
            stars: [
                { name: '参宿四', position: [-2, 1.5, 0], brightness: 1.3 },
                { name: '参宿七', position: [-1.5, -1.5, 0], brightness: 1.2 },
                { name: '参宿一', position: [-2.2, -0.8, 0], brightness: 1.1 },
                { name: '参宿二', position: [-1.8, -0.5, 0], brightness: 1.0 },
                { name: '参宿三', position: [-1.4, -0.2, 0], brightness: 1.0 }
            ]
        };

        this.createConstellation(bigDipper);
        this.createConstellation(orion);
    }

    createConstellation(constellationData) {
        const group = new THREE.Group();
        group.userData = constellationData;
        
        // 创建星星
        constellationData.stars.forEach((starData, index) => {
            const starGeometry = new THREE.SphereGeometry(0.02 * starData.brightness, 8, 8);
            const starMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(...starData.position);
            star.userData = { 
                name: starData.name, 
                constellation: constellationData.name,
                description: constellationData.description
            };
            
            // 添加发光效果
            const glowGeometry = new THREE.SphereGeometry(0.05 * starData.brightness, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            star.add(glow);
            
            group.add(star);
        });
        
        // 创建连线
        if (constellationData.stars.length > 1) {
            const lineGeometry = new THREE.BufferGeometry();
            const positions = [];
            
            for (let i = 0; i < constellationData.stars.length - 1; i++) {
                const star1 = constellationData.stars[i];
                const star2 = constellationData.stars[i + 1];
                
                positions.push(...star1.position);
                positions.push(...star2.position);
            }
            
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x6366f1,
                transparent: true,
                opacity: 0.5
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            group.add(line);
        }
        
        this.scene.add(group);
        this.constellations.push(group);
    }

    setupEventListeners() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (event) => {
            isDragging = true;
            this.isInteracting = true;
        });
        
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            if (isDragging) {
                const deltaMove = {
                    x: event.offsetX - previousMousePosition.x,
                    y: event.offsetY - previousMousePosition.y
                };
                
                // 旋转场景
                this.scene.rotation.y += deltaMove.x * 0.01;
                this.scene.rotation.x += deltaMove.y * 0.01;
            }
            
            previousMousePosition = {
                x: event.offsetX,
                y: event.offsetY
            };
            
            // 检测星星悬停
            this.checkStarHover();
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            this.isInteracting = false;
        });
        
        this.canvas.addEventListener('click', (event) => {
            this.checkStarClick();
        });
        
        // 滚轮缩放
        this.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.z *= delta;
            this.camera.position.z = Math.max(2, Math.min(10, this.camera.position.z));
        });
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    checkStarHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = [];
        this.constellations.forEach(constellation => {
            constellation.children.forEach(child => {
                if (child.geometry && child.geometry.type === 'SphereGeometry') {
                    intersects.push(...this.raycaster.intersectObject(child));
                }
            });
        });
        
        if (intersects.length > 0) {
            this.canvas.style.cursor = 'pointer';
            const star = intersects[0].object;
            if (star.userData.name) {
                this.showConstellationInfo(star.userData);
            }
        } else {
            this.canvas.style.cursor = 'grab';
            this.hideConstellationInfo();
        }
    }

    checkStarClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = [];
        this.constellations.forEach(constellation => {
            constellation.children.forEach(child => {
                if (child.geometry && child.geometry.type === 'SphereGeometry') {
                    intersects.push(...this.raycaster.intersectObject(child));
                }
            });
        });
        
        if (intersects.length > 0) {
            const star = intersects[0].object;
            this.onStarClick(star.userData);
        }
    }

    showConstellationInfo(starData) {
        const infoElement = document.getElementById('constellation-info');
        const nameElement = document.getElementById('constellation-name');
        const descElement = document.getElementById('constellation-desc');
        
        if (infoElement && nameElement && descElement) {
            nameElement.textContent = `${starData.name} (${starData.constellation})`;
            descElement.textContent = starData.description;
            infoElement.classList.add('show');
        }
    }

    hideConstellationInfo() {
        const infoElement = document.getElementById('constellation-info');
        if (infoElement) {
            infoElement.classList.remove('show');
        }
    }

    onStarClick(starData) {
        // 播放点击音效
        this.playClickSound();
        
        // 显示详细信息
        alert(`${starData.name}\n\n所属星座：${starData.constellation}\n\n${starData.description}`);
        
        // 触发占卜启动事件
        document.dispatchEvent(new CustomEvent('starClicked', { detail: starData }));
    }

    playClickSound() {
        const clickSound = document.getElementById('click-sound');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {
                // 忽略音频播放错误
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 自动旋转（当不在交互时）
        if (!this.isInteracting) {
            this.scene.rotation.y += 0.001;
        }
        
        // 星星闪烁效果
        this.stars.forEach(starGroup => {
            if (starGroup.material) {
                starGroup.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
            }
        });
        
        // 星座发光效果
        this.constellations.forEach(constellation => {
            constellation.children.forEach(child => {
                if (child.children.length > 0) {
                    const glow = child.children[0];
                    if (glow && glow.material) {
                        glow.material.opacity = 0.2 + Math.sin(Date.now() * 0.002 + child.position.x) * 0.1;
                    }
                }
            });
        });
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const rect = this.canvas.getBoundingClientRect();
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(rect.width, rect.height);
    }

    resetView() {
        // 重置相机位置和场景旋转
        gsap.to(this.camera.position, {
            duration: 1,
            z: 5,
            ease: "power2.out"
        });
        
        gsap.to(this.scene.rotation, {
            duration: 1,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.out"
        });
    }

    activateDivination() {
        // 占卜激活动画
        const activationEffect = () => {
            this.constellations.forEach((constellation, index) => {
                setTimeout(() => {
                    constellation.children.forEach(child => {
                        if (child.material && child.material.color) {
                            gsap.to(child.material.color, {
                                duration: 0.5,
                                r: 1,
                                g: 0.4,
                                b: 0.1,
                                yoyo: true,
                                repeat: 3
                            });
                        }
                    });
                }, index * 200);
            });
        };
        
        activationEffect();
        
        // 触发占卜启动事件
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('divinationActivated'));
        }, 2000);
    }
}

// 背景星空粒子系统
class BackgroundStarfield {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.stars = [];
        this.shootingStars = [];
        this.init();
    }

    init() {
        this.createStars();
        this.createShootingStars();
        this.animate();
    }

    createStars() {
        const starCount = 150;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'bg-star';
            star.style.cssText = `
                position: absolute;
                background: white;
                border-radius: 50%;
                animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            // 随机大小
            const size = Math.random() * 3 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            
            // 随机位置
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // 随机透明度
            star.style.opacity = Math.random() * 0.8 + 0.2;
            
            this.container.appendChild(star);
            this.stars.push(star);
        }
    }

    createShootingStars() {
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% 概率
                this.createShootingStar();
            }
        }, 3000);
    }

    createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: linear-gradient(45deg, #fff, transparent);
            border-radius: 50%;
            animation: shoot 2s linear forwards;
        `;
        
        // 随机起始位置
        shootingStar.style.left = Math.random() * 50 + '%';
        shootingStar.style.top = Math.random() * 50 + '%';
        
        this.container.appendChild(shootingStar);
        
        // 动画结束后移除
        setTimeout(() => {
            if (shootingStar.parentNode) {
                shootingStar.parentNode.removeChild(shootingStar);
            }
        }, 2000);
    }

    animate() {
        // 鼠标视差效果
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            this.stars.forEach((star, index) => {
                const speed = (index % 3 + 1) * 0.3;
                const x = (mouseX - 0.5) * speed;
                const y = (mouseY - 0.5) * speed;
                
                star.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    
    @keyframes shoot {
        0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateX(300px) translateY(300px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

