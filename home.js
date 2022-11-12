

  
$(function() {
    $('.tooltipped').tooltip();
    // load
    $('#player').hide();
    // display lisst
    $('#active-list input').on('change',function(){
        if(this.checked) {
            $('#list-track').show(1000);
            // $('#app-cover').hide().show("slide", { direction: "top" }, 1500);
            $('#app-cover').hide(1000).attr('style','top: 25%').show(500);
        }else{
            $('#list-track').hide(1000);
            $('#app-cover').hide().show(1000).attr('style','top: 50%');
        }
    });

    const myNotification = new Notification('Podcast', {
        title: 'App ♥️ Công Minh',
        body: 'Chúc bạn nghe nhạc vui vẻ 😍',
        icon: './sound-wave.ico',
      });
    var playerTrack = $("#player-track"),
        bgArtwork = $('#bg-artwork'),
        bgArtworkUrl, albumName = $('#album-name'),
        trackName = $('#track-name'),
        albumArt = $('#album-art'),
        sArea = $('#s-area'),
        seekBar = $('#seek-bar'),
        trackTime = $('#track-time'),
        insTime = $('#ins-time'),
        sHover = $('#s-hover'),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find('i'),
        tProgress = $('#current-time'),
        tTime = $('#track-length'),
        seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0,
        buffInterval = null,
        tFlag = false,
        albums = [],
        trackNames = [],
        albumArtworks = [],
        trackUrl = [],
        playPreviousTrackButton = $('#play-previous'),
        playNextTrackButton = $('#play-next'),
        currIndex = -1;
        var count = 0;
        // get img
        // function promis() { 
        //     return $.ajax({
        //       url: 'http://127.0.0.1:3333/episodes_api',
        //       type: 'GET',
        //     });
        //   };
        //   async function getdata() {
        //     try {
        //       const data = await promis();
        //       $.each(data, (i,v)=>{
        //         $('#album-art').append('<img src="'+v.images+'"  id="_'+v.id+'">');
        //         albums.push(v.category.name);
        //         trackNames[i] = v.title;
        //         albumArtworks.push('_'+v.id);
        //         trackUrl.push(v.path_audio);
        //     });
        //     return data.length;
        //     } catch(err) {
        //       console.log(err);
        //     }
        //   }
        // getdata();
        $.ajax({
            url: 'https://podcast.congminh.name.vn/episodes_api',
            type: 'get'
        }).done((data) =>{
            //console.log(data);
            let tmp = '';
            $.each(data, (i,v)=>{
                $('#album-art').append('<img src="'+v.images+'"  id="_'+v.id+'">');
                albums.push(v.category.name);
                trackNames.push(v.title);
                albumArtworks.push('_'+v.id);
                trackUrl.push(v.path_audio);
                tmp = `
                <li class="collection-item avatar">
                    <img src="${v.images}" alt="${v.title}" class="circle" style="object-fit: cover">
                    <span class="title">${v.category.name}</span>
                    <p>${v.title}
                    </p>
                    <a href="#!" class="secondary-content select-track-audio" data-id="${i}"><i class="fas fa-play"></i></a>
                </li>
                `;
                $('#content-track').prepend(tmp);
            });
            console.log(trackNames);
            initPlayer();
            $('.progress').hide();
            $('#player').show(300);
            $('.collection-item').on('click', function(){
                new Notification($(this).children('.title').text(), {
                    title: 'App ♥️ Công Minh',
                    body: $(this).children('p').text(),
                    icon: $(this).children('img').attr('src'),
                });
                let id = $(this).children('.select-track-audio').attr('data-id');
                console.log(id);
                selectTrack(id,1);
            });
        });
        if($(this).attr('data-id') == 1){
            $('#tooltipped').attr('data-tooltip', 'Không tự động chuyển bài');
        }else{
            $('.tooltipped').attr('data-tooltip','Tự động chuyển bài');
        }
        // check
        //$('#tooltipped').on('click')
    $('.tooltipped').on('click', function(){
        if($('#togg').attr('data-id') == 1){
            $('#togg').attr('class', '');
            $('#togg').attr('data-id', '0');
            $(this).attr('data-tooltip','Không tự động chuyển bài');
        }else{
            $('#togg').attr('class', 'togg');
            $('#togg').attr('data-id', '1');
            $(this).attr('data-tooltip','Tự động chuyển bài');
        }
    });
     

    function playPause() {
        setTimeout(function() {
            if (audio.paused) {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class', 'fas fa-pause');
                audio.play();
            } else {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class', 'fas fa-play');
                audio.pause();
            }
        }, 300);
    }


    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds);

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0);

    }

    function hideHover() {
        sHover.width(0);
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0);
    }

    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!tFlag) {
            tFlag = true;
            trackTime.addClass('active');
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            tTime.text('00:00');
        else
            tTime.text(durMinutes + ':' + durSeconds);

        if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds))
            trackTime.removeClass('active');
        else
            trackTime.addClass('active');


        seekBar.width(playProgress + '%');
        $(seekBar).attr('data-id',playProgress);

        if (playProgress == 100) {
            i.attr('class', 'fa fa-play');
            seekBar.width(0);
            tProgress.text('00:00');
            albumArt.removeClass('buffering').removeClass('active');
            clearInterval(buffInterval);
            check = $('#togg').attr('data-id');
            if(check == 1){
                setTimeout(function(){
                    selectTrack(1);
                },3000);
            }
        }
    }

    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function() {
            if ((nTime == 0) || (bTime - nTime) > 1000)
                albumArt.addClass('buffering');
            else
                albumArt.removeClass('buffering');

            bTime = new Date();
            bTime = bTime.getTime();

        }, 100);
    }

    function selectTrack(flag, stopnext = null) {
        if ((flag == 0 || flag == 1) && stopnext == null){
            ++currIndex;
        }else if(stopnext == 1){
            currIndex = flag;
        }else{
            --currIndex;
        }
        if ((currIndex > -1) && (currIndex < albumArtworks.length)) {
            if (flag == 0)
                i.attr('class', 'fa fa-play');
            else {
                albumArt.removeClass('buffering');
                i.attr('class', 'fa fa-pause');
            }

            seekBar.width(0);
            trackTime.removeClass('active');
            tProgress.text('00:00');
            tTime.text('00:00');

            currAlbum = albums[currIndex];
            currTrackName = trackNames[currIndex];
            currArtwork = albumArtworks[currIndex];

            audio.src = trackUrl[currIndex];


            nTime = 0;
            bTime = new Date();
            bTime = bTime.getTime();

            if (flag != 0) {
                audio.play();
                playerTrack.addClass('active');
                albumArt.addClass('active');

                clearInterval(buffInterval);
                checkBuffering();
            }

            albumName.text(currAlbum);
            trackName.text(currTrackName);
            albumArt.find('img.active').removeClass('active');
            $('#' + currArtwork).addClass('active');

            bgArtworkUrl = $('#' + currArtwork).attr('src');

            bgArtwork.css({
                'background-image': 'url(' + bgArtworkUrl + ')'
            });
        } else if(currIndex >= albumArtworks.length){
            selectTrack(0,1);
        }else if(currIndex <= -1){
            selectTrack(albumArtworks.length -1,1);
        }else{
            if (flag == 0 || flag == 1)
                --currIndex;
            else
                ++currIndex;
        }
    }

    function initPlayer() {
        audio = new Audio();

        selectTrack(0);

        audio.loop = false;

        playPauseButton.on('click', playPause);

        sArea.mousemove(function(event) {
            showHover(event);
        });

        sArea.mouseout(hideHover);

        sArea.on('click', playFromClickedPos);

        $(audio).on('timeupdate', updateCurrTime);

        playPreviousTrackButton.on('click', function() {
            selectTrack(-1);
        });
        playNextTrackButton.on('click', function() {
            selectTrack(1);
        });
    }

    

});