字幕下载.

Subtitle Options:
--write-sub                      Write subtitle file
--write-auto-sub                 Write automatically generated subtitle file
                                 (YouTube only)
--all-subs                       Download all the available subtitles of the
                                 video--list-subs List all available subtitles for the video
--sub-format FORMAT              Subtitle format, accepts formats
                                 preference, for example: "srt" or "ass/srt/best"
--sub-lang LANGS                 Languages of the subtitles to download
                                 (optional) separated by commas, use --list-
                                 subs for available language tags

其它选项:
--embed-subs                     Embed subtitles in the video (only for mp4, webm and mkv videos)
--embed-subs                     在视频中嵌入字幕（仅适用于mp4，webm和mkv视频）
--convert-subs FORMAT            Convert the subtitles to other format (currently supported: srt|ass|vtt|lrc)
--convert-subs FORMAT            将字幕转换为其他格式（当前支持：srt | ass | vtt | lrc）

首先, 我们可以使用--list-subs参数获取并解析可用字幕列表.


1. 无任何字幕:

# youtube-dl --list-subs https://www.youtube.com/watch?v=YL0a1sc1lmE
[youtube] YL0a1sc1lmE: Downloading webpage
WARNING: video doesn't have subtitles
[youtube] YL0a1sc1lmE: Looking for automatic captions
WARNING: Couldn't find automatic captions for YL0a1sc1lmE
YL0a1sc1lmE has no automatic captions
YL0a1sc1lmE has no subtitles


2. 系统可自动生成日语字幕:
需要使用--write-auto-sub选项, 即谷歌翻译
# youtube-dl --list-subs https://www.youtube.com/watch?v=1plxH_2lZ8o
[youtube] 1plxH_2lZ8o: Downloading webpage
WARNING: video doesn't have subtitles
[youtube] 1plxH_2lZ8o: Looking for automatic captions
Available automatic captions for 1plxH_2lZ8o:
Language formats
gu       vtt, ttml, srv3, srv2, srv1
zh-Hans  vtt, ttml, srv3, srv2, srv1
zh-Hant  vtt, ttml, srv3, srv2, srv1
...
1plxH_2lZ8o has no subtitles

小文件:
https://www.youtube.com/watch?v=-E5KUTt7mGE


3. 自带某些字幕, 同时可翻译其它语言(存在一个问题, 源和目标如何选择? 很遗憾, 无法选择源):

# youtube-dl --list-subs https://www.youtube.com/watch?v=AVlaVkH9AQE
[youtube] AVlaVkH9AQE: Downloading webpage
[youtube] AVlaVkH9AQE: Looking for automatic captions
Available automatic captions for AVlaVkH9AQE:
Language formats
gu       vtt, ttml, srv3, srv2, srv1
zh-Hans  vtt, ttml, srv3, srv2, srv1
zh-Hant  vtt, ttml, srv3, srv2, srv1
...
Available subtitles for AVlaVkH9AQE:
Language formats
ja       vtt, ttml, srv3, srv2, srv1
root@ubuntu:~# youtube-dl --list-subs https://www.youtube.com/watch?v=YL0a1sc1lmE
[youtube] YL0a1sc1lmE: Downloading webpage
WARNING: video doesn't have subtitles
[youtube] YL0a1sc1lmE: Looking for automatic captions
WARNING: Couldn't find automatic captions for YL0a1sc1lmE
YL0a1sc1lmE has no automatic captions
YL0a1sc1lmE has no subtitles

小文件:
https://www.youtube.com/watch?v=uDEk5wvTbZ8
多字幕文件:
https://www.youtube.com/watch?v=MruC4eV4LGs

https://www.youtube.com/watch?v=EiKK04Ht8QI


如何单独下载某些字幕文件?

注意有--write-sub和--write-auto-sub两条通道, 不可交叉选择
但是自动翻译是万能的, 因为可以二次翻译

# youtube-dl https://www.youtube.com/watch?v=uDEk5wvTbZ8 --write-auto-sub --skip-download --sub-lang ja,en
[youtube] uDEk5wvTbZ8: Downloading webpage
[youtube] uDEk5wvTbZ8: Looking for automatic captions
[info] Writing video subtitles to: 测试YouTube字幕-uDEk5wvTbZ8.en.vtt
[info] Writing video subtitles to: 测试YouTube字幕-uDEk5wvTbZ8.ja.vtt
 */



// 嵌入视频的字幕, 在视频中嵌入字幕（仅适用于mp4，webm和mkv视频）

youtube-dl   https://www.youtube.com/watch?v=AVlaVkH9AQE --write-sub --embed-subs --convert-subs srt
[youtube] AVlaVkH9AQE: Downloading webpage
[info] Writing video subtitles to: 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.ja.vtt
WARNING: Requested formats are incompatible for merge and will be merged into mkv.
[download] Destination: 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.f137.mp4
[download] 100% of 46.93MiB in 00:00
[download] Destination: 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.f251.webm
[download] 100% of 4.49MiB in 00:00
[ffmpeg] Merging formats into "清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.mkv"
Deleting original file 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.f137.mp4 (pass -k to keep)
Deleting original file 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.f251.webm (pass -k to keep)
[ffmpeg] Converting subtitles
Deleting original file 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.ja.vtt (pass -k to keep)
[ffmpeg] Embedding subtitles in '清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.mkv'
Deleting original file 清水翔太『My Boo』のアンサーソング！！當山みれい『Dear My Boo』-AVlaVkH9AQE.ja.srt (pass -k to keep)

youtube-dl https://www.youtube.com/watch?v=uDEk5wvTbZ8 --write-auto-sub --embed-subs --covert-subs srt --sub-lang zh-Hant,en,ja

// --skip-download skip音视频文件下载


# 限制

1. 只能在Webm文件中嵌入WebVTT字幕
