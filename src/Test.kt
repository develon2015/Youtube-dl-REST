import global
import lib.process.Shell

fun main(args: Array<String>) {
	val sh = Shell()
	sh.ready()
	val r = sh.run(args[0], 5000, 1000)
	global.log("$r")
}
