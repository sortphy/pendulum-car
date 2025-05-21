// Define as funções de pertinência (membership functions)
function N(x) {
    if (x <= -0.1) return 1;
    if (x >= 0) return 0;
    return (-x) / 0.1;
  }
  
  function Z(x) {
    if (x <= -0.1 || x >= 0.1) return 0;
    if (x < 0) return (x + 0.1) / 0.1;
    return (0.1 - x) / 0.1;
  }
  
  function P(x) {
    if (x <= 0) return 0;
    if (x >= 0.1) return 1;
    return x / 0.1;
  }
  
  // Forças fuzzy (podem ser otimizadas pelo GA)
  let FORCAS = {
    forteEsq: -15,
    esq: -7,
    nada: 0,
    dir: 7,
    forteDir: 15,
  };
  
  // Permite atualizar os valores das forças (usado pelo algoritmo genético)
  export function setForcas(novas) {
    [
      FORCAS.forteEsq,
      FORCAS.esq,
      FORCAS.nada,
      FORCAS.dir,
      FORCAS.forteDir,
    ] = novas;
  }
  
  // Exporta também para uso interno do sim
  export { FORCAS };
  
  // ---------------- FIS do pêndulo ----------------
  export function fuzzyControl(theta, thetaDot) {
    const thetaN = N(theta);
    const thetaZ = Z(theta);
    const thetaP = P(theta);
  
    const thetaDotN = N(thetaDot);
    const thetaDotZ = Z(thetaDot);
    const thetaDotP = P(thetaDot);
  
    const regras = [
      { peso: Math.min(thetaN, thetaDotN), forca: FORCAS.forteEsq },
      { peso: Math.min(thetaN, thetaDotZ), forca: FORCAS.esq },
      { peso: Math.min(thetaN, thetaDotP), forca: FORCAS.nada },
      { peso: Math.min(thetaZ, thetaDotN), forca: FORCAS.esq * 0.5 },
      { peso: Math.min(thetaZ, thetaDotZ), forca: FORCAS.nada },
      { peso: Math.min(thetaZ, thetaDotP), forca: FORCAS.dir * 0.5 },
      { peso: Math.min(thetaP, thetaDotN), forca: FORCAS.nada },
      { peso: Math.min(thetaP, thetaDotZ), forca: FORCAS.dir },
      { peso: Math.min(thetaP, thetaDotP), forca: FORCAS.forteDir },
    ];
  
    return defuzzificar(regras);
  }
  
  // ---------------- FIS do carrinho ----------------
  export function fuzzyControlCar(x, xDot) {
    const xN = N(x);
    const xZ = Z(x);
    const xP = P(x);
  
    const xDotN = N(xDot);
    const xDotZ = Z(xDot);
    const xDotP = P(xDot);
  
    const regras = [
      { peso: Math.min(xN, xDotN), forca: FORCAS.forteDir },
      { peso: Math.min(xN, xDotZ), forca: FORCAS.dir },
      { peso: Math.min(xN, xDotP), forca: FORCAS.nada },
      { peso: Math.min(xZ, xDotN), forca: FORCAS.dir * 0.5 },
      { peso: Math.min(xZ, xDotZ), forca: FORCAS.nada },
      { peso: Math.min(xZ, xDotP), forca: FORCAS.esq * 0.5 },
      { peso: Math.min(xP, xDotN), forca: FORCAS.nada },
      { peso: Math.min(xP, xDotZ), forca: FORCAS.esq },
      { peso: Math.min(xP, xDotP), forca: FORCAS.forteEsq },
    ];
  
    return defuzzificar(regras);
  }
  
  // ---------------- Utilitário de defuzzificação ----------------
  function defuzzificar(regras) {
    let somaPesos = 0;
    let somaForcas = 0;
    for (const r of regras) {
      somaPesos += r.peso;
      somaForcas += r.peso * r.forca;
    }
    return somaPesos === 0 ? 0 : somaForcas / somaPesos;
  }
  