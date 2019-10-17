package ctrl

import global
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletRequest
import lib.process.Shell
import org.springframework.web.bind.annotation.PathVariable
import com.fasterxml.jackson.annotation.JsonIgnore

@RestController
class YoutubeCtrl {
	data class Error(val info: String = "Unknown error", val code: Int = 404)
	data class Audio(val id: Int = 0, val format: String = "未知音频", val rate: Int = 0, val info: String = "?", val size: Double = 0.0)
	data class Video(val id: Int = 0, val format: String = "未知视频", val scale: String = "", val frame: Int = 0, val rate: Int = 0, val info: String = "?", val size: Double = 0.0)

	@GetMapping("/youtube/{opt:.+$}") fun youtube(req: HttpServletRequest, @PathVariable opt: String): Any {
		global.log("opt -> $opt")
		if (opt !in listOf("info", "download")) throw RuntimeException("未知的操作")
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
		val id: String = matchResult.groups.get(2)?.component1() ?: ""
		if (id.length.let{ it > 11 || it < 11}) return mapOf("error" to Error("该Youtube视频ID长度不等于11"))
		val finalUrl = "https://www.youtube.com/watch?v=$id"

		val shell = Shell()
		shell.ready()
		
		// 提供可用格式
		if ("info".equals(opt)) try {
			val cmd = "youtube-dl -F '$finalUrl' 2> /dev/null" // 请注意这里可能会被注入代码, 正则 [\w-]+ 加以限制
			var output = shell.run(cmd, 8000, 2000) ?: throw RuntimeException("execute cmd failed")
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
			return "500"
		} finally { if (shell.isAlive()) shell.run("exit", 0, 0) }

		// 下载 $finalUrl
		return "下载 $finalUrl"
	}
}