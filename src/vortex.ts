#!/usr/bin/env node
import color from 'cli-color'
import fs from 'node:fs'
import { VortexInstance } from './classes/VortexInstance.js'
let args = process.argv.slice(2)
let vortex = new VortexInstance()
let tags = {
    tag_error: `${color.whiteBright('[')}${color.redBright('ERROR')}${color.whiteBright(']')} -`,
    tag_warning: `${color.whiteBright('[')}${color.yellowBright('WARNING')}${color.whiteBright(']')} -`,
    tag_info: `${color.whiteBright('[')}${color.cyanBright('INFO')}${color.whiteBright(']')} -`,
}

if (args.length === 0) {
    console.log([
        `Welcome to Vortex!`,
        `Usage:`,
        `    ${color.blueBright('vortex')} <command> [arguments]`,
        ` `,
        `Commands:`,
        `    ${color.greenBright('run')} [input] - Run a vortex script.`,
        `        [input] - The file to run.`
    ].join('\n'))
    process.exit(0)
}
switch (args[0]) {
    case 'run':
        if (!args[1] || args[1].trim() === '') {
            console.error(`${tags.tag_error} Please provide an input file to run.`)
            process.exit(1)
        }
        if (!fs.existsSync(args[1])) {
            console.error(`${tags.tag_error} Cannot find file \'${args[1]}\'.`)
            process.exit(1)
        }
        if (!fs.existsSync('.vortexsettings')) {
            console.log(`${tags.tag_info} Cannot find \'.vortexsettings\' file. Creating one...`)
            fs.writeFileSync('.vortexsettings', JSON.stringify({version: 1}, null, 4), 'utf-8')
        }
        vortex.loadSettings()
        let stats = vortex.interpret(args[1] ?? './input.vx')
        if (!stats) {
            console.error(`${tags.tag_error} Couldn\'t run file \'${args[1]}\'.`)
            process.exit(1)
        } else {
            console.log(`${tags.tag_info} File finished running with ${color.yellowBright(stats[0])} warnings and ${color.redBright(stats[1])} errors.`)
            process.exit(0)
        }
    default:
        console.error(`${tags.tag_error} Cannot find command \'${args[0]}\'.`)
        process.exit(1)
}