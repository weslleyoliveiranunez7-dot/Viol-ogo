/* ViolãoGO — v0.5 (Aulas 1–3, acordes, troca de acordes + Unidade 4: ritmos e batidas) */
'use strict';
var KEY = 'violaogo:v1';
var storageOk = true;

/* ---------- Estado salvo no localStorage ---------- */
var padrao = { xp: 0, done: {}, ex: {}, badges: [], streak: 0, last: '' };
var S = carregar();
function carregar() {
  try {
    var r = localStorage.getItem(KEY);
    return Object.assign({}, padrao, r ? JSON.parse(r) : {});
  } catch (e) { storageOk = false; return Object.assign({}, padrao); }
}
function salvar() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { storageOk = false; avisar(); }
}
function avisar() {
  var a = document.getElementById('aviso');
  a.hidden = storageOk;
  if (!storageOk) a.textContent = 'Seu navegador não permite salvar o progresso (modo privado?). Você pode estudar, mas ele será perdido ao fechar a página.';
}

/* ---------- Conteúdo do curso ---------- */
var UNIDADES = [
  { t: 'Conhecendo o violão', aulas: [
    { id: 'a1', t: 'Conheça seu instrumento' },
    { id: 'a2', t: 'Conhecendo as seis cordas' },
    { id: 'a3', t: 'Primeiros sons' } ] },
  { t: 'Primeiros acordes', aulas: [
    { id: 'c1', t: 'Acorde Em' }, { id: 'c2', t: 'Acorde Am' },
    { id: 'c3', t: 'Acorde C' }, { id: 'c4', t: 'Acorde G' }, { id: 'c5', t: 'Acorde D' } ] },
  { t: 'Troca de acordes', aulas: [{ id: 't1', t: 'Em ⇄ Am' }, { id: 't2', t: 'Trocas com todos os acordes' }] },
  { t: 'Ritmos e batidas', aulas: [{ id: 'r1', t: 'Pulsação e contagem' }, { id: 'r2', t: 'Para baixo e para cima' }] },
  { t: 'Primeiras músicas', aulas: [{ id: 'm1', t: 'Biblioteca de músicas' }] }
];
var TODAS = [];
UNIDADES.forEach(function (u) { u.aulas.forEach(function (a) { TODAS.push(a); }); });
var DISPONIVEL = { a1: true, a2: true, a3: true, c1: true, c2: true, c3: true, c4: true, c5: true, t1: true, t2: true, r1: true, r2: true }; // Aulas com conteúdo pronto nesta versão

// Desbloqueio: a primeira aula está sempre liberada; as demais só após concluir a anterior.
function liberada(id) {
  var i = TODAS.findIndex(function (a) { return a.id === id; });
  return i === 0 || !!S.done[TODAS[i - 1].id];
}
function proxima() {
  return TODAS.find(function (a) { return !S.done[a.id]; }) || null;
}

var CORDAS = [
  { n: 1, nome: 'Mi agudo (E)', f: 329.63, w: 2 }, { n: 2, nome: 'Si (B)', f: 246.94, w: 3 },
  { n: 3, nome: 'Sol (G)', f: 196.0, w: 4 }, { n: 4, nome: 'Ré (D)', f: 146.83, w: 5 },
  { n: 5, nome: 'Lá (A)', f: 110.0, w: 6 }, { n: 6, nome: 'Mi grave (E)', f: 82.41, w: 8 }
];
var PERGUNTAS = [
  { q: 'Qual é a corda mais fina?', o: ['1ª corda', '6ª corda', '3ª corda'], c: 0,
    ok: 'Isso! A 1ª corda é a mais fina e fica mais perto do chão quando você segura o violão.',
    no: 'Quase. A contagem começa na corda mais fina: ela é a 1ª. A mais grossa é a 6ª.' },
  { q: 'Quantas cordas tem o violão ensinado nesta aula?', o: ['Quatro', 'Seis', 'Oito'], c: 1,
    ok: 'Certo! São seis cordas, da 1ª (fina) à 6ª (grossa).',
    no: 'Não é essa. Conte as cordas do seu violão: são seis.' },
  { q: 'Para tocar uma corda solta, é preciso apertar uma casa?', o: ['Sim, sempre', 'Não'], c: 1,
    ok: 'Exato! Corda solta é tocada sem apertar nada com a mão esquerda.',
    no: 'Tente de novo. "Solta" significa justamente que nenhum dedo aperta a corda.' }
];

/* ---------- Utilidades ---------- */
var app = document.getElementById('app');
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function hoje() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function ontem() { var d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
// Sequência (streak): conta dias seguidos com pelo menos uma aula concluída — calculada só neste aparelho.
function registrarDia() {
  var h = hoje();
  if (S.last === h) return;
  S.streak = (S.last === ontem()) ? S.streak + 1 : 1;
  S.last = h;
}
function streakAtual() { return (S.last === hoje() || S.last === ontem()) ? S.streak : 0; }
function pct() { return Math.round(100 * TODAS.filter(function (a) { return S.done[a.id]; }).length / TODAS.length); }
function placar() {
  document.getElementById('topXp').textContent = '⭐ ' + S.xp + ' XP';
  document.getElementById('topStreak').textContent = '🔥 ' + streakAtual();
}
function tom(f) { // Tom de referência (Web Audio) — NÃO é gravação de violão; só toca quando o aluno clica.
  try {
    var C = window.AudioContext || window.webkitAudioContext;
    window._ac = window._ac || new C();
    var o = window._ac.createOscillator(), g = window._ac.createGain(), t = window._ac.currentTime;
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
    o.connect(g); g.connect(window._ac.destination); o.start(t); o.stop(t + 1.5);
  } catch (e) { alert('Seu navegador não conseguiu tocar o tom de referência.'); }
}

/* ---------- Abas ---------- */
var aba = 'inicio';
function ir(t) {
  aba = t; pararMetro();
  document.querySelectorAll('.abas button').forEach(function (b) {
    if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  placar();
  ({ inicio: telaInicio, aprender: telaAprender, musicas: telaMusicas, perfil: telaPerfil })[t]();
  window.scrollTo(0, 0); app.focus();
}
document.querySelectorAll('.abas button').forEach(function (b) { b.onclick = function () { ir(b.dataset.tab); }; });

function telaInicio() {
  var p = proxima();
  app.innerHTML =
    '<h2>Olá! Bem-vindo ao ViolãoGO 👋</h2><p class="mut">Sua primeira música começa aqui.</p>' +
    '<div class="card"><b>Iniciante — Nível 1</b>' +
    '<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct() + '" aria-label="Progresso do curso"><i style="width:' + pct() + '%"></i></div>' +
    '<span class="mut">' + pct() + '% do curso · ⭐ ' + S.xp + ' XP · 🔥 ' + streakAtual() + ' dia(s) seguidos</span>' +
    '<p class="mut">A sequência de dias é calculada só no seu aparelho: conta os dias seguidos em que você concluiu uma aula.</p></div>' +
    (p ? '<div class="card dest"><span class="passo">Próximo passo</span><h3 style="margin-top:.2em">' + esc(p.t) + '</h3>' +
      '<button class="btn" id="go">' + (S.done.a1 || p.id !== 'a1' ? 'Continuar aprendendo' : 'Começar') + '</button></div>'
      : '<div class="card dest"><h3>Você concluiu tudo que existe por aqui! 🎉</h3></div>') +
    '<h3>Mapa de aprendizado</h3>' + mapa();
  var g = document.getElementById('go'); if (g) g.onclick = function () { abrirAula(p.id); };
  ligarAulas();
}
function telaAprender() { app.innerHTML = '<h2>Aprender</h2>' + mapa(); ligarAulas(); }
function mapa() {
  return UNIDADES.map(function (u, i) {
    var lib = liberada(u.aulas[0].id);
    return '<div class="unid' + (lib ? '' : ' bloq') + '"><b>Unidade ' + (i + 1) + ' — ' + esc(u.t) + '</b></div>' +
      u.aulas.map(function (a) {
        var ok = !!S.done[a.id], l = liberada(a.id), pronta = !!DISPONIVEL[a.id];
        var est = ok ? '✅ Concluída' : !l ? '🔒 Bloqueada' : pronta ? '▶ Começar' : '🕒 Em breve';
        return '<button class="aula" data-aula="' + a.id + '"' + (l && pronta ? '' : ' disabled') + '><span><b>' + esc(a.t) + '</b></span><span class="est">' + est + '</span></button>';
      }).join('');
  }).join('');
}
function ligarAulas() {
  document.querySelectorAll('.aula').forEach(function (b) { b.onclick = function () { abrirAula(b.dataset.aula); }; });
}
function telaMusicas() {
  app.innerHTML = '<h2>Músicas</h2><div class="card"><p>🔒 A biblioteca de músicas faz parte da Unidade 5.</p>' +
    '<p class="mut">Quando ela chegar, cada música mostrará os acordes, o ritmo sugerido e um campo para o link oficial de áudio — sem letras ou cifras completas, só a sequência de acordes. Nenhum link é inventado: onde não houver link verificado, ficará marcado "adicionar depois".</p></div>';
}
function telaPerfil() {
  var B = [['Primeiro passo', 'Conclua a Aula 1'], ['Seis cordas', 'Marque o exercício das cordas soltas'], ['Primeiro acorde', 'Conclua o acorde Em'], ['Primeira troca', 'Conclua Em ⇄ Am'], ['No ritmo', 'Conclua Para baixo e para cima']];
  app.innerHTML = '<h2>Perfil</h2><div class="card"><b>Iniciante — Nível 1</b><p>⭐ ' + S.xp + ' XP · 🔥 ' + streakAtual() + ' dia(s) · ' + pct() + '% do curso</p></div>' +
    '<h3>Medalhas</h3><div>' + B.map(function (b) {
      var ok = S.badges.indexOf(b[0]) >= 0;
      return '<span class="medalha' + (ok ? '' : ' off') + '" title="' + b[1] + '">' + (ok ? '🏅 ' : '🔒 ') + b[0] + (ok ? '' : ' (bloqueada)') + '</span>';
    }).join('') + '</div><p class="mut">Seu progresso fica salvo só neste navegador.</p>' +
    '<button class="btn sec" id="rst">Reiniciar progresso</button>';
  document.getElementById('rst').onclick = function () {
    if (confirm('Apagar todo o seu progresso, XP e medalhas? Isso não pode ser desfeito.')) {
      S = Object.assign({}, padrao, { done: {}, ex: {}, badges: [] }); salvar(); ir('inicio');
    }
  };
}

/* ---------- Aula 1 (passo a passo) ---------- */
var passo = 0, certas = {};
var NP = 6;
function abrirAula(id) { if (!liberada(id)) return; if (id !== 'a1') { abrirGen(id); return; } passo = 0; certas = {}; telaPasso(); }

function violaoSvg() {
  var cs = '', i;
  for (i = 0; i < 6; i++) cs += '<line x1="' + (112 + i * 15.2) + '" y1="52" x2="' + (112 + i * 15.2) + '" y2="360" stroke="#6b5416" stroke-width="' + (1 + i * .35) + '"/>';
  var tr = ''; for (i = 0; i < 6; i++) tr += '<line x1="108" x2="188" y1="' + (92 + i * 30) + '" y2="' + (92 + i * 30) + '" stroke="#9aa39d" stroke-width="2"/>';
  var L = function (y, tx, t, x2) { return '<line x1="' + x2 + '" y1="' + y + '" x2="' + (tx > 150 ? tx - 4 : tx + 4) + '" y2="' + y + '" stroke="#14532d" stroke-width="1.5"/><text x="' + tx + '" y="' + (y + 4) + '" text-anchor="' + (tx > 150 ? 'start' : 'end') + '" font-size="13" font-weight="700" fill="#14532d">' + t + '</text>'; };
  return '<svg class="violao" viewBox="0 0 300 440" role="img" aria-label="Desenho de um violão com as partes identificadas: cabeça, braço com trastes, boca e corpo">' +
    '<rect x="100" y="8" width="100" height="44" rx="10" fill="#8a5a2b"/>' +
    '<rect x="106" y="52" width="88" height="310" fill="#c58a4a"/>' + tr +
    '<path d="M150 250 C95 250 78 290 100 322 C70 340 62 392 105 416 C135 430 165 430 195 416 C238 392 230 340 200 322 C222 290 205 250 150 250Z" fill="#e0a85f" stroke="#8a5a2b" stroke-width="3"/>' +
    '<circle cx="150" cy="322" r="26" fill="#2b1d0e"/>' + cs +
    '<rect x="126" y="388" width="48" height="8" rx="3" fill="#5a3a18"/>' +
    L(30, 218, 'Cabeça', 202) + L(170, 218, 'Braço', 196) + L(120, 82, 'Trastes', 106) + L(322, 82, 'Boca', 122) + L(395, 82, 'Corpo', 124) +
    '</svg>';
}

function telaPasso() {
  var h = '<span class="passo">Passo ' + (passo + 1) + ' de ' + NP + '</span><div class="barra"><i style="width:' + Math.round((passo + 1) / NP * 100) + '%"></i></div><div class="card">';
  var bloqueia = false, ultimo = passo === NP - 1;
  if (passo === 0) {
    h += '<h2>Bem-vindo ao violão! 🎸</h2><p>Você não precisa saber nada para começar. Vamos aprender uma coisa de cada vez.</p>' +
      '<p><b>Como sentar:</b> sente em uma cadeira sem braços, com as costas apoiadas. Apoie a curva do corpo do violão na coxa e deixe o braço levemente inclinado para cima.</p>' +
      '<p><b>Mão no braço:</b> segure o braço sem apertar demais — o polegar fica atrás, relaxado. Aqui não existe velocidade nem perfeição: o importante é estar confortável.</p>';
  } else if (passo === 1) {
    h += '<h2>Conheça as partes</h2>' + violaoSvg() +
      '<p><b>Corpo:</b> a parte grande que faz o som ecoar. <b>Boca:</b> o buraco redondo no meio dele. <b>Braço:</b> a haste comprida onde a mão esquerda fica. <b>Cabeça:</b> a ponta com as tarraxas. <b>Cordas:</b> os seis fios de metal ou nylon. <b>Trastes:</b> as barrinhas de metal no braço; o espaço entre dois trastes é uma <b>casa</b>.</p>';
  } else if (passo === 2) {
    h += '<h2>As seis cordas</h2><p>A contagem começa na corda <b>mais fina</b>: a 1ª é a mais fina (aguda) e a 6ª é a mais grossa (grave).</p><ul class="cordas">' +
      CORDAS.map(function (c) { return '<li><span class="n">' + c.n + '</span><span style="min-width:112px">' + c.nome + '</span><span class="fio" style="height:' + c.w + 'px"></span><button data-f="' + c.f + '" aria-label="Ouvir tom de referência da corda ' + c.n + '">🔊</button></li>'; }).join('') +
      '</ul><p class="mut">Os botões 🔊 tocam tons de referência simples gerados pelo site. Não são gravações de violão.</p>';
  } else if (passo === 3) {
    var f = !!S.ex.a1;
    h += '<h2>Seu primeiro exercício</h2><p>Toque cada corda <b>solta</b> (sem apertar nenhuma casa), uma de cada vez e bem devagar, usando o polegar ou os dedos da mão direita. Escute cada som até ele sumir.</p>' +
      '<div class="seq" aria-label="Sequência: 1, 2, 3, 4, 5, 6">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</div>' +
      '<p class="mut">Depois, volte de 6 até 1. Repita quantas vezes quiser. O site não ouve seu violão: quem avalia o som é você.</p>' +
      '<button class="btn am" id="exb">' + (f ? '✅ Exercício concluído' : 'Marcar exercício como concluído') + '</button>';
    bloqueia = !f;
  } else if (passo === 4) {
    h += '<h2>Revisão rápida</h2>' + PERGUNTAS.map(function (p, i) {
      return '<div><b>' + (i + 1) + '. ' + p.q + '</b>' + p.o.map(function (o, j) { return '<button class="opt' + (certas[i] && j === p.c ? ' ok' : '') + '" data-q="' + i + '" data-o="' + j + '">' + o + '</button>'; }).join('') + '<div class="fb" id="fb' + i + '" aria-live="polite">' + (certas[i] ? '✅ ' + p.ok : '') + '</div></div>';
    }).join('');
    bloqueia = Object.keys(certas).length < PERGUNTAS.length;
  } else {
    var jaTinha = !!S.done.a1;
    h += '<div class="festa" aria-hidden="true">🎉</div><h2 style="text-align:center">Missão concluída!</h2>' +
      '<p style="text-align:center">' + (jaTinha ? 'Você já tinha concluído esta aula — o XP é dado uma única vez.' : 'Você ganhou <b>20 XP</b> e desbloqueou a Aula 2.') + '</p>';
  }
  h += '</div><div class="linha">' + (passo > 0 ? '<button class="btn sec" id="vb">Voltar</button>' : '<button class="btn sec" id="sai">Sair</button>') +
    '<button class="btn" id="cont"' + (bloqueia ? ' disabled' : '') + '>' + (ultimo ? 'Concluir' : 'Continuar') + '</button></div>';
  app.innerHTML = h;
  window.scrollTo(0, 0); app.focus();

  var el = function (i) { return document.getElementById(i); };
  if (el('vb')) el('vb').onclick = function () { passo--; telaPasso(); };
  if (el('sai')) el('sai').onclick = function () { ir('aprender'); };
  el('cont').onclick = function () { if (ultimo) concluirAula(); else { passo++; telaPasso(); } };
  document.querySelectorAll('.cordas button').forEach(function (b) { b.onclick = function () { tom(parseFloat(b.dataset.f)); }; });
  if (el('exb')) el('exb').onclick = function () { S.ex.a1 = true; if (S.badges.indexOf('Seis cordas') < 0) S.badges.push('Seis cordas'); salvar(); telaPasso(); };
  document.querySelectorAll('.opt').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.q, j = +b.dataset.o, p = PERGUNTAS[i];
      if (certas[i]) return;
      var fb = el('fb' + i);
      if (j === p.c) { certas[i] = true; telaPasso(); }
      else { b.classList.add('no'); fb.textContent = '💡 ' + p.no; }
    };
  });
}

// XP e medalha só são dados na primeira conclusão (S.done.a1 evita duplicar ao recarregar ou clicar de novo).
function concluirAula() {
  if (!S.done.a1) {
    S.done.a1 = true; S.xp += 20;
    if (S.badges.indexOf('Primeiro passo') < 0) S.badges.push('Primeiro passo');
    registrarDia(); salvar();
  }
  ir('aprender');
}


/* ---------- Aulas 2 e 3 (motor genérico de passos) ---------- */
var gId = '', gp = 0, mt = null, chk = {}; // mt = temporizador do metrônomo
var GL = {
  a2: { steps: [
    { h: '<h2>As seis cordas, com calma</h2><p>Lembra? A contagem começa na corda <b>mais fina</b>. Veja o braço do violão como se você olhasse para ele de frente, tocando:</p>' + cordasSvg() +
      '<p>Da <b>mais grossa para a mais fina</b>, os nomes são: <b>Mi, Lá, Ré, Sol, Si, Mi</b>. Repita em voz alta algumas vezes.</p>' },
    { h: '<h2>Ouça e compare</h2><p>Toque o botão de cada corda e perceba: quanto mais grossa, mais grave é o som.</p><ul class="cordas">' +
      CORDAS.map(function (c) { return '<li><span class="n">' + c.n + '</span><span style="min-width:112px">' + c.nome + '</span><span class="fio" style="height:' + c.w + 'px"></span><button data-f="' + c.f + '" aria-label="Ouvir tom de referência da corda ' + c.n + '">🔊</button></li>'; }).join('') +
      '</ul><p class="mut">São tons de referência gerados pelo site, não gravações de violão.</p>' },
    { quiz: [
      { q: 'Qual é a 4ª corda?', o: ['Ré (D)', 'Sol (G)', 'Lá (A)'], c: 0, ok: 'Isso! 1ª Mi, 2ª Si, 3ª Sol, 4ª Ré.', no: 'Conte da mais fina: 1ª Mi, 2ª Si, 3ª Sol, 4ª Ré.' },
      { q: 'Qual é a nota da 6ª corda, a mais grossa?', o: ['Si (B)', 'Mi grave (E)', 'Lá (A)'], c: 1, ok: 'Certo! A 6ª corda é o Mi grave.', no: 'A mais grossa é o Mi grave (E).' },
      { q: 'Qual corda é a Lá (A)?', o: ['5ª', '2ª', '3ª'], c: 0, ok: 'Exato! O Lá é a 5ª corda, a segunda mais grossa.', no: 'O Lá fica perto da mais grossa: é a 5ª corda.' }
    ] } ] },
  a3: { steps: [
    { h: '<h2>Tocando uma corda</h2><p>Use o <b>polegar</b> ou os dedos da mão direita e puxe a corda de leve, perto da boca do violão. Deixe a corda soltar sozinha, sem forçar.</p><p><b>Dicas:</b> ombros soltos, respiração calma e a mão esquerda sem apertar nada. Se o som sair "abafado", sua mão esquerda provavelmente está encostando na corda.</p>' },
    { h: '<h2>Corda por corda, no ritmo</h2><p>Toque <b>1, 2, 3, 4, 5, 6</b> e depois volte <b>6, 5, 4, 3, 2, 1</b>, uma corda a cada batida do metrônomo. Comece lento.</p>' +
      '<div class="seq">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</div>' +
      '<div class="card dest"><b>Metrônomo (opcional)</b><p class="mut">Batidas de referência geradas pelo site. Ele não ouve seu violão.</p>' +
      '<label for="bpm">Velocidade: <b id="bpmv">60</b> BPM</label><input id="bpm" type="range" min="40" max="100" value="60" style="width:100%;height:36px">' +
      '<div class="seq"><span id="pulso" aria-hidden="true">●</span></div><button class="btn am" id="mbtn">▶ Iniciar metrônomo</button></div>' +
      '<p class="mut">Meta realista: 3 repetições sem pressa. Pode repetir quantas vezes quiser, sem perder nada.</p>' },
    { ex: true, h: '<h2>Hora de praticar</h2><p>Faça a sequência de ida e volta com calma, no seu tempo. Quando terminar, marque abaixo.</p>' }
  ] }
};

/* ---------- Unidade 2: acordes ---------- */
// f = casa de cada corda (6ª→1ª): -1 = não tocar, 0 = solta. d = dedo (1 indicador, 2 médio, 3 anelar, 4 mínimo)
var NOMEDEDO = ['', 'indicador (1)', 'médio (2)', 'anelar (3)', 'mínimo (4)'];
var ACORDES = {
  c1: { n: 'Em', ext: 'Mi menor', f: [0, 2, 2, 0, 0, 0], d: [0, 2, 3, 0, 0, 0], dica: 'Os dois dedos ficam lado a lado, na mesma casa (casa 2). É o acorde mais fácil para começar.' },
  c2: { n: 'Am', ext: 'Lá menor', f: [-1, 0, 2, 2, 1, 0], d: [0, 0, 2, 3, 1, 0], dica: 'Parece o Em, só que os dedos sobem uma corda e o indicador entra na casa 1.' },
  c3: { n: 'C', ext: 'Dó maior', f: [-1, 3, 2, 0, 1, 0], d: [0, 3, 2, 0, 1, 0], dica: 'Os dedos formam uma escada: indicador, médio e anelar, subindo para as cordas mais grossas.' },
  c4: { n: 'G', ext: 'Sol maior', f: [3, 2, 0, 0, 0, 3], d: [2, 1, 0, 0, 0, 3], dica: 'Os dedos ficam bem separados: dois nas cordas graves e um na 1ª corda. Abra bem a mão.' },
  c5: { n: 'D', ext: 'Ré maior', f: [-1, -1, 0, 2, 3, 2], d: [0, 0, 0, 1, 3, 2], dica: 'Os três dedos formam um triângulo pequeno. Só as 4 cordas mais finas soam.' }
};
function acordeSvg(a) {
  var o = '<svg class="violao" viewBox="0 0 200 250" role="img" aria-label="Diagrama do acorde ' + a.n + '">', i, x;
  for (i = 0; i < 6; i++) {
    x = 30 + i * 28;
    o += '<line x1="' + x + '" y1="50" x2="' + x + '" y2="210" stroke="#6b5416" stroke-width="2"/>' +
      '<text x="' + x + '" y="232" text-anchor="middle" font-size="12" fill="#5b6b60">' + (6 - i) + 'ª</text>';
    if (a.f[i] < 0) o += '<text x="' + x + '" y="38" text-anchor="middle" font-size="18" font-weight="800" fill="#b3402a">✕</text>';
    else if (a.f[i] === 0) o += '<circle cx="' + x + '" cy="32" r="7" fill="none" stroke="#14532d" stroke-width="2.5"/>';
    else o += '<circle cx="' + x + '" cy="' + (50 + (a.f[i] - .5) * 40) + '" r="13" fill="#1f8a4c"/><text x="' + x + '" y="' + (50 + (a.f[i] - .5) * 40 + 5) + '" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">' + a.d[i] + '</text>';
  }
  for (i = 0; i <= 4; i++) o += '<line x1="30" y1="' + (50 + i * 40) + '" x2="170" y2="' + (50 + i * 40) + '" stroke="' + (i ? '#9aa39d' : '#1b2a1f') + '" stroke-width="' + (i ? 2 : 6) + '"/>';
  return o + '</svg>';
}
Object.keys(ACORDES).forEach(function (id) {
  var a = ACORDES[id], jogar = [], evitar = [], dedos = [];
  a.f.forEach(function (f, i) { var c = 6 - i; if (f < 0) evitar.push(c + 'ª'); else jogar.push(c + 'ª'); if (f > 0) dedos.push('<li>Dedo <b>' + NOMEDEDO[a.d[i]] + '</b>: ' + c + 'ª corda, casa ' + f + '.</li>'); });
  var labels = a.f.map(function (f, i) { return f < 0 ? null : (6 - i) + 'ª corda' + (f ? ' (casa ' + f + ')' : ' (solta)') + ' soa limpa'; }).filter(Boolean);
  GL[id] = { steps: [
    { h: '<h2>Acorde ' + a.n + ' (' + a.ext + ')</h2><p>Acorde é um grupo de cordas tocadas juntas. Nas cifras, ele aparece como <b>' + a.n + '</b>.</p>' + acordeSvg(a) +
      '<p><b>Como ler:</b> ○ = corda solta, ✕ = não tocar, números = dedos (1 indicador, 2 médio, 3 anelar, 4 mínimo). As linhas horizontais são os trastes.</p>' +
      '<p><b>Toque:</b> ' + jogar.join(', ') + ' cordas.' + (evitar.length ? ' <b>Evite:</b> ' + evitar.join(', ') + '.' : '') + '</p>' },
    { h: '<h2>Posicione os dedos</h2><ol>' + dedos.join('') + '</ol><p>' + a.dica + '</p>' +
      '<p><b>Dicas:</b> aperte perto do traste, sem ficar em cima dele. Use a ponta do dedo, com o dedo arqueado, e deixe o polegar atrás do braço, sem apertar demais.</p>' },
    { chk: labels, h: '<h2>Confira corda por corda</h2><p>Monte o acorde e toque uma corda por vez. Se alguma soar abafada ou "chiada", ajuste o dedo. Marque as que estiverem limpas. Pode repetir à vontade.</p>' }
  ] };
});

/* ---------- Unidade 3: troca de acordes ---------- */
// Cada "treino" usa os ids dos acordes (c1=Em, c2=Am, c3=C, c4=G, c5=D). Sem penalidade: repetir quantas vezes quiser.
function doisAcordes(i1, i2) { return '<div style="display:flex;gap:8px"><div style="flex:1;text-align:center"><b>' + ACORDES[i1].n + '</b>' + acordeSvg(ACORDES[i1]) + '</div><div style="flex:1;text-align:center"><b>' + ACORDES[i2].n + '</b>' + acordeSvg(ACORDES[i2]) + '</div></div>'; }
GL.t1 = { steps: [
  { h: '<h2>Trocar de acorde, devagar</h2><p>Tocar um acorde é uma coisa; <b>trocar</b> de um para outro é outra habilidade — e ela se treina com paciência. É normal ficar lento e errar no começo.</p>' + doisAcordes('c1', 'c2') +
    '<p><b>O truque:</b> no Em, os dedos <b>2</b> e <b>3</b> estão nas cordas 5ª e 4ª. No Am, eles ficam <b>juntos</b> uma corda mais perto das finas (4ª e 3ª), e o dedo <b>1</b> entra na 2ª corda, casa 1. Pense neles como <b>um bloco</b> que desliza.</p>' },
  { h: '<h2>Como treinar</h2><ol><li>Monte o <b>Em</b> e toque as cordas uma a uma.</li><li>Tire os dedos <b>juntos</b>, sem pressa, e monte o <b>Am</b>.</li><li>Olhe para a mão, não para o relógio. Primeiro acerte; depois, acelere.</li></ol>' +
    '<p><b>Meta realista:</b> 5 trocas completas com calma já é uma ótima conquista. Errou? Sem problema: respire e tente de novo — aqui nada é perdido.</p>' },
  { treino: [{ nome: 'Em ⇄ Am', ids: ['c1', 'c2'] }], h: '<h2>Treino guiado</h2><p>Cada acorde dura <b>4 batidas</b>. Nas batidas 1, 2 e 3, segure e toque o acorde. Na batida 4, <b>mude os dedos</b> para o próximo. Se não der tempo, baixe a velocidade — ou pare e recomece.</p>' },
  { chk: ['Fiz 5 trocas Em → Am e Am → Em, bem devagar', 'Consegui trocar sem olhar o relógio, só olhando a mão', 'Quando errei, parei, respirei e tentei de novo'], h: '<h2>Suas metas</h2><p>Marque o que você já conseguiu. Pode voltar ao treino quantas vezes quiser antes de marcar.</p>' }
] };
GL.t2 = { steps: [
  { h: '<h2>Mais trocas</h2><p>Agora vamos trocar entre os outros acordes, do mais fácil para o mais difícil. A dica é achar o que <b>não precisa mudar</b>.</p>' + doisAcordes('c2', 'c3') +
    '<p><b>Am ⇄ C:</b> os dedos <b>1</b> e <b>2</b> ficam parados (2ª corda casa 1 e 4ª corda casa 2). Só o dedo <b>3</b> muda: sai da 3ª corda, casa 2, e vai para a 5ª corda, casa 3.</p>' +
    '<p><b>G ⇄ D:</b> o dedo <b>3</b> só muda de corda, na mesma casa 3 (da 1ª corda no G para a 2ª no D).</p><p class="mut">C ⇄ G é a troca mais difícil dessa lista: é um desafio opcional, sem pressa.</p>' },
  { treino: [{ nome: 'Am ⇄ C (dedos 1 e 2 ficam parados)', ids: ['c2', 'c3'] }, { nome: 'G ⇄ D', ids: ['c4', 'c5'] }, { nome: 'Em → Am → C', ids: ['c1', 'c2', 'c3'] }, { nome: 'C ⇄ G (desafio)', ids: ['c3', 'c4'] }],
    h: '<h2>Treino guiado</h2><p>Escolha uma troca. Cada acorde dura <b>4 batidas</b>: segure nas batidas 1 a 3 e mude os dedos na 4. Comece em 40–50 BPM e só aumente quando estiver fácil.</p>' },
  { chk: ['Fiz 5 trocas Am ⇄ C com calma', 'Fiz 5 trocas G ⇄ D com calma', 'Pratiquei devagar e aceitei que acertar leva tempo'], h: '<h2>Suas metas</h2><p>Marque o que você já conseguiu. O desafio C ⇄ G fica para quando você quiser.</p>' }
] };

/* ---------- Unidade 4: ritmos e batidas ---------- */
// Grade de 8 posições por compasso: 1 e 2 e 3 e 4 e. "↓" = para baixo, "↑" = para cima, "" = a mão passa sem tocar.
var NOMEB = ['1', 'e', '2', 'e', '3', 'e', '4', 'e'];
function gradeBatida(cel, at) {
  var desc = cel.map(function (c, i) { return NOMEB[i] + ': ' + (c === '↓' ? 'para baixo' : c === '↑' ? 'para cima' : 'sem tocar'); }).join('; ');
  return '<div role="img" aria-label="Batida. ' + desc + '" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin:8px 0">' + cel.map(function (c, i) {
    var on = i === at;
    return '<div style="border:3px solid ' + (on ? '#1b2a1f' : 'transparent') + ';background:' + (on ? '#ffc940' : '#fff') + ';border-radius:10px;padding:6px 0;text-align:center"><div style="font-size:.8rem;font-weight:700">' + NOMEB[i] + '</div><div style="font-size:1.4rem;font-weight:800">' + (c || '·') + '</div></div>';
  }).join('') + '</div>';
}
function metroHtml() { // Mesmo metrônomo opcional da Aula 3 (ligado pelo bloco 'mbtn' em telaGen)
  return '<div class="card dest"><b>Metrônomo (opcional)</b><p class="mut">Batidas de referência geradas pelo site. Ele não ouve seu violão.</p>' +
    '<label for="bpm">Velocidade: <b id="bpmv">60</b> BPM</label><input id="bpm" type="range" min="40" max="100" value="60" style="width:100%;height:36px">' +
    '<div class="seq"><span id="pulso" aria-hidden="true">●</span></div><button class="btn am" id="mbtn">▶ Iniciar metrônomo</button></div>';
}
GL.r1 = { steps: [
  { h: '<h2>Pulsação: o coração da música</h2><p><b>Pulsação</b> é a batida constante da música — aquela em que você bate o pé sem pensar. Ela não corre nem para: é sempre igual, como um relógio ou os passos de uma caminhada.</p><p>Antes de ritmos complicados, o primeiro objetivo é <b>sentir essa batida</b>. Tocar no tempo vale mais do que tocar rápido.</p>' },
  { h: '<h2>Contagem: 1, 2, 3, 4</h2><p>Para não se perder, a gente <b>conta em voz alta</b> as batidas, em grupos de quatro. Cada grupo é um <b>compasso</b>.</p><div class="seq" aria-label="Contagem: 1, 2, 3, 4">' + [1, 2, 3, 4].map(function (n) { return '<span>' + n + '</span>'; }).join('') + '</div>' +
    '<p>Ligue o metrônomo, bata palmas a cada batida e conte <b>1, 2, 3, 4, 1, 2, 3, 4…</b> Comece em 50–60 BPM.</p>' + metroHtml() +
    '<p class="mut">Praticar devagar não é perder tempo: é o que deixa a mão pronta para acelerar depois, aos poucos.</p>' },
  { quiz: [
    { q: 'O que é a pulsação?', o: ['A batida constante da música', 'A velocidade máxima que você consegue tocar', 'Uma corda do violão'], c: 0, ok: 'Isso! É a batida regular que organiza tudo.', no: 'Quase. Pulsação é a batida constante, como o tique-taque de um relógio.' },
    { q: 'Em um compasso de 4 tempos, como contamos?', o: ['1, 2, 3, 4', '1, 1, 1, 1', '4, 3, 2, 1, 0'], c: 0, ok: 'Certo! Contamos 1, 2, 3, 4 e recomeçamos.', no: 'Tente de novo: são quatro batidas, 1, 2, 3, 4.' },
    { q: 'Ao aprender um ritmo novo, qual é o melhor andamento?', o: ['O mais rápido possível', 'Bem devagar, aumentando aos poucos', 'Tanto faz'], c: 1, ok: 'Exato! Devagar primeiro, velocidade depois.', no: 'Pense em acertar antes de acelerar: o melhor é começar bem devagar.' }
  ] },
  { ex: true, h: '<h2>Hora de praticar</h2><p>Sem o violão, bata palmas no tempo e conte <b>1, 2, 3, 4</b> por 8 compassos, no seu ritmo. Se perder o tempo, respire e recomece: nada é perdido.</p>' }
] };
GL.r2 = { steps: [
  { h: '<h2>Para baixo e para cima</h2><p>Na batida, a mão direita balança como um pêndulo: <b>↓ para baixo</b> (da corda grossa para a fina) e <b>↑ para cima</b> (da fina para a grossa).</p><p>Para encaixar o ↑, contamos o meio tempo como <b>"e"</b>: <b>1 e 2 e 3 e 4 e</b>. Os números caem no ↓ e os "e" no ↑.</p>' + gradeBatida(['↓', '↑', '↓', '↑', '↓', '↑', '↓', '↑'], -1) },
  { h: '<h2>Como praticar</h2><ul><li>Use um acorde que você já sabe, como o <b>Em</b>, com a mão esquerda parada.</li><li>Deixe o pulso solto e a mão <b>sempre balançando</b>, mesmo quando não toca as cordas (o "·" na grade).</li><li>Comece em 40–50 BPM e só aumente um pouco quando estiver fácil.</li></ul><p class="mut">Se o som sair duro ou cansar a mão, baixe a velocidade e relaxe o pulso.</p>' },
  { batida: [
    { nome: '1. Só para baixo (↓ nos 4 tempos)', cel: ['↓', '', '↓', '', '↓', '', '↓', ''] },
    { nome: '2. Baixo e cima, sempre (↓↑)', cel: ['↓', '↑', '↓', '↑', '↓', '↑', '↓', '↑'] },
    { nome: '3. Primeira batida de música', cel: ['↓', '', '↓', '↑', '', '↑', '↓', '↑'] }
  ], h: '<h2>Treino de batida</h2><p>Escolha uma batida e acompanhe a grade. Comece pela 1, depois a 2 e, quando se sentir à vontade, a 3. Na 3, a mão continua balançando nos espaços em branco.</p>' },
  { chk: ['Fiz a batida 1 (só para baixo) por 4 compassos seguidos', 'Fiz a batida 2 (↓↑) sem parar a mão', 'Experimentei a batida 3, mesmo devagar'], h: '<h2>Suas metas</h2><p>Marque o que você já conseguiu. Pode voltar ao treino quantas vezes quiser; a batida 3 pode levar alguns dias, e tudo bem.</p>' }
] };
function cordasSvg() {
  var o = '<svg class="violao" viewBox="0 0 300 200" role="img" aria-label="Seis cordas, da 1ª mais fina, no alto, até a 6ª mais grossa, embaixo">';
  CORDAS.forEach(function (c, i) {
    var y = 25 + i * 30;
    o += '<line x1="70" y1="' + y + '" x2="290" y2="' + y + '" stroke="#6b5416" stroke-width="' + (1 + i * .8) + '"/><text x="8" y="' + (y + 5) + '" font-size="14" font-weight="700" fill="#14532d">' + c.n + 'ª  ' + c.nome.split(' ')[0] + '</text>';
  });
  return o + '</svg>';
}
function pararMetro() { if (mt) { clearInterval(mt); mt = null; } }
var trSel = 0; // sequência escolhida no treino de troca
function abrirGen(id) { gId = id; gp = 0; certas = {}; chk = {}; trSel = 0; telaGen(); }
function telaGen() {
  pararMetro();
  var L = GL[gId], total = L.steps.length + 1, st = L.steps[gp], ultimo = gp === total - 1, bloq = false;
  var h = '<span class="passo">Passo ' + (gp + 1) + ' de ' + total + '</span><div class="barra"><i style="width:' + Math.round((gp + 1) / total * 100) + '%"></i></div><div class="card">';
  if (ultimo) {
    h += '<div class="festa" aria-hidden="true">🎉</div><h2 style="text-align:center">Missão concluída!</h2><p style="text-align:center">' +
      (S.done[gId] ? 'Você já tinha concluído esta aula — o XP é dado uma única vez.' : 'Você ganhou <b>20 XP</b> e desbloqueou a próxima aula.') + '</p>';
  } else if (st.quiz) {
    h += '<h2>Revisão rápida</h2>' + st.quiz.map(function (p, i) {
      return '<div><b>' + (i + 1) + '. ' + p.q + '</b>' + p.o.map(function (o, j) { return '<button class="opt' + (certas[i] && j === p.c ? ' ok' : '') + '" data-q="' + i + '" data-o="' + j + '">' + o + '</button>'; }).join('') + '<div class="fb" id="fb' + i + '" aria-live="polite">' + (certas[i] ? '✅ ' + p.ok : '') + '</div></div>';
    }).join('');
    bloq = Object.keys(certas).length < st.quiz.length;
  } else {
    h += st.h;
    if (st.chk) { h += st.chk.map(function (t, i) { return '<button class="opt' + (chk[i] ? ' ok' : '') + '" data-k="' + i + '" aria-pressed="' + !!chk[i] + '">' + (chk[i] ? '✅ ' : '⬜ ') + t + '</button>'; }).join(''); bloq = Object.keys(chk).length < st.chk.length; }
    if (st.batida) { // Treino de batida: 8 posições (1 e 2 e 3 e 4 e); o site só dá o tempo, não ouve o violão
      h += '<div role="group" aria-label="Escolha a batida">' + st.batida.map(function (t, i) { return '<button class="opt' + (i === trSel ? ' ok' : '') + '" data-s="' + i + '" aria-pressed="' + (i === trSel) + '">' + (i === trSel ? '✅ ' : '⬜ ') + t.nome + '</button>'; }).join('') + '</div>' +
        '<label for="bbpm">Velocidade: <b id="bbpmv">50</b> BPM (comece bem lento)</label><input id="bbpm" type="range" min="40" max="90" value="50" style="width:100%;height:36px">' +
        '<div id="bv"></div><button class="btn am" id="bbtn">▶ Iniciar treino</button>' +
        '<p class="mut">O som toca só nos tempos 1, 2, 3 e 4. O site não ouve seu violão: quem avalia é você. Pode parar e repetir quando quiser.</p>';
    }
    if (st.treino) { // Treino de troca: batidas de referência + acorde da vez (o site não ouve o violão)
      h += '<div role="group" aria-label="Escolha a troca">' + st.treino.map(function (t, i) { return '<button class="opt' + (i === trSel ? ' ok' : '') + '" data-s="' + i + '" aria-pressed="' + (i === trSel) + '">' + (i === trSel ? '✅ ' : '⬜ ') + t.nome + '</button>'; }).join('') + '</div>' +
        '<label for="tbpm">Velocidade: <b id="tbpmv">50</b> BPM (comece bem lento)</label><input id="tbpm" type="range" min="30" max="80" value="50" style="width:100%;height:36px">' +
        '<div id="trv" aria-live="off"></div><button class="btn am" id="tbtn">▶ Iniciar treino</button>' +
        '<p class="mut">As batidas são geradas pelo site. Ele não ouve seu violão: quem avalia a troca é você. Pode parar e repetir quando quiser.</p>';
    }
    if (st.ex) { var f = !!S.ex[gId]; h += '<button class="btn am" id="exb">' + (f ? '✅ Exercício concluído' : 'Marcar exercício como concluído') + '</button>'; bloq = !f; }
  }
  h += '</div><div class="linha">' + (gp > 0 ? '<button class="btn sec" id="vb">Voltar</button>' : '<button class="btn sec" id="sai">Sair</button>') +
    '<button class="btn" id="cont"' + (bloq ? ' disabled' : '') + '>' + (ultimo ? 'Concluir' : 'Continuar') + '</button></div>';
  app.innerHTML = h; window.scrollTo(0, 0); app.focus();
  var el = function (i) { return document.getElementById(i); };
  if (el('vb')) el('vb').onclick = function () { gp--; telaGen(); };
  if (el('sai')) el('sai').onclick = function () { ir('aprender'); };
  el('cont').onclick = function () {
    if (!ultimo) { gp++; telaGen(); return; }
    if (!S.done[gId]) { S.done[gId] = true; S.xp += 20; if (gId === 'c1' && S.badges.indexOf('Primeiro acorde') < 0) S.badges.push('Primeiro acorde'); if (gId === 't1' && S.badges.indexOf('Primeira troca') < 0) S.badges.push('Primeira troca'); if (gId === 'r2' && S.badges.indexOf('No ritmo') < 0) S.badges.push('No ritmo'); registrarDia(); salvar(); } // XP só na 1ª conclusão
    ir('aprender');
  };
  document.querySelectorAll('.cordas button').forEach(function (b) { b.onclick = function () { tom(parseFloat(b.dataset.f)); }; });
  if (el('exb')) el('exb').onclick = function () { S.ex[gId] = true; salvar(); telaGen(); };
  document.querySelectorAll('.opt[data-k]').forEach(function (b) { b.onclick = function () { var k = +b.dataset.k; if (chk[k]) delete chk[k]; else chk[k] = true; telaGen(); }; });
  document.querySelectorAll('.opt[data-q]').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.q, j = +b.dataset.o, p = st.quiz[i];
      if (certas[i]) return;
      if (j === p.c) { certas[i] = true; telaGen(); } else { b.classList.add('no'); el('fb' + i).textContent = '💡 ' + p.no; }
    };
  });
  if (el('bbtn')) { // Treino de batida: cada passo do temporizador = meio tempo ("e")
    var pat = st.batida[trSel].cel, ci = 0, bpm3 = 50;
    var desenhaB = function (rodando, at) {
      el('bv').innerHTML = '<div class="card dest" style="text-align:center"><span class="passo">' + (rodando ? 'Agora: ' + NOMEB[at] : 'Parado — aperte Iniciar') + '</span>' + gradeBatida(pat, rodando ? at : -1) + '</div>';
    };
    var andarB = function () { desenhaB(true, ci); if (ci % 2 === 0) tom(ci === 0 ? 1500 : 1000); ci = (ci + 1) % 8; };
    desenhaB(false, 0);
    el('bbpm').oninput = function () { bpm3 = +this.value; el('bbpmv').textContent = bpm3; if (mt) { pararMetro(); mt = setInterval(andarB, 30000 / bpm3); } };
    el('bbtn').onclick = function () { if (mt) { pararMetro(); this.textContent = '▶ Iniciar treino'; desenhaB(false, 0); } else { ci = 0; andarB(); mt = setInterval(andarB, 30000 / bpm3); this.textContent = '⏹ Parar treino'; } };
    document.querySelectorAll('.opt[data-s]').forEach(function (b) { b.onclick = function () { trSel = +b.dataset.s; telaGen(); }; });
  }
  if (el('tbtn')) { // Treino de troca: 4 batidas por acorde; na 4ª batida, mude os dedos para o próximo
    var seq = st.treino[trSel].ids, ti = 0, bt = 0, bpm2 = 50;
    var desenha = function (rodando) {
      var a = ACORDES[seq[ti % seq.length]], nx = ACORDES[seq[(ti + 1) % seq.length]];
      var pts = [0, 1, 2, 3].map(function (i) { return '<span style="' + (rodando && i === bt ? 'background:#ffc940;color:#1b2a1f' : 'background:#c9d4cc;color:#1b2a1f') + '">' + (i + 1) + '</span>'; }).join('');
      el('trv').innerHTML = '<div class="card dest" style="text-align:center"><span class="passo">' + (rodando ? 'Batida ' + (bt + 1) + ' de 4' : 'Parado — aperte Iniciar') + '</span>' +
        '<div style="font-size:2.4rem;font-weight:800">' + a.n + '</div>' + acordeSvg(a) + '<div class="seq">' + pts + '</div>' +
        '<p><b>' + (rodando && bt === 3 ? '👉 Agora mude para ' + nx.n : 'Segure o ' + a.n + ' e toque devagar') + '</b></p></div>';
    };
    var andar = function () {
      desenha(true); tom(bt === 0 ? 1500 : 1000);
      bt++; if (bt === 4) { bt = 0; ti++; }
    };
    desenha(false);
    el('tbpm').oninput = function () { bpm2 = +this.value; el('tbpmv').textContent = bpm2; if (mt) { pararMetro(); mt = setInterval(andar, 60000 / bpm2); } };
    el('tbtn').onclick = function () { if (mt) { pararMetro(); this.textContent = '▶ Iniciar treino'; desenha(false); } else { ti = 0; bt = 0; andar(); mt = setInterval(andar, 60000 / bpm2); this.textContent = '⏹ Parar treino'; } };
    document.querySelectorAll('.opt[data-s]').forEach(function (b) { b.onclick = function () { trSel = +b.dataset.s; telaGen(); }; });
  }
  if (el('mbtn')) { // Metrônomo: iniciar/parar e ajustar BPM
    var bpm = 60, run = function () {
      pararMetro();
      mt = setInterval(function () { tom(1000); var p = el('pulso'); if (p) { p.style.background = '#ffc940'; setTimeout(function () { p.style.background = ''; }, 120); } }, 60000 / bpm);
    };
    el('bpm').oninput = function () { bpm = +this.value; el('bpmv').textContent = bpm; if (mt) run(); };
    el('mbtn').onclick = function () { if (mt) { pararMetro(); this.textContent = '▶ Iniciar metrônomo'; } else { run(); this.textContent = '⏹ Parar metrônomo'; } };
  }
}
// Para o metrônomo ao trocar de aba
document.querySelectorAll('.abas button').forEach(function (b) { b.addEventListener('click', pararMetro); });

avisar();
ir('inicio');
