
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
   🤖 IA COMPLETA (ANÁLISE + CONTEÚDO + TRILHAS)
============================== */
app.post("/ia", async (req, res) => {
  try {
    const dados = req.body;

    // 🔥 NORMALIZAÇÃO ROBUSTA
    let lista = dados;

    if (Array.isArray(lista) && Array.isArray(lista[0])) {
      lista = lista[0];
    }

    if (!Array.isArray(lista)) {
      lista = Object.values(lista);
    }

    // 🔥 EXTRAIR TÍTULOS DAS ATIVIDADES
    const titulos = lista
      .map(d => d?.contextodoevento || "")
      .filter(Boolean)
      .slice(0, 20)
      .join(" | ");

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
- O tema deve ser um conceito (ex: "Equações do 2º grau", "Mudanças climáticas", "Interpretação de texto")
- A sugestão deve aprofundar o tema

EXEMPLO:

- Fórum: Mudanças climáticas → Tema: Aquecimento global → Sugestão: análise de dados climáticos e estudo de impactos ambientais
- Atividade: Funções quadráticas → Tema: Equações do 2º grau → Sugestão: resolução de problemas com gráficos interativos

Agora aplique isso aos dados fornecidos.

### Trilhas de Aprendizagem e MOOCs

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
  console.log("Servidor rodando com IA avançada 🚀");
});
