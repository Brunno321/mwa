
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

Você também é especialista em Educação a Distância (EaD), metodologias ativas e análise de dados educacionais.

Sua tarefa é analisar dados de um Ambiente Virtual de Aprendizagem (Moodle), incluindo os títulos das atividades acessadas pelos alunos.

⚠️ REGRA IMPORTANTE:
As sugestões de conteúdo DEVEM ser diretamente relacionadas aos títulos das atividades listadas em "Acesso às atividades".
NÃO gere sugestões genéricas.

TÍTULOS DAS ATIVIDADES:
{{TITULOS_AQUI}}

DADOS:
{{DADOS_AQUI}}

Responda OBRIGATORIAMENTE neste formato:

### Diagnóstico
Resumo do engajamento geral com base nos dados.

### Problemas Identificados
Liste problemas objetivos (ex: baixo acesso, pouca interação, evasão).

### Recomendações Pedagógicas
Sugira ações práticas do professor.

### Sugestões de Conteúdo IA
- Gere sugestões diretamente relacionadas aos temas das atividades
- Para cada sugestão, deixe claro o vínculo com o conteúdo

Formato das sugestões:
- [Tema identificado] → sugestão de conteúdo

Exemplo:
- Funções matemáticas → exercícios práticos e visualização gráfica
- Fórum de discussão sobre clima → estudo de caso sobre mudanças climáticas

Se não houver relação clara, NÃO invente conteúdo.

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

