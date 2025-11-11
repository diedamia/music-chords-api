// DOM элементы
const addSongForm = document.getElementById('addSongForm');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const lyricsInput = document.getElementById('lyrics');
const chordsInput = document.getElementById('chords');
const difficultySelect = document.getElementById('difficulty');
const searchInput = document.getElementById('searchInput');
const songsList = document.getElementById('songsList');
const submitButton = document.querySelector('#addSongForm button[type="submit"]');

// Состояние приложения
let appState = {
    currentEditId: null,
    isEditMode: false
};

// Оригинальный обработчик формы для создания песен
const originalFormHandler = async function(e) {
    e.preventDefault();
    
    const songData = {
        title: titleInput.value,
        artist: artistInput.value,
        lyrics: lyricsInput.value,
        chords: chordsInput.value,
        difficulty: difficultySelect.value
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
            resetFormToCreateMode();
            loadAllSongs();
        } else {
            alert('Ошибка при добавлении песни');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при добавлении песни');
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    addSongForm.addEventListener('submit', originalFormHandler);
    loadAllSongs();
});

// Загрузка всех песен
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
    const query = searchInput.value;
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

// Отображение списка песен
function displaySongs(songs) {
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
                <button class="edit-btn" onclick="enableEditMode('${song._id}')">Редактировать</button>
                <button class="delete-btn" onclick="deleteSong('${song._id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Активация режима редактирования
async function enableEditMode(songId) {
    try {
        const response = await fetch(`/api/songs/${songId}`);
        const song = await response.json();
        
        if (response.ok) {
            fillFormWithSongData(song);
            switchToEditMode(songId);
        } else {
            alert('Ошибка при загрузке данных песни');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при загрузке данных песни');
    }
}

// Заполнение формы данными песни
function fillFormWithSongData(song) {
    titleInput.value = song.title;
    artistInput.value = song.artist;
    lyricsInput.value = song.lyrics;
    chordsInput.value = song.chords;
    difficultySelect.value = song.difficulty;
}

// Переключение в режим редактирования
function switchToEditMode(songId) {
    appState.currentEditId = songId;
    appState.isEditMode = true;
    
    // Удалить старый обработчик и добавить новый
    addSongForm.removeEventListener('submit', originalFormHandler);
    addSongForm.addEventListener('submit', handleSongUpdate);
    
    // Обновить внешний вид кнопки
    submitButton.textContent = 'Обновить песню';
    submitButton.style.backgroundColor = '#2196F3';
    scrollToForm();
}

function scrollToForm() {
    const formSection = document.querySelector('.form-section');
    if (formSection) {
        formSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Обработчик обновления песни
async function handleSongUpdate(e) {
    e.preventDefault();
    
    if (!appState.isEditMode || !appState.currentEditId) {
        alert('Режим редактирования не активирован');
        return;
    }

    const songData = {
        title: titleInput.value,
        artist: artistInput.value,
        lyrics: lyricsInput.value,
        chords: chordsInput.value,
        difficulty: difficultySelect.value
    };

    try {
        const response = await fetch(`/api/songs/${appState.currentEditId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(songData)
        });

        if (response.ok) {
            alert('Песня обновлена!');
            resetFormToCreateMode();
            loadAllSongs();
        } else {
            alert('Ошибка при обновлении песни');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при обновлении песни');
    }
}

// Удаление песни
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

// Сброс формы в режим создания
function resetFormToCreateMode() {
    addSongForm.reset();
    
    // Сброс состояния приложения
    appState.currentEditId = null;
    appState.isEditMode = false;
    
    // Восстановление оригинального обработчика
    addSongForm.removeEventListener('submit', handleSongUpdate);
    addSongForm.addEventListener('submit', originalFormHandler);
    
    // Восстановление внешнего вида кнопки
    submitButton.textContent = 'Добавить песню';
    submitButton.style.backgroundColor = '#4CAF50';
}

// Получение текстового описания сложности
function getDifficultyText(difficulty) {
    const difficultyLevels = {
        'beginner': 'Начальный',
        'intermediate': 'Средний', 
        'advanced': 'Продвинутый'
    };
    return difficultyLevels[difficulty] || difficulty;
}