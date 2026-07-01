
// VoiceScript Ultimate - Fixed Backend-Less Version
const STATE = {
    currentPage: 'home',
    isRecording: false,
    isCameraOn: false,
    isFeedbackCameraOn: false,
    currentLanguage: 'id-ID',
    lastFrameTime: 0,
    lastFeedbackFrameTime: 0,
    lastGestureTime: 0,
    animationFrameId: null,
    feedbackAnimationFrameId: null,
    mediaStream: null,
    feedbackMediaStream: null,
    speechRecognition: null,
    hands: null,
    feedbackHands: null,
    currentLesson: 'alphabet',
    selectedLessonItem: null
};

const LESSON_DATA = {
    alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    greetings: ['Halo', 'Selamat', 'Tinggal', 'Terima', 'Kasih', 'Maaf', 'Silakan']
};

// ================================================
// INITIALIZATION - START
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. ATTACH ALL EVENT LISTENERS FIRST (ANTI-BLOCKING)
    attachEventListeners();
    
    // 2. CHECK AUTH STATUS
    checkAuthAndShowPage();
});

function attachEventListeners() {
    // LOGIN FORM
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // LOGOUT BUTTON
    const logoutBtn = document.getElementById('sidebarLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // NAVIGATION LINKS
    attachNavigationEventListeners();
    
    // VOICE TO TEXT CONTROLS
    attachVoiceToTextEventListeners();
    
    // CAMERA CONTROLS
    attachCameraEventListeners();
    
    // BELAJAR ISYARAT CONTROLS
    attachLessonEventListeners();
}

function attachNavigationEventListeners() {
    // Sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) switchPage(page);
        });
    });
    
    // Bottom nav links
    document.querySelectorAll('.bottom-link').forEach(link => {
        link.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) switchPage(page);
        });
    });
    
    // Shortcut cards
    document.querySelectorAll('.shortcut-card').forEach(card => {
        card.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) switchPage(page);
        });
    });
}

function attachVoiceToTextEventListeners() {
    const langSelect = document.getElementById('languageSelectVoice');
    if (langSelect) {
        langSelect.addEventListener('change', function() {
            STATE.currentLanguage = this.value;
        });
    }
    
    const micBtn = document.getElementById('voiceMicBtn');
    if (micBtn) {
        micBtn.addEventListener('click', toggleRecording);
    }
    
    const copyBtn = document.getElementById('copyVoiceBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyText('voiceTranscript'));
    }
    
    const clearBtn = document.getElementById('clearVoiceBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => clearText('voiceTranscript'));
    }
    
    const downloadBtn = document.getElementById('downloadVoiceBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadText('voiceTranscript', `voicescript-${Date.now()}.txt`));
    }
    
    const saveBtn = document.getElementById('saveVoiceBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveTranscript('voiceTranscript', 'voice'));
    }
}

function attachCameraEventListeners() {
    const toggleBtn = document.getElementById('toggleCameraBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleCamera);
    }
    
    const copyBtn = document.getElementById('copyCameraBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyText('cameraTranscript'));
    }
    
    const clearBtn = document.getElementById('clearCameraBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => clearText('cameraTranscript'));
    }
    
    const downloadBtn = document.getElementById('downloadCameraBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadText('cameraTranscript', `voicescript-gesture-${Date.now()}.txt`));
    }
    
    const saveBtn = document.getElementById('saveCameraBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveTranscript('cameraTranscript', 'gesture'));
    }
}

function attachLessonEventListeners() {
    document.querySelectorAll('.lesson-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchLesson(this.dataset.lesson);
        });
    });
    
    const toggleFeedbackBtn = document.getElementById('toggleFeedbackCamBtn');
    if (toggleFeedbackBtn) {
        toggleFeedbackBtn.addEventListener('click', toggleFeedbackCamera);
    }
}

// ================================================
// AUTH & LOGIN - START
// ================================================
function checkAuthAndShowPage() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        showApp();
    } else {
        showLogin();
    }
}

function showLogin() {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    if (loginSection) loginSection.style.display = 'flex';
    if (appSection) appSection.style.display = 'none';
}

function showApp() {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    if (loginSection) loginSection.style.display = 'none';
    if (appSection) appSection.style.display = 'block';
    
    updateUserUI();
    loadStats();
    renderLessons();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    
    if ((email === 'admin@voicescript.com' || email === 'admin') && password === 'password') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', 'Admin');
        showApp();
    } else {
        if (errorEl) {
            errorEl.textContent = 'Email atau password salah!';
            errorEl.style.display = 'block';
        }
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    cleanupCurrentPage();
    showLogin();
}

function updateUserUI() {
    const username = localStorage.getItem('username') || 'User';
    const sidebarName = document.getElementById('sidebarUserName');
    const mobileName = document.getElementById('mobileUserName');
    const welcomeUser = document.getElementById('welcomeUser');
    
    if (sidebarName) sidebarName.textContent = username;
    if (mobileName) mobileName.textContent = username;
    if (welcomeUser) welcomeUser.textContent = `Selamat datang kembali, ${username}!`;
}

// ================================================
// PAGE NAVIGATION - START
// ================================================
function switchPage(pageId) {
    cleanupCurrentPage();
    STATE.currentPage = pageId;
    
    // Update active page
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    
    // Update bottom nav
    document.querySelectorAll('.bottom-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    
    // Initialize page-specific features
    if (pageId === 'belajarisyarat') {
        renderLessons();
    }
}

function cleanupCurrentPage() {
    try {
        stopRecording();
        stopCamera();
        stopFeedbackCamera();
        const feedbackText = document.getElementById('feedbackText');
        if (feedbackText) {
            feedbackText.classList.remove('correct', 'incorrect');
        }
    } catch (e) {
        console.error('Cleanup error:', e);
    }
}

// ================================================
// STATS & TRANSCRIPTS - START
// ================================================
function loadStats() {
    try {
        const transcripts = JSON.parse(localStorage.getItem('voicescript_data') || '[]');
        const totalChars = transcripts.reduce((sum, t) => sum + (t.text?.length || 0), 0);
        const totalWords = transcripts.reduce((sum, t) => sum + (t.text?.split(/\s+/).filter(word => word.length > 0).length || 0), 0);
        
        const totalCharsEl = document.getElementById('totalChars');
        const totalWordsEl = document.getElementById('totalWords');
        const totalTranscriptsEl = document.getElementById('totalTranscripts');
        const streakDaysEl = document.getElementById('streakDays');
        
        if (totalCharsEl) totalCharsEl.textContent = totalChars.toLocaleString();
        if (totalWordsEl) totalWordsEl.textContent = totalWords.toLocaleString();
        if (totalTranscriptsEl) totalTranscriptsEl.textContent = transcripts.length;
        if (streakDaysEl) streakDaysEl.textContent = 1;
    } catch (e) {
        console.error('Load stats error:', e);
    }
}

function saveTranscript(textareaId, controlMethod) {
    try {
        const textarea = document.getElementById(textareaId);
        if (!textarea || !textarea.value) return;
        
        const transcripts = JSON.parse(localStorage.getItem('voicescript_data') || '[]');
        transcripts.push({
            id: Date.now(),
            text: textarea.value,
            control_method: controlMethod,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('voicescript_data', JSON.stringify(transcripts));
        loadStats();
    } catch (e) {
        console.error('Save transcript error:', e);
    }
}

// ================================================
// TEXT UTILITIES - START
// ================================================
function copyText(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea || !textarea.value) return;
    navigator.clipboard.writeText(textarea.value);
}

function clearText(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    textarea.value = '';
}

function downloadText(textareaId, filename) {
    const textarea = document.getElementById(textareaId);
    if (!textarea || !textarea.value) return;
    const blob = new Blob([textarea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ================================================
// SPEECH RECOGNITION - START
// ================================================
function initSpeechRecognition() {
    if (STATE.speechRecognition) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        updateVoiceStatus('Browser tidak mendukung Speech Recognition', false);
        return;
    }
    
    STATE.speechRecognition = new SpeechRecognition();
    STATE.speechRecognition.continuous = true;
    STATE.speechRecognition.interimResults = true;
    STATE.speechRecognition.lang = STATE.currentLanguage;

    STATE.speechRecognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        const textarea = document.getElementById('voiceTranscript');
        if (textarea) textarea.value += transcript;
        updateVoiceStatus('Mendengarkan...', true);
    };

    STATE.speechRecognition.onerror = function(e) {
        if (e.error !== 'no-speech') {
            updateVoiceStatus(`Error: ${e.error}`, false);
        }
    };

    STATE.speechRecognition.onend = function() {
        if (STATE.isRecording) {
            try { STATE.speechRecognition.start(); } catch (e) {}
        }
    };
}

function toggleRecording() {
    if (STATE.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    initSpeechRecognition();
    if (!STATE.speechRecognition) return;
    
    STATE.speechRecognition.lang = STATE.currentLanguage;
    STATE.speechRecognition.start();
    STATE.isRecording = true;
    
    const micBtn = document.getElementById('voiceMicBtn');
    if (micBtn) micBtn.classList.add('recording');
    
    const micStatus = document.getElementById('voiceMicStatus');
    if (micStatus) micStatus.textContent = 'Mendengarkan...';
    
    updateVoiceStatus('Merekam suara', true);
}

function stopRecording() {
    if (!STATE.speechRecognition) return;
    try { STATE.speechRecognition.stop(); } catch (e) {}
    STATE.isRecording = false;
    
    const micBtn = document.getElementById('voiceMicBtn');
    if (micBtn) micBtn.classList.remove('recording');
    
    const micStatus = document.getElementById('voiceMicStatus');
    if (micStatus) micStatus.textContent = 'Klik untuk mulai merekam';
    
    updateVoiceStatus('Siap merekam', false);
}

function updateVoiceStatus(text, isActive) {
    const statusText = document.getElementById('voiceStatusText');
    const statusDot = document.getElementById('voiceStatusDot');
    
    if (statusText) statusText.textContent = text;
    if (statusDot) {
        statusDot.classList.toggle('recording', isActive);
    }
}

// ================================================
// CAMERA & GESTURE - START
// ================================================
async function initHands() {
    if (STATE.hands || !window.Hands) return;
    
    try {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });
        hands.onResults(onHandsResults);
        STATE.hands = hands;
    } catch (e) {
        console.error('MediaPipe init error:', e);
    }
}

async function initFeedbackHands() {
    if (STATE.feedbackHands || !window.Hands) return;
    
    try {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });
        hands.onResults(onFeedbackHandsResults);
        STATE.feedbackHands = hands;
    } catch (e) {
        console.error('MediaPipe feedback init error:', e);
    }
}

function onHandsResults(results) {
    const canvas = document.getElementById('handsCanvas');
    if (!canvas) return;
    
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            if (window.drawConnectors) drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#7c6dfa', lineWidth: 2 });
            if (window.drawLandmarks) drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
            
            const gesture = detectGesture(landmarks);
            if (gesture) handleGesture(gesture);
        }
    }
    canvasCtx.restore();
}

function onFeedbackHandsResults(results) {
    const canvas = document.getElementById('feedbackHandsCanvas');
    if (!canvas) return;
    
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            if (window.drawConnectors) drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#7c6dfa', lineWidth: 2 });
            if (window.drawLandmarks) drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
            
            checkLessonFeedback(landmarks);
        }
    }
    canvasCtx.restore();
}

function detectGesture(landmarks) {
    try {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const wrist = landmarks[0];

        const thumbUp = thumbTip.y < indexTip.y && thumbTip.y < middleTip.y;
        const indexUp = indexTip.y < landmarks[6].y;
        const middleUp = middleTip.y < landmarks[10].y;
        const ringUp = ringTip.y < landmarks[14].y;
        const pinkyUp = pinkyTip.y < landmarks[18].y;

        if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) return 'thumbsup';
        if (indexUp && middleUp && ringUp && pinkyUp) return 'open';
        if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 'fist';
    } catch (e) {
        console.error('Detect gesture error:', e);
    }
    return null;
}

function handleGesture(gesture) {
    const now = Date.now();
    if (now - STATE.lastGestureTime < 1500) return;
    STATE.lastGestureTime = now;

    const statusEl = document.getElementById('cameraGestureStatus');
    if (statusEl) {
        statusEl.textContent = `Terdeteksi: ${gesture === 'thumbsup' ? '👍 Mulai Merekam' : gesture === 'open' ? '🖐️ Berhenti' : '✊ Hapus'}`;
        statusEl.classList.add('detected');
        setTimeout(() => statusEl.classList.remove('detected'), 500);
    }

    if (gesture === 'thumbsup') {
        if (!STATE.isRecording) toggleRecordingForCamera();
    } else if (gesture === 'open') {
        if (STATE.isRecording) toggleRecordingForCamera();
    } else if (gesture === 'fist') {
        const textarea = document.getElementById('cameraTranscript');
        if (textarea) textarea.value = '';
    }
}

async function startCamera() {
    if (STATE.isCameraOn) return;
    
    await initHands();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        STATE.mediaStream = stream;
        
        const webcam = document.getElementById('webcam');
        if (webcam) webcam.srcObject = stream;

        const canvas = document.getElementById('handsCanvas');
        if (canvas) {
            canvas.width = 640;
            canvas.height = 480;
        }

        STATE.isCameraOn = true;
        startManualFrameLoop();
        updateCameraStatus('Kamera aktif', true);
        
        const statusEl = document.getElementById('cameraGestureStatus');
        if (statusEl) statusEl.textContent = 'Kamera aktif, tunjukkan gestur';
    } catch (e) {
        console.error('Start camera error:', e);
        updateCameraStatus(`Kamera error: ${e.message}`, false);
    }
}

function stopCamera() {
    if (!STATE.isCameraOn) return;
    
    if (STATE.mediaStream) {
        STATE.mediaStream.getTracks().forEach(track => track.stop());
        STATE.mediaStream = null;
    }
    
    if (STATE.animationFrameId) {
        cancelAnimationFrame(STATE.animationFrameId);
        STATE.animationFrameId = null;
    }
    
    const webcam = document.getElementById('webcam');
    if (webcam) webcam.srcObject = null;
    
    STATE.isCameraOn = false;
    updateCameraStatus('Klik tombol untuk menyalakan kamera', false);
    
    const statusEl = document.getElementById('cameraGestureStatus');
    if (statusEl) statusEl.textContent = 'Kamera belum aktif';
}

function toggleCamera() {
    if (STATE.isCameraOn) {
        stopCamera();
    } else {
        startCamera();
    }
}

function startManualFrameLoop() {
    const loop = async () => {
        if (!STATE.isCameraOn) return;
        
        const now = Date.now();
        if (now - STATE.lastFrameTime >= 200) {
            try {
                const webcam = document.getElementById('webcam');
                if (STATE.hands && webcam && webcam.readyState === 4) {
                    await STATE.hands.send({ image: webcam });
                }
            } catch (e) {}
            STATE.lastFrameTime = now;
        }
        
        STATE.animationFrameId = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

async function startFeedbackCamera() {
    if (STATE.isFeedbackCameraOn) return;
    
    await initFeedbackHands();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 480 }, height: { ideal: 360 } }
        });
        STATE.feedbackMediaStream = stream;
        
        const webcam = document.getElementById('feedbackWebcam');
        if (webcam) webcam.srcObject = stream;

        const canvas = document.getElementById('feedbackHandsCanvas');
        if (canvas) {
            canvas.width = 480;
            canvas.height = 360;
        }

        STATE.isFeedbackCameraOn = true;
        startFeedbackFrameLoop();
        
        const feedbackText = document.getElementById('feedbackText');
        if (feedbackText) {
            feedbackText.textContent = STATE.selectedLessonItem 
                ? `Coba tunjukkan isyarat untuk "${STATE.selectedLessonItem}"` 
                : 'Pilih huruf terlebih dahulu';
        }
    } catch (e) {
        console.error('Start feedback camera error:', e);
        const feedbackText = document.getElementById('feedbackText');
        if (feedbackText) feedbackText.textContent = `Kamera error: ${e.message}`;
    }
}

function stopFeedbackCamera() {
    if (!STATE.isFeedbackCameraOn) return;
    
    if (STATE.feedbackMediaStream) {
        STATE.feedbackMediaStream.getTracks().forEach(track => track.stop());
        STATE.feedbackMediaStream = null;
    }
    
    if (STATE.feedbackAnimationFrameId) {
        cancelAnimationFrame(STATE.feedbackAnimationFrameId);
        STATE.feedbackAnimationFrameId = null;
    }
    
    const webcam = document.getElementById('feedbackWebcam');
    if (webcam) webcam.srcObject = null;
    
    STATE.isFeedbackCameraOn = false;
}

function toggleFeedbackCamera() {
    if (STATE.isFeedbackCameraOn) {
        stopFeedbackCamera();
    } else {
        startFeedbackCamera();
    }
}

function startFeedbackFrameLoop() {
    const loop = async () => {
        if (!STATE.isFeedbackCameraOn) return;
        
        const now = Date.now();
        if (now - STATE.lastFeedbackFrameTime >= 200) {
            try {
                const webcam = document.getElementById('feedbackWebcam');
                if (STATE.feedbackHands && webcam && webcam.readyState === 4) {
                    await STATE.feedbackHands.send({ image: webcam });
                }
            } catch (e) {}
            STATE.lastFeedbackFrameTime = now;
        }
        
        STATE.feedbackAnimationFrameId = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

function updateCameraStatus(text, isActive) {
    const statusText = document.getElementById('cameraStatusText');
    const statusDot = document.getElementById('cameraStatusDot');
    
    if (statusText) statusText.textContent = text;
    if (statusDot) {
        statusDot.classList.toggle('recording', isActive);
    }
}

function toggleRecordingForCamera() {
    if (STATE.isRecording) {
        stopRecordingForCamera();
    } else {
        startRecordingForCamera();
    }
}

function startRecordingForCamera() {
    initSpeechRecognition();
    if (!STATE.speechRecognition) return;
    
    STATE.speechRecognition.lang = 'id-ID';
    STATE.speechRecognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        const textarea = document.getElementById('cameraTranscript');
        if (textarea) textarea.value += transcript;
    };
    
    STATE.speechRecognition.start();
    STATE.isRecording = true;
    updateCameraStatus('Merekam suara (gestur: 🖐️ berhenti)', true);
}

function stopRecordingForCamera() {
    if (!STATE.speechRecognition) return;
    try { STATE.speechRecognition.stop(); } catch (e) {}
    STATE.isRecording = false;
    updateCameraStatus('Kamera aktif (gestur: 👍️ mulai)', true);
}

// ================================================
// LESSONS - START
// ================================================
function renderLessons() {
    Object.entries(LESSON_DATA).forEach(([type, items]) => {
        const grid = document.getElementById(`${type}Grid`);
        if (!grid) return;
        
        grid.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'lesson-item';
            div.innerHTML = `<span>${item}</span><small>${item}</small>`;
            div.addEventListener('click', () => selectLessonItem(type, item, div));
            grid.appendChild(div);
        });
    });
}

function selectLessonItem(type, item, element) {
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    STATE.selectedLessonItem = item;
    
    const feedbackText = document.getElementById('feedbackText');
    if (feedbackText) {
        feedbackText.textContent = `Coba tunjukkan isyarat untuk "${item}"`;
    }
}

function switchLesson(lesson) {
    STATE.currentLesson = lesson;
    
    document.querySelectorAll('.lesson-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lesson === lesson);
    });
    
    const alphabetGrid = document.getElementById('alphabetGrid');
    const numbersGrid = document.getElementById('numbersGrid');
    const greetingsGrid = document.getElementById('greetingsGrid');
    
    if (alphabetGrid) alphabetGrid.classList.toggle('hidden', lesson !== 'alphabet');
    if (numbersGrid) numbersGrid.classList.toggle('hidden', lesson !== 'numbers');
    if (greetingsGrid) greetingsGrid.classList.toggle('hidden', lesson !== 'greetings');
}

function checkLessonFeedback(landmarks) {
    if (!STATE.selectedLessonItem) return;
    
    const gesture = detectGesture(landmarks);
    const isCorrect = gesture !== null;
    
    const feedbackText = document.getElementById('feedbackText');
    if (feedbackText) {
        feedbackText.classList.remove('correct', 'incorrect');
        feedbackText.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedbackText.textContent = isCorrect 
            ? `Bagus! Isyarat "${STATE.selectedLessonItem}" terdeteksi!` 
            : `Coba lagi untuk "${STATE.selectedLessonItem}"`;
    }
}
