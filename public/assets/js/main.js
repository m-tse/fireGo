var fbBaseURL = 'https://blistering-fire-3878.firebaseio.com/';


var gamesListRef = new Firebase('https://blistering-fire-3878.firebaseio.com/games');



function renderMove(moveObj) {
  var $targetCell = $(targetCellSelector(moveObj.row, moveObj.col));
  var currentPlayerColor = '';
  // even move, white
  if (moveObj.move % 2 === 0) {
    $targetCell.addClass('white-move');
    currentPlayerColor = 'white';
    setBlackPlay();
  // odd move, black
  } else{
    setWhitePlay();
    $targetCell.addClass('black-move');
    currentPlayerColor = 'black';
  }
  // $targetCell.addClass('occupied');
  setValidMovesCSS();

  function neighboringCoords(coord) {
    var boardDim = $('.stone-row').length;
    var dx = [1, -1, 0, 0];
    var dy = [0, 0, 1, -1];
    var adjCoords = [];
    for(var i = 0; i < 4; i++){
      var adjStoneX = coord.x + dx[i];
      var adjStoneY = coord.y + dy[i];
      if(adjStoneX >= 1 && adjStoneX <= boardDim && adjStoneY >= 1 && adjStoneY <= boardDim) {
        adjCoords.push({x:adjStoneX, y:adjStoneY});
      }
    }
    return adjCoords;
  }

  function neighboringStones(stoneCoord, colorOption) {
    var neighboringCoordsList = neighboringCoords(stoneCoord);
    var adjStones = [];
    for(var i = 0; i < neighboringCoordsList.length; i++){
      adjStoneCoord = neighboringCoordsList[i];
      if(colorOption !== null){
        if(getColorOfCoord(adjStoneCoord) == colorOption){
          adjStones.push(adjStoneCoord);
        }
      }
      else {
        if(getColorOfCoord(adjStoneCoord) != 'empty'){
          adjStones.push(adjStoneCoord);
        }
      }
    }
    return adjStones;
  }

  function oppositeColor(colorString) {
    if(colorString == 'black') {return 'white';}
    if(colorString == 'white') {return 'black';}
    return 'empty';
  }

  function getColorOfCoord(stoneCoord) {
    var rowCoord = 'r' + stoneCoord.y;
    var colCoord = 'c' + stoneCoord.x;
    var jquerySelector = Mustache.render("#{{rowCoord}} #{{colCoord}}", {rowCoord: rowCoord, colCoord: colCoord});
    var $stoneDiv = $(jquerySelector);
    if($stoneDiv.hasClass('black-move')) {return 'black';}
    if($stoneDiv.hasClass('white-move')) {return 'white';}
    return 'empty';
  }

  function coordAlreadyInList(coord, coordList) {
    for (var i = coordList.length - 1; i >= 0; i--) {
      if(coord.x == coordList[i].x && coord.y == coordList[i].y){
        return true;
      }
    }
    return false;
  }

  // Check for killed stones/groups
  /*
    1. Check 4 adjacent stones for enemy stones.
    2. For Each adj enemy stone, peform a recursive BFS to locate all connected enemy stones.
    3. Among stones of that group, perform BFS for liberties.
    4. No liberties means death, remove those stones from the board
  */
  // 1.
  var enemyNeighbors = neighboringStones({x:moveObj.col, y:moveObj.row}, oppositeColor(currentPlayerColor));
  // 2.
  function getGroupCoords (stoneCoord) {

    function recurse (coord, visitedCoords) {
      var myColor = getColorOfCoord(coord);
      var retList = [coord];
      var neighbors = neighboringStones(coord, myColor);
      for (var i = neighbors.length - 1; i >= 0; i--) {
        if(!coordAlreadyInList(neighbors[i], visitedCoords)){
          var newVisitedCoords = visitedCoords.concat([neighbors[i]]);
          retList = retList.concat(recurse(neighbors[i], newVisitedCoords));
        }
      }
      return retList;
    }

    return recurse(stoneCoord, [stoneCoord]);
  }
  var enemyGroups = [];
  for (var i = 0; i < enemyNeighbors.length; i++) {
    enemyGroups.push(getGroupCoords(enemyNeighbors[i]));
  }

  // 3.
  function isDead(stoneGroup){
    for (var i = stoneGroup.length - 1; i >= 0; i--) {
      neighborCoords = neighboringCoords(stoneGroup[i]);
      for (var j = neighborCoords.length - 1; j >= 0; j--) {
        if(getColorOfCoord(neighborCoords[j]) == 'empty'){
          return false;
        }
      }
    }
    return true;
  }
  var deadStones = [];
  for (var j = enemyGroups.length - 1; j >= 0; j--) {
    var group = enemyGroups[j];
    if(isDead(group)){
      deadStones = deadStones.concat(group);
    }
  }
  // 4.
  for (var k = deadStones.length - 1; k >= 0; k--) {
    var targetStoneSelector = targetCellSelector(deadStones[k].y, deadStones[k].x);
    var $targetStone = $(targetStoneSelector);
    // update score count
    if($targetStone.hasClass('black-move')){
      addScore('black', 1);
    }
    else {
      addScore('white', 1);
    }
    $targetStone.removeClass("white-move black-move");
  }

}

function addScore(playerColor, value) {
  var $targetDiv;
  if(playerColor == 'black'){
    $targetDiv = $('.js-black-stone-count');
  } else {
    $targetDiv = $('.js-white-stone-count');
  }
  currentScore = parseInt($targetDiv.text());
  $targetDiv.text(currentScore + value);

}

function targetCellSelector(row, col){
  var rowID = 'r' + row;
  var colID = 'c' + col;
  return '#' + rowID + ' ' + '#' + colID;
}
function isValidMove(row, col) {
  if ($('#board').hasClass('black-to-play') && !$('#board').hasClass('black-player')) {return false;}
  if ($('#board').hasClass('white-to-play') && !$('#board').hasClass('white-player')) {return false;}
  var $targetCell = $(targetCellSelector(row, col));
  if ($targetCell.hasClass('white-move') || $targetCell.hasClass('black-move')) {return false;}
  return true;
}

function updateMoveCounterDisplay(moveCount) {
  var color = 'Black';
  if (moveCount % 2 === 0) {color = 'White';}
  var obj = {
    moveCount: moveCount,
    color: color
  };
  var displayString = Mustache.render("Move: {{moveCount}}, {{color}} To Play", obj);
  $('#moveDisplay').text(displayString);
}

function setBlackPlay() {
  $('#board').addClass('black-to-play');
  $('#board').removeClass('white-to-play');
}

function setWhitePlay() {
  $('#board').addClass('white-to-play');
  $('#board').removeClass('black-to-play');
}

function getRowOfCellDiv() {

}
function setValidMovesCSS() {
  $possibleCells = $('.stone-col');
  for (var i = $possibleCells.length - 1; i >= 0; i--) {
    var row = parseInt($($possibleCells[i]).parent('.stone-row').attr('id').substring(1));
    var col = parseInt($($possibleCells[i]).attr('id').substring(1));
    if(isValidMove(row, col)){
      $($possibleCells[i]).addClass('valid-move');
    }
    else {
      $($possibleCells[i]).removeClass('valid-move');
    }
  }

}

function loadGame(event) {
  // Refresh the game data upon open
  var gameRef = new Firebase(fbBaseURL + '/games/' + event.data.gameID);


  var myName = "Anonymous User";
  var spectatorsRef = gameRef.child('spectators');
  var mySpectatorEntryRef = spectatorsRef.push({name: myName});
  mySpectatorEntryRef.onDisconnect().remove();

  // Load up the game
  gameRef.once('value', function(gameSnapshot) {

    var refreshedGame = gameSnapshot.val();
    // What to do when we click to make a move
    var clickCell = function (clickEvent) {
      var row = clickEvent.data.row;
      var col = clickEvent.data.col;
      var moveCount = clickEvent.data.moveCount;
      // Verify that the move is valid.
      if (isValidMove(row, col)) {
        var moveCountRef = new Firebase(fbBaseURL + '/games/' + event.data.gameID + '/moveCount');
        moveCountRef.once('value', function(moveCountSnapshot) {
          var moveCount = moveCountSnapshot.val();

          var currentMoveCount = moveCount;
          var newMoveCount = currentMoveCount + 1;
          gameRef.child('moveCount').set(newMoveCount);
          var gameMoves = new Firebase(fbBaseURL + '/games/' + event.data.gameID + '/moves');
          gameMoves.push({row:clickEvent.data.row, col:clickEvent.data.col, move:currentMoveCount});
          moveObj = {
            row: row,
            col: col,
            move: currentMoveCount};
        });
      } else {
        console.log('invalid move');
      }

    };
      $('#activeGame').show();

      $('#board').empty();
      $('#spectators').empty();
      setBlackPlay();
      $('#gameTitle').text(refreshedGame.name);
      updateMoveCounterDisplay(refreshedGame.moveCount);
      // Register Spectator Button Events
      $('#playAsBlack').click({}, playAsBlack);
      $('#playAsWhite').click({}, playAsWhite);
      var blackPlayerRef = gameRef.child('blackPlayer');
      var whitePlayerRef = gameRef.child('whitePlayer');
      var mySpectatorID = mySpectatorEntryRef.name();
      blackPlayerRef.on('value', function(snapshot){
        if (snapshot.val() !== null) {
          $('#playAsBlack').addClass('disabled');
        } else {
          $('#playAsBlack').removeClass('disabled');
        }
      });
      whitePlayerRef.on('value', function(snapshot){
        if (snapshot.val() !== null) {
          $('#playAsWhite').addClass('disabled');
        } else {
          $('#playAsWhite').removeClass('disabled');
        }
      });
      function playAsBlack () {
        blackPlayerRef.set({name: myName, id: mySpectatorID});
        $('#playAsBlack').addClass('btn-primary');
        $('#playAsWhite').addClass('disabled');
        $('#board').addClass('black-player');
        setValidMovesCSS();
        blackPlayerRef.onDisconnect().remove();
      }
      function playAsWhite () {
        whitePlayerRef.set({name: myName, id: mySpectatorID});
        $('#playAsWhite').addClass('btn-primary');
        $('#playAsBlack').addClass('disabled');
        $('#board').addClass('white-player');
        setValidMovesCSS();
        whitePlayerRef.onDisconnect().remove();
      }


      // Render board grid numbers
      $topRuler = $("<div class='board-ruler ruler-top'></div>");
      $topRuler.appendTo($('#board'));
      for (r = 0; r < refreshedGame.size; r++){
        var alpha = String.fromCharCode('A'.charCodeAt(0) + r);
        var num = r + 1;
        var markerHTML = Mustache.render("<div class='ruler-marker'>{{marker}}</div>", {marker: alpha});
        $marker = $(markerHTML);
        $marker.appendTo($topRuler);
      }

      $leftRuler = $("<div class='board-ruler ruler-vertical'></div>");
      $leftRuler.appendTo($('#board'));
      for (r = 1; r <= refreshedGame.size; r++){
        var markerHTML = Mustache.render("<div class='ruler-marker'>{{marker}}</div>", {marker: r});
        $marker = $(markerHTML);
        $marker.appendTo($leftRuler);
      }

      // Render the board grid
      for (r = 0; r < refreshedGame.size - 1; r++) {
        $gridRow = $("<div class='grid-row'></div>");
        $gridRow.appendTo($('#board'));
        for (c = 0; c < refreshedGame.size - 1; c++) {
          $gridSquare = $("<div class='grid-square'></div>");
          $gridSquare.appendTo($gridRow);
        }
      }

      // Render the board stones
      for (r = 1; r <= refreshedGame.size; r++) {
        var row = {
          rowID: 'r' + r
        };
        var rowHTML = Mustache.render("<div class='stone-row' id='{{rowID}}'></div>", row);
        var $row = $(rowHTML);
        $row.appendTo($('#board'));
        for (c = 1; c <= refreshedGame.size; c++) {
          var col = { colID: 'c' + c};
          var cellHTML = Mustache.render("<div class='stone-col' id={{colID}}></div>", col);
          var $cell = $(cellHTML);
          $cell.appendTo($row);

          // Click callback
          $cell.click({row: r, col: c, moveCount: refreshedGame.moveCount}, clickCell);
        }
      }

      setValidMovesCSS();

      // Set callback for new loaded moves
      var movesListRef = gameRef.child('moves');
      movesListRef.on('child_added', function(snapshot){
        var move = snapshot.val();
        renderMove(move);
      });

      // Callback for moveCount changing
      var moveCountRef = gameRef.child('moveCount');
      moveCountRef.on('value', function(snapshot) {
        updateMoveCounterDisplay(snapshot.val());
      });

      // Callback for new game spectators
      spectatorsRef.on('child_added', function(snapshot){
        spectatorObj = _.extend(snapshot.val(), {id: snapshot.name()});
        var spectatorHTML = Mustache.render("<li class='spectator-name' data-id='{{id}}'>{{name}}</li>", spectatorObj);
        $('#spectators .spectator-list').append($(spectatorHTML));
      });

      // Callback for spectators leaving
      spectatorsRef.on('child_removed', function(snapshot){
        var spectatorID = snapshot.name();
        var jquerySelector = Mustache.render(".spectator-name[data-id='{{id}}']", {id: spectatorID});
        $(jquerySelector).remove();
      });

  });
}

function listNameLabel (game) {
  return Mustache.render("{{name}} | {{size}}x{{size}} | Move {{moveCount}}", game);
}

// callback to load up a list of all games
gamesListRef.limit(10).on('child_added', function (snapshot) {
  var gameID = snapshot.name();
  var game = snapshot.val();
  var gameLabel = listNameLabel(game);
  var gameObj = {
    label: gameLabel,
    gameID: gameID
  };
  var mustacheHTML = Mustache.render("<a class='list-group-item' id='{{gameID}}' class='gameLink' href='#'>{{label}}</a>", gameObj);
  var jqueryEl = $(mustacheHTML);
  jqueryEl.appendTo($('#messagesDiv'));

  // Open a specific game
  jqueryEl.click({gameID: gameID}, loadGame);

  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
});

// Update labels for games in list as they come in.
gamesListRef.on('child_changed', function(snapshot) {
  var game = _.extend(snapshot.val(), {gameID: snapshot.name()});
  var newLabel = listNameLabel(game);
  $('#' + snapshot.name()).text(newLabel);

});

// Create a new game
$('#createGame').click(function () {
  var gameName = $('#gameName').val();
  var dateCreated = new Date();

  gamesListRef.push({name: gameName, size:9, moveCount:1});
});

