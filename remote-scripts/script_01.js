
        window.onerror = function(msg, url, line, col, error) {
            console.error('Global Hata:', msg, 'SatÄ±r:', line);
            var errDiv = document.getElementById('globalError');
            if (errDiv) errDiv.innerHTML = 'JS HatasÄ±: ' + msg + ' (SatÄ±r: ' + line + ')';
            return false;
        };
    