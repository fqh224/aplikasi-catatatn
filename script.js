import './loading-indicator.js';

const API_URL = 'https://notes-api.dicoding.dev/v2/notes';

class AppBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="app-bar">Notes App</div>`;
    }
}

class NoteForm extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="note-form">
                <input type="text" id="note-title" placeholder="Judul Catatan" required>
                <span class="error" id="title-error"></span>
                <textarea id="note-body" placeholder="Isi Catatan" required></textarea <span class="error" id="body-error"></span>
                <button id="add-note">Tambah Catatan</button>
            </div>
        `;
        this.querySelector('#add-note').addEventListener('click', this.addNote.bind(this));
        this.querySelector('#note-title').addEventListener('input', this.validateTitle.bind(this));
        this.querySelector('#note-body').addEventListener('input', this.validateBody.bind(this));
    }

    validateTitle() {
        const title = this.querySelector('#note-title').value;
        const errorElement = this.querySelector('#title-error');
        errorElement.textContent = title.length < 3 ? 'Judul harus minimal 3 karakter.' : '';
    }

    validateBody() {
        const body = this.querySelector('#note-body').value;
        const errorElement = this.querySelector('#body-error');
        errorElement.textContent = body.length < 10 ? 'Isi catatan harus minimal 10 karakter.' : '';
    }

    async addNote() {
        const title = this.querySelector('#note-title').value;
        const body = this.querySelector('#note-body').value;
        const loadingIndicator = document.querySelector('loading-indicator');

        if (title && body && title.length >= 3 && body.length >= 10) {
            loadingIndicator.show();
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, body }),
                });
                if (response.ok) {
                    this.querySelector('#note-title').value = '';
                    this.querySelector('#note-body').value = '';
                    document.querySelector('note-list').renderNotes();
                } else {
                    console.error('Error adding note');
                }
            } catch (error) {
                console.error('Network error:', error);
            } finally {
                loadingIndicator.hide();
            }
        }
    }
}

class NoteList extends HTMLElement {
    connectedCallback() {
        this.renderNotes();
    }

    async renderNotes() {
        const loadingIndicator = document.querySelector('loading-indicator');
        loadingIndicator.show();
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const notes = await response.json();
                this.innerHTML = '<div class="note-list">' + notes.map(note => `
                    <div class="note-item" data-note-id="${note.id}">
                        <h3>${note.title}</h3>
                        <p>${note.body}</p>
                        <small>${new Date(note.createdAt).toLocaleString()}</small>
                        <button class="delete-note" data-id="${note.id}">Hapus</button>
                    </div>
                `).join('') + '</div>';
                this.addDeleteEventListeners();
            } else {
                console.error('Error fetching notes');
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            loadingIndicator.hide();
        }
    }

    addDeleteEventListeners() {
        this.querySelectorAll('.delete-note').forEach(button => {
            button.addEventListener('click', this.deleteNote.bind(this));
        });
    }

    async deleteNote(event) {
        const noteId = event.target.dataset.id;
        const loadingIndicator = document.querySelector('loading-indicator');
        loadingIndicator.show();
        try {
            const response = await fetch(`${API_URL}/${noteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                this.renderNotes();
            } else {
                console.error('Error deleting note');
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            loadingIndicator.hide();
        }
    }
}

customElements.define('app-bar', AppBar);
customElements.define('note-form', NoteForm);
customElements.define('note-list', NoteList);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('note-list').renderNotes();
});