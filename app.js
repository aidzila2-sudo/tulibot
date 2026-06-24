// VoiceScript Ultimate - SPA & Modular (FIXED)

const CONFIG = {
    MAX_FPS: 5,
    MIN_FRAME_DELAY: 200,
    SHAKE_THRESHOLD: 20,
    GESTURE_COOLDOWN: 1500,
    API_BASE: '../backend/api'
};

const STATE = {
    currentPage: 'home',
    isCheckingAuth: false,
    user: null,
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

const DOM = {
    // User
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserRole: document.getElementById('sidebarUserRole'),
    mobileUserName: document.getElementById('mobileUserName'),
    welcomeUser: document.getElementById('welcomeUser'),
    
    // Stats
    totalChars: document.getElementById('totalChars'),
    totalWords: document.getElementById('totalWords'),
    totalTranscripts: document.getElementById('totalTranscripts'),
    streakDays: document.getElementById('streakDays'),
    
    // Navigation
    sidebarLinks: document.querySelectorAll('.sidebar-link'),
    bottomLinks: document.querySelectorAll('.bottom-link'),
    shortcutCards: document.querySelectorAll('.shortcut-card'),
    sidebarLogoutBtn: document.getElementById('sidebarLogoutBtn'),
    
    // Voice to Text
    languageSelectVoice: document.getElementById('languageSelectVoice'),
    voiceStatusDot: document.getElementById('voiceStatusDot'),
    voiceStatusText: document.getElementById('voiceStatusText'),
    voiceTranscript: document.getElementById('voiceTranscript'),
    copyVoiceBtn: document.getElementById('copyVoiceBtn'),
    clearVoiceBtn: document.getElementById('clearVoiceBtn'),
    downloadVoiceBtn: document.getElementById('downloadVoiceBtn'),
    saveVoiceBtn: document.getElementById('saveVoiceBtn'),
    voiceMicBtn: document.getElementById('voiceMicBtn'),
    voiceMicStatus: document.getElementById('voiceMicStatus'),
    
    // Kamera Kontrol
    cameraStatusDot: document.getElementById('cameraStatusDot'),
    cameraStatusText: document.getElementById('cameraStatusText'),
    cameraTranscript: document.getElementById('cameraTranscript'),
    webcam: document.getElementById('webcam'),
    handsCanvas: document.getElementById('handsCanvas'),
    cameraGestureStatus: document.getElementById('cameraGestureStatus'),
    toggleCameraBtn: document.getElementById('toggleCameraBtn'),
    copyCameraBtn: document.getElementById('copyCameraBtn'),
    clearCameraBtn: document.getElementById('clearCameraBtn'),
    downloadCameraBtn: document.getElementById('downloadCameraBtn'),
    saveCameraBtn: document.getElementById('saveCameraBtn'),
    
    // Belajar Isyarat
    lessonBtns: document.querySelectorAll('.lesson-btn'),
    alphabetGrid: document.getElementById('alphabetGrid'),
    numbersGrid: document.getElementById('numbersGrid'),
    greetingsGrid: document.getElementById('greetingsGrid'),
    feedbackWebcam: document.getElementById('feedbackWebcam'),
    feedbackHandsCanvas: document.getElementById('feedbackHandsCanvas'),
    toggleFeedbackCamBtn: document.getElementById('toggleFeedbackCamBtn'),
    feedbackText: document.getElementById('feedbackText')
};

const LESSON_DATA = {
    alphabet: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    numbers: ['0','1','2','3','4','5','6','7','8','9','10'],
    greetings: ['Halo','Selamat','Tinggal','Terima','Kasih','Maaf','Silakan']
};

// ==================== UTILITY ====================

function safeGetStoredAuth() {
    try {
        const data = localStorage.getItem('voicescript_auth');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Auth read error:', e);
        return null;
    }
}

function safeSetStoredAuth(data) {
    try {
        localStorage.setItem('voicescript_auth', JSON.stringify(data));
    } catch (e) {
        console.warn('Auth write error:', e);
    }
}

function safeRemoveStoredAuth() {
    try {
        localStorage.removeItem('voicescript_auth');
    } catch (e) {
        console.warn('Auth remove error:', e);
    }
}

// ==================== AUTH ====================

async function safeCheckAuth() {
    if (STATE.isCheckingAuth) return;
    STATE.isCheckingAuth = true;
    let storedAuth = safeGetStoredAuth();
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/check_session.php`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        
        if (result.authenticated) {
            storedAuth = result.user;
            safeSetStoredAuth(storedAuth);
        }
    } catch (e) {
        console.warn('Session check failed, using local:', e);
    }
    
    if (storedAuth) {
        STATE.user = storedAuth;
        updateUserUI();
        loadStats();
    } else {
        window.location.replace('login.html');
    }
    
    STATE.isCheckingAuth = false;
}

function updateUserUI() {
    if (DOM.sidebarUserName && STATE.user) DOM.sidebarUserName.textContent = STATE.user.username;
    if (DOM.sidebarUserRole && STATE.user) DOM.sidebarUserRole.textContent = STATE.user.role;
    if (DOM.mobileUserName && STATE.user) DOM.mobileUserName.textContent = STATE.user.username;
    if (DOM.welcomeUser && STATE.user) DOM.welcomeUser.textContent = `Selamat datang kembali, ${STATE.user.username}!`;
}

async function logout() {
    try {
        await fetch(`${CONFIG.API_BASE}/logout.php`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {}
    safeRemoveStoredAuth();
    window.location.replace('login.html');
}

function loadStats() {
    try {
        const transcripts = JSON.parse(localStorage.getItem('voicescript_transcripts') || '[]');
        const totalChars = transcripts.reduce((sum, t) => sum + (t.text?.length || 0), 0);
        const totalWords = transcripts.reduce((sum, t) => sum + (t.text?.split(/\s+/).length || 0), 0);
        
        if (DOM.totalChars) DOM.totalChars.textContent = totalChars.toLocaleString();
        if (DOM.totalWords) DOM.totalWords.textContent = totalWords.toLocaleString();
        if (DOM.totalTranscripts) DOM.totalTranscripts.textContent = transcripts.length;
        if (DOM.streakDays) DOM.streakDays.textContent = 1;
    } catch (e) {}
}

// ==================== PAGE NAVIGATION ====================

function switchPage(pageId) {
    // 1. First clean up current resources (anti-crash!)
    cleanupCurrentPage();
    
    // 2. Update state
    STATE.currentPage = pageId;
    
    // 3. Toggle page visibility
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 4. Update navigation active states
    DOM.sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    DOM.bottomLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    
    // 5. Initialize features for new page
    initializePageFeatures(pageId);
    
    console.log(`Switched to page: ${pageId}`); // Debug log
}

function cleanupCurrentPage() {
    stopRecording();
    stopCamera();
    stopFeedbackCamera();
    DOM.feedbackText?.classList.remove('correct', 'incorrect');
}

function initializePageFeatures(pageId) {
    if (pageId === 'belajarisyarat') {
        renderLessons();
    }
}

// ==================== LESSONS ====================

function renderLessons() {
    Object.entries(LESSON_DATA).forEach(([type, items]) => {
        const grid = DOM[`${type}Grid`];
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
    DOM.feedbackText.textContent = `Coba tunjukkan isyarat untuk "${item}"`;
}

function switchLesson(lesson) {
    STATE.currentLesson = lesson;
    DOM.lessonBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lesson === lesson));
    DOM.alphabetGrid?.classList.toggle('hidden', lesson !== 'alphabet');
    DOM.numbersGrid?.classList.toggle('hidden', lesson !== 'numbers');
    DOM.greetingsGrid?.classList.toggle('hidden', lesson !== 'greetings');
}

// ==================== SPEECH RECOGNITION ====================

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
    
    STATE.speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        if (DOM.voiceTranscript) DOM.voiceTranscript.value += transcript;
        updateVoiceStatus('Mendengarkan...', true);
    };
    
    STATE.speechRecognition.onerror = (e) => {
        if (e.error === 'no-speech') return;
        updateVoiceStatus(`Error: ${e.error}`, false);
    };
    
    STATE.speechRecognition.onend = () => {
        if (STATE.isRecording) {
            try { STATE.speechRecognition.start(); } catch (e) {}
        }
    };
}

function toggleRecording() {
    initSpeechRecognition();
    if (STATE.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    if (!STATE.speechRecognition) return;
    try {
        STATE.speechRecognition.lang = STATE.currentLanguage;
        STATE.speechRecognition.start();
        STATE.isRecording = true;
        DOM.voiceMicBtn?.classList.add('recording');
        DOM.voiceMicStatus.textContent = 'Mendengarkan...';
        updateVoiceStatus('Merekam suara', true);
    } catch (e) {
        console.warn('Start recording error:', e);
    }
}

function stopRecording() {
    if (!STATE.speechRecognition) return;
    try { STATE.speechRecognition.stop(); } catch (e) {}
    STATE.isRecording = false;
    DOM.voiceMicBtn?.classList.remove('recording');
    DOM.voiceMicStatus.textContent = 'Klik untuk mulai merekam';
    updateVoiceStatus('Siap merekam', false);
}

function updateVoiceStatus(text, isActive) {
    if (DOM.voiceStatusText) DOM.voiceStatusText.textContent = text;
    if (DOM.voiceStatusDot) {
        DOM.voiceStatusDot.classList.toggle('recording', isActive);
    }
}

// ==================== MEDIAPIPE & CAMERA ====================

async function initHands() {
    if (STATE.hands) return;
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
        console.warn('MediaPipe init error:', e);
    }
}

async function initFeedbackHands() {
    if (STATE.feedbackHands) return;
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
        console.warn('MediaPipe feedback init error:', e);
    }
}

function onHandsResults(results) {
    const canvas = DOM.handsCanvas;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#7c6dfa', lineWidth: 2 });
            drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
            const gesture = detectGesture(landmarks);
            if (gesture) handleGesture(gesture);
        }
    }
    canvasCtx.restore();
}

function onFeedbackHandsResults(results) {
    const canvas = DOM.feedbackHandsCanvas;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#7c6dfa', lineWidth: 2 });
            drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
            checkLessonFeedback(landmarks);
        }
    }
    canvasCtx.restore();
}

function detectGesture(landmarks) {
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
    
    return null;
}

function handleGesture(gesture) {
    const now = Date.now();
    if (now - STATE.lastGestureTime < CONFIG.GESTURE_COOLDOWN) return;
    STATE.lastGestureTime = now;
    
    DOM.cameraGestureStatus.textContent = `Terdeteksi: ${gesture === 'thumbsup' ? '👍 Mulai Merekam' : gesture === 'open' ? '🖐️ Berhenti' : '✊ Hapus'}`;
    DOM.cameraGestureStatus.classList.add('detected');
    setTimeout(() => DOM.cameraGestureStatus.classList.remove('detected'), 500);
    
    if (gesture === 'thumbsup') {
        if (!STATE.isRecording) toggleRecordingForCamera();
    } else if (gesture === 'open') {
        if (STATE.isRecording) toggleRecordingForCamera();
    } else if (gesture === 'fist') {
        if (DOM.cameraTranscript) DOM.cameraTranscript.value = '';
    }
}

function checkLessonFeedback(landmarks) {
    if (!STATE.selectedLessonItem) return;
    const gesture = detectGesture(landmarks);
    const isCorrect = gesture !== null;
    
    DOM.feedbackText.classList.remove('correct', 'incorrect');
    DOM.feedbackText.classList.add(isCorrect ? 'correct' : 'incorrect');
    DOM.feedbackText.textContent = isCorrect ? `Bagus! Isyarat "${STATE.selectedLessonItem}" terdeteksi!` : `Coba lagi untuk "${STATE.selectedLessonItem}"`;
}

async function startCamera() {
    if (STATE.isCameraOn) return;
    try {
        await initHands();
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        STATE.mediaStream = stream;
        if (DOM.webcam) DOM.webcam.srcObject = stream;
        
        const canvas = DOM.handsCanvas;
        if (canvas) {
            canvas.width = 640;
            canvas.height = 480;
        }
        
        STATE.isCameraOn = true;
        startManualFrameLoop();
        updateCameraStatus('Kamera aktif', true);
        DOM.cameraGestureStatus.textContent = 'Kamera aktif, tunjukkan gestur';
    } catch (e) {
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
    if (DOM.webcam) DOM.webcam.srcObject = null;
    STATE.isCameraOn = false;
    updateCameraStatus('Klik tombol untuk menyalakan kamera', false);
    DOM.cameraGestureStatus.textContent = 'Kamera belum aktif';
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
        if (now - STATE.lastFrameTime >= CONFIG.MIN_FRAME_DELAY) {
            try {
                if (STATE.hands && DOM.webcam && DOM.webcam.readyState === 4) {
                    await STATE.hands.send({ image: DOM.webcam });
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
    try {
        await initFeedbackHands();
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 480 }, height: { ideal: 360 } }
        });
        STATE.feedbackMediaStream = stream;
        if (DOM.feedbackWebcam) DOM.feedbackWebcam.srcObject = stream;
        
        const canvas = DOM.feedbackHandsCanvas;
        if (canvas) {
            canvas.width = 480;
            canvas.height = 360;
        }
        
        STATE.isFeedbackCameraOn = true;
        startFeedbackFrameLoop();
        DOM.feedbackText.textContent = STATE.selectedLessonItem ? `Coba tunjukkan isyarat untuk "${STATE.selectedLessonItem}"` : 'Pilih huruf terlebih dahulu';
    } catch (e) {
        DOM.feedbackText.textContent = `Kamera error: ${e.message}`;
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
    if (DOM.feedbackWebcam) DOM.feedbackWebcam.srcObject = null;
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
        if (now - STATE.lastFeedbackFrameTime >= CONFIG.MIN_FRAME_DELAY) {
            try {
                if (STATE.feedbackHands && DOM.feedbackWebcam && DOM.feedbackWebcam.readyState === 4) {
                    await STATE.feedbackHands.send({ image: DOM.feedbackWebcam });
                }
            } catch (e) {}
            STATE.lastFeedbackFrameTime = now;
        }
        STATE.feedbackAnimationFrameId = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

function updateCameraStatus(text, isActive) {
    if (DOM.cameraStatusText) DOM.cameraStatusText.textContent = text;
    if (DOM.cameraStatusDot) {
        DOM.cameraStatusDot.classList.toggle('recording', isActive);
    }
}

function toggleRecordingForCamera() {
    initSpeechRecognition();
    if (STATE.isRecording) {
        stopRecordingForCamera();
    } else {
        startRecordingForCamera();
    }
}

function startRecordingForCamera() {
    if (!STATE.speechRecognition) return;
    try {
        STATE.speechRecognition.lang = 'id-ID';
        STATE.speechRecognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (DOM.cameraTranscript) DOM.cameraTranscript.value += transcript;
        };
        STATE.speechRecognition.start();
        STATE.isRecording = true;
        updateCameraStatus('Merekam suara (gestur: 🖐️ berhenti)', true);
    } catch (e) {}
}

function stopRecordingForCamera() {
    if (!STATE.speechRecognition) return;
    try { STATE.speechRecognition.stop(); } catch (e) {}
    STATE.isRecording = false;
    updateCameraStatus('Kamera aktif (gestur: 👍️ mulai)', true);
}

// ==================== TEXT ACTIONS ====================

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

function saveTranscript(textareaId, controlMethod) {
    const textarea = document.getElementById(textareaId);
    if (!textarea || !textarea.value) return;
    const transcripts = JSON.parse(localStorage.getItem('voicescript_transcripts') || '[]');
    transcripts.push({
        id: Date.now(),
        text: textarea.value,
        control_method: controlMethod,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('voicescript_transcripts', JSON.stringify(transcripts));
    loadStats();
}

// ==================== EVENT LISTENERS ====================

function initEventListeners() {
    // Logout
    DOM.sidebarLogoutBtn?.addEventListener('click', logout);
    
    // Sidebar navigation
    DOM.sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.dataset.page;
            if (pageId) switchPage(pageId);
        });
    });
    
    // Bottom nav
    DOM.bottomLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.dataset.page;
            if (pageId) switchPage(pageId);
        });
    });
    
    // Shortcut cards
    DOM.shortcutCards.forEach(card => {
        card.addEventListener('click', () => {
            const pageId = card.dataset.page;
            if (pageId) switchPage(pageId);
        });
    });
    
    // Voice to Text controls
    DOM.languageSelectVoice?.addEventListener('change', (e) => {
        STATE.currentLanguage = e.target.value;
    });
    DOM.voiceMicBtn?.addEventListener('click', toggleRecording);
    DOM.copyVoiceBtn?.addEventListener('click', () => copyText('voiceTranscript'));
    DOM.clearVoiceBtn?.addEventListener('click', () => clearText('voiceTranscript'));
    DOM.downloadVoiceBtn?.addEventListener('click', () => downloadText('voiceTranscript', `voicescript-${Date.now()}.txt`));
    DOM.saveVoiceBtn?.addEventListener('click', () => saveTranscript('voiceTranscript', 'voice'));
    
    // Kamera Kontrol controls
    DOM.toggleCameraBtn?.addEventListener('click', toggleCamera);
    DOM.copyCameraBtn?.addEventListener('click', () => copyText('cameraTranscript'));
    DOM.clearCameraBtn?.addEventListener('click', () => clearText('cameraTranscript'));
    DOM.downloadCameraBtn?.addEventListener('click', () => downloadText('cameraTranscript', `voicescript-gesture-${Date.now()}.txt`));
    DOM.saveCameraBtn?.addEventListener('click', () => saveTranscript('cameraTranscript', 'gesture'));
    
    // Belajar Isyarat controls
    DOM.lessonBtns.forEach(btn => {
        btn.addEventListener('click', () => switchLesson(btn.dataset.lesson));
    });
    DOM.toggleFeedbackCamBtn?.addEventListener('click', toggleFeedbackCamera);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanupCurrentPage);
}

// ==================== INIT ====================

async function init() {
    console.log('Initializing VoiceScript Ultimate...');
    initEventListeners();
    await safeCheckAuth();
}

document.addEventListener('DOMContentLoaded', init);
