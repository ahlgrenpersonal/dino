export const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function result(board) {
  for (const line of LINES) if (board[line[0]] && line.every(i => board[i] === board[line[0]])) return { winner: board[line[0]], line };
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
}
export function winningMoves(board, piece) {
  return board.flatMap((value, i) => {
    if (value) return [];
    const next = [...board]; next[i] = piece;
    return result(next)?.winner === piece ? [i] : [];
  });
}
export function chooseMove(board, avoidChance = 0, random = Math.random) {
  if (result(board)) return null;
  let choices = board.flatMap((value, i) => value ? [] : [i]);
  if (avoidChance > 0) {
    const wins = winningMoves(board, 'O');
    const other = choices.filter(i => !wins.includes(i));
    if (wins.length && other.length && random() < avoidChance / 100) choices = other;
  }
  return choices[Math.floor(random() * choices.length)];
}
