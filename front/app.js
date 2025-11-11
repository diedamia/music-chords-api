// Загрузить все песни при загрузке страницы
document.addEventListener('DOMContentLoaded', loadAllSongs);

// Обработчик формы добавления песни
document.getElementById('addSongForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const songData = {
        title: document.getElementById('title').value,
        artist: document.getElementById('artist').value,
        lyrics: document.getElementById('lyrics').value,
        chords: document.getElementById('chords').value,
        difficulty: document.getElementById('difficulty').value
    };

    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(songData)
        });

        if (response.ok) {
            alert('Песня добавлена!');
            this.reset();
            loadAllSongs();
        } else {
            alert('Ошибка при добавлении песни');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при добавлении песни');
    }
});

// Загрузить все песни
async function loadAllSongs() {
    try {
        const response = await fetch('/api/songs');
        const songs = await response.json();
        displaySongs(songs);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Поиск песен
async function searchSongs() {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        loadAllSongs();
        return;
    }

    try {
        const response = await fetch(`/api/songs?search=${encodeURIComponent(query)}`);
        const songs = await response.json();
        displaySongs(songs);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Отобразить песни
function displaySongs(songs) {
    const songsList = document.getElementById('songsList');
    
    if (songs.length === 0) {
        songsList.innerHTML = '<p>Песни не найдены</p>';
        return;
    }

    songsList.innerHTML = songs.map(song => `
        <div class="song-item">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
            <div class="song-difficulty">Сложность: ${getDifficultyText(song.difficulty)}</div>
            <div class="song-chords">Аккорды: ${song.chords}</div>
            <div class="song-lyrics">${song.lyrics}</div>
            <div align="right">
            <button class="delete-btn" onclick="deleteSong('${song._id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Удалить песню
async function deleteSong(songId) {
    if (!confirm('Удалить эту песню?')) return;

    try {
        const response = await fetch(`/api/songs/${songId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Песня удалена');
            loadAllSongs();
        } else {
            alert('Ошибка при удалении песни');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при удалении песни');
    }
}

// Текст сложности
function getDifficultyText(difficulty) {
    const levels = {
        'beginner': 'Начальный',
        'intermediate': 'Средний', 
        'advanced': 'Продвинутый'
    };
    return levels[difficulty] || difficulty;
}