// ==========================================
// REGISTRASI SERVICE WORKER (PWA & OFFLINE)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// ==========================================
// KONFIGURASI USER & NAVIGASI
// ==========================================
const USERS = {
    "Membervip": "123",
    "RyzziSiber": "999"
};

function navigateToTab(tabName) {
    document.querySelectorAll('.menu-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    if(tabName === 'home') {
        document.getElementById('page-home').classList.add('active');
        document.getElementById('nav-home').classList.add('active');
    } else if(tabName === 'stats') {
        document.getElementById('page-stats').classList.add('active');
        document.getElementById('nav-stats').classList.add('active');
    } else if(tabName === 'profile') {
        document.getElementById('page-profile').classList.add('active');
        document.getElementById('nav-profile').classList.add('active');
        // Panggil deteksi device saat tab profile dibuka
        getDeviceAndIP();
    }
}

function navigateToPage(pageId) {
    document.querySelectorAll('.menu-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById('page-' + pageId).classList.add('active');
    document.getElementById('nav-tools').classList.add('active');
}

// ==========================================
// SISTEM DETEKSI DEVICE & IP ASLI
// ==========================================
async function getDeviceAndIP() {
    const ipTarget = document.getElementById('user-ip');
    const deviceTarget = document.getElementById('user-device');

    // 1. Deteksi Sistem Operasi / Perangkat
    const ua = navigator.userAgent;
    let deviceName = "Unknown Device";
    
    if (/android/i.test(ua)) {
        deviceName = "Android Smartphone";
    } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        deviceName = "Apple iOS Device";
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
        deviceName = "MacBook / macOS";
    } else if (/Windows NT/i.test(ua)) {
        deviceName = "Windows PC";
    } else if (/Linux/i.test(ua)) {
        deviceName = "Linux Desktop";
    }
    deviceTarget.textContent = deviceName;

    // 2. Mengambil IP Publik Menggunakan API ipify
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipTarget.textContent = data.ip;
    } catch (error) {
        ipTarget.textContent = "Gagal memuat (Offline/Blocked)";
    }
}

// ==========================================
// LOGIKA JAM & UTILITY FITUR SHOLAT 
// ==========================================
function startLiveClockAndSholat() {
    const clockEl = document.getElementById('live-clock');
    
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        if (clockEl) clockEl.textContent = timeStr;
        
        // Pengecekan Highlight Waktu Sholat Terdekat (Sederhana)
        const currentHourMin = timeStr.substring(0, 5);
        document.querySelectorAll('.sholat-item').forEach(item => {
            const sholatTime = item.querySelector('.sholat-time').textContent;
            if (currentHourMin >= sholatTime) {
                document.querySelectorAll('.sholat-item').forEach(i => i.classList.remove('active-sholat'));
                item.classList.add('active-sholat');
            }
        });
    }, 1000);
}
// Jalankan runtime jam dashboard saat file dibaca
setTimeout(startLiveClockAndSholat, 500);

// ==========================================
// SISTEM LOGIN & LOGOUT
// ==========================================
function handleLogin() {
    const userInp = document.getElementById('username').value.trim();
    const passInp = document.getElementById('password').value.trim();

    if (USERS[userInp] && USERS[userInp] === passInp) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        
        document.getElementById('profile-name').textContent = userInp;
        if(userInp === 'RyzziSiber') {
            document.getElementById('profile-role').textContent = "USER ADMIN";
        } else {
            document.getElementById('profile-role').textContent = "USER MEMBER";
        }
        
        if (!isPlaying) { toggleMusic(); }
        addHistoryLog("Login berhasil sebagai " + userInp);
    } else {
        alert("Username atau Password yang anda masukkan salah!");
    }
}

function handleLogout() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
}

// ==========================================
// SPLASH SCREEN & LOADING TIMER
// ==========================================
let detik = 10;
const splash = document.getElementById('splash-screen');
const loginScreen = document.getElementById('login-screen');
const countdown = document.getElementById('countdown');

const timer = setInterval(() => {
    detik--;
    countdown.textContent = 'Mempersiapkan Sistem... (' + detik + 's)';
    if (detik <= 0) {
        clearInterval(timer);
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            loginScreen.classList.remove('hidden');
        }, 500);
    }
}, 1000);

// ==========================================
// BACKGOUND MUSIC CONTROLLER
// ==========================================
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        musicIcon.style.color = '#ffffff';
        musicIcon.style.animation = 'none';
        isPlaying = false;
    } else {
        bgMusic.play().catch(() => {});
        musicIcon.style.color = '#ffffff';
        musicIcon.style.animation = 'music-pulse 0.5s infinite alternate linear';
        isPlaying = true;
    }
}

// ==========================================
// SPAMMER TELEGRAM ENGINE
// ==========================================
function setCount(count) {
    document.getElementById('spam-count').value = count;
    document.querySelectorAll('.count-btn').forEach(btn => {
        if (parseInt(btn.textContent) === count) {
            btn.classList.add('active');
            btn.style.setProperty('color', '#000000', 'important');
        } else {
            btn.classList.remove('active');
            btn.style.setProperty('color', '#ffffff', 'important');
        }
    });
}
setCount(20);

const terminal = document.getElementById('terminal');
const startBtn = document.getElementById('start-btn');

function logToTerminal(text, type) {
    const span = document.createElement('span');
    span.className = 'log-line';
    if (type === 'success') span.classList.add('log-success');
    else if (type === 'error') span.classList.add('log-error');
    else if (type === 'warn') span.classList.add('log-warn');
    span.textContent = '[' + new Date().toLocaleTimeString() + '] ' + text;
    terminal.appendChild(span);
    terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    terminal.innerHTML = '<span class="log-muted">Terminal dibersihkan...</span>';
}

async function startSpam() {
    const token = document.getElementById('bot-token').value.trim();
    const target = document.getElementById('target-id').value.trim();
    const msg = document.getElementById('spam-message').value.trim();
    const count = parseInt(document.getElementById('spam-count').value);

    if (!token || !target || !msg) {
        logToTerminal('❌ Semua form wajib diisi!', 'warn');
        return;
    }

    startBtn.disabled = true;
    startBtn.textContent = 'PROSES...';
    document.body.classList.add('lag-effect', 'pointer-events-none');
    clearTerminal();
    logToTerminal('⚙️ Memulai antrean kirim: ' + count + ' pesan', 'warn');
    await sleep(500);

    let ok = 0, fail = 0;
    for (let i = 1; i <= count; i++) {
        await sleep(Math.random() * 80 + 40);
        try {
            const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: target, text: msg })
            });
            const data = await res.json();
            if (data.ok) { ok++; logToTerminal('✓ [' + i + '/' + count + '] Berhasil terkirim', 'success'); }
            else { fail++; logToTerminal('✕ [' + i + '/' + count + '] Gagal: ' + data.description, 'error'); }
        } catch (e) {
            fail++;
            logToTerminal('! [' + i + '/' + count + '] Terputus: ' + e.message, 'error');
        }
    }

    document.body.classList.remove('lag-effect', 'pointer-events-none');
    startBtn.disabled = false;
    startBtn.textContent = 'MULAI SPAM';
    logToTerminal('══ STATUS Selesai | SUKSES: ' + ok + ' | GAGAL: ' + fail + ' ══', 'warn');
    addHistoryLog("Spam Telegram (" + count + " pesan) ke ID " + target);
}

// ==========================================
// WHATSAPP BUG ENGINE (VIRTEX)
// ==========================================
const bugTerminal = document.getElementById('bug-terminal');
let bugMode = 1;

const VIRTEX = {
    1: '⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿\n[VIRTEX FORCLOSE]',
    2: '꧁༺RYZZI CRASHER༻꧂\n꧁༺RYZZI CRASHER༻꧂\n꧁༺RYZZI CRASHER༻꧂\n꧁༺RYZZI CRASHER༻꧂\n꧁༺RYZZI CRASHER༻꧂\n[VIRTEX BEKU]',
    3: '꧁༺RYZZI EXTREME༻꧂\n꧁༺RYZZI EXTREME༻꧂\n꧁༺RYZZI EXTREME༻꧂\n꧁༺RYZZI EXTREME༻꧂\n[VIRTEX EXTREME]'
};

function setBugMode(mode) {
    bugMode = mode;
    document.querySelectorAll('.bug-btn').forEach(b => {
        b.classList.remove('active');
        b.style.setProperty('color', '#ffffff', 'important');
    });
    const activeBtn = document.getElementById('bug-' + mode);
    if(activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.setProperty('color', '#000000', 'important');
    }
    
    document.getElementById('bug-mode').value = mode;
    const names = ['', 'FORCLOSE', 'BEKU', 'EXTREME'];
    logBugTerminal('📌 Payload terpilih: ' + names[mode], 'warn');
}
setTimeout(() => { setBugMode(1); }, 100);

function logBugTerminal(text, type) {
    const span = document.createElement('span');
    span.className = 'log-line';
    if (type === 'success') span.classList.add('log-success');
    else if (type === 'error') span.classList.add('log-error');
    else if (type === 'warn') span.classList.add('log-warn');
    span.textContent = '[' + new Date().toLocaleTimeString() + '] ' + text;
    bugTerminal.appendChild(span);
    bugTerminal.scrollTop = bugTerminal.scrollHeight;
}

function clearBugTerminal() {
    bugTerminal.innerHTML = '<span class="log-muted">Terminal dibersihkan...</span>';
}

function sendBug() {
    const nomor = document.getElementById('bug-target').value.trim();
    if (!nomor) {
        logBugTerminal('❌ Masukkan nomor WhatsApp target!', 'error');
        return;
    }
    const virtex = VIRTEX[bugMode] || VIRTEX[1];
    const url = 'https://wa.me/' + nomor + '?text=' + encodeURIComponent(virtex);
    
    logBugTerminal('📤 Memproses data untuk ' + nomor + '...', 'warn');
    logBugTerminal('✅ Menyiapkan tautan API WhatsApp...', 'success');
    
    window.open(url, '_blank');
    addHistoryLog("Kirim Bug WA Mode " + bugMode + " ke " + nomor);
}

// ==========================================
// RIWAYAT AKTIVITAS (HISTORY LOG)
// ==========================================
const historyContainer = document.getElementById('history-container');
function addHistoryLog(activityText) {
    const emptyMsg = historyContainer.querySelector('.empty-history');
    if(emptyMsg) { emptyMsg.remove(); }

    const logDiv = document.createElement('div');
    logDiv.style.background = '#121212';
    logDiv.style.border = '1px solid #262626';
    logDiv.style.padding = '14px';
    logDiv.style.borderRadius = '14px';
    logDiv.style.marginBottom = '10px';
    logDiv.style.fontSize = '12px';
    logDiv.style.display = 'flex';
    logDiv.style.justifyContent = 'space-between';

    const txtSpan = document.createElement('span');
    txtSpan.textContent = activityText;
    txtSpan.style.color = '#ffffff';

    const timeSpan = document.createElement('span');
    timeSpan.textContent = new Date().toLocaleTimeString();
    timeSpan.style.color = '#737373';

    logDiv.appendChild(txtSpan);
    logDiv.appendChild(timeSpan);
    historyContainer.insertBefore(logDiv, historyContainer.firstChild);
}

function clearHistory() {
    historyContainer.innerHTML = '<div class="empty-history">Belum ada riwayat aktivitas.</div>';
}

// ==========================================
// FITUR CARI ANIME REAL-TIME
// ==========================================
document.getElementById('search-anime-input').addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.anime-card');

    cards.forEach(card => {
        const title = card.querySelector('h4').innerText.toLowerCase();
        if(title.includes(keyword)) {
            card.style.display = 'flex'; // Munculkan jika cocok
        } else {
            card.style.display = 'none'; // Sembunyikan jika tidak cocok
        }
    });
});

// Helper Utility
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
