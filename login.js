const STORAGE_KEY = 'voicescript_auth';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // 🔒 ANTI-INFINITE LOOP: Jangan redirect jika sudah di halaman login!
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login.html')) {
        return;
    }

    // Cek apakah user sudah login, jika ya, redirect ke index (HANYA SEKALI!)
    const savedAuth = safeGetStoredAuth();
    if (savedAuth && savedAuth.isLoggedIn) {
        console.log('User sudah login, redirect ke index...');
        window.location.replace('index.html'); // replace() lebih aman dari href
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('../backend/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.user) {
                // Simpan status login di localStorage
                safeSetStoredAuth({
                    isLoggedIn: true,
                    userId: data.user.id,
                    username: data.user.username,
                    role: data.user.role,
                    lastActive: Date.now()
                });

                // Redirect ke halaman utama dengan replace()
                window.location.replace('index.html');
            } else {
                // Jika user butuh verifikasi email
                if (data.needsVerification && data.email) {
                    loginError.textContent = data.message;
                    loginError.style.display = 'block';
                    // Tambahkan link ke halaman verifikasi
                    setTimeout(() => {
                        window.location.href = 'verify.html?email=' + encodeURIComponent(data.email);
                    }, 2000);
                } else {
                    loginError.textContent = data.message || 'Login gagal';
                    loginError.style.display = 'block';
                }
            }
        } catch (error) {
            loginError.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
            loginError.style.display = 'block';
        }
    });
});

// 🛡️ Helper functions SAFE untuk localStorage auth
function safeSetStoredAuth(data) {
    try {
        const cleanData = {
            ...data,
            isLoggedIn: !!data.isLoggedIn,
            lastActive: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
        console.log('Auth saved to localStorage');
        return true;
    } catch (e) {
        console.error('Gagal simpan auth ke localStorage:', e);
        return false;
    }
}

function safeGetStoredAuth() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        const parsed = JSON.parse(data);
        // Validate data to prevent crashes
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch (e) {
        console.error('Gagal baca auth dari localStorage:', e);
        return null;
    }
}

function safeClearStoredAuth() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Auth cleared from localStorage');
    } catch (e) {
        console.error('Gagal hapus auth dari localStorage:', e);
    }
}
