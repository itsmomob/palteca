export class ReadingLesson {
    static render(text) {
        return `
            <div class="card">
                <div class="card-title">${text.title}</div>
                <div style="color: var(--text-light); margin-bottom: 0.5rem;">
                    ${text.domain || 'General'} • ${text.word_count || 0} words
                </div>
                <div class="reading-text">
                    ${text.korean}
                </div>
                ${text.translation ? `
                    <div style="margin: 1rem 0;">
                        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('translation-${text.id}').style.display = 'block'">
                            Show Translation
                        </button>
                        <div id="translation-${text.id}" style="display: none; margin-top: 0.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                            ${text.translation}
                        </div>
                    </div>
                ` : ''}
                ${text.questions ? `
                    <div style="margin: 1rem 0;">
                        <h3>Questions</h3>
                        ${text.questions.map((q, i) => `
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                                <strong>Q${i + 1}:</strong> ${q}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}
