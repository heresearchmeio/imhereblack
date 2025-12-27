// login.js

const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbzKWJckg7zHVqBLkyz4lRT9oYH5pXZo9FnStDXkrtKvgX3FK2d13hKq8seqciWXdYGR/exec"; 

let isGoogleInitialized = false;

function loginWithSNS(platform) {
    if (platform === 'google') {
        googleLogin();
    } else {
        alert(`${platform} 인증은 준비 중입니다.`);
    }
}

function initializeGoogleSDK() {
    if (isGoogleInitialized) return; // 이미 초기화됐다면 중단

    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            use_fedcm_for_prompt: true,
            // 추가: 원치 않는 팝업 중단을 막기 위해 컨텍스트 지정 가능
            context: 'signin' 
        });
        isGoogleInitialized = true;
        console.log("Google SDK 초기화 성공");
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
// function googleLogin(event) {
//     // [중요] 클릭 이벤트가 상위로 퍼지는 것을 막아 중복 호출 방지
//     if (event && event.preventDefault) {
//         event.preventDefault();
//         event.stopPropagation();
//     }

//     // 혹시라도 초기화가 안 되어 있다면 다시 시도
//     if (!isGoogleInitialized) {
//         initializeGoogleSDK();
//     }

//     try {
//         google.accounts.id.prompt((notification) => {
//             if (notification.isNotDisplayed()) {
//                 const reason = notification.getNotDisplayedReason();
//                 console.warn("팝업 미표시 사유:", reason);
                
//                 // [해결책] 만약 FedCM이나 'skipped' 에러로 안 뜬다면, 
//                 // 강제로 구글 로그인 표준 버튼을 렌더링하거나 다른 방식으로 유도해야 합니다.
//                 if (reason === 'opt_out_or_no_session') {
//                     alert("구글 계정에 로그인되어 있지 않거나 세션이 만료되었습니다.");
//                 }
//             }
            
//             // AbortError가 발생하는 지점: 브라우저가 신호를 가로챌 때
//             if (notification.isSkippedMoment()) {
//                 console.log("프롬프트가 스킵됨 (신호 중단됨)");
//             }
//         });
//     } catch (e) {
//         console.error("구글 로그인 실행 중 오류:", e);
//     }
// }

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
