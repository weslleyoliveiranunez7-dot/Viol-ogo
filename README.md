# ViolãoGO 🎸
**Sua primeira música começa aqui.**

Curso interativo de violão para quem está começando do zero. Site estático (HTML, CSS e JavaScript puros): sem servidor, sem login e sem chaves. O progresso, o XP e a sequência de dias ficam salvos no `localStorage` do navegador.

## O que já funciona (versão 0.7, tema preto e branco com personagens)
- Tela inicial com nível, barra de progresso, XP, sequência de dias e mapa de unidades
- **Aula 1 completa**: boas-vindas, partes do violão (desenho SVG original), as seis cordas, exercício das cordas soltas e revisão com 3 perguntas
- **Aulas 2 e 3**: numeração das cordas e primeiros sons, com metrônomo opcional (40–100 BPM)
- **Unidade 2**: acordes Em, Am, C, G e D, cada um com diagrama, dedos numerados, cordas a evitar, passo a passo e conferência corda por corda
- **Unidade 3**: treino guiado de troca de acordes (Em ⇄ Am, Am ⇄ C, G ⇄ D e mais), com batidas de referência em BPM lento e metas sem penalidade
- **Unidade 4**: pulsação e contagem (com metrônomo opcional) e treino de batidas para baixo/para cima, com grade 1 e 2 e 3 e 4 e
- XP concedido uma única vez, medalhas, desbloqueio da Aula 2 e botão de reiniciar progresso
- Tons de referência (Web Audio) tocados só quando você clica. **Não são gravações de violão.**
- O site **não ouve** seu violão nem avalia o que você toca

## Testar no computador
Abra o `index.html` no navegador. Não precisa instalar nada.

## Publicar no GitHub Pages
1. Crie um repositório no GitHub (ex.: `violaogo`), público.
2. Envie os arquivos `index.html`, `style.css`, `script.js` e `README.md` (Add file > Upload files).
3. Vá em **Settings > Pages**.
4. Em *Build and deployment*, escolha **Deploy from a branch**, branch **main** e pasta **/(root)**. Clique em Save.
5. Espere cerca de 1 minuto. O site abre em `https://SEU-USUARIO.github.io/violaogo/`.

Os arquivos usam caminhos relativos, então funcionam em repositório de projeto (não só na raiz do domínio).

## Próximos passos
Veja `PROGRESSO.md`.
