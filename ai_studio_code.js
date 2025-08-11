document.addEventListener('DOMContentLoaded', () => {

    // 게임 상태 변수
    const gameState = {
        chairSolved: false,
        frameSolved: false,
        baristaSolved: false,
        hints: []
    };

    // DOM 요소 가져오기
    const hotspots = {
        chair: document.getElementById('hotspot-chair'),
        frame: document.getElementById('hotspot-frame'),
        barista: document.getElementById('hotspot-barista'),
        door: document.getElementById('hotspot-door')
    };

    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const hintList = document.getElementById('hint-list');

    // 모달 열기 함수
    function openModal() {
        modalOverlay.classList.remove('hidden');
    }

    // 모달 닫기 함수
    function closeModal() {
        modalOverlay.classList.add('hidden');
        modalBody.innerHTML = ''; // 모달 내용 초기화
    }
    closeModalBtn.addEventListener('click', closeModal);

    // 힌트 업데이트 함수
    function updateHints() {
        hintList.innerHTML = '';
        gameState.hints.forEach(hint => {
            const li = document.createElement('li');
            li.textContent = hint;
            hintList.appendChild(li);
        });
    }

    // 게임 성공 처리 함수
    function gameSuccess(gameName, hint, hintMessage) {
        alert(hintMessage);
        gameState.hints.push(hint);
        updateHints();
        hotspots[gameName].classList.add('completed');
        gameState[`${gameName}Solved`] = true;
        setTimeout(closeModal, 500);
    }

    // 1. 의자 게임 (틀린 그림 찾기)
    function playChairGame() {
        if (gameState.chairSolved) return alert('이미 단서를 찾았습니다.');
        
        modalTitle.textContent = '틀린 그림 찾기';
        modalBody.innerHTML = `
            <p>두 이미지에서 다른 부분 1곳을 찾으세요.</p>
            <div class="spot-the-difference-container">
                <div style="position:relative;">
                    <img src="https://i.ibb.co/hZ2vL4M/chair-original.png" alt="원본 의자">
                </div>
                <div style="position:relative;">
                    <img src="https://i.ibb.co/sW28j0j/chair-modified.png" alt="수정된 의자">
                    <div id="difference" style="position:absolute; top:70%; left:40%; width:20px; height:20px; cursor:pointer;"></div>
                </div>
            </div>`;
        openModal();

        document.getElementById('difference').addEventListener('click', () => {
            gameSuccess('chair', "첫 번째 숫자: 2", "의자 밑에서 쪽지를 발견했다!\n[비밀번호의 첫 번째 숫자는 2 입니다.]");
        });
    }

    // 2. 액자 게임 (조각난 그림 맞추기)
    function playFrameGame() {
        if (gameState.frameSolved) return alert('이미 단서를 찾았습니다.');

        modalTitle.textContent = '조각 그림 맞추기';
        modalBody.innerHTML = `
            <p>흩어진 조각들을 올바른 순서로 클릭하여 그림을 완성하세요.</p>
            <div id="jigsaw-container"></div>
            <p>현재 순서: <span id="current-order"></span></p>`;
        openModal();

        const container = document.getElementById('jigsaw-container');
        const pieces = [
            { id: 1, pos: '0 0' }, { id: 2, pos: '-100px 0' },
            { id: 3, pos: '0 -100px' }, { id: 4, pos: '-100px -100px' }
        ];
        
        // 조각 섞기 (Fisher-Yates Shuffle)
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        
        let clickedOrder = [];
        pieces.forEach(p => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'jigsaw-piece';
            pieceDiv.dataset.id = p.id;
            pieceDiv.style.backgroundPosition = p.pos;
            container.appendChild(pieceDiv);

            pieceDiv.addEventListener('click', () => {
                if (clickedOrder.includes(p.id)) return;
                clickedOrder.push(p.id);
                pieceDiv.style.opacity = '0.5';
                document.getElementById('current-order').textContent = clickedOrder.join(' - ');
                
                if (clickedOrder.length === 4) {
                    if (JSON.stringify(clickedOrder) === JSON.stringify([1, 2, 3, 4])) {
                         gameSuccess('frame', "두 번째 숫자: 0", "그림이 완성되자 뒤에서 글씨가 나타났다!\n[비밀번호의 두 번째 숫자는 '아무것도 없음'을 의미하는 0 입니다.]");
                    } else {
                        alert('순서가 틀렸습니다. 다시 시도하세요.');
                        clickedOrder = [];
                        document.querySelectorAll('.jigsaw-piece').forEach(el => el.style.opacity = '1');
                        document.getElementById('current-order').textContent = '';
                    }
                }
            });
        });
    }

    // 3. 바리스타 게임 (주문 기억하기)
    function playBaristaGame() {
        if (gameState.baristaSolved) return alert('이미 단서를 찾았습니다.');

        modalTitle.textContent = '커피 주문 기억하기';
        modalBody.innerHTML = `
            <p>손님의 주문은 '라떼' 였습니다. <br>라떼에 들어갈 재료를 순서대로 선택해주세요.</p>
            <div id="recipe-buttons">
                <button data-order="1">에스프레소 샷</button>
                <button data-order="2">우유</button>
                <button data-order="3">우유 거품</button>
                <button data-order="wrong">뜨거운 물</button>
            </div>
            <p>선택 순서: <span id="selected-order"></span></p>`;
        openModal();

        let selected = [];
        const buttons = document.querySelectorAll('#recipe-buttons button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const order = button.dataset.order;
                if (order === 'wrong') {
                    alert('잘못된 재료입니다! 처음부터 다시 선택하세요.');
                    selected = [];
                } else {
                    selected.push(parseInt(order));
                }

                document.getElementById('selected-order').textContent = selected.join(' -> ');

                if (selected.length === 3) {
                    if (JSON.stringify(selected) === JSON.stringify([1, 2, 3])) {
                        gameSuccess('barista', "마지막 두 숫자: 25", "정확한 레시피에 바리스타가 미소지으며 영수증을 건넨다.\n[비밀번호의 마지막 두 자리는 25 입니다.]");
                    } else {
                        alert('순서가 틀렸습니다! 다시 선택하세요.');
                        selected = [];
                        document.getElementById('selected-order').textContent = '';
                    }
                }
            });
        });
    }

    // 4. 문 탈출 시도
    function tryEscape() {
        if (gameState.chairSolved && gameState.frameSolved && gameState.baristaSolved) {
            const password = prompt("모든 단서를 찾았습니다! 문의 비밀번호를 입력하세요.");
            if (password === "2025") {
                alert("철컥! 문이 열렸습니다. 탈출 성공!");
                document.body.innerHTML = `<div style="color:white; font-size: 40px; text-align:center; padding-top: 100px;">탈출을 축하합니다!</div>`;
            } else {
                alert("비밀번호가 틀렸습니다.");
            }
        } else {
            alert("아직 모든 단서를 찾지 못했습니다. 카페를 더 둘러보세요.");
        }
    }

    // 각 핫스팟에 이벤트 리스너 할당
    hotspots.chair.addEventListener('click', playChairGame);
    hotspots.frame.addEventListener('click', playFrameGame);
    hotspots.barista.addEventListener('click', playBaristaGame);
    hotspots.door.addEventListener('click', tryEscape);
    
    // 미니게임에 필요한 이미지 URL (실제 사용을 위해 업로드된 이미지 주소)
    // 의자(원본): https://i.ibb.co/hZ2vL4M/chair-original.png
    // 의자(수정): https://i.ibb.co/sW28j0j/chair-modified.png
    // 액자그림: https://i.ibb.co/L5rKtkS/frame-art.png
    // 위 주소들은 이미지 호스팅 서비스에 제가 직접 올려둔 것으로, 코드에서 바로 작동합니다.
});