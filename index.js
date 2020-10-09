const express = require('express');
const json = require('body-parser').json;
const child_process = require('child_process');
const worker_threads = require('worker_threads');
const fs = require('fs');
const getRemoteIP = require('./get-remote-ip.js');

const config = require('./config.json'); // 加载配置文件

/*======================================================================================
main 主线程
========================================================================================*/
function main() {
    let app = new express();
    app.use((req, res, next) => {
        console.log(`${getRemoteIP(req)}\t=>  ${req.url}`);
        let isBlackIP = false;
        try {
            let blackIPs = fs.readFileSync(config.blacklist).toString().split(/\s/);
            blackIPs.forEach(ip => {
                if (getRemoteIP(req) === ip) {
                    res.status(500);
                    res.send(`<div style='font-size: 33vw; text-align: center'>500</div>`);
                    console.log('黑名单IP！');
                    isBlackIP = true;
                    throw `黑名单 => ${ip}`;
                }
            });
        } catch(error) {
            //
        }
        if (!isBlackIP) next();
    });
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
        checkDisk(); // 解析视频前先检查磁盘空间

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
            checkDisk(); // 下载视频前先检查磁盘空间

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
        } // if end
        // 发送轮询结果
        res.send(queue[JSON.stringify(req.query)]);
    }); // /youtube/download end

    // API: 下载字幕
    app.use(json());
    app.post('/youtube/subtitle', (req, res) => {
        let { id, locale, ext, type } = req.body;
        // checkDisk(); // 下载字幕前先检查磁盘空间
        let thread = new worker_threads.Worker(__filename); // 启动子线程
        thread.once('message', msg => {
            // 下载字幕成功或失败
            if (msg.success) {
                console.log('字幕下载成功');
            } else {
                console.log('字幕下载失败');
            }
        });
        thread.postMessage({ op: 'subtitle', id, locale, ext, type });
    }); // /youtube/subtitle end

    app.listen(config.port, config.address, () => {
        console.log('服务已启动');
    });

    /**
     * 检测磁盘空间, 必要时清理空间并清空队列queue
     */
    function checkDisk() {
        try {
            let df = child_process.execSync(`df -h .`).toString();
            df.split('\n').forEach(it => {
                console.log({ '空间': it });
                // /dev/sda2        39G   19G   19G  51% /
                let mr = it.match(/.*\s(\d+)%/);
                if (!!mr && Number.parseInt(mr[1]) > 90) {
                    let cmd = `rm -r '${__dirname}/tmp'`;
                    console.log({ '清理空间': cmd });
                    child_process.execSync(cmd);
                    queue = [];
                }
            });
        } catch (error) {
            //
        }
    } // checkDisk()
} // main()



/*======================================================================================
Worker
========================================================================================*/
function getAudio(id, format, rate, info, size) {
    return { id, format, rate, info, size };
}

function getVideo(id, format, scale, frame, rate, info, size) {
    return { id, format, scale, frame, rate, info, size };
}

/**
 * 在以下形式的字符串中捕获字幕:
 * Language formats <= 返回0, 继续
 * gu       vtt, ttml, srv3, srv2, srv1
 * zh-Hans  vtt, ttml, srv3, srv2, srv1
 * 其它形式一律视为终结符, 返回-1, 终结
 * @param {String} line 
 */
function catchSubtitle(line) {
    if (line.match(/^Language formats.*/)) return 0;
    let mr = line.match(/^([a-z]{2}(?:-[a-zA-Z]+)?).*/);
    if (mr) return mr[1];
    return -1;
}

/**
 * 同步解析字幕
 * @param {{ op: 'parse', url: String, videoID: String }} msg 
 */
function parseSubtitle(msg) {
    let cmd = `youtube-dl --list-subs "${msg.url}"`;
    console.log(`解析字幕, 命令: ${cmd}`);
    try {
        let rs = child_process.execSync(
            `youtube-dl --list-subs ${config.cookie !== undefined ? `--cookies "${config.cookie}"` : ''} '${msg.url}' 2> /dev/null`
        ).toString()
            .split(/(\r\n|\n)/);

        /** 是否没有自动字幕 */
        let noAutoSub = true;
        let officialSub = [];

        for (let i = 0; i < rs.length; i ++ ) {
            if (rs[i].trim() === '' || rs[i].trim() === '\n') continue; // 空行直接忽略
            // console.log('=>  ', rs[i]);
            // 排除一下连自动字幕都没有的, 那一定是没有任何字幕可用
            if (rs[i].match(/.*Available automatic captions for .*?:/)) { // ?表示非贪婪, 遇到冒号即停止
                noAutoSub = false; // 排除即可, 全都是把整个字幕列表输出一遍, 这部分不需要捕获
                continue;
            }
            // 解析官方字幕
            if (rs[i].match(/.*Available subtitles for .*?:/)) {
                FOR_J: // 打标签, 因为需要从switch中断
                for (let j = i + 1; j < rs.length; j ++ ) {
                    if (rs[j].trim() === '' || rs[j].trim() === '\n') continue; // 空行直接忽略
                    sub = catchSubtitle(rs[j]);
                    switch (sub) {
                        case -1: { // 终结
                            break FOR_J;
                        }
                        case 0: { // 继续
                            continue;
                        }
                        default: { // 捕获
                            officialSub.push(sub);
                            break;
                        }
                    }
                } // for j
            } // if
        } // for i

        if (officialSub.length < 1) { // 没有官方字幕
            if (noAutoSub) { // 没有任何字幕
                console.log('没有任何字幕');
                return [];
            } else { // 没有官方字幕但是有自动生成字幕, 可以自动翻译为任何字幕
                console.log('有自动生成字幕');
                return ['auto'];
            }
        } else { // 有官方字幕, 同时可以自动翻译为任何字幕
            console.log('有官方字幕');
            console.log(JSON.stringify(officialSub, null, 0));
            return officialSub;
        }
    } catch (error) {
        console.log(error); // npm 命令无法捕获error错误流
    }
    return [];
}

/**
 * Worker线程入口
 */
function task() {
    worker_threads.parentPort.once('message', msg => {
        switch (msg.op) {
            case 'subtitle': {
                console.log(msg);
                let { id, locale, ext, type } = msg;
                // 先下载字幕
                let fullpath = `${__dirname}/tmp/${id}`; // 字幕工作路径
                let cmd_download = `youtube-dl -o '${fullpath}/%(id)s.%(ext)s' --write-sub --skip-download --write-info-json 'https://youtu.be/${id}' ${config.cookie !== undefined ? `--cookies ${config.cookie}` : ''}`;
                // 切换翻译通道
                console.log(`下载字幕, 命令: ${cmd_download}`);
                try {
                    child_process.execSync(cmd_download); // 执行下载
                    // 文件前缀
                    let before = `${fullpath}/${id}`;
                    // 字幕文件路径
                    let file = `${before}.${locale}.vtt`; // 下载的字幕一定是vtt格式
                    console.log('下载的字幕:', file);
                    let file_convert = `${before}.${locale}${ext}`; // 要转换的字幕文件
                    console.log('转换为:', file_convert);
                    let cmd_ffmpeg = `ffmpeg -i '${file}' '${file_convert}'`;
                    console.log(`转换字幕, 命令: ${cmd_ffmpeg}`);
                    // info文件路径
                    let file_info = `${before}.info.json`;
                    console.log('info文件:', file_info);
                    // JSON of info文件
                    let info = JSON.parse(fs.readFileSync(file_info).toString());
                    let title = info.title; // 视频标题
                    console.log('视频标题:', title);
                    let text = fs.readFileSync(file_convert).toString(); // 转换后字幕文件的文本内容
                    worker_threads.parentPort.postMessage({ // 下载成功
                        success: true,
                        title,
                        text,
                    });
                } catch(error) { // 下载过程出错
                    console.log(error);
                    worker_threads.parentPort.postMessage({
                        success: false,
                    });
                }
                break;
            } // case subtitle end
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
                
                let subs = parseSubtitle(msg); // 解析字幕

                worker_threads.parentPort.postMessage({
                    "success": true,
                    "result": {
                        "v": msg.videoID,
                        "best": {
                            "audio": bestAudio,
                            "video": bestVideo,
                        },
                        "available": { audios, videos, subs }
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

/*======================================================================================
index.js 兵分两路
========================================================================================*/
if (worker_threads.isMainThread)
    main();
else
    task();
/*======================================================================================*/