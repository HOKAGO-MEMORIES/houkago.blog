require('dotenv').config();
const { exec } = require('child_process');

const url = `${process.env.API_BASE_URL}/generate-json`;
const blogRoot = process.cwd().replace(/\\/g, "/");
const jsonBody = `"{\\"blogRoot\\": \\"${blogRoot}\\"}"`;

const curlCommand = `curl -X POST ${url} -H "Content-Type: application/json" -d ${jsonBody}`;

exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`ERROR: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return;
    }

    console.log('Generated JSON files successfully');
    console.log(stdout);
});