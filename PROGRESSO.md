# PROGRESSO — ViolãoGO
(Arquivo para continuar em outra IA caso os tokens acabem.)

## Projeto
App web educativo de violão, estilo aprendizado por etapas. HTML/CSS/JS puros, GitHub Pages, sem backend. Português do Brasil. Verde = principal, amarelo = XP. Frase: "Sua primeira música começa aqui."

## Já feito (Etapa 5: Unidade 4)
- Aulas r1 (pulsação e contagem: metrônomo reutilizável `metroHtml()`, quiz, exercício de palmas) e r2 (para baixo/para cima)
- Passo `batida`: grade de 8 posições (1 e 2 e 3 e 4 e) com `gradeBatida`, 3 padrões, 40–90 BPM; mesmo temporizador `mt`
- Medalha "No ritmo" ao concluir r2; XP 20 por aula, uma única vez

## Já feito (Etapa 4: Unidade 3)
- Aulas t1 (Em ⇄ Am) e t2 (Am ⇄ C, G ⇄ D, Em → Am → C, desafio C ⇄ G) no motor `GL`/`telaGen`
- Passo `treino`: 4 batidas por acorde (30–80 BPM), na 4ª batida "mude para o próximo"; usa o temporizador `mt` e para ao sair/voltar/trocar de aba
- Passo de metas (`chk`) sem penalidade; medalha "Primeira troca" ao concluir t1; XP 20 por aula, uma única vez
- Corrigido: `ir()` agora chama `pararMetro()` (o metrônomo não continua ao sair da aula)

## Já feito (Etapa 3: Unidade 2)
- Acordes Em, Am, C, G, D (ids c1–c5): dados em `ACORDES`, diagrama SVG `acordeSvg`, aulas geradas no motor `GL`/`telaGen` com passo de checklist (`chk`)
- Medalha "Primeiro acorde" ao concluir o Em (c1); XP 20 por aula, uma única vez

## Já feito (Etapa 2: Aulas 2 e 3)
- Aula 2 (cordas com diagrama, tons, revisão) e Aula 3 (metrônomo com BPM 40–100, exercício) via motor genérico `GL`/`telaGen` no script.js
- XP 20 por aula, uma única vez

## Já feito (Etapa 1)
- index.html, style.css, script.js, README.md
- Abas: Início, Aprender, Músicas (placeholder), Perfil
- Estado em localStorage (chave `violaogo:v1`): xp, done, ex, badges, streak, last
- Aula 1 completa (6 passos), XP 20 uma única vez, medalhas "Primeiro passo" e "Seis cordas"
- Desbloqueio sequencial (cada aula só libera após concluir a anterior)
- Reiniciar progresso com confirmação, aviso se o localStorage falhar
- Acessibilidade: foco visível, botões grandes, prefers-reduced-motion

## Falta fazer
1. Unidade 5 / aba Músicas: biblioteca por dificuldade (título, artista, acordes, ritmo, link oficial só se verificado; sem letras/cifras completas; sem inventar URLs)
2. Testar em celular Android de verdade

## Regras do projeto
- Sem vidas nem punição; repetição ilimitada
- Não fingir que o microfone analisa o violão
- Não depender de imagens ou links externos
