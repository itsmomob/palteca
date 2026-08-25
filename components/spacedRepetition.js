export class SpacedRepetition {
    constructor() {
        this.intervals = [1, 3, 7, 14, 30, 60, 90];
    }
    
    getNextInterval(currentInterval) {
        const currentIndex = this.intervals.indexOf(currentInterval);
        if (currentIndex === -1 || currentIndex === this.intervals.length - 1) {
            return this.intervals[this.intervals.length - 1];
        }
        return this.intervals[currentIndex + 1];
    }
    
    getReviewGrade(score) {
        if (score >= 0.9) return 'excellent';
        if (score >= 0.7) return 'good';
        if (score >= 0.5) return 'needs_review';
        return 'needs_relearning';
    }
}
