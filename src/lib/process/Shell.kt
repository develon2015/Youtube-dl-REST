package lib.process

import java.nio.charset.Charset
import java.io.InputStream

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
	 * 在此之前可以调用 this#isAlive() 测试可用性<br>
	 * null 值代表超时
	 */
	fun run(cmd: String, timeout: Long = 1000, loopWaitTime: Long = 100): String? {
		var result = ""
		val startTime = System.currentTimeMillis()
		val outs = process.getOutputStream()
		val ins = process.getInputStream()
		val errs = process.getErrorStream()
		
		while (ins.available() > 0 || errs.available() > 0) {
			ins.available().toLong().let{ if (it > 0) ins.skip(it) }
			errs.available().toLong().let{ if (it > 0) errs.skip(it) }
			Thread.sleep(1)
			if (System.currentTimeMillis() - startTime > timeout) return null // time out
		}
		outs.write("${ cmd }\n".toByteArray())
		outs.flush()
		while (ins.available() == 0 && errs.available() == 0) {
			Thread.sleep(20)
			if (System.currentTimeMillis() - startTime > timeout) return null // time out
		}
		while (true) {
			// read
			val output: InputStream = if (ins.available() > 0) ins else errs
			val n = output.available()
			if (n < 1) {
				return result
			}
			val tmp = ByteArray(n)
			output.read(tmp).toString()
			result += String(tmp, Charset.defaultCharset())
			// await
			if (System.currentTimeMillis() - startTime + loopWaitTime > timeout) return result // time out
			Thread.sleep(loopWaitTime)
		}
	}
	
	/** 启动 shell 进程 */
	fun ready() {
		process = Runtime.getRuntime().exec(shell)
		pid = run("echo -n $$", 2000, 100).let{ if (it != null) it.toInt() else 0 }
	}
	
	/** 测试 Shell 可用性 */
	fun isAlive(): Boolean = try { "SHELL".equals(run("echo -n 'SHELL'")) } catch(e: Throwable) { false }
	
	/** 获取上一个命令退出码, 毋使惊异常(-1) */
	fun lastCode(): Int = try { run("echo -n $?", 100, 0)?.toInt() ?: -1 } catch(e: Throwable) { -1 }
	
	/** 发送 exit 指令, 毋使惊异常 */
	fun exit() {
		try { run("exit") } catch(e: Throwable) {}
	}
}