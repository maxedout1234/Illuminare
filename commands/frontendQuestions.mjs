
export async function handleFrontendQuestions() {
    whichFramework();
}

// which framework?
async function whichFramework() {
    const response = await inquirer.prompt([
        {
            type: 'list',
            name: 'response',
            message: 'Which framework do you want to use?',
            choices: ['React', 'Vue', 'Svelte', 'Angular', 'Ember', 'None']
        }
    ]);
    
    if (response.framework === 'None') {
        console.log('Ok, no framework');
        return;
    }
}