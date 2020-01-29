package emcat

import global
import org.apache.catalina.servlets.DefaultServlet
import java.util.HashMap
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.io.File

/**
 * 静态资源处理器
 */
class StaticServlet(val webappDir: String = "./webapps") : DefaultServlet() {
	val list = HashMap<String, Boolean>()
	val utf8 = "charset=UTF-8"
	val mime = mapOf("html" to "text/html;${ utf8 }", "htm" to "text/html;${ utf8 }", "js" to "text/javascript;${ utf8 }",
				"json" to "application/json;${ utf8 }",
				"png" to "image/png",
				"php" to "text/html;${ utf8 }",
				"css" to "text/css;${ utf8 }")

	override fun service(req: HttpServletRequest, resp: HttpServletResponse) {
		global.log("静态请求 ${ req.getMethod() } ${ req.getRequestURI() } Accept: ${ req.getHeader("Accept") }")
		val path = req.getServletPath()
		var isExists: Boolean? = list.get(path)
		if (isExists == null) {
			// 查询文件存在否
			val file = File("${ webappDir }/${ path }")
			isExists = file.exists()
			global.log("查询文件 ${ file.getAbsolutePath() } : ${ isExists }")
//			list.put(path, isExists)
		}
		if (isExists) {
			resp.setContentType(mime.get(path.substringAfterLast('.')) ?: "application/octet-stream") // 根据文件后缀名设置MIME
			return super.service(req, resp)
		}
		global.log("404 for ${ req.getServletPath() }")
//		resp.setStatus(404)
//		resp.getWriter().print("""{"error":404}""")
		resp.setStatus(404)
	}
}
