/* Game configuration */
const title_delay = 2000;
const player_diam = 10;
const enemy_diam = 10;
const player_color = "DeepSkyBlue";
const enemy_color = "red";
const player_speed = 250;
const enemy_speed = 200;
const text_color = "#2ecc71";
/* Debug variables */
const LOG_KEYS_EVERY_FRAME = false;
const LOG_DELTA_EVERY_FRAME = false;
/* Game initialization */
window.onload = function() {
    /*
        After title_delay (ms) has passed, the title will be faded out, to the intro screen.
        After the user has clicked, the game will be setup, with the enemy in the corner opposite the player.
        After the game is setup, the event loop will be started through an EaselJS ticker.
    */
    setTimeout(function() {
        $("#title").fadeTo("slow", 0, function() {
            document.getElementById("intro").className = "screen";
            window.addEventListener("click", function() {
                document.getElementById("intro").className = "hidden screen";
                document.getElementById("gameCanvas").className = "";
                stage = new createjs.Stage("gameCanvas");
                player = new createjs.Shape();
                player.graphics.beginFill(player_color).drawCircle(0, 0, player_diam);
                player.x = 100;
                player.y = 100;
                stage.addChild(player);
                enemy = new createjs.Shape();
                enemy.graphics.beginFill(enemy_color).drawCircle(0, 0, enemy_diam);
                enemy.x = stage.canvas.width - player.x;
                enemy.y = stage.canvas.height - player.y;
                stage.addChild(enemy);
                scoreText = new createjs.Text("Score: " + score, "24px Arial", text_color);
                scoreText.x = 25;
                scoreText.y = 25;
                stage.addChild(scoreText);
                createjs.Ticker.addEventListener("tick", gameloop);
                createjs.Ticker.setFPS(60);
            }, false);
        });
    }, title_delay);
};
/* Global variables */
var stage, player, enemy, keysDown = {},
    score = 0,
    lost = false,
    scoreText, lostMessageApplied = false;
/* Game logic loop */
function gameloop(e) {
    if (!lost) {
        (function(m) { // player movement
            if (37 in keysDown && player.x > 0) {
                player.x -= player_speed * m;
            }
            if (38 in keysDown && player.y > 0) {
                player.y -= player_speed * m;
            }
            if (39 in keysDown && player.x < stage.canvas.width) {
                player.x += player_speed * m;
            }
            if (40 in keysDown && player.y < stage.canvas.height) {
                player.y += player_speed * m;
            }
        })(e.delta / 1000);
        var distance = Math.sqrt(((enemy.x - player.x) * (enemy.x - player.x)) + ((enemy.y - player.y) * (enemy.y - player.y)));
        (function(d) { // score / hit detection
            if (d < 20) {
                lost = true;
            }
            if (d <= 30) {
                score += 1000;
            }
            if (d <= 40) {
                score += 500;
            }
            if (d <= 50) {
                score += 250;
            }
            if (d <= 75) {
                score += 100;
            }
            if (d < 100) {
                score += 10;
            }
            if (d > 100) {
                score += 1;
            }
        })(distance);
        (function(m) { // enemy logic
            if (enemy.x < player.x) {
                enemy.x += enemy_speed * m;
            }
            if (enemy.x > player.x) {
                enemy.x -= enemy_speed * m;
            }
            if (enemy.y < player.y) {
                enemy.y += enemy_speed * m;
            }
            if (enemy.y > player.y) {
                enemy.y -= enemy_speed * m;
            }
        })(e.delta / 1000);
        (function() { // dialogs / messages
            scoreText.text = "Score: " + score;
        })();
        (function() { // debug
            if (LOG_KEYS_EVERY_FRAME) {
                console.log(keysDown);
            }
            if (LOG_DELTA_EVERY_FRAME) {
                console.log(e.delta);
            }
        })();
        stage.update();
    } else if (lost) {
        document.getElementById("lost").className = "screen";
        document.body.innerHTML = document.body.innerHTML.replace(/@score@/g, score);
        if (localStorage.getItem("highScore") === null) { // if the user doesn't have a high score, set one.
            localStorage.setItem("highScore", score);
        } else if (localStorage.getItem("highScore") < score) {
            localStorage.setItem("highScore", score);
        }
        var highScore = localStorage.getItem("highScore");
        document.body.innerHTML = document.body.innerHTML.replace(/@highScore@/g, highScore);
        if (keysDown[32]) { // reload page if user presses space
            window.location.assign(window.location.href);
        }
    }
}
/* Event listeners */
addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);
