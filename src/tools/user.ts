import { tool } from "@openai/agents";
import z from "zod";
import { api } from "../config/api";
import { AxiosError } from "axios";

export const fetchUserTool = (token: string) => {
 
    return tool({
        name: "userTool",
        description: `A tool to fetch user account information from the admin API. 
        
        IMPORTANT: This tool requires admin privileges. If the user does not have admin role, this will fail with permission denied.
        
        Use this when the user asks about account details, user status, referrals, or user-related information.`,
        parameters: z.object({
            question: z.string().describe("The question related to user information.")
        }),
        execute: async ({ question }: { question: string }) => { 
            try {
                const response = await api.get('/api/v1/admin/accounts', {
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    }
                });
                
                return {
                    success: true,
                    data: response.data,
                    message: "User information retrieved successfully"
                };

            } catch(error) {
                console.log("Error fetching user information:", error);
                
                // IMPORTANT: Return the error, don't throw it!
                if (error instanceof AxiosError) {
                    const status = error.response?.status;
                    const errorData = error.response?.data;
                    const errorMessage = errorData?.message || errorData?.error || error.message;
                    
                    // Handle 403 Forbidden - Permission Denied
                    if (status === 403) {
                        // Extract role from error message if available
                        const roleMatch = errorMessage.match(/role:\s*(\w+)/i);
                        const userRole = roleMatch ? roleMatch[1] : 'your current role';
                        
                        return {
                            success: false,
                            error: "PERMISSION_DENIED",
                            errorCode: 403,
                            message: errorMessage,
                            suggestedResponse: `I apologize, but you don't have permission to access user account information. Your role (${userRole}) does not have the required admin privileges for this feature.`,
                            alternatives: [
                                "Ask me about your own account information",
                                "Get help with general questions",
                                "Contact your system administrator to request admin access"
                            ],
                            helpfulInfo: `This feature is restricted to admin users only. Your current role is: ${userRole}`
                        };
                    }
                     
                    if (status === 401) {
                        return {
                            success: false,
                            error: "AUTHENTICATION_FAILED",
                            errorCode: 401,
                            message: errorMessage,
                            suggestedResponse: "Your session has expired. Please log in again to continue.",
                            alternatives: ["Log in again", "Contact support if you continue having issues"]
                        };
                    }
                     
                    if (status === 404) {
                        return {
                            success: false,
                            error: "NOT_FOUND",
                            errorCode: 404,
                            message: errorMessage,
                            suggestedResponse: "I couldn't find the user information you're looking for. The data may not exist or the endpoint may have changed.",
                            alternatives: ["Try rephrasing your question", "Ask about something else"]
                        };
                    }
                    
                    return {
                        success: false,
                        error: "API_ERROR",
                        errorCode: status || 500,
                        message: errorMessage,
                        suggestedResponse: `I encountered an error while trying to fetch user information: ${errorMessage}. This might be a temporary issue.`,
                        alternatives: ["Try again in a moment", "Ask me something else", "Contact support if this persists"]
                    };
                    
                } else {
                    return {
                        success: false,
                        error: "UNEXPECTED_ERROR",
                        errorCode: 500,
                        message: "An unexpected error occurred",
                        suggestedResponse: "I'm sorry, but I encountered an unexpected error while fetching user information. Please try again later.",
                        alternatives: ["Try again in a moment", "Ask me about something else"]
                    };
                }
            }
        }
    });   
};