// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { AIChatAgent } from "@cloudflare/ai-chat";

/**
 * EmailAgent with all Workers AI usage disabled.
 *
 * This class is intentionally kept as an AIChatAgent so the existing
 * EMAIL_AGENT Durable Object binding and migration can remain unchanged.
 * It does not call Workers AI, AI SDK model functions, prompt-injection
 * classifiers, draft verification, or any model provider.
 */
export class EmailAgent extends AIChatAgent<any> {
	/**
	 * Disable the agent chat completely.
	 * No model is created and no Workers AI inference is performed.
	 */
	async onChatMessage(_onFinish: any): Promise<Response> {
		return new Response(
			JSON.stringify({
				error: "AI is disabled",
				message: "The AI email assistant has been disabled for this deployment.",
			}),
			{
				status: 410,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}

	/**
	 * Handle requests to the agent Durable Object.
	 *
	 * Incoming-email auto drafting is disabled. The endpoint returns success so
	 * the caller does not treat the disabled feature as an email-processing error.
	 */
	async onRequest(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/onNewEmail" && request.method === "POST") {
			return new Response(
				JSON.stringify({
					success: true,
					aiDisabled: true,
					message: "Automatic AI draft generation is disabled.",
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		// Keep the base request router intact for compatibility. Any chat request
		// that reaches onChatMessage() above is rejected without invoking a model.
		return super.onRequest(request);
	}
}
