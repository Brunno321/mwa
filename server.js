
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Analise os dados educacionais e gere recomendações pedagógicas:\n${JSON.stringify(dados)}`
        }]
      })
    });

    const json = await response.json();

    console.log("Resposta OpenAI:", json); // 👈 DEBUG

    // ✅ TRATAMENTO SEGURO
    if (json && json.choices && json.choices[0]) {
      res.json({
        resposta: json.choices[0].message.content
      });
    } else {
      res.json({
        resposta: `<p>⚠️ IA não retornou resposta válida.</p><pre>${JSON.stringify(json, null, 2)}</pre>`
      });
    }

  } catch (e) {
    res.json({
      resposta: `<p>❌ Erro no servidor IA: ${e.message}</p>`
    });
  }
});

app.listen(10000, () => console.log("Servidor rodando"));
