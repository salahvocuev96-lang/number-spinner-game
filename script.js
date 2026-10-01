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

function playSpinSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(800, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.1);
    } catch(e) {}
}

function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#f39c12','#e74c3c','#9b59b6','#3498db','#2ecc71','#ffd700'];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    let id;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        if (particles.some(function(p) { return p.y < canvas.height; })) {
            id = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
    setTimeout(function() {
        cancelAnimationFrame(id);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
}

function saveProgress() {
    localStorage.setItem('numberSpinnerProgress', JSON.stringify({
        coins: gameState.coins,
        collection: gameState.collection,
        totalSpins: gameState.totalSpins,
        lastNumber: gameState.lastNumber
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('numberSpinnerProgress');
    if (saved) {
        try {
            const d = JSON.parse(saved);
            gameState.coins = d.coins || GAME_CONFIG.STARTING_COINS;
            gameState.collection = d.collection || {};
            gameState.totalSpins = d.totalSpins || 0;
            gameState.lastNumber = d.lastNumber || null;
        } catch(e) {}
    }
}

const gameState = {
    coins: GAME_CONFIG.STARTING_COINS,
    collection: {},
    totalSpins: 0,
    lastNumber: null,
    isSpinning: false
};

function getRarityName(r) {
    const names = { common: 'ОБЫЧНЫЙ', uncommon: 'НЕОБЫЧНЫЙ', rare: 'РЕДКИЙ', epic: 'ЭПИЧЕСКИЙ', legendary: 'ЛЕГЕНДАРНЫЙ' };
    return names[r] || r.toUpperCase();
}

function updateUI() {
    document.getElementById('coin-count').textContent = gameState.coins;
    document.getElementById('total-spins').textContent = gameState.totalSpins;
    document.getElementById('unique-found').textContent = Object.keys(gameState.collection).length;
    if (gameState.lastNumber) {
        document.getElementById('last-number').textContent = formatNumber(gameState.lastNumber);
        const r = calculateRarity(gameState.lastNumber);
        document.getElementById('last-rarity').textContent = getRarityName(r);
        document.getElementById('last-rarity').className = 'rarity-label ' + r;
    }
    document.getElementById('spin-btn').disabled = gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
}

async function spin() {
    if (gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST) return;
    gameState.isSpinning = true;
    gameState.coins -= GAME_CONFIG.SPIN_COST;
    updateUI();
    const targetRarity = getRandomRarity();
    const finalNumber = generateNumberByRarity(targetRarity);
    const duration = 3000;
    const startTime = Date.now();
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
        await new Promise(function(resolve) { setTimeout(resolve, 50 + progress * 200); });
    }
    pL1.textContent = finalNumber.letter1;
    pD1.textContent = finalNumber.digits.toString().padStart(3, '0');
    pL2.textContent = finalNumber.letters2;
    pR.textContent = finalNumber.region;
    const rarity = calculateRarity(finalNumber);
    rText.textContent = getRarityName(rarity);
    rBadge.className = 'rarity-badge ' + rarity;
    rBadge.classList.remove('hidden');
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
    setTimeout(function() { showResultScreen(finalNumber, rarity, GAME_CONFIG.REWARDS[rarity]); }, 1500);
}

function showResultScreen(number, rarity, reward) {
    document.getElementById('result-letter-1').textContent = number.letter1;
    document.getElementById('result-digits-1').textContent = number.digits.toString().padStart(3, '0');
    document.getElementById('result-letters-2').textContent = number.letters2;
    document.getElementById('result-region').textContent = number.region;
    document.getElementById('result-rarity-text').textContent = getRarityName(rarity);
    document.getElementById('result-rarity').className = 'rarity-badge ' + rarity;
    document.getElementById('reward-amount').textContent = reward;
    showScreen('result-screen');
}

function generateAllPossibleNumbers() {
    const numbers = [
        { letter1: 'А', digits: 777, letters2: 'АА', region: '77' },
        { letter1: 'В', digits: 111, letters2: 'ВВ', region: '77' },
        { letter1: 'А', digits: 777, letters2: 'ВВ', region: '77' },
        { letter1: 'Е', digits: 121, letters2: 'КК', region: '01' },
        { letter1: 'А', digits: 777, letters2: 'ВС', region: '77' },
        { letter1: 'К', digits: 123, letters2: 'АА', region: '02' },
        { letter1: 'М', digits: 7, letters2: 'ЕН', region: '77' },
        { letter1: 'А', digits: 121, letters2: 'ВС', region: '77' },
        { letter1: 'В', digits: 456, letters2: 'АА', region: '01' }
    ];
    for (let i = 0; i < 20; i++) numbers.push(generateNumber());
    return numbers;
}

function renderCollection(filter) {
    if (!filter) filter = 'all';
    const list = document.getElementById('collection-list');
    list.innerHTML = '';
    const allNumbers = generateAllPossibleNumbers();
    document.getElementById('collection-total').textContent = allNumbers.length;
    let filtered;
    if (filter === 'all') {
        filtered = allNumbers;
    } else {
        filtered = allNumbers.filter(function(n) { return calculateRarity(n) === filter; });
    }
    filtered.forEach(function(number) {
        const formatted = formatNumber(number);
        const found = gameState.collection[formatted];
        const rarity = calculateRarity(number);
        const item = document.createElement('div');
        item.className = 'collection-item' + (found ? '' : ' locked');
        let html = '<div class="number">' + formatted + '</div>';
        html += '<div class="rarity ' + rarity + '">' + getRarityName(rarity) + '</div>';
        if (found) {
            const price = SELL_PRICES[rarity] || 1;
            html += '<div class="count">Найдено: ' + found.count + ' раз</div>';
            html += '<button class="sell-btn" onclick="sellDuplicate(\'' + formatted + '\')">Продать (+' + price + ' 🪙)</button>';
        } else {
            html += '<div class="count">Не найдено</div>';
        }
        item.innerHTML = html;
        list.appendChild(item);
    });
    document.getElementById('collection-count').textContent = Object.keys(gameState.collection).length;
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
    const activeFilter = document.querySelector('.filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.rarity : 'all';
    renderCollection(filter);
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

document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        e.target.classList.add('active');
        renderCollection(e.target.dataset.rarity);
    });
});

loadProgress();
updateUI();
