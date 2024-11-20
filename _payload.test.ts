import { assertEquals } from "STD/assert/equals";
import {
	resolveContent,
	resolveEmbeds
} from "./_payload.ts";
Deno.test("Content 1", { permissions: "none" }, () => {
	assertEquals(resolveContent(""), undefined);
});
Deno.test("Content 2", { permissions: "none" }, () => {
	assertEquals(resolveContent("Hello, world!"), "Hello, world!");
});
Deno.test("Content 3", { permissions: "none" }, () => {
	assertEquals(resolveContent("The URL of GitHub is https://github.com.", ["github\\.com"]), "The URL of GitHub is <https://github.com>.");
});
Deno.test("Content 4", { permissions: "none" }, () => {
	assertEquals(resolveContent("The URL of Google is https://google.com.", ["github\\.com"]), "The URL of Google is https://google.com.");
});
Deno.test("Content 5", { permissions: "none" }, () => {
	assertEquals(resolveContent("Repeat the URLs are also improved: https://github.com, https://github.com, https://github.com, https://github.com.", ["github\\.com"]), "Repeat the URLs are also improved: <https://github.com>, <https://github.com>, <https://github.com>, <https://github.com>.");
});
Deno.test("Embeds 1", { permissions: "none" }, () => {
	assertEquals(resolveEmbeds([{}]), undefined);
});
Deno.test("Embeds 2", { permissions: "none" }, () => {
	assertEquals(resolveEmbeds([{
		"author": {
			"name": "Birdie♫",
			"url": "https://www.reddit.com/r/cats/",
			"iconUrl": "https://i.imgur.com/R66g1Pe.jpg"
		},
		"title": "Title",
		"url": "https://google.com/",
		"description": "Text message. You can use Markdown here. *Italic* **bold** __underline__ ~~strikeout~~ [hyperlink](https://google.com) `code`",
		"color": 15258703,
		"fields": [
			{
				"name": "Text",
				"value": "More text",
				"inline": true
			},
			{
				"name": "Even more text",
				"value": "Yup",
				"inline": true
			},
			{
				"name": "Use `\"inline\": true` parameter, if you want to display fields in the same line.",
				"value": "okay..."
			},
			{
				"name": "Thanks!",
				"value": "You're welcome :wink:"
			}
		],
		"thumbnail": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg"
		},
		"image": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/A_picture_from_China_every_day_108.jpg"
		},
		"footer": {
			"text": "Woah! So cool! :smirk:",
			"iconUrl": "https://i.imgur.com/fKL31aD.jpg"
		}
	}]), [{
		"author": {
			"name": "Birdie♫",
			"url": "https://www.reddit.com/r/cats/",
			"iconUrl": "https://i.imgur.com/R66g1Pe.jpg"
		},
		"title": "Title",
		"url": "https://google.com/",
		"description": "Text message. You can use Markdown here. *Italic* **bold** __underline__ ~~strikeout~~ [hyperlink](https://google.com) `code`",
		"color": 15258703,
		"fields": [
			{
				"name": "Text",
				"value": "More text",
				"inline": true
			},
			{
				"name": "Even more text",
				"value": "Yup",
				"inline": true
			},
			{
				"name": "Use `\"inline\": true` parameter, if you want to display fields in the same line.",
				"value": "okay..."
			},
			{
				"name": "Thanks!",
				"value": "You're welcome :wink:"
			}
		],
		"thumbnail": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg"
		},
		"image": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/A_picture_from_China_every_day_108.jpg"
		},
		"footer": {
			"text": "Woah! So cool! :smirk:",
			"iconUrl": "https://i.imgur.com/fKL31aD.jpg"
		}
	}]);
});
Deno.test("Embeds 3", { permissions: "none" }, () => {
	assertEquals(resolveEmbeds([{
		"author": {
			"name": "",
			"url": "",
			"iconUrl": ""
		},
		"title": "Title",
		"url": "https://google.com/",
		"description": "Text message. You can use Markdown here. *Italic* **bold** __underline__ ~~strikeout~~ [hyperlink](https://google.com) `code`",
		"color": 15258703,
		"fields": [
			{
				"name": "Text",
				"value": "More text",
				"inline": true
			},
			{
				"name": "Even more text",
				"value": "Yup",
				"inline": true
			},
			{
				"name": "Use `\"inline\": true` parameter, if you want to display fields in the same line.",
				"value": "okay..."
			},
			{
				"name": "",
				"value": ""
			}
		],
		"thumbnail": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg"
		},
		"image": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/A_picture_from_China_every_day_108.jpg"
		},
		"footer": {
			"text": "Woah! So cool! :smirk:",
			"iconUrl": "https://i.imgur.com/fKL31aD.jpg"
		}
	}]), [{
		"title": "Title",
		"url": "https://google.com/",
		"description": "Text message. You can use Markdown here. *Italic* **bold** __underline__ ~~strikeout~~ [hyperlink](https://google.com) `code`",
		"color": 15258703,
		"fields": [
			{
				"name": "Text",
				"value": "More text",
				"inline": true
			},
			{
				"name": "Even more text",
				"value": "Yup",
				"inline": true
			},
			{
				"name": "Use `\"inline\": true` parameter, if you want to display fields in the same line.",
				"value": "okay..."
			}
		],
		"thumbnail": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg"
		},
		"image": {
			"url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/A_picture_from_China_every_day_108.jpg"
		},
		"footer": {
			"text": "Woah! So cool! :smirk:",
			"iconUrl": "https://i.imgur.com/fKL31aD.jpg"
		}
	}]);
});
