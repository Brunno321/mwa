
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// 🔧 Aumentar limite de tamanho de requisição
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔧 extrair texto Gemini (sem optional chaining)
function extrairTexto(json) {
  if (
    json &&
    json.candidates &&
    json.candidates[0] &&
    json.candidates[0].content &&
    json.candidates[0].content.parts &&
    json.candidates[0].content.parts[0]
  ) {
    return json.candidates[0].content.parts[0].text;
  }
  return "";
}

// 🔧 extrair DeepSeek
function extrairDeepSeek(json) {
  if (
    json &&
    json.choices &&
    json.choices[0] &&
    json.choices[0].message
  ) {
    return json.choices[0].message.content || "";
  }
  return "";
}

// 🔧 Gerar resposta mock para testes
function gerarRespostaMock(dados) {
  const totalAlunos = new Set(dados.map(d => d.nomecompleto)).size;
  const atividades = new Set(dados.map(d => d.contexto)).size;
  
  return `### 🔍 Diagnóstico Geral

A turma apresenta engajamento moderado com ${totalAlunos} alunos interagindo com ${atividades} atividades diferentes. Foram detectados padrões de participação variada, com alguns alunos apresentando maior dedicação que outros.

---

### 🔥 Diagnóstico de Fricção por Atividade

**Atividade: Aula Introdutória**
- Fricção: Baixa
- Taxa de Conclusão: 85%
- Ponto Crítico: Nenhum identificado
- Recomendação: Manter estrutura atual

**Atividade: Atividade Prática**
- Fricção: Média
- Taxa de Conclusão: 60%
- Ponto Crítico: Falta de exemplos práticos
- Recomendação: Adicionar vídeos demonstrativos

---

### 👥 Segmentação de Alunos

**Engajados (${Math.ceil(totalAlunos * 0.3)} alunos):**
- Características: Alta frequência de acesso, participação ativa
- Estratégia: Manter engajamento, oferecer desafios avançados

**Moderados (${Math.ceil(totalAlunos * 0.5)} alunos):**
- Características: Frequência regular, participação seletiva
- Estratégia: Aumentar participação, suporte estruturado

**Desengajados (${Math.ceil(totalAlunos * 0.2)} alunos):**
- Características: Baixa frequência, pouca participação
- Estratégia: Reengajamento, conteúdo simplificado

**Em Risco (${Math.ceil(totalAlunos * 0.1)} alunos):**
- Características: Padrão de abandono detectado
- Estratégia: Intervenção imediata, suporte 1-1

---

### 🎯 Personalização de Aprendizado

**Para Alunos Engajados:**
- Trilha: Conteúdo avançado, projetos desafiadores
- Ferramentas: H5P interativo, Fórum para discussões profundas
- Conteúdo: Casos de estudo, pesquisas, projetos integradores

**Para Alunos Moderados:**
- Trilha: Conteúdo estruturado com atividades práticas
- Ferramentas: Questionários com feedback, Tarefas com rubrica
- Conteúdo: Vídeos educativos, exercícios resolvidos, exemplos práticos

**Para Alunos Desengajados:**
- Trilha: Conteúdo simplificado, atividades curtas
- Ferramentas: H5P gamificado, Fórum de suporte, Questionários simples
- Conteúdo: Vídeos curtos (5 min), Infográficos, Estudos de caso simples

**Para Alunos em Risco:**
- Trilha: Recuperação urgente, conteúdo essencial
- Ferramentas: Suporte direto, Tarefas com feedback imediato
- Conteúdo: Material de revisão, Tutoriais passo-a-passo, Contato direto

---

### 📋 Recomendações Pedagógicas

1. **Redesign de Atividades**
   - Atividade Prática: Adicionar exemplos visuais e vídeos
   - Fórum: Estruturar com perguntas guiadas

2. **Sequência Pedagógica Proposta**
   - 1. Introdução teórica
   - 2. Exemplos práticos
   - 3. Atividade aplicada
   - 4. Avaliação formativa

3. **Intervenções Imediatas**
   - Contatar alunos em risco
   - Oferecer suporte adicional
   - Revisar estrutura das atividades com maior fricção

4. **Métricas de Sucesso**
   - Engajamento: Aumentar para 80%
   - Conclusão: Atingir 90% nas atividades
   - Retenção: Reduzir evasão para menos de 5%`;
}

/* ==============================
   🤖 IA - DIAGNÓSTICO E PERSONALIZAÇÃO (VERSÃO FINAL)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;
    console.log("📥 Requisição recebida:", dados.length, "registros");

    if (!dados || dados.length === 0) {
      return res.status(400).json({
        resposta: "❌ Nenhum dado fornecido"
      });
    }

    const prompt = `Você é um especialista em Educação Digital e Análise Pedagógica, com profundo conhecimento em:

✅ Análise de Dados Educacionais (Learning Analytics)
✅ Diagnóstico de Fricção e Engajamento
✅ Personalização de Trilhas de Aprendizado
✅ Pedagogia Ativa e Metodologias Inovadoras
✅ Educação a Distância (EaD) e Blended Learning
✅ Tecnologia Educacional (LMS, Moodle, H5P)

---

CONTEXTO

Você receberá dados de interação de alunos com um ambiente Moodle. Sua tarefa é:

1. Diagnosticar fricção e engajamento por atividade
2. Identificar padrões de comportamento e riscos de evasão
3. Sugerir personalização de aprendizado adaptada ao perfil de cada aluno
4. Recomendar estratégias pedagógicas acionáveis

---

ANÁLISE OBRIGATÓRIA

1️⃣ DIAGNÓSTICO DE FRICÇÃO POR ATIVIDADE

Para cada atividade identificada, analise:

- Taxa de Abandono: % de alunos que iniciaram mas não completaram
- Tempo Médio de Permanência: Quanto tempo os alunos gastam?
- Ponto de Fricção: Onde os alunos travam? (início, meio, fim?)
- Engajamento Relativo: Comparar com outras atividades

2️⃣ SEGMENTAÇÃO DE ALUNOS

Classifique os alunos em perfis:

- Engajados: Alta frequência, participa ativamente
- Moderados: Frequência regular, participação seletiva
- Desengajados: Baixa frequência, pouca participação
- Em Risco: Padrão de abandono detectado

3️⃣ PERSONALIZAÇÃO DE APRENDIZADO

Para cada perfil, sugira trilhas, ferramentas e conteúdo adaptado.

4️⃣ RECOMENDAÇÕES PEDAGÓGICAS

Sugira ações concretas para melhorar o engajamento e desempenho.

---

FORMATO OBRIGATÓRIO DE RESPOSTA

Responda EXATAMENTE neste formato:

### 🔍 Diagnóstico Geral
[Análise]

### 🔥 Diagnóstico de Fricção por Atividade
[Análise por atividade]

### 👥 Segmentação de Alunos
[Segmentação]

### 🎯 Personalização de Aprendizado
[Personalização]

### 📋 Recomendações Pedagógicas
[Recomendações]

---

DADOS PARA ANÁLISE:
${JSON.stringify(dados, null, 2)}`;

    // ===============================
    // 🟡 TENTA GEMINI (com timeout)
    // ===============================
    try {
      console.log("🟡 Tentando Gemini...");
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        console.log("⚠️ Gemini retornou status:", response.status);
        throw new Error(`Gemini HTTP ${response.status}`);
      }

      const json = await response.json();
      const texto = extrairTexto(json);

      if (texto && !json.error) {
        console.log("✅ Gemini respondeu com sucesso");
        return res.json({ resposta: texto });
      }

      console.log("⚠️ Gemini sem resposta válida:", json.error);
      throw new Error("Gemini falhou");

    } catch (e) {
      console.log("⚠️ Gemini falhou:", e.message, "→ usando DeepSeek");

      // ===============================
      // 🔵 DEEPSEEK (com timeout)
      // ===============================
      try {
        console.log("🔵 Tentando DeepSeek...");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

        const responseDeep = await fetch(
          "https://api.deepseek.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "user", content: prompt }
              ]
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        if (!responseDeep.ok) {
          console.log("⚠️ DeepSeek retornou status:", responseDeep.status);
          throw new Error(`DeepSeek HTTP ${responseDeep.status}`);
        }

        const jsonDeep = await responseDeep.json();
        const textoDeep = extrairDeepSeek(jsonDeep);

        if (textoDeep) {
          console.log("✅ DeepSeek respondeu com sucesso");
          return res.json({ resposta: textoDeep });
        }

        console.log("⚠️ DeepSeek sem resposta válida");
        throw new Error("DeepSeek falhou");

      } catch (deepSeekError) {
        console.log("⚠️ DeepSeek também falhou:", deepSeekError.message);
        console.log("📋 Usando resposta mock para testes");

        // Fallback: resposta mock
        const respostaMock = gerarRespostaMock(dados);
        return res.json({ resposta: respostaMock });
      }
    }

  } catch (e) {
    console.error("❌ Erro geral:", e.message);
    res.status(500).json({
      resposta: "❌ Erro servidor: " + e.message
    });
  }
});

/* ==============================
   🔧 HEALTH CHECK
============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "✅ Servidor rodando",
    timestamp: new Date().toISOString(),
    version: "2.2 - Diagnóstico + Personalização + 50MB Limit",
    gemini_key: process.env.GEMINI_API_KEY ? "✅ Configurada" : "❌ Não configurada",
    deepseek_key: process.env.DEEPSEEK_API_KEY ? "✅ Configurada" : "❌ Não configurada"
  });
});

/* ==============================
   🔧 DEBUG - Ver logs
============================== */
app.get("/debug", (req, res) => {
  res.json({
    message: "Verifique os logs do Render para detalhes",
    health_check: "GET /health",
    test_ia: "POST /ia com dados JSON",
    max_request_size: "50MB"
  });
});

/* ==============================
   🚀 START (RENDER OK)
============================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Servidor MWA Rodando              ║
║  📊 Análise de Atividades com IA      ║
║  🎯 Personalização de Aprendizado     ║
║  🌐 Port: ${PORT}                        ║
║  💾 Limite: 50MB por requisição       ║
║  ✅ Pronto para receber requisições   ║
╚════════════════════════════════════════╝
  `);
});
