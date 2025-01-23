/*
    1. Render songs
    2. Scroll top - Phóng to / thu nhỏ CD khi cuộn 
    3. Play / Pause / Seek(tua nhạc) 
    -> w3s keyword: HTML Audio/Video DOM Reference gồm các 
        - Phương thức(method): play(), pause(), load()...
        - Thuộc tính(properties): currentTime, duration ,...
                                'duration': thời lượng(seconds) của audio
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
    8. Active song - Đổi màu bài hát đang chạy
    9. Scroll active song into view
    10. Play song when click
    11. Like song
*/

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const audio = $('#audio')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const shuffleBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


const app = {
    isClick: false,
    isRepeat: false,
    isPlaying: false,
    isShuffle: false,
    currentIndex: 0,
    songs: [
        {
            name: 'Stay A While (w/ EJEAN)',
            artist: 'niko rain',
            path: './assets/music/Stay A While [GltJSGNbUJ8].mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2Fdf577ad177c8539e673cf363679a466d.300x300x1.png',
        },
        {
            name: 'This December (holiday version) [with Noah Floersch]',
            artist: 'Ricky Montgomery',
            path: './assets/music/Ricky Montgomery - This December (with Noah Floersch) (Official Visualizer).mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2Ff65f0a88f52e1cb3c3090bcf15126eeb.512x512x1.jpg',
        },
        {
            name: 'Beanie',
            artist: 'Chezile',
            path: './assets/music/Chezile - Beanie (Official Visualizer).mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2F98635c01146e2c911b8f4cfbd3361e1a.1000x1000x1.png',
        },
        {
            name: 'Getaway Car',
            artist: 'Taylor Swift',
            path: './assets/music/Getaway Car.mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2Fd6eba083b40fcec8b16ab1b4489fe057.1000x1000x1.png',
        },
        {
            name: 'Be Somebody',
            artist: 'Phil Good',
            path: './assets/music/Phil Good - Be Somebody.mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2Fa5f1172889a326e7e5c5e519343d5773.1000x1000x1.jpg',
        },
        {
            name: 'Island Song (Come Along with Me)',
            artist: 'Adventure Time',
            path: './assets/music/Island Song (Come Along with Me) (feat. Ashley Eriksson).mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2F3b67bcdd8c7cbaf54a9c086ad4b31444.1000x1000x1.png',
        },
        {
            name: 'Glue Song',
            artist: 'beabadoobee',
            path: './assets/music/beabadoobee - Glue Song (Lyric Video) ft. Clairo.mp3',
            image: 'https://t2.genius.com/unsafe/378x378/https%3A%2F%2Fimages.genius.com%2Fd00663b094c0e5625dcfd533af816c8a.1000x1000x1.png',
        },
    ],

    render: function(){
        const htmls = app.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}">
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
        Object.defineProperty(this, 'currentSong', {
            get: function(){ // định nghĩa getter
                return this.songs[this.currentIndex]
            }
        })
    },
    
    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth

        const cdThumbAnimation = cdThumb.animate([
            {transform: 'rotate(-360deg)'},
        ],{
            duration: 5000,
            iterations: Infinity
        })
        cdThumbAnimation.pause()

        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop //lấy độ dài đĩa CD sau khi cuộn

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        playBtn.onclick = function(){
            if(_this.isPlaying) audio.pause()
            else audio.play()
        }

        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimation.play()
        }
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimation.pause()
        }
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100 )
                progress.value = progressPercent
            }
            // console.log(progressPercent)
        }

        progress.oninput = function(e){
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        nextBtn.onclick = function(){
            if(_this.isShuffle)
                _this.shuffleSongs()
            else
                _this.nextSong()
            audio.play()
            _this.updateActiveSong()
            _this.scrollToActiveSong()
        }
        prevBtn.onclick = function(){
            if(_this.isShuffle)
                _this.shuffleSongs()
            else
                _this.prevSong()
            audio.play()
            _this.updateActiveSong()
            _this.scrollToActiveSong()
        }
        // Xử lý bật bài ngẫu nhiên - ko tắt được
        shuffleBtn.onclick = function(){
            _this.isShuffle = !_this.isShuffle
            // shuffleBtn.classList.toggle('active', _this.shuffleBtn)
            shuffleBtn.classList.add('active')
            _this.shuffleSongs()
            audio.play()
        }
        // Xử lý CSS khi lặp lại bài hát
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next / repeat khi bài hát kết thúc - event ended
        audio.onended = function(){
            if(_this.isRepeat)
                audio.play()
            else
                nextBtn.click()
        }
        

        
    },

    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length)
            this.currentIndex = 0
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1
        this.loadCurrentSong()
    },
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
        this.playedSongs.add(newIndex); // Thêm bài hát vào danh sách đã phát
        this.loadCurrentSong();
    },
    updateActiveSong: function(){
        const currentActive = $('.song.active')
        if(currentActive)
            currentActive.classList.remove('active')
        
        const newActive = $$('.song')[this.currentIndex]
            newActive.classList.add('active')
    },
    scrollToActiveSong: function(){
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
        })
    },

    start: function(){
        this.render()
        this.defineProperties()
        this.loadCurrentSong()
        this.handleEvents()
    },
}

app.start()