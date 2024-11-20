import Color from "COLOR";
import {
	isJSONArray,
	isJSONObject,
	type JSONArray,
	type JSONObject,
	type JSONValue,
} from "ISJSON/mod.ts";
import { getRunnerWorkspacePath } from "GHACTIONS/runner.ts";
import getRegExpURL from "REGEXPURL";
import { contentType } from "STD/media-types/content-type";
import { basename as pathBasename } from "STD/path/basename";
import { extname as pathExtname } from "STD/path/extname";
import { isAbsolute as pathIsAbsolute } from "STD/path/is-absolute";
import { globToRegExp } from "STD/path/glob-to-regexp";
import { join as pathJoin } from "STD/path/join";
import type { StringTruncator } from "STRINGOVERFLOW/mod.ts";
import { colorNamespaceList } from "./_color_namespace_list.ts";
import {
	walkFS,
	type FSWalkEntry
} from "./_fswalk.ts";
import { generateRandomInteger } from "./_random_integer.ts";
const thresholdContent = 2000;
const thresholdEmbeds = 10;
const thresholdEmbedAuthorName = 256;
const thresholdEmbedDescription = 4096;
const thresholdEmbedFields = 25;
const thresholdEmbedFieldName = 256;
const thresholdEmbedFieldValue = 1024;
const thresholdEmbedFooterText = 2048;
const thresholdEmbedTitle = 256;
const thresholdFiles = 10;
const thresholdUsername = 80;
const regexpGuildedWebhookURL = /^(?:https:\/\/media\.guilded\.gg\/webhooks\/)?(?<key>\d+\/(?:[\dA-Za-z][\dA-Za-z_-]*)?[\dA-Za-z])$/u;
const regexpISO8601 = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ$/;
//deno-lint-ignore default-param-last
export function resolveContent(content: string, contentLinksNoEmbed: string[] = [], truncator?: StringTruncator): string | undefined {
	const contentLinksNoEmbedRegExp: RegExp | undefined = (contentLinksNoEmbed.length > 0) ? new RegExp(contentLinksNoEmbed.join("|"), "u") : undefined;
	if (content.length === 0) {
		return undefined;
	}
	const contentFmt: string = (typeof contentLinksNoEmbedRegExp === "undefined") ? content : content.replace(getRegExpURL({
		apostrophes: false,
		auth: true,
		exact: false,
		ipv4: true,
		ipv6: true,
		localhost: false,
		parens: false,
		//@ts-ignore `re2` is exist but not public.
		re2: false,
		returnString: false,
		strict: false,
		trailingPeriod: false
	}), (value: string): string => {
		return ((URL.canParse(value) && /^https?:\/\//u.test(value) && contentLinksNoEmbedRegExp.test(value)) ? `<${value}>` : value);
	});
	if (typeof truncator !== "undefined" && contentFmt.length > thresholdContent) {
		return truncator.truncate(contentFmt, thresholdContent);
	}
	return contentFmt;
}
export function resolveEmbeds(embeds: unknown, truncator?: StringTruncator): JSONArray | undefined {
	if (embeds === null) {
		return undefined;
	}
	if (!isJSONArray(embeds)) {
		throw new TypeError(`Input \`embeds\` is not a valid Guilded embeds!`);
	}
	const embedsFmt: JSONArray = embeds.map((embed: JSONValue, embedsIndex: number): JSONObject => {
		if (!isJSONObject(embed)) {
			throw new TypeError(`Input \`embeds[${embedsIndex}]\` is not a valid Guilded embed!`);
		}
		for (const embedKey of Object.keys(embed)) {
			switch (embedKey) {
				case "title":
					if (typeof embed.title !== "string") {
						throw new TypeError(`Input \`embeds[${embedsIndex}].title\` is not a string!`);
					}
					if (embed.title.length === 0) {
						delete embed.title;
						break;
					}
					if (typeof truncator !== "undefined" && embed.title.length > thresholdEmbedTitle) {
						embed.title = truncator.truncate(embed.title, thresholdEmbedTitle);
					}
					break;
				case "description":
					if (typeof embed.description !== "string") {
						throw new TypeError(`Input \`embeds[${embedsIndex}].description\` is not a string!`);
					}
					if (embed.description.length === 0) {
						delete embed.description;
						break;
					}
					if (typeof truncator !== "undefined" && embed.description.length > thresholdEmbedDescription) {
						embed.description = truncator.truncate(embed.description, thresholdEmbedDescription);
					}
					break;
				case "url":
					if (typeof embed.url !== "string") {
						throw new TypeError(`Input \`embeds[${embedsIndex}].url\` is not a string!`);
					}
					if (embed.url.length === 0) {
						delete embed.url;
						break;
					}
					break;
				case "timestamp":
					if (typeof embed.timestamp !== "string") {
						throw new TypeError(`Input \`embeds[${embedsIndex}].timestamp\` is not a string!`);
					}
					if (embed.timestamp.length === 0) {
						delete embed.timestamp;
						break;
					}
					if (!(regexpISO8601.test(embed.timestamp) && new Date(embed.timestamp))) {
						throw new SyntaxError(`\`${embed.timestamp}\` (input \`embeds[${embedsIndex}].timestamp\`) is not a valid ISO 8601 timestamp!`);
					}
					break;
				case "color":
					if (typeof embed.color === "number") {
						if (!(Number.isSafeInteger(embed.color) && embed.color >= 0 && embed.color <= 16777215)) {
							throw new RangeError(`\`${embed.color}\` (input \`embeds[${embedsIndex}].color\`) is not a valid RGB integer!`);
						}
					} else if (typeof embed.color === "string") {
						if (embed.color.length === 0) {
							delete embed.color;
							break;
						}
						if (embed.color === "Random") {
							embed.color = (generateRandomInteger({ d: 256 }) * 65536) + (generateRandomInteger({ d: 256 }) * 256) + generateRandomInteger({ d: 256 });
						} else if (colorNamespaceList.has(embed.color)) {
							embed.color = Color(colorNamespaceList.get(embed.color)!, "hex").rgbNumber();
						} else {
							try {
								embed.color = Color(embed.color).rgbNumber();
							} catch (error) {
								throw new SyntaxError(`\`${embed.color}\` (input \`embeds[${embedsIndex}].color\`) is not a valid CSS colour: ${error}`);
							}
						}
					} else {
						throw new TypeError(`Input \`embeds[${embedsIndex}].color\` is not a valid CSS colour or RGB integer!`);
					}
					break;
				case "footer":
					if (!isJSONObject(embed.footer)) {
						throw new TypeError(`Input \`embeds[${embedsIndex}].footer\` is not a valid Guilded footer!`);
					}
					for (const embedFooterKey of Object.keys(embed.footer)) {
						switch (embedFooterKey) {
							case "text":
								if (typeof embed.footer.text !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].footer.text\` is not a string!`);
								}
								if (embed.footer.text.length === 0) {
									delete embed.footer.text;
									break;
								}
								if (typeof truncator !== "undefined" && embed.footer.text.length > thresholdEmbedFooterText) {
									embed.footer.text = truncator.truncate(embed.footer.text, thresholdEmbedFooterText);
								}
								break;
							case "iconUrl":
								if (typeof embed.footer.iconUrl !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].footer.iconUrl\` is not a string!`);
								}
								if (embed.footer.iconUrl.length === 0) {
									delete embed.footer.iconUrl;
									break;
								}
								break;
							default:
								throw new SyntaxError(`Unknown input \`embeds[${embedsIndex}].footer.${embedFooterKey}\`!`);
						}
					}
					if (Object.keys(embed.footer).length === 0) {
						delete embed.footer;
						break;
					}
					break;
				case "image":
					if (!isJSONObject(embed.image)) {
						throw new TypeError(`Input \`embeds[${embedsIndex}].image\` is not a valid Guilded image!`);
					}
					for (const embedImageKey of Object.keys(embed.image)) {
						switch (embedImageKey) {
							case "url":
								if (typeof embed.image.url !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].image.url\` is not a string!`);
								}
								if (embed.image.url.length === 0) {
									delete embed.image.url;
									break;
								}
								break;
							default:
								throw new SyntaxError(`Unknown input \`embeds[${embedsIndex}].image.${embedImageKey}\`!`);
						}
					}
					if (Object.keys(embed.image).length === 0) {
						delete embed.image;
						break;
					}
					break;
				case "thumbnail":
					if (!isJSONObject(embed.thumbnail)) {
						throw new TypeError(`Input \`embeds[${embedsIndex}].thumbnail\` is not a valid Guilded thumbnail!`);
					}
					for (const embedThumbnailKey of Object.keys(embed.thumbnail)) {
						switch (embedThumbnailKey) {
							case "url":
								if (typeof embed.thumbnail.url !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].thumbnail.url\` is not a string!`);
								}
								if (embed.thumbnail.url.length === 0) {
									delete embed.thumbnail.url;
									break;
								}
								break;
							default:
								throw new SyntaxError(`Unknown input \`embeds[${embedsIndex}].thumbnail.${embedThumbnailKey}\`!`);
						}
					}
					if (Object.keys(embed.thumbnail).length === 0) {
						delete embed.thumbnail;
						break;
					}
					break;
				case "author":
					if (!isJSONObject(embed.author)) {
						throw new TypeError(`Input \`embeds[${embedsIndex}].author\` is not a valid Guilded author!`);
					}
					for (const embedAuthorKey of Object.keys(embed.author)) {
						switch (embedAuthorKey) {
							case "name":
								if (typeof embed.author.name !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].author.name\` is not a string!`);
								}
								if (embed.author.name.length === 0) {
									delete embed.author.name;
									break;
								}
								if (typeof truncator !== "undefined" && embed.author.name.length > thresholdEmbedAuthorName) {
									embed.author.name = truncator.truncate(embed.author.name, thresholdEmbedAuthorName);
								}
								break;
							case "url":
								if (typeof embed.author.url !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].author.url\` is not a string!`);
								}
								if (embed.author.url.length === 0) {
									delete embed.author.url;
									break;
								}
								break;
							case "iconUrl":
								if (typeof embed.author.iconUrl !== "string") {
									throw new TypeError(`Input \`embeds[${embedsIndex}].author.iconUrl\` is not a string!`);
								}
								if (embed.author.iconUrl.length === 0) {
									delete embed.author.iconUrl;
									break;
								}
								break;
							default:
								throw new SyntaxError(`Unknown input \`embeds[${embedsIndex}].author.${embedAuthorKey}\`!`);
						}
					}
					if (Object.keys(embed.author).length === 0) {
						delete embed.author;
						break;
					}
					break;
				case "fields":
					if (!isJSONArray(embed.fields)) {
						throw new TypeError(`Input \`embed[${embedsIndex}].fields\` is not a valid Guilded embed fields!`);
					}
					if (embed.fields.length > 0) {
						embed.fields = embed.fields.map((field: JSONValue, fieldsIndex: number): JSONObject => {
							if (!isJSONObject(field)) {
								throw new TypeError(`Input \`embeds[${embedsIndex}].fields[${fieldsIndex}]\` is not a valid Guilded embed field!`);
							}
							for (const embedFieldKey of Object.keys(field)) {
								switch (embedFieldKey) {
									case "name":
										if (typeof field.name !== "string") {
											throw new TypeError(`Input \`embeds[${embedsIndex}].fields[${fieldsIndex}].name\` is not a string!`);
										}
										if (typeof truncator !== "undefined" && field.name.length > thresholdEmbedFieldName) {
											field.name = truncator.truncate(field.name, thresholdEmbedFieldName);
										}
										break;
									case "value":
										if (typeof field.value !== "string") {
											throw new TypeError(`Input \`embeds[${embedsIndex}].fields[${fieldsIndex}].value\` is not a string!`);
										}
										if (typeof truncator !== "undefined" && field.value.length > thresholdEmbedFieldValue) {
											field.value = truncator.truncate(field.value, thresholdEmbedFieldValue);
										}
										break;
									case "inline":
										if (typeof field.inline !== "boolean") {
											throw new TypeError(`Input \`embeds[${embedsIndex}].fields[${fieldsIndex}].inline\` is not a boolean!`);
										}
										break;
									default:
										throw new SyntaxError(`Unknown input \`embeds[${embedsIndex}].fields[${fieldsIndex}].${embedFieldKey}\`!`);
								}
							}
							return field;
						}).filter((field: JSONObject): boolean => {
							return (
								(field.name as string).length > 0 ||
								(field.value as string).length > 0
							);
						});
					}
					if (embed.fields.length > thresholdEmbedFields) {
						throw new SyntaxError(`Input \`embeds[${embedsIndex}].fields\` must not have more than ${thresholdEmbedFields} fields (current ${embed.fields.length})!`);
					}
					if (embed.fields.length === 0) {
						delete embed.fields;
						break;
					}
					break;
				default:
					throw new SyntaxError(`Unknown input \`embeds[${embedsIndex}].${embedKey}\`!`);
			}
		}
		return embed;
	}).filter((embed: JSONObject): boolean => {
		return (Object.keys(embed).length > 0);
	});
	if (embedsFmt.length === 0) {
		return undefined;
	}
	if (embedsFmt.length > thresholdEmbeds) {
		throw new SyntaxError(`Input \`embeds\` must not have more than ${thresholdEmbeds} embeds (current ${embedsFmt.length})!`);
	}
	return embedsFmt;
}
async function resolveFilesFormData(workspace: string, files: string[]): Promise<FormData> {
	if (files.length > thresholdFiles) {
		throw new Error(`Input \`files\` must not have more than ${thresholdFiles} files (current ${files.length})!`);
	}
	const formData: FormData = new FormData();
	for (let index = 0; index < files.length; index += 1) {
		const file: string = files[index];
		formData.append(`files[${index}]`, new Blob([await Deno.readFile(pathJoin(workspace, file))], { type: contentType(pathExtname(file)) }), pathBasename(file));
	}
	return formData;
}
export async function resolveFiles(files: string[], glob: boolean): Promise<FormData | undefined> {
	const workspace: string = getRunnerWorkspacePath();
	const workspaceStat: Deno.FileInfo = await Deno.stat(workspace);
	if (!workspaceStat.isDirectory) {
		throw new Deno.errors.NotADirectory(`Workspace \`${workspace}\` is not a directory!`);
	}
	if (files.length === 0) {
		return undefined;
	}
	if (glob) {
		const matchers: RegExp[] = files.map((file: string): RegExp => {
			return globToRegExp(file, { caseInsensitive: true });
		});
		const filesFmt: string[] = (await Array.fromAsync(walkFS(workspace, {
			includeDirs: false,
			includeRoot: false,
			includeSymlinks: false
		}))).filter(({
			pathAbsolute,
			pathRelative
		}: FSWalkEntry): boolean => {
			return pathAbsolute.startsWith(workspace) && matchers.some((matcher: RegExp): boolean => {
				return matcher.test(pathRelative);
			});
		}).map(({ pathRelative }: FSWalkEntry): string => {
			return pathRelative;
		});
		if (filesFmt.length === 0) {
			return undefined;
		}
		return resolveFilesFormData(workspace, filesFmt);
	}
	const filesStatRejected: unknown[] = (await Promise.allSettled(files.map(async (file: string): Promise<void> => {
		if (pathIsAbsolute(file)) {
			throw new Error(`\`${file}\` is not a relative file path!`);
		}
		const fileStat: Deno.FileInfo = await Deno.stat(pathJoin(workspace, file));
		if (!fileStat.isFile) {
			throw new Error(`\`${file}\` is not a file!`);
		}
	}))).map((fileStat: PromiseSettledResult<void>): unknown => {
		return ((fileStat.status === "rejected") ? fileStat.reason : undefined);
	}).filter((reason: unknown): boolean => {
		return (typeof reason !== "undefined");
	});
	if (filesStatRejected.length > 0) {
		throw new AggregateError(filesStatRejected, `Unable to process files!`);
	}
	return resolveFilesFormData(workspace, files);
}
export function resolveKey(key: string): string {
	if (!regexpGuildedWebhookURL.test(key)) {
		throw new TypeError(`Input \`key\` is not a valid Guilded webhook key!`);
	}
	return key.match(regexpGuildedWebhookURL)?.groups?.key as string;
}
export function resolveUsername(username: string, truncator?: StringTruncator): string | undefined {
	if (username.length === 0) {
		return undefined;
	}
	if (typeof truncator !== "undefined" && username.length > thresholdUsername) {
		return truncator.truncate(username, thresholdUsername);
	}
	return username;
}
