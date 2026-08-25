export class Dashboard {
    static render(user, dueItems) {
        const masteredCount = Object.values(user.mastery || {}).filter(m => m >= 0.8).length;
        const totalItems = Object.keys(user.mastery || {}).length || 1;
        
        return `
            <h1>📊 Dashboard</h1>
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-number">${user.streak || 0}</div>
                    <div class="stat-label">🔥 Day Streak</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${dueItems.length}</div>
                    <div class="stat-label">📚 Due for Review</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round((masteredCount / totalItems) * 100)}%</div>
                    <div class="stat-label">🎯 Mastery</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${user.stats?.correctAnswers || 0}</div>
                    <div class="stat-label">✅ Correct Answers</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">📈 Progress Overview</div>
                <div class="progress-bar" style="height: 20px;">
                    <div class="progress-fill" style="width: ${Math.min(100, (totalItems / 100) * 100)}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                    <span>${user.currentLevel || 'TOPIK 1'}</span>
                    <span>${totalItems} items learned</span>
                </div>
            </div>
            
            ${dueItems.length > 0 ? `
                <div class="card">
                    <div class="card-title">⚠️ Items Due for Review (${dueItems.length})</div>
                    ${dueItems.slice(0, 5).map(item => `
                        <div class="review-item">
                            <div class="review-item-info">
                                <strong>${item.korean || item.word || item.id}</strong>
                                <span class="review-item-type">${item.type || 'grammar'}</span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="app.startReview('${item.id}')">
                                Review
                            </button>
                        </div>
                    `).join('')}
                    ${dueItems.length > 5 ? `
                        <div style="text-align: center; margin-top: 0.5rem; color: var(--text-light);">
                            <small>+${dueItems.length - 5} more items</small>
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="card">
                    <div class="card-title">🎉 All caught up!</div>
                    <p style="color: var(--text-light);">No items due for review. Time to learn something new!</p>
                </div>
            `}
        `;
    }
}
