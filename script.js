document.addEventListener('DOMContentLoaded', function() {
    // العناصر الرئيسية
    const hexCells = document.querySelectorAll('.hex');
    const letterCells = document.querySelectorAll('.hex.letter');
    const greenBtn = document.getElementById('greenBtn');
    const redBtn = document.getElementById('redBtn');
    const creamBtn = document.getElementById('creamBtn');
    const resetBtn = document.getElementById('resetBtn');
    const randomBtn = document.getElementById('randomBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const statusText = document.getElementById('statusText');
    const greenCount = document.getElementById('greenCount');
    const redCount = document.getElementById('redCount');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const themeToggle = document.getElementById('themeToggle');

    // متغيرات تتبع الحالة
    let currentColor = null;
    let greenCellsCount = 0;
    let redCellsCount = 0;
    let highlightedCell = null;
    let randomLetterTimeout = null;
    let currentAction = null; // لتتبع نوع الإجراء الحالي (مسح أو تبديل)
    let darkMode = localStorage.getItem('darkMode') === 'enabled';

    // تهيئة الوضع الليلي عند تحميل الصفحة
    if (darkMode) {
        document.body.classList.add('dark-mode');
        updateThemeToggleText();
    }

    // تهيئة العدادات
    updateCounters();

    // إضافة مستمعي الأحداث لأزرار الألوان
    greenBtn.addEventListener('click', function() {
        setCurrentColor('green');
        statusText.innerText = 'اختر الخلايا لتلوينها بالأخضر';
    });

    redBtn.addEventListener('click', function() {
        setCurrentColor('red');
        statusText.innerText = 'اختر الخلايا لتلوينها بالأحمر';
    });

    creamBtn.addEventListener('click', function() {
        setCurrentColor('cream');
        statusText.innerText = 'اختر الخلايا لإعادتها للون الأصلي';
    });

    resetBtn.addEventListener('click', function() {
        showConfirmDialog('reset');
    });

    randomBtn.addEventListener('click', function() {
        highlightRandomLetter();
        statusText.innerText = 'تم اختيار حرف عشوائي! سيختفي بعد 3 ثوان';
    });

    shuffleBtn.addEventListener('click', function() {
        showConfirmDialog('shuffle');
    });

    confirmYes.addEventListener('click', function() {
        hideConfirmDialog();
        if (currentAction === 'reset') {
            resetAllCells();
            statusText.innerText = 'تم مسح جميع الألوان!';
        } else if (currentAction === 'shuffle') {
            shuffleLetters();
            resetAllCells();
            statusText.innerText = 'تم تبديل الحروف بنجاح!';
        }
    });

    confirmNo.addEventListener('click', function() {
        hideConfirmDialog();
    });

    // إضافة مستمع الحدث لزر تبديل الوضع الليلي
    themeToggle.addEventListener('click', function() {
        toggleDarkMode();
    });

    // إضافة مستمعي الأحداث للخلايا
    hexCells.forEach(cell => {
        if (cell.classList.contains('letter') || cell.classList.contains('cream') || 
            cell.classList.contains('green') || cell.classList.contains('pink')) {
            cell.addEventListener('click', function() {
                if (currentColor) {
                    applyColorToCell(cell);
                } else {
                    statusText.innerText = 'الرجاء اختيار لون أولاً';
                }
            });
        }
    });

    // تعيين اللون الحالي
    function setCurrentColor(color) {
        currentColor = color;
        // إزالة الحدود من جميع الأزرار
        [greenBtn, redBtn, creamBtn].forEach(btn => {
            btn.style.boxShadow = 'var(--shadow-sm)';
            btn.style.transform = 'translateY(0px)';
        });
        
        // إضافة حدود للزر المحدد
        if (color === 'green') {
            greenBtn.style.boxShadow = '0 0 0 3px var(--primary-dark)';
            greenBtn.style.transform = 'translateY(-3px)';
        } else if (color === 'red') {
            redBtn.style.boxShadow = '0 0 0 3px var(--secondary-dark)';
            redBtn.style.transform = 'translateY(-3px)';
        } else if (color === 'cream') {
            creamBtn.style.boxShadow = '0 0 0 3px #e0e0e0';
            creamBtn.style.transform = 'translateY(-3px)';
        }
    }

    // تبديل الوضع الليلي
    function toggleDarkMode() {
        darkMode = !darkMode;
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', null);
        }
        
        updateThemeToggleText();
    }
    
    // تحديث نص زر تبديل الوضع
    function updateThemeToggleText() {
        if (darkMode) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>الوضع العادي</span>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>الوضع الليلي</span>';
        }
    }

    // تطبيق اللون على الخلية
    function applyColorToCell(cell) {
        // إذا كانت الخلية وردية أو خضراء ثابتة في الهيكل، لا تقم بأي تغيير
        if (cell.classList.contains('pink') && !cell.classList.contains('selected-green') && !cell.classList.contains('selected-red')) {
            return;
        }

        // حساب التغيير في العدادات قبل تغيير الألوان
        let oldGreen = cell.classList.contains('selected-green') ? 1 : 0;
        let oldRed = cell.classList.contains('selected-red') ? 1 : 0;
        let newGreen = currentColor === 'green' ? 1 : 0;
        let newRed = currentColor === 'red' ? 1 : 0;

        // إزالة جميع ألوان التحديد
        cell.classList.remove('selected-green', 'selected-red');

        // إضافة لون التحديد الجديد
        if (currentColor === 'green' && !cell.classList.contains('green')) {
            cell.classList.add('selected-green');
        } else if (currentColor === 'red' && !cell.classList.contains('pink')) {
            cell.classList.add('selected-red');
        }

        // تحديث العدادات
        greenCellsCount = greenCellsCount - oldGreen + newGreen;
        redCellsCount = redCellsCount - oldRed + newRed;
        updateCounters();
    }

    // تحديث عدادات الخلايا
    function updateCounters() {
        greenCount.innerText = greenCellsCount;
        redCount.innerText = redCellsCount;
    }

    // إعادة تعيين جميع الخلايا
    function resetAllCells() {
        hexCells.forEach(cell => {
            cell.classList.remove('selected-green', 'selected-red', 'highlight', 'purple');
        });

        // إعادة تعيين العدادات
        greenCellsCount = 0;
        redCellsCount = 0;
        updateCounters();

        // إزالة التظليل
        if (highlightedCell) {
            highlightedCell.classList.remove('highlight', 'purple');
            highlightedCell = null;
        }

        // إلغاء أي مؤقت حالي
        if (randomLetterTimeout) {
            clearTimeout(randomLetterTimeout);
            randomLetterTimeout = null;
        }
    }

    // تظليل حرف عشوائي
    function highlightRandomLetter() {
        // إلغاء أي مؤقت سابق
        if (randomLetterTimeout) {
            clearTimeout(randomLetterTimeout);
        }
        
        // إزالة التظليل السابق إذا وجد
        if (highlightedCell) {
            highlightedCell.classList.remove('highlight', 'purple');
        }

        // اختيار خلية حرف عشوائية
        const randomIndex = Math.floor(Math.random() * letterCells.length);
        highlightedCell = letterCells[randomIndex];
        
        // إضافة تأثير التظليل واللون البنفسجي
        highlightedCell.classList.add('highlight', 'purple');
        
        // تعيين مؤقت لإزالة التظليل بعد 3 ثوان
        randomLetterTimeout = setTimeout(function() {
            if (highlightedCell) {
                highlightedCell.classList.remove('highlight', 'purple');
                highlightedCell = null;
                statusText.innerText = 'اختر لوناً ثم انقر على الخلايا لتغيير لونها';
            }
            randomLetterTimeout = null;
        }, 3000);
    }

    // عرض مربع حوار التأكيد
    function showConfirmDialog(action) {
        currentAction = action;
        
        if (action === 'reset') {
            confirmTitle.innerText = 'تأكيد عملية المسح';
            confirmMessage.innerText = 'سيتم مسح جميع التقدم الحالي. هل أنت متأكد؟';
        } else if (action === 'shuffle') {
            confirmTitle.innerText = 'تأكيد العملية';
            confirmMessage.innerText = 'سيتم حذف جميع التقدم الحالي وتبديل الحروف. هل أنت متأكد؟';
        }
        
        confirmDialog.style.display = 'flex';
    }

    // إخفاء مربع حوار التأكيد
    function hideConfirmDialog() {
        confirmDialog.style.display = 'none';
    }

    // تبديل الحروف
    function shuffleLetters() {
        // الحصول على جميع الحروف الحالية
        const letters = [];
        letterCells.forEach(cell => {
            letters.push(cell.innerText);
        });

        // خلط الحروف
        shuffleArray(letters);

        // تطبيق الحروف المخلوطة
        letterCells.forEach((cell, index) => {
            // إضافة تأثير الحركة
            cell.classList.add('shuffling');
            
            // تأخير تغيير النص للحصول على تأثير بصري أفضل
            setTimeout(() => {
                cell.innerText = letters[index];
                
                // إزالة تأثير الحركة بعد انتهاء التبديل
                setTimeout(() => {
                    cell.classList.remove('shuffling');
                }, 500);
            }, 100);
        });
    }

    // دالة خلط المصفوفة (خوارزمية Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // إضافة دعم للأجهزة المحمولة (تعديل أحجام الخلايا حسب حجم الشاشة)
    function resizeHoneycomb() {
        const container = document.querySelector('.honeycomb-container');
        const windowWidth = window.innerWidth;
        
        // تعديل مركز الخلية ليكون في وسط الحاوية
        const honeycomb = document.querySelector('.honeycomb');
        
        if (windowWidth <= 400) {
            container.style.height = '340px';
            honeycomb.style.transform = 'scale(0.45)';
            honeycomb.style.transformOrigin = 'center center';
        } else if (windowWidth <= 500) {
            container.style.height = '380px';
            honeycomb.style.transform = 'scale(0.55)';
            honeycomb.style.transformOrigin = 'center center';
        } else if (windowWidth <= 700) {
            container.style.height = '420px';
            honeycomb.style.transform = 'scale(0.7)';
            honeycomb.style.transformOrigin = 'center center';
        } else {
            container.style.height = '540px';
            honeycomb.style.transform = 'scale(1)';
            honeycomb.style.transformOrigin = 'center center';
        }
    }

    // استدعاء دالة تغيير الحجم عند تحميل الصفحة
    resizeHoneycomb();
    
    // استدعاء دالة تغيير الحجم عند تغيير حجم النافذة
    window.addEventListener('resize', resizeHoneycomb);
});
