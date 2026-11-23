import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface WarehouseScene3DProps {
  onBagCount: (count: number) => void;
}

const CAMERA_KEYFRAMES: { pos: [number, number, number]; look: [number, number, number] }[] = [
  { pos: [-9.5, 3.6, 10.5], look: [-1.5, 1.2, 0] },     // Hero: Conveyor & Gate
  { pos: [7.5, 6.4, 10.5], look: [0, 1.1, 0] },         // Profile: Oblique Gate view
  { pos: [4.2, 3.0, 6.2], look: [0, 1.7, 0] },          // Experience: Close-up YOLOv8 gate
  { pos: [-9.2, 7.2, 20.5], look: [0, 0.5, 12] },       // Projects: AMR & LiDAR arena
  { pos: [0.5, 11.5, 5.0], look: [0, 0.8, 2] },         // Skills: Elevated warehouse panorama
  { pos: [5.5, 8.2, -3.5], look: [0, 7.0, -14] },       // Blog: Skill graph constellation
  { pos: [0, 8.2, 24.5], look: [0, 2.0, 0] },           // Contact: Wide closing panorama
];

const SKILL_NODES = [
  'Python', 'YOLOv8', 'OpenCV', 'PyTorch', 'NLP', 'TF-IDF',
  'scikit-learn', 'Flask', 'Streamlit', 'React', 'Pandas', 'NumPy',
  'ROS', 'LiDAR', 'Java', 'C++', 'Git', 'REST APIs',
];

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _curPos = new THREE.Vector3(-9.5, 3.6, 10.5);
const _curLook = new THREE.Vector3(-1.5, 1.2, 0);

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createSkillSprite(text: string, maxAnisotropy: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 72;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(7, 13, 24, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(4, 4, 248, 64, 14);
    } else {
      ctx.rect(4, 4, 248, 64);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 28px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 37);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );
  sprite.scale.set(3.2, 0.9, 1);
  return sprite;
}

export default function WarehouseScene3D({ onBagCount }: WarehouseScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onBagCountRef = useRef(onBagCount);
  onBagCountRef.current = onBagCount;

  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setContextLost(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.appendChild(renderer.domElement);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x04070e);
    scene.background = bgColor;
    scene.fog = new THREE.Fog(bgColor, 28, 82);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      200
    );

    const disposables: { dispose: () => void }[] = [envTarget];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // Lighting rig: cool sky/ground fill + warm key + rim accents
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1e0, 0.75);
    keyLight.position.set(10, 16, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    rimLight.position.set(-12, 8, -10);
    scene.add(rimLight);

    const gateLight = new THREE.PointLight(0x38bdf8, 2.0, 15);
    gateLight.position.set(0, 3.2, 0);
    scene.add(gateLight);

    const amrLight = new THREE.PointLight(0x8b5cf6, 1.6, 12);
    amrLight.position.set(0, 2.0, 12);
    scene.add(amrLight);

    // Warehouse floor grid
    const grid = new THREE.GridHelper(120, 120, 0x38bdf8, 0x11243a);
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((mat) => {
      mat.transparent = true;
      mat.opacity = 0.36;
      track(mat);
    });
    track(grid.geometry);
    scene.add(grid);

    // Conveyor assembly
    const steelMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.42,
        metalness: 0.68,
      })
    );
    const beltMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x162033,
        roughness: 0.78,
        metalness: 0.15,
      })
    );
    const railMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.6,
      })
    );

    const conveyorGroup = new THREE.Group();
    const beltMesh = new THREE.Mesh(track(new THREE.BoxGeometry(44, 0.28, 3)), beltMat);
    beltMesh.position.y = 0.82;
    conveyorGroup.add(beltMesh);

    const legGeo = track(new THREE.BoxGeometry(0.24, 0.82, 0.24));
    for (let x = -20; x <= 20; x += 4) {
      for (const z of [-1.3, 1.3]) {
        const leg = new THREE.Mesh(legGeo, steelMat);
        leg.position.set(x, 0.41, z);
        conveyorGroup.add(leg);
      }
    }

    const railGeo = track(new THREE.BoxGeometry(44, 0.22, 0.1));
    for (const z of [-1.58, 1.58]) {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, 1.05, z);
      conveyorGroup.add(rail);
    }
    scene.add(conveyorGroup);

    // Detection gate + optical housing
    const cyanHex = 0x38bdf8;
    const gateFrameMat = track(
      new THREE.MeshStandardMaterial({
        color: cyanHex,
        emissive: cyanHex,
        emissiveIntensity: 0.85,
        roughness: 0.25,
        metalness: 0.7,
      })
    );
    const gateGroup = new THREE.Group();
    const pillarGeo = track(new THREE.BoxGeometry(0.2, 3.2, 0.2));
    for (const z of [-1.9, 1.9]) {
      const pillar = new THREE.Mesh(pillarGeo, gateFrameMat);
      pillar.position.set(0, 2.1, z);
      gateGroup.add(pillar);
    }
    const crossBeam = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.24, 4.0)), gateFrameMat);
    crossBeam.position.y = 3.7;
    gateGroup.add(crossBeam);

    const cameraPod = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 0.26, 0.45)), steelMat);
    cameraPod.position.set(0, 3.45, 0);
    gateGroup.add(cameraPod);

    const scanMat = track(
      new THREE.MeshBasicMaterial({
        color: cyanHex,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const scanPlane = new THREE.Mesh(track(new THREE.PlaneGeometry(3.7, 3.0)), scanMat);
    scanPlane.rotation.y = Math.PI / 2;
    scanPlane.position.y = 2.2;
    gateGroup.add(scanPlane);
    scene.add(gateGroup);

    // Conveyor bags with YOLOv8 bounding box overlays
    const bagMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x082032,
        roughness: 0.55,
        metalness: 0.25,
      })
    );
    const strapMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.7,
        metalness: 0.1,
      })
    );
    const bagGeo = track(new THREE.BoxGeometry(1.5, 0.76, 1.0));
    const strapGeo = track(new THREE.BoxGeometry(1.54, 0.16, 1.04));
    const edgeGeo = track(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.64, 0.9, 1.14)));

    interface BagEntry {
      group: THREE.Group;
      edgeMat: THREE.LineBasicMaterial;
    }

    const bags: BagEntry[] = [];
    const bagCountTotal = 14;
    const trackLength = 44;

    for (let i = 0; i < bagCountTotal; i++) {
      const group = new THREE.Group();
      const bodyMesh = new THREE.Mesh(bagGeo, bagMat);
      const strapMesh = new THREE.Mesh(strapGeo, strapMat);
      strapMesh.position.y = 0.08;
      group.add(bodyMesh, strapMesh);

      const edgeMat = track(
        new THREE.LineBasicMaterial({
          color: cyanHex,
          transparent: true,
          opacity: 0.2,
        })
      );
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      group.add(edges);

      group.position.set(
        -22 + i * (trackLength / bagCountTotal),
        1.36,
        (Math.random() - 0.5) * 0.45
      );
      group.rotation.y = (Math.random() - 0.5) * 0.28;
      scene.add(group);
      bags.push({ group, edgeMat });
    }

    // Autonomous Mobile Robot (AMR) + path + obstacles
    const amrCenterX = 0;
    const amrCenterZ = 12;
    const amrRadius = 5;

    const ringPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPts.push(
        new THREE.Vector3(
          amrCenterX + amrRadius * Math.cos(theta),
          0.03,
          amrCenterZ + amrRadius * Math.sin(theta)
        )
      );
    }
    const pathGeo = track(new THREE.BufferGeometry().setFromPoints(ringPts));
    const pathMat = track(
      new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.7 })
    );
    scene.add(new THREE.Line(pathGeo, pathMat));

    const obstacleGeo = track(new THREE.CylinderGeometry(0.48, 0.48, 1.25, 18));
    const obstacleMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x0b1a2d,
        roughness: 0.5,
        metalness: 0.4,
      })
    );
    for (let i = 0; i < 6; i++) {
      const theta = i * 1.05;
      const rad = i % 2 === 0 ? 2.6 : 7.4;
      const obs = new THREE.Mesh(obstacleGeo, obstacleMat);
      obs.position.set(
        amrCenterX + rad * Math.cos(theta),
        0.625,
        amrCenterZ + rad * Math.sin(theta)
      );
      scene.add(obs);
    }

    // Composite AMR Group (chassis + top deck + 4 wheel hubs + LiDAR turret + fan)
    const amrGroup = new THREE.Group();
    const amrChassisMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x0d2436,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.65,
      })
    );
    const amrDeckMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.4,
      })
    );
    const amrBase = new THREE.Mesh(track(new THREE.BoxGeometry(1.85, 0.42, 1.24)), amrChassisMat);
    amrBase.position.y = 0.38;
    const amrDeck = new THREE.Mesh(track(new THREE.BoxGeometry(1.55, 0.14, 1.0)), amrDeckMat);
    amrDeck.position.y = 0.66;
    amrGroup.add(amrBase, amrDeck);

    const wheelGeo = track(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 14));
    wheelGeo.rotateX(Math.PI / 2);
    for (const wx of [-0.62, 0.62]) {
      for (const wz of [-0.62, 0.62]) {
        const wheel = new THREE.Mesh(wheelGeo, steelMat);
        wheel.position.set(wx, 0.18, wz);
        amrGroup.add(wheel);
      }
    }

    const lidarTurret = new THREE.Mesh(
      track(new THREE.CylinderGeometry(0.22, 0.24, 0.22, 20)),
      railMat
    );
    lidarTurret.position.y = 0.84;
    amrGroup.add(lidarTurret);

    const lidarSweepGroup = new THREE.Group();
    lidarSweepGroup.position.y = 0.86;
    const fanMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const fanMesh = new THREE.Mesh(track(new THREE.CircleGeometry(4.0, 28, 0, 0.9)), fanMat);
    fanMesh.rotation.x = -Math.PI / 2;
    lidarSweepGroup.add(fanMesh);
    amrGroup.add(lidarSweepGroup);
    scene.add(amrGroup);

    // 3D Skill Graph Cloud
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const skillCloud = new THREE.Group();
    skillCloud.position.set(0, 7.2, -14);
    const nodePositions: THREE.Vector3[] = [];

    SKILL_NODES.forEach((word, index) => {
      const y = 1 - (index / (SKILL_NODES.length - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = index * 2.39996;
      const sprite = createSkillSprite(word, maxAnisotropy);
      if (sprite.material.map) track(sprite.material.map);
      track(sprite.material);
      sprite.position.set(Math.cos(theta) * rad * 6, y * 4.8, Math.sin(theta) * rad * 6);
      skillCloud.add(sprite);
      nodePositions.push(sprite.position);
    });

    const edgeVertices: THREE.Vector3[] = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 5.3) {
          edgeVertices.push(nodePositions[i], nodePositions[j]);
        }
      }
    }
    const cloudEdgesGeo = track(new THREE.BufferGeometry().setFromPoints(edgeVertices));
    const cloudEdgesMat = track(
      new THREE.LineBasicMaterial({ color: cyanHex, transparent: true, opacity: 0.3 })
    );
    skillCloud.add(new THREE.LineSegments(cloudEdgesGeo, cloudEdgesMat));
    scene.add(skillCloud);

    // Ambient particle field
    const dustPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 650; i++) {
      dustPoints.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 70,
          Math.random() * 22,
          (Math.random() - 0.5) * 70
        )
      );
    }
    const dustGeo = track(new THREE.BufferGeometry().setFromPoints(dustPoints));
    const dustMat = track(
      new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.085, transparent: true, opacity: 0.6 })
    );
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const icosa = new THREE.Mesh(
      track(new THREE.IcosahedronGeometry(3.0, 1)),
      track(
        new THREE.MeshBasicMaterial({
          color: cyanHex,
          wireframe: true,
          transparent: true,
          opacity: 0.24,
        })
      )
    );
    icosa.position.set(-15, 7, -8);
    scene.add(icosa);

    const torus = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.6, 0.05, 8, 64)),
      track(new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.65 }))
    );
    torus.position.set(15, 6, -6);
    scene.add(torus);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Section scroll measurements
    let sectionTops: number[] = [];
    const measureSections = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-stop]'));
      if (sections.length === 0) {
        sectionTops = [0];
        return;
      }
      sectionTops = sections.map(
        (el) => el.offsetTop + el.offsetHeight * 0.5 - window.innerHeight * 0.5
      );
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = Math.max(1, window.innerHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      measureSections();
    };

    measureSections();
    const resizeObserver = new ResizeObserver(() => measureSections());
    resizeObserver.observe(document.body);
    window.addEventListener('resize', handleResize);

    let pointerX = 0;
    let pointerY = 0;
    let smoothPointerX = 0;
    let smoothPointerY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotion) return;
      pointerX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointerY = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    const updateTargetVectors = () => {
      const y = window.scrollY;
      let idx = 0;
      while (idx < sectionTops.length - 1 && y >= sectionTops[idx + 1]) {
        idx++;
      }
      if (idx >= CAMERA_KEYFRAMES.length - 1) {
        const last = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
        _targetPos.set(last.pos[0], last.pos[1], last.pos[2]);
        _targetLook.set(last.look[0], last.look[1], last.look[2]);
        return;
      }

      const span = Math.max(1, (sectionTops[idx + 1] ?? y + 600) - (sectionTops[idx] ?? 0));
      const rawT = Math.min(1, Math.max(0, (y - (sectionTops[idx] ?? 0)) / span));
      const t = smoothstep(rawT);

      const a = CAMERA_KEYFRAMES[idx];
      const b = CAMERA_KEYFRAMES[Math.min(idx + 1, CAMERA_KEYFRAMES.length - 1)];
      _targetPos.set(
        a.pos[0] + (b.pos[0] - a.pos[0]) * t,
        a.pos[1] + (b.pos[1] - a.pos[1]) * t,
        a.pos[2] + (b.pos[2] - a.pos[2]) * t
      );
      _targetLook.set(
        a.look[0] + (b.look[0] - a.look[0]) * t,
        a.look[1] + (b.look[1] - a.look[1]) * t,
        a.look[2] + (b.look[2] - a.look[2]) * t
      );
    };

    let bagCount = 0;
    let flashIntensity = 0;
    let amrAngle = 0;
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const speedScale = reduceMotion ? 0.25 : 1;

      updateTargetVectors();

      const dampFactor = reduceMotion ? 8 : 3.8;
      _curPos.x = THREE.MathUtils.damp(_curPos.x, _targetPos.x, dampFactor, dt);
      _curPos.y = THREE.MathUtils.damp(_curPos.y, _targetPos.y, dampFactor, dt);
      _curPos.z = THREE.MathUtils.damp(_curPos.z, _targetPos.z, dampFactor, dt);

      _curLook.x = THREE.MathUtils.damp(_curLook.x, _targetLook.x, dampFactor, dt);
      _curLook.y = THREE.MathUtils.damp(_curLook.y, _targetLook.y, dampFactor, dt);
      _curLook.z = THREE.MathUtils.damp(_curLook.z, _targetLook.z, dampFactor, dt);

      smoothPointerX = THREE.MathUtils.damp(smoothPointerX, pointerX, 3.2, dt);
      smoothPointerY = THREE.MathUtils.damp(smoothPointerY, pointerY, 3.2, dt);

      camera.position.set(
        _curPos.x + smoothPointerX * 0.85,
        _curPos.y - smoothPointerY * 0.45,
        _curPos.z
      );
      camera.lookAt(_curLook);

      // Advance conveyor bags
      for (const item of bags) {
        const prevX = item.group.position.x;
        item.group.position.x += 2.2 * speedScale * dt;
        if (prevX < 0 && item.group.position.x >= 0) {
          bagCount += 1;
          flashIntensity = 1;
          onBagCountRef.current(bagCount);
        }
        if (item.group.position.x > 22) {
          item.group.position.x -= trackLength;
        }
        item.edgeMat.opacity = Math.max(0.08, 1 - Math.abs(item.group.position.x) / 6);
      }

      flashIntensity = Math.max(0, flashIntensity - dt * 3);
      scanMat.opacity = 0.12 + flashIntensity * 0.45;

      // Advance AMR along circular trajectory
      amrAngle += 0.35 * speedScale * dt;
      amrGroup.position.set(
        amrCenterX + amrRadius * Math.cos(amrAngle),
        0,
        amrCenterZ + amrRadius * Math.sin(amrAngle)
      );
      amrGroup.rotation.y = -amrAngle - Math.PI / 2;
      amrLight.position.set(amrGroup.position.x, 2, amrGroup.position.z);

      lidarSweepGroup.rotation.y += 2.4 * speedScale * dt;
      skillCloud.rotation.y += 0.11 * speedScale * dt;
      dust.rotation.y += 0.02 * speedScale * dt;
      icosa.rotation.x += 0.18 * speedScale * dt;
      icosa.rotation.y += 0.14 * speedScale * dt;
      torus.rotation.x += 0.35 * speedScale * dt;
      torus.rotation.y += 0.28 * speedScale * dt;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      for (const item of disposables) {
        item.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (contextLost) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#0d1b32_0%,#04070e_65%)]"
      />
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
