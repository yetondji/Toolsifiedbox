// QR Code Generator Tool Logic

let currentQrCode = null;

// Update character count as user types
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('qr-input');
    if (input) {
        input.addEventListener('input', function() {
            document.getElementById('char-count').textContent = this.value.length;
        });
    }
});

function setPreset(type) {
    const input = document.getElementById('qr-input');
    const presets = {
        url: 'https://example.com',
        email: 'mailto:example@example.com',
        phone: 'tel:+1234567890',
        wifi: 'WIFI:T:WPA;S:NetworkName;P:Password;;'
    };
    
    input.value = presets[type] || '';
    document.getElementById('char-count').textContent = input.value.length;
    input.focus();
}

function generateQrCode() {
    const input = document.getElementById('qr-input').value.trim();
    const size = parseInt(document.getElementById('qr-size').value);
    const correction = document.getElementById('qr-correction').value;
    
    if (!input) {
        showNotification('Please enter text or URL', 'error');
        return;
    }
    
    document.getElementById('loading').classList.remove('hidden');
    
    try {
        // Clear previous QR code
        const container = document.getElementById('qr-code-container');
        container.innerHTML = '';
        
        // Generate new QR code
        currentQrCode = new QRCode(container, {
            text: input,
            width: size,
            height: size,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel[correction]
        });
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result-section').classList.remove('hidden');
        showNotification('QR code generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        document.getElementById('loading').classList.add('hidden');
        showNotification('Error generating QR code. Please try again.', 'error');
    }
}

function downloadQrCode(format) {
    const canvas = document.querySelector('#qr-code-container canvas');
    
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `qrcode_${timestamp}.${format}`;
    
    canvas.toBlob(function(blob) {
        downloadFile(blob, filename);
        showNotification(`QR code downloaded as ${format.toUpperCase()}!`, 'success');
        
        // Trigger monetag pop-under ad after download
        attachMonetagPop();
    }, `image/${format === 'jpg' ? 'jpeg' : format}`);
}

function copyQrCode() {
    const canvas = document.querySelector('#qr-code-container canvas');
    
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }
    
    canvas.toBlob(function(blob) {
        const item = new ClipboardItem({'image/png': blob});
        navigator.clipboard.write([item]).then(function() {
            showNotification('QR code copied to clipboard!', 'success');
            
            // Trigger monetag pop-under ad after copy
            attachMonetagPop();
        }).catch(function(err) {
            console.error('Could not copy image:', err);
            showNotification('Failed to copy QR code', 'error');
        });
    });
}

function attachMonetagPop() {
    const MONETAG_URL = 'https://a.monetag.io/popup';
    const SESSION_KEY = 'monetag_download_triggered';
    const AD_DELAY_MS = 1500;
    
    // Check if already triggered this session
    if (sessionStorage.getItem(SESSION_KEY)) {
        return;
    }
    
    // Mark as triggered
    sessionStorage.setItem(SESSION_KEY, 'true');
    
    // Delayed pop-under
    setTimeout(() => {
        if (window.open) {
            window.open(MONETAG_URL, 'monetag_pop', 'width=800,height=600');
        }
    }, AD_DELAY_MS);
}
