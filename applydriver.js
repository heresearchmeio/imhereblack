// script.js 에 추가하거나 applydriver.html 하단에 넣으세요.
window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const applyId = urlParams.get('apply');
    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status'); // 화면에 진행상황 표시용

    // 1. 로그인 여부 확인
    if (!savedEmail) {
        alert("이메일 인증이 필요합니다. 메인 페이지에서 로그인을 먼저 해주세요.");
        window.close();
        return;
    }

    // 2. 배차 ID 확인
    if (!applyId) {
        alert("잘못된 접근입니다. 배차 ID가 없습니다.");
        window.close();
        return;
    }

    if (confirm("해당 배차 일정을 신청하시겠습니까?")) {
        try {
            if(statusEl) statusEl.innerText = "서버에 신청 요청 중입니다...";
            
            // GAS API 호출
            const response = await fetch(`${GAS_WEB_APP_URL}?apply=${applyId}&email=${savedEmail}`);
            const result = await response.json();

            alert(result.message);

            // 3. 부모 창(메인화면) 새로고침 및 창 닫기
            if (window.opener) {
                window.opener.location.reload(); 
            }
            window.close();

        } catch (e) {
            alert("시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            window.close();
        }
    } else {
        window.close();
    }
});