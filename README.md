# logora-file

[![NPM version](https://img.shields.io/npm/v/logora-file?style=flat-square)](https://www.npmjs.com/package/logora-file)
[![Coverage Status](https://coveralls.io/repos/github/boseba/logora-file/badge.svg?branch=main)](https://coveralls.io/github/boseba/logora-file?branch=main)

**logora-file** is the official file output module for the [Logora](https://www.npmjs.com/package/logora) logging framework.

It writes logs to files with support for text and JSON outputs, dynamic templating for text logs, file rotation policies, and retention rules.

\---

## Features

* Text file output with `formatString` templating
* JSON Lines output for structured machine-readable logs
* Custom timestamp formatting for text logs (via Day.js)
* Conditional block rendering in text templates
* File rotation support:

  * `daily`
  * `size`
  * `startup`
  * or any combination of these policies
* Retention support via:

  * `maxFiles`
  * `maxAgeDays`
* Relative or absolute file paths
* Automatic directory creation (`mkdir`)
* Non-blocking integration with Logora scoped loggers

\---

## Installation

```bash
npm install logora logora-file
```

\---

## Basic Usage

### Text output

```ts
import { createLogger, LogLevel } from "logora";
import { createFileTextOutput } from "logora-file";

const logger = createLogger({ level: LogLevel.Info });

logger.addLogOutput(
    createFileTextOutput({
        path: "./logs/app.log",
    })
);

logger.info("Server started on port {0}", 3000);
```

### JSON output

```ts
import { createLogger, LogLevel } from "logora";
import { createFileJsonOutput } from "logora-file";

const logger = createLogger({ level: LogLevel.Info });

logger.addLogOutput(
    createFileJsonOutput({
        path: "./logs/app.json",
    })
);

logger.info("Server started on port {0}", 3000);
```

\---

## Multiple File Outputs

You can combine multiple file outputs in the same logger configuration.

```ts
import { createLogger, LogLevel } from "logora";
import {
    createFileJsonOutput,
    createFileTextOutput,
} from "logora-file";

const logger = createLogger({
    level: LogLevel.Debug,
    outputs: \[
        createFileTextOutput({
            path: "./logs/app.log",
            level: LogLevel.Info,
            rotation: \["daily", "size"],
            maxSizeBytes: 5 \* 1024 \* 1024,
            maxFiles: 10,
        }),
        createFileJsonOutput({
            path: "./logs/app.json",
            level: LogLevel.Warning,
            rotation: \["daily", "startup"],
            maxFiles: 30,
        }),
    ],
});

logger.info("Application started");
logger.warning("Disk usage is high: {0}%", 87);
logger.error("Unhandled error: {0}", new Error("Test"));
```

\---

## Scoped Logging

You can create scoped loggers using `getScoped()`:

```ts
const dbLogger = logger.getScoped("Database");

dbLogger.debug("Connection opened.");
dbLogger.error("Query failed: {0}", error.message);
```

This scope will appear in your text `formatString` if defined via `%scope%`.

In JSON output, the scope is written as a structured `scope` property.

\---

## Text Format String

Text file output uses a `formatString` to control the structure of each log line.

### Supported placeholders

* `%timestamp%`
* `%scope%`
* `%type%`
* `%message%`

### Conditional blocks

Conditional blocks are wrapped in braces and rendered only if all placeholders inside them resolve to non-empty values.

Example:

```ts
createFileTextOutput({
    formatString: "\[%timestamp%] {\[%scope%] }%type%: %message%",
});
```

If no scope is defined, the optional block is removed automatically.

\---

## Daily Header

Text file output can insert a daily header when the day changes.

Example default behavior:

```text
March 30th 2026, 11:20:42
\[11:20:42] Info: Server started
```

This behavior can be configured with:

* `showDateHeader`
* `dailyHeaderFormatString`
* `dailyHeaderDateFormat`

\---

## JSON Output Format

JSON output uses a JSON Lines style format:

* one JSON object per line
* suitable for ingestion by structured log collectors or parsers

Structured logs written via `info()`, `debug()`, `warning()`, etc. produce records like:

```json
{"timestamp":"2026-03-30T10:00:00.000Z","type":1,"message":"Server started on port {0}","args":\[3000],"scope":null}
```

Raw `print()` calls produce records like:

```json
{"timestamp":"2026-03-30T10:00:00.000Z","kind":"raw","message":"Hello {0}","args":\["World"]}
```

`title()` produces records like:

```json
{"timestamp":"2026-03-30T10:00:00.000Z","kind":"title","title":"Startup"}
```

`empty()` and `clear()` are ignored for JSON output.

\---

## Rotation Policies

Rotation is configured with the `rotation` option as an array.

Supported values:

* `"daily"`
* `"size"`
* `"startup"`

These policies are combinable.

### Example

```ts
createFileTextOutput({
    path: "./logs/app.log",
    rotation: \["daily", "size", "startup"],
    maxSizeBytes: 10 \* 1024 \* 1024,
    maxFiles: 14,
    maxAgeDays: 30,
});
```

### Notes

* If `rotation` is omitted, no rotation is applied.
* `size` rotation requires a valid `maxSizeBytes`.
* `startup` rotates the current file only if it already exists and is not empty.

\---

## Path Handling

The `path` option supports both:

* relative paths
* absolute paths

Relative paths are resolved from `process.cwd()`.

If `mkdir` is enabled, missing parent directories are created automatically.

\---

## Configuration Options

### Common file output options

|Option|Type|Default|Description|
|-|-|-|-|
|`path`|`string`|`./logs/app.log`|Destination file path|
|`level`|`LogLevel`|logger default|Minimum log level for this output|
|`mkdir`|`boolean`|`true`|Automatically create missing parent directories|
|`append`|`boolean`|`true`|Append to the active file if it already exists|
|`encoding`|`BufferEncoding`|`"utf8"`|File encoding|
|`eol`|`string`|`"\\n"`|End-of-line sequence|
|`rotation`|`Array<"daily" \| "size" \| "startup">`|`undefined`|Rotation policies to apply|
|`maxSizeBytes`|`number`|`undefined`|Maximum file size before rotation when `size` is enabled|
|`maxFiles`|`number`|`undefined`|Maximum number of rotated files to keep|
|`maxAgeDays`|`number`|`undefined`|Maximum age in days for rotated files|

### Text output options

|Option|Type|Default|Description|
|-|-|-|-|
|`formatString`|`string`|`\[%timestamp%] {\[%scope%] }%type%: %message%`|Template used to format each log line|
|`showDateHeader`|`boolean`|`true`|Insert a daily header when the day changes|
|`timestampFormat`|`string`|`"HH:mm:ss"`|Day.js format for timestamps|
|`dailyHeaderFormatString`|`string`|`%dailyHeader%`|Template used for the daily header|
|`dailyHeaderDateFormat`|`string`|`"MMMM Do YYYY, hh:mm:ss"`|Day.js format for the daily header date|

### JSON output options

JSON output currently uses the common file output options only.

\---

## Factories

### `createFileTextOutput()`

Creates a text file output.

```ts
createFileTextOutput({
    path: "./logs/app.log",
    formatString: "\[%timestamp%] {\[%scope%] }%type%: %message%",
});
```

### `createFileJsonOutput()`

Creates a JSON Lines file output.

```ts
createFileJsonOutput({
    path: "./logs/app.json",
    rotation: \["daily", "startup"],
});
```

\---

## Behavior Notes

* `clear()` is a no-op for file outputs
* `empty()` writes blank lines for text output
* `empty()` is ignored for JSON output
* `print()` writes raw text in text output
* `print()` writes a structured `kind: "raw"` record in JSON output
* `title()` writes plain text in text output
* `title()` writes a structured `kind: "title"` record in JSON output

\---

## License

MIT © Sébastien Bosmans

