import java.lang.*

val global = Global()

class Global(var log: Boolean = true) {
	fun log(msg: Any?, title: String = "") {
		if (log)
			System.out.println("[Log] $title -> ${ msg }")
	}
}
