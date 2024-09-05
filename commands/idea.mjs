import chalk from "chalk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import inquirer from "inquirer";
import ora from 'ora';
import dotenv from 'dotenv';
dotenv.config();
const runtime = process;

// Generative AI client
const genAI = new GoogleGenerativeAI(runtime.env.GEN_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const aiModelConfig = {
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        maxOutputTokens: 1024,
    }
};

export async function Init() {
    console.log(chalk.blue("Welcome to Illuminare!"));
    getProjectIdea();
}

// Project ideas, talk with AI.
async function getProjectIdea() {
    // const idea = await inquirer.prompt([
    //     {
    //         type: 'input',
    //         name: 'getProjectIdea',
    //         message: 'What is your project idea?',
    //     }
    // ]);

    const idea = await interactWithAIPrompt('What is your project idea?', 'getProjectIdea');

    // ora here to show loading
    const spinner = ora('Generating content...').start();
    const result = await model.generateContent({
        contents: [{
            parts: [{
                text: `As an expert programmer, ${idea.getProjectIdea}. 
                Focus on providing detailed technical specifications and suggestions for implementation. It should be language agnostic but easy to be understood by any developer.`
            }]
        }],
        ...aiModelConfig
    })
        .then(response => {
            spinner.succeed('Content generated successfully');
            return response;
        })
        .catch(error => {
            spinner.fail('Failed to generate content');
            if (error.response) {
                console.error(`API Error: ${error.response.status} - ${error.response.data}`);
            } else if (error.request) {
                console.error('Network Error: No response received');
            } else {
                console.error('Error:', error.message);
            }
            throw new Error('Content generation failed. Please try again later.');
        });

    const project = result.response.text();

    console.log(project);
    // ask user if they want to continue
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Does this idea look good?`,
        }
    ])
        .then(async (answers) => {
            if (answers.confirm) {
                // project is ok and Illuminare should continue to step 2,
                // step 2, ask more detailed questions
                // which tech stack?
                // which database? If needed.
                // Frontend or Backend?
                inquirer.prompt({
                    type: 'list',
                    name: 'frontOrBackend',
                    message: 'Is this a frontend or backend project?',
                    choices: ['Frontend', 'Backend']
                })
                    .then(async (answers) => {
                        spinner.succeed(`Ok a ${answers.frontOrBackend}`);
                        if (answers.frontOrBackend === 'Frontend') {
                            // Frontend continue questions.
                            // This is where Backend question is.
                        } else {
                            // Backend Questions.

                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                // if no, ask different follow up questions.
                // for example, fine tune the project.
                // shall we start from the beginning or fine tune project?
                inquirer.prompt({
                    type: 'list',
                    name: 'fineTuneProject',
                    message: 'Ok, what should we change?',
                    choices: ['Start from the beginning', 'Fine tune project idea'],
                }).then(async (answers) => {
                    if (answers.fineTuneProject === 'Start from the beginning') {
                        getProjectIdea();
                    } else {
                        fineTuneProjectPrompt(idea.getProjectIdea);
                    }
                });
            }
        }).catch(error => {
            console.log(error);
        });
}

// Fine tune the project.
async function fineTuneProjectPrompt(idea) {

    const finetune = await interactWithAIPrompt('Ok, what should we change?', 'fineTuneProject');

    const result = await model.generateContent({
        contents: [{
            parts: [{
                text: `As an expert programmer, ${idea} to the specifications in ${finetune.fineTuneProject}.
                Focus on providing detailed technical specifications and suggestions for implementation.`
            }]
        }],
        ...aiModelConfig
    })
        .then(response => {
            return response;
        })
        .catch(error => {
            throw error;
        });

    const project = result.response.text();
    console.log(project);

};



// What kind of project do you want to create? (What are you in the mood for?)
// Generate results based on user input
// is this correct?
// If yes, continue
// If no, "Ok we'll try again"
//
// Name of project
// if no name supplied, generate one.

async function interactWithAIPrompt(message = '', name = '') {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name,
            message: `${message}`,
        }
    ]);

    const formattedResponse = {};
    Object.entries(response).forEach(([key, value]) => {
        formattedResponse[key] = value;
    });
    return formattedResponse;
}