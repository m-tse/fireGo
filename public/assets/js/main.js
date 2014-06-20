var fbBaseURL = 'https://blistering-fire-3878.firebaseio.com/';


var gamesListRef = new Firebase('https://blistering-fire-3878.firebaseio.com/games');



function renderMove(moveObj) {
  var $targetCell = $(targetCellSelector(moveObj.row, moveObj.col));

  // even move, white
  if (moveObj.move % 2 === 0) {
    $targetCell.addClass('white-move');
    setBlackPlay();
  // odd move, black
  } else{
    setWhitePlay();
    $targetCell.addClass('black-move');
  }
  $targetCell.addClass('occupied');

  // Check for killed stones/groups
  var dx = [1, -1, 0, 0];
  var dy = [0, 0, 1, -1];
  // for(i = 0; i < 4; i++){

  // }
}

function targetCellSelector(row, col){
  var rowID = 'r' + row;
  var colID = 'c' + col;
  return '#' + rowID + ' ' + '#' + colID;
}
function isValidMove(row, col, moveCount) {
  if ($('#board').hasClass('black-to-play') && !$('#board').hasClass('black-player')) {return false;}
  if ($('#board').hasClass('white-to-play') && !$('#board').hasClass('white-player')) {return false;}
  var $targetCell = $(targetCellSelector(row, col));
  if ($targetCell.hasClass('occupied')) {return false;}
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
      if (isValidMove(row, col, moveCount)) {
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
          renderMove(moveObj);
        });
      } else {
        console.log('invalid move');
      }

    };

      $('#board').show();
      $('#board').empty();
      $('#spectators').show();
      setBlackPlay();
      $('#gameTitle').show();
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
        $('#board').addClass('black-player');
        blackPlayerRef.onDisconnect().remove();
      }
      function playAsWhite () {
        whitePlayerRef.set({name: myName, id: mySpectatorID});
        $('#board').addClass('white-player');
        whitePlayerRef.onDisconnect().remove();
      }


      // Render board grid numbers
      $topRuler = $("<div class='board-ruler ruler-top'></div>");
      $topRuler.appendTo($('#board'));
      for (r = 1; r <= refreshedGame.size; r++){
        var markerHTML = Mustache.render("<div class='ruler-marker'>{{marker}}</div>", {marker: r});
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
  var mustacheHTML = Mustache.render("<div><a id='{{gameID}}' class='gameLink' href='#'>{{label}}</a></div>", gameObj);
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

