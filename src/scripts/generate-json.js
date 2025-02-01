import 'dotenv/config'
import { exec } from 'child_process';

const url = process.env.API_URL;
const blogRoot = process.cwd().replace(/\\/g, "/");
const jsonBody = (JSON.stringify({ blogRoot })).replace(/"/g, '\\"');

const curlCommand = `curl -X POST ${url} -H "Content-Type: application/json" -d "${jsonBody}"`;

exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`ERROR: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return;
    }

    console.log('✅ Generated JSON files successfully');
    console.log(stdout);
});