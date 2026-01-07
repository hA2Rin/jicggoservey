/**
 * 직구 설문조사 최종 JavaScript 통합본
 */

const eventForm = document.getElementById('eventForm');
const submitBtn = document.getElementById('submitBtn');

/**
 * [1] 페이지 전환 로직
 */

// 1페이지 -> 2페이지 이동 (이름, 성별 필수 체크)
function goToNext() {
    const name = document.getElementById('userName').value.trim();
    const gender = document.querySelector('input[name="userGender"]:checked');
    
    document.getElementById('nameError').innerText = "";
    document.getElementById('genderError').innerText = "";

    let valid = true;
    if (!name) { 
        document.getElementById('nameError').innerText = "성함을 입력해 주세요."; 
        valid = false; 
    }
    if (!gender) { 
        document.getElementById('genderError').innerText = "성별을 선택해 주세요."; 
        valid = false; 
    }

    if (valid) {
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        window.scrollTo(0, 0); 
    }
}

// 2페이지 -> 1페이지 이동
function goToPrev() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    window.scrollTo(0, 0);
}


/**
 * [2] 실시간 글자수 및 클릭 감지 검증 (2페이지 주관식 전용)
 */

const textAreas = ['q1', 'q2', 'q4'];

textAreas.forEach(id => {
    const el = document.getElementById(id);
    const errorEl = document.getElementById(id + 'Error');

    const checkLength = () => {
        const len = el.value.trim().length;
        if (len < 10) {
            errorEl.innerText = "10자 이상 작성해야 합니다.";
            errorEl.style.color = "#ff4d4f";
        } else {
            errorEl.innerText = ""; 
        }
    };

    el.addEventListener('focus', checkLength);
    el.addEventListener('input', checkLength);
});


/**
 * [3] 데이터 최종 제출 로직
 */

eventForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const q1 = document.getElementById('q1').value.trim();
    const q2 = document.getElementById('q2').value.trim();
    const sat = document.querySelector('input[name="satisfaction"]:checked');
    const q4 = document.getElementById('q4').value.trim();

    let valid = true;

    if (q1.length < 10) { document.getElementById('q1Error').innerText = "10자 이상 작성해야 합니다."; valid = false; }
    if (q2.length < 10) { document.getElementById('q2Error').innerText = "10자 이상 작성해야 합니다."; valid = false; }
    if (!sat) { document.getElementById('satError').innerText = "점수를 선택해 주세요."; valid = false; }
    if (q4.length < 10) { document.getElementById('q4Error').innerText = "10자 이상 작성해야 합니다."; valid = false; }

    if (!valid) {
        alert("작성하지 않았거나 10자 미만인 항목이 있습니다.");
        return;
    }

    // 제출 버튼 로딩 효과 (· · ·)
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    // 데이터 정리 (직구 설문 데이터)
    const userData = {
        name: document.getElementById('userName').value.trim(),
        gender: document.querySelector('input[name="userGender"]:checked').value,
        impression: q1,
        history: q2,
        score: sat.value,
        message: q4,
        date: new Date().toLocaleString()
    };

    // [업데이트된 SheetDB API 주소]
    fetch('https://sheetdb.io/api/v1/2bbh5igzaamgn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [userData] })
    })
    .then(res => res.json())
    .then(data => {
        if (data.created === 1) {
            document.getElementById('formSection').style.display = 'none';
            document.getElementById('successSection').style.display = 'block';
            window.scrollTo(0, 0);
        } else {
            alert("제출에 실패했습니다. 다시 시도해 주세요.");
            resetButton();
        }
    })
    .catch(() => {
        alert("네트워크 오류가 발생했습니다.");
        resetButton();
    });
});

/**
 * [4] 기타 유틸리티 함수
 */

function resetButton() {
    submitBtn.innerHTML = "제출하기";
    submitBtn.disabled = false;
}

document.querySelectorAll('input[name="userGender"], input[name="satisfaction"]').forEach(el => {
    el.addEventListener('change', function() {
        const errorDiv = this.closest('.input-card').querySelector('.error-msg');
        if (errorDiv) errorDiv.innerText = "";
    });

});
