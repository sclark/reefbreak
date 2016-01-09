module.exports = {
  majority: function(votes, options) {
    var winner = {name: "no winner", votes: 0};
    options.forEach(function(e,i,arr) {
      if (e.votes > winner.votes) winner = e;
    });
    return winner;
  },
  okay: function(votes, options) {
    var winner = {name: "no winner", votes: 0};
    options.forEach(function(e,i,arr) {
      if (e.votes > winner.votes) winner = e;
    });
    return winner;
  },
  av: function(votes, options) {
    for (var i = 0; i < votes.length; i++) {
      votes[i] = votes[i].vote;
    }
    for (var i = 0; i < options.length; i++) {
      options[i] = options[i].name;
    }

    if (votes.length === 0) return {name: "no winner", votes: 0};
    function tally(votes, options) {
      var results = [];
      options.forEach(function(e, i, arr) {
        results.push(0);
      });
      votes.forEach(function(e, i, arr) {
        results[options.indexOf(e[0])] += 1;
      });
      results.forEach(function(e, i, arr) {
        arr[i] = e/votes.length;
      });
      return results;
    }
    function winnerIndex(results) {
      if (results.length == 1) return 0;
      var index = -1;
      results.forEach(function(e, i, arr) {
        if (e > 0.5) index = i;
      });
      return index;
    }
    function looserIndex(results) {
      var min = Infinity;
      var index = -1;
      results.forEach(function(e, i, arr) {
        if (e < min && e > 0) {
          min = e;
          index = i;
        }
      });
      return index;
    }
    function dropCanidate(canidate, votes) {
      votes.forEach(function(e, i, arr) {
        if (e[0] === canidate) arr[i].shift();
      });
      return votes;
    }
    do {
      var results = tally(votes, options);
      var winner = winnerIndex(results);
      votes = dropCanidate(options[looserIndex(results)], votes);
    } while (winner === -1);
    return {name: options[winner], votes: results[winner]};
  }
}
