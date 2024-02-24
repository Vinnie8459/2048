//localStorage.clear();

var game_board = 
[
[0,0,0,0],
[0,0,0,0],
[0,0,0,0],
[0,0,0,0]
];
var empty_spaces = [];
var gameRunning = false;
var gameOver = false;
var gameScore = 0;
var gameHighScore = 0;
var soundMute = false;
var highestTile = 2;
var gameHighestTile = 2;
var isSingleTouch = true;
//-------
var audioGameOver = document.getElementById("audioGameOver");
var audioHighestTile = document.getElementById("audioHighestTile");
var audioMerge = document.getElementById("audioMerge");
var audioClick = document.getElementById("audioClick");

//-------
var aniMergeTileDone = true;
var aniMoveTileDone = true;
var aniSpawnDone = true;
var totalMErged = 0;

window.onload = startGame();

var touchStartX = 0;
var touchStartY = 0;
var touchEndX = 0;
var touchEndY = 0;

document.getElementById('touch-area').addEventListener('touchstart', handleTouchStart);
document.getElementById('touch-area').addEventListener('touchmove', handleTouchMove);
document.getElementById('touch-area').addEventListener('touchend', handleTouchEnd);

function isAnyAnimationInProgress(className) {
    var elements = document.getElementsByClassName(className);

    function traverse(element) {
        var animation = window.getComputedStyle(element).animationName;
        if (animation !== 'none' && animation !== 'initial') {
            //console.log('Animation in progress for element:', element, 'with animation:', animation);
            return true;
        }
        for (var i = 0; i < element.children.length; i++) {
            if (traverse(element.children[i])) {
                return true;
            }
        }
        return false;
    }

    for (var i = 0; i < elements.length; i++) {
        if (traverse(elements[i])) {
            return true;
        }
    }

    return false;
}

function handleTouchStart(e) {
    isSingleTouch = e.touches.length === 1;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    const isButton = e.target.tagName.toLowerCase() == 'button';
    const isMultiTouch = e.touches.length > 1;

    if (!isButton && isSingleTouch && !isMultiTouch) {
        // If not a button, single touch, and not a multi-touch gesture, prevent default behavior (zooming)
        e.preventDefault();
        return
    }
}

function handleTouchEnd(e) {
    // Retrieve the font size in pixels
    const fontSizeRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    // Set the touch length threshold in rem units
    const touchLengthThresholdRem = 6.5; // Example: 0.5 rem

    // Convert the touch length threshold to pixels
    const touchLengthThresholdPixels = touchLengthThresholdRem * fontSizeRem;

    // Calculate the distance moved in the X and Y directions
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Check if the distance moved exceeds the touch length threshold
    if (Math.abs(deltaX) > touchLengthThresholdPixels || Math.abs(deltaY) > touchLengthThresholdPixels) {
        // Determine the direction of the swipe based on the distance moved
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        // Print the detected direction
        //console.log('Swipe direction:', direction);
        executeMove(direction);
        //document.getElementById('game-name').innerText=direction;
    }
}


document.onkeydown = function (ctx) {

    if (ctx.ctrlKey) { return; }    
    if (ctx.altKey) { return; }

    keyPressed = ctx.key.toString();

    if(['ArrowUp', 'w'].includes(keyPressed)) {executeMove('up');}
    
    else if(['ArrowDown', 's'].includes(keyPressed)) {executeMove('down');}

    else if(['ArrowRight', 'd'].includes(keyPressed)) {executeMove('right');}

    else if(['ArrowLeft', 'a'].includes(keyPressed)) {executeMove('left');}
}

function executeMove(move) {
    if (isAnyAnimationInProgress('row')) {return; }
    switch(move) {
        case 'up':
            tilesMoveandMergeUp(firstMove = true);
            break;

        case 'down':
            tilesMoveandMergeDown(firstMove = true);
            break;

        case 'right':
            tilesMoveandMergeRight(firstMove = true);
            break;
        
        case 'left':
            tilesMoveandMergeLeft(firstMove = true);
            break;
        
    }
}

function saveGameState() {
    localStorage.setItem("gameHighScore", gameHighScore);
    localStorage.setItem("gameScore", gameScore);
    localStorage.setItem("game_board", JSON.stringify(game_board));
    localStorage.setItem("soundMute", soundMute);
    localStorage.setItem("gameOver", gameOver);
    localStorage.setItem("gameRunning", gameRunning);
    localStorage.setItem("highestTile", highestTile);
    //tiles
    var saveAllTilesInfo = [];
    for (i=1; i<5; i++) {
        for (j=1; j<5; j++) {
            loadCurrentTile = document.getElementById("tile-" + i.toString() + "-" + j.toString());
            tileValue = loadCurrentTile.innerText;
            tileClass = loadCurrentTile.className;
            saveAllTilesInfo.push({storedTileValue : tileValue, storedTileClass : tileClass});
            localStorage.setItem("allTilesInfo", JSON.stringify(saveAllTilesInfo));
        }
    }
}

function loadGameState() {
    //high score
    storedHighScore = localStorage.getItem("gameHighScore");
    if (storedHighScore === null) {
        return false;
    }

    gameHighScore = parseInt(storedHighScore);
    elementHighScore = document.getElementById("best-container-score");
    elementHighScore.innerText = gameHighScore;
    //score
    storedScore = localStorage.getItem("gameScore");
    if (storedScore === null) {return false;}

    gameScore = parseInt(storedScore);
    elementScore = document.getElementById("score-container-score");
    elementScore.innerText = gameScore;
    //gameboard
    storedGameBoard = localStorage.getItem("game_board");
    if (storedGameBoard === null) {return false;}

    game_board = JSON.parse(storedGameBoard);

    // game_board = [
    //     [4, 2, 2, 4],
    //     [0, 0, 0, 0],
    //     [0, 0, 0, 0],
    //     [0, 32, 32, 0]];
    //tiles
    // storedAllTilesInfo = localStorage.getItem("allTilesInfo");
    // if(storedAllTilesInfo === null) {return false;}


    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (game_board[i][j] == 0) { continue; }
            loadCurrentTile = document.getElementById("tile-" + (i+1).toString() + "-" + (j+1).toString());
            loadCurrentTile.innerText = game_board[i][j].toString();
            loadCurrentTile.className = "tile value" + game_board[i][j].toString();
        }
    }


    // var index = 0;
    // storedAllTilesInfo = JSON.parse(storedAllTilesInfo);
    // for (i=1; i<5; i++) {
    //     for (j=1; j<5; j++) {
    //         loadCurrentTile = document.getElementById("tile-" + i.toString() + "-" + j.toString());
    //         loadCurrentTile.innerText = storedAllTilesInfo[index].storedTileValue;
    //         loadCurrentTile.className = storedAllTilesInfo[index].storedTileClass;
    //         index++;
    //     }
    // }

    //soundMute
    storedSoundMute = localStorage.getItem("soundMute");
    if(storedSoundMute === null) {return false;};

    soundMute = JSON.parse(storedSoundMute);
    var soundIcon = document.getElementById("iconMuteUnmute");
    if (!soundMute) {
        soundIcon.className = "bx bxs-volume-full";
    }

    else {
        soundIcon.className = "bx bxs-volume-mute";
    }

    //game over and running
    storedGameOver = localStorage.getItem("gameOver");
    storedGameRunning = localStorage.getItem("gameRunning");
    if(storedGameOver === null) {return false;}
    if(storedGameRunning === null) {return false;}

    gameOver = JSON.parse(storedGameOver);
    gameRunning = JSON.parse(storedGameRunning);

    if(gameOver) {
        displayGameOver();
    }

    //highestTile
    storedHighestTile = localStorage.getItem("highestTile");
    if(storedHighestTile === null) {return false;}

    highestTile = parseInt(storedHighestTile);
    updateTileText(highestTile);

    return true;
    

}

window.addEventListener("beforeunload", function (event) {saveGameState();});

function startGame() {
    if (!loadGameState()) {
        spawnTile();
        spawnTile();
    }

    //gamehighestTile
    var tempHighest = 0;
    for (i=0; i<4; i++) {
        for (j=0; j<4; j++) {
            if (tempHighest < game_board[i][j]) {
                tempHighest = game_board[i][j];
            }
        }
    }
    gameHighestTile = tempHighest;


    gameRunning = true;
}

function displayGameOver() {
    gameOver = true;
    gameRunning = false;
    if(!soundMute) {audioGameOver.currentTime = 0; audioGameOver.play();}
    gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.className = "displayblock";

}

function restartGame(askagain = true) {
    if(!soundMute) {audioClick.currentTime = 0; audioClick.play()}
    if (!gameOver && askagain == true) {
        //ask again
        gameRunning = false;


        restartConfirm = document.getElementById("restartConfirm");
        restartConfirm.className = "displayblock";
        document.getElementById("newgame").disabled = true;
        return;
    }
    document.getElementById("newgame").disabled = false;
    gameRunning = true;
    gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.className = "displaynone";
    restartConfirm = document.getElementById("restartConfirm");
    restartConfirm.className = "displaynone";


    game_board = 
    [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
    ];
    empty_spaces = [];
    gameRunning = true;
    gameOver = false;
    gameScore = 0;
    aniMergeTileDone = true;
    aniMoveTileDone = true;
    aniSpawnDone = true;

    elementHighScore = document.getElementById("best-container-score");
    elementHighScore.innerText = gameHighScore;
    
    elementScore = document.getElementById("score-container-score");
    elementScore.innerText = gameScore;

    for (i=1; i<5; i++) {
        for (j=1; j<5; j++) {
            loadCurrentTile = document.getElementById("tile-" + i.toString() + "-" + j.toString());
            loadCurrentTile.innerText = "";
            loadCurrentTile.className = "tile empty";
        }
    }

    spawnTile();
    spawnTile();

    //gamehighestTile
    var tempHighest = 0;
    for (i=0; i<4; i++) {
        for (j=0; j<4; j++) {
            if (tempHighest < game_board[i][j]) {
                tempHighest = game_board[i][j];
            }
        }
    }
    gameHighestTile = tempHighest;
}

function restartConfirmNo() {
    document.getElementById("newgame").disabled = false;
    if(!soundMute) {audioClick.currentTime = 0; audioClick.play()}
    restartConfirm = document.getElementById("restartConfirm");
    restartConfirm.className = "displaynone";

    gameRunning = true;
}

function updateTileText(highestTile) {
    if (highestTile >= 2048) {
        gameText = document.getElementById("game-text");
        gameText.innerHTML = "Get to the <b>" + (highestTile*2).toString() + "</b> tile!";

    }
}

function toggleSound() {
    var soundIcon = document.getElementById("iconMuteUnmute");
    if (!soundMute) {
        //want to mute
        soundMute = true;
        soundIcon.className = "bx bxs-volume-mute";
    }

    else {
        //want to unmute
        audioClick.currentTime = 0; 
        document.getElementById('audioClick').play();
        soundMute = false;
        soundIcon.className = "bx bxs-volume-full";
        
    }
}

function spawnTile() {
    aniSpawnDone = false;

    for (i=0; i<4; i++) {
        for (j=0; j<4; j++){
            if (game_board[i][j] == 0) {
                empty_spaces.push('tile-' + (i+1).toString() + '-' + (j+1).toString());
            }
        }
    }

    

    var spawn_tile_id = empty_spaces[Math.floor(Math.random() * empty_spaces.length)];
    var currentTile = document.getElementById(spawn_tile_id);

    currentTile.classList.remove('empty');
    currentTile.classList.add('aniSpawnTile');

    if (Math.floor(Math.random() * 10) == 0) {
        var spawnTileValue = 4;
        currentTile.classList.add('value4');
        currentTile.innerText = '4';
    }
    else {
        var spawnTileValue = 2;
        currentTile.classList.add('value2');
        currentTile.innerText = '2';
    }

    i = (parseInt(spawn_tile_id.charAt(5)) - 1);
    j = (parseInt(spawn_tile_id.charAt(7)) - 1);

    game_board[i][j] = spawnTileValue;

    setTimeout(function () {
        currentTile.classList.remove("aniSpawnTile");
        aniSpawnDone = true;
    }, 100);

    //checking game over
    if (empty_spaces.length == 1) {
        //check if can merge if not game over

        if (tilesCanMergeDown() || tilesCanMergeUp() || tilesCanMergeRight() || tilesCanMergeLeft()) {}

        else {
            //gameover
            setTimeout(function () {
                displayGameOver();
            }, 100)
            
            return;
        }


    }
    empty_spaces = [];

    
}

//DISPLAY SCORE
function displayScore(score) {
    gameScore += score;
    elementGameScore = document.getElementById("score-container-score");

    elementGameScore.innerText = gameScore;
    if (gameScore > gameHighScore) {
        gameHighScore = gameScore;
        elementHighScore = document.getElementById("best-container-score");
        elementHighScore.innerText = gameHighScore;
    }
}
//ANIMATIONS
function aniMoveTile(tileToMove, tileToMoveAt, moveSpaces) {
    setTimeout(function () {
        var tile = tileToMove.className.split("value")[1];
        tile = (tile.includes(" ") ? tile.split(" ")[0] : tile).toString();
        tileToMoveAt.className = "tile value" + tile;
        tileToMoveAt.innerText = tileToMove.innerText;
        tileToMove.className = "tile empty";
        tileToMove.innerText = "";
        aniMoveTileDone = true;
    }, 100)
}

function aniMoveMergeTile(tileToMerge, tileToMergeAt, moveSpaces) {
    setTimeout(function () {
        tile = tileToMerge.className.split("value")[1];
        tile = tile.includes(" ") ? tile.split(" ")[0] : tile
        tileToMergeAt.className = "tile value" + (parseInt(tile) * 2).toString() + " aniMergeTile";
        tileToMergeAt.innerText = (parseInt(tileToMerge.innerText) * 2).toString();
        tileToMerge.className = "tile empty";
        tileToMerge.innerText = "";

        aniMoveTileDone = true;
        aniRemoveMerge(tileToMergeAt.id);
    }, 100)
}

function aniRemoveMerge(tileToMergeAt) {
    setTimeout(function () {
        tileToMergeAt = document.getElementById(tileToMergeAt);
        tileToMergeAt.classList.remove("aniMergeTile");
        aniMergeTileDone = true;
    }, 100)
    
}

//GAME LOGIC

//CONTROL UP
function tilesMoveandMergeUp(firstMove = false, a, b) {
    var didMerge = false;
    var totalScore = 0;
    var highestSound = false;
    var madeMoves = false;

    //Main Loop
    for (i = 1; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (game_board[i][j] == 0) { continue; } //empty tile

            if (firstMove && game_board[i - 1][j] == game_board[i][j]) {
                //merge up
                didMerge = true;
                aniMergeTileDone = false;

                //changing game board data
                game_board[i - 1][j] = (game_board[i][j]) * 2;
                //checking and changing highest tile
                if ((game_board[i][j]) * 2 > highestTile) {highestTile = (game_board[i][j]) * 2; updateTileText(highestTile);}
                if ((game_board[i][j]) * 2 > gameHighestTile) { gameHighestTile = (game_board[i][j]) * 2; highestSound = true; }
                //clearing tile that moved
                game_board[i][j] = 0;
                
                var tileToMergeAt = document.getElementById('tile-' + (i+1-1).toString() + '-' + (j+1).toString());
                var tileToMerge = document.getElementById('tile-' + (i+1).toString() + '-' + (j+1).toString());
                

                tileToMergeAt.classList.remove(("value" + tileToMerge.innerText));
                tileToMergeAt.classList.add((("value" + parseInt(tileToMerge.innerText)*2).toString()));

                tileToMergeAt.innerText = (parseInt(tileToMerge.innerText)*2).toString();
                //score
                totalScore += parseInt(tileToMerge.innerText)*2;

                tileToMerge.classList.remove(("value" + tileToMerge.innerText));
                tileToMerge.classList.add('empty')
                tileToMerge.innerText = '';

                tileToMergeAt.classList.add('aniMergeTile');

                aniRemoveMerge(tileToMergeAt.id);

            }
            else if (game_board[i - 1][j] == 0) {
                var moveSpaces = 1;

                if (i - 2 >= 0 && game_board[i - 2][j] == 0) {
                    var moveSpaces = 2;
                }

                if (i - 3 >= 0 && game_board[i - 3][j] == 0) {
                    var moveSpaces = 3;
                }

                if (firstMove && i - moveSpaces - 1 >= 0 && game_board[i - moveSpaces - 1][j] == game_board[i][j] && !document.getElementById("tile-"+(i+1-moveSpaces-1).toString()+"-"+(j+1).toString()).classList.contains("aniMergeTile")) {
                    
                    //move and merge
                    didMerge = true;
                    madeMoves = true;
                    aniMoveTileDone = false;
                    aniMergeTileDone = false;

                    //changing game board data
                    game_board[i - moveSpaces - 1][j] = (game_board[i][j]) * 2;
                    //checking and changing highest tile
                    if ((game_board[i][j]) * 2 > highestTile) {highestTile = (game_board[i][j]) * 2; updateTileText(highestTile);}
                    if ((game_board[i][j]) * 2 > gameHighestTile) { gameHighestTile = (game_board[i][j]) * 2; highestSound = true; }
                    //clearing tile that moved
                    game_board[i][j] = 0;

                    var tileToMerge = document.getElementById("tile-" + (i+1).toString() + "-" + (j+1).toString());
                    var tileToMergeAt = document.getElementById("tile-" + (i + 1 - moveSpaces - 1).toString() + "-" + (j + 1).toString());

                    //score
                    totalScore += parseInt(tileToMerge.innerText) * 2;
                    
                    tileToMerge.classList.add("aniMoveTileUp" + (moveSpaces+1).toString());

                    aniMoveMergeTile(tileToMerge, tileToMergeAt, moveSpaces);

                }

                else {
                    //just move
                    aniMoveTileDone = false;
                    madeMoves = true;

                    var tileToMoveAt = document.getElementById('tile-' + (i+1- moveSpaces).toString() + '-' + (j+1).toString());
                    var tileToMove = document.getElementById('tile-' + (i + 1).toString() + '-' + (j + 1).toString());

                    game_board[i-moveSpaces][j] = game_board[i][j];
                    game_board[i][j] = 0;

                    tileToMove.classList.add("aniMoveTileUp" + moveSpaces.toString());

                    aniMoveTile(tileToMove, tileToMoveAt, moveSpaces);

                }
                
            }
        }
    }

    //clearing animation class and score and sound
    if (firstMove) {
        if (didMerge) {
            
            setTimeout(function () {
                //displaying score
                if (totalScore > 0) { displayScore(totalScore); }

                //playing sound
                if (!soundMute) {
                    if (!highestSound) {
                        audioMerge.currentTime = 0;
                        audioMerge.play();
                    }
                    else {
                        audioHighestTile.currentTime = 0;
                        audioHighestTile.play();
                    }
                }
                //clearing animation
                aniMergeTileDone = true;
            }, 100)
        }

        else {
            aniMergeTileDone = true;
        }

        if (madeMoves) {
            setTimeout(function () {
                tilesMoveandMergeUp(false, madeMoves, didMerge);
            }, 100);
        }

        else {
            tilesMoveandMergeUp(false, madeMoves, didMerge);
        }

        
    }

    else {
        c = madeMoves
        if (a || b || c){
            if (!soundMute) {audioClick.currentTime = 0; audioClick.play()}
            spawnTile();
        }

        if (!madeMoves) {
            aniMoveTileDone = true;
        }
        

    }
}

//CONTROL DOWN
function tilesMoveandMergeDown(firstMove = false, a, b) {
    var didMerge = false;
    var totalScore = 0;
    var highestSound = false;
    var madeMoves = false;

    //Main Loop
    for (i = 2; i >= 0; i--) {
        for (j = 0; j < 4; j++) {
            if (game_board[i][j] == 0) { continue; } //empty tile

            if (firstMove && game_board[i + 1][j] == game_board[i][j]) {
                //merge down
                didMerge = true;
                aniMergeTileDone = false;

                //changing game board data
                game_board[i + 1][j] = (game_board[i][j]) * 2;
                //checking and changing highest tile
                if ((game_board[i][j]) * 2 > highestTile) {highestTile = (game_board[i][j]) * 2; updateTileText(highestTile);}
                if ((game_board[i][j]) * 2 > gameHighestTile) { gameHighestTile = (game_board[i][j]) * 2; highestSound = true; }
                //clearing tile that moved
                game_board[i][j] = 0;
                
                var tileToMergeAt = document.getElementById('tile-' + (i+1+1).toString() + '-' + (j+1).toString());
                var tileToMerge = document.getElementById('tile-' + (i+1).toString() + '-' + (j+1).toString());
                

                tileToMergeAt.classList.remove(("value" + tileToMerge.innerText));
                tileToMergeAt.classList.add((("value" + parseInt(tileToMerge.innerText)*2).toString()));

                tileToMergeAt.innerText = (parseInt(tileToMerge.innerText)*2).toString();
                //score
                totalScore += parseInt(tileToMerge.innerText)*2;

                tileToMerge.classList.remove(("value" + tileToMerge.innerText));
                tileToMerge.classList.add('empty')
                tileToMerge.innerText = '';

                tileToMergeAt.classList.add('aniMergeTile');

                aniRemoveMerge(tileToMergeAt.id);

            }
            else if (game_board[i + 1][j] == 0) {
                var moveSpaces = 1;
                if (i + 2 <= 3 && game_board[i + 2][j] == 0) {
                    var moveSpaces = 2;
                }

                if (i + 3 <= 3 && game_board[i + 3][j] == 0) {
                    var moveSpaces = 3;
                }

                if (firstMove && i + moveSpaces + 1 <= 3 && game_board[i + moveSpaces + 1][j] == game_board[i][j] && !document.getElementById("tile-"+(i+1+moveSpaces+1).toString()+"-"+(j+1).toString()).classList.contains("aniMergeTile")) {
                    
                    //move and merge
                    didMerge = true;
                    madeMoves = true;
                    aniMoveTileDone = false;
                    aniMergeTileDone = false;

                    //changing game board data
                    game_board[i + moveSpaces + 1][j] = (game_board[i][j]) * 2;
                    //checking and changing highest tile
                    if ((game_board[i][j]) * 2 > highestTile) {highestTile = (game_board[i][j]) * 2; updateTileText(highestTile);}
                    if ((game_board[i][j]) * 2 > gameHighestTile) { gameHighestTile = (game_board[i][j]) * 2; highestSound = true; }
                    //clearing tile that moved
                    game_board[i][j] = 0;

                    var tileToMerge = document.getElementById("tile-" + (i+1).toString() + "-" + (j+1).toString());
                    var tileToMergeAt = document.getElementById("tile-" + (i + 1 + moveSpaces + 1).toString() + "-" + (j + 1).toString());

                    //score
                    totalScore += parseInt(tileToMerge.innerText) * 2;
                    
                    tileToMerge.classList.add("aniMoveTileDown" + (moveSpaces+1).toString());

                    aniMoveMergeTile(tileToMerge, tileToMergeAt, moveSpaces);

                }

                else {
                    //just move
                    aniMoveTileDone = false;
                    madeMoves = true;

                    var tileToMoveAt = document.getElementById('tile-' + (i+1 + moveSpaces).toString() + '-' + (j+1).toString());
                    var tileToMove = document.getElementById('tile-' + (i + 1).toString() + '-' + (j + 1).toString());

                    game_board[i+moveSpaces][j] = game_board[i][j];
                    game_board[i][j] = 0;

                    tileToMove.classList.add("aniMoveTileDown" + moveSpaces.toString());

                    aniMoveTile(tileToMove, tileToMoveAt, moveSpaces);

                }
                
            }
        }
    }

    //clearing animation class and score and sound
    if (firstMove) {
        if (didMerge) {
            
            setTimeout(function () {
                //displaying score
                if (totalScore > 0) { displayScore(totalScore); }

                //playing sound
                if (!soundMute) {
                    if (!highestSound) {
                        audioMerge.currentTime = 0;
                        audioMerge.play();
                    }
                    else {
                        audioHighestTile.currentTime = 0;
                        audioHighestTile.play();
                    }
                }
                //clearing animation
                aniMergeTileDone = true;
            }, 100)
        }

        else {
            aniMergeTileDone = true;
        }

        if (madeMoves) {
            setTimeout(function () {
                tilesMoveandMergeDown(false, madeMoves, didMerge);
            }, 100);
        }

        else {
            tilesMoveandMergeDown(false, madeMoves, didMerge);
        }

        
    }

    else {
        c = madeMoves
        if (a || b || c){
            if (!soundMute) {audioClick.currentTime = 0; audioClick.play()}
            spawnTile();
        }

        if (!madeMoves) {
            aniMoveTileDone = true;
        }
        

    }

}

//CONTROL RIGHT
function tilesMoveandMergeRight(firstMove = false, a, b) {
    var didMerge = false;
    var totalScore = 0;
    var highestSound = false;
    var madeMoves = false;

    //Main Loop
    for (i = 2; i >= 0; i--) {
        for (j = 0; j < 4; j++) {
            if (game_board[j][i] == 0) { continue; } //empty tile

            if (firstMove && game_board[j][i+1] == game_board[j][i]) {
                //merge right
                didMerge = true;
                aniMergeTileDone = false;
                

                //changing game board data
                game_board[j][i+1] = (game_board[j][i]) * 2;
                //checking and changing highest tile
                if ((game_board[j][i]) * 2 > highestTile) {highestTile = (game_board[j][i]) * 2; updateTileText(highestTile);}
                if ((game_board[j][i]) * 2 > gameHighestTile) { gameHighestTile = (game_board[j][i]) * 2; highestSound = true; }
                //clearing tile that moved
                game_board[j][i] = 0;
                
                var tileToMergeAt = document.getElementById('tile-' + (j+1).toString() + '-' + (i+1+1).toString());
                var tileToMerge = document.getElementById('tile-' + (j+1).toString() + '-' + (i+1).toString());
                

                tileToMergeAt.classList.remove(("value" + tileToMerge.innerText));
                tileToMergeAt.classList.add((("value" + parseInt(tileToMerge.innerText)*2).toString()));

                tileToMergeAt.innerText = (parseInt(tileToMerge.innerText)*2).toString();
                //score
                totalScore += parseInt(tileToMerge.innerText)*2;

                tileToMerge.classList.remove(("value" + tileToMerge.innerText));
                tileToMerge.classList.add('empty')
                tileToMerge.innerText = '';

                tileToMergeAt.classList.add('aniMergeTile');

                aniRemoveMerge(tileToMergeAt.id);

            }
            else if (game_board[j][i+1] == 0) {
                var moveSpaces = 1;
                if (i + 2 <= 3 && game_board[j][i+2] == 0) {
                    var moveSpaces = 2;
                }

                if (i + 3 <= 3 && game_board[j][i+3] == 0) {
                    var moveSpaces = 3;
                }

                if (firstMove && i + moveSpaces + 1 <= 3 && game_board[j][i+ moveSpaces + 1] == game_board[j][i] && !document.getElementById("tile-"+(j+1).toString()+"-"+(i+1+moveSpaces+1).toString()).classList.contains("aniMergeTile")) {
                    
                    //move and merge
                    didMerge = true;
                    madeMoves = true;
                    aniMoveTileDone = false;
                    aniMergeTileDone = false;

                    //changing game board data
                    game_board[j][i + moveSpaces + 1] = (game_board[j][i]) * 2;
                    //checking and changing highest tile
                    if ((game_board[j][i]) * 2 > highestTile) {highestTile = (game_board[j][i]) * 2; updateTileText(highestTile);}
                    if ((game_board[j][i]) * 2 > gameHighestTile) { gameHighestTile = (game_board[j][i]) * 2; highestSound = true; }
                    //clearing tile that moved
                    game_board[j][i] = 0;

                    var tileToMerge = document.getElementById("tile-" + (j+1).toString() + "-" + (i+1).toString());
                    var tileToMergeAt = document.getElementById("tile-" + (j + 1).toString() + "-" + (i + 1+ moveSpaces + 1).toString());

                    //score
                    totalScore += parseInt(tileToMerge.innerText) * 2;
                    
                    tileToMerge.classList.add("aniMoveTileRight" + (moveSpaces+1).toString());

                    aniMoveMergeTile(tileToMerge, tileToMergeAt, moveSpaces);

                }

                else {
                    //just move
                    aniMoveTileDone = false;
                    madeMoves = true;

                    var tileToMoveAt = document.getElementById('tile-' + (j+1).toString() + '-' + (i+1+moveSpaces).toString());
                    var tileToMove = document.getElementById('tile-' + (j + 1).toString() + '-' + (i + 1).toString());

                    game_board[j][i+moveSpaces] = game_board[j][i];
                    game_board[j][i] = 0;

                    tileToMove.classList.add("aniMoveTileRight" + moveSpaces.toString());

                    aniMoveTile(tileToMove, tileToMoveAt, moveSpaces);

                }
                
            }
        }
    }

    //clearing animation class and score and sound
    if (firstMove) {
        if (didMerge) {
            
            setTimeout(function () {
                //displaying score
                if (totalScore > 0) { displayScore(totalScore); }

                //playing sound
                if (!soundMute) {
                    if (!highestSound) {
                        audioMerge.currentTime = 0;
                        audioMerge.play();
                    }
                    else {
                        audioHighestTile.currentTime = 0;
                        audioHighestTile.play();
                    }
                }
                //clearing animation
                aniMergeTileDone = true;
            }, 100)
        }

        else {
            aniMergeTileDone = true;
        }

        if (madeMoves) {
            setTimeout(function () {
                tilesMoveandMergeRight(false, madeMoves, didMerge);
            }, 100);
        }

        else {
            tilesMoveandMergeRight(false, madeMoves, didMerge);
        }

        
    }

    else {
        c = madeMoves
        if (a || b || c){
            if (!soundMute) {audioClick.currentTime = 0; audioClick.play()}
            spawnTile();
        }

        if (!madeMoves) {
            aniMoveTileDone = true;
        }
        

    }

}

//CONTROL LEFT
function tilesMoveandMergeLeft(firstMove = false, a, b) {
    var didMerge = false;
    var totalScore = 0;
    var highestSound = false;
    var madeMoves = false;

    //Main Loop
    for (i = 1; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            if (game_board[j][i] == 0) { continue; } //empty tile

            if (firstMove && game_board[j][i-1] == game_board[j][i]) {
                //merge left
                didMerge = true;
                aniMergeTileDone = false;
                

                //changing game board data
                game_board[j][i-1] = (game_board[j][i]) * 2;
                //checking and changing highest tile
                if ((game_board[j][i]) * 2 > highestTile) {highestTile = (game_board[j][i]) * 2; updateTileText(highestTile);}
                if ((game_board[j][i]) * 2 > gameHighestTile) { gameHighestTile = (game_board[j][i]) * 2; highestSound = true; }
                //clearing tile that moved
                game_board[j][i] = 0;
                
                var tileToMergeAt = document.getElementById('tile-' + (j+1).toString() + '-' + (i+1-1).toString());
                var tileToMerge = document.getElementById('tile-' + (j+1).toString() + '-' + (i+1).toString());
                

                tileToMergeAt.classList.remove(("value" + tileToMerge.innerText));
                tileToMergeAt.classList.add((("value" + parseInt(tileToMerge.innerText)*2).toString()));

                tileToMergeAt.innerText = (parseInt(tileToMerge.innerText)*2).toString();
                //score
                totalScore += parseInt(tileToMerge.innerText)*2;

                tileToMerge.classList.remove(("value" + tileToMerge.innerText));
                tileToMerge.classList.add('empty')
                tileToMerge.innerText = '';

                tileToMergeAt.classList.add('aniMergeTile');

                aniRemoveMerge(tileToMergeAt.id);

            }
            else if (game_board[j][i-1] == 0) {
                var moveSpaces = 1;
                if (i - 2 >= 0 && game_board[j][i-2] == 0) {
                    var moveSpaces = 2;
                }

                if (i - 3 >= 0 && game_board[j][i-3] == 0) {
                    var moveSpaces = 3;
                }

                if (firstMove && i - moveSpaces - 1 >= 0 && game_board[j][i- moveSpaces - 1] == game_board[j][i] && !document.getElementById("tile-"+(j+1).toString()+"-"+(i+1-moveSpaces-1).toString()).classList.contains("aniMergeTile")) {
                    
                    //move and merge
                    didMerge = true;
                    madeMoves = true;
                    aniMoveTileDone = false;
                    aniMergeTileDone = false;

                    //changing game board data
                    game_board[j][i - moveSpaces - 1] = (game_board[j][i]) * 2;
                    //checking and changing highest tile
                    if ((game_board[j][i]) * 2 > highestTile) {highestTile = (game_board[j][i]) * 2; updateTileText(highestTile);}
                    if ((game_board[j][i]) * 2 > gameHighestTile) { gameHighestTile = (game_board[j][i]) * 2; highestSound = true; }
                    //clearing tile that moved
                    game_board[j][i] = 0;

                    var tileToMerge = document.getElementById("tile-" + (j+1).toString() + "-" + (i+1).toString());
                    var tileToMergeAt = document.getElementById("tile-" + (j + 1).toString() + "-" + (i + 1- moveSpaces - 1).toString());

                    //score
                    totalScore += parseInt(tileToMerge.innerText) * 2;
                    
                    tileToMerge.classList.add("aniMoveTileLeft" + (moveSpaces+1).toString());

                    aniMoveMergeTile(tileToMerge, tileToMergeAt, moveSpaces);

                }

                else {
                    //just move
                    aniMoveTileDone = false;
                    madeMoves = true;

                    var tileToMoveAt = document.getElementById('tile-' + (j+1).toString() + '-' + (i+1-moveSpaces).toString());
                    var tileToMove = document.getElementById('tile-' + (j + 1).toString() + '-' + (i + 1).toString());

                    game_board[j][i-moveSpaces] = game_board[j][i];
                    game_board[j][i] = 0;

                    tileToMove.classList.add("aniMoveTileLeft" + moveSpaces.toString());

                    aniMoveTile(tileToMove, tileToMoveAt, moveSpaces);

                }
                
            }
        }
    }

    //clearing animation class and score and sound
    if (firstMove) {
        if (didMerge) {
            
            setTimeout(function () {
                //displaying score
                if (totalScore > 0) { displayScore(totalScore); }

                //playing sound
                if (!soundMute) {
                    if (!highestSound) {
                        audioMerge.currentTime = 0;
                        audioMerge.play();
                    }
                    else {
                        audioHighestTile.currentTime = 0;
                        audioHighestTile.play();
                    }
                }
                //clearing animation
                aniMergeTileDone = true;
            }, 100)
        }

        else {
            aniMergeTileDone = true;
        }

        if (madeMoves) {
            setTimeout(function () {
                tilesMoveandMergeLeft(false, madeMoves, didMerge);
            }, 100);
        }

        else {
            tilesMoveandMergeLeft(false, madeMoves, didMerge);
        }

        
    }

    else {
        c = madeMoves
        if (a || b || c){
            if (!soundMute) {audioClick.currentTime = 0; audioClick.play()}
            spawnTile();
        }

        if (!madeMoves) {
            aniMoveTileDone = true;
        }
        

    }

}

//CAN TILES MERGE CHECK

function tilesCanMergeDown() {
    for (i=2; i>=0; i--) {
        for (j=0; j<4; j++) {
            if(game_board[i][j] == 0) {continue;}

            if(game_board[i+1][j] == game_board[i][j]) {
                return true;
            }
        }
    }
    return false;
}

function tilesCanMergeUp() {
    for (i=1; i<4; i++) {
        for (j=0; j<4; j++) {
            if(game_board[i][j] == 0) {continue;}

            if(game_board[i-1][j] == game_board[i][j]) {
                return true;
            }
        }
    }
    return false;
}

function tilesCanMergeRight() {
    for (i=2; i>=0; i--) {
        for (j=0; j<4; j++) {
            if(game_board[j][i] == 0) {continue;}

            if(game_board[j][i+1] == game_board[j][i]) {
                return true;
            }
        }
    }
    return false;
}

function tilesCanMergeLeft() {
    for (i=1; i<4; i++) {
        for (j=0; j<4; j++) {
            if(game_board[j][i] == 0) {continue;}

            if(game_board[j][i-1] == game_board[j][i]) {
                return true;
            }
        }
    }
    return false;
    
}
