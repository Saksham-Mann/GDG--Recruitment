// Current Date
import {
  ManageAccounts,
  Trophy,
  Campaign,
  ConnectWithoutContact,
  DesignServices,
  Palette,
  Language,
  Mobile2,
  SportsEsports,
  Analytics,
  Hub,
  Link,
  Cloud,
} from "@material-symbols-svg/react/outlined";

export const curDay = new Date().getDay();
export const curYear = new Date().getFullYear();
export const curDate = new Date().getDate();
export const curMonth = new Date().getMonth();
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Contact Links
export const LINKS = {
  instagram: "#",
  discord: "#",
  gmail: "#",
  linkedin: "#",
  x: "#",
};

// Department Details
export const reviews = [
  {
    id: "c21ca066-ab4d-40a3-943c-f170d6312bdc",
    icon: ManageAccounts,
    tone: "#8ab4f8",
    name: "Management",
    description: "The backbone of the organization, turning vision into reality by planning, executing, and improvising. Oversees events, operations, and growth, ensuring smooth functioning, success, and impactful experiences.",
  },
  {
    id: "4499a966-2740-4c36-88dd-8916a909fc77",
    icon: Campaign,
    tone: "#FF7A6B",
    name: "Publicity",
    description: "Drives online presence with creative campaigns, video editing, and storytelling, boosting engagement, promoting events, and showcasing the club to inspire participation and community growth.",
  },
  {
    id: "3936d5a2-acd9-4a98-ac97-42c2c92f5c02",
    icon: ConnectWithoutContact,
    tone: "#FFD45E",
    name: "Outreach",
    description: "Builds partnerships and expands outreach by connecting with communities, sponsors, and collaborators, ensuring diverse opportunities and impactful collaborations both within and beyond campus.",
  },
  {
    id: "e2ed9c2c-c36c-457f-a8bb-cf2e8bc7c2e1",
    icon: DesignServices,
    tone: "#FF7A6B",
    name: "UI/UX",
    description: "Designs visually appealing, user-friendly digital interfaces with a focus on accessibility, usability, and aesthetics, ensuring products provide enjoyable, intuitive, and meaningful user experiences.",
  },
  {
    id: "d3beefc1-f8b0-4202-b26c-36e9804b6636",
    icon: Palette,
    tone: "#FFD45E",
    name: "Design",
    description: "Creates stunning visuals, event posters, and branding materials that capture the organization's identity, ensuring every design communicates creativity, professionalism, and excitement to engage the community.",
  },
  {
    id: "8143de1d-db17-42fa-958d-13b10804f894",
    icon: Language,
    tone: "#8AB4F8",
    name: "Web Dev",
    description: "Designs, develops, and maintains responsive, high-performance websites for projects and events, using modern web technologies to enhance accessibility, user experience, and community engagement online.",
  },
  {
    id: "339f0f8a-72f2-44b9-92ab-2b0d4dcfa0f6",
    icon: Mobile2,
    tone: "#6EE7A0",
    name: "App Dev",
    description: "Builds intuitive, impactful mobile applications, improving accessibility, interaction, and convenience for members and event participants through functional, user-focused design.",
  },
  {
    id: "9055864f-c7dc-44cd-91d5-8759d32a496a",
    icon: SportsEsports,
    tone: "#FF7A6B",
    name: "Game Dev",
    description: "Combines creativity and technical skills to design engaging, entertaining games, giving members hands-on experience with real-world game development tools, engines, and production workflows.",
  },
  {
    id: "c0f3b1d1-ce05-45f6-9e34-ac9443fc5fcb",
    icon: Analytics,
    tone: "#8AB4F8",
    name: "Data Science",
    description: "Applies AI, machine learning, and analytics to transform data into actionable insights, helping solve problems, build predictive models, and inspire innovation across projects.",
  },
  {
    id: "a1d920df-9eb9-49eb-b3a4-e4a3d1245ede",
    icon: Cloud,
    tone: "#FFD45E",
    name: "Cloud & DevOps",
    description: "Explores cloud computing, infrastructure, and automation by building scalable applications, hosting hands-on workshops, and educating members about cloud platforms, containerization, CI/CD pipelines, and DevOps practices.",
  },
  {
    id: "6a89c4e2-7b19-4f32-821e-9821a41b5201",
    icon: Hub,
    tone: "#FF7A6B",
    name: "Blockchain",
    description: "Explores decentralized apps, smart contracts, and Web3 development, giving members hands-on experience with blockchain protocols and tools.",
  },
  {
    id: "3e9ac635-01d4-495e-aa87-a7335a2403c2",
    icon: Trophy,
    tone: "#6EE7A0",
    name: "Competitive Programming",
    description: "Promotes problem-solving skills through coding contests, hackathons, and peer learning, helping members sharpen algorithms, logic, and efficiency while preparing for real-world tech challenges.",
  },
];

// Questionnaire Data
export const QuestionnaireData = [
  {
    department: "App Dev",
    questions: [
      {
        name: "What mobile platforms or frameworks (Flutter, React Native, Native Android/iOS, Kotlin/Swift) have you worked with?",
        type: "generic",
        placeholder: "e.g. Flutter, React Native, Kotlin, Swift",
      },
      {
        name: "Describe a mobile app project you built or contributed to, including key features and your responsibilities.",
        type: "long-text",
        placeholder: "Describe the app architecture, state management, and challenges solved...",
      },
      {
        name: "Share links to your GitHub repositories or APK/App Store releases.",
        type: "short-text",
        placeholder: "https://github.com/username/project",
      },
      {
        name: "How do you handle mobile app state management, responsiveness, and offline support?",
        type: "long-text",
        placeholder: "Discuss caching, local storage, state stores (Bloc, Provider, Redux)...",
      },
    ],
  },
  {
    department: "Blockchain",
    questions: [
      {
        name: "What blockchain ecosystems, protocols, or developer tools (Solidity, Hardhat, Web3.js, Ethers.js) are you familiar with?",
        type: "generic",
        placeholder: "e.g. Ethereum, Solidity, Foundry, Hardhat, IPFS",
      },
      {
        name: "Describe a decentralized application (dApp) or smart contract project you have built or explored.",
        type: "long-text",
        placeholder: "Explain the project objective, smart contracts deployed, and user interactions...",
      },
      {
        name: "Share your GitHub profile or smart contract deployment links.",
        type: "short-text",
        placeholder: "https://github.com/username",
      },
      {
        name: "How do you approach smart contract security, gas optimization, and testing?",
        type: "long-text",
        placeholder: "Discuss re-entrancy prevention, audits, unit tests, and gas usage...",
      },
    ],
  },
  {
    department: "Cloud & DevOps",
    questions: [
      {
        name: "Share your GitHub, Docker Hub, or portfolio link showcasing your infrastructure or code projects.",
        type: "short-text",
        placeholder: "https://github.com/username",
      },
      {
        name: "What cloud platforms (GCP, AWS, Azure) and container tools (Docker, Kubernetes) have you worked with?",
        type: "generic",
        placeholder: "e.g. Google Cloud Platform, AWS, Docker, Kubernetes, Terraform",
      },
      {
        name: "Explain how you would configure a CI/CD pipeline for automated testing and deployment of a modern web application.",
        type: "long-text",
        placeholder: "Detail your approach to GitHub Actions, automated test suites, build caching, and production rollout...",
      },
      {
        name: "What experience do you have with Linux system administration, networking, or reverse proxies (Nginx, Caddy)?",
        type: "long-text",
        placeholder: "Describe server setup, SSL/TLS certs, port routing, and security practices...",
      },
    ],
  },
  {
    department: "Competitive Programming",
    questions: [
      {
        name: "Share your competitive programming handles (Codeforces, LeetCode, CodeChef, AtCoder).",
        type: "short-text",
        placeholder: "Codeforces: handle, LeetCode: handle",
      },
      {
        name: "What programming language do you primarily use for competitive programming (C++, Java, Python), and why?",
        type: "generic",
        placeholder: "e.g. C++ with STL for performance and memory control",
      },
      {
        name: "What algorithmic topics are you most confident in (e.g. Dynamic Programming, Graph Theory, Trees, Number Theory)?",
        type: "generic",
        placeholder: "List your strongest topics and techniques...",
      },
      {
        name: "Describe a challenging algorithmic problem you solved recently and your approach to finding the optimal solution.",
        type: "long-text",
        placeholder: "Explain the problem constraints, initial brute force, and optimal time/space complexity...",
      },
    ],
  },
  {
    department: "Data Science",
    questions: [
      {
        name: "What libraries and frameworks (Python, Pandas, NumPy, Scikit-learn, PyTorch, TensorFlow) do you regularly use?",
        type: "generic",
        placeholder: "e.g. Python, Pandas, Scikit-learn, PyTorch",
      },
      {
        name: "Describe an analytics, machine learning, or data engineering project you have developed.",
        type: "long-text",
        placeholder: "Detail the dataset, feature engineering, model architecture, and findings...",
      },
      {
        name: "How do you approach data cleaning, exploratory data analysis (EDA), and evaluating model performance?",
        type: "long-text",
        placeholder: "Discuss handling missing values, cross-validation, precision/recall, and metrics...",
      },
      {
        name: "Share links to your Kaggle, GitHub, or portfolio projects.",
        type: "short-text",
        placeholder: "https://github.com/username or Kaggle profile",
      },
    ],
  },
  {
    department: "Design",
    questions: [
      {
        name: "Share a link to your visual design portfolio (Behance, Dribbble, Figma, Google Drive, or personal site).",
        type: "short-text",
        placeholder: "https://behance.net/username or Figma link",
      },
      {
        name: "What design software and tools (Figma, Adobe Illustrator, Photoshop, Blender) do you specialize in?",
        type: "generic",
        placeholder: "e.g. Figma, Adobe Illustrator, Photoshop",
      },
      {
        name: "Walk us through your design process when creating a brand identity or event poster from scratch.",
        type: "long-text",
        placeholder: "Explain your moodboarding, typography selection, layout grid, and color choices...",
      },
      {
        name: "How do you incorporate feedback and iterate on visual assets under tight deadlines?",
        type: "long-text",
        placeholder: "Describe how you handle creative feedback, revisions, and brand alignment...",
      },
    ],
  },
  {
    department: "Game Dev",
    questions: [
      {
        name: "What game engines (Unity, Unreal Engine, Godot) and languages (C#, C++, GDScript) have you used?",
        type: "generic",
        placeholder: "e.g. Unity with C#, Godot with GDScript",
      },
      {
        name: "Describe a game project you developed or a game jam you participated in.",
        type: "long-text",
        placeholder: "Explain gameplay mechanics, game loop, physics, and creative direction...",
      },
      {
        name: "Share links to your gameplay videos, itch.io pages, or GitHub repositories.",
        type: "short-text",
        placeholder: "https://itch.io/username or GitHub repo",
      },
      {
        name: "How do you approach game physics, asset optimization, and responsive user controls?",
        type: "long-text",
        placeholder: "Discuss frame rate optimization, colliders, draw calls, and input mapping...",
      },
    ],
  },
  {
    department: "Management",
    questions: [
      {
        name: "Describe your previous experience in event management, student leadership, or project coordination.",
        type: "long-text",
        placeholder: "Detail past events organized, team sizes, and measurable outcomes...",
      },
      {
        name: "How would you handle a last-minute crisis during a flagship campus hackathon or workshop?",
        type: "long-text",
        placeholder: "Explain your crisis management approach, prioritization, and communication strategy...",
      },
      {
        name: "What tools and workflows do you use for scheduling, team communication, and task tracking?",
        type: "generic",
        placeholder: "e.g. Notion, Trello, Google Workspace, Slack",
      },
      {
        name: "Why do you want to contribute to operations and event execution at Google Developer Groups?",
        type: "long-text",
        placeholder: "Explain what excites you about building community events and mentoring peers...",
      },
    ],
  },
  {
    department: "Outreach",
    questions: [
      {
        name: "How would you pitch Google Developer Groups to potential corporate sponsors or industry speakers?",
        type: "long-text",
        placeholder: "Describe value propositions, student demographics, and partnership benefits...",
      },
      {
        name: "Describe an outreach, partnership, or community collaboration initiative you have organized or participated in.",
        type: "long-text",
        placeholder: "Explain how you established contact, negotiated terms, and maintained relations...",
      },
      {
        name: "Share your LinkedIn profile link or examples of previous professional correspondence.",
        type: "short-text",
        placeholder: "https://linkedin.com/in/username",
      },
      {
        name: "What strategies would you use to expand the club's network with student developer communities across other universities?",
        type: "long-text",
        placeholder: "Discuss cross-campus hackathons, community meetups, and ambassador initiatives...",
      },
    ],
  },
  {
    department: "Publicity",
    questions: [
      {
        name: "Share links to social media posts, reels, video edits, or promotional campaigns you have created.",
        type: "short-text",
        placeholder: "Drive link, Instagram handle, or YouTube portfolio",
      },
      {
        name: "Which content creation and editing tools (CapCut, Premiere Pro, After Effects, Canva) do you use?",
        type: "generic",
        placeholder: "e.g. Premiere Pro, After Effects, Photoshop, CapCut",
      },
      {
        name: "How would you plan a 7-day teaser campaign for a major GDG technical summit to maximize student turnout?",
        type: "long-text",
        placeholder: "Detail countdown posts, speaker reveals, interactive stories, and campus marketing...",
      },
      {
        name: "What social media trends and storytelling techniques do you follow to keep student engagement high?",
        type: "long-text",
        placeholder: "Explain your take on short-form video hooks, visual memes, and community spotlights...",
      },
    ],
  },
  {
    department: "UI/UX",
    questions: [
      {
        name: "Share your UI/UX portfolio link (Figma community file, Behance, Notion, or personal portfolio).",
        type: "short-text",
        placeholder: "https://figma.com/@username or Behance portfolio",
      },
      {
        name: "Describe a digital product or website you redesigned to improve user usability and accessibility.",
        type: "long-text",
        placeholder: "Walk through pain points identified, wireframes, user flow improvements, and results...",
      },
      {
        name: "How do you conduct user research and usability testing before finalizing your interface designs?",
        type: "long-text",
        placeholder: "Discuss user interviews, persona creation, interactive prototypes, and feedback loops...",
      },
      {
        name: "What is your process for maintaining design consistency with design systems and component libraries in Figma?",
        type: "long-text",
        placeholder: "Explain auto-layout, design tokens, typography scales, and component variants...",
      },
    ],
  },
  {
    department: "Web Dev",
    questions: [
      {
        name: "Share links to your GitHub profile and live deployed web projects (e.g. Vercel, Netlify, custom domain).",
        type: "short-text",
        placeholder: "https://github.com/username and deployed site link",
      },
      {
        name: "Why is \"it works on my machine\" a red flag in team development, and what concrete habits or setup choices do you use to ensure your code works on everyone else's environment too?",
        type: "long-text",
        placeholder: "Discuss version locking, environment variables, Docker, linters, and cross-browser testing...",
      },
      {
        name: "What web technologies and frameworks (Next.js, React, Node.js, Tailwind CSS, TypeScript) are you most proficient in?",
        type: "generic",
        placeholder: "e.g. Next.js App Router, TypeScript, Tailwind CSS, Node.js",
      },
      {
        name: "Describe a challenging bug or performance bottleneck you encountered in a web app and how you resolved it.",
        type: "long-text",
        placeholder: "Detail the debugging steps, profiling tools used, and final architecture fix...",
      },
    ],
  },
];

// Sample Admin Data
export const sampleAdminHeader = [
  {
    Header: "SrNo",
    accessor: "srno",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Department",
    accessor: "department",
  },
];

// Headers for CSV exports
export const CSV_Header = [
  {
    label: "Name",
    key: "Name",
  },
  {
    label: "Email",
    key: "Email",
  },
  {
    label: "Registration Number",
    key: "RegistrationNumber",
  },
  {
    label: "Phone",
    key: "Phone",
  },
  {
    label: "Department",
    key: "Department",
  },

  {
    label: "Preference",
    key: "Pref",
  },
  {
    label: "Shortlisted",
    key: "shortlisted",
  },
  {
    label: "Questions",
    key: "Questions",
  },
];

// Mailing Templates
export const mailingTemplate = {
  Interview:
    "<p>Edit content</p><br><p>Thank you for applying to Organization Name. We are excited to let you know that you have been shortlisted for joining the #dept Department!</p><p>We look forward to your active participation!</p>",
};

export const technicalCards = [
  {
    title: "Blockchain",
    description:
      "Explores decentralized apps, smart contracts, and Web3 development, giving members hands-on experience with blockchain protocols and tools.",
    color: "#FF7A6B",
    image: "/assets/images/icons/blockchain.svg",
    formLink: "/6a89c4e2-7b19-4f32-821e-9821a41b5201",
  },
  {
    title: "Cloud &\nDevOps",
    description:
      "Explores cloud computing, infrastructure, and automation by building scalable applications, hosting hands-on workshops, and educating members about cloud platforms, containerization, CI/CD pipelines, and DevOps practices.",
    color: "#FBBC04",
    image: "/assets/images/icons/cloud.svg",
    formLink: "/a1d920df-9eb9-49eb-b3a4-e4a3d1245ede", // Cloud & DevOps ID
  },
  {
    title: "Game Dev",
    description:
      "Combines creativity and technical skills to design engaging, entertaining games, giving members hands-on experience with real-world game development tools, engines, and production workflows.",
    color: "#4285F4",
    image: "/assets/images/icons/game-dev.svg",
    formLink: "/9055864f-c7dc-44cd-91d5-8759d32a496a", // App Development ID (placeholder)
  },
  {
    title: "App Dev",
    description:
      "Builds intuitive, impactful mobile applications, improving accessibility, interaction, and convenience for members and event participants through functional, user-focused design.",
    color: "#EA4335",
    image: "/assets/images/icons/app-dev.svg",
    formLink: "/339f0f8a-72f2-44b9-92ab-2b0d4dcfa0f6",
  },
  {
    title: "UI/UX",
    description:
      "Designs visually appealing, user-friendly digital interfaces with a focus on accessibility, usability, and aesthetics, ensuring products provide enjoyable, intuitive, and meaningful user experiences.",
    color: "#0F9D58",
    image: "/assets/images/icons/ui-ux.svg",
    formLink: "/e2ed9c2c-c36c-457f-a8bb-cf2e8bc7c2e1",
  },
  {
    title: "Data\nScience",
    description:
      "Applies AI, machine learning, and analytics to transform data into actionable insights, helping solve problems, build predictive models, and inspire innovation across projects.",
    color: "#EA4335",
    image: "/assets/images/icons/data-science.svg",
    formLink: "/c0f3b1d1-ce05-45f6-9e34-ac9443fc5fcb", // App Development ID (placeholder)
  },
  {
    title: "Competitive Programming",
    description:
      "Promotes problem-solving skills through coding contests, hackathons, and peer learning, helping members sharpen algorithms, logic, and efficiency while preparing for real-world tech challenges.",
    color: "#0F9D58",
    image: "/assets/images/icons/cp.svg",
    formLink: "/3e9ac635-01d4-495e-aa87-a7335a2403c2", // App Development ID (placeholder)
  },
  {
    title: "Web Dev",
    description:
      "Designs, develops, and maintains responsive, high-performance websites for projects and events, using modern web technologies to enhance accessibility, user experience, and community engagement online.",
    color: "#FBBC04",
    image: "/assets/images/icons/web-dev.svg",
    formLink: "/8143de1d-db17-42fa-958d-13b10804f894",
  },
  {
    title: "Open\nSource",
    description:
      "Encourages members to contribute to open-source projects, building collaboration skills, real-world coding experience, and a culture of transparency, learning, and global tech impact.",
    color: "#4285F4",
    image: "/assets/images/icons/open-source.svg",
    formLink: "/ae7db51a-c6db-4f8d-9159-40767c5354cb", // App Development ID (placeholder)
  },
];

export const nonTechnicalCards = [
  {
    title: "Design",
    description:
      "Creates stunning visuals, event posters, and branding materials that capture the organization's identity, ensuring every design communicates creativity, professionalism, and excitement to engage the community.",
    color: "#329A4E",
    image: "/assets/images/icons/design.svg",
    formLink: "/d3beefc1-f8b0-4202-b26c-36e9804b6636",
  },
  {
    title: "Outreach",
    description:
      "Builds partnerships and expands outreach by connecting with communities, sponsors, and collaborators, ensuring diverse opportunities and impactful collaborations both within and beyond campus.",
    color: "#4285F4",
    image: "/assets/images/icons/outreach.svg",
    formLink: "/3936d5a2-acd9-4a98-ac97-42c2c92f5c02", // App Development ID (placeholder)
  },
  {
    title: "Publicity",
    description:
      "Drives online presence with creative campaigns, video editing, and storytelling, boosting engagement, promoting events, and showcasing the club to inspire participation and community growth.",
    color: "#EA4335",
    image: "/assets/images/icons/social-media.svg",
    formLink: "/4499a966-2740-4c36-88dd-8916a909fc77", // App Development ID (placeholder)
  },
  {
    title: "Management",
    description:
      "The backbone of the organization, turning vision into reality by planning, executing, and improvising. Oversees events, operations, and growth, ensuring smooth functioning, success, and impactful experiences.",
    color: "#FBBC04",
    image: "/assets/images/icons/management.svg",
    formLink: "/c21ca066-ab4d-40a3-943c-f170d6312bdc", // App Development ID (placeholder)
  },
];
