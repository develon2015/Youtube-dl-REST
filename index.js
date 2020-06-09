const express = require('express');
const child_process = require('child_process');
const worker_threads = require('worker_threads');
const fs = require('fs');

const config = require('./config.json');

function main() {
    let app = new express();
    app.use('/', express.static(`${__dirname}/webapps`));
    app.use('/file', (req, res, next) => {
        console.log(`下载${req.url}`);
        let info = fs.readFileSync(`${__dirname}/tmp/${req.url.replace(/\.\w+$/, '.info.json')}`).toString();
        info = JSON.parse(info);
        console.log({'标题': info.title}); // or 'fulltitle'
        let ext = req.url.match(/.*(\.\w+)$/)[1];
        res.set({'Content-Disposition': `attachment; filename="${encodeURI(info.title + ext)}"; filename*=UTF-8''${encodeURI(info.title + ext)}`});
        next();
    });
    app.use('/file', express.static(`${__dirname}/tmp`));
    app.use('/info', express.static(`${__dirname}/tmp`));

    app.get('/youtube/parse', (req, res) => {
        let url = req._parsedUrl.query;
        console.log({ op: '解析', url });

        let mr = url.match(/^https?:\/\/(?:youtu.be\/|(?:www|m).youtube.com\/watch\?v=)([\w-]{11})$/);
        if (!!!mr) {
            console.log('reject');
            res.send({
                "error": "请提供一个Youtube视频URL<br>例如：<br>https://www.youtube.com/watch?v=xxxxxxxxxxx",
                "success": false
            });
            return;
        }

        let thread = new worker_threads.Worker(__filename);
        thread.once('message', msg => {
            // console.log(JSON.stringify(msg, null, 1));
            res.send(msg);
        });
        thread.postMessage({ op: 'parse', url, videoID: mr[1] });
    });

    let queue = [];
    app.get('/youtube/download', (req, res) => {
        let { v, format, recode } = req.query;
        if (!!!v.match(/^[\w-]{11}$/))
            return res.send({ "error": "Qurey参数v错误: 请提供一个正确的Video ID", "success": false });

        if (!!!format.match(/^(\d+)(?:x(\d+))?$/))
            return res.send({ "error": "Query参数format错误: 请求的音频和视频ID必须是数字, 合并格式为'视频IDx音频ID'", "success": false });

        if (config.mode === '演示模式' && !!recode)
            return res.send({ "error": "演示模式，关闭转码功能<br>本项目已使用Node.js重写<br>请克隆本项目后自行部署", "success": false });

        if (queue[JSON.stringify(req.query)] === undefined) {
            // 检查磁盘空间
            try {
                let df = child_process.execSync(`df -h '${config.disk}'`).toString();
                df.split('\n').forEach(it => {
                    console.log({'空间': it});
                    // /dev/sda2        39G   19G   19G  51% /
                    let mr = it.match(/.*\s(\d+)%/);
                    if (!!mr && Number.parseInt(mr[1]) > 90) {
                        let cmd = `rm -r '${__dirname}/tmp'`;
                        console.log({'清理空间': cmd});
                        child_process.execSync(cmd);
                        queue = [];;
                    }
                });
            } catch(error) {
                //
            }

            queue[JSON.stringify(req.query)] = {
                "success": true,
                "result": {
                    "v": v,
                    "downloading": true,
                    "downloadSucceed": false,
                    "dest": "正在下载中",
                    "metadata": ""
                }
            };

            let thread = new worker_threads.Worker(__filename);
            thread.once('message', msg => {
                // 下载成功或失败，更新queue
                console.log('下载成功或失败，更新queue');
                console.log(JSON.stringify(msg, null, 1));
                queue[JSON.stringify(req.query)] = msg;
            });
            thread.postMessage({ op: 'download', videoID: v, format, recode });
        }

        // console.log(queue);
        res.send(queue[JSON.stringify(req.query)]);
    });

    app.listen(config.port, config.address, () => {
        console.log('服务已启动');
    });
}

function getAudio(id, format, rate, info, size) {
    return { id, format, rate, info, size };
}

function getVideo(id, format, scale, frame, rate, info, size) {
    return { id, format, scale, frame, rate, info, size };
}

function task() {
    worker_threads.parentPort.once('message', msg => {
        switch (msg.op) {
            case 'parse': {
                let audios = [], videos = [];
                let bestAudio = {}, bestVideo = {};

                let rs = [];
                try {
                    if (true)
                        rs = child_process.execSync(`youtube-dl ${config.cookie !== undefined ? `--cookies ${config.cookie}` : ''} -F '${msg.url}' 2> /dev/null`).toString().split('\n');
                    // 测试用数据
                    else
                        rs = `[youtube] sbz3fOe7rog: Downloading webpage
[youtube] sbz3fOe7rog: Downloading video info webpage
[info] Available formats for sbz3fOe7rog:
format code  extension  resolution note
249          webm       audio only tiny   59k , opus @ 50k (48000Hz), 1.50KB
251          webm       audio only tiny  150k , opus @160k (48000Hz), 3.85MiB
250          webm       audio only tiny   78k , opus @ 70k (48000Hz), 2.00MiB
140          m4a        audio only tiny  129k , m4a_dash container, mp4a.40.2@128k (44100Hz), 3.47MiB
278          webm       256x144    144p   95k , webm container, vp9, 15fps, video only, 2.36MiB
160          mp4        256x144    144p  111k , avc1.4d400c, 15fps, video only, 2.95MiB
133          mp4        426x240    240p  247k , avc1.4d4015, 15fps, video only, 6.58MiB
242          webm       426x240    240p  162k , vp9, 15fps, video only, 2.62MiB
18           mp4        512x288    240p  355k , avc1.42001E, mp4a.40.2@ 96k (44100Hz), 9.58MiB (best)`.split('\n');
                } catch(error) {
                    console.log(error.toString());
                    worker_threads.parentPort.postMessage({
                        "error": "解析失败！",
                        "success": false
                    });
                }

                rs.forEach(it => {
                    console.log(it);
                    let videoRegex = /^(\d+)\s+(\w+)\s+(\d+x\d+)\s+(\d+)p\s+(\d+)k , (.*), video only, (.+)MiB$/;
                    let mr = it.match(videoRegex);
                    if (!!mr) {
                        let video = getVideo(mr[1], mr[2], mr[3], mr[4], mr[5], mr[6], mr[7]);
                        return videos.push(video);
                    }

                    videoRegex = /^(\d+)\s+(\w+)\s+(\d+x\d+)\s+(\d+)p\s+(\d+)k , (.*), (.+)MiB.+best.+$/;
                    mr = it.match(videoRegex);
                    if (!!mr) {
                        let video = getVideo(mr[1], mr[2], mr[3], mr[4], mr[5], mr[6], mr[7]);
                        return videos.push(video);
                    }

                    videoRegex = /^(\d+)\s+(\w+)\s+(\d+x\d+)\s+(?:[^,]+)\s+(\d+)k , (.*), video.*$/;
                    mr = it.match(videoRegex);
                    if (!!mr) {
                        let video = getVideo(mr[1], mr[2], mr[3], 0, mr[4], mr[5], '未知');
                        return videos.push(video);
                    }

                    let audioRegex = /^(\d+)\s+(\w+)\s+audio only.*\s+(\d+)k , (.*),\s+(?:(.+)MiB|.+)$/;
                    mr = it.match(audioRegex);
                    if (!!mr) {
                        let audio = getAudio(mr[1], mr[2], mr[3], mr[4], mr[5] || '未知');
                        return audios.push(audio);
                    }
                });

                // sort
                audios.sort((a, b) => a.rate - b.rate);
                videos.sort((a, b) => a.rate - b.rate);
                bestAudio = audios[audios.length - 1];
                bestVideo = videos[videos.length - 1];

                worker_threads.parentPort.postMessage({
                    "success": true,
                    "result": {
                        "v": msg.videoID,
                        "best": {
                            "audio": bestAudio,
                            "video": bestVideo,
                        },
                        "available": { audios, videos }
                    }
                });

                break;
            }

            case 'download': {
                let { videoID, format, recode } = msg;
                const path = `${videoID}/${format}`;
                const fullpath = `${__dirname}/tmp/${path}`;
                let cmd = //`cd '${__dirname}' && (cd tmp > /dev/null || (mkdir tmp && cd tmp)) &&` +
                    `youtube-dl  ${config.cookie !== undefined ? `--cookies ${config.cookie}` : ''} 'https://www.youtube.com/watch?v=${videoID}' -f ${format.replace('x', '+')} ` +
                    `-o '${fullpath}/${videoID}.%(ext)s' ${recode !== undefined ? `--recode ${recode}` : ''} -k --write-info-json`;
                console.log({ cmd });
                try {
                    let dest = 'Unknown dest';
                    let ps = child_process.execSync(cmd).toString().split('\n');
                    let regex = new RegExp(`^.*${fullpath}/(${videoID}\\.[\\w]+).*$`);
                    ps.forEach(it => {
                        console.log(it);
                        let mr = it.match(regex);
                        if (!!mr) {
                            dest = mr[1];
                        }
                    });
                    worker_threads.parentPort.postMessage({
                        "success": true,
                        "result": {
                            "v": videoID,
                            "downloading": false,
                            "downloadSucceed": true,
                            "dest": `file/${path}/${dest}`,
                            "metadata": `info/${path}/${videoID}.info.json`
                        }
                    });
                } catch (error) {
                    let cause = 'Unknown cause';
                    console.log({error});
                    error.toString().split('\n').forEach(it => {
                        console.log(it);
                        let mr = it.match(/^.*(ERROR.*)$/);
                        if (!!mr) {
                            cause = mr[1];
                        }
                    });
                    worker_threads.parentPort.postMessage({
                        "success": true,
                        "result": {
                            "v": "demoVideoID",
                            "downloading": false,
                            "downloadSucceed": false,
                            "dest": "下载失败",
                            "metadata": cause
                        }
                    });
                } // end of try

                break;
            } // end of download
        } // end of switch
    });
}

if (worker_threads.isMainThread)
    main();
else
    task();
