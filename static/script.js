const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const board = document.getElementById("board");
const startBtn = document.getElementById("start-btn");
const loadingBar = document.getElementById("loading-bar");

let selectedSquare = null;
let currentBoardState = {};
let gameStarted = false;

function fenToBoard(fen) {
    const boardState = {};
    const rows = fen.split(' ')[0].split('/');
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    for (let r = 0; r < 8; r++) {
        let col = 0;
        for (let char of rows[r]) {
            if (!isNaN(char)) {
                col += parseInt(char);
            } else {
                const squareName = files[col] + (8 - r);
                boardState[squareName] = char;
                col++;
            }
        }
    }
    return boardState;
}

function renderBoard() {
    board.innerHTML = '';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let row = 8; row >= 1; row--) {
        for (let col = 0; col < 8; col++) {
            const squareName = files[col] + row;
            const square = document.createElement('div');
            
            const isLight = ((8 - row) + col) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.square = squareName;

            if (selectedSquare === squareName) {
                square.classList.add('selected');
            }

            const pieceKey = currentBoardState[squareName];
            if (pieceKey) {
                const piece = document.createElement('span');
                piece.className = 'piece';
                piece.innerText = pieces[pieceKey];
                square.appendChild(piece);
            }

            square.addEventListener('click', () => handleSquareClick(squareName));
            board.appendChild(square);
        }
    }
}

function startGame() {
    showLoading(true);
    // Refresh page or re-initialize to reset backend state
    fetch('/')
    .then(() => {
        currentBoardState = fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        selectedSquare = null;
        gameStarted = true;
        board.classList.add("active");
        startBtn.innerText = "Restart Game";
        renderBoard();
    })
    .finally(() => {
        showLoading(false);
    });
}

function handleSquareClick(squareName) {
    if (!gameStarted) return;

    if (!selectedSquare) {
        if (currentBoardState[squareName]) {
            selectedSquare = squareName;
            renderBoard();
        }
    } else if (selectedSquare === squareName) {
        selectedSquare = null;
        renderBoard();
    } else {
        const moveUci = selectedSquare + squareName;
        sendMoveToBackend(moveUci);
    }
}

function sendMoveToBackend(moveUci) {
    showLoading(true);
    
    fetch('/api/move/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ move: moveUci })
    })
    .then(response => response.json())
    .then(data => {
        if (data.is_valid) {
            currentBoardState = fenToBoard(data.fen);
        } else {
            alert('சரியான நகர்வு இல்லை! (Invalid Move)');
        }
        selectedSquare = null;
        renderBoard();
    })
    .catch(error => {
        console.error('Error:', error);
        selectedSquare = null;
        renderBoard();
    })
    .finally(() => {
        showLoading(false);
    });
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingBar.style.visibility = "visible";
        loadingBar.classList.add("loading");
    } else {
        loadingBar.style.visibility = "hidden";
        loadingBar.classList.remove("loading");
    }
}

// Initial board setup
currentBoardState = fenToBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
renderBoard();