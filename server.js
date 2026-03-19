
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

/* ==============================
   🤖 IA PRINCIPAL (ANÁLISE GERAL)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    const prompt = `
Você é um especialista em Educação a Distância (EaD) e design instrucional e ainda professor do conteúdo das atividades.

Analise os dados do AVA (Moodle) e gere recomendações pedagógicas.

⚠️ Responda OBRIGATORIAMENTE neste formato:

### Diagnóstico
Resumo geral do engajamento da turma (máx 5 linhas)

### Problemas Identificados
- Liste problemas de forma objetiva

### Recomendações Pedagógicas
- Ações do professor

### Recomendações de Conteúdo
- Sugira melhorias no conteúdo didático
- Relacione com os problemas encontrados
- Indique conteúdos relacionados às atividades

Dados:
${JSON.stringify(dados)}
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

    if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.json({
        resposta: json.candidates[0].content.parts[0].text
      });
    } else {
      res.json({
        resposta: `<pre>${JSON.stringify(json, null, 2)}</pre>`
      });
    }

  } catch (e) {
    res.json({
      resposta: `<p>❌ Erro servidor: ${e.message}</p>`
    });
  }
});


/* ==============================
   🧠 IA POR CONTEÚDO (NOVO 🔥)
============================== */
app.post("/sugestoes", async (req, res) => {
  try {
    const { titulo } = req.body;

    const prompt = `
Você é especialista em educação.

Você é também Professor de português, inglês, matemática, física, química, biologia, engenharia, informática,filosofia e todas as outras áreas 

Analise o título de uma atividade educacional e identifique o tema principal.

Título: ${titulo}

Gere sugestões de conteúdos relacionados que ajudem o aluno a entender melhor o tema.

⚠️ Responda SOMENTE em JSON válido:
["conteúdo 1","conteúdo 2","conteúdo 3"]
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

    let texto = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // limpar possível texto extra
    texto = texto.replace(/```json/g, "").replace(/```/g, "").trim();

    let sugestoes = [];

    try {
      sugestoes = JSON.parse(texto);
    } catch {
      sugestoes = ["Conteúdo relacionado", "Material complementar", "Revisão do tema"];
    }

    res.json({ sugestoes });

  } catch (e) {
    res.json({
      sugestoes: ["Erro ao gerar sugestões"]
    });
  }
});


/* ==============================
   🚀 START SERVER
============================== */
app.listen(10000, () => {
  console.log("Servidor rodando na porta 10000 🚀");
});
