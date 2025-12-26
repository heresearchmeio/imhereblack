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
            if(statusEl) statusEl.innerText = "서버에 배정 신청을 처리 중입니다. 잠시만 기다려주세요...";
            
            // [보완] fetch 옵션에 redirect: "follow"를 명시하여 GAS의 리다이렉트 응답을 정상 수신함
            const url = `${GAS_WEB_APP_URL}?apply=${encodeURIComponent(applyId)}&email=${encodeURIComponent(savedEmail)}`;
            
            const response = await fetch(url, {
                method: "GET",
                mode: "cors",
                redirect: "follow" 
            });

            const text = await response.text(); // 일단 텍스트로 받아서 내용을 확인
            console.log("서버 응답 원본:", text); // 개발자 도구(F12) 콘솔에서 확인 가능
            try {
                const result = JSON.parse(text);
                alert(result.message || "결과 메시지가 없습니다."); 
            } catch (e) {
                alert("서버 응답을 해석할 수 없습니다: " + text);
            }

            if (!response.ok) throw new Error('네트워크 응답 에러');

            const result = await response.json();
            alert(result.message);

            // 3. 부모 창(메인화면) 새로고침 및 창 닫기
            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.location.reload(); 
                } catch(e) { console.log("부모창 새로고침 실패"); }
            }
            window.close();

        } catch (e) {
            console.error("Error details:", e);
            alert("신청 중 오류가 발생했습니다: " + e.message);
            window.close();
        }
    } else {
        window.close();
    }
});