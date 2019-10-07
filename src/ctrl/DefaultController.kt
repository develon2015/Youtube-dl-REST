package ctrl

import global
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import javax.servlet.http.HttpServletResponse
import org.springframework.web.bind.annotation.ResponseBody

@Controller
class DefaultController {
	init {
		global.log("默认Controller就绪")
	}

	@GetMapping("/close") fun close() = Runtime.getRuntime().exit(0)

	@GetMapping("/") fun index(response: HttpServletResponse) = "redirect: /index.html"
	
	@GetMapping("/test") @ResponseBody fun test() = "Spring"
	
}