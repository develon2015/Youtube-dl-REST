// library with jQuery
/** 修改文档标题 */
function title(msg) {
    if (msg == undefined) title(window.defaultTitle || '');
    $('title').text(msg);
}
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
                    '<div id="divFooter" class="flex">' + 
                        '<svg height="20" viewBox="0 0 16 16" version="1.1" width="32" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"></path></svg>' + 
                        '<a class="white" href="https://github.com/develon2015/Youtube-dl-REST">Github - develon2015/Youtube-dl-REST</a>' + Develon.getNowTime() +
                    '</div>',
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
                window.defaultTitle = fun;
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
            title();
            $(document.body)[0].removeChild($('div#notify' + id)[0])
        },

        notifyID: 1,
        notify: function (msg, callback) {
            title(msg);
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
            title(msg);
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
