# Portfólio, Pietro Maffessoni

Site de uma página, HTML + CSS + JavaScript puro. Sem build, sem dependências, sem npm.

## Ver

Abra `index.html` no navegador. É isso.

Se quiser um servidor local (necessário só se você adicionar coisas que o navegador
bloqueia em `file://`):

```
python -m http.server 5173
```

e abra `http://localhost:5173`.

## Arquivos

```
index.html      a página inteira, nos dois idiomas
styles.css      o sistema visual completo
main.js         idioma, revelação na entrada, seção atual, menu
fonts/          Archivo e Azeret Mono, self-hosted (nenhuma chamada externa de fonte)
```

## Idiomas

O português está escrito no HTML. O inglês fica no atributo `data-en` do mesmo elemento:

```html
<h2 data-en="Selected work">Trabalho selecionado</h2>
```

Para imagens, `data-en-alt`. Para rótulos de acessibilidade, `data-en-aria`.
Sempre que criar um texto novo, escreva os dois. Sem JavaScript o site abre em português.

A escolha fica salva em `localStorage`. Na primeira visita, se o navegador não estiver
em português, o site abre em inglês sozinho.

## Publicar

Qualquer host estático serve. O repositório inteiro é o site.

- **Vercel**: `npx vercel` na pasta, ou conecte o repositório no painel.
- **Netlify**: arraste a pasta em app.netlify.com/drop.
- **GitHub Pages**: suba o repositório e ligue Pages na branch `main`, pasta raiz.

## Antes de publicar

1. Troque as imagens de `picsum.photos` por arquivos reais em `img/`.
2. Confirme os links de LinkedIn e GitHub, hoje eles não vão a lugar nenhum.
3. Decida se o e-mail fica público.

## Detalhes que é bom não quebrar

- Todo o movimento respeita `prefers-reduced-motion`.
- Não existe nenhum listener de `scroll`. A seção atual vem de `IntersectionObserver`
  e a barra de progresso vem de uma timeline de rolagem em CSS.
- As fontes são locais. Não adicione `<link>` para o Google Fonts.
- Um único acento de cor, o âmbar da luminária.
