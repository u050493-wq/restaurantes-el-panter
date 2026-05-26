/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const api_key = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (api_key) {
  ai = new GoogleGenAI({
    apiKey: api_key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment. AI features will run with mock simulation.");
}

// RESTAURANT AI ADVISOR ENDPOINT
app.post("/api/gemini/advisor", async (req, res) => {
  const { prompt, contextType, data } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Falta el prompt de consulta." });
  }

  // Fallback simulator if apiKey doesn't exist yet
  if (!ai) {
    let mockResponse = "La inteligencia artificial no está configurada (Falta API Key). No obstante, aquí hay un consejo simulado:\n\n";
    if (contextType === "chef") {
      mockResponse += "💡 **Sugerencia del Chef:** Añadir tiras de aguacate extra al Guacamole Premium y maridarlo con un toque de tajín. Considerar un combo de Enchiladas de Mole con Agua de Jamaica por $230 MXN los fines de semana.";
    } else if (contextType === "sales") {
      mockResponse += "📈 **Análisis de Negocio:** Las ventas reflejan un fuerte consumo de postres y bebidas los fines de semana. Se recomienda lanzar una promoción de 'Cerveza + Tacos' los jueves por la tarde para nivelar la venta de días flojos.";
    } else {
      mockResponse += "🍽️ **Optimización de Menú:** Revisa periódicamente los platillos con menor rotación, reduce el stock de perecederos los lunes y asegúrate de que los meseros sugieran calamares fritos como entrada de bienvenida.";
    }
    return res.json({ text: mockResponse });
  }

  try {
    let systemInstruction = "";
    if (contextType === "chef") {
      systemInstruction = "Eres un Chef Ejecutivo y Sommelier de clase mundial con amplia experiencia en gastronomía hispana y administración de cocinas. Responde formal, con energía entusiasta y sugerencias culinarias concretas, de forma elegante utilizando Markdown.";
    } else if (contextType === "sales") {
      systemInstruction = "Eres un consultor de negocios y analista financiero especializado en optimizar restaurantes de alta gama. Tus respuestas deben incluir análisis de gastos, rotación de menú y estrategias comerciales lógicas usando Markdown.";
    } else {
      systemInstruction = "Eres un asistente virtual inteligente para la gestión de restaurantes gourmet de comida mexicana y fusión.";
    }

    const promptContext = `
      Datos actuales del restaurante:
      ${JSON.stringify(data || {})}

      Petición del usuario:
      ${prompt}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptContext,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    return res.status(500).json({ error: err.message || "Error al generar contenido con la IA." });
  }
});

// VITE MIDDLEWARE SETUP FOR FULL-STACK INTEGRATION
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Restaurant server running on http://localhost:${PORT}`);
  });
}

start();
