package lib.config

import java.io.File

import lib.log.Logger

val log = Logger("JSON解析器")

class JsonConfig(file: File) {

	private val global = HashMap<String, String>()

	constructor(fileName: String) : this(File(fileName))

	init {
		val content: String = String(file.readBytes(), Charsets.UTF_8)
		//content = content.replace("""(\r|\n|\t)""".toRegex(), "")
		log.log(content)

		val regex = """"(.+)":\s*("(?:.+)"|(?:\d+))""".toRegex()
		val r = regex.findAll(content)
		r.forEachIndexed { _, it ->
			var (key, value) = it.destructured
			with (""""(.*)"""".toRegex().matchEntire(value)) {
				if (this != null) {
					value = groups.get(1) ?. value ?: value
				}
			}

			global.put(key, value)
		}
	}

	fun get(key: String) = global.get(key) ?: throw RuntimeException("Can't resolve key '$key'")

}
