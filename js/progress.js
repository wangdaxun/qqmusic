(function (window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    }
    Progress.prototype={
        constructor:Progress,
        init:function($progressBar, $progressLine, $progressDot){
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove:false,
        progressClick:function(callback){
            var $this=this;
            this.$progressBar.click(function(event){
                var normalLeft = $(this).offset().left;
                console.log("normalLeft:"+normalLeft);
                var eventLeft = event.pageX;
                var width=normalLeft-eventLeft;
                $this.$progressLine.css("width", eventLeft - normalLeft);
                $this.$progressDot.css("left", eventLeft - normalLeft);
                var value=  (eventLeft - normalLeft)/$(this).width();
                callback(value);
            });
        },
        progressMove:function(callback){
            var $this=this;
            var normalLeft = this.$progressBar.offset().left;
            var eventLeft;
            this.$progressBar.mousedown(function(){
                $this.isMove=true;
                $(document).mousemove(function(event){
                    eventLeft = event.pageX;
                    $this.$progressLine.css("width", eventLeft - normalLeft);
                    $this.$progressDot.css("left", eventLeft - normalLeft);
                    //下边界值判断
                    if($this.$progressLine.width()<=0) {
                        $this.$progressDot.css("left", 0);
                    }
                    //上边界值判断
                    else if($this.$progressLine.width()>=$this.$progressBar.width()){
                        $this.$progressDot.css("left", $this.$progressBar.width());
                        $this.$progressLine.css("width", $this.$progressBar.width());
                    }
                });
                $(document).mouseup(function(){
                    $this.isMove=true;
                    $(document).off("mousemove");
                    var value=  (eventLeft - normalLeft)/ $this.$progressBar.width();
                    callback(value);
                })
            });
        },
        setProgress:function(value){
            if(this.isMove) return;
            if(value<0||value>100){
                return;
            }
            this.$progressLine.css("width", value+"%");
            this.$progressDot.css("left",value+"%");
        }
    }
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
}(window));