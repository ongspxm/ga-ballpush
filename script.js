const FPS = 60;
const MAX_FRAME_COUNT = 300;

const SCORE_GAME_TIME = 1.0;
const SCORE_BALL_CONTACT = 1.0;
const SCORE_DIST_BALL_PLAY = 1.0;
const SCORE_DIST_BALL_GOAL = 1.0;

function fitness(game) {
    const time = game.state.time;

    return SCORE_DIST_BALL_PLAY * ((game.info.ballDistPlayer/time) * -1)
        + SCORE_DIST_BALL_GOAL * ((game.info.ballDistGoal/time) * -1)
        + SCORE_GAME_TIME * ((time/MAX_FRAME_COUNT) * -1)
        + SCORE_BALL_CONTACT * (game.info.ballContact/time);
}

const ga = GA();
ga.genesis();

let frameId = 0;
let generationId = 0;

let games = [];
let chroms = [];

function randomizeLocation() {
    global.initial.ball.x = Math.random();
    global.initial.ball.y = Math.random();
    global.initial.goal.x = Math.random();
    global.initial.goal.y = Math.random();
    global.initial.play.x = Math.random();
    global.initial.play.y = Math.random();
}

function reset() {
    frameId = 0;
    generationId += 1;

    // NOTE: if everything can touch, make it swap place
    const temp = ga.getChromosomes();
    if (temp[temp.length-1].done) {
        randomizeLocation();
    }

    ga.populate();
    chromos = ga.getChromosomes();

    const html = [];
    const content = '<div class="goal"></div>'
        + '<div class="play"></div>'
        + '<div class="ball"></div>';

    games = [];
    for (let i=0; i<chromos.length; i+=1) {
        games.push(genGame());
        html.push(`<div id="game${i}" class="game">${content}</div>`)
    }

    $('#games')[0].innerHTML = html.join('');
}

let timer;
function run() {
    $('#info-frame')[0].innerText = frameId;
    $('#info-generation')[0].innerText = generationId;

    if (games.length == 0) { reset(); }

    if (frameId > MAX_FRAME_COUNT) {
        for (let i=0; i<chromos.length; i+=1) {
            chromos[i].score = fitness(games[i]);
            chromos[i].done = games[i].state.done;
        }

        const mul = 10000;
        $('#info-score')[0].innerText = chromos.slice(0, 3)
            .map(x => parseInt(x.score*mul)/mul).join(' ');

        ga.cull();
        reset();
    }

    for (let i=0; i<chromos.length; i+=1) {
        update(games[i], botWrapper(chromos[i].vals),
            $(`#game${i}`)[0]);
    }

    frameId += 1;
    timer = setTimeout(run, 1000/FPS);
}

const gamePlayer = genGame();
function runPlayer() {
    $('#gameP')[0].addEventListener('mousemove', onMouseMove);
    global.stage.side = 400;

    update(gamePlayer, playerMove);
    timer = setTimeout(runPlayer, 1000/FPS);
}

function pause() {
    clearTimeout(timer);
}
