# Diário de Desempenho

Agenda com blocos de tempo, registro de estudos/treinos (voz ou texto) com
autoavaliação guiada, revisão espaçada e integração com Google Calendar —
pra organizar escola, treino e bem-estar no dia a dia. 100% gratuito, sem
nenhuma chave de API paga.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como funciona

- **Dados**: guardados só no seu navegador (localStorage), neste dispositivo.
  Nada é enviado pra nenhum servidor.
- **Autoavaliação**: depois de registrar o que rolou (por voz ou texto), você
  mesmo preenche o que foi bom, o que melhorar, e o próximo passo — sem
  precisar de nenhuma IA paga.
- **Voz**: usa o reconhecimento de fala do navegador (funciona bem no Chrome;
  em outros navegadores pode não estar disponível).
- **Google Calendar**: cada tarefa exporta com um clique (sem login). Se
  quiser sincronização direta (um clique manda pro seu calendário sem abrir
  o site do Google), configure um Client ID gratuito em Configurações — o
  passo a passo está lá dentro do próprio app.
- **Notificações**: locais, via navegador, funcionam enquanto o app está
  aberto ou instalado como PWA.

## Publicar de graça

Esse projeto é 100% estático (sem backend) — qualquer um destes serve:

### Vercel ou Netlify (mais fácil)
1. Suba esse código num repositório no GitHub
2. Em [vercel.com](https://vercel.com) ou [netlify.com](https://netlify.com), clique em "importar do GitHub"
3. Ele detecta Vite automaticamente — só confirmar e publicar

### GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```
Depois ative em Settings → Pages → Source: branch `gh-pages`.

## Backup dos dados

Em Configurações, use **Exportar backup** de vez em quando — gera um arquivo
`.json` com tudo. Se limpar os dados do navegador ou trocar de dispositivo,
use **Importar backup** pra recuperar.
