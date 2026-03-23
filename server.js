
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
   🤖 IA (VERSÃO ESTÁVEL)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    const prompt = `
Você é um professor altamente qualificado e multidisciplinar, especialista em:

- Ciências Exatas
- Ciências Humanas
- Linguagens
- Ciências Biológicas
- Tecnologia e Educação Digital
- Educação a Distância (EaD)
- Learning Analytics

Sua função é analisar dados educacionais do Moodle e gerar insights pedagógicos acionáveis.

📊 ENTRADA DE DADOS:
Os dados serão fornecidos em JSON no formato:
[
  {
    "nomecompleto": "...",
    "nomedoevento": "...",
    "contexto": "...",
      }
]

⚠️ REGRA CRÍTICA:
Todas as análises DEVEM ser baseadas diretamente nos títulos das atividades (campo "contexto").
Você DEVE utilizar explicitamente esses títulos para justificar os insights.

📈 CRITÉRIOS DE ANÁLISE:
Considere:
- Frequência de acesso
- Participação em atividades
- Interação em fóruns
- Entregas realizadas
- Padrões de engajamento ao longo do tempo

---

Responda OBRIGATORIAMENTE neste formato:

### Diagnóstico
- Classifique o engajamento geral (alto, médio ou baixo)
- Descreva padrões de comportamento da turma
- Indique possíveis riscos de evasão

---

### Problemas Identificados
Liste problemas claros e baseados nos dados, como:
- Baixa participação
- Falta de continuidade
- Baixo engajamento em atividades específicas

---

### Recomendações Pedagógicas
Sugira ações práticas e aplicáveis no Moodle:
- Indique ferramentas (fórum, questionário, tarefa, H5P)
- Seja específico e direto

---

### Sugestão de Conteúdo

Para cada tema:

- Tema: [nome]

  Trilha:
  1. Conceito introdutório
  2. Aplicação prática
  3. Atividade avaliativa

  Aplicação no Moodle:
  - (ex: fórum, quiz, tarefa, H5P)

  Curso MOOC recomendado:
  - Curso real ou compatível com o MOOC do Ifes

---

🚫 PROIBIDO:
- Gerar conteúdo genérico
- Inventar temas fora dos títulos
- Ignorar os dados fornecidos


DADOS:
${JSON.stringify(dados)}
`;

    // ===============================
    // 🟡 TENTA GEMINI
    // ===============================
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const json = await response.json();
      const texto = extrairTexto(json);

      if (texto && !json.error) {
        return res.json({ resposta: texto });
      }

      throw new Error("Gemini falhou");

    } catch (e) {
      console.log("⚠️ Gemini falhou → usando DeepSeek");

      // ===============================
      // 🔵 DEEPSEEK
      // ===============================
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
   🚀 START (RENDER OK)
============================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando com IA híbrida 🚀");
});
