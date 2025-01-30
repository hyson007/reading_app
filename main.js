const fileListDiv = document.getElementById('file-list');
const readerDiv = document.getElementById('reader');
const selectedFileP = document.getElementById('selected-file');
const startBtn = document.getElementById('start-btn');
const displayBtn = document.getElementById('display-btn');
const repeatBtn = document.getElementById('repeat-btn');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');
const currentLineP = document.getElementById('current-line');
const messageP = document.getElementById('message');
const loadingSpinner = document.getElementById('loading-spinner');
const progressDiv = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const spacebarMessageP = document.getElementById('spacebar-message');

const chineseBtn = document.getElementById('chinese-btn');
const englishBtn = document.getElementById('english-btn');

let language = null;
let selectedFile = null;
let lines = [];
let currentLineIndex = 0;

const textFiles = {
    chinese: Array.from({ length: 17 }, (_, i) => `p3-listen${i + 1}.txt`),
    english: ['e3', 'e4'].flatMap(prefix => 
        Array.from({ length: 9 }, (_, i) => `${prefix}-listen${i + 1}.txt`)
    )
};

chineseBtn.onclick = () => {
    language = 'chinese';
    loadFileList();
};

englishBtn.onclick = () => {
    language = 'english';
    loadFileList();
};

function loadFileList() {
    fileListDiv.innerHTML = '';
    textFiles[language].forEach(file => {
        const fileButton = document.createElement('button');
        fileButton.textContent = file;
        fileButton.classList.add('btn', 'btn-secondary', 'm-2');
        fileButton.onclick = () => loadFile(file);
        fileListDiv.appendChild(fileButton);
    });
}

function loadFile(fileName) {
    selectedFile = fileName;
    selectedFileP.textContent = `Selected file: ${fileName}`;
    showLoading(true);
    fetch(`texts/${language}/${fileName}`)
        .then(response => response.text())
        .then(data => {
            lines = data.split('\n').filter(line => line.trim() !== '');
            currentLineIndex = 0;
            fileListDiv.style.display = 'none';
            readerDiv.style.display = 'block';
            showLoading(false);
            updateProgress();
            messageP.textContent = ''; // Clear the message when a new file is loaded
        })
        .catch(error => {
            showLoading(false);
            alert('Error loading file: ' + error.message);
        });
}

startBtn.onclick = () => {
    if (!selectedFile) {
        alert('Please select a file first.');
        return;
    }
    startBtn.style.display = 'none';
    readLine();
};

displayBtn.onclick = () => {
    if (currentLineP.style.display === 'none') {
        currentLineP.style.display = 'block';
        displayBtn.textContent = 'Hide';
    } else {
        currentLineP.style.display = 'none';
        displayBtn.textContent = 'Display';
    }
};

repeatBtn.onclick = () => {
    speak(lines[currentLineIndex]);
};

backBtn.onclick = () => {
    if (currentLineIndex > 0) {
        currentLineIndex--;
        readLine();
    }
};

nextBtn.onclick = () => {
    if (currentLineIndex < lines.length - 1) {
        currentLineIndex++;
        readLine();
    }
};

function readLine() {
    if (currentLineIndex < lines.length) {
        currentLineP.textContent = lines[currentLineIndex];
        currentLineP.style.display = 'none';
        displayBtn.style.display = 'block';
        displayBtn.textContent = 'Display';
        repeatBtn.style.display = 'block';
        speak(lines[currentLineIndex], () => {
            document.addEventListener('keydown', onSpacePress);
        });
    } else {
        messageP.textContent = 'All lines have been read.';
        saveState();
    }
    updateProgress();
}

function speak(text, callback) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = language === 'chinese' ? 'zh-CN' : 'en-US';
    if (callback) {
        msg.onend = callback;
    }
    window.speechSynthesis.speak(msg);
}

function onSpacePress(event) {
    if (event.code === 'Space') {
        document.removeEventListener('keydown', onSpacePress);
        currentLineIndex++;
        readLine();
    }
}

function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
}

function updateProgress() {
    if (lines.length > 0) {
        const progressPercentage = ((currentLineIndex + 1) / lines.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
    } else {
        progressBar.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', '0');
    }
}

function saveState() {
    localStorage.setItem('currentLineIndex', currentLineIndex);
    localStorage.setItem('lines', JSON.stringify(lines));
}

function loadState() {
    const savedIndex = localStorage.getItem('currentLineIndex');
    const savedLines = localStorage.getItem('lines');
    if (savedIndex !== null && savedLines !== null) {
        currentLineIndex = parseInt(savedIndex);
        lines = JSON.parse(savedLines);
        fileListDiv.style.display = 'none';
        readerDiv.style.display = 'block';
        readLine();
    }
}

loadState();