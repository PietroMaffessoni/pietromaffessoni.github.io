# Portfólio

Meu site pessoal. Uma página só, em HTML, CSS e JavaScript puro, sem build e sem
dependência nenhuma.

**Online em:** https://pietromaffessoni.github.io/Portifolio/

## Rodar

Abre o `index.html` no navegador e pronto.

Se quiser servir por HTTP:

```
python -m http.server 5173
```

e abre `http://localhost:5173`.

## Arquivos

```
index.html   a página inteira, nos dois idiomas
styles.css   todo o visual
main.js      idioma, animação de entrada, seção atual, menu e copiar e-mail
fonts/       Archivo e Azeret Mono locais, nenhuma chamada externa
img/         fotos e ícones das tecnologias
```

## Idiomas

O português está escrito no HTML e o inglês fica no `data-en` do mesmo elemento:

```html
<h2 data-en="Some projects">Alguns projetos</h2>
```

Para imagem é `data-en-alt` e para acessibilidade é `data-en-aria`. Texto novo precisa
dos dois. Sem JavaScript a página abre em português, e a escolha fica no `localStorage`.

## Detalhes para não quebrar

- Todo o movimento respeita `prefers-reduced-motion`.
- Não existe nenhum listener de `scroll`. A seção atual vem de `IntersectionObserver`
  e a barra de progresso vem de uma timeline de rolagem em CSS.
- As fontes são locais, então nada de `<link>` para o Google Fonts.
- Uma cor de destaque só, o âmbar da luminária.
- O botão de copiar existe porque `mailto:` depende de ter aplicativo de e-mail
  configurado. Ele tenta a API de clipboard, cai para `execCommand` e, se nada
  funcionar, deixa o e-mail selecionado na tela.
