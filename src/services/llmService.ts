import { LLMResponse } from '../types';

// Mock LLM service for demonstration
// In production, this would integrate with a real LLM API like OpenAI, Anthropic, etc.
export class LLMService {
  private static instance: LLMService;
  
  private constructor() {}
  
  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  public async generateTagsAndSummary(campaignDescription: string): Promise<LLMResponse> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock LLM response based on keywords in description
      const description = campaignDescription.toLowerCase();
      const tags: string[] = [];
      let summary = '';

      // Simple keyword-based tagging (in production, this would be LLM-powered)
      if (description.includes('earthquake') || description.includes('disaster')) {
        tags.push('disaster relief');
      }
      if (description.includes('food') || description.includes('hunger')) {
        tags.push('food security');
      }
      if (description.includes('water') || description.includes('clean water')) {
        tags.push('clean water');
      }
      if (description.includes('education') || description.includes('school')) {
        tags.push('education');
      }
      if (description.includes('health') || description.includes('medical')) {
        tags.push('healthcare');
      }
      if (description.includes('children') || description.includes('kids')) {
        tags.push('children');
      }

      // Extract location names (simplified)
      const locations = ['nepal', 'haiti', 'syria', 'afghanistan', 'ukraine', 'somalia'];
      locations.forEach(location => {
        if (description.includes(location)) {
          tags.push(location);
        }
      });

      // Generate summary
      const words = campaignDescription.split(' ');
      if (words.length > 15) {
        summary = words.slice(0, 15).join(' ') + '...';
      } else {
        summary = campaignDescription;
      }

      // Ensure we have at least some tags
      if (tags.length === 0) {
        tags.push('humanitarian aid');
      }

      return {
        tags: [...new Set(tags)], // Remove duplicates
        summary
      };
    } catch (error) {
      console.error('LLM service error:', error);
      // Fallback response
      return {
        tags: ['humanitarian aid'],
        summary: campaignDescription.length > 100 
          ? campaignDescription.substring(0, 100) + '...' 
          : campaignDescription
      };
    }
  }
}