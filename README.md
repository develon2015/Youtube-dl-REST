依赖
---

* [youtube-dl](https://github.com/ytdl-org/youtube-dl)
* [FFmpeg](https://github.com/FFmpeg/FFmpeg)
* [SpringDependent](https://github.com/develon2015/SpringDependent)

演示
---

![](https://github.com/develon2015/Youtube-dl-REST/raw/master/image.png)

API
===

* `/youtube/parse ? { url:https?://(youtu.be/|www.youtube.com/watch\?v=)([\w-]{11}) }`

> 解析可用格式

```
/youtube/parse
{
  "error" : "请提供一个Youtube视频URL",
  "success" : false
}

/youtube/parse?incorrecrt_url
{
  "error" : "请提供正确的Youtube视频URL",
  "success" : false
}

/youtube/parse?http://youtu.be/incorrect_id
{
  "error" : "该Youtube视频ID长度不等于11",
  "success" : false
}

/youtube/parse?http://youtu.be/demoVideoID
/youtube/parse?https://www.youtube.com/watch?v=demoVideoID
{
  "success" : true,
  "reslut" : {
    "v" : "demoVideoID",
    "best" : {
      "audio" : {
        "id" : 251,
        "format" : "webm",
        "rate" : 150,
        "info" : "opus @160k (48000Hz)",
        "size" : 3.85
      },
      "video" : {
        "id" : 18,
        "format" : "mp4",
        "scale" : "512x288",
        "frame" : 240,
        "rate" : 355,
        "info" : "avc1.42001E, mp4a.40.2@ 96k (44100Hz)",
        "size" : 9.58
      }
    },
    "available" : {
      "audios" : [ {
        "id" : 249,
        "format" : "webm",
        "rate" : 59,
        "info" : "opus @ 50k (48000Hz)",
        "size" : 1.5
      }, {
        "id" : 250,
        "format" : "webm",
        "rate" : 78,
        "info" : "opus @ 70k (48000Hz)",
        "size" : 2.0
      }, {
        "id" : 140,
        "format" : "m4a",
        "rate" : 129,
        "info" : "m4a_dash container, mp4a.40.2@128k (44100Hz)",
        "size" : 3.47
      }, {
        "id" : 251,
        "format" : "webm",
        "rate" : 150,
        "info" : "opus @160k (48000Hz)",
        "size" : 3.85
      } ],
      "videos" : [ {
        "id" : 278,
        "format" : "webm",
        "scale" : "256x144",
        "frame" : 144,
        "rate" : 95,
        "info" : "webm container, vp9, 15fps",
        "size" : 2.36
      }, {
        "id" : 160,
        "format" : "mp4",
        "scale" : "256x144",
        "frame" : 144,
        "rate" : 111,
        "info" : "avc1.4d400c, 15fps",
        "size" : 2.95
      }, {
        "id" : 242,
        "format" : "webm",
        "scale" : "426x240",
        "frame" : 240,
        "rate" : 162,
        "info" : "vp9, 15fps",
        "size" : 2.62
      }, {
        "id" : 133,
        "format" : "mp4",
        "scale" : "426x240",
        "frame" : 240,
        "rate" : 247,
        "info" : "avc1.4d4015, 15fps",
        "size" : 6.58
      }, {
        "id" : 18,
        "format" : "mp4",
        "scale" : "512x288",
        "frame" : 240,
        "rate" : 355,
        "info" : "avc1.42001E, mp4a.40.2@ 96k (44100Hz)",
        "size" : 9.58
      } ]
    }
  }
}
```

<hr>

* `/youtube/download ? v={ videoID:[\w-]{11} } & format={ id:(\d+|\d+x\d+) }`
* `/youtube/download ? v={ videoID:[\w-]{11} } & format={ id:(\d+|\d+x\d+) } & recode=[ "mp4", "flv", "webm", "mkv", "avi" ]`

> 提交解析任务, 获取下载链接和元数据链接

```
/youtube/download
{
  "error" : "Qurey参数v错误: 请提供一个正确的Video ID",
  "success" : false
}

/youtube/download?v=demoVideoID
{
  "error" : "Query参数format错误: 请求的音频和视频ID必须是数字, 合并格式为'视频IDx音频ID'",
  "success" : false
}

/youtube/download?v=demoVideoID&format=18
{
  "success" : true,
  "result" : {
    "v" : "demoVideoID",
    "downloading" : true,
    "downloadSucceed" : false,
    "dest" : "正在下载中",
    "metadata" : ""
  }
}

/youtube/download?v=demoVideoID&format=18
{
  "success" : true,
  "result" : {
    "v" : "demoVideoID",
    "downloading" : false,
    "downloadSucceed" : false,
    "dest" : "下载失败",
    "metadata" : "未知的错误"
  }
}

/youtube/download?v=zhGnuWwpNxI&format=137x251
{
  "success" : true,
  "result" : {
    "v" : "zhGnuWwpNxI",
    "downloading" : false,
    "downloadSucceed" : true,
    "dest" : "youtube-dl/zhGnuWwpNxI/137x251/zhGnuWwpNxI.mkv",
    "metadata" : "youtube-dl/zhGnuWwpNxI/137x251/zhGnuWwpNxI.info.json"
  }
}
```

<hr>

