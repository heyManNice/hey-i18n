#!/usr/bin/env node

import Server from './http/server';
import { Command } from 'commander';
import packageJson from '../../package.json' assert { type: "json" };
import scaner from './interface/scaner';

const program = new Command();

program.name('hey-i18n-studio')
    .version(packageJson.version);


program.command('lint')
    .description('Lint localization files')
    .action(() => {
        console.log('Linting localization files...');
        const results = scaner.scanI18nStrings(['./src']);
        scaner.saveI18nStringsToCacheFile(results);
    });

program.command('gui')
    .description('Start the hey-i18n-studio GUI server')
    .option('-p, --port <number>', 'Port to run the server on', '3034')
    .option('-o, --open', 'Open the GUI in the default browser', false)
    .option('-e, --expose', 'Expose the server to the local network', false)
    .action((options) => {
        const server = new Server(options.port);
    });

program.parse(process.argv);