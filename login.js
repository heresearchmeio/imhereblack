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

