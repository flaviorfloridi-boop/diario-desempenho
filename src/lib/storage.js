const DATA_KEY = "diario-desempenho:dados";
const CONFIG_KEY = "diario-desempenho:config";

const VAZIO = { tasks: [], areas: [], entries: [], reflexoes: {} };

export function carregarDados() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? JSON.parse(raw) : structuredClone(VAZIO);
  } catch {
    return structuredClone(VAZIO);
  }
}

export function salvarDados(dados) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(dados));
    return true;
  } catch {
    return false;
  }
}

export function carregarConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : { anthropicApiKey: "" };
  } catch {
    return { anthropicApiKey: "" };
  }
}

export function salvarConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function exportarBackup() {
  const dados = carregarDados();
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `diario-desempenho-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importarBackup(arquivoTexto) {
  const dados = JSON.parse(arquivoTexto);
  if (!dados || !Array.isArray(dados.tasks) || !Array.isArray(dados.areas)) {
    throw new Error("Arquivo inválido");
  }
  salvarDados(dados);
  return dados;
}
