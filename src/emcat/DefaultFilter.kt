package emcat

import global
import javax.servlet.FilterChain
import javax.servlet.http.HttpFilter
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class DefaultFilter : HttpFilter() {
	init {
		global.log("默认Spring Filter就绪")
	}

	override fun doFilter(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain) {
		response.setHeader("Server", "MyCat")
		chain.doFilter(request, response)
	}
}