# Youtube-dl-REST

通过本项目，您可以搭建一个网页，快速下载各种Youtube、Bili视频。
在线地址：[https://y2b.455556.xyz](https://y2b.455556.xyz)


## 安装

如果您使用docker，推荐使用以下命令运行本项目：

```
docker volume create vol
docker run -it -d --name youtube-dl-rest -p 80:80 -v vol:/Youtube-dl-REST imgxx/youtube-dl-rest
```

你可能需要修改 config.json 、替换自己的 cookies.txt 等文件，然后重启容器：

```
vi /var/lib/docker/volumes/vol/_data/config.json
vi /var/lib/docker/volumes/vol/_data/cookies.txt
docker restart youtube-dl-rest
```

如果您不使用docker，则按以下步骤进行安装：

### 1.安装Node.js

以Ubuntu为例，使用snapd安装：
```
sudo apt install -y snapd

sudo snap install core
sudo snap install node --classic --channel=14

node -v
```

### 2.安装[yt-dlp](https://github.com/yt-dlp/yt-dlp)和[FFmpeg](https://github.com/yt-dlp/yt-dlp)

确保`yt-dlp`命令和`ffmpeg`命令可用:
```
sudo yt-dlp -U
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

##### 接着

1. 下载引擎替换为yt-dlp
2. 支持解析BiliBili字幕和弹幕
3. 支持显示标题和封面

</details>
