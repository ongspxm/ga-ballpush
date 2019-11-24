const CHROMO_VALS_SIZE = 6;
const CHROMO_MUTATE_MAX = 0.2;
const CHROMO_MUTATE_CHANCE = 0.1;
const CHROMO_TRMUTE_CHANCE = 0.3;

const GA_GENERATION_MAX = 100;
const GA_GENERATION_POP_RANDOM = 0.1;
const GA_GENERATION_POP_CROVER = 0.5;
const GA_GENERATION_POP_MUTATE = 0.3;
const GA_GENERATION_POP_TRANSM = 0.3;

function normalize(array) {
    let total = 0;
    for (let i=0; i<array.length; i+=1) {
        total += Math.abs(array[i]);
    }

    const res = [];
    for (let i=0; i<array.length; i+=1) {
        res.push(array[i]/total);
    }

    return res;
}

// === chromosome funcs
function makeChromo(vals) {
    return { vals: normalize(vals), score: null, done: false };
}

function genChromo() {
    const vals = [];
    for (let i=0; i<CHROMO_VALS_SIZE; i+=1) {
        vals.push(Math.random()*2 - 1.0);
    }

    return makeChromo(vals);
}

function crossover(a, b) {
    const vals = [];
    for (let i=0; i<a.vals.length; i+=1) {
        vals.push(a.vals[i] + b.vals[i]);
    }

    return makeChromo(vals);
}

function mutate(x) {
    const vals = [];
    for (let i=0; i<x.vals.length; i+=1) {
        let chance = Math.random()*2 - 1.0;
        if (Math.abs(chance) > CHROMO_MUTATE_CHANCE) {
            chance = 0.0;
        }

        vals.push(x.vals[i] + CHROMO_MUTATE_MAX*(chance/CHROMO_MUTATE_CHANCE));
    }

    return makeChromo(vals);
}

function transmute(x) {
    const vals = [...x.vals];
    if (Math.random() < CHROMO_TRMUTE_CHANCE) {
        const a = parseInt(Math.random()*vals.length);
        const b = parseInt(Math.random()*vals.length);

        vals[a] = x.vals[b];
        vals[b] = x.vals[a];
    }

    return makeChromo(vals);
}

// === ga process
function GA() {
    let chromosomes = [];

    function genesis() {
        chromosomes = [];
        for (let i=0; i<GA_GENERATION_MAX; i+=1) {
            chromosomes.push(genChromo());
        }
    }

    function populate() {
        const leng = chromosomes.length;
        const cnt_random = leng * GA_GENERATION_POP_RANDOM;
        const cnt_mutation = leng * GA_GENERATION_POP_MUTATE;
        const cnt_transmute = leng * GA_GENERATION_POP_TRANSM;
        const cnt_crossover = leng * GA_GENERATION_POP_CROVER;

        for (let i=0; i<cnt_random; i+=1) {
            chromosomes.push(genChromo());
        }

        const leng2 = chromosomes.length;
        for (let i=0; i<cnt_crossover; i+=1) {
            chromosomes.push(crossover(chromosomes[i],
                chromosomes[leng2-1-i]));
        }

        for (let i=0; i<cnt_mutation; i+=1) {
            chromosomes.push(mutate(chromosomes[i]));
        }

        for (let i=0; i<cnt_transmute; i+=1) {
            chromosomes.push(transmute(chromosomes[i]));
        }
    }

    function cull() {
        chromosomes.sort((a,b) => a.score<b.score);
        chromosomes = chromosomes.slice(0, GA_GENERATION_MAX);
    }

    return {
        genesis, populate, cull,
        getChromosomes: () => chromosomes,
    };
}
