$(function () {
    //0.加载进度条插件
    $(".content_left>.content_ll").mCustomScrollbar();
    var $audio = $("audio");
    window.player = new Player($audio);
    window.s={};
    var progress;
    var voiceProgress;
    var lyric;
    //1.异步加载歌曲
    getPlayerList();
    function  getPlayerList() {
        $.ajax({
            url:"./source/musiclist.json",
            dataType:"json",
            success:function(data){
                player.musicList=data;
                var $musicList=$(".content_list ul");
                $.each(data,function (index,ele) {
                    var $item=createMusicItem(index,ele);
                    $musicList.append($item);
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error:function (e) {
                console.log(e);
            }
        });
    }
    //2.0初始化页面
    function initMusicInfo(music){
        //获取对应的元素
        var $musicImage=$(".song_info_pic img");
        var $musicName=$(".song_info_name a");
        var $musicSinger=$(".song_info_singer a");
        var $musicAblum=$(".song_info_ablum a");
        var $musicProgressName=$(".music_progress_name");
        var $musicProgressTime=$(".music_progress_time");
        var $musicMask_bg=$(".mask_bg");
        //给获取到的元素赋值
        $musicImage.attr("src",music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicProgressName.text(music.name+"/"+music.singer);
        $musicProgressTime.text("00:00/"+music.time);
        $musicMask_bg.css("background","url("+music.cover+") no-repeat 0 0");
        $musicMask_bg.css("background-size","cover");
    }
    //2.0初始化歌词
    function initMusicLyric(music){
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");
        $lyricContainer.html("");
        lyric.loadLyric(function(){
            //创建歌词列表
            $.each(lyric.lyrics,function(index, ele){
                var $item = $("<li>" + ele + "</li>");
                $lyricContainer.append($item);
            });

        });
    }
    initProgress();
    //2.0.1初始化进度条事件
    function initProgress(){
        //自己音乐下面的进度条事件，封装到一个对象里
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function(value){
            player.musicSeekTo(value);
            console.log(value);
        });
        progress.progressMove(function(value){
            player.musicSeekTo(value);
        });
        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
        voiceProgress.progressClick(function(value){
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function(value){
            player.musicVoiceSeekTo(value);
        });
    }
    //2.初始化监听事件
    initListen();
    function initListen() {
        $(".content_list").delegate(".list_music", "mouseenter", function () {
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".delete").stop().fadeIn(100);
            $(this).find(".list_time>span").stop().fadeOut(100);
        });
        $(".content_list").delegate(".list_music", "mouseleave", function () {
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".delete").stop().fadeOut(100);
            $(this).find(".list_time>span").stop().fadeIn(100);
        });
        $(".content_list").delegate(".list_check", "click", function () {
            $(this).toggleClass("list_checked");
        });
        var $musicPlay = $(".music_play");
        $(".content_list").delegate(".list_menu_play", "click", function () {
            var $item = $(this).parents(".list_music");
            console.log($item.get(0).index);
            console.log($item.get(0).music);
            $(this).toggleClass("list_menu_play2");
            $item.siblings().find(".list_menu_play").removeClass("list_menu_play2");
            if ($(this).attr("class").indexOf("list_menu_play2") != -1) {
                $musicPlay.addClass("music_play2");
                $item.find("div").css("color", "#fff");
                $item.siblings().find("div").css("color", "rgba(255,255,255,0.5)");
                $item.find(".list_number").addClass("list_number2");
                $item.siblings().find(".list_number").removeClass("list_number2");
            } else {
                $musicPlay.removeClass("music_play2");
                $item.find("div").css("color", "rgba(255,255,255,0.5)");
                $item.find(".list_number").removeClass("list_number2");
            }
            player.playMusic($item.get(0).index,$item.get(0).music);
            initMusicInfo($item.get(0).music);
            initMusicLyric($item.get(0).music);
        });
        //4.监听上一首
        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        })
        //5.监听下一首
        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        })
        //6.监听播放按钮
        $(".music_play").click(function () {
            if(player.currentIndex==-1){
                //没有播放过音乐
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            }
            else{
                //已经播放过音乐
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });
        //7.监听删除按钮的点击
        $(".content_list").delegate(".delete","click",function () {
                var $item=$(this).parents(".list_music");
                $item.remove();
                player.changeMusic($item.get(0).index);
                $(".list_music").each(function (index,ele) {
                    ele.index=index;
                    $(ele).find(".list_number").text(index+1);
                });
                if($item.get(0).index==player.currentIndex){
                    $(".music_next").trigger("click");
                }
        });
        //8.监听播放的进度
        player.musicTimeUpdate(function(currentTime,duration,timeStr){
            $(".music_progress_time").text(timeStr);
            var value=currentTime/duration * 100;
            progress.setProgress(value);
            //实现歌词同步
            var index = lyric.currentTime(currentTime);
            var $item=$(".song_lyric li").eq(index);
            $item.addClass("cur");
            $item.siblings().removeClass("cur");
            if(index<=2)    return;
            $(".song_lyric").css({
                marginTop:(-index +2) * 30
            })
        });
        //9.监听声音按钮的点击
        $(".music_voice_icon").click(function(){
           $(this).toggleClass("music_voice_icon2");
           if($(this).attr("class").indexOf("music_voice_icon2")!=-1){
               //变为没有声音
               player.musicVoiceSeekTo(0);
           }else{
               //变为有声音
           }
        });

    }
    function createMusicItem(index,ele) {
        var $item=$("<li class=\"list_music\">\n" +
            "                                <div class=\"list_check\"><span><i></i></span></div>\n" +
            "                                <div class=\"list_number\">"+parseInt(index+1)+"</div>\n" +
            "                                <div class=\"list_name\">\n" +
            "                                    "+ele.name+"" +
            "                                    <div class=\"list_menu\">\n" +
            "                                        <a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>\n" +
            "                                        <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "                                        <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "                                        <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "                                    </div>\n" +
            "                                </div>\n" +
            "                                <div class=\"list_singer\">"+ele.singer+"</div>\n" +
            "                                <div class=\"list_time\">\n" +
            "                                    <span>"+ele.time+"</span>\n" +
            "                                    <div class=\"delete\"><a href=\"javascript:;\" title=\"删除\"></a></div>\n" +
            "                                </div>\n" +
            "                            </li>");
        $item.get(0).index=index;
        $item.get(0).music=ele;
        return $item;
    }

});