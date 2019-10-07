package emcat

import global
import org.apache.catalina.connector.Connector
import org.apache.catalina.startup.Tomcat
import java.io.File
import org.apache.catalina.Context
import org.apache.catalina.servlets.DefaultServlet
import org.apache.catalina.LifecycleListener
import org.apache.catalina.LifecycleEvent
import org.apache.catalina.LifecycleState
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket

class MyCat(val host: String = "0.0.0.0", val port: Int = 80,
			val baseDir: String = "."){
	val cat = Tomcat()
	val connector =  Connector()
	val ctx: Context
	
	init {
		val dir = File(baseDir)
		if (!dir.exists()) dir.mkdirs()
		if (!dir.isDirectory()) throw RuntimeException("${ dir.getAbsolutePath() } 不是目录")
		cat.setBaseDir(dir.getAbsolutePath())
		
		val root = "." // webapps 上下文目录名, 设置为"."可以节省一个目录
		val webappDir = File("${ baseDir }${ File.separatorChar }webapps${ File.separatorChar }/${ root }")
		if (!webappDir.exists()) webappDir.mkdirs()
		if (!webappDir.isDirectory()) throw RuntimeException("${ webappDir.getAbsolutePath() } 不是目录")
		ctx = cat.addContext("", root) // 设置上下文
		
		connector.setProperty("address", host)
		connector.setPort(port)

		global.log("初始化嵌入式Tomcat, 监听于 ${ host }:${ port }, 工作目录 ${ dir.getAbsolutePath() }, 主webapp上下文 ${ root }")
		
		Tomcat.addServlet(ctx, "default", StaticServlet(webappDir.getAbsolutePath()))
//		ctx.addServletMappingDecoded("/", "default", true)
	}
	
	/** 开始监听服务, 在此之前通过 cat 和 connector 等字段注入action */
	fun service() {
		close()
		Thread.sleep(100)
		cat.setConnector(connector)
		cat.start()
		cat.getServer().await()
	}
	
	/** 注入spring框架 */
	fun spring(webAppInitializer: AbstractAnnotationConfigDispatcherServletInitializer) {
		ctx.addLifecycleListener(object : LifecycleListener {
			override fun lifecycleEvent(event: LifecycleEvent) {
				if (event.getLifecycle().getState() == LifecycleState.STARTING_PREP) {
					global.log("注入spring框架")
					try {
						webAppInitializer.onStartup(ctx.getServletContext())
					} catch(e: Throwable) {
						global.log("注入失败: ${ e::class.java.getName() } -> ${ e.message }")
					}
					global.log("注入spring框架成功")
					ctx.removeLifecycleListener(this)
				}
			}
		})
	}
	
	/** 解决端口占用 */
	fun close() {
		val socket = Socket()
		val sd = InetSocketAddress(InetAddress.getByName("127.0.0.1"), 80)
		try {
			socket.connect(sd, 200)
			if (socket.isConnected()) {
				global.log("端口被占用, 发送 /colse GET请求")
				socket.getOutputStream().write("GET /close HTTP/1.1\nHost: l\n\n".toByteArray())
			}
		} catch(e: Throwable) {}
		try { socket.close() } catch(e: Throwable) {}
	}
}
