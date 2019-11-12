const global = {
    stage: {
        w: 400, h: 300,
        speed: 0.01, buffer: 1.1
    },
    size: {
        ball: 0.05,
        goal: 0.02,
        play: 0.1,
    },
    mouse: {
        x: 0, y:0,
    }
};

const game = {
    state: { done:false, time:0 },
    ball: { x: 0.8, y: 0.5, s: global.size.ball },
    play: { x: 0.9, y: 0.5, s: global.size.play },
    goal: { x: 0.2, y: 0.5, s: global.size.goal },
};

// === util funcs ===
// NOTE: y points up, x points right
// NOTE: angle goes anti-clockwise, starting from east
function $(css, ele=null) {
    if (!ele) { ele = document; }
    return [].slice.call(ele.querySelectorAll(css));
}

function dist(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function bearing(a, b) {
    // NOTE: returns angle of b from a
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const angle = Math.atan(Math.abs(dy/dx));

    if (dy<0) {
        return (dx>0) ? angle : Math.PI-angle;
    } else {
        return (dx<0) ? Math.PI+angle : (2*Math.PI)-angle;
    }
}

function extend(pt, dist, angle) {
    // NOTE: given old pt, return new pt
    const dx = Math.abs(Math.cos(angle)*dist);
    const dy = Math.abs(Math.sin(angle)*dist);

    if (angle<Math.PI/2) { return { x: pt.x+dx, y: pt.y-dy }; }
    if (angle<Math.PI) { return { x: pt.x-dx, y: pt.y-dy }; }
    if (angle<Math.PI*3/2) { return { x: pt.x-dx, y: pt.y+dy }; }
    return { x: pt.x+dx, y: pt.y+dy };
}

function isCollide(a, b) {
    // NOTE: assumes a, b are points with {x, y}
    return dist(a, b) < (a.s + b.s)/2;
}

// === mouse funcs
function onMouseMove(evt) {
    global.mouse.x = evt.layerX / global.stage.w;
    global.mouse.y = evt.layerY / global.stage.h;
}

function playerMove(player) {
    return bearing(player, global.mouse);
}

// === game funcs
function update(getMovementAngle) {
    function draw(ele, info) {
        ele.style.top = `${(info.y - info.s/2)*100}%`;
        ele.style.left = `${(info.x - info.s/2)*100}%`;

        ele.style.width = `${info.s*100}%`;
        ele.style.paddingBottom = `${info.s*100}%`;
    }

    function checkLimits(x) {
        return Math.min(1.0, Math.max(x, 0.0));
    }

    if (game.state.done) { 
        return game.state.time; 
    } else {
        game.state.time += 1;
    }

    // NOTE: moving player based on algo
    const pt = extend(game.play, global.stage.speed,
        getMovementAngle(game.play));
    game.play.x = pt.x; game.play.y = pt.y;

    // NOTE: kick ball away from player
    if (isCollide(game.ball, game.play)) {
        const angle = bearing(game.play, game.ball);
        const dist = (game.play.s + game.ball.s)/2;
        const pt = extend(game.play, dist*global.stage.buffer, angle);

        game.ball.x = pt.x;
        game.ball.y = pt.y;
    }

    // NOTE: checking bounds
    game.ball.x = checkLimits(game.ball.x);
    game.ball.y = checkLimits(game.ball.y);
    game.ball.x = checkLimits(game.ball.x);
    game.ball.y = checkLimits(game.ball.y);

    // NOTE: end game if game over
    if (isCollide(game.ball, game.goal)) {
        game.state.done = true;
    }

    // NOTE: drawing everything
    draw($('.ball')[0], game.ball);
    draw($('.goal')[0], game.goal);
    draw($('.play')[0], game.play);

    const stage = $('.game')[0];
    stage.style.width = global.stage.w + 'px';
    stage.style.height = global.stage.h + 'px';
}

window.onload = () => {
    $('#game1')[0].addEventListener('mousemove', onMouseMove);

    function loop() {
        update(playerMove);
        setTimeout(loop, 1000/30);
    }

    loop();
};
