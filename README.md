# Send Guilded Webhook (GitHub Action)

[**⚖️** MIT](./LICENSE.md)

[![GitHub: hugoalh/send-guilded-webhook-ghaction](https://img.shields.io/github/v/release/hugoalh/send-guilded-webhook-ghaction?label=hugoalh/send-guilded-webhook-ghaction&labelColor=181717&logo=github&logoColor=ffffff&sort=semver&style=flat "GitHub: hugoalh/send-guilded-webhook-ghaction")](https://github.com/hugoalh/send-guilded-webhook-ghaction)

A GitHub Action to send Guilded webhook.

> [!IMPORTANT]
> - This documentation is v0.1.0 based; To view other version's documentation, please visit the [versions list](https://github.com/hugoalh/send-guilded-webhook-ghaction/tags) and select the correct version.

## 🌟 Features

- Support attachments/files.

## 🔰 Begin

### 🎯 Targets

|  | **GitHub** |
|:--|:--|
| **[GitHub Actions Runner](https://github.com/actions/runner)** | [✔️ Docker](https://docs.github.com/en/actions) |

> [!NOTE]
> - It is possible to use this action in other methods/ways which not listed in here, however those methods/ways are not officially supported, and should beware maybe cause security issues.

### #️⃣ Resources Identifier

- **GitHub:**
  ```
  hugoalh/send-guilded-webhook-ghaction[@{Tag}]
  ```

> [!NOTE]
> - It is recommended to use this action with tag for immutability.

### 🛡️ GitHub Token Permissions

*This action does not request any GitHub token permission.*

## 🧩 Inputs

Almost all of the inputs are optional, but these groups of inputs must be defined:

- [`key`](#key)
- [`content`](#content), [`embeds`](#embeds), and/or [`files`](#files)

> | **Legend** | **Description** |
> |:-:|:--|
> | 🔐 | Should be an encrypted secret. |

### `key`

**🔐** `<string>` Guilded webhook key; These syntaxes are acceptable:

- **Webhook ID & Token:** `{webhook.id}/{webhook.token}`
- **URL:** `https://media.guilded.gg/webhooks/{webhook.id}/{webhook.token}`

### `username`

`<string>` Override the default webhook username, maximum 80 characters.

### `avatar_url`

`<string>` Override the default webhook avatar, only support URL of HTTP and HTTPS.

### `content`

`<string>` Message content, maximum 2000 characters; Support Guilded Markdown.

### `content_links_no_embed`

`<RegExp[]>` Links' regular expressions to prevent Guilded resolve and display matches links in the [`content`](#content) as embed under the message, only support URL of HTTP and HTTPS, separate each value per line.

Examples:

- **All:** `.+`
- **`.png` Image:** `\.png(?:\?|#|$)`
- **`.webp` Image:** `\.webp(?:\?|#|$)`
- **Twitch:** `twitch\.tv`

### `embeds`

`<object[]>` Message embed rich content, by JSON or YAML with restricted syntaxes, maximum 10 embeds, and maximum 6000 characters for summation from inputs:

- [`embeds[*].title`](#embedstitle)
- [`embeds[*].description`](#embedsdescription)
- [`embeds[*].footer.text`](#embedsfootertext)
- [`embeds[*].author.name`](#embedsauthorname)
- [`embeds[*].fields[*].name`](#embedsfieldsname)
- [`embeds[*].fields[*].value`](#embedsfieldsvalue)

#### `embeds[*].title`

`<string>` Message embed title, maximum 256 characters; Support Guilded Markdown.

#### `embeds[*].description`

`<string>` Message embed description, maximum 4096 characters; Support Guilded Markdown.

#### `embeds[*].url`

`<string>` Message embed URL.

#### `embeds[*].timestamp`

`<string>` Message embed timestamp, by ISO 8601 format (e.g.: `"2011-11-11T11:11:11Z"`).

#### `embeds[*].color`

`<number | string = 2105893>` Message embed colour (i.e.: left border's colour of the embed); These syntaxes are acceptable:

- **RGB Integer:** `{number}` (e.g.: `2105893`)
- **Hex:** `#{hex}{hex}{hex}` / `#{hex}{hex}{hex}{hex}{hex}{hex}` (e.g.: `#0063B1`)
- **Namespace:** (e.g.: `Blue`)
- **CSS:** (e.g.: `rgb(32, 34, 37)`)
- **Random:** `Random`

> [!NOTE]
> - Alpha channel is not supported.
> - General namespace are provided by NPM package [`color-name-list`](https://www.npmjs.com/package/color-name-list), list maybe change or remove without any notification, it is recommended to use value instead.

#### `embeds[*].footer`

`<object>` Message embed footer.

#### `embeds[*].footer.text`

`<string>` Message embed footer text, maximum 2048 characters; Support Guilded Markdown.

#### `embeds[*].footer.iconUrl`

`<string>` Message embed footer icon, only support URL of HTTP, HTTPS, and attachments.

#### `embeds[*].image`

`<object>` Message embed image.

#### `embeds[*].image.url`

`<string>` Message embed image URL, only support URL of HTTP, HTTPS, and attachments.

#### `embeds[*].thumbnail`

`<object>` Message embed thumbnail.

#### `embeds[*].thumbnail.url`

`<string>` Message embed thumbnail URL, only support URL of HTTP, HTTPS, and attachments.

#### `embeds[*].author`

`<object>` Message embed author.

#### `embeds[*].author.name`

`<string>` Message embed author name, maximum 256 characters.

#### `embeds[*].author.url`

`<string>` Message embed author URL.

#### `embeds[*].author.iconUrl`

`<string>` Message embed author icon, only support URL of HTTP, HTTPS, and attachments.

#### `embeds[*].fields`

`<object[]>` Message embed fields, maximum 25 fields.

#### `embeds[*].fields[*].name`

`<string>` Message embed field name, maximum 256 characters; Support Guilded Markdown.

#### `embeds[*].fields[*].value`

`<string>` Message embed field value, maximum 1024 characters; Support Guilded Markdown.

#### `embeds[*].fields[*].inline`

`<boolean = false>` Whether the message embed field should display inline.

### `files`

`<string[]>` Message attachments/files, by Glob path or literal path (select by input [`files_glob`](#files_glob)) under the workspace, separate each value per line, maximum 8 MB and 10 files.

### `files_glob`

`<boolean = true>` Whether input [files](#files) should accept Glob path instead of literal path.

### `truncate_enable`

`<boolean = true>` Whether to try truncate firstly when inputs are too large.

### `truncate_ellipsis`

`<string = "...">` Ellipsis mark.

### `truncate_position`

`<string = "end">` Ellipsis position.

- **`"end"`:** At the end of the string.
- **`"middle"`:** At the middle of the string.
- **`"start"`:** At the start of the string.

## 🧩 Outputs

### `response`

`<string>` Response content.

### `status_code`

`<number>` Request status code.

### `status_ok`

`<boolean>` Whether the request was successful.

### `status_text`

`<string>` Request status text.

## ✍️ Examples

- Hello, world!
  ```yml
  jobs:
    job_id:
      name: "Send Guilded Webhook"
      runs-on: "ubuntu-latest"
      steps:
        - uses: "hugoalh/send-guilded-webhook-ghaction@v0.1.0"
          with:
            key: "${{secrets.GUILDED_WEBHOOK_KEY}}"
            content: "Hello, world!"
  ```

## 📚 Guides

- GitHub Actions
  - [Enabling debug logging](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging)
  - [Encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- Guilded
  - [Execute Webhook](https://guildedapi.com/resources/webhook/#execute-webhook)
  - [Incoming Webhooks](https://support.guilded.gg/hc/en-us/articles/360038927934-Incoming-Webhooks)
