import emcat.*
import global

import lib.config.JsonConfig

val config = JsonConfig("config.json")

fun main(args: Array<String>) {
	val cat = MyCat(config.get("address"), config.get("port").toInt())
	cat.spring(WebAppInitializer())
	cat.service()
}
