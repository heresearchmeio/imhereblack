window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

// 1. 주소창(URL)에서 date와 title 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const eventDate = urlParams.get('date');   // 2025-12-26
    const eventTitle = urlParams.get('title'); // [배차] 서울-부산
    
    // 2. 내 브라우저(localStorage)에 저장된 기사님 이메일 꺼내기
    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status');

    // 3. 필수 정보가 없는 경우 차단
    if (!eventDate || !eventTitle) {
        alert("잘못된 접근입니다. 배차 정보(날짜/제목)가 누락되었습니다.");
        window.close();
        return;
    }

    if (!savedEmail) {
        alert("이메일 인증이 필요합니다. 메인 페이지에서 로그인을 먼저 해주세요.");
        window.close();
        return;
    }

    // 4. 기사님에게 최종 확인 후 서버로 데이터 전송
    if (confirm(`일시: ${eventDate}\n일정: ${eventTitle}\n\n이 배차를 신청하시겠습니까?`)) {
        try {
            if(statusEl) statusEl.innerText = "서버에 배정 신청 요청 중...";
            
            // 💡 날짜, 제목, 이메일을 쿼리 스트링으로 조합
            const finalUrl = `${GAS_WEB_APP_URL}?date=${eventDate}&title=${encodeURIComponent(eventTitle)}&email=${encodeURIComponent(savedEmail)}`;
            
            console.log("요청 URL:", finalUrl); // 디버깅용

            const response = await fetch(finalUrl, {
                method: "GET",
                mode: "cors",
                redirect: "follow"
            });

            const result = await response.json();

            // 5. 서버 응답 결과 알림
            alert(result.message);

            // 성공했다면 부모 창(메인 화면)을 새로고침하고 창 닫기
            if (result.success) {
                if (window.opener && !window.opener.closed) {
                    window.opener.location.reload(); 
                }
            }
            window.close();

        } catch (e) {
            console.error("통신 에러:", e);
            alert("신청 중 오류가 발생했습니다: " + e.message);
            window.close();
        }
    } else {
        window.close();
    }
});