import java.lang.*

val global = Global()

class Global {
	fun log(msg: Any?) {
		System.out.println("[Log] -> ${ msg }")
	}
}
