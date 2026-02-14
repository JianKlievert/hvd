// ==========================================
//  🌹 Valentine's Day - Flowers & Fireworks
// ==========================================

const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
const garden = document.getElementById('garden');
const floatingHeartsContainer = document.getElementById('floatingHearts');

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mobile detection
function isMobile() {
    return window.innerWidth <= 480;
}
function isSmallScreen() {
    return window.innerWidth <= 768;
}

// ==========================================
//  🎆 FIREWORKS SYSTEM
// ==========================================

const fireworks = [];
const particles = [];
const valentineColors = [
    '#ff6b9d', '#ff4081', '#ff1744', '#f50057',
    '#ff80ab', '#ff5252', '#e91e63', '#c2185b',
    '#ffcdd2', '#ef9a9a', '#ff8a80', '#ff6090',
    '#ffd54f', '#fff176', '#ffe082', '#ffffff',
    '#f8bbd0', '#f48fb1', '#ec407a'
];

class Firework {
    constructor(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = Math.sqrt((tx - sx) ** 2 + (ty - sy) ** 2);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 4;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 3;
        this.acceleration = 1.03;
        this.brightness = Math.random() * 30 + 50;
        this.targetRadius = 1;
        this.trail = [];
    }

    update() {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt((this.x + vx - this.sx) ** 2 + (this.y + vy - this.sy) ** 2);

        if (this.distanceTraveled >= this.distanceToTarget) {
            createExplosion(this.tx, this.ty);
            return true;
        }

        this.x += vx;
        this.y += vy;
        return false;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(340, 100%, ${this.brightness}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing trail
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 200, 220, 0.8)';
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, isHeart = false) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 8 + 2;
        this.friction = 0.96;
        this.gravity = 0.7 + Math.random() * 0.5;
        this.hue = Math.random() * 60 + 320;
        this.brightness = Math.random() * 30 + 60;
        this.alpha = 1;
        this.decay = Math.random() * 0.025 + 0.01;
        this.color = valentineColors[Math.floor(Math.random() * valentineColors.length)];
        this.isHeart = isHeart;
        this.size = Math.random() * 3 + 1;
        this.sparkle = Math.random() > 0.5;
    }

    update() {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        return this.alpha <= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.alpha;

        if (this.isHeart) {
            drawHeart(ctx, this.x, this.y, 4, this.color);
        } else {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Sparkle effect
            if (this.sparkle && Math.random() > 0.6) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
    }
}

function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size, -size, -size * 2, size / 3, 0, size * 1.5);
    ctx.bezierCurveTo(size * 2, size / 3, size, -size, 0, 0);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function createExplosion(x, y) {
    const base = isMobile() ? 30 : 50;
    const extra = isMobile() ? 15 : 25;
    const particleCount = base + Math.floor(Math.random() * extra);
    const useHearts = Math.random() > 0.5;

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, useHearts && Math.random() > 0.3));
    }
}

// Auto-launch fireworks
let autoFireworkTimer = 0;
function autoLaunchFirework() {
    const sx = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5;
    const sy = canvas.height;
    const tx = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    const ty = Math.random() * canvas.height * 0.4 + canvas.height * 0.05;
    fireworks.push(new Firework(sx, sy, tx, ty));
}

// Click/touch to launch fireworks
function launchFireworkAt(x, y) {
    const sx = canvas.width / 2;
    const sy = canvas.height;
    fireworks.push(new Firework(sx, sy, x, y));
}

document.addEventListener('click', (e) => {
    launchFireworkAt(e.clientX, e.clientY);
});

// Animation loop
function animateFireworks() {
    requestAnimationFrame(animateFireworks);

    // Fading trail effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Auto fireworks
    autoFireworkTimer++;
    const autoInterval = isMobile() ? 220 : 160;
    if (autoFireworkTimer > autoInterval + Math.random() * 80) {
        autoLaunchFirework();
        autoFireworkTimer = 0;
    }

    // Update & draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].draw();
        if (fireworks[i].update()) {
            fireworks.splice(i, 1);
        }
    }

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        if (particles[i].update()) {
            particles.splice(i, 1);
        }
    }
}

// ==========================================
//  🌸 FLOWERS SYSTEM
// ==========================================

const flowerColors = [
    { petals: '#cc0000', center: '#ffe066' },    // Deep red
    { petals: '#e60026', center: '#fff9c4' },    // Classic red
    { petals: '#d50032', center: '#fffde7' },    // Rich red
    { petals: '#b71c1c', center: '#ffe082' },    // Dark red
    { petals: '#ff4081', center: '#fff9c4' },    // Hot pink
    { petals: '#e91e63', center: '#fffde7' },    // Rose pink
    { petals: '#f06292', center: '#ffecb3' },    // Light pink
    { petals: '#ff80ab', center: '#fff8e1' },    // Soft pink
    { petals: '#ec407a', center: '#fff59d' },    // Deep pink
    { petals: '#ffffff', center: '#ffee58' },    // White
    { petals: '#fff5f5', center: '#ffd54f' },    // Ivory white
];

function createFlower(angle, stemLen, delay) {
    const flower = document.createElement('div');
    const type = Math.random();
    let flowerClass = 'flower';
    if (type > 0.66) flowerClass += ' rose';
    else if (type > 0.33) flowerClass += ' tulip';

    flower.className = flowerClass;
    flower.style.transform = `rotate(${angle}deg)`;

    const colorSet = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const stemHeight = stemLen;
    const petalCount = type > 0.66 ? 12 : (type > 0.33 ? 6 : 8);
    const headSize = isMobile() ? (28 + Math.random() * 18) : (35 + Math.random() * 25);

    // Create stem
    const stem = document.createElement('div');
    stem.className = 'stem';

    // Create flower head
    const flowerHead = document.createElement('div');
    flowerHead.className = 'flower-head';
    flowerHead.style.width = headSize + 'px';
    flowerHead.style.height = headSize + 'px';
    flowerHead.style.marginLeft = (-headSize / 2) + 'px';
    flowerHead.style.marginBottom = (-headSize / 2) + 'px';

    // Center point of the flower head
    const cx = headSize / 2;
    const cy = headSize / 2;
    const petalW = headSize * 0.35;
    const petalH = headSize * 0.45;

    // Create petals
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        const angle = (360 / petalCount) * i;
        const rad = angle * Math.PI / 180;
        // Place each petal so its base is at the center, extending outward
        petal.style.width = petalW + 'px';
        petal.style.height = petalH + 'px';
        petal.style.left = (cx - petalW / 2) + 'px';
        petal.style.top = (cy - petalH) + 'px';
        petal.style.transformOrigin = '50% 100%';
        petal.style.transform = `rotate(${angle}deg)`;
        petal.style.background = `linear-gradient(to top, ${adjustBrightness(colorSet.petals, -15)}, ${colorSet.petals})`;
        petal.style.boxShadow = `inset 0 0 ${petalW/3}px rgba(0,0,0,0.08)`;
        flowerHead.appendChild(petal);
    }

    // Center dot — exactly at cx, cy
    const centerSize = headSize * 0.25;
    const center = document.createElement('div');
    center.className = 'flower-center';
    center.style.width = centerSize + 'px';
    center.style.height = centerSize + 'px';
    center.style.left = (cx - centerSize / 2) + 'px';
    center.style.top = (cy - centerSize / 2) + 'px';
    center.style.background = `radial-gradient(circle, ${colorSet.center}, ${adjustBrightness(colorSet.center, -20)})`;
    flowerHead.appendChild(center);

    // Assemble: stem grows up from bottom:0, head sits on top
    flower.appendChild(stem);
    // flower-head will be repositioned by JS when stem grows
    stem.appendChild(flowerHead);

    // Add to garden
    garden.appendChild(flower);

    // Animate stem growth smoothly
    requestAnimationFrame(() => {
        setTimeout(() => {
            stem.style.height = stemHeight + 'px';
        }, delay * 1000);
    });

    // Grow leaves after stem
    setTimeout(() => {
        stem.classList.add('grown');
    }, (delay + 2) * 1000);

    // Animate bloom after stem finishes
    setTimeout(() => {
        flowerHead.style.transform = 'scale(1)';
    }, (delay + 2.5) * 1000);

    // Gentle sway
    const swaySpeed = 3 + Math.random() * 2;
    flower.style.transition = 'transform 2s ease-out';
    
    // Start sway after bloom
    setTimeout(() => {
        let swayDir = 1;
        setInterval(() => {
            swayDir *= -1;
            flower.style.transform = `rotate(${angle + swayDir * 2}deg)`;
        }, swaySpeed * 1000);
    }, (delay + 3.5) * 1000);
}

function adjustBrightness(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// Add sway animation dynamically
const swayStyle = document.createElement('style');
swayStyle.textContent = `
    @keyframes sway {
        0% { transform: rotate(-3deg); }
        100% { transform: rotate(3deg); }
    }
`;
document.head.appendChild(swayStyle);

// Plant bouquet
function plantGarden() {
    const mobile = isMobile();
    const small = isSmallScreen();
    const flowerCount = mobile ? 7 : (small ? 9 : 11);
    const spreadAngle = mobile ? 40 : 50;
    const stemMin = mobile ? 100 : 130;
    const stemRange = mobile ? 130 : 150;

    // Create ribbon/wrap at the base
    const ribbon = document.createElement('div');
    ribbon.className = 'bouquet-ribbon';
    garden.appendChild(ribbon);

    // Show ribbon after a moment
    setTimeout(() => {
        ribbon.style.opacity = '1';
    }, 800);

    for (let i = 0; i < flowerCount; i++) {
        // Fan flowers evenly across the spread angle
        const t = flowerCount === 1 ? 0 : (i / (flowerCount - 1)) - 0.5;
        const angle = t * spreadAngle + (Math.random() - 0.5) * 4;
        const stemLen = stemMin + Math.random() * stemRange;
        const delay = 1 + Math.abs(t) * 2.5 + Math.random() * 0.5; // center blooms first, starts at 1s
        createFlower(angle, stemLen, delay);
    }
}

// ==========================================
//  ⭐ STARS
// ==========================================

function createStars() {
    const starCount = isMobile() ? 40 : 80;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 55 + '%';
        star.style.width = (1 + Math.random() * 3) + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = (Math.random() * 5) + 's';
        star.style.animationDuration = (2 + Math.random() * 4) + 's';
        document.body.appendChild(star);
    }
}

// ==========================================
//  💕 FLOATING HEARTS
// ==========================================

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = ['❤️', '💕', '💗', '💖', '💘', '🌹'][Math.floor(Math.random() * 6)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (12 + Math.random() * 20) + 'px';
    heart.style.animationDuration = (6 + Math.random() * 8) + 's';
    floatingHeartsContainer.appendChild(heart);

    setTimeout(() => heart.remove(), 14000);
}

// Floating hearts start after text is revealed
let floatingHeartsInterval;
function startFloatingHearts() {
    createFloatingHeart();
    const interval = isMobile() ? 2500 : 1500;
    floatingHeartsInterval = setInterval(createFloatingHeart, interval);
}

// ==========================================
//  🚀 INITIALIZE
// ==========================================

createStars();
plantGarden();

// Delay fireworks canvas animation until after text appears
setTimeout(() => {
    animateFireworks();
    autoLaunchFirework();
}, 9500);

// Start floating hearts after everything is revealed
setTimeout(startFloatingHearts, 10500);

// ==========================================
//  💌 CONFESSION POPUP
// ==========================================

const heartBtn = document.getElementById('heartBtn');
const confessionOverlay = document.getElementById('confessionOverlay');
const confessionClose = document.getElementById('confessionClose');
const passwordStep = document.getElementById('passwordStep');
const confessionStep = document.getElementById('confessionStep');
const passwordInput = document.getElementById('passwordInput');
const passwordBtn = document.getElementById('passwordBtn');
const passwordError = document.getElementById('passwordError');
const passwordHintReveal = document.getElementById('passwordHintReveal');

const SECRET = 'lover';
let failedAttempts = 0;

function openPopup() {
    // Reset to password step
    passwordStep.classList.add('active');
    confessionStep.classList.remove('active');
    passwordInput.value = '';
    passwordError.classList.remove('show');
    passwordHintReveal.classList.remove('show');
    failedAttempts = 0;
    confessionOverlay.classList.add('show');
    setTimeout(() => passwordInput.focus(), 500);
}

function closePopup() {
    confessionOverlay.classList.remove('show');
    setTimeout(() => {
        passwordStep.classList.remove('active');
        confessionStep.classList.remove('active');
    }, 500);
}

function tryPassword() {
    if (passwordInput.value.trim().toLowerCase() === SECRET) {
        // Correct! Show confession
        passwordStep.classList.remove('active');
        setTimeout(() => {
            confessionStep.classList.add('active');
        }, 300);
    } else {
        // Wrong password — shake!
        failedAttempts++;
        passwordError.classList.remove('show');
        void passwordError.offsetWidth; // force reflow for re-trigger
        passwordError.classList.add('show');
        if (failedAttempts >= 3) {
            passwordHintReveal.classList.add('show');
        }
        passwordInput.value = '';
        passwordInput.focus();
    }
}

heartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPopup();
});

passwordBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tryPassword();
});

passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryPassword();
});

confessionClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closePopup();
});

confessionOverlay.addEventListener('click', (e) => {
    if (e.target === confessionOverlay) {
        closePopup();
    }
});
