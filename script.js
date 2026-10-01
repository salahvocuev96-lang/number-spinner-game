const GAME_CONFIG = {
    SPIN_COST: 50,
    STARTING_COINS: 1000,
    REWARDS: { common: 1, uncommon: 3, rare: 10, epic: 50, legendary: 500 },
    RARITY_CHANCES: { common: 0.70, uncommon: 0.20, rare: 0.07, epic: 0.025, legendary: 0.005 },
    ALLOWED_LETTERS: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],
    REGIONS: ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99']
};

const SELL_PRICES = { common: 5, uncommon: 15, rare: 50, epic: 200, legendary: 1000 };

function calculateRarity(number) {
    const d = number.digits.toString().padStart(3, '0');
    if (d === '777' && number.letters2 === 'АА' && number.region === '77') return 'legendary';
    if (d[0] === d[1] && d[1] === d[2] && number.letters2[0] === number.letters2[1]) return 'epic';
    if (d[0] === d[2] && d[0] !== d[1] && number.letters2[0] === number.letters2[1]) return 'epic';
    if (d[0] === d[1] && d[1] === d[2]) return 'rare';
    if (d[0] === '0' && d[1] === '0' && d[2] !== '0') return 'rare';
    if ((d === '123' || d === '321') && number.letters2[0] === number.letters2[1]) return 'rare';
    if (d[0] === d[1] || d[1] === d[2] || d[0] === d[2]) return 'uncommon';
    if (number.letters2[0] === number.letters2[1]) return 'uncommon';
    return 'common';
}

function generateNumber() {
    const letter1 = GAME_CONFIG.ALLOWED_LETTERS[Math.floor(Math.random() * GAME_CONFIG.ALLOWED_LETTERS.length)];
    const digits = Math.floor(Math.random() * 1000);
    const letters2 = Array.from({length: 2}, () => GAME_CONFIG.ALLOWED_LETTERS[Math.floor(Math.random() * GAME_CONFIG.ALLOWED_LETTERS.length)]).join('');
    const region = GAME_CONFIG.REGIONS[Math.floor(Math.random() * GAME_CONFIG.REGIONS.length)];
    return { letter1, digits, letters2, region };
}

function generateNumberByRarity(targetRarity) {
    for (let i = 0; i < 1000; i++) {
        const n = generateNumber();
        if (calculateRarity(n) === targetRarity) return n;
    }
    return generateNumber();
}

function getRandomRarity() {
    const roll = Math.random();
    let cum = 0;
    for (const [r, c] of Object.entries(GAME_CONFIG.RARITY_CHANCES)) {
        cum += c;
        if (roll <= cum) return r;
    }
    return 'common';
}

function formatNumber(n) {
    return `${n.letter1}${n.digits.toString().padStart(3, '0')}${n.letters2}${n.region}`;
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSpinSound() {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.setValueAtTime(800, audioCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    o.start(audioCtx.currentTime); o.stop(audioCtx.currentTime + 0.1);
}

function playWinSound(rarity) {
    const freqs = { common: [400,500,600], uncommon: [500,600,700], rare: [600,700,800,900], epic: [700,800,900,1000,1100], legendary: [800,900,1000,1100,1200,1300] };
    (freqs[rarity] || freqs.common).forEach((f, i) => {
        setTimeout(() => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.frequency.setValueAtTime(f, audioCtx.currentTime);
            g.gain.setValueAtTime(0.1, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            o.start(audioCtx.currentTime); o.stop(audioCtx.currentTime + 0.2);
        }, i * 100);
    });
}

function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#f39c12','#e74c3c','#9b59b6','#3498db','#2ecc71','#ffd700'];
    for (let i = 0; i < 100; i++) {
        particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height - canvas.height, vx: (Math.random()-0.5)*4, vy: Math.random()*3+2, color: colors[Math.floor(Math.random()*colors.length)], size: Math.random()*8+4, rotation: Math.random()*360, rotationSpeed: (Math.random()-0.5)*10 });
    }
    let id;
    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed;
            ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation*Math.PI/180);
            ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.restore();
        });
        if (particles.some(p => p.y < canvas.height)) id = requestAnimationFrame(animate);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    animate();
    setTimeout(() => { cancelAnimationFrame(id); ctx.clearRect(0,0,canvas.width,canvas.height); }, 3000);
}

function saveProgress() {
    localStorage.setItem('numberSpinnerProgress', JSON.stringify({ coins: gameState.coins, collection: gameState.collection, totalSpins: gameState.totalSpins, lastNumber: gameState.lastNumber }));
}

function loadProgress() {
    const saved = localStorage.getItem('numberSpinnerProgress');
    if (saved) {
        const d = JSON.parse(saved);
        gameState.coins = d.coins || GAME_CONFIG.STARTING_COINS;
        gameState.collection = d.collection || {};
        gameState.totalSpins = d.totalSpins || 0;
        gameState.lastNumber = d.lastNumber || null;
    }
}

const gameState = { coins: GAME_CONFIG.STARTING_COINS, collection: {}, totalSpins: 0, lastNumber: null, isSpinning: false };

function getRarityName(r) {
    return { common: 'ОБЫЧНЫЙ', uncommon: 'НЕОБЫЧНЫЙ', rare: 'РЕДКИЙ', epic: 'ЭПИЧЕСКИЙ', legendary: 'ЛЕГЕНДАРНЫЙ' }[r] || r.toUpperCase();
}

function updateUI() {
    document.getElementById('coin-count').textContent = gameState.coins;
    document.getElementById('total-spins').textContent = gameState.totalSpins;
    document.getElementById('unique-found').textContent = Object.keys(gameState.collection).length;
    if (gameState.lastNumber) {
        document.getElementById('last-number').textContent = formatNumber(gameState.lastNumber);
        const r = calculateRarity(gameState.lastNumber);
        document.getElementById('last-rarity').textContent = getRarityName(r);
        document.getElementById('last-rarity').className = `rarity-label ${r}`;
    }
    document.getElementById('spin-btn').disabled = gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function spin() {
    if (gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST) return;
    gameState.isSpinning = true;
    gameState.coins -= GAME_CONFIG.SPIN_COST;
    updateUI();
    const targetRarity = getRandomRarity();
    const finalNumber = generateNumberByRarity(targetRarity);
    const duration = 3000, startTime = Date.now(), updateInterval = 50;
    const pL1 = document.getElementById('plate-letter-1');
    const pD1 = document.getElementById('plate-digits-1');
    const pL2 = document.getElementById('plate-letters-2');
    const pR = document.getElementById('plate-region');
    const rBadge = document.getElementById('rarity-badge');
    const rText = document.getElementById('rarity-text');
    rBadge.classList.add('hidden');
    while (Date.now() - startTime < duration) {
        const progress = (Date.now() - startTime) / duration;
        const tempNumber = generateNumber();
        pL1.textContent = tempNumber.letter1;
        pD1.textContent = tempNumber.digits.toString().padStart(3, '0');
        pL2.textContent = tempNumber.letters2;
        pR.textContent = tempNumber.region;
        playSpinSound();
        await new Promise(r => setTimeout(r, updateInterval + progress * 20
