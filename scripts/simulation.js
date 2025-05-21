

import { fuzzyControl, fuzzyControlCar, setForcas } from './fuzzy.js';
import { evolveForces } from './genetic.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Constantes físicas
const mc = 0.5, mp = 0.2, g = 9.8, l = 0.3, I = 0.006, h = 0.02;

// Estados do sistema
let x = 0, xDot = 0, theta = 0, thetaDot = 0;
let running = false;

function updateSliders() {
  document.getElementById("thetaVal").textContent = document.getElementById("theta").value;
  document.getElementById("thetaDotVal").textContent = document.getElementById("thetaDot").value;
  document.getElementById("xVal").textContent = document.getElementById("x").value;
  document.getElementById("xDotVal").textContent = document.getElementById("xDot").value;
}

// Equações do sistema
function calcThetaDotDot(xDotDot, theta) {
  return (mp * l * g * Math.sin(theta) - xDotDot * Math.cos(theta)) / (I + mp * l ** 2);
}

function calcXDotDot(F, theta, thetaDot, thetaDotDot) {
  return (mp * (thetaDot ** 2 * Math.sin(theta) - thetaDotDot * Math.cos(theta)) + F) / (mc + mp);
}

// Desenhar
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cartX = canvas.width / 2 + x * 100;
  const cartY = canvas.height / 2;

  // Carrinho
  ctx.fillStyle = "#333";
  ctx.fillRect(cartX - 25, cartY - 15, 50, 30);

  // Pêndulo
  const pendX = cartX + l * 100 * Math.sin(theta);
  const pendY = cartY - l * 100 * Math.cos(theta);
  ctx.beginPath();
  ctx.moveTo(cartX, cartY);
  ctx.lineTo(pendX, pendY);
  ctx.strokeStyle = "#e00";
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Loop da simulação
function step() {
  if (!running) return;

    let F = 0;

    if (document.getElementById("enableFIS1").checked) {
        F += fuzzyControl(theta, thetaDot);
    }
    
    if (document.getElementById("enableFIS2").checked) {
        F += fuzzyControlCar(x, xDot);
    }
  
  



  // Cálculo temporário
  const thetaDotDotTemp = calcThetaDotDot(0, theta);
  const xDotDot = calcXDotDot(F, theta, thetaDot, thetaDotDotTemp);
  const thetaDotDot = calcThetaDotDot(xDotDot, theta);

  // Atualiza estados com amortecimento
  xDot += h * xDotDot;
  xDot *= 0.99; // atrito no carrinho
  x += h * xDot;

  thetaDot += h * thetaDotDot;
  thetaDot *= 0.99; // amortecimento angular
  theta += h * thetaDot;

  // Impede o carrinho de sair da tela
  x = Math.max(-3.5, Math.min(3.5, x));

  draw();
}

// Controles
document.getElementById("startBtn").addEventListener("click", () => {
  running = !running;
  document.getElementById("startBtn").textContent = running ? "⏸️ Pausar" : "▶️ Iniciar";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  const thetaDeg = parseFloat(document.getElementById("theta").value);
  theta = thetaDeg * Math.PI / 180;
  thetaDot = parseFloat(document.getElementById("thetaDot").value);
  x = parseFloat(document.getElementById("x").value);
  xDot = parseFloat(document.getElementById("xDot").value);
  running = false;
  document.getElementById("startBtn").textContent = "▶️ Iniciar";
  draw();
});

["theta", "thetaDot", "x", "xDot"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateSliders);
});


// ----- NOVO: expõe episódio rápido p/ GA -----
export async function runEpisode(forces){      // avaliar cromossomo
    if (forces) setForcas(forces);
    // estado curto de teste
    let _x=0,_xDot=0,_theta=0.1,_thetaDot=0, t=0, cost=0;
    while (t < 3) {          // 3 s
      // mesmo cálculo de F usando FIS
      let F = fuzzyControl(_theta,_thetaDot)+fuzzyControlCar(_x,_xDot);
      // física reduzida (igual step, sem desenho)
      const tdTemp = calcThetaDotDot(0,_theta);
      const xdd = calcXDotDot(F,_theta,_thetaDot,tdTemp);
      const tdd = calcThetaDotDot(xdd,_theta);
      _xDot+=h*xdd; _x+=h*_xDot;
      _thetaDot+=h*tdd; _theta+=h*_thetaDot;
      cost += Math.abs(_theta);   // penaliza ângulo
      t += h;
    }
    return cost;                  // fitness (menor é melhor)
  }
  // -----------------------------------------------------------
  
  // ao carregar a página, lança GA e aplica melhor conjunto
  (async ()=>{
    const best = await evolveForces();
    setForcas(best);
    console.log('Forças otimizadas:', best.map(v=>v.toFixed(1)));
  })();

// Iniciar
updateSliders();
draw();
setInterval(step, 20);



