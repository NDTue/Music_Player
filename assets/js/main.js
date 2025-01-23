/*
    1. Render songs
    2. Scroll top - Phóng to / thu nhỏ CD khi cuộn 
    3. Play / Pause / Seek(tua nhạc) 
    -> w3s keyword: HTML Audio/Video DOM Reference gồm các 
        - Phương thức(method): play(), pause(), load()...
        - Thuộc tính(properties): currentTime, duration, volume,...
                                'duration': thời lượng(seconds) của audio
                                'volume': giá trị từ 0 -> 1.0 tương ứng 100%
        - events: pause, play, playing, timeupdate,...
    4. CD rotate
    -> keyword: Web Animations API
        Syntax: var animation = elem.animate(transitions, options)
        - Hàm animate() trả lại một đối tượng Animation
        - Phương thức: 
            • pause() - Tạm thời đóng băng trạng thái hiện tại của animation
            • play() - Tiếp tục thực hiện animation hoặc chạy lại animation trong trường hợp animation đã hoàn thành
            • reverse() - thực hiện animation với chiều ngược lại
            • finish() - Đi đến cuối của animation (đi đến đầu trong trường hợp sử dụng reverse)
            • cancel() - Dừng animation và trở lại trạng thái đầu tiên trước khi thực hiện animation
    5. Next / Prev
    6. Random 
    7. Next / Repeat when ended 
    8. Active song - Đổi màu bài hát đang phát
    9. Scroll active song into view - cuộn đến bài đang phát 
        'scrollIntoView': thuộc tính Web API elements
    10. Play song when click 
        -> closet('.song') : duyệt qua phần tử và phần tử gốc của nó 
            cho đến khi tìm thấy nút khớp với bộ chọn CSS đã chỉ định.
        -> songNode.dataset.index : 'dataset' là thuộc tính, 
            lấy dữ liệu từ (data-*) trên phần tử HTML, ở đây là data-index(HTML Attr)
            + data-id (HTML Attr) >> dataset.id (JS)
            + data-user (HTML Attr) >> dataset.user (JS)
    11. Like song
*/
import data from '../db/songs.js';

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'Music_Player' // đặt tên trong localStorage và JSON phải có dấu '_' để ngăn cách

const progress = $('#progress')
const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const shuffleBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
// Volume
const volumeBtn = $('.btn-volume')
const volumeWrap = $('.volume-wrap')
const volumeRange = $('.volume-range')
const volumeOutput = $('.volume-output')
// Setting
const themeIcon = $('.theme-icon')
const themeText = $('.theme-text')
const themeBtn = $('.theme-btn')
const settingBtn = $('.btn-setting')
const settingList = $('.setting-list')


const app = {
    currentIndex: 0,
    isRepeat: false, // Sử dụng cho chức năng Repeat
    isPlaying: false,
    isShuffle: false, // Sử dụng cho chức năng Shuffle
    // // Lấy giá trị của item từ localStorage(nếu có), 
    // // hoặc một đối tượng rỗng {} nếu không có dữ liệu nào được lưu trữ
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    // cập nhật một giá trị cụ thể trong cấu hình và lưu trữ lại toàn bộ cấu hình này vào localStorage.
    setConfig: function(key,value){
        this.config[key] = value // cập nhật giá trị của key với giá trị value mới
        // chuyển đổi config thành JSON(stringify) vì localStorage chỉ có thể lưu trữ dữ liệu dưới dạng chuỗi (string)
        // và lưu trữ nó vào localStorage với khóa PLAYER_STORAGE_KEY
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)) 
    },
    songs: data.songs,

    // Hàm render code HTML
    render: function(){
        // render code HTML vào file HTML
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.artist}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function(){
        // Định nghĩa hàm lấy ra nhạc hiện tại
        Object.defineProperty(this, 'currentSong', { //'defineProperty' là hàm có sẵn và 3 tham số
            get: function(){ //định nghĩa setter
                return this.songs[this.currentIndex] // ~ this.songs[0]
            }
        })
    },
    
    // Hiển thị bài hát đang được chạy
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name //'currentSong': lấy từ hàm defineProperty
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

        // Lưu bài hát hiện tại vào localStorage
        this.setConfig('currentSongIndex', this.currentIndex)
        // scroll to current song
        this.scrollToActiveSong()
    },
    // Gán cấu hình từ config vào App
    // Load cấu hình đã lưu mỗi khi reload trang
    loadConfig: function(){
        this.isShuffle = this.config.isShuffle
        this.isRepeat = this.config.isRepeat
        // Hiển thị trạng thái ban đầu của 2 button Repeat và Shuffle
        shuffleBtn.classList.toggle('active', this.isShuffle)
        repeatBtn.classList.toggle('active', this.isRepeat)
        // Hiển thị bài hát đang chạy cuối cùng, thời gian cuối cùng trước khi reload trang
        this.currentIndex = this.config.currentSongIndex || 0
        progress.value = this.config.songProgressValue || 0
        audio.currentTime = this.config.songCurrentTime || 0
        // Load theme
        if (this.config.classDark) {
            themeIcon.classList.toggle('fa-sun')
            $('body').classList.toggle('dark')
            themeText.textContent = themeIcon.matches('.fa-sun') ? 'Light mode' : 'Dark mode'
        }
        // Load volume
        audio.volume = this.config.volume / 100 || 1
        volumeRange.value = this.config.volume || 100
        volumeOutput.textContent = this.config.volume || '100'
    },

    // Xử lý sự kiện (DOM Events)
    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth // Lấy width của class 'cd'

        // nhấn space để phát/dừng bài hát
        document.onkeydown = function (e) {
            e = e || window.event;
            // use e.keyCode
            if(e.code === "Space" && e.target === document.body){
                e.preventDefault()
                if (_this.isPlaying) 
                    audio.pause()
                else audio.play()
            }
        };
        
        // Click outside then close the opening box
        document.onclick = function (e) {
            if (!e.target.closest('.btn-setting')) {
                settingList.style.display = null
            }
            if (!e.target.closest('.btn-volume')) {
                volumeWrap.style.display = null
            }
            // if (!e.target.closest('.search-box')) {
            //     searchSongs.style.display = null
            //     searchInput.setAttribute('style', 'border-bottom-right-radius: null; border-bottom-left-radius: null')
            // }
        }

        // # Region Volume
        // Bật / tắt volume
        volumeBtn.onclick = function(){
            volumeWrap.style.display = !Boolean(volumeWrap.style.display) ? 'block' : null
        }
        // khi chỉnh xong âm lượng, sẽ tự động biến mất. Hàm dưới để ngăn chặn
        volumeWrap.onclick = function (e) {
            e.stopPropagation()
        }
        // Drag volume range
        volumeRange.oninput = function (e) {
            // tính % giá trị âm lượng
            audio.volume = e.target.value / 100 // thuộc tính 'volume' có giá trị từ 0 -> 1.0
            volumeOutput.textContent = e.target.value
            _this.setConfig('volume', e.target.value)
        }
        // # End Reginon Volume

        // # Region Setting
        settingBtn.onclick = function(){
            settingList.style.display = !Boolean(settingList.style.display) ? 'block' : null
        }   
        themeBtn.onclick = function (e) {
            // Chuyển mode sáng tối
            if (e.target.closest('.theme-btn')) {
                themeIcon.classList.toggle('fa-sun')
                $('body').classList.toggle('dark')
                themeText.textContent = themeIcon.classList.contains('fa-sun') ? 'Light Mode' : 'Dark Mode'
                _this.setConfig('classDark', $('body').className)
                e.stopPropagation()
            } else {
                // Mở box favorite song
                favoriteModal.style.display = 'flex'
                $('body').style.overflow = 'hidden'
                emptyList.style.display = favoriteList.childElementCount > 0 ? 'none' : null
            }
        }
        // # End Region Setting


        // Xử lý CD quay / dừng
        const cdThumbAnimation = cdThumb.animate([ // Khai báo mảng để có thể sử dụng nhiều animation
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // Xoay 1 vòng trong 10s
            iterations: Infinity, // lặp lại vô hạn
        })
        cdThumbAnimation.playbackRate = 2 // Tốc độ quay -> gán = 2 sẽ xoay nhanh gấp đôi 'duration'
        cdThumbAnimation.pause() // Dừng khi chưa bật nhạc

        // (Scroll Top) Phóng to / thu nhỏ CD khi cuộn 
        document.onscroll = function(){ // Sự kiện lăn chuột, 'document' để áp dụng cả web
            // 'window': biến thể hiện cửa sổ trình duyệt
            // 'documentElement': element của thẻ HTML
            const scrollTop = window.scrollY || document.documentElement.scrollTop // lấy chiều cao trình duyệt
            const newCdWidth = cdWidth - scrollTop //lấy độ dài đĩa CD sau khi cuộn

            // Nếu giá trị > 0 thì ..., ngược lại trả về 0px
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth // mờ dần khi cuộn
        }
        
        // Xử lý khi click Play
        playBtn.onclick = function(){
            if(_this.isPlaying) 
                audio.pause() // dừng nhạc
            else 
                audio.play() // play nhạc
        }

        // Xử lý CSS nút play khi nhạc bật - event play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimation.play() // Quay CD
        }
        // Xử lý CSS nút pause khi nhạc dừng - event pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimation.pause() // Dừng quay CD
        }
        // Xử lý tiến độ(thanh audio) bài hát thay đổi - event timeupdate
        audio.ontimeupdate = function(){
            // 'duration': thời lượng(seconds) của audio
            if(audio.duration){  // check nếu thời lượng != NaN
                // tính % thời lượng đang chạy hiện tại của bài hát
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) 
                progress.value = progressPercent // gán giá trị 
                // làm đỏ thanh audio đã chạy qua
                progress.style.backgroundImage = `linear-gradient(90deg, #ec1f55 ${progressPercent}%, transparent 0%)` 

                _this.setConfig('songCurrentTime', audio.currentTime)
                _this.setConfig('songProgressValue', progress.value)
            }
        }
        // Xử lý khi tua bài hát - event input
        progress.oninput = function(e){ // Xử lý 'progress' (thanh chạy) bài hát
            const seekTime = audio.duration / 100 * e.target.value // tính số giây khi tua
            audio.currentTime = seekTime         
        }

        // Xử lý next bài hát
        nextBtn.onclick = function(){
            if(_this.isShuffle)
                _this.shuffleSongs()
            else
                _this.nextSong()
            audio.play()
            _this.updateActiveSong()
            _this.scrollToActiveSong()
        }
        // Xử lý lùi bài hát
        prevBtn.onclick = function(){
            if(_this.isShuffle)
                _this.shuffleSongs()
            else
                _this.prevSong()
            audio.play()
            _this.updateActiveSong()
            _this.scrollToActiveSong()
        }
        // Xử lý CSS bật / tắt bài ngẫu nhiên
        shuffleBtn.onclick = function(){
            _this.isShuffle = !_this.isShuffle // gán isShuffle == true để có thể sử dụng cho next và prev
            _this.setConfig('isShuffle', _this.isShuffle)
            shuffleBtn.classList.toggle('active', _this.shuffleBtn) // tham số 2 kiểu bool, true sẽ add 'active' ngược lại
        }
        
        // Xử lý CSS lặp lại 1 bài hát
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat // gán isRepeat == true
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next / repeat khi bài hát kết thúc - event ended
        audio.onended = function(){
            if(_this.isRepeat)
                audio.play()
            else
                nextBtn.click()
        }
        // Xử lý sự kiện click vào bài hát trong playlist
        playlist.onmousedown = function(e){
            const songNode = e.target.closest('.song:not(.active)') // ko chọn class .song.active
            const songOption = e.target.closest('.option')
            
            if(songNode || songOption ){ 
                // Xử lý khi click vào song
                if(songNode){
                    _this.currentIndex = songNode.dataset.index // Lấy index từ data-index(HTML Attr)
                    _this.loadCurrentSong()
                    _this.updateActiveSong()
                    audio.play()
                }
                // Xử lý khi click vào song option
                if(songOption){

                }
            } 
        }


    },
    // Next
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) // Bật bài đầu tiên nếu chạy đến bài cuối
            this.currentIndex = 0
        this.loadCurrentSong()
    },
    // Previous    
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0) // Bật bài cuối nếu lùi từ bài đầu tiên
            this.currentIndex = this.songs.length - 1
        this.loadCurrentSong()
    },
    // Shuffle Songs
    shuffleSongs: function() {
        // Nếu chưa có danh sách các bài đã phát, khởi tạo danh sách này
        if (!this.playedSongs) {
            this.playedSongs = new Set();
        }
    
        // Nếu tất cả bài hát đã được phát, đặt lại danh sách các bài đã phát
        if (this.playedSongs.size === this.songs.length) {
            this.playedSongs.clear(); // Không dùng remove() vì remove() ko tồn tại trong Set()
        }
    
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.playedSongs.has(newIndex) || newIndex === this.currentIndex);
        
        this.currentIndex = newIndex; // Cập nhật chỉ số hiện tại
        console.log(this.currentIndex)
        this.playedSongs.add(newIndex); // Thêm bài hát vào danh sách đã phát
        this.loadCurrentSong();
    },
    // Đổi màu bài hát đang phát 
    updateActiveSong: function () {
        // Xóa class 'active' khỏi bài hát hiện tại
        const currentActive = $('.song.active'); // chọn thẻ có cả 2 class này
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        // Thêm class 'active' vào bài hát mới
        const newActive = $$('.song')[this.currentIndex];
        if (newActive) {
            newActive.classList.add('active');
        }
    },
    // Cuộn đến bài đang phát
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({ // 'scrollIntoView': thuộc tính Web API elements
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }, 0);
    },

    start: function(){
        this.loadConfig()
        this.defineProperties() // Định nghĩa các thuộc tính cho Object
        this.render() // Hiển thị playlist
        this.handleEvents() // Xử lý sự kiện (DOM Events)
        this.loadCurrentSong() // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        
        

    },
}

app.start()

