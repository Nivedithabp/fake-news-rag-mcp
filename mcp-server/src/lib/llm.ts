import { HfInference } from '@huggingface/inference';

export interface LLM {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
  getModelName(): string;
}

export class HuggingFaceLLM implements LLM {
  private client: HfInference;
  private model: string;

  constructor(apiKey?: string, model: string = 'microsoft/DialoGPT-medium') {
    this.client = new HfInference(apiKey);
    this.model = model;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const response = await this.client.textGeneration({
        model: this.model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      });

      return response.generated_text || 'No response generated';
    } catch (error) {
      console.error('HuggingFace LLM error:', error);
      throw new Error(`Failed to generate text: ${error}`);
    }
  }

  getModelName(): string {
    return this.model;
  }
}

export class OllamaLLM implements LLM {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama2') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response generated';
    } catch (error) {
      console.error('Ollama LLM error:', error);
      throw new Error(`Failed to generate text with Ollama: ${error}`);
    }
  }

  getModelName(): string {
    return this.model;
  }
}

// Simple rule-based fallback for when no LLM is available
export class RuleBasedLLM implements LLM {
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    // Simple keyword-based responses
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('fake news') || lowerPrompt.includes('characteristics')) {
      return `Based on the provided sources, fake news typically exhibits these characteristics:

1. **Sensational Headlines**: Often use exaggerated or emotionally charged language
2. **Lack of Credible Sources**: Missing or questionable source citations
3. **Poor Grammar and Spelling**: Lower quality writing standards
4. **Emotional Manipulation**: Designed to provoke strong emotional reactions
5. **Missing Context**: Information presented without proper background
6. **Conspiracy Theories**: Often involves unsubstantiated claims about secret plots

The sources provided show examples of both real and fake news articles, allowing for comparison of these characteristics.`;
    }
    
    if (lowerPrompt.includes('difference') || lowerPrompt.includes('compare')) {
      return `Based on the sources, here are the key differences between real and fake news:

**Real News:**
- Credible sources and citations
- Factual reporting with verification
- Professional writing standards
- Balanced perspective
- Clear attribution of information

**Fake News:**
- Unverified or questionable sources
- Sensational or misleading content
- Often politically or emotionally biased
- Designed to spread quickly
- Lacks journalistic standards

The provided sources demonstrate these differences through actual examples from the dataset.`;
    }
    
    if (lowerPrompt.includes('detect') || lowerPrompt.includes('methods')) {
      return `Based on the sources, here are methods to detect fake news:

1. **Source Verification**: Check the credibility of news outlets and authors
2. **Fact-Checking**: Cross-reference claims with multiple reliable sources
3. **Critical Reading**: Look for emotional language, missing context, or bias
4. **URL Analysis**: Check for suspicious or spoofed website addresses
5. **Date Verification**: Ensure the information is current and relevant
6. **Expert Consultation**: Seek opinions from subject matter experts

The sources provide examples of both real and fake news that can be used to practice these detection methods.`;
    }
    
    return `Based on the provided sources, I can see information about news articles in the dataset. The sources contain both real and fake news examples that can be analyzed for patterns, characteristics, and differences. 

To provide a more specific answer, could you please ask a more detailed question about what you'd like to know about fake news, real news, or news analysis?`;
  }

  getModelName(): string {
    return 'rule-based-fallback';
  }
}

export async function initializeLLM(): Promise<LLM> {
  const provider = process.env.LLM_PROVIDER || 'huggingface';
  
  if (provider === 'huggingface') {
    const apiKey = process.env.HF_API_KEY; // Optional for free tier
    const model = process.env.HF_LLM_MODEL || 'microsoft/DialoGPT-medium';
    return new HuggingFaceLLM(apiKey, model);
  }
  
  if (provider === 'ollama') {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama2';
    return new OllamaLLM(baseUrl, model);
  }
  
  if (provider === 'rule-based') {
    return new RuleBasedLLM();
  }
  
  // Fallback to rule-based
  console.log('Using rule-based LLM as fallback');
  return new RuleBasedLLM();
}
