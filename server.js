
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    const prompt = `
Você é um especialista em educação a distância.

Analise os dados e gere recomendações pedagógicas:

${JSON.stringify(dados)}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const json = await response.json();

    console.log("RESPOSTA GEMINI:", JSON.stringify(json, null, 2));

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
          <p>⚠️ Erro da IA</p>
          <pre>${JSON.stringify(json, null, 2)}</pre>
        `
      });
    }

  } catch (e) {
    res.json({
      resposta: `<p>❌ Erro servidor: ${e.message}</p>`
    });
  }
});

app.listen(10000, () => {
  console.log("Servidor rodando");
});
