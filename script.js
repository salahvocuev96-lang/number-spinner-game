const GAME_CONFIG = {
    SPIN_COST: 50,
    STARTING_COINS: 1000,
    
    REWARDS: {
        common: 1,
        uncommon: 3,
        rare: 10,
        epic: 50,
        legendary: 500
    },
    
    RARITY_CHANCES: {
        common: 0.70,
        uncommon: 0.20,
        rare: 0.07,
        epic: 0.025,
        legendary: 0.005
    },
    
    ALLOWED_LETTERS: ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'],
    
    REGIONS: ['01','02','03','04','05','06','07','08','09','10',
              '11','12','13','14','15','16','17','18','19','20',
              '21','22','23','24','25','26','27','28','29','30',
              '31','32','33','34','35','36','37','38','39','40',
              '41','42','43','44','45','46','47','48','49','50',
              '51','52','53','54','55','56','57','58','59','60',
              '61','62','63','64','65','66','67','68','69','70',
              '71','72','73','74','75','76','77','78','79','80',
              '81','82','83','84','85','86','87','88','89','90',
              '91','92','93','94','95','96','97','98','99']
};

function calculateRarity(number) {
    const digitStr = number.digits.toString().padStart(3, '0');
    
    if (digitStr === '777' && number.letters2 === 'АА' && number.region === '77') {
        return 'legendary';
    }
    
    if (digitStr[0] === digitStr[1] && digitStr[1] === digitStr[2] &&
        number.letters2[0] === number.letters2[1]) {
        return 'epic';
    }
    
    if (digitStr[0] === digitStr[2] && digitStr[0] !== digitStr[1] &&
        number.letters2[0] === number.letters2[1]) {
        return 'epic';
    }
    
    if (digitStr[0] === digitStr[1] && digitStr[1] === digitStr[2]) {
        return 'rare';
    }
    
    if (digitStr[0] === '0' && digitStr[1] === '0' && digitStr[2] !== '0') {
        return 'rare';
    }
    
    if ((digitStr === '123' || digitStr === '321') && number.letters2[0] === number.letters2[1]) {
        return 'rare';
    }
    
    if (digitStr[0] === digitStr[1] || digitStr[1] === digitStr[2] || digitStr[0] === digitStr[2]) {
        return 'uncommon';
    }
    
    if (number.letters2[0] === number.letters2[1]) {
        return 'uncommon';
    }
    
    return 'common';
}

function generateNumber() {
    const letter1 = GAME_CONFIG.ALLOWED_LETTERS[Math.floor(Math.random() * GAME_CONFIG.ALLOWED_LETTERS.length)];
    const digits = Math.floor(Math.random() * 1000);
    const letters2 = Array.from({ length: 2 }, () => 
        GAME_CONFIG.ALLOWED_LETTERS[Math.floor(Math.random() * GAME_CONFIG.ALLOWED_LETTERS.length)]
    ).join('');
    const region = GAME_CONFIG.REGIONS[Math.floor(Math.random() * GAME_CONFIG.REGIONS.length)];
    
    return { letter1, digits, letters2, region };
}

function generateNumberByRarity(targetRarity) {
    for (let i = 0; i < 1000; i++) {
        const number = generateNumber();
        if (calculateRarity(number) === targetRarity) {
            return number;
        }
    }
    return generateNumber();
}

function getRandomRarity() {
    const roll = Math.random();
    let cumulative = 0;
    
    for (const [rarity, chance] of Object.entries(GAME_CONFIG.RARITY_CHANCES)) {
        cumulative += chance;
        if (roll <= cumulative) {
            return rarity;
        }
    }
    return 'common';
}

function formatNumber(number) {
    const digits = number.digits.toString().padStart(3, '0');
    return `${number.letter1}${digits}${number.letters2}${number.region}`;
}

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSpinSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.1);
}

function playWinSound(rarity) {
    const frequencies = {
        common: [400, 500, 600],
        uncommon: [500, 600, 700],
        rare: [600, 700, 800, 900],
        epic: [700, 800, 900, 1000, 1100],
        legendary: [800, 900, 1000, 1100, 1200, 1300]
    };
    
    const freqs = frequencies[rarity] || frequencies.common;
    
    freqs.forEach((freq, index) => {
        setTimeout(() => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        }, index * 100);
    });
}

function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#f39c12', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#ffd700'];
    
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
    
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
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
        
        if (particles.some(p => p.y < canvas.height)) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
    
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
}

function saveProgress() {
    const data = {
        coins: gameState.coins,
        collection: gameState.collection,
        totalSpins: gameState.totalSpins,
        lastNumber: gameState.lastNumber
    };
    localStorage.setItem('numberSpinnerProgress', JSON.stringify(data));
}

function loadProgress() {
    const saved = localStorage.getItem('numberSpinnerProgress');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.coins = data.coins || GAME_CONFIG.STARTING_COINS;
        gameState.collection = data.collection || {};
        gameState.totalSpins = data.totalSpins || 0;
        gameState.lastNumber = data.lastNumber || null;
    }
}

const gameState = {
    coins: GAME_CONFIG.STARTING_COINS,
    collection: {},
    totalSpins: 0,
    lastNumber: null,
    isSpinning: false
};

function getRarityName(rarity) {
    const names = {
        common: 'ОБЫЧНЫЙ',
        uncommon: 'НЕОБЫЧНЫЙ',
        rare: 'РЕДКИЙ',
        epic: 'ЭПИЧЕСКИЙ',
        legendary: 'ЛЕГЕНДАРНЫЙ'
    };
    return names[rarity] || rarity.toUpperCase();
}

function updateUI() {
    document.getElementById('coin-count').textContent = gameState.coins;
    document.getElementById('total-spins').textContent = gameState.totalSpins;
    document.getElementById('unique-found').textContent = Object.keys(gameState.collection).length;
    
    if (gameState.lastNumber) {
        const formatted = formatNumber(gameState.lastNumber);
        const rarity = calculateRarity(gameState.lastNumber);
        document.getElementById('last-number').textContent = formatted;
        document.getElementById('last-rarity').textContent = getRarityName(rarity);
        document.getElementById('last-rarity').className = `rarity-label ${rarity}`;
    }
    
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = gameState.isSpinning || gameState.coins < GAME_CONFIG.SPIN_COST;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
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
    const updateInterval = 50;
    
    const plateLetter1 = document.getElementById('plate-letter-1');
    const plateDigits1 = document.getElementById('plate-digits-1');
    const plateLetters2 = document.getElementById('plate-letters-2');
    const plateRegion = document.getElementById('plate-region');
    const rarityBadge = document.getElementById('rarity-badge');
    const rarityText = document.getElementById('rarity-text');
    
    rarityBadge.classList.add('hidden');
    
    while (Date.now() - startTime < duration) {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        const currentInterval = updateInterval + (progress * 200);
        
        const tempNumber = generateNumber();
        plateLetter1.textContent = tempNumber.letter1;
        plateDigits1.textContent = tempNumber.digits.toString().padStart(3, '0');
        plateLetters2.textContent = tempNumber.letters2;
        plateRegion.textContent = tempNumber.region;
        
        playSpinSound();
        
        await new Promise(resolve => setTimeout(resolve, currentInterval));
    }
    
    plateLetter1.textContent = finalNumber.letter1;
    plateDigits1.textContent = finalNumber.digits.toString().padStart(3, '0');
    plateLetters2.textContent = finalNumber.letters2;
    plateRegion.textContent = finalNumber.region;
    
    const rarity = calculateRarity(finalNumber);
    rarityText.textContent = getRarityName(rarity);
    rarityBadge.className = `rarity-badge ${rarity}`;
    rarityBadge.classList.remove('hidden');
    
    gameState.totalSpins++;
    gameState.lastNumber = finalNumber;
    
    const formatted = formatNumber(finalNumber);
    if (!gameState.collection[formatted]) {
        gameState.collection[formatted] = {
            number: finalNumber,
            rarity: rarity,
            count: 0
        };
    }
    gameState.collection[formatted].count++;
    
    const reward = GAME_CONFIG.REWARDS[rarity];
    gameState.coins += reward;
    
    playWinSound(rarity);
    if (rarity === 'epic' || rarity === 'legendary') {
        createConfetti();
    }
    
    saveProgress();
    updateUI();
    
    // Разблокируем кнопку после прокрута
    gameState.isSpinning = false;
    updateUI();
    
    setTimeout(() => {
        showResultScreen(finalNumber, rarity, reward);
    }, 1500);
}

function showResultScreen(number, rarity, reward) {
    document.getElementById('result-letter-1').textContent = number.letter1;
    document.getElementById('result-digits-1').textContent = number.digits.toString().padStart(3, '0');
    document.getElementById('result-letters-2').textContent = number.letters2;
    document.getElementById('result-region').textContent = number.region;
    
    const resultRarity = document.getElementById('result-rarity');
    document.getElementById('result-rarity-text').textContent = getRarityName(rarity);
    resultRarity.className = `rarity-badge ${rarity}`;
    
    document.getElementById('reward-amount').textContent = reward;
    
    showScreen('result-screen');
}

// Цены продажи дубликатов по редкости
const SELL_PRICES = {
    common: 5,
    uncommon: 15,
    rare: 50,
    epic: 200,
    legendary: 1000
};

function renderCollection(filter = 'all') {
    const collectionList = document.getElementById('collection-list');
    collectionList.innerHTML = '';
    const allNumbers = generateAllPossibleNumbers();
    document.getElementById('collection-total').textContent = allNumbers.length;
    
    const filtered = filter === 'all' ? allNumbers : allNumbers.filter(n => calculateRarity(n) === filter);
    
    filtered.forEach(number => {
        const formatted = formatNumber(number);
        const found = gameState.collection[formatted];
        const rarity = calculateRarity(number);
        const item = document.createElement('div');
        item.className = `collection-item ${found ? '' : 'locked'}`;
        
        let html = `
            <div class="number">${formatted}</div>
            <div class="rarity ${rarity}">${getRarityName(rarity)}</div>
        `;
        
        if (found) {
            html += `<div class="count">Найдено: ${found.count} раз</div>`;
            // Кнопка продажи появляется только если есть дубликат (count > 1)
            if (found.count > 1) {
                const price = SELL_PRICES[rarity] || 1;
                html += `<button class="sell-btn" onclick="sellDuplicate('${formatted}')">Продать дубликат (+${price} 🪙)</button>`;
            }
        } else {
            html += '<div class="count">Не найдено</div>';
        }
        
        item.innerHTML = html;
        collectionList.appendChild(item);
    });
    document.getElementById('collection-count').textContent = Object.keys(gameState.collection).length;
}

// Функция продажи дубликата
function sellDuplicate(formatted) {
    const item = gameState.collection[formatted];
    if (!item || item.count <= 1) return;
    
    const rarity = item.rarity;
    const price = SELL_PRICES[rarity] || 1;
    
    // Уменьшаем количество
    item.count--;
    
    // Начисляем монеты
    gameState.coins += price;
    
    // Сохраняем и обновляем
    saveProgress();
    updateUI();
    renderCollection(document.querySelector('.filter-btn.active').dataset.rarity);
    
    // Визуальный эффект
    const coinEl = document.getElementById('coin-count');
    coinEl.style.transform = 'scale(1.3)';
    coinEl.style.color = '#ffd700';
    setTimeout(() => {
        coinEl.style.transform = 'scale(1)';
        coinEl.style.color = '';
    }, 300);
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
    
    for (let i = 0; i < 20; i++) {
        numbers.push(generateNumber());
    }
    
    return numbers;
}

document.getElementById('spin-btn').addEventListener('click', spin);

document.getElementById('close-result-btn').addEventListener('click', () => {
    showScreen('main-screen');
    updateUI();
});

document.getElementById('collection-btn').addEventListener('click', () => {
    renderCollection();
    showScreen('collection-screen');
});

document.getElementById('back-btn').addEventListener('click', () => {
    showScreen('main-screen');
    updateUI();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderCollection(e.target.dataset.rarity);
    });
});

loadProgress();
updateUI();

document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });
