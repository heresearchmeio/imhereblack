// login.js

const GOOGLE_CLIENT_ID = "1016049886108-ttqmojmq4u9b8uiee951d2db08er1fpc.apps.googleusercontent.com"; // 여기에 복사한 ID 입력
const MEMBER_CHECK_URL = "https://script.google.com/macros/s/AKfycbzKWJckg7zHVqBLkyz4lRT9oYH5pXZo9FnStDXkrtKvgX3FK2d13hKq8seqciWXdYGR/exec"; 

// login.js

// login.js

async function loginWithSNS(platform) {
    console.log(`${platform} 인증 시작...`);
    
    // [참고] 실제 구현 시에는 Firebase Auth 또는 각 SNS SDK 호출
    // 여기서는 인증 결과로 이메일을 성공적으로 받아왔다고 가정합니다.
    try {
        // 임시 테스트용 데이터 (실제 연동 시 SNS에서 받아온 이메일로 대체)
        const mockResponse = {
            email: "driver@gmail.com", 
            isNewUser: false // DB 조회 결과에 따라 결정될 값
        };

        // 1. LocalStorage에 이메일 저장
        localStorage.setItem('imhere_user_email', mockResponse.email);

        // 2. 가입 여부 확인 (나중에 Code.gs와 연동)
        // const checkResult = await checkMemberStatus(mockResponse.email);
        
        if (mockResponse.isNewUser) {
            alert("신규 기사님입니다. 기사 등록 페이지로 이동합니다.");
            showTab('register');
        } else {
            // 3. 원래 보려던 페이지로 이동
            const targetTab = localStorage.getItem('redirect_tab') || 'home';
            localStorage.removeItem('redirect_tab'); // 사용 후 삭제
            showTab(targetTab);
        }
    } catch (error) {
        console.error("인증 실패:", error);
        alert("인증에 실패했습니다.");
    }
}

function googleLogin() {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse // 인증 후 실행될 함수
    });
    
    // Google 로그인 팝업 표시
    google.accounts.id.prompt(); 
    
    // 또는 버튼을 직접 렌더링하고 싶다면 특정 div에 그릴 수 있습니다.
    // google.accounts.id.renderButton(document.getElementById("googleBtn"), { size: "large" });
}

// Google에서 인증 정보를 받았을 때 실행되는 콜백
async function handleCredentialResponse(response) {
    // 1. JWT 토큰 해독 (간단한 디코딩을 위해 payload 추출)
    const responsePayload = parseJwt(response.credential);
    
    console.log("ID: " + responsePayload.sub);
    console.log('Email: ' + responsePayload.email);
    
    const userEmail = responsePayload.email;

    // 2. Gmail 여부 확인 (기사님 등록 조건)
    if (!userEmail.endsWith('@gmail.com')) {
        alert("기사 등록 및 로그인은 Gmail 계정으로만 가능합니다.");
        return;
    }

    // 3. LocalStorage 저장
    localStorage.setItem('imhere_user_email', userEmail);

    // 4. 백엔드(GAS)에 회원 여부 확인 요청
    // 이 단계는 나중에 Code.gs API를 만든 후 연결합니다.
    try {
        const isRegistered = await checkMemberFromGAS(userEmail);
        
        if (isRegistered) {
            // 등록된 회원이면 원래 가려던 페이지로
            const targetTab = localStorage.getItem('redirect_tab') || 'home';
            localStorage.removeItem('redirect_tab');
            showTab(targetTab);
        } else {
            // 미등록 회원이면 기사등록 화면으로
            alert("신규 기사님입니다. 기사 등록 페이지로 이동합니다.");
            showTab('register');
        }
    } catch (error) {
        console.error("회원 조회 실패:", error);
        // DB 연동 전까지는 테스트를 위해 신규 회원으로 취급
        showTab('register');
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
