window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. [수정] 다시 apply(진짜 ID)를 가져오도록 변경
    const applyId = urlParams.get('apply'); 
    
    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status');

    // 2. 로그인 여부 확인
    if (!savedEmail) {
        alert("이메일 인증이 필요합니다. 메인 페이지에서 로그인을 먼저 해주세요.");
        window.close();
        return;
    }

    // 3. [중요] applyId가 있는지 확인 (이 부분이 에러의 원인이었습니다)
    if (!applyId) {
        alert("잘못된 접근입니다. 배차 정보(ID)가 주소창에 존재하지 않습니다.");
        window.close();
        return;
    }

    if (confirm("해당 배차 일정을 신청하시겠습니까?")) {
        try {
            if(statusEl) statusEl.innerText = "서버에 배정 요청 중입니다...";
            
            // 4. [수정] 서버로 보낼 때 apply 파라미터에 ID를 실어 보냄
            const url = `${GAS_WEB_APP_URL}?apply=${encodeURIComponent(applyId)}&email=${encodeURIComponent(savedEmail)}`;
            
            const response = await fetch(url, { redirect: "follow" });
            const result = await response.json();

            alert(result.message);

            if (result.success && window.opener) {
                window.opener.location.reload(); 
            }
            window.close();

        } catch (e) {
            alert("오류 발생: " + e.message);
            window.close();
        }
    } else {
        window.close();
    }
});