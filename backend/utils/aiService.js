import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getModel = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MOCK_KEY') {
      throw new Error('GEMINI_API_KEY is not configured or is set to default MOCK_KEY.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// Mock questions database for fallback
const MOCK_QUESTIONS = {
  'Java': [
    'Explain the differences between HashMap and ConcurrentHashMap in Java.',
    'What is the Java Virtual Machine (JVM) and how does it manage memory?',
    'What are Java Streams, and how do they differ from standard collections?',
    'Explain the concepts of method overloading and method overriding in Java.',
    'What is the difference between an interface and an abstract class in Java 8+?'
  ],
  'Python': [
    'Explain the difference between lists and tuples in Python. When would you use which?',
    'What are generators in Python, and how do they optimize memory usage?',
    'How does memory management work in Python? What is the GIL?',
    'What is the difference between deep copy and shallow copy in Python?',
    'Explain how decorators work in Python with a brief example.'
  ],
  'SQL': [
    'What is the difference between WHERE and HAVING clauses in SQL?',
    'Explain the difference between INNER JOIN, LEFT JOIN, and outer joins.',
    'What is database normalization? Explain 1NF, 2NF, and 3NF.',
    'How do database indexes improve query performance? Are there downsides?',
    'Explain ACID properties in relational database management systems.'
  ],
  'Data Structures': [
    'What is the difference between a binary tree and a binary search tree (BST)?',
    'Explain the time and space complexity of QuickSort and MergeSort.',
    'What is a Hash Map, and how does it handle collisions?',
    'Explain the difference between Breadth-First Search (BFS) and Depth-First Search (DFS).',
    'How does a singly linked list differ from a doubly linked list?'
  ],
  'Data Analytics': [
    'What is the difference between supervised and unsupervised machine learning?',
    'Explain what data imputation is and list common techniques to handle missing values.',
    'What is the difference between correlation and causation? Provide an example.',
    'Explain the concept of Overfitting and how you can prevent it.',
    'What is a confusion matrix, and what metrics can you derive from it?'
  ],
  'Web Development': [
    'Explain the difference between GET and POST HTTP requests.',
    'What is the DOM? How does browser rendering work?',
    'What is the difference between localStorage, sessionStorage, and cookies?',
    'Explain the concept of CORS (Cross-Origin Resource Sharing). How do you resolve it?',
    'What is the difference between responsive design and adaptive design?'
  ],
  'JavaScript': [
    'What is a closure in JavaScript? Explain with a simple code context.',
    'Explain the event loop in JavaScript. How does it handle asynchronous code?',
    'What is the difference between double equals (==) and triple equals (===) in JavaScript?',
    'Explain the difference between var, let, and const declarations.',
    'What are Promises, and how do they solve the callback hell problem?'
  ],
  'React': [
    'What is the Virtual DOM and how does React use it to optimize rendering?',
    'Explain the React component lifecycle or useEffect dependency array rules.',
    'What is the difference between controlled and uncontrolled components?',
    'How does React Context work, and when should you use it instead of Redux?',
    'What are React Hooks? List 3 built-in hooks and their purposes.'
  ],
  'Node.js': [
    'What is the difference between setImmediate() and setTimeout() in Node.js?',
    'Explain how the asynchronous non-blocking I/O model works in Node.js.',
    'What are middleware functions in Express.js? Provide an example.',
    'What is the purpose of package.json and package-lock.json files?',
    'Explain how streams work in Node.js. Why are they useful?'
  ],
  'HR Interview': [
    'Tell me about yourself. What are your core strengths and career goals?',
    'Why do you want to join our company? What interests you about this role?',
    'Describe a time when you faced a conflict in a team. How did you resolve it?',
    'Where do you see yourself in 5 years? What skills do you want to acquire?',
    'How do you handle tight deadlines or pressure when working on a project?'
  ]
};

const getFallbackQuestion = (domain, previousQuestions) => {
  const pool = MOCK_QUESTIONS[domain] || [
    'Explain the core principles of Object-Oriented Programming (OOP).',
    'What is clean code, and what are some best practices for code readability?',
    'How do you explain technical concepts to non-technical stakeholders?'
  ];
  const unused = pool.filter(q => !previousQuestions.includes(q));
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
};

// Company-specific interview intelligence
const COMPANY_PROFILES = {
  TCS: 'TCS (Tata Consultancy Services) interviews focus on: Java OOP fundamentals, basic SQL queries, simple data structure problems (arrays, linked lists), SDLC process knowledge, and core HR behavioral questions. Their coding rounds use the TCS NQT format with pseudocode-level problems.',
  Infosys: 'Infosys interviews emphasize: Object-Oriented Programming principles, database management (SQL joins, normalization), basic algorithms (sorting, searching), software engineering concepts, and situational judgment. They also test reasoning ability alongside technical topics.',
  Accenture: 'Accenture interviews test: logical and analytical reasoning, coding fundamentals (Python/Java), REST API concepts, cloud awareness (AWS/Azure basics), agile methodology, and behavioral competency questions (STAR method). Their coding section focuses on problem-solving patterns.',
  Oracle: 'Oracle interviews are rigorous in: advanced SQL (window functions, CTEs, query optimization, execution plans), PL/SQL, database design and normalization, Java collections and concurrency, distributed system concepts, and data warehousing. Expect algorithm-heavy rounds at Advanced level.',
  Cognizant: 'Cognizant (CTS) interviews cover: RDBMS and NoSQL concepts, JavaScript/web fundamentals, core Java, data structures (trees, graphs), basic networking, OOPS, and scenario-based HR questions. They often include a communication/aptitude screening round.',
  Wipro: 'Wipro interviews test through their WILP/NLTH format: programming fundamentals (C/Java/Python), data structures, DBMS, operating system concepts, computer networks, and verbal ability. Technical rounds involve live coding of medium-difficulty algorithmic problems.',
  Capgemini: 'Capgemini interviews assess: pseudocode comprehension, cloud computing fundamentals, agile/DevOps awareness, full-stack web concepts, database design, and essay-type explanations. Their technical rounds are moderately challenging with scenario-based architecture questions.',
  IBM: 'IBM interviews are comprehensive: cloud architecture (IBM Cloud/AWS), advanced data structures and algorithms, AI/ML concepts, system design, Java/Python at an advanced level, DevOps pipelines, and cognitive ability tests. They value innovation and research mindset.',
  Deloitte: 'Deloitte interviews include: case study analysis, technology consulting scenarios, data analytics using SQL and Excel logic, cloud migration concepts, cybersecurity awareness, and professional communication. Technical roles also include coding challenges in Python or Java.',
  HCL: 'HCL (HCL Technologies) interviews focus on: networking fundamentals, embedded systems (for hardware roles), Java/C++ programming, DBMS, system administration concepts, Linux basics, and straightforward algorithmic problem solving at entry to mid-level.',
};

/**
 * generateInterviewQuestion
 */
export const generateInterviewQuestion = async ({ domain, difficulty, previousQuestions = [], companyName = null }) => {
  const previousList = previousQuestions.length > 0
    ? `\nDo NOT repeat any of these previously asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const companyContext = companyName && COMPANY_PROFILES[companyName]
    ? `\nCompany Profile — ${companyName}: ${COMPANY_PROFILES[companyName]}\nGenerate a question that directly aligns with ${companyName}'s known interview patterns and hiring style.`
    : companyName
      ? `\nThis question should reflect the interview style commonly used at ${companyName}.`
      : '';

  const domainInstruction = domain.includes(',')
    ? `The domain comprises multiple topics: ${domain}. Generate a question targeting one of these topics, or integrating concepts from multiple topics listed.`
    : `The domain is: ${domain}`;

  const prompt = `You are an experienced senior technical interviewer.
Generate exactly ONE clear, concise interview question for the following:
- Topic area: ${domainInstruction}
- Difficulty: ${difficulty}
${companyContext}
${previousList}

Rules:
- Return ONLY the question text itself — no numbering, no explanation, no preamble.
- The question must be appropriate for the ${difficulty} difficulty level.
- The question must be directly related to the specified topic area.
- Do not include "Question:" prefix.
- Keep it under 2 sentences.`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log(`[AI Service] Successfully generated question using Gemini API for domain: ${domain}`);
    return text;
  } catch (error) {
    console.warn(`[AI Service Warning] Gemini API failed for question generation: ${error.message}. Using offline fallback.`);
    return getFallbackQuestion(domain, previousQuestions);
  }
};

/**
 * evaluateAnswer
 * Concept-grounded evaluation: the model first identifies the key concepts
 * a correct answer must contain, then scores based on actual coverage.
 * Weaknesses are only emitted when genuinely present; strong answers get
 * empty or near-empty weakness arrays.
 */
export const evaluateAnswer = async ({ question, userAnswer, domain, difficulty }) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      score: 0,
      technicalAccuracy: 'No answer provided.',
      completeness: 'The question was skipped or left blank.',
      missingPoints: ['Complete answer required — even a partial attempt demonstrates reasoning.'],
      strengths: [],
      weaknesses: ['No answer was submitted.'],
      suggestions: 'Always attempt every question. Partial answers with correct reasoning earn partial credit.',
      idealAnswer: '',
    };
  }

  const prompt = `You are a senior technical interviewer at a leading technology company. You evaluate candidates with the same rigour as FAANG-style technical interviews.

QUESTION: ${question}
DOMAIN: ${domain}
DIFFICULTY: ${difficulty}
CANDIDATE'S ANSWER:
"""
${userAnswer}
"""

Evaluation process (follow STRICTLY):

STEP 1 — Identify key concepts: Mentally enumerate the 3-6 specific technical concepts, facts, or mechanisms that a complete, correct answer to THIS question must address. Do not output this list — use it internally.

STEP 2 — Map coverage: For each key concept, determine if the candidate's answer covers it correctly, partially, incorrectly, or not at all.

STEP 3 — Score calibration (be accurate, do NOT inflate):
  - 9-10 : All or nearly all key concepts covered correctly with clarity and appropriate depth.
  - 7-8  : Most key concepts covered; minor gaps or slight imprecision.
  - 5-6  : Some key concepts present, but notable gaps or inaccuracies that would concern a real interviewer.
  - 3-4  : Few concepts mentioned; significant gaps, vague statements, or misconceptions.
  - 1-2  : Mostly incorrect, off-topic, or extremely vague — a real interviewer would not pass this.
  - 0    : Blank, completely irrelevant, or nonsensical.

STEP 4 — Build output fields:
  - strengths      : List ONLY things the candidate explicitly demonstrated correctly. Quote or closely paraphrase their specific correct statements. If score ≤ 2, return [].
  - weaknesses     : List ONLY genuine technical errors or critical omissions that would concern an interviewer. If score ≥ 8, return [] or at most one very minor refinement point. Do NOT manufacture weaknesses for strong answers.
  - missingPoints  : Name the specific key concepts or important details that were absent from the answer. If score ≥ 9, return [].
  - technicalAccuracy : 1-2 sentences assessing the correctness of what was actually said — be specific to their words, not generic.
  - completeness   : 1-2 sentences on coverage relative to what is expected at ${difficulty} level.
  - suggestions    : Targeted, actionable advice tied directly to the missing points or errors. If score ≥ 9, describe what would elevate the answer to truly exemplary. Never repeat phrases from other fields.
  - idealAnswer    : Write a complete, high-quality model answer for this exact question at ${difficulty} level. Be technically precise, well-structured, and comprehensive (100-250 words). This is shown to the candidate for learning purposes.

Return a JSON object with EXACTLY these fields (no extra fields, no omissions):
{
  "score": <integer 0-10>,
  "technicalAccuracy": "<string>",
  "completeness": "<string>",
  "missingPoints": ["<string>", ...],
  "strengths": ["<string>", ...],
  "weaknesses": ["<string>", ...],
  "suggestions": "<string>",
  "idealAnswer": "<string>"
}

Critical output rules:
- Every sentence in every field must be specific to THIS question and THIS candidate's answer. No generic boilerplate.
- An empty array [] for strengths, weaknesses, or missingPoints is valid and preferred over forcing irrelevant items.
- Do NOT repeat information across fields.
- Return ONLY valid JSON. No markdown, no code fences, no commentary before or after the JSON.`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip any accidental markdown fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

    const evaluation = JSON.parse(text);
    console.log(`[AI Service] Successfully evaluated answer using Gemini API for question: "${question.substring(0, 50)}..."`);
    return evaluation;
  } catch (error) {
    console.warn(`[AI Service Warning] Gemini API failed for answer evaluation: ${error.message}. Using offline fallback.`);
    const wordsCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
    let score;
    if (wordsCount > 60) score = 7;
    else if (wordsCount > 40) score = 5;
    else if (wordsCount > 15) score = 3;
    else score = 1;

    return {
      score,
      technicalAccuracy: `AI evaluation is temporarily unavailable. A baseline score has been assigned based on response length for this ${difficulty}-level ${domain} question.`,
      completeness: wordsCount > 40
        ? 'The response is reasonably detailed, though AI-based concept analysis is unavailable right now.'
        : 'The response appears brief. A longer, structured answer is recommended for this difficulty level.',
      missingPoints: ['AI evaluation offline — specific missing concepts cannot be identified at this time.'],
      strengths: wordsCount > 15 ? ['A response was attempted, which shows engagement with the question.'] : [],
      weaknesses: wordsCount <= 15 ? ['The response is too brief to meaningfully assess technical depth.'] : [],
      suggestions: 'The AI evaluation service is temporarily offline. Please retry submission, or expand your answer to cover key concepts, definitions, trade-offs, and real-world examples relevant to the question.',
      idealAnswer: '',
    };
  }
};

/**
 * generateInterviewSummary
 * Synthesizes patterns across ALL answered questions, passing per-question
 * answers, strengths, weaknesses, and missing points so the model can
 * derive genuine themes rather than generic placeholders.
 */
export const generateInterviewSummary = async ({ domain, difficulty, questions, overallScore }) => {
  const answeredQuestions = questions.filter((q) => q.status === 'answered');

  // Build a rich context block for each answered question
  const qaSummary = answeredQuestions.map((q, i) => {
    const ev = q.evaluation ?? {};
    const score = ev.score ?? 0;
    const strengths = (ev.strengths ?? []).join('; ') || 'None noted';
    const weaknesses = (ev.weaknesses ?? []).join('; ') || 'None noted';
    const missing = (ev.missingPoints ?? []).join('; ') || 'None';
    const answerSnippet = (q.userAnswerText || '').substring(0, 300);
    return `--- Question ${i + 1} (Score: ${score}/10) ---
Question: ${q.questionText}
Candidate's Answer (excerpt): ${answerSnippet}${(q.userAnswerText || '').length > 300 ? '...' : ''}
Strengths demonstrated: ${strengths}
Weaknesses / Errors: ${weaknesses}
Missing concepts: ${missing}`;
  }).join('\n\n');

  const skippedCount = questions.filter((q) => q.status === 'skipped').length;
  const skippedNote = skippedCount > 0 ? `\nNote: ${skippedCount} question(s) were skipped and not evaluated.` : '';

  const prompt = `You are a professional career coach analyzing a completed mock technical interview. Your job is to synthesize patterns across all questions and deliver genuinely personalized, evidence-based feedback.

INTERVIEW OVERVIEW:
Domain: ${domain} | Difficulty: ${difficulty} | Overall Score: ${overallScore}%${skippedNote}

DETAILED PERFORMANCE PER QUESTION:
${qaSummary}

Your synthesis task:

1. STRONG AREAS (strongAreas array):
   - Identify 2-4 SPECIFIC technical themes or concepts the candidate demonstrated well ACROSS the session.
   - Ground each item in evidence from the question data above (e.g., "Correctly explained Java's garbage collection mechanism including generational collection" — not just "Java concepts").
   - If overall score is below 50%, keep this list short (1-2 items maximum).
   - Do NOT include generic phrases like "Good communication" or "Showed enthusiasm".

2. WEAK AREAS (weakAreas array):
   - Identify 2-4 SPECIFIC technical themes or concepts the candidate needs to improve, drawn from actual weaknesses and missing points above.
   - Be precise (e.g., "Incomplete understanding of SQL index internals and query execution plans" — not just "SQL").
   - If overall score is 80%+, this can be empty [] or contain only 1 very minor refinement area.
   - Do NOT list areas not evidenced in the data above.

3. LEARNING ROADMAP (learningRoadmap string):
   - Write 2-4 sentences of targeted, actionable study recommendations STRICTLY based on the identified weak areas.
   - Name specific topics, mechanisms, or sub-concepts to study (e.g., "Focus on the Java Memory Model's happens-before guarantee, volatile semantics, and the difference between synchronized methods and ReentrantLock").
   - If no weak areas exist, write a plan for reaching expert-level mastery in the identified strong areas.
   - Do NOT give generic advice like "practice more" or "read documentation".

Return a JSON object with EXACTLY these fields:
{
  "strongAreas": ["<specific theme 1>", "<specific theme 2>", ...],
  "weakAreas": ["<specific theme 1>", "<specific theme 2>", ...],
  "learningRoadmap": "<targeted 2-4 sentence paragraph>"
}

Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const summary = JSON.parse(text);
    console.log(`[AI Service] Successfully generated personalized summary using Gemini API for domain: ${domain}`);
    return summary;
  } catch (error) {
    console.warn(`[AI Service Warning] Gemini API failed for summary generation: ${error.message}. Using offline fallback.`);
    // Build a minimal but still question-aware fallback
    const answeredCount = answeredQuestions.length;
    const avgScore = answeredCount > 0
      ? Math.round(answeredQuestions.reduce((s, q) => s + (q.evaluation?.score ?? 0), 0) / answeredCount)
      : 0;
    const allMissing = answeredQuestions
      .flatMap((q) => q.evaluation?.missingPoints ?? [])
      .filter(Boolean)
      .slice(0, 3);
    const allStrengths = answeredQuestions
      .flatMap((q) => q.evaluation?.strengths ?? [])
      .filter(Boolean)
      .slice(0, 3);

    return {
      strongAreas: allStrengths.length > 0
        ? allStrengths
        : [`Demonstrated engagement with ${domain} ${difficulty}-level questions`],
      weakAreas: allMissing.length > 0
        ? allMissing
        : avgScore < 6 ? [`Deeper conceptual understanding of core ${domain} topics at ${difficulty} level`] : [],
      learningRoadmap: allMissing.length > 0
        ? `Review the following areas identified as gaps in this session: ${allMissing.join(', ')}. Use official documentation, structured tutorials, and hands-on coding exercises to solidify each concept.`
        : `Continue practicing ${domain} at ${difficulty} level. Focus on edge cases, real-world system design, and explaining concepts concisely under time pressure.`,
    };
  }
};

/**
 * generateResumeInterviewQuestion
 */
export const generateResumeInterviewQuestion = async ({ domain, difficulty, resumeText, previousQuestions = [] }) => {
  const previousList = previousQuestions.length > 0
    ? `\nDo NOT repeat any of these previously asked questions:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
    : '';

  const domainContext = domain === 'Resume-Based'
    ? `The question MUST relate directly to the projects, skills, technologies, experience, certifications, or internship details listed in the resume, matching the complexity of a ${difficulty} level software engineering interview.`
    : `The question MUST relate directly to the projects, skills, or experience listed in the resume, but center on the topic of ${domain} at ${difficulty} level.`;

  const prompt = `You are an experienced senior technical interviewer.
You are interviewing a candidate based on their resume.
Candidate's Resume Text (Extracted):
"""
${resumeText.slice(0, 4000)}
"""

Generate exactly ONE technical interview question for the following:
- Domain: ${domain}
- Difficulty: ${difficulty}
- ${domainContext}
${previousList}

Rules:
- Return ONLY the question text itself — no numbering, no explanation, no preamble.
- Keep it under 2 sentences.
- Do not include "Question:" prefix.`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log(`[AI Service] Successfully generated resume-based question using Gemini API for domain: ${domain}`);
    return text;
  } catch (error) {
    console.warn(`[AI Service Warning] Gemini API failed for resume question generation: ${error.message}. Using offline fallback.`);
    return getFallbackQuestion(domain, previousQuestions);
  }
};

const FALLBACK_DAILY_CHALLENGES = [
  {
    domain: 'Data Structures',
    question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 'O(log n)',
    explanation: 'A balanced BST halves the search space at each level, leading to O(log n) time complexity.'
  },
  {
    domain: 'Java',
    question: 'Which of the following is true about garbage collection in Java?',
    options: [
      'It guarantees that memory will never run out.',
      'It runs in the background and frees memory of unreachable objects.',
      'It can be forced to run at any time using System.gc().',
      'It automatically deletes file handles and DB links.'
    ],
    correctAnswer: 'It runs in the background and frees memory of unreachable objects.',
    explanation: 'The garbage collector reclaims memory occupied by objects that are no longer referenced. System.gc() is just a request.'
  },
  {
    domain: 'SQL',
    question: 'What does a clustered index do in a SQL database?',
    options: [
      'It stores data rows in a sorted order based on the key.',
      'It is automatically created on every foreign key.',
      'It allows multiple indexes on the same table with the same keys.',
      'It has no performance benefit over non-clustered indexes.'
    ],
    correctAnswer: 'It stores data rows in a sorted order based on the key.',
    explanation: 'A clustered index determines the physical order of data storage in a table, so there can be only one clustered index per table.'
  },
  {
    domain: 'React',
    question: 'In React, what is the main difference between useMemo and useCallback?',
    options: [
      'useMemo returns a memoized value, while useCallback returns a memoized function.',
      'useMemo runs synchronously, while useCallback runs asynchronously.',
      'useMemo is only for component optimization, while useCallback is for SSR.',
      'They are identical aliases of each other.'
    ],
    correctAnswer: 'useMemo returns a memoized value, while useCallback returns a memoized function.',
    explanation: 'useMemo caches a computed value; useCallback caches the function definition itself to prevent child re-renders.'
  },
  {
    domain: 'JavaScript',
    question: 'What will be the output of console.log(typeof null) in JavaScript?',
    options: ["'null'", "'undefined'", "'object'", "'string'"],
    correctAnswer: "'object'",
    explanation: 'This is a long-standing legacy bug/behavior in JavaScript since its initial release.'
  },
  {
    domain: 'Python',
    question: 'How do lists differ from tuples in Python?',
    options: [
      'Lists are immutable, while tuples are mutable.',
      'Lists are mutable, while tuples are immutable.',
      'Lists only hold homogeneous elements, while tuples hold heterogeneous elements.',
      'Lists use parentheses, while tuples use square brackets.'
    ],
    correctAnswer: 'Lists are mutable, while tuples are immutable.',
    explanation: 'Tuples cannot be changed after creation (immutable), whereas lists can be modified (mutable).'
  },
  {
    domain: 'Node.js',
    question: 'Which of the following describes the Event Loop in Node.js?',
    options: [
      'It runs on multiple threads to handle computational tasks.',
      'It is a single-threaded mechanism that handles asynchronous callbacks.',
      'It runs only during the initial server start.',
      'It executes synchronous operations in parallel.'
    ],
    correctAnswer: 'It is a single-threaded mechanism that handles asynchronous callbacks.',
    explanation: 'Node.js uses a single-threaded event loop to handle non-blocking asynchronous I/O operations, delegating blocking tasks to the thread pool.'
  }
];

export const generateDailyChallenge = async (challengeDate) => {
  const prompt = `You are a technical interviewer creating a daily challenge question for software engineers.
Generate exactly one multiple-choice question on a random programming, web dev, database, or computer science topic.
Return a JSON object with EXACTLY the following format:
{
  "domain": "<Java, Python, SQL, JavaScript, React, Node.js, Data Structures, or Web Development>",
  "question": "<The question text>",
  "options": [
    "<Option A>",
    "<Option B>",
    "<Option C>",
    "<Option D>"
  ],
  "correctAnswer": "<The exact text of the correct option as it appears in the options array>",
  "explanation": "<A short 1-2 sentence explanation of why this answer is correct>"
}
Ensure the options are plausible and exactly one is correct. Return ONLY valid JSON, no markdown code blocks, no trailing comments.`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    const challenge = JSON.parse(text);
    console.log(`[AI Service] Successfully generated Daily Challenge using Gemini API for date: ${challengeDate}`);
    return challenge;
  } catch (error) {
    console.warn(`[AI Service Warning] Gemini API failed for Daily Challenge generation: ${error.message}. Using offline fallback.`);
    let hash = 0;
    for (let i = 0; i < challengeDate.length; i++) {
      hash += challengeDate.charCodeAt(i);
    }
    const idx = hash % FALLBACK_DAILY_CHALLENGES.length;
    return FALLBACK_DAILY_CHALLENGES[idx];
  }
};


