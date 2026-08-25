export class VocabularyLesson {
    static render(vocabItem) {
        return `
            <div class="card">
                <div class="card-title">${vocabItem.korean}</div>
                <p><strong>Reading:</strong> ${vocabItem.reading || vocabItem.korean}</p>
                <p><strong>Meaning:</strong> ${vocabItem.meaning_en}</p>
                <p><strong>Part of Speech:</strong> ${vocabItem.part_of_speech || 'Unknown'}</p>
                ${vocabItem.collocations ? `
                    <div style="margin: 1rem 0;">
                        <h3>Collocations</h3>
                        ${vocabItem.collocations.map(c => `
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                                ${c}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}
