# PROGRESSO — ViolãoGO
(Arquivo para continuar em outra IA caso os tokens acabem.)

## Projeto
App web educativo de violão, estilo aprendizado por etapas. HTML/CSS/JS puros, GitHub Pages, sem backend. Português do Brasil. Verde = principal, amarelo = XP. Frase: "Sua primeira música começa aqui."

## Já feito (Etapa 1)
- index.html, style.css, script.js, README.md
- Abas: Início, Aprender, Músicas (placeholder), Perfil
- Estado em localStorage (chave `violaogo:v1`): xp, done, ex, badges, streak, last
- Aula 1 completa (6 passos), XP 20 uma única vez, medalhas "Primeiro passo" e "Seis cordas"
- Desbloqueio sequencial (cada aula só libera após concluir a anterior)
- Reiniciar progresso com confirmação, aviso se o localStorage falhar
- Acessibilidade: foco visível, botões grandes, prefers-reduced-motion

## Falta fazer
1. Aula 2 (numeração das cordas com diagrama) e Aula 3 (primeiros sons + metrônomo com BPM)
2. Unidade 2: acordes Em, Am, C, G, D (diagrama SVG, dedos 1-4, cordas a evitar, exercício corda por corda); medalha "Primeiro acorde"
3. Unidade 3: exercícios lentos de troca de acordes
4. Unidade 4: pulsação, contagem, batidas para baixo/para cima
5. Unidade 5 / aba Músicas: biblioteca por dificuldade (título, artista, acordes, ritmo, link oficial só se verificado; sem letras/cifras completas; sem inventar URLs)
6. Testar em celular Android de verdade

## Regras do projeto
- Sem vidas nem punição; repetição ilimitada
- Não fingir que o microfone analisa o violão
- Não depender de imagens ou links externos
