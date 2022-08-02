const camelCaseIndexes = (event) => {
  [
    "bet_amount",
    "event_id",
    "away_team",
    "home_team",
    "odds_id",
    "start_at",
    "updated_at",
    "created_at",
  ].forEach((whatakey) => {
    const index = whatakey.indexOf("_");
    let newKey = whatakey.replace("_", "");
    newKey = newKey.split("");
    newKey[index] = newKey[index].toUpperCase();
    newKey = newKey.join("");
    event[newKey] = event[whatakey];
    delete event[whatakey];
  });
  return event;
};

export { camelCaseIndexes };
