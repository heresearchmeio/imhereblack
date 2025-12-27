// login.js

const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbzKWJckg7zHVqBLkyz4lRT9oYH5pXZo9FnStDXkrtKvgX3FK2d13hKq8seqciWXdYGR/exec"; 

/**
 * 구글 인증 성공 시 호출되는 콜백 함수
 */
async function handleCredentialResponse(response) {
    try {
        const payload = parseJwt(response.credential);
        const userEmail = payload.email;

        // 1. Gmail 체크
        if (!userEmail.endsWith('@gmail.com')) {
            alert("기사 로그인은 Gmail 계정으로만 가능합니다.");
            return;
        }

        // 2. 로컬 스토리지 저장
        localStorage.setItem('imhere_user_email', userEmail);

        // 3. GAS 백엔드 회원 확인
        const isRegistered = await checkMemberFromGAS(userEmail);

        if (isRegistered) {
            // 등록회원: 원래 가려던 메뉴 또는 홈으로
            const targetTab = localStorage.getItem('redirect_tab') || 'home';
            localStorage.removeItem('redirect_tab');
            showTab(targetTab);
        } else {
            // 미등록회원: 기사등록 유도
            alert("등록된 회원 정보가 없습니다. 기사 등록 페이지로 이동합니다.");
            showTab('register');
        }
    } catch (error) {
        console.error("인증 처리 중 오류:", error);
    }
}

/**
 * GAS 서버 통신: 회원 여부 확인
 */
async function checkMemberFromGAS(email) {
    try {
        const url = `${MEMBER_CHECK_URL}?action=checkMember&email=${encodeURIComponent(email)}`;
        const response = await fetch(url);
        const result = await response.json();
        return result.isRegistered; 
    } catch (e) {
        console.error("GAS 연동 에러:", e);
        return false;
    }
}

/**
 * JWT 토큰 디코딩 (구글 사용자 정보 추출)
 */
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
