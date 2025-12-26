window.addEventListener('load', async () => {
    const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzK0fdr7fLzO4iSCS9oMe5EcPcJLlWyLa6YqLV_Bt569rDfB-nWf2XY4asYUtxLLlDdMg/exec";

    const urlParams = new URLSearchParams(window.location.search);
    const eventDate = urlParams.get('date');
    const eventTitle = urlParams.get('title');
    const savedEmail = localStorage.getItem('imhere_user_email');

    if (!eventDate || !eventTitle || !savedEmail) {
        alert("신청 정보가 부족합니다.");
        window.close();
        return;
    }

    if (confirm(`[${eventTitle}] 배차를 신청하시겠습니까?`)) {
        // 💡 핵심: fetch를 쓰지 않고 서버 주소로 직접 이동합니다.
        // 이렇게 하면 브라우저가 구글 리다이렉트를 스스로 처리합니다.
        const finalUrl = `${GAS_WEB_APP_URL}?date=${encodeURIComponent(eventDate)}&title=${encodeURIComponent(eventTitle)}&email=${encodeURIComponent(savedEmail)}`;
        
        console.log("서버로 이동합니다:", finalUrl);
        location.href = finalUrl; 
    } else {
        window.close();
    }
});