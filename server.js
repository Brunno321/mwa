
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

function extrairTexto(json) {
  return json?.candidates?.[0]?.content?.parts?.map(p => p?.text || "").join("\n").trim() || "";
}

// 🔵 NOVO: DeepSeek extractor (ADICIONADO)
function extrairDeepSeek(json){
  return json?.choices?.[0]?.message?.content || "";
}

/* ==============================
   🤖 IA COMPLETA (ANÁLISE + CONTEÚDO + TRILHAS)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    let lista = dados;

    if (Array.isArray(lista) && Array.isArray(lista[0])) {
      lista = lista[0];
    }

    if (!Array.isArray(lista)) {
      lista = Object.values(lista);
    }

    const titulos = req.body.titulos || [];
      .map(d => (d && d.contextodoevento) ? d.contextodoevento : "")
      .filter(Boolean)
      .slice(0, 20)
      .join(" | ");

    const prompt = `
${/* seu prompt original intacto */""}
Você é um professor altamente qualificado e multidisciplinar, especialista em:

- Ciências Exatas
- Ciências Humanas
- Linguagens
- Ciências Biológicas
- Tecnologia e Educação Digital
- Educação a Distância (EaD)
- Learning Analytics

Você analisa dados do Moodle e gera recomendações pedagógicas inteligentes.

⚠️ REGRA CRÍTICA:
As sugestões DEVEM ser baseadas diretamente nos títulos das atividades.

TÍTULOS DAS ATIVIDADES:
${titulos}

DADOS:
${JSON.stringify(dados)}

Responda OBRIGATORIAMENTE neste formato:

### Diagnóstico
Resumo do engajamento geral da turma

### Problemas Identificados
Liste problemas claros e objetivos

### Recomendações Pedagógicas
Ações práticas do professor

### Sugestões de Conteúdo IA
Para cada título de atividade, você DEVE:

1. Identificar o TEMA CENTRAL da atividade
2. Transformar o título em um conceito educacional
3. Gerar uma sugestão de conteúdo específica

FORMATO OBRIGATÓRIO:

- [TÍTULO ORIGINAL] → Tema: [tema identificado] → Sugestão: [conteúdo recomendado]

REGRAS:
- NÃO repetir o título como tema
- NÃO gerar conteúdo genérico
- O tema deve ser um conceito

### Trilhas de Aprendizagem e MOOCs
- Tema:
  Trilha:
  Curso MOOC:
`;

    // ===============================
    // 🟡 GEMINI (SEU CÓDIGO ORIGINAL)
    // ===============================
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

    // ===============================
    // 🔵 NOVO: FALLBACK DEEPSEEK
    // ===============================
    if (!texto || json?.error) {

      console.log("⚠️ Gemini falhou → usando DeepSeek");

      const responseDeep = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
      });

      const jsonDeep = await responseDeep.json();
      const textoDeep = extrairDeepSeek(jsonDeep);

      if (textoDeep) {
        return res.json({ resposta: textoDeep });
      }

      return res.json({
        resposta: `<pre>${JSON.stringify(jsonDeep, null, 2)}</pre>`
      });
    }

    // ===============================
    // ✔ RESPOSTA NORMAL (SEM ALTERAÇÃO)
    // ===============================
    if (texto) {
      res.json({ resposta: texto });
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
   🚀 START
============================== */
app.listen(10000, () => {
  console.log("Servidor rodando com IA híbrida 🚀");
});
