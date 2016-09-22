(function (a) {
    a.lrc = {
        handle: null,
        list: [],
        regex: /^[^\[]*((?:\s*\[\d+\:\d+(?:[\.\:]\d+)?\])+)([\s\S]*)$/,
        regex_time: /\[(\d+)\:((?:\d+)(?:[\.\:]\d+)?)\]/g,
        regex_trim: /^\s+|\s+$/,
        callback: null,
        interval: 0.3,
        format: '<li class="ui-lrc-sentence">{html}</li>',
        prefixid: "lrc",
        hoverClass: "ui-lrc-current",
        hoverTop: 55,
        duration: 0,
        __duration: -1,
        start: function (b, g) {
            if (typeof(b) != "string" || b.length < 1 || typeof(g) != "function") {
                return
            }
            this.stop();
            this.callback = g;
            var f = null, e = null, d = "";
            b = b.split("\n");
            for (var c = 0; c < b.length; c++) {
                f = b[c].replace(this.regex_trim, "");
                if (f.length < 1 || !(f = this.regex.exec(f))) {
                    continue
                }
                while (e = this.regex_time.exec(f[1])) {
                    this.list.push([parseFloat(e[1]) * 60 + parseFloat(e[2]), f[2]])
                }
                this.regex_time.lastIndex = 0
            }
            if (this.list.length > 0) {
                this.list.sort(function (i, h) {
                    return i[0] - h[0]
                });
                if (this.list[0][0] >= 0.1) {
                    this.list.unshift([this.list[0][0] - 0.1, ""])
                }
                this.list.push([this.list[this.list.length - 1][0] + 1, ""]);
                for (var c = 0; c < this.list.length; c++) {
                    d += this.format.replace(/\{html\}/gi, this.list[c][1])
                }
                a("#" + this.prefixid + "_list").html(d).animate({marginTop: 0}, 100).show();
                a("#" + this.prefixid + "_nofound").hide();
                this.handle = setInterval("$.lrc.jump($.lrc.callback());", this.interval * 1000)
            } else {
                a("#" + this.prefixid + "_list").hide();
                a("#" + this.prefixid + "_nofound").show()
            }
        },
        jump: function (e) {
            if (typeof(this.handle) != "number" || typeof(e) != "number" || !a.isArray(this.list) || this.list.length < 1) {
                return this.stop()
            }
            if (e < 0) {
                e = 0
            }
            if (this.__duration == e) {
                return
            }
            e += 0.2;
            this.__duration = e;
            e += this.interval;
            var d = 0, b = this.list.length - 1, c = b;
            pivot = Math.floor(b / 2), tmpobj = null, tmp = 0, thisobj = this;
            while (d <= pivot && pivot <= b) {
                if (this.list[pivot][0] <= e && (pivot == b || e < this.list[pivot + 1][0])) {
                    break
                } else {
                    if (this.list[pivot][0] > e) {
                        b = pivot
                    } else {
                        d = pivot
                    }
                }
                tmp = d + Math.floor((b - d) / 2);
                if (tmp == pivot) {
                    break
                }
                pivot = tmp
            }
            if (pivot == this.pivot) {
                return
            }
            this.pivot = pivot;
            tmpobj = a("#" + this.prefixid + "_list").children().removeClass(this.hoverClass).eq(pivot).addClass(thisobj.hoverClass);
            tmp = tmpobj.next().offset().top - tmpobj.parent().offset().top - this.hoverTop;
            tmp = tmp > 0 ? tmp * -1 : 0;
            this.animata(tmpobj.parent()[0]).animate({marginTop: tmp + "px"}, this.interval * 1000)
        },
        stop: function () {
            if (typeof(this.handle) == "number") {
                clearInterval(this.handle)
            }
            this.handle = this.callback = null;
            this.__duration = -1;
            this.regex_time.lastIndex = 0;
            this.list = []
        },
        animata: function (c) {
            var d = j = 0, g, e = {}, b = function (h, f, k, i) {
                return -k * (h /= i) * (h - 2) + f
            };
            e.execution = function (i, m, h) {
                var k = (new Date()).getTime(), l = h || 500, f = parseInt(c.style[i]) || 0, n = m - f;
                (function () {
                    var o = (new Date()).getTime() - k;
                    if (o > l) {
                        o = l;
                        c.style[i] = b(o, f, n, l) + "px";
                        ++d == j && g && g.apply(c);
                        return true
                    }
                    c.style[i] = b(o, f, n, l) + "px";
                    setTimeout(arguments.callee, 10)
                })()
            };
            e.animate = function (f, k, l) {
                g = l;
                for (var h in f) {
                    j++;
                    e.execution(h, parseInt(f[h]), k)
                }
            };
            return e
        }
    }
})(jQuery);
