package ctrl

import global
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletRequest

data class Error(val info: String = "Unknown error", val eno: Int = 404)

@RestController
class YoutubeCtrl {
	@GetMapping("/{regex:youtube$}") fun youtube(req: HttpServletRequest): Any {
		if (req.getQueryString() == null)
			return mapOf("error" to Error("请提供一个Youtube视频URL"))
		return "Hello, spring"
	}
}