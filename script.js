let boardState = Array(9).fill("");
let currentPlayer = "X"; 
let gameActive = true;
let gameMode = "pvp";

let winsX = 0;
let winsO = 0;
let draws = 0;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusBar = document.getElementById('status');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawsEl = document.getElementById('score-draws');
const labelXEl = document.getElementById('label-x');
const labelOEl = document.getElementById('label-o');

const modalOverlay = document.getElementById('result-modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');

cells.forEach(cell => cell.addEventListener('click', () => handleCellClick(cell)));

function setMode(mode) {
    if (gameMode === mode) return;
    gameMode = mode;
    
    document.getElementById('btn-pvp').classList.toggle('active', mode === 'pvp');
    document.getElementById('btn-pve').classList.toggle('active', mode === 'pve');
    
    labelXEl.textContent = mode === 'pve' ? 'You (X)' : 'Player X';
    labelOEl.textContent = mode === 'pve' ? 'CPU (O)' : 'Player O';
    
    resetAll();
}

function handleCellClick(cell) {
    const index = cell.getAttribute('data-index');
    
    if (boardState[index] !== "" || !gameActive || (gameMode === "pve" && currentPlayer === "O")) {
        return;
    }

    makeMove(index, currentPlayer);
    
    if (gameActive && gameMode === "pve") {
        statusBar.innerHTML = `Computer is thinking...`;
        setTimeout(computerMove, 400); 
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player, 'occupied');
    
    if (checkWin()) {
        handleGameOver(player);
    } else if (boardState.every(cell => cell !== "")) {
        handleGameOver("draw");
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatusText();
    }
}

function computerMove() {
    if (!gameActive) return;

    let bestMove = findStrategicMove("O");
    if (bestMove === null) {
        bestMove = findStrategicMove("X");
    }
    if (bestMove === null) {
        if (boardState[4] === "") {
            bestMove = 4;
        } else {
            const availableIndices = boardState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
            bestMove = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }
    }

    if (bestMove !== null) {
        makeMove(bestMove, "O");
    }
}

function findStrategicMove(player) {
    for (let pattern of winPatterns) {
        const vals = pattern.map(idx => boardState[idx]);
        const playerCount = vals.filter(v => v === player).length;
        const emptyCount = vals.filter(v => v === "").length;
        
        if (playerCount === 2 && emptyCount === 1) {
            return pattern[vals.indexOf("")];
        }
    }
    return null;
}

function updateStatusText() {
    if (currentPlayer === "X") {
        statusBar.innerHTML = gameMode === "pve" ? `Your turn (<span class="turn-x">X</span>)` : `Player <span class="turn-x">X</span>'s turn`;
    } else {
        statusBar.innerHTML = gameMode === "pve" ? `CPU's turn (<span class="turn-o">O</span>)` : `Player <span class="turn-o">O</span>'s turn`;
    }
}

function checkWin() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            pattern.forEach(idx => cells[idx].classList.add('win-highlight'));
            return true;
                }
            }
    return false;
}

function handleGameOver(result) {
    gameActive = false;
    let heading = "";
    let message = "";

    if (result === "X") {
        winsX++;
        scoreXEl.textContent = winsX;
        heading = "Victory!";
        message = gameMode === "pve" ? "You won the match!" : "Player X won the match!";
    } else if (result === "O") {
        winsO++;
        scoreOEl.textContent = winsO;
        heading = gameMode === "pve" ? "Defeat" : "Victory!";
        message = gameMode === "pve" ? "The computer won the match." : "Player O won the match!";
    } else {
        draws++;
        scoreDrawsEl.textContent = draws;
        heading = "Match Draw";
        message = "It's a tie game!";
    }

    statusBar.innerHTML = "Game Over";
    showModal(heading, message);
}

function showModal(title, msg) {
    modalTitle.textContent = title;
    modalMsg.textContent = msg;
    modalOverlay.classList.add('show');
}

function closeModal() {
    modalOverlay.classList.remove('show');
    resetBoard();
}

function resetBoard() {
    boardState = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    updateStatusText();
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
    });
}

function resetAll() {
    winsX = 0;
    winsO = 0;
    draws = 0;
    scoreXEl.textContent = 0;
    scoreOEl.textContent = 0;
    scoreDrawsEl.textContent = 0;
    resetBoard();
}
