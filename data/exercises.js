export const exerciseData = {
    // ========== TOPIK 1 - Beginner Exercises ==========
    TOPIK1: [
        {
            id: 'ex_t1_001',
            type: 'cloze',
            prompt: '저는 학생____.',
            question: 'Fill in the blank with the correct form of "to be":',
            answer: '이에요',
            acceptedAnswers: ['이에요', '예요'],
            explanation: 'Use "이에요" after consonants (like "학생" ends with "ㅇ"), and "예요" after vowels.',
            targetGrammar: 'g_t1_001'
        },
        {
            id: 'ex_t1_002',
            type: 'cloze',
            prompt: '____ 학교에 가요.',
            question: 'Fill in the blank with the correct topic marker:',
            answer: '저는',
            acceptedAnswers: ['저는', '나는'],
            explanation: 'Use "은/는" as topic markers. "저는" is the polite way to say "I".',
            targetGrammar: 'g_t1_002'
        },
        {
            id: 'ex_t1_003',
            type: 'cloze',
            prompt: '한국에 가고 ____.',
            question: 'Fill in the blank to complete the sentence meaning "I want to go to Korea":',
            answer: '싶어요',
            acceptedAnswers: ['싶어요'],
            explanation: 'Use "-고 싶다" to express "want to". The verb ending should be "싶어요" in polite form.',
            targetGrammar: 'g_t1_005'
        },
        {
            id: 'ex_t1_004',
            type: 'translation',
            prompt: 'Translate to Korean: "I must study hard."',
            question: 'Translate the English sentence into Korean:',
            answer: '열심히 공부해야 해요.',
            acceptedAnswers: ['열심히 공부해야 해요', '열심히 공부해야 돼요'],
            explanation: 'Use "-아/어야 하다" to express obligation/must. "열심히" means "hard/diligently".',
            targetGrammar: 'g_t1_008'
        },
        {
            id: 'ex_t1_005',
            type: 'multiple_choice',
            prompt: 'Choose the correct sentence meaning "I am a student."',
            question: 'Which sentence correctly means "I am a student"?',
            answer: '저는 학생이에요.',
            acceptedAnswers: ['저는 학생이에요.'],
            options: ['저는 학생이에요.', '저는 학생예요.', '저는 학생입니다.'],
            explanation: 'The correct form is "이에요" because "학생" ends with a consonant (ㅇ).',
            targetGrammar: 'g_t1_001'
        }
    ],

    // ========== TOPIK 2 - Intermediate Beginner Exercises ==========
    TOPIK2: [
        {
            id: 'ex_t2_001',
            type: 'cloze',
            prompt: '한국에 가____ 적이 있어요.',
            question: 'Fill in the blank: "I have been to Korea."',
            answer: '본',
            acceptedAnswers: ['본', '가본'],
            explanation: 'Use "-아/어 본 적이 있다" to express having experience of doing something.',
            targetGrammar: 'g_t2_001'
        },
        {
            id: 'ex_t2_002',
            type: 'cloze',
            prompt: '한국에 가____ 해요.',
            question: 'Fill in the blank: "I plan/intend to go to Korea."',
            answer: '려고',
            acceptedAnswers: ['려고'],
            explanation: 'Use "-려고 하다" to express intention or plan to do something.',
            targetGrammar: 'g_t2_002'
        },
        {
            id: 'ex_t2_003',
            type: 'cloze',
            prompt: '밥을 먹은 ____ 공부해요.',
            question: 'Fill in the blank: "I study after eating rice."',
            answer: '후에',
            acceptedAnswers: ['후에'],
            explanation: 'Use "-ㄴ 후에" to express "after doing" something.',
            targetGrammar: 'g_t2_005'
        },
        {
            id: 'ex_t2_004',
            type: 'translation',
            prompt: 'Translate to Korean: "I tend to wake up early in the morning."',
            question: 'Translate the English sentence into Korean:',
            answer: '아침에 일찍 일어나는 편이에요.',
            acceptedAnswers: ['아침에 일찍 일어나는 편이에요', '아침에 일찍 일어나는 편입니다'],
            explanation: 'Use "-는 편이다" to express a tendency or inclination.',
            targetGrammar: 'g_t2_011'
        },
        {
            id: 'ex_t2_005',
            type: 'multiple_choice',
            prompt: 'Choose the correct meaning of "한국에 가 본 적이 있어요?"',
            question: 'What does this question mean?',
            answer: 'Have you ever been to Korea?',
            acceptedAnswers: ['Have you ever been to Korea?'],
            options: [
                'I have been to Korea.',
                'Have you ever been to Korea?',
                'I want to go to Korea.'
            ],
            explanation: 'The pattern "-아/어 본 적이 있다" means "have experience of doing".',
            targetGrammar: 'g_t2_001'
        },
        {
            id: 'ex_t2_006',
            type: 'error_correction',
            prompt: 'Correct the error: "한국에 가려고 했어요." (The intended meaning is "I decided to go to Korea.")',
            question: 'Which grammar pattern should replace the underlined part to mean "decided to"?',
            answer: '기로 했어요',
            acceptedAnswers: ['기로 했어요', '기로 하다'],
            explanation: '"가려고 했어요" means "I intended to go", but for "decided to", use "-기로 하다".',
            targetGrammar: 'g_t2_003'
        }
    ],

    // ========== TOPIK 3 - Intermediate Exercises ==========
    TOPIK3: [
        {
            id: 'ex_t3_001',
            type: 'cloze',
            prompt: '비가 오____ 집에 있어요.',
            question: 'Fill in the blank: "I stay home because it rains."',
            answer: '기 때문에',
            acceptedAnswers: ['기 때문에'],
            explanation: 'Use "-기 때문에" to express reason or cause.',
            targetGrammar: 'g_t3_001'
        },
        {
            id: 'ex_t3_002',
            type: 'cloze',
            prompt: '도시는 복잡한 ____ 시골은 조용해요.',
            question: 'Fill in the blank: "Cities are crowded, whereas the countryside is quiet."',
            answer: '반면에',
            acceptedAnswers: ['반면에'],
            explanation: 'Use "-는 반면에" to express contrast between two things.',
            targetGrammar: 'g_t3_007'
        },
        {
            id: 'ex_t3_003',
            type: 'transformation',
            prompt: 'Rewrite using "-더라도": "비가 오면 안 갈 거예요."',
            question: 'Transform this sentence to mean "I will go even if it rains."',
            answer: '비가 오더라도 갈 거예요.',
            acceptedAnswers: ['비가 오더라도 갈 거예요.', '비가 오더라도 갈 것입니다.'],
            explanation: 'Use "-더라도" to express "even if" - a conditional concession.',
            targetGrammar: 'g_t3_004'
        },
        {
            id: 'ex_t3_004',
            type: 'transformation',
            prompt: 'Rewrite using "-는 탓에": "비가 와서 경기가 취소됐어요."',
            question: 'Transform to mean "The match was canceled because of the rain." (emphasizing the cause)',
            answer: '비가 오는 탓에 경기가 취소됐어요.',
            acceptedAnswers: ['비가 오는 탓에 경기가 취소됐어요.', '비가 오는 탓에 경기가 취소되었어요.'],
            explanation: 'Use "-는 탓에" to express a negative reason/cause.',
            targetGrammar: 'g_t3_005'
        },
        {
            id: 'ex_t3_005',
            type: 'multiple_choice',
            prompt: 'Choose the sentence that correctly expresses "Compared to last year, prices have risen."',
            question: 'Which sentence is grammatically correct?',
            answer: '작년에 비해 물가가 올랐어요.',
            acceptedAnswers: ['작년에 비해 물가가 올랐어요.'],
            options: [
                '작년에 비해 물가가 올랐어요.',
                '작년에 비교해 물가가 올랐어요.',
                '작년에 비해서 물가가 올랐어요.'
            ],
            explanation: '"에 비해" is the standard pattern for "compared to". All options could work, but the first is most common in written Korean.',
            targetGrammar: 'g_t3_008'
        },
        {
            id: 'ex_t3_006',
            type: 'cloze',
            prompt: '도움 ____ 성공했어요.',
            question: 'Fill in the blank: "Thanks to your help, I succeeded."',
            answer: '덕분에',
            acceptedAnswers: ['덕분에'],
            explanation: 'Use "-는 덕분에" to express gratitude for a cause/reason.',
            targetGrammar: 'g_t3_006'
        }
    ],

    // ========== TOPIK 4 - Advanced Exercises ==========
    TOPIK4: [
        {
            id: 'ex_t4_001',
            type: 'cloze',
            prompt: '어려움____ 계속 노력했어요.',
            question: 'Fill in the blank: "I kept trying despite the difficulties."',
            answer: '에도 불구하고',
            acceptedAnswers: ['에도 불구하고'],
            explanation: 'Use "-에도 불구하고" to express "despite" in formal/written contexts.',
            targetGrammar: 'g_t4_001'
        },
        {
            id: 'ex_t4_002',
            type: 'cloze',
            prompt: '한국어를 배우기 ____ 한국에 왔어요.',
            question: 'Fill in the blank: "I came to Korea in order to learn Korean."',
            answer: '위해서',
            acceptedAnswers: ['위해서', '위해'],
            explanation: 'Use "-기 위해서" to express purpose. "위해" is the shortened form.',
            targetGrammar: 'g_t4_015'
        },
        {
            id: 'ex_t4_003',
            type: 'transformation',
            prompt: 'Rewrite using "-느라고": "시험 공부를 해서 친구를 못 만났어요."',
            question: 'Transform to mean "Because I was studying for the exam, I couldn\'t meet friends."',
            answer: '시험 공부를 하느라고 친구를 못 만났어요.',
            acceptedAnswers: ['시험 공부를 하느라고 친구를 못 만났어요.', '시험 공부를 하느라고 친구를 못 만났습니다.'],
            explanation: 'Use "-느라고" to express cause/reason for a negative outcome.',
            targetGrammar: 'g_t4_008'
        },
        {
            id: 'ex_t4_004',
            type: 'cloze',
            prompt: '무엇____ 잘 먹어요.',
            question: 'Fill in the blank: "I eat well whether it\'s anything."',
            answer: '이든지',
            acceptedAnswers: ['이든지'],
            explanation: 'Use "-든지" to express "whether/or" - meaning it doesn\'t matter which.',
            targetGrammar: 'g_t4_004'
        },
        {
            id: 'ex_t4_005',
            type: 'cloze',
            prompt: '어렵____ 포기하지 마세요.',
            question: 'Fill in the blank: "Don\'t give up even if it\'s difficult."',
            answer: '더라도',
            acceptedAnswers: ['더라도'],
            explanation: 'Use "-더라도" to express "even if" (concession in hypothetical situations).',
            targetGrammar: 'g_t4_010'
        },
        {
            id: 'ex_t4_006',
            type: 'multiple_choice',
            prompt: 'Choose the correct meaning of: "소비자 물가가 상승하고 있다고 합니다."',
            question: 'What does this sentence mean?',
            answer: 'It is said that consumer prices are rising.',
            acceptedAnswers: ['It is said that consumer prices are rising.'],
            options: [
                'Consumer prices are rising.',
                'It is said that consumer prices are rising.',
                'Consumer prices seem to be rising.'
            ],
            explanation: '"~고 합니다" is a formal reportative ending used in news/speeches.',
            targetGrammar: 'g_t4_015'
        },
        {
            id: 'ex_t4_007',
            type: 'transformation',
            prompt: 'Rewrite using "-는 대신에": "밥을 먹는 대신에 빵을 먹었어요."',
            question: 'Transform to mean "I ate bread instead of rice." (using the correct pattern)',
            answer: '밥을 먹는 대신에 빵을 먹었어요.',
            acceptedAnswers: ['밥을 먹는 대신에 빵을 먹었어요.', '밥 대신에 빵을 먹었어요.'],
            explanation: 'Use "-는 대신에" to express substitution. The noun form "대신에" is also common.',
            targetGrammar: 'g_t4_003'
        },
        {
            id: 'ex_t4_008',
            type: 'error_correction',
            prompt: 'Correct this sentence: "주말에는 영화를 보곤 합니다." The intended meaning is "I often watch movies on weekends."',
            question: 'Is this sentence correct? If not, what should be changed?',
            answer: 'The sentence is correct.',
            acceptedAnswers: ['The sentence is correct.', 'Correct', 'It is correct.'],
            explanation: 'This sentence is correct! "-곤 하다" expresses a habitual action.',
            targetGrammar: 'g_t4_012'
        },
        {
            id: 'ex_t4_009',
            type: 'translation',
            prompt: 'Translate to Korean: "According to the research, exercise is good for health."',
            question: 'Translate the English sentence into Korean:',
            answer: '연구에 따르면 운동이 건강에 좋아요.',
            acceptedAnswers: ['연구에 따르면 운동이 건강에 좋아요.', '연구에 따르면 운동이 건강에 좋습니다.'],
            explanation: 'Use "-에 따르면" to express "according to".',
            targetGrammar: 'g_t4_014'
        },
        {
            id: 'ex_t4_010',
            type: 'multiple_choice',
            prompt: 'Which sentence correctly expresses "Despite the rain, the game went on."?',
            question: 'Choose the correct sentence:',
            answer: '비가 오는 데에도 불구하고 경기가 진행됐어요.',
            acceptedAnswers: ['비가 오는 데에도 불구하고 경기가 진행됐어요.'],
            options: [
                '비가 오는 데에도 불구하고 경기가 진행됐어요.',
                '비가 오는 데에도 불구하고 경기가 취소됐어요.',
                '비가 오기 때문에 경기가 진행됐어요.'
            ],
            explanation: '"에도 불구하고" expresses concession (despite). The first option is correct.',
            targetGrammar: 'g_t4_001'
        }
    ]
};
