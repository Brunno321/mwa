
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
Você é um especialista em Educação a Distância (EaD).

Analise os dados do Moodle e gere recomendações pedagógicas.

Responda neste formato:

### Diagnóstico
Resumo do engajamento

### Problemas Identificados
Liste problemas

### Recomendações Pedagógicas
Sugestões do professor

### Sugestões de Conteúdo IA
Sugira melhorias no conteúdo

### Trilhas de Aprendizagem
Sugira trilhas de estudo

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
