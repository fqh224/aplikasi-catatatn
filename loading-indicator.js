class LoadingIndicator extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="loading-indicator">Loading...</div>`;
    }

    show() {
        this.style.display = 'block';
    }

    hide() {
        this.style.display = 'none';
    }
}

customElements.define('loading-indicator', LoadingIndicator);