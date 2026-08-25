export const exerciseData = {
    TOPIK1: [
        {
            id: 'ex_t1_001',
            type: 'cloze',
            prompt: '저는 학생____.',
            answer: '이에요',
            acceptedAnswers: ['이에요', '예요'],
            explanation: 'Use 이에요 after consonants, 예요 after vowels.',
            targetGrammar: 'g_t1_001'
        }
    ],
    TOPIK2: [
        {
            id: 'ex_t2_001',
            type: 'cloze',
            prompt: '한국에 가____ 적이 있어요.',
            answer: '본',
            acceptedAnswers: ['본', '가본'],
            explanation: 'Use -아/어 본 적이 있다 to express experience.',
            targetGrammar: 'g_t2_001'
        }
    ],
    TOPIK3: [
        {
            id: 'ex_t3_001',
            type: 'cloze',
            prompt: '비가 오____ 집에 있어요.',
            answer: '기 때문에',
            acceptedAnswers: ['기 때문에'],
            explanation: 'Use -기 때문에 to express reason or cause.',
            targetGrammar: 'g_t3_001'
        }
    ],
    TOPIK4: [
        {
            id: 'ex_t4_001',
            type: 'cloze',
            prompt: '어려움____ 계속 노력했어요.',
            answer: '에도 불구하고',
            acceptedAnswers: ['에도 불구하고'],
            explanation: 'Use -에도 불구하고 to express "despite" in formal contexts.',
            targetGrammar: 'g_t4_001'
        }
    ]
};
