// 초기 로드 시 탭 내용 가져오기
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // 초기 탭 로드
    loadTabData('home');
});

// 외부 HTML 파일을 로드하여 특정 ID에 넣는 함수
async function loadTabData(tabId) {
    const container = document.getElementById(tabId);
    if (container.innerHTML.trim() === "") { // 내용이 빌 때만 로드
        try {
            const response = await fetch(`${tabId}.html`);
            if (response.ok) {
                container.innerHTML = await response.text();
                lucide.createIcons(); // 아이콘 재생성
            }
        } catch (error) {
            console.error('Error loading tab:', error);
        }
    }
}
// 탭 전환 함수
function showTab(tabId) {
    // 모든 탭 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 선택된 탭 데이터 로드 및 활성화
    loadTabData(tabId);
    document.getElementById(tabId).classList.add('active');
    
    // 페이지 최상단 이동
    window.scrollTo(0, 0);

    //알림 탭 진입 시 데이터 로드
    if(tabId === 'notice') fetchBloggerNotice();
}

// // 탭 전환 함수
// function showTab(tabId) {
//     document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
//     const target = document.getElementById(tabId);
//     if(target) {
//         target.classList.add('active');
//         window.scrollTo({top: 0, behavior: 'smooth'});
        
//         // 알림 탭 진입 시 데이터 로드
//         if(tabId === 'notice') fetchBloggerNotice();
//     }
// }

// // --- 구글 블로거 연동 설정 ---
// const BLOG_NAME = 'architectstory'; // 블로그 ID
// const LABEL_NAME = 'imhere';        // 카테고리(라벨) 명

// function fetchBloggerNotice() {
//     const maxPosts = 3;
//     const feedUrl = `https://${BLOG_NAME}.blogspot.com/feeds/posts/default/-/${encodeURIComponent(LABEL_NAME)}?alt=json-in-script&callback=renderBloggerNotice&max-results=${maxPosts}`;
    
//     const oldScript = document.getElementById('blogger-script');
//     if(oldScript) oldScript.remove();

//     const script = document.createElement('script');
//     script.id = 'blogger-script';
//     script.src = feedUrl;
//     document.body.appendChild(script);
// }

// // 데이터 렌더링 함수
// function renderBloggerNotice(data) {
//     const container = document.getElementById('blogger-notice-container');
//     const homePreview = document.getElementById('home-notice-preview');
//     const entries = data.feed.entry;

//     if (!entries || entries.length === 0) {
//         const emptyMsg = `<p class="text-center text-gray-600 text-xs py-10">최신 공지사항이 없습니다.</p>`;
//         if(container) container.innerHTML = emptyMsg;
//         return;
//     }

//     let fullListHtml = "";
//     let previewHtml = "";

//     entries.forEach((entry, index) => {
//         const title = entry.title.$t;
//         const link = entry.link.find(l => l.rel === 'alternate').href;
//         const date = new Date(entry.published.$t).toLocaleDateString('ko-KR', {
//             year: 'numeric', month: 'short', day: 'numeric'
//         });
        
//         let summary = entry.summary ? entry.summary.$t : (entry.content ? entry.content.$t : "");
//         summary = summary.replace(/<[^>]*>?/gm, '').substring(0, 100);

//         // 전체 리스트 UI
//         fullListHtml += `
//             <div onclick="window.open('${link}')" class="p-5 glass-card rounded-xl border-l-2 border-white/10 hover:border-emerald-500 transition-all cursor-pointer group">
//                 <div class="flex justify-between items-start mb-2">
//                     <h4 class="font-bold text-white group-hover:text-emerald-400 transition-colors">${title}</h4>
//                     <span class="text-[10px] text-gray-500">${date}</span>
//                 </div>
//                 <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">${summary}...</p>
//                 <div class="mt-3 flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
//                     상세보기 <i data-lucide="chevron-right" class="w-3 h-3"></i>
//                 </div>
//             </div>
//         `;

//         // 홈 화면 미리보기 (최근 2개만)
//         if(index < 2) {
//             previewHtml += `
//                 <div onclick="window.open('${link}')" class="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-b border-white/5">
//                     <span class="text-sm text-gray-300 truncate pr-4">${title}</span>
//                     <span class="text-[10px] text-gray-600 shrink-0">${date}</span>
//                 </div>
//             `;
//         }
//     });

//     if(container) container.innerHTML = fullListHtml;
//     if(homePreview) homePreview.innerHTML = previewHtml;
//     lucide.createIcons();
// }

// 초기 실행
window.onload = () => {
    lucide.createIcons();
    fetchBloggerNotice(); // 홈 화면 미리보기를 위해 첫 로딩 시 호출
};

// // 회원 인증 및 캘린더 노출 로직
// //배포주소
// const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzK0fdr7fLzO4iSCS9oMe5EcPcJLlWyLa6YqLV_Bt569rDfB-nWf2XY4asYUtxLLlDdMg/exec";

// window.addEventListener('load', () => {
//     const savedEmail = localStorage.getItem('imhere_user_email');
//     if (savedEmail) {
//         document.getElementById('userEmail').value = savedEmail;
//         verifyMember(true); // 자동 인증 모드로 실행
//     }
//     lucide.createIcons();
// });

// async function verifyMember(isAuto = false) {
//     const emailInput = document.getElementById('userEmail');
//     const email = emailInput.value.toLowerCase().trim();
//     const calIframe = document.getElementById('google-cal-iframe');
//     const authSection = document.getElementById('calendar-auth-section');
//     const calDisplay = document.getElementById('calendar-display');

//     if (!email) {
//         alert("이메일을 입력해주세요.");
//         return;
//     }

//     try {
//         const url = `${GAS_WEB_APP_URL}?action=checkAuth&email=${encodeURIComponent(email)}`;
        
//         // fetch 옵션을 최소화하여 브라우저의 기본 리다이렉트 처리를 유도합니다.
//         const response = await fetch(url, {
//             method: "GET",
//             mode: "cors", // No-cors를 쓰면 응답 데이터를 읽을 수 없으므로 반드시 cors 유지
//             redirect: "follow"
//         });

//         if (!response.ok) throw new Error('네트워크 응답 에러');

//         const auth = await response.json();
//         console.log("인증 성공:", auth);

//         if (auth.isMember) {
            
//             localStorage.setItem('imhere_user_email', email);

//             const calId = 'heresearchmeio@gmail.com';
//             const calUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calId)}&ctz=Asia%2FSeoul`;
            
//             calIframe.src = calUrl;
//             authSection.classList.add('hidden');
//             calDisplay.classList.remove('hidden');
            
//             alert(auth.isAdmin ? "관리자 권한으로 인증되었습니다." : "회원 인증 성공!");
//         } else {
//             alert("등록된 회원이 아닙니다.");
//             localStorage.removeItem('imhere_user_email'); // 잘못된 정보는 삭제
//         }
//     } catch (error) {
//         console.error("인증 실패 상세:", error);
//         alert("인증 서버 통신 실패. GAS 배포 권한이 '모든 사용자(Anyone)'인지 다시 확인하세요.");
//     }
// }
// function logout() {
//     if (confirm("로그아웃 하시겠습니까?")) {
//         localStorage.removeItem('imhere_user_email');
//         location.reload(); // 새로고침하여 초기 화면으로 이동
//     }
// }
