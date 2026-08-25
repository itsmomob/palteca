export class MasteryCalculator {
    constructor() {
        this.thresholds = {
            new: 0,
            introduced: 0.2,
            familiar: 0.4,
            developing: 0.6,
            strong: 0.8,
            mastered: 0.95
        };
    }
    
    getMasteryLevel(score) {
        if (score >= this.thresholds.mastered) return 'Mastered 🏆';
        if (score >= this.thresholds.strong) return 'Strong 💪';
        if (score >= this.thresholds.developing) return 'Developing 📈';
        if (score >= this.thresholds.familiar) return 'Familiar 👀';
        if (score >= this.thresholds.introduced) return 'Introduced 📖';
        return 'New 🆕';
    }
    
    calculateMastery(correctCount, totalCount, timeWeight = 1) {
        if (totalCount === 0) return 0;
        const rawScore = correctCount / totalCount;
        return Math.min(1, rawScore * timeWeight);
    }
}
