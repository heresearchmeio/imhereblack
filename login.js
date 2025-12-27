// login.js

const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력

// login.js

// 기존 googleLogin() 함수 대신 수동으로 호출하고 싶을 때 사용
function initGoogleLogin() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: "YOUR_CLIENT_ID.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            ux_mode: "popup",
            // FedCM 에러 방지를 위한 추가 설정
            itp_support: true 
        });
    }
}

// 구글 인증 후 실행될 콜백 함수
async function handleCredentialResponse(response) {
    try {
        const payload = parseJwt(response.credential);
        console.log("인증 성공:", payload.email);
        
        const userEmail = payload.email;
        if (!userEmail.endsWith('@gmail.com')) {
            alert("Gmail 계정만 이용 가능합니다.");
            return;
        }

        localStorage.setItem('imhere_user_email', userEmail);
        
        // 회원 여부 확인 로직 실행 (Code.gs 연동)
        const isRegistered = await checkMemberFromGAS(userEmail);
        
        if (isRegistered) {
            const target = localStorage.getItem('redirect_tab') || 'home';
            showTab(target);
        } else {
            alert("신규 기사님입니다. 등록 페이지로 이동합니다.");
            showTab('register');
        }
    } catch (error) {
        console.error("토큰 처리 중 에러:", error);
    }
}

// JWT 토큰 파싱 함수
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// 백엔드 연동용 함수 (임시 스텁)
async function checkMemberFromGAS(email) {
    // 나중에 google.script.run 등을 사용하여 Code.gs 호출
    // 현재는 테스트를 위해 무조건 false(신규) 반환
    return false; 
}

// index.js (기존 showTab 함수 보완)
function showTab(tabId) {
    // 1. 로그인이 필요 없는 메뉴 정의
    const publicTabs = ['home', 'notice', 'about', 'login'];
    
    // 2. 로그인 여부 확인
    const userEmail = localStorage.getItem('imhere_user_email');

    // 3. 권한 체크
    if (!publicTabs.includes(tabId) && !userEmail) {
        alert("이 메뉴는 로그인이 필요합니다.");
        // 원래 가려던 목적지를 저장해둠 (로그인 후 돌아오기 위함)
        localStorage.setItem('redirect_tab', tabId);
        tabId = 'login'; // 로그인 페이지로 강제 변경
    }

    // 4. 탭 활성화 로직 (기존 유지)
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    loadTabData(tabId); // 외부 HTML 로드 함수 호출
    document.getElementById(tabId).classList.add('active');
    window.scrollTo(0, 0);
}

// login.js 내 수정 부분

// 💡 배포 후 받은 웹 앱 URL을 입력하세요.
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbzKWJckg7zHVqBLkyz4lRT9oYH5pXZo9FnStDXkrtKvgX3FK2d13hKq8seqciWXdYGR/exec"; 

async function checkMemberFromGAS(email) {
    try {
        const response = await fetch(`${MEMBER_CHECK_URL}?action=checkMember&email=${encodeURIComponent(email)}`);
        const result = await response.json();
        
        return result.isRegistered; // true 또는 false 반환
    } catch (e) {
        console.error("GAS 연동 에러:", e);
        return false;
    }
}

// Google 로그인 콜백 처리 보완
async function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    const userEmail = payload.email;

    if (!userEmail.endsWith('@gmail.com')) {
        alert("기사 로그인은 Gmail 계정으로만 가능합니다.");
        return;
    }

    localStorage.setItem('imhere_user_email', userEmail);

    // 💡 서버에 회원 확인 요청
    const isRegistered = await checkMemberFromGAS(userEmail);

    if (isRegistered) {
        // 이미 등록된 회원이면 원래 목적지로 이동
        const targetTab = localStorage.getItem('redirect_tab') || 'home';
        localStorage.removeItem('redirect_tab');
        showTab(targetTab);
    } else {
        // 미등록 회원이면 기사등록 탭으로 이동
        alert("회원 정보가 없습니다. 기사 등록을 진행해 주세요.");
        showTab('register');
    }
}
