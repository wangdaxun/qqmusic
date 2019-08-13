(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init:function(path){
            this.path=path;
        },
        times:[],
        lyrics:[],
        index:-1,
        loadLyric: function(callback){
            var $this=this;
            $.ajax({
                url:$this.path,
                dataType:"text",
                success:function(data){
                    $this.parseLyric(data);
                    callback();
                },
                error:function (e) {
                    console.log(e);
                }
            });
        },
        parseLyric:function(data){
            var arr = data.split("\n");
            $this.times = [];
            $this.lyrics = [];
            var timeReg = /\[(\d*:\d*.\d*)\]/;
            $this = this;
            $.each(arr ,function(index, ele){
                var lrc = ele.split("]")[1];
                if(lrc.length==1) return true;
                $this.lyrics.push(lrc);
                var res = timeReg.exec(ele);
                if(res == null) return true;
                var timeStr = res[1];
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec= parseFloat(res2[1]);
                var time = parseFloat(Number(min+sec).toFixed(2));
                $this.times.push(time);
            });
        },
        currentTime:function(currentTime){
            if(currentTime >= this.times[0]){
                this.index++;
                this.times.shift();//删除数组最前面的元素
            }
            console.log(this.times[0]);
            return this.index;
        }
    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
}(window));