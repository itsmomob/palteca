// app.js - Main Application Logic
import { levels, grammarData, vocabularyData, sentenceData, exerciseData, textData } from './data/index.js';
import { Dashboard } from './components/Dashboard.js';
import { GrammarLesson } from './components/GrammarLesson.js';
import { VocabularyLesson } from './components/VocabularyLesson.js';
import { ExerciseEngine } from './components/ExerciseEngine.js';
import { ReadingLesson } from './components/ReadingLesson.js';
import { ProgressTracker } from './components/ProgressTracker.js';
import { SpacedRepetition } from './utils/spacedRepetition.js';
import { MasteryCalculator } from './utils/masteryCalculator.js';

class KoreanPalteca {
    constructor() {
        this.user = this.loadUser() || this.createNewUser();
        this.currentPage = 'dashboard';
        this.currentLevel = this.user.currentLevel || 'TOPIK1';
        this.spacedRepetition = new SpacedRepetition();
        this.masteryCalculator = new MasteryCalculator();
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.renderPage('dashboard');
        this.setupKeyboardShortcuts();
        this.setupModalClose();
        this.saveUser();
    }
    
    loadUser() {
        try {
            const data = localStorage.getItem('koreanPaltecaUser');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }
    
    saveUser() {
        localStorage.setItem('koreanPaltecaUser', JSON.stringify(this.user));
    }
    
    createNewUser() {
        return {
            id: Date.now().toString(),
            currentLevel: 'TOPIK1',
            currentUnit: 0,
            streak: 0,
            lastStudyDate: null,
            progress: {
                grammar: {},
                vocabulary: {},
                exercises: {},
                reading: {}
            },
            mastery: {},
            reviewQueue: [],
            stats: {
                totalExercises: 0,
                correctAnswers: 0,
                studyDays: 0,
                startDate: new Date().toISOString()
            }
        };
    }
    
    setupNavigation() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.renderPage(page);
                
                document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.key === 'Enter' && document.activeElement?.classList.contains('exercise-input')) {
                this.submitExercise();
            }
        });
    }
    
    setupModalClose() {
        document.querySelector('.close-btn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    }
    
    renderPage(page) {
        this.currentPage = page;
        const container = document.getElementById('content-container');
        if (!container) return;
        
        let content = '';
        switch(page) {
            case 'dashboard':
                content = Dashboard.render(this.user, this.getDailyReview());
                break;
            case 'study':
                content = this.renderStudyPage();
                break;
            case 'grammar':
                content = this.renderGrammarPage();
                break;
            case 'vocabulary':
                content = this.renderVocabularyPage();
                break;
            case 'reading':
                content = this.renderReadingPage();
                break;
            case 'progress':
                content = ProgressTracker.render(this.user);
                break;
            default:
                content = '<h1>Page not found</h1>';
        }
        
        container.innerHTML = `<div class="fade-in">${content}</div>`;
        
        // Update level badge
        document.getElementById('level-badge').textContent = this.currentLevel;
        document.getElementById('streak').textContent = `🔥 ${this.user.streak || 0}`;
        
        // Post-render setup
        if (page === 'vocabulary') {
            this.setupVocabularySearch();
        }
    }
    
    renderStudyPage() {
        const today = new Date().toDateString();
        if (this.user.lastStudyDate !== today) {
            this.user.streak = (this.user.streak || 0) + 1;
            this.user.lastStudyDate = today;
            this.user.stats.studyDays = (this.user.stats.studyDays || 0) + 1;
            this.saveUser();
        }
        
        const dueItems = this.getDueReviews();
        const newItems = this.getNewItems();
        
        return `
            <h1>📚 Study Session</h1>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-number">${dueItems.length}</div>
                    <div class="stat-label">Due for Review</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${newItems.length}</div>
                    <div class="stat-label">New Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.user.streak || 0}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
            </div>
            ${this.renderReviewQueue(dueItems)}
            ${this.renderNewItems(newItems)}
            ${this.renderRecommendedStudy()}
        `;
    }
    
    renderReviewQueue(items) {
        if (items.length === 0) {
            return '<div class="card"><div class="card-title">🎉 All caught up!</div><p class="text-muted">No reviews due. Time to learn something new!</p></div>';
        }
        
        return `
            <div class="card">
                <div class="card-title">🔄 Review Queue (${items.length})</div>
                ${items.slice(0, 10).map(item => `
                    <div class="review-item">
                        <div>
                            <strong>${item.korean || item.word || item.id}</strong>
                            <span class="review-item-type">${item.type || 'grammar'}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="app.startReview('${item.id}')">
                            Review
                        </button>
                    </div>
                `).join('')}
                ${items.length > 10 ? `<p class="text-muted text-center">+${items.length - 10} more items</p>` : ''}
            </div>
        `;
    }
    
    renderNewItems(items) {
        if (items.length === 0) return '';
        
        return `
            <div class="card">
                <div class="card-title">✨ New Content</div>
                ${items.slice(0, 5).map(item => `
                    <div class="grammar-item" onclick="app.showGrammarDetail('${item.id}')">
                        <div class="grammar-korean">${item.korean}</div>
                        <div class="grammar-meaning">${item.meaning_en}</div>
                        <div class="text-muted" style="font-size: 0.85rem;">${item.category || 'Grammar'}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderRecommendedStudy() {
        const mastered = Object.values(this.user.mastery || {});
        const avgMastery = mastered.length > 0 ? mastered.reduce((a,b) => a + b, 0) / mastered.length : 0;
        
        let recommendation = '';
        if (avgMastery < 0.3) {
            recommendation = 'Focus on building your foundation with vocabulary and basic grammar.';
        } else if (avgMastery < 0.6) {
            recommendation = 'Good progress! Keep reviewing and start incorporating reading practice.';
        } else {
            recommendation = 'You\'re doing great! Challenge yourself with more complex grammar and reading.';
        }
        
        return `
            <div class="card">
                <div class="card-title">💡 Study Recommendation</div>
                <p>${recommendation}</p>
                <div style="margin-top: 0.5rem;">
                    <div class="progress-bar" style="height: 6px;">
                        <div class="progress-fill" style="width: ${avgMastery * 100}%"></div>
                    </div>
                    <div class="text-muted" style="font-size: 0.85rem;">Overall mastery: ${Math.round(avgMastery * 100)}%</div>
                </div>
            </div>
        `;
    }
    
    renderGrammarPage() {
        const levelGrammar = grammarData[this.currentLevel] || [];
        const mastered = this.user.mastery || {};
        
        return `
            <h1>📖 Grammar - ${this.currentLevel}</h1>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div class="card-title" style="margin-bottom: 0;">${levelGrammar.length} Grammar Points</div>
                    <div>
                        <button class="btn btn-sm btn-secondary" onclick="app.changeLevel('TOPIK1')">TOPIK 1</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.changeLevel('TOPIK2')">TOPIK 2</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.changeLevel('TOPIK3')">TOPIK 3</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.changeLevel('TOPIK4')">TOPIK 4</button>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    ${levelGrammar.map(grammar => `
                        <div class="grammar-item" onclick="app.showGrammarDetail('${grammar.id}')">
                            <div class="grammar-korean">${grammar.korean}</div>
                            <div class="grammar-meaning">${grammar.meaning_en}</div>
                            <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 1rem;">
                                <div class="progress-bar" style="width: 100px;">
                                    <div class="progress-fill" style="width: ${(mastered[grammar.id] || 0) * 100}%"></div>
                                </div>
                                <span style="font-size: 0.85rem; color: var(--text-light);">
                                    ${Math.round((mastered[grammar.id] || 0) * 100)}% mastery
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderVocabularyPage() {
        const levelVocab = vocabularyData[this.currentLevel] || [];
        const mastered = this.user.mastery || {};
        
        return `
            <h1>📝 Vocabulary - ${this.currentLevel}</h1>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div class="card-title" style="margin-bottom: 0;">${levelVocab.length} Words</div>
                    <input type="text" id="vocab-search" placeholder="🔍 Search vocabulary..." 
                           class="exercise-input" style="width: 200px; padding: 0.5rem; margin: 0;">
                </div>
                <div id="vocab-list" style="margin-top: 1rem;">
                    ${levelVocab.map(vocab => `
                        <div class="vocab-item" onclick="app.showVocabularyDetail('${vocab.id}')">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                                <div>
                                    <span style="font-weight: 600; font-size: 1.1rem;">${vocab.korean}</span>
                                    <span style="color: var(--text-light); margin-left: 0.5rem; font-size: 0.9rem;">${vocab.reading || ''}</span>
                                    <span style="color: var(--text-light); margin-left: 0.5rem; font-size: 0.8rem; background: #f0f0f0; padding: 0.1rem 0.5rem; border-radius: 12px;">${vocab.part_of_speech || ''}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div class="progress-bar" style="width: 80px;">
                                        <div class="progress-fill" style="width: ${(mastered[vocab.id] || 0) * 100}%"></div>
                                    </div>
                                    <span style="font-size: 0.8rem; color: var(--text-light);">
                                        ${Math.round((mastered[vocab.id] || 0) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div class="grammar-meaning">${vocab.meaning_en}</div>
                            ${vocab.collocations ? `
                                <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.25rem;">
                                    ${vocab.collocations.slice(0, 2).join(' • ')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderReadingPage() {
        const readings = textData[this.currentLevel] || [];
        
        return `
            <h1>📰 Reading Practice</h1>
            ${readings.map(text => `
                <div class="card" onclick="app.showReadingDetail('${text.id}')" style="cursor: pointer;">
                    <div class="card-title">${text.title}</div>
                    <div style="color: var(--text-light); margin-bottom: 0.5rem; font-size: 0.9rem;">
                        ${text.domain || 'General'} • ${text.word_count || 0} words • ${text.level || this.currentLevel}
                    </div>
                    <div class="reading-text" style="max-height: 120px; overflow: hidden; font-size: 0.95rem;">
                        ${text.korean.substring(0, 200)}${text.korean.length > 200 ? '...' : ''}
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); app.startReading('${text.id}')">
                            📖 Read Full Text
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.showReadingDetail('${text.id}')">
                            📝 View Questions
                        </button>
                    </div>
                </div>
            `).join('')}
            ${readings.length === 0 ? '<div class="card"><p class="text-muted">No reading materials available for this level yet.</p></div>' : ''}
        `;
    }
    
    setupVocabularySearch() {
        const searchInput = document.getElementById('vocab-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const search = e.target.value.toLowerCase().trim();
                const items = document.querySelectorAll('.vocab-item');
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(search) ? 'block' : 'none';
                });
            });
        }
    }
    
    changeLevel(level) {
        if (levels[level]) {
            this.currentLevel = level;
            this.user.currentLevel = level;
            this.saveUser();
            this.renderPage(this.currentPage);
        }
    }
    
    getDailyReview() {
        const today = new Date();
        const queue = this.user.reviewQueue || [];
        
        return queue.filter(item => {
            const dueDate = new Date(item.dueDate);
            return dueDate <= today;
        });
    }
    
    getDueReviews() {
        return this.getDailyReview().slice(0, 15);
    }
    
    getNewItems() {
        const mastered = this.user.mastery || {};
        const allGrammar = grammarData[this.currentLevel] || [];
        const newItems = allGrammar.filter(g => !mastered[g.id]);
        return newItems.slice(0, 5);
    }
    
    startReview(itemId) {
        const item = this.findContentItem(itemId);
        if (!item) return;
        
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h2>🔄 Review: ${item.korean || item.word}</h2>
            <div style="margin: 1rem 0;">
                <p><strong>Meaning:</strong> ${item.meaning_en}</p>
                ${item.category ? `<p><strong>Category:</strong> ${item.category}</p>` : ''}
                ${item.examples ? `
                    <p><strong>Examples:</strong></p>
                    ${item.examples.map(ex => `
                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                            ${ex}
                        </div>
                    `).join('')}
                ` : ''}
            </div>
            <div style="margin: 1rem 0;">
                <p><strong>How well do you know this?</strong></p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="app.recordReviewResult('${item.id}', 'hard')">
                        🔴 Need Review
                    </button>
                    <button class="btn btn-primary" onclick="app.recordReviewResult('${item.id}', 'good')">
                        🟡 Okay
                    </button>
                    <button class="btn btn-accent" onclick="app.recordReviewResult('${item.id}', 'easy')">
                        🟢 Easy
                    </button>
                </div>
            </div>
            <div id="review-feedback" style="margin-top: 1rem;"></div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    recordReviewResult(itemId, difficulty) {
        const mastery = this.user.mastery || {};
        const current = mastery[itemId] || 0.5;
        
        let adjustment;
        switch(difficulty) {
            case 'hard': adjustment = -0.1; break;
            case 'good': adjustment = 0.05; break;
            case 'easy': adjustment = 0.1; break;
            default: adjustment = 0;
        }
        
        const newMastery = Math.min(1, Math.max(0, current + adjustment));
        this.user.mastery[itemId] = newMastery;
        
        // Update review queue
        const queue = this.user.reviewQueue || [];
        const index = queue.findIndex(item => item.id === itemId);
        
        const intervals = { hard: 1, good: 3, easy: 7 };
        const interval = intervals[difficulty] || 3;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + interval);
        
        if (index >= 0) {
            queue[index].interval = interval;
            queue[index].dueDate = dueDate.toISOString();
        } else {
            queue.push({
                id: itemId,
                type: 'grammar',
                interval: interval,
                dueDate: dueDate.toISOString()
            });
        }
        
        this.user.reviewQueue = queue;
        this.saveUser();
        
        const feedback = document.getElementById('review-feedback');
        if (feedback) {
            const messages = {
                hard: '🔄 We\'ll review this again tomorrow. Keep practicing!',
                good: '✅ Good job! Next review in 3 days.',
                easy: '🎉 Excellent! Next review in 7 days.'
            };
            feedback.innerHTML = `
                <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; text-align: center;">
                    <p style="font-size: 1.1rem;">${messages[difficulty]}</p>
                    <p class="text-muted" style="font-size: 0.9rem;">Mastery: ${Math.round(newMastery * 100)}%</p>
                    <button class="btn btn-primary btn-sm" onclick="app.closeModal()">Continue</button>
                </div>
            `;
        }
    }
    
    showGrammarDetail(grammarId) {
        const grammar = this.findGrammarItem(grammarId);
        if (!grammar) return;
        
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const mastery = this.user.mastery || {};
        const masteryLevel = this.masteryCalculator.getMasteryLevel(mastery[grammarId] || 0);
        
        modalBody.innerHTML = `
            <h2>${grammar.korean}</h2>
            <p><strong>Meaning:</strong> ${grammar.meaning_en}</p>
            <p><strong>Category:</strong> ${grammar.category || 'General'}</p>
            <p><strong>Mastery:</strong> <span style="color: ${mastery[grammarId] > 0.7 ? 'var(--secondary)' : 'var(--accent)'}">
                ${Math.round((mastery[grammarId] || 0) * 100)}% (${masteryLevel})
            </span></p>
            <div style="margin: 1rem 0;">
                <h3>📝 Examples</h3>
                ${(grammar.examples || []).map(ex => `
                    <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                        ${ex}
                    </div>
                `).join('')}
            </div>
            <div style="margin: 1rem 0;">
                <h3>🎯 Practice</h3>
                <div class="exercise-container">
                    <p>Complete the sentence:</p>
                    <input type="text" class="exercise-input" placeholder="Type your answer..."
                           data-exercise-id="${grammar.id}">
                    <button class="btn btn-primary" onclick="app.submitExercise()">Check Answer</button>
                    <div id="exercise-feedback" style="margin-top: 1rem;"></div>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="app.addToReview('${grammar.id}')">
                    🔄 Add to Review
                </button>
                <button class="btn btn-accent btn-sm" onclick="app.closeModal()">Close</button>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    showVocabularyDetail(vocabId) {
        const vocab = this.findVocabularyItem(vocabId);
        if (!vocab) return;
        
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const mastery = this.user.mastery || {};
        const masteryLevel = this.masteryCalculator.getMasteryLevel(mastery[vocabId] || 0);
        
        modalBody.innerHTML = `
            <h2>${vocab.korean}</h2>
            <p><strong>Reading:</strong> ${vocab.reading || vocab.korean}</p>
            <p><strong>Meaning:</strong> ${vocab.meaning_en}</p>
            <p><strong>Part of Speech:</strong> ${vocab.part_of_speech || 'Unknown'}</p>
            <p><strong>Mastery:</strong> <span style="color: ${mastery[vocabId] > 0.7 ? 'var(--secondary)' : 'var(--accent)'}">
                ${Math.round((mastery[vocabId] || 0) * 100)}% (${masteryLevel})
            </span></p>
            ${vocab.collocations ? `
                <div style="margin: 1rem 0;">
                    <h3>🔗 Common Collocations</h3>
                    ${vocab.collocations.map(c => `
                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                            ${c}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-primary btn-sm" onclick="app.startVocabularyPractice('${vocab.id}')">
                    ✏️ Practice
                </button>
                <button class="btn btn-accent btn-sm" onclick="app.closeModal()">Close</button>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    startVocabularyPractice(vocabId) {
        const vocab = this.findVocabularyItem(vocabId);
        if (!vocab) return;
        
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h2>✏️ Practice: ${vocab.korean}</h2>
            <p>Type the English meaning:</p>
            <input type="text" class="exercise-input" placeholder="Type the meaning..."
                   data-exercise-id="${vocabId}">
            <button class="btn btn-primary" onclick="app.submitVocabularyPractice()">Check</button>
            <div id="practice-feedback" style="margin-top: 1rem;"></div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-secondary btn-sm" onclick="app.showVocabularyDetail('${vocabId}')">Back</button>
            </div>
        `;
    }
    
    submitVocabularyPractice() {
        const input = document.querySelector('.exercise-input');
        if (!input) return;
        
        const vocabId = input.dataset.exerciseId;
        const vocab = this.findVocabularyItem(vocabId);
        if (!vocab) return;
        
        const userAnswer = input.value.trim().toLowerCase();
        const isCorrect = userAnswer === vocab.meaning_en.toLowerCase();
        
        const feedback = document.getElementById('practice-feedback');
        if (feedback) {
            feedback.innerHTML = isCorrect ? 
                '<p style="color: var(--secondary); font-weight: 600;">✅ Correct! Great job!</p>' : 
                `<p style="color: var(--accent); font-weight: 600;">❌ Not quite. The answer is: ${vocab.meaning_en}</p>`;
        }
        
        this.updateMastery(vocabId, isCorrect);
    }
    
    showReadingDetail(textId) {
        const text = this.findTextItem(textId);
        if (!text) return;
        
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h2>${text.title}</h2>
            <div style="color: var(--text-light); margin-bottom: 1rem;">
                ${text.domain || 'General'} • ${text.word_count || 0} words • ${text.level || this.currentLevel}
            </div>
            <div style="margin: 1rem 0;">
                <button class="btn btn-sm btn-secondary" onclick="document.getElementById('reading-translation').style.display = 'block'">
                    Show Translation
                </button>
            </div>
            <div class="reading-text" style="max-height: 300px; overflow-y: auto;">
                ${text.korean}
            </div>
            <div id="reading-translation" style="display: none; margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <p><strong>Translation:</strong></p>
                <p>${text.translation || 'Translation not available'}</p>
            </div>
            ${text.questions ? `
                <div style="margin: 1rem 0;">
                    <h3>📝 Comprehension Questions</h3>
                    ${text.questions.map((q, i) => `
                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; margin: 0.5rem 0;">
                            <strong>Q${i + 1}:</strong> ${q}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-primary btn-sm" onclick="app.markReadingComplete('${text.id}')">
                    ✅ Mark Complete
                </button>
                <button class="btn btn-accent btn-sm" onclick="app.closeModal()">Close</button>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
    
    startReading(textId) {
        this.showReadingDetail(textId);
    }
    
    markReadingComplete(textId) {
        if (!this.user.progress.reading) {
            this.user.progress.reading = {};
        }
        this.user.progress.reading[textId] = {
            completed: true,
            completedAt: new Date().toISOString()
        };
        this.saveUser();
        
        const feedback = document.getElementById('modal-body');
        const completeBtn = feedback?.querySelector('[onclick*="markReadingComplete"]');
        if (completeBtn) {
            completeBtn.textContent = '✅ Completed';
            completeBtn.disabled = true;
            completeBtn.style.opacity = '0.6';
        }
    }
    
    findContentItem(id) {
        const allGrammar = Object.values(grammarData).flat();
        const allVocab = Object.values(vocabularyData).flat();
        return allGrammar.find(g => g.id === id) || allVocab.find(v => v.id === id);
    }
    
    findGrammarItem(id) {
        const allGrammar = Object.values(grammarData).flat();
        return allGrammar.find(g => g.id === id);
    }
    
    findVocabularyItem(id) {
        const allVocab = Object.values(vocabularyData).flat();
        return allVocab.find(v => v.id === id);
    }
    
    findTextItem(id) {
        const allTexts = Object.values(textData).flat();
        return allTexts.find(t => t.id === id);
    }
    
    findExercise(id) {
        const allExercises = Object.values(exerciseData).flat();
        return allExercises.find(e => e.id === id);
    }
    
    closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }
    
    submitExercise() {
        const input = document.querySelector('.exercise-input');
        if (!input) return;
        
        const exerciseId = input.dataset.exerciseId;
        if (!exerciseId) return;
        
        const answer = input.value.trim();
        const exercise = this.findExercise(exerciseId);
        const isCorrect = exercise ? this.checkAnswer(answer, exercise) : false;
        
        const feedback = document.getElementById('exercise-feedback');
        if (feedback) {
            const correctAnswer = exercise ? exercise.answer : 'Unknown';
            feedback.innerHTML = isCorrect ?
                '<p style="color: var(--secondary); font-weight: 600;">✅ Correct! Well done!</p>' :
                `<p style="color: var(--accent); font-weight: 600;">❌ Not quite. The correct answer is: ${correctAnswer}</p>`;
        }
        
        if (isCorrect) {
            this.user.stats.correctAnswers = (this.user.stats.correctAnswers || 0) + 1;
        }
        this.user.stats.totalExercises = (this.user.stats.totalExercises || 0) + 1;
        
        if (exercise?.targetGrammar) {
            this.updateMastery(exercise.targetGrammar, isCorrect);
        }
        
        this.saveUser();
    }
    
    checkAnswer(input, exercise) {
        const normalizedInput = input.trim().toLowerCase();
        const normalizedAnswer = exercise.answer.toLowerCase();
        
        if (exercise.acceptedAnswers) {
            return exercise.acceptedAnswers.some(a => a.toLowerCase() === normalizedInput);
        }
        
        return normalizedInput === normalizedAnswer;
    }
    
    updateMastery(itemId, correct) {
        if (!this.user.mastery) {
            this.user.mastery = {};
        }
        
        if (!this.user.mastery[itemId]) {
            this.user.mastery[itemId] = 0.5;
        }
        
        const current = this.user.mastery[itemId];
        const adjustment = correct ? 0.05 : -0.05;
        this.user.mastery[itemId] = Math.min(1, Math.max(0, current + adjustment));
        
        this.updateReviewQueue(itemId, correct);
        this.saveUser();
    }
    
    updateReviewQueue(itemId, correct) {
        const queue = this.user.reviewQueue || [];
        const index = queue.findIndex(item => item.id === itemId);
        
        const currentInterval = index >= 0 ? queue[index].interval || 0 : 0;
        const interval = correct ? this.spacedRepetition.getNextInterval(currentInterval) : 1;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + interval);
        
        if (index >= 0) {
            queue[index].interval = interval;
            queue[index].dueDate = dueDate.toISOString();
        } else {
            queue.push({
                id: itemId,
                type: 'grammar',
                interval: interval,
                dueDate: dueDate.toISOString()
            });
        }
        
        this.user.reviewQueue = queue;
    }
    
    addToReview(itemId) {
        const queue = this.user.reviewQueue || [];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        
        if (!queue.find(item => item.id === itemId)) {
            queue.push({
                id: itemId,
                type: 'grammar',
                interval: 1,
                dueDate: dueDate.toISOString()
            });
            this.user.reviewQueue = queue;
            this.saveUser();
            
            const feedback = document.getElementById('exercise-feedback');
            if (feedback) {
                feedback.innerHTML = '<p style="color: var(--secondary);">✅ Added to review queue!</p>';
            }
        }
    }
}

// Initialize the app
const app = new KoreanPalteca();

// Make app globally accessible for onclick handlers
window.app = app;

// Log for debugging
console.log('🇰🇷 Korean Palteca initialized successfully!');
console.log('User data:', app.user);
