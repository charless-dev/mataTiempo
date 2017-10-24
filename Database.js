var sqlite3 = require('sqlite3').verbose(),
db = new sqlite3.Database('puntajes'), DB = {};

DB.createTable = function() {
	db.run("DROP TABLE IF EXISTS puntajes");
	db.run("CREATE TABLE IF NOT EXISTS puntujes (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, puntaje INTEGER)");
	console.log("La tabla puntajes ha sido correctamente creada");
}

DB.insertScore = function(userScore) {
	var stmt = db.prepare("INSERT INTO puntajes VALUES (?,?,?)");
	stmt.run(null, userScore.username, userScore.puntaje);
	stmt.finalize();
}

DB.getScores = function(callback) {
	db.all("SELECT * FROM puntajes", function(err, rows) {
		if(err) {
			throw err;
		}
		else {
			callback(null, rows);
		}
	});
}

module.exports = DB;