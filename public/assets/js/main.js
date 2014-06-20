var fbBaseURL = 'https://blistering-fire-3878.firebaseio.com/';


var gamesListRef = new Firebase('https://blistering-fire-3878.firebaseio.com/games');


function renderStone(row, col, move) {
  // Render the move on the board
  var rowID = 'r' + row;
  var colID = 'c' + col;
  var selector = '#' + rowID + ' ' + '#' + colID;
  var $targetCell = $(selector);
  // even move, white
  if (move % 2 === 0) {
    $targetCell.addClass('white-move');
  // odd move, black
  } else{
    $targetCell.addClass('black-move');
  }
  $targetCell.addClass('occupied');
}

var loadGame = function(event) {
  // Refresh the game data upon open
  var gameRef = new Firebase(fbBaseURL + '/games/' + event.data.gameID);
  gameRef.on('value', function(gameSnapshot) {
    // console.log('game reloaded');
    var refreshedGame = gameSnapshot.val();
    console.log(refreshedGame);
    // What to do when we click to make a move
    var clickCell = function (clickEvent) {
      var currentMoveCount = refreshedGame.moveCount;
      var newMoveCount = currentMoveCount + 1;
      gameRef.child('moveCount').set(newMoveCount);
      var gameMoves = new Firebase(fbBaseURL + '/games/' + event.data.gameID + '/moves');
      gameMoves.push({row:clickEvent.data.row, col:clickEvent.data.col, move:currentMoveCount});

      renderStone(clickEvent.data.row, clickEvent.data.col, currentMoveCount);
    };

    if (!$('#board').is(":visible")) {
      $('#board').show();
      $('#board').empty();
      $('#gameTitle').show();
      $('#gameTitle').text(refreshedGame.name);


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
    }
  });
};

// callback to load up a list of all games
gamesListRef.limit(10).on('child_added', function (snapshot) {
  var gameID = snapshot.name();
  var game = snapshot.val();
  var gameObj = {
    name: game.name,
    size: game.size,
    move: game.moveCount
  };
  var mustacheHTML = Mustache.render("<div><a class='gameLink' href='#'>{{name}} | {{size}}x{{size}} | Move {{move}}</a></div>", gameObj);
  var jqueryEl = $(mustacheHTML);
  jqueryEl.appendTo($('#messagesDiv'));

  // Open a specific game
  jqueryEl.click({gameID: gameID}, loadGame);

  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
});

// Create a new game

$('#testButton').click(function () {
  var gameName = $('#gameName').val();
  var dateCreated = new Date();

  gamesListRef.push({name: gameName, size:9, moveCount:1});
});

