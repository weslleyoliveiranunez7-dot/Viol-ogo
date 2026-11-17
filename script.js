/* ViolãoGO — v0.1 (Etapa 1: Aula 1 completa + trilha) */
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
var DISPONIVEL = { a1: true }; // Aulas com conteúdo pronto nesta versão

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
  aba = t;
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
  var B = [['Primeiro passo', 'Conclua a Aula 1'], ['Seis cordas', 'Marque o exercício das cordas soltas'], ['Primeiro acorde', 'Conclua o acorde Em']];
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
function abrirAula(id) { if (id !== 'a1' || !liberada(id)) return; passo = 0; certas = {}; telaPasso(); }

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

avisar();
ir('inicio');
