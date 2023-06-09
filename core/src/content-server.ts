import express, { Request, Response } from 'express';
import cors from 'cors';

import fs from 'fs-extra';
import path from 'path';
import HLS from 'hls-parser';
import { getLiveEvent } from './db';

const app = express();
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client.html'));
});

app.get('/init.mp4', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client.html'));
});

app.get('/ios-demo', (req: Request, res: Response) => {
    return res.status(200).sendFile(path.join(__dirname, '../public/client-ios.html'));
});

const hlsServerConfig = {
    provider: {
        exists: (req: Request, cb) => {
            const ext = req.url.split('.').pop();

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            fs.access(path.join(__dirname, `../${req.url.replace("output", "output-initial")}`), fs.constants.F_OK, function (err) {
                if (err) {
                    return cb(null, false);
                }
                cb(null, true);
            });
        },
        getManifestStream: async (req: Request, cb) => {
            //remove sync calls
            const eventId = req.url.split("/")[2];
            const event = await getLiveEvent(eventId);

            if (!event) {
                return cb(true, null);
            }

            const m3u8Data = fs.readFileSync(path.join(__dirname, `../${req.url.replace("output", "output-initial")}`));





            const playlist = HLS.parse(m3u8Data.toString());
            console.log(playlist)
            playlist.segments.forEach((segment, i) => {
                const idFromSegmentFile = segment.uri.split("-")[1]

                const scene = event.scenes.filter((dbValue) => {

                    return dbValue.id.toString() === idFromSegmentFile
                });

                const dateRange = {
                    id: `video-${scene[0].id}-${i}`,
                    classId: `video-${scene[0].id}-${i}`,
                    // this date cant be dynamic or safari will break
                    start: new Date("2023-06-26T17:36:21.000Z"),
                    duration: segment.duration,
                    endOnNext: "YES",
                    attributes: { 'X-CUSTOM-KEY': scene[0].metadata }
                }
                segment.dateRange = dateRange;

            });

            const outputPath = path.join(__dirname, `../events/${eventId}/output.m3u8`);
            try {
                fs.writeFileSync(outputPath, HLS.stringify(playlist));

            } catch (e) {
                console.log("write failed", e);
            }

            let stream;
            try {
                stream = await fs.createReadStream(outputPath);

            } catch (e) {
                console.log("read failed")
            }


            cb(null, stream);
        },
        getSegmentStream: (req: Request, cb) => {
            console.log(req.url)
            const stream = fs.createReadStream(path.join(__dirname, `../${req.url}`));
            cb(null, stream);
        }
    }
}

export { app, hlsServerConfig };
