document.addEventListener('DOMContentLoaded', () => {
    function getCSSVariable(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .replace(/["']/g, '') // убираем кавычки
            .trim();
    }

    const voiceClaimAudio = document.getElementById('voice-claim-audio');
    const themeSongAudio = document.getElementById('theme-song-audio');

    if (voiceClaimAudio) {
        const src = getCSSVariable('--voiceclaim');
        if (src) {
            voiceClaimAudio.querySelector('source').src = src;
            voiceClaimAudio.load();
        }
    }

    if (themeSongAudio) {
        const src = getCSSVariable('--themesong');
        if (src) {
            themeSongAudio.querySelector('source').src = src;
            themeSongAudio.load();
        }
    }

    // Add Lucide icons CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/lucide@latest';
    document.head.appendChild(link);

    // Create record elements for each audio player
    document.querySelectorAll('.custom-audio').forEach(audioContainer => {
        const record = document.createElement('div');
        record.className = 'record';
        // Using the chosen disc icon
        record.innerHTML = `
            <svg class="record-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path class="disc-line disc-line-1" d="M6 12c0-1.7.7-3.2 1.8-4.2"/>
                <circle class="disc-center" cx="12" cy="12" r="2"/>
                <path class="disc-line disc-line-2" d="M18 12c0 1.7-.7 3.2-1.8 4.2"/>
            </svg>
        `;
        audioContainer.prepend(record);
        
        // Show record with delay for smooth entrance
        setTimeout(() => record.classList.add('visible'), 100);
    });

    initializeAudioPlayers();
});

function initializeAudioPlayers() {
    document.querySelectorAll('.custom-audio').forEach(section => {
        const audio = section.querySelector('audio');
        const playBtn = section.querySelector('.play');
        const progress = section.querySelector('.progress');
        const progressContainer = section.querySelector('.progress-container');
        const currentEl = section.querySelector('.current');
        const durationEl = section.querySelector('.duration');
        const record = section.querySelector('.record');
        let isFirstPlay = true;

        playBtn.addEventListener('click', () => {
            if (audio.paused) audio.play(); else audio.pause();
        });

        let rotation = 0;
        let lastUpdate = 0;
        let animationFrame;
        
        function updateRotation(timestamp) {
            if (!lastUpdate) lastUpdate = timestamp;
            const delta = timestamp - lastUpdate;
            lastUpdate = timestamp;
            
            if (!audio.paused) {
                rotation += (delta / 1000) * 180; // 180 degrees per second
                if (rotation >= 360) rotation -= 360;
                
                const recordIcon = record.querySelector('.record-icon');
                if (recordIcon) {
                    recordIcon.style.transform = `rotate(${rotation}deg)`;
                }
            }
            
            animationFrame = requestAnimationFrame(updateRotation);
        }
        
        audio.addEventListener('play', () => {
            playBtn.textContent = '⏸';
            record.classList.add('playing');
            lastUpdate = performance.now();
            animationFrame = requestAnimationFrame(updateRotation);
            
            if (isFirstPlay) {
                isFirstPlay = false;
            }
        });
        
        audio.addEventListener('pause', () => {
            playBtn.textContent = '▶';
            record.classList.remove('playing');
            cancelAnimationFrame(animationFrame);
        });
        
        audio.addEventListener('ended', () => {
            playBtn.textContent = '▶';
            audio.currentTime = 0;
            record.classList.remove('playing');
            cancelAnimationFrame(animationFrame);
            
            // Reset rotation when audio ends
            const recordIcon = record.querySelector('.record-icon');
            if (recordIcon) {
                recordIcon.style.transform = 'rotate(0deg)';
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                progress.style.width = (audio.currentTime / audio.duration) * 100 + '%';
                currentEl.textContent = formatTime(audio.currentTime);
                durationEl.textContent = formatTime(audio.duration);
            }
        });

        progressContainer.addEventListener('click', e => {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pos * audio.duration;
        });

        function formatTime(s) {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m}:${sec < 10 ? '0' : ''}${sec}`;
        }
    });
}
