import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';

const app = express();
const port = 3000;
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/events', async (req: Request, res: Response) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    try {
        const filePath = path.join(__dirname, 'message.txt');
        const message = await fs.readFile(filePath, 'utf-8');
        const words = message.match(/\S+|\s+/g) || [];
        let index = 0;

        const intervalId = setInterval(() => {
            if (index < words.length) {
                let word = words[index];
                res.write(`data: ${word}\n\n`);
                index++;
            } else {
                clearInterval(intervalId);
                res.write('event: close\ndata: Stream ended\n\n');
                res.end();
            }
        }, 50);

        req.on('close', () => {
            clearInterval(intervalId);
        });
    } catch (error) {
        console.error('Error reading file:', error);
        res.write('event: error\ndata: Error reading file\n\n');
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});