// المتغيرات
let currentColor = '';
const statusText = document.getElementById('statusText');
const timerBar = document.getElementById('timerBar');
const timerProgress = document.getElementById('timerProgress');
const letters = document.querySelectorAll('.hex.letter');
let highlightedLetter = null;
let randomTimer = null;

// أزرار الألوان
const greenBtn = document.getElementById('greenBtn');
const redBtn = document.getElementById('redBtn');
const creamBtn = document.getElementById('creamBtn');
const resetBtn = document.getElementById('resetBtn');
const randomBtn = document.getElementById('randomBtn');

// تحديد اللون الأخضر
greenBtn.addEventListener('click', function() {
    currentColor = 'selected-green';
    statusText.textContent = 'تم اختيار اللون الأخضر - انقر على الخلايا لتلوينها';
    statusText.style.color = '#7fbf7f';
    statusText.style.borderRight = '4px solid #7fbf7f';
    timerBar.style.display = 'none';
    clearRandomHighlight();
});

// تحديد اللون الأحمر
redBtn.addEventListener('click', function() {
    currentColor = 'selected-red';
    statusText.textContent = 'تم اختيار اللون الأحمر - انقر على الخلايا لتلوينها';
    statusText.style.color = '#ff4d4d';
    statusText.style.borderRight = '4px solid #ff4d4d';
    timerBar.style.display = 'none';
    clearRandomHighlight();
});

// تحديد اللون الأصلي
creamBtn.addEventListener('click', function() {
    currentColor = 'cream';
    statusText.textContent = 'تم اختيار اللون الأصلي - انقر على الخلايا لتلوينها';
    statusText.style.color = '#333';
    statusText.style.borderRight = '4px solid #fffce0';
    timerBar.style.display = 'none';
    clearRandomHighlight();
});

// زر مسح الألوان
resetBtn.addEventListener('click', function() {
    letters.forEach(letter => {
        letter.classList.remove('selected-green', 'selected-red', 'purple');
        letter.classList.add('cream');
    });
    statusText.textContent = 'تم مسح جميع الألوان';
    statusText.style.color = '#333';
    statusText.style.borderRight = '4px solid #dddddd';
    timerBar.style.display = 'none';
    clearRandomHighlight();
});

// إزالة تمييز الحرف العشوائي
function clearRandomHighlight() {
    if (randomTimer) {
        clearTimeout(randomTimer);
        randomTimer = null;
    }
    
    if (highlightedLetter) {
        highlightedLetter.classList.remove('highlight', 'purple');
        if (!highlightedLetter.classList.contains('selected-green') && 
            !highlightedLetter.classList.contains('selected-red')) {
            highlightedLetter.classList.add('cream');
        }
        highlightedLetter = null;
    }
}

// زر اختيار حرف عشوائي
randomBtn.addEventListener('click', function() {
    // إزالة التمييز السابق
    clearRandomHighlight();
    
    // اختيار حرف عشوائي
    const randomIndex = Math.floor(Math.random() * letters.length);
    highlightedLetter = letters[randomIndex];
    
    // إضافة تأثير التمييز واللون البنفسجي
    highlightedLetter.classList.remove('cream', 'selected-green', 'selected-red');
    highlightedLetter.classList.add('highlight', 'purple');
    
    // تحديث نص الحالة
    const selectedLetter = highlightedLetter.textContent;
    statusText.textContent = `تم اختيار الحرف "${selectedLetter}" عشوائياً`;
    statusText.style.color = '#9370DB';
    statusText.style.borderRight = '4px solid #9370DB';
    
    // إظهار شريط الوقت
    timerBar.style.display = 'block';
    timerProgress.style.transform = 'scaleX(1)';
    
    // بعد 10 مللي ثانية نبدأ تحريك شريط التقدم
    setTimeout(() => {
        timerProgress.style.transform = 'scaleX(0)';
    }, 10);
    
    // إزالة التمييز بعد 3 ثواني
    randomTimer = setTimeout(() => {
        if (highlightedLetter) {
            highlightedLetter.classList.remove('highlight', 'purple');
            if (!highlightedLetter.classList.contains('selected-green') && 
                !highlightedLetter.classList.contains('selected-red')) {
                highlightedLetter.classList.add('cream');
            }
            highlightedLetter = null;
            
            // تحديث نص الحالة
            statusText.textContent = 'اختر لوناً ثم انقر على الخلايا لتغيير لونها';
            statusText.style.color = '#333';
            statusText.style.borderRight = '4px solid #9370DB';
            timerBar.style.display = 'none';
        }
    }, 3000);
});

// تفاعل النقر على الخلايا
letters.forEach(letter => {
    letter.addEventListener('click', function() {
        if (currentColor) {
            this.classList.remove('cream', 'selected-green', 'selected-red', 'purple', 'highlight');
            this.classList.add(currentColor);
            
            // إذا كان هذا هو الحرف المميز، نلغي التمييز
            if (this === highlightedLetter) {
                clearRandomHighlight();
            }
        }
    });
});
