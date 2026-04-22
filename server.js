
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

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

/* ==============================
   🤖 IA - DIAGNÓSTICO E PERSONALIZAÇÃO (VERSÃO OTIMIZADA)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    const prompt = `
Você é um especialista em Educação Digital e Análise Pedagógica e Ciências, com profundo conhecimento em:

✅ Análise de Dados Educacionais (Learning Analytics)
✅ Diagnóstico de Fricção e Engajamento
✅ Personalização de Trilhas de Aprendizado
✅ Pedagogia Ativa e Metodologias Inovadoras
✅ Educação a Distância (EaD) e Blended Learning
✅ Tecnologia Educacional (LMS, Moodle, H5P)
✅ Ciências, Química, Física, Biologia


---

## 📊 CONTEXTO

Você receberá dados de interação de alunos com um ambiente Moodle. Sua tarefa é:

1. **Diagnosticar** fricção e engajamento por atividade
2. **Identificar** padrões de comportamento e riscos de evasão
3. **Sugerir** personalização de aprendizado adaptada ao perfil de cada aluno
4. **Recomendar** estratégias pedagógicas acionáveis

---

## 📥 FORMATO DE ENTRADA

Os dados virão em JSON:
[
  {
    "nomecompleto": "Nome do Aluno",
    "nomedoevento": "Tipo de evento (ex: 'course viewed', 'quiz submitted')",
    "contexto": "Nome da atividade/recurso (ex: 'Aula 1: Introdução', 'Quiz Módulo 2')",
    "data": "2026-04-22"
  }
]

---

## 🔍 ANÁLISE OBRIGATÓRIA

### 1️⃣ DIAGNÓSTICO DE FRICÇÃO POR ATIVIDADE

Para cada atividade identificada, analise:

- **Taxa de Abandono**: % de alunos que iniciaram mas não completaram
- **Tempo Médio de Permanência**: Quanto tempo os alunos gastam?
- **Ponto de Fricção**: Onde os alunos travam? (início, meio, fim?)
- **Engajamento Relativo**: Comparar com outras atividades

**Formato de resposta:**

### 🔥 Diagnóstico de Fricção

**Atividade: [Nome da Atividade]**
- Fricção: [Baixa/Média/Alta]
- Taxa de Conclusão: [X%]
- Ponto Crítico: [Descrição]
- Recomendação: [Ação específica]

---

### 2️⃣ SEGMENTAÇÃO DE ALUNOS

Classifique os alunos em perfis:

- **Engajados**: Alta frequência, participa ativamente
- **Moderados**: Frequência regular, participação seletiva
- **Desengajados**: Baixa frequência, pouca participação
- **Em Risco**: Padrão de abandono detectado

---

### 3️⃣ PERSONALIZAÇÃO DE APRENDIZADO

Para cada perfil, sugira:

**Trilha Personalizada:**
1. Sequência de atividades adaptada
2. Recursos complementares
3. Estratégias de motivação
4. Ferramentas Moodle específicas

**Exemplo:**

### 🎯 Personalização para Alunos Desengajados

**Trilha Recomendada:**
1. Iniciar com atividades curtas e de baixa complexidade
2. Usar gamificação (badges, pontos)
3. Implementar feedback imediato via questionários
4. Criar fóruns de suporte entre pares

**Ferramentas Moodle:**
- H5P para interatividade
- Fórum com moderação ativa
- Tarefas com rubrica clara
- Questionários com feedback automático

**Conteúdo Sugerido:**
- Vídeos curtos (máx 5 min)
- Infográficos e diagramas
- Estudos de caso práticos
- Discussões estruturadas

---

### 4️⃣ RECOMENDAÇÕES PEDAGÓGICAS

Sugira ações concretas:

- **Redesign de Atividades**: Quais devem ser reformuladas?
- **Sequência Pedagógica**: Qual ordem faz mais sentido?
- **Intervenções Imediatas**: O que fazer agora?
- **Métricas de Sucesso**: Como medir melhoria?

---

## 📋 FORMATO OBRIGATÓRIO DE RESPOSTA

Responda EXATAMENTE neste formato:

---

### 🔍 Diagnóstico Geral

[Análise do engajamento geral da turma, padrões detectados, riscos de evasão]

---

### 🔥 Diagnóstico de Fricção por Atividade

**Atividade: [Nome]**
- Fricção: [Nível]
- Taxa de Conclusão: [%]
- Ponto Crítico: [Descrição]
- Recomendação: [Ação]

[Repetir para cada atividade]

---

### 👥 Segmentação de Alunos

**Engajados (X alunos):**
- Características
- Estratégia: [Manter engajamento, desafios avançados]

**Moderados (X alunos):**
- Características
- Estratégia: [Aumentar participação, suporte estruturado]

**Desengajados (X alunos):**
- Características
- Estratégia: [Reengajamento, conteúdo simplificado]

**Em Risco (X alunos):**
- Características
- Estratégia: [Intervenção imediata, suporte 1-1]

---

### 🎯 Personalização de Aprendizado

**Para Alunos Engajados:**
- Trilha: [Sequência]
- Ferramentas: [Moodle tools]
- Conteúdo: [Recursos recomendados]

**Para Alunos Moderados:**
- Trilha: [Sequência]
- Ferramentas: [Moodle tools]
- Conteúdo: [Recursos recomendados]

**Para Alunos Desengajados:**
- Trilha: [Sequência]
- Ferramentas: [Moodle tools]
- Conteúdo: [Recursos recomendados]

**Para Alunos em Risco:**
- Trilha: [Sequência urgente]
- Ferramentas: [Moodle tools]
- Conteúdo: [Recursos de recuperação]

---

### 📋 Recomendações Pedagógicas

1. **Redesign de Atividades**
   - [Atividade]: [Mudança recomendada]

2. **Sequência Pedagógica Proposta**
   - [Ordem recomendada com justificativa]

3. **Intervenções Imediatas**
   - [Ação 1]
   - [Ação 2]
   - [Ação 3]

4. **Métricas de Sucesso**
   - [Métrica 1]: [Meta]
   - [Métrica 2]: [Meta]

---

## 🚫 PROIBIÇÕES

❌ NÃO gere análises genéricas
❌ NÃO invente dados ou atividades
❌ NÃO ignore os dados fornecidos
❌ NÃO recomende ferramentas fora do Moodle sem justificar
❌ NÃO use jargão sem explicar

---

## ✅ OBRIGAÇÕES

✅ Use SEMPRE os nomes reais das atividades (campo "contexto")
✅ Justifique CADA recomendação com dados
✅ Seja ESPECÍFICO e ACIONÁVEL
✅ Considere CONTEXTO PEDAGÓGICO
✅ Respeite o FORMATO de resposta

---

DADOS PARA ANÁLISE:
\${JSON.stringify(dados, null, 2)}
`;


      // ===============================
      // 🔵 DEEPSEEK
      // ===============================
      const responseDeep = await fetch(
        "https://api.deepseek.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": \`Bearer \${process.env.DEEPSEEK_API_KEY}\`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "user", content: prompt }
            ]
          })
        }
      );

      const jsonDeep = await responseDeep.json();
      const textoDeep = extrairDeepSeek(jsonDeep);

      if (textoDeep) {
        return res.json({ resposta: textoDeep });
      }

      return res.json({
        resposta: "⚠️ IA indisponível no momento."
      });
    }

  } catch (e) {
    res.json({
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
    version: "2.0 - Diagnóstico + Personalização"
  });
});

/* ==============================
   🚀 START (RENDER OK)
============================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(\`
╔════════════════════════════════════════╗
║  🚀 Servidor MWA Rodando              ║
║  📊 Análise de Atividades com IA      ║
║  🎯 Personalização de Aprendizado     ║
║  🌐 Port: \${PORT}                        ║
║  ✅ Pronto para receber requisições   ║
╚════════════════════════════════════════╝
  \`);
});

