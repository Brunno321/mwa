
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
          content: `Analise e gere recomendações pedagógicas: ${JSON.stringify(dados)}`
        }]
      })
    });

    const json = await response.json();
    res.json({resposta: json.choices[0].message.content});

  } catch (e) {
    res.status(500).json({erro:e.message});
  }
});

app.listen(10000, ()=>console.log("rodando"));
