// Game State
let currentPlayer = 1;
let player1Pos = 0;
let player2Pos = 0;
let isRolling = false;
let player1Started = false;
let player2Started = false;

// Snakes and Ladders (user specified positions)
// Snakes: head → tail (landing on head sends you down to tail)
const snakes = {
    98: 80,   // Snake from 98 to 80
    94: 12,   // Snake from 94 to 12
    92: 67,   // Snake from 92 to 67
    56: 48,   // Snake from 56 to 48
    42: 1,    // Snake from 42 to 1
    61: 43,   // Snake from 61 to 43
    25: 3     // Snake from 25 to 3
};

// Ladders: bottom → top (landing on bottom takes you up to top)
const ladders = {
    7: 30,    // Ladder from 7 to 30
    16: 33,   // Ladder from 16 to 33
    20: 38,   // Ladder from 20 to 38
    36: 83,   // Ladder from 36 to 83
    63: 81,   // Ladder from 63 to 81
    86: 97,   // Ladder from 86 to 97
    50: 68,   // Ladder from 50 to 68
    71: 89    // Ladder from 71 to 89
};

// Dice faces
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Initialize the game
function initGame() {
    createBoard();
    updatePlayerCards();
    updateBoard();
}

// Create the game board
function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Board goes from 100 to 1, snake pattern
    for (let row = 0; row < 10; row++) {
        let cells = [];
        for (let col = 0; col < 10; col++) {
            let num;
            if (row % 2 === 0) {
                // Right to left
                num = 100 - (row * 10) - col;
            } else {
                // Left to right
                num = 100 - (row * 10) - (9 - col);
            }
            cells.push(num);
        }

        cells.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${num}`;
            cell.textContent = num;

            // Color pattern matching reference: yellow, pink, gray
            const rowNum = Math.ceil(num / 10);
            const posInRow = (num - 1) % 10;

            // Create alternating pattern
            if ((rowNum + posInRow) % 3 === 0) {
                cell.classList.add('yellow');
            } else if ((rowNum + posInRow) % 3 === 1) {
                cell.classList.add('pink');
            } else {
                cell.classList.add('gray');
            }

            // Mark snake heads
            if (snakes[num]) {
                cell.classList.add('snake-head');
                cell.setAttribute('data-dest', snakes[num]);
            }

            // Mark snake tails
            if (Object.values(snakes).includes(num)) {
                cell.classList.add('snake-tail');
            }

            // Mark ladder bottoms
            if (ladders[num]) {
                cell.classList.add('ladder-bottom');
                cell.setAttribute('data-dest', ladders[num]);
            }

            // Mark ladder tops
            if (Object.values(ladders).includes(num)) {
                cell.classList.add('ladder-top');
            }

            board.appendChild(cell);
        });
    }
}

// Update board with player positions
function updateBoard() {
    // Clear all player markers
    document.querySelectorAll('.player-marker').forEach(m => m.remove());
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('has-player1', 'has-player2');
    });

    // Place player 1
    if (player1Pos > 0 && player1Pos <= 100) {
        const cell1 = document.getElementById(`cell-${player1Pos}`);
        if (cell1) {
            cell1.classList.add('has-player1');
            const marker = document.createElement('span');
            marker.className = 'player-marker';
            marker.textContent = '🔴';
            marker.style.left = player1Pos === player2Pos ? '5px' : '50%';
            marker.style.transform = player1Pos === player2Pos ? 'none' : 'translateX(-50%)';
            cell1.appendChild(marker);
        }
    }

    // Place player 2
    if (player2Pos > 0 && player2Pos <= 100) {
        const cell2 = document.getElementById(`cell-${player2Pos}`);
        if (cell2) {
            cell2.classList.add('has-player2');
            const marker = document.createElement('span');
            marker.className = 'player-marker';
            marker.textContent = '🔵';
            marker.style.right = player1Pos === player2Pos ? '5px' : 'auto';
            marker.style.left = player1Pos === player2Pos ? 'auto' : '50%';
            marker.style.transform = player1Pos === player2Pos ? 'none' : 'translateX(-50%)';
            cell2.appendChild(marker);
        }
    }

    // Update position displays
    document.getElementById('pos1').textContent = player1Pos;
    document.getElementById('pos2').textContent = player2Pos;
}

// Update player cards to show active player
function updatePlayerCards() {
    const card1 = document.getElementById('player1-card');
    const card2 = document.getElementById('player2-card');
    const turnDisplay = document.getElementById('current-turn');

    card1.classList.toggle('active', currentPlayer === 1);
    card2.classList.toggle('active', currentPlayer === 2);

    turnDisplay.textContent = `🎯 Player ${currentPlayer}'s Turn`;
}

// Roll the dice
function rollDice() {
    if (isRolling) return;

    isRolling = true;
    const rollBtn = document.getElementById('roll-btn');
    rollBtn.disabled = true;

    const dice = document.getElementById('dice');
    const diceValue = document.getElementById('dice-value');

    // Rolling animation
    dice.classList.add('rolling');
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        dice.textContent = diceFaces[Math.floor(Math.random() * 6)];
        rollCount++;
        if (rollCount > 10) {
            clearInterval(rollInterval);

            // Final dice value
            const finalValue = Math.floor(Math.random() * 6) + 1;
            dice.textContent = diceFaces[finalValue - 1];
            dice.classList.remove('rolling');
            diceValue.textContent = `You rolled: ${finalValue}`;

            // Process the move
            setTimeout(() => {
                processMove(finalValue);
                isRolling = false;
                rollBtn.disabled = false;
            }, 500);
        }
    }, 80);
}

// Process the player's move
function processMove(diceValue) {
    const messageBox = document.getElementById('message-box');
    let currentPos = currentPlayer === 1 ? player1Pos : player2Pos;
    let hasStarted = currentPlayer === 1 ? player1Started : player2Started;
    let newPos = currentPos + diceValue;
    let message = '';
    let messageClass = '';

    // Check if player needs to roll 1 to start
    if (!hasStarted) {
        if (diceValue === 1) {
            if (currentPlayer === 1) {
                player1Started = true;
                player1Pos = 1;
            } else {
                player2Started = true;
                player2Pos = 1;
            }
            message = `🎉 You rolled 1! You're now on the board at position 1!`;
            messageClass = 'ladder';
            updateBoard();

            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerCards();

            messageBox.textContent = message;
            messageBox.className = 'message-box ' + messageClass;
            return;
        } else {
            message = `You need to roll 1 to start! You rolled ${diceValue}. Try again next turn.`;
            messageBox.textContent = message;
            messageBox.className = 'message-box';

            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerCards();
            return;
        }
    }

    // Check if exceeding 100
    if (newPos > 100) {
        message = `Need exact roll to reach 100! Staying at ${currentPos}.`;
        messageBox.textContent = message;
        messageBox.className = 'message-box';

        if (diceValue !== 6) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerCards();
        } else {
            message += ' 🎉 You rolled 6! Roll again!';
            messageBox.textContent = message;
            messageBox.className = 'message-box six';
        }
        return;
    }

    // Update position
    if (currentPlayer === 1) {
        player1Pos = newPos;
    } else {
        player2Pos = newPos;
    }

    updateBoard();

    // Check for win
    if (newPos === 100) {
        showWinner(currentPlayer);
        return;
    }

    // Check for snake
    if (snakes[newPos]) {
        const oldPos = newPos;
        newPos = snakes[newPos];
        message = `🐍 Oh no! Snake at ${oldPos} sends you down to ${newPos}!`;
        messageClass = 'snake';

        setTimeout(() => {
            if (currentPlayer === 1) {
                player1Pos = newPos;
            } else {
                player2Pos = newPos;
            }
            updateBoard();
        }, 500);
    }
    // Check for ladder
    else if (ladders[newPos]) {
        const oldPos = newPos;
        newPos = ladders[newPos];
        message = `🪜 Awesome! Ladder at ${oldPos} takes you up to ${newPos}!`;
        messageClass = 'ladder';

        setTimeout(() => {
            if (currentPlayer === 1) {
                player1Pos = newPos;
            } else {
                player2Pos = newPos;
            }
            updateBoard();

            if (newPos === 100) {
                showWinner(currentPlayer);
            }
        }, 500);
    }
    else {
        message = `Moved to position ${newPos}.`;
    }

    // Check for extra turn on 6
    if (diceValue === 6) {
        message += ' 🎲 You rolled 6! Roll again!';
        messageClass = 'six';
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerCards();
    }

    messageBox.textContent = message;
    messageBox.className = 'message-box' + (messageClass ? ' ' + messageClass : '');
}

// Show winner modal
function showWinner(player) {
    const modal = document.getElementById('winner-modal');
    const winnerText = document.getElementById('winner-text');

    winnerText.textContent = `Player ${player} Wins!`;
    modal.classList.add('show');

    document.getElementById('roll-btn').disabled = true;
}

// Reset the game
function resetGame() {
    player1Pos = 0;
    player2Pos = 0;
    currentPlayer = 1;
    isRolling = false;
    player1Started = false;
    player2Started = false;

    document.getElementById('winner-modal').classList.remove('show');
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('dice').textContent = '🎲';
    document.getElementById('dice-value').textContent = 'Roll to start!';
    document.getElementById('message-box').textContent = 'Roll 1 to enter the board! Click "Roll Dice" to begin.';
    document.getElementById('message-box').className = 'message-box';

    updatePlayerCards();
    updateBoard();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);
