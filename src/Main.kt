import emcat.*
import global

fun main(args: Array<String>) {
	val cat = MyCat("0.0.0.0", 80)
	cat.spring(WebAppInitializer())
	cat.service()
}
