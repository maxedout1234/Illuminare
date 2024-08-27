#!/usr/bin/env node
import { program } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { Init } from './commands/generate.mjs';

dotenv.config();

if (!process.env.GEN_KEY) {
    console.error(chalk.red('GEN_KEY environment variable is not set.'));
    process.exit(1);
}

program.version('1.0.0').description('A helpful AI tool to generate your next project.');

program.command('new').description('Create a new project').action(Init);

program.parse(process.argv);