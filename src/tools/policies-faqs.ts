import { tool } from "@openai/agents"
import z from "zod";
import policiesData from "../data/policies-faqs.json";

export const policiesFaqsTool = tool({
    name: "Policies and FAQs Tool",
    description: `A tool that provides answers to frequently asked questions about the MLM system policies.
    It covers referrals, commissions, ranking system, products, payments, and compliance.`,
    parameters: z.object({
        question: z.string().describe("The question about company policies or FAQs that needs to be answered."),
    }),
    execute: async ({ question }: { question: string }) => {
        const allFaqs = policiesData.faqs.flatMap(cat => cat.questions);
        
        // Search through FAQs
        const questionLower = question.toLowerCase();
        const matchedFaq = allFaqs.find(faq => 
            faq.question.toLowerCase().includes(questionLower) ||
            questionLower.includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' '))
        );

        if (matchedFaq) {
            return `**${matchedFaq.question}**\n\n${matchedFaq.answer}`;
        }

        // If no FAQ match, search policies
        type Policy = {
            title: string;
            description: string;
            rules: string[];
        };

        type Policies = {
            [K in keyof typeof policiesData.policies]: Policy;
        };

        const policyKeys = Object.keys(policiesData.policies) as Array<keyof Policies>;
        for (const key of policyKeys) {
            const policy = policiesData.policies[key];
            const keyAsWords = key.replace(/_/g, ' ');
            
            if (questionLower.includes(keyAsWords) || 
                keyAsWords.split(' ').some(word => questionLower.includes(word))) {
                return `**${policy.title}**\n\n${policy.description}\n\n**Rules:**\n${policy.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}`;
            }
        }

        // Search rank structure if question is about ranks
        if (questionLower.includes('rank') || questionLower.includes('diamond') || 
            questionLower.includes('platinum') || questionLower.includes('gold') ||
            questionLower.includes('silver') || questionLower.includes('bronze')) {
            
            const rankInfo = policiesData.rank_structure.map(rank => 
                `${rank.emoji} **${rank.rank}** (Level ${rank.level}):\n` +
                `- Requirements: ${rank.requirements.active_referrals || 0} active referrals, ` +
                `$${rank.requirements.team_sales_monthly || rank.requirements.personal_sales_monthly || 0} in sales\n` +
                `- Bonus: $${rank.benefits.monthly_bonus} + ${rank.benefits.team_commission_percentage || rank.benefits.commission_percentage}% commission\n` +
                `- Perks: ${rank.benefits.perks.join(', ')}`
            ).join('\n\n');
            
            return `**MLM Ranking Structure:**\n\n${rankInfo}`;
        }

        return `I don't have specific information on that question. Here are some ways to get help:\n\n` +
               `📧 Email: ${policiesData.contact_support.email}\n` +
               `📞 Phone: ${policiesData.contact_support.phone}\n` +
               `💬 Live Chat: ${policiesData.contact_support.live_chat}\n` +
               `🌐 Help Center: ${policiesData.contact_support.help_center}`;
    }
});