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
  
  // Forças possíveis: em ordem de intensidade (negativo = esquerda, positivo = direita)
  const FORCAS = {
    forteEsq: -15,
    esq: -7,
    nada: 0,
    dir: 7,
    forteDir: 15,
  };
  
  // Exporta a função principal que será usada pela simulação
  export function fuzzyControl(theta, thetaDot) {
    // Fuzzificação: converte variáveis em graus de pertinência
    const thetaN = N(theta);
    const thetaZ = Z(theta);
    const thetaP = P(theta);
  
    const thetaDotN = N(thetaDot);
    const thetaDotZ = Z(thetaDot);
    const thetaDotP = P(thetaDot);
  
    // Regras do PDF (parte 1 – pêndulo)
    const regras = [
      { peso: Math.min(thetaN, thetaDotN), forca: FORCAS.forteEsq },   // 1
      { peso: Math.min(thetaN, thetaDotZ), forca: FORCAS.esq },        // 2
      { peso: Math.min(thetaN, thetaDotP), forca: FORCAS.nada },       // 3
      { peso: Math.min(thetaZ, thetaDotN), forca: FORCAS.esq * 0.5 },  // 4 (leve esquerda)
      { peso: Math.min(thetaZ, thetaDotZ), forca: FORCAS.nada },       // 5
      { peso: Math.min(thetaZ, thetaDotP), forca: FORCAS.dir * 0.5 },  // 6 (leve direita)
      { peso: Math.min(thetaP, thetaDotN), forca: FORCAS.nada },       // 7
      { peso: Math.min(thetaP, thetaDotZ), forca: FORCAS.dir },        // 8
      { peso: Math.min(thetaP, thetaDotP), forca: FORCAS.forteDir },   // 9
    ];
  
    // Defuzzificação: weighted average
    let somaPesos = 0;
    let somaForcas = 0;
    for (const r of regras) {
      somaPesos += r.peso;
      somaForcas += r.peso * r.forca;
    }
  
    return somaPesos === 0 ? 0 : somaForcas / somaPesos;
  }
  

  // Sistema Fuzzy para o carrinho (posição x e velocidade ẋ)
export function fuzzyControlCar(x, xDot) {
    // Fuzzificação: função de pertinência
    const xN = N(x);
    const xZ = Z(x);
    const xP = P(x);
  
    const xDotN = N(xDot);
    const xDotZ = Z(xDot);
    const xDotP = P(xDot);
  
    // Regras fuzzy para posição e velocidade do carrinho (do PDF)
    const regras = [
      { peso: Math.min(xN, xDotN), forca: FORCAS.forteDir },   // 1
      { peso: Math.min(xN, xDotZ), forca: FORCAS.dir },        // 2
      { peso: Math.min(xN, xDotP), forca: FORCAS.nada },       // 3
      { peso: Math.min(xZ, xDotN), forca: FORCAS.dir * 0.5 },  // 4 (levemente direita)
      { peso: Math.min(xZ, xDotZ), forca: FORCAS.nada },       // 5
      { peso: Math.min(xZ, xDotP), forca: FORCAS.esq * 0.5 },  // 6 (levemente esquerda)
      { peso: Math.min(xP, xDotN), forca: FORCAS.nada },       // 7
      { peso: Math.min(xP, xDotZ), forca: FORCAS.esq },        // 8
      { peso: Math.min(xP, xDotP), forca: FORCAS.forteEsq },   // 9
    ];
  
    // Defuzzificação: média ponderada
    let somaPesos = 0;
    let somaForcas = 0;
    for (const r of regras) {
      somaPesos += r.peso;
      somaForcas += r.peso * r.forca;
    }
  
    return somaPesos === 0 ? 0 : somaForcas / somaPesos;
  }
  