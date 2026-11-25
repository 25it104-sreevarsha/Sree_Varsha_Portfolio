export interface DefaultPortfolioSeed {
  profile: {
    fullName: string;
    headline: string;
    shortIntro: string;
    academicStatus: string;
    location: string;
    photoUrl: string;
    photoFrameStyle: string;
    resumeUrl: string;
    email: string;
    githubUrl: string;
    githubUsername: string;
    linkedinUrl: string;
    availabilityText: string;
    isAvailable: boolean;
  };
  education: Array<{
    institutionName: string;
    degree: string;
    department: string;
    duration: string;
    currentSemester: string;
    cgpa: string;
    class10Marks: string;
    class12Marks: string;
    highlights: string[];
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  skills: Array<{
    name: string;
    category: string;
    iconName: string;
    contextTag: string;
    description: string;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  experiences: Array<{
    organizationName: string;
    organizationLogo: string;
    role: string;
    domain: string;
    startDate: string;
    endDate: string;
    description: string;
    responsibilities: string[];
    technologies: string[];
    outcomes: string[];
    verificationUrl: string;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  projects: Array<{
    name: string;
    thumbnailUrl: string;
    shortDescription: string;
    problemStatement: string;
    proposedSolution: string;
    techStack: string[];
    keyFeatures: string[];
    category: string;
    status: "Completed" | "Prototype" | "In Progress";
    githubUrl: string;
    liveDemoUrl: string;
    docsUrl: string;
    screenshots: string[];
    developmentDate: string;
    featured: boolean;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  certifications: Array<{
    title: string;
    issuingOrganization: string;
    completionDate: string;
    certificateImageUrl: string;
    verificationUrl: string;
    category: string;
    description: string;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  achievements: Array<{
    title: string;
    organization: string;
    date: string;
    category: string;
    description: string;
    proofUrl: string;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  publications: Array<{
    title: string;
    domain: string;
    venue: string;
    coAuthors: string[];
    abstract: string;
    status: string;
    publicationDate: string;
    paperUrl: string;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  beyondAcademics: Array<{
    title: string;
    roleOrCategory: string;
    organization: string;
    duration: string;
    description: string;
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
  currentFocus: Array<{
    title: string;
    focusType: string;
    statusTag: string;
    description: string;
    tags: string[];
    isPlaceholder: boolean;
    sortOrder: number;
  }>;
}

export const DEFAULT_PORTFOLIO_DATA: DefaultPortfolioSeed = {
  "profile": {
    "fullName": "Sree Varsha M",
    "headline": "Curious mind. Practical ideas. Real impact.",
    "shortIntro": "I’m an IT student who enjoys making technology useful, understandable and accessible. My interests span software development, AI/ML, IoT and cybersecurity. I like exploring real-world challenges, breaking them into manageable problems and building prototypes that help me learn by doing. This portfolio is a living record of that journey — the work, the experiments, the lessons and the next ideas.",
    "academicStatus": "B.Tech Information Technology Student",
    "location": "India",
    "photoUrl": "/images/passport-placeholder.svg",
    "photoFrameStyle": "rounded-editorial",
    "resumeUrl": "/api/resume",
    "email": "",
    "githubUrl": "https://github.com/25it104-sreevarsha",
    "githubUsername": "25it104-sreevarsha",
    "linkedinUrl": "",
    "availabilityText": "Open to learning and meaningful collaborations",
    "isAvailable": true
  },
  "education": [
    {
      "institutionName": "R.M.K. Engineering College",
      "degree": "Bachelor of Technology (B.Tech)",
      "department": "Information Technology",
      "duration": "2024 – Present",
      "currentSemester": "Current student",
      "cgpa": "Add current CGPA",
      "class10Marks": "",
      "class12Marks": "",
      "highlights": [
        "Information Technology undergraduate building practical skills through projects and technical learning.",
        "Interests include software development, AI/ML, IoT and cybersecurity."
      ],
      "isPlaceholder": false,
      "sortOrder": 1
    }
  ],
  "skills": [
    {
      "name": "C",
      "category": "Programming Languages",
      "iconName": "Code2",
      "contextTag": "Programming",
      "description": "Programming fundamentals and problem solving.",
      "isPlaceholder": false,
      "sortOrder": 1
    },
    {
      "name": "C++",
      "category": "Programming Languages",
      "iconName": "Code2",
      "contextTag": "Programming",
      "description": "Object-oriented programming and problem solving.",
      "isPlaceholder": false,
      "sortOrder": 2
    },
    {
      "name": "Python",
      "category": "Programming Languages",
      "iconName": "Terminal",
      "contextTag": "Programming",
      "description": "Scripting and introductory data and AI workflows.",
      "isPlaceholder": false,
      "sortOrder": 3
    },
    {
      "name": "JavaScript",
      "category": "Programming Languages",
      "iconName": "Code2",
      "contextTag": "Web",
      "description": "Core language for interactive web experiences.",
      "isPlaceholder": false,
      "sortOrder": 4
    },
    {
      "name": "HTML",
      "category": "Frontend Development",
      "iconName": "Code2",
      "contextTag": "Web",
      "description": "Structuring web pages and interfaces.",
      "isPlaceholder": false,
      "sortOrder": 5
    },
    {
      "name": "CSS",
      "category": "Frontend Development",
      "iconName": "Layout",
      "contextTag": "Web",
      "description": "Styling responsive web interfaces.",
      "isPlaceholder": false,
      "sortOrder": 6
    },
    {
      "name": "React",
      "category": "Frontend Development",
      "iconName": "Code2",
      "contextTag": "Web",
      "description": "Building component-based user interfaces.",
      "isPlaceholder": false,
      "sortOrder": 7
    },
    {
      "name": "Machine Learning",
      "category": "AI and Machine Learning",
      "iconName": "BrainCircuit",
      "contextTag": "AI / Data",
      "description": "Exploring machine learning concepts and practical applications.",
      "isPlaceholder": false,
      "sortOrder": 8
    },
    {
      "name": "Data Science",
      "category": "AI and Machine Learning",
      "iconName": "Database",
      "contextTag": "AI / Data",
      "description": "Working with data-oriented concepts and analysis.",
      "isPlaceholder": false,
      "sortOrder": 9
    },
    {
      "name": "IoT",
      "category": "IoT and Embedded Systems",
      "iconName": "Radio",
      "contextTag": "Connected Systems",
      "description": "Exploring connected devices, sensors and automation.",
      "isPlaceholder": false,
      "sortOrder": 10
    },
    {
      "name": "Cybersecurity",
      "category": "Cybersecurity",
      "iconName": "ShieldCheck",
      "contextTag": "Security",
      "description": "Learning security concepts and building security-focused projects.",
      "isPlaceholder": false,
      "sortOrder": 11
    },
    {
      "name": "Databases",
      "category": "Databases",
      "iconName": "Database",
      "contextTag": "Systems",
      "description": "Working with structured data and database fundamentals.",
      "isPlaceholder": false,
      "sortOrder": 12
    }
  ],
  "experiences": [],
  "projects": [
    {
      "name": "Jeny — AI Interviewer",
      "thumbnailUrl": "/images/project-placeholder.svg",
      "shortDescription": "An AI interview-practice concept exploring role-aware questions, candidate interaction and structured feedback.",
      "problemStatement": "Students and early-career candidates need a practical way to prepare for interviews and understand how they communicate their skills.",
      "proposedSolution": "A web-based interview experience concept with a candidate flow, role-aware question planning and structured feedback. The current project status and implemented capabilities should be updated as the prototype develops.",
      "techStack": [
        "AI",
        "Web Development",
        "UX"
      ],
      "keyFeatures": [
        "Interview-practice experience concept",
        "Role-aware question planning",
        "Candidate interaction and feedback flow"
      ],
      "category": "AI / Interview Experience",
      "status": "Prototype",
      "githubUrl": "",
      "liveDemoUrl": "",
      "docsUrl": "",
      "screenshots": [],
      "developmentDate": "2026",
      "featured": true,
      "isPlaceholder": false,
      "sortOrder": 1
    },
    {
      "name": "Smart Irrigation System",
      "thumbnailUrl": "/images/project-placeholder.svg",
      "shortDescription": "An IoT project focused on making irrigation more informed through connected hardware and sensor-based monitoring.",
      "problemStatement": "Watering plants without considering soil conditions can waste water and make irrigation less efficient.",
      "proposedSolution": "A student IoT project direction using a microcontroller and sensors to support soil-aware irrigation. Add the final circuit, components, implementation details and measured results after testing.",
      "techStack": [
        "IoT",
        "ESP32 / Arduino",
        "Sensors"
      ],
      "keyFeatures": [
        "Sensor-based soil monitoring direction",
        "Microcontroller-based automation concept",
        "Designed around practical, low-cost irrigation needs"
      ],
      "category": "Agriculture / IoT",
      "status": "In Progress",
      "githubUrl": "",
      "liveDemoUrl": "",
      "docsUrl": "",
      "screenshots": [],
      "developmentDate": "2026",
      "featured": true,
      "isPlaceholder": false,
      "sortOrder": 2
    },
    {
      "name": "Voice-cloning Impersonation Detection",
      "thumbnailUrl": "/images/project-placeholder.svg",
      "shortDescription": "A security-focused concept addressing the risk of AI-generated voice impersonation, especially in trusted-caller scenarios.",
      "problemStatement": "Cloned voices can be used to impersonate trusted people and pressure recipients into acting on fraudulent calls.",
      "proposedSolution": "A proposed real-time detection and prevention approach for voice-cloning impersonation attacks. The project is presented as a concept under development; validated architecture, datasets and prototype results can be added when available.",
      "techStack": [
        "AI / ML",
        "Cybersecurity"
      ],
      "keyFeatures": [
        "Focus on voice-cloning impersonation threats",
        "Designed for trusted-person and high-risk caller scenarios",
        "Research and prototype direction for real-time detection"
      ],
      "category": "Security / Audio AI",
      "status": "In Progress",
      "githubUrl": "",
      "liveDemoUrl": "",
      "docsUrl": "",
      "screenshots": [],
      "developmentDate": "2026",
      "featured": true,
      "isPlaceholder": false,
      "sortOrder": 3
    },
    {
      "name": "CoachTime",
      "thumbnailUrl": "/images/project-placeholder.svg",
      "shortDescription": "A commute-planning prototype connecting train timing with the time a student needs to reach coaching.",
      "problemStatement": "Students commuting by train need to understand when to leave and whether delays could affect their arrival at coaching.",
      "proposedSolution": "A train-to-coaching commute experience concept that presents route timing, delay context and expected arrival information in a clear student-focused interface.",
      "techStack": [
        "Product Design",
        "Mobile UX"
      ],
      "keyFeatures": [
        "Train-to-coaching commute planning",
        "Delay-aware arrival context",
        "Student-focused journey interface"
      ],
      "category": "Transport / Product Design",
      "status": "Prototype",
      "githubUrl": "",
      "liveDemoUrl": "",
      "docsUrl": "",
      "screenshots": [],
      "developmentDate": "2026",
      "featured": true,
      "isPlaceholder": false,
      "sortOrder": 4
    }
  ],
  "certifications": [],
  "achievements": [],
  "publications": [],
  "beyondAcademics": [],
  "currentFocus": [
    {
      "title": "Software Development",
      "focusType": "Currently Exploring",
      "statusTag": "Active",
      "description": "Building practical web and software projects while strengthening programming fundamentals.",
      "tags": [
        "C",
        "C++",
        "Python",
        "JavaScript",
        "React"
      ],
      "isPlaceholder": false,
      "sortOrder": 1
    },
    {
      "title": "AI & Machine Learning",
      "focusType": "Currently Exploring",
      "statusTag": "Active",
      "description": "Exploring how AI and machine learning can be applied to useful, real-world problems.",
      "tags": [
        "AI",
        "Machine Learning",
        "Data Science"
      ],
      "isPlaceholder": false,
      "sortOrder": 2
    },
    {
      "title": "IoT & Cybersecurity",
      "focusType": "Project Interests",
      "statusTag": "Active",
      "description": "Learning through connected-system and security-focused project ideas.",
      "tags": [
        "IoT",
        "Sensors",
        "Cybersecurity"
      ],
      "isPlaceholder": false,
      "sortOrder": 3
    }
  ]
};
