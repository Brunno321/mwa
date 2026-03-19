
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 🤖 ROTA IA (GOOGLE GEMINI)
// ===============================
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    const prompt = `
Você é um especialista em educação a distância (EaD).

Analise os dados abaixo e gere recomendações pedagógicas claras, objetivas e aplicáveis.

Dados:
${JSON.stringify(dados)}

Responda em HTML com:
- Diagnóstico
- Problemas identificados
- Recomendações práticas
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const json = await response.json();

    console.log("Resposta Gemini:", JSON.stringify(json, null, 2));

    // ===============================
    // ✅ TRATAMENTO SEGURO
    // ===============================
    if (
      json &&
      json.candidates &&
      json.candidates[0] &&
      json.candidates[0].content &&
      json.candidates[0].content.parts &&
      json.candidates[0].content.parts[0]
    ) {
      res.json({
        resposta: json.candidates[0].content.parts[0].text
      });
    } else {
      res.json({
        resposta: `
          <p>⚠️ Gemini não retornou resposta válida.</p>
          <pre>${JSON.stringify(json, null, 2)}</pre>
        `
      });
    }

  } catch (e) {
    console.error("Erro no servidor:", e);

    res.json({
      resposta: `<p>❌ Erro no servidor IA: ${e.message}</p>`
    });
  }
});

// ===============================
// 🚀 INICIAR SERVIDOR
// ===============================
app.listen(10000, () => {
  console.log("Servidor rodando na porta 10000");
});
