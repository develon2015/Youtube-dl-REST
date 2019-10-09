package ctrl

import global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import javax.servlet.http.HttpServletResponse
import org.springframework.web.bind.annotation.ResponseBody
import javax.servlet.http.HttpServletRequest
import javax.xml.crypto.URIDereferencer
import java.net.URLDecoder

@Controller
class DefaultController {
	init {
		global.log("默认Controller就绪")
	}

	@GetMapping("/close") fun close() = Runtime.getRuntime().exit(0)

	@GetMapping("/") fun index(response: HttpServletResponse) = "redirect: /index.html"
	
	@GetMapping("/test") @ResponseBody fun test() = "Spring"
	
	
	/**
	 * 视图解析器对非 @ResponseBody 处理器返回的 String 对象进行解析 <br>
	 * 可以使用 redirect: 和 forward:
	 */
	@GetMapping("/view") fun view(req: HttpServletRequest) = URLDecoder.decode(req.getQueryString(), "UTF-8")
	
	@GetMapping("/err") fun err() : Nothing = throw RuntimeException("运行时异常")
}