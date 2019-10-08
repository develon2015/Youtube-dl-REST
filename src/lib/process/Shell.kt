package lib.process

//import global
import Global
import java.nio.charset.Charset
import java.io.InputStream

private val global = Global(log = false)

/**
 * 通过 shell 进行基本的进程间通信
 * 该 shell 必须是 sh 兼容的, 如 Android 平台下的 /system/bin/sh, Windows 平台下的 cygwin bash
 */
class Shell(val shell: String = "bash") {
	lateinit var process: Process
	var pid: Int = 0
	
	init {
//		ready()
	}

	/**
	 * 写入命令, 获取输出<br>
	 * 在此之前可以调用 this#isAlive() 测试可用性2
	 */
	fun run(cmd: String, timeout: Long = 1000, loopWaitTime: Long = 100): String? {
		var result = ""
		val startTime = System.currentTimeMillis()
		val outs = process.getOutputStream()
		val ins = process.getInputStream()
		val errs = process.getErrorStream()
		
		while (ins.available() > 0 || errs.available() > 0) {
			global.log("错误的字节 ${ ins.available() } ${ errs.available() }")
			ins.skip(ins.available().toLong())
			errs.skip(errs.available().toLong())
			Thread.sleep(1)
		}
		outs.write("${ cmd }\n".toByteArray())
		outs.flush()
		global.log("wait")
		while (ins.available() == 0 && errs.available() == 0) {
			global.log("休眠")
			Thread.sleep(20)
			if (System.currentTimeMillis() - startTime > timeout) return null // time out
		}
		global.log("OK")
		global.log("ins : ${ ins.available() } errs : ${ errs.available() }")
		while (true) {
			// read
			val output: InputStream = if (ins.available() > 0) ins else errs
			val n = output.available()
			if (n < 1) {
				global.log("管道终结 $n")
				return result
			}
			global.log("可用 $n 字节")
			val tmp = ByteArray(n)
			output.read(tmp).toString()
			result += String(tmp, Charset.forName("GBK"))
			// await
			if (System.currentTimeMillis() - startTime + loopWaitTime > timeout) return result // time out
			Thread.sleep(loopWaitTime)
		}
	}
	
	/** 启动 shell 进程 */
	fun ready() {
		process = Runtime.getRuntime().exec(shell)
		val id = run("echo -n $$", 2000, 100)
		global.log("启动 ${ shell }, PID: ${ id }")
	}
	
	/** 测试 Shell 可用性 */
	fun isAlive(): Boolean {
		return "SHELL".equals(run("echo -n 'SHELL'"))
	}
}