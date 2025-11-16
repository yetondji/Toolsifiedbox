// Text Case Converter Tool Logic

function convertCase(caseType) {
    const textInput = document.getElementById('text-input');
    const result = document.getElementById('result');
    const text = textInput.value;
    
    if (text.trim() === '') {
        showNotification('Please enter some text first', 'error');
        return;
    }
    
    let convertedText = '';
    
    switch(caseType) {
        case 'upper':
            convertedText = text.toUpperCase();
            break;
            
        case 'lower':
            convertedText = text.toLowerCase();
            break;
            
        case 'title':
            convertedText = text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
            break;
            
        case 'sentence':
            convertedText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, char => char.toUpperCase());
            break;
            
        case 'toggle':
            convertedText = text.split('').map(char => {
                return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
            }).join('');
            break;
            
        case 'alternate':
            convertedText = text.split('').map((char, index) => {
                if (!/[a-zA-Z]/.test(char)) return char;
                return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
            }).join('');
            break;
            
        default:
            convertedText = text;
    }
    
    result.textContent = convertedText;
    showNotification('Text converted successfully!', 'success');
}

function copyResult() {
    const result = document.getElementById('result');
    const text = result.textContent;
    
    if (text.trim() === '' || text === 'Your converted text will appear here...') {
        showNotification('Nothing to copy', 'error');
        return;
    }
    
    copyToClipboard(text);
}

function clearAll() {
    document.getElementById('text-input').value = '';
    document.getElementById('result').textContent = 'Your converted text will appear here...';
}
