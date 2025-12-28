// const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbwOpBdwwVHXQvedfBsOZ2HL5t8n2V9ak6bzE6xjudnGyDp31xTC3YZLPgmBBF01a8o4/exec";
const KAKAO_JS_KEY = "2c0d47df13750dfe8eecba153220473e"; // 복사한 키 입력
const GAS_URL = MEMBER_CHECK_URL;

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

// 초기화 확인
if (!Kakao.isInitialized()) {
    Kakao.init(KAKAO_JS_KEY);
}

async function checkRegistration(userEmail) {
    try {
        // GAS_URL은 새 배포에서 받은 최신 URL이어야 합니다.
        const response = await fetch(`${GAS_URL}?email=${encodeURIComponent(userEmail)}`, {
            method: 'GET',
            mode: 'cors', // 반드시 cors 모드
            redirect: 'follow' // GAS의 리다이렉트 처리에 필수
        });

        if (!response.ok) throw new Error('네트워크 응답에 문제가 있습니다.');

        const data = await response.json(); // 이제 정상적으로 JSON을 읽습니다.
        return data.isRegistered;
    } catch (error) {
        console.error("회원 확인 중 에러:", error);
        return false;
    }
}

function loginWithKakao() {
    Kakao.Auth.login({
        success: function(authObj) {
            Kakao.API.request({
                url: '/v2/user/me',
                success: async function(res) {
                    const userEmail = res.kakao_account.email;
                    
                    if (!userEmail) {
                        alert("이메일 동의가 필요합니다. 설정에서 이메일 제공을 승인해주세요.");
                        return;
                    }

                    localStorage.setItem('imhere_user_email', userEmail);

                    // --- 수정된 회원 확인 로직 ---
                    const isRegistered = await checkMemberFromGAS(userEmail);

                    if (isRegistered) {
                        const target = localStorage.getItem('redirect_tab') || 'home';
                        localStorage.removeItem('redirect_tab');
                        showTab(target);
                    } else {
                        showTab('register'); // 등록 탭으로 강제 이동// 구글 폼에 이메일 자동 입력되도록 URL 설정
                    }
                    // ----------------------------
                },
                fail: function(error) {
                    console.error("사용자 정보 요청 실패:", error);
                }
            });
        },
        fail: function(err) {
            console.error("카카오 로그인 실패:", err);
            alert("카카오 로그인 중 오류가 발생했습니다.");
        },
    });
}

function checkMemberFromGAS(email) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Math.round(100000 * Math.random());
        
        // 1. 전역 범위에 콜백 함수 정의
        window[callbackName] = function(data) {
            delete window[callbackName]; // 사용 후 삭제
            document.body.removeChild(script); // 스크립트 태그 삭제
            resolve(data.isRegistered);
        };

        // 2. 스크립트 태그 생성 및 실행
        const script = document.createElement('script');
        script.src = `${GAS_URL}?email=${encodeURIComponent(email)}&callback=${callbackName}`;
        script.onerror = () => reject(new Error('GAS 통신 실패 (JSONP)'));
        document.body.appendChild(script);
    });
}


const GoogleAuthManager = {
    isInitialized: false,
    clientId: "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"
};

let isGoogleInitialized = false;


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


