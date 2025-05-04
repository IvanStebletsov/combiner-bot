#!/usr/bin/env python

import os
import re
import json

def write_comments_with_translations(translations, file):
    file.write('\n    /**')

    for lang_key in translations:
        file.write(f'\n     * - {lang_key}: {"".join(translations[lang_key].splitlines())}')

    file.write('\n     */')

def generate_static_func(string_name, translations, parameters_count, file):
    write_comments_with_translations(translations, file)

    file.write(f'\n    static {string_name}(')

    if parameters_count > 0:
        for index in range(0, parameters_count):
            file.write(f'param{index}: any')
            if index < parameters_count - 1:
                file.write(', ')
        file.write(', ')

    file.write('userId: number): string {')

    file.write(f'\n        const languageCode = this.getLanguageCode(userId)')

    if parameters_count > 0:
        file.write(f'\n        return this.formatString(localized.{string_name}[languageCode], ')
        for index in range(0, parameters_count):
            file.write(f'param{index}')
            if index < parameters_count - 1:
                file.write(', ')
        file.write(')')
    else:
        file.write(f'\n        return localized.{string_name}[languageCode]')

    file.write('\n    }\n')

def generate_format_helper(file):
    file.write('\n    private static formatString(str: string, ...val: string[]) {')
    file.write('\n        for (let index = 0; index < val.length; index++) {')
    file.write('\n            str = str.replace(`{${index}}`, val[index])')
    file.write('\n        }')
    file.write('\n        return str')
    file.write('\n    }')

def generate_language_extractor(file):
    file.write('\n    private static getLanguageCode(userId: number): string {')
    file.write('\n        return CoreCache.shared.get<string>(CoreCacheConstants.languageCode(userId)) ?? "ru"')
    file.write('\n    }\n')

def main():
    script_directory_name = os.path.dirname(__file__)
    json_file_path = os.path.abspath(os.path.join(script_directory_name, '..', 'Resources', 'Localizations', 'Localized.json'))
    json_file = json.load(open(json_file_path, 'r', encoding='utf-8'))

    ts_file_path = os.path.abspath(os.path.join(script_directory_name, '..', 'Resources', 'Localizations', 'Localized.ts'))
    ts_file = open(ts_file_path, 'r+')
    ts_file.truncate(0)

    ts_file.write('import { CoreCache } from "../../Cache/CoreCache"')
    ts_file.write('\nimport { CoreCacheConstants } from "../../Cache/CoreCacheConstants"')
    ts_file.write('\nimport * as localized from "./Localized.json"')
    ts_file.write('\n\nexport class Localized {')

    for string_name in json_file:
        translations = {}
        parameters_count = 0

        for lang_key in json_file[string_name]:
            translation = json_file[string_name][lang_key]
            parameters_count = len(re.findall("\{(\d+)\}", translation))
            translations[lang_key] = translation

        generate_static_func(
            string_name,
            translations,
            parameters_count,
            ts_file
        )

    generate_language_extractor(ts_file)
    generate_format_helper(ts_file)

    ts_file.write('\n}\n')
    ts_file.close()

if __name__ == "__main__":
    main()