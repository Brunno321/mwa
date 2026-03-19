
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

function extrairTexto(json) {
  return json?.candidates?.[0]?.content?.parts?.map(p => p?.text || "").join("\n").trim() || "";
}

/* ==============================
   🤖 IA PRINCIPAL (COM CONTEÚDO REAL)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    // 🔥 extrair títulos das atividades
    const titulos = (dados || [])
      .map(d => d.contextodoevento)
      .filter(Boolean)
      .slice(0, 15)
      .join(" | ");

    const prompt = `
Você é um especialista em Educação a Distância (EaD), design instrucional e professor de todas as disciplinas existentes.

Analise os dados do Moodle e os títulos das atividades para gerar recomendações pedagógicas e de conteúdo.

TÍTULOS DAS ATIVIDADES:
${titulos}

DADOS:
${JSON.stringify(dados)}

⚠️ Responda EXATAMENTE neste formato:

### Diagnóstico
Resumo do engajamento da turma (máx 5 linhas)

### Problemas Identificados
- Liste problemas claros

### Recomendações Pedagógicas
- Ações práticas do professor

### Sugestões de Conteúdo IA
- Gere conteúdos diretamente relacionados aos temas das atividades
- Ex: conceitos, teorias, práticas, materiais complementares
- Seja específico e contextual
`;

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

    res.json({ resposta: texto });

  } catch (e) {
    res.json({
      resposta: `<p>❌ Erro servidor: ${e.message}</p>`
    });
  }
});

/* ==============================
   🚀 START
============================== */
app.listen(10000, () => {
  console.log("Servidor rodando 🚀");
});
