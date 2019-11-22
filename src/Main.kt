import emcat.*

import lib.log.Logger
import lib.config.JsonConfig

val global = Logger("Global")
val config = JsonConfig("config.json")

fun main(args: Array<String>) {
	val cat = MyCat(config.get("address"), config.get("port").toInt())
	cat.spring(WebAppInitializer())
	cat.service()
}
