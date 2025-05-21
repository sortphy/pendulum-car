/*  genetic.js  – evolui multiplicadores dos 5 níveis de força
    cromossomo = [kForteEsq, kEsq, kNada, kDir, kForteDir]
*/
import { runEpisode } from './simulation.js';   // função exponho no sim p/ avaliar

const POP = 20, ELITE = 4, GENS = 15, MUT = 0.2;
const range = [-20, 20];   // limite das forças reais em N

export async function evolveForces() {
  let pop = Array.from({ length: POP }, () => rndGene());
  for (let g = 0; g < GENS; g++) {
    // avalia em paralelo  (cada ep. 3 s de simulação rápida)
    const scores = await Promise.all(pop.map(runEpisode));
    // ordena (menor erro → melhor)
    const ranked = pop.map((ind, i) => ({ ind, score: scores[i] }))
                      .sort((a, b) => a.score - b.score);
    console.log(`G${g}  melhor=` + ranked[0].score.toFixed(2));
    // elitismo
    pop = ranked.slice(0, ELITE).map(r => r.ind);
    // gera filhos
    while (pop.length < POP) {
      const p1 = pick(ranked), p2 = pick(ranked);
      pop.push(mutate(crossover(p1, p2)));
    }
  }
  return pop[0];           // melhor cromossomo final
}

// utilidades ------------------------------------------------
function rndGene() { return Array.from({ length: 5 },
  () => range[0] + Math.random() * (range[1] - range[0])); }
function crossover(a, b) {
  const k = Math.random();
  return a.map((v, i) => k * v + (1 - k) * b[i]);
}
function mutate(ind) {
  return ind.map(v => Math.random() < MUT
    ? v + (Math.random() * 2 - 1) * 4   // passo mut.
    : v);
}
function pick(arr) {           // roleta simples
  return arr[Math.floor(Math.random() * arr.length)].ind;
}
