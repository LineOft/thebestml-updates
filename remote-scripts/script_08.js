
// SaÄŸ alttaki destek butonuna tÄ±klayÄ±nca
function openFloatingSupport() {
    if (currentUser) {
        // GiriÅŸ yapmÄ±ÅŸsa destek mesaj modalnÄ± aÃ§
        openUserChatModal();
    } else {
        // GiriÅŸ yapmamÄ±ÅŸsa giriÅŸ yapmasÄ±nÄ± iste
        showLoginRequiredModal('destek almak');
    }
}
