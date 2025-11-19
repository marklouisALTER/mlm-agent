import z from "zod";

export const policiesFaqsToolSchema = z.object({
    question: z.string().describe("The question about company policies or FAQs that needs to be answered."),
});