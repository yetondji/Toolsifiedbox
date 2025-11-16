// Character Counter Tool Logic

function countCharacters() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value;
    
    const totalChars = text.length;
    
    const charsNoSpace = text.replace(/\s/g, '').length;
    
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    
    const numbers = (text.match(/[0-9]/g) || []).length;
    
    const spaces = (text.match(/\s/g) || []).length;
    
    const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
    
    const uppercase = (text.match(/[A-Z]/g) || []).length;
    
    const lowercase = (text.match(/[a-z]/g) || []).length;
    
    const uniqueChars = new Set(text).size;
    
    document.getElementById('total-chars').textContent = totalChars;
    document.getElementById('chars-no-space').textContent = charsNoSpace;
    document.getElementById('letters').textContent = letters;
    document.getElementById('numbers').textContent = numbers;
    document.getElementById('spaces').textContent = spaces;
    document.getElementById('special-chars').textContent = specialChars;
    document.getElementById('uppercase').textContent = uppercase;
    document.getElementById('lowercase').textContent = lowercase;
    document.getElementById('unique-chars').textContent = uniqueChars;
}

function clearText() {
    document.getElementById('text-input').value = '';
    countCharacters();
}

function copyText() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value;
    
    if (text.trim() === '') {
        showNotification('Nothing to copy', 'error');
        return;
    }
    
    copyToClipboard(text);
}

document.addEventListener('DOMContentLoaded', function() {
    countCharacters();
});
