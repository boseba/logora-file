import { Placeholder } from "../enums";

type TemplateValueMap = Record<string, string>;

/**
 * Renders format strings with placeholder substitution and optional blocks.
 *
 * Optional blocks are delimited using single braces:
 * `{[...]}`
 *
 * A block is kept only if all placeholders inside the block resolve
 * to non-empty values. Otherwise, the whole block is removed.
 */
export class TemplateEngine {
  private static readonly OPTIONAL_BLOCK_REGEX: RegExp = /\{([^{}]*)\}/g;

  private static readonly PLACEHOLDER_REGEX: RegExp = /%[a-zA-Z]+%/g;

  /**
   * Renders a template using the provided placeholder values.
   *
   * @param template The template string to render.
   * @param values The placeholder value map.
   * @returns The rendered string.
   */
  public static render(template: string, values: TemplateValueMap): string {
    const withOptionalBlocks: string = this._renderOptionalBlocks(
      template,
      values,
    );

    return this._replacePlaceholders(withOptionalBlocks, values);
  }

  /**
   * Builds a placeholder map from known placeholder values.
   *
   * @param timestamp Timestamp value.
   * @param scope Scope value.
   * @param type Type value.
   * @param message Message value.
   * @param dailyHeader Daily header value.
   * @returns A placeholder value map.
   */
  public static createValueMap(
    timestamp: string,
    scope: string,
    type: string,
    message: string,
    dailyHeader: string,
  ): TemplateValueMap {
    return {
      [Placeholder.Timestamp]: timestamp,
      [Placeholder.Scope]: scope,
      [Placeholder.Type]: type,
      [Placeholder.Message]: message,
      [Placeholder.DailyHeader]: dailyHeader,
    };
  }

  private static _renderOptionalBlocks(
    template: string,
    values: TemplateValueMap,
  ): string {
    return template.replace(
      this.OPTIONAL_BLOCK_REGEX,
      (fullMatch: string, blockContent: string): string => {
        const placeholders: string[] =
          blockContent.match(this.PLACEHOLDER_REGEX) ?? [];

        if (placeholders.length === 0) {
          return blockContent;
        }

        const shouldKeepBlock: boolean = placeholders.every(
          (placeholder: string) => {
            const value: string | undefined = values[placeholder];

            return value !== undefined && value !== "";
          },
        );

        if (!shouldKeepBlock) {
          return "";
        }

        return this._replacePlaceholders(blockContent, values);
      },
    );
  }

  private static _replacePlaceholders(
    template: string,
    values: TemplateValueMap,
  ): string {
    return template.replace(
      this.PLACEHOLDER_REGEX,
      (placeholder: string): string => values[placeholder] ?? "",
    );
  }
}
