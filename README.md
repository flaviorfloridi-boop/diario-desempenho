# Diário de Desempenho

Agenda com blocos de tempo, registro de estudos/treinos (voz ou texto) com
feedback de IA, e revisão espaçada — pra vida acadêmica e esportiva.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como funciona

- **Dados**: guardados só no seu navegador (localStorage), neste dispositivo.
  Nada é enviado pra nenhum servidor, exceto quando você usa o feedback de IA
  (aí sua chave e o texto do registro vão direto pra API da Anthropic).
- **Feedback de IA**: configure sua chave em Configurações → Chave de API da
  Anthropic. Pegue a sua em [console.anthropic.com](https://console.anthropic.com).
- **Voz**: usa o reconhecimento de fala do navegador (funciona bem no Chrome;
  em outros navegadores pode não estar disponível).
- **Google Calendar**: cada tarefa exporta com um clique (sem precisar de
  login). Sincronização de mão dupla automática não está incluída — exigiria
  conectar OAuth do Google, o que dá pra adicionar depois se quiser.
- **Notificações**: locais, via navegador, funcionam enquanto o app está
  aberto ou instalado como PWA. Push de verdade com o app fechado exigiria
  um servidor.

## Publicar de graça

Esse projeto é 100% estático (sem backend) — qualquer um destes serve:

### Vercel ou Netlify (mais fácil)
1. Suba esse código num repositório no GitHub
2. Em [vercel.com](https://vercel.com) ou [netlify.com](https://netlify.com), clique em "importar do GitHub"
3. Ele detecta Vite automaticamente — só confirmar e publicar

### GitHub Pages
```bash
npm run build
```
Depois publique a pasta `dist/` gerada (dá pra automatizar com uma GitHub
Action, ou usar `npm install -D gh-pages` e configurar o deploy).

## Backup dos dados

Em Configurações, use **Exportar backup** de vez em quando — gera um arquivo
`.json` com tudo. Se limpar os dados do navegador ou trocar de dispositivo,
use **Importar backup** pra recuperar.
