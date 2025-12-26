window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyufrWlyL2dWbmJMDIS8f1y8HilPwTN3maiEU9nj8dqaXkHmcjqyT6mjUZZZY_gjTiYOA/exec";

   const urlParams = new URLSearchParams(window.location.search);
    
    // 1. 값 추출 및 Trim(공백 제거) 처리로 undefined/null 방지
    const rawDate = urlParams.get('date');
    const rawTitle = urlParams.get('title');
    
    const eventDate = rawDate ? rawDate.trim() : null;
    const eventTitle = rawTitle ? rawTitle.trim() : null;
    const savedEmail = localStorage.getItem('imhere_user_email');
    const statusEl = document.getElementById('status');

    // 디버깅: 값이 제대로 들어왔는지 콘솔에서 확인 가능
    console.log("파라미터 체크:", { eventDate, eventTitle, savedEmail });

    // 2. 필수 정보 검증 로직 강화
    if (!eventDate || !eventTitle || eventDate === "undefined" || eventTitle === "undefined") {
        alert("배차 정보가 올바르지 않거나 누락되었습니다.\n(날짜: " + eventDate + ", 제목: " + eventTitle + ")");
        window.close();
        return;
    }

    if (!savedEmail) {
        alert("이메일 인증 정보가 없습니다. 로그인 후 다시 시도해주세요.");
        window.close();
        return;
    }

    // 3. 신청 확인 창
    if (confirm(`📅 일시: ${eventDate}\n📋 일정: ${eventTitle}\n\n위 배차를 신청하시겠습니까?`)) {
        try {
            if(statusEl) statusEl.innerText = "서버에 배정 신청을 보내는 중입니다...";
            
            // 4. URL 조립 시 모든 파라미터를 encodeURIComponent로 감싸서 특수문자 오류 방지
            const queryParams = new URLSearchParams({
                date: eventDate,
                title: eventTitle,
                email: savedEmail
            }).toString();

            const finalUrl = `${GAS_WEB_APP_URL}?${queryParams}`;
            console.log("최종 요청 URL:", finalUrl);

            const response = await fetch(finalUrl, {
                method: "GET",
                mode: "cors",
                redirect: "follow"
            });

            // 5. 서버 응답 처리 (에러 핸들링 보완)
            if (!response.ok) throw new Error("네트워크 응답이 좋지 않습니다.");
            
            const result = await response.json();
            console.log("서버 응답 결과:", result);

            if (result.success) {
                alert(result.message || "신청이 완료되었습니다.");
                if (window.opener && !window.opener.closed) {
                    window.opener.location.reload(); 
                }
            } else {
                // 서버에서 success: false를 보낸 경우 (이미 마감 등)
                alert("신청 실패: " + (result.message || "알 수 없는 오류"));
            }
            window.close();

        } catch (e) {
            console.error("통신 에러 상세:", e);
            alert("서버 통신 중 오류가 발생했습니다.\n관리자에게 문의하세요. (오류내용: " + e.message + ")");
            window.close();
        }
    } else {
        window.close();
    }
});