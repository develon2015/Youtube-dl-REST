package emcat

import global
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer
import org.springframework.web.servlet.config.annotation.EnableWebMvc
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer
import ctrl.DefaultController
import org.springframework.http.converter.StringHttpMessageConverter

@ComponentScan(basePackageClasses = [WebAppInitializer::class, DefaultController::class])
class WebAppInitializer : AbstractAnnotationConfigDispatcherServletInitializer() {
	override fun getRootConfigClasses() = null
	override fun getServletConfigClasses() = arrayOf(WebAppInitializer::class.java)
	override fun getServletMappings() = arrayOf("/")
	override fun getServletFilters() = arrayOf(DefaultFilter())
}

@Configuration
@EnableWebMvc
class ServletConfig : WebMvcConfigurer {
	override fun configureDefaultServletHandling(configurer: DefaultServletHandlerConfigurer) {
		global.log("Spring MVC就绪")
		configurer.enable() // MVC未映射的请求交由容器提供的默认Servlet来处理
	}

	override fun configureMessageConverters(converters: MutableList<HttpMessageConverter<*>>) {
		val jsonMC = StringHttpMessageConverter(Charsets.UTF_8)
		jsonMC.setWriteAcceptCharset(false)
		converters.add(jsonMC)
	}
}