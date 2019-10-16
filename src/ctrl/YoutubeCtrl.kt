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
	data class MediaList(@field:JsonIgnore val type: String = "未知媒体类型", val id: Int = 0)

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
		val regex = """https?://(youtu.be/|www.youtube.com/watch?v=)(\w+)""".toRegex()
		val matchResult = regex.matchEntire(url)
		if (matchResult == null) return mapOf("error" to Error("请提供正确的Youtube视频URL"))
//		val (host, id) = matchResult.destructured
		val id = matchResult.groups.get(2)?.component1()
		val finalUrl = "https://www.youtube.com/watch?v=$id"

		val shell = Shell()
		shell.ready()
		
		// 提供可用格式
		try {
			if ("info".equals(opt)) {
				val cmd = "youtube-dl -F '$finalUrl'" // 请注意这里可能会被注入代码
				val output = shell.run(cmd, 8000, 200)
				global.log("$output", "执行$cmd")
//				output.split
				return mapOf(
					"best"  to mapOf(
						"audio" to MediaList("Audio"),
						"video" to MediaList("Video")
					),
					
					"available" to mapOf(
						"audios" to listOf(MediaList("Audio")),
						"videos" to listOf(MediaList("Video"))
					)
				)
			}
		} catch(e: Throwable) {
			global.log(e.getStackTrace())
		} finally { if (shell.isAlive()) shell.run("exit", 0, 0) }

		// 下载 $finalUrl
		return "下载 $finalUrl"
	}
}