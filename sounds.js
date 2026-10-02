// ===== ФАЙЛ ЗВУКОВ (sounds.js) =====

let audioCtx = null;
let audioEnabled = false;
let soundVolume = 0.05; // Громкость от 0 до 1

// Инициализация аудио (нужна после первого клика пользователя)
function initAudio() {
    if (audioCtx) return;
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
            audioCtx = new Ctx();
            audioEnabled = true;
        }
    } catch(e) { 
        audioEnabled = false; 
    }
}

// Включить/выключить звук
function toggleSound() {
    audioEnabled = !audioEnabled;
    return audioEnabled;
}

// Установить громкость
function setVolume(level) {
    soundVolume = Math.max(0, Math.min(1, level));
}

// Звук прокрутки рулетки
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
        g.gain.setValueAtTime(soundVolume, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        o.start(audioCtx.currentTime);
        o.stop(audioCtx.currentTime + 0.03);
    } catch(e) {}
}

// Звук выигрыша (разный для каждой редкости)
function playWinSound(rarity) {
    if (!audioEnabled || !audioCtx) return;
    
    const sounds = {
        common:    [400, 500, 600],
        uncommon:  [500, 600, 700],
        rare:      [600, 700, 800, 900],
        epic:      [700, 800, 900, 1000, 1100],
        legendary: [800, 900, 1000, 1100, 1200, 1300]
    };
    
    const freqs = sounds[rarity] || sounds.common;
    
    freqs.forEach((freq, index) => {
        setTimeout(() => {
            try {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.frequency.setValueAtTime(freq, audioCtx.currentTime);
                g.gain.setValueAtTime(soundVolume, audioCtx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                o.start(audioCtx.currentTime);
                o.stop(audioCtx.currentTime + 0.2);
            } catch(e) {}
        }, index * 100);
    });
}

// Звук продажи (короткий "дзынь")
function playSellSound() {
    if (!audioEnabled || !audioCtx) return;
    try {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(800, audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(soundVolume, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        o.start(audioCtx.currentTime);
        o.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
}

// Звук клика по кнопке
function playClickSound() {
    if (!audioEnabled || !audioCtx) return;
    try {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(300, audioCtx.currentTime);
        g.gain.setValueAtTime(soundVolume * 0.5, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        o.start(audioCtx.currentTime);
        o.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
}
