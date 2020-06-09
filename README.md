# Youtube-dl-REST

## 概要

通过本项目，您可以搭建一个网页，快速下载您中意的Youtube视频。
在线地址：[https://y2b.githmb.com](https://y2b.githmb.com/)

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


