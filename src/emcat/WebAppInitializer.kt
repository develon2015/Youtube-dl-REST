package emcat

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer
import org.springframework.context.annotation.*

@ComponentScan(basePackageClasses = [WebAppInitializer::class])
class WebAppInitializer : AbstractAnnotationConfigDispatcherServletInitializer() {
	override fun getRootConfigClasses() = null
	override fun getServletConfigClasses() = arrayOf(WebAppInitializer::class.java)
	override fun getServletMappings() = arrayOf("/")
}

