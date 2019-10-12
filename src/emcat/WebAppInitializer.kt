package emcat

import ctrl.DefaultController
import global
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.converter.StringHttpMessageConverter
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer
import org.springframework.web.servlet.config.annotation.EnableWebMvc
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer
import org.springframework.http.MediaType
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter

@ComponentScan(basePackageClasses = [WebAppInitializer::class, DefaultController::class])
class WebAppInitializer : AbstractAnnotationConfigDispatcherServletInitializer() {
	override fun getRootConfigClasses() = null
	override fun getServletConfigClasses() = arrayOf(WebAppInitializer::class.java)
	override fun getServletMappings() = arrayOf("/")
	override fun getServletFilters() = arrayOf(DefaultFilter())
}

@Configuration
@EnableWebMvc
open class ServletConfig : WebMvcConfigurer {
	override fun configureContentNegotiation(configurer: ContentNegotiationConfigurer) {
		configurer.defaultContentType(MediaType.APPLICATION_JSON_UTF8)
	}

	override fun configureDefaultServletHandling(configurer: DefaultServletHandlerConfigurer) {
		global.log("Spring MVC就绪")
		configurer.enable() // MVC未映射的请求交由容器提供的默认Servlet来处理
	}

	override fun configureMessageConverters(converters: MutableList<HttpMessageConverter<*>>) {
		val stringmc = StringHttpMessageConverter(Charsets.UTF_8)
		stringmc.setWriteAcceptCharset(false)
		converters.add(stringmc)
		
		val jsonmc = MappingJackson2HttpMessageConverter()
		converters.add(jsonmc)
		global.log("消息转换器就绪")
	}
}