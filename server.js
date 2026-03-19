
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

function extrairTexto(json) {
  return json?.candidates?.[0]?.content?.parts?.map(p => p?.text || "").join("\n").trim() || "";
}

app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    // 🔥 NORMALIZAÇÃO ROBUSTA (CORREÇÃO DO ERRO)
    let lista = dados;

    if (Array.isArray(lista) && Array.isArray(lista[0])) {
      lista = lista[0];
    }

    if (!Array.isArray(lista)) {
      lista = Object.values(lista);
    }

    const titulos = lista
      .map(d => d?.contextodoevento || "")
      .filter(Boolean)
      .slice(0, 15)
      .join(" | ");

    const prompt = `
Você é um professor altamente qualificado e experiente em múltiplas áreas do conhecimento, incluindo:

- Ciências Exatas (Matemática, Física, Química)
- Ciências Humanas (História, Geografia, Sociologia, Filosofia)
- Linguagens (Português, Literatura, Comunicação)
- Ciências Biológicas
- Tecnologia e Educação Digital

Analise os dados e gere:

### Diagnóstico
Resumo do engajamento

### Problemas Identificados
Liste problemas

### Recomendações Pedagógicas
Ações do professor

### Sugestões de Conteúdo IA
Sugira conteúdos com base nos temas:

${titulos}
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

app.listen(10000, () => {
  console.log("Servidor rodando 🚀");
});

