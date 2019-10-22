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
                    '<div id="divFooter"><a class="white" href="https://github.com/develon2015/Youtube-dl-REST">Designed by Develon</a><br>' + Develon.getNowTime() + "<br>" + '</div>',
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
                // If you want to see footer
                mainHeight -= $('#divFooter')[0].offsetHeight + 0 // 0 is a Correction value between divMain and divFooter(padding plus margin)
                $('#divMain').css('min-height', mainHeight + 'px')
            }

            ui.setViewport = function () {
                $(this.values.viewportHTML).appendTo(document.head)
            }

            ui.setDefaultTitle = fun => {
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

        removeNotify: id => {
            $(document.body)[0].removeChild($('div#notify' + id)[0])
        },

        notifyID: 1,
        notify: function (msg, callback) {
            var id = this.notifyID ++
            $('<div id="notify' + id + '" style="position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0, 0, 0, 0.75); z-index: 999999999;">\
                <div style="width: 270px; max-width: 90%; font-size: 16px; text-align: center; background-color: rgb(255, 255, 255); border-radius: 15px; position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);">\
                    <div style="padding: 10px 15px; border-bottom: 1px solid rgb(221, 221, 221);">\
                        <span id="notifyMsg' + id + '">' + msg + '</span>\
                    </div>\
                    <div id="notifyBtn' + id + '" style="padding: 10px 0px; color: rgb(0, 122, 255); font-weight: 600; cursor: pointer; user-select: none">\
                        <span>确定</span>\
                    </div>\
                </div>\
            </div>').appendTo(document.body)
            $('span#notifyMsg' + id).html(msg)
            $('div#notifyBtn' + id).click(fun =>{
                var exClose
                if (typeof callback === 'function') exClose = callback() // callback决定是否关闭通知框
                if (exClose == null) exClose = true // 默认可关闭
                if (exClose)
                    $(document.body)[0].removeChild($('div#notify' + id)[0])
            })
            // 失控的Enter键
            try { $(':focus')[0].blur() } catch(e) { }
            return id
        },

        notifyWait: function (msg, callback) {
            var id = this.notifyID ++
            $('<div id="notify' + id + '" style="position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0, 0, 0, 0.75); z-index: 999999999;">\
                <div style="width: 270px; max-width: 90%; font-size: 16px; text-align: center; background-color: rgb(255, 255, 255); border-radius: 15px; position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);">\
                    <div style="padding: 10px 15px; border-bottom: 1px solid rgb(221, 221, 221);">\
                        <span id="notifyMsg' + id + '">' + msg + '</span>\
                    </div>\
                    <div id="notifyBtn' + id + '" style="padding: 10px 0px; color: rgb(0, 122, 255); font-weight: 600; cursor: pointer; user-select: none">\
                        <span>取消</span>\
                    </div>\
                </div>\
            </div>').appendTo(document.body)
            $('div#notifyBtn' + id).click(fun =>{
                var exClose
                if (typeof callback === 'function') exClose = callback()
                if (exClose == null) exClose = true // 默认可关闭
                if (exClose)
                    $(document.body)[0].removeChild($('div#notify' + id)[0])
            })
            try { $(':focus')[0].blur() } catch(e) { }
            var point = "<-<--<---<----<-----";
            var nMax = point.length;
            var n = 0;
            (function progress() {
                var spanMsg = $("#notifyMsg" + id)[0]
                if (spanMsg != null) {
                    spanMsg.innerHTML = `${ msg }<br>${ point.substr(0, n) }`
                    if (n ++ >= nMax) n = 1
                    setTimeout(progress, 20)
                }
            })()
            return id
        },

        confirm: function (msg, callbackYes, callbackNo) {
            var id = this.notifyID ++
            $('<div id="notify' + id + '" style="position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0, 0, 0, 0.75); z-index: 999999999;">\
                <div style="width: 270px; max-width: 90%; font-size: 16px; text-align: center; background-color: rgb(255, 255, 255); border-radius: 15px; position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);">\
                    <div style="padding: 10px 15px; border-bottom: 1px solid rgb(221, 221, 221);">\
                        <span id="notifyMsg' + id + '">' + msg + '</span>\
                    </div>\
                    <div id="notifyBtn' + id + '" style="padding: 10px 0px; color: rgb(0, 122, 255); font-weight: 600; cursor: pointer; user-select: none">\
                        <span id="yes" style="padding-right: 40px">确定</span>\
                        <span id="no" style="padding-left: 40px">取消</span>\
                    </div>\
                </div>\
            </div>').appendTo(document.body)
            $(`div#notifyBtn${ id } span#yes`).click(fun =>{
                var exClose
                if (typeof callbackYes === 'function') exClose = callbackYes()
                if (exClose !== false) exClose = true // 默认可关闭
                if (exClose)
                    $(document.body)[0].removeChild($('div#notify' + id)[0])
            })
            $(`div#notifyBtn${ id } span#no`).click(fun =>{
                var exClose
                if (typeof callbackNo === 'function') exClose = callbackNo()
                if (exClose !== false) exClose = true // 默认可关闭
                if (exClose)
                    $(document.body)[0].removeChild($('div#notify' + id)[0])
            })
            try { $(':focus')[0].blur() } catch(e) { }
            return id
        },

    }
})()

$(fun => {
    // configure viewport
    var ui = Develon.getUI()
    ui.setDefaultTitle("Youtube在线解析") // 设置默认标题
    ui.setViewport()
    ui.createDivMain()
})

function log(msg) {
    $(fun => {
        $('#log').html($('#log')[0].innerHTML + msg + '<br>')
        console.log(msg)
    })
}