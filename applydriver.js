window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

    const urlParams = new URLSearchParams(window.location.search);
    let applyId = urlParams.get('apply'); 

    // [핵심 보완] ID 뒤에 이메일이나 공백이 붙어 있어도 진짜 ID만 추출
    if (applyId) {
        applyId = applyId.split(' ')[0].trim(); 
    }
    
    const savedEmail = localStorage.getItem('imhere_user_email');

    // 1. 배차 ID 확인 (추출 후 한 번 더 체크)
    if (!applyId || applyId === "") {
        alert("잘못된 접근입니다. 배차 정보(ID)를 읽을 수 없습니다.");
        window.close();
        return;
    }

    if (!savedEmail) {
        alert("이메일 인증이 필요합니다.");
        window.close();
        return;
    }

    if (confirm("해당 배차 일정을 신청하시겠습니까?")) {
        try {
            const url = `${GAS_WEB_APP_URL}?apply=${encodeURIComponent(applyId)}&email=${encodeURIComponent(savedEmail)}`;
            const response = await fetch(url, { redirect: "follow" });
            const result = await response.json();

            alert(result.message);
            if (result.success && window.opener) window.opener.location.reload(); 
            window.close();
        } catch (e) {
            alert("오류 발생: " + e.message);
            window.close();
        }
    } else {
        window.close();
    }
});