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
        },
        {
            id: 'ex_t1_002',
            type: 'cloze',
            prompt: '____ 학교에 가요.',
            answer: '저는',
            acceptedAnswers: ['저는', '나는'],
            explanation: 'Use 은/는 as topic markers.',
            targetGrammar: 'g_t1_002'
        },
        {
            id: 'ex_t1_003',
            type: 'cloze',
            prompt: '한국에 가고 ____.',
            answer: '싶어요',
            acceptedAnswers: ['싶어요'],
            explanation: 'Use -고 싶다 to express "want to".',
            targetGrammar: 'g_t1_005'
        }
    ],
    TOPIK2: [
        {
            id: 'ex_t2_001',
            type: 'cloze',
            prompt: '한국에 가____ 적이 있어요.',
            answer: '본',
            acceptedAnswers: ['본'],
            explanation: 'Use -아/어 본 적이 있다 to express experience.',
            targetGrammar: 'g_t2_001'
        },
        {
            id: 'ex_t2_002',
            type: 'cloze',
            prompt: '한국에 가____ 해요.',
            answer: '려고',
            acceptedAnswers: ['려고'],
            explanation:
