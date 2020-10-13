# Youtube-dl-REST

通过本项目，您可以搭建一个网页，快速下载您中意的Youtube视频。
在线地址：[https://y2b.123345.xyz](https://y2b.123345.xyz)





## 安装

### 1.安装Node.js

以Ubuntu为例，使用snapd安装：
```
sudo apt install -y snapd

sudo snap install core
sudo snap install node --classic --channel=14

node -v
```

### 2.安装[youtube-dl](https://github.com/ytdl-org/youtube-dl)和[FFmpeg](https://github.com/FFmpeg/FFmpeg)

确保`youtube-dl`命令和`ffmpeg`命令可用:
```
sudo youtube-dl -U
ffmpeg -version
```

### 3.克隆本项目

克隆之后使用`npm`安装依赖模块：
```
git clone https://github.com/develon2015/Youtube-dl-REST.git
cd Youtube-dl-REST
npm install
```

### 4.启动项目

您最好在screen或tmux中运行：
```
npm start
```





## 更新记录

<details>
<summary>展开</summary>

##### 很久之前

1. 使用Kotlin实现了master分支

##### 过了一段时间

1. 使用Node.js重构

2. 自动清理空间

3. 支持视频标题作为文件名

4. 添加黑名单, 以及Cookies, 避免Youtube 429响应

##### 后来

1. 添加外挂字幕下载功能
2. 支持解析BiliBili

</details>
