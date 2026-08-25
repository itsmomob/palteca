// utils/contentRenderer.js
export class ContentRenderer {
    /**
     * Render a grammar item as HTML
     */
    static renderGrammarItem(grammar) {
        return `
            <div class="grammar-item" data-id="${grammar.id}">
                <div class="grammar-korean">${grammar.korean}</div>
                <div class="grammar-meaning">${grammar.meaning_en}</div>
                ${grammar.category ? `<div class="grammar-category" style="font-size: 0.85rem; color: var(--text-light);">${grammar.category}</div>` : ''}
                ${grammar.examples ? `
                    <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-light);">
                        ${grammar.examples.slice(0, 2).map(ex => `📝 ${ex}`).join('<br>')}
                    </div>
                ` : ''}
                <div style="margin-top: 0.5rem;">
                    <span class="btn btn-sm btn-primary" onclick="event.stopPropagation(); app.showGrammarDetail('${grammar.id}')">
                        View Details
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Render a vocabulary item as HTML
     */
    static renderVocabItem(vocab) {
        return `
            <div class="vocab-item" data-id="${vocab.id}">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                        <span class="vocab-korean" style="font-weight: 600; font-size: 1.1rem;">${vocab.korean}</span>
                        <span class="vocab-reading" style="color: var(--text-light); margin-left: 0.5rem;">${vocab.reading || ''}</span>
                        <span class="vocab-pos" style="color: var(--text-light); margin-left: 0.5rem; font-size: 0.8rem; background: #f0f0f0; padding: 0.1rem 0.5rem; border-radius: 12px;">${vocab.part_of_speech || ''}</span>
                    </div>
                </div>
                <div class="vocab-meaning" style="color: var(--text-light);">${vocab.meaning_en}</div>
                ${vocab.collocations ? `
                    <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.25rem;">
                        🔗 ${vocab.collocations.slice(0, 3).join(' • ')}
                    </div>
                ` : ''}
                <div style="margin-top: 0.5rem;">
                    <span class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); app.showVocabularyDetail('${vocab.id}')">
                        View Details
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Render a sentence with optional highlights
     */
    static renderSentence(sentence, highlights = []) {
        let text = sentence;
        highlights.forEach(word => {
            const regex = new RegExp(word, 'gi');
            text = text.replace(regex, `<span class="highlight-word">$&</span>`);
        });
        return text;
    }

    /**
     * Render a text with grammar and vocabulary annotations
     */
    static renderTextWithAnnotations(text, grammarAnnotations = [], vocabAnnotations = []) {
        let result = text;
        
        // Add grammar annotations
        grammarAnnotations.forEach(grammar => {
            const regex = new RegExp(grammar.pattern || grammar.korean, 'gi');
            result = result.replace(regex, 
                `<span class="highlight-grammar" style="color: var(--primary); border-bottom: 2px solid var(--primary);" 
                       title="Grammar: ${grammar.meaning}">$&</span>`
            );
        });
        
        // Add vocabulary annotations  
        vocabAnnotations.forEach(vocab => {
            const regex = new RegExp(vocab.word || vocab.korean, 'gi');
            result = result.replace(regex, 
                `<span class="highlight-vocab" style="color: var(--accent); border-bottom: 2px solid var(--accent);" 
                       title="${vocab.meaning}">$&</span>`
            );
        });
        
        return result;
    }

    /**
     * Render a progress bar with percentage
     */
    static renderProgressBar(percentage, label = '', height = '8px') {
        return `
            <div style="margin: 0.5rem 0;">
                ${label ? `<div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span>${label}</span>
                    <span>${Math.round(percentage * 100)}%</span>
                </div>` : ''}
                <div class="progress-bar" style="height: ${height};">
                    <div class="progress-fill" style="width: ${percentage * 100}%;"></div>
                </div>
            </div>
        `;
    }

    /**
     * Render a list of items with optional click handler
     */
    static renderItemList(items, renderer, containerClass = '') {
        if (!items || items.length === 0) {
            return '<div class="text-muted" style="padding: 1rem; text-align: center;">No items available</div>';
        }
        
        return `
            <div class="${containerClass}">
                ${items.map(item => renderer(item)).join('')}
            </div>
        `;
    }

    /**
     * Render a flashcard for study
     */
    static renderFlashcard(item, type = 'grammar') {
        const front = type === 'grammar' ? item.korean : item.korean;
        const back = type === 'grammar' ? item.meaning_en : item.meaning_en;
        
        return `
            <div class="flashcard" style="padding: 2rem; text-align: center; background: var(--card); border-radius: var(--border-radius); box-shadow: var(--shadow); min-height: 200px; display: flex; flex-direction: column; justify-content: center;">
                <div class="flashcard-front" style="font-size: 1.5rem; font-weight: 600; color: var(--primary);">
                    ${front}
                </div>
                <div class="flashcard-back" style="font-size: 1.1rem; color: var(--text-light); margin-top: 1rem;">
                    ${back}
                </div>
                ${item.examples ? `
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);">
                        <small>📝 ${item.examples[0]}</small>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render a study session summary
     */
    static renderStudySummary(stats) {
        return `
            <div class="study-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; padding: 1rem;">
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-number" style="font-size: 1.5rem;">${stats.newItems || 0}</div>
                    <div class="stat-label" style="font-size: 0.85rem;">New Items</div>
                </div>
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-number" style="font-size: 1.5rem;">${stats.reviewItems || 0}</div>
                    <div class="stat-label" style="font-size: 0.85rem;">Review Items</div>
                </div>
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-number" style="font-size: 1.5rem;">${stats.mastered || 0}</div>
                    <div class="stat-label" style="font-size: 0.85rem;">Mastered</div>
                </div>
                <div class="stat-card" style="text-align: center;">
                    <div class="stat-number" style="font-size: 1.5rem;">${Math.round(stats.accuracy || 0)}%</div>
                    <div class="stat-label" style="font-size: 0.85rem;">Accuracy</div>
                </div>
            </div>
        `;
    }

    /**
     * Render a list of collocations
     */
    static renderCollocations(collocations) {
        if (!collocations || collocations.length === 0) return '';
        
        return `
            <div style="margin: 0.5rem 0;">
                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem;">🔗 Common Collocations</div>
                ${collocations.map(c => `
                    <div style="padding: 0.3rem 0.75rem; background: #f8f9fa; border-radius: 4px; margin: 0.25rem 0; font-size: 0.9rem;">
                        ${c}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render a word family tree
     */
    static renderWordFamily(wordFamily) {
        if (!wordFamily || !wordFamily.members) return '';
        
        return `
            <div style="margin: 1rem 0;">
                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem;">🌳 Word Family: ${wordFamily.root}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${wordFamily.members.map(member => `
                        <span style="padding: 0.25rem 0.75rem; background: var(--primary); color: white; border-radius: 20px; font-size: 0.85rem;">
                            ${member}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
}
