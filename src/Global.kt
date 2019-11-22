import java.lang.*

import lib.log.Logger

val global = Global()
val logger = Logger("Global")

class Global(var log: Boolean = true) {
	fun log(msg: Any?, title: String = "") {
		if (log)
			logger.d(msg?.toString() ?: "[null]", title)
	}
}
