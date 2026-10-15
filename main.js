
// ============================================================
// SAMIR® — DIGITAL UNIVERSE
// Three.js + Interactions + Animations
// ============================================================

import * as THREE from "three";

// ============================================================
// 01. DOM ELEMENTS
// ============================================================

const canvas = document.querySelector("#universeCanvas");
const heroVisual = document.querySelector("#heroVisual");
const loader = document.querySelector("#loader");

const cursorDot = document.querySelector("#cursorDot");
const cursorOutline = document.querySelector("#cursorOutline");

const navbar = document.querySelector("#navbar");
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const isMobile = window.matchMedia("(max-width: 780px)").matches;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ============================================================
// 02. LOADER
// ============================================================

function initializeLoader() {
  const minimumTime = 900;

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader?.classList.add("hidden");
    }, minimumTime);
  });

  // Fallback if the load event has already fired.
  if (document.readyState === "complete") {
    setTimeout(() => {
      loader?.classList.add("hidden");
    }, minimumTime);
  }
}

initializeLoader();

// ============================================================
// 03. THREE.JS SCENE
// ============================================================

let scene;
let camera;
let renderer;
let clock;

let universe;
let coreGroup;
let coreSphere;
let innerWireframe;
let outerWireframe;
let energyRing;
let energyRingTwo;
let particleField;
let starField;

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

let sceneWidth = 0;
let sceneHeight = 0;

let animationFrameId = null;
let sceneInitialized = false;

const pointer = new THREE.Vector2(0, 0);

function createScene() {
  if (!canvas || !heroVisual) {
    console.warn("Three.js canvas or hero visual was not found.");
    return;
  }

  sceneWidth = heroVisual.clientWidth;
  sceneHeight = heroVisual.clientHeight;

  if (sceneWidth === 0 || sceneHeight === 0) {
    console.warn("The 3D scene has no available size.");
    return;
  }

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070812, 0.055);

  camera = new THREE.PerspectiveCamera(
    42,
    sceneWidth / sceneHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
  );

  renderer.setSize(sceneWidth, sceneHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  clock = new THREE.Clock();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x8899ff, 1.4);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x63e8ff, 30, 18);
  cyanLight.position.set(3, 2, 4);
  scene.add(cyanLight);

  const violetLight = new THREE.PointLight(0xa879ff, 35, 18);
  violetLight.position.set(-3, -2, 2);
  scene.add(violetLight);

  const coreLight = new THREE.PointLight(0x628bff, 20, 10);
  coreLight.position.set(0, 0, 1);
  scene.add(coreLight);

  createUniverse();
  createParticles();
  createStars();
  createEnergyRings();

  sceneInitialized = true;

  if (!reducedMotion) {
    animate();
  } else {
    renderer.render(scene, camera);
  }
}

// ============================================================
// 04. MAIN 3D OBJECT
// ============================================================

function createUniverse() {
  universe = new THREE.Group();
  coreGroup = new THREE.Group();

  scene.add(universe);
  universe.add(coreGroup);

  // Main sphere
  const sphereGeometry = new THREE.IcosahedronGeometry(1.38, 5);

  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x151c42,
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x101d48,
    emissiveIntensity: 0.8,
    flatShading: false
  });

  coreSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  coreGroup.add(coreSphere);

  // Fine triangular wireframe
  const wireGeometry = new THREE.IcosahedronGeometry(1.43, 3);

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x63e8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.19
  });

  innerWireframe = new THREE.Mesh(wireGeometry, wireMaterial);
  coreGroup.add(innerWireframe);

  // Outer wireframe
  const outerGeometry = new THREE.IcosahedronGeometry(1.55, 2);

  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xa879ff,
    wireframe: true,
    transparent: true,
    opacity: 0.1
  });

  outerWireframe = new THREE.Mesh(outerGeometry, outerMaterial);
  coreGroup.add(outerWireframe);

  // Bright points on the sphere
  const pointCount = isMobile ? 250 : 450;
  const positions = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i++) {
    const point = randomPointOnSphere(1.44);

    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const pointMaterial = new THREE.PointsMaterial({
    color: 0x9befff,
    size: 0.018,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const surfacePoints = new THREE.Points(
    pointGeometry,
    pointMaterial
  );

  coreGroup.add(surfacePoints);

  // Glowing halo
  const haloGeometry = new THREE.SphereGeometry(1.75, 32, 32);

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x628bff,
    transparent: true,
    opacity: 0.035,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  coreGroup.add(halo);

  // Small central luminous sphere
  const centerGeometry = new THREE.SphereGeometry(0.25, 24, 24);

  const centerMaterial = new THREE.MeshBasicMaterial({
    color: 0x9befff,
    transparent: true,
    opacity: 0.75
  });

  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  center.position.set(0, 0, 0.1);
  coreGroup.add(center);

  // Decorative satellite
  const satelliteGeometry = new THREE.IcosahedronGeometry(0.09, 1);

  const satelliteMaterial = new THREE.MeshBasicMaterial({
    color: 0x63e8ff
  });

  const satellite = new THREE.Mesh(
    satelliteGeometry,
    satelliteMaterial
  );

  satellite.position.set(2.15, 0.75, 0.2);
  universe.add(satellite);

  // A small purple satellite
  const satelliteTwo = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.075, 0),
    new THREE.MeshBasicMaterial({ color: 0xa879ff })
  );

  satelliteTwo.position.set(-1.9, -1.1, 0.5);
  universe.add(satelliteTwo);
}

// ============================================================
// 05. PARTICLES
// ============================================================

function createParticles() {
  const count = isMobile ? 650 : 1400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const cyan = new THREE.Color(0x63e8ff);
  const purple = new THREE.Color(0xa879ff);
  const blue = new THREE.Color(0x628bff);

  for (let i = 0; i < count; i++) {
    const radius = 2.3 + Math.random() * 4.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] =
      radius * Math.sin(phi) * Math.cos(theta);

    positions[i * 3 + 1] =
      radius * Math.sin(phi) * Math.sin(theta);

    positions[i * 3 + 2] =
      radius * Math.cos(phi);

    const colorChoice = Math.random();

    let color;

    if (colorChoice < 0.45) {
      color = cyan;
    } else if (colorChoice < 0.75) {
      color = purple;
    } else {
      color = blue;
    }

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
  );

  const material = new THREE.PointsMaterial({
    size: isMobile ? 0.018 : 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleField = new THREE.Points(geometry, material);
  scene.add(particleField);
}

// ============================================================
// 06. STAR FIELD
// ============================================================

function createStars() {
  const count = isMobile ? 400 : 900;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = -2 - Math.random() * 12;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xbacbff,
    size: 0.025,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    depthWrite: false
  });

  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

// ============================================================
// 07. ORBITAL ENERGY RINGS
// ============================================================

function createEnergyRings() {
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x63e8ff,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const ringGeometry = new THREE.TorusGeometry(
    2.05,
    0.008,
    8,
    180
  );

  energyRing = new THREE.Mesh(ringGeometry, ringMaterial);

  energyRing.rotation.x = 1.05;
  energyRing.rotation.y = 0.35;

  universe.add(energyRing);

  const ringTwoGeometry = new THREE.TorusGeometry(
    2.35,
    0.006,
    8,
    180
  );

  const ringTwoMaterial = new THREE.MeshBasicMaterial({
    color: 0xa879ff,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  energyRingTwo = new THREE.Mesh(
    ringTwoGeometry,
    ringTwoMaterial
  );

  energyRingTwo.rotation.x = 1.45;
  energyRingTwo.rotation.y = -0.45;
  energyRingTwo.rotation.z = 0.25;

  universe.add(energyRingTwo);

  // Tiny orbiting particles
  const orbitingCount = 45;
  const orbitingPositions = new Float32Array(orbitingCount * 3);

  for (let i = 0; i < orbitingCount; i++) {
    const angle = (i / orbitingCount) * Math.PI * 2;
    const radius = 2.05 + Math.random() * 0.3;

    orbitingPositions[i * 3] = Math.cos(angle) * radius;
    orbitingPositions[i * 3 + 1] = Math.sin(angle) * radius * 0.5;
    orbitingPositions[i * 3 + 2] = Math.sin(angle) * 0.7;
  }

  const orbitingGeometry = new THREE.BufferGeometry();

  orbitingGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(orbitingPositions, 3)
  );

  const orbitingMaterial = new THREE.PointsMaterial({
    color: 0x9befff,
    size: 0.035,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const orbitingPoints = new THREE.Points(
    orbitingGeometry,
    orbitingMaterial
  );

  universe.add(orbitingPoints);
  universe.userData.orbitingPoints = orbitingPoints;
}

// ============================================================
// 08. RANDOM POINT ON SPHERE
// ============================================================

function randomPointOnSphere(radius) {
  const u = Math.random();
  const v = Math.random();

  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

// ============================================================
// 09. ANIMATION LOOP
// ============================================================

function animate() {
  if (!sceneInitialized || !renderer) return;

  animationFrameId = requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Smooth pointer movement
  mouseX += (targetMouseX - mouseX) * 0.035;
  mouseY += (targetMouseY - mouseY) * 0.035;

  // Core rotation
  coreGroup.rotation.y = elapsed * 0.12 + mouseX * 0.18;
  coreGroup.rotation.x = Math.sin(elapsed * 0.16) * 0.12 + mouseY * 0.12;

  // Wireframe counter-rotation
  innerWireframe.rotation.y = -elapsed * 0.08;
  innerWireframe.rotation.x = elapsed * 0.035;

  outerWireframe.rotation.y = elapsed * 0.05;
  outerWireframe.rotation.z = -elapsed * 0.04;

  // Slow movement of the complete universe
  universe.rotation.y = mouseX * 0.08;
  universe.rotation.x = mouseY * 0.05;

  // Orbital rings
  energyRing.rotation.z = elapsed * 0.08;
  energyRingTwo.rotation.y = elapsed * 0.09;
  energyRingTwo.rotation.z = -elapsed * 0.06;

  // Particle movement
  particleField.rotation.y = elapsed * 0.012;
  particleField.rotation.x = Math.sin(elapsed * 0.1) * 0.04;

  starField.rotation.y = elapsed * 0.004;
  starField.rotation.x = Math.sin(elapsed * 0.06) * 0.015;

  // Subtle breathing effect
  const breathing = 1 + Math.sin(elapsed * 0.8) * 0.018;

  coreSphere.scale.setScalar(breathing);

  // Camera follows the pointer slightly
  camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.025;
  camera.position.y += (-mouseY * 0.25 - camera.position.y) * 0.025;

  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// ============================================================
// 10. MOUSE / TOUCH INTERACTION
// ============================================================

function handlePointerMove(event) {
  if (!heroVisual) return;

  const rect = heroVisual.getBoundingClientRect();

  const localX = (event.clientX - rect.left) / rect.width;
  const localY = (event.clientY - rect.top) / rect.height;

  targetMouseX = (localX - 0.5) * 2;
  targetMouseY = (localY - 0.5) * 2;

  pointer.x = targetMouseX;
  pointer.y = -targetMouseY;
}

if (heroVisual) {
  heroVisual.addEventListener("pointermove", handlePointerMove);

  heroVisual.addEventListener("pointerleave", () => {
    targetMouseX = 0;
    targetMouseY = 0;
  });
}

// ============================================================
// 11. RESPONSIVE RESIZE
// ============================================================

function handleResize() {
  if (!renderer || !camera || !heroVisual) return;

  const width = heroVisual.clientWidth;
  const height = heroVisual.clientHeight;

  if (width === 0 || height === 0) return;

  sceneWidth = width;
  sceneHeight = height;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  if (reducedMotion && scene) {
    renderer.render(scene, camera);
  }
}

window.addEventListener("resize", handleResize);

// ============================================================
// 12. NAVIGATION SCROLL EFFECT
// ============================================================

function updateNavbar() {
  if (!navbar) return;

  navbar.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateNavbar, {
  passive: true
});

updateNavbar();

// ============================================================
// 13. MOBILE MENU
// ============================================================

function closeMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.classList.remove("active");
  navLinks.classList.remove("open");
  document.body.classList.remove("menu-open");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Ouvrir le menu");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Fermer le menu" : "Ouvrir le menu"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) {
      closeMenu();
    }
  });
}

// ============================================================
// 14. ACTIVE NAVIGATION LINK
// ============================================================

const pageSections = document.querySelectorAll("main section[id]");
const navigationAnchors = document.querySelectorAll(".nav-link");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const currentId = entry.target.id;

        navigationAnchors.forEach((link) => {
          const active = link.getAttribute("href") === `#${currentId}`;

          link.classList.toggle("active", active);
        });
      });
    },
    {
      rootMargin: "-35% 0px -50% 0px",
      threshold: 0
    }
  );

  pageSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

// ============================================================
// 15. CUSTOM CURSOR
// ============================================================

if (
  cursorDot &&
  cursorOutline &&
  window.matchMedia("(pointer: fine)").matches
) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;

  let outlineX = cursorX;
  let outlineY = cursorY;

  document.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;

    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;
  });

  function animateCursor() {
    outlineX += (cursorX - outlineX) * 0.16;
    outlineY += (cursorY - outlineY) * 0.16;

    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursorOutline.classList.add("hovering");
    });

    element.addEventListener("pointerleave", () => {
      cursorOutline.classList.remove("hovering");
    });
  });
}

// ============================================================
// 16. REVEAL ELEMENTS ON SCROLL
// ============================================================

const revealElements = document.querySelectorAll(
  ".section-heading, .about-visual, .about-text, " +
  ".project-card, .skill-card, .contact-card, .contact-links"
);

if ("IntersectionObserver" in window && !reducedMotion) {
  revealElements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(24px)";
    element.style.transition =
      "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

// ============================================================
// 17. CURRENT YEAR
// ============================================================

const currentYear = document.querySelector("#currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// ============================================================
// 18. START THREE.JS
// ============================================================

try {
  createScene();
} catch (error) {
  console.error("Unable to initialize the 3D scene:", error);
}

// ============================================================
// 19. CLEANUP
// ============================================================

window.addEventListener("pagehide", () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  if (renderer) {
    renderer.dispose();
  }
});
