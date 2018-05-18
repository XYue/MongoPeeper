
function openModal(e, id) {
    var $target, isFrame;
    if (e) {
        $target = $(e.currentTarget);
        if (e.view && e.view.name && e.view.name !== topWindowName) {
            isFrame = true;
        }
    } else
        return;

    var call = '';
    if ($target) {
        if (isFrame) {
            call = e.view.name + '.';
        }
        call += 'window.';
    }

    var topbar = $target.attr('topbar');
    var options = {
        id: id,
        title: $target.attr('title'),
        onOpen: $target.attr('onOpen'),                      // div层打开后的回调函数
        onClose: $target.attr('onClose'),                          // div层关闭前回调函数
        width: $target.attr('width') || '600',
        height: $target.attr('height') || 500,
        fit: $target.attr('fit') ? true : false,         // 初始时最大化
        frame: $target.attr('frame') ? {
            src: $target.attr('frame'),
            name: id + '_modalfrm',
            loading: true
        } : false,// 使用frame加载页面作为content内容
        ajax: $target.attr('ajax') ? {
            url: $target.attr('ajax'),
            autoload: true,
            done: function (data, status, xhr, jspanel) {
                // 如果设置有toolbar则加载boolbar
                if (status == 'success' && topbar) {
                    var $bar = $(jspanel).find(topbar).hide();
                    if ($bar.length > 0) {
                        //jspanel.header
                        //    .find('.jsPanel-hdr-toolbar')
                        //    .append($bar)
                        //    .addClass('active');
                        jspanel.toolbarAdd('header', $bar.html());
                    };
                }
            },
            loading: true
        } : false,                                                                                           // 用ajax加载页面作为content内容
        content: $target.attr('contentId') ? $('#' + $target.attr('contentId')) : false                      // content属性只能在本窗口,不能在父窗口与子窗口中使用
    };
    var $body = $target.parents('body');
    if ($body.width() <= options.width) {
        options.width = $body.width();
    }
    if ($body.height() <= options.height) {
        options.height = $body.height();
    }
    _openModal(options, call);
}

function closeModal(id) {
    jsPanel.activePanels.getPanel(id).close();
}

function _openModal(opt, call) {
    call = call || '';
    var options = {
        onOpen: false,                          // div层打开后的回调函数
        onClosed: false,                        // div层关闭前回调函数
        width: 600,
        height: 500,
        fit: false,                             // 初始时最大化
        contentOverflow: 'auto',                // content中的滚动条设置
        frame: false,                           // 使用frame加载页面作为content内容
        ajax: false,                            // 用ajax加载页面作为content内容 string/object:同$.ajax({})
        content: false,                         // content属性只能在本窗口,不能在父窗口与子窗口中使用,如果以'#'开头则是id,其他则直接显示content
        headerControls: {
            smallify: 'remove'
        },
        id: 'OPENWIN'
    };
    $.extend(true, options, opt);


    if (options.frame) {
        options.contentOverflow = 'hidden';
    }
    if (options.fit) {
        options.setstatus = 'maximize';
    }

    var $content, $parent;
    if (options.content && options.content.indexOf('#') === 0) {
        var contentId = options.content;
        options.content = $(contentId).clone(true);

        // 移除原网页content的元素影响
        $parent = $(contentId).parent();
        $content = $(contentId).detach();
    }

    $.jsPanel({
        id: options.id,
        title: options.title,
        contentAjax: options.ajax,
        contentIframe: options.frame,
        content: options.content,
        headerControls: options.headerControls,
        contentOverflow: options.contentOverflow,
        headerToolbar: options.topbar,
        show: 'magictime spaceInUp jsPanelIn',
        hide: 'animated zoomOut',
        setstatus: options.setstatus,
        paneltype: 'modal',
        headerTitle: options.title,
        contentSize: { width: options.width, height: options.height },
        position: 'center',
        theme: 'bootstrap-default',
        callback: function () {
            var wnd = jsPanel.activePanels.getPanel(options.id);
            $(options.content).show();

            if (options.contentOverflow !== 'hidden') {
                setTimeout(function () {
                    wnd.content.scrollbar();
                }, 700);
            }
            if (options.onOpen) {
                if (typeof options.onOpen == 'function') {
                    options.onOpen();
                } else if (typeof options.onOpen == 'string') {
                    eval(call + options.onOpen);
                }
            }
        },
        onclosed: function () {

            // 恢复原网页content的元素
            if ($parent) {
                $parent.append(options.content.hide());
            }

            if (options.onClosed) {
                if (typeof options.onClosed == 'function') {
                    options.onClosed();
                } else if (typeof options.onClosed == 'string') {
                    eval(call + options.onClosed);
                }
            }
        }
    });
}





(function ($) {
    function getSelect(element, which) {
        var defaultTabpad = {
            _body: null,
            _head: null,
            _d: true,      // 是否是default
            _isloaded: false,
            _tabHead: null,
            _tabContent: $(element).children('div.tab-content').length === 0 ? $(document.createElement('div')).addClass('tab-content pn br-n').css('height', '100%').appendTo($(element)) : $(element).children('div.tab-content')
        };
        if (!which) {
            return defaultTabpad;
        }
        var cacheTabpan = $.data(element[0], 'tabpane_' + which);
        if (cacheTabpan) {
            return cacheTabpan;
        }

        var $tabContent = $(element);
        var $pane = $tabContent.find('div.tab-pane[name="' + which + '"]');
        if ($pane.length === 0) {
            return defaultTabpad;
        }
        return $.data(element[0], 'tabpane_' + $pane.attr('tabpane'));
    }

    var scrollBy = function (element, which, index) {
        var tabpane = getSelect(element, which);
        function mathWidth() {
            var w = 0;
            var $ul = tabpane._tabHead;
            $ul.children("li").each(function () {
                w += $(this).outerWidth(true);
            });
            return w - $ul.width() + ($ul.outerWidth() - $ul.width());
        };

        if (index < 0) {
            return;
        }
        var pos = Math.min(tabpane._head[0].offsetLeft - 21, mathWidth());
        tabpane._tabHead.animate({ scrollLeft: pos }, 400);
    }
    var loading = function (element, which) {
        var tabpane = getSelect(element, which);
        var offset = tabpane._tabContent.getOffset();
        var $loading = $(document.createElement('div')).addClass('tabpane-mask').css({
            'position': 'fixed',
            'top': offset.top,
            'left': offset.left,
            'bottom': 'auto',
            'right': 'auto',
            'height': tabpane._tabContent.height(),
            'line-height': tabpane._tabContent.height(),
            'text-align': 'center',
            'width': tabpane._tabContent.width(),
            'background': 'rgba(0, 0, 0, 0.298039)'
        }).appendTo(tabpane._body);
        tabpane._body.resize(function () {
            var offset = tabpane._tabContent.getOffset();
            $loading.css({
                'top': offset.top,
                'left': offset.left,
                'height': tabpane._tabContent.height(),
                'line-height': tabpane._tabContent.height(),
                'width': tabpane._tabContent.width()
            });
        });
        $loading.append($(document.createElement('i'))
            .css({ 'position': 'absolute', 'top': '40%', 'color': 'rgb(0, 0, 0)' })
            .addClass('fa fa-spinner fa-pulse fa-3x fa-fw'));
    }
    var unloading = function (element, which) {
        var tabpane = getSelect(element, which);
        tabpane._body.find('.tabpane-mask').remove();
    }
    var extractor = function (html) {
        var regex = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
        var eHtml = regex.exec(html);
        if (eHtml) {
            return eHtml[1];
        } else {
            return html;
        }
    }
    var loadData = function (element, which) {
        var tabpane = getSelect(element, which);
        if (tabpane._isloaded) {
            return;
        }
        if (!tabpane.options.href) {
            return;
        }

        var $tab = tabpane._body.empty();
        loading(element, which);
        if (!tabpane.options.isFrame) {
            $.ajax({
                type: tabpane.options.data ? 'POST' : 'GET',
                url: tabpane.options.href,
                data: tabpane.options.data,
                dataType: 'html',
                success: function (res) {
                    var html = extractor(res);
                    $tab.html(html);
                    tabpane.options.onLoadSuccess();
                },
                error: function (e) {
                    tabpane.options.onLoadError();
                    unloading(element, which);
                    console.error(e);
                }
            });
        } else {
            var $frame = $(document.createElement('iframe')).attr({
                id: tabpane.options.frameId,
                name: tabpane.options.frameId,
                src: tabpane.options.href,
                height: '100%',
                width: '100%',
                scrolling: 'no',
                marginheight: '0',
                marginwidth: '0',
                frameborder: '0'
            }).appendTo($tab);

            if ($frame[0].attachEvent) {
                $frame[0].attachEvent('onload', function () {
                    unloading(element, which);
                    tabpane.options.onLoadSuccess();
                });
            } else {
                $frame[0].onload = function () {
                    unloading(element, which);
                    tabpane.options.onLoadSuccess();
                }
            }
        }

        tabpane._body = $tab;
        tabpane._isloaded = true;
    }
    var selectTab = function (element, which) {
        var tabpane = getSelect(element, which);
        tabpane._tabHead.find('li').removeClass('active');
        tabpane._head.addClass('active');

        tabpane._tabContent.find('div.tab-pane').removeClass('active');
        tabpane._body.addClass('active');
    }
    var exist = function (element, which) {
        return getSelect(element, which)._tabContent.find('div.tab-pane[tabpane="' + which + '"]').length > 0;
    }
    var removeTab = function (element, which) {
        var tabpane = getSelect(element, which);
        if (tabpane._head.hasClass('active')) {
            //var index = Math.max(tabpane._head.index() - 1, 0);
            tabpane._tabHead.children().eq(0).click();
        }

        $.removeData(element[0], 'tabpane_' + tabpane.options.id);
        tabpane._body.remove();
        tabpane._head.remove();
    }
    var select = function (element, which) {
        var tabpane = getSelect(element, which);
        tabpane._head.click();
    }
    var addTabHead = function (element, which) {
        var tabpane = getSelect(element, which);
        var $li = $(document.createElement('li')).addClass(tabpane.options.hold ? 'fix' : '')
                                                .click(function () {
                                                    scrollBy(element, which);
                                                    selectTab(element, which);
                                                    tabpane.options.onSelect();
                                                    loadData(element, which);
                                                }).appendTo(tabpane._tabHead);
        var $a = $(document.createElement('a')).attr({ 'data-toggle': 'tab', href: 'javascript:void(0)' }).appendTo($li);
        if (!tabpane.options.hold) {
            $(document.createElement('span')).addClass('glyphicon glyphicon-remove fs3 nav-close')
                                            .click(function () {
                                                removeTab(element, which);
                                                tabpane.options.onClose();
                                            })
                                            .appendTo($a);
        }
        $(document.createElement('span')).addClass(tabpane.options.icon).appendTo($a);
        $(document.createElement('span')).text(' ' + tabpane.options.name).appendTo($a);

        tabpane._head = $li;
    };
    var addTabContent = function (element, which) {
        var tabpane = getSelect(element, which);
        tabpane._body = $(document.createElement('div')).addClass('tab-pane')
                                                        .attr({ 'name': tabpane.options.name, 'tabpane': tabpane.options.id })
                                                        .css({ 'height': '100%', 'width': '100%' })
                                                        .appendTo(tabpane._tabContent);

        if (!tabpane.options.loadOnSelect) {
            loadData(element, which);
        }
    }


    var openTab = function (element, which) {
        var tabpane = getSelect(element, which);
        if (tabpane.options.active) {
            selectTab(element, which);
        }
    }
    $.fn.tabpane = function (options, which, params) {
        if (which) {
            return $.fn.tabpane.methods[options](this, which, params);
        }

        options = options || {};
        var opts;
        if (!options.href || options.href === '/') {
            options.isFrame = false;
            options.href = '/home/building';
        }
        var cacheTabpane = getSelect(this, options.id);
        if (cacheTabpane._d) {
            opts = $.extend({}, $.fn.tabpane.default, options);
            cacheTabpane._tabHead = $(opts.headElementTag).children('ul.nav');
            cacheTabpane._d = false;
        } else {
            opts = $.extend({}, $.fn.tabpane.default, cacheTabpane.options, options);
        }

        $.data(this[0], 'tabpane_' + opts.id, $.extend({}, cacheTabpane, { options: opts }));
        if (!exist(this, opts.id)) {
            addTabHead(this, opts.id);
            addTabContent(this, opts.id);
        }

        return this;
    }
    $.fn.tabpane.methods = {
        tabpane: function (jq, which) {
            return getSelect(jq, which);
        },
        open: function (jq, which) {
            openTab(jq, which);
            return jq;
        },
        reload: function (jq, which) {
            return jq;
        },
        remove: function (jq, which) {
            removeTab(jq, which);
            return jq;
        },
        select: function (jq, which) {
            select(jq, which);
            return jq;
        }
    };
    $.fn.tabpane.default = {
        id: '',
        name: '',
        href: '',
        isFrame: true,
        data: {},
        active: true,
        hold: false,
        icon: 'glyphicon glyphicon-file',
        headElementTag: '',
        loadOnSelect: false,
        onLoadSuccess: function () { },
        onLoadError: function () { },
        onSelect: function () { },
        onClose: function () { }
    }
})(jQuery);

var LayoutTab = function (options) {
    var self = this;
    var tabpane;
    var $tabContent = $('#content');
    if (typeof options === 'string') {
        tabpane = $tabContent.tabpane('tabpane', options);
    } else {
        tabpane = $tabContent.tabpane($.extend({}, options, { headElementTag: '#topbar>.topbar-left' }));
        tabpane.options = options;
    }
    self.openTab = function (reload) {
        $tabContent.tabpane('open', tabpane.options.id, reload);
    }
    self.removeTab = function () {
        $tabContent.tabpane('remove', tabpane.options.id);
    }
    self.select = function () {
        $tabContent.tabpane('select', tabpane.options.id);
        $('#topbar>.topbar-left>ul .active').insertAfter('#topbar>.topbar-left>ul>li:eq(1)');
    }
}
LayoutTab.Select = function (which) {
    // which -> id or name
    new LayoutTab(which).select();
}
LayoutTab.Reload = function (which) {
    // which -> id or name
    new LayoutTab(which).openTab(true);
}
LayoutTab.Close = function (which) {
    new LayoutTab(which).removeTab();
}

function menuHint(menus, callback) {
    function getMenuLeaf(leafs, parMenu) {
        if (parMenu.isParent()) {
            for (var i = 0; i < parMenu.children().length; i++) {
                getMenuLeaf(leafs, parMenu.children()[i]);
            }
        }
        else if (parMenu.hint()) {
            leafs.push({
                id: parMenu.menuId(),
                name: parMenu.name(),
                type: parMenu.viewType(),
                url: parMenu.url(),
                tag: parMenu.tag()
            });

        }
    }

    var data = [];
    if (typeof menus === "string") {
        data.push({ tag: menus });
    } else if (menus.length > 0) {
        for (var i = 0; i < menus.length; i++) {
            getMenuLeaf(data, menus[i]);
        }
    }
    var pushdata = [];
    if (data.length > 0) {
        $.post('/home/getmenuhints', { menus: data })
            .success(function (ret) {
                if (ret && ret.result === 1) {
                    $.each(ret.object, function (i, item) {
                        if ($.inArray(item.tag, pushdata) < 0) {
                            pushdata.push(item.tag);
                            var $span = $('#sidebar_left').find('span[menuTag="' + item.tag + '"]');
                            if ($span.length > 0) {
                                var $hint = $span.next();
                                if ($hint.length > 0) {
                                    $hint.remove();
                                }
                                if (item.count > 0) {
                                    $span.after('<span class="text-danger menuhint">（<span class="menuhintcount" count="' + item.count + '">' + (item.count > 999 ? '999+' : item.count) + '</span>）</span>');
                                }
                            }
                        }
                    });
                    if (callback) {
                        callback(ret.object);
                    }


                    $('#sidebar_left ul.sidebar-menu').children().each(function () {
                        var $a = $(this).children('a');
                        if ($a.attr('isParent') === 'true') {
                            var menuhints = $(this).find('span.menuhintcount');
                            var total = 0;
                            if ($(this).find('.menuhinttotal').length > 0) {
                                $(this).find('.menuhinttotal').remove();
                            }
                            menuhints.each(function () {
                                total += Number($(this).attr('count'));
                            });

                            if (total > 0) {
                                $(this).children('a').append('<span class="text-danger menuhinttotal">（' + total + '）</span>');
                            }
                        }
                    });
                }
            }).error(function (e) {
                console.error(e);
            });
    }
}

Array.prototype.random = function () {
    var index = Math.floor((Math.random() * this.length));
    return this.splice(index, 1)[0];
}