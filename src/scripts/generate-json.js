import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL;
const POSTS_DIR = path.join(process.cwd(), '.posts');

function makePostsDirectory() {
    if (!fs.existsSync(POSTS_DIR))
        fs.mkdirSync(POSTS_DIR);
}

async function fetchGeneratedFileNames() {
    const response = await fetch(`${API_URL}/api/generate-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok)
        throw new Error(`❌ Failed to generate files: ${response.statusText}`);

    return response.json();
}

async function downloadFile(fileName) {
    const fileResponse = await fetch(`${API_URL}/api/files/${fileName}`);

    if (!fileResponse.ok)
        throw new Error(`❌ Failed to download ${fileName}`);

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(path.join(POSTS_DIR, fileName), buffer);
    console.log(`✅ Downloaded: ${fileName}`);
}

async function generateJson() {
    try {
        makePostsDirectory();

        const fileNames = await fetchGeneratedFileNames();
        
        for (const name of fileNames) {
            await downloadFile(name);
        }

        console.log(`✅ All files generated and downloaded successfully`)

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

generateJson();
