export class ExerciseEngine {
    static renderReview(item) {
        return `
            <div class="exercise-container">
                <div class="exercise-prompt">
                    <strong>How well do you know this?</strong>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm" onclick="app.recordReviewResult('${item.id}', 'hard')">
                        🔴 Need Review
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="app.recordReviewResult('${item.id}', 'good')">
                        🟡 Okay
                    </button>
                    <button class="btn btn-accent btn-sm" onclick="app.recordReviewResult('${item.id}', 'easy')">
                        🟢 Easy
                    </button>
                </div>
            </div>
        `;
    }
    
    static renderQuickPractice(grammar) {
        return `
            <div class="exercise-container">
                <p>Complete the sentence:</p>
                <div style="margin: 1rem 0;">
                    <input type="text" class="exercise-input" placeholder="Type your answer..."
                           data-exercise-id="${grammar.id}">
                </div>
                <button class="btn btn-primary" onclick="app.submitExercise()">Check Answer</button>
                <div id="exercise-feedback" style="margin-top: 1rem;"></div>
            </div>
        `;
    }
}
