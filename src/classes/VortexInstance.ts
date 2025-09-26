import color from 'cli-color'
import fs from 'node:fs'
import remove_json_comments from 'strip-json-comments'
let tags = {
    tag_error: `${color.whiteBright('[')}${color.redBright('ERROR')}${color.whiteBright(']')} -`,
    tag_warning: `${color.whiteBright('[')}${color.yellowBright('WARNING')}${color.whiteBright(']')} -`,
    tag_info: `${color.whiteBright('[')}${color.cyanBright('INFO')}${color.whiteBright(']')} -`,
}
class VortexInstance {
    settings: object
    settingsLoaded = false
    tokens = {
        ' ': 'whitespace',
        '//': 'comment_single',
        '/*': 'comment_multi_start',
        '*/': 'comment_multi_end',
        '+': 'op_add',
        '-': 'op_sub',
        '*': 'op_mul',
        '/': 'op_div',
        '%': 'op_mod',
        '=': 'op_assign',
        '**': 'op_pow',
        '^': 'op_xor',
        '&': 'op_and',
        '|': 'op_or',
        '~': 'op_not',
        '<<': 'op_lshift',
        '>>': 'op_rshift',
        '++': 'op_inc',
        '--': 'op_dec',
        '(': 'group_start',
        ')': 'group_end',
        '{': 'block_start',
        '}': 'block_end',
        ',': 'sep_arg',
        ';': 'sep_line',
        ':': 'sep_type',
        '::': 'sep_ns',
        '.': 'prop_access',
        '->': 'func_arrow',
        '=>': 'lambda_arrow',
        '==': 'con_eq',
        '!=': 'con_neq',
        '>': 'con_gt',
        '<': 'con_lt',
        '>=': 'con_gte',
        '<=': 'con_lte',
        '&&': 'con_and',
        '||': 'con_or',
        'true': 'bool_true',
        'false': 'bool_false',
        'null': 'null',
        'undefined': 'undefined',
        'byte': 'type_byte',
        'ubyte': 'type_ubyte',
        'short': 'type_short',
        'ushort': 'type_ushort',
        'int': 'type_int',
        'uint': 'type_uint',
        'long': 'type_long',
        'ulong': 'type_ulong',
        'float': 'type_float',
        'double': 'type_double',
        'string': 'type_string',
        'instance': 'type_instance',
        'bool': 'type_bool',
        'map': 'type_map',
        'dynamic': 'type_dynamic',
        'const': 'mod_const',
        'public': 'mod_public',
        'private': 'mod_private',
        'if': 'kw_if',
        'else': 'kw_else',
        'try': 'kw_try',
        'catch': 'kw_catch',
        'ignore': 'kw_ignore',
        'each': 'kw_foreach',
        'for': 'kw_for',
        'while': 'kw_while',
        'break': 'kw_break',
        'continue': 'kw_continue',
        'return': 'kw_return',
        'func': 'kw_func',
        'class': 'kw_class',
        'namespace': 'kw_namespace',
        'new': 'kw_new',
        'of': 'kw_of',
        'entry': 'kw_entry',
        'using': 'kw_using',
        '\'': 'string_squote',
        '"': 'string_dquote',
        '`': 'string_btick',
        '@': 'gop'
    }
    loadSettings() {
        if (this.settingsLoaded) return
        this.settings = JSON.parse(remove_json_comments(fs.readFileSync('.vortexsettings', 'utf8')))
        this.settingsLoaded = true
    }
    tokenize(line: string) {
        let tokens = [];
        let i = 0;
        let inString = false;
        let stringChar = null;
        let inComment = false;

        while (i < line.length) {
            let char = line[i];

            // --- Handle comment start ---
            if (!inComment && line.slice(i, i + 2) === '//') {
                tokens.push({
                    type: this.tokens['//'],
                    value: line.slice(i),
                    commented: true
                });
                break; // rest of line is comment
            }

            if (!inComment && line.slice(i, i + 2) === '/*') {
                inComment = true;
                tokens.push({
                    type: this.tokens['/*'],
                    value: '/*',
                    commented: true
                });
                i += 2;
                continue;
            }

            if (inComment) {
                if (line.slice(i, i + 2) === '*/') {
                    tokens.push({
                        type: this.tokens['*/'],
                        value: '*/',
                        commented: true
                    });
                    inComment = false;
                    i += 2;
                    continue;
                } else {
                    tokens.push({
                        type: 'comment_body',
                        value: line[i++],
                        commented: true
                    });
                    continue;
                }
            }
            // --- Try multi-char operators first ---
            let matched = null;
            for (let len = 3; len > 0; len--) {
                let fragment = line.slice(i, i + len);
                if (this.tokens[fragment]) {
                    matched = fragment;
                    break;
                }
            }
            if (matched) {
                tokens.push({
                    type: this.tokens[matched],
                    value: matched,
                    commented: false
                });
                i += matched.length;
                continue;
            }

            // --- Identifiers / numbers ---
            if (/[a-zA-Z_]/.test(char)) {
                let val = '';
                while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
                    val += line[i++];
                }
                tokens.push({
                    type: this.tokens[val] || 'identifier',
                    value: val,
                    commented: false
                });
                continue;
            }

            if (/[0-9]/.test(char)) {
                let val = '';
                while (i < line.length && /[0-9.]/.test(line[i])) {
                    val += line[i++];
                }
                tokens.push({
                    type: 'number',
                    value: val,
                    commented: false
                });
                continue;
            }

            // --- Ignore whitespace ---
            if (/\s/.test(char)) {
                i++;
                continue;
            }

            // --- Unrecognized character ---
            tokens.push({
                type: 'unknown',
                value: char,
                commented: false
            });
            i++;
        }

        return tokens;
    }
    highlight(p: string) {
        let data = fs.readFileSync(p, 'utf8');
        if (!this.settingsLoaded)
            throw `${tags.tag_error} Vortex settings not loaded!`;

        let commented = false
        let string = false
        let lg = ''
        for (let line of data.split('\n')) {
            if (line.length == 0) 
                continue
            let l = ''
            let tokens = this.tokenize(line);
            for (let t of tokens) {
                if (t.type == 'comment_multi_start')
                    commented = true
                else if (t.type == 'comment_multi_end')
                    commented = false

                if (!commented && (t.type == 'string_squote' || t.type == 'string_dquote' || t.type == 'string_btick'))
                    string = !string

                let g_string = string || (t.type == 'string_squote' || t.type == 'string_dquote' || t.type == 'string_btick')
                let token_comment_index = tokens.findIndex(x => x.type == 'comment_single')
                let g = t => {
                    if (commented || (t.type == 'comment_multi_start' || t.type == 'comment_multi_end') || tokens.indexOf(t) >= (token_comment_index !== -1 ? token_comment_index : Infinity)) {
                        return color.blackBright(t.value)
                    } else if (g_string) {
                        return color.green(t.value)
                    } else if (t.type.includes('mod_') || t.type.includes('type_')) {
                        return color.blueBright(t.value)
                    } else if (t.type.includes('kw_') || t.type === 'gop') {
                        return color.magentaBright(t.value)
                    } else if (t.type.includes('op_')) {
                        return color.white(t.value)
                    } else if (t.type.includes('bool_')) {
                        return color.yellow(t.value)
                    } else if (t.type == 'identifier') {
                        return color.whiteBright(t.value)
                    } else if (t.type == 'number') {
                        return color.yellow(t.value)
                    } else {
                        return color.white(t.value)
                    }
                }
                l += g(t)
            }
            lg += l + '\n'
        }
        console.log(lg)
    }
    interpret(p: string) {
        let data = fs.readFileSync(p, 'utf8');
        let commented = false
        let string = false
        let block
        let blocks = []
        let split = data.split('\n')
        let warnings = 0
        let errors = 0
        for (let line of split) {
            let linew = line
            line = line.trim()
            if (line.length == 0) 
                continue
            let tokens = this.tokenize(line);
            let start = tokens[0]
            for (let t of tokens) {
                if (t.type == 'comment_single') {
                    commented = false
                    break
                } else
                    if (t.type == 'comment_multi_start')
                        commented = true
                    else if (t.type == 'comment_multi_end') {
                        commented = false
                        continue
                    }
                if (commented)
                    continue

                if (!commented && (t.type == 'string_squote' || t.type == 'string_dquote' || t.type == 'string_btick'))
                    string = !string

                if (t.type == 'block_start') {
                    block = {
                        type: 0,
                        start: t,
                        begin: split.indexOf(linew),
                        line: tokens
                    }
                    blocks.push(block)
                }
                if (t.type == 'block_end') {
                    blocks.pop()
                    block = blocks[blocks.length - 1]
                }
                if (t.type == 'group_start') {
                    block = {
                        type: 1,
                        start: t,
                        begin: split.indexOf(linew),
                        line: tokens
                    }
                    blocks.push(block)
                }
                if (t.type == 'group_end') {
                    blocks.pop()
                    block = blocks[blocks.length - 1]
                }
                let g_string = string || (t.type == 'string_squote' || t.type == 'string_dquote' || t.type == 'string_btick')
            }
        }
        if (blocks.length > 0) {
            console.error([
                `${tags.tag_error} Vortex syntax error - Unclosed block!`, 
                `Error info:`,
                `    blockType=${blocks[blocks.length - 1].type === 0 ? '\'code block\'' : '\'grouping block\''}`,
                `    blockBegin=${blocks[blocks.length - 1].begin + 1}`
            ].join('\n'))
            return false
        }
        return [warnings, errors]
    }
    compile(data) {
        console.log('Compiler coming soon!')
        return data;
    }
}
export {
    VortexInstance
}