const multiplierCount = (score) => {
  switch (score) {
    case "w1":
      multiplier = odds.home_win;
      break;
    case "w2":
      multiplier = odds.away_win;
      break;
    case "x":
      multiplier = odds.draw;
      break;
  }
  return multiplier;
};
