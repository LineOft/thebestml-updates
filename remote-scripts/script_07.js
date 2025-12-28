
    // Config
    let appConfig = {
        apkUrl: 'https://dosya.co/dho18v1fbzq0/THEBEST_IMGUI-v2.8.apk.html',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mobile.legends'
    };
    
    const APP_VERSION = '4.2.80';
    function toggleProfilePanel() {
        const sidebar = document.getElementById('profileSidebar');
        const overlay = document.getElementById('profileOverlay');
        
        if (sidebar.classList.contains('active')) {
            // Kapat
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // AÃ§
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Profil paneli UI'Ä±nÄ± gÃ¼ncelle
    function updateProfilePanelUI() {
        const headerLoggedIn = document.getElementById('sidebarHeaderLoggedIn');
        const headerLoggedOut = document.getElementById('sidebarHeaderLoggedOut');
        const contentLoggedIn = document.getElementById('sidebarContentLoggedIn');
        const contentLoggedOut = document.getElementById('sidebarContentLoggedOut');
        const toggleBtn = document.getElementById('profileToggleBtn');
        const sidebarAdminBtn = document.getElementById('sidebarAdminBtn');
        
        if (currentUser) {
            // GiriÅŸ yapmÄ±ÅŸ
            headerLoggedIn.style.display = 'block';
            headerLoggedOut.style.display = 'none';
            contentLoggedIn.style.display = 'block';
            contentLoggedOut.style.display = 'none';
            toggleBtn.classList.add('logged-in');
            
            // Email'i gÃ¶ster
            document.getElementById('sidebarEmail').textContent = currentUser.email;
            document.getElementById('sidebarUsername').textContent = currentUser.email.split('@')[0];
            
            // Admin kontrolÃ¼
            if (isAdmin()) {
                sidebarAdminBtn.style.display = 'flex';
            } else {
                sidebarAdminBtn.style.display = 'none';
            }
            
            // Profil fotoÄŸrafÄ±nÄ± yÃ¼kle
            loadProfilePhoto();
            
        } else {
            // GiriÅŸ yapmamÄ±ÅŸ
            headerLoggedIn.style.display = 'none';
            headerLoggedOut.style.display = 'block';
            contentLoggedIn.style.display = 'none';
            contentLoggedOut.style.display = 'block';
            toggleBtn.classList.remove('logged-in');
            
            // AvatarlarÄ± sÄ±fÄ±rla
            resetProfileAvatars();
        }
    }
    
    // Profil fotoÄŸrafÄ±nÄ± Firestore'dan yÃ¼kle
    async function loadProfilePhoto() {
        if (!currentUser) return;
        
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists && userDoc.data().profilePhoto) {
                const photoUrl = userDoc.data().profilePhoto;
                setProfileAvatars(photoUrl);
            } else {
                resetProfileAvatars();
            }
        } catch(e) {
            console.log('Profil fotoÄŸrafÄ± yÃ¼klenemedi:', e);
            resetProfileAvatars();
        }
    }
    
    // Profil avatarlarÄ±nÄ± ayarla
    function setProfileAvatars(photoUrl) {
        // Sidebar avatar
        const avatarImg = document.getElementById('profileAvatarImg');
        const avatarDisplay = document.getElementById('profileAvatarDisplay');
        avatarImg.src = photoUrl;
        avatarImg.style.display = 'block';
        avatarDisplay.querySelector('span').style.display = 'none';
        
        // Toggle buton avatar
        const toggleBtnAvatar = document.getElementById('toggleBtnAvatar');
        const toggleDefaultAvatar = document.querySelector('.profile-toggle-btn .default-avatar');
        toggleBtnAvatar.src = photoUrl;
        toggleBtnAvatar.style.display = 'block';
        toggleDefaultAvatar.style.display = 'none';
    }
    
    // Profil avatarlarÄ±nÄ± sÄ±fÄ±rla
    function resetProfileAvatars() {
        // Sidebar avatar
        const avatarImg = document.getElementById('profileAvatarImg');
        const avatarDisplay = document.getElementById('profileAvatarDisplay');
        if (avatarImg) {
            avatarImg.src = '';
            avatarImg.style.display = 'none';
        }
        if (avatarDisplay) {
            const span = avatarDisplay.querySelector('span');
            if (span) span.style.display = 'block';
        }
        
        // Toggle buton avatar
        const toggleBtnAvatar = document.getElementById('toggleBtnAvatar');
        const toggleDefaultAvatar = document.querySelector('.profile-toggle-btn .default-avatar');
        if (toggleBtnAvatar) {
            toggleBtnAvatar.src = '';
            toggleBtnAvatar.style.display = 'none';
        }
        if (toggleDefaultAvatar) {
            toggleDefaultAvatar.style.display = 'block';
        }
    }
    
    // Profil fotoÄŸrafÄ± seÃ§ildiÄŸinde
    async function handleProfilePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Dosya boyutu kontrolÃ¼ (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('âŒ FotoÄŸraf 2MB\'dan kÃ¼Ã§Ã¼k olmalÄ±');
            return;
        }
        
        // Sadece resim dosyalarÄ±
        if (!file.type.startsWith('image/')) {
            showToast('âŒ Sadece resim dosyasÄ± yÃ¼kleyebilirsiniz');
            return;
        }
        
        showToast('â³ FotoÄŸraf yÃ¼kleniyor...');
        
        try {
            // Resmi sÄ±kÄ±ÅŸtÄ±r ve Base64'e Ã§evir
            const compressedBase64 = await compressAndConvertToBase64(file);
            
            // Firestore'a kaydet
            await db.collection('users').doc(currentUser.uid).set({
                profilePhoto: compressedBase64,
                profilePhotoUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            // Avatar'larÄ± gÃ¼ncelle
            setProfileAvatars(compressedBase64);
            
            showToast('âœ… Profil fotoÄŸrafÄ± gÃ¼ncellendi!');
        } catch(e) {
            console.error('FotoÄŸraf yÃ¼kleme hatasÄ±:', e);
            showToast('âŒ FotoÄŸraf yÃ¼klenemedi');
        }
    }
    
    // Resmi sÄ±kÄ±ÅŸtÄ±r ve Base64'e Ã§evir
    function compressAndConvertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Canvas ile sÄ±kÄ±ÅŸtÄ±r
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Max boyut 200x200 (daha kÃ¼Ã§Ã¼k)
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 200;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // JPEG olarak %50 kalitede kaydet (daha dÃ¼ÅŸÃ¼k)
                    const base64 = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Dekont/resim gibi bÃ¼yÃ¼k gÃ¶rselleri Firestore'a daha uygun hale getir
    function compressReceiptImageToDataUrl(file, opts = {}) {
        const {
            maxSize = 1280,
            quality = 0.72,
            mimeType = 'image/jpeg',
            passthroughUnderBytes = 350 * 1024
        } = opts || {};

        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('Dosya seÃ§ilmedi'));
            if (!file.type || !file.type.startsWith('image/')) return reject(new Error('Sadece resim dosyasÄ± seÃ§in'));

            // Ã‡ok kÃ¼Ã§Ã¼k dosyalarÄ± olduÄŸu gibi geÃ§ir (okunabilirliÄŸi koru)
            if (Number.isFinite(file.size) && file.size > 0 && file.size <= passthroughUnderBytes) {
                const passthroughReader = new FileReader();
                passthroughReader.onload = (e) => resolve(e.target.result);
                passthroughReader.onerror = () => reject(new Error('Dosya okunamadÄ±'));
                passthroughReader.readAsDataURL(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject(new Error('Canvas desteklenmiyor'));

                    let width = img.width;
                    let height = img.height;

                    const maxDim = Math.max(width, height);
                    if (maxDim > maxSize) {
                        const ratio = maxSize / maxDim;
                        width = Math.max(1, Math.round(width * ratio));
                        height = Math.max(1, Math.round(height * ratio));
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    try {
                        const dataUrl = canvas.toDataURL(mimeType, quality);
                        resolve(dataUrl);
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = () => reject(new Error('Resim okunamadÄ±'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Dosya okunamadÄ±'));
            reader.readAsDataURL(file);
        });
    }

    function getFirebaseStorageSafe() {
        try {
            if (storage) return storage;
            if (typeof firebase !== 'undefined' && typeof firebase.storage === 'function') return firebase.storage();
        } catch (e) {}
        return null;
    }

    async function compressReceiptImageToJpegBlob(file, opts = {}) {
        const dataUrl = await compressReceiptImageToDataUrl(file, {
            ...opts,
            mimeType: 'image/jpeg'
        });
        const res = await fetch(dataUrl);
        return await res.blob();
    }

    async function uploadReceiptToStorage(dekontFile, { orderId, userId }) {
        const st = getFirebaseStorageSafe();
        if (!st) throw new Error('Storage hazÄ±r deÄŸil');
        if (!userId) throw new Error('KullanÄ±cÄ± bulunamadÄ±');
        if (!orderId) throw new Error('SipariÅŸ kimliÄŸi oluÅŸturulamadÄ±');

        const blob = await compressReceiptImageToJpegBlob(dekontFile);
        const filename = `${orderId}_${Date.now()}.jpg`;
        const path = `receipts/${userId}/${filename}`;
        const ref = st.ref().child(path);

        const snapshot = await ref.put(blob, {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000'
        });
        const url = await snapshot.ref.getDownloadURL();

        return {
            dekontUrl: url,
            dekontStoragePath: path
        };
    }

    function withTimeout(promise, ms, label = 'timeout') {
        return new Promise((resolve, reject) => {
            let settled = false;
            const t = setTimeout(() => {
                if (settled) return;
                settled = true;
                reject(new Error(label));
            }, ms);
            Promise.resolve(promise)
                .then((v) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(t);
                    resolve(v);
                })
                .catch((e) => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(t);
                    reject(e);
                });
        });
    }

    async function prepareReceiptForOrder(dekontFile, { orderId, userId }) {
        // AsÄ±l hedef: Firestore'a base64 yazmamak (kota/limit tasarrufu)
        // Storage yoksa geri uyumluluk iÃ§in base64'e dÃ¼ÅŸ.
        const st = getFirebaseStorageSafe();
        if (!st) {
            const base64 = await compressReceiptImageToDataUrl(dekontFile, { maxSize: 1024, quality: 0.66, passthroughUnderBytes: 220 * 1024 });
            return { dekontUrl: null, dekontStoragePath: null, dekontBase64: base64 };
        }

        try {
            // Mobilde yavaÅŸ aÄŸ/Storage takÄ±lmalarÄ±nda sipariÅŸ dakikalarca beklemesin
            const uploaded = await withTimeout(
                uploadReceiptToStorage(dekontFile, { orderId, userId }),
                25000,
                'storage_upload_timeout'
            );
            return { ...uploaded, dekontBase64: null };
        } catch (err) {
            console.warn('Dekont Storage yÃ¼kleme baÅŸarÄ±sÄ±z, base64 fallback kullanÄ±lacak:', err);
            const base64 = await compressReceiptImageToDataUrl(dekontFile, { maxSize: 1024, quality: 0.66, passthroughUnderBytes: 220 * 1024 });
            return { dekontUrl: null, dekontStoragePath: null, dekontBase64: base64 };
        }
    }

    function getFriendlyOrderErrorMessage(e) {
        const code = String((e && (e.code || e.errorCode)) || '').toLowerCase();
        const msg = String((e && e.message) || e || '').trim();
        const msgLower = msg.toLowerCase();

        // Firebase Storage hatalarÄ±
        if (code.startsWith('storage/')) {
            if (code.includes('unauthorized')) return 'Dekont yÃ¼kleme yetkisi yok. LÃ¼tfen tekrar giriÅŸ yapÄ±n.';
            if (code.includes('canceled')) return 'Dekont yÃ¼kleme iptal edildi.';
            if (code.includes('retry-limit-exceeded')) return 'Dekont yÃ¼kleme baÅŸarÄ±sÄ±z. LÃ¼tfen tekrar deneyin.';
            if (code.includes('quota-exceeded')) return 'Depolama kotasÄ± dolu. LÃ¼tfen daha sonra tekrar deneyin.';
            return 'Dekont yÃ¼klenemedi. LÃ¼tfen tekrar deneyin.';
        }

        // Firebase/Firestore RESOURCE_EXHAUSTED genelde "Quota exceeded." olarak gelir
        if (code === 'resource-exhausted' || msgLower.includes('quota exceeded')) {
            return 'Sistem yoÄŸun veya kota doldu. LÃ¼tfen birkaÃ§ dakika sonra tekrar deneyin.';
        }

        // Firestore dokÃ¼man / istek boyutu limitleri
        if (
            msgLower.includes('request message must not be larger') ||
            msgLower.includes('payload too large') ||
            msgLower.includes('entity too large') ||
            msgLower.includes('too large')
        ) {
            return 'Dekont fotoÄŸrafÄ± Ã§ok bÃ¼yÃ¼k. Daha kÃ¼Ã§Ã¼k bir fotoÄŸraf deneyin (ekran gÃ¶rÃ¼ntÃ¼sÃ¼ veya kÄ±rpma iÅŸe yarar).';
        }

        if (code === 'permission-denied' || msgLower.includes('missing or insufficient permissions')) {
            return 'Yetki hatasÄ±. LÃ¼tfen Ã§Ä±kÄ±ÅŸ yapÄ±p tekrar giriÅŸ yapÄ±n.';
        }

        return msg || 'Bilinmeyen hata';
    }
    
    // Sidebar badge'lerini gÃ¼ncelle
    function updateSidebarBadges() {
        // SipariÅŸ badge
        const orderBadge = document.getElementById('sidebarOrderBadge');
        const mainOrderBadge = document.getElementById('myOrderBadge');
        if (mainOrderBadge && mainOrderBadge.textContent !== '0') {
            orderBadge.textContent = mainOrderBadge.textContent;
            orderBadge.style.display = 'inline';
        } else {
            orderBadge.style.display = 'none';
        }
        
        // Bildirim badge
        const notifBadge = document.getElementById('sidebarNotifBadge');
        const mainNotifBadge = document.getElementById('notifBadge');
        if (mainNotifBadge && mainNotifBadge.textContent !== '0') {
            notifBadge.textContent = mainNotifBadge.textContent;
            notifBadge.style.display = 'inline';
        } else {
            notifBadge.style.display = 'none';
        }
        
        // Chat badge
        const chatBadge = document.getElementById('sidebarChatBadge');
        const mainChatBadge = document.getElementById('chatBadge');
        if (mainChatBadge && mainChatBadge.textContent !== '0') {
            chatBadge.textContent = mainChatBadge.textContent;
            chatBadge.style.display = 'inline';
        } else {
            chatBadge.style.display = 'none';
        }
        
        // Profil toggle notification dot
        const notifDot = document.getElementById('profileNotifDot');
        const hasNotifications = (mainOrderBadge && mainOrderBadge.style.display !== 'none') ||
                                 (mainNotifBadge && mainNotifBadge.style.display !== 'none') ||
                                 (mainChatBadge && mainChatBadge.style.display !== 'none');
        notifDot.style.display = hasNotifications ? 'block' : 'none';
    }
    
    // Sidebar key durumunu gÃ¼ncelle
    function updateSidebarKeyStatus(text, isActive) {
        const keyStatus = document.getElementById('sidebarKeyStatus');
        const keyText = document.getElementById('sidebarKeyText');
        
        keyText.textContent = text;
        keyStatus.className = 'profile-key-status' + (isActive ? ' active' : ' expired');
        keyText.className = 'profile-key-value' + (isActive ? ' active' : ' expired');
    }
    
    // ==================== MERKEZÄ° GÄ°RÄ°Å KONTROLÃœ ====================
    // SatÄ±n alma iÅŸlemleri iÃ§in giriÅŸ zorunluluÄŸu
    function requireLogin(action = 'bu iÅŸlemi yapmak') {
        if (!currentUser) {
            showLoginRequiredModal(action);
            return false;
        }
        return true;
    }
    
    // GiriÅŸ gerekli modal'Ä±nÄ± gÃ¶ster
    function showLoginRequiredModal(action) {
        // Overlay oluÅŸtur
        const overlay = document.createElement('div');
        overlay.id = 'loginRequiredOverlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px); animation: fadeIn 0.3s ease;';
        
        overlay.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 30px; text-align: center; max-width: 350px; width: 100%; border: 2px solid rgba(255,152,0,0.5); box-shadow: 0 0 30px rgba(255,152,0,0.2); animation: scaleIn 0.3s ease;">
                <div style="font-size: 60px; margin-bottom: 15px;">ğŸ”</div>
                <h3 style="color: #FF9800; margin-bottom: 10px; font-size: 20px;">GiriÅŸ YapmanÄ±z Gerekiyor</h3>
                <p style="color: #aaa; font-size: 14px; margin-bottom: 25px; line-height: 1.5;">
                    ${action.charAt(0).toUpperCase() + action.slice(1)} iÃ§in hesabÄ±nÄ±za giriÅŸ yapmanÄ±z gerekmektedir.
                </p>
                <button onclick="closeLoginRequiredModal(); navigateTo('loginPage');" style="width: 100%; background: linear-gradient(135deg, #4CAF50, #45a049); border: none; color: #fff; padding: 15px; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">
                    ğŸ” GiriÅŸ Yap
                </button>
                <button onclick="closeLoginRequiredModal(); navigateTo('registerPage');" style="width: 100%; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); color: #fff; padding: 15px; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">
                    ğŸ“ KayÄ±t Ol
                </button>
                <button onclick="closeLoginRequiredModal();" style="width: 100%; background: transparent; border: none; color: #888; padding: 10px; font-size: 13px; cursor: pointer;">
                    â† VazgeÃ§
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }
    
    // GiriÅŸ gerekli modal'Ä±nÄ± kapat
    function closeLoginRequiredModal() {
        const overlay = document.getElementById('loginRequiredOverlay');
        if (overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    }
    
    // ==================== PUSH NOTIFICATION SERVER ====================
    // Ãœcretsiz Vercel sunucusu ile push bildirimi gÃ¶nderme
    const PUSH_SERVER = {
        url: 'https://push-server-psi.vercel.app', // Vercel deploy URL
        apiKey: 'thebestml_push_secret_2024' // GÃ¼venlik anahtarÄ±
    };

    async function registerFcmTokenOnServer(tokenValue, topicName = 'all_users') {
        if (!PUSH_SERVER.url || !PUSH_SERVER.apiKey || !tokenValue) return false;
        try {
            const response = await fetch(`${PUSH_SERVER.url}/api/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': PUSH_SERVER.apiKey
                },
                body: JSON.stringify({
                    registerToken: true,
                    token: tokenValue,
                    topic: topicName
                })
            });
            const result = await response.json();
            return !!result.success;
        } catch (e) {
            console.log('registerFcmTokenOnServer hata:', e.message);
            return false;
        }
    }

    // Cloudflare Worker device token register (FCM -> D1)
    async function registerDeviceTokenOnWorker(tokenValue, platformName = 'web') {
        try {
            if (!tokenValue) return false;
            if (!currentUser) return false;
            // Make sure remote config is loaded (contains ordersApiBase)
            try { await loadRemoteRuntimeConfig(); } catch (e) {}

            const base = getOrdersApiBase();
            if (!base) return false;

            await workerApiFetch(base, '/v1/devices/register', {
                method: 'POST',
                body: {
                    token: tokenValue,
                    platform: platformName
                }
            });

            return true;
        } catch (e) {
            console.log('registerDeviceTokenOnWorker hata:', e?.message || e);
            return false;
        }
    }

    async function sendPushToAdmins(title, body, data = {}) {
        if (!PUSH_SERVER.url || !PUSH_SERVER.apiKey) {
            console.log('Push server yapÄ±landÄ±rÄ±lmamÄ±ÅŸ');
            return false;
        }

        try {
            console.log('ğŸ“¤ Adminlere bildirim (topic: admin_users)');

            const response = await fetch(PUSH_SERVER.url + '/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': PUSH_SERVER.apiKey
                },
                body: JSON.stringify({
                    topic: 'admin_users',
                    title: title,
                    body: body,
                    data: data
                })
            });

            const result = await response.json();
            return !!result.success;
        } catch (e) {
            console.error('Admin push bildirim hatasÄ±:', e);
            return false;
        }
    }

    async function ensureAdminTopicSubscription() {
        try {
            if (!currentUser || !fcmToken) return false;
            if (!isAdmin()) return false;

            const key = 'adminTopicSub_' + currentUser.uid;
            const already = localStorage.getItem(key) === '1';
            if (already) return true;

            const ok = await registerFcmTokenOnServer(fcmToken, 'admin_users');
            if (ok) {
                try { localStorage.setItem(key, '1'); } catch (e) {}
            }
            return ok;
        } catch (e) {
            return false;
        }
    }
    
    // FCM Debug - Bildirim durumunu test et
    async function testFcmNotification() {
        // GÃ¼venlik/UX: test aracÄ± son kullanÄ±cÄ±dan gizli tutulur
        showToast('â„¹ï¸ Bu bÃ¶lÃ¼m devre dÄ±ÅŸÄ±');
        return;
        showToast('ğŸ”” FCM test baÅŸlatÄ±lÄ±yor...');
        
        const debugInfo = [];
        debugInfo.push('=== FCM DEBUG ===');
        debugInfo.push('Push Server: ' + PUSH_SERVER.url);
        debugInfo.push('API Key: ' + (PUSH_SERVER.apiKey ? 'VAR' : 'YOK'));
        
        // Token'Ä± gÃ¶ster ve kopyala seÃ§eneÄŸi sun
        if (fcmToken) {
            debugInfo.push('');
            debugInfo.push('FCM TOKEN (tam):');
            debugInfo.push(fcmToken);
            debugInfo.push('');
            
            // Token'Ä± panoya kopyala
            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(fcmToken);
                    debugInfo.push('ğŸ“‹ Token panoya kopyalandÄ±!');
                }
            } catch(e) {
                debugInfo.push('(Kopyalama baÅŸarÄ±sÄ±z)');
            }
            
            // DoÄŸrudan token'a bildirim gÃ¶nder
            try {
                const response = await fetch(`${PUSH_SERVER.url}/api/send-notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': PUSH_SERVER.apiKey
                    },
                    body: JSON.stringify({ 
                        token: fcmToken, 
                        title: 'ğŸ§ª FCM Token Test', 
                        body: 'DoÄŸrudan token\'a gÃ¶nderildi - ' + new Date().toLocaleTimeString(),
                        data: { type: 'test' }
                    })
                });
                const result = await response.json();
                debugInfo.push('Token Test: ' + (result.success ? 'âœ… BAÅARILI' : 'âŒ HATA: ' + (result.error || result.details)));
            } catch(e) {
                debugInfo.push('Token Test: âŒ HATA: ' + e.message);
            }
        } else {
            debugInfo.push('FCM Token: YOK');
            debugInfo.push('Token Test: âš ï¸ Token yok, atlandÄ±');
        }

        // Token'Ä± server-side topic'e abone et (client plugin gerektirmez)
        if (fcmToken) {
            try {
                const response = await fetch(`${PUSH_SERVER.url}/api/send-notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': PUSH_SERVER.apiKey
                    },
                    body: JSON.stringify({
                        registerToken: true,
                        token: fcmToken,
                        topic: 'all_users'
                    })
                });
                const result = await response.json();
                debugInfo.push('Register Token: ' + (result.success ? 'âœ… BAÅARILI' : 'âŒ HATA: ' + (result.error || result.details)));
            } catch (e) {
                debugInfo.push('Register Token: âŒ HATA: ' + e.message);
            }
        } else {
            debugInfo.push('Register Token: âš ï¸ Token yok, atlandÄ±');
        }
        
        // Topic'e de gÃ¶nder
        try {
            const response = await fetch(`${PUSH_SERVER.url}/api/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': PUSH_SERVER.apiKey
                },
                body: JSON.stringify({ 
                    topic: 'all_users', 
                    title: 'ğŸ§ª FCM Topic Test', 
                    body: 'Bu bildirim all_users topic\'ine gÃ¶nderildi - ' + new Date().toLocaleTimeString(),
                    data: { type: 'test' }
                })
            });
            const result = await response.json();
            debugInfo.push('Topic Test: ' + (result.success ? 'âœ… BAÅARILI' : 'âŒ HATA: ' + (result.error || result.details)));
        } catch(e) {
            debugInfo.push('Topic Test: âŒ HATA: ' + e.message);
        }
        
        // SonuÃ§larÄ± gÃ¶ster
        alert(debugInfo.join('\n'));
    }
    
    // Push notification gÃ¶nder (sunucu Ã¼zerinden) - detaylÄ± sonuÃ§ dÃ¶ndÃ¼rÃ¼r
    async function sendPushNotificationWithResult(token, title, body, data = {}) {
        const out = {
            success: false,
            httpStatus: 0,
            result: null,
            error: null
        };

        if (!PUSH_SERVER.url || !PUSH_SERVER.apiKey) {
            out.error = 'push_server_not_configured';
            console.log('Push server yapÄ±landÄ±rÄ±lmamÄ±ÅŸ');
            return out;
        }

        try {
            const response = await fetch(`${PUSH_SERVER.url}/api/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': PUSH_SERVER.apiKey
                },
                body: JSON.stringify({ token, title, body, data })
            });

            out.httpStatus = response.status;
            const raw = await response.text();
            try {
                out.result = raw ? JSON.parse(raw) : null;
            } catch (e) {
                out.result = { raw };
            }
            out.success = !!(out.result && out.result.success);
            console.log('Push bildirim gÃ¶nderildi:', out.result);
            return out;
        } catch (e) {
            out.error = e?.message || String(e);
            console.error('Push bildirim hatasÄ±:', e);
            return out;
        }
    }

    // Push notification gÃ¶nder (sunucu Ã¼zerinden)
    async function sendPushNotification(token, title, body, data = {}) {
        const res = await sendPushNotificationWithResult(token, title, body, data);
        return !!res.success;
    }
    
    // Birden fazla kullanÄ±cÄ±ya push bildirim gÃ¶nder
    async function sendPushToMultiple(tokens, title, body, data = {}) {
        if (!PUSH_SERVER.url || !PUSH_SERVER.apiKey || !tokens.length) {
            return false;
        }
        
        try {
            const response = await fetch(`${PUSH_SERVER.url}/api/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': PUSH_SERVER.apiKey
                },
                body: JSON.stringify({ tokens, title, body, data })
            });
            
            const result = await response.json();
            return result.success;
        } catch (e) {
            console.error('Ã‡oklu push bildirim hatasÄ±:', e);
            return false;
        }
    }
    
    // TÃ¼m kullanÄ±cÄ±lara push bildirim gÃ¶nder - TOPIC BASED (server-side subscribe)
    async function sendPushToAll(title, body, data = {}) {
        if (!PUSH_SERVER.url || !PUSH_SERVER.apiKey) {
            console.log('Push server yapÄ±landÄ±rÄ±lmamÄ±ÅŸ');
            showToast('âš ï¸ Push server ayarlanmamÄ±ÅŸ');
            return false;
        }

        try {
            console.log('ğŸ“¤ TÃ¼m kullanÄ±cÄ±lara bildirim (topic: all_users)');

            const response = await fetch(PUSH_SERVER.url + '/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': PUSH_SERVER.apiKey
                },
                body: JSON.stringify({ 
                    topic: 'all_users',
                    title: title, 
                    body: body, 
                    data: data 
                })
            });
            
            const result = await response.json();
            console.log('Bildirim sonucu:', result);
            
            if (result.success) {
                showToast('âœ… Bildirim gÃ¶nderildi');
                return true;
            } else {
                showToast('âŒ Bildirim gÃ¶nderilemedi: ' + (result.error || result.details || 'Bilinmeyen hata'));
                return false;
            }
        } catch (e) {
            console.error('Push bildirim hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
            return false;
        }
    }
    
    // ==================== MERKEZÄ° Ã–DEME SÄ°STEMÄ° ====================
    // TÃ¼m Ã¶deme iÅŸlemleri bu sistem Ã¼zerinden yÃ¶netilir
    let paymentSettings = {
        bankInfo: {
            name: 'ONUR TENK',
            bank: 'Garanti BankasÄ±',
            iban: 'TR26 0006 2000 7750 0006 8826 02',
            ibanClean: 'TR2600062000775000068826 02'
        },
        shopier: {
            enabled: true,
            storeUrl: 'https://www.shopier.com/CheatsStore',
            // VarsayÄ±lan linkler (hile bazÄ±nda Ã¶zelleÅŸtirilebilir)
            defaultLinks: {}
        },
        methods: [
            { id: 'shopier', name: 'Kredi KartÄ±', icon: 'ğŸ’³', desc: 'Shopier ile gÃ¼venli Ã¶deme', enabled: true, comingSoon: true },
            { id: 'havale', name: 'Havale / EFT', icon: 'ğŸ¦', desc: 'Banka havalesi ile Ã¶deme', enabled: true }
        ]
    };
    
    // Merkezi sipariÅŸ verisi
    let currentPaymentOrder = null;
    
    // Ã–deme ayarlarÄ±nÄ± Firestore'dan yÃ¼kle
    async function loadPaymentSettings() {
        try {
            const doc = await db.collection('settings').doc('paymentSettings').get();
            if (doc.exists) {
                const data = doc.data();
                if (data.bankInfo) paymentSettings.bankInfo = data.bankInfo;
                if (data.methods) paymentSettings.methods = data.methods;
                if (data.shopier) paymentSettings.shopier = { ...paymentSettings.shopier, ...data.shopier };
                // Push server ayarlarÄ±nÄ± yÃ¼kle - SADECE geÃ§erli URL varsa
                if (data.pushServer && data.pushServer.url && data.pushServer.url.includes('push-server-psi')) {
                    PUSH_SERVER.url = data.pushServer.url;
                    PUSH_SERVER.apiKey = data.pushServer.apiKey || PUSH_SERVER.apiKey;
                    console.log('ğŸ“± Push server ayarlarÄ± Firestore\'dan yÃ¼klendi');
                } else {
                    console.log('ğŸ“± Push server varsayÄ±lan ayarlar kullanÄ±lÄ±yor:', PUSH_SERVER.url);
                }
            }
        } catch(e) {
            console.log('Ã–deme ayarlarÄ± yÃ¼klenemedi, varsayÄ±lan kullanÄ±lÄ±yor');
        }
    }
    
    // Merkezi Ã¶deme modalÄ±nÄ± aÃ§ (tÃ¼m satÄ±n alma iÅŸlemleri iÃ§in)
    async function openUnifiedPaymentModal(orderData) {
        // orderData: { type, game, cheat, package, packageName, price, days, keyCode?, currentExpiry?, newExpiry? }
        const canProceed = await ensureBanRiskAccepted({ prompt: true, reason: 'SatÄ±n alma yapmadan Ã¶nce lÃ¼tfen ban riski bilgilendirmesini onaylayÄ±n.' });
        if (!canProceed) return;

        currentPaymentOrder = orderData;
        
        // Modal iÃ§eriÄŸini oluÅŸtur
        let typeLabel = orderData.type === 'extension' ? 'â° SÃ¼re Uzatma' : 'ğŸ›’ Yeni SatÄ±n Alma';
        let infoHtml = '';
        
        if (orderData.type === 'extension') {
            infoHtml = `
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">${typeLabel}</div>
                <div style="font-size: 14px; font-weight: bold;">${orderData.game} - ${orderData.cheat}</div>
                <div style="font-size: 12px; color: #FF9800; margin-top: 3px;">+${orderData.packageName}</div>
            `;
        } else {
            infoHtml = `
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">${typeLabel}</div>
                <div style="font-size: 14px; font-weight: bold;">${orderData.game || ''} ${orderData.cheat || ''}</div>
                <div style="font-size: 12px; color: #4CAF50; margin-top: 3px;">${orderData.packageName}</div>
            `;
        }
        
        document.getElementById('unifiedPaymentInfo').innerHTML = infoHtml;
        document.getElementById('unifiedPaymentPrice').textContent = orderData.price;
        
        // Ã–deme yÃ¶ntemlerini render et
        renderPaymentMethods();
        
        openModal('unifiedPaymentModal');
    }
    
    // Ã–deme yÃ¶ntemlerini render et
    function renderPaymentMethods() {
        const container = document.getElementById('unifiedPaymentMethods');
        container.innerHTML = paymentSettings.methods.filter(m => m.enabled).map(method => {
            if (method.comingSoon) {
                // YakÄ±nda gelecek - devre dÄ±ÅŸÄ± gÃ¶rÃ¼nÃ¼m
                return `
                    <button onclick="showToast('ğŸ”œ Bu Ã¶deme yÃ¶ntemi yakÄ±nda aktif edilecek!', 'info')" class="payment-method-btn" style="opacity: 0.6; cursor: not-allowed; position: relative;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 30px;">${method.icon}</div>
                            <div style="text-align: left;">
                                <div style="font-weight: bold; font-size: 15px;">${method.name}</div>
                                <div style="font-size: 12px; color: #aaa;">${method.desc}</div>
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, #FF9800, #FF5722); color: white; font-size: 11px; padding: 4px 10px; border-radius: 12px; font-weight: bold;">ğŸ”œ YakÄ±nda</div>
                    </button>
                `;
            } else {
                // Normal aktif buton
                return `
                    <button onclick="selectUnifiedPaymentMethod('${method.id}')" class="payment-method-btn">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 30px;">${method.icon}</div>
                            <div style="text-align: left;">
                                <div style="font-weight: bold; font-size: 15px;">${method.name}</div>
                                <div style="font-size: 12px; color: #aaa;">${method.desc}</div>
                            </div>
                        </div>
                        <div style="font-size: 20px; color: #4CAF50;">â€º</div>
                    </button>
                `;
            }
        }).join('');
    }
    
    // Ã–deme yÃ¶ntemi seÃ§
    function selectUnifiedPaymentMethod(method) {
        if (!currentPaymentOrder) return;
        
        closeModal('unifiedPaymentModal');
        
        if (method === 'shopier') {
            // Shopier'a yÃ¶nlendir
            redirectToShopier();
        } else if (method === 'havale') {
            openUnifiedHavaleModal();
        }
    }
    
    // Shopier'a yÃ¶nlendirme fonksiyonu
    function redirectToShopier() {
        if (!currentPaymentOrder) {
            showToast('âŒ SipariÅŸ bilgisi bulunamadÄ±');
            return;
        }
        
        // Ã–nce fiyat iÃ§indeki shopierLink'i kontrol et
        let shopierUrl = null;
        
        // 1. SeÃ§ilen fiyat paketinde shopierLink varsa onu kullan
        if (currentPaymentOrder.shopierLink) {
            shopierUrl = currentPaymentOrder.shopierLink;
        }
        // 2. Hilenin genel shopierLinks ayarlarÄ±ndan gÃ¼n bazlÄ± bul
        else if (currentPaymentOrder.cheatId && currentPaymentOrder.days) {
            const cheatShopierLinks = getCheatShopierLinks(currentPaymentOrder.gameId, currentPaymentOrder.cheatId);
            if (cheatShopierLinks && cheatShopierLinks[currentPaymentOrder.days]) {
                shopierUrl = cheatShopierLinks[currentPaymentOrder.days];
            }
        }
        // 3. VarsayÄ±lan maÄŸaza linkine yÃ¶nlendir
        if (!shopierUrl) {
            shopierUrl = paymentSettings.shopier?.storeUrl || 'https://www.shopier.com/CheatsStore';
            showToast('â„¹ï¸ Shopier maÄŸazasÄ±na yÃ¶nlendiriliyorsunuz. LÃ¼tfen Ã¼rÃ¼nÃ¼ manuel seÃ§in.');
        } else {
            showToast('ğŸ”— Shopier Ã¶deme sayfasÄ±na yÃ¶nlendiriliyorsunuz...');
        }
        
        // Yeni sekmede aÃ§
        setTimeout(() => {
            window.open(shopierUrl, '_blank');
        }, 500);
    }
    
    // Hile bazlÄ± Shopier linklerini al
    function getCheatShopierLinks(gameId, cheatId) {
        try {
            // Firebase'den yÃ¼klenen gamesData'dan al
            const game = Object.values(gamesData || {}).find(g => g.id === gameId);
            if (game && game.cheats) {
                const cheat = Object.values(game.cheats).find(c => c.id === cheatId);
                if (cheat && cheat.shopierLinks) {
                    return cheat.shopierLinks;
                }
            }
        } catch(e) {
            console.log('Shopier links alÄ±namadÄ±:', e);
        }
        return null;
    }
    
    // Sadakat puanÄ± kullanÄ±mÄ± (havale)
    let unifiedBaseAmount = 0;

    function normalizeNonNegativeInt(value, fallback = 0) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(0, Math.floor(n));
    }

    function updateUnifiedLoyaltySpendUI() {
        try {
            const input = document.getElementById('unifiedLoyaltyUsePoints');
            const availableEl = document.getElementById('unifiedLoyaltyAvailablePoints');
            const discountLine = document.getElementById('unifiedHavaleDiscountLine');
            const amountEl = document.getElementById('unifiedHavaleAmount');

            if (!input || !availableEl || !amountEl) return;

            const available = normalizeNonNegativeInt(availableEl.textContent, 0);
            const maxUsable = Math.min(available, normalizeNonNegativeInt(unifiedBaseAmount, 0));

            let usePts = normalizeNonNegativeInt(input.value, 0);
            if (usePts > maxUsable) usePts = maxUsable;
            input.value = String(usePts);

            const payable = Math.max(0, normalizeNonNegativeInt(unifiedBaseAmount, 0) - usePts);
            amountEl.textContent = payable + 'â‚º';

            if (discountLine) {
                if (usePts > 0) {
                    discountLine.style.display = 'block';
                    discountLine.textContent = 'Sadakat indirimi: -' + usePts + 'â‚º';
                } else {
                    discountLine.style.display = 'none';
                }
            }
        } catch (e) {}
    }

    window.updateUnifiedLoyaltySpendUI = updateUnifiedLoyaltySpendUI;

    // Merkezi havale modalÄ±nÄ± aÃ§
    async function openUnifiedHavaleModal() {
        if (!currentPaymentOrder) return;

        unifiedBaseAmount = parsePriceToAmount(currentPaymentOrder.price);
        
        // Bilgileri doldur
        document.getElementById('unifiedHavaleAmount').textContent = unifiedBaseAmount + 'â‚º';
        const discountLine = document.getElementById('unifiedHavaleDiscountLine');
        if (discountLine) discountLine.style.display = 'none';
        
        let infoText = currentPaymentOrder.type === 'extension' 
            ? `${currentPaymentOrder.game} - ${currentPaymentOrder.cheat} iÃ§in ${currentPaymentOrder.packageName}`
            : `${currentPaymentOrder.game || ''} ${currentPaymentOrder.cheat || ''} - ${currentPaymentOrder.packageName}`;
        document.getElementById('unifiedHavaleInfo').textContent = infoText;
        
        // Banka bilgilerini render et
        document.getElementById('unifiedBankName').textContent = paymentSettings.bankInfo.name;
        document.getElementById('unifiedBankBank').textContent = paymentSettings.bankInfo.bank;
        document.getElementById('unifiedBankIban').textContent = paymentSettings.bankInfo.iban;

        // Sadakat puanÄ± gÃ¶ster
        try {
            const points = await refreshLoyaltyUI(true);
            const availableEl = document.getElementById('unifiedLoyaltyAvailablePoints');
            const input = document.getElementById('unifiedLoyaltyUsePoints');
            if (availableEl) availableEl.textContent = String(points);
            if (input) {
                input.value = '0';
                input.max = String(Math.min(points, unifiedBaseAmount));
            }
            updateUnifiedLoyaltySpendUI();
        } catch (e) {
            const availableEl = document.getElementById('unifiedLoyaltyAvailablePoints');
            const input = document.getElementById('unifiedLoyaltyUsePoints');
            if (availableEl) availableEl.textContent = '0';
            if (input) {
                input.value = '0';
                input.max = '0';
            }
            updateUnifiedLoyaltySpendUI();
        }
        
        // Dekont Ã¶nizlemeyi sÄ±fÄ±rla
        document.getElementById('unifiedDekontFile').value = '';
        document.getElementById('unifiedDekontPreview').style.display = 'none';
        
        openModal('unifiedHavaleModal');
    }
    
    // Dekont Ã¶nizleme
    function previewUnifiedDekont(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('unifiedDekontImg').src = e.target.result;
                document.getElementById('unifiedDekontPreview').style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    // IBAN kopyalama
    function copyUnifiedIban() {
        copyToClipboard(paymentSettings.bankInfo.ibanClean);
    }
    
    // Merkezi sipariÅŸ gÃ¶nder
    async function submitUnifiedOrder() {
        if (!currentUser) {
            showToast('âŒ GiriÅŸ yapmanÄ±z gerekiyor');
            return;
        }

        const canProceed = await ensureBanRiskAccepted({ prompt: true, reason: 'SipariÅŸ gÃ¶ndermeden Ã¶nce lÃ¼tfen ban riski bilgilendirmesini onaylayÄ±n.' });
        if (!canProceed) return;
        
        if (!currentPaymentOrder) {
            showToast('âŒ SipariÅŸ bilgisi bulunamadÄ±');
            return;
        }
        
        const fileInput = document.getElementById('unifiedDekontFile');
        if (!fileInput.files[0]) {
            showToast('âŒ Dekont fotoÄŸrafÄ± seÃ§in');
            return;
        }

        const dekontFile = fileInput.files[0];
        if (!dekontFile.type || !dekontFile.type.startsWith('image/')) {
            showToast('âŒ Sadece resim dosyasÄ± seÃ§in');
            return;
        }

        // Ã‡ok bÃ¼yÃ¼k dosyalarda cihaz/webview bellek sorunlarÄ± yaÅŸanabiliyor
        if (dekontFile.size > 10 * 1024 * 1024) {
            showToast('âŒ Dekont dosyasÄ± Ã§ok bÃ¼yÃ¼k (max 10MB)');
            return;
        }
        
        showToast('â³ SipariÅŸ gÃ¶nderiliyor...');
        
        try {
            // Prefer Cloudflare Worker API (Firestore-free)
            try { await loadRemoteRuntimeConfig(); } catch (e) {}
            const ordersApiBase = getOrdersApiBase();

            // SipariÅŸ objesi
            const requestedPoints = normalizeNonNegativeInt((document.getElementById('unifiedLoyaltyUsePoints') || {}).value, 0);
            const baseAmount = parsePriceToAmount(currentPaymentOrder.price);

            // Dekontu mÃ¼mkÃ¼nse Storage'a yÃ¼kle (Firestore kota/limit tasarrufu)
            // Worker API iÃ§in de aynÄ± dekont URL/base64 alanlarÄ± kullanÄ±lÄ±r.
            const receipt = await prepareReceiptForOrder(dekontFile, { orderId: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())), userId: currentUser.uid });

            // Worker modu: sadakat puanÄ± ÅŸimdilik devre dÄ±ÅŸÄ± (Firestore baÄŸÄ±mlÄ±)
            if (ordersApiBase) {
                if (requestedPoints > 0) {
                    showToast('âš ï¸ Sadakat puanÄ± ÅŸu an kullanÄ±lamÄ±yor');
                    return;
                }

                // Worker ÅŸemasÄ± strict: bazÄ± paketlerde sayÄ± gelebiliyor; burada stringe Ã§evir
                const gameStr = String(currentPaymentOrder.game || '').trim();
                const cheatStr = String(currentPaymentOrder.cheat || '').trim();
                const packageStr = String((typeof currentPaymentOrder.package === 'undefined' || currentPaymentOrder.package === null) ? '' : currentPaymentOrder.package).trim();
                const packageNameStr = String(currentPaymentOrder.packageName || '').trim();
                const priceStr = String((typeof currentPaymentOrder.price === 'undefined' || currentPaymentOrder.price === null) ? '' : currentPaymentOrder.price).trim();

                if (!gameStr) { showToast('âŒ Oyun bilgisi eksik'); return; }
                if (!packageStr) { showToast('âŒ Paket bilgisi eksik'); return; }
                if (!packageNameStr) { showToast('âŒ Paket adÄ± eksik'); return; }
                if (!priceStr) { showToast('âŒ Fiyat bilgisi eksik'); return; }

                const payload = {
                    userId: currentUser.uid,
                    email: currentUser.email,
                    userEmail: currentUser.email,
                    type: currentPaymentOrder.type || 'purchase',
                    game: gameStr,
                    cheat: cheatStr,
                    package: packageStr,
                    packageName: packageNameStr,
                    price: priceStr,
                    baseAmount: baseAmount,
                    payableAmount: baseAmount,
                    loyaltyUsedPoints: 0,
                    loyaltyDiscountAmount: 0,
                    days: currentPaymentOrder.days,
                    dekontUrl: receipt.dekontUrl || null,
                    dekontStoragePath: receipt.dekontStoragePath || null,
                    dekont: receipt.dekontBase64 || null,
                    paymentMethod: 'havale',
                    status: 'pending'
                };

                // SÃ¼re uzatma iÃ§in ek alanlar
                if (currentPaymentOrder.type === 'extension') {
                    payload.keyCode = currentPaymentOrder.keyCode;
                    payload.keyId = currentPaymentOrder.keyId;
                    payload.currentExpiry = currentPaymentOrder.currentExpiry;
                    payload.newExpiry = currentPaymentOrder.newExpiry;
                    payload.extensionDays = currentPaymentOrder.days;
                }

                await workerApiFetch(ordersApiBase, '/v1/orders', { method: 'POST', body: payload });

                closeModal('unifiedHavaleModal');
                showOrderSuccessModal();
                showToast('âœ… SipariÅŸiniz alÄ±ndÄ±!');
                currentPaymentOrder = null;
                return;
            }

            // Firestore fallback
            const userRef = db.collection('users').doc(currentUser.uid);
            const orderRef = db.collection('orders').doc();
            let pointsUsed = 0;

            // Dekontu mÃ¼mkÃ¼nse Storage'a yÃ¼kle (Firestore kota/limit tasarrufu)
            // (YukarÄ±da Ã¼retildi; Firestore iÃ§in orderId'yi gerÃ§ek doc id ile yenileyelim)
            const receiptFs = await prepareReceiptForOrder(dekontFile, { orderId: orderRef.id, userId: currentUser.uid });

            await db.runTransaction(async (tx) => {
                const userSnap = await tx.get(userRef);
                if (!userSnap.exists) throw new Error('KullanÄ±cÄ± kaydÄ± bulunamadÄ±');
                const userData = userSnap.data() || {};
                const currentPoints = getLoyaltyPoints(userData);

                pointsUsed = Math.min(requestedPoints, currentPoints, baseAmount);
                if (!Number.isFinite(pointsUsed) || pointsUsed < 0) pointsUsed = 0;
                pointsUsed = Math.floor(pointsUsed);

                const payableAmount = Math.max(0, baseAmount - pointsUsed);

                const orderData = {
                    userId: currentUser.uid,
                    email: currentUser.email,
                    userEmail: currentUser.email,
                    type: currentPaymentOrder.type || 'purchase',
                    game: currentPaymentOrder.game || '',
                    cheat: currentPaymentOrder.cheat || '',
                    package: currentPaymentOrder.package,
                    packageName: currentPaymentOrder.packageName,
                    price: currentPaymentOrder.price,
                    baseAmount: baseAmount,
                    payableAmount: payableAmount,
                    loyaltyUsedPoints: pointsUsed,
                    loyaltyDiscountAmount: pointsUsed,
                    days: currentPaymentOrder.days,
                    dekontUrl: receiptFs.dekontUrl || null,
                    dekontStoragePath: receiptFs.dekontStoragePath || null,
                    // Storage yoksa geri uyumluluk iÃ§in base64 alanÄ± dolabilir
                    dekont: receiptFs.dekontBase64 || null,
                    paymentMethod: 'havale',
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // SÃ¼re uzatma iÃ§in ek alanlar
                if (currentPaymentOrder.type === 'extension') {
                    orderData.keyCode = currentPaymentOrder.keyCode;
                    orderData.keyId = currentPaymentOrder.keyId;
                    orderData.currentExpiry = currentPaymentOrder.currentExpiry;
                    orderData.newExpiry = currentPaymentOrder.newExpiry;
                    orderData.extensionDays = currentPaymentOrder.days;
                }

                if (pointsUsed > 0) {
                    tx.update(userRef, {
                        loyaltyPoints: firebase.firestore.FieldValue.increment(-pointsUsed),
                        loyaltyUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    orderData.loyaltyUsedAt = firebase.firestore.FieldValue.serverTimestamp();
                }

                tx.set(orderRef, orderData);
            });
            
            // UI'da puanÄ± anlÄ±k gÃ¼ncelle
            try { await refreshLoyaltyUI(true); } catch (e) {}

            // Admin'lere yeni sipariÅŸ bildirimi gÃ¶nder
            try {
                await sendNewOrderNotificationToAdmins(currentUser.email, currentPaymentOrder.packageName, currentPaymentOrder.price);
            } catch (e) {}
            
            closeModal('unifiedHavaleModal');
            showOrderSuccessModal();
            showToast('âœ… SipariÅŸiniz alÄ±ndÄ±!');
            currentPaymentOrder = null;
            
        } catch(e) {
            console.error('SipariÅŸ hatasÄ±:', e);
            const friendly = getFriendlyOrderErrorMessage(e);
            let debug = '';
            try {
                const http = e && e.httpStatus ? `HTTP ${e.httpStatus}` : '';
                const payload = e && e.payload ? JSON.stringify(e.payload) : '';
                const payloadShort = payload ? payload.slice(0, 220) : '';
                debug = (http || payloadShort) ? ` (${[http, payloadShort].filter(Boolean).join(' ')})` : '';
            } catch (err) {}
            showToast('âŒ Hata: ' + friendly + debug);
        }
    }
    // ==================== MERKEZÄ° Ã–DEME SÄ°STEMÄ° SON ====================

    // Firebase Auth State
    let currentUser = null;
    let orderListener = null; // Real-time listener
    let orderPollingInterval = null; // Worker API polling

    // Presence / Online durum takibi
    // NOT: Firestore kota tÃ¼ketimini azaltmak iÃ§in heartbeat sadece admin/owner iÃ§in Ã§alÄ±ÅŸÄ±r.
    let presenceHeartbeatInterval = null;
    let presenceInitializedUid = null;
    const PRESENCE_HEARTBEAT_MS = 60000;

    // Ban riski bilgilendirme (tek seferlik kabul)
    const BAN_RISK_DISCLOSURE_VERSION = '1';
    let currentUserDocData = null;
    let banRiskAcceptedCached = false;
    let banRiskLastCheckedAtMs = 0;

    // Sadakat puanÄ±
    const LOYALTY_EARN_PERCENT = 5; // %5 (TL bazlÄ±) â€” basit MVP

    // Sadakat ayarlarÄ± (admin panelden yÃ¶netilebilir)
    let loyaltyConfigCache = null;
    let loyaltyConfigLoadedAtMs = 0;
    const LOYALTY_CONFIG_CACHE_MS = 5 * 60 * 1000;

    function getDefaultLoyaltyConfig() {
        return {
            earnMode: 'percent',
            earnPercent: LOYALTY_EARN_PERCENT,
            fixedPointsPerOrder: 0
        };
    }

    function clampNumber(value, { min, max, fallback } = { min: 0, max: Number.MAX_SAFE_INTEGER, fallback: 0 }) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        const clamped = Math.min(max, Math.max(min, n));
        return clamped;
    }

    function getLoyaltyConfigSync() {
        if (loyaltyConfigCache && (Date.now() - loyaltyConfigLoadedAtMs) < LOYALTY_CONFIG_CACHE_MS) {
            return loyaltyConfigCache;
        }
        return loyaltyConfigCache || getDefaultLoyaltyConfig();
    }

    async function refreshLoyaltyConfig(force = false) {
        try {
            if (!force && loyaltyConfigCache && (Date.now() - loyaltyConfigLoadedAtMs) < LOYALTY_CONFIG_CACHE_MS) {
                return loyaltyConfigCache;
            }

            const doc = await db.collection('settings').doc('loyalty').get();
            const defaults = getDefaultLoyaltyConfig();
            const data = doc.exists ? (doc.data() || {}) : {};

            const earnMode = (data.earnMode === 'fixed' || data.earnMode === 'percent') ? data.earnMode : defaults.earnMode;
            const earnPercent = Math.floor(clampNumber(data.earnPercent, { min: 0, max: 100, fallback: defaults.earnPercent }));
            const fixedPointsPerOrder = Math.floor(clampNumber(data.fixedPointsPerOrder, { min: 0, max: 1000000, fallback: defaults.fixedPointsPerOrder }));

            loyaltyConfigCache = { earnMode, earnPercent, fixedPointsPerOrder };
            loyaltyConfigLoadedAtMs = Date.now();
            return loyaltyConfigCache;
        } catch (e) {
            console.log('Sadakat ayarlarÄ± yÃ¼klenemedi:', e);
            return getLoyaltyConfigSync();
        }
    }

    function updateLoyaltyEarnModeUI() {
        const modeEl = document.getElementById('settingLoyaltyEarnMode');
        const percentBox = document.getElementById('settingLoyaltyPercentBox');
        const fixedBox = document.getElementById('settingLoyaltyFixedBox');
        if (!modeEl || !percentBox || !fixedBox) return;
        const mode = modeEl.value;
        percentBox.style.display = mode === 'percent' ? 'block' : 'none';
        fixedBox.style.display = mode === 'fixed' ? 'block' : 'none';
    }

    async function loadLoyaltySettingsAdminIntoModal() {
        try {
            if (!hasPermission('app_settings')) return;
            const cfg = await refreshLoyaltyConfig(true);

            const modeEl = document.getElementById('settingLoyaltyEarnMode');
            const percentEl = document.getElementById('settingLoyaltyEarnPercent');
            const fixedEl = document.getElementById('settingLoyaltyFixedPoints');

            if (modeEl) modeEl.value = cfg.earnMode || 'percent';
            if (percentEl) percentEl.value = String(Math.floor(clampNumber(cfg.earnPercent, { min: 0, max: 100, fallback: LOYALTY_EARN_PERCENT })));
            if (fixedEl) fixedEl.value = String(Math.floor(clampNumber(cfg.fixedPointsPerOrder, { min: 0, max: 1000000, fallback: 0 })));

            updateLoyaltyEarnModeUI();
        } catch (e) {
            console.log('Sadakat ayar modal yÃ¼kleme hatasÄ±:', e);
        }
    }

    async function saveLoyaltySettingsAdmin() {
        if (!requirePermission('app_settings', 'sadakat ayarlarÄ±nÄ± dÃ¼zenlemek')) return;
        try {
            const mode = (document.getElementById('settingLoyaltyEarnMode')?.value || 'percent');
            const earnMode = (mode === 'fixed' || mode === 'percent') ? mode : 'percent';
            const earnPercentRaw = document.getElementById('settingLoyaltyEarnPercent')?.value;
            const fixedRaw = document.getElementById('settingLoyaltyFixedPoints')?.value;

            const earnPercent = Math.floor(clampNumber(earnPercentRaw, { min: 0, max: 100, fallback: LOYALTY_EARN_PERCENT }));
            const fixedPointsPerOrder = Math.floor(clampNumber(fixedRaw, { min: 0, max: 1000000, fallback: 0 }));

            await db.collection('settings').doc('loyalty').set({
                earnMode,
                earnPercent,
                fixedPointsPerOrder,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser ? (currentUser.email || null) : null
            }, { merge: true });

            await refreshLoyaltyConfig(true);
            showToast('âœ… Sadakat ayarlarÄ± kaydedildi');
        } catch (e) {
            console.error('Sadakat ayar kaydetme hatasÄ±:', e);
            showToast('âŒ Kaydetme hatasÄ±: ' + e.message);
        }
    }

    function stopPresenceHeartbeat() {
        if (presenceHeartbeatInterval) {
            clearInterval(presenceHeartbeatInterval);
            presenceHeartbeatInterval = null;
        }
    }

    async function touchPresence({ isLogin } = { isLogin: false }) {
        try {
            if (!currentUser) return;

            const payload = {
                email: currentUser.email || null,
                isOnline: true,
                lastSeenAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (isLogin) {
                payload.lastLogin = firebase.firestore.FieldValue.serverTimestamp();
            }

            await db.collection('users').doc(currentUser.uid).set(payload, { merge: true });
        } catch (e) {
            console.log('Presence gÃ¼ncelleme hatasÄ±:', e);
        }
    }

    async function markCurrentUserOffline() {
        try {
            if (!currentUser) return;
            await db.collection('users').doc(currentUser.uid).set({
                isOnline: false,
                lastSeenAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.log('Presence offline hatasÄ±:', e);
        }
    }

    function startPresenceHeartbeat() {
        stopPresenceHeartbeat();
        if (!currentUser) return;

        // Normal kullanÄ±cÄ±lar iÃ§in periyodik presence yazÄ±mÄ± kapalÄ± (kota tÃ¼ketimini ciddi azaltÄ±r)
        if (!(isAdmin() || isOwner())) return;

        touchPresence({ isLogin: false });
        presenceHeartbeatInterval = setInterval(() => {
            touchPresence({ isLogin: false });
        }, PRESENCE_HEARTBEAT_MS);
    }

    // Web kapanÄ±ÅŸÄ±nda/offline iÅŸaretle (best-effort)
    window.addEventListener('beforeunload', () => {
        try { markCurrentUserOffline(); } catch (e) {}
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            try { markCurrentUserOffline(); } catch (e) {}
            try { stopAdminUsageTracking(); } catch (e) {}
        } else {
            try { touchPresence({ isLogin: false }); } catch (e) {}
            try { startAdminUsageTracking(); } catch (e) {}
        }
    });

    // ========== ACÄ°L BAKIM (GitHub config.json) ==========
    // Firestore kota dolduÄŸunda bile kullanÄ±cÄ± trafiÄŸini kesebilmek iÃ§in
    // bakÄ±m bayraÄŸÄ±nÄ± GitHub'daki config.json'dan okur.
    var remoteRuntimeConfig = null;
    var remoteRuntimeConfigLoaded = false;
    var remoteRuntimeConfigPromise = null;
    var remoteRuntimeConfigLastAttemptMs = 0;
    const REMOTE_RUNTIME_CONFIG_RETRY_BACKOFF_MS = 15000;

    function getRemoteRuntimeConfigUrl() {
        return `https://raw.githubusercontent.com/LineOft/thebestml-updates/main/config.json?t=${Date.now()}`;
    }

    function normalizeEmailQuick(email) {
        return String(email || '').trim().toLowerCase();
    }

    async function loadRemoteRuntimeConfig() {
        if (remoteRuntimeConfigLoaded && remoteRuntimeConfig) return remoteRuntimeConfig;
        // EÄŸer Ã¶nceki deneme baÅŸarÄ±sÄ±zsa, kÄ±sa backoff uygula
        if (!remoteRuntimeConfig && remoteRuntimeConfigLastAttemptMs && (Date.now() - remoteRuntimeConfigLastAttemptMs) < REMOTE_RUNTIME_CONFIG_RETRY_BACKOFF_MS) {
            return remoteRuntimeConfig;
        }
        if (remoteRuntimeConfigPromise) return remoteRuntimeConfigPromise;

        remoteRuntimeConfigPromise = (async () => {
            try {
                remoteRuntimeConfigLastAttemptMs = Date.now();
                const res = await fetch(getRemoteRuntimeConfigUrl(), { cache: 'no-store' });
                if (res && res.ok) {
                    remoteRuntimeConfig = await res.json();
                    try { applyWorkerApiConfigFromRemote(); } catch (e) {}
                }
            } catch (e) {
                remoteRuntimeConfig = remoteRuntimeConfig || null;
            } finally {
                // EÄŸer config alÄ±namadÄ±ysa loaded=true yapma; sonraki Ã§aÄŸrÄ±larda tekrar denensin
                remoteRuntimeConfigLoaded = !!remoteRuntimeConfig;
                remoteRuntimeConfigPromise = null;
            }
            return remoteRuntimeConfig;
        })();

        return remoteRuntimeConfigPromise;
    }

    // Cloudflare Worker API (orders + support) base URLs
    var workerApiConfig = {
        ordersApiBase: '',
        supportApiBase: ''
    };

    function normalizeApiBase(url) {
        const s = String(url || '').trim();
        if (!s) return '';
        return s.replace(/\/+$/g, '');
    }

    function applyWorkerApiConfigFromRemote() {
        try {
            if (!remoteRuntimeConfig) return;
            if (remoteRuntimeConfig.ordersApiBase) {
                workerApiConfig.ordersApiBase = normalizeApiBase(remoteRuntimeConfig.ordersApiBase);
            }
            if (remoteRuntimeConfig.supportApiBase) {
                workerApiConfig.supportApiBase = normalizeApiBase(remoteRuntimeConfig.supportApiBase);
            }
            // Backward compatible: supportApiBase defaults to ordersApiBase
            if (!workerApiConfig.supportApiBase && workerApiConfig.ordersApiBase) {
                workerApiConfig.supportApiBase = workerApiConfig.ordersApiBase;
            }
        } catch (e) {}
    }

    function getOrdersApiBase() {
        return normalizeApiBase(workerApiConfig.ordersApiBase);
    }

    function getSupportApiBase() {
        return normalizeApiBase(workerApiConfig.supportApiBase || workerApiConfig.ordersApiBase);
    }

    async function workerApiFetch(baseUrl, path, options) {
        const base = normalizeApiBase(baseUrl);
        if (!base) throw new Error('api_not_configured');
        const opts = options || {};
        const method = (opts.method || 'GET').toUpperCase();

        const headers = Object.assign({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }, opts.headers || {});

        // Firebase Auth -> Worker Bearer token
        if (currentUser) {
            try {
                const token = await currentUser.getIdToken();
                if (token) headers['Authorization'] = 'Bearer ' + token;
            } catch (e) {}
        }

        const res = await fetch(base + path, {
            method,
            headers,
            cache: 'no-store',
            body: (opts.body && method !== 'GET') ? JSON.stringify(opts.body) : undefined
        });

        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text }; }

        if (!res.ok) {
            const msg = (json && (json.error || json.detail)) ? (json.error || json.detail) : ('http_' + res.status);
            const err = new Error(String(msg));
            err.httpStatus = res.status;
            err.payload = json;
            throw err;
        }

        return json;
    }

    function isRemoteMaintenanceEnabled() {
        return !!(remoteRuntimeConfig && remoteRuntimeConfig.maintenanceMode);
    }

    function isAllowedDuringRemoteMaintenance(email) {
        // Owner her zaman serbest
        try {
            if (typeof isOwnerEmail === 'function' && isOwnerEmail(email)) return true;
        } catch (e) {}

        const allow = (remoteRuntimeConfig && Array.isArray(remoteRuntimeConfig.maintenanceAllowEmails))
            ? remoteRuntimeConfig.maintenanceAllowEmails
            : [];
        const e = normalizeEmailQuick(email);
        if (!e) return false;
        return allow.map(normalizeEmailQuick).includes(e);
    }

    function showRemoteMaintenanceScreen(opts) {
        if (!isRemoteMaintenanceEnabled()) return;
        const options = opts || {};
        const existing = document.getElementById('remoteMaintenanceScreen');
        // Overlay zaten varsa, iÃ§eriÄŸi gÃ¼ncellemek iÃ§in yeniden oluÅŸtur.
        if (existing) {
            try { existing.remove(); } catch (e) {}
        }

        const title = (remoteRuntimeConfig && remoteRuntimeConfig.maintenanceTitle) || 'ğŸ”§ BakÄ±m Modu';
        const message = (remoteRuntimeConfig && remoteRuntimeConfig.maintenanceMessage) || 'Sistem ÅŸu anda bakÄ±mda. LÃ¼tfen daha sonra tekrar deneyin.';
        const estimated = (remoteRuntimeConfig && remoteRuntimeConfig.maintenanceEstimatedTime) || '';

        const allowContinue = !!options.allowContinue;
        const allowTeamLogin = !allowContinue;
        const html = `
            <div id="remoteMaintenanceScreen" style="position: fixed; inset: 0; background: linear-gradient(135deg, #1a1a2e, #16213e); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 999999;">
                <div style="max-width: 420px; width: 100%; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 22px; text-align: center;">
                    <div style="font-size: 54px; margin-bottom: 10px;">ğŸ”§</div>
                    <h1 style="color: #fff; margin-bottom: 12px; font-size: 22px;">${title}</h1>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.6; margin-bottom: 14px;">${message}</p>
                    ${estimated ? `<div style="color: #ffcc80; font-size: 12px; margin-bottom: 16px;">â³ ${estimated}</div>` : ''}
                    ${allowContinue ? `
                        <button onclick="hideRemoteMaintenanceScreen()" style="background: linear-gradient(135deg, #4CAF50, #45a049); border: none; color: #fff; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%;">âœ… Devam Et</button>
                        <div style="color:#bbb; font-size: 12px; margin-top: 10px;">Ekip eriÅŸimi var. Devam edebilirsiniz.</div>
                    ` : `
                        <button onclick="openRemoteMaintenanceTeamLogin()" style="background: linear-gradient(135deg, #4CAF50, #45a049); border: none; color: #fff; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%;">ğŸ” Ekip GiriÅŸi</button>
                        <div id="remoteTeamLogin" style="display:none; margin-top: 14px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; padding: 14px; text-align: left;">
                            <div style="color:#fff; font-weight: 700; font-size: 13px; margin-bottom: 10px;">Ekip GiriÅŸi</div>
                            <input type="email" id="remoteTeamLoginEmail" placeholder="E-posta" autocomplete="username" style="width: 100%; padding: 11px 12px; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; background: rgba(255,255,255,0.06); color: #fff; margin-bottom: 10px; box-sizing: border-box;">
                            <input type="password" id="remoteTeamLoginPassword" placeholder="Åifre" autocomplete="current-password" style="width: 100%; padding: 11px 12px; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; background: rgba(255,255,255,0.06); color: #fff; margin-bottom: 10px; box-sizing: border-box;">
                            <button onclick="remoteMaintenanceTeamLogin()" style="width: 100%; background: rgba(103,58,183,0.95); color: #fff; border: none; padding: 11px 12px; border-radius: 10px; font-weight: 800; cursor: pointer;">ğŸ”“ GiriÅŸ Yap</button>
                            <button onclick="closeRemoteMaintenanceTeamLogin()" style="width: 100%; margin-top: 8px; background: rgba(255,255,255,0.08); color: #ddd; border: none; padding: 10px 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">â† Geri</button>
                            <div id="remoteTeamLoginError" style="display:none; margin-top: 10px; color: #ff6b6b; font-size: 12px; line-height: 1.4;"></div>
                            <div style="color:#9aa; font-size: 11px; margin-top: 10px;">Not: Bu giriÅŸ sadece Firebase Auth kullanÄ±r (Firestore gerekmez).</div>
                        </div>
                    `}
                    <div style="color:#777; font-size: 11px; margin-top: 12px;">Not: Bu ekran acil bakÄ±m kilididir (Firestore baÄŸÄ±msÄ±z).</div>
                </div>
            </div>
        `;

        try {
            document.body.insertAdjacentHTML('beforeend', html);
        } catch (e) {
            // Fallback: en azÄ±ndan body'yi boÅŸ bÄ±rakmayalÄ±m
            try { document.body.innerHTML = html; } catch (e2) {}
        }
    }

    function hideRemoteMaintenanceScreen() {
        const el = document.getElementById('remoteMaintenanceScreen');
        if (el) el.remove();
    }

    window.openRemoteMaintenanceTeamLogin = function() {
        try {
            const box = document.getElementById('remoteTeamLogin');
            if (box) box.style.display = 'block';
        } catch (e) {}
    };

    window.closeRemoteMaintenanceTeamLogin = function() {
        try {
            const box = document.getElementById('remoteTeamLogin');
            const err = document.getElementById('remoteTeamLoginError');
            if (box) box.style.display = 'none';
            if (err) { err.style.display = 'none'; err.textContent = ''; }
        } catch (e) {}
    };

    window.remoteMaintenanceTeamLogin = async function() {
        const err = document.getElementById('remoteTeamLoginError');
        function setErr(msg, color) {
            if (!err) return;
            err.textContent = msg || '';
            err.style.display = msg ? 'block' : 'none';
            if (color) err.style.color = color;
        }

        try {
            const email = (document.getElementById('remoteTeamLoginEmail')?.value || '').trim().toLowerCase();
            const password = (document.getElementById('remoteTeamLoginPassword')?.value || '');
            if (!email || !password) {
                setErr('âŒ E-posta ve ÅŸifre gerekli');
                return;
            }

            setErr('â³ GiriÅŸ yapÄ±lÄ±yor...', '#8ab4f8');

            if (!firebase || !firebase.auth) throw new Error('Firebase Auth hazÄ±r deÄŸil');

            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const u = userCredential && userCredential.user ? userCredential.user : null;
            const signedEmail = u && u.email ? u.email : email;

            // Yetki: Owner veya config allowlist
            if (isAllowedDuringRemoteMaintenance(signedEmail)) {
                setErr('âœ… Ekip giriÅŸi baÅŸarÄ±lÄ±. Devam edebilirsiniz.', '#7CFC9A');
                // Overlay'i "Devam Et" moduna al
                try { showRemoteMaintenanceScreen({ allowContinue: true }); } catch (e) {}
            } else {
                setErr('âš ï¸ Bu hesap ekip listesinde deÄŸil. BakÄ±m bitene kadar bekleyin.');
                try { await firebase.auth().signOut(); } catch (e) {}
            }
        } catch (e) {
            const code = e && e.code ? e.code : '';
            let msg = 'âŒ GiriÅŸ baÅŸarÄ±sÄ±z: ' + (e && e.message ? e.message : 'Bilinmeyen hata');
            if (code === 'auth/user-not-found') msg = 'âŒ Bu e-posta ile kayÄ±tlÄ± kullanÄ±cÄ± yok';
            else if (code === 'auth/wrong-password') msg = 'âŒ Åifre yanlÄ±ÅŸ';
            else if (code === 'auth/invalid-email') msg = 'âŒ GeÃ§ersiz e-posta formatÄ±';
            else if (code === 'auth/invalid-credential') msg = 'âŒ E-posta veya ÅŸifre hatalÄ±';
            else if (code === 'auth/too-many-requests') msg = 'âŒ Ã‡ok fazla deneme. Biraz bekleyin.';
            else if (code === 'auth/network-request-failed') msg = 'âŒ Ä°nternet baÄŸlantÄ±sÄ± yok';
            setErr(msg);
        }
    };

    window.tryOpenMaintenanceTeamLogin = function() {
        try {
            // Login ekranÄ±na geÃ§
            if (typeof navigateTo === 'function') {
                navigateTo('loginPage');
            }
        } catch (e) {}
    };

    // Sayfa aÃ§Ä±lÄ±r aÃ§Ä±lmaz bakÄ±m aktifse ekranÄ± bas (auth beklemeden).
    // Auth callback'i izinli ekip/owner iÃ§in ekranÄ± zaten kaldÄ±rÄ±r.
    (async () => {
        try {
            await loadRemoteRuntimeConfig();
            if (isRemoteMaintenanceEnabled()) {
                showRemoteMaintenanceScreen({ allowContinue: false });
            }
        } catch (e) {}
    })();
    // ========== ACÄ°L BAKIM SON ==========
    
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;

        // Acil bakÄ±m kilidi: Ã¶nce GitHub config'i oku, sonra Firestore'a dokun.
        try { await loadRemoteRuntimeConfig(); } catch (e) {}

        if (isRemoteMaintenanceEnabled()) {
            const email = user && user.email ? user.email : null;
            if (!isAllowedDuringRemoteMaintenance(email)) {
                try { stopOrderListener(); } catch (e) {}
                try { stopNotificationListener(); } catch (e) {}
                try { stopUsersRealtimeListener(); } catch (e) {}
                try { stopPresenceHeartbeat(); } catch (e) {}
                try { stopAdminUsageTracking(); } catch (e) {}
                try { updateAuthUI(); } catch (e) {}
                showRemoteMaintenanceScreen({ allowContinue: false });
                return;
            } else {
                // Ekip/owner izinli ise ekranÄ± otomatik kapatma.
                // BakÄ±m modunun gÃ¶rÃ¼nÃ¼r kalmasÄ± iÃ§in "Devam Et" ile kullanÄ±cÄ± kapatsÄ±n.
                try { showRemoteMaintenanceScreen({ allowContinue: true }); } catch (e) {}
            }
        }

        if (user) {
            // Ã–nce admin listesini yÃ¼kle, sonra UI gÃ¼ncelle
            await loadAdminList();
            updateAuthUI();
            await loadUserData();
            startOrderListener(); // AnlÄ±k sipariÅŸ dinleme baÅŸlat

            // Ban risk bilgilendirme (giriÅŸte prompt)
            try {
                await ensureBanRiskAccepted({ prompt: true, reason: 'Devam etmek iÃ§in lÃ¼tfen ban riski bilgilendirmesini onaylayÄ±n.' });
            } catch (e) {}

            // Admin/Kurucu hesaplarÄ± iÃ§in: sipariÅŸ dinleyici Ã§alÄ±ÅŸmadÄ±ÄŸÄ± iÃ§in bildirim/push kurulumunu burada yap
            if (isAdmin() || isOwner()) {
                startNotificationListener();
                try {
                    await initPushNotifications();
                } catch (e) {
                    console.log('FCM init hatasÄ± (admin, atlanÄ±yor):', e.message);
                }
                try {
                    await initLocalNotifications();
                } catch (e) {
                    console.log('Local notifications hatasÄ± (admin, atlanÄ±yor):', e.message);
                }
            }

            // Admin/Kurucu: kullanÄ±m sÃ¼resi takibi
            if (isAdmin() || isOwner()) {
                startAdminUsageTracking();
            } else {
                stopAdminUsageTracking();
            }
            
            // Arka plan bildirimleri iÃ§in email'i native'e kaydet
            saveUserEmailForBackgroundNotifications(user.email);

            // Presence baÅŸlangÄ±cÄ±
            if (presenceInitializedUid !== user.uid) {
                presenceInitializedUid = user.uid;
                await touchPresence({ isLogin: true });
            } else {
                await touchPresence({ isLogin: false });
            }
            startPresenceHeartbeat();
        } else {
            updateAuthUI();
            stopOrderListener();

            stopAdminUsageTracking();

            currentUserDocData = null;
            banRiskAcceptedCached = false;
            banRiskLastCheckedAtMs = 0;
            updateLoyaltyUI(null);

            stopPresenceHeartbeat();
            presenceInitializedUid = null;

            stopUsersRealtimeListener();

            // Ã‡Ä±kÄ±ÅŸta bildirim dinleyicilerini de kapat (eski snapshot'lar state'e geri dolmasÄ±n)
            stopNotificationListener();
            notificationCutoffDate = null;
            listenerStartTime = null;
            
            // Ã‡Ä±kÄ±ÅŸ yapÄ±ldÄ±ÄŸÄ±nda email'i temizle
            clearUserEmailForBackgroundNotifications();
        }
    });

    function getLoyaltyPoints(userData) {
        const raw = userData && typeof userData.loyaltyPoints !== 'undefined' ? userData.loyaltyPoints : 0;
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.floor(n);
    }

    function updateLoyaltyUI(userData) {
        const points = getLoyaltyPoints(userData);
        const sidebarPoints = document.getElementById('sidebarLoyaltyPoints');
        if (sidebarPoints) sidebarPoints.textContent = String(points);
        const modalPoints = document.getElementById('loyaltyPointsValue');
        if (modalPoints) modalPoints.textContent = String(points);
    }

    async function refreshLoyaltyUI(force = false) {
        try {
            await refreshCurrentUserDocData(force);
        } catch (e) {}
        updateLoyaltyUI(currentUserDocData || null);
        return getLoyaltyPoints(currentUserDocData || null);
    }

    async function openLoyaltyModal() {
        if (!currentUser) {
            showToast('âš ï¸ GiriÅŸ yapmanÄ±z gerekiyor');
            openModal('loginModal');
            return;
        }
        await refreshLoyaltyUI(true);
        openModal('loyaltyModal');
    }

    window.openLoyaltyModal = openLoyaltyModal;

    function isBanRiskAccepted(userData) {
        if (!userData) return false;
        return userData.banRiskAcceptedVersion === BAN_RISK_DISCLOSURE_VERSION;
    }

    async function refreshCurrentUserDocData(force = false) {
        if (!currentUser) {
            currentUserDocData = null;
            banRiskAcceptedCached = false;
            return null;
        }

        const now = Date.now();
        if (!force && currentUserDocData && (now - banRiskLastCheckedAtMs) < 15000) {
            return currentUserDocData;
        }

        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            currentUserDocData = doc.exists ? (doc.data() || {}) : {};
            banRiskAcceptedCached = isBanRiskAccepted(currentUserDocData);
            banRiskLastCheckedAtMs = now;
            return currentUserDocData;
        } catch (e) {
            return currentUserDocData;
        }
    }

    async function ensureBanRiskAccepted({ prompt = false, reason = '' } = {}) {
        if (!currentUser) return true;

        // En gÃ¼ncel durumu Ã§ek
        await refreshCurrentUserDocData(true);

        if (banRiskAcceptedCached) return true;

        if (prompt) {
            try {
                if (reason) {
                    showToast('âš ï¸ ' + reason, 'info');
                }
            } catch (e) {}
            openModal('banRiskModal');
        }

        return false;
    }

    async function acceptBanRiskDisclosure() {
        try {
            if (!currentUser) {
                showToast('âš ï¸ GiriÅŸ yapmanÄ±z gerekiyor');
                return;
            }

            await db.collection('users').doc(currentUser.uid).set({
                banRiskAcceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
                banRiskAcceptedVersion: BAN_RISK_DISCLOSURE_VERSION
            }, { merge: true });

            banRiskAcceptedCached = true;
            banRiskLastCheckedAtMs = Date.now();

            closeModal('banRiskModal');
            showToast('âœ… TeÅŸekkÃ¼rler, devam edebilirsiniz');
        } catch (e) {
            console.log('Ban risk onay hatasÄ±:', e);
            showToast('âŒ Bir hata oluÅŸtu, tekrar deneyin');
        }
    }

    async function declineBanRiskDisclosure() {
        try {
            await logout();
        } catch (e) {
            try { await auth.signOut(); } catch (e2) {}
        }
    }

    window.acceptBanRiskDisclosure = acceptBanRiskDisclosure;
    window.declineBanRiskDisclosure = declineBanRiskDisclosure;
    
    // Arka plan bildirimleri iÃ§in kullanÄ±cÄ± email'ini native'e kaydet
    async function saveUserEmailForBackgroundNotifications(email) {
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                const { NotificationPrefs } = Capacitor.Plugins;
                if (NotificationPrefs) {
                    await NotificationPrefs.setUserEmail({ email: email });
                    console.log('ğŸ“± Arka plan bildirimleri iÃ§in email kaydedildi:', email);
                }
            }
        } catch(e) {
            console.log('Email kaydetme hatasÄ±:', e);
        }
    }
    
    // Arka plan bildirimleri iÃ§in email'i temizle
    async function clearUserEmailForBackgroundNotifications() {
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                const { NotificationPrefs } = Capacitor.Plugins;
                if (NotificationPrefs) {
                    await NotificationPrefs.clearUserEmail();
                    console.log('ğŸ“± Arka plan bildirimleri iÃ§in email temizlendi');
                }
            }
        } catch(e) {
            console.log('Email temizleme hatasÄ±:', e);
        }
    }
    
    // AnlÄ±k bildirim gÃ¶ster
    function showNotification(message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        toast.textContent = message;
        toast.className = 'notification-toast ' + type;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
    }
    
    // SipariÅŸ dinleyici baÅŸlat
    async function startOrderListener() {
        if (!currentUser || isAdmin()) return;
        stopOrderListener();

        // Prefer Worker API polling (Firestore-free)
        try { await loadRemoteRuntimeConfig(); } catch (e) {}
        const ordersApiBase = getOrdersApiBase();
        if (ordersApiBase) {
            // Bildirim gÃ¶nderilen sipariÅŸ ID'lerini takip et
            const notifiedOrders = JSON.parse(localStorage.getItem('notifiedOrders') || '[]');

            async function pollOnce() {
                const data = await workerApiFetch(ordersApiBase, '/v1/orders/me', { method: 'GET' });
                const orders = (data && data.orders) ? data.orders : [];
                (orders || []).forEach(async (order) => {
                    try {
                        const orderId = order && (order.id || order.orderId);
                        if (!orderId) return;
                        const notifKey = orderId + '_' + (order.status || '');
                        if (notifiedOrders.includes(notifKey)) return;

                        if (order.status === 'approved') {
                            showNotification('ğŸ‰ SipariÅŸiniz onaylandÄ±! Key: ' + (order.keyCode || ''), 'success');
                            await showFullNotification({
                                title: 'ğŸ‰ SipariÅŸiniz OnaylandÄ±!',
                                message: `Paketiniz aktif edildi! Key: ${order.keyCode || ''}`,
                                type: 'order',
                                keyCode: order.keyCode || null,
                                showPopup: true,
                                playSound: true,
                                showNative: true,
                                vibrate: true,
                                updateBadge: true
                            });
                            notifiedOrders.push(notifKey);
                            localStorage.setItem('notifiedOrders', JSON.stringify(notifiedOrders));
                        } else if (order.status === 'rejected') {
                            showNotification('âŒ SipariÅŸiniz reddedildi: ' + (order.rejectReason || 'Sebep belirtilmedi'), 'error');
                            await showFullNotification({
                                title: 'âŒ SipariÅŸ Reddedildi',
                                message: order.rejectReason || 'Sebep belirtilmedi',
                                type: 'warning',
                                showPopup: true,
                                playSound: true,
                                showNative: true,
                                vibrate: true,
                                updateBadge: true
                            });
                            notifiedOrders.push(notifKey);
                            localStorage.setItem('notifiedOrders', JSON.stringify(notifiedOrders));
                        }
                    } catch (e) {}
                });
            }

            try { await pollOnce(); } catch (e) {}
            orderPollingInterval = setInterval(() => { pollOnce().catch(() => {}); }, 8000);
            return;
        }
        
        // Bildirim gÃ¶nderilen sipariÅŸ ID'lerini takip et
        const notifiedOrders = JSON.parse(localStorage.getItem('notifiedOrders') || '[]');
        
        orderListener = db.collection('orders')
            .where('userId', '==', currentUser.uid)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === 'modified') {
                        const orderId = change.doc.id;
                        const order = change.doc.data();
                        const notifKey = orderId + '_' + order.status; // SipariÅŸ ID + durum
                        
                        // Bu sipariÅŸ+durum iÃ§in daha Ã¶nce bildirim gÃ¶nderildi mi?
                        if (notifiedOrders.includes(notifKey)) {
                            console.log('Bu sipariÅŸ iÃ§in zaten bildirim gÃ¶nderildi:', notifKey);
                            return;
                        }
                        
                        if (order.status === 'approved') {
                            console.log('ğŸ‰ SÄ°PARÄ°Å ONAYLANDI - MERKEZÄ° BÄ°LDÄ°RÄ°M GÃ–NDERÄ°LÄ°YOR');
                            
                            // Toast bildirimi
                            showNotification('ğŸ‰ SipariÅŸiniz onaylandÄ±! Key: ' + order.keyCode);
                            
                            // TELEFON BÄ°LDÄ°RÄ°MÄ° - DoÄŸrudan Local Notification
                            try {
                                if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                                    const { LocalNotifications } = Capacitor.Plugins;
                                    if (LocalNotifications) {
                                        const notifId = Math.floor(Math.random() * 100000);
                                        console.log('ğŸ“± Bildirim gÃ¶nderiliyor, ID:', notifId);
                                        await LocalNotifications.schedule({
                                            notifications: [{
                                                title: 'SipariÅŸiniz OnaylandÄ±!',
                                                body: 'Key aktif: ' + order.keyCode,
                                                id: notifId,
                                                channelId: 'orders',
                                                sound: 'default',
                                                smallIcon: 'ic_stat_icon_config_sample',
                                                autoCancel: true,
                                                extra: { orderId: order.orderId }
                                            }]
                                        });
                                        console.log('âœ… Telefon bildirimi gÃ¶nderildi!');
                                    }
                                }
                            } catch(notifErr) {
                                console.log('Telefon bildirimi hatasÄ±:', notifErr);
                            }
                            
                            // MERKEZÄ° BÄ°LDÄ°RÄ°M SÄ°STEMÄ° - TÃ¼m kanallar
                            await showFullNotification({
                                title: 'ğŸ‰ SipariÅŸiniz OnaylandÄ±!',
                                message: `Paketiniz aktif edildi! Key: ${order.keyCode}`,
                                type: 'order',
                                keyCode: order.keyCode,
                                showPopup: true,
                                playSound: true,
                                showNative: false, // Zaten yukarÄ±da gÃ¶nderdik
                                vibrate: true,
                                updateBadge: true
                            });
                            
                            // Key durumunu HEMEN gÃ¼ncelle
                            loadUserData();
                            
                            // Bildirim gÃ¶nderildi olarak iÅŸaretle
                            notifiedOrders.push(notifKey);
                            localStorage.setItem('notifiedOrders', JSON.stringify(notifiedOrders));
                            
                        } else if (order.status === 'rejected') {
                            console.log('âŒ SÄ°PARÄ°Å REDDEDÄ°LDÄ° - MERKEZÄ° BÄ°LDÄ°RÄ°M GÃ–NDERÄ°LÄ°YOR');
                            
                            showNotification('âŒ SipariÅŸiniz reddedildi: ' + (order.rejectReason || 'Sebep belirtilmedi'), 'error');
                            
                            // TELEFON BÄ°LDÄ°RÄ°MÄ° - DoÄŸrudan Local Notification
                            try {
                                if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                                    const { LocalNotifications } = Capacitor.Plugins;
                                    if (LocalNotifications) {
                                        const notifId = Math.floor(Math.random() * 100000);
                                        console.log('ğŸ“± Red bildirimi gÃ¶nderiliyor, ID:', notifId);
                                        await LocalNotifications.schedule({
                                            notifications: [{
                                                title: 'SipariÅŸ Reddedildi',
                                                body: order.rejectReason || 'Sebep belirtilmedi',
                                                id: notifId,
                                                channelId: 'orders',
                                                sound: 'default',
                                                smallIcon: 'ic_stat_icon_config_sample',
                                                autoCancel: true,
                                                extra: { orderId: order.orderId }
                                            }]
                                        });
                                        console.log('âœ… Telefon bildirimi gÃ¶nderildi (red)!');
                                    }
                                }
                            } catch(notifErr) {
                                console.log('Telefon bildirimi hatasÄ±:', notifErr);
                            }
                            
                            // MERKEZÄ° BÄ°LDÄ°RÄ°M SÄ°STEMÄ° - TÃ¼m kanallar
                            await showFullNotification({
                                title: 'âŒ SipariÅŸ Reddedildi',
                                message: order.rejectReason || 'Sebep belirtilmedi',
                                type: 'warning',
                                showPopup: true,
                                playSound: true,
                                showNative: false, // Zaten yukarÄ±da gÃ¶nderdik
                                vibrate: true,
                                updateBadge: true
                            });
                            
                            notifiedOrders.push(notifKey);
                            localStorage.setItem('notifiedOrders', JSON.stringify(notifiedOrders));
                        }
                    }
                });
                updateOrderBadge();
            });
        
        // Bildirim dinleyiciyi de baÅŸlat
        startNotificationListener();
        
        // KEY DURUMU DÄ°NLEYÄ°CÄ° - Realtime key gÃ¼ncellemesi
        startKeyStatusListener();
        
        // Chat dinleyiciyi baÅŸlat
        startChatListener();
        
        // Push notifications (FCM token kaydetme)
        try {
            await initPushNotifications();
        } catch(e) {
            console.log('FCM init hatasÄ± (atlanÄ±yor):', e.message);
        }
        
        // Local Notifications
        try {
            await initLocalNotifications();
        } catch(e) {
            console.log('Local notifications hatasÄ± (atlanÄ±yor):', e.message);
        }
        
        // Arka planda Ã§alÄ±ÅŸma - geri tuÅŸunda minimize et, kapatma
        setupBackgroundMode();
    }
    
    // ==================== LOCAL NOTIFICATIONS KURULUMU ====================
    async function initLocalNotifications() {
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                const { LocalNotifications } = Capacitor.Plugins;
                if (LocalNotifications) {
                    // 1. Ä°zin iste
                    const permStatus = await LocalNotifications.checkPermissions();
                    console.log('ğŸ“± LocalNotifications izin durumu:', permStatus.display);
                    
                    if (permStatus.display !== 'granted') {
                        const result = await LocalNotifications.requestPermissions();
                        console.log('ğŸ“± LocalNotifications izin istendi:', result.display);
                    }
                    
                    // 2. Bildirim kanalÄ± oluÅŸtur (Android 8+)
                    try {
                        await LocalNotifications.createChannel({
                            id: 'orders',
                            name: 'SipariÅŸ Bildirimleri',
                            description: 'SipariÅŸ onay ve red bildirimleri',
                            importance: 5, // MAX importance
                            visibility: 1, // PUBLIC
                            sound: 'default',
                            vibration: true,
                            lights: true
                        });
                        console.log('ğŸ“± âœ… Bildirim kanalÄ± oluÅŸturuldu: orders');
                    } catch(chErr) {
                        console.log('Kanal zaten var veya hata:', chErr);
                    }
                    
                    // 3. Default kanal da oluÅŸtur
                    try {
                        await LocalNotifications.createChannel({
                            id: 'default',
                            name: 'Genel Bildirimler',
                            description: 'Uygulama bildirimleri',
                            importance: 5,
                            visibility: 1,
                            sound: 'default',
                            vibration: true,
                            lights: true
                        });
                        console.log('ğŸ“± âœ… Bildirim kanalÄ± oluÅŸturuldu: default');
                    } catch(chErr2) {
                        console.log('Default kanal zaten var veya hata:', chErr2);
                    }
                    
                    console.log('ğŸ“± âœ… LocalNotifications hazÄ±r!');
                }
            }
        } catch(e) {
            console.log('LocalNotifications kurulum hatasÄ±:', e);
        }
    }
    
    // ==================== ARKA PLANDA Ã‡ALIÅMA ====================
    function setupBackgroundMode() {
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                const { App } = Capacitor.Plugins;
                if (App) {
                    // Geri tuÅŸuna basÄ±ldÄ±ÄŸÄ±nda uygulamayÄ± kapat deÄŸil, minimize et
                    App.addListener('backButton', ({ canGoBack }) => {
                        if (!canGoBack) {
                            // Ana sayfadaysa minimize et (kapatma)
                            App.minimizeApp();
                        } else {
                            // Geri gidilebiliyorsa normal geri git
                            window.history.back();
                        }
                    });
                    console.log('âœ… Arka plan modu aktif - geri tuÅŸu minimize yapacak');
                }
            }
        } catch(e) {
            console.log('Arka plan modu hatasÄ±:', e);
        }
    }
    
    // ==================== KEY DURUMU REALTÄ°ME DÄ°NLEYÄ°CÄ° ====================
    let keyStatusListener = null;
    
    function startKeyStatusListener() {
        if (!currentUser) {
            console.log('ğŸ”‘ Key listener: currentUser yok');
            return;
        }
        stopKeyStatusListener();
        
        console.log('ğŸ”‘ Key durumu dinleyici baÅŸlatÄ±lÄ±yor... UID:', currentUser.uid);
        
        keyStatusListener = db.collection('users').doc(currentUser.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    const keyCount = data.keys ? data.keys.length : 0;
                    console.log('ğŸ”‘ âœ… Key durumu REALTIME gÃ¼ncellendi:', keyCount, 'key');
                    
                    // Key durumunu gÃ¼ncelle (ana sayfa + sidebar)
                    updateKeyStatus(data.keys || []);
                    
                    // Aktif key var mÄ± kontrol et
                    const now = new Date();
                    const activeKeys = (data.keys || []).filter(k => {
                        const exp = toDate(k.expiresAt);
                        return exp && exp > now;
                    });
                    
                    if (activeKeys.length > 0) {
                        console.log('ğŸ”‘ ğŸ‰ AKTÄ°F KEY TESPÄ°T EDÄ°LDÄ°!', activeKeys.length, 'adet');
                    }
                } else {
                    console.log('ğŸ”‘ KullanÄ±cÄ± dÃ¶kÃ¼manÄ± bulunamadÄ±');
                }
            }, (error) => {
                console.error('ğŸ”‘ âŒ Key dinleyici hatasÄ±:', error);
                // Hata durumunda 5 saniye sonra tekrar dene
                setTimeout(() => {
                    if (currentUser) {
                        console.log('ğŸ”‘ Dinleyici yeniden baÅŸlatÄ±lÄ±yor...');
                        startKeyStatusListener();
                    }
                }, 5000);
            });
        
        console.log('ğŸ”‘ Key dinleyici aktif');
    }
    
    function stopKeyStatusListener() {
        if (keyStatusListener) {
            keyStatusListener();
            keyStatusListener = null;
            console.log('ğŸ”‘ Key dinleyici durduruldu');
        }
    }
    
    // ==================== MERKEZÄ° BÄ°LDÄ°RÄ°M SÄ°STEMÄ° ====================
    /*
     * TÃ¼m bildirimler bu merkezi sistem Ã¼zerinden gÃ¶nderilir.
     * showFullNotification() - TÃ¼m bildirim kanallarÄ±nÄ± kullanÄ±r:
     *   1. In-app popup (saÄŸ Ã¼st kÃ¶ÅŸe)
     *   2. Bildirim sesi
     *   3. Native push notification (telefon Ã¼st bar)
     *   4. TitreÅŸim
     *   5. Badge gÃ¼ncelleme
     */
    
    // MERKEZÄ° BÄ°LDÄ°RÄ°M GÃ–NDERÄ°CÄ°
    async function showFullNotification(options = {}) {
        const {
            title = 'Bildirim',
            message = '',
            type = 'info',  // info, success, warning, promo, order
            keyCode = null,
            showPopup = true,
            playSound = true,
            showNative = true,
            vibrate = true,
            updateBadge = true
        } = options;
        
        console.log('ğŸ”” MERKEZÄ° BÄ°LDÄ°RÄ°M:', title, message);
        
        // 1. In-app popup gÃ¶ster
        if (showPopup) {
            if (type === 'order' && keyCode) {
                showOrderApprovalPopup({ title, message, keyCode });
            } else {
                showNotificationPopup({ title, message, type });
            }
        }
        
        // 2. Bildirim sesi Ã§al
        if (playSound) {
            playNotificationSound();
        }
        
        // 3. Native push notification (telefon Ã¼st bar)
        if (showNative) {
            await sendNativeNotification(title, message, { type, keyCode });
        }
        
        // 4. TitreÅŸim
        if (vibrate && navigator.vibrate) {
            if (type === 'order') {
                navigator.vibrate([200, 100, 200, 100, 200, 100, 400]);
            } else {
                navigator.vibrate([200, 100, 200]);
            }
        }
        
        // 5. Badge gÃ¼ncelle
        if (updateBadge) {
            updateProfileNotifBadge();
            updateNotificationBadge();
        }
        
        console.log('âœ… Merkezi bildirim gÃ¶nderildi');
    }
    
    // ==================== BÄ°LDÄ°RÄ°M SÄ°STEMÄ° ====================
    
    let notificationListener = null;
    let allNotificationListener = null;
    let emailNotificationListener = null;
    let adminNotificationListener = null;
    let userNotifications = [];
    let fcmToken = null;

    let notificationCutoffDate = null; // max(kayÄ±t tarihi, kullanÄ±cÄ± temizleme tarihi)

    function getAuthCreationDate() {
        try {
            const t = currentUser?.metadata?.creationTime;
            if (!t) return null;
            const d = new Date(t);
            return isNaN(d.getTime()) ? null : d;
        } catch (e) {
            return null;
        }
    }

    async function ensureNotificationCutoffDate() {
        if (!currentUser || !db) return null;

        // Not: "TÃ¼m bildirimleri temizle" cihazlar arasÄ± Ã§alÄ±ÅŸsÄ±n diye
        // localStorage (hÄ±zlÄ±) + Firestore (en doÄŸru) birlikte deÄŸerlendirilir.

        // Mevcut deÄŸeri baz al (varsa)
        if (notificationCutoffDate && !isNaN(notificationCutoffDate.getTime())) {
            // devam et: localStorage/Firestore daha yeni bir deÄŸer taÅŸÄ±yabilir
        } else {
            notificationCutoffDate = null;
        }

        let hasLocalCache = false;

        // 1) Cache (en hÄ±zlÄ±)
        try {
            const cached = localStorage.getItem('notifCutoff_' + currentUser.uid);
            if (cached) {
                const d = new Date(cached);
                if (!isNaN(d.getTime())) {
                    if (!notificationCutoffDate || d > notificationCutoffDate) {
                        notificationCutoffDate = d;
                    }
                    hasLocalCache = true;
                }
            }
        } catch (e) {}

        try {
            const clearedCached = localStorage.getItem('notifClearedAt_' + currentUser.uid);
            if (clearedCached) {
                const cd = new Date(clearedCached);
                if (!isNaN(cd.getTime())) {
                    if (!notificationCutoffDate || cd > notificationCutoffDate) {
                        notificationCutoffDate = cd;
                    }
                    hasLocalCache = true;
                }
            }
        } catch (e) {}

        // 2) Auth creation time (senkron fallback)
        const authCreated = getAuthCreationDate();
        if (authCreated) {
            if (!notificationCutoffDate || authCreated > notificationCutoffDate) {
                notificationCutoffDate = authCreated;
            }
        }

        // Local cache varsa, Firestore okumasÄ±nÄ± atla (quota dostu)
        if (hasLocalCache) {
            return notificationCutoffDate;
        }

        // 3) Firestore user.createdAt + notificationsClearedAt (cihazlar arasÄ± en doÄŸru)
        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data() || {};
                const created = toDate(data.createdAt);
                if (created && !isNaN(created.getTime())) {
                    if (!notificationCutoffDate || created > notificationCutoffDate) {
                        notificationCutoffDate = created;
                    }
                    try {
                        localStorage.setItem('notifCutoff_' + currentUser.uid, created.toISOString());
                    } catch (e) {}
                }

                const clearedAt = toDate(data.notificationsClearedAt);
                if (clearedAt && !isNaN(clearedAt.getTime())) {
                    if (!notificationCutoffDate || clearedAt > notificationCutoffDate) {
                        notificationCutoffDate = clearedAt;
                    }
                    try {
                        localStorage.setItem('notifClearedAt_' + currentUser.uid, clearedAt.toISOString());
                    } catch (e) {}
                }
            }
        } catch (e) {
            // sessiz geÃ§: auth fallback ile devam
        }

        return notificationCutoffDate;
    }
    
    // Push Notifications baÅŸlat (FCM)
    async function initPushNotifications() {
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                const { PushNotifications } = Capacitor.Plugins;
                if (!PushNotifications) {
                    console.log('PushNotifications plugin bulunamadÄ±');
                    return;
                }
                
                console.log('ğŸ”” FCM Push Notifications baÅŸlatÄ±lÄ±yor...');
                
                // Ä°zin iste
                const permResult = await PushNotifications.requestPermissions();
                console.log('ğŸ”” Ä°zin durumu:', permResult.receive);
                
                if (permResult.receive !== 'granted') {
                    console.log('Push notification izni reddedildi');
                    showToast('âš ï¸ Bildirim izni verilmedi! SipariÅŸ bildirimleri alamazsÄ±nÄ±z.');
                    return;
                }
                
                // Kaydol
                await PushNotifications.register();
                console.log('ğŸ”” FCM kayÄ±t isteÄŸi gÃ¶nderildi');
                
                // Token alÄ±ndÄ±ÄŸÄ±nda
                PushNotifications.addListener('registration', async (token) => {
                    try {
                        console.log('ğŸ”” ========== FCM TOKEN ALINDI ==========');
                        console.log('ğŸ”” Token (ilk 50 karakter):', token.value.substring(0, 50) + '...');
                        fcmToken = token.value;

                        // Cloudflare Worker (orders/support) push registry (Firestore baÄŸÄ±msÄ±z olmalÄ±)
                        if (currentUser && fcmToken) {
                            try {
                                await registerDeviceTokenOnWorker(fcmToken, 'android');
                                showToast('âœ… Bildirimler aktif!');
                            } catch (e) {
                                console.log('ğŸ”” Worker token register baÅŸarÄ±sÄ±z:', e?.message || e);
                            }
                        } else {
                            console.log('ğŸ”” âš ï¸ Worker token kaydÄ± atlandÄ± - currentUser yok');
                        }

                        // Token'Ä± Firestore'a kaydet (best-effort, opsiyonel)
                        if (currentUser && fcmToken && db) {
                            try {
                                console.log('ğŸ”” Token Firestore\'a kaydediliyor... UID:', currentUser.uid);
                                await db.collection('users').doc(currentUser.uid).set({
                                    email: currentUser.email || null,
                                    fcmToken: fcmToken,
                                    hasFcmToken: true,
                                    fcmTokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                                    fcmPlatform: 'android',
                                    fcmLastUpdate: new Date().toISOString()
                                }, { merge: true });
                                console.log('ğŸ”” âœ… FCM token Firestore\'a BAÅARIYLA kaydedildi!');

                                // Server-side topic subscription: toplu bildirim iÃ§in kritik
                                // Firestore'dan tÃ¼m users taramaya gerek kalmaz.
                                registerFcmTokenOnServer(fcmToken, 'all_users');

                                // Admin hesaplarÄ±: admin topic'e de abone et
                                ensureAdminTopicSubscription();
                            } catch(e) {
                                console.error('ğŸ”” âŒ FCM token kaydetme hatasÄ±:', e);
                            }
                        }
                    } catch(outerErr) {
                        console.log('ğŸ”” Token listener hatasÄ±:', outerErr.message);
                    }
                });
                
                // KayÄ±t hatasÄ±
                PushNotifications.addListener('registrationError', (error) => {
                    console.error('Push kayÄ±t hatasÄ±:', error);
                });
                
                // Bildirim alÄ±ndÄ±ÄŸÄ±nda (uygulama aÃ§Ä±kken)
                // Xiaomi MIUI uyumlu - Local Notification ile gÃ¶ster
                PushNotifications.addListener('pushNotificationReceived', async (notification) => {
                    try {
                        // Destek yanÄ±tÄ±: uygulama aÃ§Ä±ksa Firestore bildirimi zaten showFullNotification tetikler.
                        // Bu yÃ¼zden aynÄ± anda gelen FCM'i burada tekrar LocalNotification'a Ã§evirmeyip tek seferlik gÃ¶sterim saÄŸlarÄ±z.
                        const nType = (notification?.data?.type || notification?.data?.category || '').toString();
                        if (nType === 'support_reply' && currentUser && listenerStartTime) {
                            console.log('ğŸ”” support_reply: foreground duplicate Ã¶nlendi (FCM local atlandÄ±)');
                            return;
                        }
                        console.log('Push bildirim alÄ±ndÄ±:', notification.title);
                        // Local notification ile gÃ¶ster
                        const { LocalNotifications } = Capacitor.Plugins;
                        if (LocalNotifications) {
                            await LocalNotifications.schedule({
                                notifications: [{
                                    id: Date.now(),
                                    title: notification.title || 'Game Store',
                                    body: notification.body || '',
                                    schedule: { at: new Date(Date.now() + 100) },
                                    sound: 'default',
                                    smallIcon: 'ic_launcher',
                                    largeIcon: 'ic_launcher'
                                }]
                            });
                        }
                    } catch(e) {
                        console.log('Local notification hatasÄ±:', e);
                    }
                });
                
                // Bildirime tÄ±klandÄ±ÄŸÄ±nda
                PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                    try {
                        console.log('Push bildirime tÄ±klandÄ±');
                    } catch(e) {}
                });
                
                console.log('Push notifications baÅŸlatÄ±ldÄ±');
            }
        } catch(e) {
            console.error('Push notification baÅŸlatma hatasÄ±:', e);
        }
    }
    
    // Native Push Notification izni iste
    async function requestNotificationPermission() {
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                // Capacitor Local Notifications
                const { LocalNotifications } = Capacitor.Plugins;
                if (LocalNotifications) {
                    const permission = await LocalNotifications.requestPermissions();
                    console.log('Bildirim izni:', permission.display);
                    return permission.display === 'granted';
                }
            } else if ('Notification' in window) {
                // Web Notification API
                const permission = await Notification.requestPermission();
                console.log('Web bildirim izni:', permission);
                return permission === 'granted';
            }
        } catch(e) {
            console.log('Bildirim izni hatasÄ±:', e);
        }
        return false;
    }
    
    // Native Push Notification gÃ¶nder
    async function sendNativeNotification(title, body, data = {}) {
        console.log('ğŸ“± sendNativeNotification Ã§aÄŸrÄ±ldÄ±:', title, body);
        
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                console.log('ğŸ“± Capacitor native platform algÄ±landÄ±');
                
                // Capacitor Local Notifications
                const { LocalNotifications } = Capacitor.Plugins;
                if (LocalNotifications) {
                    console.log('ğŸ“± LocalNotifications plugin mevcut');
                    
                    // Ã–nce izin kontrol et
                    const permStatus = await LocalNotifications.checkPermissions();
                    console.log('ğŸ“± Bildirim izin durumu:', permStatus.display);
                    
                    if (permStatus.display !== 'granted') {
                        const reqResult = await LocalNotifications.requestPermissions();
                        console.log('ğŸ“± Ä°zin istek sonucu:', reqResult.display);
                        if (reqResult.display !== 'granted') {
                            console.log('ğŸ“± Bildirim izni reddedildi');
                            return;
                        }
                    }
                    
                    const notifId = Math.floor(Math.random() * 100000);
                    console.log('ğŸ“± Bildirim gÃ¶nderiliyor, ID:', notifId);
                    
                    // orders kanalÄ±nÄ± kullan (MAX importance)
                    await LocalNotifications.schedule({
                        notifications: [{
                            title: title,
                            body: body,
                            id: notifId,
                            channelId: 'orders',
                            sound: 'default',
                            smallIcon: 'ic_stat_icon_config_sample',
                            autoCancel: true,
                            extra: data
                        }]
                    });
                    console.log('ğŸ“± âœ… Native bildirim gÃ¶nderildi:', title);
                } else {
                    console.log('ğŸ“± LocalNotifications plugin bulunamadÄ±');
                }
            } else if ('Notification' in window) {
                console.log('Web Notification API kullanÄ±lÄ±yor');
                if (Notification.permission === 'granted') {
                    new Notification(title, {
                        body: body,
                        icon: 'https://raw.githubusercontent.com/LineOft/thebestml-updates/main/logo.png',
                        requireInteraction: true,
                        vibrate: [200, 100, 200]
                    });
                    console.log('Web bildirim gÃ¶nderildi');
                } else if (Notification.permission !== 'denied') {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        new Notification(title, { body: body });
                    }
                }
            } else {
                console.log('Bildirim desteklenmiyor');
            }
        } catch(e) {
            console.error('ğŸ“± Native bildirim hatasÄ±:', e);
        }
    }
    
    // Bildirim kanallarÄ± oluÅŸtur (Android 8+)
    let channelsCreated = false;
    
    async function createNotificationChannel() {
        if (channelsCreated) return; // Zaten oluÅŸturulduysa tekrar oluÅŸturma
        
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
                const { LocalNotifications } = Capacitor.Plugins;
                if (LocalNotifications && LocalNotifications.createChannel) {
                    // Genel bildirim kanalÄ±
                    await LocalNotifications.createChannel({
                        id: 'default',
                        name: 'Game Store Bildirimleri',
                        description: 'Genel bildirimler',
                        importance: 5, // MAX
                        visibility: 1, // PUBLIC
                        sound: 'default',
                        vibration: true,
                        lights: true
                    });
                    
                    // SipariÅŸ bildirim kanalÄ± (MAX Ã¶ncelik)
                    await LocalNotifications.createChannel({
                        id: 'orders',
                        name: 'SipariÅŸ Bildirimleri',
                        description: 'SipariÅŸ onay ve red bildirimleri',
                        importance: 5, // MAX
                        visibility: 1, // PUBLIC
                        sound: 'default',
                        vibration: true,
                        lights: true
                    });
                    
                    channelsCreated = true;
                    console.log('ğŸ“± âœ… Bildirim kanallarÄ± oluÅŸturuldu (default, orders)');
                }
            }
        } catch(e) {
            console.log('Kanal oluÅŸturma hatasÄ±:', e);
        }
    }
    
    // Bildirim dinleyici baÅŸlat
    let listenerStartTime = null; // Dinleyici baÅŸlangÄ±Ã§ zamanÄ±
    
    async function startNotificationListener() {
        if (!currentUser) return;
        stopNotificationListener();

        // KayÄ±t/temizleme cutoff'unu ayarla (eski bildirimleri hiÃ§ listeleme)
        // Ã–NEMLÄ°: Ã‡Ä±kÄ±ÅŸ-giriÅŸ sonrasÄ± temizlenen bildirimlerin geri gelmemesi iÃ§in
        // listener'lar kurulmadan Ã¶nce cache/Firestore'dan cutoff okunmalÄ±.
        notificationCutoffDate = null;
        await ensureNotificationCutoffDate();
        
        // Bildirim izni ve kanalÄ± oluÅŸtur
        requestNotificationPermission();
        createNotificationChannel();
        
        // Email'i normalize et
        const userEmail = currentUser.email.toLowerCase().trim();
        console.log('ğŸ”” Bildirim dinleyiciler baÅŸlatÄ±lÄ±yor...', userEmail);
        
        // Dinleyici baÅŸlangÄ±Ã§ zamanÄ±nÄ± kaydet - bu zamandan sonra gelen bildirimler yeni sayÄ±lÄ±r
        listenerStartTime = new Date();
        console.log('ğŸ”” Listener baÅŸlangÄ±Ã§ zamanÄ±:', listenerStartTime.toISOString());
        
        // Genel bildirimleri dinle (all) - orderBy kaldÄ±rÄ±ldÄ±, index gerektirmez
        allNotificationListener = db.collection('notifications')
            .where('targetType', '==', 'all')
            .limit(50)
            .onSnapshot((snapshot) => {
                console.log('ğŸ”” Genel bildirim snapshot:', snapshot.size, 'adet');
                processNotificationSnapshot(snapshot);
            }, (error) => {
                console.error('Genel bildirim dinleyici hatasÄ±:', error);
                showToast('âš ï¸ Bildirim baÄŸlantÄ± hatasÄ±');
            });
        
        // KullanÄ±cÄ±ya Ã¶zel bildirimleri dinle (normalize edilmiÅŸ email)
        notificationListener = db.collection('notifications')
            .where('targetType', '==', userEmail)
            .limit(50)
            .onSnapshot((snapshot) => {
                console.log('ğŸ”” KullanÄ±cÄ± bildirim snapshot (targetType):', snapshot.size, 'adet');
                processNotificationSnapshot(snapshot);
            }, (error) => {
                console.error('KullanÄ±cÄ± bildirim dinleyici hatasÄ±:', error);
            });
        
        // Email alanÄ±na gÃ¶re de dinle (eski bildirimler iÃ§in)
        emailNotificationListener = db.collection('notifications')
            .where('email', '==', userEmail)
            .limit(50)
            .onSnapshot((snapshot) => {
                console.log('ğŸ”” KullanÄ±cÄ± bildirim snapshot (email):', snapshot.size, 'adet');
                processNotificationSnapshot(snapshot);
            }, (error) => {
                console.error('Email bildirim dinleyici hatasÄ±:', error);
            });

        // Admin hedefli bildirimleri dinle
        if (isAdmin()) {
            adminNotificationListener = db.collection('notifications')
                .where('targetType', '==', 'admins')
                .limit(50)
                .onSnapshot((snapshot) => {
                    console.log('ğŸ”” Admin bildirim snapshot (admins):', snapshot.size, 'adet');
                    processNotificationSnapshot(snapshot);
                }, (error) => {
                    console.error('Admin bildirim dinleyici hatasÄ±:', error);
                });
        }
    }
    
    // Bildirim snapshot iÅŸle - YENÄ° VERSÄ°YON
    function processNotificationSnapshot(snapshot) {
        // Daha Ã¶nce bildirim gÃ¶nderilmiÅŸ ID'leri al
        const notifiedIds = JSON.parse(localStorage.getItem('notifiedNotifications') || '[]');
        const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const notif = { id: change.doc.id, ...change.doc.data() };
                console.log('ğŸ”” Bildirim algÄ±landÄ±:', notif.title, 'ID:', notif.id);

                // Bildirim tarihi
                let notifDate = null;
                if (notif.createdAt && notif.createdAt.toDate) {
                    notifDate = notif.createdAt.toDate();
                } else if (notif.notifiedAt) {
                    notifDate = new Date(notif.notifiedAt);
                } else {
                    notifDate = null;
                }

                // KayÄ±t tarihinden eski bildirimleri tamamen yok say
                if (notificationCutoffDate && notifDate && notifDate < notificationCutoffDate) {
                    return;
                }
                if (notificationCutoffDate && !notifDate) {
                    // Tarihi olmayan bildirimler: eski kabul et
                    return;
                }
                
                // Listede zaten var mÄ± kontrol et
                const existingIndex = userNotifications.findIndex(n => n.id === notif.id);
                if (existingIndex === -1) {
                    userNotifications.push(notif);
                }
                
                // Bildirim daha Ã¶nce gÃ¶sterilmiÅŸ mi?
                const alreadyNotified = notifiedIds.includes(notif.id);
                const alreadyRead = readNotifs.includes(notif.id);
                
                if (alreadyNotified || alreadyRead) {
                    console.log('ğŸ”” Bu bildirim zaten gÃ¶sterildi:', notif.id);
                    return;
                }
                
                // Bildirim tarihi kontrolÃ¼ - listenerStartTime'dan sonra mÄ± oluÅŸturulmuÅŸ?
                if (!notifDate) {
                    notifDate = new Date(); // cutoff'tan geÃ§tiyse, popup kontrolÃ¼ iÃ§in ÅŸimdiki zaman kabul et
                }
                
                const now = new Date();
                const diffSeconds = (now - notifDate) / 1000;
                
                console.log('ğŸ”” Bildirim tarihi:', notifDate.toISOString());
                console.log('ğŸ”” Listener baÅŸlangÄ±Ã§:', listenerStartTime ? listenerStartTime.toISOString() : 'null');
                console.log('ğŸ”” Bildirim yaÅŸÄ±:', diffSeconds, 'saniye');
                
                // KRITIK: Bildirim listener baÅŸladÄ±ktan SONRA veya son 10 saniye iÃ§inde oluÅŸturulduysa gÃ¶ster
                // Bu, realtime olarak gelen yeni bildirimleri yakalar
                let shouldShowPopup = false;
                
                if (listenerStartTime && notifDate >= listenerStartTime) {
                    // Listener baÅŸladÄ±ktan sonra oluÅŸturulan bildirim
                    shouldShowPopup = true;
                    console.log('ğŸ”” âœ… Listener baÅŸladÄ±ktan sonra oluÅŸturulmuÅŸ - GÃ–STER');
                } else if (diffSeconds <= 10) {
                    // Son 10 saniye iÃ§inde oluÅŸturulan bildirim (race condition iÃ§in)
                    shouldShowPopup = true;
                    console.log('ğŸ”” âœ… Son 10 saniye iÃ§inde oluÅŸturulmuÅŸ - GÃ–STER');
                } else {
                    console.log('ğŸ”” âŒ Eski bildirim, popup gÃ¶sterilmeyecek');
                }
                
                if (shouldShowPopup) {
                    console.log('ğŸ”” ğŸš€ YENÄ° BÄ°LDÄ°RÄ°M GÃ–STERÄ°LÄ°YOR:', notif.title);
                    
                    // MERKEZÄ° BÄ°LDÄ°RÄ°M SÄ°STEMÄ° KULLAN
                    showFullNotification({
                        title: notif.title || 'Bildirim',
                        message: notif.message || '',
                        type: notif.type || 'info',
                        keyCode: notif.keyCode,
                        showPopup: true,
                        playSound: true,
                        showNative: true,
                        vibrate: true,
                        updateBadge: true
                    });
                }
                
                // Bu ID'yi notified listesine ekle (tekrar gÃ¶sterilmesin)
                notifiedIds.push(notif.id);
            }
        });
        
        // Notified listesini kaydet
        localStorage.setItem('notifiedNotifications', JSON.stringify([...new Set(notifiedIds)]));
        
        // Bildirimleri tarihe gÃ¶re sÄ±rala
        userNotifications.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });
        
        updateNotificationBadge();
    }
    
    // Bildirim dinleyiciyi durdur
    function stopNotificationListener() {
        if (notificationListener) {
            notificationListener();
            notificationListener = null;
        }
        if (allNotificationListener) {
            allNotificationListener();
            allNotificationListener = null;
        }
        if (emailNotificationListener) {
            emailNotificationListener();
            emailNotificationListener = null;
        }
        if (adminNotificationListener) {
            adminNotificationListener();
            adminNotificationListener = null;
        }
        userNotifications = [];
    }
    
    // Bildirim popup gÃ¶ster
    function showNotificationPopup(notif) {
        const icons = {
            'info': 'â„¹ï¸',
            'success': 'âœ…',
            'warning': 'âš ï¸',
            'promo': 'ğŸ',
            'order': 'ğŸ“¦'
        };
        
        const colors = {
            'info': '#2196F3',
            'success': '#4CAF50',
            'warning': '#FF9800',
            'promo': '#E91E63',
            'order': '#9C27B0'
        };
        
        const icon = icons[notif.type] || 'ğŸ””';
        const color = colors[notif.type] || '#2196F3';
        
        // Popup container
        let popup = document.createElement('div');
        popup.className = 'notif-popup';
        popup.innerHTML = `
            <div style="background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 15px; padding: 15px; margin: 10px; box-shadow: 0 5px 30px rgba(0,0,0,0.4); animation: slideInRight 0.3s ease;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="font-size: 24px;">${icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: #fff; margin-bottom: 5px;">${notif.title || 'Bildirim'}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 13px;">${notif.message || ''}</div>
                    </div>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; opacity: 0.7;">âœ•</button>
                </div>
            </div>
        `;
        popup.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10001; max-width: 350px;';
        document.body.appendChild(popup);
        
        // 5 saniye sonra otomatik kapat
        setTimeout(() => {
            if (popup.parentElement) {
                popup.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => popup.remove(), 300);
            }
        }, 5000);
    }
    
    // Bildirim badge gÃ¼ncelle
    function updateNotificationBadge() {
        const badge = document.getElementById('notifBadge');
        if (!badge) return;
        
        const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const unreadCount = userNotifications
            .filter(n => isNotificationVisibleByCutoff(n))
            .filter(n => !readNotifs.includes(n.id)).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'inline';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
        
        // Profil butonu badge'ini de gÃ¼ncelle
        updateProfileNotifBadge();
    }
    
    // Profil butonu bildirim badge gÃ¼ncelle
    function updateProfileNotifBadge() {
        const badge = document.getElementById('profileNotifBadge');
        if (!badge) return;
        
        const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const unreadCount = userNotifications
            .filter(n => isNotificationVisibleByCutoff(n))
            .filter(n => !readNotifs.includes(n.id)).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    }

    function getNotificationDateMaybe(notif) {
        try {
            if (!notif) return null;
            if (notif.createdAt && notif.createdAt.toDate) return notif.createdAt.toDate();
            if (notif.notifiedAt) {
                const d = new Date(notif.notifiedAt);
                return isNaN(d.getTime()) ? null : d;
            }
        } catch (e) {}
        return null;
    }

    function isNotificationVisibleByCutoff(notif) {
        if (!notificationCutoffDate) return true;
        const d = getNotificationDateMaybe(notif);
        if (!d) return false; // tarihi olmayanlar: eski kabul et
        return d >= notificationCutoffDate;
    }
    
    // Bildirim sesi Ã§al
    function playNotificationSound() {
        try {
            // Web Audio API ile bildirim sesi oluÅŸtur
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Ä°lk beep
            const oscillator1 = audioContext.createOscillator();
            const gainNode1 = audioContext.createGain();
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioContext.destination);
            oscillator1.frequency.value = 880; // A5 notasÄ±
            oscillator1.type = 'sine';
            gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator1.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.2);
            
            // Ä°kinci beep (daha yÃ¼ksek)
            setTimeout(() => {
                const oscillator2 = audioContext.createOscillator();
                const gainNode2 = audioContext.createGain();
                oscillator2.connect(gainNode2);
                gainNode2.connect(audioContext.destination);
                oscillator2.frequency.value = 1108; // C#6 notasÄ±
                oscillator2.type = 'sine';
                gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator2.start(audioContext.currentTime);
                oscillator2.stop(audioContext.currentTime + 0.3);
            }, 150);
            
            console.log('ğŸ”Š Bildirim sesi Ã§alÄ±ndÄ±');
        } catch(e) {
            console.log('Ses Ã§alÄ±namadÄ±:', e.message);
        }
    }
    
    // SipariÅŸ onay popup gÃ¶ster (bÃ¼yÃ¼k, ekran ortasÄ±)
    function showOrderApprovalPopup(notif) {
        const popup = document.getElementById('orderApprovalPopup');
        const messageEl = document.getElementById('approvalPopupMessage');
        const keyEl = document.querySelector('#approvalPopupKey div:last-child');
        
        if (!popup) return;
        
        messageEl.innerHTML = notif.message || 'Paketiniz aktif edildi!';
        keyEl.textContent = notif.keyCode || '';
        
        popup.style.display = 'flex';
        
        // TitreÅŸim (varsa)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Ses Ã§al
        playNotificationSound();
        
        console.log('ğŸ‰ SipariÅŸ onay popup gÃ¶sterildi');
    }
    
    // SipariÅŸ onay popup kapat
    function closeOrderApprovalPopup() {
        const popup = document.getElementById('orderApprovalPopup');
        if (popup) {
            popup.style.display = 'none';
        }
    }
    
    // Bildirimler modalÄ±nÄ± aÃ§
    async function openNotificationsModal() {
        const container = document.getElementById('notificationsList');
        
        // Loading gÃ¶ster
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <div style="color: #888; margin-top: 15px;">Bildirimler yÃ¼kleniyor...</div>
            </div>
        `;
        openModal('notificationsModal');
        
        // Firestore'dan bildirimleri Ã§ek (dinleyici Ã§alÄ±ÅŸmasa bile)
        try {
            if (!currentUser) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 50px; margin-bottom: 15px;">ğŸ””</div>
                        <div style="color: #888;">GiriÅŸ yapmalÄ±sÄ±nÄ±z</div>
                    </div>
                `;
                return;
            }
            
            const userEmail = currentUser.email.toLowerCase().trim();
            console.log('ğŸ”” Bildirimler yÃ¼kleniyor... Email:', userEmail);

            await ensureNotificationCutoffDate();
            
            // Genel bildirimleri Ã§ek
            const allNotifs = await db.collection('notifications')
                .where('targetType', '==', 'all')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            // KullanÄ±cÄ±ya Ã¶zel bildirimleri Ã§ek
            const userNotifs = await db.collection('notifications')
                .where('targetType', '==', userEmail)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            // Admin hedefli bildirimleri Ã§ek
            let adminNotifs = null;
            if (isAdmin()) {
                adminNotifs = await db.collection('notifications')
                    .where('targetType', '==', 'admins')
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();
            }
            
            console.log('ğŸ”” Genel bildirim sayÄ±sÄ±:', allNotifs.size);
            console.log('ğŸ”” KullanÄ±cÄ± bildirim sayÄ±sÄ±:', userNotifs.size);
            if (adminNotifs) console.log('ğŸ”” Admin bildirim sayÄ±sÄ±:', adminNotifs.size);
            
            // Bildirimleri birleÅŸtir (temizlenenleri hariÃ§ tut)
            userNotifications = [];
            allNotifs.forEach(doc => {
                const n = { id: doc.id, ...doc.data() };
                const d = n.createdAt?.toDate ? n.createdAt.toDate() : (n.notifiedAt ? new Date(n.notifiedAt) : null);
                if (!notificationCutoffDate || (d && d >= notificationCutoffDate)) {
                    userNotifications.push(n);
                }
            });
            userNotifs.forEach(doc => {
                // Duplikasyonu Ã¶nle
                if (!userNotifications.find(n => n.id === doc.id)) {
                    const n = { id: doc.id, ...doc.data() };
                    const d = n.createdAt?.toDate ? n.createdAt.toDate() : (n.notifiedAt ? new Date(n.notifiedAt) : null);
                    if (!notificationCutoffDate || (d && d >= notificationCutoffDate)) {
                        userNotifications.push(n);
                    }
                }
            });

            if (adminNotifs) {
                adminNotifs.forEach(doc => {
                    if (!userNotifications.find(n => n.id === doc.id)) {
                        const n = { id: doc.id, ...doc.data() };
                        const d = n.createdAt?.toDate ? n.createdAt.toDate() : (n.notifiedAt ? new Date(n.notifiedAt) : null);
                        if (!notificationCutoffDate || (d && d >= notificationCutoffDate)) {
                            userNotifications.push(n);
                        }
                    }
                });
            }
            
            // Tarihe gÃ¶re sÄ±rala
            userNotifications.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB - dateA;
            });
            
            console.log('ğŸ”” Toplam bildirim (temizlenenler hariÃ§):', userNotifications.length);
            
            renderNotificationsList(container);
            
        } catch(e) {
            console.error('ğŸ”” Bildirim yÃ¼kleme hatasÄ±:', e);
            // Index hatasÄ± olabilir - orderBy olmadan dene
            try {
                const userEmail = currentUser.email.toLowerCase().trim();

                await ensureNotificationCutoffDate();
                
                const allNotifs = await db.collection('notifications')
                    .where('targetType', '==', 'all')
                    .limit(50)
                    .get();
                
                const userNotifs = await db.collection('notifications')
                    .where('targetType', '==', userEmail)
                    .limit(50)
                    .get();

                let adminNotifs = null;
                if (isAdmin()) {
                    adminNotifs = await db.collection('notifications')
                        .where('targetType', '==', 'admins')
                        .limit(50)
                        .get();
                }
                
                userNotifications = [];
                allNotifs.forEach(doc => {
                    const n = { id: doc.id, ...doc.data() };
                    const d = n.createdAt?.toDate ? n.createdAt.toDate() : (n.notifiedAt ? new Date(n.notifiedAt) : null);
                    if (!notificationCutoffDate || (d && d >= notificationCutoffDate)) {
                        userNotifications.push(n);
                    }
                });
                userNotifs.forEach(doc => {
                    if (!userNotifications.find(n => n.id === doc.id)) {
                        const n = { id: doc.id, ...doc.data() };
                        const d = n.createdAt?.toDate ? n.createdAt.toDate() : (n.notifiedAt ? new Date(n.notifiedAt) : null);
                        if (!notificationCutoffDate || (d && d >= notificationCutoffDate)) {
                            userNotifications.push(n);
                        }
                    }
                });

                if (adminNotifs) {
                    adminNotifs.forEach(doc => {
                        if (!userNotifications.find(n => n.id === doc.id)) {
                            const n = { id: doc.id, ...doc.data() };
                            const d = n.createdAt?.toDate ? n.createdAt.toDate() : (n.notifiedAt ? new Date(n.notifiedAt) : null);
                            if (!notificationCutoffDate || (d && d >= notificationCutoffDate)) {
                                userNotifications.push(n);
                            }
                        }
                    });
                }
                
                renderNotificationsList(container);
            } catch(e2) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 50px; margin-bottom: 15px;">âŒ</div>
                        <div style="color: #888;">Bildirimler yÃ¼klenemedi</div>
                        <div style="color: #666; font-size: 12px; margin-top: 10px;">${e2.message}</div>
                    </div>
                `;
            }
        }
    }
    
    // Bildirim listesini render et
    function renderNotificationsList(container) {
        if (userNotifications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 50px; margin-bottom: 15px;">ğŸ””</div>
                    <div style="color: #888;">HenÃ¼z bildirim yok</div>
                </div>
            `;
            return;
        }
        
        const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        
        let html = '';
        userNotifications.forEach(notif => {
            const icons = { 'info': 'â„¹ï¸', 'success': 'âœ…', 'warning': 'âš ï¸', 'promo': 'ğŸ', 'order': 'ğŸ“¦' };
            const colors = { 'info': '#2196F3', 'success': '#4CAF50', 'warning': '#FF9800', 'promo': '#E91E63', 'order': '#9C27B0' };
            const icon = icons[notif.type] || 'ğŸ””';
            const color = colors[notif.type] || '#2196F3';
            const isRead = readNotifs.includes(notif.id);
            const date = notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString('tr-TR') : '';
            
            html += `
                <div style="background: ${isRead ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)'}; border-left: 3px solid ${color}; border-radius: 10px; padding: 15px; margin-bottom: 10px; ${!isRead ? 'box-shadow: 0 2px 10px rgba(0,0,0,0.2);' : ''}">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="font-size: 24px;">${icon}</div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-weight: bold; color: #fff;">${notif.title || 'Bildirim'}</div>
                                ${!isRead ? '<span style="background: #f44336; color: #fff; padding: 2px 6px; border-radius: 8px; font-size: 9px;">YENÄ°</span>' : ''}
                            </div>
                            <div style="color: #aaa; font-size: 13px; margin-top: 5px;">${notif.message || ''}</div>
                            <div style="color: #666; font-size: 11px; margin-top: 8px;">${date}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // TÃ¼m bildirimleri okundu olarak iÅŸaretle
        const allIds = userNotifications.map(n => n.id);
        localStorage.setItem('readNotifications', JSON.stringify([...new Set([...readNotifs, ...allIds])]));
        updateNotificationBadge();
    }
    
    // TÃ¼m bildirimleri temizle
    async function clearAllNotifications() {
        if (userNotifications.length === 0) {
            showToast('ğŸ“­ Temizlenecek bildirim yok');
            return;
        }

        try {
            const now = new Date();
            notificationCutoffDate = now;

            // HafÄ±zadaki bildirimleri de temizle (aksi halde badge eski listeden 9+ gÃ¶sterebilir)
            userNotifications = [];

            if (currentUser?.uid) {
                try {
                    localStorage.setItem('notifClearedAt_' + currentUser.uid, now.toISOString());
                } catch (e) {}
            }

            try {
                localStorage.setItem('clearedNotifications', '[]');
                localStorage.setItem('readNotifications', '[]');
                localStorage.setItem('notifiedNotifications', '[]');
            } catch (e) {}

            // Badge'leri anÄ±nda sÄ±fÄ±rla
            try {
                updateNotificationBadge();
                updateProfileNotifBadge();
                if (typeof updateSidebarBadges === 'function') updateSidebarBadges();
            } catch (e) {}

            if (db && currentUser?.uid) {
                try {
                    await db.collection('users').doc(currentUser.uid).set({
                        notificationsClearedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        notificationsClearedAtClient: now.toISOString()
                    }, { merge: true });
                } catch (e) {}
            }

            const email = (currentUser?.email || '').toLowerCase().trim();
            if (db && email) {
                try {
                    const batchLimit = 200;
                    while (true) {
                        const snap = await db.collection('notifications')
                            .where('targetType', '==', email)
                            .limit(batchLimit)
                            .get();
                        if (snap.empty) break;
                        const batch = db.batch();
                        snap.docs.forEach(d => batch.delete(d.ref));
                        await batch.commit();
                        if (snap.size < batchLimit) break;
                    }

                    while (true) {
                        const snap = await db.collection('notifications')
                            .where('email', '==', email)
                            .limit(batchLimit)
                            .get();
                        if (snap.empty) break;
                        const batch = db.batch();
                        snap.docs.forEach(d => batch.delete(d.ref));
                        await batch.commit();
                        if (snap.size < batchLimit) break;
                    }
                } catch (e) {
                    // security rules izin vermediyse sadece gizleme Ã§alÄ±ÅŸÄ±r
                }
            }

            userNotifications = [];
        } catch (e) {
            userNotifications = [];
        }
        
        // UI gÃ¼ncelle
        const container = document.getElementById('notificationsList');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 50px; margin-bottom: 15px;">âœ…</div>
                <div style="color: #4CAF50;">TÃ¼m bildirimler temizlendi!</div>
            </div>
        `;
        
        updateNotificationBadge();
        showToast('âœ… Bildirimler temizlendi');
    }
    
    // ============ KURULUM MODALLARI YÃ–NETÄ°MÄ° ============
    let setupModals = {}; // TÃ¼m kurulum modallarÄ±
    let editingModalSteps = []; // Editor'daki adÄ±mlar
    let editingModalId = null; // DÃ¼zenlenen modal ID
    
    // Kurulum modallarÄ±nÄ± Firestore'dan yÃ¼kle
    async function loadSetupModals() {
        try {
            const doc = await db.collection('settings').doc('setupModals').get();
            if (doc.exists) {
                setupModals = doc.data().modals || {};
            }
            console.log('Kurulum modallarÄ± yÃ¼klendi:', Object.keys(setupModals).length);
        } catch(e) {
            console.error('Kurulum modallarÄ± yÃ¼klenemedi:', e);
        }
    }
    
    // =============== UYGULAMA AYARLARI YÃ–NETÄ°MÄ° ===============
    let appSettingsData = null;
    
    // GitHub API AyarlarÄ± - Token Firestore'dan yÃ¼klenir
    const GITHUB_CONFIG = {
        owner: 'LineOft',
        repo: 'thebestml-updates',
        branch: 'main',
        token: ''
    };
    
    // GitHub token'Ä± Firestore'dan yÃ¼kle
    async function loadGithubToken() {
        try {
            const doc = await db.collection('settings').doc('github_config').get();
            if (doc.exists && doc.data().token) {
                GITHUB_CONFIG.token = doc.data().token;
                console.log('âœ… GitHub token yÃ¼klendi');
            } else {
                // Token yoksa ve owner ise, varsayÄ±lan token'Ä± kaydet
                console.log('âš ï¸ GitHub token bulunamadÄ±');
            }
        } catch(e) {
            console.log('GitHub token yÃ¼klenemedi:', e.message);
        }
    }
    
    // Gizli kurulum fonksiyonu (konsol Ã¼zerinden Ã§aÄŸrÄ±labilir)
    window.setupGithubToken = async function(token) {
        if (!isOwner()) {
            console.error('âŒ Bu iÅŸlem sadece owner iÃ§in!');
            return;
        }
        try {
            await db.collection('settings').doc('github_config').set({
                token: token,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            });
            GITHUB_CONFIG.token = token;
            console.log('âœ… GitHub token kaydedildi!');
        } catch(e) {
            console.error('âŒ Hata:', e);
        }
    };
    
    // Tema sÄ±fÄ±rlama fonksiyonu (konsol Ã¼zerinden Ã§aÄŸrÄ±labilir)
    window.resetThemeToDefaults = async function() {
        if (!isOwner()) {
            console.error('âŒ Bu iÅŸlem sadece owner iÃ§in!');
            return;
        }
        try {
            console.log('â³ Tema sÄ±fÄ±rlanÄ±yor...');
            
            // Orijinal tema ayarlarÄ±
            const originalTheme = {
                primaryColor: '#4CAF50',
                secondaryColor: '#2196F3',
                backgroundColor: '#0f0f23',
                cardBackground: '#1a1a2e',
                gradientStart: '#667eea',
                gradientEnd: '#764ba2',
                textColor: '#ffffff',
                accentColor: '#FF9800'
            };
            
            // Firestore'daki appConfig'i gÃ¼ncelle
            await db.collection('settings').doc('appConfig').update({
                theme: originalTheme,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            });
            
            console.log('âœ… Tema Firestore\'a kaydedildi!');
            console.log('ğŸ”„ Sayfa yenileniyor...');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } catch(e) {
            console.error('âŒ Hata:', e);
        }
    };
    
    // TÃ¼m ayarlarÄ± sÄ±fÄ±rlama fonksiyonu (konsol Ã¼zerinden Ã§aÄŸrÄ±labilir)
    window.resetAllSettings = async function() {
        if (!isOwner()) {
            console.error('âŒ Bu iÅŸlem sadece owner iÃ§in!');
            return;
        }
        try {
            console.log('â³ TÃ¼m ayarlar sÄ±fÄ±rlanÄ±yor...');
            
            const defaults = JSON.parse(JSON.stringify(defaultAppSettings));
            defaults.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
            defaults.updatedBy = currentUser.email;
            
            await db.collection('settings').doc('appConfig').set(defaults);
            
            console.log('âœ… TÃ¼m ayarlar Firestore\'a kaydedildi!');
            console.log('ğŸ”„ Sayfa yenileniyor...');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } catch(e) {
            console.error('âŒ Hata:', e);
        }
    };
    
    // VarsayÄ±lan ayarlar
    const defaultAppSettings = {
        general: {
            appName: 'Game Store',
            appSubtitle: 'Oyun ModlarÄ± & Kurulum Rehberleri',
            logoUrl: '',
            iconUrl: '',
            footerText: 'Â© 2025 Game Store. TÃ¼m haklarÄ± saklÄ±dÄ±r.'
        },
        theme: {
            primaryColor: '#4CAF50',
            secondaryColor: '#2196F3',
            backgroundColor: '#0f0f23',
            cardBackground: '#1a1a2e',
            gradientStart: '#667eea',
            gradientEnd: '#764ba2',
            textColor: '#ffffff',
            accentColor: '#FF9800'
        },
        popup: {
            enabled: false,
            title: 'ğŸ“¢ Duyuru',
            message: '',
            buttonText: 'Tamam',
            buttonUrl: '',
            showOnce: true,
            bgColor: '#1a1a2e',
            borderColor: '#4CAF50'
        },
        announcement: {
            enabled: false,
            text: '',
            bgColor: '#FF9800',
            textColor: '#000000',
            link: ''
        },
        maintenance: {
            enabled: false,
            title: 'ğŸ”§ BakÄ±m Modu',
            message: 'Uygulama ÅŸu anda bakÄ±mda. LÃ¼tfen daha sonra tekrar deneyin.',
            estimatedTime: ''
        },
        texts: {
            homeTitle: 'Game Store',
            homeSubtitle: 'Oyun ModlarÄ± & Kurulum Rehberleri',
            welcomeMessage: 'HoÅŸ Geldiniz!',
            footerText: 'Â© 2025 Game Store'
        },
        update: {
            currentVersion: APP_VERSION,
            latestVersion: APP_VERSION,
            changelog: [],
            forceUpdate: false,
            updateUrl: ''
        },
        lastUpdated: null,
        updatedBy: null
    };
    
    // Uygulama ayarlarÄ±nÄ± yÃ¼kle
    async function loadAppSettings() {
        try {
            const doc = await db.collection('settings').doc('appConfig').get();
            if (doc.exists) {
                appSettingsData = { ...defaultAppSettings, ...doc.data() };
            } else {
                appSettingsData = { ...defaultAppSettings };
            }
            
            // UI'Ä± gÃ¼ncelle
            updateAppSettingsUI();
            
            // AyarlarÄ± uygula (sadece popup, duyuru, bakÄ±m modu)
            applyAppSettings();
            
            // Orijinal ayarlar bilgisini yÃ¼kle
            loadOriginalDefaultsInfo();
            
            console.log('âœ… Uygulama ayarlarÄ± yÃ¼klendi');
        } catch(e) {
            console.error('âŒ Uygulama ayarlarÄ± yÃ¼klenemedi:', e);
            appSettingsData = { ...defaultAppSettings };
        }
    }
    
    // Son gÃ¼ncelleme bilgisini gÃ¶ster
    function updateAppSettingsUI() {
        const container = document.getElementById('appSettingsLastUpdate');
        if (!container || !appSettingsData) return;
        
        if (appSettingsData.lastUpdated) {
            const date = appSettingsData.lastUpdated.toDate ? appSettingsData.lastUpdated.toDate() : new Date(appSettingsData.lastUpdated);
            container.innerHTML = `
                <div>ğŸ“… Son GÃ¼ncelleme: ${date.toLocaleString('tr-TR')}</div>
                <div style="margin-top: 3px;">ğŸ‘¤ ${appSettingsData.updatedBy || 'Bilinmiyor'}</div>
            `;
        } else {
            container.innerHTML = 'HenÃ¼z ayar kaydedilmemiÅŸ';
        }
    }
    
    // AyarlarÄ± uygulamaya uygula (sadece popup, duyuru, bakÄ±m modu)
    function applyAppSettings() {
        if (!appSettingsData) return;
        
        console.log('ğŸ”„ Uygulama ayarlarÄ± uygulanÄ±yor (popup/duyuru/bakÄ±m)...');
        
        // Versiyon gÃ¶sterimi - HER ZAMAN APP_VERSION kullan
        const displayVersion = APP_VERSION;
        document.querySelectorAll('#currentVersion, #currentVersionBtn, .app-version').forEach(el => {
            el.textContent = displayVersion;
        });
        localStorage.setItem('displayed_version', displayVersion);
        console.log('ğŸ“± GÃ¶rÃ¼nen versiyon:', displayVersion);
        
        // Popup kontrolÃ¼
        if (appSettingsData.popup?.enabled) {
            showStartupPopup();
        }
        
        // Duyuru banner
        if (appSettingsData.announcement?.enabled) {
            showAnnouncementBanner();
        }
        
        // BakÄ±m modu
        if (appSettingsData.maintenance?.enabled) {
            showMaintenanceScreen();
        }
        
        console.log('âœ… Uygulama ayarlarÄ± uygulandÄ±');
    }
    
    // AÃ§Ä±lÄ±ÅŸ popup'Ä± gÃ¶ster
    function showStartupPopup() {
        if (!appSettingsData?.popup?.enabled) return;
        
        const p = appSettingsData.popup;
        const popupKey = 'startup_popup_' + (p.title || '').replace(/\s/g, '_');
        
        // Sadece bir kez gÃ¶ster seÃ§eneÄŸi
        if (p.showOnce && localStorage.getItem(popupKey)) {
            return;
        }
        
        const popupHtml = `
            <div id="startupPopupOverlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: ${p.bgColor || '#1a1a2e'}; border: 2px solid ${p.borderColor || '#4CAF50'}; border-radius: 20px; padding: 25px; max-width: 350px; text-align: center; animation: popupBounce 0.5s ease;">
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #fff;">${p.title || 'ğŸ“¢ Duyuru'}</div>
                    <div style="color: #ccc; font-size: 14px; line-height: 1.6; margin-bottom: 20px; white-space: pre-line;">${p.message || ''}</div>
                    ${p.buttonUrl ? `
                        <a href="${p.buttonUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${p.borderColor || '#4CAF50'}, ${p.borderColor || '#45a049'}); color: #fff; border: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 14px; cursor: pointer; text-decoration: none; margin-bottom: 10px;">${p.buttonText || 'Tamam'}</a>
                        <br>
                    ` : ''}
                    <button onclick="closeStartupPopup('${popupKey}')" style="background: ${p.buttonUrl ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${p.borderColor || '#4CAF50'}, ${p.borderColor || '#45a049'})`}; color: #fff; border: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 14px; cursor: pointer;">
                        ${p.buttonUrl ? 'Kapat' : (p.buttonText || 'Tamam')}
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHtml);
    }
    
    function closeStartupPopup(popupKey) {
        const overlay = document.getElementById('startupPopupOverlay');
        if (overlay) overlay.remove();
        if (popupKey) localStorage.setItem(popupKey, 'shown');
    }
    
    // Duyuru banner'Ä± gÃ¶ster
    function showAnnouncementBanner() {
        if (!appSettingsData?.announcement?.enabled) return;
        
        const a = appSettingsData.announcement;
        const existingBanner = document.getElementById('announcementBanner');
        if (existingBanner) existingBanner.remove();
        
        const bannerHtml = `
            <div id="announcementBanner" style="position: fixed; bottom: 60px; left: 0; right: 0; background: ${a.bgColor || '#FF9800'}; padding: 10px 15px; z-index: 9998; display: flex; align-items: center; justify-content: space-between;">
                <div style="flex: 1; color: ${a.textColor || '#000'}; font-size: 13px; font-weight: 500;">
                    ${a.link ? `<a href="${a.link}" target="_blank" style="color: inherit; text-decoration: underline;">${a.text}</a>` : a.text}
                </div>
                <button onclick="document.getElementById('announcementBanner').remove()" style="background: rgba(0,0,0,0.2); border: none; color: ${a.textColor || '#000'}; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-left: 10px;">âœ•</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHtml);
    }
    
    // BakÄ±m ekranÄ± gÃ¶ster
    function showMaintenanceScreen() {
        if (!appSettingsData?.maintenance?.enabled) return;
        
        // Owner veya Admin ise bakÄ±m ekranÄ±nÄ± gÃ¶sterme
        if (currentUser) {
            const userRole = currentUser.role || localStorage.getItem('userRole');
            if (userRole === 'owner' || userRole === 'admin') {
                console.log('ğŸ”§ BakÄ±m modu aktif ama admin/owner olarak devam ediyorsunuz');
                showToast('ğŸ”§ BakÄ±m modu aktif - Ekip eriÅŸimi ile devam ediyorsunuz');
                return;
            }
        }
        
        const m = appSettingsData.maintenance;
        
        // BakÄ±m ekranÄ±nÄ± gÃ¶ster - Ekip GiriÅŸi butonuyla
        document.body.innerHTML = `
            <div id="maintenanceScreen" style="min-height: 100vh; background: linear-gradient(135deg, #1a1a2e, #16213e); display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="text-align: center; max-width: 400px; width: 100%;">
                    <div style="font-size: 80px; margin-bottom: 20px;">ğŸ”§</div>
                    <h1 style="color: #fff; margin-bottom: 15px;">${m.title || 'BakÄ±m Modu'}</h1>
                    <p style="color: #aaa; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${m.message || 'Uygulama ÅŸu anda bakÄ±mda. KÄ±sa sÃ¼re iÃ§inde tekrar aÃ§Ä±lacaktÄ±r.'}</p>
                    ${m.estimatedTime ? `<div style="background: rgba(255,152,0,0.2); border: 1px solid #FF9800; border-radius: 10px; padding: 15px; color: #FF9800; margin-bottom: 20px;">â° ${m.estimatedTime}</div>` : ''}
                    
                    <!-- Ekip GiriÅŸi BÃ¶lÃ¼mÃ¼ -->
                    <div id="teamLoginSection" style="margin-top: 30px;">
                        <button onclick="showTeamLoginForm()" style="background: rgba(103,58,183,0.2); border: 1px solid #673AB7; color: #673AB7; padding: 12px 25px; border-radius: 10px; font-size: 14px; cursor: pointer;">
                            ğŸ‘¥ Ekip GiriÅŸi
                        </button>
                    </div>
                    
                    <!-- Ekip GiriÅŸ Formu (Gizli) -->
                    <div id="teamLoginForm" style="display: none; margin-top: 20px; background: rgba(103,58,183,0.1); border: 1px solid rgba(103,58,183,0.3); border-radius: 15px; padding: 20px;">
                        <div style="font-size: 16px; font-weight: bold; color: #673AB7; margin-bottom: 15px;">ğŸ‘‘ Ekip GiriÅŸi</div>
                        <input type="email" id="teamLoginEmail" placeholder="E-posta" style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff; margin-bottom: 10px; box-sizing: border-box;">
                        <input type="password" id="teamLoginPassword" placeholder="Åifre" style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff; margin-bottom: 15px; box-sizing: border-box;">
                        <button onclick="attemptTeamLogin()" style="width: 100%; background: linear-gradient(135deg, #673AB7, #512DA8); color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; margin-bottom: 10px;">
                            ğŸ” GiriÅŸ Yap
                        </button>
                        <button onclick="hideTeamLoginForm()" style="width: 100%; background: rgba(255,255,255,0.1); color: #aaa; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                            â† Geri
                        </button>
                        <div id="teamLoginError" style="display: none; color: #f44336; font-size: 13px; margin-top: 10px;"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Ekip giriÅŸ formunu gÃ¶ster
    function showTeamLoginForm() {
        document.getElementById('teamLoginSection').style.display = 'none';
        document.getElementById('teamLoginForm').style.display = 'block';
    }
    
    // Ekip giriÅŸ formunu gizle
    function hideTeamLoginForm() {
        document.getElementById('teamLoginSection').style.display = 'block';
        document.getElementById('teamLoginForm').style.display = 'none';
        document.getElementById('teamLoginError').style.display = 'none';
    }
    
    // Ekip giriÅŸi dene
    async function attemptTeamLogin() {
        const email = document.getElementById('teamLoginEmail').value.trim().toLowerCase();
        const password = document.getElementById('teamLoginPassword').value;
        const errorEl = document.getElementById('teamLoginError');
        
        if (!email || !password) {
            errorEl.textContent = 'âŒ E-posta ve ÅŸifre gerekli';
            errorEl.style.display = 'block';
            return;
        }
        
        // Loading gÃ¶ster
        errorEl.textContent = 'â³ GiriÅŸ yapÄ±lÄ±yor...';
        errorEl.style.display = 'block';
        errorEl.style.color = '#3b82f6';
        
        try {
            // Firebase hazÄ±r mÄ± kontrol et
            if (!firebase || !firebase.auth) {
                throw new Error('Firebase henÃ¼z yÃ¼klenmedi');
            }
            
            // Firebase ile giriÅŸ yap
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Firebase giriÅŸ baÅŸarÄ±lÄ±:', user.email);
            
            // Owner e-posta kontrolÃ¼ (hardcoded)
            const ownerEmail = 'onurtenk0@gmail.com';
            const isUserOwner = email === ownerEmail;
            
            // Admin listesini Firestore'dan yÃ¼kle
            let isUserAdmin = false;
            try {
                const adminDoc = await db.collection('settings').doc('admins').get();
                if (adminDoc.exists) {
                    const data = adminDoc.data();
                    const admins = data.adminList || [];
                    const adminEmailList = admins.map(a => a.email.toLowerCase());
                    isUserAdmin = adminEmailList.includes(email);
                    console.log('Admin listesi:', adminEmailList, 'KullanÄ±cÄ± admin mi:', isUserAdmin);
                }
            } catch(adminErr) {
                console.log('Admin listesi yÃ¼klenemedi:', adminErr);
            }
            
            if (isUserOwner || isUserAdmin) {
                // BaÅŸarÄ±lÄ± - Ekip Ã¼yesi
                localStorage.setItem('userRole', isUserOwner ? 'owner' : 'admin');
                errorEl.textContent = 'âœ… Ekip giriÅŸi baÅŸarÄ±lÄ±! YÃ¶nlendiriliyor...';
                errorEl.style.color = '#22c55e';
                
                // SayfayÄ± yenile
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            } else {
                // Normal kullanÄ±cÄ± - BakÄ±m ekranÄ± kalsÄ±n
                errorEl.textContent = 'âš ï¸ Bu hesap ekip Ã¼yesi deÄŸil. BakÄ±m bitene kadar bekleyin.';
                errorEl.style.color = '#f59e0b';
                await firebase.auth().signOut();
            }
            
        } catch(e) {
            console.error('Ekip giriÅŸ hatasÄ±:', e);
            errorEl.style.color = '#ef4444';
            
            let errorMsg = 'âŒ GiriÅŸ baÅŸarÄ±sÄ±z: ' + (e.message || e.code || 'Bilinmeyen hata');
            
            if (e.code === 'auth/user-not-found') errorMsg = 'âŒ Bu e-posta ile kayÄ±tlÄ± kullanÄ±cÄ± yok';
            else if (e.code === 'auth/wrong-password') errorMsg = 'âŒ Åifre yanlÄ±ÅŸ';
            else if (e.code === 'auth/invalid-email') errorMsg = 'âŒ GeÃ§ersiz e-posta formatÄ±';
            else if (e.code === 'auth/invalid-credential') errorMsg = 'âŒ E-posta veya ÅŸifre hatalÄ±';
            else if (e.code === 'auth/too-many-requests') errorMsg = 'âŒ Ã‡ok fazla deneme. Biraz bekleyin.';
            else if (e.code === 'auth/network-request-failed') errorMsg = 'âŒ Ä°nternet baÄŸlantÄ±sÄ± yok';
            
            errorEl.textContent = errorMsg;
            errorEl.style.display = 'block';
        }
    }
    
    // Ayarlar modalÄ±nÄ± aÃ§
    function openAppSettingsModal(category) {
        if (!requirePermission('app_settings', 'uygulama ayarlarÄ±nÄ± dÃ¼zenlemek')) return;
        
        const modal = document.getElementById('appSettingsModal');
        const header = document.getElementById('appSettingsModalHeader');
        const title = document.getElementById('appSettingsModalTitle');
        const content = document.getElementById('appSettingsModalContent');
        
        if (!appSettingsData) {
            appSettingsData = { ...defaultAppSettings };
        }
        
        let headerColor = '#607D8B';
        let headerTitle = 'âš™ï¸ Ayarlar';
        let bodyHtml = '';
        
        switch(category) {
            case 'popup':
                headerColor = '#FF9800';
                headerTitle = 'ğŸ“¢ Popup & Duyuru';
                const p = appSettingsData.popup || defaultAppSettings.popup;
                const a = appSettingsData.announcement || defaultAppSettings.announcement;
                bodyHtml = `
                    <!-- AÃ§Ä±lÄ±ÅŸ Popup -->
                    <div style="background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <div style="font-size: 14px; font-weight: bold; color: #FF9800;">ğŸ¯ AÃ§Ä±lÄ±ÅŸ Popup</div>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="settingPopupEnabled" ${p.enabled ? 'checked' : ''} style="width: 18px; height: 18px;">
                                <span style="color: #aaa; font-size: 12px;">Aktif</span>
                            </label>
                        </div>
                        <input type="text" id="settingPopupTitle" class="auth-input" value="${p.title || ''}" placeholder="ğŸ“¢ Duyuru" style="margin-bottom: 8px;">
                        <textarea id="settingPopupMessage" class="auth-input" placeholder="Popup mesajÄ±..." style="height: 60px; resize: none; margin-bottom: 8px;">${p.message || ''}</textarea>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                            <input type="text" id="settingPopupButtonText" class="auth-input" value="${p.buttonText || ''}" placeholder="Buton metni">
                            <input type="url" id="settingPopupButtonUrl" class="auth-input" value="${p.buttonUrl || ''}" placeholder="Buton URL (opsiyonel)">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                            <div>
                                <label style="font-size: 10px; color: #888;">Arka Plan</label>
                                <input type="color" id="settingPopupBgColor" value="${p.bgColor || '#1a1a2e'}" style="width: 100%; height: 30px; border: none; border-radius: 5px;">
                            </div>
                            <div>
                                <label style="font-size: 10px; color: #888;">KenarlÄ±k</label>
                                <input type="color" id="settingPopupBorderColor" value="${p.borderColor || '#4CAF50'}" style="width: 100%; height: 30px; border: none; border-radius: 5px;">
                            </div>
                        </div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="settingPopupShowOnce" ${p.showOnce ? 'checked' : ''}>
                            <span style="color: #aaa; font-size: 12px;">Sadece bir kez gÃ¶ster</span>
                        </label>
                    </div>
                    
                    <!-- Duyuru Banner -->
                    <div style="background: rgba(0,188,212,0.1); border: 1px solid rgba(0,188,212,0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <div style="font-size: 14px; font-weight: bold; color: #00BCD4;">ğŸ“£ Duyuru Banner</div>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="settingAnnouncementEnabled" ${a.enabled ? 'checked' : ''} style="width: 18px; height: 18px;">
                                <span style="color: #aaa; font-size: 12px;">Aktif</span>
                            </label>
                        </div>
                        <input type="text" id="settingAnnouncementText" class="auth-input" value="${a.text || ''}" placeholder="Duyuru metni..." style="margin-bottom: 8px;">
                        <input type="url" id="settingAnnouncementLink" class="auth-input" value="${a.link || ''}" placeholder="Link (opsiyonel)" style="margin-bottom: 8px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div>
                                <label style="font-size: 10px; color: #888;">Arka Plan</label>
                                <input type="color" id="settingAnnouncementBgColor" value="${a.bgColor || '#FF9800'}" style="width: 100%; height: 30px; border: none; border-radius: 5px;">
                            </div>
                            <div>
                                <label style="font-size: 10px; color: #888;">Metin Rengi</label>
                                <input type="color" id="settingAnnouncementTextColor" value="${a.textColor || '#000000'}" style="width: 100%; height: 30px; border: none; border-radius: 5px;">
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="saveAppSettings('popup')" class="btn btn-primary" style="width: 100%;">ğŸ’¾ Kaydet</button>
                `;
                break;
                
            case 'maintenance':
                headerColor = '#f44336';
                headerTitle = 'ğŸ”§ BakÄ±m Modu';
                const m = appSettingsData.maintenance || defaultAppSettings.maintenance;
                bodyHtml = `
                    <div style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                            <div style="font-size: 16px; font-weight: bold; color: #f44336;">âš ï¸ BakÄ±m Modu</div>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="settingMaintenanceEnabled" ${m.enabled ? 'checked' : ''} style="width: 22px; height: 22px;">
                                <span style="color: ${m.enabled ? '#f44336' : '#aaa'}; font-size: 14px; font-weight: bold;">${m.enabled ? 'AKTÄ°F' : 'Pasif'}</span>
                            </label>
                        </div>
                        
                        ${m.enabled ? `
                            <div style="background: #f44336; color: #fff; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 15px; animation: pulse 2s infinite;">
                                ğŸš¨ BAKIM MODU ÅU AN AKTÄ°F! KullanÄ±cÄ±lar uygulamayÄ± kullanamÄ±yor.
                            </div>
                        ` : ''}
                        
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 5px;">BaÅŸlÄ±k</label>
                            <input type="text" id="settingMaintenanceTitle" class="auth-input" value="${m.title || ''}" placeholder="ğŸ”§ BakÄ±m Modu">
                        </div>
                        
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 5px;">Mesaj</label>
                            <textarea id="settingMaintenanceMessage" class="auth-input" placeholder="Uygulama ÅŸu anda bakÄ±mda..." style="height: 80px; resize: none;">${m.message || ''}</textarea>
                        </div>
                        
                        <div style="margin-bottom: 12px;">
                            <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 5px;">Tahmini SÃ¼re (Opsiyonel)</label>
                            <input type="text" id="settingMaintenanceTime" class="auth-input" value="${m.estimatedTime || ''}" placeholder="Ã–rn: 2 saat, 30 dakika">
                        </div>
                    </div>
                    
                    <button onclick="saveAppSettings('maintenance')" class="btn btn-danger" style="width: 100%;">
                        ${m.enabled ? 'ğŸ”“ BakÄ±m Modunu Kapat' : 'ğŸ”’ BakÄ±m Modunu AÃ§'}
                    </button>
                    
                    <div style="margin-top: 15px; padding: 12px; background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); border-radius: 8px;">
                        <div style="font-size: 12px; color: #FF9800; font-weight: bold; margin-bottom: 5px;">âš ï¸ Dikkat</div>
                        <div style="font-size: 11px; color: #888; line-height: 1.5;">
                            BakÄ±m modu aktif olduÄŸunda TÃœM kullanÄ±cÄ±lar (adminler dahil) uygulamayÄ± kullanamazlar. Sadece bu ekranÄ± gÃ¶rebilirler.
                        </div>
                    </div>
                `;
                break;

            case 'loyalty':
                headerColor = '#4CAF50';
                headerTitle = 'ğŸ Sadakat AyarlarÄ±';
                bodyHtml = `
                    <div style="background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                        <div style="font-size: 14px; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">ğŸ§® Puan KazanÄ±mÄ±</div>
                        <div style="font-size: 11px; color: #888; line-height: 1.5; margin-bottom: 12px;">
                            Bu ayar, admin sipariÅŸi onayladÄ±ÄŸÄ±nda kullanÄ±cÄ±ya eklenecek sadakat puanÄ±nÄ± belirler.
                        </div>

                        <div style="margin-bottom: 10px;">
                            <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px;">KazanÄ±m Modu</label>
                            <select id="settingLoyaltyEarnMode" class="auth-input" style="margin-bottom: 0;" onchange="updateLoyaltyEarnModeUI()">
                                <option value="percent">% Oran (tutar bazlÄ±)</option>
                                <option value="fixed">Sabit Puan (sipariÅŸ baÅŸÄ±na)</option>
                            </select>
                        </div>

                        <div id="settingLoyaltyPercentBox" style="margin-bottom: 10px;">
                            <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px;">Oran (%)</label>
                            <input id="settingLoyaltyEarnPercent" type="number" min="0" max="100" step="1" class="auth-input" placeholder="Ã–rn: 5" style="margin-bottom: 0;" />
                            <div style="font-size: 10px; color: #666; margin-top: 6px;">Ã–rn: %5 â†’ 500â‚º sipariÅŸte 25 puan.</div>
                        </div>

                        <div id="settingLoyaltyFixedBox" style="margin-bottom: 10px; display: none;">
                            <label style="display: block; color: #aaa; font-size: 12px; margin-bottom: 6px;">Sabit Puan</label>
                            <input id="settingLoyaltyFixedPoints" type="number" min="0" step="1" class="auth-input" placeholder="Ã–rn: 10" style="margin-bottom: 0;" />
                            <div style="font-size: 10px; color: #666; margin-top: 6px;">Her onaylanan sipariÅŸe aynÄ± puan eklenir.</div>
                        </div>
                    </div>

                    <button onclick="saveLoyaltySettingsAdmin()" class="btn btn-primary" style="width: 100%;">ğŸ’¾ Kaydet</button>

                    <div style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 10px; font-size: 11px; color: #888; line-height: 1.5;">
                        Not: Puan kullanÄ±mÄ± ÅŸu an 1 puan = 1â‚º indirim (havale).
                    </div>
                `;

                // Modal aÃ§Ä±ldÄ±ktan sonra Firestore'dan gÃ¼ncel ayarÄ± yÃ¼kle
                setTimeout(() => {
                    try { loadLoyaltySettingsAdminIntoModal(); } catch (e) {}
                }, 0);
                break;
        }
        
        header.style.background = `linear-gradient(135deg, ${headerColor}, ${adjustColor(headerColor, -20)})`;
        title.textContent = headerTitle;
        content.innerHTML = bodyHtml;
        
        openModal('appSettingsModal');
    }
    
    // Renk ayarlama yardÄ±mcÄ± fonksiyonu
    function adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // ========== FABRÄ°KA AYARLARI FONKSÄ°YONLARI ==========
    
    // Mevcut ayarlarÄ± yedekle
    async function backupCurrentSettings() {
        if (!requirePermission('app_settings', 'ayarlarÄ± yedeklemek')) return;
        
        try {
            showToast('â³ Ayarlar yedekleniyor...');
            
            // Mevcut ayarlarÄ± al
            const currentSettings = { ...appSettingsData };
            currentSettings.backupDate = firebase.firestore.FieldValue.serverTimestamp();
            currentSettings.backupBy = currentUser ? currentUser.email : 'Bilinmiyor';
            
            // Yedek olarak kaydet
            await db.collection('settings').doc('appConfig_backup').set(currentSettings);
            
            showToast('âœ… Ayarlar yedeklendi!');
            console.log('âœ… Ayarlar yedeklendi:', currentSettings);
        } catch(e) {
            console.error('âŒ Yedekleme hatasÄ±:', e);
            showToast('âŒ Yedekleme baÅŸarÄ±sÄ±z: ' + e.message);
        }
    }
    
    // Fabrika ayarlarÄ±na dÃ¶nÃ¼ÅŸ onay ekranÄ±
    function showFactoryResetConfirm() {
        if (!requirePermission('app_settings', 'fabrika ayarlarÄ±na dÃ¶nmek')) return;
        
        const modal = document.createElement('div');
        modal.id = 'factoryResetModal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display: flex; z-index: 10001;';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;" onclick="event.stopPropagation()">
                <div class="modal-header" style="background: linear-gradient(135deg, #f44336, #c62828);">
                    <div class="modal-title">ğŸ­ Fabrika AyarlarÄ±na DÃ¶n</div>
                    <button class="modal-close" onclick="closeFactoryResetModal()">âœ•</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 60px;">âš ï¸</span>
                    </div>
                    
                    <div style="background: rgba(244,67,54,0.2); border: 1px solid #f44336; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                        <strong style="color: #ff5252;">DÄ°KKAT!</strong>
                        <p style="margin: 10px 0 0 0; font-size: 13px; color: #ffcdd2;">
                            Bu iÅŸlem geri alÄ±namaz! TÃ¼m uygulama ayarlarÄ± (tema, renkler, logo, metinler, popup) varsayÄ±lan deÄŸerlere dÃ¶necektir.
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="radio" name="resetType" value="default" checked style="width: 18px; height: 18px;">
                            <div>
                                <div style="font-weight: bold;">ğŸ”„ VarsayÄ±lan Ayarlara DÃ¶n</div>
                                <div style="font-size: 11px; color: #aaa;">Kod iÃ§indeki varsayÄ±lan deÄŸerleri kullan</div>
                            </div>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="radio" name="resetType" value="backup" style="width: 18px; height: 18px;">
                            <div>
                                <div style="font-weight: bold;">ğŸ“¦ Yedekten Geri YÃ¼kle</div>
                                <div style="font-size: 11px; color: #aaa;">Son yedeklenen ayarlarÄ± kullan</div>
                            </div>
                        </label>
                    </div>
                    
                    <div id="backupInfo" style="background: rgba(33,150,243,0.2); border-radius: 8px; padding: 10px; font-size: 12px; color: #90caf9; margin-bottom: 15px; display: none;">
                        Yedek bilgisi yÃ¼kleniyor...
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="closeFactoryResetModal()" style="flex: 1; padding: 12px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; cursor: pointer;">Ä°ptal</button>
                        <button onclick="executeFactoryReset()" style="flex: 1; padding: 12px; border: none; background: linear-gradient(135deg, #f44336, #c62828); color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold;">SÄ±fÄ±rla</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) closeFactoryResetModal(); };
        
        // Yedek bilgisini yÃ¼kle
        loadBackupInfo();
        
        // Radio deÄŸiÅŸikliÄŸinde yedek bilgisini gÃ¶ster/gizle
        document.querySelectorAll('input[name="resetType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('backupInfo').style.display = this.value === 'backup' ? 'block' : 'none';
            });
        });
    }
    
    // Yedek bilgisini yÃ¼kle
    async function loadBackupInfo() {
        try {
            const doc = await db.collection('settings').doc('appConfig_backup').get();
            const infoEl = document.getElementById('backupInfo');
            
            if (doc.exists) {
                const data = doc.data();
                const date = data.backupDate ? (data.backupDate.toDate ? data.backupDate.toDate() : new Date(data.backupDate)) : null;
                infoEl.innerHTML = `
                    <div>ğŸ“… Yedek Tarihi: ${date ? date.toLocaleString('tr-TR') : 'Bilinmiyor'}</div>
                    <div>ğŸ‘¤ Yedekleyen: ${data.backupBy || 'Bilinmiyor'}</div>
                `;
            } else {
                infoEl.innerHTML = 'âš ï¸ HenÃ¼z yedek alÄ±nmamÄ±ÅŸ';
                infoEl.style.background = 'rgba(255,152,0,0.2)';
                infoEl.style.color = '#ffcc80';
            }
        } catch(e) {
            console.error('Yedek bilgisi yÃ¼klenemedi:', e);
        }
    }
    
    // Fabrika ayarlarÄ±na dÃ¶nÃ¼ÅŸ modalÄ±nÄ± kapat
    function closeFactoryResetModal() {
        const modal = document.getElementById('factoryResetModal');
        if (modal) modal.remove();
    }
    
    // Fabrika ayarlarÄ±na dÃ¶nÃ¼ÅŸÃ¼ uygula
    async function executeFactoryReset() {
        const resetType = document.querySelector('input[name="resetType"]:checked').value;
        
        try {
            showToast('â³ Ayarlar sÄ±fÄ±rlanÄ±yor...');
            
            let newSettings;
            
            if (resetType === 'backup') {
                // Yedekten geri yÃ¼kle
                const backupDoc = await db.collection('settings').doc('appConfig_backup').get();
                if (!backupDoc.exists) {
                    showToast('âŒ Yedek bulunamadÄ±!');
                    return;
                }
                newSettings = backupDoc.data();
                delete newSettings.backupDate;
                delete newSettings.backupBy;
            } else {
                // VarsayÄ±lan ayarlara dÃ¶n
                newSettings = JSON.parse(JSON.stringify(defaultAppSettings));
            }
            
            // Meta bilgileri ekle
            newSettings.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
            newSettings.updatedBy = currentUser ? currentUser.email : 'Sistem';
            newSettings.resetType = resetType;
            newSettings.resetDate = firebase.firestore.FieldValue.serverTimestamp();
            
            // Firestore'a kaydet
            await db.collection('settings').doc('appConfig').set(newSettings);
            
            // Local deÄŸiÅŸkeni gÃ¼ncelle
            appSettingsData = newSettings;
            
            // Tema CSS'ini temizle
            const dynamicStyle = document.getElementById('dynamic-theme-css');
            if (dynamicStyle) dynamicStyle.remove();
            
            // AyarlarÄ± uygula
            applyAppSettings();
            updateAppSettingsUI();
            
            closeFactoryResetModal();
            
            showToast('âœ… Fabrika ayarlarÄ±na dÃ¶nÃ¼ldÃ¼!');
            
            // SayfayÄ± yenile
            setTimeout(() => {
                showToast('ğŸ”„ Sayfa yenileniyor...');
                setTimeout(() => window.location.href = 'index.html', 500);
            }, 1000);
            
        } catch(e) {
            console.error('âŒ SÄ±fÄ±rlama hatasÄ±:', e);
            showToast('âŒ SÄ±fÄ±rlama baÅŸarÄ±sÄ±z: ' + e.message);
        }
    }
    
    // Orijinal varsayÄ±lan ayarlarÄ± Firestore'a yÃ¼kle (VS Code'daki defaultAppSettings)
    async function uploadOriginalDefaults() {
        if (!requirePermission('app_settings', 'orijinal ayarlarÄ± yÃ¼klemek')) return;
        
        // Onay iste
        if (!confirm('âš ï¸ DÄ°KKAT!\n\nBu iÅŸlem kod iÃ§indeki varsayÄ±lan ayarlarÄ± Firestore\'a "orijinal ayarlar" olarak kaydedecek.\n\nDevam etmek istiyor musunuz?')) {
            return;
        }
        
        try {
            showToast('â³ Orijinal ayarlar yÃ¼kleniyor...');
            
            // defaultAppSettings'i kopyala
            const originalSettings = JSON.parse(JSON.stringify(defaultAppSettings));
            
            // Meta bilgileri ekle
            originalSettings.uploadedAt = firebase.firestore.FieldValue.serverTimestamp();
            originalSettings.uploadedBy = currentUser ? currentUser.email : 'Sistem';
            originalSettings.appVersion = APP_VERSION;
            originalSettings.description = 'VS Code varsayÄ±lan ayarlarÄ± - Orijinal fabrika ayarlarÄ±';
            
            // Firestore'a kaydet
            await db.collection('settings').doc('original_defaults').set(originalSettings);
            
            showToast('âœ… Orijinal ayarlar Firestore\'a yÃ¼klendi!');
            console.log('âœ… Orijinal ayarlar kaydedildi:', originalSettings);
            
            // Bilgi panelini gÃ¼ncelle
            loadOriginalDefaultsInfo();
            
        } catch(e) {
            console.error('âŒ YÃ¼kleme hatasÄ±:', e);
            showToast('âŒ YÃ¼kleme baÅŸarÄ±sÄ±z: ' + e.message);
        }
    }
    
    // Firestore'daki orijinal ayarlarÄ± geri yÃ¼kle
    async function loadOriginalDefaults() {
        if (!requirePermission('app_settings', 'orijinal ayarlarÄ± geri yÃ¼klemek')) return;
        
        try {
            // Ã–nce orijinal ayarlarÄ±n var olup olmadÄ±ÄŸÄ±nÄ± kontrol et
            const doc = await db.collection('settings').doc('original_defaults').get();
            
            if (!doc.exists) {
                showToast('âš ï¸ Firestore\'da orijinal ayarlar bulunamadÄ±!\n\nÃ–nce "Orijinal AyarlarÄ± Firestore\'a YÃ¼kle" butonunu kullanÄ±n.');
                return;
            }
            
            // Onay iste
            if (!confirm('âš ï¸ DÄ°KKAT!\n\nBu iÅŸlem tÃ¼m mevcut ayarlarÄ± Firestore\'daki orijinal ayarlarla deÄŸiÅŸtirecek.\n\nTema, renkler, metinler ve tÃ¼m Ã¶zelleÅŸtirmeler sÄ±fÄ±rlanacak!\n\nDevam etmek istiyor musunuz?')) {
                return;
            }
            
            showToast('â³ Orijinal ayarlar geri yÃ¼kleniyor...');
            
            // Orijinal ayarlarÄ± al
            const originalData = doc.data();
            
            // Meta bilgileri temizle
            delete originalData.uploadedAt;
            delete originalData.uploadedBy;
            delete originalData.appVersion;
            delete originalData.description;
            
            // Yeni meta bilgileri ekle
            originalData.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
            originalData.updatedBy = currentUser ? currentUser.email : 'Sistem';
            originalData.restoredFromOriginal = true;
            originalData.restoreDate = firebase.firestore.FieldValue.serverTimestamp();
            
            // Firestore'a kaydet
            await db.collection('settings').doc('appConfig').set(originalData);
            
            // Local deÄŸiÅŸkeni gÃ¼ncelle
            appSettingsData = originalData;
            
            // Tema CSS'ini temizle
            const dynamicStyle = document.getElementById('dynamic-theme-css');
            if (dynamicStyle) dynamicStyle.remove();
            
            // AyarlarÄ± uygula
            applyAppSettings();
            updateAppSettingsUI();
            
            showToast('âœ… Orijinal ayarlar geri yÃ¼klendi!');
            
            // SayfayÄ± yenile
            setTimeout(() => {
                showToast('ğŸ”„ Sayfa yenileniyor...');
                setTimeout(() => window.location.href = 'index.html', 500);
            }, 1000);
            
        } catch(e) {
            console.error('âŒ Geri yÃ¼kleme hatasÄ±:', e);
            showToast('âŒ Geri yÃ¼kleme baÅŸarÄ±sÄ±z: ' + e.message);
        }
    }
    
    // Orijinal ayarlar bilgisini yÃ¼kle ve gÃ¶ster
    async function loadOriginalDefaultsInfo() {
        const infoEl = document.getElementById('originalDefaultsInfo');
        if (!infoEl) return;
        
        try {
            const doc = await db.collection('settings').doc('original_defaults').get();
            
            if (doc.exists) {
                const data = doc.data();
                const date = data.uploadedAt ? (data.uploadedAt.toDate ? data.uploadedAt.toDate() : new Date(data.uploadedAt)) : null;
                
                infoEl.style.display = 'block';
                infoEl.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">ğŸ“¦ Firestore'daki Orijinal Ayarlar:</div>
                    <div>ğŸ“… YÃ¼klenme: ${date ? date.toLocaleString('tr-TR') : 'Bilinmiyor'}</div>
                    <div>ğŸ‘¤ YÃ¼kleyen: ${data.uploadedBy || 'Bilinmiyor'}</div>
                    <div>ğŸ“± Versiyon: ${data.appVersion || 'Bilinmiyor'}</div>
                `;
            } else {
                infoEl.style.display = 'block';
                infoEl.style.background = 'rgba(255,152,0,0.2)';
                infoEl.style.color = '#ffcc80';
                infoEl.innerHTML = 'âš ï¸ HenÃ¼z orijinal ayarlar Firestore\'a yÃ¼klenmemiÅŸ. Ã–nce "Orijinal AyarlarÄ± Firestore\'a YÃ¼kle" butonunu kullanÄ±n.';
            }
        } catch(e) {
            console.error('Orijinal ayarlar bilgisi yÃ¼klenemedi:', e);
        }
    }
    
    // ========== FABRÄ°KA AYARLARI SONU ==========
    
    // ========== GITHUB API FONKSÄ°YONLARI ==========
    
    // GitHub token input'unu gÃ¶ster/gizle
    function toggleGithubTokenInput() {
        const section = document.getElementById('githubTokenSection');
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    // GitHub token'Ä± kaydet (Firestore'a)
    async function saveGithubToken() {
        const token = document.getElementById('githubTokenInput').value.trim();
        if (!token) {
            showToast('âŒ Token boÅŸ olamaz');
            return;
        }
        
        try {
            // Firestore'a kaydet
            await db.collection('settings').doc('github_config').set({
                token: token,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser ? currentUser.email : 'Sistem'
            });
            
            GITHUB_CONFIG.token = token;
            showToast('âœ… GitHub token Firestore\'a kaydedildi');
            closeModal('appSettingsModal');
            setTimeout(() => openAppSettingsModal('update'), 300);
        } catch(e) {
            console.error('Token kaydetme hatasÄ±:', e);
            showToast('âŒ Token kaydedilemedi: ' + e.message);
        }
    }
    
    // GitHub'daki mevcut manifest.json'u al
    async function fetchCurrentManifest() {
        try {
            const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/manifest.json?t=${Date.now()}`;
            const res = await fetch(url, { cache: 'no-store' });
            const manifest = await res.json();
            
            const versionDisplay = document.getElementById('publishedVersionDisplay');
            if (versionDisplay) {
                versionDisplay.textContent = manifest.version || 'Bilinmiyor';
            }
            
            // Build number otomatik artÄ±r
            const buildInput = document.getElementById('settingBuildNumber');
            if (buildInput) {
                buildInput.value = (manifest.buildNumber || 0) + 1;
            }
            
            // Versiyon otomatik artÄ±r
            const versionInput = document.getElementById('settingNewVersion');
            if (versionInput && !versionInput.value) {
                versionInput.value = incrementVersion(manifest.version || APP_VERSION);
            }
            
            return manifest;
        } catch(e) {
            console.error('Manifest yÃ¼klenemedi:', e);
            const versionDisplay = document.getElementById('publishedVersionDisplay');
            if (versionDisplay) {
                versionDisplay.textContent = 'YÃ¼klenemedi';
            }
            return null;
        }
    }
    
    // GitHub dosyasÄ±nÄ±n SHA'sÄ±nÄ± al
    async function getGithubFileSha(filePath) {
        try {
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}?ref=${GITHUB_CONFIG.branch}`;
            const res = await fetch(url, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                return data.sha;
            }
            return null;
        } catch(e) {
            console.error('SHA alÄ±namadÄ±:', e);
            return null;
        }
    }
    
    // GitHub'a dosya yÃ¼kle/gÃ¼ncelle
    async function updateGithubFile(filePath, content, commitMessage) {
        try {
            const sha = await getGithubFileSha(filePath);
            
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
            
            const body = {
                message: commitMessage,
                content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
                branch: GITHUB_CONFIG.branch
            };
            
            if (sha) {
                body.sha = sha;
            }
            
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'GitHub API hatasÄ±');
            }
            
            return await res.json();
        } catch(e) {
            console.error('GitHub dosya gÃ¼ncelleme hatasÄ±:', e);
            throw e;
        }
    }
    
    // GitHub'a gÃ¼ncelleme yayÄ±nla
    async function publishUpdateToGithub() {
        if (!requirePermission('app_settings', 'gÃ¼ncelleme yayÄ±nlamak')) return;
        
        // Token kontrolÃ¼
        if (!GITHUB_CONFIG.token) {
            showToast('âŒ Ã–nce GitHub token girmelisiniz!');
            toggleGithubTokenInput();
            return;
        }
        
        const newVersion = document.getElementById('settingNewVersion').value.trim();
        let buildNumber = parseInt(document.getElementById('settingBuildNumber').value) || 0;
        const changelog = document.getElementById('settingChangelog').value.trim().split('\n').filter(l => l.trim());
        const forceUpdate = document.getElementById('settingForceUpdate').checked;
        
        if (!newVersion) {
            showToast('âŒ Versiyon numarasÄ± girilmeli');
            return;
        }
        
        // Build number yoksa manifest'ten al ve artÄ±r
        if (!buildNumber) {
            try {
                const manifest = await fetchCurrentManifest();
                buildNumber = (manifest?.buildNumber || 210) + 1;
            } catch(e) {
                buildNumber = 213; // Fallback
            }
        }
        
        // Onay iste
        if (!confirm(`ğŸš€ GÃœNCELLEME YAYINLA\n\nVersiyon: ${newVersion}\nBuild: ${buildNumber}\n\nBu gÃ¼ncelleme TÃœM kullanÄ±cÄ±lara gÃ¶nderilecek.\n\nDevam etmek istiyor musunuz?`)) {
            return;
        }
        
        try {
            showToast('â³ GitHub\'a yÃ¼kleniyor...');
            
            // manifest.json iÃ§eriÄŸi
            const manifestContent = JSON.stringify({
                version: newVersion,
                buildNumber: buildNumber,
                minBuildNumber: 150,
                releaseDate: new Date().toISOString().split('T')[0],
                changelog: changelog,
                required: forceUpdate
            }, null, 4);
            
            // manifest.json'u gÃ¼ncelle
            await updateGithubFile('manifest.json', manifestContent, `v${newVersion}: GÃ¼ncelleme yayÄ±nlandÄ±`);
            
            showToast('ğŸ‰ GÃ¼ncelleme baÅŸarÄ±yla yayÄ±nlandÄ±: v' + newVersion);
            
            // NOT: ArtÄ±k Firestore'a yazmÄ±yoruz - sadece GitHub manifest kullanÄ±lÄ±yor
            // Bu sayede versiyon karmaÅŸasÄ± Ã¶nleniyor
            
            // Versiyonu gÃ¼ncelle
            const versionDisplay = document.getElementById('publishedVersionDisplay');
            if (versionDisplay) {
                versionDisplay.textContent = newVersion;
            }
            
            // ModalÄ± kapat
            setTimeout(() => closeModal('appSettingsModal'), 1500);
            
        } catch(e) {
            console.error('âŒ GÃ¼ncelleme yayÄ±nlama hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // ========== GITHUB API SONU ==========
    
    // AyarlarÄ± kaydet
    async function saveAppSettings(category) {
        if (!requirePermission('app_settings', 'uygulama ayarlarÄ±nÄ± kaydetmek')) return;
        
        try {
            if (!appSettingsData) appSettingsData = { ...defaultAppSettings };
            
            switch(category) {
                case 'popup':
                    appSettingsData.popup = {
                        enabled: document.getElementById('settingPopupEnabled').checked,
                        title: document.getElementById('settingPopupTitle').value.trim(),
                        message: document.getElementById('settingPopupMessage').value.trim(),
                        buttonText: document.getElementById('settingPopupButtonText').value.trim(),
                        buttonUrl: document.getElementById('settingPopupButtonUrl').value.trim(),
                        bgColor: document.getElementById('settingPopupBgColor').value,
                        borderColor: document.getElementById('settingPopupBorderColor').value,
                        showOnce: document.getElementById('settingPopupShowOnce').checked
                    };
                    appSettingsData.announcement = {
                        enabled: document.getElementById('settingAnnouncementEnabled').checked,
                        text: document.getElementById('settingAnnouncementText').value.trim(),
                        link: document.getElementById('settingAnnouncementLink').value.trim(),
                        bgColor: document.getElementById('settingAnnouncementBgColor').value,
                        textColor: document.getElementById('settingAnnouncementTextColor').value
                    };
                    break;
                    
                case 'maintenance':
                    const wasEnabled = appSettingsData.maintenance?.enabled;
                    const isEnabled = document.getElementById('settingMaintenanceEnabled').checked;
                    
                    appSettingsData.maintenance = {
                        enabled: isEnabled,
                        title: document.getElementById('settingMaintenanceTitle').value.trim(),
                        message: document.getElementById('settingMaintenanceMessage').value.trim(),
                        estimatedTime: document.getElementById('settingMaintenanceTime').value.trim()
                    };
                    
                    if (isEnabled && !wasEnabled) {
                        showToast('ğŸ”’ BakÄ±m modu AKTÄ°F edildi!');
                    } else if (!isEnabled && wasEnabled) {
                        showToast('ğŸ”“ BakÄ±m modu kapatÄ±ldÄ±');
                    }
                    break;
            }
            
            // GÃ¼ncelleme bilgisi ekle
            appSettingsData.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
            appSettingsData.updatedBy = currentUser?.email || 'Unknown';
            
            // Firestore'a kaydet
            await db.collection('settings').doc('appConfig').set(appSettingsData, { merge: true });
            
            // AyarlarÄ± uygula
            applyAppSettings();
            updateAppSettingsUI();
            
            if (category !== 'update' && category !== 'maintenance') {
                showToast('âœ… Ayarlar kaydedildi!');
            }
            
            closeModal('appSettingsModal');
            
        } catch(e) {
            console.error('Ayar kaydetme hatasÄ±:', e);
            showToast('âŒ Kaydetme hatasÄ±: ' + e.message);
        }
    }
    
    // Versiyon numarasÄ±nÄ± artÄ±r
    function incrementVersion(version) {
        const parts = version.split('.');
        if (parts.length >= 3) {
            parts[2] = (parseInt(parts[2]) + 1).toString();
        }
        return parts.join('.');
    }
    
    // GÃ¼ncelleme bildirimini test et (Ã¶nizleme)
    function testUpdateNotification() {
        const version = document.getElementById('settingNewVersion').value.trim() || incrementVersion(APP_VERSION);
        const changelog = document.getElementById('settingChangelog').value.trim().split('\n').filter(l => l.trim());
        
        showUpdateNotification({
            version: version,
            changelog: changelog.length > 0 ? changelog : ['Test bildirimi']
        });
        
        closeModal('appSettingsModal');
        showToast('ğŸ‘ï¸ GÃ¼ncelleme bildirimi Ã¶nizlemesi gÃ¶sterildi');
    }
    
    // GÃ¼ncelleme bildirimini kaldÄ±r
    async function clearUpdateNotification() {
        // NOT: GÃ¼ncelleme sistemi artÄ±k sadece GitHub manifest kullanÄ±yor
        // Bildirimi kaldÄ±rmak iÃ§in GitHub'daki manifest.json'u gÃ¼ncellemeniz gerekiyor
        showToast('â„¹ï¸ GÃ¼ncelleme bildirimi GitHub manifest.json Ã¼zerinden yÃ¶netiliyor', 4000);
        closeModal('appSettingsModal');
    }
    
    // Kurulum modallarÄ± listesini gÃ¶ster
    async function loadSetupModalsList() {
        await loadSetupModals();
        
        const container = document.getElementById('setupModalsList');
        if (!container) return;
        
        if (Object.keys(setupModals).length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #888;">
                    <div style="font-size: 30px; margin-bottom: 10px;">ğŸ“–</div>
                    <div>HenÃ¼z kurulum modalÄ± oluÅŸturulmadÄ±</div>
                    <div style="font-size: 11px; margin-top: 5px;">â• Yeni Modal butonuna tÄ±klayarak oluÅŸturun</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        Object.entries(setupModals).forEach(([id, modal]) => {
            const stepCount = modal.steps?.length || 0;
            html += `
                <div style="background: rgba(103,58,183,0.15); border: 1px solid rgba(103,58,183,0.3); border-radius: 10px; padding: 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-size: 14px; font-weight: bold; color: #fff;">${modal.title || id}</div>
                            <div style="font-size: 11px; color: #888; margin-top: 3px;">
                                <span style="background: rgba(103,58,183,0.3); padding: 2px 6px; border-radius: 4px; margin-right: 5px;">${id}</span>
                                <span>${stepCount} adÄ±m</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button onclick="previewSavedModal('${id}')" style="background: #2196F3; border: none; color: #fff; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">ğŸ‘ï¸</button>
                            <button onclick="editSetupModal('${id}')" style="background: #FF9800; border: none; color: #fff; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">âœï¸</button>
                            <button onclick="deleteSetupModal('${id}')" style="background: #f44336; border: none; color: #fff; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">ğŸ—‘ï¸</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Kurulum modal editÃ¶rÃ¼nÃ¼ aÃ§
    function openSetupModalEditor(modalId = null) {
        editingModalId = modalId;
        editingModalSteps = [];
        
        // Form alanlarÄ±nÄ± temizle
        document.getElementById('setupModalId').value = '';
        document.getElementById('setupModalTitle').value = '';
        document.getElementById('setupModalIntroVideo').value = '';
        document.getElementById('setupModalApkLabel').value = '';
        document.getElementById('setupModalApkUrl').value = '';
        document.getElementById('setupModalCompatibility').value = '';
        document.getElementById('setupModalGuideTitle').value = '';
        document.getElementById('setupModalGuideVideo').value = '';
        document.getElementById('setupModalGuideDesc').value = '';
        document.getElementById('setupModalWarnings').value = '';
        document.getElementById('setupModalSuccessTitle').value = 'Kurulum TamamlandÄ±!';
        document.getElementById('setupModalSuccessDesc').value = 'ArtÄ±k hileyi kullanabilirsiniz.';
        
        if (modalId && setupModals[modalId]) {
            // DÃ¼zenleme modu
            const modal = setupModals[modalId];
            document.getElementById('setupModalEditorTitle').textContent = 'âœï¸ Modal DÃ¼zenle: ' + modalId;
            document.getElementById('setupModalId').value = modalId;
            document.getElementById('setupModalId').disabled = true;
            document.getElementById('setupModalTitle').value = modal.title || '';
            document.getElementById('setupModalIntroVideo').value = modal.introVideo || '';
            document.getElementById('setupModalApkLabel').value = modal.apkButton?.label || '';
            document.getElementById('setupModalApkUrl').value = modal.apkButton?.url || '';
            document.getElementById('setupModalCompatibility').value = (modal.compatibility || []).join('\\n');
            document.getElementById('setupModalGuideTitle').value = modal.guideSection?.title || '';
            document.getElementById('setupModalGuideVideo').value = modal.guideSection?.video || '';
            document.getElementById('setupModalGuideDesc').value = modal.guideSection?.description || '';
            document.getElementById('setupModalWarnings').value = (modal.warnings || []).join('\\n');
            document.getElementById('setupModalSuccessTitle').value = modal.successMessage?.title || 'Kurulum TamamlandÄ±!';
            document.getElementById('setupModalSuccessDesc').value = modal.successMessage?.description || '';
            editingModalSteps = [...(modal.steps || [])];
        } else {
            // Yeni modal
            document.getElementById('setupModalEditorTitle').textContent = 'ğŸ“– Yeni Kurulum ModalÄ±';
            document.getElementById('setupModalId').disabled = false;
        }
        
        renderSetupModalSteps();
        openModal('setupModalEditorModal');
    }
    
    // Modal dÃ¼zenleme
    function editSetupModal(modalId) {
        openSetupModalEditor(modalId);
    }
    
    // AdÄ±mlarÄ± render et
    function renderSetupModalSteps() {
        const container = document.getElementById('setupModalStepsList');
        if (!container) return;
        
        if (editingModalSteps.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 15px; color: #888; font-size: 12px;">HenÃ¼z adÄ±m eklenmedi</div>`;
            return;
        }
        
        let html = '';
        editingModalSteps.forEach((step, index) => {
            const colors = ['#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63', '#4CAF50', '#FF5722', '#607D8B'];
            const color = colors[index % colors.length];
            
            html += `
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">${index + 1}</div>
                        <input type="text" value="${step.title || ''}" onchange="updateModalStep(${index}, 'title', this.value)" class="auth-input" placeholder="AdÄ±m baÅŸlÄ±ÄŸÄ±" style="flex: 1; margin: 0; padding: 6px 10px; font-size: 12px;">
                        <button onclick="removeModalStep(${index})" style="background: #f44336; border: none; color: #fff; width: 24px; height: 24px; border-radius: 6px; cursor: pointer; font-size: 10px;">âœ•</button>
                    </div>
                    <textarea onchange="updateModalStep(${index}, 'description', this.value)" class="auth-input" placeholder="AdÄ±m aÃ§Ä±klamasÄ±" style="margin: 0; padding: 6px 10px; font-size: 11px; height: 50px; resize: none;">${step.description || ''}</textarea>
                    <div style="display: flex; gap: 5px; margin-top: 5px;">
                        <button onclick="moveModalStep(${index}, -1)" style="background: rgba(255,255,255,0.1); border: none; color: #aaa; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;" ${index === 0 ? 'disabled' : ''}>â¬†ï¸</button>
                        <button onclick="moveModalStep(${index}, 1)" style="background: rgba(255,255,255,0.1); border: none; color: #aaa; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;" ${index === editingModalSteps.length - 1 ? 'disabled' : ''}>â¬‡ï¸</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // AdÄ±m ekle
    function addSetupModalStep() {
        editingModalSteps.push({
            title: '',
            description: ''
        });
        renderSetupModalSteps();
    }
    
    // Modal AdÄ±m gÃ¼ncelle
    function updateModalStep(index, field, value) {
        if (editingModalSteps[index]) {
            editingModalSteps[index][field] = value;
        }
    }
    
    // Modal AdÄ±m sil
    function removeModalStep(index) {
        editingModalSteps.splice(index, 1);
        renderSetupModalSteps();
    }
    
    // Modal AdÄ±m taÅŸÄ±
    function moveModalStep(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= editingModalSteps.length) return;
        
        const temp = editingModalSteps[index];
        editingModalSteps[index] = editingModalSteps[newIndex];
        editingModalSteps[newIndex] = temp;
        renderSetupModalSteps();
    }
    
    // Modal kaydet
    async function saveSetupModal() {
        if (!requirePermission('modals', 'kurulum modalÄ± kaydetmek')) return;
        
        const id = document.getElementById('setupModalId').value.trim();
        const title = document.getElementById('setupModalTitle').value.trim();
        
        if (!id) {
            showToast('âŒ Modal ID girilmeli');
            return;
        }
        
        if (!title) {
            showToast('âŒ Modal baÅŸlÄ±ÄŸÄ± girilmeli');
            return;
        }
        
        // ID formatÄ± kontrol
        if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
            showToast('âŒ Modal ID sadece harf, rakam, - ve _ iÃ§erebilir');
            return;
        }
        
        // Modal verisini hazÄ±rla
        const modalData = {
            title: title,
            introVideo: document.getElementById('setupModalIntroVideo').value.trim() || null,
            apkButton: {
                label: document.getElementById('setupModalApkLabel').value.trim() || null,
                url: document.getElementById('setupModalApkUrl').value.trim() || null
            },
            compatibility: document.getElementById('setupModalCompatibility').value.trim().split('\\n').filter(s => s.trim()),
            guideSection: {
                title: document.getElementById('setupModalGuideTitle').value.trim() || null,
                video: document.getElementById('setupModalGuideVideo').value.trim() || null,
                description: document.getElementById('setupModalGuideDesc').value.trim() || null
            },
            steps: editingModalSteps.filter(s => s.title?.trim()),
            warnings: document.getElementById('setupModalWarnings').value.trim().split('\\n').filter(s => s.trim()),
            successMessage: {
                title: document.getElementById('setupModalSuccessTitle').value.trim() || 'Kurulum TamamlandÄ±!',
                description: document.getElementById('setupModalSuccessDesc').value.trim() || ''
            },
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.email
        };
        
        try {
            // Firestore'a kaydet
            setupModals[id] = modalData;
            await db.collection('settings').doc('setupModals').set({
                modals: setupModals,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast('âœ… Kurulum modalÄ± kaydedildi!');
            closeModal('setupModalEditorModal');
            loadSetupModalsList();
        } catch(e) {
            console.error('Modal kaydetme hatasÄ±:', e);
            showToast('âŒ Kaydetme hatasÄ±: ' + e.message);
        }
    }
    
    // Modal sil
    async function deleteSetupModal(modalId) {
        if (!requirePermission('modals', 'kurulum modalÄ± silmek')) return;
        
        if (!confirm('Bu kurulum modalÄ±nÄ± silmek istediÄŸinize emin misiniz?\\n\\nModal ID: ' + modalId)) {
            return;
        }
        
        try {
            delete setupModals[modalId];
            await db.collection('settings').doc('setupModals').set({
                modals: setupModals,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast('âœ… Modal silindi');
            loadSetupModalsList();
        } catch(e) {
            console.error('Modal silme hatasÄ±:', e);
            showToast('âŒ Silme hatasÄ±: ' + e.message);
        }
    }
    
    // Modal Ã¶nizle (editor'dan)
    function previewSetupModal() {
        const title = document.getElementById('setupModalTitle').value.trim() || 'Ã–nizleme';
        
        const modalData = {
            title: title,
            introVideo: document.getElementById('setupModalIntroVideo').value.trim() || null,
            apkButton: {
                label: document.getElementById('setupModalApkLabel').value.trim() || null,
                url: document.getElementById('setupModalApkUrl').value.trim() || null
            },
            compatibility: document.getElementById('setupModalCompatibility').value.trim().split('\\n').filter(s => s.trim()),
            guideSection: {
                title: document.getElementById('setupModalGuideTitle').value.trim() || null,
                video: document.getElementById('setupModalGuideVideo').value.trim() || null,
                description: document.getElementById('setupModalGuideDesc').value.trim() || null
            },
            steps: editingModalSteps.filter(s => s.title?.trim()),
            warnings: document.getElementById('setupModalWarnings').value.trim().split('\\n').filter(s => s.trim()),
            successMessage: {
                title: document.getElementById('setupModalSuccessTitle').value.trim() || 'Kurulum TamamlandÄ±!',
                description: document.getElementById('setupModalSuccessDesc').value.trim() || ''
            }
        };
        
        renderDynamicSetupModal(modalData);
    }
    
    // KaydedilmiÅŸ modal Ã¶nizle
    function previewSavedModal(modalId) {
        if (setupModals[modalId]) {
            renderDynamicSetupModal(setupModals[modalId]);
        } else {
            showToast('âŒ Modal bulunamadÄ±');
        }
    }
    
    // Dinamik modal aÃ§ (kurulum adÄ±mlarÄ±ndan)
    function openDynamicSetupModal(modalId) {
        if (setupModals[modalId]) {
            renderDynamicSetupModal(setupModals[modalId]);
        } else if (modalId === 'imguiModal') {
            // Geriye uyumluluk - eski IMGUI modal
            try {
                const latestCheat = gamesData?.[currentDynamicGame?.id]?.cheats?.[currentDynamicCheat?.id] || null;
                window.imguiApkUrlOverride = latestCheat?.apkUrl || currentDynamicCheat?.apkUrl || null;
            } catch (e) {
                window.imguiApkUrlOverride = null;
            }
            openModal('imguiModal');
        } else {
            showToast('âŒ Kurulum rehberi bulunamadÄ±');
        }
    }
    
    // Dinamik modal render
    function renderDynamicSetupModal(modalData) {
        const titleEl = document.getElementById('dynamicSetupModalTitle');
        const contentEl = document.getElementById('dynamicSetupModalContent');
        
        titleEl.textContent = modalData.title || 'ğŸ“– Kurulum Rehberi';
        
        let html = '';
        
        // TanÄ±tÄ±m videosu (YouTube URL desteÄŸi eklenmiÅŸtir)
        if (modalData.introVideo) {
            const introUrl = modalData.introVideo;
            const ytId = typeof extractYouTubeId === 'function' ? extractYouTubeId(introUrl) : null;

            if (ytId) {
                html += `
                    <div style="background: linear-gradient(135deg, rgba(156,39,176,0.2), rgba(103,58,183,0.2)); border: 1px solid rgba(156,39,176,0.4); border-radius: 15px; padding: 15px; margin-bottom: 20px;">
                        <div style="font-size: 16px; font-weight: bold; color: #E040FB; margin-bottom: 10px;">ğŸ¬ TanÄ±tÄ±m Videosu</div>
                        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px;">
                            <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
                        </div>
                    </div>
                `;
            } else {
                // VarsayÄ±lan: doÄŸrudan video dosyasÄ± (mp4 vb.)
                html += `
                    <div style="background: linear-gradient(135deg, rgba(156,39,176,0.2), rgba(103,58,183,0.2)); border: 1px solid rgba(156,39,176,0.4); border-radius: 15px; padding: 15px; margin-bottom: 20px;">
                        <div style="font-size: 16px; font-weight: bold; color: #E040FB; margin-bottom: 10px;">ğŸ¬ TanÄ±tÄ±m Videosu</div>
                        <video controls style="width: 100%; border-radius: 12px; max-height: 200px;">
                            <source src="${introUrl}" type="video/mp4">
                            TarayÄ±cÄ±nÄ±z video oynatmayÄ± desteklemiyor.
                        </video>
                    </div>
                `;
            }
        }
        
        // APK indirme butonu
        if (modalData.apkButton?.label && modalData.apkButton?.url) {
            html += `
                <button onclick="window.open('${modalData.apkButton.url}', '_blank')" class="btn btn-primary" style="margin-bottom: 20px; width: 100%;">
                    ğŸ“¥ ${modalData.apkButton.label}
                </button>
            `;
        }
        
        // Uyumluluk bilgisi
        if (modalData.compatibility?.length > 0) {
            html += `
                <div style="background: rgba(76,175,80,0.15); border: 1px solid rgba(76,175,80,0.4); border-radius: 12px; padding: 12px; margin-bottom: 20px;">
                    <div style="font-size: 14px; font-weight: bold; color: #4CAF50; margin-bottom: 8px;">âœ… Uyumluluk</div>
                    <div style="font-size: 12px; color: #aaa;">
                        ${modalData.compatibility.map(c => 'â€¢ ' + c).join('<br>')}
                    </div>
                </div>
            `;
        }
        
        // Rehber video bÃ¶lÃ¼mÃ¼ (YouTube URL desteÄŸi eklenmiÅŸtir)
        if (modalData.guideSection?.title && modalData.guideSection?.video) {
            const guideVideoUrl = modalData.guideSection.video;
            const guideYtId = typeof extractYouTubeId === 'function' ? extractYouTubeId(guideVideoUrl) : null;
            
            let guideVideoHtml = '';
            if (guideYtId) {
                // YouTube video
                guideVideoHtml = `
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px;">
                        <iframe src="https://www.youtube.com/embed/${guideYtId}?rel=0&autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top:0; left:0; width:100%; height:100%;"></iframe>
                    </div>
                `;
            } else {
                // Normal video dosyasÄ± (mp4 vb.)
                guideVideoHtml = `
                    <video controls style="width: 100%; border-radius: 12px; max-height: 200px;">
                        <source src="${guideVideoUrl}" type="video/mp4">
                        TarayÄ±cÄ±nÄ±z video oynatmayÄ± desteklemiyor.
                    </video>
                `;
            }
            
            html += `
                <div style="background: linear-gradient(135deg, rgba(255,152,0,0.2), rgba(244,67,54,0.2)); border: 1px solid rgba(255,152,0,0.4); border-radius: 15px; padding: 15px; margin-bottom: 20px;">
                    <div style="font-size: 16px; font-weight: bold; color: #FF9800; margin-bottom: 10px;">ğŸ” ${modalData.guideSection.title}</div>
                    ${modalData.guideSection.description ? `<div style="font-size: 12px; color: #ffcc80; margin-bottom: 10px;">${modalData.guideSection.description}</div>` : ''}
                    ${guideVideoHtml}
                </div>
            `;
        }
        
        // Kurulum adÄ±mlarÄ±
        if (modalData.steps?.length > 0) {
            html += `<div style="font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 15px;">ğŸ“‹ Kurulum AdÄ±mlarÄ±</div>`;
            
            const colors = [
                { bg: 'rgba(33,150,243,0.1)', border: 'rgba(33,150,243,0.3)', text: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3, #1976D2)' },
                { bg: 'rgba(255,152,0,0.1)', border: 'rgba(255,152,0,0.3)', text: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800, #F57C00)' },
                { bg: 'rgba(156,39,176,0.1)', border: 'rgba(156,39,176,0.3)', text: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' },
                { bg: 'rgba(0,188,212,0.1)', border: 'rgba(0,188,212,0.3)', text: '#00BCD4', gradient: 'linear-gradient(135deg, #00BCD4, #0097A7)' },
                { bg: 'rgba(233,30,99,0.1)', border: 'rgba(233,30,99,0.3)', text: '#E91E63', gradient: 'linear-gradient(135deg, #E91E63, #C2185B)' },
                { bg: 'rgba(76,175,80,0.1)', border: 'rgba(76,175,80,0.3)', text: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50, #388E3C)' }
            ];
            
            modalData.steps.forEach((step, index) => {
                const color = colors[index % colors.length];
                html += `
                    <div style="background: ${color.bg}; border: 1px solid ${color.border}; border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <div style="background: ${color.gradient}; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">${index + 1}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: bold; color: ${color.text}; margin-bottom: 4px;">${step.title}</div>
                                <div style="font-size: 12px; color: #aaa;">${step.description || ''}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        // UyarÄ±lar
        if (modalData.warnings?.length > 0) {
            html += `
                <div style="background: rgba(244,67,54,0.15); border: 1px solid rgba(244,67,54,0.4); border-radius: 12px; padding: 12px; margin-bottom: 15px;">
                    <div style="font-size: 14px; font-weight: bold; color: #f44336; margin-bottom: 8px;">âš ï¸ Ã–nemli UyarÄ±lar</div>
                    <div style="font-size: 12px; color: #ffcdd2;">
                        ${modalData.warnings.map(w => 'â€¢ ' + w).join('<br>')}
                    </div>
                </div>
            `;
        }
        
        // BaÅŸarÄ± mesajÄ±
        if (modalData.successMessage) {
            html += `
                <div style="background: linear-gradient(135deg, rgba(76,175,80,0.2), rgba(139,195,74,0.2)); border: 1px solid rgba(76,175,80,0.5); border-radius: 12px; padding: 15px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">âœ…</div>
                    <div style="font-size: 16px; font-weight: bold; color: #4CAF50; margin-bottom: 5px;">${modalData.successMessage.title}</div>
                    <div style="font-size: 12px; color: #aaa;">${modalData.successMessage.description || ''}</div>
                </div>
            `;
        }
        
        contentEl.innerHTML = html;
        openModal('dynamicSetupModal');
    }
    // ============ KURULUM MODALLARI SONU ============
    
    // Admin: Ã–deme ayarlarÄ±nÄ± yÃ¼kle
    async function loadPaymentSettingsAdmin() {
        if (!isAdmin()) return;
        
        try {
            const doc = await db.collection('settings').doc('paymentSettings').get();
            if (doc.exists) {
                const data = doc.data();
                if (data.bankInfo) {
                    document.getElementById('paymentBankName').value = data.bankInfo.name || '';
                    document.getElementById('paymentBankBank').value = data.bankInfo.bank || '';
                    document.getElementById('paymentBankIban').value = data.bankInfo.iban || '';
                }
                if (data.shopier) {
                    document.getElementById('paymentShopierUrl').value = data.shopier.storeUrl || '';
                }
                if (data.pushServer) {
                    document.getElementById('pushServerUrl').value = data.pushServer.url || 'https://push-server-psi.vercel.app';
                    document.getElementById('pushServerApiKey').value = data.pushServer.apiKey || 'thebestml_push_secret_2024';
                    // Global deÄŸiÅŸkenleri gÃ¼ncelle - SADECE geÃ§erli URL varsa
                    if (data.pushServer.url && data.pushServer.url.includes('push-server-psi')) {
                        PUSH_SERVER.url = data.pushServer.url;
                        PUSH_SERVER.apiKey = data.pushServer.apiKey || PUSH_SERVER.apiKey;
                    }
                }
            } else {
                // VarsayÄ±lan deÄŸerlerle doldur
                document.getElementById('paymentBankName').value = paymentSettings.bankInfo.name;
                document.getElementById('paymentBankBank').value = paymentSettings.bankInfo.bank;
                document.getElementById('paymentBankIban').value = paymentSettings.bankInfo.iban;
                document.getElementById('paymentShopierUrl').value = paymentSettings.shopier?.storeUrl || 'https://www.shopier.com/CheatsStore';
            }
            showToast('âœ… Ayarlar yÃ¼klendi');
        } catch(e) {
            console.error('Ayarlar yÃ¼klenemedi:', e);
            showToast('âŒ YÃ¼klenemedi: ' + e.message);
        }
    }
    
    // Admin: Ã–deme ayarlarÄ±nÄ± kaydet (SADECE KURUCU)
    async function savePaymentSettings() {
        if (!requirePermission('payments', 'Ã¶deme ayarlarÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        const name = document.getElementById('paymentBankName').value.trim();
        const bank = document.getElementById('paymentBankBank').value.trim();
        const iban = document.getElementById('paymentBankIban').value.trim();
        const shopierUrl = document.getElementById('paymentShopierUrl').value.trim();
        const pushUrl = document.getElementById('pushServerUrl').value.trim();
        const pushApiKey = document.getElementById('pushServerApiKey').value.trim();
        
        if (!name || !bank || !iban) {
            showToast('âŒ Banka bilgilerini doldurun');
            return;
        }
        
        try {
            const ibanClean = iban.replace(/\s/g, '');
            
            await db.collection('settings').doc('paymentSettings').set({
                bankInfo: {
                    name: name,
                    bank: bank,
                    iban: iban,
                    ibanClean: ibanClean
                },
                shopier: {
                    enabled: true,
                    storeUrl: shopierUrl || 'https://www.shopier.com/CheatsStore'
                },
                pushServer: {
                    url: pushUrl,
                    apiKey: pushApiKey
                },
                methods: paymentSettings.methods,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser.email
            }, { merge: true });
            
            // Local deÄŸiÅŸkenleri gÃ¼ncelle
            paymentSettings.bankInfo = { name, bank, iban, ibanClean };
            paymentSettings.shopier.storeUrl = shopierUrl || 'https://www.shopier.com/CheatsStore';
            
            // Push server ayarlarÄ±nÄ± gÃ¼ncelle
            PUSH_SERVER.url = pushUrl;
            PUSH_SERVER.apiKey = pushApiKey;
            
            showToast('âœ… Ayarlar kaydedildi!');
        } catch(e) {
            console.error('Ã–deme ayarlarÄ± kaydedilemedi:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Admin: Bildirim gÃ¶nder
    function updateNotifTarget() {
        const targetType = document.getElementById('notifTargetType').value;
        const emailDiv = document.getElementById('notifUserEmailDiv');
        emailDiv.style.display = targetType === 'user' ? 'block' : 'none';
    }
    
    async function sendNotification() {
        if (!requirePermission('notifications', 'bildirim gÃ¶ndermek')) return;
        
        const targetType = document.getElementById('notifTargetType').value;
        const userEmail = document.getElementById('notifUserEmail').value.trim().toLowerCase();
        const title = document.getElementById('notifTitle').value.trim();
        const message = document.getElementById('notifMessage').value.trim();
        const type = document.getElementById('notifType').value;
        
        if (!title) { showToast('âŒ BaÅŸlÄ±k girin'); return; }
        if (!message) { showToast('âŒ Mesaj girin'); return; }
        if (targetType === 'user' && !userEmail) { showToast('âŒ E-posta girin'); return; }

        // FCM ONLY: sadece push gÃ¶nder, Firestore/app-iÃ§i/native bildirim Ã¼retme
        if (type === 'fcm') {
            try {
                if (targetType === 'all') {
                    await sendPushToAll(title, message, { type: 'info' });
                    showToast('âœ… FCM push tÃ¼m kullanÄ±cÄ±lara gÃ¶nderildi!');
                } else {
                    const userDocs = await db.collection('users').where('email', '==', userEmail).get();
                    if (userDocs.empty) {
                        showToast('âŒ KullanÄ±cÄ± bulunamadÄ±');
                        return;
                    }

                    const userData = userDocs.docs[0].data();
                    if (!userData || !userData.fcmToken) {
                        showToast('âŒ KullanÄ±cÄ±nÄ±n FCM token\'Ä± yok');
                        return;
                    }

                    await sendPushNotification(userData.fcmToken, title, message, { type: 'info' });
                    showToast('âœ… FCM push kullanÄ±cÄ±ya gÃ¶nderildi!');
                }

                // Formu temizle
                document.getElementById('notifTitle').value = '';
                document.getElementById('notifMessage').value = '';
                document.getElementById('notifUserEmail').value = '';
                return;
            } catch (e) {
                console.error('âŒ FCM push gÃ¶nderme hatasÄ±:', e);
                showToast('âŒ Hata: ' + e.message);
                return;
            }
        }
        
        try {
            // Target deÄŸerini belirle (email normalize edildi)
            const targetValue = targetType === 'all' ? 'all' : userEmail;
            console.log('ğŸ“¤ Bildirim gÃ¶nderiliyor...', { targetType, targetValue, title, message, type });
            
            // notifiedAt ekleyerek realtime dinleyicinin yakalamasÄ±nÄ± saÄŸla
            const docRef = await db.collection('notifications').add({
                targetType: targetValue,
                targetEmail: targetType === 'user' ? userEmail : null,
                title,
                message,
                type,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser.email,
                read: false,
                notifiedAt: new Date().toISOString() // Realtime bildirim iÃ§in
            });
            
            console.log('âœ… Bildirim Firestore\'a kaydedildi:', docRef.id, 'Hedef:', targetValue);
            
            // GERÃ‡EK PUSH NOTIFICATION GÃ–NDER
            if (targetType === 'all') {
                // TÃ¼m kullanÄ±cÄ±lara push bildirim (topic)
                await sendPushToAll(title, message, { type: type });
                showToast('âœ… Bildirim tÃ¼m kullanÄ±cÄ±lara gÃ¶nderildi!');
            } else {
                // Belirli kullanÄ±cÄ±ya push bildirim
                const userDocs = await db.collection('users').where('email', '==', userEmail).get();
                if (!userDocs.empty) {
                    const userData = userDocs.docs[0].data();
                    if (userData.fcmToken) {
                        await sendPushNotification(userData.fcmToken, title, message, { type: type });
                        showToast('âœ… Push bildirim gÃ¶nderildi!');
                    } else {
                        showToast('âš ï¸ KullanÄ±cÄ±nÄ±n FCM token\'Ä± yok, sadece uygulama iÃ§i bildirim gÃ¶nderildi');
                    }
                } else {
                    showToast('âš ï¸ KullanÄ±cÄ± bulunamadÄ±, sadece Firestore\'a kaydedildi');
                }
            }
            
            // Admin kendisi iÃ§in de MERKEZÄ° BÄ°LDÄ°RÄ°M gÃ¶ster
            await showFullNotification({
                title: title,
                message: message,
                type: type,
                showPopup: true,
                playSound: true,
                showNative: true,
                vibrate: true
            });
            
            // Formu temizle
            document.getElementById('notifTitle').value = '';
            document.getElementById('notifMessage').value = '';
            document.getElementById('notifUserEmail').value = '';
            
        } catch(e) {
            console.error('âŒ Bildirim gÃ¶nderme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // SipariÅŸ onaylandÄ±ÄŸÄ±nda otomatik bildirim gÃ¶nder (MERKEZÄ° SÄ°STEM KULLANIR)
    async function sendOrderApprovalNotification(userEmail, keyCode, packageName) {
        try {
            console.log('ğŸ“© ========== SÄ°PARÄ°Å ONAY BÄ°LDÄ°RÄ°MÄ° ==========');
            console.log('ğŸ“© Hedef email:', userEmail);
            console.log('ğŸ“© Paket:', packageName);
            console.log('ğŸ“© Key:', keyCode);
            
            // Email'i kÃ¼Ã§Ã¼k harfe Ã§evir (eÅŸleÅŸme sorunu Ã¶nleme)
            const normalizedEmail = userEmail.toLowerCase().trim();
            
            const notifData = {
                targetType: normalizedEmail,
                targetEmail: normalizedEmail,  // Yedek alan
                title: 'ğŸ‰ SipariÅŸiniz OnaylandÄ±!',
                message: `${packageName} paketiniz aktif edildi. Key kodunuz: ${keyCode}`,
                type: 'order',
                keyCode: keyCode,
                packageName: packageName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser?.email || 'system',
                read: false,
                notifiedAt: new Date().toISOString() // Realtime bildirim iÃ§in zaman damgasÄ±
            };
            
            const notifRef = await db.collection('notifications').add(notifData);
            console.log('âœ… Firestore bildirimi kaydedildi! ID:', notifRef.id);
            
            // GERÃ‡EK PUSH NOTIFICATION GÃ–NDER (Vercel sunucu Ã¼zerinden)
            try {
                console.log('ğŸ” KullanÄ±cÄ± FCM token aranÄ±yor:', normalizedEmail);
                const userDocs = await db.collection('users').where('email', '==', normalizedEmail).get();
                console.log('ğŸ” Bulunan kullanÄ±cÄ± sayÄ±sÄ±:', userDocs.size);
                
                if (!userDocs.empty) {
                    const userData = userDocs.docs[0].data();
                    console.log('ğŸ” KullanÄ±cÄ± FCM token:', userData.fcmToken ? 'VAR' : 'YOK');
                    
                    if (userData.fcmToken) {
                        console.log('ğŸ“¤ Push server\'a istek gÃ¶nderiliyor...');
                        console.log('ğŸ“¤ URL:', PUSH_SERVER.url);
                        
                        const pushResult = await sendPushNotification(
                            userData.fcmToken,
                            'ğŸ‰ SipariÅŸiniz OnaylandÄ±!',
                            `${packageName} paketiniz aktif edildi. Key: ${keyCode}`,
                            { type: 'order_approved', keyCode: keyCode }
                        );
                        console.log('ğŸ“± Push notification sonucu:', pushResult);
                    } else {
                        console.log('âš ï¸ KullanÄ±cÄ±nÄ±n FCM token\'Ä± yok!');
                        showToast('âš ï¸ KullanÄ±cÄ±nÄ±n bildirim token\'Ä± yok, uygulama iÃ§i bildirim gÃ¶nderildi');
                    }
                } else {
                    console.log('âš ï¸ KullanÄ±cÄ± Firestore\'da bulunamadÄ±:', normalizedEmail);
                }
            } catch(pushErr) {
                console.error('âŒ Push bildirim hatasÄ±:', pushErr);
            }
            
            // Bu kullanÄ±cÄ± ÅŸu an online mÄ± kontrol et - Online ise MERKEZÄ° BÄ°LDÄ°RÄ°M gÃ¶nder
            if (currentUser && currentUser.email.toLowerCase() === normalizedEmail) {
                console.log('ğŸ“¢ KullanÄ±cÄ± online, MERKEZÄ° BÄ°LDÄ°RÄ°M gÃ¶nderiliyor...');
                
                await showFullNotification({
                    title: 'ğŸ‰ SipariÅŸiniz OnaylandÄ±!',
                    message: `${packageName} paketiniz aktif edildi!`,
                    type: 'order',
                    keyCode: keyCode,
                    showPopup: true,
                    playSound: true,
                    showNative: true,
                    vibrate: true,
                    updateBadge: true
                });
            }
            
            showToast('âœ… KullanÄ±cÄ±ya bildirim gÃ¶nderildi');
        } catch(e) {
            console.error('âŒ Bildirim gÃ¶nderme hatasÄ±:', e);
            showToast('âš ï¸ Bildirim gÃ¶nderilemedi: ' + e.message);
        }
    }
    
    // SipariÅŸ dinleyiciyi durdur
    function stopOrderListener() {
        if (orderListener) {
            orderListener();
            orderListener = null;
        }
        stopNotificationListener();
        stopKeyStatusListener();
        stopChatListener();
    }
    
    // ==================== CHAT SÄ°STEMÄ° ====================
    let chatListener = null;
    let userChatMessages = [];
    let currentAdminChatId = null;
    let adminChatListener = null;

    // Worker mode: support polling
    let supportUserPollInterval = null;
    let supportAdminPollInterval = null;

    // Destek: durum (aÃ§Ä±k/kapalÄ±) + gÃ¶rÃ¼ldÃ¼
    let supportPresenceInterval = null;
    let lastUserSupportSeenUpdateAt = 0;
    let lastAdminSupportSeenUpdateAt = 0;
    let userChatLastAdminSeenAtMs = 0;
    let userChatLastUserSeenAtMs = 0;
    let currentAdminChatLastUserSeenAtMs = 0;
    let currentAdminChatLastAdminSeenAtMs = 0;

    function getFirestoreTimeMs(value) {
        try {
            if (!value) return 0;
            if (value.toDate && typeof value.toDate === 'function') return value.toDate().getTime();
            if (typeof value === 'string' || typeof value === 'number') {
                const t = new Date(value).getTime();
                return isNaN(t) ? 0 : t;
            }
            if (typeof value === 'object' && value.seconds) {
                return (value.seconds * 1000) + Math.round((value.nanoseconds || 0) / 1e6);
            }
        } catch (e) {}
        return 0;
    }

    function isSupportWorkerEnabled() {
        try {
            return !!getSupportApiBase();
        } catch (e) {
            return false;
        }
    }

    function normalizeSupportMessages(messages) {
        return (Array.isArray(messages) ? messages : []).map((m) => ({
            sender: (m && m.sender === 'admin') ? 'admin' : 'user',
            message: (m && typeof m.message === 'string') ? m.message : '',
            image: (m && typeof m.image === 'string') ? m.image : '',
            adminRole: (m && typeof m.adminRole === 'string') ? m.adminRole : '',
            adminName: (m && typeof m.adminName === 'string') ? m.adminName : '',
            createdAt: (m && (m.createdAtMs || m.createdAt)) ? (m.createdAtMs || m.createdAt) : 0
        }));
    }

    async function setUserSupportPresence(isOpen) {
        try {
            // Presence is Firestore-only (disabled in Worker mode)
            if (isSupportWorkerEnabled()) return;
            if (!currentUser || !db) return;
            const payload = {
                userSupportOpen: !!isOpen,
                userSupportLastActiveAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (isOpen) payload.userSupportOpenAt = firebase.firestore.FieldValue.serverTimestamp();
            else payload.userSupportClosedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('chats').doc(currentUser.uid).set(payload, { merge: true });
        } catch (e) {}
    }

    function stopSupportPresenceInterval() {
        if (supportPresenceInterval) {
            clearInterval(supportPresenceInterval);
            supportPresenceInterval = null;
        }
    }

    function startSupportPresenceInterval() {
        // Firestore kota tÃ¼ketimini azaltmak iÃ§in periyodik presence yazÄ±mÄ± kapalÄ±.
        // Presence sadece aÃ§/kapat ve gerÃ§ek aktivite anlarÄ±nda gÃ¼ncellenir.
        stopSupportPresenceInterval();
    }

    async function markUserSupportSeen(force = false) {
        try {
            const now = Date.now();
            if (!force && (now - lastUserSupportSeenUpdateAt) < 4000) return;
            lastUserSupportSeenUpdateAt = now;

            if (isSupportWorkerEnabled()) {
                if (!currentUser) return;
                await workerApiFetch(getSupportApiBase(), '/v1/support/me/seen', { method: 'POST', body: {} });
                return;
            }

            if (!currentUser || !db) return;

            await db.collection('chats').doc(currentUser.uid).set({
                unreadUser: 0,
                lastUserSeenAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {}
    }

    async function markAdminSupportSeen(chatId, force = false) {
        try {
            const now = Date.now();
            if (!force && (now - lastAdminSupportSeenUpdateAt) < 4000) return;
            lastAdminSupportSeenUpdateAt = now;

            if (isSupportWorkerEnabled()) {
                if (!chatId) return;
                await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats/' + encodeURIComponent(chatId) + '/seen', { method: 'POST', body: {} });
                return;
            }

            if (!chatId || !db) return;

            await db.collection('chats').doc(chatId).set({
                unreadAdmin: 0,
                lastAdminSeenAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {}
    }

    function canCurrentAdminSeeChat(chat) {
        if (isOwner()) return true;
        if (!currentUser) return false;
        if (!chat) return false;

        const claimedBy = chat.claimedBy || null;
        const claimedByEmail = normalizeEmail(chat.claimedByEmail || '');

        // Unclaimed: visible to all admins
        if (!claimedBy && !claimedByEmail) return true;

        // Claimed: visible only to claimant
        if (claimedBy && currentUser.uid && claimedBy === currentUser.uid) return true;
        if (claimedByEmail && normalizeEmail(currentUser.email) === claimedByEmail) return true;

        return false;
    }

    async function claimSupportChat(chatId) {
        if (!requirePermission('support', 'destek mesajÄ±nÄ± devralmak')) return;
        if (!currentUser) return;

        try {
            if (isSupportWorkerEnabled()) {
                const res = await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats/' + encodeURIComponent(chatId) + '/claim', { method: 'POST', body: {} });
                const didClaim = !!(res && res.claimed);
                showToast(didClaim ? 'âœ… Sohbet devralÄ±ndÄ±' : 'âš ï¸ Sohbet zaten devralÄ±nmÄ±ÅŸ');
                if (didClaim) {
                    try { await incrementAdminStatField('claimedChatsCount', 1); } catch (e) {}
                }
                loadAdminChats();
                return;
            }

            const ref = db.collection('chats').doc(chatId);
            let didClaim = false;

            await db.runTransaction(async (tx) => {
                const snap = await tx.get(ref);
                if (!snap.exists) throw new Error('Sohbet bulunamadÄ±');
                const data = snap.data() || {};

                // Already claimed
                if (data.claimedBy || data.claimedByEmail) {
                    return;
                }

                tx.update(ref, {
                    claimedBy: currentUser.uid,
                    claimedByEmail: normalizeEmail(currentUser.email),
                    claimedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                didClaim = true;
            });

            showToast(didClaim ? 'âœ… Sohbet devralÄ±ndÄ±' : 'âš ï¸ Sohbet zaten devralÄ±nmÄ±ÅŸ');
            if (didClaim) {
                try { await incrementAdminStatField('claimedChatsCount', 1); } catch (e) {}
            }
            loadAdminChats();
        } catch (e) {
            showToast('âŒ Devralma hatasÄ±: ' + (e?.message || e));
        }
    }
    
    // KullanÄ±cÄ±: Chat dinleyici baÅŸlat
    function startChatListener() {
        if (!currentUser) return;
        stopChatListener();
        
        console.log('ğŸ’¬ Chat dinleyici baÅŸlatÄ±lÄ±yor... UID:', currentUser.uid);

        if (isSupportWorkerEnabled()) {
            const poll = async () => {
                try {
                    const res = await workerApiFetch(getSupportApiBase(), '/v1/support/me');
                    const ticket = res && res.ticket ? res.ticket : null;

                    const oldCount = userChatMessages.length;
                    userChatMessages = normalizeSupportMessages(res && res.messages ? res.messages : []);

                    updateChatBadge(ticket ? (ticket.unreadUser || 0) : 0);
                    userChatLastAdminSeenAtMs = ticket && ticket.lastAdminSeenAtMs ? Number(ticket.lastAdminSeenAtMs) : 0;
                    userChatLastUserSeenAtMs = ticket && ticket.lastUserSeenAtMs ? Number(ticket.lastUserSeenAtMs) : 0;

                    const modal = document.getElementById('userChatModal');
                    const isModalOpen = modal && modal.classList.contains('show');

                    if (isModalOpen) {
                        renderUserChatMessages();
                        scrollChatToBottom();

                        const lastMsg = userChatMessages[userChatMessages.length - 1];
                        if ((ticket && (ticket.unreadUser || 0) > 0) || (lastMsg && lastMsg.sender === 'admin')) {
                            markUserSupportSeen();
                        }
                    }

                    updateSidebarBadges();

                    if (userChatMessages.length > oldCount && ticket && (ticket.unreadUser || 0) > 0) {
                        const lastMsg = userChatMessages[userChatMessages.length - 1];
                        if (lastMsg && lastMsg.sender === 'admin' && !isModalOpen) {
                            showToast('ğŸ’¬ Yeni destek mesajÄ±!');
                            sendNativeNotification('ğŸ’¬ Yeni Destek MesajÄ±', lastMsg.message || 'Destek ekibinden yeni mesaj');
                        }
                    }
                } catch (e) {
                    console.error('Chat polling hatasÄ±:', e);
                }
            };

            poll();
            supportUserPollInterval = setInterval(poll, 8000);
            return;
        }
        
        chatListener = db.collection('chats').doc(currentUser.uid)
            .onSnapshot((doc) => {
                console.log('ğŸ’¬ Chat gÃ¼ncelleme alÄ±ndÄ±:', doc.exists, 'Zaman:', new Date().toLocaleTimeString());
                if (doc.exists) {
                    const data = doc.data();
                    const oldCount = userChatMessages.length;
                    const oldMessages = JSON.stringify(userChatMessages);
                    userChatMessages = data.messages || [];
                    const newMessages = JSON.stringify(userChatMessages);
                    
                    updateChatBadge(data.unreadUser || 0);

                    // GÃ¶rÃ¼ldÃ¼ timestamps
                    userChatLastAdminSeenAtMs = getFirestoreTimeMs(data.lastAdminSeenAt);
                    userChatLastUserSeenAtMs = getFirestoreTimeMs(data.lastUserSeenAt);
                    
                    console.log('ğŸ’¬ Mesaj sayÄ±sÄ±:', oldCount, '->', userChatMessages.length);
                    console.log('ğŸ’¬ DeÄŸiÅŸiklik var mÄ±:', oldMessages !== newMessages);
                    
                    // Modal aÃ§Ä±ksa MUTLAKA gÃ¼ncelle
                    const modal = document.getElementById('userChatModal');
                    const isModalOpen = modal && modal.classList.contains('show');
                    
                    console.log('ğŸ’¬ Modal aÃ§Ä±k mÄ±:', isModalOpen);
                    
                    if (isModalOpen) {
                        console.log('ğŸ’¬ Modal aÃ§Ä±k, mesajlar yenileniyor...');
                        renderUserChatMessages();
                        scrollChatToBottom();

                        // Modal aÃ§Ä±kken: gelen admin mesajlarÄ±nÄ± gÃ¶rÃ¼ldÃ¼ olarak iÅŸaretle
                        const lastMsg = userChatMessages[userChatMessages.length - 1];
                        if ((data.unreadUser || 0) > 0 || (lastMsg && lastMsg.sender === 'admin')) {
                            markUserSupportSeen();
                            setUserSupportPresence(true);
                        }
                    }
                    
                    // Sidebar badge'Ä± de gÃ¼ncelle
                    updateSidebarBadges();
                    
                    // Yeni mesaj geldiÄŸinde ve modal kapalÄ±ysa toast gÃ¶ster
                    if (userChatMessages.length > oldCount && data.unreadUser > 0) {
                        const lastMsg = userChatMessages[userChatMessages.length - 1];
                        if (lastMsg && lastMsg.sender === 'admin' && !isModalOpen) {
                            showToast('ğŸ’¬ Yeni destek mesajÄ±!');
                            // Native bildirim de gÃ¶nder
                            sendNativeNotification('ğŸ’¬ Yeni Destek MesajÄ±', lastMsg.message || 'Destek ekibinden yeni mesaj');
                        }
                    }
                } else {
                    userChatMessages = [];
                    updateChatBadge(0);
                }
            }, (error) => {
                console.error('Chat dinleyici hatasÄ±:', error);
                // Hata durumunda 5 saniye sonra tekrar dene
                setTimeout(() => {
                    console.log('ğŸ’¬ Chat dinleyici yeniden baÅŸlatÄ±lÄ±yor...');
                    startChatListener();
                }, 5000);
            });
    }
    
    // Chat'i en alta kaydÄ±r
    function scrollChatToBottom() {
        setTimeout(() => {
            const container = document.getElementById('userChatMessages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
    
    // Chat dinleyiciyi durdur
    function stopChatListener() {
        if (chatListener) {
            chatListener();
            chatListener = null;
        }
        if (adminChatListener) {
            adminChatListener();
            adminChatListener = null;
        }
        if (supportUserPollInterval) {
            clearInterval(supportUserPollInterval);
            supportUserPollInterval = null;
        }
        if (supportAdminPollInterval) {
            clearInterval(supportAdminPollInterval);
            supportAdminPollInterval = null;
        }
    }
    
    // Chat badge gÃ¼ncelle
    function updateChatBadge(count) {
        const badge = document.getElementById('chatBadge');
        if (!badge) return;
        
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // KullanÄ±cÄ±: Chat modalÄ±nÄ± aÃ§
    let chatRefreshInterval = null;
    
    async function openUserChatModal() {
        if (!currentUser) {
            showToast('âš ï¸ GiriÅŸ yapmanÄ±z gerekiyor');
            return;
        }

        const canProceed = await ensureBanRiskAccepted({ prompt: true, reason: 'DesteÄŸe yazmadan Ã¶nce lÃ¼tfen ban riski bilgilendirmesini onaylayÄ±n.' });
        if (!canProceed) return;
        
        // ModalÄ± aÃ§
        openModal('userChatModal');

        // Destek aÃ§Ä±k: presence + heartbeat
        setUserSupportPresence(true);
        
        // MesajlarÄ± Firestore'dan taze olarak Ã§ek
        await refreshUserChatMessages();
        
        // OkunmamÄ±ÅŸ mesajlarÄ± sÄ±fÄ±rla + gÃ¶rÃ¼ldÃ¼
        try {
            await markUserSupportSeen(true);
            updateChatBadge(0);
            updateSidebarBadges();
        } catch(e) {}
        
        // Input'a fokuslan
        setTimeout(() => {
            document.getElementById('userChatInput').focus();
        }, 300);
        
        // En alta kaydÄ±r
        scrollChatToBottom('userChatMessages');
    }

    // Destek FAQ (S.S.S)
    const SUPPORT_FAQ_ITEMS = [
        {
            q: 'Key kodu nasÄ±l girilir?',
            a: 'Profil menÃ¼sÃ¼nden â€œKey Kodu Girâ€ alanÄ±na girin ve size verilen key kodunu yazÄ±p onaylayÄ±n. Key aktif olunca â€œKey Durumuâ€ kartÄ±nda gÃ¶rÃ¼nÃ¼r.'
        },
        {
            q: 'SipariÅŸim ne zaman onaylanÄ±r?',
            a: 'SipariÅŸler â€œSipariÅŸlerimâ€ ekranÄ±nda bekleyen/onaylanan olarak gÃ¶rÃ¼nÃ¼r. Ã–deme kontrolÃ¼ sonrasÄ± onaylanÄ±r; yoÄŸunluk durumuna gÃ¶re sÃ¼re deÄŸiÅŸebilir.'
        },
        {
            q: 'Bildirim gelmiyor, ne yapmalÄ±yÄ±m?',
            a: 'Telefonunuzda uygulama bildirim izninin aÃ§Ä±k olduÄŸundan emin olun. BazÄ± cihazlarda pil tasarrufu/arka plan kÄ±sÄ±tlamalarÄ± bildirimleri engelleyebilir.'
        },
        {
            q: 'Kurulum rehberlerini nereden bulurum?',
            a: 'Oyun/hile detay sayfasÄ±nda â€œKurulum Rehberiâ€ bÃ¶lÃ¼mÃ¼nden ilgili rehberi aÃ§abilirsiniz.'
        },
        {
            q: 'Destek ekibine hÄ±zlÄ± bilgi nasÄ±l gÃ¶nderebilirim?',
            a: 'Destek mesaj alanÄ±ndaki â€œâ„¹ï¸ Otomatik Bilgiâ€ butonuna basÄ±n. Cihaz/sÃ¼rÃ¼m/key ve hesap bilgileri otomatik olarak mesaj alanÄ±na eklenir; ardÄ±ndan mesajÄ± gÃ¶nderin.'
        },
        {
            q: 'Ban riski nedir?',
            a: 'Uygulama iÃ§inde gÃ¶sterilen â€œBan Riski Bilgilendirmeâ€ metnini okuyup onayladÄ±ktan sonra satÄ±n alma/destek iÅŸlemlerine devam edebilirsiniz.'
        }
    ];

    function renderSupportFaq() {
        const el = document.getElementById('supportFaqList');
        if (!el) return;

        const items = Array.isArray(SUPPORT_FAQ_ITEMS) ? SUPPORT_FAQ_ITEMS : [];
        if (!items.length) {
            el.innerHTML = '<div style="color:#aaa; font-size:13px;">HenÃ¼z FAQ eklenmedi.</div>';
            return;
        }

        el.innerHTML = items.map((item) => {
            const q = escapeHtml((item?.q || '').toString());
            const a = escapeHtml((item?.a || '').toString()).replace(/\n/g, '<br>');
            return `
                <details style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                    <summary style="cursor: pointer; color: #fff; font-weight: bold; font-size: 14px;">${q}</summary>
                    <div style="margin-top: 10px; color: rgba(255,255,255,0.85); font-size: 13px; line-height: 1.55;">${a}</div>
                </details>
            `;
        }).join('');
    }

    function openSupportFaqModal() {
        try {
            renderSupportFaq();
            openModal('supportFaqModal');
        } catch (e) {
            console.log('FAQ modal aÃ§ma hatasÄ±:', e?.message || e);
        }
    }

    // Destek: Otomatik Bilgi (teÅŸhis metni)
    async function buildSupportAutoInfoText() {
        const lines = [];
        const now = new Date();

        lines.push('ğŸ“Œ Otomatik Bilgi');
        lines.push('Tarih: ' + now.toLocaleString());
        try {
            lines.push('SÃ¼rÃ¼m: ' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : 'unknown'));
        } catch (e) {
            lines.push('SÃ¼rÃ¼m: unknown');
        }

        // KullanÄ±cÄ±
        try {
            if (currentUser) {
                lines.push('UID: ' + (currentUser.uid || '-'));
                lines.push('Email: ' + (currentUser.email || '-'));
                lines.push('Telefon: ' + (currentUser.phoneNumber || '-'));
            } else {
                lines.push('UID: -');
                lines.push('Email: -');
                lines.push('Telefon: -');
            }
        } catch (e) {
            lines.push('UID: -');
            lines.push('Email: -');
            lines.push('Telefon: -');
        }

        // Platform / cihaz
        try {
            let platform = 'web';
            if (typeof Capacitor !== 'undefined' && Capacitor.getPlatform) {
                platform = Capacitor.getPlatform();
            }
            lines.push('Platform: ' + platform);
        } catch (e) {}

        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
                const devicePlugin = Capacitor?.Plugins?.Device;
                if (devicePlugin?.getInfo) {
                    const info = await devicePlugin.getInfo();
                    if (info) {
                        if (info.model) lines.push('Cihaz: ' + info.model);
                        if (info.operatingSystem || info.osVersion) {
                            const os = (info.operatingSystem || 'os') + (info.osVersion ? (' ' + info.osVersion) : '');
                            lines.push('OS: ' + os);
                        }
                        if (info.platform) lines.push('Device Platform: ' + info.platform);
                    }
                }
            } else {
                lines.push('UA: ' + (navigator.userAgent || '-'));
            }
        } catch (e) {
            // sessiz
        }

        // Sayfa
        try {
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id) {
                lines.push('Ekran: ' + activePage.id);
            }
        } catch (e) {}

        // FCM token (tam yazma: sadece prefix/uzunluk)
        try {
            const t = (typeof fcmToken !== 'undefined' && fcmToken) ? String(fcmToken) : '';
            if (t) {
                lines.push('FCM: var (len=' + t.length + ', prefix=' + t.substring(0, 12) + '...)');
            } else {
                lines.push('FCM: yok');
            }
        } catch (e) {
            lines.push('FCM: -');
        }

        // Key durumu (Firestore Ã¼zerinden kÄ±sa Ã¶zet)
        try {
            if (db && currentUser && currentUser.uid) {
                const doc = await db.collection('users').doc(currentUser.uid).get();
                if (doc.exists) {
                    const data = doc.data() || {};

                    // Profilde telefon tutuluyorsa ekle
                    const phoneFromProfile = data.phone || data.phoneNumber || data.telefon || data.tel || data.gsm || data.mobile || data.mobilePhone;
                    if (phoneFromProfile) {
                        lines.push('Telefon (profil): ' + phoneFromProfile);
                    }

                    const keys = Array.isArray(data.keys) ? data.keys : [];
                    const nowDt = new Date();
                    const active = keys
                        .map((k) => {
                            const exp = toDate(k?.expiresAt);
                            return { code: k?.code || '', expiresAt: exp };
                        })
                        .filter((k) => k.expiresAt && k.expiresAt > nowDt);
                    lines.push('Key: toplam=' + keys.length + ', aktif=' + active.length);
                    if (active.length) {
                        const nearest = active
                            .slice()
                            .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())[0];
                        lines.push('Key BitiÅŸ: ' + nearest.expiresAt.toLocaleString());
                    }
                } else {
                    lines.push('Key: kullanÄ±cÄ± dokÃ¼manÄ± yok');
                }
            }
        } catch (e) {
            // sessiz
        }

        lines.push('---');
        lines.push('Sorun:');
        lines.push('- (kÄ±saca yazÄ±nÄ±z)');

        return lines.join('\n');
    }

    async function insertSupportAutoInfo() {
        try {
            const input = document.getElementById('userChatInput');
            if (!input) return;
            const infoText = await buildSupportAutoInfoText();

            const current = (input.value || '').trim();
            input.value = current ? (input.value + '\n\n' + infoText) : infoText;
            input.focus();
        } catch (e) {
            showToast('âŒ Otomatik bilgi alÄ±namadÄ±');
            console.log('insertSupportAutoInfo hatasÄ±:', e?.message || e);
        }
    }
    
    // Chat mesajlarÄ±nÄ± yenile
    async function refreshUserChatMessages(silent = false) {
        try {
            if (isSupportWorkerEnabled()) {
                if (!currentUser) return;
                const res = await workerApiFetch(getSupportApiBase(), '/v1/support/me');
                const ticket = res && res.ticket ? res.ticket : null;

                const newMessages = normalizeSupportMessages(res && res.messages ? res.messages : []);
                const hasNewMessages = newMessages.length !== userChatMessages.length;
                userChatMessages = newMessages;

                userChatLastAdminSeenAtMs = ticket && ticket.lastAdminSeenAtMs ? Number(ticket.lastAdminSeenAtMs) : 0;
                userChatLastUserSeenAtMs = ticket && ticket.lastUserSeenAtMs ? Number(ticket.lastUserSeenAtMs) : 0;

                updateChatBadge(ticket ? (ticket.unreadUser || 0) : 0);
                updateSidebarBadges();

                if (!silent) {
                    console.log('ğŸ’¬ Modal aÃ§Ä±ldÄ±, mesajlar yÃ¼klendi:', userChatMessages.length);
                } else if (hasNewMessages) {
                    console.log('ğŸ’¬ Yeni mesaj algÄ±landÄ±, gÃ¼ncelleniyor...');
                }

                renderUserChatMessages();
                if (hasNewMessages) {
                    scrollChatToBottom('userChatMessages');
                }
                return;
            }

            const chatDoc = await db.collection('chats').doc(currentUser.uid).get();
            if (chatDoc.exists) {
                const chatData = chatDoc.data() || {};
                const newMessages = chatData.messages || [];
                const hasNewMessages = newMessages.length !== userChatMessages.length;
                userChatMessages = newMessages;

                userChatLastAdminSeenAtMs = getFirestoreTimeMs(chatData.lastAdminSeenAt);
                userChatLastUserSeenAtMs = getFirestoreTimeMs(chatData.lastUserSeenAt);
                
                if (!silent) {
                    console.log('ğŸ’¬ Modal aÃ§Ä±ldÄ±, mesajlar yÃ¼klendi:', userChatMessages.length);
                } else if (hasNewMessages) {
                    console.log('ğŸ’¬ Yeni mesaj algÄ±landÄ±, gÃ¼ncelleniyor...');
                }
                
                renderUserChatMessages();
                
                if (hasNewMessages) {
                    scrollChatToBottom('userChatMessages');
                }
            } else {
                userChatMessages = [];
                renderUserChatMessages();
            }
        } catch(e) {
            if (!silent) {
                console.error('Mesaj yÃ¼kleme hatasÄ±:', e);
            }
        }
    }
    
    // Chat refresh interval'Ä± durdur
    function stopChatRefreshInterval() {
        if (chatRefreshInterval) {
            clearInterval(chatRefreshInterval);
            chatRefreshInterval = null;
        }
    }
    
    // Tarih formatla helper
    function formatChatDate(createdAt) {
        let dateObj = null;
        if (createdAt?.toDate) {
            dateObj = createdAt.toDate();
        } else if (createdAt instanceof Date) {
            dateObj = createdAt;
        } else if (typeof createdAt === 'number') {
            dateObj = new Date(createdAt);
        } else if (typeof createdAt === 'string') {
            dateObj = new Date(createdAt);
        }
        
        if (!dateObj || isNaN(dateObj.getTime())) {
            return { date: '', time: '' };
        }
        
        return {
            date: dateObj.toLocaleDateString('tr-TR'),
            time: dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
    }

    function getSupportAppLogoAvatarHtml(size = 28) {
        const radius = Math.max(8, Math.round(size / 3));
        const base = 90;
        const scale = Math.max(0.2, Math.min(1, size / base));
        return `
            <div style="width:${size}px; height:${size}px; border-radius:${radius}px; overflow:hidden; background: rgba(0,0,0,0.25); box-shadow: 0 6px 16px rgba(0,0,0,0.35); flex-shrink: 0; position: relative;">
                <div style="position:absolute; left:50%; top:50%; transform: translate(-50%, -50%) scale(${scale}); transform-origin: center;">
                    <div class="app-logo-svg">
                        <div class="laser-g"></div>
                        <div class="laser-s"></div>
                        <div class="logo-impact"></div>
                        <span class="logo-letter-g">G</span>
                        <span class="logo-letter-s">S</span>
                    </div>
                </div>
            </div>
        `;
    }

    function getSupportUserAvatarHtml(size = 28) {
        const radius = Math.max(8, Math.round(size / 3));
        const photoUrl = arguments.length > 1 ? (arguments[1] || '') : '';
        if (photoUrl) {
            return `
                <img src="${photoUrl}" alt="Profil" style="width:${size}px; height:${size}px; border-radius:${radius}px; object-fit: cover; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); flex-shrink: 0;" />
            `;
        }
        const fontSize = Math.max(10, Math.round(size * 0.45));
        return `
            <div style="width:${size}px; height:${size}px; border-radius:${radius}px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; font-weight: 700; color:#fff; font-size:${fontSize}px; flex-shrink: 0;">ğŸ‘¤</div>
        `;
    }

    // Destek sohbeti: kullanÄ±cÄ± profil fotoÄŸrafÄ±nÄ± (varsa) al
    function getCurrentUserSupportAvatarUrl() {
        const img = document.getElementById('toggleBtnAvatar') || document.getElementById('profileAvatarImg');
        if (!img) return '';
        if (img.style && img.style.display === 'none') return '';
        const src = img.getAttribute('src') || img.src || '';
        return (src && src !== 'null' && src !== 'undefined') ? src : '';
    }

    // Admin tarafÄ±: aÃ§Ä±k olan sohbet kullanÄ±cÄ±sÄ±nÄ±n profil fotoÄŸrafÄ±nÄ± cache'le
    let supportProfilePhotoCache = {};
    let supportProfilePhotoLoading = {};
    let currentAdminChatUserId = '';
    let currentAdminChatUserPhoto = '';
    let lastAdminChatMessages = [];

    function ensureAdminChatUserProfilePhotoLoaded() {
        const uid = currentAdminChatUserId;
        if (isSupportWorkerEnabled()) {
            currentAdminChatUserPhoto = '';
            return;
        }
        if (!uid || !db) return;

        if (Object.prototype.hasOwnProperty.call(supportProfilePhotoCache, uid)) {
            currentAdminChatUserPhoto = supportProfilePhotoCache[uid] || '';
            return;
        }
        if (supportProfilePhotoLoading[uid]) return;

        supportProfilePhotoLoading[uid] = true;
        db.collection('users').doc(uid).get()
            .then((doc) => {
                const photo = (doc && doc.exists && doc.data && doc.data().profilePhoto) ? doc.data().profilePhoto : '';
                supportProfilePhotoCache[uid] = photo || '';
                currentAdminChatUserPhoto = supportProfilePhotoCache[uid] || '';
                if (Array.isArray(lastAdminChatMessages) && lastAdminChatMessages.length > 0) {
                    renderAdminChatMessages(lastAdminChatMessages);
                }
            })
            .catch(() => {
                supportProfilePhotoCache[uid] = '';
                currentAdminChatUserPhoto = '';
            })
            .finally(() => {
                supportProfilePhotoLoading[uid] = false;
            });
    }

    function getAdminChatUserSupportAvatarUrl() {
        ensureAdminChatUserProfilePhotoLoaded();
        return currentAdminChatUserPhoto || '';
    }
    
    // KullanÄ±cÄ±: MesajlarÄ± render et
    function renderUserChatMessages() {
        const container = document.getElementById('userChatMessages');
        const agentInfo = document.getElementById('supportAgentInfo');
        
        if (userChatMessages.length === 0) {
            // Bilgilendirme mesajÄ± gÃ¶ster
            container.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 60px; margin-bottom: 20px;">ğŸ§</div>
                    <div style="background: linear-gradient(135deg, rgba(0,188,212,0.15), rgba(0,151,167,0.1)); border: 1px solid rgba(0,188,212,0.3); border-radius: 15px; padding: 20px; margin-bottom: 15px;">
                        <div style="color: #00BCD4; font-weight: bold; font-size: 15px; margin-bottom: 10px;">ğŸ• En kÄ±sa zamanda bir yÃ¶neticimiz sizinle iletiÅŸime geÃ§ecek</div>
                        <div style="color: #aaa; font-size: 13px; line-height: 1.6;">LÃ¼tfen destek almak istediÄŸiniz konuyu detaylÄ± bir ÅŸekilde iletin. Ortalama yanÄ±t sÃ¼resi: <strong style="color: #4CAF50;">5-15 dakika</strong></div>
                    </div>
                    <div style="color: #666; font-size: 12px;">ğŸ’¡ MesajÄ±nÄ±zÄ± yazÄ±p gÃ¶nderin</div>
                </div>
            `;
            // Agent bilgisini gizle
            if (agentInfo) agentInfo.style.display = 'none';
            return;
        }
        
        // Admin mesajÄ± var mÄ± kontrol et ve son admin bilgisini al
        let lastAdminMsg = null;
        userChatMessages.forEach(msg => {
            if (msg.sender === 'admin') {
                lastAdminMsg = msg;
            }
        });
        
        // EÄŸer admin cevap verdiyse, rolÃ¼nÃ¼ gÃ¶ster
        if (lastAdminMsg && agentInfo) {
            const role = lastAdminMsg.adminRole || 'Admin';
            const adminName = lastAdminMsg.adminName || 'Destek Ekibi';
            const roleColors = {
                'Admin': '#FFD700',
                'Developer': '#00BCD4',
                'Moderator': '#9C27B0',
                'Support': '#4CAF50'
            };
            const roleColor = roleColors[role] || '#FFD700';
            agentInfo.innerHTML = `<span style="color: ${roleColor};">ğŸ‘¤ ${role}</span> â€¢ ${adminName}`;
            agentInfo.style.display = 'block';
        } else if (agentInfo) {
            agentInfo.style.display = 'none';
        }
        
        const currentUserPhoto = getCurrentUserSupportAvatarUrl();
        const lastUserMsgIndex = (() => {
            for (let i = userChatMessages.length - 1; i >= 0; i--) {
                if (userChatMessages[i] && userChatMessages[i].sender === 'user') return i;
            }
            return -1;
        })();
        let html = '';
        userChatMessages.forEach((msg, idx) => {
            const isUser = msg.sender === 'user';
            const { date, time } = formatChatDate(msg.createdAt);

            const role = msg.adminRole || 'Admin';
            const roleColors = {
                'Admin': '#FFD700',
                'Developer': '#00BCD4',
                'Moderator': '#9C27B0',
                'Support': '#4CAF50'
            };
            const roleColor = roleColors[role] || '#FFD700';
            const roleIcons = {
                'Admin': 'ğŸ‘‘',
                'Developer': 'ğŸ’»',
                'Moderator': 'ğŸ›¡ï¸',
                'Support': 'ğŸ§'
            };
            const roleIcon = roleIcons[role] || 'ğŸ‘‘';

            const avatarHtml = isUser ? getSupportUserAvatarHtml(28, currentUserPhoto) : getSupportAppLogoAvatarHtml(28);
            const bubbleStyle = isUser
                ? 'background: linear-gradient(135deg, #00BCD4, #0097A7);'
                : 'background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);';

            const senderLine = isUser
                ? ''
                : `<div style="display:flex; align-items:center; gap:6px; font-size: 11px; color: ${roleColor}; margin-bottom: 6px; font-weight: bold;">${roleIcon} ${role}</div>`;

            const createdMs = getFirestoreTimeMs(msg.createdAt);
            const isSeen = isUser && idx === lastUserMsgIndex && userChatLastAdminSeenAtMs > 0 && createdMs > 0 && userChatLastAdminSeenAtMs >= createdMs;
            const seenSuffix = isSeen ? ' â€¢ GÃ¶rÃ¼ldÃ¼' : '';

            html += `
                <div style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'}; margin-bottom: 12px;">
                    <div style="display:flex; flex-direction: ${isUser ? 'row-reverse' : 'row'}; align-items: flex-end; gap: 10px; width: 100%;">
                        ${avatarHtml}
                        <div style="max-width: 78%;">
                            <div style="${bubbleStyle} padding: 12px 14px; border-radius: ${isUser ? '16px 16px 6px 16px' : '16px 16px 16px 6px'}; box-shadow: 0 8px 18px rgba(0,0,0,0.25);">
                                ${senderLine}
                                ${msg.image ? `<img src="${msg.image}" style="max-width: 100%; border-radius: 10px; margin-bottom: 8px; cursor: pointer;" onclick="openImageFullscreen('${msg.image}')">` : ''}
                                ${msg.message ? `<div style="color: #fff; font-size: 14px; line-height: 1.55; word-break: break-word;">${escapeHtml(msg.message)}</div>` : ''}
                            </div>
                            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 6px; text-align: ${isUser ? 'right' : 'left'};">${date} ${time}${isUser ? seenSuffix : ''}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        scrollChatToBottom('userChatMessages');
    }
    
    // GÃ¶rsel tam ekran aÃ§
    function openImageFullscreen(src) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 20px;';
        overlay.onclick = () => overlay.remove();
        overlay.innerHTML = `
            <img src="${src}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px;">
            <button style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;">âœ•</button>
        `;
        document.body.appendChild(overlay);
    }
    
    // KullanÄ±cÄ± dosya Ã¶nizleme
    let userPendingFile = null;
    function previewUserFile(input) {
        const file = input.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('âŒ Dosya boyutu 5MB\'dan kÃ¼Ã§Ã¼k olmalÄ±');
            input.value = '';
            return;
        }
        
        userPendingFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('userFilePreviewImg').src = e.target.result;
            document.getElementById('userFileName').textContent = file.name;
            document.getElementById('userFileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
            document.getElementById('userFilePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    function clearUserFile() {
        userPendingFile = null;
        document.getElementById('userChatFile').value = '';
        document.getElementById('userFilePreview').style.display = 'none';
    }
    
    // KullanÄ±cÄ± sohbeti temizle
    async function clearUserChat() {
        if (!currentUser) return;
        
        if (!confirm('TÃ¼m mesajlar silinecek. Emin misiniz?')) return;
        
        try {
            if (isSupportWorkerEnabled()) {
                await workerApiFetch(getSupportApiBase(), '/v1/support/me', { method: 'DELETE' });
            } else {
                await db.collection('chats').doc(currentUser.uid).delete();
            }
            userChatMessages = [];
            renderUserChatMessages();
            showToast('âœ… Sohbet temizlendi');
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // KullanÄ±cÄ±: Mesaj gÃ¶nder
    async function sendUserMessage() {
        if (!currentUser) {
            showToast('âš ï¸ GiriÅŸ yapmanÄ±z gerekiyor');
            return;
        }
        
        const input = document.getElementById('userChatInput');
        const message = input.value.trim();
        
        // Mesaj veya dosya olmalÄ±
        if (!message && !userPendingFile) {
            showToast('âš ï¸ Mesaj yazÄ±n veya dosya seÃ§in');
            return;
        }
        
        const msgText = message;
        input.value = '';
        input.disabled = true;
        
        // Dosya varsa base64'e Ã§evir
        let imageData = null;
        if (userPendingFile) {
            try {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = () => reject(new Error('Dosya okunamadÄ±'));
                    reader.readAsDataURL(userPendingFile);
                });
            } catch(e) {
                showToast('âŒ Dosya yÃ¼klenemedi');
                input.disabled = false;
                return;
            }
        }
        
        // Ã–nce UI'da gÃ¶ster (optimistic update)
        const now = new Date();
        const newMessage = {
            sender: 'user',
            message: msgText,
            image: imageData,
            createdAt: now,
            read: false
        };
        
        userChatMessages.push(newMessage);
        renderUserChatMessages();
        clearUserFile(); // Dosya Ã¶nizlemeyi temizle
        
        try {
            const lastMsgPreview = msgText || 'ğŸ“· GÃ¶rsel';

            if (isSupportWorkerEnabled()) {
                await workerApiFetch(getSupportApiBase(), '/v1/support/messages', {
                    method: 'POST',
                    body: {
                        message: msgText || '',
                        image: imageData || ''
                    }
                });

                // Server timestamp + unread durumunu tazele
                try { await refreshUserChatMessages(true); } catch (e) {}
                input.disabled = false;
                input.focus();
                return;
            }

            const chatRef = db.collection('chats').doc(currentUser.uid);
            const chatDoc = await chatRef.get();
            
            if (chatDoc.exists) {
                // Mevcut sohbete ekle
                const existingMessages = chatDoc.data().messages || [];
                existingMessages.push(newMessage);
                
                await chatRef.update({
                    messages: existingMessages,
                    userEmail: currentUser.email,
                    userId: currentUser.uid,
                    lastMessage: lastMsgPreview,
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    unreadAdmin: firebase.firestore.FieldValue.increment(1)
                });
            } else {
                // Yeni sohbet oluÅŸtur
                await chatRef.set({
                    userEmail: currentUser.email,
                    userId: currentUser.uid,
                    messages: [newMessage],
                    lastMessage: lastMsgPreview,
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    unreadAdmin: 1,
                    unreadUser: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Admin'lere yeni destek mesajÄ± bildirimi gÃ¶nder
            try {
                await sendNewSupportMessageNotificationToAdmins(currentUser.uid, currentUser.email, lastMsgPreview);
            } catch (e) {}
            
        } catch(e) {
            console.error('Mesaj gÃ¶nderme hatasÄ±:', e);
            showToast('âŒ Mesaj gÃ¶nderilemedi: ' + e.message);
        }
        
        input.disabled = false;
        input.focus();
    }

    // Admin: sohbet listesinde email yoksa users/{uid} Ã¼zerinden Ã§Ã¶z
    const supportEmailCache = {};
    async function resolveSupportUserEmail(chatId, chatData) {
        const direct = (chatData && chatData.userEmail) ? String(chatData.userEmail) : '';
        if (direct) return direct;
        if (supportEmailCache[chatId]) return supportEmailCache[chatId];

        if (isSupportWorkerEnabled()) return '';

        try {
            const u = await db.collection('users').doc(chatId).get();
            if (u && u.exists) {
                const data = u.data() || {};
                const email = data.email || data.userEmail || '';
                if (email) {
                    supportEmailCache[chatId] = email;
                    // KalÄ±cÄ± dÃ¼zeltme: sohbet dokÃ¼manÄ±na da yaz
                    try {
                        await db.collection('chats').doc(chatId).set({ userEmail: email, userId: chatId }, { merge: true });
                    } catch (e) {}
                    return email;
                }
            }
        } catch (e) {}

        return '';
    }
    
    // Admin: TÃ¼m sohbetleri yÃ¼kle
    async function loadAdminChats() {
        if (!hasPermission('support')) {
            document.getElementById('adminChatsList').innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Bu Ã¶zellik iÃ§in yetkiniz yok</div>';
            return;
        }
        
        const container = document.getElementById('adminChatsList');
        const countBadge = document.getElementById('adminChatCount');
        
        try {
            if (isSupportWorkerEnabled()) {
                const res = await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats');
                const tickets = (res && Array.isArray(res.tickets)) ? res.tickets : [];

                let totalUnread = 0;
                let html = '';

                if (!tickets.length) {
                    html = '<div style="text-align: center; padding: 20px; color: #666;">HenÃ¼z mesaj yok</div>';
                } else {
                    for (const t of tickets) {
                        if (!canCurrentAdminSeeChat(t)) continue;

                        const unread = t.unreadAdmin || 0;
                        totalUnread += unread;
                        const lastTime = t.lastMessageAtMs ? new Date(t.lastMessageAtMs).toLocaleString('tr-TR') : '';

                        const claimedByEmail = normalizeEmail(t.claimedByEmail || '');
                        const isClaimed = !!claimedByEmail;
                        const isClaimedByMe = isClaimed && (claimedByEmail === normalizeEmail(currentUser?.email));

                        const claimInfo = isClaimed
                            ? `<div style="margin-top: 6px; font-size: 10px; color: rgba(255,255,255,0.55);">ğŸ¤ DevralÄ±ndÄ±${isClaimedByMe ? ' (Sizde)' : (isOwner() && claimedByEmail ? `: ${escapeHtml(claimedByEmail)}` : '')}</div>`
                            : '';

                        const claimButton = (!isClaimed)
                            ? `<button onclick="event.stopPropagation(); claimSupportChat('${t.id}')" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 4px 8px; border-radius: 8px; font-size: 11px; cursor: pointer;">ğŸ¤ Devral</button>`
                            : '';

                        const displayEmail = t.userEmail || t.id;

                        html += `
                            <div onclick="openAdminChat('${t.id}')" style="background: ${unread > 0 ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.05)'}; border-radius: 10px; padding: 12px; margin-bottom: 8px; cursor: pointer; border-left: 3px solid ${unread > 0 ? '#00BCD4' : 'transparent'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                                    <div style="font-weight: bold; color: #fff;">ğŸ‘¤ ${escapeHtml(displayEmail)}</div>
                                    <div style="display:flex; align-items:center; gap: 6px;">
                                        ${unread > 0 ? `<span style="background: #f44336; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${unread}</span>` : ''}
                                        ${claimButton}
                                    </div>
                                </div>
                                <div style="color: #aaa; font-size: 12px; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(t.lastMessage || '')}</div>
                                ${claimInfo}
                                <div style="color: #666; font-size: 10px; margin-top: 5px;">${lastTime}</div>
                            </div>
                        `;
                    }
                }

                container.innerHTML = html;
                countBadge.textContent = totalUnread;
                countBadge.style.display = totalUnread > 0 ? 'inline' : 'none';
                return;
            }

            const snapshot = await db.collection('chats')
                .orderBy('lastMessageAt', 'desc')
                .get();
            
            let totalUnread = 0;
            let html = '';
            
            if (snapshot.empty) {
                html = '<div style="text-align: center; padding: 20px; color: #666;">HenÃ¼z mesaj yok</div>';
            } else {
                for (const doc of snapshot.docs) {
                    const chat = doc.data() || {};

                    // Visibility: owner sees all, other admins see only unclaimed or claimed by themselves
                    if (!canCurrentAdminSeeChat(chat)) {
                        continue;
                    }
                    const unread = chat.unreadAdmin || 0;
                    totalUnread += unread;
                    
                    const lastTime = chat.lastMessageAt?.toDate ? chat.lastMessageAt.toDate().toLocaleString('tr-TR') : '';
                    
                    const claimedByEmail = normalizeEmail(chat.claimedByEmail || '');
                    const isClaimed = !!(chat.claimedBy || claimedByEmail);
                    const isClaimedByMe = isClaimed && (chat.claimedBy === currentUser?.uid || claimedByEmail === normalizeEmail(currentUser?.email));

                    const claimInfo = isClaimed
                        ? `<div style="margin-top: 6px; font-size: 10px; color: rgba(255,255,255,0.55);">ğŸ¤ DevralÄ±ndÄ±${isClaimedByMe ? ' (Sizde)' : (isOwner() && claimedByEmail ? `: ${escapeHtml(claimedByEmail)}` : '')}</div>`
                        : '';

                    const claimButton = (!isClaimed)
                        ? `<button onclick="event.stopPropagation(); claimSupportChat('${doc.id}')" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 4px 8px; border-radius: 8px; font-size: 11px; cursor: pointer;">ğŸ¤ Devral</button>`
                        : '';

                    const resolvedEmail = chat.userEmail || (await resolveSupportUserEmail(doc.id, chat)) || '';
                    const displayEmail = resolvedEmail || doc.id;

                    html += `
                        <div onclick="openAdminChat('${doc.id}')" style="background: ${unread > 0 ? 'rgba(0,188,212,0.15)' : 'rgba(255,255,255,0.05)'}; border-radius: 10px; padding: 12px; margin-bottom: 8px; cursor: pointer; border-left: 3px solid ${unread > 0 ? '#00BCD4' : 'transparent'};">
                            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                                <div style="font-weight: bold; color: #fff;">ğŸ‘¤ ${escapeHtml(displayEmail)}</div>
                                <div style="display:flex; align-items:center; gap: 6px;">
                                    ${unread > 0 ? `<span style="background: #f44336; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${unread}</span>` : ''}
                                    ${claimButton}
                                </div>
                            </div>
                            <div style="color: #aaa; font-size: 12px; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(chat.lastMessage || '')}</div>
                            ${claimInfo}
                            <div style="color: #666; font-size: 10px; margin-top: 5px;">${lastTime}</div>
                        </div>
                    `;
                }
            }
            
            container.innerHTML = html;
            countBadge.textContent = totalUnread;
            countBadge.style.display = totalUnread > 0 ? 'inline' : 'none';
            
        } catch(e) {
            container.innerHTML = '<div style="color: #f44336;">Hata: ' + e.message + '</div>';
        }
    }
    
    // Admin: Sohbet aÃ§
    async function openAdminChat(chatId) {
        if (!hasPermission('support')) return;
        
        currentAdminChatId = chatId;
        currentAdminChatUserId = chatId;
        currentAdminChatUserPhoto = '';
        
        try {
            if (isSupportWorkerEnabled()) {
                const loadAndRender = async () => {
                    const res = await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats/' + encodeURIComponent(chatId));
                    const ticket = res && res.ticket ? res.ticket : null;
                    if (!ticket) {
                        showToast('âŒ Sohbet bulunamadÄ±');
                        return null;
                    }

                    if (!canCurrentAdminSeeChat(ticket)) {
                        showToast('ğŸ”’ Bu sohbet baÅŸka bir admin tarafÄ±ndan devralÄ±ndÄ±');
                        currentAdminChatId = null;
                        loadAdminChats();
                        return null;
                    }

                    const displayEmail = ticket.userEmail || chatId;
                    document.getElementById('adminChatTitle').textContent = 'ğŸ’¬ ' + displayEmail;
                    document.getElementById('adminChatUserInfo').textContent = 'KullanÄ±cÄ± ID: ' + chatId;

                    currentAdminChatLastUserSeenAtMs = ticket.lastUserSeenAtMs ? Number(ticket.lastUserSeenAtMs) : 0;
                    currentAdminChatLastAdminSeenAtMs = ticket.lastAdminSeenAtMs ? Number(ticket.lastAdminSeenAtMs) : 0;

                    renderAdminChatMessages(normalizeSupportMessages(res && res.messages ? res.messages : []));
                    return ticket;
                };

                const ticket = await loadAndRender();
                if (!ticket) return;

                await markAdminSupportSeen(chatId, true);

                if (supportAdminPollInterval) {
                    clearInterval(supportAdminPollInterval);
                    supportAdminPollInterval = null;
                }

                supportAdminPollInterval = setInterval(async () => {
                    try {
                        const t = await loadAndRender();
                        if (!t) {
                            clearInterval(supportAdminPollInterval);
                            supportAdminPollInterval = null;
                            return;
                        }

                        const msgs = Array.isArray(lastAdminChatMessages) ? lastAdminChatMessages : [];
                        const lastMsg = msgs[msgs.length - 1];
                        if (lastMsg && lastMsg.sender === 'user') {
                            markAdminSupportSeen(chatId);
                        }
                    } catch (e) {
                        console.log('Admin chat polling hatasÄ±:', e?.message || e);
                    }
                }, 8000);

                openModal('adminChatModal');
                setTimeout(() => {
                    document.getElementById('adminChatInput').focus();
                }, 300);
                loadAdminChats();
                return;
            }

            const chatDoc = await db.collection('chats').doc(chatId).get();
            if (!chatDoc.exists) {
                showToast('âŒ Sohbet bulunamadÄ±');
                return;
            }
            
            const chat = chatDoc.data();

            const resolvedEmail = chat.userEmail || (await resolveSupportUserEmail(chatId, chat)) || '';
            const displayEmail = resolvedEmail || chatId;

            // Visibility guard: if another admin claimed it, non-owner admins cannot open
            if (!canCurrentAdminSeeChat(chat)) {
                showToast('ğŸ”’ Bu sohbet baÅŸka bir admin tarafÄ±ndan devralÄ±ndÄ±');
                currentAdminChatId = null;
                loadAdminChats();
                return;
            }
            
            // Header gÃ¼ncelle
            document.getElementById('adminChatTitle').textContent = 'ğŸ’¬ ' + displayEmail;
            document.getElementById('adminChatUserInfo').textContent = 'KullanÄ±cÄ± ID: ' + chatId;

            currentAdminChatLastUserSeenAtMs = getFirestoreTimeMs(chat.lastUserSeenAt);
            currentAdminChatLastAdminSeenAtMs = getFirestoreTimeMs(chat.lastAdminSeenAt);
            
            // MesajlarÄ± render et
            renderAdminChatMessages(chat.messages || []);
            
            // OkunmamÄ±ÅŸ mesajlarÄ± sÄ±fÄ±rla + gÃ¶rÃ¼ldÃ¼
            await markAdminSupportSeen(chatId, true);
            
            // Real-time listener baÅŸlat
            if (adminChatListener) adminChatListener();
            adminChatListener = db.collection('chats').doc(chatId)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data() || {};
                        if (!canCurrentAdminSeeChat(data)) {
                            // Devralma deÄŸiÅŸtiyse modalÄ± kapat
                            try { closeModal('adminChatModal'); } catch(e) {}
                            showToast('ğŸ”’ Sohbet devralÄ±ndÄ±');
                            if (adminChatListener) { adminChatListener(); adminChatListener = null; }
                            currentAdminChatId = null;
                            loadAdminChats();
                            return;
                        }

                        currentAdminChatLastUserSeenAtMs = getFirestoreTimeMs(data.lastUserSeenAt);
                        currentAdminChatLastAdminSeenAtMs = getFirestoreTimeMs(data.lastAdminSeenAt);
                        renderAdminChatMessages(data.messages || []);

                        // Admin sohbet ekranÄ± aÃ§Ä±kken: yeni kullanÄ±cÄ± mesajlarÄ±nÄ± gÃ¶rÃ¼ldÃ¼ olarak iÅŸaretle
                        const msgs = data.messages || [];
                        const lastMsg = msgs[msgs.length - 1];
                        if (lastMsg && lastMsg.sender === 'user') {
                            markAdminSupportSeen(chatId);
                        }
                    }
                });
            
            openModal('adminChatModal');
            
            // Input'a fokuslan
            setTimeout(() => {
                document.getElementById('adminChatInput').focus();
            }, 300);
            
            // Liste yenile
            loadAdminChats();
            
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Admin: MesajlarÄ± render et
    function renderAdminChatMessages(messages) {
        const container = document.getElementById('adminChatMessages');

        lastAdminChatMessages = Array.isArray(messages) ? messages : [];
        ensureAdminChatUserProfilePhotoLoaded();
        
        if (messages.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">HenÃ¼z mesaj yok</div>';
            return;
        }
        
        let html = '';
        const lastAdminMsgIndex = (() => {
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i] && messages[i].sender === 'admin') return i;
            }
            return -1;
        })();

        messages.forEach((msg, idx) => {
            const isAdmin = msg.sender === 'admin';
            const { date, time } = formatChatDate(msg.createdAt);

            const role = msg.adminRole || 'Admin';
            const roleColors = {
                'Admin': '#FFD700',
                'Developer': '#00BCD4',
                'Moderator': '#9C27B0',
                'Support': '#4CAF50'
            };
            const roleColor = roleColors[role] || '#FFD700';
            const roleIcons = {
                'Admin': 'ğŸ‘‘',
                'Developer': 'ğŸ’»',
                'Moderator': 'ğŸ›¡ï¸',
                'Support': 'ğŸ§'
            };
            const roleIcon = roleIcons[role] || 'ğŸ‘‘';

            const avatarHtml = isAdmin ? getSupportAppLogoAvatarHtml(28) : getSupportUserAvatarHtml(28, getAdminChatUserSupportAvatarUrl());
            const bubbleStyle = isAdmin
                ? 'background: linear-gradient(135deg, #673AB7, #512DA8);'
                : 'background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);';

            const senderLine = isAdmin
                ? `<div style="display:flex; align-items:center; gap:6px; font-size: 11px; color: ${roleColor}; margin-bottom: 6px; font-weight: bold;">${roleIcon} ${role}</div>`
                : `<div style="font-size: 11px; color: #00BCD4; margin-bottom: 6px; font-weight: bold;">ğŸ‘¤ KullanÄ±cÄ±</div>`;

            const createdMs = getFirestoreTimeMs(msg.createdAt);
            const isSeen = isAdmin && idx === lastAdminMsgIndex && currentAdminChatLastUserSeenAtMs > 0 && createdMs > 0 && currentAdminChatLastUserSeenAtMs >= createdMs;
            const seenSuffix = isSeen ? ' â€¢ GÃ¶rÃ¼ldÃ¼' : '';

            html += `
                <div style="display: flex; justify-content: ${isAdmin ? 'flex-end' : 'flex-start'}; margin-bottom: 12px;">
                    <div style="display:flex; flex-direction: ${isAdmin ? 'row-reverse' : 'row'}; align-items: flex-end; gap: 10px; width: 100%;">
                        ${avatarHtml}
                        <div style="max-width: 78%;">
                            <div style="${bubbleStyle} padding: 12px 14px; border-radius: ${isAdmin ? '16px 16px 6px 16px' : '16px 16px 16px 6px'}; box-shadow: 0 8px 18px rgba(0,0,0,0.25);">
                                ${senderLine}
                                ${msg.image ? `<img src="${msg.image}" style="max-width: 100%; border-radius: 10px; margin-bottom: 8px; cursor: pointer;" onclick="openImageFullscreen('${msg.image}')">` : ''}
                                ${msg.message ? `<div style="color: #fff; font-size: 14px; line-height: 1.55; word-break: break-word;">${escapeHtml(msg.message)}</div>` : ''}
                            </div>
                            <div style="font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 6px; text-align: ${isAdmin ? 'right' : 'left'};">${date} ${time}${isAdmin ? seenSuffix : ''}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        scrollChatToBottom('adminChatMessages');
    }
    
    // Admin dosya Ã¶nizleme
    let adminPendingFile = null;
    function previewAdminFile(input) {
        const file = input.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('âŒ Dosya boyutu 5MB\'dan kÃ¼Ã§Ã¼k olmalÄ±');
            input.value = '';
            return;
        }
        
        adminPendingFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('adminFilePreviewImg').src = e.target.result;
            document.getElementById('adminFileName').textContent = file.name;
            document.getElementById('adminFileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
            document.getElementById('adminFilePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    function clearAdminFile() {
        adminPendingFile = null;
        document.getElementById('adminChatFile').value = '';
        document.getElementById('adminFilePreview').style.display = 'none';
    }
    
    // Admin sohbeti temizle
    async function clearAdminChat() {
        if (!isAdmin() || !currentAdminChatId) return;
        
        if (!confirm('Bu kullanÄ±cÄ±nÄ±n tÃ¼m mesajlarÄ± silinecek. Emin misiniz?')) return;
        
        try {
            if (isSupportWorkerEnabled()) {
                await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats/' + encodeURIComponent(currentAdminChatId), { method: 'DELETE' });
            } else {
                await db.collection('chats').doc(currentAdminChatId).delete();
            }
            closeModal('adminChatModal');
            loadAdminChats();
            showToast('âœ… Sohbet temizlendi');
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Admin: Mesaj gÃ¶nder
    async function sendAdminMessage() {
        if (!requirePermission('support', 'destek mesajÄ± gÃ¶ndermek')) return;
        if (!currentAdminChatId) {
            showToast('âš ï¸ Sohbet seÃ§ilmedi');
            return;
        }
        
        const input = document.getElementById('adminChatInput');
        const message = input.value.trim();
        
        // Mesaj veya dosya olmalÄ±
        if (!message && !adminPendingFile) {
            showToast('âš ï¸ Mesaj yazÄ±n veya dosya seÃ§in');
            return;
        }
        
        const msgText = message;
        input.value = '';
        input.disabled = true;
        
        // Dosya varsa base64'e Ã§evir
        let imageData = null;
        if (adminPendingFile) {
            try {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = () => reject(new Error('Dosya okunamadÄ±'));
                    reader.readAsDataURL(adminPendingFile);
                });
            } catch(e) {
                showToast('âŒ Dosya yÃ¼klenemedi');
                input.disabled = false;
                return;
            }
        }
        
        clearAdminFile(); // Dosya Ã¶nizlemeyi temizle
        
        try {
            // Admin rolÃ¼nÃ¼ belirle
            const adminRoles = {
                'onurtenk0@gmail.com': { role: 'Kurucu', name: 'Onur' },
                'developer@cheatstore.com': { role: 'Developer', name: 'Developer' },
                'support@cheatstore.com': { role: 'Support', name: 'Destek' }
            };
            const adminInfo = adminRoles[currentUser.email] || { role: 'Admin', name: 'YÃ¶netici' };

            if (isSupportWorkerEnabled()) {
                await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats/' + encodeURIComponent(currentAdminChatId) + '/messages', {
                    method: 'POST',
                    body: {
                        message: msgText || '',
                        image: imageData || '',
                        adminRole: adminInfo.role,
                        adminName: adminInfo.name
                    }
                });

                showToast('âœ… Mesaj gÃ¶nderildi');
                try {
                    const res = await workerApiFetch(getSupportApiBase(), '/v1/admin/support/chats/' + encodeURIComponent(currentAdminChatId));
                    renderAdminChatMessages(normalizeSupportMessages(res && res.messages ? res.messages : []));
                } catch (e) {}

                input.disabled = false;
                input.focus();
                return;
            }

            const chatRef = db.collection('chats').doc(currentAdminChatId);
            const chatDoc = await chatRef.get();
            
            if (!chatDoc.exists) {
                showToast('âŒ Sohbet bulunamadÄ±');
                input.disabled = false;
                return;
            }
            
            const now = new Date();
            
            // Admin rolÃ¼nÃ¼ belirle (Firestore fallback)
            const adminInfoFb = adminInfo;
            
            const newMessage = {
                sender: 'admin',
                message: msgText,
                image: imageData,
                createdAt: now,
                read: false,
                adminRole: adminInfoFb.role,
                adminName: adminInfoFb.name,
                adminEmail: currentUser.email
            };
            
            const existingMessages = chatDoc.data().messages || [];
            existingMessages.push(newMessage);
            
            const lastMsgPreview = msgText || 'ğŸ“· GÃ¶rsel';
            
            await chatRef.update({
                messages: existingMessages,
                lastMessage: lastMsgPreview,
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                unreadUser: firebase.firestore.FieldValue.increment(1)
            });

            // KullanÄ±cÄ±ya tek seferlik bildirim (FCM + uygulama iÃ§i)
            try {
                const chatData = chatDoc.data() || {};
                const targetEmail = chatData.userEmail || '';
                const targetUserId = chatData.userId || currentAdminChatId;
                await sendSupportReplyNotificationToUser(targetUserId, targetEmail, lastMsgPreview, adminInfoFb);
            } catch (e) {}
            
            showToast('âœ… Mesaj gÃ¶nderildi');
            
        } catch(e) {
            console.error('Admin mesaj hatasÄ±:', e);
            showToast('âŒ Mesaj gÃ¶nderilemedi: ' + e.message);
        }
        
        input.disabled = false;
        input.focus();
    }
    
    // Chat scroll helper
    function scrollChatToBottom(containerId) {
        setTimeout(() => {
            const id = containerId || 'userChatMessages';
            const container = document.getElementById(id);
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
    
    // HTML escape helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ==================== CHAT SÄ°STEMÄ° SON ====================
    
    // ==================== SÃœRE UZATMA SÄ°STEMÄ° ====================
    let currentExtendData = null;
    let selectedExtendOption = null;
    
    // SÃ¼re uzatma modalÄ±nÄ± aÃ§
    function openExtendModal(keyId, gameName, cheatName, keyCode, expiryDate) {
        currentExtendData = {
            keyId: keyId,
            gameName: gameName,
            cheatName: cheatName,
            keyCode: keyCode,
            currentExpiry: new Date(expiryDate)
        };
        selectedExtendOption = null;
        
        // Modal bilgilerini doldur
        document.getElementById('extendGameName').textContent = gameName;
        document.getElementById('extendCheatName').textContent = cheatName;
        document.getElementById('extendKeyCode').textContent = keyCode;
        document.getElementById('extendCurrentExpiry').textContent = currentExtendData.currentExpiry.toLocaleDateString('tr-TR');
        
        // SeÃ§imleri sÄ±fÄ±rla
        document.querySelectorAll('.extend-option').forEach(opt => {
            opt.style.borderColor = 'rgba(255,255,255,0.1)';
            opt.style.background = 'rgba(255,255,255,0.05)';
        });
        document.getElementById('extendSummary').style.display = 'none';
        document.getElementById('extendPayBtn').disabled = true;
        document.getElementById('extendPayBtn').style.opacity = '0.5';
        document.getElementById('extendPayBtn').textContent = 'SÃ¼re seÃ§in';
        
        openModal('extendModal');
    }
    
    // SÃ¼re seÃ§eneÄŸi seÃ§
    function selectExtendOption(days, label, price) {
        selectedExtendOption = { days, label, price };
        
        // GÃ¶rsel seÃ§im
        document.querySelectorAll('.extend-option').forEach(opt => {
            opt.style.borderColor = 'rgba(255,255,255,0.1)';
            opt.style.background = 'rgba(255,255,255,0.05)';
        });
        event.currentTarget.style.borderColor = '#FF9800';
        event.currentTarget.style.background = 'rgba(255,152,0,0.15)';
        
        // Yeni bitiÅŸ tarihi hesapla
        const newExpiry = new Date(currentExtendData.currentExpiry);
        if (days >= 365) {
            newExpiry.setFullYear(newExpiry.getFullYear() + 10); // SÄ±nÄ±rsÄ±z = 10 yÄ±l
        } else {
            newExpiry.setDate(newExpiry.getDate() + days);
        }
        
        // Ã–zet bilgileri gÃ¼ncelle
        document.getElementById('extendSelectedDays').textContent = label;
        document.getElementById('extendNewExpiry').textContent = newExpiry.toLocaleDateString('tr-TR');
        document.getElementById('extendTotalPrice').textContent = price;
        document.getElementById('extendSummary').style.display = 'block';
        
        // Butonu aktif et
        document.getElementById('extendPayBtn').disabled = false;
        document.getElementById('extendPayBtn').style.opacity = '1';
        document.getElementById('extendPayBtn').textContent = 'ğŸ’³ Ã–demeye GeÃ§ - ' + price;
    }
    
    // Ã–deme sayfasÄ±na geÃ§
    // Ã–deme sayfasÄ±na geÃ§ (Merkezi sistemi kullan)
    function proceedExtendPayment() {
        if (!selectedExtendOption || !currentExtendData) {
            showToast('âš ï¸ Ã–nce sÃ¼re seÃ§in');
            return;
        }
        
        closeModal('extendModal');
        
        // Yeni bitiÅŸ tarihi hesapla
        const newExpiry = new Date(currentExtendData.currentExpiry);
        if (selectedExtendOption.days >= 365) {
            newExpiry.setFullYear(newExpiry.getFullYear() + 10);
        } else {
            newExpiry.setDate(newExpiry.getDate() + selectedExtendOption.days);
        }
        
        // Merkezi Ã¶deme sistemini kullan
        openUnifiedPaymentModal({
            type: 'extension',
            game: currentExtendData.gameName,
            cheat: currentExtendData.cheatName,
            keyCode: currentExtendData.keyCode,
            keyId: currentExtendData.keyId,
            package: selectedExtendOption.label,
            packageName: selectedExtendOption.label,
            price: selectedExtendOption.price,
            days: selectedExtendOption.days,
            currentExpiry: currentExtendData.currentExpiry,
            newExpiry: newExpiry
        });
    }
    
    // Eski havale fonksiyonlarÄ± - geriye uyumluluk iÃ§in tutuldu
    function previewExtendDekont(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('extendDekontImg').src = e.target.result;
                document.getElementById('extendDekontPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
    
    // SÃ¼re uzatma sipariÅŸi gÃ¶nder (eski modal iÃ§in - artÄ±k merkezi sistem kullanÄ±lÄ±yor)
    async function submitExtendOrder() {
        if (!currentUser) {
            showToast('âŒ GiriÅŸ yapmanÄ±z gerekiyor');
            return;
        }
        
        if (!currentExtendData || !selectedExtendOption) {
            showToast('âŒ SÃ¼re seÃ§imi yapÄ±lmadÄ±');
            return;
        }
        
        const fileInput = document.getElementById('extendDekontFile');
        if (!fileInput.files[0]) {
            showToast('âŒ Dekont fotoÄŸrafÄ± seÃ§in');
            return;
        }

        const dekontFile = fileInput.files[0];
        if (!dekontFile.type || !dekontFile.type.startsWith('image/')) {
            showToast('âŒ Sadece resim dosyasÄ± seÃ§in');
            return;
        }
        if (dekontFile.size > 10 * 1024 * 1024) {
            showToast('âŒ Dekont dosyasÄ± Ã§ok bÃ¼yÃ¼k (max 10MB)');
            return;
        }
        
        showToast('â³ SipariÅŸ gÃ¶nderiliyor...');
        
        try {
            // SipariÅŸ iÃ§in id Ã¼ret (Storage path iÃ§in)
            const orderRef = db.collection('orders').doc();
            const receipt = await prepareReceiptForOrder(dekontFile, { orderId: orderRef.id, userId: currentUser.uid });
            
            // Yeni bitiÅŸ tarihi hesapla
            const newExpiry = new Date(currentExtendData.currentExpiry);
            if (selectedExtendOption.days >= 365) {
                newExpiry.setFullYear(newExpiry.getFullYear() + 10);
            } else {
                newExpiry.setDate(newExpiry.getDate() + selectedExtendOption.days);
            }
            
            // SipariÅŸi kaydet
            await orderRef.set({
                userId: currentUser.uid,
                email: currentUser.email,
                userEmail: currentUser.email,
                type: 'extension', // SÃ¼re uzatma tipi
                game: currentExtendData.gameName,
                cheat: currentExtendData.cheatName,
                keyCode: currentExtendData.keyCode,
                keyId: currentExtendData.keyId,
                currentExpiry: currentExtendData.currentExpiry,
                extensionDays: selectedExtendOption.days,
                newExpiry: newExpiry,
                package: selectedExtendOption.label,
                packageName: `SÃ¼re Uzatma - ${selectedExtendOption.label}`,
                price: selectedExtendOption.price,
                dekontUrl: receipt.dekontUrl || null,
                dekontStoragePath: receipt.dekontStoragePath || null,
                dekont: receipt.dekontBase64 || null,
                paymentMethod: 'havale',
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Admin'lere yeni sipariÅŸ bildirimi gÃ¶nder
            try {
                await sendNewOrderNotificationToAdmins(
                    currentUser.email,
                    `SÃ¼re Uzatma - ${selectedExtendOption.label}`,
                    selectedExtendOption.price
                );
            } catch (e) {}
            
            // ModallarÄ± kapat
            closeModal('extendHavaleModal');
            
            // BaÅŸarÄ± mesajÄ±
            showOrderSuccessModal();
            showToast('âœ… SÃ¼re uzatma talebiniz alÄ±ndÄ±!');
            
        } catch(e) {
            console.error('SÃ¼re uzatma hatasÄ±:', e);
            const friendly = getFriendlyOrderErrorMessage(e);
            const detail = (typeof isAdmin === 'function' && isAdmin()) ? ` (Kod: ${e && e.code ? e.code : 'yok'})` : '';
            showToast('âŒ Hata: ' + friendly + detail);
        }
    }
    
    // ==================== SÃœRE UZATMA SÄ°STEMÄ° SON ====================

    // SipariÅŸ badge gÃ¼ncelle
    async function updateOrderBadge() {
        if (!currentUser) return;
        try {
            const orders = await db.collection('orders')
                .where('userId', '==', currentUser.uid)
                .where('status', '==', 'approved')
                .get();
            
            const badge = document.getElementById('myOrderBadge');
            const count = orders.size;
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        } catch(e) {}
    }
    
    // SipariÅŸlerimi yÃ¼kle
    async function loadMyOrders() {
        if (!currentUser) return;
        const container = document.getElementById('myOrdersList');
        
        try {
            const orders = await db.collection('orders')
                .where('userId', '==', currentUser.uid)
                .get();
            
            if (orders.empty) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 60px; margin-bottom: 15px;">ğŸ“­</div>
                        <div style="color: #aaa;">HenÃ¼z sipariÅŸ vermediniz</div>
                        <button class="btn btn-primary btn-small" onclick="openGameSelectModal()" style="margin-top: 15px;">ğŸ›’ SatÄ±n Al</button>
                    </div>
                `;
                return;
            }
            
            // Client-side sÄ±ralama
            let orderList = [];
            orders.forEach(doc => {
                orderList.push({ id: doc.id, ...doc.data() });
            });
            orderList.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            
            let html = '';
            orderList.forEach(o => {
                const date = o.createdAt.toDate().toLocaleString('tr-TR');
                let statusText = '', statusClass = '';
                
                if (o.status === 'pending') {
                    statusText = 'â³ Beklemede';
                    statusClass = 'pending';
                } else if (o.status === 'approved') {
                    statusText = 'âœ… OnaylandÄ±';
                    statusClass = 'approved';
                } else if (o.status === 'rejected') {
                    statusText = 'âŒ Reddedildi';
                    statusClass = 'rejected';
                }
                
                html += `
                    <div class="order-card ${statusClass}" id="order-${o.id}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <div style="font-weight: bold; font-size: 16px;">${o.packageName}</div>
                                <div style="color: #FFD700; font-size: 14px; margin-top: 3px;">${o.price}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span class="order-status ${statusClass}">${statusText}</span>
                                <button onclick="deleteOrder('${o.id}', '${o.packageName}', '${o.status}')" style="background: rgba(244,67,54,0.2); border: 1px solid #f44336; color: #f44336; padding: 4px 8px; border-radius: 8px; font-size: 11px; cursor: pointer;">ğŸ—‘ï¸</button>
                            </div>
                        </div>
                        <div style="font-size: 12px; color: #888; margin-bottom: 10px;">ğŸ“… ${date}</div>
                        ${o.status === 'approved' && o.keyCode ? `
                            <div style="background: rgba(76,175,80,0.2); border: 1px solid #4CAF50; border-radius: 10px; padding: 12px; margin-top: 10px;">
                                <div style="font-size: 11px; color: #aaa; margin-bottom: 5px;">ğŸ”‘ Key Kodunuz</div>
                                <div style="font-family: monospace; font-size: 14px; color: #4CAF50; word-break: break-all;">${o.keyCode}</div>
                                <button onclick="copyToClipboard('${o.keyCode}')" style="margin-top: 10px; background: #4CAF50; border: none; color: #fff; padding: 8px 15px; border-radius: 8px; font-size: 12px; cursor: pointer; width: 100%;">ğŸ“‹ Kopyala</button>
                            </div>
                        ` : ''}
                        ${o.status === 'rejected' && o.rejectReason ? `
                            <div style="background: rgba(244,67,54,0.2); border: 1px solid #f44336; border-radius: 10px; padding: 12px; margin-top: 10px;">
                                <div style="font-size: 11px; color: #aaa; margin-bottom: 5px;">âŒ Red Sebebi</div>
                                <div style="font-size: 13px; color: #f44336;">${o.rejectReason}</div>
                            </div>
                        ` : ''}
                        ${o.status === 'pending' ? `
                            <div style="background: rgba(255,152,0,0.2); border: 1px solid #FF9800; border-radius: 10px; padding: 12px; margin-top: 10px;">
                                <div style="font-size: 12px; color: #FF9800;">â³ Dekontunuz inceleniyor. OnaylandÄ±ÄŸÄ±nda bildirim alacaksÄ±nÄ±z.</div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            container.innerHTML = html;
        } catch(e) {
            container.innerHTML = '<div style="color: #f44336; text-align: center; padding: 20px;">Hata: ' + e.message + '</div>';
        }
    }
    
    // SipariÅŸ silme fonksiyonu
    async function deleteOrder(orderId, packageName, status) {
        let confirmMsg = `âš ï¸ "${packageName}" sipariÅŸini silmek istediÄŸinize emin misiniz?`;
        
        if (status === 'pending') {
            confirmMsg += '\n\nâš ï¸ Bu sipariÅŸ henÃ¼z beklemede! Silmek isterseniz dekontunuz iÅŸleme alÄ±nmayacak.';
        } else if (status === 'approved') {
            confirmMsg += '\n\nâœ… Bu sipariÅŸ onaylanmÄ±ÅŸ. Sadece kayÄ±t silinecek, key\'iniz aktif kalacak.';
        }
        
        confirmMsg += '\n\nBu iÅŸlem geri alÄ±namaz!';
        
        if (!confirm(confirmMsg)) return;
        
        try {
            showToast('â³ Siliniyor...');

            // Worker/D1 varsa Ã¶ncelik ver
            try { await loadRemoteRuntimeConfig(); } catch (e) {}
            const ordersApiBase = (typeof getOrdersApiBase === 'function') ? getOrdersApiBase() : '';
            if (ordersApiBase) {
                try { await workerApiFetch(ordersApiBase, '/v1/admin/orders/' + encodeURIComponent(id), { method: 'DELETE' }); } catch (e) {}
                try { await db.collection('approvedOrdersArchive').doc(id).delete(); } catch (e) {}
                showToast('âœ… SipariÅŸ silindi');
                try { loadMonthlyApprovedOrdersSummary(); } catch (e) {}
                return;
            }
            
            // Firebase'den sipariÅŸi sil
            await db.collection('orders').doc(orderId).delete();
            
            // KartÄ± animasyonlu kaldÄ±r
            const card = document.getElementById(`order-${orderId}`);
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    card.remove();
                    
                    // EÄŸer hiÃ§ sipariÅŸ kalmadÄ±ysa boÅŸ mesaj gÃ¶ster
                    const container = document.getElementById('myOrdersList');
                    if (container && container.children.length === 0) {
                        container.innerHTML = `
                            <div style="text-align: center; padding: 40px;">
                                <div style="font-size: 60px; margin-bottom: 15px;">ğŸ“­</div>
                                <div style="color: #aaa;">HenÃ¼z sipariÅŸ vermediniz</div>
                                <button class="btn btn-primary btn-small" onclick="openGameSelectModal()" style="margin-top: 15px;">ğŸ›’ SatÄ±n Al</button>
                            </div>
                        `;
                    }
                }, 300);
            }
            
            showToast('âœ… SipariÅŸ silindi!');
            
            // Badge'i gÃ¼ncelle
            updateOrderBadge();
        } catch(e) {
            console.error('SipariÅŸ silme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // SipariÅŸ badge'ini gÃ¼ncelle
    async function updateOrderBadge() {
        if (!currentUser) return;
        try {
            const orders = await db.collection('orders')
                .where('userId', '==', currentUser.uid)
                .where('status', '==', 'pending')
                .get();
            
            const badge = document.getElementById('myOrderBadge');
            if (badge) {
                if (orders.size > 0) {
                    badge.textContent = orders.size;
                    badge.style.display = 'inline';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch(e) {
            console.error('Badge gÃ¼ncelleme hatasÄ±:', e);
        }
    }
    
    // Clipboard copy
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('ğŸ“‹ KopyalandÄ±!');
        }).catch(() => {
            showToast('âŒ Kopyalama baÅŸarÄ±sÄ±z');
        });
    }
    
    // Admin - Ãœyenin key'ini sil (keys_delete yetkisi gerekli)
    async function adminDeleteUserKey(userId, keyIndex, keyCode, keyType) {
        if (!requirePermission('keys_delete', 'key silmek')) return;
        
        const confirmMsg = keyType === 'expired' 
            ? `SÃ¼resi dolmuÅŸ key'i silmek istiyor musunuz?\n${keyCode}`
            : `âš ï¸ DÄ°KKAT: Aktif key'i silmek istiyor musunuz?\n${keyCode}`;
            
        if (!confirm(confirmMsg)) return;
        
        try {
            showToast('â³ Key siliniyor...');
            
            // KullanÄ±cÄ±nÄ±n verilerini al
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                showToast('âŒ KullanÄ±cÄ± bulunamadÄ±');
                return;
            }
            
            const userData = userDoc.data();
            let keys = userData.keys || [];
            let activityLog = userData.activityLog || [];
            
            // Silinecek key'i bul
            const deletedKey = keys[keyIndex];
            if (!deletedKey) {
                showToast('âŒ Key bulunamadÄ±');
                return;
            }
            
            // Activity log'a ekle
            activityLog.push({
                type: 'key_deleted',
                keyCode: deletedKey.keyCode || deletedKey.code || keyCode,
                game: deletedKey.game || 'Bilinmiyor',
                cheat: deletedKey.cheat || 'Bilinmiyor',
                days: deletedKey.days || 0,
                expiresAt: deletedKey.expiresAt,
                deletedAt: new Date(),
                deletedBy: 'admin',
                reason: keyType === 'expired' ? 'Admin tarafÄ±ndan sÃ¼resi dolmuÅŸ key silindi' : 'Admin tarafÄ±ndan aktif key silindi'
            });
            
            // Key'i listeden Ã§Ä±kar
            keys.splice(keyIndex, 1);
            
            // VeritabanÄ±nÄ± gÃ¼ncelle
            await db.collection('users').doc(userId).update({
                keys: keys,
                activityLog: activityLog
            });
            
            showToast('âœ… Key silindi!');
            
            // Modal'Ä± yeniden yÃ¼kle
            openUserDetail(userId);
            
        } catch(e) {
            console.error('Admin key silme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Åifre gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼nÃ¼ deÄŸiÅŸtir
    let passwordVisible = false;
    function togglePasswordVisibility(password) {
        const field = document.getElementById('userPasswordField');
        if (!field) return;
        
        passwordVisible = !passwordVisible;
        if (passwordVisible) {
            field.textContent = password;
            field.style.color = '#4CAF50';
        } else {
            field.textContent = 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢';
            field.style.color = '#FF9800';
        }
    }
    
    // Admin - Ãœyenin tÃ¼m sÃ¼resi dolmuÅŸ keylerini sil
    async function adminDeleteAllExpiredKeys(userId) {
        if (!isAdmin()) { showToast('âŒ Yetkiniz yok'); return; }
        
        if (!confirm('TÃ¼m sÃ¼resi dolmuÅŸ keyleri silmek istiyor musunuz?')) return;
        
        try {
            showToast('â³ Keyler siliniyor...');
            
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                showToast('âŒ KullanÄ±cÄ± bulunamadÄ±');
                return;
            }
            
            const userData = userDoc.data();
            let keys = userData.keys || [];
            let activityLog = userData.activityLog || [];
            const now = new Date();
            
            // Expired keyleri bul ve logla
            const expiredKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() <= now);
            
            expiredKeys.forEach(key => {
                activityLog.push({
                    type: 'key_deleted',
                    keyCode: key.keyCode || key.code || '***',
                    game: key.game || 'Bilinmiyor',
                    cheat: key.cheat || 'Bilinmiyor',
                    days: key.days || 0,
                    expiresAt: key.expiresAt,
                    deletedAt: new Date(),
                    deletedBy: 'admin',
                    reason: 'Admin tarafÄ±ndan sÃ¼resi dolmuÅŸ keyler toplu silindi'
                });
            });
            
            // Sadece aktif keyleri tut
            const activeKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() > now);
            
            await db.collection('users').doc(userId).update({
                keys: activeKeys,
                activityLog: activityLog
            });
            
            showToast(`âœ… ${expiredKeys.length} key silindi!`);
            openUserDetail(userId);
            
        } catch(e) {
            console.error('Admin toplu key silme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Admin - Ãœyeyi tamamen sil
    async function deleteUser(userId, email) {
        if (!requirePermission('members_edit', 'Ã¼ye silmek')) return;
        
        // Kurucu kendini silemez
        if (isOwnerEmail(email)) {
            showToast('âŒ Kurucu hesabÄ± silinemez!');
            return;
        }
        
        // Ã‡ift onay iste
        if (!confirm(`âš ï¸ DÄ°KKAT!\n\n"${email}" kullanÄ±cÄ±sÄ±nÄ± silmek Ã¼zeresiniz.\n\nBu iÅŸlem geri alÄ±namaz!\n\nDevam etmek istiyor musunuz?`)) return;
        
        if (!confirm(`ğŸ”´ SON UYARI!\n\nBu Ã¼yenin TÃœM verileri silinecek:\n- TÃ¼m keyler\n- TÃ¼m sipariÅŸler\n- Aktivite geÃ§miÅŸi\n\nEmin misiniz?`)) return;
        
        try {
            showToast('â³ Ãœye siliniyor...');
            
            // 1. Ãœyenin sipariÅŸlerini sil
            const ordersSnapshot = await db.collection('orders').where('userId', '==', userId).get();
            const batch = db.batch();
            
            ordersSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            // 2. Ãœyeyi sil
            batch.delete(db.collection('users').doc(userId));
            
            // Batch iÅŸlemini uygula
            await batch.commit();
            
            showToast(`âœ… "${email}" silindi!`);
            
            // Modal'Ä± kapat ve listeyi yenile
            closeModal('userDetailModal');
            loadAllUsers();
            
        } catch(e) {
            console.error('Ãœye silme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }

    function updateAuthUI() {
        const loggedOut = document.getElementById('loggedOutCard');
        const loggedIn = document.getElementById('loggedInCard');
        const adminBtn = document.getElementById('adminBtn');
        if (currentUser) {
            loggedOut.style.display = 'none';
            loggedIn.style.display = 'block';
            document.getElementById('userEmail').textContent = currentUser.email;
            if (isAdmin()) {
                adminBtn.style.display = 'block';
            } else {
                adminBtn.style.display = 'none';
            }
        } else {
            loggedOut.style.display = 'block';
            loggedIn.style.display = 'none';
        }
        
        // Profil sidebar UI'Ä±nÄ± da gÃ¼ncelle
        updateProfilePanelUI();
    }
    
    async function loginUser() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        if (!email || !password) { showToast('âŒ TÃ¼m alanlarÄ± doldurun'); return; }
        try {
            showToast('â³ GiriÅŸ yapÄ±lÄ±yor...');
            await auth.signInWithEmailAndPassword(email, password);
            
            // Beni hatÄ±rla
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
                localStorage.setItem('remembered_password', btoa(password)); // Basit ÅŸifreleme
                localStorage.setItem('remember_me', 'true');
            } else {
                localStorage.removeItem('remembered_email');
                localStorage.removeItem('remembered_password');
                localStorage.removeItem('remember_me');
            }
            
            showToast('âœ… GiriÅŸ baÅŸarÄ±lÄ±!');
            navigateTo('homePage');
        } catch (e) {
            showToast('âŒ ' + (e.code === 'auth/invalid-credential' ? 'HatalÄ± e-posta veya ÅŸifre' : e.message));
        }
    }
    
    // Sayfa yÃ¼klendiÄŸinde hatÄ±rlanan bilgileri doldur
    function loadRememberedCredentials() {
        const remembered = localStorage.getItem('remember_me');
        if (remembered === 'true') {
            const email = localStorage.getItem('remembered_email');
            const password = localStorage.getItem('remembered_password');
            if (email && password) {
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = atob(password);
                document.getElementById('rememberMe').checked = true;
            }
        }
    }
    
    // Åifre sÄ±fÄ±rlama fonksiyonu
    async function sendPasswordReset() {
        const email = document.getElementById('forgotEmail').value.trim();
        const resetBtn = document.getElementById('resetBtn');
        const successMsg = document.getElementById('resetSuccessMsg');
        
        if (!email) {
            showToast('âŒ E-posta adresinizi girin');
            return;
        }
        
        // Email formatÄ± kontrolÃ¼
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('âŒ GeÃ§erli bir e-posta adresi girin');
            return;
        }
        
        try {
            resetBtn.disabled = true;
            resetBtn.innerHTML = 'â³ GÃ¶nderiliyor...';
            
            // Firebase ÅŸifre sÄ±fÄ±rlama e-postasÄ± gÃ¶nder
            await auth.sendPasswordResetEmail(email);
            
            // BaÅŸarÄ± mesajÄ±nÄ± gÃ¶ster
            successMsg.style.display = 'block';
            resetBtn.innerHTML = 'âœ… E-posta GÃ¶nderildi';
            resetBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            
            showToast('âœ… Åifre sÄ±fÄ±rlama e-postasÄ± gÃ¶nderildi!');
            
            // 3 saniye sonra butonu sÄ±fÄ±rla
            setTimeout(() => {
                resetBtn.disabled = false;
                resetBtn.innerHTML = 'ğŸ“¤ SÄ±fÄ±rlama BaÄŸlantÄ±sÄ± GÃ¶nder';
                resetBtn.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
            }, 5000);
            
        } catch (e) {
            resetBtn.disabled = false;
            resetBtn.innerHTML = 'ğŸ“¤ SÄ±fÄ±rlama BaÄŸlantÄ±sÄ± GÃ¶nder';
            
            // Hata mesajlarÄ±nÄ± TÃ¼rkÃ§eleÅŸtir
            let errorMsg = 'Bir hata oluÅŸtu';
            if (e.code === 'auth/user-not-found') {
                errorMsg = 'Bu e-posta ile kayÄ±tlÄ± kullanÄ±cÄ± bulunamadÄ±';
            } else if (e.code === 'auth/invalid-email') {
                errorMsg = 'GeÃ§ersiz e-posta adresi';
            } else if (e.code === 'auth/too-many-requests') {
                errorMsg = 'Ã‡ok fazla deneme yaptÄ±nÄ±z. LÃ¼tfen bekleyin.';
            }
            
            showToast('âŒ ' + errorMsg);
        }
    }
    
    async function registerUser() {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const password2 = document.getElementById('registerPassword2').value;
        if (!email || !password) { showToast('âŒ TÃ¼m alanlarÄ± doldurun'); return; }
        if (password !== password2) { showToast('âŒ Åifreler eÅŸleÅŸmiyor'); return; }
        if (password.length < 6) { showToast('âŒ Åifre en az 6 karakter'); return; }
        try {
            showToast('â³ KayÄ±t yapÄ±lÄ±yor...');
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            // Åifreyi de kaydet (admin gÃ¶rebilmesi iÃ§in)
            await db.collection('users').doc(cred.user.uid).set({ 
                email, 
                password: password,
                createdAt: new Date(), 
                keys: [],
                loyaltyPoints: 0
            });
            showToast('âœ… KayÄ±t baÅŸarÄ±lÄ±!');
            navigateTo('homePage');
        } catch (e) {
            showToast('âŒ ' + (e.code === 'auth/email-already-in-use' ? 'Bu e-posta zaten kayÄ±tlÄ±' : e.message));
        }
    }
    
    async function logout() {
        try { await markCurrentUserOffline(); } catch (e) {}
        stopPresenceHeartbeat();
        try {
            await auth.signOut();
        } finally {
            showToast('ğŸ‘‹ Ã‡Ä±kÄ±ÅŸ yapÄ±ldÄ±');
        }
    }
    
    async function loadUserData() {
        if (!currentUser) return;
        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                currentUserDocData = data || {};
                banRiskAcceptedCached = isBanRiskAccepted(currentUserDocData);
                banRiskLastCheckedAtMs = Date.now();
                updateKeyStatus(data.keys || []);
                updateLoyaltyUI(data);
            }
        } catch (e) { console.log(e); }
    }
    
    // Global deÄŸiÅŸken - aktif ve sÃ¼resi dolmuÅŸ keyleri sakla
    let userActiveKeys = [];
    let userExpiredKeys = [];
    
    // Tarih dÃ¶nÃ¼ÅŸtÃ¼rme yardÄ±mcÄ± fonksiyonu (Firestore Timestamp veya Date)
    function toDate(dateField) {
        if (!dateField) return null;
        if (dateField.toDate && typeof dateField.toDate === 'function') {
            return dateField.toDate(); // Firestore Timestamp
        }
        if (dateField instanceof Date) {
            return dateField; // Zaten Date
        }
        if (typeof dateField === 'string' || typeof dateField === 'number') {
            return new Date(dateField); // String veya number
        }
        return null;
    }
    
    function updateKeyStatus(keys) {
        console.log('ğŸ”‘ updateKeyStatus Ã§aÄŸrÄ±ldÄ±, key sayÄ±sÄ±:', keys.length);
        
        const box = document.getElementById('keyStatusBox');
        const content = document.getElementById('keyStatusContent');
        
        if (!box || !content) {
            console.log('ğŸ”‘ keyStatusBox veya content bulunamadÄ±');
            return;
        }
        
        // Aktif ve sÃ¼resi dolmuÅŸ keyleri filtrele ve sakla
        const now = new Date();
        userActiveKeys = keys.filter(k => {
            const exp = toDate(k.expiresAt);
            return exp && exp > now;
        });
        userExpiredKeys = keys.filter(k => {
            const exp = toDate(k.expiresAt);
            return exp && exp <= now;
        });
        
        console.log('ğŸ”‘ Aktif key sayÄ±sÄ±:', userActiveKeys.length);
        console.log('ğŸ”‘ SÃ¼resi dolmuÅŸ key sayÄ±sÄ±:', userExpiredKeys.length);
        
        if (userActiveKeys.length > 0) {
            box.className = 'key-status key-active';
            box.style.cursor = 'pointer';
            
            // TOPLAM kalan sÃ¼reyi hesapla (tÃ¼m keylerin kalan sÃ¼releri toplamÄ±)
            let totalRemainingMs = 0;
            userActiveKeys.forEach(key => {
                const exp = toDate(key.expiresAt);
                totalRemainingMs += (exp - now);
            });
            
            // Toplam kalan gÃ¼n ve saat
            const totalRemainingDays = Math.floor(totalRemainingMs / (1000 * 60 * 60 * 24));
            const totalRemainingHours = Math.floor((totalRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            // Toplam sÃ¼re metni
            let totalRemainingText = '';
            if (totalRemainingDays > 0) {
                totalRemainingText = `${totalRemainingDays} gÃ¼n ${totalRemainingHours} saat`;
            } else {
                totalRemainingText = `${totalRemainingHours} saat`;
            }
            
            // Son bitiÅŸ tarihini hesapla (en son biten key'in bitiÅŸ tarihi)
            const lastExpireDate = new Date(Math.max(...userActiveKeys.map(k => toDate(k.expiresAt).getTime())));
            
            // Toplam paket gÃ¼nlerini hesapla
            let totalPackageDays = 0;
            userActiveKeys.forEach(key => {
                const exp = toDate(key.expiresAt);
                const activatedAt = toDate(key.activatedAt) || new Date();
                const keyDays = key.days || Math.ceil((exp - activatedAt) / (1000 * 60 * 60 * 24));
                totalPackageDays += keyDays;
            });
            
            // Etiket
            let packageLabel = totalPackageDays >= 365 ? 'SÄ±nÄ±rsÄ±z' : `Toplam ${totalPackageDays} GÃ¼n`;
            
            // Ä°lerleme yÃ¼zdesi - toplam kullanÄ±lan / toplam sÃ¼re
            let totalOriginalMs = 0;
            let totalUsedMs = 0;
            userActiveKeys.forEach(key => {
                const exp = toDate(key.expiresAt);
                const activatedAt = toDate(key.activatedAt) || new Date();
                totalOriginalMs += (exp - activatedAt);
                totalUsedMs += (now - activatedAt);
            });
            const progressPercent = Math.max(0, Math.min(100, 100 - (totalUsedMs / totalOriginalMs * 100)));
            
            content.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 28px;">âœ…</div>
                        <div>
                            <div style="font-size: 14px; font-weight: bold; color: #4CAF50;">${packageLabel}</div>
                            <div style="font-size: 11px; color: #aaa;">â±ï¸ ${totalRemainingText} kaldÄ±</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${userActiveKeys.length > 1 ? `<span style="background: #4CAF50; color: #fff; padding: 3px 8px; border-radius: 10px; font-size: 10px;">${userActiveKeys.length} Key</span>` : ''}
                        <span style="font-size: 18px; color: #4CAF50;">â€º</span>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 4px; margin-top: 10px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%; width: ${progressPercent}%; border-radius: 4px;"></div>
                </div>
                <div style="font-size: 10px; color: #666; margin-top: 5px; text-align: center;">ğŸ“… BitiÅŸ: ${lastExpireDate.toLocaleDateString('tr-TR')} â€¢ Detaylar iÃ§in tÄ±klayÄ±n</div>
            `;
            // Sidebar key durumunu gÃ¼ncelle
            updateSidebarKeyStatus(`âœ… ${totalRemainingText} kaldÄ±`, true);
        } else {
            box.className = 'key-status key-expired';
            
            // SÃ¼resi dolmuÅŸ key varsa tÄ±klanabilir yap
            if (userExpiredKeys.length > 0) {
                box.style.cursor = 'pointer';
                content.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 28px;">âŒ</div>
                            <div>
                                <div style="font-size: 14px; font-weight: bold; color: #f44336;">SÃ¼resi Doldu</div>
                                <div style="font-size: 11px; color: #aaa;">${userExpiredKeys.length} eski key mevcut</div>
                            </div>
                        </div>
                        <span style="font-size: 18px; color: #f44336;">â€º</span>
                    </div>
                    <div style="font-size: 10px; color: #666; margin-top: 8px; text-align: center;">Silmek iÃ§in tÄ±klayÄ±n</div>
                `;
                // Sidebar'da sÃ¼resi doldu gÃ¶ster
                updateSidebarKeyStatus('âŒ SÃ¼resi Doldu', false);
            } else {
                box.style.cursor = 'default';
                content.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 28px;">âŒ</div>
                        <div>
                            <div style="font-size: 14px; font-weight: bold; color: #f44336;">Pasif</div>
                            <div style="font-size: 11px; color: #aaa;">Aktif Ã¼yeliÄŸiniz yok</div>
                        </div>
                    </div>
                `;
                // Sidebar'da aktif key yok gÃ¶ster
                updateSidebarKeyStatus('Aktif Key Yok', false);
            }
        }
    }
    
    // Key detay modal'Ä±nÄ± aÃ§
    function openKeyDetailModal() {
        // HiÃ§ key yoksa
        if (userActiveKeys.length === 0 && userExpiredKeys.length === 0) {
            showToast('âŒ HiÃ§ key\'iniz yok');
            return;
        }
        
        const now = new Date();
        let keysHtml = '';
        
        // Ã–nce aktif keyleri gÃ¶ster
        if (userActiveKeys.length > 0) {
            keysHtml += `<div style="font-size: 14px; font-weight: bold; color: #4CAF50; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span>âœ… Aktif Keyler</span>
                <span style="background: #4CAF50; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${userActiveKeys.length}</span>
            </div>`;
        }
        
        userActiveKeys.forEach((key, index) => {
            const exp = key.expiresAt.toDate();
            const activatedAt = key.activatedAt ? key.activatedAt.toDate() : new Date();
            const totalDays = key.days || Math.ceil((exp - activatedAt) / (1000 * 60 * 60 * 24));
            
            // Kalan sÃ¼reyi hesapla
            const remainingMs = exp - now;
            const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
            const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            
            // SÃ¼re metni
            let remainingText = '';
            if (totalDays === 1) {
                remainingText = remainingHours > 0 ? `${remainingHours} saat ${remainingMins} dk` : `${remainingMins} dakika`;
            } else if (remainingDays > 0) {
                remainingText = `${remainingDays} gÃ¼n ${remainingHours} saat`;
            } else {
                remainingText = `${remainingHours} saat ${remainingMins} dk`;
            }
            
            // Paket etiketi
            let packageLabel = '';
            if (totalDays === 1) packageLabel = '1 GÃ¼nlÃ¼k';
            else if (totalDays === 30) packageLabel = '30 GÃ¼nlÃ¼k';
            else if (totalDays === 60) packageLabel = '60 GÃ¼nlÃ¼k';
            else if (totalDays === 90) packageLabel = '90 GÃ¼nlÃ¼k';
            else if (totalDays >= 365) packageLabel = 'SÄ±nÄ±rsÄ±z';
            else packageLabel = `${totalDays} GÃ¼nlÃ¼k`;
            
            const gameName = key.game || 'Mobile Legends';
            const cheatName = key.cheat || 'TheBestML';
            const keyCode = key.keyCode || key.code || '***';
            const keyId = key.id || index;
            
            // Ä°lerleme yÃ¼zdesi
            const totalMs = exp - activatedAt;
            const usedMs = now - activatedAt;
            const progressPercent = Math.max(0, Math.min(100, 100 - (usedMs / totalMs * 100)));
            
            keysHtml += `
                <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(76,175,80,0.3); border-radius: 15px; padding: 15px; ${index > 0 ? 'margin-top: 12px;' : ''}">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">âœ…</span>
                            <span style="font-weight: bold; font-size: 16px; color: #4CAF50;">${packageLabel}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="background: #4CAF50; color: #fff; padding: 4px 12px; border-radius: 10px; font-size: 11px; font-weight: bold;">AKTÄ°F</span>
                            <button onclick="deleteKey('${keyId}', '${packageLabel}'); event.stopPropagation();" style="background: rgba(244,67,54,0.2); border: 1px solid #f44336; color: #f44336; padding: 4px 8px; border-radius: 8px; font-size: 11px; cursor: pointer;">ğŸ—‘ï¸</button>
                        </div>
                    </div>
                    
                    <!-- Ä°lerleme Ã‡ubuÄŸu -->
                    <div style="background: rgba(255,255,255,0.1); border-radius: 5px; height: 8px; margin-bottom: 12px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #4CAF50, #8BC34A); height: 100%; width: ${progressPercent}%; border-radius: 5px;"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
                        <span style="color: #fff;">â±ï¸ ${remainingText} kaldÄ±</span>
                        <span style="color: #888;">ğŸ“… ${exp.toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="font-size: 12px; color: #888;">ğŸ® Oyun</span>
                            <span style="font-size: 12px; color: #fff;">${gameName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #888;">ğŸ›¡ï¸ Hile</span>
                            <span style="font-size: 12px; color: #FFD700;">${cheatName}</span>
                        </div>
                    </div>
                    
                    <div style="background: rgba(76,175,80,0.15); border: 1px solid rgba(76,175,80,0.3); border-radius: 10px; padding: 12px;">
                        <div style="font-size: 11px; color: #888; margin-bottom: 6px;">ğŸ”‘ Key Kodunuz</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <code style="flex: 1; font-size: 13px; color: #4CAF50; word-break: break-all; font-weight: bold;">${keyCode}</code>
                            <button onclick="copyToClipboard('${keyCode}'); event.stopPropagation();" style="background: #4CAF50; border: none; color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer;">ğŸ“‹ Kopyala</button>
                        </div>
                    </div>
                    
                    <!-- SÃ¼re Uzat Butonu -->
                    <button onclick="openExtendModal('${keyId}', '${gameName}', '${cheatName}', '${keyCode}', '${exp.toISOString()}'); event.stopPropagation();" style="width: 100%; margin-top: 12px; background: linear-gradient(135deg, #FF9800, #F57C00); border: none; color: #fff; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        â° SÃ¼re Uzat
                    </button>
                </div>
            `;
        });
        
        // SÃ¼resi dolmuÅŸ keyleri gÃ¶ster
        if (userExpiredKeys.length > 0) {
            keysHtml += `<div style="font-size: 14px; font-weight: bold; color: #f44336; margin: 20px 0 12px 0; display: flex; align-items: center; gap: 8px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                <span>âŒ SÃ¼resi Dolan Keyler</span>
                <span style="background: #f44336; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${userExpiredKeys.length}</span>
            </div>`;
            
            userExpiredKeys.forEach((key, index) => {
                const exp = key.expiresAt.toDate();
                const activatedAt = key.activatedAt ? key.activatedAt.toDate() : new Date();
                const totalDays = key.days || Math.ceil((exp - activatedAt) / (1000 * 60 * 60 * 24));
                
                // Paket etiketi
                let packageLabel = '';
                if (totalDays === 1) packageLabel = '1 GÃ¼nlÃ¼k';
                else if (totalDays === 30) packageLabel = '30 GÃ¼nlÃ¼k';
                else if (totalDays === 60) packageLabel = '60 GÃ¼nlÃ¼k';
                else if (totalDays === 90) packageLabel = '90 GÃ¼nlÃ¼k';
                else if (totalDays >= 365) packageLabel = 'SÄ±nÄ±rsÄ±z';
                else packageLabel = `${totalDays} GÃ¼nlÃ¼k`;
                
                const gameName = key.game || 'Mobile Legends';
                const cheatName = key.cheat || 'TheBestML';
                const keyCode = key.keyCode || key.code || '***';
                const keyId = key.id || `exp_${index}`;
                
                // Ne kadar Ã¶nce bittiÄŸini hesapla
                const expiredMs = now - exp;
                const expiredDays = Math.floor(expiredMs / (1000 * 60 * 60 * 24));
                const expiredHours = Math.floor((expiredMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let expiredText = expiredDays > 0 ? `${expiredDays} gÃ¼n Ã¶nce` : `${expiredHours} saat Ã¶nce`;
                
                keysHtml += `
                    <div style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3); border-radius: 15px; padding: 15px; ${index > 0 ? 'margin-top: 12px;' : ''}">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 24px;">â°</span>
                                <span style="font-weight: bold; font-size: 16px; color: #f44336;">${packageLabel}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="background: #f44336; color: #fff; padding: 4px 12px; border-radius: 10px; font-size: 11px; font-weight: bold;">DOLDU</span>
                                <button onclick="deleteKey('${keyId}', '${packageLabel}'); event.stopPropagation();" style="background: rgba(244,67,54,0.3); border: 1px solid #f44336; color: #f44336; padding: 4px 8px; border-radius: 8px; font-size: 11px; cursor: pointer;">ğŸ—‘ï¸</button>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
                            <span style="color: #f44336;">â±ï¸ ${expiredText} sona erdi</span>
                            <span style="color: #888;">ğŸ“… ${exp.toLocaleDateString('tr-TR')}</span>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-size: 12px; color: #888;">ğŸ® Oyun</span>
                                <span style="font-size: 12px; color: #fff;">${gameName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 12px; color: #888;">ğŸ›¡ï¸ Hile</span>
                                <span style="font-size: 12px; color: #FFD700;">${cheatName}</span>
                            </div>
                        </div>
                        
                        <div style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.2); border-radius: 10px; padding: 12px;">
                            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">ğŸ”‘ Eski Key Kodu</div>
                            <code style="font-size: 12px; color: #888; word-break: break-all;">${keyCode}</code>
                        </div>
                    </div>
                `;
            });
        }
        
        // TÃ¼mÃ¼nÃ¼ sil butonu
        if (userExpiredKeys.length > 1) {
            keysHtml += `
                <button onclick="deleteAllExpiredKeys()" style="width: 100%; margin-top: 15px; background: linear-gradient(135deg, #f44336, #d32f2f); border: none; color: #fff; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer;">
                    ğŸ—‘ï¸ TÃ¼m SÃ¼resi DolmuÅŸ Keyleri Sil (${userExpiredKeys.length})
                </button>
            `;
        }
        
        document.getElementById('keyDetailContent').innerHTML = keysHtml;
        openModal('keyDetailModal');
    }
    
    // TÃ¼m sÃ¼resi dolmuÅŸ keyleri sil
    async function deleteAllExpiredKeys() {
        if (!currentUser) {
            showToast('âŒ Ã–nce giriÅŸ yapÄ±n');
            return;
        }
        
        const confirmed = confirm(`âš ï¸ TÃ¼m sÃ¼resi dolmuÅŸ keyleri (${userExpiredKeys.length} adet) silmek istediÄŸinize emin misiniz?\n\nBu iÅŸlem geri alÄ±namaz!`);
        
        if (!confirmed) return;
        
        try {
            showToast('â³ Siliniyor...');
            
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const keys = userData.keys || [];
                const now = new Date();
                
                // SÃ¼resi dolmuÅŸ keyleri bul
                const expiredKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() <= now);
                
                // Sadece aktif keyleri tut
                const activeKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() > now);
                
                // Silinen keyleri logla
                const activityLog = userData.activityLog || [];
                expiredKeys.forEach(key => {
                    activityLog.push({
                        type: 'key_deleted',
                        keyCode: key.keyCode || key.code || '***',
                        game: key.game || 'Mobile Legends',
                        cheat: key.cheat || 'TheBestML',
                        days: key.days || 0,
                        expiresAt: key.expiresAt,
                        deletedAt: new Date(),
                        deletedBy: 'user',
                        reason: 'Toplu silme - SÃ¼resi dolmuÅŸ'
                    });
                });
                
                await db.collection('users').doc(currentUser.uid).update({
                    keys: activeKeys,
                    activityLog: activityLog
                });
                
                showToast(`âœ… ${expiredKeys.length} key silindi!`);
                closeModal('keyDetailModal');
                loadUserData();
            }
        } catch(e) {
            console.error('Toplu silme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Key silme fonksiyonu
    async function deleteKey(keyId, packageLabel) {
        if (!currentUser) {
            showToast('âŒ Ã–nce giriÅŸ yapÄ±n');
            return;
        }
        
        // Onay iste
        const confirmed = confirm(`âš ï¸ "${packageLabel}" paketini silmek istediÄŸinize emin misiniz?\n\nBu iÅŸlem geri alÄ±namaz ve kalan sÃ¼reniz kaybolur!`);
        
        if (!confirmed) return;
        
        try {
            showToast('â³ Siliniyor...');
            
            // Firebase'den key'i sil
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const keys = userData.keys || [];
                
                // Silinecek key'i bul
                let deletedKey = null;
                const updatedKeys = keys.filter((k, idx) => {
                    const kId = k.id || idx;
                    if (kId.toString() === keyId.toString()) {
                        deletedKey = k;
                        return false;
                    }
                    return true;
                });
                
                // Aktivite loguna ekle
                const activityLog = userData.activityLog || [];
                if (deletedKey) {
                    const now = new Date();
                    const isExpired = deletedKey.expiresAt && deletedKey.expiresAt.toDate() <= now;
                    activityLog.push({
                        type: 'key_deleted',
                        keyCode: deletedKey.keyCode || deletedKey.code || '***',
                        game: deletedKey.game || 'Mobile Legends',
                        cheat: deletedKey.cheat || 'TheBestML',
                        days: deletedKey.days || 0,
                        expiresAt: deletedKey.expiresAt,
                        deletedAt: new Date(),
                        deletedBy: 'user',
                        reason: isExpired ? 'SÃ¼resi dolmuÅŸ key silindi' : 'Aktif key silindi'
                    });
                }
                
                // GÃ¼ncelle
                await db.collection('users').doc(currentUser.uid).update({
                    keys: updatedKeys,
                    activityLog: activityLog
                });
                
                showToast('âœ… Key silindi!');
                
                // Modal'Ä± kapat ve yeniden yÃ¼kle
                closeModal('keyDetailModal');
                
                // KullanÄ±cÄ± verilerini yeniden yÃ¼kle
                loadUserData();
            }
        } catch(e) {
            console.error('Key silme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // ==================== YETKÄ° SÄ°STEMÄ° ====================
    
    // Kurucu (Owner) - TÃœM yetkiler
    const OWNER_EMAILS = ['onurtenk0@gmail.com'];
    const OWNER_EMAIL = OWNER_EMAILS[0];

    function normalizeEmail(email) {
        return (email || '').toString().toLowerCase().trim();
    }

    function isOwnerEmail(email) {
        const e = normalizeEmail(email);
        if (!e) return false;
        return OWNER_EMAILS.map(x => normalizeEmail(x)).includes(e);
    }

    // ==================== ADMIN Ä°STATÄ°STÄ°KLERÄ° ====================
    let adminUsageInterval = null;
    let adminUsageLastBeatMs = 0;

    function formatDurationMs(ms) {
        const n = Number(ms);
        if (!Number.isFinite(n) || n <= 0) return '0 dk';
        const totalMinutes = Math.floor(n / 60000);
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const minutes = totalMinutes % 60;

        const parts = [];
        if (days > 0) parts.push(days + ' gÃ¼n');
        if (hours > 0) parts.push(hours + ' saat');
        parts.push(minutes + ' dk');
        return parts.join(' ');
    }

    async function incrementAdminStatField(field, amount) {
        try {
            if (!db || !currentUser || !currentUser.email) return;
            if (!(isAdmin() || isOwner())) return;
            const email = normalizeEmail(currentUser.email);
            if (!email) return;
            const ref = db.collection('adminStats').doc(email);
            const payload = {
                email: email,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            payload[field] = firebase.firestore.FieldValue.increment(Number(amount) || 0);
            await ref.set(payload, { merge: true });
        } catch (e) {
            console.log('Admin stat increment hatasÄ±:', e?.message || e);
        }
    }

    async function adminUsageHeartbeat({ initial = false } = {}) {
        try {
            if (!db || !currentUser || !currentUser.email) return;
            if (!(isAdmin() || isOwner())) return;
            if (document.visibilityState === 'hidden') return;

            const now = Date.now();
            if (!adminUsageLastBeatMs) adminUsageLastBeatMs = now;

            let deltaMs = initial ? 0 : (now - adminUsageLastBeatMs);
            deltaMs = Math.max(0, Math.min(deltaMs, 5 * 60 * 1000));
            adminUsageLastBeatMs = now;

            const email = normalizeEmail(currentUser.email);
            if (!email) return;

            if (deltaMs <= 0) {
                await db.collection('adminStats').doc(email).set({
                    email,
                    lastSeenAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                return;
            }

            await db.collection('adminStats').doc(email).set({
                email,
                totalAppMs: firebase.firestore.FieldValue.increment(deltaMs),
                lastSeenAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            // sessiz
        }
    }

    function startAdminUsageTracking() {
        try {
            if (!currentUser) return;
            if (!(isAdmin() || isOwner())) return;
            if (adminUsageInterval) return;

            adminUsageLastBeatMs = Date.now();
            adminUsageHeartbeat({ initial: true });
            adminUsageInterval = setInterval(() => {
                adminUsageHeartbeat({ initial: false });
            }, 30000);
        } catch (e) {}
    }

    function stopAdminUsageTracking() {
        try {
            if (adminUsageInterval) {
                clearInterval(adminUsageInterval);
                adminUsageInterval = null;
            }
            adminUsageLastBeatMs = 0;
        } catch (e) {}
    }

    async function fetchAdminMetricsForEmail(email) {
        const safeEmail = normalizeEmail(email);
        const metrics = { totalAppMs: 0, approvedOrders: 0, claimedChats: 0 };
        if (!db || !safeEmail) return metrics;

        try {
            const statsDoc = await db.collection('adminStats').doc(safeEmail).get();
            if (statsDoc.exists) {
                const d = statsDoc.data() || {};
                const ms = Number(d.totalAppMs);
                if (Number.isFinite(ms) && ms > 0) metrics.totalAppMs = ms;

                // Spark kotasÄ±nÄ± korumak iÃ§in pahalÄ± koleksiyon taramalarÄ±nÄ± kullanma.
                // Bu sayÄ±lar incrementAdminStatField ile birikiyor.
                const approved = Number(d.approvedOrdersCount);
                if (Number.isFinite(approved) && approved > 0) metrics.approvedOrders = Math.floor(approved);
                const claimed = Number(d.claimedChatsCount);
                if (Number.isFinite(claimed) && claimed > 0) metrics.claimedChats = Math.floor(claimed);
            }
        } catch (e) {}

        return metrics;
    }
    
    // Yetki tanÄ±mlarÄ±
    const PERMISSIONS = {
        orders: { name: 'SipariÅŸ YÃ¶netimi', icon: 'ğŸ“¦', desc: 'SipariÅŸleri gÃ¶rÃ¼ntÃ¼leme ve onaylama/reddetme' },
        support: { name: 'Destek YÃ¶netimi', icon: 'ğŸ’¬', desc: 'Destek mesajlarÄ±na cevap verme' },
        members_view: { name: 'Ãœye GÃ¶rÃ¼ntÃ¼leme', icon: 'ğŸ‘ï¸', desc: 'Ãœye listesini gÃ¶rÃ¼ntÃ¼leme' },
        members_edit: { name: 'Ãœye DÃ¼zenleme', icon: 'âœï¸', desc: 'Ãœye verilerini dÃ¼zenleme' },
        keys_add: { name: 'Key Ekleme', icon: 'ğŸ”‘', desc: 'Ãœyelere key ekleme' },
        keys_delete: { name: 'Key Silme', icon: 'ğŸ—‘ï¸', desc: 'Ãœyelerin keylerini silme' },
        games: { name: 'Oyun/Hile YÃ¶netimi', icon: 'ğŸ®', desc: 'Oyun ve hile ekleme/dÃ¼zenleme' },
        payments: { name: 'Ã–deme AyarlarÄ±', icon: 'ğŸ’³', desc: 'Ã–deme ayarlarÄ±nÄ± deÄŸiÅŸtirme' },
        notifications: { name: 'Bildirim GÃ¶nderme', icon: 'ğŸ“¢', desc: 'TÃ¼m kullanÄ±cÄ±lara bildirim gÃ¶nderme' },
        admin_management: { name: 'Admin YÃ¶netimi', icon: 'ğŸ‘®', desc: 'Admin ekleme/Ã§Ä±karma/yetkilendirme' },
        modals: { name: 'Kurulum ModallarÄ±', icon: 'ğŸ“–', desc: 'Kurulum rehberi modallarÄ± oluÅŸturma/dÃ¼zenleme' },
        app_settings: { name: 'Uygulama YÃ¶netimi', icon: 'âš™ï¸', desc: 'Uygulama ayarlarÄ±, tema, logo ve gÃ¼ncelleme yÃ¶netimi' }
    };
    
    // Dinamik admin listesi (Firestore'dan yÃ¼klenir) - Yeni yapÄ±: { email: string, permissions: string[] }
    let adminList = [];  // [{ email: 'xxx', permissions: ['orders', 'support'] }, ...]
    let adminEmails = []; // Eski yapÄ± ile uyumluluk iÃ§in
    
    // Firestore'dan admin listesini yÃ¼kle
    async function loadAdminList() {
        try {
            const doc = await db.collection('settings').doc('admins').get();
            if (doc.exists) {
                const data = doc.data();
                
                // Yeni yapÄ± varsa kullan
                if (data.adminList) {
                    adminList = data.adminList;
                    adminEmails = adminList.map(a => a.email.toLowerCase());
                } 
                // Eski yapÄ±yÄ± yeni yapÄ±ya dÃ¶nÃ¼ÅŸtÃ¼r
                else if (data.emails) {
                    adminEmails = data.emails;
                    adminList = adminEmails.map(email => ({
                        email: email,
                        permissions: ['orders', 'support', 'members_view'] // VarsayÄ±lan yetkiler
                    }));
                    // Yeni yapÄ±yÄ± kaydet
                    await saveAdminList();
                }
                
                console.log('Admin listesi yÃ¼klendi:', adminList.length, 'admin');
            }
        } catch(e) {
            console.log('Admin listesi yÃ¼klenemedi:', e);
        }
    }
    
    // Admin listesini kaydet
    async function saveAdminList() {
        try {
            await db.collection('settings').doc('admins').set({
                adminList: adminList,
                emails: adminEmails, // Eski yapÄ± ile uyumluluk
                updatedAt: new Date(),
                updatedBy: currentUser?.email || 'system'
            });
            return true;
        } catch(e) {
            console.error('Admin listesi kaydedilemedi:', e);
            return false;
        }
    }
    
    // Admin ekle (ADMIN YÃ–NETÄ°MÄ° YETKÄ°SÄ° GEREKLÄ°)
    async function addAdmin(email, permissions = ['orders', 'support', 'members_view']) {
        if (!requirePermission('admin_management', 'admin eklemek')) return false;
        
        email = email.toLowerCase().trim();
        if (!email || !email.includes('@')) {
            showToast('âŒ GeÃ§erli e-posta girin');
            return false;
        }
        
        if (isOwnerEmail(email)) {
            showToast('âš ï¸ Kurucu zaten en Ã¼st yetkiye sahip');
            return false;
        }
        
        if (adminEmails.includes(email)) {
            showToast('âš ï¸ Bu kullanÄ±cÄ± zaten admin');
            return false;
        }
        
        try {
            // Yeni admin objesini ekle
            adminList.push({
                email: email,
                permissions: permissions,
                addedAt: new Date().toISOString(),
                addedBy: currentUser.email
            });
            adminEmails.push(email);
            
            if (await saveAdminList()) {
                showToast('âœ… ' + email + ' admin yapÄ±ldÄ±!');
                return true;
            }
            return false;
        } catch(e) {
            adminList = adminList.filter(a => a.email !== email);
            adminEmails = adminEmails.filter(e => e !== email);
            showToast('âŒ Hata: ' + e.message);
            return false;
        }
    }
    
    // Admin kaldÄ±r (ADMIN YÃ–NETÄ°MÄ° YETKÄ°SÄ° GEREKLÄ°)
    async function removeAdmin(email) {
        if (!requirePermission('admin_management', 'admin kaldÄ±rmak')) return false;
        
        email = email.toLowerCase().trim();
        
        if (!adminEmails.includes(email)) {
            showToast('âš ï¸ Bu kullanÄ±cÄ± admin deÄŸil');
            return false;
        }
        
        if (!confirm(`"${email}" kullanÄ±cÄ±sÄ±nÄ±n admin yetkisini kaldÄ±rmak istiyor musunuz?`)) {
            return false;
        }
        
        try {
            adminList = adminList.filter(a => a.email !== email);
            adminEmails = adminEmails.filter(e => e !== email);
            
            if (await saveAdminList()) {
                showToast('âœ… ' + email + ' artÄ±k admin deÄŸil');
                loadAdminListUI();
                return true;
            }
            return false;
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
            await loadAdminList();
            return false;
        }
    }
    
    // Admin yetkilerini gÃ¼ncelle (ADMIN YÃ–NETÄ°MÄ° YETKÄ°SÄ° GEREKLÄ°)
    async function updateAdminPermissions(email, permissions) {
        if (!requirePermission('admin_management', 'yetki deÄŸiÅŸtirmek')) return false;
        
        email = email.toLowerCase().trim();
        const adminIndex = adminList.findIndex(a => a.email === email);
        
        if (adminIndex === -1) {
            showToast('âš ï¸ Bu kullanÄ±cÄ± admin deÄŸil');
            return false;
        }
        
        try {
            adminList[adminIndex].permissions = permissions;
            adminList[adminIndex].updatedAt = new Date().toISOString();
            adminList[adminIndex].updatedBy = currentUser.email;
            
            if (await saveAdminList()) {
                showToast('âœ… Yetkiler gÃ¼ncellendi!');
                return true;
            }
            return false;
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
            await loadAdminList();
            return false;
        }
    }
    
    // Adminin yetkilerini al
    function getAdminPermissions(email) {
        const admin = adminList.find(a => a.email === email.toLowerCase());
        return admin ? admin.permissions : [];
    }
    
    // Kurucu mu kontrol et (tÃ¼m yetkiler)
    function isOwner() {
        return !!currentUser && isOwnerEmail(currentUser.email);
    }
    
    // Admin mi kontrol et (kurucu dahil)
    function isAdmin() {
        if (!currentUser) return false;
        const email = normalizeEmail(currentUser.email);
        return isOwnerEmail(email) || adminEmails.includes(email);
    }
    
    // Yetki kontrolÃ¼ - belirli bir yetki iÃ§in
    function hasPermission(permission) {
        if (!currentUser) return false;
        
        // Kurucu tÃ¼m yetkilere sahip
        if (isOwner()) return true;
        
        // Admin ise yetkilerini kontrol et
        const userEmail = currentUser.email.toLowerCase();
        const admin = adminList.find(a => a.email === userEmail);
        
        if (admin && admin.permissions) {
            return admin.permissions.includes(permission);
        }
        
        return false;
    }
    
    // Belirli bir yetki gerekli - yoksa uyarÄ± gÃ¶ster
    function requirePermission(permission, actionName) {
        if (!hasPermission(permission)) {
            const permInfo = PERMISSIONS[permission];
            showToast(`ğŸ”’ "${permInfo?.name || permission}" yetkisi gerekli`);
            return false;
        }
        return true;
    }
    
    // Kurucu yetkisi gerektiren iÅŸlem kontrolÃ¼
    function requireOwner(action) {
        if (!isOwner()) {
            showToast('ğŸ”’ Bu iÅŸlem iÃ§in kurucu yetkisi gerekli');
            return false;
        }
        return true;
    }
    
    // GeliÅŸmiÅŸ oyun/hile veri yapÄ±sÄ±
    let gamesData = {};  // { gameId: { name, image, desc, playStore, status, cheats: { cheatId: {...} } } }
    let currentDynamicGame = null;  // Åu an aÃ§Ä±k olan dinamik oyun
    let currentDynamicCheat = null; // Åu an aÃ§Ä±k olan dinamik hile
    let selectedDynamicPrice = null; // SeÃ§ili fiyat
    
    // Firestore'dan oyun/hile verilerini yÃ¼kle (her oyun ayrÄ± dÃ¶kÃ¼manda)
    async function loadGamesAndCheats() {
        // Debug sadece console'da (ekranda gÃ¶rÃ¼nmez)
        function showDebug(msg, isError = false) {
            if (isError) {
                console.error(msg);
            } else {
                console.log(msg);
            }
        }
        
        // BAÅLATMA KONTROLLERI
        showDebug('ğŸ”„ loadGamesAndCheats baÅŸlatÄ±ldÄ±');
        
        if (!db) {
            showDebug('âŒ HATA: db nesnesi null! Firebase baÅŸlatÄ±lamadÄ±.', true);
            showDebug(`firebaseReady: ${firebaseReady}`, true);
            showDebug(`typeof firebase: ${typeof firebase}`, true);
            return;
        }
        
        showDebug('âœ… db nesnesi hazÄ±r');
        
        try {
            showDebug('ğŸ”„ BaÅŸlangÄ±Ã§: Oyunlar yÃ¼kleniyor...');
            
            // Ã–nce yeni yapÄ±yÄ± dene: games/{gameId} koleksiyonu
            showDebug('ğŸ“¡ games koleksiyonu kontrol ediliyor...');
            const gamesSnapshot = await db.collection('games').get();
            gamesData = {};
            
            showDebug(`ğŸ“Š Koleksiyon sonucu: ${gamesSnapshot.size} dokÃ¼man bulundu`);
            
            if (!gamesSnapshot.empty) {
                // Yeni yapÄ±da veri var
                gamesSnapshot.forEach(doc => {
                    gamesData[doc.id] = doc.data();
                });
                showDebug(`âœ… Oyunlar yÃ¼klendi (yeni yapÄ±): ${Object.keys(gamesData).join(', ')}`);
            } else {
                // Yeni yapÄ±da veri yok, eski yapÄ±yÄ± dene: settings/gamesData
                showDebug('âš ï¸ Yeni yapÄ±da veri yok, eski yapÄ± kontrol ediliyor...');
                const oldDoc = await db.collection('settings').doc('gamesData').get();
                
                showDebug(`ğŸ” Eski dokÃ¼man var mÄ±: ${oldDoc.exists}`);
                
                if (oldDoc.exists && oldDoc.data() && oldDoc.data().games) {
                    // Eski yapÄ±dan veri bulduk, otomatik migration yap
                    const oldGamesData = oldDoc.data().games;
                    showDebug(`ğŸ“¦ Eski yapÄ±da ${Object.keys(oldGamesData).length} oyun bulundu, migration baÅŸlÄ±yor...`);
                    
                    // Her oyunu yeni yapÄ±ya aktar
                    const migrationPromises = [];
                    for (const gameId in oldGamesData) {
                        gamesData[gameId] = oldGamesData[gameId];
                        migrationPromises.push(
                            db.collection('games').doc(gameId).set(oldGamesData[gameId])
                        );
                    }
                    
                    // TÃ¼m oyunlarÄ± kaydet
                    await Promise.all(migrationPromises);
                    showDebug(`âœ… Migration tamamlandÄ±! Oyunlar: ${Object.keys(gamesData).join(', ')}`);
                    
                    // Eski veriyi yedek olarak sakla
                    await db.collection('settings').doc('gamesData_BACKUP').set(oldDoc.data());
                    showDebug('ğŸ’¾ Eski veri yedeklendi');
                } else {
                    // HiÃ§ veri yok, varsayÄ±lan oluÅŸtur
                    showDebug('ğŸ“ HiÃ§ veri yok, varsayÄ±lan oluÅŸturuluyor...');
                    
                    // VarsayÄ±lan oyun verisi
                    const defaultGame = {
                        name: 'Mobile Legends',
                        image: 'https://raw.githubusercontent.com/LineOft/thebestml-updates/main/mobile-legends-icon.jpg', 
                        desc: 'Mobil MOBA oyunu',
                        playStore: 'https://play.google.com/store/apps/details?id=com.mobile.legends',
                        status: 'active',
                        cheats: {
                        'thebestml': {
                            name: 'TheBestML IMGUI',
                            image: 'https://raw.githubusercontent.com/LineOft/thebestml-updates/main/thebestml-icon.jpg',
                            version: 'V2.8',
                            desc: 'GeliÅŸmiÅŸ IMGUI modu â€¢ ESP, Map Hack ve daha fazlasÄ±',
                            apkUrl: 'https://dosya.co/dho18v1fbzq0/THEBEST_IMGUI-v2.8.apk.html',
                            videoUrl: '',
                            features: ['ğŸ‘ Oyuncu GÃ¶rÃ¼nÃ¼mÃ¼', 'â¤ï¸ DÃ¼ÅŸman HP', 'ğŸ—º Harita Hilesi', 'ğŸ“¦ Kutulama', 'ğŸŒ² Orman YaratÄ±klarÄ±nÄ± GÃ¶rme'],
                            prices: [
                                { days: '1', label: '1 GÃ¼n', price: '220â‚º' },
                                { days: '30', label: '30 GÃ¼n', price: '850â‚º' },
                                { days: '90', label: '90 GÃ¼n', price: '1800â‚º' },
                                { days: 'unlimited', label: 'SÄ±nÄ±rsÄ±z', price: '6500â‚º' }
                            ],
                            status: 'active',
                            setupSteps: [
                                {
                                    title: 'Orijinal ML Ä°ndirin',
                                    description: 'Playstoreden Mobile Legends orijinal sÃ¼rÃ¼mÃ¼nÃ¼ indirin.',
                                    actionType: 'playstore'
                                },
                                {
                                    title: 'SertifikalarÄ± KapatÄ±n',
                                    description: 'Bypass korumasÄ±nÄ±n Ã§alÄ±ÅŸabilmesi iÃ§in sertifikalarÄ± kapatÄ±n. AÅŸaÄŸÄ±daki butona tÄ±klayarak video rehberi izleyin.',
                                    actionType: 'modal',
                                    modalId: 'imguiModal'
                                },
                                {
                                    title: 'IMGUI APK Ä°ndirin',
                                    description: 'TheBestML IMGUI APK dosyasÄ±nÄ± indirin ve kurun.',
                                    actionType: 'download',
                                    downloadUrl: 'https://dosya.co/dho18v1fbzq0/THEBEST_IMGUI-v2.8.apk.html'
                                },
                                {
                                    title: 'Spa DosyasÄ±nÄ± Ã‡alÄ±ÅŸtÄ±rÄ±n',
                                    description: 'Ä°ndirdiÄŸiniz TheBestML Spa dosyasÄ±nÄ± Ã§alÄ±ÅŸtÄ±rÄ±n ve karÅŸÄ±nÄ±za Ã§Ä±kan ekrandan izinleri verin.',
                                    actionType: 'none'
                                },
                                {
                                    title: 'ML KlonlayÄ±n',
                                    description: 'Listeden Mobile Legends\'Ä± seÃ§in ve "Klon" yazÄ±sÄ±na tÄ±klayÄ±n.',
                                    actionType: 'none'
                                },
                                {
                                    title: 'Klonlanan ML\'yi BaÅŸlatÄ±n',
                                    description: 'KlonladÄ±ÄŸÄ±nÄ±z ML sÃ¼rÃ¼mÃ¼nÃ¼ baÅŸlatÄ±n ve hesabÄ±m kÄ±smÄ±ndaki KEY\'iniz ile giriÅŸ yapÄ±n.',
                                    actionType: 'none'
                                }
                            ]
                        },
                        'thebestml_pro': {
                            name: 'TheBestML Pro',
                            image: 'https://raw.githubusercontent.com/LineOft/thebestml-updates/main/thebestml-icon.jpg',
                            version: 'YENÄ°',
                            desc: 'Full Map â€¢ Auto Combo â€¢ Auto Aim â€¢ Rootlu/Rootsuz',
                            apkUrl: '',
                            videoUrl: '',
                            features: [
                                'ğŸ—ºï¸ Full Map',
                                'ğŸ¾ Oto PenÃ§e',
                                'âš”ï¸ Ling Oto Combo',
                                'ğŸŒŸ Julian Oto Combo',
                                'ğŸ—¡ï¸ Arlott Oto Combo',
                                'ğŸ’€ Gusion Oto Combo',
                                'ğŸ”« Granger Oto Ulti',
                                'ğŸ§² Franco MÄ±knatÄ±s Hook',
                                'ğŸ¯ Xavier Oto Ulti',
                                'ğŸš€ Tigreal Oto IÅŸÄ±nlanma + Ulti',
                                'ğŸ‘Š Chou Oto Combo',
                                'ğŸª“ Balmond Oto Ulti',
                                'âš¡ Martis Oto Ulti',
                                'ğŸ¯ Full Auto Aim'
                            ],
                            prices: [
                                { days: '1', label: '1 GÃ¼n', price: '220â‚º' },
                                { days: '30', label: '30 GÃ¼n', price: '850â‚º' },
                                { days: '90', label: '90 GÃ¼n', price: '1800â‚º' },
                                { days: 'unlimited', label: 'SÄ±nÄ±rsÄ±z', price: '6500â‚º' }
                            ],
                            status: 'active',
                            setupSteps: [
                                {
                                    title: 'Orijinal ML Ä°ndirin',
                                    description: 'Playstoreden Mobile Legends orijinal sÃ¼rÃ¼mÃ¼nÃ¼ indirin.',
                                    actionType: 'playstore'
                                },
                                {
                                    title: 'TheBestML Pro APK Ä°ndirin',
                                    description: 'TheBestML Pro APK dosyasÄ±nÄ± indirin ve kurun.',
                                    actionType: 'download',
                                    downloadUrl: ''
                                },
                                {
                                    title: 'Oyuna GiriÅŸ YapÄ±n',
                                    description: 'Oyuna giriÅŸ yapÄ±n, key giriÅŸ ekranÄ±na geldiÄŸinizde hesabÄ±m kÄ±smÄ±ndaki KEY\'inizi kopyalayÄ±p yapÄ±ÅŸtÄ±rÄ±n.',
                                    actionType: 'none'
                                }
                            ]
                        }
                    }
                };
                
                    try {
                        showDebug('ğŸ’¾ VarsayÄ±lan oyun kaydediliyor...');
                        // Her oyunu ayrÄ± dokÃ¼manda tut
                        await db.collection('games').doc('mobile_legends').set(defaultGame);
                        gamesData['mobile_legends'] = defaultGame;
                        showDebug('âœ… VarsayÄ±lan oyun verisi kaydedildi');
                    } catch(saveErr) {
                        showDebug('âŒ VarsayÄ±lan veri kaydetme hatasÄ±: ' + saveErr.message, true);
                    }
                }
            }
            
            showDebug(`ğŸ® Toplam ${Object.keys(gamesData).length} oyun yÃ¼klendi`);
            
            if (Object.keys(gamesData).length === 0) {
                showDebug('âš ï¸ UYARI: HiÃ§ oyun yÃ¼klenmedi!', true);
            }
            
            showDebug('ğŸ”„ Sayfa render ediliyor...');
            
            try {
                renderHomeGames(); // Ana sayfadaki oyunlarÄ± render et
                showDebug('âœ… renderHomeGames tamamlandÄ±');
            } catch(renderErr) {
                showDebug('âŒ renderHomeGames hatasÄ±: ' + renderErr.message, true);
            }
            
            try {
                updateGameSelects();
                showDebug('âœ… updateGameSelects tamamlandÄ±');
            } catch(selectErr) {
                showDebug('âŒ updateGameSelects hatasÄ±: ' + selectErr.message, true);
            }
            
            try {
                loadGameCheatList();
                showDebug('âœ… loadGameCheatList tamamlandÄ±');
            } catch(listErr) {
                showDebug('âŒ loadGameCheatList hatasÄ±: ' + listErr.message, true);
            }
            
            try {
                updateCheatStatusBadges(); // Durum badge'lerini gÃ¼ncelle
                showDebug('âœ… updateCheatStatusBadges tamamlandÄ±');
            } catch(badgeErr) {
                showDebug('âŒ updateCheatStatusBadges hatasÄ±: ' + badgeErr.message, true);
            }
            
            showDebug('ğŸ‰ YÃœKLENDÄ°! Sayfa hazÄ±r.');
        } catch(e) {
            showDebug('âŒ KRÄ°TÄ°K HATA: ' + e.message, true);
            showDebug('Stack: ' + (e.stack || 'Stack bilgisi yok'), true);
            // Hata durumunda bile bir ÅŸey gÃ¶ster
            const grid = document.getElementById('homeGamesGrid');
            if (grid) {
                grid.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #f44336;">
                        <div style="font-size: 50px; margin-bottom: 15px;">âš ï¸</div>
                        <div style="font-size: 16px; margin-bottom: 10px;">Oyunlar yÃ¼klenemedi</div>
                        <div style="font-size: 11px; color: #666; margin: 10px; padding: 10px; background: #222; border-radius: 5px; text-align: left; overflow: auto;">${e.message}<br><br>${e.stack || ''}</div>
                        <button onclick="loadGamesAndCheats()" style="margin-top: 15px; background: #4CAF50; border: none; color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer;">ğŸ”„ Tekrar Dene</button>
                    </div>
                `;
            }
        }
    }
    
    // Ana sayfadaki oyunlarÄ± dinamik olarak render et
    function renderHomeGames() {
        const grid = document.getElementById('homeGamesGrid');
        if (!grid) {
            console.error('homeGamesGrid elementi bulunamadÄ±!');
            return;
        }
        
        try {
            let html = '';
            // OyunlarÄ± sortOrder'a gÃ¶re sÄ±rala
            const gameIds = Object.keys(gamesData || {}).sort((a, b) => {
                const orderA = gamesData[a].sortOrder ?? 999;
                const orderB = gamesData[b].sortOrder ?? 999;
                return orderA - orderB;
            });
            let activeGames = 0;
            
            console.log('Render edilecek oyun sayÄ±sÄ±:', gameIds.length);
            
            gameIds.forEach(gameId => {
                const game = gamesData[gameId];
                if (!game || game.status !== 'active') return; // Sadece aktif oyunlarÄ± gÃ¶ster
                activeGames++;
                
                const cheats = game.cheats || {};
                const cheatCount = Object.keys(cheats).filter(id => cheats[id]?.status === 'active').length;
                
                // Resim - base64 veya URL olabilir
                const imgSrc = game.image && game.image.startsWith('data:') 
                    ? game.image 
                    : (game.image || '');
                
                const fallbackSvg = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22 rx=%2215%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>ğŸ®</text></svg>`;
                
                html += `
                    <div class="game-card" onclick="openGameDetail('${gameId}')">
                        <img src="${imgSrc || fallbackSvg}" alt="${game.name}" class="game-icon" onerror="this.src='${fallbackSvg}'">
                        <div class="game-info">
                            <div class="game-name">${game.name || 'Oyun'}</div>
                            <div class="game-desc">${game.desc || 'Oyun hileleri'}</div>
                            <div class="game-badge">${cheatCount} Hile Mevcut</div>
                        </div>
                        <div class="game-arrow">â€º</div>
                    </div>
                `;
            });
            
            // HiÃ§ aktif oyun yoksa
            if (activeGames === 0) {
                html = `
                    <div style="text-align: center; padding: 30px; color: #888;">
                        <div style="font-size: 50px; margin-bottom: 15px;">ğŸ®</div>
                        <div style="font-size: 16px; margin-bottom: 10px;">HenÃ¼z oyun eklenmemiÅŸ</div>
                        <div style="font-size: 13px; color: #666;">Admin panelden yeni oyun ekleyebilirsiniz</div>
                    </div>
                `;
            }
            
            grid.innerHTML = html;
            console.log('Oyunlar render edildi, aktif:', activeGames);
        } catch(e) {
            console.error('renderHomeGames hatasÄ±:', e);
            grid.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #f44336;">
                    <div style="font-size: 50px; margin-bottom: 15px;">âš ï¸</div>
                    <div>Oyunlar gÃ¶rÃ¼ntÃ¼lenirken hata oluÅŸtu</div>
                </div>
            `;
        }
    }
    
    // Oyun detay sayfasÄ±nÄ± aÃ§
    function openGameDetail(gameId) {
        const game = gamesData[gameId];
        if (!game) {
            showToast('âŒ Oyun bulunamadÄ±!');
            return;
        }
        
        currentDynamicGame = { id: gameId, ...game };
        
        // Sayfa elemanlarÄ±nÄ± gÃ¼ncelle
        document.getElementById('dynamicGameIcon').src = game.image || '';
        document.getElementById('dynamicGameTitle').textContent = game.name;
        document.getElementById('dynamicGameDesc').textContent = game.desc || 'Oyun hileleri';
        
        // Hileleri listele (sortOrder'a gÃ¶re sÄ±ralÄ±)
        const cheatsGrid = document.getElementById('dynamicCheatsGrid');
        const cheats = game.cheats || {};
        let cheatsHtml = '';
        
        // Hileleri sÄ±rala
        const cheatIds = Object.keys(cheats).sort((a, b) => {
            const orderA = cheats[a].sortOrder ?? 999;
            const orderB = cheats[b].sortOrder ?? 999;
            return orderA - orderB;
        });
        
        cheatIds.forEach(cheatId => {
            const cheat = cheats[cheatId];
            if (cheat.status === 'inactive' && !currentUser) return; // GiriÅŸ yapmamÄ±ÅŸsa pasif hileleri gÃ¶sterme
            
            const version = cheat.version || '';
            let statusBadge = version ? `${version} â€¢ Aktif` : 'Aktif';
            let badgeStyle = 'background: linear-gradient(135deg, #4CAF50, #45a049);';
            
            if (cheat.status === 'maintenance') {
                statusBadge = `${version} â€¢ ğŸ”§ BakÄ±mda`;
                badgeStyle = 'background: linear-gradient(135deg, #FF9800, #F57C00);';
            } else if (cheat.status === 'inactive') {
                statusBadge = `${version} â€¢ â¸ï¸ Pasif`;
                badgeStyle = 'background: linear-gradient(135deg, #f44336, #d32f2f);';
            }
            
            const imgSrc = cheat.image && cheat.image.startsWith('data:') 
                ? cheat.image 
                : (cheat.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%234CAF50%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>ğŸ—¡</text></svg>');
            
            cheatsHtml += `
                <div class="game-card" onclick="openCheatDetail('${gameId}', '${cheatId}')">
                    <img src="${imgSrc}" alt="${cheat.name}" class="game-icon">
                    <div class="game-info">
                        <div class="game-name">${cheat.name}</div>
                        <div class="game-desc">${cheat.desc || 'Hile aÃ§Ä±klamasÄ±'}</div>
                        <div class="game-badge" style="${badgeStyle}">${statusBadge}</div>
                    </div>
                    <div class="game-arrow">â€º</div>
                </div>
            `;
        });
        
        if (!cheatsHtml) {
            cheatsHtml = `
                <div style="text-align: center; padding: 30px; color: #888;">
                    <div style="font-size: 50px; margin-bottom: 15px;">ğŸ—¡ï¸</div>
                    <div>Bu oyun iÃ§in henÃ¼z hile eklenmemiÅŸ</div>
                </div>
            `;
        }
        
        cheatsGrid.innerHTML = cheatsHtml;
        navigateTo('dynamicGamePage');
    }
    
    // Hile detay sayfasÄ±nÄ± aÃ§
    async function openCheatDetail(gameId, cheatId) {
        const game = gamesData[gameId];
        const cheat = game?.cheats?.[cheatId];
        
        if (!cheat) {
            showToast('âŒ Hile bulunamadÄ±!');
            return;
        }
        
        currentDynamicGame = { id: gameId, ...game };
        currentDynamicCheat = { id: cheatId, gameId, ...cheat };
        selectedDynamicPrice = null;
        
        // Sayfa elemanlarÄ±nÄ± gÃ¼ncelle
        document.getElementById('dynamicCheatIcon').src = cheat.image || '';
        document.getElementById('dynamicCheatTitle').textContent = cheat.name;
        document.getElementById('dynamicCheatSubtitle').textContent = `${game.name} â€¢ ${cheat.version || ''}`;
        
        // Durum uyarÄ±larÄ±
        document.getElementById('dynamicCheatMaintenanceWarning').style.display = cheat.status === 'maintenance' ? 'block' : 'none';
        document.getElementById('dynamicCheatInactiveWarning').style.display = cheat.status === 'inactive' ? 'block' : 'none';
        
        // Ã–zellikleri grid yapÄ±sÄ±nda listele
        const featuresDiv = document.getElementById('dynamicCheatFeatures');
        const features = cheat.features || [];
        featuresDiv.innerHTML = features.map(f => `
            <div class="feature-item-new">${f}</div>
        `).join('');
        
        // Video butonu - eÄŸer videoUrl varsa gÃ¶ster
        const videoSection = document.getElementById('dynamicVideoSection');
        if (cheat.videoUrl) {
            videoSection.style.display = 'block';
            window.currentCheatVideoUrl = cheat.videoUrl;
        } else {
            videoSection.style.display = 'none';
        }
        
        // FiyatlarÄ± listele
        const pricesDiv = document.getElementById('dynamicCheatPrices');
        const prices = cheat.prices || [];
        pricesDiv.innerHTML = prices.map((p, i) => `
            <div class="price-card ${i === prices.length - 1 ? 'premium' : ''}" onclick="selectDynamicPrice(${i})">
                <div class="price-label">${p.label}</div>
                <div class="price-value">${p.price}</div>
            </div>
        `).join('');
        
        // Aktif Ã¼yelik kontrolÃ¼
        let hasAccess = false;
        let membershipInfo = '';
        
        if (currentUser) {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const keys = userData.keys || [];
                const now = new Date();
                
                // Bu oyun ve hile iÃ§in aktif key var mÄ±?
                const activeKey = keys.find(key => {
                    if (key.game === game.name && key.cheat === cheat.name) {
                        if (key.days === 'unlimited' || key.days === 0) return true;
                        if (key.expiresAt && key.expiresAt.toDate() > now) return true;
                    }
                    return false;
                });
                
                if (activeKey) {
                    hasAccess = true;
                    if (activeKey.days === 'unlimited' || activeKey.days === 0) {
                        membershipInfo = 'â­ SÄ±nÄ±rsÄ±z Ãœyelik';
                    } else if (activeKey.expiresAt) {
                        const expDate = activeKey.expiresAt.toDate();
                        const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                        membershipInfo = `ğŸ“… ${daysLeft} gÃ¼n kaldÄ± (${expDate.toLocaleDateString('tr-TR')})`;
                    }
                }
            }
        }
        
        // Kurulum talimatlarÄ± ve Ã¼yelik bÃ¶lÃ¼mlerini gÃ¼ncelle
        document.getElementById('dynamicSetupLocked').style.display = hasAccess ? 'none' : 'block';
        document.getElementById('dynamicSetupUnlocked').style.display = hasAccess ? 'block' : 'none';
        document.getElementById('dynamicActiveMembership').style.display = hasAccess ? 'block' : 'none';
        
        if (hasAccess) {
            document.getElementById('dynamicMembershipInfo').textContent = membershipInfo;
        }
        
        // Kurulum adÄ±mlarÄ±nÄ± render et
        const stepsDiv = document.getElementById('dynamicSetupSteps');
        if (hasAccess) {
            // Ã–nce Firestore'dan kurulum adÄ±mlarÄ±nÄ± kontrol et
            let setupSteps = cheat.setupSteps || [];
            
            // EÄŸer setupSteps boÅŸsa ve TheBestML IMGUI ise varsayÄ±lan adÄ±mlarÄ± kullan
            if (setupSteps.length === 0 && cheat.name && cheat.name.toLowerCase().includes('imgui')) {
                setupSteps = [
                    {
                        title: '1ï¸âƒ£ Orijinal ML Ä°ndirin',
                        description: 'Playstoreden Mobile Legends orijinal sÃ¼rÃ¼mÃ¼nÃ¼ indirin.',
                        actionType: 'playstore'
                    },
                    {
                        title: '2ï¸âƒ£ SertifikalarÄ± KapatÄ±n',
                        description: 'Bypass korumasÄ±nÄ±n Ã§alÄ±ÅŸabilmesi iÃ§in sertifikalarÄ± kapatÄ±n. AÅŸaÄŸÄ±daki butona tÄ±klayarak video rehberi izleyin.',
                        actionType: 'modal',
                        modalId: 'imguiModal'
                    },
                    {
                        title: '3ï¸âƒ£ IMGUI APK Ä°ndirin',
                        description: 'TheBestML IMGUI APK dosyasÄ±nÄ± indirin ve kurun.',
                        actionType: 'download',
                        downloadUrl: cheat.apkUrl || 'https://dosya.co/dho18v1fbzq0/THEBEST_IMGUI-v2.8.apk.html'
                    },
                    {
                        title: '4ï¸âƒ£ Spa DosyasÄ±nÄ± Ã‡alÄ±ÅŸtÄ±rÄ±n',
                        description: 'Ä°ndirdiÄŸiniz TheBestML Spa dosyasÄ±nÄ± Ã§alÄ±ÅŸtÄ±rÄ±n ve karÅŸÄ±nÄ±za Ã§Ä±kan ekrandan izinleri verin.',
                        actionType: 'none'
                    },
                    {
                        title: '5ï¸âƒ£ ML KlonlayÄ±n',
                        description: 'Listeden Mobile Legends\'Ä± seÃ§in ve "Klon" yazÄ±sÄ±na tÄ±klayÄ±n.',
                        actionType: 'none'
                    },
                    {
                        title: '6ï¸âƒ£ Klonlanan ML\'yi BaÅŸlatÄ±n',
                        description: 'KlonladÄ±ÄŸÄ±nÄ±z ML sÃ¼rÃ¼mÃ¼nÃ¼ baÅŸlatÄ±n ve hesabÄ±m kÄ±smÄ±ndaki KEY\'iniz ile giriÅŸ yapÄ±n. IMGUI menÃ¼sÃ¼ oyun iÃ§inde gÃ¶rÃ¼necektir.',
                        actionType: 'none'
                    }
                ];
            }
            
            if (setupSteps.length > 0) {
                // Admin panelden eklenen Ã¶zel kurulum adÄ±mlarÄ±
                stepsDiv.innerHTML = setupSteps.map((step, i) => `
                    <div class="setup-step">
                        <div class="setup-step-header">
                            <div class="setup-step-number">${i + 1}</div>
                            <div class="setup-step-title">${step.title}</div>
                        </div>
                        <div class="setup-step-desc">${step.description}</div>
                        ${step.actionType === 'playstore' ? `
                            <div class="setup-step-action">
                                <button class="btn btn-secondary btn-small" onclick="openPlayStore()">
                                    ğŸ® Play Store'dan Ä°ndir
                                </button>
                            </div>
                        ` : ''}
                        ${step.actionType === 'download' && step.downloadUrl ? `
                            <div class="setup-step-action">
                                <button class="btn btn-secondary btn-small" onclick="downloadDynamicApk('${step.downloadUrl}')">
                                    ğŸ“¥ APK Ä°ndir
                                </button>
                            </div>
                        ` : ''}
                        ${step.actionType === 'modal' && step.modalId ? `
                            <div class="setup-step-action">
                                <button class="detail-btn" onclick="openDynamicSetupModal('${step.modalId}')">
                                    ğŸ“– DetaylÄ± Kurulum Rehberi
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            } else {
                // VarsayÄ±lan kurulum adÄ±mlarÄ±
                stepsDiv.innerHTML = `
                    <div class="setup-step">
                        <div class="setup-step-header">
                            <div class="setup-step-number">1</div>
                            <div class="setup-step-title">${game.name} Ä°ndir</div>
                        </div>
                        <div class="setup-step-desc">
                            Play Store'dan orijinal ${game.name} oyununu indirin ve kurun.
                        </div>
                        <div class="setup-step-action">
                            <button class="btn btn-secondary btn-small" onclick="openPlayStore()">
                                ğŸ® Play Store'dan Ä°ndir
                            </button>
                        </div>
                    </div>
                    
                    <div class="setup-step">
                        <div class="setup-step-header">
                            <div class="setup-step-number">2</div>
                            <div class="setup-step-title">${cheat.name} APK Ä°ndir</div>
                        </div>
                        <div class="setup-step-desc">
                            ${cheat.name} APK dosyasÄ±nÄ± indirin ve kurulum adÄ±mlarÄ±nÄ± takip edin.
                        </div>
                        ${cheat.apkUrl ? `
                            <div class="setup-step-action">
                                <button class="btn btn-secondary btn-small" onclick="downloadDynamicApk('${cheat.apkUrl}')">
                                    ğŸ“¥ APK Ä°ndir
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="setup-step" style="border-color: #4CAF50;">
                        <div class="setup-step-header">
                            <div class="setup-step-number" style="background: linear-gradient(135deg, #4CAF50, #45a049);">3</div>
                            <div class="setup-step-title">Oyuna GiriÅŸ Yap</div>
                        </div>
                        <div class="setup-step-desc">
                            Oyuna giriÅŸ yapÄ±n, key giriÅŸ ekranÄ±na geldiÄŸinizde hesabÄ±m kÄ±smÄ±ndaki key'inizi kopyalayÄ±p yapÄ±ÅŸtÄ±rÄ±n.
                        </div>
                    </div>
                `;
            }
        }
        
        // SatÄ±n al butonu gÃ¼ncelle
        document.getElementById('dynamicSelectedPrice').textContent = 'Fiyat seÃ§in';
        
        navigateTo('dynamicCheatPage');
    }
    
    // Dinamik video modalÄ±nÄ± aÃ§
    function openDynamicVideoModal() {
        if (window.currentCheatVideoUrl) {
            // YouTube video ID'sini Ã§Ä±kar
            const videoId = extractYouTubeId(window.currentCheatVideoUrl);
            if (videoId) {
                openYouTubeVideo(videoId);
            } else {
                // Direkt URL aÃ§
                window.open(window.currentCheatVideoUrl, '_blank');
            }
        }
    }
    
    // YouTube video ID Ã§Ä±karma
    function extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    // YouTube video aÃ§ma
    function openYouTubeVideo(videoId) {
        if (videoId) {
            // Modal iÃ§inde YouTube iframe gÃ¶ster
            const container = document.getElementById('youtubeVideoContainer');
            container.innerHTML = `
                <iframe 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
            
            // Ã–zellikleri ekle
            const featuresContainer = document.getElementById('videoModalFeatures');
            const features = currentDynamicCheat?.features || [];
            
            if (features.length > 0) {
                let featuresHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">`;
                
                features.forEach(feature => {
                    featuresHtml += `
                        <div style="background: linear-gradient(135deg, rgba(156,39,176,0.2), rgba(103,58,183,0.2)); 
                                    border: 1px solid rgba(156,39,176,0.3); 
                                    border-radius: 12px; 
                                    padding: 12px; 
                                    font-size: 13px; 
                                    color: #ddd; 
                                    display: flex; 
                                    align-items: center; 
                                    gap: 8px;">
                            <span style="color: #4CAF50; font-size: 16px;">âœ“</span>
                            ${feature}
                        </div>
                    `;
                });
                
                featuresHtml += '</div>';
                featuresContainer.innerHTML = featuresHtml;
            } else {
                featuresContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 15px;">Ã–zellik bilgisi yok</p>';
            }
            
            openModal('youtubeVideoModal');
        } else {
            showToast('âš ï¸ Video aÃ§Ä±lamadÄ±!');
        }
    }
    
    // Video modal'daki Ã¶zellikleri aÃ§/kapa
    function toggleVideoFeatures() {
        const container = document.getElementById('videoModalFeatures');
        const icon = document.getElementById('videoFeaturesToggleIcon');
        
        if (container.style.maxHeight === '0px' || container.style.maxHeight === '') {
            // AÃ§
            container.style.maxHeight = container.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
        } else {
            // Kapat
            container.style.maxHeight = '0px';
            icon.style.transform = 'rotate(0deg)';
        }
    }
    
    // Dinamik APK indirme
    function downloadDynamicApk(url) {
        if (url) {
            window.open(url, '_blank');
        } else {
            showToast('âš ï¸ Ä°ndirme linki bulunamadÄ±!');
        }
    }
    
    // Dinamik fiyat seÃ§imi
    function selectDynamicPrice(index) {
        // GiriÅŸ kontrolÃ¼
        if (!requireLogin('satÄ±n alma iÅŸlemi yapmak')) return;
        
        const prices = currentDynamicCheat?.prices || [];
        if (index < 0 || index >= prices.length) return;
        
        selectedDynamicPrice = prices[index];
        
        // UI gÃ¼ncelle
        document.querySelectorAll('#dynamicCheatPrices .price-card').forEach((card, i) => {
            card.classList.toggle('selected', i === index);
        });
        
        document.getElementById('dynamicSelectedPrice').textContent = `${selectedDynamicPrice.label} - ${selectedDynamicPrice.price}`;
    }
    
    // Dinamik satÄ±n alma modalÄ±nÄ± aÃ§
    function openDynamicBuyModal() {
        if (!requireLogin('satÄ±n alma iÅŸlemi yapmak')) return;
        
        if (!selectedDynamicPrice) {
            showToast('âš ï¸ LÃ¼tfen bir fiyat seÃ§in!');
            return;
        }
        
        // SipariÅŸ iÃ§in bilgileri kaydet
        window.pendingDynamicOrder = {
            game: currentDynamicGame.name,
            gameId: currentDynamicGame.id,
            cheat: currentDynamicCheat.name,
            cheatId: currentDynamicCheat.id,
            days: selectedDynamicPrice.days,
            label: selectedDynamicPrice.label,
            price: selectedDynamicPrice.price
        };
        
        // Merkezi Ã¶deme sistemini kullan
        openUnifiedPaymentModal({
            type: 'purchase',
            game: currentDynamicGame.name,
            cheat: currentDynamicCheat.name,
            gameId: currentDynamicGame.id,
            cheatId: currentDynamicCheat.id,
            package: selectedDynamicPrice.days,
            packageName: `${currentDynamicCheat.name} - ${selectedDynamicPrice.label}`,
            price: selectedDynamicPrice.price,
            days: selectedDynamicPrice.days,
            shopierLink: selectedDynamicPrice.shopierLink || null
        });
    }
    
    // Dinamik Ã¶deme yÃ¶ntemi seÃ§ (eski - geriye uyumluluk)
    function selectDynamicPaymentMethod(method) {
        closeModal('dynamicPaymentModal');
        const order = window.pendingDynamicOrder;
        
        if (method === 'shopier') {
            // Kredi kartÄ± geÃ§ici olarak devre dÄ±ÅŸÄ±
            showToast('âš ï¸ Kredi kartÄ± ile Ã¶deme yakÄ±nda aktif olacak!');
            return;
        } else if (method === 'havale') {
            // Havale bilgilerini gÃ¶ster
            const havalePackageInfo = document.getElementById('havalePackageInfo');
            const havaleAmount = document.getElementById('havaleAmount');
            
            if (havalePackageInfo && havaleAmount && order) {
                havalePackageInfo.textContent = `${order.cheat} - ${order.label}`;
                havaleAmount.textContent = order.price;
            }
            
            // Dinamik sipariÅŸ bilgisini global olarak sakla (dekont gÃ¶nderildiÄŸinde kullanÄ±lacak)
            window.isDynamicOrder = true;
            
            openModal('havaleModal');
            // NOT: SipariÅŸ, dekont yÃ¼klendikten ve gÃ¶nder butonuna basÄ±ldÄ±ktan sonra kaydedilecek
        }
    }
    
    // Dinamik sipariÅŸ kaydet
    async function saveDynamicOrder(paymentMethod) {
        const order = window.pendingDynamicOrder;
        if (!order || !currentUser) return;
        
        try {
            const orderData = {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                game: order.game,
                gameId: order.gameId,
                cheat: order.cheat,
                cheatId: order.cheatId,
                days: order.days,
                packageName: `${order.cheat} - ${order.label}`,
                label: order.label,
                price: order.price,
                paymentMethod: paymentMethod,
                status: 'pending',
                createdAt: new Date()
            };
            
            await db.collection('orders').add(orderData);
            updateOrderBadge();

            // Admin'lere yeni sipariÅŸ bildirimi gÃ¶nder
            try {
                await sendNewOrderNotificationToAdmins(currentUser.email, orderData.packageName, orderData.price);
            } catch (e) {}
            
            // Fiyat seÃ§imini sÄ±fÄ±rla
            selectedDynamicPrice = null;
            document.querySelectorAll('#dynamicCheatPrices .price-card').forEach(card => card.classList.remove('selected'));
            document.getElementById('dynamicSelectedPrice').textContent = 'Fiyat seÃ§in';
            
            // BaÅŸarÄ± modalÄ±nÄ± gÃ¶ster
            showOrderSuccessModal();
            
        } catch(e) {
            console.error('SipariÅŸ hatasÄ±:', e);
            showToast('âŒ SipariÅŸ gÃ¶nderilemedi: ' + e.message);
        }
    }
    
    // Hile durum badge'lerini gÃ¼ncelle (kullanÄ±cÄ± tarafÄ±)
    function updateCheatStatusBadges() {
        // TheBestML iÃ§in
        const thebestmlBadge = document.getElementById('thebestmlStatusBadge');
        if (thebestmlBadge && gamesData.mobile_legends?.cheats?.thebestml) {
            const cheat = gamesData.mobile_legends.cheats.thebestml;
            const version = cheat.version || 'V2.8';
            
            if (cheat.status === 'maintenance') {
                thebestmlBadge.textContent = `${version} â€¢ ğŸ”§ BakÄ±mda`;
                thebestmlBadge.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
            } else if (cheat.status === 'inactive') {
                thebestmlBadge.textContent = `${version} â€¢ â¸ï¸ Pasif`;
                thebestmlBadge.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
            } else {
                thebestmlBadge.textContent = `${version} â€¢ Aktif`;
                thebestmlBadge.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            }
        }
    }
    
    // Hile sayfasÄ±na girince durumu kontrol et
    function checkCheatStatus(gameId, cheatId) {
        const cheat = gamesData[gameId]?.cheats?.[cheatId];
        if (!cheat) return;
        
        const maintenanceWarning = document.getElementById('cheatMaintenanceWarning');
        const inactiveWarning = document.getElementById('cheatInactiveWarning');
        
        // Ã–nce tÃ¼m uyarÄ±larÄ± gizle
        if (maintenanceWarning) maintenanceWarning.style.display = 'none';
        if (inactiveWarning) inactiveWarning.style.display = 'none';
        
        if (cheat.status === 'maintenance') {
            if (maintenanceWarning) maintenanceWarning.style.display = 'block';
        } else if (cheat.status === 'inactive') {
            if (inactiveWarning) inactiveWarning.style.display = 'block';
        }
    }
    
    // VeritabanÄ±na kaydet - Belirli bir oyunu kaydet
    async function saveGameData(gameId) {
        try {
            if (!gamesData[gameId]) {
                throw new Error('Oyun bulunamadÄ±: ' + gameId);
            }
            await db.collection('games').doc(gameId).set(gamesData[gameId]);
            updateCheatStatusBadges();
            return true;
        } catch(e) {
            console.error('Kaydetme hatasÄ±:', e);
            showToast('âŒ Kaydetme hatasÄ±: ' + e.message);
            return false;
        }
    }
    
    // TÃ¼m oyunlarÄ± kaydet (eski uyumluluk iÃ§in)
    async function saveGamesData() {
        try {
            const promises = Object.keys(gamesData).map(gameId => 
                db.collection('games').doc(gameId).set(gamesData[gameId])
            );
            await Promise.all(promises);
            updateCheatStatusBadges();
            return true;
        } catch(e) {
            console.error('Kaydetme hatasÄ±:', e);
            showToast('âŒ Kaydetme hatasÄ±: ' + e.message);
            return false;
        }
    }
    
    // TÃ¼m oyun selectlerini gÃ¼ncelle
    function updateGameSelects() {
        const selects = ['adminGame', 'cheatGameSelect', 'cheatUpdateGame'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">ğŸ® Oyun SeÃ§in...</option>';
                Object.keys(gamesData).forEach(gameId => {
                    const game = gamesData[gameId];
                    if (game.status === 'active') {
                        select.innerHTML += `<option value="${gameId}">ğŸ® ${game.name}</option>`;
                    }
                });
            }
        });
    }
    
    // Oyun seÃ§ilince hileleri gÃ¼ncelle
    function updateCheatOptions() {
        const gameSelect = document.getElementById('adminGame');
        const cheatSelect = document.getElementById('adminCheat');
        const selectedGameId = gameSelect.value;
        
        if (!selectedGameId || !gamesData[selectedGameId]) {
            cheatSelect.innerHTML = '<option value="">ğŸ›¡ï¸ Ã–nce oyun seÃ§in...</option>';
            cheatSelect.disabled = true;
            return;
        }
        
        const cheats = gamesData[selectedGameId].cheats || {};
        cheatSelect.innerHTML = '';
        
        const cheatIds = Object.keys(cheats);
        if (cheatIds.length === 0) {
            cheatSelect.innerHTML = '<option value="">ğŸ›¡ï¸ Bu oyun iÃ§in hile yok</option>';
            cheatSelect.disabled = true;
        } else {
            cheatIds.forEach(cheatId => {
                const cheat = cheats[cheatId];
                if (cheat.status === 'active') {
                    cheatSelect.innerHTML += `<option value="${cheatId}">ğŸ›¡ï¸ ${cheat.name}</option>`;
                }
            });
            cheatSelect.disabled = false;
        }
    }

    // Hile GÃ¼ncelleme: oyun seÃ§ilince hile listesini gÃ¼ncelle
    function updateCheatUpdateOptions() {
        const gameSelect = document.getElementById('cheatUpdateGame');
        const cheatSelect = document.getElementById('cheatUpdateCheat');
        const versionInput = document.getElementById('cheatUpdateVersion');
        const apkUrlInput = document.getElementById('cheatUpdateApkUrl');

        const selectedGameId = gameSelect?.value;

        if (!selectedGameId || !gamesData[selectedGameId]) {
            if (cheatSelect) {
                cheatSelect.innerHTML = '<option value="">ğŸ›¡ï¸ Ã–nce oyun seÃ§in...</option>';
                cheatSelect.disabled = true;
            }
            if (versionInput) versionInput.value = '';
            if (apkUrlInput) apkUrlInput.value = '';
            return;
        }

        const cheats = gamesData[selectedGameId].cheats || {};
        const cheatIds = Object.keys(cheats);

        if (!cheatSelect) return;

        cheatSelect.innerHTML = '';
        if (cheatIds.length === 0) {
            cheatSelect.innerHTML = '<option value="">ğŸ›¡ï¸ Bu oyun iÃ§in hile yok</option>';
            cheatSelect.disabled = true;
            if (versionInput) versionInput.value = '';
            if (apkUrlInput) apkUrlInput.value = '';
            return;
        }

        cheatIds.forEach(cheatId => {
            const cheat = cheats[cheatId] || {};
            const status = cheat.status ? ` (${cheat.status})` : '';
            cheatSelect.innerHTML += `<option value="${cheatId}">ğŸ›¡ï¸ ${cheat.name || cheatId}${status}</option>`;
        });

        cheatSelect.disabled = false;
        fillCheatUpdateFields();
    }

    // Hile GÃ¼ncelleme: seÃ§ili hilenin mevcut alanlarÄ±nÄ± inputlara bas
    function fillCheatUpdateFields() {
        const gameId = document.getElementById('cheatUpdateGame')?.value;
        const cheatId = document.getElementById('cheatUpdateCheat')?.value;
        const versionInput = document.getElementById('cheatUpdateVersion');
        const apkUrlInput = document.getElementById('cheatUpdateApkUrl');

        if (!gameId || !cheatId || !gamesData[gameId]?.cheats?.[cheatId]) {
            if (versionInput) versionInput.value = '';
            if (apkUrlInput) apkUrlInput.value = '';
            return;
        }

        const cheat = gamesData[gameId].cheats[cheatId];
        if (versionInput) versionInput.value = cheat.version || '';
        if (apkUrlInput) apkUrlInput.value = cheat.apkUrl || '';
    }

    // Hile GÃ¼ncelleme: kaydet + tÃ¼m kullanÄ±cÄ±lara bildirim (Firestore + FCM topic)
    async function adminUpdateCheatFilesAndNotify() {
        if (!requirePermission('games', 'hile gÃ¼ncellemek')) return;

        const gameId = document.getElementById('cheatUpdateGame')?.value;
        const cheatId = document.getElementById('cheatUpdateCheat')?.value;
        const newVersion = document.getElementById('cheatUpdateVersion')?.value.trim();
        const newApkUrl = document.getElementById('cheatUpdateApkUrl')?.value.trim();

        if (!gameId || !gamesData[gameId]) { showToast('âŒ Oyun seÃ§in'); return; }
        if (!cheatId || !gamesData[gameId]?.cheats?.[cheatId]) { showToast('âŒ Hile seÃ§in'); return; }

        if (!newVersion && !newApkUrl) {
            showToast('âš ï¸ En az bir alan girin (versiyon veya apkUrl)');
            return;
        }

        try {
            const game = gamesData[gameId];
            const cheat = gamesData[gameId].cheats[cheatId];
            const oldApkUrl = cheat.apkUrl || '';

            // DeÄŸiÅŸiklikleri uygula
            if (newVersion) cheat.version = newVersion;
            if (newApkUrl) {
                cheat.apkUrl = newApkUrl;

                // Kurulum adÄ±mlarÄ±ndaki APK indirme linkini de senkronla
                if (Array.isArray(cheat.setupSteps)) {
                    cheat.setupSteps.forEach(step => {
                        if ((step?.actionType || 'none') === 'download') {
                            step.downloadUrl = newApkUrl;
                        }
                    });
                }
            }
            cheat.lastUpdatedAt = new Date().toISOString();
            cheat.lastUpdatedBy = currentUser?.email || 'admin';

            // Firestore'a kaydet (oyun dokÃ¼manÄ± iÃ§inde)
            const saved = await saveGameData(gameId);
            if (!saved) return;

            const title = 'ğŸ›¡ï¸ Hile GÃ¼ncellendi';
            const versionPart = cheat.version ? ` v${cheat.version}` : '';
            const message = `${game.name} â€¢ ${cheat.name}${versionPart} gÃ¼ncellendi. Uygulamadan indirip kullanabilirsiniz.`;

            // 1) Uygulama iÃ§i (Firestore) bildirim
            await db.collection('notifications').add({
                targetType: 'all',
                targetEmail: null,
                title,
                message,
                type: 'info',
                event: 'cheat_updated',
                gameId: gameId,
                cheatId: cheatId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser?.email || 'system',
                read: false,
                notifiedAt: new Date().toISOString()
            });

            // 2) FCM topic push (all_users)
            await sendPushToAll(title, message, { type: 'info', event: 'cheat_updated', gameId, cheatId });

            showToast('âœ… GÃ¼ncellendi ve bildirim gÃ¶nderildi');
        } catch (e) {
            console.error('Hile gÃ¼ncelleme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // ==================== OYUN MODAL FONKSÄ°YONLARI ====================
    
    function openGameModal(gameId = null) {
        if (!requirePermission('games', 'oyun eklemek/dÃ¼zenlemek')) return;
        
        document.getElementById('editGameId').value = gameId || '';
        document.getElementById('gameModalTitle').textContent = gameId ? 'ğŸ® Oyun DÃ¼zenle' : 'ğŸ® Yeni Oyun Ekle';
        
        // GÃ¶rsel input'larÄ± temizle
        document.getElementById('gameImageFile').value = '';
        document.getElementById('gameImageData').value = '';
        document.getElementById('gameImageLabel').textContent = 'ğŸ“· GÃ¶rsel SeÃ§ (PNG, JPG)';
        
        if (gameId && gamesData[gameId]) {
            const game = gamesData[gameId];
            document.getElementById('gameNameInput').value = game.name || '';
            document.getElementById('gameImageData').value = game.image || '';
            document.getElementById('gameDescInput').value = game.desc || '';
            document.getElementById('gamePlayStoreInput').value = game.playStore || '';
            document.getElementById('gameStatusInput').value = game.status || 'active';
            
            // Mevcut gÃ¶rsel varsa gÃ¶ster
            if (game.image) {
                document.getElementById('gameImagePreview').innerHTML = `
                    <img src="${game.image}" style="max-width: 100px; max-height: 100px; border-radius: 15px;">
                    <div style="font-size: 11px; color: #4CAF50; margin-top: 5px;">âœ… Mevcut gÃ¶rsel</div>
                `;
                document.getElementById('gameImageLabel').textContent = 'ğŸ“· Yeni GÃ¶rsel SeÃ§ (deÄŸiÅŸtirmek iÃ§in)';
            } else {
                document.getElementById('gameImagePreview').innerHTML = '';
            }
        } else {
            document.getElementById('gameNameInput').value = '';
            document.getElementById('gameDescInput').value = '';
            document.getElementById('gamePlayStoreInput').value = '';
            document.getElementById('gameStatusInput').value = 'active';
            document.getElementById('gameImagePreview').innerHTML = '';
        }
        
        openModal('gameModal');
    }
    
    // Dosya Ã¶nizleme - Oyun
    function previewGameImageFile(input) {
        const file = input.files[0];
        if (!file) return;
        
        // Dosya boyut kontrolÃ¼ (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('âŒ Dosya Ã§ok bÃ¼yÃ¼k (max 2MB)');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            document.getElementById('gameImageData').value = base64;
            document.getElementById('gameImagePreview').innerHTML = `
                <img src="${base64}" style="max-width: 100px; max-height: 100px; border-radius: 15px;">
                <div style="font-size: 11px; color: #4CAF50; margin-top: 5px;">âœ… ${file.name}</div>
            `;
            document.getElementById('gameImageLabel').textContent = 'ğŸ“· ' + file.name;
        };
        reader.readAsDataURL(file);
    }
    
    function previewGameImage() {
        // ArtÄ±k kullanÄ±lmÄ±yor - dosya yÃ¼kleme kullanÄ±lÄ±yor
    }
    
    async function saveGame() {
        if (!requirePermission('games', 'oyun kaydetmek')) return;
        
        const gameId = document.getElementById('editGameId').value;
        const name = document.getElementById('gameNameInput').value.trim();
        const image = document.getElementById('gameImageData').value.trim();
        const desc = document.getElementById('gameDescInput').value.trim();
        const playStore = document.getElementById('gamePlayStoreInput').value.trim();
        const status = document.getElementById('gameStatusInput').value;
        
        if (!name) { showToast('âŒ Oyun adÄ± girin'); return; }
        
        // ID oluÅŸtur veya mevcut ID'yi kullan
        const newGameId = gameId || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        if (!gameId && gamesData[newGameId]) {
            showToast('âš ï¸ Bu isimde bir oyun zaten var');
            return;
        }
        
        // Mevcut gÃ¶rsel varsa ve yeni yÃ¼klenmemiÅŸse eski gÃ¶rseli koru
        const existingImage = gamesData[newGameId]?.image || '';
        const finalImage = image || existingImage;
        
        gamesData[newGameId] = {
            ...gamesData[newGameId],
            name, 
            image: finalImage, 
            desc, playStore, status,
            cheats: gamesData[newGameId]?.cheats || {}
        };
        
        // Sadece deÄŸiÅŸtirilen oyunu kaydet
        if (await saveGameData(newGameId)) {
            showToast('âœ… Oyun kaydedildi!');
            closeModal('gameModal');
            updateGameSelects();
            loadGameCheatList();
            renderHomeGames(); // Ana sayfayÄ± anÄ±nda gÃ¼ncelle
            
            // EÄŸer oyun detay sayfasÄ± aÃ§Ä±ksa onu da gÃ¼ncelle
            if (currentDynamicGame && currentDynamicGame.id === newGameId) {
                currentDynamicGame = { id: newGameId, ...gamesData[newGameId] };
                document.getElementById('dynamicGameIcon').src = finalImage || '';
                document.getElementById('dynamicGameTitle').textContent = name;
                document.getElementById('dynamicGameDesc').textContent = desc || 'Oyun hileleri';
            }
        }
    }
    
    // ==================== HÄ°LE MODAL FONKSÄ°YONLARI ====================
    
    let currentPrices = []; // Dinamik fiyat listesi
    
    function openCheatModal(gameId = null, cheatId = null) {
        if (!requirePermission('games', 'hile eklemek/dÃ¼zenlemek')) return;
        
        document.getElementById('editCheatId').value = cheatId || '';
        document.getElementById('editCheatGameId').value = gameId || '';
        document.getElementById('cheatModalTitle').textContent = cheatId ? 'ğŸ›¡ï¸ Hile DÃ¼zenle' : 'ğŸ›¡ï¸ Yeni Hile Ekle';
        
        // Oyun selectini gÃ¼ncelle
        const gameSelect = document.getElementById('cheatGameSelect');
        gameSelect.innerHTML = '<option value="">Oyun seÃ§in...</option>';
        Object.keys(gamesData).forEach(gId => {
            const game = gamesData[gId];
            gameSelect.innerHTML += `<option value="${gId}" ${gId === gameId ? 'selected' : ''}>${game.name}</option>`;
        });
        
        // GÃ¶rsel input'larÄ± temizle
        document.getElementById('cheatImageFile').value = '';
        document.getElementById('cheatImageData').value = '';
        document.getElementById('cheatImageLabel').textContent = 'ğŸ“· GÃ¶rsel SeÃ§ (PNG, JPG)';
        
        if (cheatId && gameId && gamesData[gameId]?.cheats?.[cheatId]) {
            const cheat = gamesData[gameId].cheats[cheatId];
            document.getElementById('cheatNameInput').value = cheat.name || '';
            document.getElementById('cheatImageData').value = cheat.image || '';
            document.getElementById('cheatVersionInput').value = cheat.version || '';
            document.getElementById('cheatDescInput').value = cheat.desc || '';
            document.getElementById('cheatApkInput').value = cheat.apkUrl || '';
            document.getElementById('cheatVideoInput').value = cheat.videoUrl || '';
            document.getElementById('cheatFeaturesInput').value = (cheat.features || []).join('\n');
            document.getElementById('cheatStatusInput').value = cheat.status || 'active';
            
            // FiyatlarÄ± yÃ¼kle - eski format (object) veya yeni format (array) desteÄŸi
            if (Array.isArray(cheat.prices)) {
                currentPrices = [...cheat.prices];
            } else if (cheat.prices && typeof cheat.prices === 'object') {
                // Eski format: { '1': '220â‚º', '30': '850â‚º', ... } -> yeni formata Ã§evir
                currentPrices = Object.entries(cheat.prices).map(([days, price]) => ({
                    days: days,
                    label: days === 'unlimited' ? 'SÄ±nÄ±rsÄ±z' : `${days} GÃ¼n`,
                    price: price
                }));
            } else {
                currentPrices = [];
            }
            renderPriceOptions();
            
            // Mevcut gÃ¶rsel varsa gÃ¶ster
            if (cheat.image) {
                document.getElementById('cheatImagePreview').innerHTML = `
                    <img src="${cheat.image}" style="max-width: 80px; max-height: 80px; border-radius: 12px;">
                    <div style="font-size: 11px; color: #4CAF50; margin-top: 5px;">âœ… Mevcut gÃ¶rsel</div>
                `;
                document.getElementById('cheatImageLabel').textContent = 'ğŸ“· Yeni GÃ¶rsel SeÃ§ (deÄŸiÅŸtirmek iÃ§in)';
            } else {
                document.getElementById('cheatImagePreview').innerHTML = '';
            }
        } else {
            document.getElementById('cheatNameInput').value = '';
            document.getElementById('cheatVersionInput').value = '';
            document.getElementById('cheatDescInput').value = '';
            document.getElementById('cheatApkInput').value = '';
            document.getElementById('cheatVideoInput').value = '';
            document.getElementById('cheatFeaturesInput').value = '';
            document.getElementById('cheatStatusInput').value = 'active';
            document.getElementById('cheatImagePreview').innerHTML = '';
            
            // VarsayÄ±lan fiyatlar
            currentPrices = [
                { days: '1', label: '1 GÃ¼n', price: '220â‚º' },
                { days: '30', label: '30 GÃ¼n', price: '850â‚º' },
                { days: '90', label: '90 GÃ¼n', price: '1800â‚º' },
                { days: 'unlimited', label: 'SÄ±nÄ±rsÄ±z', price: '6500â‚º' }
            ];
            renderPriceOptions();
        }
        
        openModal('cheatModal');
    }
    
    // Dosya Ã¶nizleme
    function previewCheatImageFile(input) {
        const file = input.files[0];
        if (!file) return;
        
        // Dosya boyut kontrolÃ¼ (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('âŒ Dosya Ã§ok bÃ¼yÃ¼k (max 2MB)');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            document.getElementById('cheatImageData').value = base64;
            document.getElementById('cheatImagePreview').innerHTML = `
                <img src="${base64}" style="max-width: 80px; max-height: 80px; border-radius: 12px;">
                <div style="font-size: 11px; color: #4CAF50; margin-top: 5px;">âœ… ${file.name}</div>
            `;
            document.getElementById('cheatImageLabel').textContent = 'ğŸ“· ' + file.name;
        };
        reader.readAsDataURL(file);
    }
    
    // Fiyat seÃ§enekleri render
    function renderPriceOptions() {
        const container = document.getElementById('cheatPricesContainer');
        
        if (currentPrices.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 15px; color: #888; font-size: 12px;">HenÃ¼z fiyat eklenmemiÅŸ</div>';
            return;
        }
        
        let html = '';
        currentPrices.forEach((price, index) => {
            const isUnlimited = price.days === 'unlimited' || price.days === 'sÄ±nÄ±rsÄ±z';
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 10px;">
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                        <input type="text" class="auth-input" placeholder="GÃ¼n" value="${isUnlimited ? 'SÄ±nÄ±rsÄ±z' : price.days}" 
                            onchange="updatePriceOption(${index}, 'days', this.value)" 
                            style="width: 70px; text-align: center; font-size: 12px;">
                        <input type="text" class="auth-input" placeholder="Etiket" value="${price.label || ''}" 
                            onchange="updatePriceOption(${index}, 'label', this.value)" 
                            style="flex: 1; font-size: 12px;">
                        <input type="text" class="auth-input" placeholder="Fiyat" value="${price.price || ''}" 
                            onchange="updatePriceOption(${index}, 'price', this.value)" 
                            style="width: 80px; text-align: center; font-size: 12px;">
                        <button onclick="removePriceOption(${index})" style="background: #f44336; border: none; color: #fff; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 12px;">ğŸ—‘ï¸</button>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 11px; color: #888; white-space: nowrap;">ğŸ›’ Shopier:</span>
                        <input type="text" class="auth-input" placeholder="https://www.shopier.com/CheatsStore/..." value="${price.shopierLink || ''}" 
                            onchange="updatePriceOption(${index}, 'shopierLink', this.value)" 
                            style="flex: 1; font-size: 11px; padding: 8px;">
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function addPriceOption() {
        currentPrices.push({ days: '', label: '', price: '', shopierLink: '' });
        renderPriceOptions();
    }
    
    function updatePriceOption(index, field, value) {
        if (currentPrices[index]) {
            currentPrices[index][field] = value;
        }
    }
    
    function removePriceOption(index) {
        currentPrices.splice(index, 1);
        renderPriceOptions();
    }
    
    function previewCheatImage() {
        // ArtÄ±k kullanÄ±lmÄ±yor - dosya yÃ¼kleme kullanÄ±lÄ±yor
    }
    
    async function saveCheat() {
        if (!requirePermission('games', 'hile eklemek/dÃ¼zenlemek')) return;
        
        const cheatId = document.getElementById('editCheatId').value;
        const originalGameId = document.getElementById('editCheatGameId').value;
        const gameId = document.getElementById('cheatGameSelect').value;
        const name = document.getElementById('cheatNameInput').value.trim();
        const image = document.getElementById('cheatImageData').value.trim();
        const version = document.getElementById('cheatVersionInput').value.trim();
        const desc = document.getElementById('cheatDescInput').value.trim();
        const apkUrl = document.getElementById('cheatApkInput').value.trim();
        const videoUrl = document.getElementById('cheatVideoInput').value.trim();
        const featuresText = document.getElementById('cheatFeaturesInput').value.trim();
        const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
        
        // FiyatlarÄ± al (boÅŸ olmayanlarÄ±)
        const prices = currentPrices.filter(p => p.days && p.price);
        
        const status = document.getElementById('cheatStatusInput').value;
        
        if (!gameId) { showToast('âŒ Oyun seÃ§in'); return; }
        if (!name) { showToast('âŒ Hile adÄ± girin'); return; }
        
        // ID oluÅŸtur
        const newCheatId = cheatId || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // Oyun deÄŸiÅŸtiyse eski yerden sil
        if (cheatId && originalGameId && originalGameId !== gameId) {
            delete gamesData[originalGameId].cheats[cheatId];
        }
        
        if (!gamesData[gameId].cheats) {
            gamesData[gameId].cheats = {};
        }
        
        // Mevcut gÃ¶rsel varsa ve yeni yÃ¼klenmemiÅŸse eski gÃ¶rseli koru
        const existingImage = gamesData[gameId].cheats[newCheatId]?.image || '';
        const finalImage = image || existingImage;
        
        gamesData[gameId].cheats[newCheatId] = {
            ...gamesData[gameId].cheats[newCheatId],
            name, 
            image: finalImage, 
            version, desc, apkUrl, videoUrl, features, 
            prices, 
            status,
            setupSteps: gamesData[gameId].cheats[newCheatId]?.setupSteps || []
        };
        
        // Hile deÄŸiÅŸtiyse eski oyundan sil
        if (cheatId && originalGameId && originalGameId !== gameId) {
            await saveGameData(originalGameId); // Eski oyunu kaydet
        }
        
        // Sadece deÄŸiÅŸtirilen oyunu kaydet
        if (await saveGameData(gameId)) {
            showToast('âœ… Hile kaydedildi!');
            closeModal('cheatModal');
            updateGameSelects();
            loadGameCheatList();
            renderHomeGames(); // Ana sayfayÄ± anÄ±nda gÃ¼ncelle
            
            // EÄŸer bu hilenin detay sayfasÄ± aÃ§Ä±ksa onu da gÃ¼ncelle
            if (currentDynamicCheat && currentDynamicCheat.id === newCheatId) {
                const updatedCheat = gamesData[gameId].cheats[newCheatId];
                currentDynamicCheat = { id: newCheatId, gameId, ...updatedCheat };
                
                // Sayfa elemanlarÄ±nÄ± gÃ¼ncelle
                document.getElementById('dynamicCheatIcon').src = finalImage || '';
                document.getElementById('dynamicCheatTitle').textContent = name;
                document.getElementById('dynamicCheatSubtitle').textContent = `${gamesData[gameId].name} â€¢ ${version || ''}`;
                
                // Ã–zellikleri gÃ¼ncelle
                const featuresDiv = document.getElementById('dynamicCheatFeatures');
                featuresDiv.innerHTML = features.map(f => `<div class="feature-item-new">${f}</div>`).join('');
                
                // FiyatlarÄ± gÃ¼ncelle
                const pricesDiv = document.getElementById('dynamicCheatPrices');
                pricesDiv.innerHTML = prices.map((p, i) => `
                    <div class="price-card ${i === prices.length - 1 ? 'premium' : ''}" onclick="selectDynamicPrice(${i})">
                        <div class="price-label">${p.label}</div>
                        <div class="price-value">${p.price}</div>
                    </div>
                `).join('');
                
                // Video butonunu gÃ¼ncelle
                const videoSection = document.getElementById('dynamicVideoSection');
                if (videoUrl) {
                    videoSection.style.display = 'block';
                    window.currentCheatVideoUrl = videoUrl;
                } else {
                    videoSection.style.display = 'none';
                }
            }
            
            // EÄŸer oyun detay sayfasÄ± aÃ§Ä±ksa hile listesini gÃ¼ncelle
            if (currentDynamicGame && currentDynamicGame.id === gameId) {
                openGameDetail(gameId);
            }
        }
    }
    
    // Hile modalÄ±ndan kurulum adÄ±mlarÄ±na geÃ§iÅŸ
    function openSetupModalFromCheat() {
        const gameId = document.getElementById('cheatGameSelect').value;
        const cheatId = document.getElementById('editCheatId').value;
        
        if (!gameId) {
            showToast('âŒ Ã–nce oyun seÃ§in');
            return;
        }
        
        if (!cheatId) {
            showToast('âš ï¸ Ã–nce hileyi kaydedin, sonra kurulum adÄ±mlarÄ± ekleyebilirsiniz');
            return;
        }
        
        closeModal('cheatModal');
        setTimeout(() => openSetupModal(gameId, cheatId), 300);
    }
    
    // ==================== KURULUM TALÄ°MATLARI ====================
    
    let currentSetupSteps = [];
    
    function openSetupModal(gameId, cheatId) {
        if (!isAdmin()) { showToast('âŒ Yetkiniz yok'); return; }
        
        document.getElementById('setupGameId').value = gameId;
        document.getElementById('setupCheatId').value = cheatId;
        
        const cheat = gamesData[gameId]?.cheats?.[cheatId];
        currentSetupSteps = cheat?.setupSteps ? [...cheat.setupSteps] : [];
        
        renderSetupSteps();
        openModal('setupModal');
    }
    
    function renderSetupSteps() {
        const container = document.getElementById('setupStepsContainer');
        
        if (currentSetupSteps.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">HenÃ¼z adÄ±m eklenmemiÅŸ. "AdÄ±m Ekle" butonuna tÄ±klayÄ±n.</div>';
            return;
        }
        
        let html = '';
        currentSetupSteps.forEach((step, index) => {
            const actionType = step.actionType || 'none';
            
            html += `
                <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; margin-bottom: 12px; border-left: 3px solid #FF9800;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="background: #FF9800; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">ğŸ“Œ AdÄ±m ${index + 1}</span>
                        <div style="display: flex; gap: 5px;">
                            ${index > 0 ? `<button onclick="moveSetupStep(${index}, -1)" style="background: #2196F3; border: none; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">â¬†ï¸</button>` : ''}
                            ${index < currentSetupSteps.length - 1 ? `<button onclick="moveSetupStep(${index}, 1)" style="background: #2196F3; border: none; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">â¬‡ï¸</button>` : ''}
                            <button onclick="removeSetupStep(${index})" style="background: #f44336; border: none; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">ğŸ—‘ï¸</button>
                        </div>
                    </div>
                    
                    <input type="text" class="auth-input" placeholder="AdÄ±m BaÅŸlÄ±ÄŸÄ± (Ã¶rn: Oyunu Ä°ndir)" value="${step.title || ''}" onchange="currentSetupSteps[${index}].title = this.value" style="margin-bottom: 8px;">
                    
                    <textarea class="auth-input" placeholder="AdÄ±m aÃ§Ä±klamasÄ± (Ã¶rn: Play Store'dan orijinal oyunu indirin...)" onchange="currentSetupSteps[${index}].description = this.value" style="height: 60px; resize: none; margin-bottom: 10px;">${step.description || step.desc || ''}</textarea>
                    
                    <!-- Buton TÃ¼rÃ¼ -->
                    <div style="background: rgba(33,150,243,0.1); border: 1px solid rgba(33,150,243,0.3); border-radius: 8px; padding: 10px; margin-bottom: 8px;">
                        <label style="font-size: 11px; color: #2196F3; display: block; margin-bottom: 5px;">ğŸ”˜ Buton TÃ¼rÃ¼</label>
                        <select class="auth-input" style="color: #fff; margin-bottom: 8px;" onchange="updateStepActionType(${index}, this.value)">
                            <option value="none" ${actionType === 'none' ? 'selected' : ''}>Buton Yok</option>
                            <option value="playstore" ${actionType === 'playstore' ? 'selected' : ''}>ğŸ® Play Store</option>
                            <option value="download" ${actionType === 'download' ? 'selected' : ''}>ğŸ“¥ APK Ä°ndir</option>
                            <option value="link" ${actionType === 'link' ? 'selected' : ''}>ğŸ”— Ã–zel Link</option>
                            <option value="modal" ${actionType === 'modal' ? 'selected' : ''}>ğŸ“– Bilgi ModalÄ±</option>
                        </select>
                        
                        <!-- KoÅŸullu alanlar -->
                        <div id="stepAction_${index}">
                            ${renderStepActionFields(index, step)}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function renderStepActionFields(index, step) {
        const actionType = step.actionType || 'none';
        
        if (actionType === 'none') {
            return '';
        }
        
        if (actionType === 'playstore') {
            return `<div style="font-size: 11px; color: #4CAF50; padding: 8px; background: rgba(76,175,80,0.1); border-radius: 6px;">âœ… Play Store butonu otomatik eklenecek</div>`;
        }
        
        if (actionType === 'download') {
            return `
                <input type="text" class="auth-input" placeholder="APK Ä°ndirme Linki (https://...)" value="${step.downloadUrl || ''}" onchange="currentSetupSteps[${index}].downloadUrl = this.value">
            `;
        }
        
        if (actionType === 'link') {
            return `
                <input type="text" class="auth-input" placeholder="Buton YazÄ±sÄ± (Ã¶rn: DetaylÄ± Bilgi)" value="${step.btnText || ''}" onchange="currentSetupSteps[${index}].btnText = this.value" style="margin-bottom: 5px;">
                <input type="text" class="auth-input" placeholder="Link URL (https://...)" value="${step.btnUrl || ''}" onchange="currentSetupSteps[${index}].btnUrl = this.value">
            `;
        }
        
        if (actionType === 'modal') {
            // Dinamik modal seÃ§enekleri oluÅŸtur
            let modalOptions = `
                <option value="">Modal SeÃ§in...</option>
                <option value="imguiModal" ${step.modalId === 'imguiModal' ? 'selected' : ''}>ğŸ“– IMGUI Kurulum (VarsayÄ±lan)</option>
                <option value="certModal" ${step.modalId === 'certModal' ? 'selected' : ''}>ğŸ”’ Sertifika Kapatma</option>
            `;
            
            // Dinamik oluÅŸturulan modalleri ekle
            Object.entries(setupModals || {}).forEach(([id, modal]) => {
                modalOptions += `<option value="${id}" ${step.modalId === id ? 'selected' : ''}>ğŸ“– ${modal.title || id}</option>`;
            });
            
            return `
                <select class="auth-input" style="color: #fff;" onchange="currentSetupSteps[${index}].modalId = this.value">
                    ${modalOptions}
                </select>
                <div style="font-size: 10px; color: #888; margin-top: 5px;">ğŸ’¡ Admin Panel â†’ Kurulum ModallarÄ±'ndan yeni modal oluÅŸturabilirsiniz</div>
            `;
        }
        
        return '';
    }
    
    function updateStepActionType(index, actionType) {
        currentSetupSteps[index].actionType = actionType;
        // Eski deÄŸerleri temizle
        delete currentSetupSteps[index].downloadUrl;
        delete currentSetupSteps[index].btnText;
        delete currentSetupSteps[index].btnUrl;
        delete currentSetupSteps[index].modalId;
        renderSetupSteps();
    }
    
    function moveSetupStep(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= currentSetupSteps.length) return;
        
        const temp = currentSetupSteps[index];
        currentSetupSteps[index] = currentSetupSteps[newIndex];
        currentSetupSteps[newIndex] = temp;
        renderSetupSteps();
    }
    
    function addSetupStep() {
        currentSetupSteps.push({ title: '', description: '', actionType: 'none' });
        renderSetupSteps();
    }
    
    function removeSetupStep(index) {
        if (confirm('Bu adÄ±mÄ± silmek istiyor musunuz?')) {
            currentSetupSteps.splice(index, 1);
            renderSetupSteps();
        }
    }
    
    async function saveSetupSteps() {
        if (!requirePermission('games', 'kurulum adÄ±mlarÄ±nÄ± dÃ¼zenlemek')) return;
        
        const gameId = document.getElementById('setupGameId').value;
        const cheatId = document.getElementById('setupCheatId').value;
        
        if (!gamesData[gameId]?.cheats?.[cheatId]) {
            showToast('âŒ Hile bulunamadÄ±');
            return;
        }
        
        // description alanÄ±nÄ± desc olarak da kaydet (uyumluluk iÃ§in)
        currentSetupSteps.forEach(step => {
            if (step.description && !step.desc) {
                step.desc = step.description;
            }
        });
        
        gamesData[gameId].cheats[cheatId].setupSteps = currentSetupSteps;
        
        // Sadece deÄŸiÅŸtirilen oyunu kaydet
        if (await saveGameData(gameId)) {
            showToast('âœ… Kurulum adÄ±mlarÄ± kaydedildi!');
            closeModal('setupModal');
            loadGameCheatList();
            
            // ===== GERÃ‡EK ZAMANLI GÃœNCELLEMELERÄ° UYGULA =====
            
            // Hile detay sayfasÄ± aÃ§Ä±ksa kurulum adÄ±mlarÄ±nÄ± gÃ¼ncelle
            if (currentDynamicCheat && currentDynamicCheat.id === cheatId) {
                currentDynamicCheat.setupSteps = [...currentSetupSteps];
                
                const stepsContainer = document.getElementById('dynamicSetupSteps');
                if (stepsContainer) {
                    let stepsHtml = '';
                    currentSetupSteps.forEach((step, index) => {
                        const description = step.description || step.desc || '';
                        stepsHtml += `
                            <div style="display: flex; gap: 12px; padding: 12px; background: #1a1a1a; border-radius: 12px; margin-bottom: 8px;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">
                                    ${index + 1}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; margin-bottom: 4px;">${step.title || 'AdÄ±m ' + (index + 1)}</div>
                                    <div style="font-size: 13px; color: #aaa; line-height: 1.4;">${description}</div>
                                    ${renderStepButton(step)}
                                </div>
                            </div>
                        `;
                    });
                    stepsContainer.innerHTML = stepsHtml || '<p style="text-align: center; color: #666;">Kurulum adÄ±mÄ± yok</p>';
                }
            }
        }
    }
    
    // AdÄ±m butonunu render et
    function renderStepButton(step) {
        const actionType = step.actionType || 'none';
        
        if (actionType === 'playstore' && step.btnUrl) {
            return `<button onclick="window.open('${step.btnUrl}', '_system')" style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #34a853, #0f9d58); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                <i class="fab fa-google-play"></i> ${step.btnText || 'Play Store\'da AÃ§'}
            </button>`;
        } else if (actionType === 'download' && step.downloadUrl) {
            return `<button onclick="window.open('${step.downloadUrl}', '_system')" style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                <i class="fas fa-download"></i> ${step.btnText || 'Ä°ndir'}
            </button>`;
        } else if (actionType === 'link' && step.btnUrl) {
            return `<button onclick="window.open('${step.btnUrl}', '_system')" style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #00b894, #00cec9); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                <i class="fas fa-external-link-alt"></i> ${step.btnText || 'BaÄŸlantÄ±ya Git'}
            </button>`;
        } else if (actionType === 'modal' && step.modalId) {
            return `<button onclick="openModal('${step.modalId}')" style="margin-top: 8px; padding: 8px 16px; background: linear-gradient(135deg, #e17055, #d63031); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                <i class="fas fa-info-circle"></i> ${step.btnText || 'Detaylar'}
            </button>`;
        }
        
        return '';
    }
    
    // ==================== SÄ°LME FONKSÄ°YONLARI ====================
    
    async function deleteGame(gameId) {
        if (!requirePermission('games', 'oyun silmek')) return;
        
        const game = gamesData[gameId];
        if (!game) return;
        
        const cheatCount = Object.keys(game.cheats || {}).length;
        if (!confirm(`"${game.name}" oyununu ve ${cheatCount} hilesini silmek istiyor musunuz?\n\nBu iÅŸlem geri alÄ±namaz!`)) return;
        
        delete gamesData[gameId];
        
        try {
            // Firestore'dan dokÃ¼mani sil
            await db.collection('games').doc(gameId).delete();
            showToast('âœ… Oyun silindi!');
            updateGameSelects();
            loadGameCheatList();
            
            // ===== GERÃ‡EK ZAMANLI GÃœNCELLEMELERÄ° UYGULA =====
            renderHomeGames(); // Ana sayfayÄ± gÃ¼ncelle
            
            // Silinen oyunun detay sayfasÄ± aÃ§Ä±ksa ana sayfaya dÃ¶n
            if (currentDynamicGame && currentDynamicGame.id === gameId) {
                showPage('home');
                currentDynamicGame = null;
            }
        } catch(e) {
            console.error('Silme hatasÄ±:', e);
            showToast('âŒ Silme hatasÄ±: ' + e.message);
            return false;
        }
    }
    
    async function deleteCheat(gameId, cheatId) {
        if (!requirePermission('games', 'hile silmek')) return;
        
        const cheat = gamesData[gameId]?.cheats?.[cheatId];
        if (!cheat) return;
        
        if (!confirm(`"${cheat.name}" hilesini silmek istiyor musunuz?`)) return;
        
        delete gamesData[gameId].cheats[cheatId];
        
        // Sadece deÄŸiÅŸtirilen oyunu kaydet
        if (await saveGameData(gameId)) {
            showToast('âœ… Hile silindi!');
            updateGameSelects();
            loadGameCheatList();
            
            // ===== GERÃ‡EK ZAMANLI GÃœNCELLEMELERÄ° UYGULA =====
            renderHomeGames(); // Ana sayfayÄ± gÃ¼ncelle
            
            // Silinen hilenin detay sayfasÄ± aÃ§Ä±ksa oyun sayfasÄ±na dÃ¶n
            if (currentDynamicCheat && currentDynamicCheat.id === cheatId) {
                if (currentDynamicGame) {
                    openGameDetail(currentDynamicGame.id);
                } else {
                    showPage('home');
                }
                currentDynamicCheat = null;
            }
            
            // Oyun sayfasÄ± aÃ§Ä±ksa hile listesini gÃ¼ncelle
            if (currentDynamicGame && currentDynamicGame.id === gameId) {
                openGameDetail(gameId);
            }
        }
    }
    
    // ==================== LÄ°STE GÃ–RÃœNTÃœLEME ====================
    
    function loadGameCheatList() {
        const container = document.getElementById('gameCheatList');
        if (!container) return;
        
        // Oyun/hile yÃ¶netimi yetkisi yoksa gÃ¶sterme
        if (!hasPermission('games')) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Oyun/hile yÃ¶netimi yetkiniz yok</div>';
            return;
        }
        
        // OyunlarÄ± sortOrder'a gÃ¶re sÄ±rala
        const gameIds = Object.keys(gamesData).sort((a, b) => {
            const orderA = gamesData[a].sortOrder ?? 999;
            const orderB = gamesData[b].sortOrder ?? 999;
            return orderA - orderB;
        });
        
        if (gameIds.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">HenÃ¼z oyun eklenmemiÅŸ</div>';
            return;
        }
        
        let html = '';
        
        gameIds.forEach((gameId, index) => {
            const game = gamesData[gameId];
            const cheats = game.cheats || {};
            const cheatCount = Object.keys(cheats).length;
            const statusBadge = game.status === 'active' ? 'ğŸŸ¢' : (game.status === 'coming' ? 'ğŸŸ¡' : 'ğŸ”´');
            
            html += `
                <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        ${game.image ? `<img src="${game.image}" style="width: 40px; height: 40px; border-radius: 10px; object-fit: cover;" onerror="this.style.display='none'">` : ''}
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="color: #4CAF50; font-weight: bold;">${statusBadge} ${game.name}</span>
                                <span style="background: #2196F3; color: #fff; padding: 2px 6px; border-radius: 8px; font-size: 10px;">${cheatCount} hile</span>
                            </div>
                            <div style="font-size: 11px; color: #888;">${game.desc || 'AÃ§Ä±klama yok'}</div>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button onclick="event.stopPropagation(); openGameModal('${gameId}')" style="background: #2196F3; border: none; color: #fff; padding: 5px 8px; border-radius: 6px; font-size: 10px; cursor: pointer;">âœï¸</button>
                            <button onclick="event.stopPropagation(); deleteGame('${gameId}')" style="background: #f44336; border: none; color: #fff; padding: 5px 8px; border-radius: 6px; font-size: 10px; cursor: pointer;">ğŸ—‘ï¸</button>
                        </div>
                    </div>
                    
                    <!-- Hileler -->
                    <div style="padding-left: 10px; border-left: 2px solid rgba(255,255,255,0.1);">
            `;
            
            // Hileleri sortOrder'a gÃ¶re sÄ±rala
            const cheatIds = Object.keys(cheats).sort((a, b) => {
                const orderA = cheats[a].sortOrder ?? 999;
                const orderB = cheats[b].sortOrder ?? 999;
                return orderA - orderB;
            });
            
            cheatIds.forEach((cheatId, cheatIndex) => {
                const cheat = cheats[cheatId];
                const cheatStatus = cheat.status === 'active' ? 'ğŸŸ¢' : (cheat.status === 'maintenance' ? 'ğŸŸ ' : 'ğŸ”´');
                const hasSetup = (cheat.setupSteps || []).length > 0;
                const hasVideo = !!cheat.videoUrl;
                const featureCount = cheat.features?.length || 0;
                const priceCount = cheat.prices?.length || 0;
                
                html += `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        ${cheat.image ? `<img src="${cheat.image}" style="width: 30px; height: 30px; border-radius: 8px; object-fit: cover;" onerror="this.style.display='none'">` : '<span style="font-size: 20px;">ğŸ›¡ï¸</span>'}
                        <div style="flex: 1;">
                            <div style="color: #2196F3; font-size: 12px;">${cheatStatus} ${cheat.name} <span style="color: #888;">${cheat.version || ''}</span></div>
                            <div style="font-size: 10px; color: #666;">
                                ${featureCount} Ã¶zellik â€¢ ${priceCount} fiyat â€¢ 
                                ${hasSetup ? 'âœ… Kurulum' : 'âš ï¸ Kurulum yok'} â€¢ 
                                ${hasVideo ? 'ğŸ¬ Video' : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 3px;">
                            <button onclick="event.stopPropagation(); openSetupModal('${gameId}', '${cheatId}')" style="background: #FF9800; border: none; color: #fff; padding: 4px 6px; border-radius: 5px; font-size: 9px; cursor: pointer;" title="Kurulum AdÄ±mlarÄ±">ğŸ“‹</button>
                            <button onclick="event.stopPropagation(); openCheatModal('${gameId}', '${cheatId}')" style="background: #2196F3; border: none; color: #fff; padding: 4px 6px; border-radius: 5px; font-size: 9px; cursor: pointer;" title="DÃ¼zenle">âœï¸</button>
                            <button onclick="event.stopPropagation(); deleteCheat('${gameId}', '${cheatId}')" style="background: #f44336; border: none; color: #fff; padding: 4px 6px; border-radius: 5px; font-size: 9px; cursor: pointer;" title="Sil">ğŸ—‘ï¸</button>
                        </div>
                    </div>
                `;
            });
            
            if (cheatCount === 0) {
                html += `<div style="padding: 10px; color: #666; font-size: 11px; text-align: center;">Hile eklenmemiÅŸ</div>`;
            }
            
            html += `
                        <button onclick="openCheatModal('${gameId}')" style="width: 100%; margin-top: 8px; background: rgba(33,150,243,0.2); border: 1px dashed #2196F3; color: #2196F3; padding: 6px; border-radius: 6px; font-size: 11px; cursor: pointer;">â• Hile Ekle</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // SÄ±ralama modalÄ±nÄ± aÃ§
    function openSortModal() {
        if (!requirePermission('games_edit', 'sÄ±ralama yapmak')) return;
        
        renderSortModal();
        openModal('sortModal');
    }
    
    // SÄ±ralama modal'Ä±nÄ± render et
    function renderSortModal() {
        const container = document.getElementById('sortGameList');
        if (!container) return;
        
        // OyunlarÄ± sortOrder'a gÃ¶re sÄ±rala
        const gameIds = Object.keys(gamesData).sort((a, b) => {
            const orderA = gamesData[a].sortOrder ?? 999;
            const orderB = gamesData[b].sortOrder ?? 999;
            return orderA - orderB;
        });
        
        if (gameIds.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">HenÃ¼z oyun eklenmemiÅŸ</div>';
            return;
        }
        
        let html = '';
        
        gameIds.forEach(gameId => {
            const game = gamesData[gameId];
            const cheats = game.cheats || {};
            const cheatCount = Object.keys(cheats).length;
            const statusBadge = game.status === 'active' ? 'ğŸŸ¢' : (game.status === 'coming' ? 'ğŸŸ¡' : 'ğŸ”´');
            
            html += `
                <div class="sort-game-card" data-game-id="${gameId}" data-sort-order="${game.sortOrder ?? 999}" style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 15px; margin-bottom: 10px; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <button onclick="moveGameUp('${gameId}')" style="background: #9C27B0; color: white; border: none; border-radius: 5px; width: 30px; height: 25px; cursor: pointer; font-size: 14px;">â–²</button>
                            <button onclick="moveGameDown('${gameId}')" style="background: #9C27B0; color: white; border: none; border-radius: 5px; width: 30px; height: 25px; cursor: pointer; font-size: 14px;">â–¼</button>
                        </div>
                        <div onclick="toggleSortGameCheats('${gameId}')" style="display: flex; align-items: center; gap: 10px; flex: 1; cursor: pointer;">
                            ${game.image ? `<img src="${game.image}" style="width: 45px; height: 45px; border-radius: 10px; object-fit: cover;" onerror="this.style.display='none'">` : ''}
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="color: #fff; font-weight: bold; font-size: 14px;">${statusBadge} ${game.name}</span>
                                    <span style="background: #2196F3; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${cheatCount} hile</span>
                                </div>
                                <div style="font-size: 12px; color: #888; margin-top: 2px;">${game.desc || 'AÃ§Ä±klama yok'}</div>
                            </div>
                            <span id="sortChevron${gameId}" style="color: #888; font-size: 18px; transition: transform 0.3s;">â–¶</span>
                        </div>
                    </div>
                    
                    <!-- Hileler (baÅŸlangÄ±Ã§ta gizli) -->
                    <div id="sortCheats${gameId}" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                        <div style="padding-left: 40px; margin-top: 10px; border-left: 2px solid rgba(156, 39, 176, 0.3);">
                            <div id="sortCheatList${gameId}">
                                <!-- Hileler buraya gelecek -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Oyun kartÄ±nÄ±n hilelerini aÃ§/kapat
    function toggleSortGameCheats(gameId) {
        const cheatsDiv = document.getElementById(`sortCheats${gameId}`);
        const chevron = document.getElementById(`sortChevron${gameId}`);
        const cheatListDiv = document.getElementById(`sortCheatList${gameId}`);
        
        if (cheatsDiv.style.maxHeight === '0px' || cheatsDiv.style.maxHeight === '') {
            // AÃ§
            const game = gamesData[gameId];
            const cheats = game.cheats || {};
            
            // Hileleri sortOrder'a gÃ¶re sÄ±rala
            const cheatIds = Object.keys(cheats).sort((a, b) => {
                const orderA = cheats[a].sortOrder ?? 999;
                const orderB = cheats[b].sortOrder ?? 999;
                return orderA - orderB;
            });
            
            if (cheatIds.length === 0) {
                cheatListDiv.innerHTML = '<div style="padding: 10px; color: #666; font-size: 12px; text-align: center;">Bu oyunda hile yok</div>';
            } else {
                let cheatHtml = '';
                cheatIds.forEach(cheatId => {
                    const cheat = cheats[cheatId];
                    const cheatStatus = cheat.status === 'active' ? 'ğŸŸ¢' : (cheat.status === 'maintenance' ? 'ğŸŸ ' : 'ğŸ”´');
                    
                    cheatHtml += `
                        <div class="sort-cheat-card" data-game-id="${gameId}" data-cheat-id="${cheatId}" style="display: flex; align-items: center; gap: 8px; padding: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <button onclick="moveCheatUp('${gameId}', '${cheatId}')" style="background: #2196F3; color: white; border: none; border-radius: 4px; width: 24px; height: 20px; cursor: pointer; font-size: 12px;">â–²</button>
                                <button onclick="moveCheatDown('${gameId}', '${cheatId}')" style="background: #2196F3; color: white; border: none; border-radius: 4px; width: 24px; height: 20px; cursor: pointer; font-size: 12px;">â–¼</button>
                            </div>
                            ${cheat.image ? `<img src="${cheat.image}" style="width: 35px; height: 35px; border-radius: 8px; object-fit: cover;" onerror="this.style.display='none'">` : '<span style="font-size: 24px;">ğŸ›¡ï¸</span>'}
                            <div style="flex: 1;">
                                <div style="color: #2196F3; font-size: 13px; font-weight: 500;">${cheatStatus} ${cheat.name}</div>
                                <div style="font-size: 11px; color: #888;">${cheat.version || 'Versiyon belirtilmemiÅŸ'}</div>
                            </div>
                        </div>
                    `;
                });
                cheatListDiv.innerHTML = cheatHtml;
            }
            
            cheatsDiv.style.maxHeight = cheatsDiv.scrollHeight + 'px';
            chevron.style.transform = 'rotate(180deg)';
        } else {
            // Kapat
            cheatsDiv.style.maxHeight = '0px';
            chevron.style.transform = 'rotate(0deg)';
        }
    }
    
    // Drag and Drop sistemi (SÄ±ralama modal)
    let sortDraggedElement = null;
    let sortDraggedOverElement = null;
    let isDraggingSort = false;
    
    function initSortDragAndDrop() {
        document.querySelectorAll('.sort-game-card').forEach(item => {
            // Drag handle'dan sÃ¼rÃ¼klerken onclick'i engelle
            const gameInfoArea = item.querySelector('.game-info-area');
            if (gameInfoArea) {
                gameInfoArea.addEventListener('click', function(e) {
                    if (isDraggingSort) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, true);
            }
            
            // Desktop
            item.addEventListener('dragstart', handleSortGameDragStart);
            item.addEventListener('dragover', handleSortGameDragOver);
            item.addEventListener('drop', handleSortGameDrop);
            item.addEventListener('dragend', handleSortGameDragEnd);
            
            // Mobile
            item.addEventListener('touchstart', handleSortGameTouchStart, { passive: false });
            item.addEventListener('touchmove', handleSortGameTouchMove, { passive: false });
            item.addEventListener('touchend', handleSortGameTouchEnd);
        });
    }
    
    function initSortCheatDragAndDrop(gameId) {
        document.querySelectorAll(`.sort-cheat-card[data-game-id="${gameId}"]`).forEach(item => {
            // Desktop
            item.addEventListener('dragstart', handleSortCheatDragStart);
            item.addEventListener('dragover', handleSortCheatDragOver);
            item.addEventListener('drop', handleSortCheatDrop);
            item.addEventListener('dragend', handleSortCheatDragEnd);
            
            // Mobile
            item.addEventListener('touchstart', handleSortCheatTouchStart, { passive: false });
            item.addEventListener('touchmove', handleSortCheatTouchMove, { passive: false });
            item.addEventListener('touchend', handleSortCheatTouchEnd);
        });
    }
    
    // === OYUN DRAG & DROP (Sort Modal) ===
    function handleSortGameDragStart(e) {
        sortDraggedElement = this;
        isDraggingSort = true;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function handleSortGameDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (this !== sortDraggedElement && this.classList.contains('sort-game-card')) {
            this.style.borderTop = '3px solid #9C27B0';
        }
        return false;
    }
    
    function handleSortGameDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        
        if (sortDraggedElement !== this && this.classList.contains('sort-game-card')) {
            const draggedId = sortDraggedElement.dataset.gameId;
            const targetId = this.dataset.gameId;
            console.log('ğŸ”„ Oyun swap:', draggedId, 'â†”ï¸', targetId);
            swapGames(draggedId, targetId);
        }
        
        this.style.borderTop = '';
        return false;
    }
    
    function handleSortGameDragEnd(e) {
        this.style.opacity = '';
        document.querySelectorAll('.sort-game-card').forEach(item => {
            item.style.borderTop = '';
        });
        
        // Drag bitti, click tekrar aktif olabilir
        setTimeout(() => {
            isDraggingSort = false;
        }, 100);
    }
    
    // === OYUN TOUCH (Sort Modal) ===
    function handleSortGameTouchStart(e) {
        sortDraggedElement = this;
        this.style.opacity = '0.7';
        this.style.transform = 'scale(1.03)';
    }
    
    function handleSortGameTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const target = elements.find(el => el.classList && el.classList.contains('sort-game-card') && el !== sortDraggedElement);
        
        if (sortDraggedOverElement && sortDraggedOverElement !== target) {
            sortDraggedOverElement.style.borderTop = '';
        }
        
        if (target) {
            target.style.borderTop = '3px solid #9C27B0';
            sortDraggedOverElement = target;
        }
    }
    
    function handleSortGameTouchEnd(e) {
        this.style.opacity = '';
        this.style.transform = '';
        
        if (sortDraggedOverElement) {
            const draggedId = this.dataset.gameId;
            const targetId = sortDraggedOverElement.dataset.gameId;
            swapGames(draggedId, targetId);
            sortDraggedOverElement.style.borderTop = '';
            sortDraggedOverElement = null;
        }
        
        sortDraggedElement = null;
    }
    
    // === HÄ°LE DRAG & DROP (Sort Modal) ===
    function handleSortCheatDragStart(e) {
        sortDraggedElement = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    }
    
    function handleSortCheatDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggedGameId = sortDraggedElement?.dataset.gameId;
        const thisGameId = this.dataset.gameId;
        
        if (this !== sortDraggedElement && this.classList.contains('sort-cheat-card') && draggedGameId === thisGameId) {
            this.style.borderTop = '3px solid #9C27B0';
        }
        return false;
    }
    
    function handleSortCheatDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        
        const draggedGameId = sortDraggedElement?.dataset.gameId;
        const thisGameId = this.dataset.gameId;
        
        if (sortDraggedElement !== this && this.classList.contains('sort-cheat-card') && draggedGameId === thisGameId) {
            const gameId = draggedGameId;
            const draggedCheatId = sortDraggedElement.dataset.cheatId;
            const targetCheatId = this.dataset.cheatId;
            swapCheats(gameId, draggedCheatId, targetCheatId);
        }
        
        this.style.borderTop = '';
        return false;
    }
    
    function handleSortCheatDragEnd(e) {
        this.style.opacity = '';
        const gameId = this.dataset.gameId;
        document.querySelectorAll(`.sort-cheat-card[data-game-id="${gameId}"]`).forEach(item => {
            item.style.borderTop = '';
        });
    }
    
    // === HÄ°LE TOUCH (Sort Modal) ===
    function handleSortCheatTouchStart(e) {
        e.stopPropagation();
        sortDraggedElement = this;
        this.style.opacity = '0.7';
        this.style.transform = 'scale(1.03)';
    }
    
    function handleSortCheatTouchMove(e) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const draggedGameId = sortDraggedElement?.dataset.gameId;
        const target = elements.find(el => el.classList && el.classList.contains('sort-cheat-card') && el !== sortDraggedElement && el.dataset.gameId === draggedGameId);
        
        if (sortDraggedOverElement && sortDraggedOverElement !== target) {
            sortDraggedOverElement.style.borderTop = '';
        }
        
        if (target) {
            target.style.borderTop = '3px solid #9C27B0';
            sortDraggedOverElement = target;
        }
    }
    
    function handleSortCheatTouchEnd(e) {
        e.stopPropagation();
        this.style.opacity = '';
        this.style.transform = '';
        
        if (sortDraggedOverElement) {
            const gameId = this.dataset.gameId;
            const draggedCheatId = this.dataset.cheatId;
            const targetCheatId = sortDraggedOverElement.dataset.cheatId;
            swapCheats(gameId, draggedCheatId, targetCheatId);
            sortDraggedOverElement.style.borderTop = '';
            sortDraggedOverElement = null;
        }
        
        sortDraggedElement = null;
    }
    
    // Oyunu yukarÄ± taÅŸÄ±
    async function moveGameUp(gameId) {
        if (!requirePermission('games_edit', 'oyun sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        // Mevcut sÄ±ralamayÄ± al
        const sortedGames = Object.entries(gamesData)
            .sort((a, b) => (a[1].sortOrder ?? 999) - (b[1].sortOrder ?? 999));
        
        const currentIndex = sortedGames.findIndex(([id]) => id === gameId);
        
        if (currentIndex > 0) {
            // Listedeki pozisyonlarÄ± deÄŸiÅŸtir
            const temp = sortedGames[currentIndex];
            sortedGames[currentIndex] = sortedGames[currentIndex - 1];
            sortedGames[currentIndex - 1] = temp;
            
            // TÃ¼m listeyi yeniden numarala ve kaydet
            await reorderAllGames(sortedGames);
            showToast('âœ… Oyun yukarÄ± taÅŸÄ±ndÄ±');
        } else {
            showToast('âš ï¸ Bu oyun zaten en Ã¼stte');
        }
    }
    
    // Oyunu aÅŸaÄŸÄ± taÅŸÄ±
    async function moveGameDown(gameId) {
        if (!requirePermission('games_edit', 'oyun sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        // Mevcut sÄ±ralamayÄ± al
        const sortedGames = Object.entries(gamesData)
            .sort((a, b) => (a[1].sortOrder ?? 999) - (b[1].sortOrder ?? 999));
        
        const currentIndex = sortedGames.findIndex(([id]) => id === gameId);
        
        if (currentIndex < sortedGames.length - 1) {
            // Listedeki pozisyonlarÄ± deÄŸiÅŸtir
            const temp = sortedGames[currentIndex];
            sortedGames[currentIndex] = sortedGames[currentIndex + 1];
            sortedGames[currentIndex + 1] = temp;
            
            // TÃ¼m listeyi yeniden numarala ve kaydet
            await reorderAllGames(sortedGames);
            showToast('âœ… Oyun aÅŸaÄŸÄ± taÅŸÄ±ndÄ±');
        } else {
            showToast('âš ï¸ Bu oyun zaten en altta');
        }
    }
    
    // TÃ¼m oyunlarÄ± yeniden sÄ±rala (0, 1, 2, 3...)
    async function reorderAllGames(sortedGames) {
        try {
            const updates = [];
            
            // Ã–nce lokal veriyi gÃ¼ncelle ve Firestore gÃ¼ncellemelerini hazÄ±rla
            sortedGames.forEach(([gameId, game], index) => {
                gamesData[gameId].sortOrder = index;
                updates.push(
                    db.collection('games').doc(gameId).update({ sortOrder: index })
                );
            });
            
            // HEMEN UI'Ä± gÃ¼ncelle
            renderSortModal();
            loadGameCheatList();
            renderHomeGames();
            
            // Sonra arka planda Firestore'a kaydet
            await Promise.all(updates);
            
        } catch(e) {
            console.error('Oyun sÄ±ralama hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Ä°ki oyunun sÄ±rasÄ±nÄ± deÄŸiÅŸtir (eski fonksiyon - drag-drop iÃ§in)
    async function swapGameOrders(gameId1, gameId2) {
        try {
            const order1 = gamesData[gameId1].sortOrder ?? 999;
            const order2 = gamesData[gameId2].sortOrder ?? 999;
            
            // Ã–nce lokal veriyi gÃ¼ncelle
            gamesData[gameId1].sortOrder = order2;
            gamesData[gameId2].sortOrder = order1;
            
            // HEMEN UI'Ä± gÃ¼ncelle (Firestore'u bekleme)
            renderSortModal();
            loadGameCheatList();
            renderHomeGames();
            
            // Sonra arka planda Firestore'a kaydet
            await Promise.all([
                db.collection('games').doc(gameId1).update({ sortOrder: order2 }),
                db.collection('games').doc(gameId2).update({ sortOrder: order1 })
            ]);
            
        } catch(e) {
            console.error('Oyun sÄ±ralama hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Hileyi yukarÄ± taÅŸÄ±
    async function moveCheatUp(gameId, cheatId) {
        if (!requirePermission('cheats_edit', 'hile sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        const cheats = gamesData[gameId].cheats || {};
        const sortedCheats = Object.entries(cheats)
            .sort((a, b) => (a[1].sortOrder ?? 999) - (b[1].sortOrder ?? 999));
        
        const currentIndex = sortedCheats.findIndex(([id]) => id === cheatId);
        
        if (currentIndex > 0) {
            // Listedeki pozisyonlarÄ± deÄŸiÅŸtir
            const temp = sortedCheats[currentIndex];
            sortedCheats[currentIndex] = sortedCheats[currentIndex - 1];
            sortedCheats[currentIndex - 1] = temp;
            
            // TÃ¼m hileleri yeniden numarala ve kaydet
            await reorderAllCheats(gameId, sortedCheats);
            showToast('âœ… Hile yukarÄ± taÅŸÄ±ndÄ±');
        } else {
            showToast('âš ï¸ Bu hile zaten en Ã¼stte');
        }
    }
    
    // Hileyi aÅŸaÄŸÄ± taÅŸÄ±
    async function moveCheatDown(gameId, cheatId) {
        if (!requirePermission('cheats_edit', 'hile sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        const cheats = gamesData[gameId].cheats || {};
        const sortedCheats = Object.entries(cheats)
            .sort((a, b) => (a[1].sortOrder ?? 999) - (b[1].sortOrder ?? 999));
        
        const currentIndex = sortedCheats.findIndex(([id]) => id === cheatId);
        
        if (currentIndex < sortedCheats.length - 1) {
            // Listedeki pozisyonlarÄ± deÄŸiÅŸtir
            const temp = sortedCheats[currentIndex];
            sortedCheats[currentIndex] = sortedCheats[currentIndex + 1];
            sortedCheats[currentIndex + 1] = temp;
            
            // TÃ¼m hileleri yeniden numarala ve kaydet
            await reorderAllCheats(gameId, sortedCheats);
            showToast('âœ… Hile aÅŸaÄŸÄ± taÅŸÄ±ndÄ±');
        } else {
            showToast('âš ï¸ Bu hile zaten en altta');
        }
    }
    
    // TÃ¼m hileleri yeniden sÄ±rala (0, 1, 2, 3...)
    async function reorderAllCheats(gameId, sortedCheats) {
        try {
            const updateData = {};
            
            // Ã–nce lokal veriyi gÃ¼ncelle ve Firestore update objesini hazÄ±rla
            sortedCheats.forEach(([cheatId, cheat], index) => {
                gamesData[gameId].cheats[cheatId].sortOrder = index;
                updateData[`cheats.${cheatId}.sortOrder`] = index;
            });
            
            // HEMEN UI'Ä± gÃ¼ncelle
            renderSortCheatList(gameId);
            loadGameCheatList();
            
            // Sonra arka planda Firestore'a kaydet (tek bir update ile)
            await db.collection('games').doc(gameId).update(updateData);
            
        } catch(e) {
            console.error('Hile sÄ±ralama hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Ä°ki hilenin sÄ±rasÄ±nÄ± deÄŸiÅŸtir (eski fonksiyon - drag-drop iÃ§in)
    async function swapCheatOrders(gameId, cheatId1, cheatId2) {
        try {
            const cheats = gamesData[gameId].cheats;
            const order1 = cheats[cheatId1].sortOrder ?? 999;
            const order2 = cheats[cheatId2].sortOrder ?? 999;
            
            // Ã–nce lokal veriyi gÃ¼ncelle
            cheats[cheatId1].sortOrder = order2;
            cheats[cheatId2].sortOrder = order1;
            
            // HEMEN UI'Ä± gÃ¼ncelle - hile listesini doÄŸrudan render et
            renderSortCheatList(gameId);
            
            loadGameCheatList();
            
            // Sonra arka planda Firestore'a kaydet
            await db.collection('games').doc(gameId).update({
                [`cheats.${cheatId1}.sortOrder`]: order2,
                [`cheats.${cheatId2}.sortOrder`]: order1
            });
            
        } catch(e) {
            console.error('Hile sÄ±ralama hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Hile listesini anlÄ±k render et
    function renderSortCheatList(gameId) {
        const cheatListDiv = document.getElementById(`sortCheatList${gameId}`);
        if (!cheatListDiv) return;
        
        const cheats = gamesData[gameId].cheats || {};
        const cheatIds = Object.keys(cheats).sort((a, b) => {
            const orderA = cheats[a].sortOrder ?? 999;
            const orderB = cheats[b].sortOrder ?? 999;
            return orderA - orderB;
        });
        
        if (cheatIds.length === 0) {
            cheatListDiv.innerHTML = '<div style="padding: 10px; color: #666; font-size: 12px; text-align: center;">Bu oyunda hile yok</div>';
            return;
        }
        
        let cheatHtml = '';
        cheatIds.forEach(cheatId => {
            const cheat = cheats[cheatId];
            const cheatStatus = cheat.status === 'active' ? 'ğŸŸ¢' : (cheat.status === 'maintenance' ? 'ğŸŸ ' : 'ğŸ”´');
            
            cheatHtml += `
                <div class="sort-cheat-card" data-game-id="${gameId}" data-cheat-id="${cheatId}" style="display: flex; align-items: center; gap: 8px; padding: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <button onclick="moveCheatUp('${gameId}', '${cheatId}')" style="background: #2196F3; color: white; border: none; border-radius: 4px; width: 24px; height: 20px; cursor: pointer; font-size: 12px;">â–²</button>
                        <button onclick="moveCheatDown('${gameId}', '${cheatId}')" style="background: #2196F3; color: white; border: none; border-radius: 4px; width: 24px; height: 20px; cursor: pointer; font-size: 12px;">â–¼</button>
                    </div>
                    ${cheat.image ? `<img src="${cheat.image}" style="width: 35px; height: 35px; border-radius: 8px; object-fit: cover;" onerror="this.style.display='none'">` : '<span style="font-size: 24px;">ğŸ›¡ï¸</span>'}
                    <div style="flex: 1;">
                        <div style="color: #2196F3; font-size: 13px; font-weight: 500;">${cheatStatus} ${cheat.name}</div>
                        <div style="font-size: 11px; color: #888;">${cheat.version || 'Versiyon belirtilmemiÅŸ'}</div>
                    </div>
                </div>
            `;
        });
        
        cheatListDiv.innerHTML = cheatHtml;
    }
    
    // Oyun yerlerini deÄŸiÅŸtir (SÄ±ralama modal'dan)
    async function swapGames(gameId1, gameId2) {
        if (!requirePermission('games_edit', 'oyun sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        try {
            const order1 = gamesData[gameId1].sortOrder ?? 999;
            const order2 = gamesData[gameId2].sortOrder ?? 999;
            
            gamesData[gameId1].sortOrder = order2;
            gamesData[gameId2].sortOrder = order1;
            
            await Promise.all([
                db.collection('games').doc(gameId1).update({ sortOrder: order2 }),
                db.collection('games').doc(gameId2).update({ sortOrder: order1 })
            ]);
            
            // Her iki listeyide gÃ¼ncelle
            loadGameCheatList();
            renderHomeGames();
            
            // EÄŸer sÄ±ralama modal aÃ§Ä±ksa onu da gÃ¼ncelle
            const sortModal = document.getElementById('sortModal');
            if (sortModal && sortModal.classList.contains('active')) {
                renderSortModal();
            }
        } catch(e) {
            console.error('Oyun swap hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Hile yerlerini deÄŸiÅŸtir (SÄ±ralama modal'dan)
    async function swapCheats(gameId, cheatId1, cheatId2) {
        if (!requirePermission('cheats_edit', 'hile sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        try {
            const cheats = gamesData[gameId].cheats;
            const order1 = cheats[cheatId1].sortOrder ?? 999;
            const order2 = cheats[cheatId2].sortOrder ?? 999;
            
            cheats[cheatId1].sortOrder = order2;
            cheats[cheatId2].sortOrder = order1;
            
            await db.collection('games').doc(gameId).update({
                [`cheats.${cheatId1}.sortOrder`]: order2,
                [`cheats.${cheatId2}.sortOrder`]: order1
            });
            
            loadGameCheatList();
            
            // EÄŸer sÄ±ralama modal aÃ§Ä±ksa o oyunun hilelerini gÃ¼ncelle
            const sortModal = document.getElementById('sortModal');
            if (sortModal && sortModal.classList.contains('active')) {
                // Oyun kartÄ±nÄ± aÃ§Ä±k tut ve sadece hile listesini gÃ¼ncelle
                const cheatsDiv = document.getElementById(`sortCheats${gameId}`);
                if (cheatsDiv && cheatsDiv.style.maxHeight !== '0px') {
                    toggleSortGameCheats(gameId); // Kapat
                    setTimeout(() => toggleSortGameCheats(gameId), 100); // Tekrar aÃ§
                }
            }
        } catch(e) {
            console.error('Hile swap hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    let draggedCheatElement = null;
    let draggedOverElement = null;
    
    function initDragAndDrop() {
        // Oyun sÃ¼rÃ¼kle-bÄ±rak
        document.querySelectorAll('.draggable-game').forEach(item => {
            // Desktop - Drag events
            item.addEventListener('dragstart', handleGameDragStart);
            item.addEventListener('dragover', handleGameDragOver);
            item.addEventListener('drop', handleGameDrop);
            item.addEventListener('dragend', handleGameDragEnd);
            
            // Mobile - Touch events
            item.addEventListener('touchstart', handleGameTouchStart, { passive: false });
            item.addEventListener('touchmove', handleGameTouchMove, { passive: false });
            item.addEventListener('touchend', handleGameTouchEnd);
        });
        
        // Hile sÃ¼rÃ¼kle-bÄ±rak
        document.querySelectorAll('.draggable-cheat').forEach(item => {
            // Desktop - Drag events
            item.addEventListener('dragstart', handleCheatDragStart);
            item.addEventListener('dragover', handleCheatDragOver);
            item.addEventListener('drop', handleCheatDrop);
            item.addEventListener('dragend', handleCheatDragEnd);
            
            // Mobile - Touch events
            item.addEventListener('touchstart', handleCheatTouchStart, { passive: false });
            item.addEventListener('touchmove', handleCheatTouchMove, { passive: false });
            item.addEventListener('touchend', handleCheatTouchEnd);
        });
    }
    
    // === OYUN DRAG & DROP ===
    function handleGameDragStart(e) {
        draggedGameElement = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function handleGameDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (this !== draggedGameElement && this.classList.contains('draggable-game')) {
            this.style.borderTop = '2px solid #2196F3';
        }
        return false;
    }
    
    function handleGameDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        
        if (draggedGameElement !== this && this.classList.contains('draggable-game')) {
            const draggedId = draggedGameElement.dataset.gameId;
            const targetId = this.dataset.gameId;
            swapGames(draggedId, targetId);
        }
        
        this.style.borderTop = '';
        return false;
    }
    
    function handleGameDragEnd(e) {
        this.style.opacity = '';
        document.querySelectorAll('.draggable-game').forEach(item => {
            item.style.borderTop = '';
        });
    }
    
    // === OYUN TOUCH EVENTS (Mobile) ===
    let touchStartY = 0;
    let touchElement = null;
    
    function handleGameTouchStart(e) {
        touchElement = this;
        touchStartY = e.touches[0].clientY;
        this.style.opacity = '0.7';
        this.style.transform = 'scale(1.05)';
    }
    
    function handleGameTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const target = elements.find(el => el.classList && el.classList.contains('draggable-game') && el !== touchElement);
        
        if (draggedOverElement && draggedOverElement !== target) {
            draggedOverElement.style.borderTop = '';
        }
        
        if (target) {
            target.style.borderTop = '2px solid #2196F3';
            draggedOverElement = target;
        }
    }
    
    function handleGameTouchEnd(e) {
        this.style.opacity = '';
        this.style.transform = '';
        
        if (draggedOverElement) {
            const draggedId = this.dataset.gameId;
            const targetId = draggedOverElement.dataset.gameId;
            swapGames(draggedId, targetId);
            draggedOverElement.style.borderTop = '';
            draggedOverElement = null;
        }
        
        touchElement = null;
    }
    
    // === HÄ°LE DRAG & DROP ===
    function handleCheatDragStart(e) {
        draggedCheatElement = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function handleCheatDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggedGameId = draggedCheatElement?.dataset.gameId;
        const thisGameId = this.dataset.gameId;
        
        if (this !== draggedCheatElement && this.classList.contains('draggable-cheat') && draggedGameId === thisGameId) {
            this.style.borderTop = '2px solid #2196F3';
        }
        return false;
    }
    
    function handleCheatDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        
        const draggedGameId = draggedCheatElement?.dataset.gameId;
        const thisGameId = this.dataset.gameId;
        
        if (draggedCheatElement !== this && this.classList.contains('draggable-cheat') && draggedGameId === thisGameId) {
            const gameId = draggedGameId;
            const draggedCheatId = draggedCheatElement.dataset.cheatId;
            const targetCheatId = this.dataset.cheatId;
            swapCheats(gameId, draggedCheatId, targetCheatId);
        }
        
        this.style.borderTop = '';
        return false;
    }
    
    function handleCheatDragEnd(e) {
        this.style.opacity = '';
        document.querySelectorAll('.draggable-cheat').forEach(item => {
            item.style.borderTop = '';
        });
    }
    
    // === HÄ°LE TOUCH EVENTS (Mobile) ===
    function handleCheatTouchStart(e) {
        touchElement = this;
        touchStartY = e.touches[0].clientY;
        this.style.opacity = '0.7';
        this.style.transform = 'scale(1.05)';
    }
    
    function handleCheatTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const draggedGameId = touchElement?.dataset.gameId;
        const target = elements.find(el => el.classList && el.classList.contains('draggable-cheat') && el !== touchElement && el.dataset.gameId === draggedGameId);
        
        if (draggedOverElement && draggedOverElement !== target) {
            draggedOverElement.style.borderTop = '';
        }
        
        if (target) {
            target.style.borderTop = '2px solid #2196F3';
            draggedOverElement = target;
        }
    }
    
    function handleCheatTouchEnd(e) {
        this.style.opacity = '';
        this.style.transform = '';
        
        if (draggedOverElement) {
            const gameId = this.dataset.gameId;
            const draggedCheatId = this.dataset.cheatId;
            const targetCheatId = draggedOverElement.dataset.cheatId;
            swapCheats(gameId, draggedCheatId, targetCheatId);
            draggedOverElement.style.borderTop = '';
            draggedOverElement = null;
        }
        
        touchElement = null;
    }
    
    // Oyun yerlerini deÄŸiÅŸtir
    async function swapGames(gameId1, gameId2) {
        if (!requirePermission('games_edit', 'oyun sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        try {
            const order1 = gamesData[gameId1].sortOrder ?? 999;
            const order2 = gamesData[gameId2].sortOrder ?? 999;
            
            gamesData[gameId1].sortOrder = order2;
            gamesData[gameId2].sortOrder = order1;
            
            await Promise.all([
                db.collection('games').doc(gameId1).update({ sortOrder: order2 }),
                db.collection('games').doc(gameId2).update({ sortOrder: order1 })
            ]);
            
            loadGameCheatList();
            renderHomeGames();
        } catch(e) {
            console.error('Oyun swap hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Hile yerlerini deÄŸiÅŸtir
    async function swapCheats(gameId, cheatId1, cheatId2) {
        if (!requirePermission('cheats_edit', 'hile sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        try {
            const cheats = gamesData[gameId].cheats;
            const order1 = cheats[cheatId1].sortOrder ?? 999;
            const order2 = cheats[cheatId2].sortOrder ?? 999;
            
            cheats[cheatId1].sortOrder = order2;
            cheats[cheatId2].sortOrder = order1;
            
            await db.collection('games').doc(gameId).update({
                [`cheats.${cheatId1}.sortOrder`]: order2,
                [`cheats.${cheatId2}.sortOrder`]: order1
            });
            
            loadGameCheatList();
        } catch(e) {
            console.error('Hile swap hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Oyun sÄ±rasÄ±nÄ± deÄŸiÅŸtir (eski buton sistemi - artÄ±k kullanÄ±lmÄ±yor ama uyumluluk iÃ§in kalsÄ±n)
    async function moveGame(gameId, direction) {
        if (!requirePermission('games_edit', 'oyun sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        try {
            // Mevcut sÄ±ralamayÄ± al
            const gameIds = Object.keys(gamesData).sort((a, b) => {
                const orderA = gamesData[a].sortOrder ?? 999;
                const orderB = gamesData[b].sortOrder ?? 999;
                return orderA - orderB;
            });
            
            const currentIndex = gameIds.indexOf(gameId);
            if (currentIndex === -1) return;
            
            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= gameIds.length) return;
            
            // Ä°ki oyunun yerini deÄŸiÅŸtir
            const targetGameId = gameIds[targetIndex];
            
            const tempOrder = gamesData[gameId].sortOrder ?? currentIndex;
            gamesData[gameId].sortOrder = gamesData[targetGameId].sortOrder ?? targetIndex;
            gamesData[targetGameId].sortOrder = tempOrder;
            
            // Firestore'a kaydet
            await Promise.all([
                db.collection('games').doc(gameId).update({ sortOrder: gamesData[gameId].sortOrder }),
                db.collection('games').doc(targetGameId).update({ sortOrder: gamesData[targetGameId].sortOrder })
            ]);
            
            showToast('âœ… SÄ±ralama gÃ¼ncellendi');
            loadGameCheatList();
            renderHomeGames();
        } catch(e) {
            console.error('SÄ±ralama hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Hile sÄ±rasÄ±nÄ± deÄŸiÅŸtir
    async function moveCheat(gameId, cheatId, direction) {
        if (!requirePermission('cheats_edit', 'hile sÄ±ralamasÄ±nÄ± deÄŸiÅŸtirmek')) return;
        
        try {
            const cheats = gamesData[gameId].cheats || {};
            
            // Mevcut sÄ±ralamayÄ± al
            const cheatIds = Object.keys(cheats).sort((a, b) => {
                const orderA = cheats[a].sortOrder ?? 999;
                const orderB = cheats[b].sortOrder ?? 999;
                return orderA - orderB;
            });
            
            const currentIndex = cheatIds.indexOf(cheatId);
            if (currentIndex === -1) return;
            
            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= cheatIds.length) return;
            
            // Ä°ki hilenin yerini deÄŸiÅŸtir
            const targetCheatId = cheatIds[targetIndex];
            
            const tempOrder = cheats[cheatId].sortOrder ?? currentIndex;
            cheats[cheatId].sortOrder = cheats[targetCheatId].sortOrder ?? targetIndex;
            cheats[targetCheatId].sortOrder = tempOrder;
            
            // Firestore'a kaydet
            await db.collection('games').doc(gameId).update({
                [`cheats.${cheatId}.sortOrder`]: cheats[cheatId].sortOrder,
                [`cheats.${targetCheatId}.sortOrder`]: cheats[targetCheatId].sortOrder
            });
            
            showToast('âœ… Hile sÄ±ralamasÄ± gÃ¼ncellendi');
            loadGameCheatList();
        } catch(e) {
            console.error('Hile sÄ±ralama hatasÄ±:', e);
            showToast('âŒ SÄ±ralama gÃ¼ncellenemedi');
        }
    }
    
    // Eski fonksiyonlarÄ± kaldÄ±r - uyumluluk iÃ§in boÅŸ bÄ±rak
    let gamesAndCheats = {};
    function addNewGame() { openGameModal(); }
    function addNewCheat() { openCheatModal(); }
    function deleteGameOrCheat() { }
    
    // Key Aktifle (SADECE KURUCU)
    async function activateKey() {
        if (!requirePermission('keys_add', 'key aktifleÅŸtirmek')) return;
        
        const email = document.getElementById('adminUserEmail').value.trim();
        const game = document.getElementById('adminGame').value;
        const cheat = document.getElementById('adminCheat').value;
        const days = parseInt(document.getElementById('adminPackage').value);
        let keyCode = document.getElementById('adminKeyCode').value.trim();
        
        if (!email) { showToast('âŒ E-posta girin'); return; }
        if (!game) { showToast('âŒ Oyun seÃ§in'); return; }
        if (!cheat) { showToast('âŒ Hile seÃ§in'); return; }
        
        // Key kodu boÅŸsa otomatik Ã¼ret
        if (!keyCode) {
            keyCode = generateKeyCode();
        }
        
        try {
            showToast('â³ Key aktifleÅŸtiriliyor...');
            
            // KullanÄ±cÄ±yÄ± bul
            const users = await db.collection('users').where('email', '==', email).get();
            if (users.empty) { showToast('âŒ KullanÄ±cÄ± bulunamadÄ±'); return; }
            
            const userDoc = users.docs[0];
            const activatedAt = new Date();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);
            
            // Key ekle
            const userData = userDoc.data();
            const keys = userData.keys || [];
            keys.push({
                id: Date.now().toString(),
                keyCode: keyCode,
                game: game,
                cheat: cheat,
                days: days,
                activatedAt: activatedAt,
                expiresAt: expiresAt,
                activatedBy: currentUser.email
            });
            
            await db.collection('users').doc(userDoc.id).update({ keys });
            
            // Formu temizle
            document.getElementById('adminUserEmail').value = '';
            document.getElementById('adminKeyCode').value = '';
            
            // BaÅŸarÄ± mesajÄ±
            const packageLabel = days >= 365 ? 'SÄ±nÄ±rsÄ±z' : days + ' GÃ¼nlÃ¼k';
            showNotification(`âœ… Key aktifleÅŸtirildi!\n\nğŸ‘¤ ${email}\nğŸ® ${game}\nğŸ›¡ï¸ ${cheat}\nâ±ï¸ ${packageLabel}\nğŸ”‘ ${keyCode}`);
            
            // Ãœye listesini yenile
            loadAllUsers();
        } catch(e) {
            console.error('Key aktifleÅŸtirme hatasÄ±:', e);
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Otomatik key kodu Ã¼retici
    function generateKeyCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'TB-';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (i < 3) code += '-';
        }
        return code;
    }
    
    // ==================== ÃœYE YÃ–NETÄ°MÄ° ====================

    let usersRealtimeListener = null;

    function stopUsersRealtimeListener() {
        try {
            if (usersRealtimeListener) {
                usersRealtimeListener();
                usersRealtimeListener = null;
            }
        } catch (e) {
            usersRealtimeListener = null;
        }
    }

    function isUserOnline(user) {
        try {
            if (!user) return false;
            if (user.isOnline !== true) return false;
            const lastSeen = toDate(user.lastSeenAt);
            if (!lastSeen) return false;
            return (Date.now() - lastSeen.getTime()) <= 90000;
        } catch (e) {
            return false;
        }
    }

    function formatTrDateTime(date) {
        try {
            if (!date) return 'Bilinmiyor';
            return date.toLocaleString('tr-TR');
        } catch (e) {
            return 'Bilinmiyor';
        }
    }
    
    // TÃ¼m Ã¼yeleri yÃ¼kle
    async function loadAllUsers() {
        if (!hasPermission('members_view')) {
            document.getElementById('usersListContainer').innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">Bu Ã¶zellik iÃ§in yetkiniz yok</div>';
            return;
        }
        const container = document.getElementById('usersListContainer');
        const countEl = document.getElementById('totalUsersCount');
        const onlineCountEl = document.getElementById('totalOnlineCount');
        
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">â³ YÃ¼kleniyor...</div>';
        
        try {
            // Spark (Ã¼cretsiz) kotayÄ± korumak iÃ§in: tÃ¼m Ã¼yeleri realtime dinleme KAPALI.
            // Ãœye listesini sadece istek anÄ±nda tek sefer Ã§ek.
            stopUsersRealtimeListener();

            const usersSnapshot = await db.collection('users').get();
            countEl.textContent = usersSnapshot.size;
            if (onlineCountEl) onlineCountEl.textContent = '0';

            if (usersSnapshot.empty) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">HenÃ¼z Ã¼ye yok</div>';
                return;
            }

            const now = new Date();

            // KullanÄ±cÄ±larÄ± admin ve normal olarak ayÄ±r
            let adminUsers = [];
            let normalUsers = [];
            let onlineCount = 0;

            usersSnapshot.forEach(doc => {
                const user = doc.data();
                const userId = doc.id;
                const email = user.email || 'E-posta yok';

                // Kurucu/Admin kontrolÃ¼
                const isUserOwner = isOwnerEmail(email);
                const isUserAdmin = isUserOwner || adminEmails.includes(email.toLowerCase());

                if (isUserOnline(user)) onlineCount++;

                const userData = {
                    userId,
                    email,
                    user,
                    isAdmin: isUserAdmin,
                    isOwner: isUserOwner
                };

                if (isUserAdmin) {
                    adminUsers.push(userData);
                } else {
                    normalUsers.push(userData);
                }
            });

            if (onlineCountEl) onlineCountEl.textContent = String(onlineCount);

            // HTML oluÅŸtur
            let usersHtml = '';

            // Ã–nce adminleri gÃ¶ster
            [...adminUsers, ...normalUsers].forEach(({ userId, email, user, isAdmin: isUserAdmin, isOwner: isUserOwner }) => {
                const keys = user.keys || [];

                // Aktif key sayÄ±sÄ±
                const activeKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() > now);
                const expiredKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() <= now);

                // Durum belirleme
                let statusBadge = '';
                let statusIcon = '';
                if (activeKeys.length > 0) {
                    statusBadge = `<span style="background: #4CAF50; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px;">AKTÄ°F</span>`;
                    statusIcon = 'ğŸŸ¢';
                } else if (expiredKeys.length > 0) {
                    statusBadge = `<span style="background: #FF9800; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px;">DOLDU</span>`;
                    statusIcon = 'ğŸŸ ';
                } else {
                    statusBadge = `<span style="background: #9E9E9E; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px;">YENÄ°</span>`;
                    statusIcon = 'âšª';
                }

                // Kurucu/Admin badge - Kurucu ve Admin iÃ§in farklÄ± etiket
                let roleBadge = '';
                if (isUserOwner) {
                    roleBadge = `<span style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">ğŸ‘‘ KURUCU</span>`;
                } else if (isUserAdmin) {
                    roleBadge = `<span style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold;">ğŸ‘® ADMÄ°N</span>`;
                }

                // KayÄ±t tarihi
                const createdAt = user.createdAt ? user.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmiyor';

                const online = isUserOnline(user);
                const lastLoginDate = toDate(user.lastLogin) || toDate(user.lastLoginAt);
                const lastLoginText = formatTrDateTime(lastLoginDate);

                const onlineOrLastLogin = online
                    ? `<span style="color: #4CAF50; font-weight: bold;">ğŸŸ¢ Ã‡EVRÄ°MÄ°Ã‡Ä°</span>`
                    : `<span style="color: #888;">ğŸ•’ Son giriÅŸ: ${lastLoginText}</span>`;

                // Kurucu/Admin iÃ§in Ã¶zel border
                let cardStyle = 'background: rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; margin-bottom: 8px; transition: all 0.2s;';
                if (isUserOwner) {
                    cardStyle = 'background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4); border-radius: 10px; padding: 12px; margin-bottom: 8px; transition: all 0.2s;';
                } else if (isUserAdmin) {
                    cardStyle = 'background: rgba(156,39,176,0.15); border: 1px solid rgba(156,39,176,0.4); border-radius: 10px; padding: 12px; margin-bottom: 8px; transition: all 0.2s;';
                }

                usersHtml += `
                    <div style="${cardStyle}" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; cursor: pointer;" onclick="openUserDetail('${userId}')">>
                                <span style="font-size: 18px;">${isUserOwner ? 'ğŸ‘‘' : (isUserAdmin ? 'ğŸ‘®' : statusIcon)}</span>
                                <div style="min-width: 0;">
                                    <div style="font-size: 13px; color: #fff; word-break: break-all;">${email}</div>
                                    <div style="font-size: 11px; color: #888; margin-top: 2px;">ğŸ“… ${createdAt} â€¢ ğŸ”‘ ${activeKeys.length} aktif, ${expiredKeys.length} dolmuÅŸ â€¢ ${onlineOrLastLogin}</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${roleBadge}
                                ${!isUserAdmin && !isUserOwner ? statusBadge : ''}
                                ${isOwner() && !isUserAdmin && !isUserOwner ? `<button onclick="event.stopPropagation(); deleteUser('${userId}', '${email}')" style="background: #f44336; border: none; color: #fff; padding: 4px 8px; border-radius: 5px; font-size: 10px; cursor: pointer; margin-left: 4px;" title="Ãœyeyi Sil">ğŸ—‘ï¸</button>` : ''}
                                <span style="color: #666;" onclick="openUserDetail('${userId}')">â€º</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = usersHtml;
        } catch (e) {
            console.error('Ãœye yÃ¼kleme hatasÄ±:', e);
            container.innerHTML = `<div style="color: #f44336; text-align: center; padding: 20px;">Hata: ${e.message}</div>`;
        }
    }
    
    // Ãœye detay modal'Ä±nÄ± aÃ§
    async function openUserDetail(userId) {
        if (!hasPermission('members_view')) {
            showToast('âŒ Ãœye gÃ¶rÃ¼ntÃ¼leme yetkiniz yok');
            return;
        }
        const content = document.getElementById('userDetailContent');
        content.innerHTML = '<div style="text-align: center; padding: 40px; color: #aaa;">â³ YÃ¼kleniyor...</div>';
        openModal('userDetailModal');
        
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            
            if (!userDoc.exists) {
                content.innerHTML = '<div style="color: #f44336; text-align: center; padding: 20px;">Ãœye bulunamadÄ±</div>';
                return;
            }
            
            const user = userDoc.data();
            const email = user.email || 'E-posta yok';
            const keys = user.keys || [];
            const now = new Date();
            
            // Keyleri ayÄ±r
            const activeKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() > now);
            const expiredKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() <= now);
            
            // KayÄ±t tarihi
            const createdAt = user.createdAt ? user.createdAt.toDate().toLocaleString('tr-TR') : 'Bilinmiyor';
            const lastLogin = user.lastLogin ? user.lastLogin.toDate().toLocaleString('tr-TR') : 'Bilinmiyor';
            
            // Åifre (varsa) - Sadece kurucu gÃ¶rebilir
            const userPassword = user.password || 'KayÄ±tlÄ± deÄŸil';
            const canSeePassword = isOwner();
            
            let html = `
                <!-- Ãœye Bilgileri -->
                <div style="background: rgba(33,150,243,0.1); border: 1px solid rgba(33,150,243,0.3); border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 14px; font-weight: bold; color: #2196F3; margin-bottom: 12px;">ğŸ“§ Ãœye Bilgileri</div>
                    <div style="display: grid; gap: 8px; font-size: 13px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888;">E-posta:</span>
                            <span style="color: #fff; word-break: break-all;">${email}</span>
                        </div>
                        ${canSeePassword ? `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #888;">Åifre:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span id="userPasswordField" style="color: #FF9800; font-family: monospace;">â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</span>
                                <button onclick="togglePasswordVisibility('${userPassword}')" style="background: #FF9800; border: none; color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 10px; cursor: pointer;">ğŸ‘ï¸</button>
                                <button onclick="copyToClipboard('${userPassword}')" style="background: #2196F3; border: none; color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 10px; cursor: pointer;">ğŸ“‹</button>
                            </div>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888;">KayÄ±t Tarihi:</span>
                            <span style="color: #fff;">${createdAt}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #888;">Toplam Key:</span>
                            <span style="color: #fff;">${keys.length}</span>
                        </div>
                    </div>
                </div>
                
                <!-- HÄ±zlÄ± Ä°ÅŸlemler -->
                <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                    <button onclick="document.getElementById('adminUserEmail').value='${email}'; closeModal('userDetailModal'); showToast('ğŸ“§ E-posta kopyalandÄ±');" style="flex: 1; background: linear-gradient(135deg, #4CAF50, #388E3C); border: none; color: #fff; padding: 10px; border-radius: 8px; font-size: 12px; cursor: pointer;">ğŸ”‘ Key Ekle</button>
                    <button onclick="copyToClipboard('${email}')" style="flex: 1; background: linear-gradient(135deg, #2196F3, #1976D2); border: none; color: #fff; padding: 10px; border-radius: 8px; font-size: 12px; cursor: pointer;">ğŸ“‹ E-posta Kopyala</button>
                </div>
                
                <!-- Ãœye Silme (Sadece kurucu gÃ¶rebilir, kurucu silinemez) -->
                ${isOwner() && email !== OWNER_EMAIL ? `
                <div style="margin-bottom: 15px;">
                    <button onclick="deleteUser('${userId}', '${email}')" style="width: 100%; background: linear-gradient(135deg, #f44336, #d32f2f); border: none; color: #fff; padding: 10px; border-radius: 8px; font-size: 12px; cursor: pointer;">ğŸ—‘ï¸ Ãœyeyi Sil</button>
                </div>
                ` : ''}
            `;
            
            // Aktif Keyler
            if (activeKeys.length > 0) {
                html += `
                    <div style="font-size: 14px; font-weight: bold; color: #4CAF50; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span>âœ… Aktif Keyler</span>
                        <span style="background: #4CAF50; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${activeKeys.length}</span>
                    </div>
                `;
                
                activeKeys.forEach((key, index) => {
                    const exp = key.expiresAt.toDate();
                    const activatedAt = key.activatedAt ? key.activatedAt.toDate() : new Date();
                    const totalDays = key.days || Math.ceil((exp - activatedAt) / (1000 * 60 * 60 * 24));
                    
                    const remainingMs = exp - now;
                    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
                    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    
                    let remainingText = remainingDays > 0 ? `${remainingDays}g ${remainingHours}s` : `${remainingHours} saat`;
                    let packageLabel = totalDays >= 365 ? 'SÄ±nÄ±rsÄ±z' : `${totalDays} GÃ¼nlÃ¼k`;
                    const keyCode = key.keyCode || key.code || '***';
                    const gameName = key.game || 'Mobile Legends';
                    const cheatName = key.cheat || 'TheBestML';
                    
                    html += `
                        <div style="background: rgba(76,175,80,0.1); border: 1px solid rgba(76,175,80,0.3); border-radius: 10px; padding: 12px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-weight: bold; color: #4CAF50;">${packageLabel}</span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 11px; color: #aaa;">â±ï¸ ${remainingText} kaldÄ±</span>
                                    ${isOwner() ? `<button onclick="adminDeleteUserKey('${userId}', ${index}, '${keyCode}', 'active')" style="background: #f44336; border: none; color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 10px; cursor: pointer;" title="Key'i Sil">ğŸ—‘ï¸</button>` : ''}
                                </div>
                            </div>
                            <div style="font-size: 11px; color: #888; margin-bottom: 6px;">ğŸ® ${gameName} â€¢ ğŸ›¡ï¸ ${cheatName}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <code style="flex: 1; font-size: 11px; color: #4CAF50; word-break: break-all;">${keyCode}</code>
                                <button onclick="copyToClipboard('${keyCode}'); event.stopPropagation();" style="background: #4CAF50; border: none; color: #fff; padding: 4px 8px; border-radius: 5px; font-size: 10px; cursor: pointer;">ğŸ“‹</button>
                            </div>
                            <div style="font-size: 10px; color: #666; margin-top: 6px;">ğŸ“… BitiÅŸ: ${exp.toLocaleDateString('tr-TR')}</div>
                        </div>
                    `;
                });
            }
            
            // SÃ¼resi DolmuÅŸ Keyler
            if (expiredKeys.length > 0) {
                html += `
                    <div style="font-size: 14px; font-weight: bold; color: #f44336; margin: 15px 0 10px 0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>âŒ SÃ¼resi DolmuÅŸ</span>
                            <span style="background: #f44336; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${expiredKeys.length}</span>
                        </div>
                        ${isOwner() ? `<button onclick="adminDeleteAllExpiredKeys('${userId}')" style="background: #ff5722; border: none; color: #fff; padding: 5px 10px; border-radius: 6px; font-size: 10px; cursor: pointer;">ğŸ—‘ï¸ TÃ¼mÃ¼nÃ¼ Sil</button>` : ''}
                    </div>
                `;
                
                expiredKeys.forEach((key, index) => {
                    const exp = key.expiresAt.toDate();
                    const activatedAt = key.activatedAt ? key.activatedAt.toDate() : new Date();
                    const totalDays = key.days || Math.ceil((exp - activatedAt) / (1000 * 60 * 60 * 24));
                    
                    const expiredMs = now - exp;
                    const expiredDays = Math.floor(expiredMs / (1000 * 60 * 60 * 24));
                    let expiredText = expiredDays > 0 ? `${expiredDays} gÃ¼n Ã¶nce` : 'BugÃ¼n';
                    
                    let packageLabel = totalDays >= 365 ? 'SÄ±nÄ±rsÄ±z' : `${totalDays} GÃ¼nlÃ¼k`;
                    const keyCode = key.keyCode || key.code || '***';
                    const gameName = key.game || 'Mobile Legends';
                    const cheatName = key.cheat || 'TheBestML';
                    
                    // Expired key iÃ§in gerÃ§ek index bulmak iÃ§in aktif key sayÄ±sÄ±nÄ± ekle
                    const realIndex = activeKeys.length + index;
                    
                    html += `
                        <div style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3); border-radius: 10px; padding: 12px; margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-weight: bold; color: #f44336;">${packageLabel}</span>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 11px; color: #888;">â° ${expiredText} bitti</span>
                                    ${isOwner() ? `<button onclick="adminDeleteUserKey('${userId}', ${realIndex}, '${keyCode}', 'expired')" style="background: #ff5722; border: none; color: #fff; padding: 3px 8px; border-radius: 5px; font-size: 10px; cursor: pointer;" title="Key'i Sil">ğŸ—‘ï¸</button>` : ''}
                                </div>
                            </div>
                            <div style="font-size: 11px; color: #666; margin-bottom: 6px;">ğŸ® ${gameName} â€¢ ğŸ›¡ï¸ ${cheatName}</div>
                            <code style="font-size: 11px; color: #888; word-break: break-all;">${keyCode}</code>
                            <div style="font-size: 10px; color: #666; margin-top: 6px;">ğŸ“… Bitti: ${exp.toLocaleDateString('tr-TR')}</div>
                        </div>
                    `;
                });
            }
            
            // Key yoksa
            if (keys.length === 0) {
                html += `
                    <div style="text-align: center; padding: 30px; color: #888;">
                        <div style="font-size: 40px; margin-bottom: 10px;">ğŸ”‘</div>
                        <div>Bu Ã¼yenin henÃ¼z key'i yok</div>
                    </div>
                `;
            }
            
            // Ãœyenin sipariÅŸlerini gÃ¶ster
            const ordersSnapshot = await db.collection('orders').where('userId', '==', userId).get();
            
            if (!ordersSnapshot.empty) {
                let orderList = [];
                ordersSnapshot.forEach(doc => orderList.push({ id: doc.id, ...doc.data() }));
                orderList.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
                
                html += `
                    <div style="font-size: 14px; font-weight: bold; color: #FF9800; margin: 15px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span>ğŸ“¦ SipariÅŸler</span>
                        <span style="background: #FF9800; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${orderList.length}</span>
                    </div>
                `;
                
                orderList.forEach(order => {
                    const date = order.createdAt.toDate().toLocaleDateString('tr-TR');
                    let statusText = '', statusColor = '';
                    
                    if (order.status === 'pending') {
                        statusText = 'â³ Beklemede';
                        statusColor = '#FF9800';
                    } else if (order.status === 'approved') {
                        statusText = 'âœ… OnaylandÄ±';
                        statusColor = '#4CAF50';
                    } else {
                        statusText = 'âŒ Reddedildi';
                        statusColor = '#f44336';
                    }
                    
                    html += `
                        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; margin-bottom: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 12px; color: #fff;">${order.packageName}</div>
                                    <div style="font-size: 11px; color: #888;">ğŸ“… ${date}</div>
                                </div>
                                <span style="color: ${statusColor}; font-size: 11px;">${statusText}</span>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Aktivite LoglarÄ± (Silinen Keyler vs)
            const activityLog = user.activityLog || [];
            if (activityLog.length > 0) {
                // Tarihe gÃ¶re sÄ±rala (en yeni en Ã¼stte)
                activityLog.sort((a, b) => {
                    const dateA = a.deletedAt ? a.deletedAt.toDate() : new Date(0);
                    const dateB = b.deletedAt ? b.deletedAt.toDate() : new Date(0);
                    return dateB - dateA;
                });
                
                html += `
                    <div style="font-size: 14px; font-weight: bold; color: #9C27B0; margin: 15px 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <span>ğŸ“‹ Aktivite GeÃ§miÅŸi</span>
                        <span style="background: #9C27B0; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${activityLog.length}</span>
                    </div>
                `;
                
                activityLog.forEach(activity => {
                    if (activity.type === 'key_deleted') {
                        const deletedAt = activity.deletedAt ? activity.deletedAt.toDate().toLocaleString('tr-TR') : 'Bilinmiyor';
                        const deletedByText = activity.deletedBy === 'user' ? 'ğŸ‘¤ Ãœye tarafÄ±ndan silindi' : 'ğŸ‘‘ Admin tarafÄ±ndan silindi';
                        const packageLabel = activity.days >= 365 ? 'SÄ±nÄ±rsÄ±z' : `${activity.days} GÃ¼nlÃ¼k`;
                        
                        html += `
                            <div style="background: rgba(156,39,176,0.1); border: 1px solid rgba(156,39,176,0.3); border-radius: 10px; padding: 12px; margin-bottom: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-size: 16px;">ğŸ—‘ï¸</span>
                                        <span style="font-weight: bold; color: #9C27B0;">${packageLabel} Key Silindi</span>
                                    </div>
                                    <span style="background: rgba(156,39,176,0.3); color: #CE93D8; padding: 2px 8px; border-radius: 8px; font-size: 10px;">${deletedByText}</span>
                                </div>
                                <div style="font-size: 11px; color: #888; margin-bottom: 6px;">
                                    ğŸ® ${activity.game || 'Mobile Legends'} â€¢ ğŸ›¡ï¸ ${activity.cheat || 'TheBestML'}
                                </div>
                                <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
                                    ğŸ”‘ <code style="color: #9C27B0;">${activity.keyCode || '***'}</code>
                                </div>
                                <div style="font-size: 10px; color: #666;">
                                    ğŸ“… Silinme: ${deletedAt}
                                </div>
                                ${activity.reason ? `<div style="font-size: 10px; color: #888; margin-top: 4px; font-style: italic;">ğŸ’¬ ${activity.reason}</div>` : ''}
                            </div>
                        `;
                    }
                });
            }
            
            content.innerHTML = html;
        } catch(e) {
            console.error('Ãœye detay hatasÄ±:', e);
            content.innerHTML = `<div style="color: #f44336; text-align: center; padding: 20px;">Hata: ${e.message}</div>`;
        }
    }
    
    // ==================== SÄ°PARÄ°Å YÃ–NETÄ°MÄ° ====================
    
    async function loadPendingOrders() {
        if (!isAdmin()) return;
        
        // Chat listesini de yÃ¼kle (destek yetkisi olanlar iÃ§in)
        if (hasPermission('support')) {
            loadAdminChats();
        }
        
        // SipariÅŸ yetkisi yoksa erken dÃ¶n
        if (!hasPermission('orders')) {
            document.getElementById('pendingOrders').innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">SipariÅŸ gÃ¶rÃ¼ntÃ¼leme yetkiniz yok</div>';
            const monthlyEl = document.getElementById('monthlyApprovedOrdersSummary');
            if (monthlyEl) monthlyEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">SipariÅŸ gÃ¶rÃ¼ntÃ¼leme yetkiniz yok</div>';
            return;
        }
        
        const container = document.getElementById('pendingOrders');
        const countEl = document.getElementById('orderCount');
        try {
            // Worker/D1 (Firestore-free) admin sipariÅŸleri
            try { await loadRemoteRuntimeConfig(); } catch (e) {}
            const ordersApiBase = (typeof getOrdersApiBase === 'function') ? getOrdersApiBase() : '';
            if (ordersApiBase) {
                if (container) container.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">â³ YÃ¼kleniyor...</div>';

                let data;
                try {
                    data = await workerApiFetch(ordersApiBase, '/v1/admin/orders?status=pending', { method: 'GET' });
                } catch (e) {
                    const status = e && typeof e.httpStatus === 'number' ? e.httpStatus : null;
                    if (status === 401 || status === 403) {
                        if (countEl) countEl.textContent = '0';
                        if (container) {
                            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">âš ï¸ Admin yetkisi yok (HTTP ' + status + ').<br/>Bu hesabÄ±n e-postasÄ± Worker admin listesinde deÄŸilse sipariÅŸler gÃ¶rÃ¼nmez.</div>';
                        }
                        return;
                    }
                    throw e;
                }

                const orderList = (data && Array.isArray(data.orders)) ? data.orders : [];
                if (countEl) countEl.textContent = String(orderList.length);

                if (!orderList.length) {
                    if (container) container.innerHTML = '<div style="text-align: center; padding: 20px;">âœ… Bekleyen sipariÅŸ yok</div>';
                    try { loadMonthlyApprovedOrdersSummary(); } catch (e) {}
                    return;
                }

                orderList.sort((a, b) => {
                    const ad = safeToDateMaybe(a.createdAtMs || a.createdAt) || new Date(0);
                    const bd = safeToDateMaybe(b.createdAtMs || b.createdAt) || new Date(0);
                    return bd.getTime() - ad.getTime();
                });

                let html = '';
                orderList.forEach((o) => {
                    const dateObj = safeToDateMaybe(o.createdAtMs || o.createdAt) || new Date();
                    const date = dateObj.toLocaleString('tr-TR');
                    const usedPoints = Number.isFinite(Number(o.loyaltyUsedPoints)) ? Number(o.loyaltyUsedPoints) : 0;
                    const discountAmount = Number.isFinite(Number(o.loyaltyDiscountAmount)) ? Number(o.loyaltyDiscountAmount) : 0;
                    const payableAmount = Number.isFinite(Number(o.payableAmount)) ? Number(o.payableAmount) : null;
                    const baseAmount = Number.isFinite(Number(o.baseAmount)) ? Number(o.baseAmount) : null;
                    const showLoyalty = (usedPoints > 0) || (discountAmount > 0) || (payableAmount !== null) || (baseAmount !== null);
                    const discountDisplay = discountAmount > 0 ? discountAmount : usedPoints;
                    const loyaltyLine = showLoyalty ? `
                            <div style="font-size: 11px; color: #4CAF50; margin-top: 6px;">
                                ğŸ ${usedPoints > 0 ? `Puan: ${usedPoints}` : 'Puan'}${discountDisplay > 0 ? ` â€¢ Ä°ndirim: -${discountDisplay}â‚º` : ''}${payableAmount !== null ? ` â€¢ Ã–denecek: ${payableAmount}â‚º` : ''}
                            </div>
                    ` : '';

                    const id = String(o.id || '');
                    const email = String(o.email || o.userEmail || 'Bilinmiyor');
                    const pkg = String(o.packageName || o.label || 'Paket');
                    const price = String(o.price || '');

                    html += `<div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 10px; cursor: pointer;" onclick="showOrderDetail('${id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold; color: #4CAF50;">${escapeHtml(email)}</div>
                                <div style="font-size: 13px; margin-top: 5px;">ğŸ“¦ ${escapeHtml(pkg)} - <span style="color: #FFD700;">${escapeHtml(price)}</span></div>
                                ${loyaltyLine}
                                <div style="font-size: 11px; color: #666; margin-top: 5px;">ğŸ“… ${escapeHtml(date)}</div>
                            </div>
                            <div style="font-size: 24px;">ğŸ“‹</div>
                        </div>
                    </div>`;
                });

                if (container) container.innerHTML = html;
                try { loadMonthlyApprovedOrdersSummary(); } catch (e) {}
                return;
            }

            const orders = await db.collection('orders').where('status', '==', 'pending').get();
            countEl.textContent = orders.size;
            
            if (orders.empty) {
                container.innerHTML = '<div style="text-align: center; padding: 20px;">âœ… Bekleyen sipariÅŸ yok</div>';
                // AylÄ±k Ã¶zet yine de yÃ¼klensin
                try { loadMonthlyApprovedOrdersSummary(); } catch (e) {}
                return;
            }
            
            // Client-side sÄ±ralama
            let orderList = [];
            orders.forEach(doc => {
                orderList.push({ id: doc.id, ...doc.data() });
            });
            orderList.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
            
            let html = '';
            orderList.forEach(o => {
                const date = o.createdAt.toDate().toLocaleString('tr-TR');
                const usedPoints = Number.isFinite(Number(o.loyaltyUsedPoints)) ? Number(o.loyaltyUsedPoints) : 0;
                const discountAmount = Number.isFinite(Number(o.loyaltyDiscountAmount)) ? Number(o.loyaltyDiscountAmount) : 0;
                const payableAmount = Number.isFinite(Number(o.payableAmount)) ? Number(o.payableAmount) : null;
                const baseAmount = Number.isFinite(Number(o.baseAmount)) ? Number(o.baseAmount) : null;
                const showLoyalty = (usedPoints > 0) || (discountAmount > 0) || (payableAmount !== null) || (baseAmount !== null);
                const discountDisplay = discountAmount > 0 ? discountAmount : usedPoints;
                const loyaltyLine = showLoyalty ? `
                            <div style="font-size: 11px; color: #4CAF50; margin-top: 6px;">
                                ğŸ ${usedPoints > 0 ? `Puan: ${usedPoints}` : 'Puan'}${discountDisplay > 0 ? ` â€¢ Ä°ndirim: -${discountDisplay}â‚º` : ''}${payableAmount !== null ? ` â€¢ Ã–denecek: ${payableAmount}â‚º` : ''}
                            </div>
                ` : '';
                html += `<div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 10px; cursor: pointer;" onclick="showOrderDetail('${o.id}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: #4CAF50;">${o.email}</div>
                            <div style="font-size: 13px; margin-top: 5px;">ğŸ“¦ ${o.packageName} - <span style="color: #FFD700;">${o.price}</span></div>
                            ${loyaltyLine}
                            <div style="font-size: 11px; color: #666; margin-top: 5px;">ğŸ“… ${date}</div>
                        </div>
                        <div style="font-size: 24px;">ğŸ“‹</div>
                    </div>
                </div>`;
            });
            container.innerHTML = html;

            // Bekleyenler yÃ¼klendikten sonra aylÄ±k Ã¶zet
            try { loadMonthlyApprovedOrdersSummary(); } catch (e) {}
        } catch(e) {
            container.innerHTML = 'Hata: ' + e.message;
            const monthlyEl = document.getElementById('monthlyApprovedOrdersSummary');
            if (monthlyEl) monthlyEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #f44336;">AylÄ±k Ã¶zet yÃ¼klenemedi</div>';
        }
    }

    function getTurkishMonthNameUpper(monthIndex0) {
        const names = ['OCAK','ÅUBAT','MART','NÄ°SAN','MAYIS','HAZÄ°RAN','TEMMUZ','AÄUSTOS','EYLÃœL','EKÄ°M','KASIM','ARALIK'];
        return names[monthIndex0] || '';
    }

    function safeToDateMaybe(value) {
        try {
            if (typeof toDate === 'function') return toDate(value);
        } catch (e) {}
        try {
            if (!value) return null;
            if (value instanceof Date) return value;
            if (value.toDate && typeof value.toDate === 'function') return value.toDate();
            const t = new Date(value);
            if (isNaN(t.getTime())) return null;
            return t;
        } catch (e) {}
        return null;
    }

    function formatTryAmountTL(amount) {
        const n = Number(amount);
        if (!Number.isFinite(n) || n <= 0) return '0â‚º';

        const rounded = Math.round(n * 100) / 100;
        const isInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
        return rounded.toLocaleString('tr-TR', {
            minimumFractionDigits: isInt ? 0 : 2,
            maximumFractionDigits: 2
        }) + 'â‚º';
    }

    function computeOrderApprovedAmount(order) {
        const payable = Number(order && order.payableAmount);
        if (Number.isFinite(payable) && payable >= 0) return Math.floor(payable);

        const base = Number(order && order.baseAmount);
        if (Number.isFinite(base) && base > 0) {
            // baseAmount varsa ama payable yoksa, gene de price'a Ã¶ncelik verelim
        }

        try {
            if (typeof parsePriceToAmount === 'function') {
                return parsePriceToAmount(order && order.price);
            }
        } catch (e) {}

        const digits = String(order && order.price || '').replace(/[^0-9]/g, '');
        const n = Number(digits);
        return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }

    async function archiveApprovedOrderSnapshot(orderId, fallbackData) {
        try {
            if (!orderId) return;
            if (!db) return;

            let data = fallbackData || null;
            try {
                const snap = await db.collection('orders').doc(orderId).get();
                if (snap && snap.exists) data = { id: snap.id, ...(snap.data() || {}) };
            } catch (e) {}

            if (!data) return;

            const approvedAt = data.approvedAt || new Date();
            const rawApprovedBy = (data.approvedBy || (currentUser && currentUser.email) || '').toString();
            let approvedBy = rawApprovedBy;
            try {
                if (typeof normalizeEmail === 'function') approvedBy = normalizeEmail(rawApprovedBy);
            } catch (e) {}

            const amount = computeOrderApprovedAmount(data);
            const adminShare = Math.round((amount * 0.15) * 100) / 100;

            const archiveDoc = {
                orderId: orderId,
                status: 'approved',
                approvedAt: approvedAt,
                approvedBy: approvedBy,
                email: (data.email || data.userEmail || data.resolvedEmail || '').toString(),
                packageName: (data.packageName || data.label || data.package || data.cheat || '').toString(),
                game: (data.game || '').toString(),
                cheat: (data.cheat || '').toString(),
                keyCode: (data.keyCode || '').toString(),
                price: (typeof data.price === 'undefined') ? null : data.price,
                baseAmount: (typeof data.baseAmount === 'undefined') ? null : data.baseAmount,
                payableAmount: (typeof data.payableAmount === 'undefined') ? null : data.payableAmount,
                amount: amount,
                adminShare: adminShare,
                archivedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('approvedOrdersArchive').doc(orderId).set(archiveDoc, { merge: true });
        } catch (e) {
            console.log('archiveApprovedOrderSnapshot error:', e);
        }
    }

    async function loadMonthlyApprovedOrdersSummary() {
        if (!isAdmin()) return;

        const container = document.getElementById('monthlyApprovedOrdersSummary');
        if (!container) return;

        if (!hasPermission('orders')) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaa;">SipariÅŸ gÃ¶rÃ¼ntÃ¼leme yetkiniz yok</div>';
            return;
        }

        container.innerHTML = '<div style="text-align: center; padding: 15px; color: #aaa;">â³ YÃ¼kleniyor...</div>';

        try {
            const merged = new Map();

            // Ã–nce arÅŸivden Ã§ek: sipariÅŸ silinse bile ay Ã¶zeti devam eder.
            try {
                const archSnap = await db.collection('approvedOrdersArchive').get();
                if (archSnap && !archSnap.empty) {
                    archSnap.forEach((doc) => {
                        const d = doc.data() || {};
                        const id = (d.orderId || doc.id || '').toString();
                        if (!id) return;
                        merged.set(id, { id, ...d });
                    });
                }
            } catch (e) {}

            // GeÃ§iÅŸ uyumluluÄŸu: arÅŸivde olmayan eski onaylÄ±larÄ± orders'tan ekle.
            try {
                const ordSnap = await db.collection('orders').where('status', '==', 'approved').get();
                if (ordSnap && !ordSnap.empty) {
                    ordSnap.forEach((doc) => {
                        if (!merged.has(doc.id)) merged.set(doc.id, { id: doc.id, ...(doc.data() || {}) });
                    });
                }
            } catch (e) {}

            const items = Array.from(merged.values());
            if (!items.length) {
                container.innerHTML = '<div style="text-align: center; padding: 15px;">âœ… OnaylanmÄ±ÅŸ sipariÅŸ yok</div>';
                return;
            }

            // SÄ±ralama: approvedAt desc, yoksa createdAt desc
            items.sort((a, b) => {
                const ad = safeToDateMaybe(a.approvedAt) || safeToDateMaybe(a.createdAt) || new Date(0);
                const bd = safeToDateMaybe(b.approvedAt) || safeToDateMaybe(b.createdAt) || new Date(0);
                return bd.getTime() - ad.getTime();
            });

            const groups = {}; // key: YYYY-MM
            items.forEach((o) => {
                const d = safeToDateMaybe(o.approvedAt) || safeToDateMaybe(o.createdAt) || new Date(0);
                const y = d.getFullYear();
                const m1 = d.getMonth() + 1;
                const key = y + '-' + String(m1).padStart(2, '0');
                const label = getTurkishMonthNameUpper(m1 - 1) + ' ' + y;
                if (!groups[key]) {
                    groups[key] = {
                        key,
                        label,
                        year: y,
                        count: 0,
                        totalAmount: 0,
                        adminShareTotal: 0,
                        orders: []
                    };
                }
                const amount = Number.isFinite(Number(o.amount)) ? Math.floor(Number(o.amount)) : computeOrderApprovedAmount(o);
                const adminShare = Number.isFinite(Number(o.adminShare)) ? Number(o.adminShare) : (Math.round((amount * 0.15) * 100) / 100);
                groups[key].count += 1;
                groups[key].totalAmount += amount;
                groups[key].adminShareTotal += adminShare;
                groups[key].orders.push({ ...o, __approvedDate: d, __amount: amount });
            });

            const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

            let html = '';
            sortedKeys.forEach((k) => {
                const g = groups[k];
                const totalLabel = formatTryAmountTL(g.totalAmount);
                const adminShareLabel = formatTryAmountTL(g.adminShareTotal);

                html += `
                    <details style="background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.25); border-radius: 12px; padding: 12px; margin-bottom: 10px;">
                        <summary style="cursor: pointer; color: #fff; font-weight: bold; font-size: 14px; display:flex; align-items:center; justify-content: space-between; gap: 10px;">
                            <span>${g.label}</span>
                            <span style="font-size: 12px; color: #4CAF50;">âœ… ${g.count} onay â€¢ ğŸ’° ${totalLabel}</span>
                        </summary>
                        <div style="margin-top: 10px;">
                            <div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">Detaylar:</div>
                            ${g.orders.map((o) => {
                                const email = (o.email || o.userEmail || 'Bilinmiyor').toString();
                                const pkg = (o.packageName || o.label || o.package || o.cheat || 'Paket').toString();
                                const dt = o.__approvedDate ? o.__approvedDate.toLocaleString('tr-TR') : '-';
                                const approvedBy = (o.approvedBy || '').toString();
                                const approvedByLine = approvedBy ? `<div style="font-size: 11px; color: #bbb; margin-top: 4px;">ğŸ‘¤ Onaylayan: ${escapeHtml(approvedBy)}</div>` : '';
                                const amount = formatTryAmountTL(o.__amount);
                                const payable = Number(o.payableAmount);
                                const payableLabel = Number.isFinite(payable) ? (' â€¢ Ã–denecek: ' + Math.floor(payable) + 'â‚º') : '';
                                const keyCode = (o.keyCode || '').toString();
                                const keyLine = keyCode ? `<div style="font-size: 11px; color: #4CAF50; margin-top: 6px;">ğŸ”‘ Key: <span style="font-family: monospace;">${escapeHtml(keyCode)}</span></div>` : '';
                                const canDelete = (typeof isOwner === 'function') && isOwner();
                                const deleteBtn = canDelete ? `<button onclick="event.stopPropagation(); adminDeleteOrderRecord('${String(o.id || '')}')" style="background: rgba(244,67,54,0.18); border: 1px solid rgba(244,67,54,0.6); color: #f44336; padding: 6px 10px; border-radius: 8px; font-size: 11px; cursor: pointer; margin-top: 8px;">ğŸ—‘ï¸ Sil</button>` : '';

                                return `
                                    <div style="background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px; margin-bottom: 8px;">
                                        <div style="display:flex; justify-content: space-between; gap: 10px; align-items: flex-start;">
                                            <div style="flex: 1;">
                                                <div style="font-weight: 700; color: #fff; font-size: 13px;">${escapeHtml(email)}</div>
                                                <div style="font-size: 12px; color: #ddd; margin-top: 4px;">ğŸ“¦ ${escapeHtml(pkg)}</div>
                                                <div style="font-size: 11px; color: #888; margin-top: 4px;">ğŸ“… ${dt}</div>
                                                ${approvedByLine}
                                                ${keyLine}
                                            </div>
                                            <div style="text-align:right; min-width: 110px;">
                                                <div style="font-weight: 800; color: #4CAF50;">${amount}</div>
                                                <div style="font-size: 10px; color: #888; margin-top: 2px;">ID: ${escapeHtml(o.id || '')}</div>
                                                ${payableLabel ? `<div style="font-size: 10px; color: #aaa; margin-top: 2px;">${escapeHtml(payableLabel)}</div>` : ''}
                                                ${deleteBtn}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}

                            <div style="background: rgba(0,0,0,0.18); border: 1px solid rgba(76,175,80,0.25); border-radius: 10px; padding: 10px; margin-top: 10px;">
                                <div style="font-weight: 800; color: #4CAF50;">ğŸ‘¤ Admin PayÄ± (%15): ${adminShareLabel}</div>
                            </div>
                        </div>
                    </details>
                `;
            });

            container.innerHTML = html;
        } catch (e) {
            console.error('AylÄ±k onaylÄ± sipariÅŸ Ã¶zeti hatasÄ±:', e);
            container.innerHTML = '<div style="text-align: center; padding: 15px; color: #f44336;">âŒ Hata: ' + (e?.message || e) + '</div>';
        }
    }

    async function adminDeleteOrderRecord(orderId) {
        try {
            if (!isAdmin()) return;
            if (!isOwner()) {
                showToast('âŒ Sadece OWNER sipariÅŸ silebilir');
                return;
            }
            if (!requirePermission('orders', 'sipariÅŸi silmek')) return;
            const id = (orderId || '').toString().trim();
            if (!id) return;

            const ok = confirm('âš ï¸ Bu iÅŸlem sipariÅŸ kaydÄ±nÄ± (orders) ve aylÄ±k Ã¶zet arÅŸiv kaydÄ±nÄ± (approvedOrdersArchive) siler.\n\nDevam edilsin mi?');
            if (!ok) return;

            showToast('â³ Siliniyor...');
            try {
                const batch = db.batch();
                batch.delete(db.collection('orders').doc(id));
                batch.delete(db.collection('approvedOrdersArchive').doc(id));
                await batch.commit();
            } catch (e) {
                // Batch desteklenmiyorsa veya izin/kurallar yÃ¼zÃ¼nden hata aldÄ±ysa, en azÄ±ndan ayrÄ± ayrÄ± dene.
                try { await db.collection('orders').doc(id).delete(); } catch (e2) {}
                try { await db.collection('approvedOrdersArchive').doc(id).delete(); } catch (e3) {}
            }

            showToast('âœ… SipariÅŸ silindi');

            try { loadMonthlyApprovedOrdersSummary(); } catch (e) {}
        } catch (e) {
            console.error('adminDeleteOrderRecord error:', e);
            showToast('âŒ Hata: ' + (e?.message || e));
        }
    }
    
    let currentOrderId = null;
    let currentOrderData = null;
    
    async function showOrderDetail(orderId) {
        if (!hasPermission('orders')) {
            showToast('âŒ SipariÅŸ gÃ¶rÃ¼ntÃ¼leme yetkiniz yok');
            return;
        }
        currentOrderId = orderId;

        // Worker/D1 varsa Firestore yerine oradan Ã§ek
        try { await loadRemoteRuntimeConfig(); } catch (e) {}
        const ordersApiBase = (typeof getOrdersApiBase === 'function') ? getOrdersApiBase() : '';
        if (ordersApiBase) {
            const res = await workerApiFetch(ordersApiBase, '/v1/admin/orders/' + encodeURIComponent(orderId), { method: 'GET' });
            currentOrderData = (res && res.order) ? res.order : null;
        } else {
            const doc = await db.collection('orders').doc(orderId).get();
            currentOrderData = doc.data();
        }

        if (!currentOrderData) {
            showToast('âŒ SipariÅŸ bulunamadÄ±');
            return;
        }
        
        // Email alanÄ± - farklÄ± isimlerle kaydedilmiÅŸ olabilir
        const userEmail = currentOrderData.email || currentOrderData.userEmail || 'Bilinmiyor';
        currentOrderData.resolvedEmail = userEmail; // Sonra kullanmak iÃ§in sakla
        
        const createdDate = safeToDateMaybe(currentOrderData.createdAtMs || currentOrderData.createdAt) || new Date();
        const date = createdDate.toLocaleString('tr-TR');

        const usedPoints = Number.isFinite(Number(currentOrderData.loyaltyUsedPoints)) ? Number(currentOrderData.loyaltyUsedPoints) : 0;
        const discountAmount = Number.isFinite(Number(currentOrderData.loyaltyDiscountAmount)) ? Number(currentOrderData.loyaltyDiscountAmount) : 0;
        const baseAmount = Number.isFinite(Number(currentOrderData.baseAmount)) ? Number(currentOrderData.baseAmount) : null;
        const payableAmount = Number.isFinite(Number(currentOrderData.payableAmount)) ? Number(currentOrderData.payableAmount) : null;
        const showLoyaltyBox = (usedPoints > 0) || (discountAmount > 0) || (payableAmount !== null) || (baseAmount !== null);
        const discountDisplay = discountAmount > 0 ? discountAmount : usedPoints;
        
        // SÃ¼re uzatma sipariÅŸi mi kontrol et
        const isExtension = currentOrderData.type === 'extension';
        
        let html = `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                <div style="font-size: 12px; color: #aaa;">KullanÄ±cÄ±</div>
                <div style="font-weight: bold; font-size: 16px;">${userEmail}</div>
            </div>
        `;
        
        if (isExtension) {
            // SÃ¼re uzatma sipariÅŸi iÃ§in Ã¶zel gÃ¶rÃ¼nÃ¼m
            const currentExpDate = safeToDateMaybe(currentOrderData.currentExpiry) || null;
            const newExpDate = safeToDateMaybe(currentOrderData.newExpiry) || null;
            const currentExp = currentExpDate ? currentExpDate.toLocaleDateString('tr-TR') : '-';
            const newExp = newExpDate ? newExpDate.toLocaleDateString('tr-TR') : '-';
            
            html += `
                <div style="background: rgba(255,152,0,0.15); border: 1px solid #FF9800; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 24px;">â°</span>
                        <span style="font-size: 16px; font-weight: bold; color: #FF9800;">SÃ¼re Uzatma Talebi</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #aaa; font-size: 12px;">ğŸ® Oyun</span>
                            <span style="color: #fff; font-size: 12px;">${currentOrderData.game || '-'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #aaa; font-size: 12px;">ğŸ›¡ï¸ Hile</span>
                            <span style="color: #FFD700; font-size: 12px;">${currentOrderData.cheat || '-'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #aaa; font-size: 12px;">ğŸ”‘ Mevcut Key</span>
                            <code style="color: #4CAF50; font-size: 12px;">${currentOrderData.keyCode || '-'}</code>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #aaa; font-size: 12px;">ğŸ“… Mevcut BitiÅŸ</span>
                            <span style="color: #f44336; font-size: 12px;">${currentExp}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #aaa; font-size: 12px;">â• Eklenen SÃ¼re</span>
                            <span style="color: #FF9800; font-weight: bold; font-size: 12px;">${currentOrderData.package || '-'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa; font-size: 12px;">ğŸ“… Yeni BitiÅŸ</span>
                            <span style="color: #4CAF50; font-weight: bold; font-size: 12px;">${newExp}</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px;">
                        <div style="font-size: 11px; color: #aaa;">Paket</div>
                        <div style="font-weight: bold;">${currentOrderData.packageName || '-'}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px;">
                        <div style="font-size: 11px; color: #aaa;">Tutar</div>
                        <div style="font-weight: bold; color: #4CAF50;">${currentOrderData.price || '-'}</div>
                    </div>
                </div>
            `;
        } else {
            // Normal sipariÅŸ gÃ¶rÃ¼nÃ¼mÃ¼
            html += `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px;">
                        <div style="font-size: 11px; color: #aaa;">Paket</div>
                        <div style="font-weight: bold;">${currentOrderData.packageName || currentOrderData.label || '-'}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px;">
                        <div style="font-size: 11px; color: #aaa;">Tutar</div>
                        <div style="font-weight: bold; color: #4CAF50;">${currentOrderData.price || '-'}</div>
                    </div>
                </div>
            `;
        }
        
        html += `<div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">ğŸ“… ${date}</div>`;

        if (showLoyaltyBox) {
            html += `
                <div style="background: rgba(76,175,80,0.08); border: 1px solid rgba(76,175,80,0.25); border-radius: 12px; padding: 14px; margin-bottom: 15px;">
                    <div style="font-size: 13px; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">ğŸ Sadakat</div>
                    ${baseAmount !== null ? `
                        <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 12px; margin-bottom: 6px;">
                            <span style="color: #aaa;">Tutar (baz)</span>
                            <span style="color: #fff; font-weight: 600;">${baseAmount}â‚º</span>
                        </div>
                    ` : ''}
                    ${usedPoints > 0 ? `
                        <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 12px; margin-bottom: 6px;">
                            <span style="color: #aaa;">KullanÄ±lan puan</span>
                            <span style="color: #FFD700; font-weight: 600;">${usedPoints}</span>
                        </div>
                    ` : ''}
                    ${discountDisplay > 0 ? `
                        <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 12px; margin-bottom: 6px;">
                            <span style="color: #aaa;">Ä°ndirim</span>
                            <span style="color: #4CAF50; font-weight: 600;">-${discountDisplay}â‚º</span>
                        </div>
                    ` : ''}
                    ${payableAmount !== null ? `
                        <div style="display: flex; justify-content: space-between; gap: 10px; font-size: 12px;">
                            <span style="color: #aaa;">Ã–denecek</span>
                            <span style="color: #4CAF50; font-weight: 700;">${payableAmount}â‚º</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        const dekontSrc = (currentOrderData && (currentOrderData.dekontUrl || currentOrderData.dekont)) || '';
        if (dekontSrc) {
            html += `
                <div style="font-size: 13px; font-weight: bold; margin: 15px 0 10px;">ğŸ“¸ Dekont:</div>
                <img src="${dekontSrc}" style="width: 100%; border-radius: 10px; margin-bottom: 15px;">
            `;
        }
        
        if (isExtension) {
            // SÃ¼re uzatma iÃ§in basit onay/red butonlarÄ±
            html += `
                <div style="background: rgba(76,175,80,0.1); border: 2px solid #4CAF50; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 13px; color: #aaa; margin-bottom: 8px;">âš ï¸ Bu sipariÅŸ onaylandÄ±ÄŸÄ±nda kullanÄ±cÄ±nÄ±n mevcut key'ine otomatik olarak sÃ¼re eklenecektir.</div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary btn-small" onclick="approveExtensionOrder()">âœ… SÃ¼re Uzat</button>
                    <button class="btn btn-small" style="background: rgba(244,67,54,0.3); color: #f44336;" onclick="rejectOrder()">âŒ Reddet</button>
                </div>
            `;
        } else {
            // Normal sipariÅŸ iÃ§in key Ã¼retme
            html += `
                <div style="background: rgba(255,152,0,0.1); border: 2px solid #FF9800; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">ğŸ”‘ Key Ãœretimi</div>
                    <button onclick="window.open('https://newthebestmod.xyz/app/user/cheat/order', '_blank')" style="background: linear-gradient(135deg, #FF9800, #F57C00); border: none; color: #fff; padding: 12px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 10px;">ğŸ”— Paneli AÃ§ (Key Ãœret)</button>
                    <input type="text" id="manualKeyInput" class="auth-input" placeholder="Panelden aldÄ±ÄŸÄ±n key'i yapÄ±ÅŸtÄ±r" style="margin-bottom: 0;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary btn-small" onclick="approveOrderWithKey()">âœ… Onayla</button>
                    <button class="btn btn-small" style="background: rgba(244,67,54,0.3); color: #f44336;" onclick="rejectOrder()">âŒ Reddet</button>
                </div>
            `;
        }
        
        document.getElementById('orderDetailContent').innerHTML = html;
        openModal('orderDetailModal');
    }
    
    async function approveOrder() {
        // Eski fonksiyon - artÄ±k kullanÄ±lmÄ±yor
    }

    function parsePriceToAmount(priceValue) {
        if (priceValue === null || typeof priceValue === 'undefined') return 0;
        if (typeof priceValue === 'number' && Number.isFinite(priceValue)) return Math.max(0, Math.floor(priceValue));
        const str = String(priceValue);
        const digits = str.replace(/[^0-9]/g, '');
        if (!digits) return 0;
        const n = Number(digits);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.floor(n));
    }

    function computeLoyaltyEarnedPoints(orderData) {
        const cfg = getLoyaltyConfigSync();
        const amount = parsePriceToAmount(orderData && orderData.price);

        if (cfg && cfg.earnMode === 'fixed') {
            const fixedPts = Math.floor(clampNumber(cfg.fixedPointsPerOrder, { min: 0, max: 1000000, fallback: 0 }));
            return Math.max(0, fixedPts);
        }

        if (!amount) return 0;
        const percent = clampNumber(cfg && cfg.earnPercent, { min: 0, max: 100, fallback: LOYALTY_EARN_PERCENT });
        const pts = Math.floor(amount * (percent / 100));
        return Math.max(0, pts);
    }
    
    async function approveOrderWithKey() {
        if (!requirePermission('orders', 'sipariÅŸi onaylamak')) return;
        if (!currentOrderId || !currentOrderData) return;
        
        const keyCode = document.getElementById('manualKeyInput').value.trim();
        if (!keyCode) {
            showToast('âŒ Key kodu girin!');
            return;
        }
        
        // Email alanÄ±nÄ± al
        const userEmail = currentOrderData.resolvedEmail || currentOrderData.email || currentOrderData.userEmail;
        if (!userEmail || userEmail === 'Bilinmiyor') {
            showToast('âŒ KullanÄ±cÄ± email bulunamadÄ±!');
            return;
        }
        
        // Paket sÃ¼resini belirle (Worker payload'Ä±nda sayÄ±/string karÄ±ÅŸÄ±k gelebilir)
        let days = 30;
        const pkgRaw = (typeof currentOrderData.package !== 'undefined') ? currentOrderData.package : currentOrderData.days;
        const pkgStr = String(pkgRaw || '').toLowerCase();
        const pkgDigits = pkgStr.replace(/[^0-9]/g, '');
        const pkgNum = Number(pkgDigits);
        if (pkgStr.includes('sinirsiz') || pkgStr.includes('unlimited') || pkgNum >= 365) days = 365;
        else if (pkgNum === 1) days = 1;
        else if (pkgNum === 30) days = 30;
        else if (pkgNum === 60) days = 60;
        else if (pkgNum === 90) days = 90;
        
        try {
            // KullanÄ±cÄ±yÄ± bul
            const users = await db.collection('users').where('email', '==', userEmail).get();
            if (users.empty) {
                showToast('âŒ KullanÄ±cÄ± bulunamadÄ±: ' + userEmail);
                return;
            }
            
            const userDoc = users.docs[0];
            const userRef = db.collection('users').doc(userDoc.id);

            // Worker/D1 ile gelen sipariÅŸlerde Firestore orders dokÃ¼manÄ± olmayabilir.
            try { await loadRemoteRuntimeConfig(); } catch (e) {}
            let ordersApiBase = '';
            try { ordersApiBase = (typeof getOrdersApiBase === 'function') ? getOrdersApiBase() : ''; } catch (e) {}
            const isWorkerOrder = !!ordersApiBase;
            const orderRef = isWorkerOrder ? null : db.collection('orders').doc(currentOrderId);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);
            
            // Oyun ve hile bilgisini al (dinamik sipariÅŸler iÃ§in)
            const gameName = currentOrderData.game || 'Mobile Legends';
            const cheatName = currentOrderData.cheat || 'TheBestML IMGUI';

            let earnedPoints = 0;
            if (isWorkerOrder) {
                // Ã–nce D1 tarafÄ±nda onayla
                await workerApiFetch(ordersApiBase, '/v1/admin/orders/' + encodeURIComponent(currentOrderId) + '/approve', {
                    method: 'POST',
                    body: { keyCode: keyCode }
                });

                // Sonra uygulama uyumluluÄŸu iÃ§in Firestore user.keys gÃ¼ncelle
                await db.runTransaction(async (tx) => {
                    const userSnap = await tx.get(userRef);
                    if (!userSnap.exists) throw new Error('KullanÄ±cÄ± bulunamadÄ±');

                    const orderData = currentOrderData || {};
                    earnedPoints = computeLoyaltyEarnedPoints(orderData);

                    const userData = userSnap.data() || {};
                    const keys = userData.keys || [];
                    const alreadyHasOrderKey = keys.some(k => k && k.orderId === currentOrderId);
                    if (!alreadyHasOrderKey) {
                        keys.push({
                            keyCode: keyCode,
                            code: keyCode,
                            orderId: currentOrderId,
                            activatedAt: new Date(),
                            expiresAt: expiresAt,
                            days: days,
                            game: gameName,
                            cheat: cheatName,
                            activatedBy: currentUser.email
                        });
                    }

                    const userUpdate = { keys };
                    if (earnedPoints > 0) {
                        userUpdate.loyaltyPoints = firebase.firestore.FieldValue.increment(earnedPoints);
                        userUpdate.loyaltyUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    }

                    tx.update(userRef, userUpdate);
                });
            } else {
                await db.runTransaction(async (tx) => {
                    const [orderSnap, userSnap] = await Promise.all([tx.get(orderRef), tx.get(userRef)]);
                    if (!orderSnap.exists) throw new Error('SipariÅŸ bulunamadÄ±');
                    if (!userSnap.exists) throw new Error('KullanÄ±cÄ± bulunamadÄ±');

                    const orderData = orderSnap.data() || {};
                    const alreadyGranted = !!orderData.loyaltyGrantedAt || typeof orderData.loyaltyPointsGranted === 'number';
                    earnedPoints = computeLoyaltyEarnedPoints(orderData);

                    const userData = userSnap.data() || {};
                    const keys = userData.keys || [];
                    const alreadyHasOrderKey = keys.some(k => k && k.orderId === currentOrderId);
                    if (!alreadyHasOrderKey) {
                        keys.push({
                            keyCode: keyCode,
                            code: keyCode,
                            orderId: currentOrderId,
                            activatedAt: new Date(),
                            expiresAt: expiresAt,
                            days: days,
                            game: gameName,
                            cheat: cheatName,
                            activatedBy: currentUser.email
                        });
                    }

                    const userUpdate = { keys };
                    if (!alreadyGranted && earnedPoints > 0) {
                        userUpdate.loyaltyPoints = firebase.firestore.FieldValue.increment(earnedPoints);
                        userUpdate.loyaltyUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    }
                    tx.update(userRef, userUpdate);

                    const orderUpdate = {
                        status: 'approved',
                        keyCode: keyCode,
                        game: gameName,
                        cheat: cheatName,
                        approvedAt: new Date(),
                        approvedBy: (typeof normalizeEmail === 'function') ? normalizeEmail(currentUser.email) : currentUser.email
                    };
                    if (!alreadyGranted) {
                        orderUpdate.loyaltyPointsGranted = earnedPoints;
                        orderUpdate.loyaltyGrantedAt = firebase.firestore.FieldValue.serverTimestamp();
                    }
                    tx.update(orderRef, orderUpdate);
                });
            }

            // ArÅŸive yaz: sipariÅŸ silinse bile ay Ã¶zetinde kalsÄ±n
            try {
                await archiveApprovedOrderSnapshot(currentOrderId, {
                    ...currentOrderData,
                    status: 'approved',
                    keyCode: keyCode,
                    game: gameName,
                    cheat: cheatName,
                    approvedAt: new Date(),
                    approvedBy: (typeof normalizeEmail === 'function') ? normalizeEmail(currentUser.email) : currentUser.email
                });
            } catch (e) {}
            
            // KullanÄ±cÄ±ya bildirim gÃ¶nder
            const packageNames = {
                '1gun': '1 GÃ¼nlÃ¼k',
                '30gun': '30 GÃ¼nlÃ¼k',
                '60gun': '60 GÃ¼nlÃ¼k',
                '90gun': '90 GÃ¼nlÃ¼k',
                'sinirsiz': 'SÄ±nÄ±rsÄ±z'
            };
            const pkgName = packageNames[currentOrderData.package] || currentOrderData.packageName || currentOrderData.label || `${days} GÃ¼nlÃ¼k`;
            await sendOrderApprovalNotification(
                userEmail, 
                keyCode, 
                pkgName
            );
            
            // BaÅŸarÄ±lÄ± popup
            closeModal('orderDetailModal');
            showKeyCodePopup(keyCode, userEmail, days);
            loadPendingOrders();
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // SÃ¼re uzatma sipariÅŸini onayla
    async function approveExtensionOrder() {
        if (!currentOrderId || !currentOrderData) return;
        
        const userEmail = currentOrderData.resolvedEmail || currentOrderData.email || currentOrderData.userEmail;
        if (!userEmail || userEmail === 'Bilinmiyor') {
            showToast('âŒ KullanÄ±cÄ± email bulunamadÄ±!');
            return;
        }
        
        const keyCode = currentOrderData.keyCode;
        if (!keyCode) {
            showToast('âŒ Key kodu bulunamadÄ±!');
            return;
        }
        
        try {
            // KullanÄ±cÄ±yÄ± bul
            const users = await db.collection('users').where('email', '==', userEmail).get();
            if (users.empty) {
                showToast('âŒ KullanÄ±cÄ± bulunamadÄ±: ' + userEmail);
                return;
            }
            
            const userDoc = users.docs[0];
            const userRef = db.collection('users').doc(userDoc.id);
            const orderRef = db.collection('orders').doc(currentOrderId);

            const userData = userDoc.data();
            const keys = userData.keys || [];
            
            // Mevcut key'i bul
            const keyIndex = keys.findIndex(k => k.keyCode === keyCode || k.code === keyCode);
            if (keyIndex === -1) {
                showToast('âŒ Key bulunamadÄ±: ' + keyCode);
                return;
            }
            
            // Yeni bitiÅŸ tarihini hesapla (sipariÅŸteki newExpiry)
            const newExpiry = currentOrderData.newExpiry?.toDate ? 
                currentOrderData.newExpiry.toDate() : 
                new Date(currentOrderData.newExpiry);
            
            // Key'in sÃ¼resini gÃ¼ncelle
            keys[keyIndex].expiresAt = newExpiry;
            keys[keyIndex].extendedAt = new Date();
            keys[keyIndex].extendedBy = currentUser.email;

            let earnedPoints = 0;
            await db.runTransaction(async (tx) => {
                const [orderSnap, userSnap] = await Promise.all([tx.get(orderRef), tx.get(userRef)]);
                if (!orderSnap.exists) throw new Error('SipariÅŸ bulunamadÄ±');
                if (!userSnap.exists) throw new Error('KullanÄ±cÄ± bulunamadÄ±');

                const orderData = orderSnap.data() || {};
                const alreadyGranted = !!orderData.loyaltyGrantedAt || typeof orderData.loyaltyPointsGranted === 'number';
                earnedPoints = computeLoyaltyEarnedPoints(orderData);

                const userUpdate = { keys: keys };
                if (!alreadyGranted && earnedPoints > 0) {
                    userUpdate.loyaltyPoints = firebase.firestore.FieldValue.increment(earnedPoints);
                    userUpdate.loyaltyUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
                }
                tx.update(userRef, userUpdate);

                const orderUpdate = {
                    status: 'approved',
                    approvedAt: new Date(),
                    approvedBy: normalizeEmail(currentUser.email)
                };
                if (!alreadyGranted) {
                    orderUpdate.loyaltyPointsGranted = earnedPoints;
                    orderUpdate.loyaltyGrantedAt = firebase.firestore.FieldValue.serverTimestamp();
                }
                tx.update(orderRef, orderUpdate);
            });

            // ArÅŸive yaz: sipariÅŸ silinse bile ay Ã¶zetinde kalsÄ±n
            try {
                await archiveApprovedOrderSnapshot(currentOrderId, {
                    ...currentOrderData,
                    status: 'approved',
                    approvedAt: new Date(),
                    approvedBy: (typeof normalizeEmail === 'function') ? normalizeEmail(currentUser.email) : currentUser.email
                });
            } catch (e) {}

            try { await incrementAdminStatField('approvedOrdersCount', 1); } catch (e) {}
            
            // KullanÄ±cÄ±ya bildirim gÃ¶nder (Firestore)
            const normalizedEmail = userEmail.toLowerCase().trim();
            await db.collection('notifications').add({
                targetType: normalizedEmail,
                targetEmail: normalizedEmail,
                userId: userEmail,
                email: userEmail,
                title: 'â° SÃ¼re Uzatma OnaylandÄ±!',
                message: `${currentOrderData.game} - ${currentOrderData.cheat} iÃ§in ${currentOrderData.package} sÃ¼re eklendi. Yeni bitiÅŸ: ${newExpiry.toLocaleDateString('tr-TR')}`,
                type: 'order',
                keyCode: keyCode,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                notifiedAt: new Date().toISOString()
            });
            
            // Native push notification gÃ¶nder (kullanÄ±cÄ±nÄ±n FCM token'Ä± varsa)
            try {
                const userDocs = await db.collection('users').where('email', '==', userEmail).get();
                if (!userDocs.empty) {
                    const userData = userDocs.docs[0].data();
                    if (userData.fcmToken) {
                        // GerÃ§ek push notification gÃ¶nder (Vercel sunucu Ã¼zerinden)
                        await sendPushNotification(
                            userData.fcmToken,
                            'â° SÃ¼re Uzatma OnaylandÄ±!',
                            `${currentOrderData.game} - ${currentOrderData.cheat} iÃ§in sÃ¼re eklendi. Yeni bitiÅŸ: ${newExpiry.toLocaleDateString('tr-TR')}`,
                            { type: 'extension_approved', orderId: currentOrderId }
                        );
                    }
                }
            } catch(pushErr) {
                console.log('Push bildirim gÃ¶nderilemedi:', pushErr);
            }
            
            closeModal('orderDetailModal');
            showToast('âœ… SÃ¼re uzatma onaylandÄ±!');
            
            // BaÅŸarÄ±lÄ± popup gÃ¶ster
            document.getElementById('orderSuccessContent').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; margin-bottom: 20px;">â°</div>
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">SÃ¼re UzatÄ±ldÄ±!</div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin: 15px 0;">
                        <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">KullanÄ±cÄ±</div>
                        <div style="font-weight: bold;">${userEmail}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; margin: 15px 0;">
                        <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">Key</div>
                        <code style="font-size: 14px; color: #4CAF50;">${keyCode}</code>
                    </div>
                    <div style="background: rgba(76,175,80,0.2); border-radius: 10px; padding: 15px; margin: 15px 0;">
                        <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">Yeni BitiÅŸ Tarihi</div>
                        <div style="font-weight: bold; font-size: 18px; color: #4CAF50;">${newExpiry.toLocaleDateString('tr-TR')}</div>
                    </div>
                    <button class="success-btn" onclick="closeOrderSuccessModal()" style="margin-top: 15px;">Tamam</button>
                </div>
            `;
            showOrderSuccessModal();
            loadPendingOrders();
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
            console.error(e);
        }
    }
    
    // Rastgele key kodu Ã¼ret
    function generateKeyCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            if (i < 3) code += '-';
        }
        return code;
    }
    
    // Key kodu popup gÃ¶ster
    function showKeyCodePopup(code, email, days) {
        const html = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 30px; max-width: 400px; text-align: center; border: 2px solid #4CAF50;" onclick="event.stopPropagation()">
                    <div style="font-size: 50px; margin-bottom: 15px;">âœ…</div>
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Key Ãœretildi!</div>
                    <div style="color: #aaa; font-size: 13px; margin-bottom: 20px;">${email}</div>
                    
                    <div style="background: rgba(76,175,80,0.2); border: 2px solid #4CAF50; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">Key Kodu (${days} GÃ¼n)</div>
                        <div id="generatedKeyCode" style="font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px; color: #4CAF50;">${code}</div>
                    </div>
                    
                    <button onclick="copyKeyCode('${code}')" style="background: linear-gradient(135deg, #4CAF50, #45a049); border: none; color: #fff; padding: 15px 30px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 10px;">ğŸ“‹ Kodu Kopyala</button>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.1); border: none; color: #aaa; padding: 12px; border-radius: 10px; cursor: pointer; width: 100%;">Kapat</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }
    
    function copyKeyCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('ğŸ“‹ Key kodu kopyalandÄ±!');
        }).catch(() => {
            // Fallback
            const input = document.createElement('input');
            input.value = code;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast('ğŸ“‹ Key kodu kopyalandÄ±!');
        });
    }
    
    async function rejectOrder() {
        if (!requirePermission('orders', 'sipariÅŸi reddetmek')) return;
        if (!currentOrderId) return;
        
        if (!confirm('Bu sipariÅŸi reddetmek istediÄŸinize emin misiniz?')) return;
        
        try {
            // Worker/D1 varsa Ã¶nce oradan reddet (Firestore orders dokÃ¼manÄ± olmayabilir)
            try { await loadRemoteRuntimeConfig(); } catch (e) {}
            const ordersApiBase = (typeof getOrdersApiBase === 'function') ? getOrdersApiBase() : '';
            if (ordersApiBase) {
                await workerApiFetch(ordersApiBase, '/v1/admin/orders/' + encodeURIComponent(currentOrderId) + '/reject', {
                    method: 'POST',
                    body: { rejectReason: 'Reddedildi' }
                });

                // KullanÄ±cÄ±ya red bildirimi (best-effort)
                try {
                    const email = (currentOrderData && (currentOrderData.email || currentOrderData.userEmail || currentOrderData.resolvedEmail)) || null;
                    if (email) {
                        await sendOrderRejectionNotification(
                            email,
                            currentOrderData.packageName || currentOrderData.cheat || 'Paket'
                        );
                    }
                } catch (e) {}

                showToast('âŒ SipariÅŸ reddedildi');
                closeModal('orderDetailModal');
                loadPendingOrders();
                return;
            }

            const orderRef = db.collection('orders').doc(currentOrderId);
            let orderData = null;

            await db.runTransaction(async (tx) => {
                const orderSnap = await tx.get(orderRef);
                if (!orderSnap.exists) throw new Error('SipariÅŸ bulunamadÄ±');
                orderData = orderSnap.data() || {};

                const usedPoints = normalizeNonNegativeInt(orderData.loyaltyUsedPoints, 0);
                const alreadyRefunded = !!orderData.loyaltyRefundedAt || typeof orderData.loyaltyRefundedPoints === 'number';

                if (usedPoints > 0 && !alreadyRefunded) {
                    const userId = orderData.userId;
                    if (userId) {
                        const userRef = db.collection('users').doc(userId);
                        tx.update(userRef, {
                            loyaltyPoints: firebase.firestore.FieldValue.increment(usedPoints),
                            loyaltyUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        tx.update(orderRef, {
                            loyaltyRefundedPoints: usedPoints,
                            loyaltyRefundedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                }

                tx.update(orderRef, {
                    status: 'rejected',
                    rejectedAt: new Date(),
                    rejectedBy: currentUser.email
                });
            });
            
            // KullanÄ±cÄ±ya red bildirimi gÃ¶nder
            if (orderData && orderData.email) {
                await sendOrderRejectionNotification(
                    orderData.email, 
                    orderData.packageName || orderData.cheat || 'Paket'
                );
            }
            
            showToast('âŒ SipariÅŸ reddedildi');
            closeModal('orderDetailModal');
            loadPendingOrders();
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // SipariÅŸ reddedildiÄŸinde bildirim gÃ¶nder
    async function sendOrderRejectionNotification(userEmail, packageName) {
        try {
            console.log('ğŸ“© SipariÅŸ red bildirimi gÃ¶nderiliyor:', userEmail);
            
            const normalizedEmail = userEmail.toLowerCase().trim();
            
            // Firestore bildirimi kaydet
            await db.collection('notifications').add({
                targetType: normalizedEmail,
                targetEmail: normalizedEmail,
                title: 'âŒ SipariÅŸiniz Reddedildi',
                message: `${packageName} paketi sipariÅŸiniz reddedildi. Detaylar iÃ§in iletiÅŸime geÃ§in.`,
                type: 'order_rejected',
                packageName: packageName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: currentUser?.email || 'system',
                read: false
            });
            
            // Push notification gÃ¶nder
            try {
                const userDocs = await db.collection('users').where('email', '==', normalizedEmail).get();
                if (!userDocs.empty) {
                    const userData = userDocs.docs[0].data();
                    if (userData.fcmToken) {
                        await sendPushNotification(
                            userData.fcmToken,
                            'âŒ SipariÅŸiniz Reddedildi',
                            `${packageName} paketi sipariÅŸiniz reddedildi.`,
                            { type: 'order_rejected' }
                        );
                        console.log('ğŸ“± Red bildirimi gÃ¶nderildi!');
                    }
                }
            } catch(pushErr) {
                console.log('Push bildirim gÃ¶nderilemedi:', pushErr);
            }
            
        } catch(e) {
            console.error('Red bildirimi hatasÄ±:', e);
        }
    }
    
    // Yeni sipariÅŸ olduÄŸunda tÃ¼m admin'lere bildirim gÃ¶nder
    async function sendNewOrderNotificationToAdmins(userEmail, packageName, price) {
        try {
            console.log('ğŸ“© Admin\'lere yeni sipariÅŸ bildirimi gÃ¶nderiliyor...');

            // Push: topic tabanlÄ± (admin_users)
            await sendPushToAdmins(
                'ğŸ›’ Yeni SipariÅŸ!',
                `${userEmail} - ${packageName} (${price}â‚º)`,
                { type: 'order_new', page: 'admin' }
            );
            
            // Firestore'a da admin bildirimi kaydet
            await db.collection('notifications').add({
                targetType: 'admins',
                title: 'ğŸ›’ Yeni SipariÅŸ Geldi!',
                message: `${userEmail} kullanÄ±cÄ±sÄ± ${packageName} paketi sipariÅŸ etti. Fiyat: ${price}â‚º`,
                type: 'order_new',
                userEmail: userEmail,
                packageName: packageName,
                price: price,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            
        } catch(e) {
            console.error('Admin bildirim hatasÄ±:', e);
        }
    }

    async function sendNewSupportMessageNotificationToAdmins(userEmail, lastMessagePreview) {
        try {
            // Backward compatible arg parsing:
            // - old: (userEmail, preview)
            // - new: (chatId, userEmail, preview)
            let chatId = null;
            let safeEmail = '';
            let safePreview = '';

            const a0 = (arguments[0] || '').toString();
            const a1 = (arguments[1] || '').toString();
            const a2 = (arguments[2] || '').toString();

            const looksLikeEmail = a0.includes('@');
            if (looksLikeEmail) {
                // old
                safeEmail = a0;
                safePreview = a1;
            } else {
                // new
                chatId = a0;
                safeEmail = a1;
                safePreview = a2;
            }

            const bodyText = `${safeEmail}: ${safePreview}`;

            // If chat is claimed, do NOT broadcast to all admins.
            let claimedByEmail = '';
            if (chatId) {
                try {
                    const chatDoc = await db.collection('chats').doc(chatId).get();
                    if (chatDoc.exists) {
                        const chat = chatDoc.data() || {};
                        claimedByEmail = normalizeEmail(chat.claimedByEmail || '');
                    }
                } catch(e) {}
            }

            if (!claimedByEmail) {
                // Unclaimed: notify all admins (topic + Firestore admins)
                await sendPushToAdmins(
                    'ğŸ’¬ Yeni Destek MesajÄ±',
                    bodyText,
                    { type: 'support_new', page: 'admin' }
                );

                await db.collection('notifications').add({
                    targetType: 'admins',
                    title: 'ğŸ’¬ Yeni Destek MesajÄ±',
                    message: bodyText,
                    type: 'support_new',
                    userEmail: safeEmail,
                    chatId: chatId || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                });
                return;
            }

            // Claimed: notify only claimant + owner (best-effort per-user push + per-user Firestore notifications)
            const ownerEmail = normalizeEmail(OWNER_EMAIL);
            const targets = Array.from(new Set([ownerEmail, claimedByEmail].filter(Boolean)));

            for (const targetEmail of targets) {
                try {
                    await db.collection('notifications').add({
                        targetType: targetEmail,
                        targetEmail: targetEmail,
                        title: 'ğŸ’¬ Yeni Destek MesajÄ±',
                        message: bodyText,
                        type: 'support_new',
                        userEmail: safeEmail,
                        chatId: chatId || null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        read: false
                    });
                } catch(e) {}

                try {
                    const userDocs = await db.collection('users').where('email', '==', targetEmail).get();
                    if (!userDocs.empty) {
                        const userData = userDocs.docs[0].data() || {};
                        if (userData.fcmToken) {
                            await sendPushNotification(
                                userData.fcmToken,
                                'ğŸ’¬ Yeni Destek MesajÄ±',
                                bodyText,
                                { type: 'support_new', page: 'admin', chatId: chatId || null }
                            );
                        }
                    }
                } catch(e) {}
            }
        } catch (e) {
            console.error('Destek admin bildirimi hatasÄ±:', e);
        }
    }

    // Admin destek yanÄ±tÄ±: kullanÄ±cÄ±ya tek seferlik tÃ¼m bildirimler (Firestore + FCM)
    async function sendSupportReplyNotificationToUser(userId, userEmail, lastMessagePreview, adminInfo = null) {
        try {
            let normalizedEmail = (userEmail || '').toLowerCase().trim();
            let token = '';
            let skipInAppNotification = false;
            let supportOpenHint = false;

            // Ã–nce userId (chatId = uid) Ã¼zerinden kullanÄ±cÄ± kaydÄ±nÄ± Ã§Ã¶z
            try {
                if (userId) {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        const ud = userDoc.data() || {};
                        if (!normalizedEmail && ud.email) normalizedEmail = (ud.email || '').toLowerCase().trim();
                        token = (ud.fcmToken || '').toString();
                    }
                }
            } catch (e) {}

            // userId yok + email yoksa hedef bulunamaz
            if (!userId && !normalizedEmail) return;

            // KullanÄ±cÄ± destek ekranÄ±ndaysa bildirimleri durdur
            try {
                if (userId) {
                    const chatSnap = await db.collection('chats').doc(userId).get();
                    if (chatSnap.exists) {
                        const cd = chatSnap.data() || {};
                        const isOpen = !!cd.userSupportOpen;
                        const lastActiveMs = getFirestoreTimeMs(cd.userSupportLastActiveAt || cd.userSupportOpenAt);
                        if (isOpen && lastActiveMs > 0 && (Date.now() - lastActiveMs) < 45000) {
                            // Not: Bu alan bazen "takÄ±lÄ±" kalabiliyor; FCM'i tamamen engellemiyoruz.
                            console.log('ğŸ”• KullanÄ±cÄ± destek ekranÄ±nda gÃ¶rÃ¼nÃ¼yor: uygulama iÃ§i bildirim atlanacak, FCM devam edecek');
                            skipInAppNotification = true;
                            supportOpenHint = true;
                        }
                    }
                }
            } catch (e) {}

            const role = adminInfo?.role || 'Destek';
            const name = adminInfo?.name || 'Destek Ekibi';

            const title = 'ğŸ’¬ Destekten YanÄ±t Var';
            const preview = (lastMessagePreview || '').toString().trim() || 'Yeni mesaj';
            const message = `${role}: ${preview}`;

            // 1) Uygulama iÃ§i + native local bildirim zinciri (client listener tetikler)
            try {
                if (!skipInAppNotification && normalizedEmail) {
                    await db.collection('notifications').add({
                        targetType: normalizedEmail,
                        targetEmail: normalizedEmail,
                        title: title,
                        message: message,
                        type: 'info',
                        category: 'support_reply',
                        chatId: userId || null,
                        fromRole: role,
                        fromName: name,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        createdBy: currentUser?.email || 'admin',
                        read: false,
                        notifiedAt: new Date().toISOString()
                    });
                }
            } catch (e) {
                // Firestore bildirimi olmasa da FCM gÃ¶nderimi denenir
            }

            // 2) FCM push (uygulama kapalÄ±yken de gitsin)
            if (!token) {
                try {
                    if (normalizedEmail) {
                        const userDocs = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
                        if (!userDocs.empty) {
                            const ud = userDocs.docs[0].data() || {};
                            token = (ud.fcmToken || '').toString();
                        }
                    }
                } catch (e) {}
            }

            let pushAttempt = null;
            if (token && token.length > 20) {
                try {
                    pushAttempt = await sendPushNotificationWithResult(token, title, message, {
                        type: 'support_reply',
                        page: 'support',
                        chatId: userId || ''
                    });
                } catch (e) {
                    pushAttempt = { success: false, error: e?.message || String(e) };
                }
            } else {
                pushAttempt = { success: false, error: 'missing_or_short_token', tokenLength: (token || '').length };
            }

            // Debug log (best-effort): chat push denemesini kayÄ±t altÄ±na al
            try {
                if (userId && db) {
                    const tokenPrefix = token ? token.substring(0, 12) : '';
                    await db.collection('chats').doc(userId).collection('pushLogs').add({
                        kind: 'support_reply',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        targetUserId: userId,
                        targetEmail: normalizedEmail || null,
                        tokenPrefix: tokenPrefix || null,
                        tokenLength: token ? token.length : 0,
                        supportOpenHint: !!supportOpenHint,
                        pushServerUrl: PUSH_SERVER?.url || null,
                        pushHttpStatus: pushAttempt?.httpStatus || null,
                        pushSuccess: !!pushAttempt?.success,
                        pushError: pushAttempt?.error || null,
                        pushResult: pushAttempt?.result || null
                    });
                }
            } catch (e) {}
        } catch (e) {
            console.error('KullanÄ±cÄ± destek yanÄ±t bildirimi hatasÄ±:', e);
        }
    }
    
    // Key Kodu OluÅŸtur (Admin)
    async function createKeyCode() {
        if (!requirePermission('keys_add', 'key kodu oluÅŸturmak')) return;
        
        const code = document.getElementById('adminKeyCode').value.trim().toUpperCase();
        const days = parseInt(document.getElementById('adminKeyDays').value);
        
        if (!code) { showToast('âŒ Key kodu girin'); return; }
        
        try {
            await db.collection('keyCodes').doc(code).set({
                days: days,
                used: false,
                createdAt: new Date(),
                createdBy: currentUser.email
            });
            showToast('âœ… Key kodu eklendi: ' + code);
            document.getElementById('adminKeyCode').value = '';
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Key Kodu Kullan (KullanÄ±cÄ±)
    async function redeemKey() {
        if (!currentUser) { showToast('âŒ Ã–nce giriÅŸ yapÄ±n'); return; }
        
        const code = document.getElementById('redeemKeyInput').value.trim().toUpperCase();
        if (!code) { showToast('âŒ Key kodu girin'); return; }
        
        try {
            showToast('â³ Kontrol ediliyor...');
            const keyDoc = await db.collection('keyCodes').doc(code).get();
            
            if (!keyDoc.exists) {
                showToast('âŒ GeÃ§ersiz key kodu');
                return;
            }
            
            const keyData = keyDoc.data();
            if (keyData.used) {
                showToast('âŒ Bu key zaten kullanÄ±lmÄ±ÅŸ');
                return;
            }
            
            // Key'i kullanÄ±ldÄ± olarak iÅŸaretle
            await db.collection('keyCodes').doc(code).update({
                used: true,
                usedBy: currentUser.email,
                usedAt: new Date()
            });
            
            // KullanÄ±cÄ±ya key ekle
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + keyData.days);
            
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            const userData = userDoc.data();
            const keys = userData.keys || [];
            keys.push({
                code: code,
                activatedAt: new Date(),
                expiresAt: expiresAt,
                days: keyData.days
            });
            
            await db.collection('users').doc(currentUser.uid).update({ keys });
            
            showToast('âœ… Key aktifleÅŸtirildi! ' + keyData.days + ' gÃ¼n');
            closeModal('redeemKeyModal');
            document.getElementById('redeemKeyInput').value = '';
            loadUserData();
        } catch(e) {
            showToast('âŒ Hata: ' + e.message);
        }
    }
    
    // Sayfa yÃ¼klendiÄŸinde
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('[APP] DOMContentLoaded baÅŸladÄ±');
        
        // Profil butonunu saÄŸa sabitle (CSS override gÃ¼venliÄŸi)
        const profileBtn = document.getElementById('profileToggleBtn');
        if (profileBtn) {
            profileBtn.style.cssText = 'position: fixed !important; top: calc(15px + env(safe-area-inset-top, 0px)) !important; right: 15px !important; left: auto !important; z-index: 999;';
        }
        
        // Bildirim kanallarÄ±nÄ± HEMEN oluÅŸtur (Android iÃ§in Ã¶nemli)
        try {
            await createNotificationChannel();
            await requestNotificationPermission();
            console.log('[APP] Bildirim kanallarÄ± hazÄ±r');
        } catch(e) {
            console.log('[APP] Bildirim kanal hatasÄ±:', e);
        }
        
        try {
            try {
                const savedConfig = localStorage.getItem('cheatstore_config');
                if (savedConfig) {
                    appConfig = { ...appConfig, ...JSON.parse(savedConfig) };
                }
            } catch (e) {}
            
            localStorage.setItem('cheatstore_app_version', APP_VERSION);
            var verEl = document.getElementById('currentVersion');
            if (verEl) verEl.textContent = APP_VERSION;
            
            // Buton sÃ¼rÃ¼mÃ¼nÃ¼ de gÃ¼ncelle
            const versionBtn = document.getElementById('currentVersionBtn');
            if (versionBtn) versionBtn.textContent = APP_VERSION;
            
            // Firebase kontrolÃ¼
            if (typeof firebase === 'undefined') {
                console.error('[APP] Firebase SDK yÃ¼klenemedi!');
                showToast('âŒ Firebase baÄŸlantÄ± hatasÄ±');
                return;
            }
            
            if (!firebaseReady) {
                console.error('[APP] Firebase baÅŸlatÄ±lamadÄ±!');
                showToast('âŒ Firebase baÅŸlatÄ±lamadÄ±');
                return;
            }
            
            console.log('[APP] Firebase OK');
            
            // Admin listesini yÃ¼kle
            try {
                await loadAdminList();
                console.log('[APP] Admin listesi OK');
            } catch(e) {
                console.error('[APP] Admin hatasÄ±:', e.message);
            }
            
            // GitHub token'Ä± yÃ¼kle
            try {
                await loadGithubToken();
                console.log('[APP] GitHub token OK');
            } catch(e) {
                console.error('[APP] GitHub token hatasÄ±:', e.message);
            }
            
            // Ã–deme ayarlarÄ±nÄ± yÃ¼kle
            try {
                await loadPaymentSettings();
                console.log('[APP] Ã–deme ayarlarÄ± OK');
            } catch(e) {
                console.error('[APP] Ã–deme hatasÄ±:', e.message);
            }
            
            // OyunlarÄ± yÃ¼kle (ana sayfa iÃ§in)
            try {
                await loadGamesAndCheats();
                console.log('[APP] Oyunlar OK');
            } catch(e) {
                console.error('[APP] Oyunlar hatasÄ±:', e.message);
            }
            
            // Kurulum modallarÄ±nÄ± yÃ¼kle
            try {
                await loadSetupModals();
                console.log('[APP] Kurulum modallarÄ± OK');
            } catch(e) {
                console.error('[APP] Kurulum modallarÄ± hatasÄ±:', e.message);
            }
            
            // Uygulama ayarlarÄ±nÄ± yÃ¼kle
            try {
                await loadAppSettings();
                console.log('[APP] Uygulama ayarlarÄ± OK');
            } catch(e) {
                console.error('[APP] Uygulama ayarlarÄ± hatasÄ±:', e.message);
            }
            
            // HatÄ±rlanan giriÅŸ bilgilerini doldur
            loadRememberedCredentials();
            
            // Dekont Ã¶nizleme
            setTimeout(() => {
                const fileInput = document.getElementById('dekontFile');
                if (fileInput) {
                    fileInput.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                document.getElementById('dekontImg').src = e.target.result;
                                document.getElementById('dekontPreview').style.display = 'block';
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
            }, 1000);
            
            // HoÅŸgeldin mesajÄ± - HER ZAMAN APP_VERSION kullan
            setTimeout(() => {
                showToast('âœ… Game Store v' + APP_VERSION);
            }, 1500);
            
            // Otomatik gÃ¼ncelleme kontrolÃ¼ baÅŸlat (30 saniyede bir)
            startAutoUpdateCheck();
            
            console.log('[APP] BaÅŸlatma tamamlandÄ±');
            
        } catch (initError) {
            console.error('[APP] Init hatasÄ±:', initError);
            alert('BaÅŸlatma hatasÄ±: ' + initError.message);
        }
    });
    
    // Otomatik gÃ¼ncelleme kontrolÃ¼
    let autoUpdateInterval = null;
    let uiRefreshInterval = null;
    let notificationCheckInterval = null;
    let lastCheckedVersion = APP_VERSION;
    
    function startAutoUpdateCheck() {
        // Ä°lk sessiz kontrol 5 saniye sonra
        setTimeout(checkUpdateSilently, 5000);
        
        // GÃ¼ncelleme popup kontrolÃ¼ 15 saniye sonra
        setTimeout(checkForUpdates, 15000);
        
        // Sonra her 2 dakikada bir kontrol
        autoUpdateInterval = setInterval(checkForUpdates, 120000);
        
        // UI REFRESH - HER 1 SANÄ°YEDE BÄ°R
        startUIRefresh();
        
        // BÄ°LDÄ°RÄ°M KONTROLÃœ - HER 3 SANÄ°YEDE BÄ°R
        startNotificationPolling();
        
        // Sayfa gÃ¶rÃ¼nÃ¼r olduÄŸunda kontrol et
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkUpdateSilently();
                refreshUIBadges();
                checkNewNotificationsNow();
            }
        });
    }
    
    // SÃ¼rekli UI Refresh (Her 1 saniye)
    function startUIRefresh() {
        if (uiRefreshInterval) clearInterval(uiRefreshInterval);
        
        uiRefreshInterval = setInterval(() => {
            refreshUIBadges();
        }, 1000); // Her 1 saniye
        
        console.log('ğŸ”„ UI refresh baÅŸlatÄ±ldÄ± (1 saniye)');
    }
    
    // UI Badge'leri yenile
    function refreshUIBadges() {
        try {
            updateNotificationBadge();
            updateProfileNotifBadge();
            updateSidebarBadges();
        } catch(e) {
            // Sessizce devam et
        }
    }
    
    // Bildirim Polling (Her 3 saniye)
    function startNotificationPolling() {
        if (notificationCheckInterval) clearInterval(notificationCheckInterval);
        
        notificationCheckInterval = setInterval(() => {
            if (currentUser) {
                checkNewNotificationsNow();
            }
        }, 3000); // Her 3 saniye
        
        console.log('ğŸ”” Bildirim polling baÅŸlatÄ±ldÄ± (3 saniye)');
    }
    
    // AnlÄ±k bildirim kontrolÃ¼ (polling)
    async function checkNewNotificationsNow() {
        if (!currentUser) return;
        
        try {
            const userEmail = currentUser.email.toLowerCase().trim();
            const notifiedIds = JSON.parse(localStorage.getItem('notifiedNotifications') || '[]');
            const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
            
            // Son 5 dakikadaki bildirimleri kontrol et
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            
            // KullanÄ±cÄ±ya Ã¶zel bildirimleri Ã§ek
            const userNotifs = await db.collection('notifications')
                .where('targetType', '==', userEmail)
                .limit(10)
                .get();
            
            userNotifs.forEach(doc => {
                const notif = { id: doc.id, ...doc.data() };
                
                // Bu bildirim daha Ã¶nce gÃ¶sterildi mi?
                if (notifiedIds.includes(notif.id)) return;
                
                // Okundu mu?
                if (readNotifs.includes(notif.id)) return;
                
                // Bildirim tarihi kontrolÃ¼
                let notifDate = null;
                if (notif.createdAt && notif.createdAt.toDate) {
                    notifDate = notif.createdAt.toDate();
                } else if (notif.notifiedAt) {
                    notifDate = new Date(notif.notifiedAt);
                }
                
                // Son 5 dakika iÃ§inde mi?
                if (notifDate && notifDate > fiveMinutesAgo) {
                    console.log('ğŸ†• Yeni bildirim tespit edildi (polling):', notif.title);
                    
                    // Bildirim iÅŸle
                    processNewNotification(notif);
                    
                    // ID'yi kaydet
                    notifiedIds.push(notif.id);
                    localStorage.setItem('notifiedNotifications', JSON.stringify([...new Set(notifiedIds)]));
                }
            });
            
        } catch(e) {
            // Sessizce devam et - baÄŸlantÄ± sorunu olabilir
        }
    }
    
    // Yeni bildirimi iÅŸle (popup, ses, native)
    function processNewNotification(notif) {
        // Listede zaten var mÄ±?
        const existingIndex = userNotifications.findIndex(n => n.id === notif.id);
        if (existingIndex === -1) {
            userNotifications.push(notif);
        }
        
        // SipariÅŸ onayÄ± ise Ã¶zel popup
        if (notif.type === 'order' && notif.keyCode) {
            showOrderApprovalPopup(notif);
        } else {
            showNotificationPopup(notif);
        }
        
        // Ses Ã§al
        playNotificationSound();
        
        // Native push notification
        sendNativeNotification(
            notif.title || 'Bildirim',
            notif.message || '',
            { type: notif.type, keyCode: notif.keyCode }
        );
        
        // Badge gÃ¼ncelle
        updateProfileNotifBadge();
        updateNotificationBadge();
        
        // TitreÅŸim (sipariÅŸ ise daha uzun)
        if (navigator.vibrate) {
            if (notif.type === 'order') {
                navigator.vibrate([200, 100, 200, 100, 200, 100, 400]);
            } else {
                navigator.vibrate([200, 100, 200]);
            }
        }
    }
    
    // Semantik versiyon karÅŸÄ±laÅŸtÄ±rma fonksiyonu
    function compareVersions(v1, v2) {
        // v1 > v2 ise 1, v1 < v2 ise -1, eÅŸitse 0 dÃ¶ner
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const num1 = parts1[i] || 0;
            const num2 = parts2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        return 0;
    }
    
    async function checkForUpdates() {
        try {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            
            // SADECE GitHub'dan kontrol et - Firestore kullanÄ±lmÄ±yor
            let manifest = null;
            
            try {
                // GitHub API kullan - cache sorunu yok, anÄ±nda gÃ¼ncellenir
                const manifestUrl = `https://api.github.com/repos/LineOft/thebestml-updates/contents/manifest.json?_t=${timestamp}`;
                const response = await fetch(manifestUrl, { 
                    cache: 'no-store',
                    headers: { 
                        'Cache-Control': 'no-cache',
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                });
                
                if (response.ok) {
                    manifest = await response.json();
                    console.log('ğŸ™ GitHub manifest:', manifest.version);
                }
            } catch(e) {
                console.log('GitHub manifest kontrolÃ¼ baÅŸarÄ±sÄ±z:', e.message);
            }
            
            if (!manifest) return;
            
            // Yeni versiyon kontrolÃ¼ - sadece APP_VERSION ile karÅŸÄ±laÅŸtÄ±r
            const versionCompare = compareVersions(manifest.version, APP_VERSION);
            
            if (versionCompare > 0 && manifest.version !== lastCheckedVersion) {
                lastCheckedVersion = manifest.version;
                
                console.log('ğŸ†• Yeni versiyon bulundu:', manifest.version, '(GÃ¶sterilen:', currentDisplayedVersion + ')');
                
                // Zorunlu gÃ¼ncelleme kontrolÃ¼
                if (manifest.required || manifest.forceUpdate) {
                    showForceUpdateScreen(manifest);
                } else {
                    // KullanÄ±cÄ±ya sor
                    showUpdateNotification(manifest);
                }
            } else if (versionCompare <= 0) {
                console.log('âœ… Uygulama gÃ¼ncel (v' + currentDisplayedVersion + ')');
            }
        } catch (e) {
            console.log('GÃ¼ncelleme kontrolÃ¼ baÅŸarÄ±sÄ±z:', e.message);
        }
    }
    
    // Zorunlu gÃ¼ncelleme ekranÄ±
    function showForceUpdateScreen(manifest) {
        const hasChangelog = manifest.changelog && manifest.changelog.length > 0 && manifest.changelog.some(c => c.trim());
        const changelogHtml = hasChangelog ? `
                    <div style="background: rgba(76,175,80,0.1); border: 1px solid #4CAF50; border-radius: 10px; padding: 15px; margin-bottom: 20px; text-align: left;">
                        <div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px;">ğŸ“‹ Yenilikler:</div>
                        <div style="color: #ccc; font-size: 13px; line-height: 1.8;">â€¢ ${manifest.changelog.join('<br>â€¢ ')}</div>
                    </div>` : '';
        
        document.body.innerHTML = `
            <div style="min-height: 100vh; background: linear-gradient(135deg, #1a1a2e, #16213e); display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="text-align: center; max-width: 400px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">ğŸš€</div>
                    <h1 style="color: #fff; margin-bottom: 10px;">GÃ¼ncelleme Gerekli</h1>
                    <div style="color: #4CAF50; font-size: 24px; font-weight: bold; margin-bottom: 15px;">v${manifest.version}</div>
                    <p style="color: #aaa; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                        UygulamayÄ± kullanmaya devam etmek iÃ§in gÃ¼ncelleme yapmanÄ±z gerekmektedir.
                    </p>
                    ${changelogHtml}
                    <button onclick="applyUpdate()" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: #fff; border: none; padding: 15px 40px; border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">
                        ğŸ”„ Åimdi GÃ¼ncelle
                    </button>
                </div>
            </div>
        `;
    }
    
    function showUpdateNotification(manifest) {
        // GÃ¼ncelleme bildirimi gÃ¶ster
        const hasChangelog = manifest.changelog && manifest.changelog.length > 0 && manifest.changelog.some(c => c.trim());
        const changelogText = hasChangelog ? `<div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">â€¢ ${manifest.changelog.join(' â€¢ ')}</div>` : '';
        
        const updateBanner = document.createElement('div');
        updateBanner.id = 'updateBanner';
        updateBanner.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #4CAF50, #45a049); padding: calc(12px + env(safe-area-inset-top, 0px)) 15px 12px 15px; z-index: 10000; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 14px;">ğŸ†• Yeni GÃ¼ncelleme: v${manifest.version}</div>
                    ${changelogText}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="applyUpdate()" style="background: #fff; color: #4CAF50; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">GÃ¼ncelle</button>
                    <button onclick="dismissUpdate()" style="background: rgba(255,255,255,0.2); color: #fff; border: none; padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer;">âœ•</button>
                </div>
            </div>
        `;
        
        // Eski banner varsa kaldÄ±r
        const oldBanner = document.getElementById('updateBanner');
        if (oldBanner) oldBanner.remove();
        
        document.body.appendChild(updateBanner);
    }
    
    async function applyUpdate() {
        showToast('ğŸ”„ GÃ¼ncelleme uygulanÄ±yor...');
        
        // Banner'Ä± kaldÄ±r
        const banner = document.getElementById('updateBanner');
        if (banner) banner.remove();
        
        try {
            // GitHub API kullan - cache sorunu yok
            const timestamp = Date.now();
            const appUrl = `https://api.github.com/repos/LineOft/thebestml-updates/contents/app.html?t=${timestamp}`;
            const response = await fetch(appUrl, { 
                cache: 'no-store',
                headers: { 'Accept': 'application/vnd.github.v3.raw' }
            });
            const appHtml = await response.text();
            
            // Ä°Ã§erik kontrolÃ¼
            if (appHtml.length < 5000 || appHtml.indexOf('APP_VERSION') === -1) {
                throw new Error('GeÃ§ersiz gÃ¼ncelleme iÃ§eriÄŸi');
            }
            
            // SÃ¼rÃ¼m Ã§Ä±kar
            const match = appHtml.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
            const downloadedVersion = match ? match[1] : 'Bilinmiyor';
            
            // OTA cache'e kaydet
            localStorage.setItem('ota_app_html', appHtml);
            localStorage.setItem('ota_app_version', downloadedVersion);
            
            showToast('âœ… v' + downloadedVersion + ' baÅŸarÄ±yla gÃ¼ncellendi!');
            
            // GÃ¼ncellemeyi uygula - index.html'e yÃ¶nlendir
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch(e) {
            console.error('GÃ¼ncelleme hatasÄ±:', e);
            showToast('âŒ GÃ¼ncelleme hatasÄ±: ' + e.message);
        }
    }
    
    function dismissUpdate() {
        const banner = document.getElementById('updateBanner');
        if (banner) banner.remove();
    }
    
    // UygulamayÄ± Yenile - Zorla gÃ¼ncelle
    async function refreshApp() {
        showToast('ğŸ”„ GÃ¼ncelleme kontrol ediliyor...');

        try {
            // Ã–nce manifest'i kontrol et
            const manifestUrl = 'https://raw.githubusercontent.com/LineOft/thebestml-updates/main/manifest.json?t=' + Date.now();
            const manifestRes = await fetch(manifestUrl, { cache: 'no-store' });
            const manifest = await manifestRes.json();
            
            console.log('[OTA] Manifest sÃ¼rÃ¼mÃ¼:', manifest.version);
            console.log('[OTA] Mevcut APP_VERSION:', APP_VERSION);
            
            // Yeni sÃ¼rÃ¼m var veya ZORLA gÃ¼ncelle
            if (manifest.version !== APP_VERSION || true) {  // true = her zaman gÃ¼ncelle
                // Yeni sÃ¼rÃ¼m var - OTA gÃ¼ncelleme
                showToast('ğŸ†• Yeni sÃ¼rÃ¼m: v' + manifest.version + ' - Ä°ndiriliyor...');
                
                // app.html'i indir (GitHub API - anÄ±nda gÃ¼ncelleme)
                const appUrl = 'https://api.github.com/repos/LineOft/thebestml-updates/contents/app.html?t=' + Date.now();
                const appRes = await fetch(appUrl, { 
                    cache: 'no-store',
                    headers: { 'Accept': 'application/vnd.github.v3.raw' }
                });
                const appHtml = await appRes.text();
                
                // Ä°Ã§erik kontrolÃ¼
                if (appHtml.length < 5000 || appHtml.indexOf('APP_VERSION') === -1) {
                    throw new Error('GeÃ§ersiz gÃ¼ncelleme iÃ§eriÄŸi');
                }
                
                // SÃ¼rÃ¼m Ã§Ä±kar
                const match = appHtml.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
                const downloadedVersion = match ? match[1] : manifest.version;
                
                // OTA cache'e kaydet
                localStorage.setItem('ota_app_html', appHtml);
                localStorage.setItem('ota_app_version', downloadedVersion);
                
                showToast('âœ… v' + downloadedVersion + ' yÃ¼klendi! Yeniden baÅŸlatÄ±lÄ±yor...');
                
                // GÃ¼ncellemeyi uygula - index.html'e yÃ¶nlendir (o cache'den yÃ¼kler)
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
            
        } catch(e) {
            console.error('GÃ¼ncelleme hatasÄ±:', e);
            showToast('âŒ GÃ¼ncelleme hatasÄ±: ' + e.message);
        }
    }
    
    // Otomatik gÃ¼ncelleme kontrolÃ¼ (arka planda)
    async function checkUpdateSilently() {
        try {
            const manifestUrl = 'https://raw.githubusercontent.com/LineOft/thebestml-updates/main/manifest.json?t=' + Date.now();
            const res = await fetch(manifestUrl, { cache: 'no-store' });
            const manifest = await res.json();
            
            // Versiyon karÅŸÄ±laÅŸtÄ±rma - sadece manifest daha yeniyse gÃ¶ster
            const currentParts = APP_VERSION.split('.').map(Number);
            const manifestParts = manifest.version.split('.').map(Number);
            
            let isNewer = false;
            for (let i = 0; i < Math.max(currentParts.length, manifestParts.length); i++) {
                const current = currentParts[i] || 0;
                const remote = manifestParts[i] || 0;
                if (remote > current) {
                    isNewer = true;
                    break;
                } else if (remote < current) {
                    break;
                }
            }
            
            if (isNewer) {
                // GÃ¼ncelleme butonu badge'i gÃ¶ster
                const updateBtn = document.querySelector('[onclick="refreshApp()"]');
                if (updateBtn) {
                    updateBtn.innerHTML = 'ğŸ†• GÃœNCELLEME MEVCUT<span class="btn-subtext">v' + APP_VERSION + ' â†’ v' + manifest.version + '</span>';
                    updateBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                    updateBtn.style.animation = 'pulse 2s infinite';
                }
                console.log('[OTA] Yeni sÃ¼rÃ¼m mevcut: v' + manifest.version);
            } else {
                console.log('[OTA] GÃ¼ncel sÃ¼rÃ¼mdesiniz: v' + APP_VERSION);
            }
        } catch(e) {
            console.log('[OTA] Sessiz kontrol hatasÄ±:', e.message);
        }
    }

    // Navigasyon geÃ§miÅŸi
    let navigationHistory = ['homePage'];
    let currentPageId = 'homePage';
    
    // Sayfa gÃ¶ster (history'siz)
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        currentPageId = pageId;
        window.scrollTo(0, 0);
        
        // Admin sayfasÄ±na geÃ§ildiÄŸinde
        if (pageId === 'adminPage' && isAdmin()) {
            loadGamesAndCheats();
            loadGameCheatList();
            loadPaymentSettingsAdmin();
            loadSetupModalsList();
            
            // Yetki bazlÄ± bÃ¶lÃ¼m gÃ¶sterme
            updateAdminPanelPermissions();
        }
    }
    
    // Admin bÃ¶lÃ¼mÃ¼ aÃ§ma/kapama
    function toggleAdminSection(headerEl) {
        const section = headerEl.parentElement;
        section.classList.toggle('open');
        
        // LocalStorage'a kaydet
        const sectionId = section.id;
        const openSections = JSON.parse(localStorage.getItem('adminOpenSections') || '{}');
        openSections[sectionId] = section.classList.contains('open');
        localStorage.setItem('adminOpenSections', JSON.stringify(openSections));
    }
    
    // KayÄ±tlÄ± aÃ§Ä±k bÃ¶lÃ¼mleri yÃ¼kle
    function loadOpenAdminSections() {
        const openSections = JSON.parse(localStorage.getItem('adminOpenSections') || '{}');
        Object.entries(openSections).forEach(([sectionId, isOpen]) => {
            const section = document.getElementById(sectionId);
            if (section && isOpen) {
                section.classList.add('open');
            }
        });
    }
    
    // Admin panelinde yetki bazlÄ± bÃ¶lÃ¼m gizleme/gÃ¶sterme
    function updateAdminPanelPermissions() {
        // TÃ¼m permission-section bÃ¶lÃ¼mlerini data-permission'a gÃ¶re gizle/gÃ¶ster
        document.querySelectorAll('.permission-section').forEach(section => {
            const permission = section.dataset.permission;
            if (permission) {
                section.style.display = hasPermission(permission) ? 'block' : 'none';
            }
        });
        
        // KayÄ±tlÄ± aÃ§Ä±k bÃ¶lÃ¼mleri yÃ¼kle
        loadOpenAdminSections();
        
        // Kurulum modallarÄ± listesini yÃ¼kle
        if (hasPermission('modals')) {
            loadSetupModalsList();
        }
        
        // Uygulama ayarlarÄ± bilgisini yÃ¼kle
        if (hasPermission('app_settings')) {
            loadAppSettings();
        }

        // Sadakat ayarlarÄ±nÄ± arkaplanda yÃ¼kle (sipariÅŸ onayÄ±nda kullanÄ±lÄ±yor)
        if (hasPermission('orders') || hasPermission('app_settings')) {
            try { refreshLoyaltyConfig(false); } catch (e) {}
        }
        
        // Kurucu deÄŸilse panel baÅŸlÄ±ÄŸÄ±nÄ± deÄŸiÅŸtir ve yetkileri gÃ¶ster
        const panelSubtitle = document.querySelector('#adminPage .subtitle');
        const myPermsBadge = document.getElementById('myPermissionsBadge');
        
        if (panelSubtitle) {
            if (isOwner()) {
                panelSubtitle.textContent = 'Tam Yetki (Kurucu)';
                if (myPermsBadge) myPermsBadge.innerHTML = 'ğŸ‘‘ TÃ¼m yetkiler aktif';
            } else {
                const myPerms = getAdminPermissions(currentUser?.email || '');
                const permCount = myPerms.length;
                panelSubtitle.textContent = `${permCount} Yetki (Admin)`;
                
                // Yetki rozetlerini gÃ¶ster
                if (myPermsBadge) {
                    const permHtml = myPerms.map(p => {
                        const info = PERMISSIONS[p];
                        return `<span style="background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 10px; margin: 2px; font-size: 11px; display: inline-block;">${info?.icon || 'â“'} ${info?.name || p}</span>`;
                    }).join('');
                    myPermsBadge.innerHTML = permHtml || '<span style="color: #f44336;">Yetki yok</span>';
                }
            }
        }
        
        // Permission badge'larÄ±nÄ± gizle (kurucu iÃ§in)
        document.querySelectorAll('.permission-badge').forEach(badge => {
            badge.style.display = isOwner() ? 'none' : 'inline';
        });
        
        // Kurucu ise admin listesini yÃ¼kle
        if (isOwner()) {
            loadAdminListUI();
        }
        
        console.log('Admin yetkileri gÃ¼ncellendi:', isOwner() ? 'Kurucu' : 'Admin');
    }
    
    // Admin listesi UI'Ä±nÄ± yÃ¼kle
    async function loadAdminListUI() {
        const container = document.getElementById('adminListContainer');
        if (!container) return;
        
        // Admin yÃ¶netimi yetkisi yoksa gÃ¶sterme
        if (!hasPermission('admin_management')) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #888;">
                    <div style="font-size: 30px; margin-bottom: 10px;">ğŸ”’</div>
                    <div>Admin yÃ¶netimi yetkiniz yok</div>
                </div>
            `;
            return;
        }
        
        if (adminList.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #888;">
                    <div style="font-size: 30px; margin-bottom: 10px;">ğŸ‘®</div>
                    <div>HenÃ¼z admin eklenmedi</div>
                    <div style="font-size: 11px; margin-top: 5px;">â• Ekle butonuna tÄ±klayarak admin ekleyebilirsiniz</div>
                </div>
            `;
            return;
        }

        // Admin metriklerini topla (paralel)
        const metricsByEmail = {};
        try {
            await Promise.all(adminList.map(async (a) => {
                const e = normalizeEmail(a?.email);
                if (!e) return;
                metricsByEmail[e] = await fetchAdminMetricsForEmail(e);
            }));
        } catch (e) {}
        
        let html = '';
        adminList.forEach((admin, index) => {
            const permissions = admin.permissions || [];
            const permCount = permissions.length;
            const permIcons = permissions.slice(0, 4).map(p => PERMISSIONS[p]?.icon || 'â“').join('');
            const moreCount = permCount > 4 ? ` +${permCount - 4}` : '';

            const emailKey = normalizeEmail(admin.email);
            const m = metricsByEmail[emailKey] || { totalAppMs: 0, approvedOrders: 0, claimedChats: 0 };
            const durationLabel = formatDurationMs(m.totalAppMs || 0);
            const approvedLabel = Number.isFinite(Number(m.approvedOrders)) ? Number(m.approvedOrders) : 0;
            const claimedLabel = Number.isFinite(Number(m.claimedChats)) ? Number(m.claimedChats) : 0;
            
            html += `
                <div style="background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); border-radius: 12px; margin-bottom: 10px; overflow: hidden;">
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #FF9800, #F57C00); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">ğŸ‘¤</div>
                            <div>
                                <div style="font-size: 14px; font-weight: bold;">${admin.email}</div>
                                <div style="font-size: 11px; color: #FF9800; margin-top: 2px;">
                                    ${permCount} Yetki: ${permIcons}${moreCount}
                                </div>
                                <div style="font-size: 11px; color: #aaa; margin-top: 6px; line-height: 1.4;">
                                    â±ï¸ SÃ¼re: <b style="color:#fff;">${durationLabel}</b> â€¢ âœ… Onay: <b style="color:#fff;">${approvedLabel}</b> â€¢ ğŸ’¬ Devralma: <b style="color:#fff;">${claimedLabel}</b>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button onclick="openPermissionModal('${admin.email}')" style="background: linear-gradient(135deg, #2196F3, #1976D2); border: none; color: white; padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer;">âš™ï¸</button>
                            <button onclick="removeAdmin('${admin.email}')" style="background: rgba(244,67,54,0.2); border: 1px solid #f44336; color: #f44336; padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer;">âŒ</button>
                        </div>
                    </div>
                    
                    <!-- Yetki DetaylarÄ± (AÃ§Ä±lÄ±r) -->
                    <div id="adminPerms_${index}" style="display: none; padding: 12px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,152,0,0.2);">
                        <div style="font-size: 11px; color: #aaa; margin-bottom: 8px;">Aktif Yetkiler:</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${permissions.map(p => `
                                <span style="background: rgba(255,152,0,0.2); border: 1px solid rgba(255,152,0,0.4); padding: 4px 10px; border-radius: 15px; font-size: 11px;">
                                    ${PERMISSIONS[p]?.icon || 'â“'} ${PERMISSIONS[p]?.name || p}
                                </span>
                            `).join('')}
                            ${permissions.length === 0 ? '<span style="color: #888; font-size: 11px;">Yetki verilmemiÅŸ</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Admin ekle modal'Ä±nÄ± aÃ§
    function openAddAdminModal() {
        if (!hasPermission('admin_management')) {
            showToast('âŒ Admin yÃ¶netimi yetkiniz yok');
            return;
        }
        
        const emailInput = document.getElementById('newAdminEmail');
        const email = emailInput?.value?.trim() || '';
        
        document.getElementById('addAdminEmailInput').value = email;
        
        // Yetki checkbox'larÄ±nÄ± oluÅŸtur
        const container = document.getElementById('newAdminPermissionsCheckboxList');
        let html = '';
        
        const defaultPerms = ['orders', 'support', 'members_view']; // VarsayÄ±lan yetkiler
        
        Object.entries(PERMISSIONS).forEach(([key, perm]) => {
            const isDefault = defaultPerms.includes(key);
            html += `
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; margin-bottom: 8px; cursor: pointer;">
                    <input type="checkbox" id="newAdminPerm_${key}" ${isDefault ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #4CAF50;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px;">${perm.icon} ${perm.name}</div>
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">${perm.desc}</div>
                    </div>
                </label>
            `;
        });
        
        container.innerHTML = html;
        openModal('addAdminModal');
    }
    
    // Yetki modal'Ä±nÄ± aÃ§
    function openPermissionModal(email) {
        if (!hasPermission('admin_management')) {
            showToast('âŒ Admin yÃ¶netimi yetkiniz yok');
            return;
        }
        
        const admin = adminList.find(a => a.email === email);
        if (!admin) {
            showToast('âŒ Admin bulunamadÄ±');
            return;
        }
        
        document.getElementById('permissionAdminEmail').value = email;
        document.getElementById('permissionAdminEmailDisplay').textContent = email;
        document.getElementById('permissionAdminName').textContent = email.split('@')[0];
        
        // Yetki checkbox'larÄ±nÄ± oluÅŸtur
        const container = document.getElementById('permissionsCheckboxList');
        const currentPerms = admin.permissions || [];
        
        let html = '';
        Object.entries(PERMISSIONS).forEach(([key, perm]) => {
            const isChecked = currentPerms.includes(key);
            html += `
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${isChecked ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isChecked ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.1)'}; border-radius: 10px; margin-bottom: 8px; cursor: pointer;" onclick="this.style.background = this.querySelector('input').checked ? 'rgba(255,255,255,0.05)' : 'rgba(76,175,80,0.1)';">
                    <input type="checkbox" id="perm_${key}" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #4CAF50;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 14px;">${perm.icon} ${perm.name}</div>
                        <div style="font-size: 11px; color: #888; margin-top: 2px;">${perm.desc}</div>
                    </div>
                </label>
            `;
        });
        
        container.innerHTML = html;
        openModal('adminPermissionModal');
    }
    
    // Admin yetkilerini kaydet (modal'dan)
    async function saveAdminPermissions() {
        const email = document.getElementById('permissionAdminEmail').value;
        
        // SeÃ§ili yetkileri topla
        const selectedPerms = [];
        Object.keys(PERMISSIONS).forEach(key => {
            const checkbox = document.getElementById(`perm_${key}`);
            if (checkbox && checkbox.checked) {
                selectedPerms.push(key);
            }
        });
        
        const success = await updateAdminPermissions(email, selectedPerms);
        if (success) {
            closeModal('adminPermissionModal');
            loadAdminListUI();
        }
    }
    
    // Yetkilerle birlikte admin ekle
    async function addAdminWithPermissions() {
        const email = document.getElementById('addAdminEmailInput').value.trim();
        
        if (!email || !email.includes('@')) {
            showToast('âŒ GeÃ§erli e-posta girin');
            return;
        }
        
        // SeÃ§ili yetkileri topla
        const selectedPerms = [];
        Object.keys(PERMISSIONS).forEach(key => {
            const checkbox = document.getElementById(`newAdminPerm_${key}`);
            if (checkbox && checkbox.checked) {
                selectedPerms.push(key);
            }
        });
        
        const success = await addAdmin(email, selectedPerms);
        if (success) {
            closeModal('addAdminModal');
            document.getElementById('newAdminEmail').value = '';
            loadAdminListUI();
        }
    }
    
    // Eski fonksiyon (geriye uyumluluk)
    async function addAdminFromInput() {
        openAddAdminModal();
    }
    
    // Sayfa iÃ§in Ã¼yelik kontrolÃ¼
    async function checkMembershipForPage(cheatName) {
        // Ã–nce kullanÄ±cÄ± verilerini yÃ¼kle (eÄŸer aktif key yoksa)
        if (currentUser && userActiveKeys.length === 0) {
            try {
                const doc = await db.collection('users').doc(currentUser.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    const keys = data.keys || [];
                    const now = new Date();
                    userActiveKeys = keys.filter(k => k.expiresAt && k.expiresAt.toDate() > now);
                }
            } catch(e) {
                console.log('Ãœyelik kontrolÃ¼ hatasÄ±:', e);
            }
        }
        
        const now = new Date();
        
        // Bu hile iÃ§in aktif key var mÄ± kontrol et
        const hasActiveKey = userActiveKeys.some(key => {
            const keyCheat = key.cheat || 'TheBestML';
            return keyCheat.toLowerCase().includes(cheatName.toLowerCase()) || 
                   cheatName.toLowerCase().includes(keyCheat.toLowerCase()) ||
                   keyCheat === 'TheBestML'; // Mobile Legends iÃ§in
        });
        
        console.log('Ãœyelik kontrolÃ¼:', cheatName, 'Aktif key var mÄ±:', hasActiveKey, 'Toplam key:', userActiveKeys.length);
        
        // Element'leri al
        const setupLocked = document.getElementById('setupInstructionsLocked');
        const setupUnlocked = document.getElementById('setupInstructionsUnlocked');
        const pricesLocked = document.getElementById('pricesSectionLocked');
        const activeMembership = document.getElementById('activeMembershipSection');
        const membershipInfo = document.getElementById('activeMembershipInfo');
        
        if (hasActiveKey) {
            // Aktif Ã¼yelik var - kurulum talimatlarÄ±nÄ± gÃ¶ster
            if (setupLocked) setupLocked.style.display = 'none';
            if (setupUnlocked) setupUnlocked.style.display = 'block';
            if (pricesLocked) pricesLocked.style.display = 'none';
            if (activeMembership) activeMembership.style.display = 'block';
            
            // Aktif key bilgisini gÃ¶ster
            if (membershipInfo && userActiveKeys.length > 0) {
                const key = userActiveKeys.find(k => (k.cheat || 'TheBestML').toLowerCase().includes(cheatName.toLowerCase())) || userActiveKeys[0];
                const exp = key.expiresAt.toDate();
                const remainingDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                const keyCode = key.keyCode || key.code || '***';
                
                membershipInfo.innerHTML = `
                    <div style="margin-bottom: 8px;">ğŸ”‘ Key: <code style="color: #4CAF50;">${keyCode}</code></div>
                    <div>â±ï¸ Kalan SÃ¼re: <strong style="color: #4CAF50;">${remainingDays} gÃ¼n</strong></div>
                `;
            }
        } else {
            // Aktif Ã¼yelik yok - kurulum kilitli, fiyatlarÄ± gÃ¶ster
            if (setupLocked) setupLocked.style.display = 'block';
            if (setupUnlocked) setupUnlocked.style.display = 'none';
            if (pricesLocked) pricesLocked.style.display = 'block';
            if (activeMembership) activeMembership.style.display = 'none';
        }
    }
    
    // HesabÄ±m butonuna tÄ±klayÄ±nca ana sayfaya git ve kullanÄ±cÄ± kartÄ±na scroll et
    function goToAccount() {
        navigateTo('homePage');
        setTimeout(() => {
            const loggedInCard = document.getElementById('loggedInCard');
            if (loggedInCard) {
                loggedInCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // KÄ±sa bir highlight efekti
                loggedInCard.style.boxShadow = '0 0 20px rgba(76,175,80,0.5)';
                setTimeout(() => {
                    loggedInCard.style.boxShadow = '';
                }, 2000);
            }
        }, 100);
    }
    
    // Navigasyon ile sayfa geÃ§iÅŸi
    function navigateTo(pageId) {
        if (currentPageId !== pageId) {
            navigationHistory.push(pageId);
            history.pushState({ page: pageId }, '', '');
        }
        showPage(pageId);
    }
    
    // Geri git
    function navigateBack() {
        if (navigationHistory.length > 1) {
            navigationHistory.pop();
            const prevPage = navigationHistory[navigationHistory.length - 1];
            showPage(prevPage);
        }
    }
    
    // AÃ§Ä±k modal var mÄ± kontrol et ve kapat
    function closeOpenModal() {
        const modals = document.querySelectorAll('.modal-overlay.show');
        if (modals.length > 0) {
            modals.forEach(modal => {
                modal.classList.remove('show');
            });
            document.body.style.overflow = 'auto';
            return true; // Modal kapatÄ±ldÄ±
        }
        return false; // AÃ§Ä±k modal yok
    }
    
    // Android geri tuÅŸu desteÄŸi
    window.addEventListener('popstate', function(event) {
        // Ã–nce aÃ§Ä±k modal var mÄ± kontrol et
        if (closeOpenModal()) {
            // Modal kapatÄ±ldÄ±, history'yi geri al
            history.pushState({ page: navigationHistory[navigationHistory.length - 1] }, '', '');
            return;
        }
        
        if (navigationHistory.length > 1) {
            navigationHistory.pop();
            const prevPage = navigationHistory[navigationHistory.length - 1];
            showPage(prevPage);
        } else {
            // Ana sayfadaysa uygulama kapansÄ±n
            history.back();
        }
    });
    
    // BaÅŸlangÄ±Ã§ta history state ekle
    history.replaceState({ page: 'homePage' }, '', '');

    // Modal aÃ§/kapat
    function openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
        // Geri tuÅŸu iÃ§in history state ekle
        history.pushState({ modal: modalId }, '', '');
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        document.body.style.overflow = 'auto';
        const video = document.getElementById('certVideo');
        if (video) video.pause();
        
        // YouTube video modal kapatÄ±lÄ±yorsa iframe'i temizle
        if (modalId === 'youtubeVideoModal') {
            document.getElementById('youtubeVideoContainer').innerHTML = '';
        }
        
        // Chat modal kapatÄ±lÄ±yorsa interval'Ä± durdur
        if (modalId === 'userChatModal') {
            stopChatRefreshInterval();
            stopSupportPresenceInterval();
            setUserSupportPresence(false);
        }
    }
    
    function closeModalOutside(event, modalId) {
        if (event.target.classList.contains('modal-overlay')) {
            closeModal(modalId);
        }
    }
    
    // SipariÅŸ baÅŸarÄ±lÄ± modalÄ±nÄ± gÃ¶ster
    function showOrderSuccessModal() {
        document.getElementById('orderSuccessModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // SipariÅŸ baÅŸarÄ±lÄ± modalÄ±nÄ± kapat
    function closeOrderSuccessModal() {
        document.getElementById('orderSuccessModal').classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    // Oyun seÃ§im modalÄ±nÄ± aÃ§
    function openGameSelectModal() {
        const gameList = document.getElementById('gameSelectList');
        
        // OyunlarÄ± listele
        let html = '';
        
        // Mobile Legends (sabit)
        html += `
            <button onclick="selectGameForPurchase('mobile_legends', 'Mobile Legends')" class="payment-method-btn">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="https://raw.githubusercontent.com/LineOft/thebestml-updates/main/mobile-legends-icon.jpg" 
                         style="width: 50px; height: 50px; border-radius: 12px;" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%234CAF50%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>ML</text></svg>'">
                    <div style="text-align: left;">
                        <div style="font-weight: bold; font-size: 16px;">Mobile Legends</div>
                        <div style="font-size: 12px; color: #aaa;">Bang Bang</div>
                    </div>
                </div>
                <div style="font-size: 20px; color: #4CAF50;">â€º</div>
            </button>
        `;
        
        // Dinamik oyunlarÄ± da ekle (gamesData'dan)
        if (gamesData) {
            Object.entries(gamesData).forEach(([gameId, game]) => {
                if (gameId !== 'mobile_legends' && game.name) {
                    html += `
                        <button onclick="selectGameForPurchase('${gameId}', '${game.name}')" class="payment-method-btn">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <img src="${game.icon || ''}" 
                                     style="width: 50px; height: 50px; border-radius: 12px;" 
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23673AB7%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>ğŸ®</text></svg>'">
                                <div style="text-align: left;">
                                    <div style="font-weight: bold; font-size: 16px;">${game.name}</div>
                                    <div style="font-size: 12px; color: #aaa;">${game.description || ''}</div>
                                </div>
                            </div>
                            <div style="font-size: 20px; color: #4CAF50;">â€º</div>
                        </button>
                    `;
                }
            });
        }
        
        gameList.innerHTML = html;
        openModal('gameSelectModal');
    }
    
    // SeÃ§ilen oyun iÃ§in geÃ§ici deÄŸiÅŸken
    let selectedGameForPurchase = null;
    
    // Oyun seÃ§ildi - hile seÃ§im modalÄ±nÄ± aÃ§
    function selectGameForPurchase(gameId, gameName) {
        selectedGameForPurchase = { id: gameId, name: gameName };
        closeModal('gameSelectModal');
        
        const cheatList = document.getElementById('cheatSelectList');
        let html = '';
        
        if (gameId === 'mobile_legends') {
            // TheBestML (sabit hile)
            html += `
                <button onclick="selectCheatForPurchase('thebestml', 'TheBestML IMGUI', 'thebestmlPage')" class="payment-method-btn">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="https://raw.githubusercontent.com/LineOft/thebestml-updates/main/thebestml-icon.jpg" 
                             style="width: 50px; height: 50px; border-radius: 12px;" 
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%234CAF50%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>ML</text></svg>'">
                        <div style="text-align: left;">
                            <div style="font-weight: bold; font-size: 16px;">TheBestML IMGUI</div>
                            <div style="font-size: 12px; color: #aaa;">ESP, Map Hack ve daha fazlasÄ±</div>
                        </div>
                    </div>
                    <div style="font-size: 20px; color: #4CAF50;">â€º</div>
                </button>
            `;
            
            // Dinamik ML hileleri
            if (gamesData.mobile_legends?.cheats) {
                Object.entries(gamesData.mobile_legends.cheats).forEach(([cheatId, cheat]) => {
                    if (cheatId !== 'thebestml' && cheat.name) {
                        html += `
                            <button onclick="openDynamicCheatFromSelect('mobile_legends', '${cheatId}')" class="payment-method-btn">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <img src="${cheat.icon || ''}" 
                                         style="width: 50px; height: 50px; border-radius: 12px;" 
                                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23FF9800%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>ğŸ—¡</text></svg>'">
                                    <div style="text-align: left;">
                                        <div style="font-weight: bold; font-size: 16px;">${cheat.name}</div>
                                        <div style="font-size: 12px; color: #aaa;">${cheat.description || ''}</div>
                                    </div>
                                </div>
                                <div style="font-size: 20px; color: #4CAF50;">â€º</div>
                            </button>
                        `;
                    }
                });
            }
        } else {
            // DiÄŸer oyunlarÄ±n hileleri
            const gameData = gamesData[gameId];
            if (gameData?.cheats) {
                Object.entries(gameData.cheats).forEach(([cheatId, cheat]) => {
                    if (cheat.name) {
                        html += `
                            <button onclick="openDynamicCheatFromSelect('${gameId}', '${cheatId}')" class="payment-method-btn">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <img src="${cheat.icon || ''}" 
                                         style="width: 50px; height: 50px; border-radius: 12px;" 
                                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23FF9800%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>ğŸ—¡</text></svg>'">
                                    <div style="text-align: left;">
                                        <div style="font-weight: bold; font-size: 16px;">${cheat.name}</div>
                                        <div style="font-size: 12px; color: #aaa;">${cheat.description || ''}</div>
                                    </div>
                                </div>
                                <div style="font-size: 20px; color: #4CAF50;">â€º</div>
                            </button>
                        `;
                    }
                });
            }
        }
        
        if (!html) {
            html = `<div style="text-align: center; padding: 30px; color: #aaa;">Bu oyun iÃ§in henÃ¼z hile eklenmemiÅŸ.</div>`;
        }
        
        cheatList.innerHTML = html;
        openModal('cheatSelectModal');
    }
    
    // Hile seÃ§ildi - sayfaya yÃ¶nlendir
    function selectCheatForPurchase(cheatId, cheatName, pageId) {
        closeModal('cheatSelectModal');
        navigateTo(pageId);
    }
    
    // Dinamik hile seÃ§ildi - dinamik hile sayfasÄ±nÄ± aÃ§
    function openDynamicCheatFromSelect(gameId, cheatId) {
        closeModal('cheatSelectModal');
        openDynamicCheatPage(gameId, cheatId);
    }

    // APK Ä°ndir
    function downloadAPK() {
        showToast('ğŸ“¥ Ä°ndirme baÅŸlatÄ±lÄ±yor...');

        const overrideUrl = window.imguiApkUrlOverride;
        const url = overrideUrl || appConfig.apkUrl;
        window.open(url, '_blank');
    }
    
    // Play Store
    function openPlayStore() {
        window.open(appConfig.playStoreUrl, '_blank');
    }
    
    // Fiyat seÃ§imi
    let selectedPriceData = null;
    
    function selectPrice(id, label, price) {
        // GiriÅŸ kontrolÃ¼
        if (!requireLogin('satÄ±n alma iÅŸlemi yapmak')) return;
        
        // Ã–nceki seÃ§imi kaldÄ±r
        document.querySelectorAll('.price-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Yeni seÃ§imi iÅŸaretle
        event.target.closest('.price-btn').classList.add('selected');
        
        // Verileri kaydet
        selectedPriceData = { id, label, price };
        
        // KartÄ± gÃ¼ncelle ve gÃ¶ster
        const card = document.getElementById('selectedPriceCard');
        const labelEl = document.getElementById('selectedPriceLabel');
        const valueEl = document.getElementById('selectedPriceValue');
        
        labelEl.textContent = label + ' Paket';
        valueEl.textContent = price;
        
        // Premium iÃ§in Ã¶zel stil
        if (id === 'sinirsiz') {
            card.classList.add('premium');
        } else {
            card.classList.remove('premium');
        }
        
        card.style.display = 'flex';
    }
    
    function buyWithTelegram() {
        if (!selectedPriceData) return;
        openTelegramSupport();
    }
    
    // Ã–deme modal'Ä±nÄ± aÃ§ (Merkezi sistemi kullan)
    function openPaymentModal() {
        if (!requireLogin('satÄ±n alma iÅŸlemi yapmak')) return;
        
        if (!selectedPriceData) {
            showToast('âŒ Ã–nce bir paket seÃ§in');
            return;
        }
        
        // GÃ¼nleri belirle
        let days = 30;
        if (selectedPriceData.id === '1gun') days = 1;
        else if (selectedPriceData.id === '30gun') days = 30;
        else if (selectedPriceData.id === '60gun') days = 60;
        else if (selectedPriceData.id === '90gun') days = 90;
        else if (selectedPriceData.id === 'sinirsiz') days = 365;
        
        // Merkezi Ã¶deme sistemini kullan
        openUnifiedPaymentModal({
            type: 'purchase',
            game: 'Mobile Legends',
            cheat: 'TheBestML IMGUI',
            package: selectedPriceData.id,
            packageName: selectedPriceData.label,
            price: selectedPriceData.price,
            days: days
        });
    }
    
    // Ã–deme yÃ¶ntemi seÃ§ (eski - geriye uyumluluk)
    function selectPaymentMethod(method) {
        closeModal('paymentModal');
        
        if (method === 'shopier') {
            // Kredi kartÄ± geÃ§ici olarak devre dÄ±ÅŸÄ±
            showToast('âš ï¸ Kredi kartÄ± ile Ã¶deme yakÄ±nda aktif olacak!');
            return;
        } else if (method === 'havale') {
            // TheBestML sipariÅŸi olduÄŸunu iÅŸaretle
            window.isDynamicOrder = false;
            
            // Havale modal'Ä±nÄ± aÃ§
            document.getElementById('havalePackageInfo').textContent = selectedPriceData.label + ' Paket';
            document.getElementById('havaleAmount').textContent = selectedPriceData.price;
            openModal('havaleModal');
        }
    }
    
    // Dekont Ã¶nizleme
    function previewDekont(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('dekontImg').src = e.target.result;
                document.getElementById('dekontPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
    
    function startPurchase() {
        // Eski fonksiyon - artÄ±k openPaymentModal kullanÄ±lÄ±yor
        openPaymentModal();
    }
    
    function payWithCard() {
        showToast('ğŸ’³ Kredi kartÄ± yakÄ±nda!');
    }
    
    // TheBestML Pro fiyat seÃ§imi
    let selectedProPriceData = null;
    
    function selectProPrice(id, label, price) {
        // GiriÅŸ kontrolÃ¼
        if (!requireLogin('satÄ±n alma iÅŸlemi yapmak')) return;
        
        // Ã–nceki seÃ§imi kaldÄ±r
        document.querySelectorAll('#proPricesSectionLocked .price-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Yeni seÃ§imi iÅŸaretle
        event.target.closest('.price-btn').classList.add('selected');
        
        // Verileri kaydet
        selectedProPriceData = { id, label, price };
        
        // KartÄ± gÃ¼ncelle ve gÃ¶ster
        const card = document.getElementById('selectedProPriceCard');
        const labelEl = document.getElementById('selectedProPriceLabel');
        const valueEl = document.getElementById('selectedProPriceValue');
        
        labelEl.textContent = label + ' Paket';
        valueEl.textContent = price;
        
        // Premium iÃ§in Ã¶zel stil
        if (id === 'sinirsiz') {
            card.classList.add('premium');
        } else {
            card.classList.remove('premium');
        }
        
        card.style.display = 'flex';
    }
    
    function openProPaymentModal() {
        if (!requireLogin('satÄ±n alma iÅŸlemi yapmak')) return;
        
        if (!selectedProPriceData) {
            showToast('âŒ Ã–nce bir paket seÃ§in');
            return;
        }
        
        // GÃ¼nleri belirle
        let days = 30;
        if (selectedProPriceData.id === '1gun') days = 1;
        else if (selectedProPriceData.id === '30gun') days = 30;
        else if (selectedProPriceData.id === '60gun') days = 60;
        else if (selectedProPriceData.id === '90gun') days = 90;
        else if (selectedProPriceData.id === 'sinirsiz') days = 365;
        
        // Merkezi Ã¶deme sistemini kullan
        openUnifiedPaymentModal({
            type: 'purchase',
            game: 'Mobile Legends',
            cheat: 'TheBestML Pro',
            package: selectedProPriceData.id,
            packageName: selectedProPriceData.label,
            price: selectedProPriceData.price,
            days: days
        });
    }
    
    async function payWithTransfer() {
        // ArtÄ±k kullanÄ±lmÄ±yor
    }
    
    // Dekont Ã¶nizleme - moved to main DOMContentLoaded
    
    // SipariÅŸ gÃ¶nder
    async function submitOrder() {
        if (!currentUser) { showToast('âŒ Ã–nce giriÅŸ yapÄ±n'); return; }

        const canProceed = await ensureBanRiskAccepted({ prompt: true, reason: 'SipariÅŸ gÃ¶ndermeden Ã¶nce lÃ¼tfen ban riski bilgilendirmesini onaylayÄ±n.' });
        if (!canProceed) return;
        
        // Dinamik sipariÅŸ mi yoksa TheBestML sipariÅŸi mi kontrol et
        const isDynamic = window.isDynamicOrder && window.pendingDynamicOrder;
        const orderData = isDynamic ? window.pendingDynamicOrder : selectedPriceData;
        
        if (!orderData) { 
            showToast('âŒ Paket seÃ§in'); 
            return; 
        }
        
        const fileInput = document.getElementById('dekontFile');
        if (!fileInput.files[0]) { showToast('âŒ Dekont fotoÄŸrafÄ± seÃ§in'); return; }

        const dekontFile = fileInput.files[0];
        if (!dekontFile.type || !dekontFile.type.startsWith('image/')) {
            showToast('âŒ Sadece resim dosyasÄ± seÃ§in');
            return;
        }
        if (dekontFile.size > 10 * 1024 * 1024) {
            showToast('âŒ Dekont dosyasÄ± Ã§ok bÃ¼yÃ¼k (max 10MB)');
            return;
        }
        
        showToast('â³ GÃ¶nderiliyor...');
        
        try {
            // Prefer Cloudflare Worker API (Firestore-free)
            try { await loadRemoteRuntimeConfig(); } catch (e) {}
            const ordersApiBase = getOrdersApiBase();

            // Worker iÃ§in order id Ã¼ret (Storage path iÃ§in)
            const generatedOrderId = (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()));
            const receipt = await prepareReceiptForOrder(dekontFile, { orderId: generatedOrderId, userId: currentUser.uid });

            // Worker modu aktifse: Firestore'a hiÃ§ dokunma
            if (ordersApiBase) {
                const payload = isDynamic ? {
                    userId: currentUser.uid,
                    email: currentUser.email,
                    userEmail: currentUser.email,
                    type: 'purchase',
                    game: orderData.game || '',
                    gameId: orderData.gameId || null,
                    cheat: orderData.cheat || '',
                    cheatId: orderData.cheatId || null,
                    days: orderData.days || null,
                    package: String(orderData.days || '') + 'gun',
                    packageName: `${orderData.cheat || ''} - ${orderData.label || ''}`.trim(),
                    price: orderData.price,
                    dekontUrl: receipt.dekontUrl || null,
                    dekontStoragePath: receipt.dekontStoragePath || null,
                    dekont: receipt.dekontBase64 || null,
                    paymentMethod: 'havale',
                    status: 'pending'
                } : {
                    userId: currentUser.uid,
                    email: currentUser.email,
                    userEmail: currentUser.email,
                    type: 'purchase',
                    game: 'Mobile Legends',
                    cheat: 'TheBestML IMGUI',
                    package: orderData.id,
                    packageName: orderData.label,
                    price: orderData.price,
                    dekontUrl: receipt.dekontUrl || null,
                    dekontStoragePath: receipt.dekontStoragePath || null,
                    dekont: receipt.dekontBase64 || null,
                    paymentMethod: 'havale',
                    status: 'pending'
                };

                // Client-side validation for strict Worker schema
                if (!payload.game) { showToast('âŒ Oyun seÃ§in'); return; }
                if (!payload.package) { showToast('âŒ Paket seÃ§in'); return; }
                if (!payload.packageName) { showToast('âŒ Paket adÄ± bulunamadÄ±'); return; }
                if (!payload.price) { showToast('âŒ Fiyat bulunamadÄ±'); return; }

                await workerApiFetch(ordersApiBase, '/v1/orders', { method: 'POST', body: payload });

                // Modal'larÄ± kapat
                closeModal('havaleModal');
                closeModal('paymentModal');

                // Formu sÄ±fÄ±rla
                const selectedCard = document.getElementById('selectedPriceCard');
                if (selectedCard) selectedCard.style.display = 'none';

                const dekontFileInput = document.getElementById('dekontFile');
                if (dekontFileInput) dekontFileInput.value = '';

                const dekontPreview = document.getElementById('dekontPreview');
                if (dekontPreview) dekontPreview.style.display = 'none';

                document.querySelectorAll('.price-btn').forEach(btn => btn.classList.remove('selected'));
                document.querySelectorAll('#dynamicCheatPrices .price-card').forEach(card => card.classList.remove('selected'));

                // DeÄŸiÅŸkenleri sÄ±fÄ±rla
                selectedPriceData = null;
                window.isDynamicOrder = false;
                window.pendingDynamicOrder = null;
                selectedDynamicPrice = null;

                const dynamicSelectedPrice = document.getElementById('dynamicSelectedPrice');
                if (dynamicSelectedPrice) dynamicSelectedPrice.textContent = 'Fiyat seÃ§in';

                // Worker listemeyi tetikle
                try { await updateOrderBadge(); } catch (e) {}

                // BaÅŸarÄ± modalÄ±nÄ± gÃ¶ster
                showOrderSuccessModal();
                showToast('âœ… SipariÅŸiniz alÄ±ndÄ±!');
                return;
            }

            // Firestore fallback (Worker kapalÄ±ysa)
            const orderRef = db.collection('orders').doc();
            const receiptFs = await prepareReceiptForOrder(dekontFile, { orderId: orderRef.id, userId: currentUser.uid });
            
            // SipariÅŸi kaydet
            if (isDynamic) {
                // Dinamik sipariÅŸ
                await orderRef.set({
                    userId: currentUser.uid,
                    email: currentUser.email,
                    userEmail: currentUser.email,
                    game: orderData.game,
                    gameId: orderData.gameId,
                    cheat: orderData.cheat,
                    cheatId: orderData.cheatId,
                    days: orderData.days,
                    package: orderData.days + 'gun',
                    packageName: `${orderData.cheat} - ${orderData.label}`,
                    price: orderData.price,
                    dekontUrl: receiptFs.dekontUrl || null,
                    dekontStoragePath: receiptFs.dekontStoragePath || null,
                    dekont: receiptFs.dekontBase64 || null,
                    paymentMethod: 'havale',
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // TheBestML sipariÅŸi
                await orderRef.set({
                    userId: currentUser.uid,
                    email: currentUser.email,
                    userEmail: currentUser.email,
                    game: 'Mobile Legends',
                    cheat: 'TheBestML IMGUI',
                    package: orderData.id,
                    packageName: orderData.label,
                    price: orderData.price,
                    dekontUrl: receiptFs.dekontUrl || null,
                    dekontStoragePath: receiptFs.dekontStoragePath || null,
                    dekont: receiptFs.dekontBase64 || null,
                    paymentMethod: 'havale',
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Modal'larÄ± kapat
            closeModal('havaleModal');
            closeModal('paymentModal');
            
            // Formu sÄ±fÄ±rla
            const selectedCard = document.getElementById('selectedPriceCard');
            if (selectedCard) selectedCard.style.display = 'none';
            
            const dekontFileInput = document.getElementById('dekontFile');
            if (dekontFileInput) dekontFileInput.value = '';
            
            const dekontPreview = document.getElementById('dekontPreview');
            if (dekontPreview) dekontPreview.style.display = 'none';
            
            document.querySelectorAll('.price-btn').forEach(btn => btn.classList.remove('selected'));
            document.querySelectorAll('#dynamicCheatPrices .price-card').forEach(card => card.classList.remove('selected'));
            
            // DeÄŸiÅŸkenleri sÄ±fÄ±rla
            selectedPriceData = null;
            window.isDynamicOrder = false;
            window.pendingDynamicOrder = null;
            selectedDynamicPrice = null;
            
            const dynamicSelectedPrice = document.getElementById('dynamicSelectedPrice');
            if (dynamicSelectedPrice) dynamicSelectedPrice.textContent = 'Fiyat seÃ§in';
            
            // SipariÅŸ badge'ini gÃ¼ncelle
            updateOrderBadge();
            
            // Admin'lere yeni sipariÅŸ bildirimi gÃ¶nder
            const packageName = isDynamic ? orderData.cheat : orderData.label;
            await sendNewOrderNotificationToAdmins(currentUser.email, packageName, orderData.price);
            
            // BaÅŸarÄ± modalÄ±nÄ± gÃ¶ster
            showOrderSuccessModal();
            
        } catch(e) {
            console.error('SipariÅŸ hatasÄ±:', e);
            const friendly = getFriendlyOrderErrorMessage(e);
            let debug = '';
            try {
                const http = e && e.httpStatus ? `HTTP ${e.httpStatus}` : '';
                const payload = e && e.payload ? JSON.stringify(e.payload) : '';
                const payloadShort = payload ? payload.slice(0, 220) : '';
                debug = (http || payloadShort) ? ` (${[http, payloadShort].filter(Boolean).join(' ')})` : '';
            } catch (err) {}
            showToast('âŒ Hata: ' + friendly + debug);
        }
    }
    
    // Telegram
    function openTelegram() {
        const telegramUrl = 'https://t.me/CheatsStoreTR';
        showToast('ğŸ“© Telegram aÃ§Ä±lÄ±yor...');
        
        const startTime = Date.now();
        window.location.href = 'tg://resolve?domain=CheatsStoreTR';
        
        setTimeout(() => {
            if (Date.now() - startTime < 2500) {
                if (confirm('ğŸ“± Telegram uygulamasÄ± bulunamadÄ±!\n\nTelegram\'Ä± Play Store\'dan indirmek ister misiniz?')) {
                    window.open('https://play.google.com/store/apps/details?id=org.telegram.messenger', '_blank');
                } else {
                    window.open(telegramUrl, '_blank');
                }
            }
        }, 2000);
    }
    
    // Sertifika ayarlarÄ±
    async function openSecuritySettings() {
        showToast('ğŸ”’ Ayarlar aÃ§Ä±lÄ±yor...');
        
        let opened = false;
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CertificateManager) {
            try {
                await window.Capacitor.Plugins.CertificateManager.openTrustedCredentials();
                opened = true;
                showToast('âœ… Sertifika ayarlarÄ± aÃ§Ä±ldÄ±!');
            } catch (e) {}
        }
        
        if (!opened) {
            alert(`ğŸ“ Sertifika ayarlarÄ±nÄ± manuel aÃ§Ä±n:

1ï¸âƒ£ Telefonunuzun AYARLAR'Ä±nÄ± aÃ§Ä±n
2ï¸âƒ£ "GÃ¼venlik" veya "GÃ¼venlik ve gizlilik" bulun
3ï¸âƒ£ "Åifreleme ve kimlik bilgileri" tÄ±klayÄ±n
4ï¸âƒ£ "GÃ¼venilen kimlik bilgileri" tÄ±klayÄ±n
5ï¸âƒ£ "SÄ°STEM" sekmesine geÃ§in

âš ï¸ GlobalSign NV-SA AÃ‡IK kalmalÄ±!`);
        }
    }
    
    // ÅÄ°FRE DEÄÄ°ÅTÄ°RME FONKSÄ°YONLARI
    function openChangePasswordModal() {
        if (!currentUser) {
            showLoginRequiredModal('ÅŸifre deÄŸiÅŸtirmek');
            return;
        }
        
        // Input alanlarÄ±nÄ± temizle
        document.getElementById('currentPasswordInput').value = '';
        document.getElementById('newPasswordInput').value = '';
        document.getElementById('confirmNewPasswordInput').value = '';
        document.getElementById('passwordChangeError').style.display = 'none';
        
        openModal('changePasswordModal');
    }
    
    async function changePassword() {
        const currentPassword = document.getElementById('currentPasswordInput').value.trim();
        const newPassword = document.getElementById('newPasswordInput').value.trim();
        const confirmPassword = document.getElementById('confirmNewPasswordInput').value.trim();
        const errorDiv = document.getElementById('passwordChangeError');
        
        // Validasyon
        if (!currentPassword) {
            errorDiv.textContent = 'âŒ LÃ¼tfen mevcut ÅŸifrenizi girin.';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (!newPassword) {
            errorDiv.textContent = 'âŒ LÃ¼tfen yeni ÅŸifrenizi girin.';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (newPassword.length < 6) {
            errorDiv.textContent = 'âŒ Yeni ÅŸifre en az 6 karakter olmalÄ±dÄ±r.';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (newPassword !== confirmPassword) {
            errorDiv.textContent = 'âŒ Yeni ÅŸifreler eÅŸleÅŸmiyor.';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (currentPassword === newPassword) {
            errorDiv.textContent = 'âŒ Yeni ÅŸifre mevcut ÅŸifreden farklÄ± olmalÄ±dÄ±r.';
            errorDiv.style.display = 'block';
            return;
        }
        
        try {
            errorDiv.style.display = 'none';
            showToast('ğŸ”„ Åifre deÄŸiÅŸtiriliyor...');
            
            const user = firebase.auth().currentUser;
            
            if (!user || !user.email) {
                errorDiv.textContent = 'âŒ Oturum bilgisi alÄ±namadÄ±. LÃ¼tfen tekrar giriÅŸ yapÄ±n.';
                errorDiv.style.display = 'block';
                return;
            }
            
            // Ã–nce mevcut ÅŸifreyle yeniden kimlik doÄŸrulama yap
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            
            await user.reauthenticateWithCredential(credential);
            
            // Åifreyi gÃ¼ncelle
            await user.updatePassword(newPassword);
            
            // BaÅŸarÄ±lÄ±
            closeModal('changePasswordModal');
            showToast('âœ… Åifreniz baÅŸarÄ±yla deÄŸiÅŸtirildi!');
            
            // GÃ¼venlik iÃ§in Firestore'a log kaydÄ± (isteÄŸe baÄŸlÄ±)
            try {
                await db.collection('users').doc(user.uid).update({
                    lastPasswordChange: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                // Log kaydÄ± baÅŸarÄ±sÄ±z olsa bile devam et
                console.log('Password change log failed:', e);
            }
            
        } catch (error) {
            console.error('Password change error:', error);
            
            // Hata mesajlarÄ±nÄ± TÃ¼rkÃ§eleÅŸtir
            let errorMessage = 'âŒ Åifre deÄŸiÅŸtirilemedi.';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'âŒ Mevcut ÅŸifre yanlÄ±ÅŸ. LÃ¼tfen kontrol edin.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'âŒ Yeni ÅŸifre Ã§ok zayÄ±f. Daha gÃ¼Ã§lÃ¼ bir ÅŸifre seÃ§in.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'âŒ Bu iÅŸlem iÃ§in yakÄ±n zamanda giriÅŸ yapmanÄ±z gerekiyor. LÃ¼tfen Ã§Ä±kÄ±ÅŸ yapÄ±p tekrar girin.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'âŒ Ã‡ok fazla deneme yaptÄ±nÄ±z. LÃ¼tfen birkaÃ§ dakika bekleyin.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'âŒ Ä°nternet baÄŸlantÄ±nÄ±zÄ± kontrol edin.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'âŒ Mevcut ÅŸifre yanlÄ±ÅŸ. LÃ¼tfen kontrol edin.';
                    break;
                default:
                    errorMessage = `âŒ Hata: ${error.message}`;
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        }
    }
    
    // Toast
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
