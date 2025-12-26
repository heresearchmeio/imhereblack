window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";
    
    const urlParams = new URLSearchParams(window.location.search);
    // [보완] 구글 캘린더 ID 뒤에 공백이나 이메일 주소가 붙어오는 경우를 대비해 첫 단어만 추출
    let applyId = urlParams.get('apply');
    if (applyId) applyId = applyId.split(' ')[0].trim(); 

    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status');

    // 1. 로그인 여부 확인
    if (!savedEmail) {
        alert("이메일 인증이 필요합니다. 메인 페이지에서 로그인을 먼저 해주세요.");
        window.close();
        return;
    }

    // 2. 배차 ID 확인
    if (!applyId) {
        alert("잘못된 접근입니다. 배차 ID가 존재하지 않습니다.");
        window.close();
        return;
    }

    // [보완] 버튼 중복 클릭 방지를 위해 즉시 실행 확인
    if (confirm("해당 배차 일정을 신청하시겠습니까?")) {
        try {
            if(statusEl) statusEl.innerText = "서버에 신청 요청 중입니다...";
            
            const url = `${GAS_WEB_APP_URL}?apply=${encodeURIComponent(applyId)}&email=${encodeURIComponent(savedEmail)}`;
            
            const response = await fetch(url, {
                method: "GET",
                mode: "cors",
                redirect: "follow"
            });

            // 중요: response.json()은 딱 한 번만 호출해야 합니다.
            const result = await response.json();
            console.log("서버 응답 결과:", result);

            if (result && result.message) {
                alert(result.message);
            } else {
                alert("처리 결과를 확인했지만 메시지가 비어있습니다.");
            }

            if (result && result.success) {
                if (window.opener && !window.opener.closed) {
                    window.opener.location.reload(); 
                }
                window.close();
            }

        } catch (e) {
            console.error("상세 에러:", e);
            alert("신청 중 오류가 발생했습니다: " + e.message);
        }
    }
    else {
        window.close();
    }
});