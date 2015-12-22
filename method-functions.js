module.exports = {
  majority: function(votes) {
    var winner = {name: "no winner", votes: 0};
    votes.forEach(function(e,i,arr) {
      if (e.votes > winner.votes) winner = e;
    });
    return winner
  },
  fpp: function(votes) {
    var winner = {name: "no winner", votes: 0};
    votes.forEach(function(e,i,arr) {
      if (e.votes > winner.votes) winner = e;
    });
    return winner
  },
  okay: function(votes) {
    var winner = {name: "no winner", votes: 0};
    votes.forEach(function(e,i,arr) {
      if (e.votes > winner.votes) winner = e;
    });
    return winner
  },
}
