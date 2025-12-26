window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

    const urlParams = new URLSearchParams(window.location.search);
    
    // [수정] 주소창의 ?apply= 뒤에 있는 ID를 가져옵니다.
    let applyId = urlParams.get('apply'); 

    // [보완] ID 뒤에 이메일이나 공백이 붙어 있어도 첫 번째 덩어리(진짜 ID)만 추출
    if (applyId) {
        applyId = applyId.split(' ')[0].trim(); 
    }
    
    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status');

    // 1. 배차 ID가 있는지 확인 (에러 발생 지점 해결)
    if (!applyId || applyId === "") {
        alert("잘못된 접근입니다. 배차 정보(ID)를 읽을 수 없습니다.");
        window.close();
        return;
    }

    // 2. 로그인 여부 확인
    if (!savedEmail) {
        alert("이메일 인증이 필요합니다. 메인 페이지에서 먼저 로그인해 주세요.");
        window.close();
        return;
    }

    if (confirm("해당 배차 일정을 신청하시겠습니까?")) {
        try {
            if(statusEl) statusEl.innerText = "서버에 신청 요청 중입니다...";
            
            // [수정] 서버로 보낼 때 apply 파라미터에 추출한 ID를 넣습니다.
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