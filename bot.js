function botWrapper(vals) {
    return game => botFunc(game, vals);
}

function botFunc(game, vals) {
    let dir, best;

    for (let i=0; i<8; i++) {
        const ball = { ...game.ball };
        const player = extend(game.play, game.play.v, i*Math.PI/4);

        if (isCollide(game.ball, game.play)) {
            const angle = bearing(game.play, game.ball);
            const dist = (game.play.s + game.ball.s)/2;
            const pt = extend(game.play, dist*global.stage.buffer, angle);

            ball.x = pt.x;
            ball.y = pt.y;
        }

        const score = vals[0] * dist(game.goal, ball)
            + vals[2] * bearing(game.goal, ball)
            + vals[1] * dist(game.goal, player)
            + vals[3] * bearing(game.goal, player)
            + vals[4] * dist(player, ball)
            + vals[5] * bearing(player, ball);
        if (i==0 || score>best) {
            best = score; dir = i;
        }
    }

    return dir*Math.PI/4;
}
