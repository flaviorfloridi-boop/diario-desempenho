const MODEL = "claude-sonnet-5";

export class ApiKeyAusenteError extends Error {}

export async function pedirFeedbackIA({ apiKey, areaNome, areaTipo, texto }) {
  if (!apiKey) throw new ApiKeyAusenteError("Configure sua chave de API da Anthropic em Configurações.");

  const contexto = areaTipo === "esporte" ? "um treino esportivo" : "uma sessão de estudo";
  const prompt = `Você é um treinador/tutor direto e construtivo. Uma pessoa registrou ${contexto} sobre "${areaNome}". Relato dela:\n"""${texto}"""\n\nResponda SOMENTE com um JSON válido, sem markdown, sem texto fora do JSON, neste formato exato:\n{"pontos_fortes": ["...", "..."], "pontos_melhorar": ["...", "..."], "sugestao_proxima_sessao": "..."}\n\nRegras: escreva em português do Brasil, no máximo 3 itens em cada lista, cada item com no máximo 14 palavras, seja específico e direto (nada de elogio genérico), baseie-se só no que foi relatado.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Erro da API (${resp.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await resp.json();
  const textOut = (data.content || []).map((b) => b.text || "").join("");
  const clean = textOut.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
