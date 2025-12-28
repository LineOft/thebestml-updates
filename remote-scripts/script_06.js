
        // Global error handler - TÃœM hatalarÄ± yakala
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            const errorDiv = document.getElementById('homeGamesGrid');
            if (errorDiv) {
                errorDiv.innerHTML = `
                    <div style="background: #f44336; color: white; padding: 15px; margin: 10px; border-radius: 8px; text-align: left; font-size: 11px;">
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">âŒ JavaScript HatasÄ±</div>
                        <div><strong>Mesaj:</strong> ${msg}</div>
                        <div><strong>SatÄ±r:</strong> ${lineNo}:${columnNo}</div>
                        <div style="margin-top: 10px; background: #222; padding: 8px; border-radius: 4px; overflow: auto;">${error ? error.stack : 'Stack yok'}</div>
                    </div>
                `;
            }
            return false;
        };
        
        var firebaseReady = false;
        var auth = null;
        var db = null;
        var storage = null;
        
        try {
            const firebaseConfig = {
                apiKey: "AIzaSyAexeqO1niP2noYEL2VMSoXL4llPLHaiYg",
                authDomain: "cheatstore-515c1.firebaseapp.com",
                projectId: "cheatstore-515c1",
                storageBucket: "cheatstore-515c1.firebasestorage.app",
                messagingSenderId: "424756346612",
                appId: "1:424756346612:web:683b874f98daf48352e8a1"
            };
            
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                auth = firebase.auth();
                db = firebase.firestore();
                try {
                    if (typeof firebase.storage === 'function') {
                        storage = firebase.storage();
                    }
                } catch (e) {
                    storage = null;
                }
                firebaseReady = true;
                console.log('âœ… Firebase baÅŸlatÄ±ldÄ±');
                console.log('âœ… db:', db ? 'OK' : 'NULL');
                console.log('âœ… auth:', auth ? 'OK' : 'NULL');
                console.log('âœ… storage:', storage ? 'OK' : 'NULL');
            } else {
                console.error('âŒ Firebase SDK yÃ¼klenemedi');
                const grid = document.getElementById('homeGamesGrid');
                if (grid) {
                    grid.innerHTML = '<div style="padding: 20px; color: #f44336;">âŒ Firebase SDK yÃ¼klenemedi!</div>';
                }
            }
        } catch(e) {
            console.error('âŒ Firebase baÅŸlatma hatasÄ±:', e);
            const grid = document.getElementById('homeGamesGrid');
            if (grid) {
                grid.innerHTML = `<div style="padding: 20px; color: #f44336;">âŒ Firebase baÅŸlatma hatasÄ±: ${e.message}</div>`;
            }
        }
    