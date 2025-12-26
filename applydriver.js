window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

    const urlParams = new URLSearchParams(window.location.search);
    const eventDate = urlParams.get('date');
    const eventTitle = urlParams.get('title');
    const savedEmail = localStorage.getItem('imhere_user_email');


    if (!savedEmail || savedEmail === "undefined") {
        // 💡 해결책: 이메일이 없으면 사용자에게 직접 물어봅니다 (임시 방편)
        const backupEmail = prompt("로그인 정보가 유실되었습니다. 인증받은 이메일을 입력해주세요.");
        if (backupEmail) {
            localStorage.setItem('imhere_user_email', backupEmail);
            location.reload(); // 이메일 저장 후 새로고침
            return;
        } else {
            alert("이메일 정보 없이는 신청이 불가능합니다.");
            window.close();
            return;
        }
    }

    if (!eventDate || !eventTitle || !savedEmail) {
        alert("필수 정보가 누락되었습니다. 다시 시도해주세요.");
        return;
    }

    if (confirm(`[${eventTitle}] 신청하시겠습니까?`)) {
        try {
            // 💡 보내는 쪽 핵심 보완: URL 조립 방식 변경
            const params = new URLSearchParams();
            params.append('date', eventDate);
            params.append('title', eventTitle);
            params.append('email', savedEmail);

            const finalUrl = `${GAS_WEB_APP_URL}?${params.toString()}`;
            console.log("보내는 최종 URL:", finalUrl);

            // 💡 GET 요청은 body 없이 URL 뒤에 파라미터를 붙여 보냅니다.
            const response = await fetch(finalUrl, {
                method: "GET",
                mode: "cors" // CORS 정책 허용
            });

            // 구글 스크립트는 보안상 리다이렉트가 발생하므로 텍스트로 먼저 받아봅니다.
            const text = await response.text();
            console.log("서버 원본 응답:", text);

            const result = JSON.parse(text);
            alert(result.message);

            if (result.success && window.opener) {
                window.opener.location.reload();
            }
            window.close();

        } catch (e) {
            console.error("통신 에러:", e);
            alert("서버와 통신할 수 없습니다. 배포 설정을 확인하세요.");
        }
    }
});