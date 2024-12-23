import {
	ExFetch,
	userAgentDefault
} from "EXFETCH/mod.ts";
import {
	addSecretMask,
	writeDebug,
	writeError
} from "GHACTIONS/log.ts";
import {
	getInput,
	getInputBoolean,
	setOutput
} from "GHACTIONS/parameter.ts";
import type {
	JSONArray,
	JSONObject,
} from "ISJSON/mod.ts";
import { parse as yamlParse } from "STD/yaml/parse";
import { StringTruncator } from "STRINGOVERFLOW/mod.ts";
import {
	resolveContent,
	resolveEmbeds,
	resolveFiles,
	resolveKey,
	resolveUsername
} from "./_payload.ts";
console.log("Initialize.");
const exfetch: ExFetch = new ExFetch({
	userAgent: `${userAgentDefault} SendGuildedWebhook.GitHubAction/0.1.1`
});
const splitterNewLine = /\r?\n/g;
writeDebug(`Environment Variables:\n\t${Object.entries(Deno.env.toObject()).map(([key, value]: [string, string]): string => {
	return `${key} = ${value}`;
}).join("\n\t")}`);
console.log("Parse input.");
try {
	const truncateEnable: boolean = getInputBoolean("truncate_enable", { fallback: false }) ?? true;
	const stringTruncator: StringTruncator | undefined = truncateEnable ? new StringTruncator(128, {
		ellipsisMark: getInput("truncate_ellipsis", { fallback: false }),
		//@ts-ignore Validate by the module.
		ellipsisPosition: getInput("truncate_position", { fallback: false })
	}) : undefined;
	const key: string = resolveKey(getInput("key", { require: true }));
	addSecretMask(key);
	const username: string | undefined = resolveUsername(getInput("username"), stringTruncator);
	const avatarURL: string = getInput("avatar_url");
	const content: string | undefined = resolveContent(getInput("content"), getInput("content_links_no_embed").split(splitterNewLine).filter((value: string): boolean => {
		return (value.length > 0);
	}), stringTruncator);
	const embeds: JSONArray | undefined = resolveEmbeds(yamlParse(getInput("embeds")), stringTruncator);
	const files: FormData | undefined = await resolveFiles(getInput("files").split(splitterNewLine).map((file: string) => {
		return file.trim();
	}).filter((file: string): boolean => {
		return (file.length > 0);
	}), getInputBoolean("files_glob", { fallback: false }) ?? true);
	if (typeof content === "undefined" && typeof embeds === "undefined" && typeof files === "undefined") {
		throw new Error(`One of the input must be defined: \`content\`, \`embeds\`, and/or \`files\`!`);
	}
	const methodForm: boolean = getInputBoolean("method_form");
	const requestPayload: JSONObject = {};
	if (typeof content !== "undefined") {
		requestPayload.content = content;
	}
	if (typeof username !== "undefined") {
		requestPayload.username = username;
	}
	if (avatarURL.length > 0) {
		requestPayload.avatar_url = avatarURL;
	}
	if (typeof embeds !== "undefined") {
		requestPayload.embeds = embeds;
	}
	const requestPayloadStringify: string = JSON.stringify(requestPayload);
	const requestHeaders: Headers = new Headers();
	const requestBody: string | FormData = ((): string | FormData => {
		if (
			methodForm ||
			typeof files !== "undefined"
		) {
			// IMPORTANT: Do not set the request header `Content-Type`, `fetch` automatically set this when use `FormData`.
			const result: FormData = (typeof files === "undefined") ? new FormData() : files;
			result.append("payload_json", requestPayloadStringify);
			writeDebug(`Body:\n\t${Array.from(result.entries(), ([key, value]: [string, FormDataEntryValue]): string => {
				return `${key} = ${value}`;
			}).join("\n\t")}`);
			return result;
		}
		requestHeaders.set("Content-Type", "application/json");
		writeDebug(`Body: ${requestPayloadStringify}`);
		return requestPayloadStringify;
	})();
	console.log(`Post network request to Guilded.`);
	const response: Response = await exfetch.fetch(`https://media.guilded.gg/webhooks/${key}`, {
		body: requestBody,
		headers: requestHeaders,
		method: "POST",
		redirect: "follow"
	}).catch((reason: Error): never => {
		throw new Error(`Unexpected web request issue: ${reason?.message ?? reason}`);
	});
	const responseText = await response.text();
	setOutput({
		response: responseText,
		status_code: response.status,
		status_ok: response.ok,
		status_text: response.statusText
	});
	if (!response.ok) {
		throw new Error(`Unexpected response status \`${response.status} ${response.statusText}\`: ${responseText}`);
	}
	console.log(`Response Status: ${response.status} ${response.statusText}`);
	console.log(`Response Content: ${responseText}`);
} catch (error) {
	if (error instanceof AggregateError) {
		writeError(`${error.name}: ${error.message}\n\t${error.errors.join("\n\t")}`);
	} else if (error instanceof Error) {
		writeError(`${error.name}: ${error.message}`);
	} else {
		writeError(String(error));
	}
	Deno.exit(1);
}
