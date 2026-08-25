export class GrammarLesson {
    static render(grammarItem) {
        return `
            <div class="card">
                <div class="card-title">${grammarItem.korean}</div>
                <p><strong>Meaning:</strong> ${grammarItem.meaning_en}</p>
                <p><strong>Category:</strong> ${grammarItem.category || 'General'}</p>
                <div style="margin: 1rem 0;">
                    <h3>Examples</h3>
                    ${(grammarItem.examples || []).map(ex => `
                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                            ${ex}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}
