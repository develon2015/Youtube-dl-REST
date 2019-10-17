package ctrl

import global
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletRequest
import lib.process.Shell
import org.springframework.web.bind.annotation.PathVariable
import com.fasterxml.jackson.annotation.JsonIgnore
import org.springframework.web.bind.annotation.RequestMapping
import java.util.LinkedList

@RestController
@RequestMapping("/youtube")
class YoutubeCtrl {
	data class Error(val info: String = "Unknown error", val code: Int = 404)
	data class Audio(val id: Int = 0, val format: String = "未知音频", val rate: Int = 0, val info: String = "?", val size: Double = 0.0)
	data class Video(val id: Int = 0, val format: String = "未知视频", val scale: String = "", val frame: Int = 0, val rate: Int = 0, val info: String = "?", val size: Double = 0.0)
	
	data class DownloadRequest(val v: String = "", val format: String = "", val recode: String? = null)
	data class DownloadResult(var downloading: Boolean = true, var downloadSucceed: Boolean = false, var dest: String = "", var metadata: String = "")
	val mapDownloading = HashMap<DownloadRequest, DownloadResult>()
	
	val baseDir = "./webapps"

	// API: download?v=\w{11}&format=\d+x\d+&recode=\w+
	// 如有必要，将视频编码为另一种格式(目前支持:mp4|flv|ogg|webm|mkv|avi)
	@GetMapping("download{:$}") fun download(
		@RequestParam v: String,
		@RequestParam format: String,
		@RequestParam(required = false) recode: String?): Any {

		if (!v.matches("[\\w-]{11}".toRegex()) ) return mapOf( "error" to Error("Video ID不正确"))
		if (!format.matches("""(\d+|\d+x\d+)""".toRegex()) ) return mapOf("error" to Error("请求的音频和视频ID必须是数字, 合并格式为'视频IDx音频ID"))

		val format2 = format.replace("x", "+")
		// 过滤recode
		var recode2 = if (recode != null && recode in listOf("mp4", "flv", "webm", "mkv", "avi")) recode else null // 如果指定了 recode 参数并且有效, 否则置为null
		
		val request = DownloadRequest(v, format2, recode2)
		global.log(request)

		val shell = Shell()
		var result = mapDownloading.get(request)

		if (result == null) { // 请求未在下载队列中, 先查看是否已存在目标, 再决定是否下载
			val path = "youtube-dl/${ v }/${ format }/${ v }"
			global.log("$request 未在队列, 查看目标")
			shell.ready()
			var cmd = """cd '${ baseDir }' && \ls ${ path }.${ if (recode2 == null) "*" else recode2 }""" // 如果没有指定 recode 参数, 那么匹配任意一个格式的资源, 可能匹配到下载参数"-k"保留的单文件
			global.log(cmd)
			val dest = shell.run(cmd)
			if ("0".equals(shell.run("echo -n $? && cd ..")) ) {
				global.log("查找到文件 $dest")
				var filename = ""
				// 由于可能存在多个匹配的结果
				for (line in dest!!.split('\n')) {
					if (line.matches("""${ path }\.[\w]+""".toRegex()) )
						filename = line.trim()
				}
				result = DownloadResult(false, true, filename, "${ path }.info.json")
				mapDownloading.put(request, result)
				shell.exit()
				return mapOf("status" to result)
			}
			global.log("未找到目标, 开始下载$request")
			// 启动下载, 加入队列
			result = DownloadResult()
			mapDownloading.put(request, result)
//			cmd = """youtube-dl 'https://www.youtube.com/watch?v=${ v }' -f ${ format2 } -o '${ baseDir }/youtube-dl/${ format }/%(title)s.full.%(ext)s' ${ if (recode2 != null) "--recode $recode2" else "" } -k"""
			// 使用默认文件名是不明智的, 用视频ID作为文件名吧, 同时拉取元数据JSON
			cmd = """youtube-dl 'https://www.youtube.com/watch?v=${ v }' -f ${ format2 } -o '${ baseDir }/${ path }.%(ext)s' ${ if (recode2 != null) "--recode $recode2" else "" } -k --write-info-json"""
			global.log("$cmd", "执行下载")

			Thread{
				shell.ready()
				val r = shell.run(cmd, 120_000, 2000) // 耗时操作
				if (shell.lastCode() == 0) {
					// 下载完成
					global.log(r, "下载完成")
					// 文件下载为?
					var filename = "Unknown path"
					val regex = """.*(${ path }\.[\w]+).*""".toRegex()
					for (line in r!!.split('\n')) {
						val mr = regex.matchEntire(line)
						if (mr != null)
							filename = mr.groups.get(1)?.value ?: filename
					}
					mapDownloading.set(request, DownloadResult(false, true, "$filename", "${ path }.info.json"))
				} else {
					global.log(r, "下载失败")
					mapDownloading.set(request, DownloadResult(false, false, "下载失败"))
				}
				shell.exit()
			}.start()
		}
		
		// 轮询 result, 它由下载线程更新
		return mapOf("status" to result)
	}

	// API: info?url
	@GetMapping("info{:$}") fun info(req: HttpServletRequest): Any {
		val url = req.getQueryString()
		if (url == null || "".equals(url))
			return mapOf("error" to Error("请提供一个Youtube视频URL"))

		/**
		 合格的单个视频URL格式如下:
		 https://youtu.be/A4Q-28eyl-w
		 它是一个重定向
		 302 Found
		 https://www.youtube.com/watch?v=A4Q-28eyl-w
 		*/
		val regex = """https?://(youtu.be/|www.youtube.com/watch\?v=)([\w-]+)""".toRegex()
		global.log("$url", "url")
		val matchResult = regex.matchEntire(url)
		if (matchResult == null) return mapOf("error" to Error("请提供正确的Youtube视频URL"))
//		val (host, id) = matchResult.destructured
		val id: String = matchResult.groups.get(2)?.value ?: ""
		if (id.length.let{ it > 11 || it < 11}) return mapOf("error" to Error("该Youtube视频ID长度不等于11"))
		val finalUrl = "https://www.youtube.com/watch?v=$id"

		val shell = Shell()
		shell.ready()
		
		// 提供可用格式
		try {
			val cmd = "youtube-dl -F '$finalUrl' 2> /dev/null" // 请注意这里可能会被注入代码, 正则 [\w-]+ 加以限制
			var output = shell.run(cmd, 8000, 2000) ?: "" //throw RuntimeException("execute cmd failed")
			if (shell.run("echo -n $?").let{ it == null || !"0".equals(it) })
				output = """[youtube] sbz3fOe7rog: Downloading webpage
[youtube] sbz3fOe7rog: Downloading video info webpage
[info] Available formats for sbz3fOe7rog:
format code  extension  resolution note
249          webm       audio only tiny   59k , opus @ 50k (48000Hz), 1.50MiB
250          webm       audio only tiny   78k , opus @ 70k (48000Hz), 2.00MiB
140          m4a        audio only tiny  129k , m4a_dash container, mp4a.40.2@128k (44100Hz), 3.47MiB
251          webm       audio only tiny  150k , opus @160k (48000Hz), 3.85MiB
278          webm       256x144    144p   95k , webm container, vp9, 15fps, video only, 2.36MiB
160          mp4        256x144    144p  111k , avc1.4d400c, 15fps, video only, 2.95MiB
242          webm       426x240    240p  162k , vp9, 15fps, video only, 2.62MiB
133          mp4        426x240    240p  247k , avc1.4d4015, 15fps, video only, 6.58MiB
18           mp4        512x288    240p  355k , avc1.42001E, mp4a.40.2@ 96k (44100Hz), 9.58MiB (best)"""

			global.log("$output", "执行$cmd")
			
			val listAudio = ArrayList<Audio>()
			val listVideo = ArrayList<Video>()

			var i: Int = 1
			for (a in output.split('\n')) {
				println("${ i ++ }:\t$a")
			}

			for (a in output.split('\n')) {
				val videoRegex = """^(\d+)\s+(\w+)\s+(\d+x\d+)\s+(\d+)p\s+(\d+)k , (.*), video only, (.+)MiB$""".toRegex()
						var mr = videoRegex.matchEntire(a)
						if (mr != null){
							val (id2, format, scale, frame, rate, info, size) = mr.destructured
							val e = Video(id2.toInt(), format, scale, frame.toInt(), rate.toInt(), info, size.toDouble())
							println(e)
							listVideo.add(e)
							continue
						}

				val audioRegex = """^(\d+)\s+(\w+)\s+audio only tiny\s+(\d+)k , (.*),\s+(.+)MiB$""".toRegex()
						mr = audioRegex.matchEntire(a)
						if (mr != null) {
							val (id2, format, rate, info, size) = mr.destructured
							val e = Audio(id2.toInt(), format, rate.toInt(), info, size.toDouble())
							println(e)
							listAudio.add(e)
							continue
						}

				val videoRegex2 = """^(\d+)\s+(\w+)\s+(\d+x\d+)\s+(\d+)p\s+(\d+)k , (.*), (.+)MiB.+best.+$""".toRegex()
						mr = videoRegex2.matchEntire(a)
						if (mr != null){
							val (id2, format, scale, frame, rate, info, size) = mr.destructured
							val e = Video(id2.toInt(), format, scale, frame.toInt(), rate.toInt(), info, size.toDouble())
							global.log("best video -> $e")
							listVideo.add(e)
							continue
						}
			}
		
			return mapOf(
				"v" to id,

				"best"  to mapOf(
					"audio" to listAudio.maxBy{ it.rate },
					"video" to listVideo.maxBy{ it.rate }
				),
				
				"available" to mapOf(
					"audios" to listAudio,
					"videos" to listVideo
				)
			)
		} catch(e: Throwable) {
			e.printStackTrace()
			return mapOf("error" to Error("${ e.message }"))
		} finally { if (shell.isAlive()) shell.run("exit", 0, 0) }
	}
}