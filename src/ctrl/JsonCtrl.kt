package ctrl

import global
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

data class User(val name: String = "测试", val id: Int = 8, val age: Int = 0)

@RestController
class JsonCtrl {
	@GetMapping("json") fun json() : User {
		val user = User()
		global.log(user)
		return user
	}
	@GetMapping("json2") fun json2() = arrayOf(User("A"), User("B"))
}
