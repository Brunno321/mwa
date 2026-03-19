
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 FIX: remover optional chaining perigoso
function extrairTexto(json) {
  if (
    json &&
    json.candidates &&
    json.candidates[0] &&
    json.candidates[0].content &&
    json.candidates[0].content.parts
  ) {
    return json.candidates[0].content.parts
      .map(p => (p && p.text) ? p.text : "")
      .join("\n")
      .trim();
  }
  return "";
}

// 🔵 DeepSeek extractor (seguro)
function extrairDeepSeek(json){
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
   🤖 IA COMPLETA
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body.dados || [];
    let lista = dados;

    if (Array.isArray(lista) && Array.isArray(lista[0])) {
      lista = lista[0];
    }

    if (!Array.isArray(lista)) {
      lista = Object.values(lista);
    }

    // ✅ FIX: usar títulos vindos do frontend corretamente
    const titulosArray = req.body.titulos || [];

    if (!titulosArray.length) {
      return res.json({
        resposta: "⚠️ Nenhum título de atividade recebido."
      });
    }

    const titulos = titulosArray.join(" | ");

    const prompt = `
Você é um professor altamente qualificado e multidisciplinar, especialista em:

- Ciências Exatas
- Ciências Humanas
- Linguagens
- Ciências Biológicas
- Tecnologia e Educação Digital
- Educação a Distância (EaD)
- Learning Analytics

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
- [TÍTULO ORIGINAL] → Tema: [...] → Sugestão: [...]

### Trilhas de Aprendizagem e MOOCs
- Tema:
  Trilha:
  Curso MOOC:
`;

    // ===============================
    // 🟡 GEMINI
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
    // 🔵 FALLBACK DEEPSEEK
    // ===============================
    if (!texto || (json && json.error)) {

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
    // ✔ RESPOSTA NORMAL
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
   🚀 START (FIX RENDER)
============================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando com IA híbrida 🚀");
});
