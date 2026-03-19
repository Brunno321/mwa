
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
- O tema deve ser um conceito (ex: "Equações do 2º grau", "Mudanças climáticas", "Interpretação de texto")
- A sugestão deve aprofundar o tema

EXEMPLO:

- Fórum: Mudanças climáticas → Tema: Aquecimento global → Sugestão: análise de dados climáticos e estudo de impactos ambientais
- Atividade: Funções quadráticas → Tema: Equações do 2º grau → Sugestão: resolução de problemas com gráficos interativos

Agora aplique isso aos dados fornecidos.

### Trilhas de Aprendizagem 

Para cada tema:

- Tema: [nome]
  Trilha:
  1. Conceito básico
  2. Aplicação prática
  3. Atividade ou exercício

  Curso MOOC recomendado:
  - Curso real ou compatível com o MOOC do Ifes

NÃO gere conteúdo genérico
NÃO invente temas fora dos títulos

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
