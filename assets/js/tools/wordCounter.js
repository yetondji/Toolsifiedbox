// Word Counter Tool Logic

function countWords() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value;
    
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    const charCount = text.length;
    
    const charNoSpaceCount = text.replace(/\s/g, '').length;
    
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    
    const paragraphs = text.split(/\n\n+/).filter(para => para.trim().length > 0);
    const paragraphCount = paragraphs.length;
    
    const lines = text.split(/\n/).filter(line => line.trim().length > 0);
    const lineCount = lines.length;
    
    const readingTime = Math.ceil(wordCount / 200);
    
    const speakingTime = Math.ceil(wordCount / 130);
    
    document.getElementById('word-count').textContent = wordCount;
    document.getElementById('char-count').textContent = charCount;
    document.getElementById('char-no-space-count').textContent = charNoSpaceCount;
    document.getElementById('sentence-count').textContent = sentenceCount;
    document.getElementById('paragraph-count').textContent = paragraphCount;
    document.getElementById('line-count').textContent = lineCount;
    document.getElementById('reading-time').textContent = readingTime;
    document.getElementById('speaking-time').textContent = speakingTime;
}

function clearText() {
    document.getElementById('text-input').value = '';
    countWords();
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
    countWords();
});
