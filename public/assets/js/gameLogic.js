// Completely separated from the DOM or any javascript game implementation.  Can be imported to any game layer.
// Types: coord {x:int, y:int}, stoneCoord {x:int, y:int, color:string}

// Input a boardObj{} such that boardObj[x][y] = a string of 'black', 'white', or 'ko'.
// Returns a boardObj{} such that boardObj[x][y] = a boolean for whether the spot is a valid move or not
function getValidMoves(boardObj, playerColor){
  var boardSize = _.max(_.keys(boardObj));
  var returnBoard = {};
  for (var x = 1; x <= boardSize; x++){
    var aRow = {};
    returnBoard[x] = aRow;
    for (var y = 1; y <= boardSize; y++){
      if (boardObj[x][y] == 'black' || boardObj[x][y] == 'white' || boardObj[x][y] == 'ko') {
        aRow[y] = false;
      } else{
        aRow[y] = true;
      }
    }
  }
  return returnBoard;
}
// Input a boardObj{}, and a moveCoord {x:int, y:int, color:string}, 
// Returns an array of stoneCoords{x:int, y:int} for dead stones on the board
function deadStones(boardObj, moveCoord) {
  boardObj[moveCoord.x][moveCoord.y] = moveCoord.color;
  var enemyNeighbors = neighboringStones(boardObj, moveCoord, oppositeColor(moveCoord.color));

}

function oppositeColor(colorString) {
  if(colorString == 'black') {return 'white';}
  if(colorString == 'white') {return 'black';}
  return 'empty';
}

// Returns coord list, of valid, on board, neighboring coordinates
function neighboringCoords(boardObj, coord) {
  var boardDim = _.max(_.keys(boardObj));
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

function neighboringStones(boardObj, coord, color) {
  var neighboringCoordsList = neighboringCoords(boardObj, coord);
  var adjStones = [];
  for(var i = 0; i < neighboringCoordsList.length; i++){
    adjStoneCoord = neighboringCoordsList[i];
    if(getColorOfCoord(boardObj, adjStoneCoord) == color){
      adjStones.push(adjStoneCoord);
    }
  }
  return adjStones;
}

function getColorOfCoord(boardObj, coord) {
  return boardObj[coord.x][coord.y];
}

function coordAlreadyInList(coord, coordList) {
  for (var m = coordList.length - 1; m >= 0; m--) {
    if(coord.x == coordList[m].x && coord.y == coordList[m].y){
      return true;
    }
  }
  return false;
}

function recurseGroupCoords (coord, visitedCoords, groupColor) {
  var retList = [coord];
  var neighbors = neighboringStones(coord, groupColor);
  for (var i = neighbors.length - 1; i >= 0; i--) {
    if(!coordAlreadyInList(neighbors[i], visitedCoords)){
      var newVisitedCoords = visitedCoords.concat([neighbors[i]]);
      retList = retList.concat(recurseGroupCoords(neighbors[i], newVisitedCoords, groupColor));
    }
  }
  return retList;
}

function getGroupCoords (stoneCoord) {
  var stoneColor = getColorOfCoord(stoneCoord);
  return recurseGroupCoords(stoneCoord, [stoneCoord], stoneColor);
}

// Gets coordinates of a group of stones if player were to place a stone down at a coordinate
function getHypotheticalGroupCoords(stoneCoord, stoneColor) {
  return recurseGroupCoords(stoneCoord, [stoneCoord], stoneColor);
}
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

function isDeadAfterMakingMove(stoneGroup, move, color){
  var $targetCell = $(targetCellSelector(move.y, move.x));
  // temporarily set the move
  if (color == 'white'){
    $targetCell.addClass('white-move');
  }
  else {
    $targetCell.addClass('black-move');
  }

  var boolRetValue = isDead(stoneGroup);
  // Undo the move
  $targetCell.removeClass('white-move black-move');
  return boolRetValue;
}