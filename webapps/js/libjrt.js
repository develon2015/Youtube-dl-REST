// library with jQuery

// Creating a namespace for Develon
(fun => {
    Develon = window.Develon || {
        // 获取执行脚本时间, just like 2019年9月25日 19:03:37
        getNowTime: fun => {
            var options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
            }
            return Intl.DateTimeFormat("zh-CN", options).format(new Date())
        },

        // UI 工厂方法, UI 对象负责重复的页面绘制
        getUI: fun => {
            var ui = ui || {}
            ui.values = {
                viewportHTML:
                    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                mainHTML:
                    '<div id="divMain"></div>',
                footerHTML:
                    '<div id="divFooter"><a href="https://github.com/develon2015/Youtube-dl-REST">Design by Develon</a><br>' + Develon.getNowTime() + "<br>" + '</div>',
            }

            ui.createDivMain = function () {
                // first, you must to get HTML of body
                var HTMLofBody = document.body.innerHTML
                document.body.innerHTML = ''
                $(this.values.mainHTML).appendTo(document.body)
                $(HTMLofBody).appendTo($('#divMain'))
                // then, create a div element "divFooter" by jQuery selector quickly
                $(this.values.footerHTML).appendTo(document.body)
                var mainHeight = window.innerHeight
                // If you want see footer
                mainHeight -= $('#divFooter')[0].offsetHeight + 0 // 0 is height beetwen divMain and divFooter(padding plus margin)
                $('#divMain').css('min-height', mainHeight + 'px')
            }

            ui.setViewport = function () {
                $(this.values.viewportHTML).appendTo(document.head)
            }

            ui.setTitle = fun => {
                if ($('title')[0] === undefined) {
                    $('<title>' + fun + '</title>').appendTo($('head'))
                }
            }

            return ui
        },

        // 直接对象字符串 => JSON对象
        // 甚至可以实例化方法
        JSON: {
            parse: function (json) {
                try {
                    var JSONFactory = new Function('return ' + json)
                    return JSONFactory()
                } catch (error) {
                }
                return null
            },

        },

        notify: (msg, callback) =>{
            $('<div id="notify" style="position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0, 0, 0, 0.75); z-index: 999999999;">\
                <div style="width: 270px; max-width: 90%; font-size: 16px; text-align: center; background-color: rgb(255, 255, 255); border-radius: 15px; position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);">\
                    <div style="padding: 10px 15px; border-bottom: 1px solid rgb(221, 221, 221);">\
                        <span id="notifyMsg"></span>\
                    </div>\
                    <div id="notifyBtn" style="padding: 10px 0px; color: rgb(0, 122, 255); font-weight: 600; cursor: pointer; user-select: none">\
                        确定\
                    </div>\
                </div>\
            </div>').appendTo(document.body)
            $('span#notifyMsg')[0].innerText = msg
            $('div#notifyBtn').click(fun =>{
                $(document.body)[0].removeChild($('div#notify')[0])
                if (typeof callback === 'function') callback()
            })
        },

    }
})()

$(fun => {
    // configure viewport
    var ui = Develon.getUI()
    ui.setTitle("Youtube在线解析") // 设置默认标题
    ui.setViewport()
    ui.createDivMain()
})

function log(msg) {
    $(fun => {
        $('#log').html($('#log')[0].innerHTML + msg + '<br>')
        console.log(msg)
    })
}