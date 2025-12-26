window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

    const urlParams = new URLSearchParams(window.location.search);
    
    // 1. [수정] 이제 applyId 대신 date와 start를 가져옵니다.
    const eventDate = urlParams.get('date');  // 예: 2025-12-26
    const startTime = urlParams.get('start'); // 예: 14:30
    
    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status');

    // 2. 로그인 여부 확인
    if (!savedEmail) {
        alert("이메일 인증이 필요합니다. 메인 페이지에서 로그인을 먼저 해주세요.");
        window.close();
        return;
    }

    // 3. [수정] 날짜와 시간 정보가 있는지 확인
    if (!eventDate || !startTime) {
        alert("잘못된 접근입니다. 배차 정보(날짜/시간)가 누락되었습니다.");
        window.close();
        return;
    }

    // 4. 신청 확인창 (기사님께 날짜와 시간을 다시 확인시켜줌)
    if (confirm(`일시: ${eventDate} [${startTime}]\n해당 배차 일정을 신청하시겠습니까?`)) {
        try {
            if(statusEl) statusEl.innerText = "서버에 배정 요청 중입니다...";
            
            // 5. [수정] 서버로 보내는 URL 파라미터 변경
            // apply=ID 대신 date=...&start=... 형태로 보냅니다.
            const url = `${GAS_WEB_APP_URL}?date=${eventDate}&start=${startTime}&email=${encodeURIComponent(savedEmail)}`;
            
            const response = await fetch(url, {
                method: "GET",
                mode: "cors",
                redirect: "follow"
            });

            // 응답 데이터 처리
            const result = await response.json();
            console.log("서버 응답 결과:", result);

            if (result && result.message) {
                alert(result.message);
            } else {
                alert("처리 결과를 확인했지만 서버 응답이 올바르지 않습니다.");
            }

            // 성공 시 부모 창 새로고침 및 닫기
            if (result.success) {
                if (window.opener && !window.opener.closed) {
                    window.opener.location.reload(); 
                }
            }
            window.close();

        } catch (e) {
            console.error("상세 에러:", e);
            alert("신청 중 오류가 발생했습니다: " + e.message);
            window.close();
        }
    } else {
        window.close();
    }
});