export class ProgressTracker {
    static render(user) {
        const mastery = user.mastery || {};
        const levels = ['TOPIK1', 'TOPIK2', 'TOPIK3', 'TOPIK4'];
        
        return `
            <h1>📈 Progress</h1>
            <div class="card">
                <div class="card-title">Mastery by Level</div>
                ${levels.map(level => {
                    const items = Object.values(mastery);
                    const avgMastery = items.length > 0 ? 
                        items.reduce((a, b) => a + b, 0) / items.length : 0;
                    
                    return `
                        <div style="margin: 1rem 0;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>${level}</span>
                                <span>${Math.round(avgMastery * 100)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${avgMastery * 100}%"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="card">
                <div class="card-title">Study Stats</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong>Total Exercises</strong>
                        <div>${user.stats?.totalExercises || 0}</div>
                    </div>
                    <div>
                        <strong>Accuracy</strong>
                        <div>${user.stats?.totalExercises > 0 ? 
                            Math.round((user.stats.correctAnswers / user.stats.totalExercises) * 100) : 0}%
                        </div>
                    </div>
                    <div>
                        <strong>Study Days</strong>
                        <div>${user.stats?.studyDays || 0}</div>
                    </div>
                    <div>
                        <strong>Current Streak</strong>
                        <div>${user.streak || 0} days</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-title">💡 Tips</div>
                <ul style="padding-left: 1.5rem; color: var(--text-light);">
                    <li>Review items regularly to maintain mastery</li>
                    <li>Practice both grammar and vocabulary daily</li>
                    <li>Try reading passages to improve comprehension</li>
                    <li>Complete exercises to reinforce learning</li>
                </ul>
            </div>
        `;
    }
}
