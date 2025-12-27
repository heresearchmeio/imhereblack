// login.js

const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbzKWJckg7zHVqBLkyz4lRT9oYH5pXZo9FnStDXkrtKvgX3FK2d13hKq8seqciWXdYGR/exec"; 

// [수정사항 1] 페이지가 로드될 때 '딱 한 번만' 구글 설정을 초기화합니다.
window.onload = function() {
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: true // 최신 브라우저 정책 대응 (에러 방지)
        });
        console.log("Google SDK 초기화 완료");
    }
};

function loginWithSNS(platform) {
    if (platform === 'google') {
        googleLogin();
    } else {
        alert(`${platform} 인증은 준비 중입니다.`);
    }
}

// [수정사항 2] googleLogin은 이제 초기화가 아니라 '창 띄우기'만 담당합니다.
function googleLogin() {
    try {
        // 이미 팝업이 작동 중인지 체크하며 실행
        google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.warn("팝업이 뜨지 않음:", reason);
                
                // 만약 이미 떠 있어서 안 뜨는 거라면 경고만 하고 종료
                if (reason === 'skipped_by_moment') return;

                // 그 외 이유(로그인 안됨 등)라면 버튼 방식으로라도 유도해야 할 수 있음
                alert("구글 로그인창을 띄울 수 없습니다. 다시 시도하거나 구글 로그인을 확인해주세요.");
            }
        });
    } catch (e) {
        console.error("구글 로그인 실행 중 오류:", e);
    }
}

// Google에서 인증 정보를 받았을 때 실행되는 콜백 (로직 동일)
async function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    const userEmail = responsePayload.email;

    if (!userEmail.endsWith('@gmail.com')) {
        alert("기사 등록 및 로그인은 Gmail 계정으로만 가능합니다.");
        return;
    }

    localStorage.setItem('imhere_user_email', userEmail);

    try {
        const isRegistered = await checkMemberFromGAS(userEmail);
        
        if (isRegistered) {
            const targetTab = localStorage.getItem('redirect_tab') || 'home';
            localStorage.removeItem('redirect_tab');
            showTab(targetTab);
        } else {
            alert("신규 기사님입니다. 기사 등록 페이지로 이동합니다.");
            showTab('register');
        }
    } catch (error) {
        console.error("회원 조회 실패:", error);
        showTab('register');
    }
}

// JWT 토큰 파싱 함수 (동일)
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// 백엔드 연동용 함수 (동일)
async function checkMemberFromGAS(email) {
    return false; 
}
