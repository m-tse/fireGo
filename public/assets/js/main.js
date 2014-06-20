var fbBaseURL = 'https://blistering-fire-3878.firebaseio.com/';


var gamesListRef = new Firebase('https://blistering-fire-3878.firebaseio.com/games');


function targetCellSelector(row, col){
  var rowID = 'r' + row;
  var colID = 'c' + col;
  return '#' + rowID + ' ' + '#' + colID;
}

function renderStone(moveObj) {
  // Render the move on the board
  // var rowID = 'r' + moveObj.row;
  // var colID = 'c' + moveObj.col;
  var $targetCell = $(targetCellSelector(moveObj.row, moveObj.col));

  // even move, white
  if (moveObj.move % 2 === 0) {
    $targetCell.addClass('white-move');
  // odd move, black
  } else{
    $targetCell.addClass('black-move');
  }
  $targetCell.addClass('occupied');
}

function isValidMove(row, col) {
  var $targetCell = $(targetCellSelector(row, col));
  return !$targetCell.hasClass('occupied');
}

function moveDisplayLabel(game) {
  var color = 'Black';
  if (game.moveCount % 2 === 0) {color = 'White';}
  extendedGame = _.extend(game, {color:color});
  return Mustache.render("Move: {{moveCount}}, {{color}} To Play", extendedGame);
}

var loadGame = function(event) {
  // Refresh the game data upon open
  var gameRef = new Firebase(fbBaseURL + '/games/' + event.data.gameID);


  // Load up the game
  gameRef.once('value', function(gameSnapshot) {
    // console.log('game reloaded');
    var refreshedGame = gameSnapshot.val();
    // console.log(refreshedGame);
    // What to do when we click to make a move
    var clickCell = function (clickEvent) {
      var row = clickEvent.data.row;
      var col = clickEvent.data.col;
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
          renderStone(moveObj);

        });
      } else {
        console.log('invalid move');
      }


    };

      $('#board').show();
      $('#board').empty();
      $('#gameTitle').show();
      $('#gameTitle').text(refreshedGame.name);
      $('#moveDisplay').text(moveDisplayLabel(refreshedGame));

      // Render the board
      for (r = 0; r < refreshedGame.size; r++) {
        var row = {
          rowID: 'r' + r
        };
        var rowHTML = Mustache.render("<div class='row' id='{{rowID}}'></div>", row);
        var $row = $(rowHTML);
        $row.appendTo($('#board'));
        for (c = 0; c < refreshedGame.size; c++) {
          var col = { colID: 'c' + c};
          var cellHTML = Mustache.render("<div class='col' id={{colID}}></div>", col);
          var $cell = $(cellHTML);
          $cell.appendTo($row);

          // Click callback
          $cell.click({row: r, col: c}, clickCell);
        }
      }

      // Set callback for new loaded moves
      var movesListRef = gameRef.child('moves');
      movesListRef.on('child_added', function(snapshot){
        var move = snapshot.val();
        renderStone(move);
        console.log(move);
      });
  });


};

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

