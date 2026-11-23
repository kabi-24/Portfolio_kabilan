export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  domain: string;
  period: string;
  metrics: { value: string; label: string }[];
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  stack: string;
  summary: string;
  metrics: { value: string; label: string }[];
  githubUrl: string;
  previewType: 'bag-counter' | 'answer-eval';
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface SocialProfile {
  id: 'linkedin' | 'github' | 'twitter' | 'email';
  platform: string;
  handle: string;
  description: string;
  url: string;
  external: boolean;
}

export const PROFILE = {
  name: 'Kabilan A',
  title: 'AI & Robotics Engineer',
  headline: 'I build computer vision and robotics systems that run on real warehouse floors.',
  cyclingPhrases: [
    'YOLOv8 object detection',
    'AMR path planning',
    'NLP answer grading',
    'real-time vision pipelines',
  ],
  portraitUrl: '/src/assets/images/kabilan_portrait.jpg',
  university: 'Annamalai University',
  degree: 'B.E. Computer Science and Engineering (AI & ML)',
  graduation: '2023 – 2027',
  cgpa: '8.12',
  bioPrimary:
    'Final-year B.E. Computer Science and Engineering (AI & ML) student at Annamalai University (CGPA 8.12).',
  bioSecondary:
    'Hands-on with computer vision, NLP, and industrial autonomous systems. I ship end-to-end AI pipelines engineered for high precision and low latency across live factory and academic deployments.',
  location: 'Tamil Nadu, India',
  availability: 'Open to AI/ML, Computer Vision & Robotics Engineering roles',
  email: 'kabilanaranganathan24@gmail.com',
  education: [
    {
      credential: 'B.E. Computer Science and Engineering (AI & ML)',
      institution: 'Annamalai University',
      period: '2023 – 2027',
      detail: 'CGPA 8.12',
    },
    {
      credential: 'Higher Secondary Certificate',
      institution: 'Sriram Matriculation Higher Secondary School',
      period: '2023',
      detail: 'Science & Mathematics',
    },
  ],
  extras:
    'College-level winner in Volleyball, Long Jump, and Relay. Fluent in English and Tamil.',
};

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'nlc-ml',
    role: 'Machine Learning Intern',
    company: 'NLC Private Limited',
    domain: 'Warehouse Automation',
    period: 'Jun 2026',
    metrics: [
      { value: '92%+', label: 'Tracking accuracy' },
      { value: '40%', label: 'Less inspection time' },
    ],
    highlights: [
      'Built an automated bag counting system with YOLOv8 and OpenCV that holds precision under changing industrial lighting.',
      'Fine-tuned bounding box detection and confidence thresholds on high-density conveyor datasets.',
      'Integrated real-time visual counting streams directly into live warehouse floor operations.',
    ],
  },
  {
    id: 'robonetics-amr',
    role: 'Autonomous Robotics Intern',
    company: 'Robonetics Automation Power Solutions LLP',
    domain: 'Industrial Robotics',
    period: 'Jun 2025 – Dec 2025',
    metrics: [
      { value: '98%+', label: 'Navigation reliability' },
      { value: '30%', label: 'Fewer collision errors' },
    ],
    highlights: [
      'Configured Autonomous Mobile Robot (AMR) navigation stacks with ROS-based path planning and dynamic obstacle avoidance.',
      'Fused 2D LiDAR and ultrasonic sensor streams, cutting collision errors across crowded field trials.',
      'Tuned local planner control loops and inflation parameters for predictable real-world reliability.',
    ],
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'smart-bag-counter',
    title: 'Automatic Warehouse Bag Counting System',
    stack: 'Python · YOLOv8 · OpenCV · PyTorch',
    summary:
      'Real-time conveyor counting pipeline powered by YOLOv8 and virtual line-crossing hysteresis. Live tally updates and threshold alerts stream to an operator dashboard.',
    metrics: [
      { value: '30+ FPS', label: 'Inference speed' },
      { value: '< 2%', label: 'Frame drop rate' },
      { value: '92%+', label: 'Tracking accuracy' },
    ],
    githubUrl: 'https://github.com/kabi-24/KABI-AI-Smart-Bag-Counter_advanced',
    previewType: 'bag-counter',
  },
  {
    id: 'answer-sheet-eval',
    title: 'Automated Answer Sheet Evaluation',
    stack: 'Python · NLP · TF-IDF · Cosine Similarity · Streamlit · Flask',
    summary:
      'Automated descriptive script grading engine combining morphological stemming, domain stopword curation, TF-IDF vectorization, and calibrated cosine similarity scoring.',
    metrics: [
      { value: '88%', label: 'Expert score agreement' },
      { value: '50 / min', label: 'Evaluation throughput' },
      { value: '60%', label: 'Grading workload saved' },
    ],
    githubUrl: 'https://github.com/kabi-24/AI-based-Automated-answer-sheet-evaluation',
    previewType: 'answer-eval',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Languages & AI / ML',
    items: ['Python', 'Java', 'C++', 'NLP', 'Cosine Similarity', 'TF-IDF', 'scikit-learn'],
  },
  {
    category: 'Computer Vision & Robotics',
    items: ['YOLOv8', 'OpenCV', 'PyTorch', 'AMR Navigation', 'ROS', 'LiDAR Fusion', 'Path Planning'],
  },
  {
    category: 'Web, APIs & Data',
    items: ['Flask', 'Streamlit', 'React', 'REST APIs', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Git'],
  },
];

export const SOCIAL_PROFILES: SocialProfile[] = [
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    handle: 'in/kabilan-aranganathan-ak',
    description: 'Experience timeline, internship milestones, and professional network updates.',
    url: 'https://linkedin.com/in/kabilan-aranganathan-ak',
    external: true,
  },
  {
    id: 'github',
    platform: 'GitHub',
    handle: 'github.com/kabi-24',
    description: 'Open-source YOLOv8 vision pipelines, NLP grading tools, and robotics code.',
    url: 'https://github.com/kabi-24',
    external: true,
  },
  {
    id: 'twitter',
    platform: 'X (Twitter)',
    handle: '@kabilan_ak',
    description: 'Field notes on edge inference, ROS navigation trials, and AI engineering.',
    url: 'https://x.com/kabilan_ak',
    external: true,
  },
  {
    id: 'email',
    platform: 'Email',
    handle: 'kabilanaranganathan24@gmail.com',
    description: 'Direct inbox for engineering roles, research collaborations, and consulting.',
    url: 'mailto:kabilanaranganathan24@gmail.com',
    external: false,
  },
];

export const EVAL_SAMPLES = {
  modelKey:
    'Overfitting occurs when a model learns the training data too closely, including noise, so it performs poorly on unseen data. It can be reduced with regularization, cross validation, more data and early stopping.',
  answers: [
    {
      label: 'Strong',
      text: 'Overfitting happens when a model memorizes training data and noise, so it performs poorly on new unseen data. Regularization, cross validation and more training data help prevent it.',
    },
    {
      label: 'Partial',
      text: 'Overfitting is when a model does badly on new data. It is a problem in machine learning.',
    },
    {
      label: 'Off-topic',
      text: 'A neural network has many layers and neurons connected by weights.',
    },
  ],
};
