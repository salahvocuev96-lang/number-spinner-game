const GAME_CONFIG = {
    SPIN_COST: 50,
    STARTING_COINS: 1000,
    REWARDS: { common: 1, uncommon: 3, rare: 10, epic: 50, legendary: 500 },
    RARITY_CHANCES: { common: 0.70, uncommon: 0.20, rare: 0.07, epic: 0.025, legendary: 0.005 },
    ALLOWED_LETTERS: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],
    REGIONS: ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','101','102','113','121','123','124','125','134','136','138','142','150','152','154','159','161','163','164','173','174','177','178','186','190','193','196','197','198','199','750','777','799']
};

const SELL_PRICES = { common: 5, uncommon: 15, rare: 50, epic: 200, legendary: 1000 };

let audioCtx = null;
let audioEnabled = false;

function initAudio() {
    if (audioCtx) return;
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
            audioCtx = new Ctx();
            audioEnabled = true;
        }
    } catch(e) { audioEnabled = false; }
}

function playSpinSound() {
    if (!audioEnabled || !audioCtx) return;
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.setValueAtTime(600, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);
        g.gain.setValueAtTime(0.03, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        o.start(audioCtx.currentTime);
        o.stop(audioCtx.currentTime + 0.03);
    } catch(e) {}
}

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
    const letters2 = GAME_CONFIG.ALLOWED_LETTERS[Math.floor(Math.random() * GAME_CONFIG.ALLOWED_LETTERS.length)] + GAME_CONFIG.ALLOWED_LETTERS[Math.floor(Math.random() * GAME_CONFIG.ALLOWED_LETTERS.length)];
    const region = GAME_CONFIG.REGIONS[Math.floor(Math.random() * GAME_CONFIG.REGIONS.length)];
    return { letter1: letter1, digits: digits, letters2: letters2, region: region };
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
    for (const key in GAME_CONFIG.RARITY_CHANCES) {
        cum += GAME_CONFIG.RARITY_CHANCES[key];
        if (roll <= cum) return key;
    }
    return 'common';
}

function formatNumber(n) {
    return n.letter1 + n.digits.toString().padStart(3, '0') + n.letters2 + n.region;
}

function parsePlateString(str) {
    const letter1 = str[0];
    const digits = str.substring(1, 4);
    const letters2 = str.substring(4, 6);
    const region = str.substring(6);
    return { letter1, digits, letters2, region };
}

function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#f39c12','#e74c3c','#9b59b6','#3498db','#2ecc71','#ffd700'];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8
        });
    }
    let startTime = Date.now();
    function animate() {
        if (Date.now() - startTime > 2000) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

function saveProgress() {
    try {
        localStorage.setItem('numberSpinnerProgress', JSON.stringify({
            coins: gameState.coins,
            collection: gameState.collection,
            totalSpins: gameState.totalSpins,
            lastNumber: gameState.lastNumber,
            garagePlate: gameState.garagePlate
        }));
    } catch(e) {}
}

function loadProgress() {
    try {
        const saved = localStorage.getItem('numberSpinnerProgress');
        if (saved) {
            const d = JSON.parse(saved);
            gameState.coins = d.coins || GAME_CONFIG.STARTING_COINS;
            gameState.collection = d.collection || {};
            gameState.totalSpins = d.totalSpins || 0;
            gameState.lastNumber = d.lastNumber || null;
            gameState.garagePlate = d.garagePlate || null;
        }
    } catch(e) {}
}

const gameState = {
    coins: GAME_CONFIG.STARTING_COINS,
    collection: {},
    totalSpins: 0,
    lastNumber: null,
    isSpinning: false,
    garagePlate: null
};

function getRarityName(r) {
    const names = { common: 'ОБЫЧНЫЙ', uncommon: 'НЕОБЫЧНЫЙ', rare: 'РЕДКИЙ', epic: 'ЭПИЧЕСКИЙ', legendary: 'ЛЕГЕНДАРНЫЙ' };
    return names[r] || r.toUpperCase();
}

function updateMainScreen() {
    const plateStr = gameState.garagePlate || 'А000АА77';
    const p = parsePlateString(plateStr);
    
    const pL1 = document.getElementById('plate-letter-1');
    const pD1 = document.getElementById('plate-digits-1');
    const pL2 = document.getElementById('plate-letters-2');
    const pR = document.getElementById('plate-region');
    
    if (pL1) pL1.textContent = p.letter1;
    if (pD1) pD1.textContent = p.digits;
    if (pL2) pL2.textContent = p.letters2;
    if (pR) pR.textContent = p.region;
}

function updateUI() {
    const coinEl = document.getElementById('coin-count');
    if (coinEl) coinEl.textContent = gameState.coins;
    const spinsEl = document.getElementById('total-spins');
    if (spinsEl) spinsEl.textContent = gameState.totalSpins;
    const foundEl = document.getElementById('unique-found');
    if (foundEl) foundEl.textContent = Object.keys(gameState.collection).length;
    
    if (gameState.lastNumber) {
        const ln = document.getElementById('last-number');
        if (ln) ln.textContent = formatNumber(gameState.lastNumber);
        const lr = document.getElementById('last-rarity');
        if (lr) {
            const r = calculateRarity(gameState.lastNumber);
            lr.textContent = getRarityName(r);
            lr.className = 'rarity-label ' + r;
        }
    }
    
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST;
}

function showScreen(id) {
    const screens = document.querySelectorAll('.screen');
    for (let i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

async function spin() {
    if (gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST) return;
    
    gameState.isSpinning = true;
    gameState.coins -= GAME_CONFIG.SPIN_COST;
    updateUI();
    
    const targetRarity = getRandomRarity();
    const finalNumber = generateNumberByRarity(targetRarity);
    const duration = 2000;
    const startTime = Date.now();
    
    const pL1 = document.getElementById('plate-letter-1');
    const pD1 = document.getElementById('plate-digits-1');
    const pL2 = document.getElementById('plate-letters-2');
    const pR = document.getElementById('plate-region');
    const rBadge = document.getElementById('rarity-badge');
    const rText = document.getElementById('rarity-text');
    
    if (rBadge) rBadge.classList.add('hidden');
    
    while (Date.now() - startTime < duration) {
        const progress = (Date.now() - startTime) / duration;
        const tempNumber = generateNumber();
        if (pL1) pL1.textContent = tempNumber.letter1;
        if (pD1) pD1.textContent = tempNumber.digits.toString().padStart(3, '0');
        if (pL2) pL2.textContent = tempNumber.letters2;
        if (pR) pR.textContent = tempNumber.region;
        playSpinSound();
        await new Promise(function(resolve) { setTimeout(resolve, 30 + progress * 100); });
    }
    
    if (pL1) pL1.textContent = finalNumber.letter1;
    if (pD1) pD1.textContent = finalNumber.digits.toString().padStart(3, '0');
    if (pL2) pL2.textContent = finalNumber.letters2;
    if (pR) pR.textContent = finalNumber.region;
    
    const rarity = calculateRarity(finalNumber);
    if (rText) rText.textContent = getRarityName(rarity);
    if (rBadge) {
        rBadge.className = 'rarity-badge ' + rarity;
        rBadge.classList.remove('hidden');
    }
    
    gameState.totalSpins++;
    gameState.lastNumber = finalNumber;
    const formatted = formatNumber(finalNumber);
    
    if (!gameState.collection[formatted]) {
        gameState.collection[formatted] = { number: finalNumber, rarity: rarity, count: 0 };
    }
    gameState.collection[formatted].count++;
    gameState.coins += GAME_CONFIG.REWARDS[rarity];
    
    if (rarity === 'epic' || rarity === 'legendary') createConfetti();
    
    saveProgress();
    gameState.isSpinning = false;
    updateUI();
    
    setTimeout(function() { showResultScreen(finalNumber, rarity, GAME_CONFIG.REWARDS[rarity]); }, 1000);
}

function showResultScreen(number, rarity, reward) {
    const rl1 = document.getElementById('result-letter-1');
    const rd1 = document.getElementById('result-digits-1');
    const rl2 = document.getElementById('result-letters-2');
    const rr = document.getElementById('result-region');
    
    if (rl1) rl1.textContent = number.letter1;
    if (rd1) rd1.textContent = number.digits.toString().padStart(3, '0');
    if (rl2) rl2.textContent = number.letters2;
    if (rr) rr.textContent = number.region;
    
    const rrt = document.getElementById('result-rarity-text');
    if (rrt) rrt.textContent = getRarityName(rarity);
    const rrEl = document.getElementById('result-rarity');
    if (rrEl) rrEl.className = 'rarity-badge ' + rarity;
    const ra = document.getElementById('reward-amount');
    if (ra) ra.textContent = reward;
    
    const sellBtn = document.getElementById('sell-result-btn');
    if (sellBtn) {
        const formatted = formatNumber(number);
        const price = SELL_PRICES[rarity] || 1;
        sellBtn.textContent = 'Продать (+' + price + ' 🪙)';
        sellBtn.className = 'sell-result-btn';
        sellBtn.disabled = false;
        sellBtn.onclick = function() {
            if (gameState.collection[formatted] && gameState.collection[formatted].count > 0) {
                gameState.collection[formatted].count--;
                if (gameState.collection[formatted].count <= 0) {
                    delete gameState.collection[formatted];
                }
                gameState.coins += price;
                saveProgress();
                updateUI();
                updateMainScreen();
                sellBtn.textContent = 'Продано!';
                sellBtn.className = 'sell-result-btn sold';
                sellBtn.disabled = true;
            }
        };
    }
    
    showScreen('result-screen');
}

function renderCollection(filter) {
    const list = document.getElementById('collection-list');
    if (!list) return;
    list.innerHTML = '';
    const collectionKeys = Object.keys(gameState.collection);
    
    if (collectionKeys.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 40px; opacity: 0.5;">Коллекция пуста. Крути рулетку!</div>';
        const countEl = document.getElementById('collection-count');
        if (countEl) countEl.textContent = '0';
        const totalEl = document.getElementById('collection-total');
        if (totalEl) totalEl.textContent = '0';
        const sellAllBtn = document.getElementById('sell-all-btn');
        if (sellAllBtn) sellAllBtn.disabled = true;
        return;
    }
    
    let foundCount = 0;
    
    for (let i = 0; i < collectionKeys.length; i++) {
        const formatted = collectionKeys[i];
        const item = gameState.collection[formatted];
        const rarity = item.rarity;
        
        if (filter && filter !== 'all' && rarity !== filter) continue;
        
        foundCount++;
        const price = SELL_PRICES[rarity] || 1;
        
        const div = document.createElement('div');
        div.className = 'collection-item';
        div.innerHTML = '<div class="number">' + formatted + '</div>' +
            '<div class="rarity ' + rarity + '">' + getRarityName(rarity) + '</div>' +
            '<div class="count">Найдено: ' + item.count + ' раз</div>' +
            '<button class="sell-btn" onclick="sellDuplicate(\'' + formatted + '\')">Продать (+' + price + ' )</button>' +
            '<button class="garage-btn" style="margin-top:5px; width:100%; padding:8px 12px; background:linear-gradient(135deg, #3498db, #2980b9); border:none; border-radius:8px; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="addToGarage(\'' + formatted + '\')">В гараж </button>';
        list.appendChild(div);
    }
    
    const countEl = document.getElementById('collection-count');
    if (countEl) countEl.textContent = foundCount;
    const totalEl = document.getElementById('collection-total');
    if (totalEl) totalEl.textContent = collectionKeys.length;
    const sellAllBtn = document.getElementById('sell-all-btn');
    if (sellAllBtn) sellAllBtn.disabled = false;
}

function sellDuplicate(formatted) {
    const item = gameState.collection[formatted];
    if (!item || item.count <= 0) return;
    
    const price = SELL_PRICES[item.rarity] || 1;
    item.count--;
    
    if (item.count <= 0) {
        delete gameState.collection[formatted];
    }
    
    gameState.coins += price;
    saveProgress();
    updateUI();
    updateMainScreen();
    
    const activeFilter = document.querySelector('.filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.rarity : 'all';
    renderCollection(filter);
}

function addToGarage(formatted) {
    gameState.garagePlate = formatted;
    saveProgress();
    updateMainScreen();
    alert('Номер ' + formatted + ' установлен в гараж!');
}

function sellAll() {
    const keys = Object.keys(gameState.collection);
    if (keys.length === 0) return;
    
    let totalEarned = 0;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = gameState.collection[key];
        const price = SELL_PRICES[item.rarity] || 1;
        totalEarned += price * item.count;
        delete gameState.collection[key];
    }
    
    gameState.coins += totalEarned;
    gameState.garagePlate = null;
    
    saveProgress();
    updateUI();
    updateMainScreen();
    renderCollection('all');
    
    alert('Вся коллекция продана! Получено: ' + totalEarned + ' монет');
}

document.getElementById('spin-btn').addEventListener('click', spin);

document.getElementById('close-result-btn').addEventListener('click', function() {
    showScreen('main-screen');
    updateUI();
});

document.getElementById('collection-btn').addEventListener('click', function() {
    renderCollection('all');
    showScreen('collection-screen');
});

document.getElementById('back-btn').addEventListener('click', function() {
    showScreen('main-screen');
    updateUI();
});

document.getElementById('sell-all-btn').addEventListener('click', function() {
    const keys = Object.keys(gameState.collection);
    if (keys.length === 0) {
        alert('Коллекция пуста!');
        return;
    }
    if (confirm('Продать ВСЕ номера из коллекции?')) {
        sellAll();
    }
});

const filterBtns = document.querySelectorAll('.filter-btn');
for (let i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener('click', function(e) {
        for (let j = 0; j < filterBtns.length; j++) filterBtns[j].classList.remove('active');
        e.target.classList.add('active');
        renderCollection(e.target.dataset.rarity);
    });
}

document.addEventListener('click', function() {
    initAudio();
}, { once: true });

loadProgress();
updateUI();
updateMainScreen();
