import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { ResumeData, TemplateConfig } from "../types";

const SYSTEM_INSTRUCTION = `
ACT AS: A Dual-Role Expert: (1) Senior Executive Career Coach & (2) High-End UI/UX Brand Designer.
GOAL: Conduct a natural conversation to build a professional CV and then configure its visual identity.

### PHASE 1: CONTENT ARCHITECTURE (The "Meat")
1. NATURAL CONVERSATION: Never ask for a list. Ask 1-2 targeted questions at a time. Start with: "I'm here to build your next big career move. What role are we targeting today, and do you have a job description or a few keywords for the dream position?"
2. TAILORING: Frame every experience extracted to highlight relevance to the target job.
3. PROFESSIONAL WRITING: Transform raw user notes into high-impact, ATS-optimized bullet points using action verbs and metrics.
4. PROACTIVE SUGGESTIONS: Suggest common achievements if the user is stuck.

### PHASE 2: VISUAL IDENTITY (The "Look")
Once the content is solid, or if the user asks for style, recommend one of these templates:
- 'professional': Corporate (Finance/Law/Admin).
- 'harvard': Academic/High-finance.
- 'creative': Arts/Marketing/Design.
- 'pure': Modern Tech/Startups.
- 'terminal': Developers/DevOps.
- 'care': Health/Education/NGOs.
- 'scholar': Researchers/PhDs.

### CRITICAL TOOL USAGE:
- 'update_resume_draft': Use this whenever new content is extracted.
- 'update_visual_identity': Use this when discussing or suggesting templates, colors, or typography.

### RULES:
- Never use placeholder names (e.g., "Leandro Palombo") in your greeting unless the user has introduced themselves.
- Ensure the final CV is written in the professional register of the detected language.
`;

const resumeToolDeclaration: FunctionDeclaration = {
  name: "update_resume_draft",
  description: "Updates the content of the CV draft.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      personalInfo: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          role: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          linkedin: { type: Type.STRING },
          website: { type: Type.STRING }
        }
      },
      summary: { type: Type.STRING },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      },
      education: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            institution: { type: Type.STRING },
            degree: { type: Type.STRING },
            year: { type: Type.STRING }
          }
        }
      },
      skills: {
        type: Type.OBJECT,
        properties: {
          hard: { type: Type.ARRAY, items: { type: Type.STRING } },
          soft: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
  }
};

const visualToolDeclaration: FunctionDeclaration = {
  name: "update_visual_identity",
  description: "Updates the visual configuration of the CV.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      templateId: { 
        type: Type.STRING, 
        enum: ['professional', 'harvard', 'creative', 'pure', 'terminal', 'care', 'scholar'] 
      },
      colors: {
        type: Type.OBJECT,
        properties: {
          primary: { type: Type.STRING, description: "Hex color for main elements" },
          accent: { type: Type.STRING, description: "Hex color for accents" }
        }
      },
      fonts: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          body: { type: Type.STRING }
        }
      },
      layout: {
        type: Type.OBJECT,
        properties: {
          density: { type: Type.STRING, enum: ['compact', 'standard', 'relaxed'] }
        }
      }
    }
  }
};

const tools: Tool[] = [{ functionDeclarations: [resumeToolDeclaration, visualToolDeclaration] }];

export class GeminiService {
  private client: GoogleGenAI;
  private chatSession: any;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async startChat() {
    this.chatSession = this.client.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
        temperature: 0.7,
      },
    });
    return this.chatSession;
  }

  async sendMessage(
    message: string, 
    onResumeUpdate: (data: Partial<ResumeData>) => void,
    onVisualUpdate: (config: Partial<TemplateConfig>) => void
  ): Promise<string> {
    if (!this.chatSession) {
      await this.startChat();
    }

    try {
      let response = await this.chatSession.sendMessage({ message });
      let finalResponseText = "";
      
      while (true) {
        const candidates = response.candidates;
        if (!candidates || !candidates[0]) break;
        
        const content = candidates[0].content;
        const parts = content.parts || [];
        
        let hasToolCall = false;
        const toolResponseParts = [];

        for (const part of parts) {
          if (part.text) finalResponseText += part.text;
          
          if (part.functionCall) {
            hasToolCall = true;
            const fc = part.functionCall;
            
            if (fc.name === 'update_resume_draft') {
              onResumeUpdate(fc.args as any);
              toolResponseParts.push({
                functionResponse: { name: fc.name, response: { result: "Success" }, id: fc.id }
              });
            } else if (fc.name === 'update_visual_identity') {
              onVisualUpdate(fc.args as any);
              toolResponseParts.push({
                functionResponse: { name: fc.name, response: { result: "Success" }, id: fc.id }
              });
            }
          }
        }

        if (hasToolCall && toolResponseParts.length > 0) {
          response = await this.chatSession.sendMessage(toolResponseParts);
        } else {
          break;
        }
      }
      return finalResponseText;
    } catch (error) {
      console.error(error);
      return "Hubo un problema de conexión. ¿Podemos intentarlo de nuevo?";
    }
  }
}

export const geminiService = new GeminiService();