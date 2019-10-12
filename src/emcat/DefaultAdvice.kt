package emcat

import global
import org.springframework.context.annotation.Configuration
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.http.HttpStatus

//@ControllerAdvice
@ResponseBody
class DefaultAdvice {
	init {
		global.log("默认 Advice 就绪")
	}

	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(Throwable::class) fun all() : String {
		global.log("发生了异常")
		return """{"error":500}"""
	}
}