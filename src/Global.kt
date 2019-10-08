import java.lang.*

val global = Global()

class Global(var log: Boolean = true) {
	fun log(msg: Any?) {
		if (log)
			System.out.println("[Log] -> ${ msg }")
	}
}
