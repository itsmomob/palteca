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
            explanation: 'Use -려고 하다 to express intention.',
            targetGrammar: 'g_t2_002'
        },
        {
            id: 'ex_t2_003',
            type: 'cloze',
            prompt: '밥을 먹은 ____ 공부해요.',
            answer: '후에',
            acceptedAnswers: ['후에'],
            explanation: 'Use -ㄴ 후에 to express "after doing".',
            targetGrammar: 'g_t2_005'
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
        },
        {
            id: 'ex_t3_002',
            type: 'cloze',
            prompt: '도시는 복잡한 ____ 시골은 조용해요.',
            answer: '반면에',
            acceptedAnswers: ['반면에'],
            explanation: 'Use -는 반면에 to express contrast.',
            targetGrammar: 'g_t3_007'
        },
        {
            id: 'ex_t3_003',
            type: 'transformation',
            prompt: 'Rewrite using -더라도: "비가 오면 안 갈 거예요."',
            answer: '비가 오더라도 갈 거예요.',
            acceptedAnswers: ['비가 오더라도 갈 거예요.'],
            explanation: 'Use -더라도 to express "even if".',
            targetGrammar: 'g_t3_004'
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
        },
        {
            id: 'ex_t4_002',
            type: 'cloze',
            prompt: '한국어를 배우기 ____ 한국에 왔어요.',
            answer: '위해서',
            acceptedAnswers: ['위해서'],
            explanation: 'Use -기 위해서 to express purpose.',
            targetGrammar: 'g_t4_015'
        },
        {
            id: 'ex_t4_003',
            type: 'transformation',
            prompt: 'Rewrite using -느라고: "시험 공부를 해서 친구를 못 만났어요."',
            answer: '시험 공부를 하느라고 친구를 못 만났어요.',
            acceptedAnswers: ['시험 공부를 하느라고 친구를 못 만났어요.'],
            explanation: 'Use -느라고 to express cause/reason for a negative outcome.',
            targetGrammar: 'g_t4_008'
        },
        {
            id: 'ex_t4_004',
            type: 'cloze',
            prompt: '무엇____ 잘 먹어요.',
            answer: '이든지',
            acceptedAnswers: ['이든지'],
            explanation: 'Use -든지 to express "whether/or".',
            targetGrammar: 'g_t4_004'
        },
        {
            id: 'ex_t4_005',
            type: 'cloze',
            prompt: '어렵____ 포기하지 마세요.',
            answer: '더라도',
            acceptedAnswers: ['더라도'],
            explanation: 'Use -더라도 to express "even if".',
            targetGrammar: 'g_t4_010'
        }
    ]
};
