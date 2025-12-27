const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbzKWJckg7zHVqBLkyz4lRT9oYH5pXZo9FnStDXkrtKvgX3FK2d13hKq8seqciWXdYGR/exec"; 
const KAKAO_JS_KEY = "2c0d47df13750dfe8eecba153220473e"; // 복사한 키 입력

const GoogleAuthManager = {
    isInitialized: false,
    clientId: "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"
};

let isGoogleInitialized = false;

function loginWithSNS(platform) {
    if (platform === 'google') {
        googleLogin();
    } 
    else if(platform == 'kakao'){
        loginWithKakao();
    } else {
        alert(`${platform} 인증은 준비 중입니다.`);
    }
}

function initializeGoogleSDK() {
    if (GoogleAuthManager.isInitialized) return;

    // window.google 존재 여부 확인 (SDK 로드 확인)
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: GoogleAuthManager.clientId,
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: true,
            context: 'signin'
        });
        GoogleAuthManager.isInitialized = true;
        console.log("✅ Google SDK 초기화 완료");
    } else {
        // SDK가 아직 안 불려왔다면 0.5초 뒤 재시도
        setTimeout(initializeGoogleSDK, 500);
    }
}

// 페이지 로드 즉시 시도하고, 만약 SDK 로드가 늦어질 경우를 대비해 인터벌 체크
window.addEventListener('load', initializeGoogleSDK);
// 2. 로그인 실행 (사용자 클릭 이벤트 핸들러)
function googleLogin(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!GoogleAuthManager.isInitialized) {
        console.warn("SDK 초기화 중입니다. 잠시 후 다시 시도해주세요.");
        initializeGoogleSDK();
        return;
    }

    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.warn("⚠️ 팝업 미표시 사유:", reason);
            
            // 핵심: 원탭(Prompt)이 거부된 경우, '표준 버튼'을 띄우는 것이 가장 안전합니다.
            if (reason === 'skipped_by_user' || reason === 'opt_out_or_no_session') {
                alert("구글 로그인을 위해 브라우저의 구글 세션을 확인하거나, 페이지 내 로그인 버튼을 직접 클릭해 주세요.");
                // 여기에 google.accounts.id.renderButton()을 호출하는 로직을 추가하면 좋습니다.
            }
        }
    });
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


// 카카오 SDK 초기화
if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_JS_KEY);
}

/**
 * 카카오 로그인 실행
 */
function loginWithKakao() {
    // 1. 초기화 재확인
    if (!Kakao.isInitialized()) {
        Kakao.init(KAKAO_JS_KEY);
    }

    // 2. v2 방식: 팝업 로그인 호출
    Kakao.Auth.loginWithPopup({
        success: function(authObj) {
            console.log("카카오 인증 성공 토큰:", authObj);
            
            // 3. 사용자 정보 요청
             Kakao.API.request({
                url: '/v2/user/me',
                success: async function(res) {
                    const userEmail = res.kakao_account.email;
                    
                    if (!userEmail) {
                        alert("이메일 정보 제공 동의가 필요합니다.");
                        return;
                    }

                    console.log("이메일 추출 완료:", userEmail);
                    localStorage.setItem('imhere_user_email', userEmail);

                    // 4. GAS 회원 여부 확인 및 리다이렉션
                    const isRegistered = await checkMemberFromGAS(userEmail);
                    if (isRegistered) {
                        const target = localStorage.getItem('redirect_tab') || 'home';
                        localStorage.removeItem('redirect_tab');
                        showTab(target);
                    } else {
                        alert("신규 기사님입니다. 등록 페이지로 이동합니다. (Gmail 필수)");
                        showTab('register');
                    }
                },
                fail: function(error) {
                    console.error("사용자 정보 요청 실패", error);
                }
            });
        },
        fail: function(err) {
            console.error("카카오 로그인 실패", err);
            alert("로그인에 실패했습니다.");
        }
    });
}
