// src/nlp/textPreprocessor.ts
var STOPWORDS = /* @__PURE__ */ new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "also",
  "used",
  "using",
  "worked",
  "working",
  "including",
  "various",
  "etc",
  "eg",
  "well",
  "good",
  "year",
  "years"
]);
var STOP_WORDS = STOPWORDS;
var COMPOUND_PRESERVE = {
  "c++": "cplusplus",
  "c#": "csharp",
  "node.js": "nodejs",
  "vue.js": "vuejs",
  "react.js": "reactjs",
  "next.js": "nextjs",
  "staad.pro": "staadpro",
  "is 456": "is456",
  "is 1893": "is1893",
  "ci/cd": "cicd",
  "rest api": "restapi",
  "restful api": "restapi",
  "rest apis": "restapi",
  "machine learning": "machinelearning",
  "deep learning": "deeplearning",
  "data science": "datascience",
  "apache spark": "apachespark",
  "embedded c": "embeddedc",
  "arm cortex": "armcortex",
  "verilog hdl": "veriloghdl",
  "solid works": "solidworks"
};
function normalizeText(text) {
  if (!text) return "";
  let lower = text.toLowerCase();
  for (const [key, replacement] of Object.entries(COMPOUND_PRESERVE)) {
    lower = lower.split(key).join(replacement);
  }
  lower = lower.replace(/https?:\/\/\S+/g, " ");
  lower = lower.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, " ");
  lower = lower.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, " ");
  lower = lower.replace(/[^a-z0-9\s_-]/g, " ");
  return lower.replace(/\s+/g, " ").trim();
}
function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((token) => token.length >= 2);
}
function removeStopwords(tokens) {
  return tokens.filter((t) => !STOPWORDS.has(t));
}
function stemToken(token) {
  if (token.length <= 4) return token;
  if (["react", "node", "flask", "spark", "kicad", "ansys", "etabs"].includes(token)) {
    return token;
  }
  if (token.endsWith("ational")) return token.slice(0, -5) + "e";
  if (token.endsWith("ization")) return token.slice(0, -5) + "e";
  if (token.endsWith("tional")) return token.slice(0, -4);
  if (token.endsWith("ative")) return token.slice(0, -5);
  if (token.endsWith("ently")) return token.slice(0, -4);
  if (token.endsWith("ency")) return token.slice(0, -4) + "ent";
  if (token.endsWith("ence")) return token.slice(0, -4) + "ent";
  if (token.endsWith("ment")) return token.slice(0, -4);
  if (token.endsWith("ness")) return token.slice(0, -4);
  if (token.endsWith("able")) return token.slice(0, -4);
  if (token.endsWith("ible")) return token.slice(0, -4);
  if (token.endsWith("ing") && token.length > 5) return token.slice(0, -3);
  if (token.endsWith("ies") && token.length > 5) return token.slice(0, -3) + "y";
  if (token.endsWith("ed") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) return token.slice(0, -1);
  return token;
}
function extractNgrams(tokens, n = 2) {
  if (tokens.length < n) return [];
  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}
function getTermFrequencyMap(tokens) {
  const map = {};
  for (const token of tokens) {
    const stemmed = stemToken(token);
    map[stemmed] = (map[stemmed] || 0) + 1;
  }
  return map;
}
function preprocessDocument(rawText) {
  const normalized = normalizeText(rawText);
  const rawTokens = tokenize(rawText);
  const filteredTokens = removeStopwords(rawTokens);
  const stemmedTokens = filteredTokens.map(stemToken);
  const bigrams = extractNgrams(filteredTokens, 2);
  const trigrams = extractNgrams(filteredTokens, 3);
  const termFreqs = getTermFrequencyMap(filteredTokens);
  return {
    raw: rawText,
    normalized,
    rawTokens,
    filteredTokens,
    stemmedTokens,
    bigrams,
    trigrams,
    termFreqs
  };
}

// src/nlp/resumeSkillExtractor.ts
var CANONICAL_SKILL_TAXONOMY = [
  // ==========================================
  // COMPUTER SCIENCE & ENGINEERING
  // ==========================================
  {
    skill: "Python",
    topic: "Programming Languages",
    subtopic: "Python Core & Concurrency",
    department: "Computer Science & Engineering",
    aliases: ["python", "py", "python3", "cpython"]
  },
  {
    skill: "Flask",
    topic: "Backend Web & API Architecture",
    subtopic: "Microframeworks & Routing",
    department: "Computer Science & Engineering",
    aliases: ["flask", "flask framework", "flask api", "flask-restful"]
  },
  {
    skill: "REST APIs",
    topic: "Backend Web & API Architecture",
    subtopic: "RESTful Protocols & Web Services",
    department: "Computer Science & Engineering",
    aliases: ["rest api", "rest apis", "restful", "restful api", "rest", "api design"]
  },
  {
    skill: "MySQL",
    topic: "Database Systems",
    subtopic: "Relational SQL & Indexing",
    department: "Computer Science & Engineering",
    aliases: ["mysql", "sql", "rdbms", "mariadb"]
  },
  {
    skill: "PostgreSQL",
    topic: "Database Systems",
    subtopic: "Advanced Relational Modeling",
    department: "Computer Science & Engineering",
    aliases: ["postgres", "postgresql", "psql"]
  },
  {
    skill: "React",
    topic: "Frontend & Web Engineering",
    subtopic: "Component Architecture & State",
    department: "Computer Science & Engineering",
    aliases: ["react", "react.js", "reactjs", "react native"]
  },
  {
    skill: "Node.js",
    topic: "Backend Web & API Architecture",
    subtopic: "Asynchronous Event Loop",
    department: "Computer Science & Engineering",
    aliases: ["node", "node.js", "nodejs", "express", "express.js"]
  },
  {
    skill: "Data Structures",
    topic: "Core Computer Science",
    subtopic: "Trees, Graphs & Hash Tables",
    department: "Computer Science & Engineering",
    aliases: ["data structures", "dsa", "algorithms", "trees", "graphs", "hashmaps"]
  },
  {
    skill: "Docker",
    topic: "DevOps & Cloud Systems",
    subtopic: "Containerization & Isolation",
    department: "Computer Science & Engineering",
    aliases: ["docker", "containers", "dockerfile", "docker compose"]
  },
  {
    skill: "Git",
    topic: "Software Engineering Practices",
    subtopic: "Version Control & Branching",
    department: "Computer Science & Engineering",
    aliases: ["git", "github", "gitlab", "version control"]
  },
  {
    skill: "System Design",
    topic: "Distributed Systems",
    subtopic: "Scalability & Load Balancing",
    department: "Computer Science & Engineering",
    aliases: ["system design", "distributed systems", "microservices", "caching"]
  },
  {
    skill: "Java",
    topic: "Programming Languages",
    subtopic: "OOP & JVM Ecosystem",
    department: "Computer Science & Engineering",
    aliases: ["java", "spring", "spring boot", "jvm"]
  },
  {
    skill: "C++",
    topic: "Programming Languages",
    subtopic: "Memory Management & STL",
    department: "Computer Science & Engineering",
    aliases: ["c++", "cpp", "cplusplus", "stl"]
  },
  {
    skill: "JavaScript",
    topic: "Programming Languages",
    subtopic: "Core JavaScript & Asynchronous Event Loop",
    department: "Computer Science & Engineering",
    aliases: ["javascript", "js", "es6", "ecmascript"]
  },
  {
    skill: "TypeScript",
    topic: "Programming Languages",
    subtopic: "Static Typing & Interfaces",
    department: "Computer Science & Engineering",
    aliases: ["typescript", "ts"]
  },
  {
    skill: "C",
    topic: "Programming Languages",
    subtopic: "Pointers & System Programming",
    department: "Computer Science & Engineering",
    aliases: ["c language", "ansi c", "c programming"]
  },
  {
    skill: "C#",
    topic: "Programming Languages",
    subtopic: ".NET & Enterprise Applications",
    department: "Computer Science & Engineering",
    aliases: ["c#", "csharp", ".net", "dotnet"]
  },
  {
    skill: "PHP",
    topic: "Programming Languages",
    subtopic: "Server-Side Web Scripting",
    department: "Computer Science & Engineering",
    aliases: ["php", "php8", "lamp"]
  },
  {
    skill: "Kotlin",
    topic: "Programming Languages",
    subtopic: "Modern JVM & Android Development",
    department: "Computer Science & Engineering",
    aliases: ["kotlin", "android kotlin"]
  },
  {
    skill: "SQL",
    topic: "Database Systems",
    subtopic: "Query Formulation & Joins",
    department: "Computer Science & Engineering",
    aliases: ["sql", "structured query language", "rdbms", "relational database"]
  },
  {
    skill: "SQLite",
    topic: "Database Systems",
    subtopic: "Embedded & File-based Relational Storage",
    department: "Computer Science & Engineering",
    aliases: ["sqlite", "sqlite3"]
  },
  {
    skill: "MongoDB",
    topic: "Database Systems",
    subtopic: "Document NoSQL & Aggregations",
    department: "Computer Science & Engineering",
    aliases: ["mongodb", "mongo", "nosql", "mongoose"]
  },
  {
    skill: "Supabase",
    topic: "Database Systems",
    subtopic: "Postgres Backend-as-a-Service",
    department: "Computer Science & Engineering",
    aliases: ["supabase", "supabase auth", "supabase db"]
  },
  {
    skill: "Oracle",
    topic: "Database Systems",
    subtopic: "Enterprise RDBMS & PL/SQL",
    department: "Computer Science & Engineering",
    aliases: ["oracle", "oracle sql", "pl/sql", "plsql"]
  },
  {
    skill: "Express",
    topic: "Backend Web & API Architecture",
    subtopic: "Middleware & Node Routing",
    department: "Computer Science & Engineering",
    aliases: ["express", "express.js", "expressjs"]
  },
  {
    skill: "Django",
    topic: "Backend Web & API Architecture",
    subtopic: "Full-Stack MVC & ORM",
    department: "Computer Science & Engineering",
    aliases: ["django", "django rest framework", "drf"]
  },
  {
    skill: "Spring Boot",
    topic: "Backend Web & API Architecture",
    subtopic: "Dependency Injection & Microservices",
    department: "Computer Science & Engineering",
    aliases: ["spring boot", "spring", "springboot"]
  },
  {
    skill: "TensorFlow",
    topic: "Machine Learning & AI",
    subtopic: "Deep Learning & Neural Tensors",
    department: "Computer Science & Engineering",
    aliases: ["tensorflow", "tf", "keras"]
  },
  {
    skill: "Scikit-learn",
    topic: "Machine Learning & AI",
    subtopic: "Supervised & Unsupervised Modeling",
    department: "Computer Science & Engineering",
    aliases: ["scikit-learn", "sklearn"]
  },
  {
    skill: "NumPy",
    topic: "Scientific Computing",
    subtopic: "Vectorized Arrays & Matrix Math",
    department: "Computer Science & Engineering",
    aliases: ["numpy"]
  },
  {
    skill: "Pandas",
    topic: "Data Analysis & Manipulation",
    subtopic: "DataFrames & Series Cleaning",
    department: "Computer Science & Engineering",
    aliases: ["pandas", "dataframe"]
  },
  {
    skill: "GitHub",
    topic: "Software Engineering Practices",
    subtopic: "Collaboration & Pull Requests",
    department: "Computer Science & Engineering",
    aliases: ["github", "github actions"]
  },
  {
    skill: "VS Code",
    topic: "Development Tools & Platforms",
    subtopic: "IDE, Extensions & Debugging",
    department: "Computer Science & Engineering",
    aliases: ["vs code", "vscode", "visual studio code"]
  },
  {
    skill: "Postman",
    topic: "Development Tools & Platforms",
    subtopic: "API Testing & Documentation",
    department: "Computer Science & Engineering",
    aliases: ["postman", "api testing"]
  },
  {
    skill: "AWS",
    topic: "DevOps & Cloud Systems",
    subtopic: "Cloud Infrastructure & Serverless",
    department: "Computer Science & Engineering",
    aliases: ["aws", "amazon web services", "s3", "ec2", "lambda"]
  },
  // ==========================================
  // MECHANICAL ENGINEERING
  // ==========================================
  {
    skill: "AutoCAD Mechanical",
    topic: "Engineering Drafting & Modeling",
    subtopic: "2D/3D Geometric Modeling",
    department: "Mechanical Engineering",
    aliases: ["autocad", "autocad mechanical", "cad drafting", "engineering drawing"]
  },
  {
    skill: "SolidWorks",
    topic: "Parametric CAD & Machine Design",
    subtopic: "Part Modeling & Assemblies",
    department: "Mechanical Engineering",
    aliases: ["solidworks", "solid works", "cswp", "part modeling", "assembly design"]
  },
  {
    skill: "ANSYS FEA",
    topic: "Finite Element Analysis",
    subtopic: "Structural Stress & Meshing",
    department: "Mechanical Engineering",
    aliases: ["ansys", "fea", "finite element analysis", "ansys mechanical", "mesh convergence"]
  },
  {
    skill: "Thermodynamics",
    topic: "Thermal & Energy Systems",
    subtopic: "Thermodynamic Cycles & Efficiency",
    department: "Mechanical Engineering",
    aliases: ["thermodynamics", "thermal engineering", "otto cycle", "diesel cycle", "brayton"]
  },
  {
    skill: "Heat Transfer",
    topic: "Thermal & Energy Systems",
    subtopic: "Conduction, Convection & Exchangers",
    department: "Mechanical Engineering",
    aliases: ["heat transfer", "heat exchanger", "conduction", "convection", "radiation", "lmtd"]
  },
  {
    skill: "Fluid Mechanics",
    topic: "Fluid Systems & Hydraulics",
    subtopic: "Piping Losses & Turbomachinery",
    department: "Mechanical Engineering",
    aliases: ["fluid mechanics", "hydraulics", "pneumatics", "pumps", "pressure drop", "bernoulli"]
  },
  {
    skill: "GD&T",
    topic: "Manufacturing & Tolerancing",
    subtopic: "Geometric Dimensioning & Limits",
    department: "Mechanical Engineering",
    aliases: ["gd&t", "gdt", "tolerancing", "concentricity", "runout", "limits and fits"]
  },
  {
    skill: "CNC Machining",
    topic: "Manufacturing Processes",
    subtopic: "Toolpath Planning & G-Codes",
    department: "Mechanical Engineering",
    aliases: ["cnc", "cnc machining", "machining", "lathe", "milling", "g-code"]
  },
  {
    skill: "CATIA",
    topic: "Surface Modeling & Aerospace CAD",
    subtopic: "Surfacing & Sheet Metal",
    department: "Mechanical Engineering",
    aliases: ["catia", "catia v5", "surfacing"]
  },
  // ==========================================
  // CIVIL ENGINEERING
  // ==========================================
  {
    skill: "AutoCAD Civil",
    topic: "Civil Drafting & Floor Plans",
    subtopic: "Architectural & Structural Drafting",
    department: "Civil Engineering",
    aliases: ["autocad civil", "autocad", "civil drafting", "building drawing"]
  },
  {
    skill: "ETABS",
    topic: "Structural Analysis & Design",
    subtopic: "Multi-Story Frame & Seismic Analysis",
    department: "Civil Engineering",
    aliases: ["etabs", "etabs v20", "frame analysis", "seismic analysis", "lateral load"]
  },
  {
    skill: "STAAD.Pro",
    topic: "Structural Analysis & Design",
    subtopic: "Truss & Space Frame Analysis",
    department: "Civil Engineering",
    aliases: ["staad", "staad.pro", "staad pro", "staadpro", "space frame"]
  },
  {
    skill: "Concrete Design",
    topic: "Reinforced Concrete Design",
    subtopic: "Limit State Method & IS 456",
    department: "Civil Engineering",
    aliases: ["concrete design", "reinforced concrete", "rcc", "is 456", "limit state", "working stress"]
  },
  {
    skill: "Soil Mechanics",
    topic: "Geotechnical Engineering",
    subtopic: "Bearing Capacity & Foundation Sizing",
    department: "Civil Engineering",
    aliases: ["soil mechanics", "geotechnical", "bearing capacity", "foundation", "shallow foundation"]
  },
  {
    skill: "Surveying",
    topic: "Geomatics & Site Surveying",
    subtopic: "Total Station & Leveling",
    department: "Civil Engineering",
    aliases: ["surveying", "total station", "theodolite", "leveling", "traverse"]
  },
  {
    skill: "REVIT Structure",
    topic: "Building Information Modeling (BIM)",
    subtopic: "Structural BIM & Rebar Detailing",
    department: "Civil Engineering",
    aliases: ["revit", "revit structure", "bim", "building information modeling"]
  },
  {
    skill: "Project Scheduling",
    topic: "Construction Management",
    subtopic: "CPM, PERT & Site Supervision",
    department: "Civil Engineering",
    aliases: ["ms project", "primavera", "cpm", "pert", "project scheduling", "costing"]
  },
  // ==========================================
  // ELECTRONICS & COMMUNICATION ENGINEERING
  // ==========================================
  {
    skill: "Verilog HDL",
    topic: "Digital System Design & VLSI",
    subtopic: "RTL Modeling & FSM Synthesis",
    department: "Electronics & Communication Engineering",
    aliases: ["verilog", "verilog hdl", "vhdl", "fpga", "rtl", "xilinx", "vivado"]
  },
  {
    skill: "Embedded C",
    topic: "Embedded Systems & Firmware",
    subtopic: "Bare-Metal & Register Configuration",
    department: "Electronics & Communication Engineering",
    aliases: ["embedded c", "embedded systems", "bare metal", "firmware", "c"]
  },
  {
    skill: "ARM Cortex",
    topic: "Microcontrollers & Architecture",
    subtopic: "ARM Cortex-M & Interrupt Handling",
    department: "Electronics & Communication Engineering",
    aliases: ["arm", "arm cortex", "cortex-m", "stm32", "microcontroller", "mcu"]
  },
  {
    skill: "KiCAD",
    topic: "PCB Design & Hardware Layout",
    subtopic: "Schematic Capture & Trace Routing",
    department: "Electronics & Communication Engineering",
    aliases: ["kicad", "pcb", "pcb layout", "altium", "eagle", "schematic"]
  },
  {
    skill: "Communication Protocols",
    topic: "Bus & IoT Protocols",
    subtopic: "I2C, SPI & UART Timing",
    department: "Electronics & Communication Engineering",
    aliases: ["i2c", "spi", "uart", "can bus", "lora", "ble", "iot protocols"]
  },
  {
    skill: "Digital Signal Processing",
    topic: "Signal Processing & Systems",
    subtopic: "Sampling, FFT & Filter Design",
    department: "Electronics & Communication Engineering",
    aliases: ["dsp", "digital signal processing", "fft", "fir", "iir", "filters", "matlab"]
  },
  {
    skill: "VLSI Design",
    topic: "Semiconductor & VLSI",
    subtopic: "CMOS Inverters & Setup/Hold Timing",
    department: "Electronics & Communication Engineering",
    aliases: ["vlsi", "cmos", "setup time", "hold time", "timing closure", "asic"]
  },
  // ==========================================
  // INFORMATION TECHNOLOGY
  // ==========================================
  {
    skill: "Computer Networks",
    topic: "Networking & Protocols",
    subtopic: "TCP/IP, OSI Model & Routing",
    department: "Information Technology",
    aliases: ["computer networks", "networking", "tcp/ip", "dns", "dhcp", "subnetting", "http/https"]
  },
  {
    skill: "Cloud Architecture",
    topic: "Cloud Computing & Infrastructure",
    subtopic: "AWS, Azure & Virtualization",
    department: "Information Technology",
    aliases: ["cloud", "aws", "azure", "gcp", "cloud computing", "s3", "ec2", "lambda"]
  },
  {
    skill: "Cybersecurity",
    topic: "Information & Network Security",
    subtopic: "Cryptography, Firewalls & OWASP",
    department: "Information Technology",
    aliases: ["cybersecurity", "security", "cryptography", "owasp", "penetration testing", "firewall"]
  },
  {
    skill: "Linux Administration",
    topic: "Operating Systems & Shell",
    subtopic: "Bash Scripting & Process Management",
    department: "Information Technology",
    aliases: ["linux", "unix", "bash", "shell scripting", "ubuntu", "sysadmin"]
  },
  {
    skill: "DevOps CI/CD",
    topic: "DevOps & Automation",
    subtopic: "Pipelines, Jenkins & GitHub Actions",
    department: "Information Technology",
    aliases: ["devops", "ci/cd", "jenkins", "github actions", "kubernetes", "terraform"]
  },
  // ==========================================
  // ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // ==========================================
  {
    skill: "Electrical Machines",
    topic: "Electric Machines & Drives",
    subtopic: "Transformers, Induction Motors & Alternators",
    department: "Electrical & Electronics Engineering",
    aliases: ["electrical machines", "transformers", "induction motor", "synchronous motor", "dc motor"]
  },
  {
    skill: "Power Systems",
    topic: "Power Generation & Transmission",
    subtopic: "Load Flow, Fault Analysis & Grid Stability",
    department: "Electrical & Electronics Engineering",
    aliases: ["power systems", "load flow", "fault analysis", "transmission lines", "substation", "grid"]
  },
  {
    skill: "Power Electronics",
    topic: "Converters & Inverters",
    subtopic: "Buck-Boost, Rectifiers & IGBT Switching",
    department: "Electrical & Electronics Engineering",
    aliases: ["power electronics", "inverter", "converter", "rectifier", "igbt", "mosfet", "chopper"]
  },
  {
    skill: "Control Systems",
    topic: "Linear Feedback & Stability",
    subtopic: "Bode Plots, PID Controllers & Root Locus",
    department: "Electrical & Electronics Engineering",
    aliases: ["control systems", "pid", "bode plot", "nyquist", "root locus", "transfer function"]
  },
  {
    skill: "MATLAB Simulink",
    topic: "System Modeling & Simulation",
    subtopic: "Electrical Simulation & State-Space",
    department: "Electrical & Electronics Engineering",
    aliases: ["matlab", "simulink", "system modeling", "state space"]
  },
  // ==========================================
  // AUTOMOBILE ENGINEERING
  // ==========================================
  {
    skill: "IC Engines",
    topic: "Internal Combustion Engines",
    subtopic: "4-Stroke Cycles, Valve Timing & Combustion",
    department: "Automobile Engineering",
    aliases: ["ic engine", "internal combustion", "4-stroke", "crankshaft", "piston", "combustion chamber"]
  },
  {
    skill: "Transmission Systems",
    topic: "Automotive Drivetrain",
    subtopic: "Gearbox, Differential & Clutches",
    department: "Automobile Engineering",
    aliases: ["transmission", "gearbox", "differential", "clutch", "torque converter", "cvt"]
  },
  {
    skill: "Braking & ABS",
    topic: "Chassis & Active Safety",
    subtopic: "Hydraulic Disc/Drum & Anti-Lock Braking",
    department: "Automobile Engineering",
    aliases: ["braking", "abs", "disc brake", "anti-lock braking", "master cylinder", "hydraulic brake"]
  },
  {
    skill: "Vehicle Dynamics",
    topic: "Suspension, Steering & Handling",
    subtopic: "Suspension Geometry, Steering & Stability",
    department: "Automobile Engineering",
    aliases: ["vehicle dynamics", "suspension", "steering", "camber", "caster", "aerodynamics"]
  },
  {
    skill: "EV Powertrain",
    topic: "Electric Vehicles & Energy Storage",
    subtopic: "Battery Management (BMS), Traction Motors & Inverters",
    department: "Automobile Engineering",
    aliases: ["electric vehicle", "ev", "bms", "battery management", "traction motor", "regenerative braking"]
  },
  // ==========================================
  // DATA SCIENCE & MACHINE LEARNING
  // ==========================================
  {
    skill: "Machine Learning",
    topic: "Statistical & Predictive Modeling",
    subtopic: "Supervised Algorithms & Regularization",
    department: "Data Science & Machine Learning Engineering",
    aliases: ["machine learning", "ml", "scikit-learn", "xgboost", "random forest"]
  },
  {
    skill: "Deep Learning",
    topic: "Neural Networks & Architectures",
    subtopic: "PyTorch, Backpropagation & Transformers",
    department: "Data Science & Machine Learning Engineering",
    aliases: ["deep learning", "pytorch", "tensorflow", "neural networks", "transformers"]
  },
  {
    skill: "Apache Spark",
    topic: "Big Data & Distributed Computing",
    subtopic: "PySpark & Distributed Shuffles",
    department: "Data Science & Machine Learning Engineering",
    aliases: ["spark", "apache spark", "pyspark", "big data", "hadoop"]
  },
  {
    skill: "MLOps",
    topic: "Production Machine Learning",
    subtopic: "Model Serving & Drift Detection",
    department: "Data Science & Machine Learning Engineering",
    aliases: ["mlops", "mlflow", "model deployment", "data drift", "evidently"]
  }
];
function normalizeDepartment(deptStr) {
  if (!deptStr) return "Computer Science & Engineering";
  const lower = deptStr.toLowerCase();
  if (lower.includes("auto") || lower.includes("vehicle") || lower.includes("motor")) {
    return "Automobile Engineering";
  }
  if (lower.includes("electrical") || lower.includes("eee") || lower.includes("power system")) {
    return "Electrical & Electronics Engineering";
  }
  if (lower.includes("civil") || lower.includes("structural")) {
    return "Civil Engineering";
  }
  if (lower.includes("mechanical") || lower.includes("thermal") || lower.includes("cad") || lower.includes("manufacturing")) {
    return "Mechanical Engineering";
  }
  if (lower.includes("electronic") || lower.includes("communication") || lower.includes("ece") || lower.includes("embedded") || lower.includes("vlsi")) {
    return "Electronics & Communication Engineering";
  }
  if (lower.includes("information technology") || lower.includes("it ") || lower.endsWith("it") || lower.includes("information science")) {
    return "Information Technology";
  }
  if (lower.includes("data science") || lower.includes("machine learning") || lower.includes("analytics") || lower.includes("ai")) {
    return "Data Science & Machine Learning Engineering";
  }
  return "Computer Science & Engineering";
}
function extractResumeNLP(resume, profileDepartment, targetDepartment) {
  const textCorpusParts = [];
  if (resume) {
    if (resume.summary) textCorpusParts.push(resume.summary);
    if (resume.extractedText) textCorpusParts.push(resume.extractedText);
    if (resume.rawSkillsList) textCorpusParts.push(resume.rawSkillsList.join(" "));
    resume.projects?.forEach((p) => {
      textCorpusParts.push(`${p.title} ${p.description} ${(p.technologies || []).join(" ")}`);
    });
    resume.experience?.forEach((e) => {
      textCorpusParts.push(`${e.role} ${e.company} ${e.description}`);
    });
  }
  const combinedRawText = textCorpusParts.join("\n");
  const preprocessed = preprocessDocument(combinedRawText);
  const normalizedCorpus = preprocessed.normalized;
  const detectedDept = resume?.department ? normalizeDepartment(resume.department) : "Computer Science & Engineering";
  const userProfileDept = profileDepartment ? normalizeDepartment(profileDepartment) : void 0;
  let effectiveDepartment;
  let departmentDeterminerNote = "";
  if (targetDepartment) {
    effectiveDepartment = targetDepartment;
    if (resume?.department && normalizeDepartment(resume.department) !== targetDepartment) {
      departmentDeterminerNote = `Target interview department explicitly set to ${targetDepartment}. Resume skills from ${detectedDept} are being cross-correlated where applicable.`;
    } else {
      departmentDeterminerNote = `Technical questions configured for ${targetDepartment} based on your selected target department.`;
    }
  } else if (resume?.department) {
    effectiveDepartment = detectedDept;
    if (userProfileDept && userProfileDept !== detectedDept) {
      departmentDeterminerNote = `Questions are determined by your Extracted Resume Department (${detectedDept}), which reflects the skills in your uploaded document, while your account profile department is registered as (${userProfileDept}).`;
    } else {
      departmentDeterminerNote = `Questions are strictly tailored to your Extracted Resume Department (${detectedDept}).`;
    }
  } else if (userProfileDept) {
    effectiveDepartment = userProfileDept;
    departmentDeterminerNote = `No resume document uploaded yet. Questions are guided by your Account Profile Department (${userProfileDept}).`;
  } else {
    effectiveDepartment = "Computer Science & Engineering";
    departmentDeterminerNote = `General Engineering questions selected for ${effectiveDepartment}.`;
  }
  const UNIVERSAL_SKILL_NAMES = /* @__PURE__ */ new Set([
    "Python",
    "Java",
    "C",
    "C++",
    "JavaScript",
    "TypeScript",
    "PHP",
    "C#",
    "Kotlin",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "SQLite",
    "MongoDB",
    "Supabase",
    "Oracle",
    "React",
    "Node.js",
    "Express",
    "Flask",
    "Django",
    "Spring Boot",
    "TensorFlow",
    "Scikit-learn",
    "NumPy",
    "Pandas",
    "Git",
    "GitHub",
    "VS Code",
    "Postman",
    "Docker",
    "Linux Administration",
    "AWS",
    "REST APIs",
    "Data Structures"
  ]);
  const foundSkillsSet = /* @__PURE__ */ new Set();
  const skillTopicMap = [];
  if (resume?.rawSkillsList) {
    for (const raw of resume.rawSkillsList) {
      const normRaw = normalizeText(raw);
      for (const item of CANONICAL_SKILL_TAXONOMY) {
        if (item.aliases.some((alias) => normRaw === alias || normRaw.includes(alias) || alias.includes(normRaw))) {
          foundSkillsSet.add(item.skill);
          if (!skillTopicMap.some((m) => m.skill === item.skill)) {
            skillTopicMap.push({ skill: item.skill, topic: item.topic, subtopic: item.subtopic });
          }
        }
      }
    }
  }
  for (const item of CANONICAL_SKILL_TAXONOMY) {
    const isUniversal = UNIVERSAL_SKILL_NAMES.has(item.skill);
    const isDeptRelevant = item.department === effectiveDepartment || item.department === detectedDept;
    if (isUniversal || isDeptRelevant) {
      for (const alias of item.aliases) {
        const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
        if (regex.test(normalizedCorpus)) {
          foundSkillsSet.add(item.skill);
          if (!skillTopicMap.some((m) => m.skill === item.skill)) {
            skillTopicMap.push({ skill: item.skill, topic: item.topic, subtopic: item.subtopic });
          }
          break;
        }
      }
    }
  }
  const addDynamicSkill = (rawSkill, defaultTopic = "Practical Engineering Skill", defaultSubtopic = "Resume Competency") => {
    if (!rawSkill || typeof rawSkill !== "string") return;
    const trimmed = rawSkill.trim();
    if (trimmed.length < 2) return;
    const exists = Array.from(foundSkillsSet).some((s) => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      foundSkillsSet.add(trimmed);
      if (!skillTopicMap.some((m) => m.skill.toLowerCase() === trimmed.toLowerCase())) {
        skillTopicMap.push({
          skill: trimmed,
          topic: defaultTopic,
          subtopic: defaultSubtopic
        });
      }
    }
  };
  if (Array.isArray(resume?.skills)) {
    resume.skills.forEach((cat) => {
      if (typeof cat === "string") {
        addDynamicSkill(cat);
      } else if (Array.isArray(cat?.skills)) {
        cat.skills.forEach((s) => addDynamicSkill(s, cat.category));
      }
    });
  }
  if (Array.isArray(resume?.rawSkillsList)) {
    resume.rawSkillsList.forEach((s) => addDynamicSkill(s));
  }
  resume?.projects?.forEach((p) => {
    if (Array.isArray(p.technologies)) {
      p.technologies.forEach((t) => addDynamicSkill(t, "Project Technologies", "Project Implementation"));
    }
  });
  const PROG_LANG_REGEX = /^(python|java|c\+\+|cpp|c#|csharp|c\b|javascript|js|typescript|ts|php|kotlin|swift|go|golang|rust|ruby|scala|r\b|perl|dart|embedded c|verilog|vhdl)/i;
  const DB_REGEX = /(sql|mysql|postgresql|postgres|psql|sqlite|mongodb|mongo|nosql|redis|cassandra|oracle|mariadb|supabase|dynamodb|neo4j|couchdb)/i;
  const FRAMEWORK_REGEX = /(react|node|express|flask|django|spring|vue|angular|next\.js|nuxt|fastapi|laravel|asp\.net|tensorflow|pytorch|keras|scikit|pandas|numpy|opencv|bootstrap|tailwind|redux)/i;
  const AIML_REGEX = /(machine learning|deep learning|artificial intelligence|ai\/ml|nlp|natural language|computer vision|llm|generative ai|neural network|reinforcement learning|scikit-learn|tensorflow|pytorch|transformers|hugging face|bert|gpt|random forest|xgboost|cnn|rnn|lstm)/i;
  const ENG_TOOL_REGEX = /(pcb|kicad|altium|solidworks|autocad|catia|ansys|matlab|simulink|creo|staad|etabs|revit|proteus|labview|cnc|plc|scada|can bus|keil|modelsim|quartus)/i;
  const TOOL_REGEX = /(git|github|gitlab|docker|kubernetes|postman|vs code|vscode|linux|aws|azure|gcp|jira|jenkins|ci\/cd|webpack|vite|bash|shell|powershell)/i;
  const programmingLanguages = [];
  const databases = [];
  const frameworksAndLibraries = [];
  const toolsAndPlatforms = [];
  const aiAndMlTechnologies = [];
  const engineeringTools = [];
  for (const sk of foundSkillsSet) {
    let matchedAny = false;
    if (PROG_LANG_REGEX.test(sk)) {
      programmingLanguages.push(sk);
      matchedAny = true;
    }
    if (DB_REGEX.test(sk)) {
      databases.push(sk);
      matchedAny = true;
    }
    if (AIML_REGEX.test(sk)) {
      aiAndMlTechnologies.push(sk);
      matchedAny = true;
    }
    if (FRAMEWORK_REGEX.test(sk)) {
      frameworksAndLibraries.push(sk);
      matchedAny = true;
    }
    if (ENG_TOOL_REGEX.test(sk)) {
      engineeringTools.push(sk);
      matchedAny = true;
    }
    if (TOOL_REGEX.test(sk) || !matchedAny) {
      toolsAndPlatforms.push(sk);
    }
  }
  const projectTech = [];
  const projectTitles = [];
  const projectsList = [];
  resume?.projects?.forEach((p) => {
    projectTitles.push(p.title);
    const techs = Array.isArray(p.technologies) ? p.technologies : [];
    techs.forEach((t) => projectTech.push(t));
    projectsList.push({
      title: p.title,
      description: p.description || "",
      technologies: techs
    });
  });
  const experienceRoles = [];
  const internshipsList = [];
  const rawExpList = resume?.experience || [];
  rawExpList.forEach((e) => {
    if (e.role) experienceRoles.push(e.role);
    const isIntern = e.isInternship || e.role && /intern|trainee|apprentice|fellow/i.test(e.role);
    if (isIntern) {
      internshipsList.push({
        company: e.company || "Host Organization",
        role: e.role || "Intern",
        duration: e.duration,
        description: e.description || ""
      });
    }
  });
  if (resume?.internships && resume.internships.length > 0) {
    resume.internships.forEach((intern) => {
      if (!internshipsList.some((i) => i.company === intern.company && i.role === intern.role)) {
        internshipsList.push({
          company: intern.company || "Host Organization",
          role: intern.role || "Intern",
          duration: intern.duration,
          description: intern.description || ""
        });
      }
    });
  }
  const certificationsList = [];
  resume?.certifications?.forEach((c) => {
    certificationsList.push({
      name: c.name,
      issuer: c.issuer,
      topic: c.name
    });
  });
  return {
    normalizedText: normalizedCorpus,
    extractedSkills: Array.from(foundSkillsSet),
    skillTopicMap,
    projectTechnologies: projectTech,
    projectTitles,
    projectsList,
    internshipsList,
    certificationsList,
    experienceRoles,
    programmingLanguages,
    databases,
    frameworksAndLibraries,
    toolsAndPlatforms,
    aiAndMlTechnologies,
    engineeringTools,
    detectedDepartment: detectedDept,
    profileDepartment: userProfileDept,
    effectiveDepartment,
    departmentDeterminerNote,
    topNgrams: preprocessed.bigrams.slice(0, 15),
    termFrequencies: preprocessed.termFreqs
  };
}

// src/nlp/questionDataset.ts
var TECHNICAL_QUESTION_DATASET = [
  // =========================================================================
  // 1. COMPUTER SCIENCE & ENGINEERING (CSE)
  // =========================================================================
  {
    id: "cs_coding_twosum_01",
    department: "Computer Science & Engineering",
    subject: "Data Structures & Algorithms",
    topic: "Core Computer Science",
    subtopic: "Hash Maps & Array Manipulation",
    skill: "Data Structures",
    difficulty: "Beginner",
    questionType: "coding",
    question: "Implement the Two Sum algorithm: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target in O(n) time complexity.",
    keywords: ["data structures", "algorithms", "two sum", "hashmap", "dictionary", "array", "complexity", "indices"],
    followUpTemplates: [
      "How does your hash map solution prevent duplicate index usage when nums contains duplicate values (e.g. [3, 3] target 6)?",
      "What are the memory trade-offs between this one-pass hash map approach and a two-pointer approach on a sorted array?"
    ],
    idealAnswerPoints: [
      "Maintain an auxiliary hash map (value -> index) while iterating through nums",
      "For each element x at index i, compute complement = target - x",
      "If complement exists in the map, return [map.get(complement), i]",
      "Time complexity is O(n) single pass; Space complexity is O(n) auxiliary map"
    ],
    explanation: "Fundamental algorithmic problem testing array lookup optimization and hash table usage.",
    codingProblem: {
      title: "Two Sum Problem",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.",
      defaultLanguage: "javascript",
      starterCodes: {
        javascript: `function twoSum(nums, target) {
  // TODO: Return indices [i, j] in O(n) time
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def two_sum(nums, target):
    # TODO: Return indices in O(n) time using dictionary
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        cpp: `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
        java: `import java.util.HashMap;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
      },
      testCases: [
        {
          id: "tc1",
          input: "[2, 7, 11, 15], 9",
          expectedOutput: "[0,1]",
          explanation: "nums[0] + nums[1] == 2 + 7 == 9"
        },
        {
          id: "tc2",
          input: "[3, 2, 4], 6",
          expectedOutput: "[1,2]",
          explanation: "nums[1] + nums[2] == 2 + 4 == 6"
        }
      ],
      expectedTimeComplexity: "O(n)",
      expectedSpaceComplexity: "O(n)",
      hints: [
        "Can we use a hash map to look up if the required difference (target - current) has already been seen in O(1) time?",
        "Populate the map as you iterate through the list so you do not use the same index twice."
      ]
    }
  },
  {
    id: "cs_coding_valid_parens_02",
    department: "Computer Science & Engineering",
    subject: "Data Structures & Algorithms",
    topic: "Core Computer Science",
    subtopic: "Stack Data Structures & String Parsing",
    skill: "Data Structures",
    difficulty: "Intermediate",
    questionType: "coding",
    question: 'Write a function to determine if an input string containing characters "(", ")", "{", "}", "[" and "]" is valid. Brackets must close in the correct order and match open brackets.',
    keywords: ["data structures", "algorithms", "stack", "parentheses", "validation", "lifo", "parsing"],
    followUpTemplates: [
      "How does your stack implementation handle edge cases such as strings starting with closing brackets or having odd lengths?",
      "If the string is 100MB in size and streamed via network, how would you optimize memory usage?"
    ],
    idealAnswerPoints: [
      "Use a Last-In-First-Out (LIFO) stack to store expected closing characters or open characters",
      "Early return false if string length is odd",
      "Push matching bracket when encountering opening bracket; pop and compare upon closing bracket",
      "Valid only if stack is completely empty at the end"
    ],
    explanation: "Classic stack evaluation verifying understanding of recursive grammar parsing and LIFO semantics.",
    codingProblem: {
      title: "Valid Parentheses Parser",
      description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nOpen brackets must be closed by the same type of brackets and in the correct order.",
      defaultLanguage: "javascript",
      starterCodes: {
        javascript: `function isValid(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
        python: `def is_valid(s: str) -> bool:
    if len(s) % 2 != 0:
        return False
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0`,
        cpp: `#include <string>
#include <stack>
#include <unordered_map>

bool isValid(std::string s) {
    if (s.length() % 2 != 0) return false;
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}`,
        java: `import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        if (s.length() % 2 != 0) return false;
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
      },
      testCases: [
        {
          id: "tc1",
          input: '"()[]{}"',
          expectedOutput: "true",
          explanation: "All brackets match in correct order"
        },
        {
          id: "tc2",
          input: '"(]"',
          expectedOutput: "false",
          explanation: "Round bracket cannot be closed by square bracket"
        }
      ],
      expectedTimeComplexity: "O(n)",
      expectedSpaceComplexity: "O(n)",
      hints: [
        "A Last-In-First-Out (Stack) structure matches the innermost closed bracket first.",
        "If the stack is non-empty at the end of the string, unclosed brackets remain."
      ]
    }
  },
  {
    id: "cs_flask_01",
    department: "Computer Science & Engineering",
    subject: "Web Technologies & Backend",
    topic: "Backend Web & API Architecture",
    subtopic: "Microframeworks & Routing",
    skill: "Flask",
    difficulty: "Intermediate",
    questionType: "project-based",
    question: "How do you structure a production RESTful API in Flask using Blueprints and Application Factories, and how do you handle centralized exception handling?",
    keywords: ["flask", "blueprint", "factory", "rest", "api", "error", "handler", "jsonify", "status", "app", "routes"],
    followUpTemplates: [
      "In your Flask project, how did you manage database session lifecycles and connection pooling with SQLAlchemy under high concurrency?",
      "How does Flask WSGI execution compare to ASGI frameworks like FastAPI when handling asynchronous I/O-bound requests?"
    ],
    idealAnswerPoints: [
      "Application factory pattern creates app instances dynamically, easing unit testing and config switching",
      "Blueprints organize endpoints into modular route packages (e.g. auth, api_v1, users)",
      "Custom error handlers registered via @app.errorhandler() or Blueprint.errorhandler() returning uniform JSON envelopes",
      "Separation of config environments (Development, Testing, Production)"
    ],
    explanation: "Evaluates architectural knowledge of Flask microframework beyond simple single-file scripts."
  },
  {
    id: "cs_rest_01",
    department: "Computer Science & Engineering",
    subject: "Web Technologies & Backend",
    topic: "Backend Web & API Architecture",
    subtopic: "RESTful Protocols & HTTP",
    skill: "REST APIs",
    difficulty: "Beginner",
    questionType: "conceptual",
    question: "Explain the difference between idempotent and non-idempotent HTTP methods in REST APIs. Which methods (GET, POST, PUT, DELETE, PATCH) are idempotent and why?",
    keywords: ["rest", "api", "idempotent", "http", "get", "post", "put", "delete", "patch", "safe"],
    followUpTemplates: [
      "If a network timeout occurs during a payment POST request, how do you enforce idempotency on the server using Idempotency Keys?",
      "When would you choose PATCH over PUT when modifying relational resources?"
    ],
    idealAnswerPoints: [
      "Idempotence means making multiple identical requests has the same side-effect on server state as making a single request",
      "GET, HEAD, OPTIONS are safe and idempotent",
      "PUT and DELETE are idempotent because repeating PUT with identical payload yields same resource state, and deleting twice leaves resource gone",
      "POST is NOT idempotent because multiple calls create multiple distinct resources",
      "PATCH is generally non-idempotent unless designed carefully"
    ],
    explanation: "Core API design principle testing comprehension of HTTP semantics and distributed state safety."
  },
  {
    id: "cs_mysql_01",
    department: "Computer Science & Engineering",
    subject: "Database Management Systems",
    topic: "Database Systems",
    subtopic: "Relational SQL & Indexing",
    skill: "MySQL",
    difficulty: "Intermediate",
    questionType: "practical",
    question: 'How do B-Tree indexes work in MySQL (InnoDB), and why does a query using "SELECT * WHERE age > 25 ORDER BY created_at" sometimes cause a filesort instead of using an index?',
    keywords: ["mysql", "innodb", "btree", "index", "composite", "filesort", "explain", "query", "execution", "order by"],
    followUpTemplates: [
      "How do you design a composite index (age, created_at) to avoid filesort and satisfy both filtering and sorting?",
      "What is the difference between a Clustered Index and a Secondary Non-Clustered Index in InnoDB storage engine?"
    ],
    idealAnswerPoints: [
      "InnoDB primary key is clustered; secondary indexes store secondary key + primary key pointer in a balanced B+Tree",
      "Composite indexes follow the Leftmost Prefix Rule",
      "A range condition on the first column (age > 25) prevents subsequent columns in the index from being used for ordered scanning, forcing the optimizer into a filesort",
      "Using EXPLAIN helps verify if type is range, ref, or index, and inspect Extra: Using filesort"
    ],
    explanation: "Diagnostic database knowledge distinguishing basic SQL query writers from production engineers."
  },
  {
    id: "cs_docker_01",
    department: "Computer Science & Engineering",
    subject: "DevOps & Systems",
    topic: "DevOps & Cloud Systems",
    subtopic: "Containerization & Isolation",
    skill: "Docker",
    difficulty: "Beginner",
    questionType: "practical",
    question: "What is the architectural difference between a Docker container and a Virtual Machine? How do Linux Namespaces and cgroups enable container isolation?",
    keywords: ["docker", "container", "virtual machine", "cgroups", "namespaces", "isolation", "hypervisor", "kernel"],
    followUpTemplates: [
      "How do multi-stage Docker builds reduce production image size and eliminate build-time security vulnerabilities?",
      "What is the difference between Docker bridge networking and host networking?"
    ],
    idealAnswerPoints: [
      "VMs virtualize hardware via Hypervisor and run a full guest OS with separate kernel",
      "Docker containers share the host Linux kernel and isolate processes using kernel features",
      "Namespaces isolate view (PID, NET, MNT, IPC, UTS); cgroups restrict resource usage (CPU, memory, disk I/O)"
    ],
    explanation: "Infrastructure and containerization fundamentals."
  },
  {
    id: "cs_sysdesign_01",
    department: "Computer Science & Engineering",
    subject: "System Architecture",
    topic: "Distributed Systems",
    subtopic: "Scalability & Load Balancing",
    skill: "System Design",
    difficulty: "Advanced",
    questionType: "scenario",
    question: "Design a scalable URL shortening service (like Bitly) handling 100M new URLs per month and 1B reads per month. How do you design ID generation, caching, and database storage?",
    keywords: ["system design", "scalability", "url shortener", "base62", "cache", "redis", "nosql", "sharding", "hashing"],
    followUpTemplates: [
      "How would you handle cache eviction and cache stampede when an ultra-viral link is accessed simultaneously by millions?",
      "Compare Base62 encoding of an auto-incrementing integer counter vs MD5/SHA256 hashing with collision resolution."
    ],
    idealAnswerPoints: [
      "Capacity planning: 100M writes/mo \u2248 40 writes/sec, 1B reads/mo \u2248 400 reads/sec (read-heavy system)",
      "Storage requirement: 100M * 500 bytes \u2248 50GB/mo",
      "Base62 encoding provides 62^7 \u2248 3.5 trillion unique short URLs using a 7-character string",
      "Redis LRU caching layer caches top 20% viral URLs to serve 80% read traffic directly from RAM"
    ],
    explanation: "High-level architectural problem assessing distributed scaling, capacity planning, and caching."
  },
  // =========================================================================
  // 2. INFORMATION TECHNOLOGY (IT)
  // =========================================================================
  {
    id: "it_cloud_01",
    department: "Information Technology",
    subject: "Cloud Infrastructure & Networking",
    topic: "Cloud Computing & Infrastructure",
    subtopic: "AWS, Azure & Virtualization",
    skill: "Cloud Architecture",
    difficulty: "Intermediate",
    questionType: "problem-solving",
    question: "Design a highly available 3-tier web application architecture across two AWS Availability Zones. How do you configure public vs private subnets, NAT Gateways, and ALB SSL termination?",
    keywords: ["cloud", "aws", "vpc", "subnet", "nat gateway", "alb", "load balancer", "availability zone", "security group"],
    followUpTemplates: [
      "Why should database instances (RDS) never be placed in public subnets, and how does a Bastion Host or SSM Session Manager provide secure admin access?",
      "How do AWS Auto Scaling Groups use target tracking scaling policies with Application Load Balancer request counts?"
    ],
    idealAnswerPoints: [
      "VPC partitioned across 2 Availability Zones with public and private subnets in each AZ",
      "Public subnets host Internet-facing Application Load Balancer and NAT Gateways",
      "Private subnets host application EC2/ECS instances with route tables pointing to NAT Gateways for outbound internet",
      "Isolated private subnets host Multi-AZ RDS relational database with replication across AZs",
      "Security group chaining ensures DB only accepts traffic from application security groups on port 5432/3306"
    ],
    explanation: "Tests enterprise cloud infrastructure patterns, network isolation, and high availability design."
  },
  {
    id: "it_networking_01",
    department: "Information Technology",
    subject: "Computer Networks",
    topic: "Networking & Protocols",
    subtopic: "TCP/IP, OSI Model & Routing",
    skill: "Computer Networks",
    difficulty: "Beginner",
    questionType: "conceptual",
    question: "Explain what happens during the TCP Three-Way Handshake (SYN, SYN-ACK, ACK) and Four-Way Teardown (FIN, ACK, FIN, ACK). Why does TCP maintain a TIME_WAIT state?",
    keywords: ["computer networks", "tcp", "three way handshake", "syn", "ack", "fin", "time_wait", "osi", "transport layer"],
    followUpTemplates: [
      "What is a SYN Flood attack, and how do SYN Cookies mitigate connection queue exhaustion at the operating system level?",
      "Compare TCP Flow Control (Sliding Window) with TCP Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit)."
    ],
    idealAnswerPoints: [
      "Client sends SYN with initial sequence number (ISN_c)",
      "Server responds with SYN-ACK with its own sequence number (ISN_s) and ACK (ISN_c + 1)",
      "Client replies with ACK (ISN_s + 1), completing full-duplex socket establishment",
      "TIME_WAIT lasts 2 * MSL (Maximum Segment Lifetime) to ensure delayed packets clear network and final ACK reaches peer"
    ],
    explanation: "Core transport layer network protocol fundamentals."
  },
  {
    id: "it_cybersec_01",
    department: "Information Technology",
    subject: "Information & Network Security",
    topic: "Information & Network Security",
    subtopic: "Cryptography, Firewalls & OWASP",
    skill: "Cybersecurity",
    difficulty: "Intermediate",
    questionType: "scenario",
    question: "How do you prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) in modern single-page applications? Compare SameSite cookie attributes with JWT tokens in Authorization headers.",
    keywords: ["cybersecurity", "owasp", "xss", "csrf", "samesite", "jwt", "tokens", "http-only", "csp"],
    followUpTemplates: [
      "Why is storing sensitive JWT tokens in localStorage vulnerable to stored/DOM XSS, and how do HttpOnly + Secure cookies protect them?",
      "How does Content Security Policy (CSP) restrict inline script execution and unauthorized external script fetching?"
    ],
    idealAnswerPoints: [
      "XSS: Attacker injects malicious JavaScript executed in user browser; prevented via context-aware output encoding, React JSX escaping, and strict CSP",
      "CSRF: Unauthorized commands transmitted from a trusted user; prevented via Anti-CSRF synchronization tokens and SameSite=Lax/Strict cookie flags",
      "HttpOnly cookies prevent JavaScript document.cookie access, protecting session tokens from XSS exfiltration"
    ],
    explanation: "Application security concepts essential for web and enterprise systems."
  },
  {
    id: "it_linux_01",
    department: "Information Technology",
    subject: "Operating Systems & Administration",
    topic: "Operating Systems & Shell",
    subtopic: "Bash Scripting & Process Management",
    skill: "Linux Administration",
    difficulty: "Intermediate",
    questionType: "practical",
    question: "In Linux system administration, a production server reports 100% CPU utilization and high load average. How do you triage the issue using top/htop, vmstat, and iostat, and how do you differentiate CPU-bound from I/O-wait bottlenecks?",
    keywords: ["linux", "sysadmin", "load average", "top", "vmstat", "iostat", "iowait", "process", "cpu", "bash"],
    followUpTemplates: [
      'If vmstat shows high "b" (blocked processes) and high "%wa" in top, what storage subsystem diagnostic steps would you execute?',
      "How do systemd units manage service restarts, resource limits (MemoryMax, CPUQuota), and journal logging?"
    ],
    idealAnswerPoints: [
      "Load average represents the number of runnable and uninterruptible (D state) processes queued for CPU or disk",
      "Check top / htop: %us (user CPU), %sy (system kernel CPU), %wa (I/O wait)",
      "High %wa indicates storage/disk I/O saturation, confirmed with iostat -xz 1 inspecting %util and await times",
      "vmstat 1 verifies swapping (si/so) and context switches (cs); lsof / fuser identifies processes holding files"
    ],
    explanation: "Hands-on server troubleshooting and performance diagnostics."
  },
  // =========================================================================
  // 3. ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // =========================================================================
  {
    id: "ece_opamp_diagram_01",
    department: "Electronics & Communication Engineering",
    subject: "Analog Circuits & Instrumentation",
    topic: "Signal Processing & Systems",
    subtopic: "Operational Amplifiers & Feedback",
    skill: "Digital Signal Processing",
    difficulty: "Beginner",
    questionType: "diagram-based",
    question: "Refer to the Inverting Op-Amp Circuit diagram shown below. Calculate the closed-loop voltage gain (Av) and output voltage (Vout) for an input Vin = 0.4V with Rin = 10k\u03A9 and Rf = 100k\u03A9. What is the significance of the virtual ground at the inverting terminal?",
    keywords: ["op-amp", "inverting amplifier", "gain", "virtual ground", "feedback", "operational amplifier", "analog circuits"],
    followUpTemplates: [
      "If the op-amp has dual supplies of \xB112V, what happens if the input voltage Vin is increased to 2.0V?",
      "How does the finite Open-Loop Gain (Aol = 100,000) and Gain-Bandwidth Product (GBW = 1MHz) limit the maximum frequency of amplification?"
    ],
    idealAnswerPoints: [
      "Ideal op-amp assumptions: Infinite input impedance (zero input bias current), infinite open-loop gain",
      "Non-inverting terminal (+) is grounded (0V), creating a Virtual Ground (0V) at inverting terminal (-) due to negative feedback",
      "Current through Rin: I = Vin / Rin = 0.4V / 10k\u03A9 = 40\u03BCA",
      "All current flows through feedback resistor: Vout = -I * Rf = -(Rf / Rin) * Vin = -(100k / 10k) * 0.4V = -4.0V",
      "Closed loop gain Av = -Rf / Rin = -10"
    ],
    explanation: "Fundamental operational amplifier analysis testing circuit equations, negative feedback, and virtual ground concept.",
    diagram: {
      type: "circuit",
      title: "Inverting Operational Amplifier Schematic",
      caption: "Standard closed-loop inverting amplifier with negative feedback loop Rf and input resistor Rin.",
      specs: {
        "Rin (Input Resistor)": "10 k\u03A9",
        "Rf (Feedback Resistor)": "100 k\u03A9",
        "Supply Rails": "\xB115 V DC",
        "Target Vin": "0.4 V DC"
      },
      technicalNotes: [
        "Terminal 2 (Inverting Input): Virtual Ground at 0V potential.",
        "Terminal 3 (Non-Inverting Input): Connected directly to Common Ground (0V).",
        "Rf provides negative feedback stabilizing closed-loop gain Av = -Rf / Rin."
      ],
      svgContent: `<svg viewBox="0 0 540 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="240" fill="#0b1120" rx="12"/>
        <line x1="40" y1="90" x2="110" y2="90" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="40" cy="90" r="4" fill="#60a5fa"/>
        <text x="35" y="75" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">Vin</text>
        
        <!-- Rin Resistor -->
        <rect x="110" y="80" width="60" height="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="122" y="95" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="bold">Rin=10k</text>
        
        <line x1="170" y1="90" x2="240" y2="90" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="210" cy="90" r="5" fill="#38bdf8"/>
        
        <!-- Op-Amp Triangle -->
        <polygon points="240,60 240,160 340,110" fill="#1e293b" stroke="#818cf8" stroke-width="3"/>
        
        <!-- Inverting (-) and Non-Inverting (+) -->
        <text x="248" y="95" fill="#ef4444" font-family="monospace" font-size="16" font-weight="bold">-</text>
        <text x="248" y="135" fill="#10b981" font-family="monospace" font-size="16" font-weight="bold">+</text>
        
        <!-- Ground on Non-Inverting -->
        <line x1="210" y1="130" x2="240" y2="130" stroke="#60a5fa" stroke-width="3"/>
        <line x1="210" y1="130" x2="210" y2="160" stroke="#60a5fa" stroke-width="3"/>
        <line x1="195" y1="160" x2="225" y2="160" stroke="#64748b" stroke-width="3"/>
        <line x1="200" y1="166" x2="220" y2="166" stroke="#64748b" stroke-width="2"/>
        <line x1="205" y1="172" x2="215" y2="172" stroke="#64748b" stroke-width="2"/>
        <text x="160" y="170" fill="#94a3b8" font-family="monospace" font-size="10">GND (0V)</text>
        
        <!-- Feedback Loop Rf -->
        <line x1="210" y1="90" x2="210" y2="35" stroke="#60a5fa" stroke-width="3"/>
        <line x1="210" y1="35" x2="250" y2="35" stroke="#60a5fa" stroke-width="3"/>
        <rect x="250" y="25" width="70" height="20" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
        <text x="260" y="40" fill="#fde047" font-family="monospace" font-size="11" font-weight="bold">Rf=100k</text>
        <line x1="320" y1="35" x2="380" y2="35" stroke="#60a5fa" stroke-width="3"/>
        <line x1="380" y1="35" x2="380" y2="110" stroke="#60a5fa" stroke-width="3"/>
        
        <!-- Output -->
        <line x1="340" y1="110" x2="480" y2="110" stroke="#34d399" stroke-width="3"/>
        <circle cx="380" cy="110" r="5" fill="#34d399"/>
        <circle cx="480" cy="110" r="4" fill="#34d399"/>
        <text x="440" y="95" fill="#6ee7b7" font-family="monospace" font-size="13" font-weight="bold">Vout = -4.0V</text>
        
        <!-- Node annotations -->
        <text x="180" y="115" fill="#fca5a5" font-family="monospace" font-size="10">Virtual GND</text>
        <text x="260" y="195" fill="#a5b4fc" font-family="sans-serif" font-size="11">Av = -Rf / Rin = -100k / 10k = -10</text>
      </svg>`
    }
  },
  {
    id: "ece_timing_waveform_02",
    department: "Electronics & Communication Engineering",
    subject: "Digital System Design & VLSI",
    topic: "Semiconductor & VLSI",
    subtopic: "CMOS Inverters & Setup/Hold Timing",
    skill: "VLSI Design",
    difficulty: "Intermediate",
    questionType: "diagram-based",
    question: "Examine the Flip-Flop Setup and Hold Timing Waveform shown below. Define Setup Time (Tsetup) and Hold Time (Thold). What causes a setup time violation at higher clock frequencies, and what happens to flip-flop output Q when metastability occurs?",
    keywords: ["vlsi", "setup time", "hold time", "timing closure", "metastability", "flip-flop", "clock skew", "digital electronics"],
    followUpTemplates: [
      "How does Clock Skew (Tskew = Tclk2 - Tclk1) alleviate setup time but worsen hold time in sequential digital pipelines?",
      "Can hold time violations be fixed by lowering the clock frequency? If not, how are they fixed during physical design?"
    ],
    idealAnswerPoints: [
      "Setup time (Tsetup) is the minimum time data D must be stable before the active clock edge",
      "Hold time (Thold) is the minimum time data D must remain stable after the active clock edge",
      "At higher clock frequencies (smaller Tclk), maximum combinational delay Tcomb_max violates Tclk >= Tcq + Tcomb_max + Tsetup - Tskew",
      "Metastability occurs when D transitions inside the setup/hold aperture window, causing output Q to oscillate or hover between logic levels for an indeterminate duration",
      "Hold violations cannot be fixed by lowering frequency because hold timing is independent of clock period (fixed by inserting delay buffers)"
    ],
    explanation: "Critical VLSI digital timing analysis assessing timing closure, path margins, and flip-flop metastability.",
    diagram: {
      type: "waveform",
      title: "D Flip-Flop Setup & Hold Timing Aperture",
      caption: "Temporal requirement window around the active clock rising edge.",
      specs: {
        "Clock Frequency": "500 MHz (T = 2.0 ns)",
        "Required Tsetup": "250 ps",
        "Required Thold": "150 ps",
        "Metastable Risk Window": "\xB1100 ps around clock transition"
      },
      technicalNotes: [
        "Data line D must not toggle during the shaded blue aperture window.",
        "Tcq is the propagation delay from active clock edge to valid output Q.",
        "Setup violations are fixed by pipeline registers or reducing combinational logic."
      ],
      svgContent: `<svg viewBox="0 0 540 220" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="220" fill="#0b1120" rx="12"/>
        
        <!-- Timeline grid lines -->
        <line x1="260" y1="20" x2="260" y2="190" stroke="#f43f5e" stroke-dasharray="4" stroke-width="2"/>
        <text x="264" y="32" fill="#fda4af" font-family="monospace" font-size="10">Active Clock Edge</text>
        
        <!-- Setup window shaded -->
        <rect x="180" y="40" width="80" height="140" fill="#6366f1" fill-opacity="0.15"/>
        <rect x="260" y="40" width="60" height="140" fill="#10b981" fill-opacity="0.15"/>
        
        <!-- CLOCK Waveform -->
        <text x="20" y="70" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">CLK</text>
        <path d="M 60,80 L 140,80 L 140,50 L 220,50 L 220,80 L 260,80 L 260,50 L 340,50 L 340,80 L 420,80 L 420,50 L 500,50" 
              fill="none" stroke="#38bdf8" stroke-width="3"/>
              
        <!-- DATA (D) Waveform -->
        <text x="20" y="125" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">DATA (D)</text>
        <path d="M 60,135 L 170,135 L 180,105 L 340,105 L 350,135 L 500,135" 
              fill="none" stroke="#f59e0b" stroke-width="3"/>
              
        <!-- OUTPUT (Q) Waveform -->
        <text x="20" y="175" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">OUT (Q)</text>
        <path d="M 60,180 L 290,180 L 295,155 L 500,155" 
              fill="none" stroke="#10b981" stroke-width="3"/>
              
        <!-- Annotations -->
        <line x1="180" y1="100" x2="260" y2="100" stroke="#818cf8" stroke-width="2"/>
        <text x="195" y="95" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">\u2190 Tsetup \u2192</text>
        
        <line x1="260" y1="100" x2="320" y2="100" stroke="#34d399" stroke-width="2"/>
        <text x="268" y="95" fill="#a7f3d0" font-family="monospace" font-size="11" font-weight="bold">\u2190Thold\u2192</text>
        
        <line x1="260" y1="170" x2="295" y2="170" stroke="#f43f5e" stroke-width="2"/>
        <text x="300" y="172" fill="#fca5a5" font-family="monospace" font-size="10">Tcq delay</text>
      </svg>`
    }
  },
  {
    id: "ece_verilog_01",
    department: "Electronics & Communication Engineering",
    subject: "Digital System Design & VLSI",
    topic: "Digital System Design & VLSI",
    subtopic: "RTL Modeling & FSM Synthesis",
    skill: "Verilog HDL",
    difficulty: "Intermediate",
    questionType: "practical",
    question: "Explain the critical differences between blocking assignments (=) and non-blocking assignments (<=) in Verilog HDL. What race conditions occur in sequential always @(posedge clk) blocks when using blocking assignments?",
    keywords: ["verilog", "blocking", "non-blocking", "race condition", "rtl", "synthesis", "simulation", "fsm"],
    followUpTemplates: [
      "In a Moore vs Mealy Finite State Machine (FSM), which model reacts faster to input changes and why does Mealy FSM output have potential combinational glitches?",
      "How does unintentional latch inference occur in Verilog combinational always @(*) blocks?"
    ],
    idealAnswerPoints: [
      "Blocking assignments (=) evaluate and update immediately in sequential order within the procedural block",
      "Non-blocking assignments (<=) evaluate right-hand side expressions concurrently at time step start and schedule updates for the end of time step (NBA region)",
      "Sequential logic (flip-flops) must use non-blocking assignments (<=) to prevent simulation race conditions between chained registers",
      "Combinational logic (multiplexers, adders) must use blocking assignments (=)"
    ],
    explanation: "Hardware description language synthesis semantics and simulation race avoidance."
  },
  // =========================================================================
  // 4. ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // =========================================================================
  {
    id: "eee_transformer_diagram_01",
    department: "Electrical & Electronics Engineering",
    subject: "Electrical Machines & Transformers",
    topic: "Electric Machines & Drives",
    subtopic: "Transformers, Induction Motors & Alternators",
    skill: "Electrical Machines",
    difficulty: "Intermediate",
    questionType: "diagram-based",
    question: "Review the Single-Phase Transformer Equivalent Circuit diagram referred to the primary winding. Identify the roles of Rc and Xm in the shunt branch. How are parameters (Rc, Xm) determined from the Open Circuit (OC) test, and (Req, Xeq) determined from the Short Circuit (SC) test?",
    keywords: ["transformer", "equivalent circuit", "open circuit test", "short circuit test", "core loss", "leakage reactance", "magnetizing", "electrical machines"],
    followUpTemplates: [
      "Why is the Open Circuit (OC) test conducted at rated voltage on the Low Voltage (LV) winding while the High Voltage (HV) side remains open?",
      "Explain how Transformer Voltage Regulation varies with lagging, unity, and leading power factor loads."
    ],
    idealAnswerPoints: [
      "Rc represents core loss resistance (eddy current and hysteresis losses in the magnetic core laminations)",
      "Xm represents magnetizing reactance required to establish mutual flux in the ferromagnetic core",
      "Open Circuit test: rated voltage applied to LV winding with HV open; measures no-load current Io and no-load power Po to calculate Rc and Xm",
      "Short Circuit test: low voltage applied to HV winding with LV short-circuited; rated current flows to measure copper losses Psc and find series parameters Req and Xeq",
      "R2 and X2 are referred to primary by multiplying with turns ratio squared: R2' = R2 / k^2"
    ],
    explanation: "Core electrical machines analysis verifying equivalent circuit modeling and experimental test procedures.",
    diagram: {
      type: "circuit",
      title: "Single-Phase Transformer Equivalent Circuit (Referred to Primary)",
      caption: "Exact equivalent circuit showing series winding impedances and parallel shunt magnetizing branch.",
      specs: {
        "Rated Voltage": "2300V / 230V, 50 Hz",
        "Rated Power": "50 kVA",
        "Turns Ratio k": "N2 / N1 = 0.1",
        "Core Shunt Branch": "Rc (Loss) || Xm (Magnetizing)"
      },
      technicalNotes: [
        "R1, X1: Primary winding resistance and leakage reactance.",
        "Rc, Xm: Core shunt excitation branch accounting for iron losses and flux establishment.",
        "R2', X2': Secondary winding impedance referred to primary side."
      ],
      svgContent: `<svg viewBox="0 0 540 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="240" fill="#0b1120" rx="12"/>
        
        <!-- Input Terminal V1 -->
        <circle cx="35" cy="50" r="4" fill="#38bdf8"/>
        <circle cx="35" cy="190" r="4" fill="#38bdf8"/>
        <text x="25" y="40" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">+ V1</text>
        <text x="25" y="210" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">-</text>
        
        <!-- Primary Series Impedance R1 & X1 -->
        <line x1="35" y1="50" x2="80" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="80" y="42" width="45" height="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="92" y="54" fill="#f8fafc" font-family="monospace" font-size="10">R1</text>
        
        <line x1="125" y1="50" x2="145" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <!-- Inductor X1 coils -->
        <path d="M 145,50 Q 155,35 165,50 Q 175,35 185,50 Q 195,35 205,50" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <text x="170" y="30" fill="#fde047" font-family="monospace" font-size="10">jX1</text>
        
        <!-- Shunt Branch Node -->
        <line x1="205" y1="50" x2="260" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="260" cy="50" r="4" fill="#60a5fa"/>
        
        <!-- Shunt Rc & Xm -->
        <line x1="260" y1="50" x2="260" y2="80" stroke="#60a5fa" stroke-width="2"/>
        <line x1="230" y1="80" x2="290" y2="80" stroke="#60a5fa" stroke-width="2"/>
        
        <!-- Rc branch -->
        <line x1="230" y1="80" x2="230" y2="100" stroke="#60a5fa" stroke-width="2"/>
        <rect x="220" y="100" width="20" height="35" fill="#1e293b" stroke="#f87171" stroke-width="2"/>
        <text x="218" y="150" fill="#fca5a5" font-family="monospace" font-size="9">Rc (Core)</text>
        <line x1="230" y1="135" x2="230" y2="170" stroke="#60a5fa" stroke-width="2"/>
        
        <!-- Xm branch -->
        <line x1="290" y1="80" x2="290" y2="100" stroke="#60a5fa" stroke-width="2"/>
        <path d="M 290,100 Q 305,107 290,115 Q 305,122 290,130 Q 305,137 290,145" fill="none" stroke="#fbbf24" stroke-width="2"/>
        <text x="282" y="160" fill="#fde047" font-family="monospace" font-size="9">jXm (Mag)</text>
        <line x1="290" y1="145" x2="290" y2="170" stroke="#60a5fa" stroke-width="2"/>
        
        <line x1="230" y1="170" x2="290" y2="170" stroke="#60a5fa" stroke-width="2"/>
        <line x1="260" y1="170" x2="260" y2="190" stroke="#60a5fa" stroke-width="2"/>
        <circle cx="260" cy="190" r="4" fill="#60a5fa"/>
        
        <!-- Secondary Referred R2' and X2' -->
        <line x1="260" y1="50" x2="330" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="330" y="42" width="45" height="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="342" y="54" fill="#f8fafc" font-family="monospace" font-size="10">R2'</text>
        
        <line x1="375" y1="50" x2="395" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <path d="M 395,50 Q 405,35 415,50 Q 425,35 435,50 Q 445,35 455,50" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <text x="415" y="30" fill="#fde047" font-family="monospace" font-size="10">jX2'</text>
        
        <!-- Output Load ZL' -->
        <line x1="455" y1="50" x2="495" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="485" y="90" width="20" height="50" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
        <text x="475" y="155" fill="#6ee7b7" font-family="monospace" font-size="9">ZL' (Load)</text>
        <line x1="495" y1="50" x2="495" y2="90" stroke="#60a5fa" stroke-width="2"/>
        <line x1="495" y1="140" x2="495" y2="190" stroke="#60a5fa" stroke-width="2"/>
        
        <!-- Bottom Common Return -->
        <line x1="35" y1="190" x2="495" y2="190" stroke="#60a5fa" stroke-width="3"/>
        
        <text x="140" y="220" fill="#94a3b8" font-family="monospace" font-size="11">Exact Model: Vo = V2' + I2'(R2' + jX2')</text>
      </svg>`
    }
  },
  {
    id: "eee_buck_converter_diagram_02",
    department: "Electrical & Electronics Engineering",
    subject: "Power Electronics & Drives",
    topic: "Converters & Inverters",
    subtopic: "Buck-Boost, Rectifiers & IGBT Switching",
    skill: "Power Electronics",
    difficulty: "Intermediate",
    questionType: "diagram-based",
    question: "Analyze the DC-DC Buck Converter circuit diagram below. For an input voltage Vin = 48V, switching duty cycle D = 0.25, and switching frequency fs = 50 kHz in Continuous Conduction Mode (CCM): calculate the average output voltage (Vout). What is the purpose of the freewheeling diode D1 when the MOSFET switch turns off?",
    keywords: ["power electronics", "buck converter", "duty cycle", "ccm", "freewheeling diode", "inductor", "dc-dc converter", "switching"],
    followUpTemplates: [
      "What design condition governs the boundary between Continuous Conduction Mode (CCM) and Discontinuous Conduction Mode (DCM) for minimum load current I_min?",
      "How do you size the output capacitor C to limit peak-to-peak output voltage ripple to less than 1%?"
    ],
    idealAnswerPoints: [
      "In ideal CCM, average output voltage Vout = D * Vin = 0.25 * 48V = 12.0V",
      "When MOSFET switch is ON: Diode D1 is reverse-biased; input supplies current to inductor L and load, charging inductor magnetic field (vL = Vin - Vout)",
      "When MOSFET switch turns OFF: Inductor current cannot change instantaneously; inductor polarity reverses, forward-biasing freewheeling diode D1 to maintain continuous load current loop",
      "Inductor Volt-Second Balance in steady state ensures net inductor voltage over one switching period is zero: (Vin - Vout)*DT = Vout*(1 - D)T"
    ],
    explanation: "Fundamental step-down power electronics topology and steady-state switching dynamics.",
    diagram: {
      type: "circuit",
      title: "DC-DC Buck Step-Down Converter Topology",
      caption: "Non-isolated buck converter circuit operating in continuous conduction mode (CCM).",
      specs: {
        "Input Voltage Vin": "48 V DC",
        "Duty Cycle D": "0.25 (25%)",
        "Switching Freq fs": "50 kHz (T = 20 \u03BCs)",
        "Calculated Vout": "12.0 V DC"
      },
      technicalNotes: [
        "S1: High-side power MOSFET switch controlled by PWM gate driver.",
        "D1: Ultrafast / Schottky freewheeling diode conducting during (1-D)T interval.",
        "L, C: Low-pass LC filter smoothing output voltage ripple."
      ],
      svgContent: `<svg viewBox="0 0 540 230" width="100%" height="210" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="230" fill="#0b1120" rx="12"/>
        
        <!-- Input DC Voltage -->
        <circle cx="40" cy="50" r="4" fill="#38bdf8"/>
        <circle cx="40" cy="180" r="4" fill="#38bdf8"/>
        <text x="25" y="40" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">+ Vin=48V</text>
        <text x="30" y="200" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">-</text>
        
        <!-- MOSFET Switch S1 -->
        <line x1="40" y1="50" x2="110" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="110" y="35" width="55" height="30" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
        <text x="120" y="54" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">S1 (SW)</text>
        <line x1="165" y1="50" x2="220" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="220" cy="50" r="5" fill="#38bdf8"/>
        
        <!-- Freewheeling Diode D1 -->
        <line x1="220" y1="50" x2="220" y2="90" stroke="#60a5fa" stroke-width="3"/>
        <polygon points="210,130 230,130 220,105" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
        <line x1="210" y1="105" x2="230" y2="105" stroke="#f43f5e" stroke-width="2"/>
        <text x="235" y="125" fill="#fda4af" font-family="monospace" font-size="11">D1 (Diode)</text>
        <line x1="220" y1="130" x2="220" y2="180" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="220" cy="180" r="4" fill="#60a5fa"/>
        
        <!-- Filter Inductor L -->
        <line x1="220" y1="50" x2="260" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <path d="M 260,50 Q 275,30 290,50 Q 305,30 320,50 Q 335,30 350,50" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <text x="290" y="25" fill="#fde047" font-family="monospace" font-size="11" font-weight="bold">L (Inductor)</text>
        
        <!-- Capacitor C & Load R -->
        <line x1="350" y1="50" x2="420" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="420" cy="50" r="4" fill="#60a5fa"/>
        
        <!-- Capacitor C -->
        <line x1="420" y1="50" x2="420" y2="100" stroke="#60a5fa" stroke-width="2"/>
        <line x1="405" y1="100" x2="435" y2="100" stroke="#38bdf8" stroke-width="3"/>
        <line x1="405" y1="110" x2="435" y2="110" stroke="#38bdf8" stroke-width="3"/>
        <line x1="420" y1="110" x2="420" y2="180" stroke="#60a5fa" stroke-width="2"/>
        <text x="438" y="110" fill="#93c5fd" font-family="monospace" font-size="11">C</text>
        <circle cx="420" cy="180" r="4" fill="#60a5fa"/>
        
        <!-- Load R -->
        <line x1="420" y1="50" x2="480" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="472" y="90" width="16" height="45" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
        <line x1="480" y1="50" x2="480" y2="90" stroke="#60a5fa" stroke-width="2"/>
        <line x1="480" y1="135" x2="480" y2="180" stroke="#60a5fa" stroke-width="2"/>
        <text x="495" y="115" fill="#6ee7b7" font-family="monospace" font-size="11">R_Load</text>
        
        <!-- Output Voltage indicator -->
        <circle cx="510" cy="50" r="4" fill="#34d399"/>
        <circle cx="510" cy="180" r="4" fill="#34d399"/>
        <text x="490" y="35" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">+ Vout=12V</text>
        
        <!-- Ground / Common return -->
        <line x1="40" y1="180" x2="510" y2="180" stroke="#60a5fa" stroke-width="3"/>
        <text x="170" y="215" fill="#a5b4fc" font-family="sans-serif" font-size="11">Vout = D \xB7 Vin = 0.25 \xD7 48V = 12.0 V</text>
      </svg>`
    }
  },
  {
    id: "eee_powersys_01",
    department: "Electrical & Electronics Engineering",
    subject: "Power Systems & Grid Engineering",
    topic: "Power Generation & Transmission",
    subtopic: "Load Flow, Fault Analysis & Grid Stability",
    skill: "Power Systems",
    difficulty: "Advanced",
    questionType: "problem-solving",
    question: "Compare symmetrical faults (3-phase short circuit) with unsymmetrical faults (single line-to-ground SLG, double line-to-ground DLG). Why is the single line-to-ground fault typically the most common, and how do symmetrical components (positive, negative, zero sequence) simplify fault analysis?",
    keywords: ["power systems", "fault analysis", "symmetrical components", "zero sequence", "single line to ground", "grid", "protection"],
    followUpTemplates: [
      "Why is zero-sequence current unable to flow in an ungrounded delta-connected transformer winding?",
      "How do distance relays (Mho relay) prevent false tripping during stable power swings on high-voltage transmission lines?"
    ],
    idealAnswerPoints: [
      "Single Line-to-Ground (SLG) fault constitutes > 70% of all grid faults due to lightning, tree contact, and insulator flashover",
      "Fortescue theorem decomposes unbalance into three balanced sets: Positive (abc), Negative (acb), and Zero sequence (in-phase)",
      "For SLG fault: sequence networks are connected in series (Ia1 = Ia2 = Ia0)",
      "Zero sequence requires a physical ground return path; absent in delta or ungrounded wye systems"
    ],
    explanation: "Core power systems engineering testing symmetrical components and fault calculations."
  },
  // =========================================================================
  // 5. CIVIL ENGINEERING
  // =========================================================================
  {
    id: "ce_bmd_diagram_01",
    department: "Civil Engineering",
    subject: "Structural Engineering & Mechanics",
    topic: "Structural Analysis & Design",
    subtopic: "Truss & Space Frame Analysis",
    skill: "STAAD.Pro",
    difficulty: "Beginner",
    questionType: "diagram-based",
    question: "Refer to the Simply Supported Beam with Center Point Load diagram below. For span L = 6 m and point load W = 20 kN applied at mid-span: calculate the support reactions (Ra, Rb), maximum shear force (Vmax), and maximum bending moment (Mmax). What is the mathematical relationship between the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD)?",
    keywords: ["civil", "bending moment", "shear force", "bmd", "sfd", "simply supported beam", "structural analysis", "mechanics of materials"],
    followUpTemplates: [
      "If the concentrated point load W is replaced by a uniformly distributed load (UDL) of w = 5 kN/m over the entire span, what shape does the BMD become and what is the maximum bending moment formula?",
      "At what cross-section location is the bending moment maximum, and why is the shear force zero at that exact point?"
    ],
    idealAnswerPoints: [
      "Symmetric loading: Support reactions Ra = Rb = W / 2 = 20 kN / 2 = 10 kN",
      "Shear Force Diagram (SFD): Constant +10 kN from x = 0 to 3 m; steps down by 20 kN to -10 kN from x = 3 m to 6 m",
      "Maximum Bending Moment: Mmax = (W * L) / 4 = (20 kN * 6 m) / 4 = 30.0 kNm at center",
      "Fundamental differential relationship: dM/dx = V (rate of change of bending moment equals shear force); thus BMD slope equals shear force, and bending moment is maximized where shear force changes sign (V = 0)"
    ],
    explanation: "Cornerstone structural analysis concept required for all civil engineering and structural design roles.",
    diagram: {
      type: "structural",
      title: "Simply Supported Beam Shear Force & Bending Moment Diagrams",
      caption: "Beam with central concentrated load showing SFD step and BMD triangular distribution.",
      specs: {
        "Beam Span (L)": "6.0 meters",
        "Central Load (W)": "20 kN at midspan (x = 3m)",
        "Support Reactions": "Ra = 10 kN, Rb = 10 kN",
        "Maximum Bending Moment": "30.0 kN\xB7m at x = 3.0m"
      },
      technicalNotes: [
        "SFD steps abruptly by -W (-20 kN) directly under the concentrated load point.",
        "BMD reaches maximum where SFD passes through zero line (x = L/2).",
        "BMD profile consists of linear straight lines for point loads."
      ],
      svgContent: `<svg viewBox="0 0 540 260" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="260" fill="#0b1120" rx="12"/>
        
        <!-- Beam Span -->
        <text x="25" y="45" fill="#cbd5e1" font-family="monospace" font-size="11" font-weight="bold">BEAM (L=6m)</text>
        <line x1="120" y1="45" x2="460" y2="45" stroke="#94a3b8" stroke-width="6"/>
        
        <!-- Supports Pin (A) and Roller (B) -->
        <polygon points="120,48 110,65 130,65" fill="#64748b"/>
        <line x1="105" y1="65" x2="135" y2="65" stroke="#64748b" stroke-width="2"/>
        <text x="100" y="80" fill="#94a3b8" font-family="monospace" font-size="10">Ra=10kN</text>
        
        <polygon points="460,48 450,65 470,65" fill="#64748b"/>
        <circle cx="455" cy="68" r="3" fill="#64748b"/>
        <circle cx="465" cy="68" r="3" fill="#64748b"/>
        <text x="445" y="80" fill="#94a3b8" font-family="monospace" font-size="10">Rb=10kN</text>
        
        <!-- Load W = 20kN at center -->
        <line x1="290" y1="15" x2="290" y2="42" stroke="#ef4444" stroke-width="3"/>
        <polygon points="290,45 285,35 295,35" fill="#ef4444"/>
        <text x="265" y="12" fill="#f87171" font-family="monospace" font-size="11" font-weight="bold">W = 20 kN</text>
        
        <!-- SFD Section -->
        <text x="25" y="120" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">SFD</text>
        <line x1="120" y1="120" x2="460" y2="120" stroke="#475569" stroke-dasharray="3" stroke-width="1"/>
        <path d="M 120,120 L 120,95 L 290,95 L 290,145 L 460,145 L 460,120" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
        <rect x="120" y="95" width="170" height="25" fill="#38bdf8" fill-opacity="0.15"/>
        <rect x="290" y="120" width="170" height="25" fill="#f43f5e" fill-opacity="0.15"/>
        <text x="195" y="112" fill="#7dd3fc" font-family="monospace" font-size="10">+10 kN</text>
        <text x="365" y="137" fill="#fda4af" font-family="monospace" font-size="10">-10 kN</text>
        
        <!-- BMD Section -->
        <text x="25" y="210" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">BMD</text>
        <line x1="120" y1="230" x2="460" y2="230" stroke="#475569" stroke-dasharray="3" stroke-width="1"/>
        <polygon points="120,230 290,175 460,230" fill="#10b981" fill-opacity="0.15"/>
        <path d="M 120,230 L 290,175 L 460,230" fill="none" stroke="#34d399" stroke-width="3"/>
        <text x="260" y="170" fill="#6ee7b7" font-family="monospace" font-size="11" font-weight="bold">Mmax = 30 kNm</text>
        <text x="295" y="190" fill="#a7f3d0" font-family="monospace" font-size="10">(W\xB7L)/4</text>
      </svg>`
    }
  },
  {
    id: "ce_concrete_01",
    department: "Civil Engineering",
    subject: "Concrete Technology & Structural Design",
    topic: "Reinforced Concrete Design",
    subtopic: "Limit State Method & IS 456",
    skill: "Concrete Design",
    difficulty: "Intermediate",
    questionType: "problem-solving",
    question: "In Reinforced Concrete Design (IS 456:2000), explain the Limit State of Collapse in flexure. Differentiate between Under-Reinforced, Balanced, and Over-Reinforced beam sections. Why does IS 456 strictly discourage over-reinforced concrete beams?",
    keywords: ["is 456", "concrete design", "under-reinforced", "over-reinforced", "neutral axis", "ductility", "limit state", "brittle failure"],
    followUpTemplates: [
      "What is the formula for the limiting neutral axis depth ratio (xu_max / d) for Fe 415 and Fe 500 grade reinforcement bars?",
      "Why does IS 456 adopt partial safety factor \u03B3m = 1.5 for concrete and \u03B3m = 1.15 for steel?"
    ],
    idealAnswerPoints: [
      "Balanced section: Concrete reaches ultimate strain 0.0035 simultaneously with steel yielding (strain >= 0.87fy/Es + 0.002)",
      "Under-reinforced section (xu < xu_max): Steel yields before concrete crushes, providing ample deflection and visible cracking warning prior to collapse (ductile failure mode)",
      "Over-reinforced section (xu > xu_max): Concrete crushes explosively without steel yielding, causing sudden brittle catastrophic failure without advance warning",
      "IS 456 restricts moment capacity to limiting value Mu_lim to force ductile failure"
    ],
    explanation: "Crucial structural safety principles governing reinforced concrete codes of practice."
  },
  {
    id: "ce_soil_01",
    department: "Civil Engineering",
    subject: "Geotechnical Engineering & Foundation",
    topic: "Geotechnical Engineering",
    subtopic: "Bearing Capacity & Foundation Sizing",
    skill: "Soil Mechanics",
    difficulty: "Intermediate",
    questionType: "practical",
    question: "How do you determine the safe bearing capacity (SBC) of soil using Terzaghi Bearing Capacity Equation for shallow strip and isolated footing foundations? Explain the physical meaning of cohesion (c), surcharge (q), and unit weight (\u03B3) terms.",
    keywords: ["soil mechanics", "geotechnical", "bearing capacity", "terzaghi", "cohesion", "surcharge", "spt", "foundation"],
    followUpTemplates: [
      "How does a high groundwater table rising to the ground surface affect soil bearing capacity and effective stress?",
      "Explain how Standard Penetration Test (SPT) N-values are corrected for overburden pressure (CN) and dilatancy (\u03B7) in saturated fine sands."
    ],
    idealAnswerPoints: [
      "Terzaghi equation for strip footing: qu = c*Nc + q*Nq + 0.5*\u03B3*B*N\u03B3",
      "c*Nc term represents shear resistance contribution from soil cohesion",
      "q*Nq term represents surcharge contribution from soil overburden above foundation depth Df (q = \u03B3 * Df)",
      "0.5*\u03B3*B*N\u03B3 term represents shear resistance from soil weight in the shear failure zone beneath footing width B",
      "Safe bearing capacity SBC = (qu - q)/FOS + q, typically using Factor of Safety FOS = 2.5 to 3.0"
    ],
    explanation: "Essential geotechnical foundation sizing theory and site investigation analysis."
  },
  // =========================================================================
  // 6. MECHANICAL ENGINEERING
  // =========================================================================
  {
    id: "me_otto_diagram_01",
    department: "Mechanical Engineering",
    subject: "Thermodynamics & IC Engines",
    topic: "Thermal & Energy Systems",
    subtopic: "Thermodynamic Cycles & Efficiency",
    skill: "Thermodynamics",
    difficulty: "Beginner",
    questionType: "diagram-based",
    question: "Analyze the Air Standard Otto Cycle P-V and T-s Indicator Diagram below. Identify the four thermodynamic processes (1-2, 2-3, 3-4, 4-1). Derive the thermal efficiency formula \u03B7 = 1 - (1 / r^(\u03B3-1)) in terms of compression ratio r, and explain why compression ratio in petrol engines is limited to ~10:1.",
    keywords: ["thermodynamics", "otto cycle", "pv diagram", "compression ratio", "thermal efficiency", "isentropic", "autoignition", "knocking"],
    followUpTemplates: [
      "What is engine knocking / detonation in spark-ignition engines, and how do higher octane fuel ratings prevent pre-ignition?",
      "Compare Otto Cycle thermal efficiency with Diesel Cycle and Dual Cycle for the same compression ratio and heat input."
    ],
    idealAnswerPoints: [
      "Process 1-2: Reversible isentropic (adiabatic) compression of air-fuel mixture (s1 = s2)",
      "Process 2-3: Constant volume (isochoric) heat addition from spark combustion (Q_in = m*Cv*(T3 - T2))",
      "Process 3-4: Reversible isentropic expansion / power stroke (s3 = s4)",
      "Process 4-1: Constant volume heat rejection to exhaust (Q_out = m*Cv*(T4 - T1))",
      "Thermal efficiency \u03B7 = 1 - (Q_out / Q_in) = 1 - 1 / r^(\u03B3 - 1)",
      "Compression ratio in petrol engines is restricted to 9:1 - 11:1 to prevent premature auto-ignition (knocking/detonation)"
    ],
    explanation: "Fundamental applied thermodynamics assessment for automotive and thermal engineering.",
    diagram: {
      type: "engine",
      title: "Air Standard Otto Cycle (P-V Indicator Diagram)",
      caption: "Idealized 4-process cycle modeling spark-ignition internal combustion engines.",
      specs: {
        "Compression Ratio r": "V1 / V2 = 8.5 : 1",
        "Specific Heat Ratio \u03B3": "1.4 (for air)",
        "Theoretical Efficiency": "\u03B7 \u2248 57.5%",
        "Heat Addition": "Constant Volume (2 \u2192 3)"
      },
      technicalNotes: [
        "V2 = Clearance Volume (Vc); V1 = Total Cylinder Volume (Vc + Vs).",
        "Area enclosed by 1-2-3-4 represents net indicated work output per cycle.",
        "1-2 and 3-4 are reversible adiabatic curves governed by P\xB7V^\u03B3 = constant."
      ],
      svgContent: `<svg viewBox="0 0 540 260" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="260" fill="#0b1120" rx="12"/>
        
        <!-- P-V Axes -->
        <line x1="70" y1="210" x2="500" y2="210" stroke="#94a3b8" stroke-width="2"/>
        <line x1="70" y1="210" x2="70" y2="20" stroke="#94a3b8" stroke-width="2"/>
        <text x="475" y="230" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">Volume (V)</text>
        <text x="20" y="30" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">Pressure (P)</text>
        
        <!-- Volume limits V2 (Vc) and V1 (V1) -->
        <line x1="160" y1="210" x2="160" y2="40" stroke="#475569" stroke-dasharray="3"/>
        <text x="145" y="228" fill="#64748b" font-family="monospace" font-size="10">V2 (Vc)</text>
        
        <line x1="420" y1="210" x2="420" y2="40" stroke="#475569" stroke-dasharray="3"/>
        <text x="405" y="228" fill="#64748b" font-family="monospace" font-size="10">V1 (Total)</text>
        
        <!-- Enclosed Cycle Shading -->
        <path d="M 420,185 Q 260,165 160,110 L 160,45 Q 280,75 420,135 Z" fill="#6366f1" fill-opacity="0.15"/>
        
        <!-- Process 1 -> 2 Isentropic Compression -->
        <path d="M 420,185 Q 260,165 160,110" fill="none" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="420" cy="185" r="5" fill="#38bdf8"/>
        <circle cx="160" cy="110" r="5" fill="#38bdf8"/>
        <text x="430" y="190" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">1</text>
        <text x="140" y="115" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">2</text>
        
        <!-- Process 2 -> 3 Constant Volume Heat Addition (Qin) -->
        <line x1="160" y1="110" x2="160" y2="45" stroke="#ef4444" stroke-width="3.5"/>
        <circle cx="160" cy="45" r="5" fill="#ef4444"/>
        <text x="140" y="45" fill="#f87171" font-family="monospace" font-size="12" font-weight="bold">3</text>
        <text x="90" y="75" fill="#f87171" font-family="monospace" font-size="10" font-weight="bold">Qin (Spark)</text>
        
        <!-- Process 3 -> 4 Isentropic Expansion (Power) -->
        <path d="M 160,45 Q 280,75 420,135" fill="none" stroke="#10b981" stroke-width="3"/>
        <circle cx="420" cy="135" r="5" fill="#10b981"/>
        <text x="430" y="140" fill="#6ee7b7" font-family="monospace" font-size="12" font-weight="bold">4</text>
        <text x="290" y="75" fill="#6ee7b7" font-family="monospace" font-size="10">Power Stroke (Expansion)</text>
        
        <!-- Process 4 -> 1 Constant Volume Heat Rejection (Qout) -->
        <line x1="420" y1="135" x2="420" y2="185" stroke="#f59e0b" stroke-width="3.5"/>
        <text x="435" y="165" fill="#fde047" font-family="monospace" font-size="10">Qout (Exhaust)</text>
        
        <text x="210" y="145" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">Indicated Work = \u222E P dV</text>
      </svg>`
    }
  },
  {
    id: "me_ansys_01",
    department: "Mechanical Engineering",
    subject: "Finite Element Analysis & Design",
    topic: "Finite Element Analysis",
    subtopic: "Structural Stress & Meshing",
    skill: "ANSYS FEA",
    difficulty: "Intermediate",
    questionType: "project-based",
    question: "How do you conduct a Mesh Convergence Study in ANSYS FEA to verify numerical results? Explain the Von Mises stress failure criterion and when it is valid compared to Maximum Principal Stress theory (Rankine).",
    keywords: ["ansys", "fea", "mesh convergence", "von mises", "finite element analysis", "stress concentration", "h-method", "p-method"],
    followUpTemplates: [
      "What causes Artificial Stress Singularities at sharp internal re-entrant corners during FEA, and how do you resolve them using physical fillet radii?",
      "When performing modal dynamic analysis, what is the significance of Participation Factor and Cumulative Mass Fraction?"
    ],
    idealAnswerPoints: [
      "Mesh convergence: iteratively refine element size (h-method) or increase polynomial order (p-method) until critical result (e.g. max Von Mises stress) changes by less than 2-5%",
      "Von Mises Yield Criterion is based on Distortion Energy Theory, predicting yielding in ductile materials (steels, aluminum) when octahedral shear stress exceeds yield limit",
      "Maximum Principal Stress Theory (Rankine) is applicable for brittle materials (cast iron, glass) which fail in normal tensile cleavage rather than shear yielding",
      "Singularities at sharp corners yield infinite theoretical stress with element refinement; real geometry requires fillet radius"
    ],
    explanation: "Core mechanical simulation practices separating basic software operators from analytical engineers."
  },
  {
    id: "me_solidworks_01",
    department: "Mechanical Engineering",
    subject: "Computer Aided Design (CAD)",
    topic: "Parametric CAD & Machine Design",
    subtopic: "Part Modeling & Assemblies",
    skill: "SolidWorks",
    difficulty: "Beginner",
    questionType: "practical",
    question: "In SolidWorks parametric modeling, explain the difference between Top-Down Assembly design and Bottom-Up Assembly design. How do you resolve rebuild errors caused by Circular References / In-Context relations?",
    keywords: ["solidworks", "cad", "top-down", "bottom-up", "in-context", "mates", "parametric", "assembly"],
    followUpTemplates: [
      "How do Geometric Dimensioning and Tolerancing (GD&T) Feature Control Frames communicate Position, Runout, and Concentricity relative to primary/secondary datums?",
      "What is the difference between a flexible subassembly and a rigid subassembly when modeling linkages?"
    ],
    idealAnswerPoints: [
      "Bottom-Up: parts modeled independently in separate part files and joined in assembly file via mates (standard components, fasteners)",
      "Top-Down: parts modeled directly within assembly context referencing adjacent part geometry, allowing automatic dimensional updates when master sketch changes",
      "Circular References occur when Part A references Part B while Part B simultaneously depends on Part A",
      "Resolved by locking in-context references, isolating master skeleton sketches, or breaking external references before production release"
    ],
    explanation: "CAD methodology and engineering change management."
  },
  // =========================================================================
  // 7. AUTOMOBILE ENGINEERING
  // =========================================================================
  {
    id: "ae_abs_diagram_01",
    department: "Automobile Engineering",
    subject: "Automotive Chassis & Braking Systems",
    topic: "Chassis & Active Safety",
    subtopic: "Hydraulic Disc/Drum & Anti-Lock Braking",
    skill: "Braking & ABS",
    difficulty: "Intermediate",
    questionType: "diagram-based",
    question: "Refer to the Hydraulic Anti-Lock Braking System (ABS) Schematic below. Explain the three operational phases of the ABS Modulator Valve (Pressure Apply, Pressure Hold, Pressure Dump). How do Wheel Speed Sensors (WSS) detect incipient wheel lockup, and why does wheel lockup cause vehicle directional instability?",
    keywords: ["automobile", "abs", "anti-lock braking", "modulator", "wheel speed sensor", "hydraulic brake", "braking distance", "vehicle dynamics"],
    followUpTemplates: [
      "What is Braking Slip Ratio (\u03BB = (V_vehicle - V_wheel) / V_vehicle), and at what optimal slip percentage (typically 15-20%) is peak tire friction coefficient achieved?",
      "How does Electronic Stability Control (ESC) build upon the ABS hydraulic unit by adding yaw rate sensors and steering angle sensors to counter understeer and oversteer?"
    ],
    idealAnswerPoints: [
      "Wheel Speed Sensors (WSS Hall effect / inductive) transmit wheel rotational pulse frequency to ABS Electronic Control Unit (ECU)",
      "When rapid wheel deceleration indicates incipient lockup: ECU enters ABS modulation cycle (15-20 times per second)",
      "Pressure Hold Phase: Solenoid inlet valve closes to prevent master cylinder from applying further hydraulic pressure to caliper",
      "Pressure Dump Phase: Solenoid outlet valve opens, releasing fluid into low-pressure accumulator, powered back by hydraulic return pump",
      "Pressure Apply Phase: Fluid reapplied to restore deceleration torque",
      "Locked wheels eliminate lateral cornering tire stiffness, causing vehicle spinout and inability to steer"
    ],
    explanation: "Automotive chassis safety systems combining hydraulics, sensors, and vehicle stability physics.",
    diagram: {
      type: "schematic",
      title: "Automotive Anti-Lock Braking (ABS) Hydraulic & Electronic Loop",
      caption: "Closed-loop feedback between wheel speed sensor, ABS ECU, and electro-hydraulic modulator.",
      specs: {
        "Hydraulic Pressure": "100 - 180 bar",
        "Modulation Frequency": "15 - 20 cycles/second",
        "Target Slip Ratio": "15% - 20% optimal friction",
        "Sensor Type": "Hall Effect Active Wheel Speed Sensor"
      },
      technicalNotes: [
        "Tandem Master Cylinder supplies hydraulic pressure initiated by driver foot pedal.",
        "ABS ECU calculates wheel deceleration and slip threshold in real time.",
        "Hydraulic Return Pump scavenges dumped brake fluid back into the primary circuit."
      ],
      svgContent: `<svg viewBox="0 0 540 250" width="100%" height="230" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="250" fill="#0b1120" rx="12"/>
        
        <!-- Brake Pedal & Master Cylinder -->
        <path d="M 40,80 L 60,80 L 70,50" fill="none" stroke="#94a3b8" stroke-width="4"/>
        <rect x="70" y="65" width="60" height="30" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="75" y="85" fill="#f8fafc" font-family="monospace" font-size="10">Master Cyl</text>
        <text x="35" y="45" fill="#94a3b8" font-family="monospace" font-size="10">Pedal</text>
        
        <!-- Hydraulic line to ABS Modulator -->
        <line x1="130" y1="80" x2="190" y2="80" stroke="#38bdf8" stroke-width="3"/>
        
        <!-- ABS Hydraulic Modulator Block -->
        <rect x="190" y="45" width="160" height="120" fill="#1e293b" stroke="#6366f1" stroke-width="2.5" rx="8"/>
        <text x="210" y="68" fill="#a5b4fc" font-family="monospace" font-size="11" font-weight="bold">ABS Modulator</text>
        
        <!-- Internal Solenoid Valves -->
        <rect x="210" y="85" width="45" height="25" fill="#0f172a" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="215" y="102" fill="#fde047" font-family="monospace" font-size="9">Inlet Vlv</text>
        
        <rect x="280" y="85" width="45" height="25" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="283" y="102" fill="#fda4af" font-family="monospace" font-size="9">Outlet Vlv</text>
        
        <!-- Return Pump -->
        <circle cx="270" cy="135" r="14" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
        <text x="257" y="139" fill="#6ee7b7" font-family="monospace" font-size="9">Pump</text>
        
        <!-- Hydraulic Line to Wheel Caliper -->
        <line x1="350" y1="95" x2="430" y2="95" stroke="#38bdf8" stroke-width="3"/>
        
        <!-- Brake Caliper & Wheel Disc -->
        <circle cx="460" cy="120" r="35" fill="#1e293b" stroke="#94a3b8" stroke-width="3"/>
        <circle cx="460" cy="120" r="15" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
        <rect x="420" y="80" width="25" height="35" fill="#ef4444" stroke="#f87171" stroke-width="2" rx="4"/>
        <text x="423" y="130" fill="#fca5a5" font-family="monospace" font-size="9">Disc</text>
        
        <!-- Wheel Speed Sensor (WSS) -->
        <rect x="475" y="145" width="30" height="15" fill="#10b981" stroke="#34d399" stroke-width="1.5" rx="3"/>
        <text x="480" y="156" fill="#064e3b" font-family="monospace" font-size="9" font-weight="bold">WSS</text>
        
        <!-- ABS Electronic Control Unit (ECU) -->
        <rect x="190" y="185" width="160" height="45" fill="#0f172a" stroke="#38bdf8" stroke-width="2" rx="6"/>
        <text x="220" y="212" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">ABS ECU (Micro)</text>
        
        <!-- Signal from WSS to ECU -->
        <path d="M 490,160 L 490,205 L 350,205" fill="none" stroke="#10b981" stroke-dasharray="4" stroke-width="2"/>
        <text x="390" y="220" fill="#34d399" font-family="monospace" font-size="9">WSS Speed Pulse</text>
        
        <!-- Control line from ECU to Modulator -->
        <line x1="270" y1="185" x2="270" y2="165" stroke="#f59e0b" stroke-width="2"/>
      </svg>`
    }
  },
  {
    id: "ae_ev_powertrain_diagram_02",
    department: "Automobile Engineering",
    subject: "Electric Vehicles & Powertrains",
    topic: "Electric Vehicles & Energy Storage",
    subtopic: "Battery Management (BMS), Traction Motors & Inverters",
    skill: "EV Powertrain",
    difficulty: "Intermediate",
    questionType: "diagram-based",
    question: "Examine the Electric Vehicle (EV) Powertrain Architecture diagram below. Follow the energy flow from High-Voltage Battery Pack through Inverter to Permanent Magnet Synchronous Motor (PMSM). What key functions does the Battery Management System (BMS) perform (Cell Balancing, State of Charge SoC, Thermal Management), and how does Regenerative Braking return energy to the battery?",
    keywords: ["electric vehicle", "ev", "bms", "battery management", "inverter", "pmsm", "traction motor", "regenerative braking", "soc"],
    followUpTemplates: [
      "Compare Passive Cell Balancing (resistor bleed) against Active Cell Balancing (capacitive/inductive charge shuttling) in EV battery efficiency.",
      "What causes Thermal Runaway in Lithium-ion cells (NMC vs LFP chemistry), and what active liquid cooling safeguards are deployed?"
    ],
    idealAnswerPoints: [
      "High Voltage Pack (400V/800V DC) supplies energy to 3-Phase Traction Inverter via DC link contactors",
      "Inverter converts DC into variable-frequency, variable-voltage 3-Phase AC to drive PMSM motor using Field Oriented Control (FOC)",
      "BMS monitors individual cell voltages, pack temperature, and computes State of Charge (SoC) using Coulomb Counting and Kalman Filtering",
      "Cell Balancing equalizes state of charge across series cells to prevent individual cell overcharging or overdischarging",
      "Regenerative Braking: vehicle kinetic energy drives PMSM as an AC generator; inverter bridge acts as synchronous boost rectifier returning DC charging current into battery pack"
    ],
    explanation: "Modern automotive electrification and EV powertrain engineering analysis.",
    diagram: {
      type: "schematic",
      title: "Full Electric Vehicle (EV) Powertrain Architecture",
      caption: "High-voltage energy distribution from Li-ion pack through inverter to e-axle traction motor.",
      specs: {
        "Battery Pack Voltage": "400V DC (Nominal)",
        "Motor Type": "Permanent Magnet Synchronous (PMSM)",
        "Inverter Topology": "3-Phase IGBT / SiC MOSFET Bridge",
        "Energy Recovery": "Regenerative Braking (~25% urban range recapture)"
      },
      technicalNotes: [
        "BMS provides safety disconnect via high-voltage pyrofuse and contactors.",
        "Single-speed reduction gearbox (typically 9:1 ratio) replaces multi-gear transmission.",
        "Thermal liquid coolant loops regulate battery, inverter, and traction motor temperatures."
      ],
      svgContent: `<svg viewBox="0 0 540 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="240" fill="#0b1120" rx="12"/>
        
        <!-- Battery Pack Block -->
        <rect x="30" y="50" width="110" height="110" fill="#1e293b" stroke="#10b981" stroke-width="2.5" rx="8"/>
        <text x="42" y="75" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">Li-Ion Pack</text>
        <text x="50" y="95" fill="#6ee7b7" font-family="monospace" font-size="10">400V DC</text>
        
        <!-- BMS Module inside Battery -->
        <rect x="42" y="110" width="86" height="35" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" rx="4"/>
        <text x="52" y="132" fill="#93c5fd" font-family="monospace" font-size="10" font-weight="bold">BMS (Safety)</text>
        
        <!-- DC Bus Lines -->
        <line x1="140" y1="85" x2="200" y2="85" stroke="#ef4444" stroke-width="3"/>
        <line x1="140" y1="115" x2="200" y2="115" stroke="#38bdf8" stroke-width="3"/>
        <text x="145" y="78" fill="#f87171" font-family="monospace" font-size="9">HV DC (+)</text>
        <text x="145" y="130" fill="#93c5fd" font-family="monospace" font-size="9">HV DC (-)</text>
        
        <!-- Inverter / Motor Controller -->
        <rect x="200" y="55" width="110" height="90" fill="#1e293b" stroke="#818cf8" stroke-width="2.5" rx="8"/>
        <text x="215" y="80" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">Traction</text>
        <text x="220" y="98" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">Inverter</text>
        <text x="215" y="125" fill="#fbbf24" font-family="monospace" font-size="9">DC \u2192 3-Phase AC</text>
        
        <!-- 3-Phase AC Lines -->
        <line x1="310" y1="80" x2="365" y2="80" stroke="#f59e0b" stroke-width="2.5"/>
        <line x1="310" y1="100" x2="365" y2="100" stroke="#f59e0b" stroke-width="2.5"/>
        <line x1="310" y1="120" x2="365" y2="120" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="320" y="70" fill="#fde047" font-family="monospace" font-size="9">U, V, W</text>
        
        <!-- Electric Traction Motor (PMSM) -->
        <circle cx="410" cy="100" r="42" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
        <text x="390" y="95" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="bold">PMSM</text>
        <text x="382" y="112" fill="#93c5fd" font-family="monospace" font-size="10">e-Motor</text>
        
        <!-- Mechanical Driveshaft & Wheels -->
        <line x1="452" y1="100" x2="490" y2="100" stroke="#94a3b8" stroke-width="6"/>
        <rect x="490" y="60" width="22" height="80" fill="#0f172a" stroke="#64748b" stroke-width="3" rx="4"/>
        <text x="475" y="50" fill="#94a3b8" font-family="monospace" font-size="10">Wheel / Axle</text>
        
        <!-- Bi-directional energy flow labels -->
        <text x="140" y="190" fill="#34d399" font-family="monospace" font-size="10">\u2190 \u2500\u2500 Regenerative Braking Energy Return \u2500\u2500 \u2190</text>
        <text x="140" y="210" fill="#38bdf8" font-family="monospace" font-size="10">\u2192 \u2500\u2500 Forward Propulsion Traction Drive \u2500\u2500 \u2192</text>
      </svg>`
    }
  },
  {
    id: "ae_transmission_01",
    department: "Automobile Engineering",
    subject: "Automotive Transmission Systems",
    topic: "Automotive Drivetrain",
    subtopic: "Gearbox, Differential & Clutches",
    skill: "Transmission Systems",
    difficulty: "Intermediate",
    questionType: "problem-solving",
    question: "How does an Open Differential divide torque equally between driven wheels while allowing speed differentiation during cornering? What is the role of the Epicyclic (Planetary) Gearset in automatic transmissions?",
    keywords: ["differential", "gearbox", "transmission", "torque", "epicyclic", "planetary gears", "clutch", "drivetrain"],
    followUpTemplates: [
      "What happens when one drive wheel hits ice in a vehicle equipped with an open differential vs a Limited Slip Differential (LSD) or Electronic Differential Lock (EDL)?",
      "Explain the working principle of a Torque Converter and why a lock-up clutch is engaged at highway cruising speeds."
    ],
    idealAnswerPoints: [
      "Open differential uses bevel pinions and sun gears; delivers equal torque (50/50 split) to both half-shafts while allowing different wheel speeds: (N_left + N_right) / 2 = N_crown_wheel",
      "If one wheel loses traction on ice, torque delivered to both wheels is limited to the traction limit of the slipping wheel, causing loss of drive",
      "Limited Slip Differential (LSD) uses clutch packs or Torsen worm gears to bias torque to the wheel with higher traction",
      "Planetary gear sets achieve multiple gear ratios without disengaging gears by holding the sun gear, ring gear, or carrier"
    ],
    explanation: "Core powertrain driveline engineering mechanics."
  },
  // =========================================================================
  // 8. DATA SCIENCE & MACHINE LEARNING ENGINEERING
  // =========================================================================
  {
    id: "ds_bias_variance_01",
    department: "Data Science & Machine Learning Engineering",
    subject: "Machine Learning Theory & Statistics",
    topic: "Statistical & Predictive Modeling",
    subtopic: "Supervised Algorithms & Regularization",
    skill: "Machine Learning",
    difficulty: "Intermediate",
    questionType: "conceptual",
    question: "How do you detect and mitigate the Bias-Variance tradeoff in supervised learning? Explain mathematically how L1 (Lasso) and L2 (Ridge) regularizations affect feature weights.",
    keywords: ["machine learning", "bias", "variance", "overfitting", "regularization", "lasso", "ridge", "l1", "l2"],
    followUpTemplates: [
      "In an imbalanced classification problem with 99:1 class ratio, why is accuracy misleading and which metrics (PR-AUC, F1, Cost Matrix) do you choose?",
      "When would you prefer tree-based gradient boosting (XGBoost) over deep neural networks on tabular datasets?"
    ],
    idealAnswerPoints: [
      "Total error = Bias^2 + Variance + Irreducible error",
      "High bias (underfitting): high train and test error; fix with more complex model or more features",
      "High variance (overfitting): low train error, high test error; fix with regularization, cross-validation, dropout",
      "L2 adds \u03BB\u2211w^2, smoothly shrinking weights toward zero; L1 adds \u03BB\u2211|w|, driving weights to strictly zero for feature sparsity"
    ],
    explanation: "Core machine learning modeling theory and generalization optimization."
  },
  {
    id: "ds_spark_01",
    department: "Data Science & Machine Learning Engineering",
    subject: "Distributed Data Systems",
    topic: "Big Data & Distributed Computing",
    subtopic: "PySpark & Distributed Shuffles",
    skill: "Apache Spark",
    difficulty: "Advanced",
    questionType: "problem-solving",
    question: "In Apache Spark, explain the difference between Narrow and Wide dependencies. What causes data skew during distributed joins, and how do you resolve it in production?",
    keywords: ["spark", "pyspark", "narrow", "wide", "shuffle", "skew", "partition", "broadcast join", "salting"],
    followUpTemplates: [
      "How does Spark Catalyst Optimizer leverage Adaptive Query Execution (AQE) to coalesce shuffle partitions dynamically?",
      "Compare Broadcast Hash Joins against Sort-Merge Joins in memory consumption and network I/O."
    ],
    idealAnswerPoints: [
      "Narrow dependencies (map, filter): partitions processed locally on worker without network shuffle",
      "Wide dependencies (groupByKey, join): require shuffling data across cluster network, creating stage boundary",
      "Data skew occurs when one join key holds disproportionate records, creating straggler tasks",
      "Resolved via Broadcast Join (for small tables) or Key Salting (adding random prefix/suffix to distribute skewed keys)"
    ],
    explanation: "Distributed big data architecture and cluster query optimization."
  },
  {
    id: "ds_mlops_01",
    department: "Data Science & Machine Learning Engineering",
    subject: "MLOps & Model Lifecycle",
    topic: "Production Machine Learning",
    subtopic: "Model Serving & Drift Detection",
    skill: "MLOps",
    difficulty: "Advanced",
    questionType: "scenario",
    question: "How do you distinguish between Data Drift (Covariate Shift) and Concept Drift in production ML? Design an automated monitoring architecture to detect drift and trigger retraining.",
    keywords: ["mlops", "drift", "concept drift", "data drift", "monitoring", "retraining", "ks test", "psi", "mlflow"],
    followUpTemplates: [
      "What statistical tests (Kolmogorov-Smirnov, Population Stability Index, Wasserstein Distance) do you run on streaming inferences?",
      "How do Shadow Deployments and Canary Releases protect production systems when rolling out updated ML models?"
    ],
    idealAnswerPoints: [
      "Data Drift: input feature distribution P(X) changes while P(Y|X) remains constant",
      "Concept Drift: relationship between features and target P(Y|X) shifts over time",
      "Monitoring pipeline: Kafka stream logs inferences -> worker computes daily KS-test / PSI against baseline -> triggers alert if PSI > 0.2",
      "Retraining pipeline: pull latest labeled ground truth -> train candidate model -> champion vs challenger test -> automated artifact registration"
    ],
    explanation: "Production machine learning reliability, drift monitoring, and continuous deployment."
  }
];

// src/nlp/departmentQuestionPools.ts
var DEPARTMENT_QUESTION_POOLS = {
  // ===========================================================================
  // 1. COMPUTER SCIENCE & ENGINEERING (CSE)
  // ===========================================================================
  "Computer Science & Engineering": [
    // --- Coding / DSA Problems ---
    {
      id: "cse_dsa_valid_parentheses_01",
      department: "Computer Science & Engineering",
      subject: "Data Structures & Algorithms",
      topic: "Core Computer Science",
      subtopic: "Stacks & String Parsing",
      skill: "Data Structures",
      difficulty: "Beginner",
      questionType: "coding",
      question: "Implement an algorithm to determine if an input string containing characters '(', ')', '{', '}', '[' and ']' is valid. Brackets must close in the correct order and match corresponding types.",
      keywords: ["stack", "parentheses", "brackets", "o(n)", "lifo", "parsing", "data structures"],
      followUpTemplates: [
        'How would you adapt this algorithm if the string also contains arithmetic expressions like "(a + [b * c])"?',
        'What is the worst-case space complexity if all brackets are opening brackets (e.g. "((((((")?'
      ],
      idealAnswerPoints: [
        "Initialize an empty stack to track unmatched opening brackets",
        "Map each closing bracket to its corresponding opening bracket",
        "For each character: if opening, push to stack; if closing, pop from stack and check matching type",
        "Return true if and only if stack is empty after iterating through entire string",
        "Time Complexity: O(n) linear pass; Space Complexity: O(n) auxiliary stack"
      ],
      explanation: "Classic stack evaluation testing LIFO order, bracket balance, and linear time complexity.",
      learningExplanation: "Stacks enforce Last-In-First-Out (LIFO). When you see an opening bracket, push it. When you see a closing bracket, it MUST match the most recently opened bracket on top of the stack. If the stack is empty when a closing bracket arrives, or doesn't match, it is invalid.",
      whatToStudyNext: "Monotonic stack problems (e.g. Next Greater Element, Daily Temperatures).",
      recommendedPracticeQuestion: "Implement Min-Stack supporting push, pop, top, and retrieving the minimum element in O(1) time.",
      referenceAnswer: "Use a stack: push opening brackets; for closing brackets, check if stack is non-empty and top matches; return stack.isEmpty() at the end.",
      exampleSolution: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in map) {
      if (stack.length === 0 || stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      codingProblem: {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.",
        defaultLanguage: "javascript",
        starterCodes: {
          javascript: `function isValid(s) {
  // TODO: Implement O(n) stack solution
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  for (let c of s) {
    if (c in pairs) {
      if (stack.pop() !== pairs[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}`,
          python: `def is_valid(s: str) -> bool:
    # TODO: Implement stack validation
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
          cpp: `#include <string>
#include <stack>

bool isValid(std::string s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}`,
          java: `import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`
        },
        testCases: [
          { id: "tc1", input: '"()"', expectedOutput: "true", explanation: "Matching simple parentheses" },
          { id: "tc2", input: '"()[]{}"', expectedOutput: "true", explanation: "All pairs properly closed" },
          { id: "tc3", input: '"(]"', expectedOutput: "false", explanation: "Mismatched types" },
          { id: "tc4", input: '"([)]"', expectedOutput: "false", explanation: "Wrong closing order" }
        ]
      }
    },
    {
      id: "cse_dsa_reverse_linkedlist_02",
      department: "Computer Science & Engineering",
      subject: "Data Structures & Algorithms",
      topic: "Core Computer Science",
      subtopic: "Pointers & Singly Linked Lists",
      skill: "Data Structures",
      difficulty: "Intermediate",
      questionType: "coding",
      question: "Given the head of a singly linked list, reverse the list in-place in O(n) time and O(1) auxiliary space, and return the new head.",
      keywords: ["linked list", "pointers", "in-place", "reverse", "o(1) space", "o(n) time"],
      followUpTemplates: [
        "How would you implement this recursively, and what would be the call stack space complexity?",
        "How do you detect if a linked list contains a cycle before attempting to reverse it?"
      ],
      idealAnswerPoints: [
        "Initialize three pointers: prev = null, curr = head, next = null",
        "Iterate while curr !== null: store next = curr.next, redirect curr.next = prev, advance prev = curr, advance curr = next",
        "Return prev as the new head of the reversed list",
        "Guarantees O(n) time complexity and strictly O(1) auxiliary space"
      ],
      explanation: "Standard pointer manipulation challenge verifying reference management without memory leaks.",
      learningExplanation: "Reversing a linked list requires breaking existing forward pointers and pointing them backward. We must cache curr.next before mutating curr.next = prev, otherwise we lose reference to the remainder of the list.",
      whatToStudyNext: "Floyd's Cycle Detection (Tortoise and Hare algorithm) and reversing linked lists in k-group.",
      recommendedPracticeQuestion: "Reverse a linked list from position m to n in one single pass.",
      referenceAnswer: "Three-pointer method: prev = null, curr = head. In a while loop, cache next = curr.next, set curr.next = prev, shift prev = curr and curr = next. Return prev.",
      exampleSolution: `class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    let nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`
    },
    // --- SQL & Database Queries ---
    {
      id: "cse_sql_groupby_having_03",
      department: "Computer Science & Engineering",
      subject: "Database Systems & SQL",
      topic: "Database Systems",
      subtopic: "Aggregations & Group Filtering",
      skill: "SQL",
      difficulty: "Intermediate",
      questionType: "sql",
      question: "Write a SQL query on an `employees(id, name, department_id, salary)` table to find all `department_id`s that have more than 5 employees and an average salary strictly greater than $60,000. Explain the execution order difference between WHERE and HAVING.",
      keywords: ["sql", "group by", "having", "aggregate", "avg", "count", "where vs having", "filtering"],
      followUpTemplates: [
        "Why can you NOT use aggregate functions like COUNT() or AVG() inside a WHERE clause?",
        "How does the database engine utilize an index on (department_id, salary) to optimize this aggregation?"
      ],
      idealAnswerPoints: [
        "SQL Query: SELECT department_id, COUNT(*) AS emp_count, AVG(salary) AS avg_sal FROM employees GROUP BY department_id HAVING COUNT(*) > 5 AND AVG(salary) > 60000;",
        "Execution Order: FROM -> WHERE (filters individual rows before grouping) -> GROUP BY (aggregates rows into buckets) -> HAVING (filters aggregated groups) -> SELECT -> ORDER BY",
        "WHERE filters base row tuples; HAVING filters post-aggregation group metrics"
      ],
      explanation: "Tests precision in SQL aggregate grouping, filtering phases, and database query engine execution order.",
      learningExplanation: "WHERE filters rows before they are grouped; hence it cannot reference aggregate values like AVG(). GROUP BY collates remaining rows into summary buckets. HAVING evaluates conditions on those summary buckets.",
      whatToStudyNext: "SQL Window Functions (ROW_NUMBER(), RANK(), DENSE_RANK()) and Common Table Expressions (WITH).",
      recommendedPracticeQuestion: "Write a query to find the 2nd highest salary in each department using DENSE_RANK().",
      referenceAnswer: "SELECT department_id FROM employees GROUP BY department_id HAVING COUNT(*) > 5 AND AVG(salary) > 60000;",
      exampleSolution: `SELECT department_id, COUNT(*) AS total_staff, ROUND(AVG(salary), 2) AS average_salary
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5 AND AVG(salary) > 60000;`
    },
    {
      id: "cse_sql_joins_acid_04",
      department: "Computer Science & Engineering",
      subject: "Database Systems & SQL",
      topic: "Database Systems",
      subtopic: "Joins, Indexing & ACID Transactions",
      skill: "MySQL",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN. How do B-Tree indexes accelerate SQL lookups, and what are the ACID properties in database transactions?",
      keywords: ["inner join", "left join", "b-tree index", "acid", "atomicity", "consistency", "isolation", "durability"],
      followUpTemplates: [
        "What are composite indexes, and how does the leftmost prefix rule affect their query coverage?",
        "What is a phantom read, and which SQL transaction isolation level prevents it?"
      ],
      idealAnswerPoints: [
        "INNER JOIN: Returns rows with matching keys in both tables",
        "LEFT JOIN: Returns all rows from left table, with matching right table rows or NULL",
        "FULL OUTER JOIN: Returns all rows when there is a match in either left or right table",
        "B-Tree Index: Self-balancing multi-way tree providing O(log n) lookups, range scans, and ordered traversal",
        "ACID Properties: Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent independence), Durability (persisted on disk)"
      ],
      explanation: "Evaluates relational database principles, indexing data structures, and transactional guarantees.",
      learningExplanation: "B-Tree indexes keep keys sorted on disk pages, allowing logarithmic binary search instead of full table scans (O(n)). ACID guarantees ensure financial and critical business transactions cannot corrupt data during crashes.",
      whatToStudyNext: "Transaction isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
      recommendedPracticeQuestion: "Explain when an index scan can become slower than a sequential scan."
    },
    // --- Web Development & APIs ---
    {
      id: "cse_web_rest_apis_05",
      department: "Computer Science & Engineering",
      subject: "Web Technologies & APIs",
      topic: "Backend Web & API Architecture",
      subtopic: "REST Principles & HTTP Protocols",
      skill: "REST APIs",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the core architectural constraints of REST APIs. What is the difference between GET, POST, PUT, PATCH, and DELETE? Which methods are idempotent, and what do HTTP status codes 200, 201, 400, 401, 403, 404, and 500 indicate?",
      keywords: ["rest", "http methods", "idempotent", "get", "post", "put", "patch", "status codes", "api design"],
      followUpTemplates: [
        "Why is PUT considered idempotent while POST is not idempotent?",
        "What is the architectural difference between 401 Unauthorized and 403 Forbidden?"
      ],
      idealAnswerPoints: [
        "REST Constraints: Statelessness, Client-Server separation, Uniform Interface, Cacheability, Layered System",
        "HTTP Methods: GET (read), POST (create new), PUT (replace entire resource), PATCH (partial update), DELETE (remove)",
        "Idempotence: Executing identical request multiple times yields the same state (GET, PUT, DELETE are idempotent; POST is NOT)",
        "Status Codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized (missing auth), 403 Forbidden (authenticated but no permission), 404 Not Found, 500 Server Error"
      ],
      explanation: "Tests mastery of modern API communication standards, HTTP semantics, and security status codes.",
      learningExplanation: "Idempotency means f(f(x)) = f(x). If a network timeout occurs during a PUT or DELETE, the client can safely retry. For POST, retrying could create duplicate records unless idempotent tokens are utilized.",
      whatToStudyNext: "JWT authentication, CORS preflight requests (OPTIONS), and API rate limiting.",
      recommendedPracticeQuestion: "Design a RESTful API contract for an e-commerce order management system."
    },
    // --- AI / ML / Libraries ---
    {
      id: "cse_aiml_supervised_eval_06",
      department: "Computer Science & Engineering",
      subject: "Artificial Intelligence & Machine Learning",
      topic: "Machine Learning & AI",
      subtopic: "Model Evaluation & Overfitting",
      skill: "Scikit-learn",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the difference between Precision, Recall, and F1-Score in binary classification. In what real-world scenarios would you prioritize Precision over Recall (and vice versa)? How do you detect and mitigate overfitting in machine learning models?",
      keywords: ["precision", "recall", "f1-score", "confusion matrix", "overfitting", "regularization", "cross-validation"],
      followUpTemplates: [
        "How does k-fold cross-validation give a more realistic assessment than a single train-test split?",
        "What does an ROC-AUC curve represent, and how is it interpreted when classes are heavily imbalanced?"
      ],
      idealAnswerPoints: [
        "Precision = TP / (TP + FP): Proportion of predicted positives that were actually positive",
        "Recall = TP / (TP + FN): Proportion of actual positives captured by the model",
        "F1-Score = 2 * (Precision * Recall) / (Precision + Recall): Harmonic mean balancing both",
        "Prioritize Precision: Spam filtering (avoid labeling valid emails as spam) or search results",
        "Prioritize Recall: Medical diagnosis or cancer detection (never miss a true disease case)",
        "Mitigate Overfitting: Cross-validation, regularization (L1/L2), pruning/dropout, simplifying model complexity, gathering more data"
      ],
      explanation: "Core machine learning competency testing metrics selection, confusion matrix interpretation, and overfitting mitigation.",
      learningExplanation: "Accuracy is misleading on imbalanced datasets (e.g. 99% non-fraud). Precision measures prediction accuracy; Recall measures detection completeness. Harmonic mean F1 penalizes extreme imbalances between the two.",
      whatToStudyNext: "Hyperparameter tuning with GridSearchCV/RandomizedSearchCV, and ensemble gradient boosting (XGBoost).",
      recommendedPracticeQuestion: "Write a Python snippet with Scikit-learn using cross_val_score and classification_report on a train/test pipeline."
    },
    // --- Core CS: Operating Systems ---
    {
      id: "cse_os_virtual_memory_07",
      department: "Computer Science & Engineering",
      subject: "Operating Systems",
      topic: "Core Computer Science",
      subtopic: "Virtual Memory & Page Faults",
      skill: "Operating Systems",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain how Virtual Memory and Paging work in modern Operating Systems. What happens step-by-step when a Page Fault occurs, and what is Thrashing?",
      keywords: ["virtual memory", "paging", "page table", "tlb", "page fault", "mmu", "thrashing", "swap space"],
      followUpTemplates: [
        "How does the Translation Lookaside Buffer (TLB) accelerate virtual-to-physical address translation?",
        "What is the difference between preemptive and non-preemptive CPU scheduling algorithms?"
      ],
      idealAnswerPoints: [
        "Virtual Memory maps process virtual address space to physical RAM using pages and page tables managed by MMU",
        "Page Fault Sequence: CPU accesses virtual address not in RAM -> MMU triggers page fault trap -> OS takes control -> OS finds free physical frame (or evicts victim page using LRU) -> disk I/O reads page into RAM -> updates Page Table & TLB -> restarts faulting instruction",
        "Thrashing: OS spends more time swapping pages between disk and RAM than executing actual CPU instructions due to overcommitted memory"
      ],
      explanation: "Examines core system architecture, memory virtualization, and hardware-OS interaction.",
      learningExplanation: "Virtual memory isolates processes and gives each process the illusion of continuous contiguous memory. When a page is absent from RAM, hardware interrupts the CPU and the OS disk driver fetches it synchronously.",
      whatToStudyNext: "Deadlock detection with Banker's Algorithm, and inter-process communication (IPC) via shared memory and pipes.",
      recommendedPracticeQuestion: "Calculate effective memory access time given TLB access time of 10ns, memory access of 100ns, and 90% TLB hit ratio."
    },
    // --- Core CS: Computer Networks ---
    {
      id: "cse_networks_dns_http_08",
      department: "Computer Science & Engineering",
      subject: "Computer Networks",
      topic: "Networking & Protocols",
      subtopic: "DNS & Application Layer Protocols",
      skill: "Computer Networks",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: 'Explain what happens from the moment a user types "https://www.google.com" into a browser until the webpage renders. Detail the DNS lookup, TLS/SSL handshake, HTTP request/response, and browser rendering process.',
      keywords: ["dns", "tls handshake", "tcp handshake", "http", "https", "dom", "rendering engine", "arp"],
      followUpTemplates: [
        "How does asymmetric encryption establish symmetric session keys during the TLS handshake?",
        "What advantages does HTTP/2 multiplexing provide over HTTP/1.1 head-of-line blocking?"
      ],
      idealAnswerPoints: [
        "1. Browser checks local DNS cache, OS cache, router cache, and queries Recursive DNS Resolver -> Root -> TLD (.com) -> Authoritative server to resolve IP address",
        "2. TCP 3-way handshake (SYN, SYN-ACK, ACK) on port 443",
        "3. TLS Handshake: Client Hello -> Server Hello + Certificate -> Key Exchange (ECDHE/RSA) -> symmetric AES session keys established",
        "4. Browser sends HTTP GET request; Server processes and returns HTML response with status code 200",
        "5. Browser parses HTML into DOM tree, CSS into CSSOM tree, combines them into Render Tree, computes layout, and paints pixels"
      ],
      explanation: "End-to-end full-stack systems question integrating networks, security, protocols, and browser rendering engines.",
      learningExplanation: "This classic systems question tests whether a student understands how the entire software and networking stack fits together: DNS resolution, TCP reliability, cryptographic handshakes, and front-end browser painting pipelines.",
      whatToStudyNext: "Content Delivery Networks (CDNs), WebSocket protocol for bidirectional communication, and QUIC (HTTP/3).",
      recommendedPracticeQuestion: "Diagram the cryptographic steps of an ECDHE TLS 1.3 handshake."
    }
  ],
  // ===========================================================================
  // 2. INFORMATION TECHNOLOGY (IT)
  // ===========================================================================
  "Information Technology": [
    {
      id: "it_cloud_iaas_paas_01",
      department: "Information Technology",
      subject: "Cloud Computing & Infrastructure",
      topic: "Cloud Architecture & DevOps",
      subtopic: "Service Models & Virtualization",
      skill: "Cloud Computing",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the differences between IaaS, PaaS, SaaS, and Serverless (FaaS) in Cloud Computing. When designing a scalable web application, under what criteria would you choose AWS Lambda/FaaS over containerized ECS/Kubernetes?",
      keywords: ["iaas", "paas", "saas", "serverless", "faas", "aws lambda", "kubernetes", "scalability", "cloud"],
      followUpTemplates: [
        "What is the cold start problem in serverless functions, and how can it be mitigated?",
        "How do AWS Availability Zones (AZs) and Multi-Region deployments provide disaster recovery and high availability?"
      ],
      idealAnswerPoints: [
        "IaaS (EC2): Full VM control, manage OS and runtime; PaaS (Elastic Beanstalk, Heroku): Managed platform, developer supplies code; SaaS: Turnkey applications (Gmail)",
        "Serverless / FaaS (AWS Lambda): Event-driven, auto-scales to zero, zero server provisioning, pay strictly per millisecond executed",
        "Choose FaaS for: Sporadic workloads, event processing (S3 uploads, webhooks), low operational maintenance, bursty traffic",
        "Choose Containers (K8s/ECS) for: Long-running microservices, complex state, low latency (no cold starts), predictable high throughput"
      ],
      explanation: "Tests cloud infrastructure decision-making, cost trade-offs, and architecture design.",
      learningExplanation: "Cloud service models trade control for abstraction. Serverless eliminates infrastructure management and idle costs, but suffers from cold starts and execution timeout limits. Containers provide consistency and lower unit costs at steady high volume.",
      whatToStudyNext: "Infrastructure as Code (Terraform) and cloud networking (VPC, subnets, route tables, security groups).",
      recommendedPracticeQuestion: "Design an event-driven thumbnail generation architecture using S3, Lambda, and DynamoDB."
    },
    {
      id: "it_security_oauth_jwt_02",
      department: "Information Technology",
      subject: "Cybersecurity & Authentication",
      topic: "Cybersecurity & Authentication",
      subtopic: "Token-based Auth & Protocols",
      skill: "Cybersecurity",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain how JSON Web Tokens (JWT) work. What are its three segments (Header, Payload, Signature)? What is the difference between authentication and authorization, and how does OAuth 2.0 handle delegated access?",
      keywords: ["jwt", "oauth 2.0", "authentication", "authorization", "signature", "base64", "tokens", "security"],
      followUpTemplates: [
        "Why should you NEVER store sensitive passwords or credit card numbers in a JWT payload?",
        "How does a server invalidate a JWT before its expiration time if the secret key is not changed?"
      ],
      idealAnswerPoints: [
        "JWT Segments: Header (algorithm & token type), Payload (claims/user data - base64 encoded, readable by anyone), Signature (HMACSHA256(header + payload, secret))",
        'Authentication: Verifies identity ("Who are you?"); Authorization: Verifies permissions ("What are you allowed to do?")',
        "OAuth 2.0: Delegated authorization framework where user grants third-party application limited access without sharing credentials, issuing an Access Token via Authorization Code Grant",
        "Security rule: Signature ensures token integrity; payload is NOT encrypted unless JWE is utilized"
      ],
      explanation: "Evaluates production authentication standards, token structures, and identity federation.",
      learningExplanation: "JWTs are signed, not encrypted by default. Anyone can decode the Base64 payload. The signature verifies the token was created by your server and was not tampered with in transit.",
      whatToStudyNext: "Refresh token rotation strategies, CSRF prevention with HttpOnly cookies, and Role-Based Access Control (RBAC).",
      recommendedPracticeQuestion: "Walk through the 4 steps of the OAuth 2.0 Authorization Code flow with PKCE."
    },
    {
      id: "it_devops_docker_k8s_03",
      department: "Information Technology",
      subject: "DevOps & Systems Engineering",
      topic: "DevOps & Software Tools",
      subtopic: "Containerization & Orchestration",
      skill: "Docker",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain how Docker containers differ from traditional Virtual Machines (VMs) regarding kernel sharing and resource overhead. In Kubernetes, what is a Pod, and what is the role of the Kubelet, API Server, and Ingress Controller?",
      keywords: ["docker", "containers", "virtual machines", "cgroups", "namespaces", "kubernetes", "pod", "kubelet", "ingress"],
      followUpTemplates: [
        "How do Linux namespaces and cgroups provide process isolation and resource limits in Docker?",
        "What is a Blue-Green deployment, and how does Kubernetes Service switching achieve zero-downtime releases?"
      ],
      idealAnswerPoints: [
        "Docker vs VM: VMs include a full guest OS running on a Hypervisor (heavyweight, minutes to boot); Docker shares the host OS kernel and isolates processes via Linux namespaces and cgroups (lightweight, megabytes in size, boots in milliseconds)",
        "Kubernetes Pod: The smallest deployable computing unit, encapsulating one or more containers sharing network and storage",
        "Kubelet: Agent running on each worker node ensuring containers described in PodSpecs are running and healthy",
        "API Server: Central control plane entry point that exposes the K8s HTTP API and stores state in etcd",
        "Ingress: Manages external HTTP/HTTPS routing into internal cluster Services"
      ],
      explanation: "Validates modern DevOps fundamentals, container runtimes, and cluster orchestration architectures.",
      learningExplanation: "Containers achieve isolation by virtualizing the OS kernel rather than the underlying hardware. Kubernetes automates scheduling, health checking, auto-scaling, and rolling updates for distributed container clusters.",
      whatToStudyNext: "CI/CD pipeline construction with GitHub Actions, Helm chart templating, and Prometheus/Grafana monitoring.",
      recommendedPracticeQuestion: "Write a multi-stage Dockerfile that compiles a Node.js/Go app and copies only the binary to an alpine image."
    },
    {
      id: "it_db_nosql_cap_04",
      department: "Information Technology",
      subject: "Database Systems",
      topic: "Database Systems",
      subtopic: "NoSQL & Distributed Systems",
      skill: "MongoDB",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "State the CAP Theorem for distributed data stores. Why can a distributed database only guarantee at most two of Consistency, Availability, and Partition Tolerance? Compare SQL (relational) vs NoSQL (Document/Key-Value) design trade-offs.",
      keywords: ["cap theorem", "consistency", "availability", "partition tolerance", "nosql", "mongodb", "sharding", "acid vs base"],
      followUpTemplates: [
        "How does MongoDB handle network partitions in a Replica Set when the Primary node becomes unreachable?",
        "What is the difference between vertical scaling (Scale-Up) and horizontal scaling (Scale-Out)?"
      ],
      idealAnswerPoints: [
        "CAP Theorem: In the presence of a network partition (P), a distributed system must choose between Consistency (C - every read returns the most recent write) or Availability (A - every non-failing node returns a response)",
        "Network partitions are inevitable in real-world distributed networks; hence systems are either CP (e.g. MongoDB, HBase) or AP (e.g. Cassandra, DynamoDB)",
        "SQL vs NoSQL: SQL guarantees strong schema, ACID transactions, complex joins, vertical scaling; NoSQL provides flexible schema, high write throughput, seamless horizontal sharding, BASE consistency"
      ],
      explanation: "Assesses distributed database theory, consensus under partition failures, and architecture selection.",
      learningExplanation: "When network cables break between data centers (Partition), you must either reject requests to prevent stale reads (CP), or allow nodes to respond with potentially outdated data (AP). There is no third option.",
      whatToStudyNext: "Distributed consensus algorithms (Raft, Paxos) and database sharding partition keys.",
      recommendedPracticeQuestion: "Explain eventual consistency and how vector clocks or read repairs resolve conflicting writes."
    }
  ],
  // ===========================================================================
  // 3. ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // ===========================================================================
  "Electronics & Communication Engineering": [
    {
      id: "ece_pcb_design_layout_01",
      department: "Electronics & Communication Engineering",
      subject: "Circuit Design & PCB Engineering",
      topic: "Circuit Design & Hardware Troubleshooting",
      subtopic: "PCB Layout & Signal Integrity",
      skill: "PCB Design",
      difficulty: "Intermediate",
      questionType: "practical",
      question: "Explain the critical design rules for high-speed PCB layout. Why are continuous ground reference planes essential, where should decoupling capacitors be positioned relative to IC power pins, and how do you prevent Electromagnetic Interference (EMI) and crosstalk?",
      keywords: ["pcb design", "ground plane", "decoupling capacitor", "trace impedance", "emi", "crosstalk", "signal integrity", "kicad"],
      followUpTemplates: [
        "Why does a split or void in a ground plane directly beneath a high-speed signal trace cause severe EMI emissions?",
        "How is differential pair trace impedance (e.g. 90-ohm USB, 100-ohm Ethernet) calculated and maintained during routing?"
      ],
      idealAnswerPoints: [
        "Continuous Ground Plane: High-frequency return currents travel directly beneath the signal trace along the path of lowest inductance; voids force return currents to loop around, creating dipole antennas and EMI",
        "Decoupling Capacitors: Must be placed as close as physically possible to IC VDD/GND pins with minimal trace length and low-inductance vias directly to planes to absorb transient switching noise",
        "EMI & Crosstalk Mitigation: Maintain 3W trace separation rule, avoid 90-degree trace corners (use 45-degree or curved bends), isolate sensitive analog circuits from noisy digital switching regulators, and stitch ground planes with vias"
      ],
      explanation: "Essential practical hardware competency testing PCB layout, signal integrity, and EMI/EMC compliance.",
      learningExplanation: "At high frequencies, current does not follow the path of least resistance\u2014it follows the path of least inductance directly under the signal line. Any gap in the reference plane forces current into wide loops that radiate RF noise and cause signal degradation.",
      whatToStudyNext: "4-layer PCB stackup design (Signal-GND-Power-Signal) and controlled trace impedance calculation (Microstrip vs Stripline).",
      recommendedPracticeQuestion: "Sketch the placement of bulk and ceramic decoupling capacitors for an STM32/ESP32 microcontroller power rail."
    },
    {
      id: "ece_circuits_opamp_02",
      department: "Electronics & Communication Engineering",
      subject: "Analog Electronics & Circuits",
      topic: "Analog & Digital Electronics",
      subtopic: "Operational Amplifiers & Feedback",
      skill: "Analog Electronics",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the concept of Virtual Ground in an inverting operational amplifier (Op-Amp) circuit. What are the ideal characteristics of an Op-Amp (input impedance, output impedance, open-loop gain, bandwidth, CMRR), and how do real op-amps differ?",
      keywords: ["op-amp", "virtual ground", "inverting amplifier", "input impedance", "open-loop gain", "cmrr", "slew rate", "feedback"],
      followUpTemplates: [
        "What is Slew Rate, and how does it limit the maximum undistorted output frequency of an op-amp circuit?",
        "How does Common Mode Rejection Ratio (CMRR) enable differential instrumentation amplifiers to eliminate noise in ECG/sensor circuits?"
      ],
      idealAnswerPoints: [
        "Virtual Ground Concept: In negative feedback, huge open-loop gain (A -> infinity) drives the differential voltage (V+ - V-) towards zero. If non-inverting terminal V+ is tied to physical ground (0V), inverting terminal V- is held at 0V virtual ground without drawing current",
        "Ideal Characteristics: Input Impedance Zin = infinity, Output Impedance Zout = 0, Open-loop gain Aol = infinity, Bandwidth = infinity, Offset voltage = 0, CMRR = infinity",
        "Real Op-Amp Constraints: Finite gain (~10^5 to 10^6), input bias current, non-zero offset voltage, finite bandwidth (Gain-Bandwidth Product), and finite slew rate"
      ],
      explanation: "Foundational analog electronics topic testing operational amplifier analysis, feedback theory, and practical limitations.",
      learningExplanation: "Negative feedback forces the amplifier to continuously adjust its output until the two input pins are at equal voltage. If one pin is grounded, the other becomes a virtual ground, serving as an ideal summing node for currents.",
      whatToStudyNext: "Active filter design (Sallen-Key low-pass/high-pass) and Instrumentation Amplifiers.",
      recommendedPracticeQuestion: "Calculate closed-loop gain and output voltage of an inverting op-amp with Rin = 10k, Rf = 100k, and Vin = 0.5V."
    },
    {
      id: "ece_micro_arm_esp_03",
      department: "Electronics & Communication Engineering",
      subject: "Microcontrollers & Embedded Systems",
      topic: "Embedded Systems & Firmware",
      subtopic: "ARM Cortex & Communication Protocols",
      skill: "Microcontrollers",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Compare UART, SPI, and I2C serial communication protocols regarding wire count, master-slave architecture, transmission speed, duplex capability, and clock synchronization. When would you select I2C over SPI in an embedded IoT sensor system?",
      keywords: ["uart", "spi", "i2c", "serial protocols", "master-slave", "pull-up resistors", "baud rate", "embedded"],
      followUpTemplates: [
        "Why are pull-up resistors strictly required on I2C SDA and SCL lines (open-drain architecture)?",
        "How does SPI manage multiple slave devices using Chip Select (CS/SS) lines?"
      ],
      idealAnswerPoints: [
        "UART: Asynchronous (no clock wire), point-to-point (2 wires: TX, RX), full duplex, configurable baud rate",
        "SPI: Synchronous, Master-Slave, 4 wires (MOSI, MISO, SCK, CS), full duplex, very high speed (10\u201350+ MHz), individual CS per slave",
        "I2C: Synchronous, Multi-master multi-slave, 2 wires (SDA, SCL open-drain with pull-ups), half duplex, moderate speed (100kHz, 400kHz, 3.4MHz), 7-bit/10-bit software addressing",
        "Choose I2C over SPI: When GPIO pin count is limited on microcontroller and connecting multiple low-bandwidth sensors on the same 2-wire bus"
      ],
      explanation: "Fundamental embedded protocols assessment evaluating hardware interfacing and microcontroller bus architectures.",
      learningExplanation: "SPI is blazingly fast and simple but consumes a dedicated Chip Select pin for every additional peripheral. I2C requires only two shared wires for up to 127 devices using address bytes, making it ideal for compact board layouts.",
      whatToStudyNext: "DMA (Direct Memory Access) transfers over SPI/I2C and CAN Bus differential signaling.",
      recommendedPracticeQuestion: "Calculate appropriate pull-up resistor values for a 400kHz I2C bus with 200pF bus capacitance."
    },
    {
      id: "ece_vlsi_sta_verilog_04",
      department: "Electronics & Communication Engineering",
      subject: "VLSI Design & Digital Systems",
      topic: "Digital System Design & VLSI",
      subtopic: "Static Timing Analysis & Verilog HDL",
      skill: "VLSI Design",
      difficulty: "Advanced",
      questionType: "conceptual",
      question: "Explain Static Timing Analysis (STA) in digital VLSI design. Define Setup Slack and Hold Slack mathematically. How does clock skew affect setup time vs hold time, and why can hold time violations NOT be solved by reducing the clock frequency?",
      keywords: ["vlsi", "static timing analysis", "setup slack", "hold slack", "clock skew", "verilog", "fpga", "asic"],
      followUpTemplates: [
        "How do physical design engineers fix hold time violations during post-layout optimization (e.g. inserting delay buffers)?",
        "What is the difference between blocking (=) and non-blocking (<=) assignments in Verilog procedural blocks?"
      ],
      idealAnswerPoints: [
        "Setup Constraint: T_launch + T_clk-q + T_comb_max <= T_capture + T_period - T_setup. Setup Slack = (Required Time) - (Arrival Time)",
        "Hold Constraint: T_launch + T_clk-q + T_comb_min >= T_capture + T_hold. Hold Slack = (Arrival Time) - (Required Time)",
        "Clock Frequency independence: The clock period T_period appears ONLY in the setup equation, NOT in the hold equation! Hold violations depend purely on shortest path delay between flip-flops and clock skew",
        "If data arrives too fast before capture hold time closes, slowing down the clock does not fix the issue\u2014delay buffers must be inserted on the data path"
      ],
      explanation: "Advanced VLSI and ASIC/FPGA timing question analyzing semiconductor design constraints and timing closures.",
      learningExplanation: "Setup time ensures data arrives before the clock edge; if violated, you can simply run the chip at a slower clock. Hold time ensures data does not blow through too fast and overwrite previous data before the current clock edge latches it; it is clock-speed independent and fatal if unfixed.",
      whatToStudyNext: "Clock Tree Synthesis (CTS), jitter analysis, and synthesis of Verilog Moore vs Mealy FSMs.",
      recommendedPracticeQuestion: "Write a Verilog HDL module implementing a synchronous 4-bit gray code counter with active-low reset."
    }
  ],
  // ===========================================================================
  // 4. ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // ===========================================================================
  "Electrical & Electronics Engineering": [
    {
      id: "eee_machines_induction_01",
      department: "Electrical & Electronics Engineering",
      subject: "Electrical Machines",
      topic: "Electrical Machines & Transformers",
      subtopic: "Three-Phase Induction Motors",
      skill: "Electrical Machines",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the working principle of a 3-phase Induction Motor. What is slip (s), why can an induction motor never run at synchronous speed (Ns), and sketch the Torque-Speed characteristic curve indicating starting torque and maximum breakdown torque.",
      keywords: ["induction motor", "slip", "synchronous speed", "rotating magnetic field", "breakdown torque", "stator", "rotor"],
      followUpTemplates: [
        "What happens to motor torque and current if the mechanical load increases on the shaft?",
        "How does a Variable Frequency Drive (VFD) maintain constant V/f ratio to control induction motor speed without saturating the magnetic core?"
      ],
      idealAnswerPoints: [
        "Operating Principle: 3-phase balanced stator currents produce a Rotating Magnetic Field (RMF) spinning at Ns = 120*f / P; RMF cuts stationary rotor conductors, inducing EMF and rotor currents by Faraday's law; Lorentz force produces rotor torque in direction of RMF by Lenz's law",
        "Slip: s = (Ns - N) / Ns. If motor reached synchronous speed (N = Ns), relative velocity between RMF and rotor would be zero -> zero induced EMF -> zero rotor current -> zero torque -> motor immediately slows down",
        "Torque-Speed Curve: Starting torque at s=1; torque rises to maximum (breakdown torque) at critical slip s_max = R2 / X2; drops to 0 at s=0"
      ],
      explanation: "Fundamental electrical machinery topic examining electromechanical energy conversion, magnetic fields, and torque dynamics.",
      learningExplanation: "Induction motors are inherently asynchronous. Torque requires induced rotor currents, which strictly require relative motion (slip) between the rotating stator field and the physical rotor.",
      whatToStudyNext: "Star-Delta starters, auto-transformer starting, and equivalent circuit parameter estimation.",
      recommendedPracticeQuestion: "A 4-pole, 50 Hz 3-phase induction motor runs at 1440 RPM. Calculate synchronous speed and percentage slip."
    },
    {
      id: "eee_power_electronics_converters_02",
      department: "Electrical & Electronics Engineering",
      subject: "Power Electronics",
      topic: "Power Electronics & Drives",
      subtopic: "DC-DC Converters & PWM Switching",
      skill: "Power Electronics",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the operation of a Buck Converter and a Boost Converter in Continuous Conduction Mode (CCM). Derive the voltage conversion ratio as a function of duty cycle (D) for both, and explain the role of the inductor, diode, and capacitor filter.",
      keywords: ["buck converter", "boost converter", "duty cycle", "continuous conduction mode", "inductor volt-second balance", "pwm", "mosfet"],
      followUpTemplates: [
        "What is inductor volt-second balance, and how does it guarantee steady-state converter operation?",
        "What is the difference between an insulated gate bipolar transistor (IGBT) and a power MOSFET regarding switching speed and voltage rating?"
      ],
      idealAnswerPoints: [
        "Buck Converter: Step-down DC-DC converter. When switch ON: inductor stores energy, diode reverse biased. When switch OFF: inductor discharges via freewheeling diode. Output Vout = D * Vin (where D = Ton / T, 0 <= D <= 1)",
        "Boost Converter: Step-up DC-DC converter. When switch ON: inductor charges to ground. When switch OFF: inductor voltage adds in series with input source through diode to output. Output Vout = Vin / (1 - D)",
        "Inductor Volt-Second Balance: Net inductor voltage over a full switching period in steady state must be zero (integral of V_L dt = 0), preventing inductor saturation"
      ],
      explanation: "Core power electronics subject assessing switched-mode power supplies, duty cycle analysis, and energy storage.",
      learningExplanation: "Switched-mode power supplies achieve >90% efficiency compared to dissipative linear regulators. High-frequency PWM switches an inductor between charging and discharging phases to step voltage up or down with minimal heat losses.",
      whatToStudyNext: "Inverter topologies (H-bridge, SPWM), and gate driver bootstrap circuit design.",
      recommendedPracticeQuestion: "Design a Buck converter stepping 24V down to 5V at 2A with maximum 10% inductor ripple current at 100kHz."
    },
    {
      id: "eee_power_systems_faults_03",
      department: "Electrical & Electronics Engineering",
      subject: "Power Systems & Protection",
      topic: "Power Systems & Grid Engineering",
      subtopic: "Fault Analysis & Transmission",
      skill: "Power Systems",
      difficulty: "Advanced",
      questionType: "conceptual",
      question: "Compare symmetrical (3-phase balanced) and asymmetrical (Line-to-Ground, Line-to-Line, Double Line-to-Ground) faults in power systems. Explain how Symmetrical Components (positive, negative, and zero sequence networks) are used to analyze unbalanced faults.",
      keywords: ["fault analysis", "symmetrical components", "line-to-ground fault", "zero sequence", "protective relays", "circuit breakers"],
      followUpTemplates: [
        "Which fault type is statistically the most common in overhead transmission lines, and which fault type is the most severe?",
        "How does transformer winding configuration (e.g. Delta-Star with grounded neutral) affect the path of zero-sequence fault currents?"
      ],
      idealAnswerPoints: [
        "Symmetrical Fault (3-Phase L-L-L): System remains balanced; current in all 3 phases is equal in magnitude and shifted by 120 degrees; most severe mechanically, but rarest (~5%)",
        "Asymmetrical Faults: Line-to-Ground (L-G) is most common (~70% due to lightning, tree contact), L-L (~15%), D-L-G (~10%)",
        "Fortescue's Symmetrical Components: Any unbalanced 3-phase system can be decomposed into 3 balanced sets: Positive Sequence (same phase sequence ABC), Negative Sequence (reversed sequence ACB), and Zero Sequence (identical magnitude and phase angle)",
        "L-G fault analysis: Connect positive, negative, and zero sequence networks in series to compute fault currents"
      ],
      explanation: "Examines high-voltage grid stability, fault protection, and matrix network modeling.",
      learningExplanation: "Unbalanced faults introduce complex coupled differential equations across phases. Fortescue symmetrical components decouple the 3 phases into 3 independent sequence circuits, transforming unsolvable power system networks into straightforward linear analysis.",
      whatToStudyNext: "Distance protection relays (Mho, Quadrilateral), and Buchholz relay for transformer internal gas detection.",
      recommendedPracticeQuestion: "Draw the symmetrical component sequence network connection diagram for a single Line-to-Ground fault."
    },
    {
      id: "eee_control_systems_pid_04",
      department: "Electrical & Electronics Engineering",
      subject: "Control Systems",
      topic: "Control Systems & Instrumentation",
      subtopic: "PID Controllers & Stability",
      skill: "Control Systems",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the roles of the Proportional (P), Integral (I), and Derivative (D) terms in a closed-loop PID controller. How does each term impact system rise time, overshoot, steady-state error, and stability? State the Routh-Hurwitz stability criterion.",
      keywords: ["pid controller", "proportional", "integral", "derivative", "steady-state error", "overshoot", "routh-hurwitz", "transfer function"],
      followUpTemplates: [
        "Why does introducing integral action eliminate steady-state error, but often reduce relative stability and increase overshoot?",
        "How do Bode plots and Gain Margin / Phase Margin quantify closed-loop system robustness?"
      ],
      idealAnswerPoints: [
        "Proportional (P): Output is proportional to current error e(t); increases rise time and response speed, but cannot eliminate steady-state error on its own and high gain causes oscillations",
        "Integral (I): Integrates past error over time; increases system type, strictly drives steady-state error to zero, but adds phase lag and can destabilize the loop or cause windup",
        "Derivative (D): Predicts future error trend based on derivative de(t)/dt; provides damping, reduces overshoot, but amplifies high-frequency sensor noise",
        "Routh-Hurwitz Criterion: Necessary and sufficient condition for stability: all coefficients of the characteristic equation must be positive and all elements in the first column of the Routh array must have the same sign (zero sign changes)"
      ],
      explanation: "Evaluates classical feedback control, transient response tuning, and polynomial stability criteria.",
      learningExplanation: "P acts on present error, I acts on accumulated past error (guaranteeing zero offset), and D acts on predicted future error (damping oscillations). Tuning is the art of balancing response speed against stability margin.",
      whatToStudyNext: "Ziegler-Nichols tuning methods and Root Locus graphical design.",
      recommendedPracticeQuestion: "Using Routh-Hurwitz, determine the range of controller gain K for stability given s^3 + 3s^2 + 3s + 1 + K = 0."
    }
  ],
  // ===========================================================================
  // 5. MECHANICAL ENGINEERING
  // ===========================================================================
  "Mechanical Engineering": [
    {
      id: "mech_thermo_cycles_01",
      department: "Mechanical Engineering",
      subject: "Thermodynamics & Heat Engines",
      topic: "Thermodynamics & Fluid Mechanics",
      subtopic: "Power Cycles & Efficiency",
      skill: "Thermodynamics",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Compare the Otto cycle, Diesel cycle, and Dual combustion cycle. Sketch their P-v and T-s diagrams, and state which cycle has higher thermal efficiency for: (a) Same compression ratio and heat input, and (b) Same maximum pressure and temperature.",
      keywords: ["otto cycle", "diesel cycle", "dual cycle", "compression ratio", "p-v diagram", "t-s diagram", "thermal efficiency", "thermodynamics"],
      followUpTemplates: [
        "Why can real diesel engines achieve higher overall thermal efficiency than petrol (Otto) engines in practice despite Otto having higher theoretical efficiency at equal compression ratios?",
        "What is the physical significance of the Second Law of Thermodynamics (Kelvin-Planck vs Clausius statements)?"
      ],
      idealAnswerPoints: [
        "Otto Cycle: Constant volume heat addition and heat rejection (spark ignition / petrol engines)",
        "Diesel Cycle: Constant pressure heat addition and constant volume heat rejection (compression ignition / diesel engines)",
        "Condition (a) Same compression ratio & heat input: Otto Cycle has higher thermal efficiency (eta_Otto > eta_Dual > eta_Diesel) because heat is added at highest temperature at top dead center",
        "Condition (b) Same maximum pressure & maximum temperature: Diesel Cycle has higher thermal efficiency (eta_Diesel > eta_Dual > eta_Otto)",
        "Real-world: Diesel engines operate at much higher compression ratios (16:1 to 22:1 vs 8:1 to 11:1 for petrol) without knocking, achieving superior practical fuel efficiency"
      ],
      explanation: "Core mechanical engineering thermodynamics examining air standard cycles, efficiency bounds, and combustion physics.",
      learningExplanation: "In theoretical thermodynamics at identical compression ratios, adding heat at constant volume (Otto) generates higher peak temperatures and pressures than constant pressure (Diesel). However, petrol engines are knock-limited to ~10:1 compression ratio, while diesel engines can exceed 20:1, yielding higher real-world efficiency.",
      whatToStudyNext: "Rankine cycle reheat and regeneration for thermal power plants, and Brayton cycle for gas turbines.",
      recommendedPracticeQuestion: "Derive the thermal efficiency formula for the ideal air standard Otto cycle in terms of compression ratio r and adiabatic index gamma."
    },
    {
      id: "mech_fluid_bernoulli_pipe_02",
      department: "Mechanical Engineering",
      subject: "Fluid Mechanics",
      topic: "Thermodynamics & Fluid Mechanics",
      subtopic: "Bernoulli Equation & Pipe Flow",
      skill: "Fluid Mechanics",
      difficulty: "Intermediate",
      questionType: "practical",
      question: "State Bernoulli's equation and explain the assumptions required for it to hold. How do you calculate major head loss using the Darcy-Weisbach equation in laminar vs turbulent pipe flow? How does the Reynolds number govern flow regime transitions?",
      keywords: ["bernoulli", "fluid mechanics", "darcy-weisbach", "reynolds number", "laminar", "turbulent", "head loss", "friction factor"],
      followUpTemplates: [
        "What is the Moody chart, and how does relative pipe roughness (epsilon/D) determine friction factor in fully rough turbulent flow?",
        "What is water hammer in industrial piping systems, and how do surge tanks alleviate high-pressure shockwaves?"
      ],
      idealAnswerPoints: [
        "Bernoulli Equation: P/gamma + v^2/(2g) + z = constant along a streamline (Pressure head + Velocity head + Elevation head)",
        "Assumptions: Incompressible fluid, non-viscous (frictionless), steady flow, flow along a streamline, no shaft work or heat exchange",
        "Reynolds Number: Re = rho * v * D / mu. For pipe flow: Re < 2300 is laminar; 2300 < Re < 4000 is transitional; Re > 4000 is turbulent",
        "Darcy-Weisbach Equation: h_f = f * (L/D) * (v^2 / 2g). For laminar flow, friction factor f = 64 / Re (independent of pipe roughness). For turbulent flow, f is determined via Colebrook-White or Moody chart"
      ],
      explanation: "Tests fluid dynamics principles, conservation of energy along streamlines, and viscous pipe flow losses.",
      learningExplanation: "Bernoulli represents conservation of mechanical energy for an ideal fluid. In real viscous pipes, shear stresses dissipate energy into heat, requiring the Darcy-Weisbach head loss term to be added to the energy balance.",
      whatToStudyNext: "Boundary layer separation, drag and lift on immersed bodies, and Navier-Stokes equations.",
      recommendedPracticeQuestion: "Calculate head loss over a 100m long, 0.1m diameter pipe with water flowing at 2 m/s assuming friction factor f = 0.02."
    },
    {
      id: "mech_design_stress_fatigue_03",
      department: "Mechanical Engineering",
      subject: "Machine Design & Materials",
      topic: "CAD, CAM & Manufacturing",
      subtopic: "Fatigue & Failure Theories",
      skill: "Machine Design",
      difficulty: "Advanced",
      questionType: "conceptual",
      question: "Explain the difference between static yield failure and fatigue failure in mechanical components. What is an S-N curve and the Endurance Limit? Compare the Soderberg, Goodman, and Gerber criteria for designing components subjected to fluctuating cyclic stresses.",
      keywords: ["machine design", "fatigue", "s-n curve", "endurance limit", "goodman criterion", "soderberg", "stress concentration", "solidworks"],
      followUpTemplates: [
        "Why do sharp internal corners or keyways drastically reduce fatigue life, and how do stress concentration notch sensitivity factors account for this?",
        "Which failure theory (Maximum Shear Stress / Tresca vs Distortion Energy / Von Mises) is preferred for ductile materials under multi-axial static loading, and why?"
      ],
      idealAnswerPoints: [
        "Static Failure: Occurs when applied stress exceeds yield strength (ductile) or ultimate strength (brittle) under monotonic load",
        "Fatigue Failure: Progressive structural damage that occurs under cyclic fluctuating stresses below static yield strength; initiates as microcracks at stress concentrations and propagates to catastrophic sudden brittle fracture",
        "S-N Curve & Endurance Limit: Endurance limit (Se) is the stress amplitude below which ferrous materials can endure infinite cycles (10^7+) without failing",
        "Cyclic Failure Criteria: Relate mean stress (sigma_m) and alternating stress (sigma_a). Soderberg (uses Yield strength, most conservative), Goodman (uses Ultimate strength, standard for ductile design), Gerber (parabolic relationship, matches experimental data closest)"
      ],
      explanation: "Evaluates structural machine design, cyclic fatigue limits, and component reliability engineering.",
      learningExplanation: "Over 80% of real mechanical failures are fatigue failures. Even if a shaft never reaches yield stress, repeated rotations under bending loads propagate cracks from microscopic flaws until the remaining cross-section shears abruptly.",
      whatToStudyNext: "Shaft design under combined torsion and bending according to ASME code, and rolling element bearing L10 life calculation.",
      recommendedPracticeQuestion: "Construct a modified Goodman diagram for a steel shaft subjected to bending stress fluctuating between 100 MPa and 300 MPa."
    },
    {
      id: "mech_manufacturing_casting_cnc_04",
      department: "Mechanical Engineering",
      subject: "Manufacturing Processes & CAM",
      topic: "CAD, CAM & Manufacturing",
      subtopic: "Casting, Machining & CNC G-Codes",
      skill: "Manufacturing Processes",
      difficulty: "Intermediate",
      questionType: "practical",
      question: "Explain the casting process and the essential elements of a gating system (pouring basin, sprue, runner, ingates, riser). What are common casting defects like shrinkage cavities and blowholes, and how does Chvorinov's rule guide riser design? Explain G-codes G00, G01, G02, and G03 in CNC programming.",
      keywords: ["casting", "gating system", "riser", "chvorinov rule", "cnc", "g-code", "manufacturing", "machining"],
      followUpTemplates: [
        "Why must the solidification time of the riser be strictly greater than the solidification time of the casting section it feeds?",
        "What is Geometric Dimensioning and Tolerancing (GD&T), and what does True Position with Maximum Material Condition (MMC) signify on an engineering drawing?"
      ],
      idealAnswerPoints: [
        "Gating System: Delivers molten metal smoothly into the mold cavity without turbulence or air aspiration; Sprue accelerates flow, runner distributes, ingates enter cavity, Riser supplies molten metal to compensate for liquid shrinkage during cooling",
        "Chvorinov's Rule: Solidification Time t = B * (V / A)^n (where V is volume, A is surface area, n ~ 2). Riser must have smaller (A/V) ratio than casting so it solidifies last",
        "Casting Defects: Shrinkage cavity (insufficient feeding from riser), Blowholes (entrapped gas/moisture in sand mold)",
        "CNC G-Codes: G00 (Rapid linear positioning at maximum feed rate, non-cutting), G01 (Linear cutting feed at specified feed rate F), G02 (Circular interpolation clockwise), G03 (Circular interpolation counter-clockwise)"
      ],
      explanation: "Assesses production engineering, foundry metallurgy, and automated computer numerical control machining.",
      learningExplanation: "Chvorinov's rule proves that cooling rate is governed by surface area per unit volume. A sphere or stubby cylinder cools slowest, making it the ideal geometry for a riser to feed hot metal into cooling parts.",
      whatToStudyNext: "Merchant's circle for orthogonal metal cutting forces, and Taylor's tool life equation V * T^n = C.",
      recommendedPracticeQuestion: "Write a CNC G-code program snippet to mill a 50mm x 50mm square contour with 5mm corner fillets."
    }
  ],
  // ===========================================================================
  // 6. CIVIL ENGINEERING
  // ===========================================================================
  "Civil Engineering": [
    {
      id: "civil_structures_sfd_bmd_01",
      department: "Civil Engineering",
      subject: "Structural Analysis",
      topic: "Structural Analysis & Design",
      subtopic: "Shear Force & Bending Moment Diagrams",
      skill: "Structural Engineering",
      difficulty: "Intermediate",
      questionType: "practical",
      question: "Explain how to construct the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD) for a simply supported beam with an overhang carrying a uniformly distributed load (UDL) and a concentrated point load. What is the Point of Contraflexure, and what is the mathematical relationship between shear force and bending moment?",
      keywords: ["structural engineering", "sfd", "bmd", "point of contraflexure", "udl", "bending moment", "shear force", "staad.pro"],
      followUpTemplates: [
        "At what point on a beam does the maximum bending moment occur with respect to the shear force diagram?",
        "How does an indeterminate structure (e.g. continuous beam) differ from a determinate structure regarding temperature changes and support settlement?"
      ],
      idealAnswerPoints: [
        "Mathematical Relationship: dV/dx = -w(x) (rate of change of shear force equals negative distributed load), and dM/dx = V(x) (rate of change of bending moment equals shear force)",
        "Maximum Bending Moment: Occurs where shear force crosses zero (V = 0) or changes sign",
        "Point of Contraflexure: The location along the beam where the bending moment changes sign (from sagging/positive to hogging/negative); at this point, M = 0 and curvature changes direction",
        "Construction sequence: 1. Calculate support reactions using static equilibrium (sum Fx = 0, sum Fy = 0, sum M = 0); 2. Draw SFD across segments; 3. Locate zero-shear points; 4. Integrate SFD area to plot BMD"
      ],
      explanation: "Foundational civil and structural mechanics topic testing equilibrium, internal beam forces, and beam behavior under loads.",
      learningExplanation: "The derivative relationship dM/dx = V proves that where shear force equals zero, the bending moment is at an extreme value (local maximum or minimum). Knowing points of contraflexure is critical because tensile steel reinforcement must switch from bottom to top of the beam.",
      whatToStudyNext: "Moment Distribution Method (Hardy Cross) and slope-deflection equations for continuous beams.",
      recommendedPracticeQuestion: "For a simply supported beam of span 6m carrying a UDL of 10 kN/m over its entire length, calculate maximum bending moment and draw SFD/BMD."
    },
    {
      id: "civil_concrete_rcc_lsm_02",
      department: "Civil Engineering",
      subject: "RCC & Concrete Technology",
      topic: "Structural Analysis & Design",
      subtopic: "Limit State Design & Mix Proportions",
      skill: "Concrete Technology",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Compare the Limit State Method (LSM) and the Working Stress Method (WSM) in Reinforced Concrete (RCC) design. Explain the difference between under-reinforced, balanced, and over-reinforced beam sections. Why do building codes strictly require beams to be designed as under-reinforced?",
      keywords: ["rcc", "limit state method", "working stress method", "under-reinforced", "over-reinforced", "concrete technology", "ductile failure", "brittle failure"],
      followUpTemplates: [
        "What is Abrams' Law relating water-cement ratio to the 28-day compressive strength of concrete?",
        "What is the Slump Test, and how does workability affect concrete compaction and durability?"
      ],
      idealAnswerPoints: [
        "LSM vs WSM: WSM assumes linear elastic behavior with a single factor of safety applied to material strength under service loads; LSM accounts for actual non-linear plastic stress-strain behavior at ultimate loads using partial safety factors for materials (gamma_c=1.5, gamma_s=1.15) and loads",
        "Under-Reinforced Section: Steel yields before concrete reaches its ultimate crushing strain (0.0035); characterized by large cracks and significant deflection giving warning prior to collapse (ductile failure)",
        "Over-Reinforced Section: Concrete crushes suddenly in compression before steel yields; causes sudden, catastrophic explosive collapse without warning (brittle failure)",
        "Building codes (IS 456, ACI 318, Eurocode 2) mandate under-reinforced design to guarantee occupant safety and evacuation warning"
      ],
      explanation: "Core RCC design principle testing failure modes, ductility, safety factors, and material non-linearity.",
      learningExplanation: "Over-reinforced beams sound stronger because they have more steel, but they are dangerous death traps. Concrete fails in brittle explosion without warning. Under-reinforced beams guarantee steel yields first, giving dramatic visible sagging warnings before failure.",
      whatToStudyNext: "Shear reinforcement design (stirrups) and development length (bond stress) in reinforced concrete beams.",
      recommendedPracticeQuestion: "Calculate the limiting depth of neutral axis (x_u,max) for Fe 415 and Fe 500 grade steel in limit state design."
    },
    {
      id: "civil_geotech_terzaghi_soil_03",
      department: "Civil Engineering",
      subject: "Geotechnical & Foundation Engineering",
      topic: "Geotechnical & Transportation Engineering",
      subtopic: "Soil Bearing Capacity & Classification",
      skill: "Geotechnical Engineering",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "State Terzaghi's bearing capacity equation for a shallow continuous strip foundation. Explain the three components of bearing capacity (cohesion, surcharge, and soil weight) and their bearing capacity factors (Nc, Nq, Ngamma). How does the presence of a shallow groundwater table affect ultimate bearing capacity?",
      keywords: ["geotechnical engineering", "terzaghi", "bearing capacity", "shallow foundation", "groundwater table", "soil mechanics", "settlement"],
      followUpTemplates: [
        "What is the difference between General Shear Failure, Local Shear Failure, and Punching Shear Failure in soils?",
        "Explain the Standard Proctor Compaction test and the relationship between Optimum Moisture Content (OMC) and Maximum Dry Density (MDD)."
      ],
      idealAnswerPoints: [
        "Terzaghi Equation: q_ult = c * Nc + q * Nq + 0.5 * gamma * B * Ngamma (where c = soil cohesion, q = gamma * Df surcharge, B = footing width, gamma = soil unit weight)",
        "Three Components: 1. c*Nc (cohesive shear resistance of soil along failure surface); 2. q*Nq (surcharge overburden pressure at foundation depth Df); 3. 0.5*gamma*B*Ngamma (frictional shear resistance of soil wedge beneath footing)",
        "Groundwater Table Effect: If water table rises to ground surface or foundation level, buoyant submerged unit weight (gamma_sub = gamma_sat - gamma_w ~ 0.5*gamma) must be used, which reduces ultimate bearing capacity by approximately 50%"
      ],
      explanation: "Evaluates foundation soil mechanics, shear failure zones, and environmental groundwater impacts on bearing safety.",
      learningExplanation: "Water reduces the effective stress in soil through pore water uplift pressure. When the water table reaches the footing base, effective soil weight is cut roughly in half, slashing the soil's load-bearing capability.",
      whatToStudyNext: "Primary consolidation settlement calculation using Terzaghi's 1D consolidation theory, and deep pile foundation capacity.",
      recommendedPracticeQuestion: "Calculate ultimate bearing capacity of a 2m wide strip footing at depth 1.5m in sand with gamma=18 kN/m3, phi=35 deg, Nq=33.3, Ngamma=41.4."
    },
    {
      id: "civil_surveying_total_station_04",
      department: "Civil Engineering",
      subject: "Surveying & Transportation",
      topic: "Geotechnical & Transportation Engineering",
      subtopic: "Total Station Surveying & Highway Geometry",
      skill: "Surveying",
      difficulty: "Intermediate",
      questionType: "practical",
      question: "Explain how an Electronic Total Station operates, integrating electronic theodolite angle measurements with Electronic Distance Measurement (EDM). In highway geometric design, define Superelevation (e), and derive the equilibrium equation balancing centrifugal force on a horizontal curve.",
      keywords: ["surveying", "total station", "edm", "superelevation", "horizontal curve", "highway engineering", "transportation"],
      followUpTemplates: [
        "What is a closed traverse, and how does Bowditch's (Compass) rule balance latitude and departure closing errors?",
        "What is the difference between flexible asphalt pavements and rigid concrete pavements regarding load distribution mechanisms?"
      ],
      idealAnswerPoints: [
        "Total Station: Combines digital theodolite (measures horizontal and vertical angles via digital rotary encoders) with infrared/laser EDM (calculates slope distance via light wave phase shift or time-of-flight) and an onboard microprocessor; automatically computes 3D coordinates (X, Y, Z / Northing, Easting, Elevation)",
        "Superelevation Concept: Inward transverse tilt given to highway cross-section on horizontal curves to counteract outward centrifugal force acting on vehicles",
        "Equilibrium Derivation: Centrifugal force F = m*v^2 / R resisted by component of gravity (W * sin theta ~ W * e) and lateral tire friction (f * W). Equilibrium equation: e + f = v^2 / (g * R) (or in practical highway units: e + f = V^2 / (127 * R))"
      ],
      explanation: "Tests geospatial surveying instrumentation and transportation engineering highway geometry.",
      learningExplanation: "Vehicles traveling around curves experience outward lateral acceleration. Tilting the outer roadway edge (superelevation) uses a component of the vehicle's own gravitational weight to balance centrifugal force, preventing rollover and skidding.",
      whatToStudyNext: "Transition spiral curve design, stopping sight distance (SSD), and GIS spatial analysis.",
      recommendedPracticeQuestion: "Design the superelevation required for a highway horizontal curve of radius 300m for a design speed of 80 km/h with f = 0.15."
    }
  ],
  // ===========================================================================
  // 7. AUTOMOBILE ENGINEERING
  // ===========================================================================
  "Automobile Engineering": [
    {
      id: "auto_ic_engine_four_stroke_01",
      department: "Automobile Engineering",
      subject: "IC Engines & Powertrain",
      topic: "IC Engines & Powertrain Systems",
      subtopic: "Engine Thermodynamics & Valve Timing",
      skill: "Internal Combustion Engines",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the four strokes of an internal combustion engine (Suction, Compression, Power/Expansion, Exhaust). What is Valve Overlap, and why do intake and exhaust valves open before and close after Dead Centers in real engine Valve Timing Diagrams? Compare Turbocharging vs Supercharging.",
      keywords: ["ic engines", "four stroke", "valve timing", "valve overlap", "turbocharger", "supercharger", "powertrain", "automotive"],
      followUpTemplates: [
        "What causes engine knocking/detonation in Spark Ignition (petrol) engines vs Compression Ignition (diesel) engines?",
        "How does variable valve timing (VVT / VTEC) optimize low-end torque and high-RPM power output?"
      ],
      idealAnswerPoints: [
        "Four Strokes: 1. Suction (piston moves TDC to BDC, intake valve open, draws air/fuel); 2. Compression (both valves closed, piston moves BDC to TDC); 3. Power (spark/injection ignites mixture, high pressure expands driving piston BDC); 4. Exhaust (exhaust valve opens, piston moves TDC expelling burned gases)",
        "Valve Overlap: Period at end of exhaust stroke and beginning of suction stroke where BOTH intake and exhaust valves are open simultaneously; uses outgoing exhaust momentum (scavenging) to draw fresh charge into cylinder",
        "Turbocharger vs Supercharger: Turbocharger is driven by waste exhaust gas turbine (free energy, but suffers from turbo lag); Supercharger is driven mechanically by engine crankshaft via belt (instant boost, but parasitical engine power loss)"
      ],
      explanation: "Core automotive powertrain assessment on thermal engine cycles, breathing dynamics, and forced induction.",
      learningExplanation: "Valves take physical time to open and close, and incoming air has inertia. Opening the intake valve before TDC (Valve Lead) and keeping it open after BDC (Valve Lag) maximizes cylinder volumetric efficiency at high RPM.",
      whatToStudyNext: "Common Rail Direct Injection (CRDI) fuel delivery, and selective catalytic reduction (SCR) for NOx emission reduction.",
      recommendedPracticeQuestion: "Sketch a practical valve timing diagram for a 4-stroke high-speed petrol engine showing IVO, IVC, EVO, and EVC angles."
    },
    {
      id: "auto_ev_battery_bms_02",
      department: "Automobile Engineering",
      subject: "Electric Vehicles & Hybrid Systems",
      topic: "Electric Vehicles & Powertrain",
      subtopic: "Battery Management Systems (BMS)",
      skill: "Electric Vehicles",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the primary architecture and functions of a Battery Management System (BMS) in an Electric Vehicle. What is the difference between State of Charge (SoC) and State of Health (SoH)? Why is cell balancing (passive vs active) essential, and how does the thermal management system prevent Thermal Runaway?",
      keywords: ["electric vehicles", "bms", "soc", "soh", "cell balancing", "thermal runaway", "lithium-ion", "battery pack"],
      followUpTemplates: [
        "What is Coulomb counting, and why must it be combined with Open Circuit Voltage (OCV) estimation for accurate SoC tracking?",
        "How does regenerative braking convert vehicle kinetic energy back into battery chemical energy via the traction inverter?"
      ],
      idealAnswerPoints: [
        "BMS Functions: Real-time cell voltage and current monitoring, temperature telemetry, State of Charge (SoC - available battery fuel %), State of Health (SoH - capacity retention over lifecycle), safety protection against overvoltage, undervoltage, and overcurrent",
        "Cell Balancing: Manufacturing differences cause cells in a series string to charge/discharge at slightly different rates. Passive balancing bleeds excess energy from highest cells as heat through resistors; Active balancing uses capacitive/inductive converters to transfer energy from high cells to lower cells",
        "Thermal Runaway: Exothermic self-sustaining chain reaction triggered when cell internal temperature exceeds safe threshold (~80\xB0C - 150\xB0C), breaking down SEI layer and releasing oxygen, causing smoke and fire. Liquid cooling plates circulate glycol coolant to maintain pack within 20\xB0C - 35\xB0C window"
      ],
      explanation: "Critical EV competency testing electrochemical storage management, lifecycle estimation, and high-voltage safety.",
      learningExplanation: "In a series battery pack, the entire pack is only as strong as its weakest cell. Without cell balancing, the weakest cell hits cutoff voltage earliest, prematurely ending charging or discharging and degrading the vehicle range.",
      whatToStudyNext: "Permanent Magnet Synchronous Motor (PMSM) vs AC Induction Motor for EV traction, and DC fast charging protocols (CCS2).",
      recommendedPracticeQuestion: "Explain why lithium plating occurs during sub-zero ambient temperature fast charging."
    },
    {
      id: "auto_dynamics_braking_abs_03",
      department: "Automobile Engineering",
      subject: "Vehicle Dynamics & Chassis Systems",
      topic: "Chassis, Suspension & Braking",
      subtopic: "Anti-lock Braking System (ABS) & Dynamics",
      skill: "Braking Systems",
      difficulty: "Intermediate",
      questionType: "practical",
      question: "Explain the operation of an Anti-lock Braking System (ABS). What is tire slip ratio (lambda), and how does ABS modulate hydraulic brake fluid pressure between pressure apply, hold, and release to prevent wheel lockup? Explain understeer vs oversteer during high-speed cornering.",
      keywords: ["abs", "braking systems", "slip ratio", "wheel lockup", "hydraulic modulator", "understeer", "oversteer", "vehicle dynamics"],
      followUpTemplates: [
        "Why does a locked wheel lose directional steerability according to the friction circle (Kamm's circle)?",
        "What is Electronic Stability Program (ESP), and how does it selectively brake individual wheels to correct yaw moments?"
      ],
      idealAnswerPoints: [
        "ABS Working: Wheel speed sensors monitor angular deceleration. If a wheel approaches lockup (slip ratio exceeding ~15-20%), the ABS Hydraulic Electronic Control Unit (HECU) rapidly pulses solenoid valves (Release -> Hold -> Apply at 15-20 times per second)",
        "Tire Slip Ratio: lambda = (V_vehicle - r * omega) / V_vehicle. Peak longitudinal braking friction occurs around 15% to 20% slip; at 100% slip (locked wheel), kinetic friction drops and lateral cornering force drops to ZERO",
        "Directional Control: ABS prevents 100% lockup, preserving lateral cornering grip so the driver can steer around obstacles during panic stops",
        'Understeer: Front wheels lose grip first; vehicle pushes straight ahead ("plows"). Oversteer: Rear wheels lose grip first; vehicle tail slides out ("fishtailing")'
      ],
      explanation: "Evaluates active chassis safety systems, tire-road tribology, and dynamic vehicle handling stability.",
      learningExplanation: "Kamm's circle proves a tire has a finite total friction budget shared between braking and steering. A locked wheel consumes 100% of available traction in longitudinal sliding, leaving zero lateral traction for steering.",
      whatToStudyNext: "MacPherson strut vs Double Wishbone suspension kinematics, and regenerative-friction brake blending.",
      recommendedPracticeQuestion: "Calculate theoretical stopping distance for a 1500 kg vehicle traveling at 100 km/h on dry asphalt with coefficient of friction mu = 0.8."
    },
    {
      id: "auto_drivetrain_differential_04",
      department: "Automobile Engineering",
      subject: "Automotive Transmission Systems",
      topic: "Drivetrain & Transmission",
      subtopic: "Differential & Manual/Auto Transmissions",
      skill: "Transmission Systems",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Explain the working of an open mechanical Differential in automotive drivetrains. Why must drive wheels rotate at different speeds when cornering? What is the main drawback of an open differential when one wheel loses traction (e.g. on ice or mud), and how does a Limited-Slip Differential (LSD) solve this?",
      keywords: ["differential", "drivetrain", "limited-slip differential", "lsd", "transmission", "sun gears", "planetary gears", "torque"],
      followUpTemplates: [
        "What is the difference between a torque-converter automatic transmission, dual-clutch transmission (DCT), and Continuously Variable Transmission (CVT)?",
        "How does a vehicle clutch transfer torque via friction, and what causes clutch slippage?"
      ],
      idealAnswerPoints: [
        "Differential Purpose: When turning a corner, the outer wheel travels along a larger arc radius than the inner wheel and must rotate faster; the differential allows input torque to split while letting axles rotate at differing angular speeds: (omega_left + omega_right) / 2 = omega_ring_gear",
        "Open Differential Drawback: An open differential always splits torque 50:50 between the two wheels. If one wheel is on frictionless ice (0 torque), the other wheel receives only 0 torque\u2014the wheel on ice spins uselessly while the vehicle stays stranded",
        "Limited-Slip Differential (LSD): Uses multi-plate friction clutches, Torsen worm gears, or viscous couplings to lock the two axles together when a speed differential is detected, transferring torque to the wheel with high traction"
      ],
      explanation: "Tests automotive drivetrain kinematics, planetary gearing, and torque distribution mechanics.",
      learningExplanation: "Without a differential, both drive wheels would be locked at equal speeds, causing extreme tire scrubbing, axle windup, and uncontrollable understeer on turns. Open differentials distribute equal torque, so zero grip on one side immobilizes both wheels.",
      whatToStudyNext: "Epicyclic gear train torque ratios, and CAN bus vehicle diagnostic messaging (OBD-II).",
      recommendedPracticeQuestion: "Explain how an automotive torque converter achieves torque multiplication using stator redirector blades."
    }
  ],
  // Default mapping for Data Science & Machine Learning Engineering
  "Data Science & Machine Learning Engineering": [
    {
      id: "ds_ml_bias_variance_01",
      department: "Data Science & Machine Learning Engineering",
      subject: "Machine Learning",
      topic: "Machine Learning & Model Optimization",
      subtopic: "Generalization & Error Decomposition",
      skill: "Machine Learning",
      difficulty: "Intermediate",
      questionType: "conceptual",
      question: "Decompose expected prediction error into Bias, Variance, and Irreducible Noise. How do L1 (Lasso) and L2 (Ridge) regularization mathematically modify loss functions to prevent overfitting, and why does L1 produce sparse feature weights?",
      keywords: ["bias-variance tradeoff", "l1 regularization", "l2 regularization", "lasso", "ridge", "sparsity", "machine learning"],
      followUpTemplates: [
        "Under what circumstances would you choose ElasticNet over pure Lasso or Ridge?",
        "Why is feature standardization (StandardScaler) strictly required before fitting regularized linear models?"
      ],
      idealAnswerPoints: [
        "Error Decomposition: E[(y - f(x))^2] = Bias^2 + Variance + Irreducible Error (sigma^2)",
        "High Bias: Model too simple (underfitting); High Variance: Model fits noise (overfitting)",
        "L2 (Ridge): Adds lambda * sum(w_i^2); shrinks weights smoothly towards zero without setting them to exact zero",
        "L1 (Lasso): Adds lambda * sum(|w_i|); diamond-shaped constraint intersects loss contours at axes where w_i = 0, inducing strict parameter sparsity for feature selection"
      ],
      explanation: "Fundamental ML statistical learning theory assessing regularization geometry and generalization error.",
      learningExplanation: "L2 penalizes large weights proportionally, pulling them in smoothly. L1 penalizes weights at a constant rate sign(w), driving less important features strictly to zero and serving as built-in feature selection.",
      whatToStudyNext: "Cross-validation strategies and Gradient Boosted Decision Trees (XGBoost/LightGBM).",
      recommendedPracticeQuestion: "Write Scikit-learn pipeline code utilizing StandardScaler, RidgeCV, and cross_val_score."
    }
  ]
};

// src/nlp/duplicatePrevention.ts
function normalizeForDuplicateCheck(text) {
  if (!text) return "";
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenizeForDuplicateCheck(text) {
  const pre = preprocessDocument(text);
  return new Set(pre.stemmedTokens);
}
function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}
function isQuestionDuplicate(candidate, history, currentSetQuestions = []) {
  for (const h of history) {
    if (h.questionId === candidate.id) {
      return { isDuplicate: true, reason: `Exact ID match with previously asked question (${candidate.id}).` };
    }
  }
  for (const q of currentSetQuestions) {
    if (q.id === candidate.id) {
      return { isDuplicate: true, reason: `Exact ID match with question in current set (${candidate.id}).` };
    }
  }
  const normCandidate = normalizeForDuplicateCheck(candidate.question);
  const candTokens = tokenizeForDuplicateCheck(candidate.question);
  for (const h of history) {
    if (h.normalizedText === normCandidate) {
      return { isDuplicate: true, reason: `Exact normalized text match with history question "${h.questionId}".` };
    }
  }
  for (const q of currentSetQuestions) {
    if (normalizeForDuplicateCheck(q.question) === normCandidate) {
      return { isDuplicate: true, reason: `Exact normalized text match in current set.` };
    }
  }
  for (const h of history) {
    const histTokens = tokenizeForDuplicateCheck(h.questionText);
    const jaccard = calculateJaccardSimilarity(candTokens, histTokens);
    if (jaccard >= 0.58) {
      return {
        isDuplicate: true,
        reason: `Semantic overlap (${Math.round(jaccard * 100)}%) with prior question "${h.questionId}".`
      };
    }
  }
  for (const q of currentSetQuestions) {
    const qTokens = tokenizeForDuplicateCheck(q.question);
    const jaccard = calculateJaccardSimilarity(candTokens, qTokens);
    if (jaccard >= 0.58) {
      return {
        isDuplicate: true,
        reason: `Semantic overlap (${Math.round(jaccard * 100)}%) with question in active set.`
      };
    }
  }
  if (candidate.codingProblem?.title) {
    const candTitle = candidate.codingProblem.title.toLowerCase().trim();
    for (const h of history) {
      if (h.questionType === "coding" && h.questionText.toLowerCase().includes(candTitle)) {
        return { isDuplicate: true, reason: `Coding challenge "${candidate.codingProblem.title}" already completed.` };
      }
    }
    for (const q of currentSetQuestions) {
      if (q.codingProblem?.title && q.codingProblem.title.toLowerCase().trim() === candTitle) {
        return { isDuplicate: true, reason: `Same coding challenge "${candidate.codingProblem.title}" in active set.` };
      }
    }
  }
  if (currentSetQuestions.length > 0 && currentSetQuestions.length < 4) {
    const candidateSkill = candidate.skill.toLowerCase().trim();
    const hasSameSkillInSet = currentSetQuestions.some(
      (q) => q.skill.toLowerCase().trim() === candidateSkill
    );
    if (hasSameSkillInSet) {
      return { isDuplicate: true, reason: `Skill "${candidate.skill}" is already being tested in this set.` };
    }
  }
  return { isDuplicate: false };
}

// src/nlp/dynamicQuestionGenerator.ts
function generateProjectQuestions(projects, department, difficulty) {
  if (!projects || projects.length === 0) return [];
  const questions = [];
  projects.forEach((proj, idx) => {
    const title = proj.title || `Capstone Project ${idx + 1}`;
    const primaryTech = proj.technologies && proj.technologies.length > 0 ? proj.technologies[0] : "the selected technology stack";
    const allTechs = proj.technologies && proj.technologies.length > 0 ? proj.technologies.join(", ") : "engineering frameworks";
    questions.push({
      id: `proj_arch_${idx}_${Date.now()}`,
      department,
      subject: "Engineering Capstone Architecture",
      topic: "Project Architecture & Design",
      subtopic: "Problem Analysis & Tech Selection",
      skill: primaryTech,
      difficulty,
      questionSource: "project",
      associatedProjectName: title,
      questionType: "project-based",
      question: `In your resume project "${title}", what specific problem does the project solve? Why did you select ${primaryTech} over alternative technologies, and what is the overall system architecture?`,
      keywords: [
        "architecture",
        "problem statement",
        primaryTech.toLowerCase(),
        "design",
        "trade-offs",
        "database",
        "components"
      ],
      followUpTemplates: [
        `If the user concurrency or data volume of "${title}" increased by 10x, what would be the primary performance bottleneck in your architecture?`,
        `How did you isolate client-side rendering from backend persistence in "${title}"?`
      ],
      idealAnswerPoints: [
        `Clear articulation of the real-world engineering problem addressed by "${title}"`,
        `Technical rationale for choosing ${primaryTech} (e.g. performance, ecosystem, reliability, learning curve)`,
        "High-level architectural flow (client tier, application logic, data persistence layer)",
        "Understanding of design constraints, data flow, and separation of concerns"
      ],
      explanation: `Tests project technical ownership, architectural reasoning, and justification for using ${primaryTech}.`,
      learningExplanation: `A strong engineering project answer follows the STAR/Architecture pattern: State the specific user/system problem, explain why ${primaryTech} was chosen over alternatives based on technical trade-offs, sketch the data flow from input to persistence, and identify the primary architectural boundary.`,
      whatToStudyNext: `System Design Fundamentals: Client-server architecture, API contracts, and database schema normalization for ${primaryTech}.`,
      recommendedPracticeQuestion: `Draft an architectural block diagram for "${title}" outlining data schemas, API routes, and external dependencies.`
    });
    questions.push({
      id: `proj_contrib_${idx}_${Date.now()}`,
      department,
      subject: "Project Implementation & Quality",
      topic: "Individual Contribution & Debugging",
      subtopic: "Challenges & Testing Methodology",
      skill: "Software Engineering Practices",
      difficulty: difficulty === "Beginner" ? "Intermediate" : difficulty,
      questionSource: "project",
      associatedProjectName: title,
      questionType: "problem-solving",
      question: `Regarding "${title}" (${allTechs}): What was your specific individual contribution? What was the most difficult technical bug or challenge you encountered, and how did you test and verify the solution?`,
      keywords: [
        "contribution",
        "challenge",
        "debugging",
        "testing",
        "unit tests",
        "edge cases",
        "verification"
      ],
      followUpTemplates: [
        `What automated or manual test cases did you execute before considering "${title}" complete?`,
        `If you were to rewrite "${title}" today, what architectural or algorithmic improvements would you implement?`
      ],
      idealAnswerPoints: [
        "Clear demarcation of personal responsibility vs team/template code",
        "Precise description of a genuine technical issue (e.g. race condition, state sync, SQL constraint, API latency)",
        "Systematic root cause analysis and resolution steps taken",
        "Testing strategy: unit testing, integration testing, boundary checks, or validation"
      ],
      explanation: `Evaluates hands-on troubleshooting, genuine project contribution, and quality assurance mindset.`,
      learningExplanation: `Interviewers ask about challenges to distinguish genuine project work from copy-pasted tutorials. Clearly explain the symptom, the debugging technique you used (logs, breakpoints, profiler), the root cause, the fix, and how your test suite verified the fix without regressions.`,
      whatToStudyNext: `Debugging & Automated Testing: Writing unit tests, mocking dependencies, and automated regression testing.`,
      recommendedPracticeQuestion: `Write a test plan covering 5 critical edge cases for the main module of "${title}".`
    });
  });
  return questions;
}
function generateInternshipQuestions(internships, department, difficulty) {
  if (!internships || internships.length === 0) return [];
  const questions = [];
  internships.forEach((intern, idx) => {
    const company = intern.company || `Organization ${idx + 1}`;
    const role = intern.role || "Engineering Intern";
    questions.push({
      id: `intern_exp_${idx}_${Date.now()}`,
      department,
      subject: "Industrial Engineering Practice",
      topic: "Practical Industry Experience",
      subtopic: "Production Workflow & Responsibilities",
      skill: "Industry Best Practices",
      difficulty,
      questionSource: "internship",
      associatedInternshipCompany: company,
      questionType: "scenario",
      question: `During your internship at ${company} as a ${role}, what were your primary day-to-day engineering responsibilities? Describe a practical task you delivered and how you ensured code quality and standards.`,
      keywords: [
        "responsibilities",
        "workflow",
        "code review",
        "git",
        "production",
        "standards",
        "deliverables",
        "team"
      ],
      followUpTemplates: [
        `How did your internship at ${company} handle change management, code reviews, and production releases?`,
        `What was the biggest technical difference between academic assignments and working on the codebase at ${company}?`
      ],
      idealAnswerPoints: [
        `Specific overview of role, team structure, and engineering tasks at ${company}`,
        "Description of feature, bug fix, analysis, or design implemented",
        "Adherence to engineering standards: version control, code reviews, documentation, CI/CD",
        "Impact of your work on the project or team deliverables"
      ],
      explanation: `Validates practical industry exposure, teamwork, engineering workflows, and professional accountability.`,
      learningExplanation: `Focus on tangible deliverables: what tool or feature you built, the constraints you operated under, how you collaborated with senior engineers or mentors, and the development workflow (Git branching, code reviews, testing) you practiced.`,
      whatToStudyNext: `Software Engineering Lifecycle (SDLC): Agile/Scrum ceremonies, code review guidelines, and CI/CD pipelines.`,
      recommendedPracticeQuestion: `Prepare a 2-minute concise STAR walkthrough of your primary technical milestone at ${company}.`
    });
  });
  return questions;
}
function generateCertificationQuestions(certifications, department, difficulty) {
  if (!certifications || certifications.length === 0) return [];
  const questions = [];
  certifications.forEach((cert, idx) => {
    const certName = cert.name || "Technical Certification";
    const issuer = cert.issuer ? ` from ${cert.issuer}` : "";
    questions.push({
      id: `cert_verify_${idx}_${Date.now()}`,
      department,
      subject: "Certified Technical Competencies",
      topic: "Certification Core Fundamentals",
      subtopic: "Practical Application of Certified Skills",
      skill: certName,
      difficulty,
      questionSource: "certification",
      associatedCertificationName: certName,
      questionType: "conceptual",
      question: `You have listed the certification "${certName}"${issuer}. What were the key core concepts covered in this curriculum, and how have you applied those concepts practically in your projects or coding?`,
      keywords: [
        "certification",
        "core concepts",
        "practical application",
        "principles",
        "fundamentals",
        "implementation"
      ],
      followUpTemplates: [
        `What is the most misunderstood concept in the subject matter of "${certName}", and how do you explain it correctly?`,
        `How do you keep your understanding of ${certName} updated as industry tooling evolves?`
      ],
      idealAnswerPoints: [
        `Clear summary of the theoretical foundation covered by "${certName}"`,
        "Demonstration of practical depth rather than superficial certificate memorization",
        "Concrete example of applying certified methodologies to a project, lab, or code repository",
        "Understanding of edge cases, trade-offs, and standard architectural practices in that domain"
      ],
      explanation: `Tests practical comprehension of certified subject matter without assuming automatic mastery from credentials.`,
      learningExplanation: `Listing a certification invites examiners to verify whether you retained deep conceptual and practical knowledge. Always be ready to explain the foundational syllabus, why those concepts matter in production, and how you experimented with them firsthand.`,
      whatToStudyNext: `Hands-on labs and practical problem-solving for topics covered under "${certName}".`,
      recommendedPracticeQuestion: `Summarize the top 3 core architectural principles emphasized in "${certName}" with code examples.`
    });
  });
  return questions;
}
function getSkillSpecificQuestions(skillName, department, difficulty) {
  const normSkill = skillName.toLowerCase();
  const questions = [];
  if (normSkill.includes("python")) {
    questions.push(
      {
        id: "py_data_types_01",
        department: "Computer Science & Engineering",
        subject: "Python Programming",
        topic: "Python Core & Concurrency",
        subtopic: "Data Types & Mutability",
        skill: "Python",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain Python data types. What is the fundamental difference between mutable and immutable types, and how does Python manage variables in memory?",
        keywords: ["int", "float", "str", "list", "tuple", "set", "dict", "mutable", "immutable", "id", "memory"],
        followUpTemplates: [
          "What happens when you pass a mutable list into a function in Python? How can you prevent unexpected side effects?",
          "Why are dictionary keys required to be hashable and immutable in Python?"
        ],
        idealAnswerPoints: [
          "Standard built-in types: numeric (int, float, complex), sequence (str, list, tuple), mapping (dict), set (set, frozenset), boolean (bool)",
          "Mutable objects (list, dict, set) can be modified in-place without changing their memory id()",
          "Immutable objects (int, float, str, tuple, frozenset) cannot be modified after creation; operations return a new object in memory",
          "Python uses reference passing: variables hold references to objects in heap memory"
        ],
        explanation: "Core Python foundational topic testing understanding of data structures, mutability, and memory references.",
        learningExplanation: "In Python, everything is an object. Mutable types like lists and dictionaries can have their contents altered without altering their object identity id(x). Immutable types like strings and tuples cannot; attempting to alter them allocates a new object in memory. Dictionary keys must be immutable because hashing relies on fixed values.",
        whatToStudyNext: "Python Memory Management: Object references, garbage collection, and shallow vs deep copy.",
        recommendedPracticeQuestion: "Write a short Python snippet demonstrating how default mutable arguments in functions (def fn(arr=[])) can cause unexpected bugs."
      },
      {
        id: "py_collections_diff_02",
        department: "Computer Science & Engineering",
        subject: "Python Programming",
        topic: "Python Core & Concurrency",
        subtopic: "Built-in Collections",
        skill: "Python",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the differences between list, tuple, set, and dictionary in Python regarding ordering, mutability, duplicate handling, and lookup time complexity.",
        keywords: ["list", "tuple", "set", "dictionary", "ordered", "mutable", "hash", "lookup", "o(1)", "o(n)"],
        followUpTemplates: [
          "Under what circumstances would you choose a tuple over a list for storing data in a web application?",
          "How does Python set lookup achieve O(1) average time complexity?"
        ],
        idealAnswerPoints: [
          "List: Ordered, mutable, allows duplicates, indexed by integers. O(n) search, O(1) append.",
          "Tuple: Ordered, immutable, allows duplicates, indexed by integers. Faster and hashable.",
          "Set: Unordered (or insertion-ordered in recent versions), mutable, UNIQUE values only, hash-based O(1) average lookup.",
          "Dictionary: Key-value mapping, keys must be unique and hashable, mutable, O(1) average key lookup."
        ],
        explanation: "Tests precision in choosing the correct Python collection data structure for optimal performance.",
        learningExplanation: "Lists are general-purpose dynamic arrays. Tuples represent fixed heterogeneous records and are memory-efficient. Sets implement mathematical set operations and guarantee uniqueness in O(1) average time. Dictionaries map unique keys to values using hash tables.",
        whatToStudyNext: "Python collections module: defaultdict, Counter, deque, and OrderedDict.",
        recommendedPracticeQuestion: "Implement a function that uses a set to remove duplicate items from a list while preserving original insertion order."
      },
      {
        id: "py_decorators_exceptions_03",
        department: "Computer Science & Engineering",
        subject: "Python Programming",
        topic: "Python Core & Concurrency",
        subtopic: "Decorators & Error Handling",
        skill: "Python",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain how decorators work in Python and how exception handling is structured with try, except, else, and finally blocks.",
        keywords: ["decorator", "wrapper", "functools.wraps", "first-class functions", "try", "except", "else", "finally"],
        followUpTemplates: [
          "Why should you use @functools.wraps when writing custom decorators?",
          "When does the else block execute in a Python try-except construct?"
        ],
        idealAnswerPoints: [
          "Decorators take a function as an argument, wrap its behavior with inner wrapper(*args, **kwargs), and return the wrapped function",
          "Decorators rely on Python first-class functions and closures",
          "@functools.wraps preserves original function metadata (__name__, __doc__)",
          "try executes dangerous code, except catches specified exceptions, else runs if NO exception occurred, finally always runs (resource cleanup)"
        ],
        explanation: "Evaluates advanced functional constructs and production exception handling practices in Python.",
        learningExplanation: "Decorators are syntactic sugar for fn = decorator(fn). They wrap behavior (such as logging, timing, authentication) around functions without modifying their source code. In exception handling, else runs only when no errors occur, while finally guarantees cleanup (like closing files or DB connections) regardless of exceptions.",
        whatToStudyNext: "Parameterized decorators, context managers (with statement, __enter__, __exit__), and custom exception classes.",
        recommendedPracticeQuestion: "Write a Python decorator @time_it that measures and prints the execution time of any function in milliseconds."
      },
      {
        id: "py_duplicates_coding_04",
        department: "Computer Science & Engineering",
        subject: "Python Programming",
        topic: "Python Core & Concurrency",
        subtopic: "Algorithms & Coding",
        skill: "Python",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "coding",
        question: "Write a Python program to find and return all duplicate elements in an array or list. Optimize for O(n) time complexity.",
        keywords: ["duplicates", "python", "array", "set", "hashmap", "frequency", "o(n)"],
        followUpTemplates: [
          "How does your solution handle memory when the input array contains 1,000,000 integers with few duplicates?",
          "Can you solve this without extra space if elements are bounded between 1 and n?"
        ],
        idealAnswerPoints: [
          "Iterate through the array maintaining a seen set and a duplicates set or frequency Counter",
          "If element is already in seen, add it to duplicates",
          "Add element to seen",
          "Return list of duplicates in O(n) time and O(n) auxiliary space"
        ],
        explanation: "Practical coding assessment testing hash table tracking, duplicate detection, and time-space trade-offs.",
        codingProblem: {
          title: "Find Duplicate Elements",
          description: "Given a list of integers `nums`, find and return all numbers that appear more than once in the list.\n\nReturn the duplicates in ascending order.",
          defaultLanguage: "python",
          starterCodes: {
            python: `def find_duplicates(nums):
    # TODO: Return all duplicate elements in O(n) time
    seen = set()
    duplicates = set()
    for num in nums:
        if num in seen:
            duplicates.add(num)
        else:
            seen.add(num)
    return sorted(list(duplicates))`,
            javascript: `function findDuplicates(nums) {
  const seen = new Set();
  const duplicates = new Set();
  for (const num of nums) {
    if (seen.has(num)) {
      duplicates.add(num);
    } else {
      seen.add(num);
    }
  }
  return Array.from(duplicates).sort((a, b) => a - b);
}`,
            cpp: `#include <vector>
#include <unordered_set>
#include <algorithm>

std::vector<int> findDuplicates(const std::vector<int>& nums) {
    std::unordered_set<int> seen;
    std::unordered_set<int> duplicates;
    for (int num : nums) {
        if (seen.find(num) != seen.end()) {
            duplicates.insert(num);
        } else {
            seen.insert(num);
        }
    }
    std::vector<int> result(duplicates.begin(), duplicates.end());
    std::sort(result.begin(), result.end());
    return result;
}`,
            java: `import java.util.*;

public class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new TreeSet<>();
        for (int num : nums) {
            if (!seen.add(num)) {
                duplicates.add(num);
            }
        }
        return new ArrayList<>(duplicates);
    }
}`
          },
          testCases: [
            {
              id: "tc1",
              input: "[4, 3, 2, 7, 8, 2, 3, 1]",
              expectedOutput: "[2,3]",
              explanation: "2 and 3 appear twice in the array."
            },
            {
              id: "tc2",
              input: "[1, 1, 2]",
              expectedOutput: "[1]",
              explanation: "1 appears twice."
            },
            {
              id: "tc3",
              input: "[1]",
              expectedOutput: "[]",
              explanation: "No duplicates exist."
            }
          ]
        },
        learningExplanation: 'Tracking elements with a hash set allows membership checks in O(1) average time. As you iterate through the list, if an element already exists in the "seen" set, add it to your "duplicates" set. Total runtime is O(n), avoiding the slow O(n^2) nested loop.',
        whatToStudyNext: "In-place cyclic sort and bit manipulation for O(1) extra space duplicate detection.",
        recommendedPracticeQuestion: "Find duplicates in an array of size n containing elements from 1 to n in O(n) time and O(1) extra space."
      },
      {
        id: "py_oop_concepts_05",
        department: "Computer Science & Engineering",
        subject: "Python Programming",
        topic: "Python Core & Concurrency",
        subtopic: "Object-Oriented Programming",
        skill: "Python",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the four core principles of Object-Oriented Programming (OOP) in Python: Encapsulation, Abstraction, Inheritance, and Polymorphism, with practical code examples.",
        keywords: ["oop", "encapsulation", "inheritance", "polymorphism", "abstraction", "__init__", "class", "self", "super"],
        followUpTemplates: [
          "How does Python implement private attributes? Does Python enforce strict encapsulation like Java or C++?",
          "What is Method Resolution Order (MRO) in Python multiple inheritance, and how does C3 linearization work?"
        ],
        idealAnswerPoints: [
          "Encapsulation: Bundling data and methods inside classes; using name mangling (_private, __very_private)",
          "Abstraction: Hiding complex internal logic; using abc module (ABC, @abstractmethod)",
          "Inheritance: Subclasses inheriting properties and methods from parent class via class Dog(Animal): using super().__init__()",
          'Polymorphism: Different classes responding to the same method interface (duck typing: "if it quacks like a duck")'
        ],
        explanation: "Evaluates solid understanding of software design, code reusability, and Python OOP conventions.",
        learningExplanation: "Python supports OOP with flexible duck typing. Encapsulation is by convention (_protected) or name mangling (__private). Abstraction is enforced via the abc.ABC class. Inheritance enables code reuse with super(). Polymorphism means different objects can be treated identically through common method signatures.",
        whatToStudyNext: "Dunder/Magic methods (__str__, __repr__, __len__, __iter__), classmethod vs staticmethod, and dataclasses.",
        recommendedPracticeQuestion: "Create an abstract BaseRepository class using abc.ABC with abstract methods save() and find_by_id(), and implement a ConcreteSqlRepository."
      }
    );
  }
  if (normSkill.includes("javascript") || normSkill === "js") {
    questions.push(
      {
        id: "js_variables_01",
        department: "Computer Science & Engineering",
        subject: "Web Technologies",
        topic: "Frontend & Web Engineering",
        subtopic: "Core JavaScript Execution",
        skill: "JavaScript",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the differences between let, const, and var in JavaScript regarding scope, hoisting, and re-assignment. What is the Temporal Dead Zone (TDZ)?",
        keywords: ["var", "let", "const", "scope", "hoisting", "temporal dead zone", "block scope", "function scope"],
        followUpTemplates: [
          "Can the contents of a const object or array be modified in JavaScript? Why or why not?",
          "Why did ES6 introduce block scoping instead of relying solely on function scoping with var?"
        ],
        idealAnswerPoints: [
          "var is function-scoped (or globally scoped), hoisted to top initialized as undefined, allows re-declaration and re-assignment",
          "let is block-scoped ({ }), hoisted but uninitialized (in TDZ until declaration), allows re-assignment but no re-declaration in same scope",
          "const is block-scoped, in TDZ until declared, requires immediate assignment and cannot be re-assigned (though object properties remain mutable)",
          "Temporal Dead Zone: Time between entering scope and variable declaration where accessing variable throws ReferenceError"
        ],
        explanation: "Foundational JavaScript interview question testing scoping, hoisting mechanics, and modern ES6 standards.",
        learningExplanation: "var causes subtle bugs because it leaks outside of loops and if-blocks to the surrounding function, and hoisting initializes it to undefined. Modern JavaScript uses const by default and let only when re-assignment is required. Both let and const are hoisted into the Temporal Dead Zone, preventing access before their definition line.",
        whatToStudyNext: "JavaScript Execution Context, Lexical Environment, and Call Stack mechanics.",
        recommendedPracticeQuestion: "Explain what console.log(a); var a = 10; and console.log(b); let b = 10; output, and why."
      },
      {
        id: "js_closures_promises_02",
        department: "Computer Science & Engineering",
        subject: "Web Technologies",
        topic: "Frontend & Web Engineering",
        subtopic: "Asynchronous JavaScript",
        skill: "JavaScript",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain closures and promises in JavaScript. How does a closure retain access to outer scope variables, and what are the three states of a Promise?",
        keywords: ["closure", "lexical scope", "promise", "pending", "fulfilled", "rejected", "microtask", "then", "catch"],
        followUpTemplates: [
          "Give a practical real-world example of using a closure in web development (e.g. data privacy, memoization, debounce).",
          "How does Promise.all() differ from Promise.allSettled() when one of the promises rejects?"
        ],
        idealAnswerPoints: [
          "Closure: A function bundled together with references to its surrounding lexical environment; inner functions retain access to outer function variables even after outer function returns",
          "Use cases for closures: Data hiding/private variables, function factories, debouncing/throttling, memoization",
          "Promise: An object representing the eventual completion (or failure) of an asynchronous operation and its resulting value",
          "Three Promise states: pending (initial), fulfilled (succeeded with value via resolve), rejected (failed with error via reject)",
          "Chaining via .then(), .catch(), .finally() in the Microtask queue"
        ],
        explanation: "Evaluates understanding of lexical scoping and modern asynchronous management in JavaScript.",
        learningExplanation: "A closure is created every time a function is created, retaining references to its parent lexical environment. Promises replace callback hell by providing a standardized state machine (pending -> fulfilled/rejected) that queues fulfillment callbacks in the Microtask queue.",
        whatToStudyNext: "The JavaScript Event Loop: MacroTask Queue vs Microtask Queue, Promise combinators (race, any).",
        recommendedPracticeQuestion: "Write a custom createCounter(start) function using a closure that exposes increment(), decrement(), and getValue() methods."
      },
      {
        id: "js_async_await_03",
        department: "Computer Science & Engineering",
        subject: "Web Technologies",
        topic: "Frontend & Web Engineering",
        subtopic: "Asynchronous JavaScript",
        skill: "JavaScript",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain async/await in JavaScript. How does it simplify asynchronous code compared to promise chains, and how do you handle errors properly with try...catch?",
        keywords: ["async", "await", "promise", "try", "catch", "non-blocking", "event loop", "microtask"],
        followUpTemplates: [
          "What happens if you forget to use await inside an async function? What is returned?",
          "How can you run two independent async API requests in parallel using async/await?"
        ],
        idealAnswerPoints: [
          "async marks a function as asynchronous and automatically wraps its return value in a Promise",
          "await pauses the execution of the async function non-blockingly until the awaited Promise settles",
          "Replaces verbose .then().catch() chains with clean, readable synchronous-looking control flow",
          "Errors are caught using standard try...catch blocks; unhandled rejections bubble up",
          "Parallel execution using await Promise.all([fetchA(), fetchB()]) instead of sequential awaits"
        ],
        explanation: "Evaluates asynchronous architecture, clean error handling, and parallel execution optimization.",
        learningExplanation: "async/await is built on top of Promises and Generators. While await halts the async function, it does NOT block the JavaScript main thread or event loop. Parallel execution with Promise.all() is critical to avoid sequential network latency waterfalls.",
        whatToStudyNext: "Error propagation in async functions, AbortController for canceling fetch requests.",
        recommendedPracticeQuestion: "Refactor a nested 3-level .then() promise chain into clean async/await with robust try...catch error logging."
      },
      {
        id: "js_dom_events_04",
        department: "Computer Science & Engineering",
        subject: "Web Technologies",
        topic: "Frontend & Web Engineering",
        subtopic: "DOM Manipulation & Events",
        skill: "JavaScript",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain event handling and the Document Object Model (DOM) in JavaScript. What is event bubbling, event capturing, and how does event delegation improve performance?",
        keywords: ["dom", "event bubbling", "event capturing", "event delegation", "addeventlistener", "stoppropagation", "target"],
        followUpTemplates: [
          "What is the difference between event.target and event.currentTarget?",
          "Why is event delegation beneficial when rendering a dynamic list of 1,000 items?"
        ],
        idealAnswerPoints: [
          "DOM is the tree-like programmatic representation of HTML elements in memory",
          "Event phases: Capturing (down from window to target), Target phase, Bubbling (up from target back to window)",
          "Event delegation attaches a single event listener to a common parent element, leveraging bubbling to handle events for all current and future child elements via e.target",
          "Performance benefit: Conserves memory by avoiding hundreds of individual event listeners on dynamic list nodes",
          "e.stopPropagation() stops event traversal; e.preventDefault() cancels browser default action"
        ],
        explanation: "Tests core browser runtime fundamentals, event architecture, and performance optimization.",
        learningExplanation: "Event delegation is a core frontend design pattern. Instead of attaching onclick to 500 table rows, you attach a single listener to the parent <table> or <tbody> and inspect event.target. Matches with bubbling save significant browser memory.",
        whatToStudyNext: "Web APIs: MutationObserver, IntersectionObserver, and RequestAnimationFrame.",
        recommendedPracticeQuestion: "Write a vanilla JavaScript script that implements event delegation on a <ul> to delete any clicked <li> item."
      }
    );
  }
  if (normSkill.includes("sql") || normSkill.includes("mysql") || normSkill.includes("postgres") || normSkill.includes("database")) {
    questions.push(
      {
        id: "sql_keys_01",
        department: "Computer Science & Engineering",
        subject: "Database Management Systems",
        topic: "Database Systems",
        subtopic: "Relational Integrity & Schema Design",
        skill: "SQL",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the difference between a primary key, unique key, and foreign key in relational databases. What is referential integrity?",
        keywords: ["primary key", "foreign key", "unique key", "null", "referential integrity", "cascade", "constraint"],
        followUpTemplates: [
          "Can a table have multiple foreign keys? Can a foreign key column contain NULL values?",
          "What happens during ON DELETE CASCADE vs ON DELETE RESTRICT in SQL foreign keys?"
        ],
        idealAnswerPoints: [
          "Primary Key: Uniquely identifies each row in a table. Must contain unique values and CANNOT be NULL. Only one primary key per table.",
          "Unique Key: Enforces uniqueness across a column, but CAN accept one or more NULL values (depending on RDBMS). Multiple unique keys allowed.",
          "Foreign Key: A column (or set of columns) that references the primary key of another table, establishing a parent-child relationship.",
          "Referential Integrity: Ensures child records cannot reference non-existent parent rows; enforced via constraints (CASCADE, SET NULL, RESTRICT)."
        ],
        explanation: "Foundational relational database question on schema design, data constraints, and relationship integrity.",
        learningExplanation: "Primary keys guarantee row identity and automatically create clustered indexes. Foreign keys prevent orphan records and maintain relational consistency across tables. ON DELETE CASCADE automatically cleans up child records when a parent record is deleted.",
        whatToStudyNext: "Composite primary keys, surrogate vs natural keys, and self-referencing foreign keys.",
        recommendedPracticeQuestion: "Write a CREATE TABLE statement for an Orders table linking to Customers with a foreign key and ON DELETE CASCADE."
      },
      {
        id: "sql_joins_02",
        department: "Computer Science & Engineering",
        subject: "Database Management Systems",
        topic: "Database Systems",
        subtopic: "Relational Joins & Set Operations",
        skill: "SQL",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "sql",
        question: "Explain SQL joins with examples. What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?",
        keywords: ["inner join", "left join", "right join", "full outer join", "on", "null", "cartesian product"],
        followUpTemplates: [
          "How do you write a query to find all customers who have NEVER placed an order using a LEFT JOIN?",
          "What is a CROSS JOIN, and when can it cause severe database server memory exhaustion?"
        ],
        idealAnswerPoints: [
          "INNER JOIN: Returns only rows where there is a matching key in both tables.",
          "LEFT JOIN (LEFT OUTER JOIN): Returns all rows from the left table, plus matched rows from the right table; unmatched right fields are NULL.",
          "RIGHT JOIN: Returns all rows from the right table, plus matched rows from the left table.",
          "FULL OUTER JOIN: Returns all rows when there is a match in either left or right table; unmatched columns on either side are filled with NULL."
        ],
        explanation: "Core database querying topic assessing set theory and multi-table data extraction.",
        learningExplanation: 'INNER JOIN finds the intersection. LEFT JOIN preserves all left table records regardless of whether a match exists on the right. Filtering for "WHERE right_table.id IS NULL" after a LEFT JOIN is the standard pattern to find missing relationships.',
        whatToStudyNext: "JOIN optimization: Hash joins vs nested loop joins vs merge joins, and indexing join foreign keys.",
        recommendedPracticeQuestion: "Write an SQL query to list Employee names and their Department names, including employees without a department."
      },
      {
        id: "sql_groupby_having_03",
        department: "Computer Science & Engineering",
        subject: "Database Management Systems",
        topic: "Database Systems",
        subtopic: "Aggregation & Filtering",
        skill: "SQL",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "sql",
        question: "Explain GROUP BY and HAVING in SQL. What is the difference between WHERE and HAVING, and what are the standard aggregate functions?",
        keywords: ["group by", "having", "where", "count", "sum", "avg", "min", "max", "aggregation"],
        followUpTemplates: [
          "Can you use an aggregate function like SUM(amount) inside a WHERE clause? Why or why not?",
          "What is the logical query processing order between FROM, WHERE, GROUP BY, HAVING, and SELECT?"
        ],
        idealAnswerPoints: [
          "GROUP BY collapses multiple rows sharing identical values in specified columns into summary rows",
          "Standard aggregate functions: COUNT(), SUM(), AVG(), MIN(), MAX()",
          "WHERE filters individual rows BEFORE aggregation occurs; cannot evaluate aggregate functions",
          "HAVING filters aggregated groups AFTER GROUP BY execution; evaluates conditions on aggregate calculations (e.g. HAVING COUNT(*) > 5)",
          "Logical execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY"
        ],
        explanation: "Evaluates SQL query formulation, execution order, and aggregation mechanics.",
        learningExplanation: 'WHERE filters raw rows before grouping. HAVING filters the grouped rows produced by aggregate functions. You cannot write "WHERE COUNT(*) > 2" because the count does not exist until grouping has completed.',
        whatToStudyNext: "Window functions in SQL: ROW_NUMBER(), RANK(), DENSE_RANK(), and PARTITION BY.",
        recommendedPracticeQuestion: "Write an SQL query to find departments where the average employee salary is greater than $75,000."
      },
      {
        id: "sql_normalization_indexes_04",
        department: "Computer Science & Engineering",
        subject: "Database Management Systems",
        topic: "Database Systems",
        subtopic: "Normalization & Index Optimization",
        skill: "SQL",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain database normalization (1NF, 2NF, 3NF) and indexes (Clustered vs Non-Clustered). Why does indexing improve SELECT speed but slow down INSERT/UPDATE operations?",
        keywords: ["normalization", "1nf", "2nf", "3nf", "b-tree", "clustered index", "non-clustered index", "insert", "update"],
        followUpTemplates: [
          "When would a database architect intentionally denormalize a database schema in production?",
          "How does a B-Tree index structure enable O(log n) search operations?"
        ],
        idealAnswerPoints: [
          "1NF: Atomic values, unique column names, unique rows.",
          "2NF: Must be in 1NF and have no partial dependencies (all non-key attributes fully dependent on entire composite primary key).",
          "3NF: Must be in 2NF and have no transitive dependencies (non-key attribute depending on another non-key attribute).",
          "Clustered Index: Sorts and stores the actual data rows in the table; only one clustered index per table (typically the primary key).",
          "Non-Clustered Index: Separate B-Tree structure storing index keys with pointers to the data rows; multiple allowed.",
          "Trade-off: Speeds up reads (SELECT) by avoiding full table scans; slows down writes (INSERT, UPDATE, DELETE) because index B-Trees must be rebalanced."
        ],
        explanation: "Tests database architecture, anomaly prevention, B-Tree data structures, and production performance trade-offs.",
        learningExplanation: "Normalization minimizes data redundancy and update anomalies. Indexes (primarily B-Trees) reduce lookups from O(n) table scans to O(log n) tree traversals. However, every write operation must also update and rebalance the index tree, adding overhead.",
        whatToStudyNext: "Composite indexes, covering indexes, EXPLAIN / query execution plans, and Boyce-Codd Normal Form (BCNF).",
        recommendedPracticeQuestion: "Identify the transitive dependency in an Employees table containing (emp_id, emp_name, dept_id, dept_name) and decompose it into 3NF."
      },
      {
        id: "sql_transactions_acid_05",
        department: "Computer Science & Engineering",
        subject: "Database Management Systems",
        topic: "Database Systems",
        subtopic: "Transaction Processing & ACID Properties",
        skill: "SQL",
        difficulty: "Advanced",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain database transactions and ACID properties: Atomicity, Consistency, Isolation, and Durability. What are transaction isolation levels and concurrency anomalies (Dirty Read, Non-Repeatable Read, Phantom Read)?",
        keywords: ["acid", "atomicity", "consistency", "isolation", "durability", "dirty read", "phantom read", "serializable"],
        followUpTemplates: [
          "How does a database recover committed transactions if a power failure occurs immediately after a commit?",
          "What is the performance trade-off between READ COMMITTED and SERIALIZABLE isolation levels?"
        ],
        idealAnswerPoints: [
          "Atomicity: All-or-nothing execution; if any statement fails, the entire transaction rolls back.",
          "Consistency: Transactions bring the database from one valid state to another, satisfying all constraints.",
          "Isolation: Concurrent transactions execute independently without interfering with each other.",
          "Durability: Once a transaction commits, changes are permanently recorded in non-volatile storage (via WAL / redo log).",
          "Concurrency anomalies: Dirty Read (reading uncommitted data), Non-Repeatable Read (rereading same row yields different data), Phantom Read (new rows inserted by another transaction).",
          "Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable."
        ],
        explanation: "Advanced database engineering topic testing concurrency control, recovery mechanisms, and ACID consistency.",
        learningExplanation: "ACID properties ensure enterprise reliability. In banking, transferring $100 requires debiting account A and crediting account B atomically. Write-Ahead Logging (WAL) ensures durability. Higher isolation levels (Serializable) prevent anomalies like phantom reads through two-phase locking or MVCC at the cost of concurrency throughput.",
        whatToStudyNext: "Multi-Version Concurrency Control (MVCC), Write-Ahead Logging (WAL), and distributed transactions (2PC).",
        recommendedPracticeQuestion: "Explain how PostgreSQL or MySQL uses MVCC to allow concurrent reads and writes without blocking table locks."
      }
    );
  }
  if (normSkill.includes("flask")) {
    questions.push(
      {
        id: "flask_routing_http_01",
        department: "Computer Science & Engineering",
        subject: "Web Technologies",
        topic: "Backend Web & API Architecture",
        subtopic: "Flask Routing & Methods",
        skill: "Flask",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain routing and HTTP methods in Flask. How do you define dynamic URL parameters and restrict endpoints to specific methods like GET and POST?",
        keywords: ["flask", "@app.route", "http methods", "get", "post", "dynamic routes", "url_for"],
        followUpTemplates: [
          "How does Flask parse URL path converters like <int:user_id> vs <string:username>?",
          'What happens when a client sends a POST request to an endpoint defined with methods=["GET"]?'
        ],
        idealAnswerPoints: [
          'Flask uses @app.route("/path", methods=["GET", "POST"]) decorator to map URLs to Python view functions',
          "Dynamic parameters defined with <converter:variable_name>, e.g. <int:id>",
          "Built-in converters: string, int, float, path, uuid",
          "If an unpermitted method is called, Flask automatically returns 405 Method Not Allowed"
        ],
        explanation: "Tests basic web routing and HTTP request mapping in the Flask microframework.",
        learningExplanation: 'In Flask, @app.route() binds URLs to view functions. By default, routes only accept GET requests. Adding methods=["GET", "POST"] allows multi-method endpoints. Converters like <int:id> automatically validate types and pass typed arguments to view functions.',
        whatToStudyNext: "Flask Blueprints for modular application structuring and url_for() dynamic generation.",
        recommendedPracticeQuestion: "Write a Flask route /api/users/<int:user_id> that accepts both GET (fetch user) and PUT (update user) requests."
      },
      {
        id: "flask_rest_apis_02",
        department: "Computer Science & Engineering",
        subject: "Web Technologies",
        topic: "Backend Web & API Architecture",
        subtopic: "REST API & Request Handling",
        skill: "Flask",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain how request and response handling, JSON serialization, and database connectivity (e.g. SQLAlchemy) work in Flask REST APIs.",
        keywords: ["flask", "request", "jsonify", "request.get_json()", "sqlalchemy", "status code", "orm"],
        followUpTemplates: [
          "What is the difference between request.form, request.args, and request.get_json() in Flask?",
          "How does Flask-SQLAlchemy manage database sessions and prevent connection pool exhaustion?"
        ],
        idealAnswerPoints: [
          "request object: request.args (query params), request.form (form data), request.get_json() (JSON payloads)",
          "jsonify() serializes Python dictionaries/lists to JSON responses and sets header Content-Type: application/json",
          "Returning HTTP status codes: return jsonify(data), 200 or 201 Created or 400 Bad Request",
          "Database connectivity via Flask-SQLAlchemy: db.session.add(), db.session.commit(), db.session.rollback() on errors"
        ],
        explanation: "Evaluates production REST API design, request parsing, and ORM persistence in Python backend services.",
        learningExplanation: "Flask relies on thread-local request contexts. To build a REST API, parse incoming JSON with request.get_json(silent=True), validate inputs, execute database queries using SQLAlchemy ORM sessions, and return jsonify(result), status_code. Ensure try...finally blocks rollback transactions on exceptions.",
        whatToStudyNext: "Flask Application Factory pattern, JWT authentication in Flask, and database migrations with Flask-Migrate.",
        recommendedPracticeQuestion: 'Implement a Flask REST endpoint POST /api/items that validates JSON payload {"name": str, "price": float} and returns 201 or 400.'
      }
    );
  }
  if (normSkill.includes("react")) {
    questions.push(
      {
        id: "react_props_state_01",
        department: "Computer Science & Engineering",
        subject: "Frontend Engineering",
        topic: "Frontend & Web Engineering",
        subtopic: "React Components & State",
        skill: "React",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain components, props, and state in React. What is unidirectional data flow, and why should state never be mutated directly?",
        keywords: ["props", "state", "components", "immutability", "re-render", "unidirectional", "virtual dom"],
        followUpTemplates: [
          "What happens if you mutate state directly like state.count = 5 instead of calling setCount(5)?",
          "How do you pass data from a child component back up to a parent component in React?"
        ],
        idealAnswerPoints: [
          "Components: Reusable, self-contained building blocks of UI returning JSX",
          "Props: Read-only inputs passed from parent to child components (immutable to the receiver)",
          "State: Internal, mutable data managed by the component that triggers re-rendering when updated",
          "Unidirectional Data Flow: Data flows downwards from parent to child via props; events flow upwards via callback functions",
          "Direct mutation bypasses React reconciliation diffing algorithm, preventing the component from re-rendering"
        ],
        explanation: "Core React architectural principles testing component hierarchy and state management fundamentals.",
        learningExplanation: "React components are pure functions with respect to their props. State represents dynamic data. Because React relies on shallow object comparison (Object.is) to schedule Virtual DOM diffs and re-renders, direct state mutations fail to trigger UI updates. Always update state with setter functions or immutable copies.",
        whatToStudyNext: "React Reconciliation and the Fiber architecture.",
        recommendedPracticeQuestion: "Write a React component with an input field where typing updates local state and displays the text in real time."
      },
      {
        id: "react_hooks_lifecycle_02",
        department: "Computer Science & Engineering",
        subject: "Frontend Engineering",
        topic: "Frontend & Web Engineering",
        subtopic: "Hooks & API Integration",
        skill: "React",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the useState and useEffect hooks in React. How does the dependency array control execution, how do you handle cleanup, and how do you integrate backend APIs?",
        keywords: ["usestate", "useeffect", "dependency array", "cleanup function", "api integration", "fetch", "unmount"],
        followUpTemplates: [
          "What causes an infinite loop in useEffect, and how do you prevent it?",
          "Why must cleanup functions be returned from useEffect when setting up event listeners or timers?"
        ],
        idealAnswerPoints: [
          "useState: Declares a state variable [value, setValue] = useState(initial)",
          "useEffect: Performs side effects (data fetching, DOM listeners, timers, subscriptions)",
          "Dependency array: [] runs once on mount; [dep] runs on mount and when dep changes; omitted runs on every render",
          "Cleanup function: Returned from useEffect to cancel network requests, remove event listeners, or clear timers on unmount",
          "API integration: Call fetch/axios inside useEffect with loading and error states, handling race conditions"
        ],
        explanation: "Evaluates practical frontend development skills, hook lifecycle mechanics, and asynchronous API handling.",
        learningExplanation: "useEffect manages side effects in functional components. A common bug is missing dependencies or causing infinite loops by updating a state variable that is also listed in the dependency array. The return () => {} cleanup function prevents memory leaks when components unmount.",
        whatToStudyNext: "Advanced React Hooks: useCallback, useMemo, useRef, and custom hooks.",
        recommendedPracticeQuestion: "Write a React hook or component that fetches user data from /api/users, displaying Loading, Error, or Data states."
      }
    );
  }
  if (normSkill.includes("git")) {
    questions.push(
      {
        id: "git_workflow_01",
        department: "Computer Science & Engineering",
        subject: "Software Engineering",
        topic: "Software Engineering Practices",
        subtopic: "Version Control Workflows",
        skill: "Git",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the core Git commands: commit, push, pull, branch, and merge. What is the difference between git fetch and git pull?",
        keywords: ["commit", "push", "pull", "branch", "merge", "fetch", "working directory", "staging area", "remote"],
        followUpTemplates: [
          "What is the difference between git merge and git rebase?",
          "What are Git detached HEAD states, and how do they occur?"
        ],
        idealAnswerPoints: [
          "commit: Records staged snapshots to local repository history with a commit message",
          "push: Uploads local branch commits to a remote repository (e.g. GitHub)",
          "fetch: Downloads new commits/branches from remote to local without modifying working files",
          "pull: Combines git fetch + git merge, downloading remote changes and immediately merging them into active branch",
          "branch: Creates an independent pointer to a commit for feature development",
          "merge: Combines histories of two branches together"
        ],
        explanation: "Fundamental version control commands essential for every engineering team.",
        learningExplanation: "Git operates across 3 local trees: Working Directory -> Staging Area (Index) -> Local Repository (HEAD). git fetch updates remote-tracking branches safely. git pull immediately merges remote changes into your local branch, which may cause unexpected merge commits.",
        whatToStudyNext: "Interactive Git Rebase (git rebase -i), squashing commits, and Git cherry-pick.",
        recommendedPracticeQuestion: "Explain step-by-step commands to create a feature branch, make a commit, push to remote, and open a PR."
      },
      {
        id: "git_merge_conflicts_02",
        department: "Computer Science & Engineering",
        subject: "Software Engineering",
        topic: "Software Engineering Practices",
        subtopic: "Conflict Resolution & Best Practices",
        skill: "Git",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "practical",
        question: "Explain what causes a Git merge conflict and describe the exact step-by-step process to resolve it without losing team changes.",
        keywords: ["merge conflict", "conflict markers", "<<<<<<<", "=======", ">>>>>>>", "git status", "git add", "commit"],
        followUpTemplates: [
          "How can teams minimize the frequency of merge conflicts in continuous integration workflows?",
          "What is git stash and how is it used when switching branches with uncommitted work?"
        ],
        idealAnswerPoints: [
          "Cause: When two branches modify the same line of code differently, or one branch deletes a file that another modified",
          "Git pauses merge and inserts conflict markers: <<<<<<< HEAD (current branch), =======, >>>>>>> feature_branch (incoming changes)",
          "Resolution steps: Run git status to identify conflicted files, open files and inspect conflict markers",
          "Edit lines to desired combined code, remove conflict marker lines entirely",
          "Stage resolved files with git add <filename>",
          "Complete merge with git commit (or git merge --continue)"
        ],
        explanation: "Tests real-world collaborative version control troubleshooting and conflict resolution.",
        learningExplanation: "Merge conflicts are normal in collaborative engineering. When automatic three-way merge fails, Git marks the ambiguous lines with <<<<<<< HEAD and >>>>>>> branch. You resolve by manually reconciling the code, removing markers, staging the file, and committing the merge.",
        whatToStudyNext: "Git Hooks, trunk-based development vs GitFlow, and git rerere (reuse recorded resolution).",
        recommendedPracticeQuestion: "Walk through how you would resolve a merge conflict in package.json or requirements.txt where both branches added different libraries."
      }
    );
  }
  if (normSkill.includes("java") && !normSkill.includes("javascript")) {
    questions.push(
      {
        id: "java_jvm_gc_01",
        department: "Computer Science & Engineering",
        subject: "Java Programming & JVM",
        topic: "Programming Languages",
        subtopic: "JVM Architecture & Memory Management",
        skill: "Java",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain JVM memory architecture (Heap, Stack, Metaspace, Program Counter). How does Garbage Collection identify unreachable objects, and how does Java HashMap handle hash collisions?",
        keywords: ["java", "jvm", "heap", "stack", "garbage collection", "hashmap", "collision", "red-black tree"],
        followUpTemplates: [
          "What is the difference between equals() and hashCode() contracts in Java?",
          "Why did Java 8 switch HashMap buckets from linked lists to balanced Red-Black Trees when length exceeds 8?"
        ],
        idealAnswerPoints: [
          "Heap: Shared memory holding all object instances; Stack: Thread-local memory holding method frames, local primitive variables, and references",
          "Metaspace: Stores class metadata, bytecode, and static variables outside the heap in native memory",
          "Garbage Collection: Uses Generational Hypothesis (Young Generation: Eden/Survivor, Old Generation); identifies live objects via GC Roots reachability analysis",
          "HashMap Collisions: Uses separate chaining with buckets; if a bucket exceeds 8 entries (TREEIFY_THRESHOLD), it converts from singly linked list to Red-Black Tree, reducing lookup from O(n) to O(log n)"
        ],
        explanation: "Core Java platform architecture testing JVM memory management, collections, and algorithms.",
        learningExplanation: "Understanding the JVM is crucial for avoiding OutOfMemoryErrors and memory leaks. HashMaps store entries in buckets indexed by hash(key) & (n-1). When keys collide, chaining stores multiple items in the same bucket.",
        whatToStudyNext: "Java Concurrency (synchronized, volatile, ReentrantLock, ExecutorService).",
        recommendedPracticeQuestion: "Implement a thread-safe singleton pattern in Java using Double-Checked Locking."
      }
    );
  }
  if (normSkill.includes("c++") || normSkill.includes("cpp") || normSkill === "c" || normSkill.includes("c programming")) {
    questions.push(
      {
        id: "cpp_pointers_virtual_01",
        department: "Computer Science & Engineering",
        subject: "C / C++ Systems Programming",
        topic: "Programming Languages",
        subtopic: "Pointers, RAII & Polymorphism",
        skill: "C++",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the difference between stack and heap memory allocation in C/C++. How do virtual functions achieve runtime polymorphism through the vtable and vptr, and why must base class destructors be declared virtual?",
        keywords: ["c++", "pointers", "virtual function", "vtable", "vptr", "polymorphism", "raii", "destructor"],
        followUpTemplates: [
          "What happens if a base class destructor is NOT virtual when deleting a derived object via a base class pointer?",
          "How do modern C++ smart pointers (std::unique_ptr and std::shared_ptr) prevent memory leaks?"
        ],
        idealAnswerPoints: [
          "Stack: Fast, automated allocation/deallocation on function entry/exit; Heap: Manual dynamic memory managed via malloc/free or new/delete",
          "Virtual Table (vtable): Compiler creates an array of function pointers for classes with virtual methods; each object instance stores a hidden vptr pointer to its class vtable",
          "Runtime Polymorphism: Invoking ptr->method() dereferences vptr to look up the overriding derived function pointer at runtime",
          "Virtual Destructor: Guarantees that deleting a derived object through a base pointer invokes the derived destructor first, then the base destructor, avoiding resource leaks"
        ],
        explanation: "Standard systems programming assessment on memory lifecycle, polymorphism mechanics, and object destruction.",
        learningExplanation: "In C++, non-virtual method calls are resolved at compile time (early binding). Virtual methods use a hidden vtable pointer inside the object to resolve calls dynamically at runtime (late binding). Non-virtual base destructors cause undefined behavior and leaks.",
        whatToStudyNext: "C++ Move Semantics, rvalue references (&&), and std::move.",
        recommendedPracticeQuestion: "Write a minimal C++ class demonstrating RAII with a custom resource management wrapper."
      }
    );
  }
  if (normSkill.includes("php")) {
    questions.push(
      {
        id: "php_web_security_01",
        department: "Computer Science & Engineering",
        subject: "PHP Web Development",
        topic: "Programming Languages",
        subtopic: "Web Scripting & SQL Injection Defense",
        skill: "PHP",
        difficulty: "Beginner",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the request lifecycle in PHP. How does PDO (PHP Data Objects) with prepared statements protect web applications from SQL Injection, and what is the difference between $_GET, $_POST, and $_SESSION?",
        keywords: ["php", "pdo", "sql injection", "prepared statements", "session", "superglobals", "web security"],
        followUpTemplates: [
          "Why does parameter binding in PDO ensure user input is never interpreted as executable SQL syntax?",
          "How does PHP manage session persistence across stateless HTTP requests using session cookies?"
        ],
        idealAnswerPoints: [
          "PHP Request Lifecycle: Web server (Apache/Nginx via PHP-FPM) initiates PHP interpreter, executes script from top to bottom, sends output buffer to client, and terminates script memory",
          "Superglobals: $_GET parses URL query parameters; $_POST receives HTTP request body (form/json); $_SESSION maintains user session state across requests backed by server session files",
          "PDO Prepared Statements: Separates SQL query structure from data values; database engine pre-compiles SQL template, treating bound parameters strictly as literal values and completely neutralizing SQL Injection attacks"
        ],
        explanation: "Tests web backend fundamentals, server-side request parsing, and database security practices.",
        learningExplanation: "SQL Injection happens when raw user input is concatenated directly into query strings. PDO prepared statements pre-compile the SQL query on the database server before parameters are bound, guaranteeing user strings can never alter the query logic.",
        whatToStudyNext: "CSRF token protection in PHP forms, and modern PHP frameworks (Laravel / Symfony).",
        recommendedPracticeQuestion: "Write a secure PHP script utilizing PDO with prepared statements to authenticate a user with password_verify()."
      }
    );
  }
  if (normSkill.includes("numpy") || normSkill.includes("pandas")) {
    questions.push(
      {
        id: "numpy_pandas_data_wrangling_01",
        department: "Computer Science & Engineering",
        subject: "Data Science & Scientific Computing",
        topic: "Scientific Computing",
        subtopic: "Array Broadcasting & DataFrame Vectorization",
        skill: normSkill.includes("pandas") ? "Pandas" : "NumPy",
        difficulty: "Intermediate",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain NumPy Array Broadcasting and why vectorized operations are orders of magnitude faster than Python for-loops. In Pandas, how do you handle missing data (dropna vs fillna), and what is the difference between loc and iloc?",
        keywords: ["numpy", "pandas", "broadcasting", "vectorization", "loc vs iloc", "dataframe", "missing data"],
        followUpTemplates: [
          "What are the two compatibility rules that allow two NumPy arrays of different shapes to be broadcast together?",
          "Why should you avoid iterating over Pandas DataFrame rows with iterrows() in production code?"
        ],
        idealAnswerPoints: [
          "Vectorization: Executes array operations via compiled C/Fortran loops with SIMD vector CPU instructions and contiguous memory cache locality, eliminating Python interpreter overhead",
          "Broadcasting Rules: Compares array dimensions from right to left; dimensions are compatible if they are equal or one of them is 1",
          "Pandas loc vs iloc: loc performs label-based indexing (e.g. df.loc['row_label', 'column_name']); iloc performs integer position-based indexing (e.g. df.iloc[0:5, 0:2])",
          "Missing Data: dropna() removes rows/columns with nulls; fillna() imputes missing values with statistical measures (mean, median, forward-fill)"
        ],
        explanation: "Essential data science library questions assessing memory layout, vector operations, and data frame manipulation.",
        learningExplanation: "Python loops introduce huge per-iteration overhead. NumPy arrays are contiguous blocks of memory where math is executed directly in optimized C libraries. Broadcasting enables operations across differing array shapes without copying data in memory.",
        whatToStudyNext: "Pandas groupby aggregation pipelines and memory optimization using categorical dtypes.",
        recommendedPracticeQuestion: "Write a Pandas expression to normalize numeric columns using min-max scaling across grouped categories."
      }
    );
  }
  if (normSkill.includes("machine learning") || normSkill.includes("deep learning") || normSkill.includes("neural") || normSkill.includes("llm") || normSkill.includes("nlp") || normSkill.includes("tensorflow") || normSkill.includes("pytorch")) {
    questions.push(
      {
        id: "aiml_transformers_llm_01",
        department: "Computer Science & Engineering",
        subject: "Artificial Intelligence & Deep Learning",
        topic: "Machine Learning & AI",
        subtopic: "Transformer Architecture & Attention",
        skill: "Artificial Intelligence",
        difficulty: "Advanced",
        questionSource: "resume-skill",
        questionType: "conceptual",
        question: "Explain the Self-Attention mechanism in Transformer architectures: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. Why is the scaling factor sqrt(d_k) necessary, and what is the difference between encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) models?",
        keywords: ["transformer", "self-attention", "query key value", "softmax", "bert", "gpt", "llm", "generative ai"],
        followUpTemplates: [
          "Why do Transformers require Positional Encodings since they process tokens in parallel rather than sequentially like RNNs?",
          "What is the difference between pre-training and fine-tuning (e.g. LoRA / instruction tuning) in modern Large Language Models?"
        ],
        idealAnswerPoints: [
          "Self-Attention: Maps queries Q and keys K to compute attention score weights via dot product, normalized by softmax, and computes weighted sum of value vectors V",
          "Scaling Factor sqrt(d_k): For large embedding dimensions d_k, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients (vanishing gradients); dividing by sqrt(d_k) stabilizes gradients",
          "Architectures: Encoder-only (BERT - bidirectional, ideal for classification/NER); Decoder-only (GPT - causal masked autoregressive, ideal for text generation); Encoder-Decoder (T5 - ideal for translation/summarization)"
        ],
        explanation: "Modern AI/ML assessment on deep learning Transformer mechanics, attention equations, and LLM foundations.",
        learningExplanation: "Unlike RNNs that process tokens one by one, Transformers compute pairwise attention between all tokens in parallel. Scaling by sqrt(d_k) prevents the softmax function from saturating, which would stall gradient updates during backpropagation.",
        whatToStudyNext: "Retrieval Augmented Generation (RAG), vector embeddings, and quantization (4-bit/8-bit).",
        recommendedPracticeQuestion: "Walk through how causal masking in GPT prevents tokens from attending to future tokens during training."
      }
    );
  }
  return questions;
}
function getCurriculumFoundationalQuestions(department, difficulty) {
  const list = [];
  const pool = DEPARTMENT_QUESTION_POOLS[department];
  if (pool && pool.length > 0) {
    list.push(...pool);
  }
  switch (department) {
    // -------------------------------------------------------------------------
    // ECE (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case "Electronics & Communication Engineering":
      list.push(
        {
          id: "ece_digital_logic_01",
          department: "Electronics & Communication Engineering",
          subject: "Digital Electronics & VLSI",
          topic: "Digital System Design & VLSI",
          subtopic: "Sequential Circuits & Timing",
          skill: "Digital Electronics",
          difficulty: "Beginner",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the difference between combinational and sequential logic circuits. What are setup time and hold time in digital flip-flops, and what happens if timing constraints are violated?",
          keywords: ["combinational", "sequential", "flip-flop", "latch", "setup time", "hold time", "metastability", "clock"],
          followUpTemplates: [
            "What is metastability in digital circuits, and how do multi-stage synchronizers mitigate it?",
            "How does a D flip-flop differ fundamentally from a D latch regarding clock triggering?"
          ],
          idealAnswerPoints: [
            "Combinational circuits: Output depends strictly on current inputs (no memory; e.g. multiplexers, adders)",
            "Sequential circuits: Output depends on current inputs and past states (contains memory elements like flip-flops, registers)",
            "Setup Time: Minimum time data input must remain stable BEFORE the active clock edge",
            "Hold Time: Minimum time data input must remain stable AFTER the active clock edge",
            "Violation leads to metastability: Output enters indeterminate oscillating state between 0 and 1, causing logic failure"
          ],
          explanation: "Core digital electronics foundation testing synchronous design and timing constraints.",
          learningExplanation: "Setup and hold times are fundamental to all synchronous digital design (FPGA, ASIC, CPU). If data changes inside the setup/hold aperture around a clock edge, the flip-flop can become metastable, taking an unpredictable amount of time to settle to a valid logic level.",
          whatToStudyNext: "Static Timing Analysis (STA), clock skew, and clock jitter.",
          recommendedPracticeQuestion: "Calculate maximum clock frequency given T_setup = 2ns, T_clk-q = 3ns, and combinational delay T_comb = 5ns."
        },
        {
          id: "ece_embedded_c_02",
          department: "Electronics & Communication Engineering",
          subject: "Embedded Systems",
          topic: "Embedded Systems & Firmware",
          subtopic: "Microcontrollers & Registers",
          skill: "Embedded C",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the purpose of the volatile keyword in Embedded C programming. How do microcontrollers handle hardware interrupts via the Interrupt Service Routine (ISR)?",
          keywords: ["volatile", "embedded c", "isr", "interrupt", "register", "compiler optimization", "hardware"],
          followUpTemplates: [
            "Why should you avoid calling printf(), malloc(), or using long delays inside an ISR?",
            "What is the difference between polling and interrupt-driven I/O in embedded microcontrollers?"
          ],
          idealAnswerPoints: [
            "volatile tells compiler that variable value can change unexpectedly outside of the immediate program code (e.g. by hardware register or ISR)",
            "Prevents compiler from aggressively caching variable in a CPU register or optimizing reads away in loops (while(!flag))",
            "Hardware Interrupt: Hardware signal pauses main CPU program flow, saves context on stack, and branches to vector table",
            "ISR execution: Must be extremely short and deterministic; sets flags or places data into ring buffers for main loop processing"
          ],
          explanation: "Essential embedded firmware topic assessing microcontroller architecture and memory handling.",
          learningExplanation: "Without volatile, an optimizing compiler sees a variable that never changes inside a while(flag == 0) loop and turns it into an infinite loop by caching flag in a CPU register. volatile forces memory reads every time. ISRs must be minimal to avoid starving other interrupts.",
          whatToStudyNext: "ARM Cortex-M NVIC (Nested Vectored Interrupt Controller) priorities and DMA (Direct Memory Access).",
          recommendedPracticeQuestion: "Write an Embedded C snippet configuring a volatile pointer to read from a memory-mapped GPIO register."
        },
        {
          id: "ece_communication_dsp_03",
          department: "Electronics & Communication Engineering",
          subject: "Signals & Communication Systems",
          topic: "Signal Processing & Systems",
          subtopic: "Sampling & Modulation",
          skill: "Communication Systems",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "State the Nyquist-Shannon Sampling Theorem. What is aliasing, and how do anti-aliasing low-pass filters prevent signal distortion during analog-to-digital conversion (ADC)?",
          keywords: ["nyquist", "sampling theorem", "aliasing", "fs >= 2fm", "adc", "low-pass filter", "dsp"],
          followUpTemplates: [
            "What is the difference between analog modulation (AM, FM) and digital modulation (BPSK, QAM)?",
            "How does the Fast Fourier Transform (FFT) reduce time complexity compared to the Discrete Fourier Transform (DFT)?"
          ],
          idealAnswerPoints: [
            "Nyquist Theorem: Continuous-time band-limited signal can be perfectly reconstructed if sampling rate fs >= 2 * fmax",
            "Aliasing: Signal frequency distortion where frequencies above fs/2 fold back into the baseband spectrum as false lower frequencies",
            "Anti-aliasing filter: Analog low-pass filter placed before ADC to attenuate all frequencies exceeding the Nyquist limit (fs/2)"
          ],
          explanation: "Tests core signal processing and communication systems fundamentals.",
          learningExplanation: "Sampling below 2*fmax folds higher frequencies back into the audible/usable band, permanently destroying signal integrity. An analog anti-aliasing filter cuts off frequencies above Nyquist prior to sampling to ensure clean digitization.",
          whatToStudyNext: "Digital filter design: FIR vs IIR filters, and constellation diagrams in QAM.",
          recommendedPracticeQuestion: "If a human voice signal has maximum frequency component of 3.4 kHz, calculate the minimum theoretical Nyquist sampling rate."
        }
      );
      break;
    // -------------------------------------------------------------------------
    // EEE (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case "Electrical & Electronics Engineering":
      list.push(
        {
          id: "eee_machines_01",
          department: "Electrical & Electronics Engineering",
          subject: "Electrical Machines",
          topic: "Electric Machines & Drives",
          subtopic: "Transformers & Induction Motors",
          skill: "Electrical Machines",
          difficulty: "Beginner",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the working principle of a transformer and why transformers operate on AC but cannot operate on steady DC. What are core losses (hysteresis and eddy current) and copper losses?",
          keywords: ["transformer", "faraday", "mutual induction", "ac vs dc", "eddy current", "hysteresis", "copper losses", "efficiency"],
          followUpTemplates: [
            "What would happen if a primary winding of a transformer is connected to a DC supply of rated voltage?",
            "Explain the torque-slip characteristics of a 3-phase squirrel cage induction motor."
          ],
          idealAnswerPoints: [
            "Operates on Faraday law of electromagnetic induction and mutual induction between primary and secondary windings",
            "Requires changing magnetic flux (dPhi/dt); steady DC produces constant flux (dPhi/dt = 0), inducing zero secondary voltage",
            "Applying steady DC causes high current in primary winding (limited only by low winding resistance), causing burnout",
            "Core losses: Hysteresis loss (reversal of magnetic domains) + Eddy current loss (induced circulating currents in laminations)",
            "Copper losses (I^2 * R): Ohmic heating losses in the windings; varies with load"
          ],
          explanation: "Fundamental electrical machinery question testing electromagnetic principles and losses.",
          learningExplanation: "Transformers transfer energy magnetically. AC creates a continually alternating magnetic flux that induces EMF in both coils. DC creates static flux, meaning no EMF is induced in the secondary and the primary winding draws massive burning current due to near-zero DC impedance.",
          whatToStudyNext: "Equivalent circuit of a transformer, open-circuit & short-circuit tests, and VFD motor control.",
          recommendedPracticeQuestion: "Calculate transformer efficiency given rated kVA = 100 kVA at 0.8 power factor, iron loss = 1 kW, and full-load copper loss = 1.5 kW."
        },
        {
          id: "eee_power_electronics_02",
          department: "Electrical & Electronics Engineering",
          subject: "Power Electronics & Drives",
          topic: "Converters & Inverters",
          subtopic: "DC-DC Converters & Switching",
          skill: "Power Electronics",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the working of a Buck converter (Step-Down DC-DC converter). How does the duty cycle D determine output voltage, and why are inductors and capacitors essential in switching converters?",
          keywords: ["buck converter", "duty cycle", "step down", "inductor", "capacitor", "pwm", "mosfet", "ripple"],
          followUpTemplates: [
            "What is the continuous conduction mode (CCM) vs discontinuous conduction mode (DCM) in switching converters?",
            "How does a full-bridge inverter convert DC into AC using Pulse Width Modulation (PWM)?"
          ],
          idealAnswerPoints: [
            "Buck converter steps down DC voltage efficiently using a fast semiconductor switch (MOSFET/IGBT), diode, inductor, and filter capacitor",
            "Relationship in CCM: Vout = D * Vin, where duty cycle D = Ton / (Ton + Toff) (0 <= D <= 1)",
            "Inductor stores energy in magnetic field during Ton and releases energy to load through freewheeling diode during Toff",
            "Capacitor filters voltage ripple to provide smooth DC output"
          ],
          explanation: "Evaluates solid state power conversion, PWM control, and energy storage element dynamics.",
          learningExplanation: "Linear regulators burn excess voltage as heat (inefficient). Buck converters switch on/off at high frequency (kHz) and use an LC low-pass filter to average the chopped voltage with 90%+ efficiency, governed by Vout = D * Vin.",
          whatToStudyNext: "Boost and Buck-Boost topologies, Flyback isolated converters, and IGBT thermal management.",
          recommendedPracticeQuestion: "Calculate output voltage of a Buck converter with input 24V, switching frequency 50kHz, and duty cycle D = 0.35."
        },
        {
          id: "eee_power_systems_control_03",
          department: "Electrical & Electronics Engineering",
          subject: "Power Systems & Control",
          topic: "Power Generation & Transmission",
          subtopic: "Stability & Faults",
          skill: "Power Systems",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the different types of symmetrical and unsymmetrical faults in electrical power systems. What is the role of protective relays and circuit breakers in isolating faults?",
          keywords: ["symmetrical fault", "unsymmetrical fault", "line to ground", "three-phase fault", "relay", "circuit breaker", "protection"],
          followUpTemplates: [
            "Why is a 3-phase symmetrical fault the most severe even though Single Line-to-Ground (L-G) is the most frequent?",
            "Explain how a PID controller stabilizes closed-loop feedback systems using Bode plots."
          ],
          idealAnswerPoints: [
            "Symmetrical fault: 3-phase fault (L-L-L, L-L-L-G); currents remain balanced; most severe fault with highest short-circuit current",
            "Unsymmetrical faults: Single Line-to-Ground (L-G, ~70% of occurrences), Line-to-Line (L-L), Double Line-to-Ground (L-L-G)",
            "Analyzed using Symmetrical Components (positive, negative, zero sequence networks)",
            "Relays sense abnormal currents/voltages and trip signals to circuit breakers",
            "Circuit breakers interrupt short-circuit fault current and extinguish the arc within cycles"
          ],
          explanation: "Core power engineering topic covering grid resilience, fault analysis, and protection systems.",
          learningExplanation: "Faults occur due to lightning, insulation breakdown, or equipment failure. Symmetrical components simplify unsymmetrical fault analysis. Protective relays detect overcurrents and command circuit breakers to mechanically open contacts and quench arcs.",
          whatToStudyNext: "Per-unit system calculations, swing equation, and transient grid stability.",
          recommendedPracticeQuestion: "Explain why zero-sequence current can only flow in power systems with a grounded neutral."
        }
      );
      break;
    // -------------------------------------------------------------------------
    // MECHANICAL (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case "Mechanical Engineering":
      list.push(
        {
          id: "mech_thermo_01",
          department: "Mechanical Engineering",
          subject: "Thermal Engineering",
          topic: "Thermal & Energy Systems",
          subtopic: "Thermodynamics & Cycles",
          skill: "Thermodynamics",
          difficulty: "Beginner",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "State the First and Second Laws of Thermodynamics. What is the significance of the Carnot cycle, and why is 100% thermal efficiency impossible for a heat engine?",
          keywords: ["first law", "second law", "carnot cycle", "kelvin-planck", "entropy", "efficiency", "heat engine", "thermal"],
          followUpTemplates: [
            "What is the difference between an Otto cycle (petrol) and a Diesel cycle regarding combustion heat addition?",
            "Explain the concept of entropy and why it must increase in irreversible spontaneous processes."
          ],
          idealAnswerPoints: [
            "First Law: Conservation of energy (Delta U = Q - W); energy cannot be created or destroyed",
            "Second Law (Kelvin-Planck statement): Impossible to construct a heat engine operating in a cycle that absorbs heat from a single reservoir and produces an equivalent amount of work",
            "Second Law (Clausius statement): Impossible to transfer heat from a colder body to a hotter body without external work",
            "Carnot cycle: Reversible theoretical benchmark with maximum possible efficiency: eta = 1 - (Tc / Th)",
            "100% efficiency requires heat sink at absolute zero (Tc = 0 K), which is physically unattainable"
          ],
          explanation: "Universal mechanical engineering foundation in thermal thermodynamics and power generation.",
          learningExplanation: "The first law tracks energy quantity; the second law dictates energy quality and direction. The Kelvin-Planck statement guarantees that every heat engine must reject waste heat to a low-temperature sink, bounding maximum efficiency by the Carnot limit.",
          whatToStudyNext: "Rankine steam power cycles, reheat and regenerative feed heating, and refrigeration vapor compression.",
          recommendedPracticeQuestion: "Calculate Carnot efficiency of a power plant operating between boiler temperature 550 C and condenser temperature 40 C."
        },
        {
          id: "mech_fluid_02",
          department: "Mechanical Engineering",
          subject: "Fluid Mechanics",
          topic: "Fluid Systems & Hydraulics",
          subtopic: "Flow Regimes & Bernoulli",
          skill: "Fluid Mechanics",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain Bernoulli equation and its underlying assumptions. What is the Reynolds number, and how does it differentiate laminar flow from turbulent flow in pipes?",
          keywords: ["bernoulli", "reynolds number", "laminar", "turbulent", "incompressible", "inviscid", "viscosity", "pipe flow"],
          followUpTemplates: [
            "What causes major and minor head losses in piping systems according to the Darcy-Weisbach equation?",
            "Explain how a Venturi meter measures volumetric flow rate using Bernoulli principle."
          ],
          idealAnswerPoints: [
            "Bernoulli Equation: P/rho*g + v^2/2g + z = Constant (Pressure head + Velocity head + Elevation head = Total head)",
            "Assumptions: Steady flow, incompressible fluid, frictionless/inviscid (no viscous losses), flow along a streamline",
            "Reynolds number: Re = (rho * v * D) / mu = Inertial forces / Viscous forces",
            "Internal pipe flow: Re < 2000 is laminar (smooth parallel streamlines); 2000 < Re < 4000 is transitional; Re > 4000 is turbulent (chaotic mixing)"
          ],
          explanation: "Fundamental fluid dynamics assessing conservation of energy and flow regime characterization.",
          learningExplanation: "Bernoulli equates mechanical energy along streamlines. For real viscous fluids, friction dissipates energy as head loss (hf). The Reynolds number nondimensionalizes flow, dictating whether viscous damping stabilizes the flow (laminar) or inertial eddies dominate (turbulent).",
          whatToStudyNext: "Navier-Stokes equations, boundary layer separation, and pump cavitation (NPSH).",
          recommendedPracticeQuestion: "Calculate Reynolds number for water (rho=1000 kg/m3, mu=0.001 Pa.s) flowing at 2 m/s through a 0.05m diameter pipe."
        },
        {
          id: "mech_manufacturing_cad_03",
          department: "Mechanical Engineering",
          subject: "Manufacturing & Machine Design",
          topic: "Manufacturing Processes",
          subtopic: "Machining, Casting & CAD/CAM",
          skill: "Manufacturing",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the principles of CNC machining and G-codes/M-codes. What is the difference between traditional subtractive manufacturing (milling/turning) and additive manufacturing (3D printing)?",
          keywords: ["cnc", "g-code", "m-code", "milling", "turning", "subtractive", "additive", "3d printing", "manufacturing"],
          followUpTemplates: [
            "What is the difference between G00 (rapid positioning) and G01 (linear feed interpolation) in CNC programming?",
            "Explain stress concentration factors and how fillets reduce fatigue failure in mechanical shaft design."
          ],
          idealAnswerPoints: [
            "CNC (Computer Numerical Control): Automated machine tools guided by programmed alphanumeric instructions",
            "G-codes: Geometric and motion commands (G00 rapid travel, G01 linear cut, G02/G03 circular interpolation)",
            "M-codes: Machine miscellaneous commands (M03 spindle start, M05 spindle stop, M08 coolant on, M30 program end)",
            "Subtractive: Cutting away bulk material via single/multi-point cutting tools (lathe, mill); high strength, waste material",
            "Additive: Building components layer-by-layer from 3D CAD data; excellent for complex internal geometries, less waste"
          ],
          explanation: "Evaluates modern production engineering, CAD/CAM integration, and manufacturing process selection.",
          learningExplanation: "G-codes control tool kinematics while M-codes control auxiliary machine functions. Subtractive machining yields high surface finish and structural integrity. Additive manufacturing excels in rapid prototyping and lightweight topological optimization.",
          whatToStudyNext: "Geometric Dimensioning and Tolerancing (GD&T) datums, and Finite Element Analysis (FEA) mesh convergence.",
          recommendedPracticeQuestion: "Write a basic 5-line G-code program to position tool at (0,0,5), start spindle clockwise at 1500 RPM, and linear feed cut to (50,0,-2)."
        }
      );
      break;
    // -------------------------------------------------------------------------
    // CIVIL (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case "Civil Engineering":
      list.push(
        {
          id: "civil_structures_01",
          department: "Civil Engineering",
          subject: "Structural Engineering",
          topic: "Structural Analysis & Design",
          subtopic: "Beams, Frames & Limit State",
          skill: "Structural Engineering",
          difficulty: "Beginner",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain Shear Force and Bending Moment in simply supported beams. What is a point of contraflexure, and what are the principles of Limit State Design (LSM)?",
          keywords: ["shear force", "bending moment", "sfd", "bmd", "point of contraflexure", "limit state", "is 456", "factor of safety"],
          followUpTemplates: [
            "Where does maximum bending moment occur in a simply supported beam with uniformly distributed load (UDL)?",
            "What is the difference between Limit State of Collapse and Limit State of Serviceability in concrete structures?"
          ],
          idealAnswerPoints: [
            "Shear Force (SF): Algebraic sum of all vertical forces acting on either side of a beam section",
            "Bending Moment (BM): Algebraic sum of moments of all forces about that section; maximum where SF passes through zero",
            "Point of Contraflexure: Point along the beam axis where bending moment changes sign from positive (sagging) to negative (hogging)",
            "Limit State Method (LSM): Modern probabilistic structural design method applying partial safety factors for loads (e.g. 1.5) and material strengths (1.15 steel, 1.5 concrete)"
          ],
          explanation: "Core structural analysis testing beam behavior, equilibrium equations, and design codes.",
          learningExplanation: "SFD and BMD determine the required concrete depth and steel reinforcement. The point of contraflexure represents zero bending moment. Limit state design balances safety against collapse (ultimate strength) and serviceability (deflection and crack width limits).",
          whatToStudyNext: "Moment Distribution Method, slope deflection equations, and seismic shear wall design using ETABS.",
          recommendedPracticeQuestion: "Calculate the maximum bending moment for a simply supported beam of span L = 6m subjected to a UDL of w = 20 kN/m."
        },
        {
          id: "civil_concrete_materials_02",
          department: "Civil Engineering",
          subject: "Concrete Technology & Materials",
          topic: "Reinforced Concrete Design",
          subtopic: "Concrete Mix & Testing",
          skill: "Concrete Technology",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the importance of the Water-Cement Ratio in concrete technology according to Abram law. What is the Slump Test, and how do admixtures modify workability?",
          keywords: ["water-cement ratio", "abrams law", "compressive strength", "slump test", "workability", "superplasticizer", "curing"],
          followUpTemplates: [
            "What causes segregation and bleeding in freshly mixed concrete, and how do you prevent them?",
            "Why is 28-day moist curing essential for achieving characteristic compressive strength in concrete?"
          ],
          idealAnswerPoints: [
            "Abram law: Compressive strength of fully compacted concrete is inversely proportional to water-cement ratio (w/c)",
            "Lower w/c ratio yields higher strength and durability, but reduces workability",
            "Slump test measures consistency and workability (true slump, shear slump, collapse slump) using a standard frustum cone",
            "Superplasticizers/water reducers disperse cement grains electrostatically, increasing workability without adding excess water"
          ],
          explanation: "Evaluates materials engineering, field testing methodology, and concrete mix optimization.",
          learningExplanation: "Excess water evaporates leaving porous capillary voids that degrade compressive strength and increase permeability to corrosion. Superplasticizers enable low w/c ratios (0.35 - 0.45) while maintaining pumpable workability.",
          whatToStudyNext: "Concrete mix design IS 10262, non-destructive testing (Rebound hammer, UPV), and durability in marine environments.",
          recommendedPracticeQuestion: "Explain what concrete grade M25 means (characteristic strength) and calculate target mean strength using standard deviation."
        },
        {
          id: "civil_geotech_survey_03",
          department: "Civil Engineering",
          subject: "Geotechnical & Surveying",
          topic: "Geotechnical Engineering",
          subtopic: "Soil Bearing Capacity & Surveying",
          skill: "Geotechnical Engineering",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain Terzaghi Bearing Capacity theory for shallow foundations. In surveying, how does a Total Station measure electronic distance (EDM) and coordinates (X, Y, Z)?",
          keywords: ["terzaghi", "bearing capacity", "shallow foundation", "soil shear", "total station", "edm", "surveying", "leveling"],
          followUpTemplates: [
            "What is the difference between general shear failure, local shear failure, and punching shear failure in soils?",
            "How does closed traverse balancing work using Bowditch rule?"
          ],
          idealAnswerPoints: [
            "Terzaghi equation: qu = c*Nc + gamma*D*Nq + 0.5*gamma*B*Ngamma (Cohesion + Surcharge depth + Footing width)",
            "Bearing capacity depends on soil cohesion c, unit weight gamma, footing dimensions B and D, and dimensionless factors Nc, Nq, Ngamma based on friction angle phi",
            "Total Station: Combines electronic theodolite (horizontal/vertical angles) and EDM (infrared laser phase shift for slope distance) with onboard microprocessor",
            "Automatically calculates 3D Cartesian coordinates (Northing, Easting, Elevation) via trigonometry"
          ],
          explanation: "Combines foundation soil mechanics with modern digital geospatial surveying instrumentation.",
          learningExplanation: "Terzaghi formula models failure wedges beneath a strip footing. A Total Station replaces traditional theodolites and chains by pulsing modulated infrared signals to a retroreflector prism to calculate millimeter-accurate coordinates.",
          whatToStudyNext: "Standard Penetration Test (SPT), soil settlement analysis, and GIS integration.",
          recommendedPracticeQuestion: "Calculate ultimate bearing capacity of a strip footing in pure cohesive clay (c = 40 kN/m2, phi = 0, Nc = 5.7)."
        }
      );
      break;
    // -------------------------------------------------------------------------
    // AUTOMOBILE (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case "Automobile Engineering":
      list.push(
        {
          id: "auto_ic_engines_01",
          department: "Automobile Engineering",
          subject: "Automotive Powertrain",
          topic: "Internal Combustion Engines",
          subtopic: "4-Stroke Cycles & Injection",
          skill: "IC Engines",
          difficulty: "Beginner",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the 4-stroke cycle (Suction, Compression, Power, Exhaust) in Spark Ignition (SI) and Compression Ignition (CI) engines. What is the purpose of Valve Overlap in the Valve Timing Diagram?",
          keywords: ["4-stroke", "si engine", "ci engine", "otto", "diesel", "valve timing", "valve overlap", "injection"],
          followUpTemplates: [
            "Why do diesel (CI) engines operate at higher compression ratios (16:1 - 22:1) compared to petrol (SI) engines (8:1 - 12:1)?",
            "What is Common Rail Direct Injection (CRDi) in modern automotive diesel engines?"
          ],
          idealAnswerPoints: [
            "4 strokes: Suction (piston moves down, draws charge), Compression (piston moves up, compresses charge), Power (combustion drives piston down), Exhaust (piston pushes burnt gases out)",
            "SI uses petrol + air mixture ignited by spark plug; CI compresses air only, injecting diesel that auto-ignites from high air temperature",
            "Valve Overlap: Period when both inlet valve and exhaust valve remain simultaneously open near Top Dead Center (TDC)",
            "Benefits of overlap: Incoming fresh charge scavenges remaining exhaust gases and cools the combustion chamber"
          ],
          explanation: "Core internal combustion engine kinematics, fuel ignition mechanisms, and gas exchange dynamics.",
          learningExplanation: "In SI engines, compression ratio is limited by knocking/pre-ignition. In CI engines, only air is compressed, permitting high compression ratios that trigger spontaneous combustion upon fuel atomization. Valve overlap utilizes exhaust gas inertia to draw in fresh charge.",
          whatToStudyNext: "Turbochargers with intercoolers, variable valve timing (VVT), and Euro 6 / BS6 emissions aftertreatment (SCR, DPF).",
          recommendedPracticeQuestion: "Sketch a simplified valve timing diagram for a 4-stroke petrol engine showing IVO, IVC, EVO, and EVC."
        },
        {
          id: "auto_transmission_diff_02",
          department: "Automobile Engineering",
          subject: "Automotive Drivetrain",
          topic: "Automotive Drivetrain",
          subtopic: "Gearbox & Differentials",
          skill: "Transmission Systems",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the working of a mechanical Differential in automotive drivetrains. Why is a differential necessary when a vehicle negotiates a turn, and what is a Limited Slip Differential (LSD)?",
          keywords: ["differential", "drivetrain", "pinion", "crown wheel", "sun gear", "turning radius", "lsd", "traction"],
          followUpTemplates: [
            "What is the drawback of an open differential when one wheel is on ice and the other is on dry pavement?",
            "How does a Continuously Variable Transmission (CVT) achieve infinite gear ratios compared to a stepped manual gearbox?"
          ],
          idealAnswerPoints: [
            "When negotiating a turn, the outside wheel traverses a larger radius arc than the inside wheel and must rotate faster",
            "Differential splits propeller shaft torque evenly between drive axles while permitting them to rotate at different speeds",
            "Key components: Crown wheel, drive pinion, differential cage, spider pinion gears, and side sun gears",
            "Open differential drawback: Directs all torque to the wheel with least traction (spins on ice while dry wheel gets zero drive)",
            "Limited Slip Differential (LSD): Uses clutches or helical gears to lock axles partially, transferring torque to the wheel with traction"
          ],
          explanation: "Evaluates drivetrain kinematics, torque distribution, and vehicle handling mechanics.",
          learningExplanation: "Without a differential, both drive wheels would be locked at equal speeds, forcing the inner tire to scrub and slip across the road during cornering. LSDs solve the open differential zero-traction flaw by mechanically locking wheels under slip.",
          whatToStudyNext: "Dual-clutch transmissions (DCT), epicyclic planetary gear sets, and torque-vectoring electronic differentials.",
          recommendedPracticeQuestion: "Calculate the speed of the outer wheel if crown wheel rotates at 600 RPM and the inner wheel rotates at 500 RPM."
        },
        {
          id: "auto_ev_brakes_03",
          department: "Automobile Engineering",
          subject: "EV & Active Chassis Systems",
          topic: "Electric Vehicles & Energy Storage",
          subtopic: "EV Powertrain & ABS",
          skill: "Electric Vehicles & ABS",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the working of an Anti-lock Braking System (ABS) and regenerative braking in Electric Vehicles (EV). How does the Battery Management System (BMS) protect lithium-ion battery packs?",
          keywords: ["abs", "hydraulic modulator", "wheel speed sensor", "regenerative braking", "ev", "bms", "traction inverter"],
          followUpTemplates: [
            "How does ABS modulate brake fluid pressure to maintain steering control during panic braking?",
            "What is cell balancing in a Lithium-ion Battery Management System, and why is thermal runaway dangerous?"
          ],
          idealAnswerPoints: [
            "ABS: Prevents wheel lock-up during severe braking using wheel speed sensors, electronic control unit (ECU), and hydraulic modulator valves (apply, hold, release cycles)",
            "Maintains steering control and minimizes braking distance on slippery surfaces",
            "Regenerative braking: Traction electric motor operates as a generator during deceleration, converting kinetic energy into electrical energy stored in the battery",
            "BMS (Battery Management System): Monitors individual cell voltages, state of charge (SoC), state of health (SoH), temperature, performs active/passive cell balancing, and prevents overcharging/overdischarging"
          ],
          explanation: "Modern automotive safety and electric vehicle powertrain engineering assessment.",
          learningExplanation: "A locked skidding tire loses directional steering stability. ABS pulses hydraulic calipers up to 15 times/sec to maintain optimal slip ratio (~15-20%). In EVs, the traction motor reverses torque to generate electricity before hydraulic friction brakes engage. BMS prevents catastrophic thermal runaway.",
          whatToStudyNext: "Permanent Magnet Synchronous Motors (PMSM) vs Induction traction motors, and Electronic Stability Control (ESC).",
          recommendedPracticeQuestion: "Explain why passive cell balancing in a battery pack uses shunt resistors to dissipate excess voltage as heat."
        }
      );
      break;
    // -------------------------------------------------------------------------
    // CSE / IT (Default)
    // -------------------------------------------------------------------------
    default:
      const effectiveDept = department === "Information Technology" ? "Information Technology" : "Computer Science & Engineering";
      list.push(
        {
          id: `${effectiveDept === "Information Technology" ? "it" : "cs"}_dsa_trees_01`,
          department: effectiveDept,
          subject: "Data Structures & Algorithms",
          topic: "Core Computer Science",
          subtopic: "Trees, Graphs & Binary Search",
          skill: "Data Structures",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the difference between a Binary Search Tree (BST) and a self-balancing AVL/Red-Black Tree. What is the worst-case time complexity of an un-balanced BST, and how does balancing prevent degradation?",
          keywords: ["bst", "binary search tree", "avl", "red-black tree", "o(log n)", "o(n)", "rotations", "height"],
          followUpTemplates: [
            "What are left and right tree rotations, and how do they rebalance an AVL tree in O(1) time?",
            "Why does the Java HashMap implementation switch from linked lists to Red-Black Trees when a bucket exceeds 8 nodes?"
          ],
          idealAnswerPoints: [
            "BST property: Left child < parent <= right child",
            "Unbalanced BST worst-case: O(n) lookup time when inserted in sorted order (degenerates into a linked list)",
            "AVL Tree: Strictly balanced where height difference between left and right subtrees (balance factor) is at most 1; guarantees O(log n) search",
            "Red-Black Tree: Loosely balanced using node colors (red/black) and black-height constraints; fewer rotations during frequent inserts/deletes"
          ],
          explanation: "Core computer science assessment on tree traversal, time complexity, and balancing rotations.",
          learningExplanation: "A standard BST degrades to O(n) if items are inserted sequentially. Self-balancing trees (AVL and Red-Black) maintain height at O(log n) through local pointer rotations, ensuring fast predictable operations.",
          whatToStudyNext: "Tries for string prefix search, and B-Trees for database disk block indexing.",
          recommendedPracticeQuestion: "Walk through an AVL tree insertion of [10, 20, 30] and demonstrate the Left-Left (LL) rotation."
        },
        {
          id: `${effectiveDept === "Information Technology" ? "it" : "cs"}_networks_protocols_02`,
          department: effectiveDept,
          subject: "Computer Networks",
          topic: "Networking & Protocols",
          subtopic: "TCP/IP & Web Protocols",
          skill: "Computer Networks",
          difficulty: "Intermediate",
          questionSource: "curriculum-foundational",
          questionType: "conceptual",
          question: "Explain the TCP 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-Way Connection Termination. How does TCP guarantee reliability compared to UDP?",
          keywords: ["tcp", "udp", "3-way handshake", "syn", "ack", "flow control", "congestion control", "reliability"],
          followUpTemplates: [
            "What is the difference between TCP Flow Control (Sliding Window) and Congestion Control (Slow Start, Congestion Avoidance)?",
            "Why does DNS or video streaming prefer UDP over TCP?"
          ],
          idealAnswerPoints: [
            "TCP 3-Way Handshake: Client sends SYN -> Server responds SYN-ACK -> Client sends ACK; establishes sequence numbers",
            "Termination: 4-Way handshake (FIN -> ACK -> FIN -> ACK) allowing bidirectional half-close",
            "TCP Reliability: Sequence numbers, cumulative acknowledgments, retransmission timeouts (RTO), and checksums",
            "UDP: Connectionless, lightweight, zero retransmissions or handshakes, prioritizing low latency over reliability"
          ],
          explanation: "Standard networking foundation testing transport layer protocols and transmission mechanics.",
          learningExplanation: "TCP provides an ordered, reliable byte stream over an unreliable IP network through explicit handshakes, sequence numbers, and sliding-window flow control. UDP omits guarantees for minimal overhead.",
          whatToStudyNext: "TLS/HTTPS handshake, HTTP/2 multiplexing, and HTTP/3 QUIC protocol over UDP.",
          recommendedPracticeQuestion: "Explain what happens under the hood in the network when you type https://www.google.com in a web browser."
        }
      );
      break;
  }
  return list;
}
function assembleTechnicalQuestions(extractedNLP, difficulty, questionCount = 4) {
  const department = extractedNLP.effectiveDepartment;
  const assembled = [];
  const seenQuestionSignatures = /* @__PURE__ */ new Set();
  function addQuestion(q) {
    const signature = `${q.skill.toLowerCase()}:${q.question.toLowerCase().slice(0, 40)}`;
    if (seenQuestionSignatures.has(signature)) return false;
    seenQuestionSignatures.add(signature);
    assembled.push(q);
    return true;
  }
  for (const skill of extractedNLP.extractedSkills) {
    const skillQs = getSkillSpecificQuestions(skill, department, difficulty);
    for (const q of skillQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }
  if (assembled.length < questionCount && extractedNLP.projectsList?.length > 0) {
    const projQs = generateProjectQuestions(extractedNLP.projectsList, department, difficulty);
    for (const q of projQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }
  if (assembled.length < questionCount && extractedNLP.internshipsList?.length > 0) {
    const internQs = generateInternshipQuestions(extractedNLP.internshipsList, department, difficulty);
    for (const q of internQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }
  if (assembled.length < questionCount && extractedNLP.certificationsList?.length > 0) {
    const certQs = generateCertificationQuestions(extractedNLP.certificationsList, department, difficulty);
    for (const q of certQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }
  if (assembled.length < questionCount) {
    const foundationalQs = getCurriculumFoundationalQuestions(department, difficulty);
    for (const q of foundationalQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }
  return assembled;
}
function synthesizeDynamicQuestion(topicOrSkill, department, difficulty, seedIndex = 1) {
  const cleanSkill = topicOrSkill.trim();
  const safeId = `synth_${department.slice(0, 4).toLowerCase()}_${cleanSkill.replace(/\W+/g, "_").toLowerCase()}_s${seedIndex}_${Math.floor(Math.random() * 1e4)}`;
  let subtopic = "Engineering Architecture & Trade-offs";
  let questionType = "practical";
  let question = `When designing an engineering system utilizing ${cleanSkill}, what are the primary architectural trade-offs, scalability constraints, and failure modes you must anticipate? Explain how you test and verify system reliability under peak load conditions.`;
  let idealAnswerPoints = [
    `Detailed explanation of how ${cleanSkill} integrates into the broader ${department} system architecture`,
    "Identification of primary performance bottlenecks (e.g. latency, thermal dissipation, memory constraints, bandwidth)",
    "Practical failure recovery strategies: graceful degradation, fault isolation, and logging telemetry",
    "Verification methodologies: unit testing, boundary analysis, or simulation modeling"
  ];
  let referenceAnswer = `In a production ${department} setup, utilizing ${cleanSkill} requires balancing throughput, resource utilization, and reliability. First, isolate critical paths with monitoring; second, implement timeouts and retries with backoff; third, test edge cases under simulated high-load conditions.`;
  let exampleSolution = `// Production Implementation Guideline for ${cleanSkill}:
// 1. Validate inputs and enforce contract boundary constraints
// 2. Encapsulate resource lifecycle with deterministic cleanup
// 3. Monitor metrics: latency, error rate, and throughput
`;
  if (department === "Computer Science & Engineering" || department === "Information Technology") {
    if (seedIndex % 2 === 0) {
      questionType = "problem-solving";
      question = `In the context of ${cleanSkill}, describe a common production bug, memory leak, or concurrency issue. What root-cause analysis techniques would you employ, and what architectural pattern prevents this bug from recurring?`;
      subtopic = "Debugging, Root-Cause Analysis & Concurrency";
    } else {
      questionType = "conceptual";
      question = `Explain the internal working and core performance characteristics of ${cleanSkill}. How does it manage state or persistence, and what are its asymptotic time and space complexities during high-throughput operations?`;
      subtopic = "Internal Mechanics & Algorithmic Complexity";
    }
  } else if (department === "Electronics & Communication Engineering") {
    questionType = "practical";
    question = `Regarding ${cleanSkill} in embedded and electronic design: How do you handle signal integrity, power distribution network (PDN) impedance, and thermal dissipation on a multi-layer board? What test instrumentation would you use to measure transient noise?`;
    subtopic = "Signal Integrity & Hardware Testing";
    exampleSolution = `Oscilloscope setup with 50-ohm termination, differential active probe at IC power pins, checking ripple V_pp < 50mV under dynamic load step.`;
  } else if (department === "Mechanical Engineering") {
    questionType = "practical";
    question = `In mechanical design utilizing ${cleanSkill}: How do you perform stress analysis and account for dynamic fatigue loading? What safety factor would you apply, and how do manufacturing tolerances (GD&T) influence physical assembly?`;
    subtopic = "Stress Analysis & Manufacturing Tolerances";
    exampleSolution = `Apply Von Mises distortion energy theory for ductile components. Determine endurance limit Se = 0.5 * Sut * ka * kb * kc. Ensure safety factor n = Se / sigma_a >= 1.5.`;
  } else if (department === "Civil Engineering") {
    questionType = "practical";
    question = `For structural and construction engineering projects involving ${cleanSkill}: What limit state criteria and building code provisions govern structural stability? How do you assess environmental durability and soil-structure interaction?`;
    subtopic = "Structural Stability & Code Compliance";
    exampleSolution = `Check Limit State of Collapse (flexure, shear, compression) with material factors gamma_c = 1.5, gamma_s = 1.15, and verify Limit State of Serviceability (deflection < span/250, crack width < 0.3mm).`;
  } else if (department === "Electrical & Electronics Engineering") {
    questionType = "practical";
    question = `In electrical power and drive applications of ${cleanSkill}: How do you optimize efficiency, mitigate harmonic distortion (THD), and protect switches or motor windings against transient overvoltage spikes?`;
    subtopic = "Harmonics, Protection & Efficiency";
    exampleSolution = `Install passive LC or active power filters to maintain THD < 5% per IEEE 519. Utilize snubber circuits and TVS diodes across power switches to clamp dV/dt inductive kickback.`;
  } else if (department === "Automobile Engineering") {
    questionType = "practical";
    question = `In automotive powertrain and chassis systems involving ${cleanSkill}: How do you balance dynamic handling, fuel/battery efficiency, and passenger safety under extreme operating environments?`;
    subtopic = "Vehicle Dynamics & Powertrain Integration";
    exampleSolution = `Utilize CAN bus telemetry at 500 kbps to coordinate traction motor torque requests, regenerative braking blending, and electronic stability control (ESC).`;
  }
  return {
    id: safeId,
    department,
    subject: `${department} Professional Practice`,
    topic: "Continuous Technical Practice",
    subtopic,
    skill: cleanSkill,
    difficulty,
    questionSource: "resume-skill",
    questionType,
    question,
    keywords: [cleanSkill.toLowerCase(), "trade-offs", "architecture", "efficiency", "reliability", "design"],
    followUpTemplates: [
      `What automated testing or diagnostic telemetry would you establish to detect degradation in ${cleanSkill}?`,
      `If you had to scale ${cleanSkill} for a 10x larger operational capacity, what would you redesign first?`
    ],
    idealAnswerPoints,
    explanation: `Assesses practical engineering judgment, design trade-offs, and failure prevention in ${cleanSkill}.`,
    learningExplanation: `Mastery of ${cleanSkill} requires understanding its limitations, fault recovery strategies, and operational parameters in real engineering systems.`,
    whatToStudyNext: `Advanced system design, boundary stress testing, and industry standards for ${cleanSkill}.`,
    recommendedPracticeQuestion: `Draft an engineering calculation or architecture flow diagram for ${cleanSkill}.`,
    referenceAnswer,
    exampleSolution
  };
}
function generateSetOfFourQuestions(extractedNLP, history, setNumber, targetDifficulty) {
  const department = extractedNLP.effectiveDepartment;
  const selectedSet = [];
  const tryAddQuestion = (q) => {
    if (!q) return false;
    const dupCheck = isQuestionDuplicate(q, history, selectedSet);
    if (!dupCheck.isDuplicate) {
      selectedSet.push(q);
      return true;
    }
    return false;
  };
  const departmentPool = [...DEPARTMENT_QUESTION_POOLS[department] || []];
  const foundationalPool = getCurriculumFoundationalQuestions(department, targetDifficulty);
  const resumeSkillPool = [];
  for (const sk of extractedNLP.extractedSkills) {
    const sQs = getSkillSpecificQuestions(sk, department, targetDifficulty);
    resumeSkillPool.push(...sQs);
  }
  const projectPool = extractedNLP.projectsList?.length > 0 ? generateProjectQuestions(extractedNLP.projectsList, department, targetDifficulty) : [];
  const internshipPool = extractedNLP.internshipsList?.length > 0 ? generateInternshipQuestions(extractedNLP.internshipsList, department, targetDifficulty) : [];
  const certPool = extractedNLP.certificationsList?.length > 0 ? generateCertificationQuestions(extractedNLP.certificationsList, department, targetDifficulty) : [];
  const slot1Candidates = [
    ...departmentPool.filter((q) => q.questionType === "coding" || q.questionType === "practical"),
    ...resumeSkillPool.filter((q) => q.questionType === "coding" || q.questionType === "practical"),
    ...foundationalPool.filter((q) => q.questionType === "coding" || q.questionType === "practical")
  ];
  const slot1Offset = (setNumber - 1) % Math.max(1, slot1Candidates.length);
  const orderedSlot1 = [...slot1Candidates.slice(slot1Offset), ...slot1Candidates.slice(0, slot1Offset)];
  for (const cand of orderedSlot1) {
    if (selectedSet.length >= 1) break;
    tryAddQuestion(cand);
  }
  if (selectedSet.length === 0 && slot1Candidates.length > 0) {
    for (const cand of slot1Candidates) {
      if (tryAddQuestion(cand)) break;
    }
  }
  const slot2Candidates = [
    ...departmentPool.filter((q) => q.questionType === "sql" || q.topic.includes("Database") || q.topic.includes("Circuit") || q.topic.includes("Powertrain") || q.topic.includes("Manufacturing")),
    ...resumeSkillPool.filter((q) => q.topic.includes("Database") || q.topic.includes("Circuit") || q.questionType === "sql"),
    ...foundationalPool.filter((q) => q.topic.includes("Database") || q.topic.includes("Power") || q.topic.includes("Thermodynamics"))
  ];
  const slot2Offset = (setNumber - 1) % Math.max(1, slot2Candidates.length);
  const orderedSlot2 = [...slot2Candidates.slice(slot2Offset), ...slot2Candidates.slice(0, slot2Offset)];
  for (const cand of orderedSlot2) {
    if (selectedSet.length >= 2) break;
    tryAddQuestion(cand);
  }
  const slot3Candidates = [
    ...foundationalPool.filter((q) => q.questionSource === "curriculum-foundational" || q.topic.includes("Core")),
    ...departmentPool,
    ...resumeSkillPool
  ];
  const slot3Offset = (setNumber - 1) * 2 % Math.max(1, slot3Candidates.length);
  const orderedSlot3 = [...slot3Candidates.slice(slot3Offset), ...slot3Candidates.slice(0, slot3Offset)];
  for (const cand of orderedSlot3) {
    if (selectedSet.length >= 3) break;
    tryAddQuestion(cand);
  }
  const slot4Candidates = [
    ...projectPool,
    ...internshipPool,
    ...certPool,
    ...resumeSkillPool,
    ...departmentPool
  ];
  const slot4Offset = (setNumber - 1) % Math.max(1, slot4Candidates.length);
  const orderedSlot4 = [...slot4Candidates.slice(slot4Offset), ...slot4Candidates.slice(0, slot4Offset)];
  for (const cand of orderedSlot4) {
    if (selectedSet.length >= 4) break;
    tryAddQuestion(cand);
  }
  const allAvailable = [
    ...departmentPool,
    ...resumeSkillPool,
    ...foundationalPool,
    ...projectPool,
    ...internshipPool,
    ...certPool
  ];
  for (const cand of allAvailable) {
    if (selectedSet.length >= 4) break;
    tryAddQuestion(cand);
  }
  let synthCounter = 1;
  const candidateTopics = [
    ...extractedNLP.extractedSkills,
    "Core Engineering System Design",
    "Performance Optimization & Testing",
    "Failure Mode Analysis & Safety",
    "Modern Tooling & Frameworks",
    "Algorithm Design & Concurrency"
  ];
  while (selectedSet.length < 4) {
    const topicToSynth = candidateTopics[(setNumber + synthCounter) % candidateTopics.length];
    const syntheticQ = synthesizeDynamicQuestion(topicToSynth, department, targetDifficulty, setNumber * 10 + synthCounter);
    if (!tryAddQuestion(syntheticQ)) {
      syntheticQ.id = `${syntheticQ.id}_uniq_${synthCounter}`;
      syntheticQ.question = `[Set ${setNumber} Practice] ${syntheticQ.question}`;
      selectedSet.push(syntheticQ);
    }
    synthCounter++;
  }
  return selectedSet.slice(0, 4);
}

// src/nlp/evaluation/evaluationDataset.ts
var EVALUATION_BENCHMARK_DATASET = {
  // =========================================================================
  // COMPUTER SCIENCE & ENGINEERING (CSE)
  // =========================================================================
  "cs_rest_01": {
    questionId: "cs_rest_01",
    department: "Computer Science & Engineering",
    subject: "Web Technologies & Backend",
    difficulty: "Beginner",
    expectedAnswer: "Idempotence means making multiple identical requests has the same side-effect on server state as making a single request. GET, HEAD, and OPTIONS are safe and idempotent. PUT and DELETE are idempotent because repeating PUT with the same payload results in the identical resource state, and deleting a resource twice leaves it deleted. In contrast, POST is non-idempotent because multiple calls create multiple distinct resources. PATCH is generally non-idempotent unless designed carefully.",
    essentialConcepts: [
      {
        id: "idempotence_definition",
        name: "Definition of Idempotence",
        description: "Multiple identical requests leave server state identical to a single request",
        keyPhrases: ["same side effect", "identical server state", "multiple requests have same effect", "same result whether called once or many times", "no additional side effects", "same final system state", "same outcome", "same outcome when invoked repeatedly"],
        synonyms: ["repeatable without side effects", "state invariant on repetition", "subsequent requests produce identical state", "network retries do not corrupt system state", "produce the same outcome when invoked repeatedly"],
        weight: 1
      },
      {
        id: "idempotent_methods",
        name: "Idempotent HTTP Methods (GET, PUT, DELETE)",
        description: "Identifies that GET, PUT, and DELETE are idempotent",
        keyPhrases: ["get is idempotent", "put is idempotent", "delete is idempotent", "put and delete are idempotent", "get, put, delete", "put or delete", "put or removing an account with delete"],
        synonyms: ["get put delete are repeatable", "retrieval updating deleting are idempotent", "put or delete results in same final system state"],
        weight: 1
      },
      {
        id: "non_idempotent_post",
        name: "POST Non-Idempotence",
        description: "Identifies that POST creates new distinct resources on each invocation",
        keyPhrases: ["post is not idempotent", "post creates multiple resources", "post is non-idempotent", "each post creates a new record", "strictly non-idempotent", "post creates a new transaction"],
        synonyms: ["post adds duplicate items", "multiple post calls create multiple entries", "submitting with post creates new transaction"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "safe_methods",
        name: "Safe vs Idempotent",
        description: "Safe methods like GET do not modify server state at all",
        keyPhrases: ["safe methods", "get does not modify state", "read only"]
      },
      {
        id: "patch_semantics",
        name: "PATCH Idempotence Nuance",
        description: "PATCH can be non-idempotent if performing relative operations like increments",
        keyPhrases: ["patch can be non-idempotent", "partial update", "relative increment"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "idempotence_definition",
        phrasingPattern: "f(f(x)) = f(x)",
        explanation: "Mathematical formulation of idempotency function application accepted."
      },
      {
        targetConceptId: "idempotence_definition",
        phrasingPattern: "f(x) = f(f(x))",
        explanation: "Mathematical formulation of idempotency function application accepted."
      },
      {
        targetConceptId: "idempotence_definition",
        phrasingPattern: "network retries do not corrupt system state",
        explanation: "Pragmatic distributed retry phrasing accepted."
      },
      {
        targetConceptId: "idempotence_definition",
        phrasingPattern: "retrying the request does not change the database state again",
        explanation: "Pragmatic distributed retry phrasing accepted."
      }
    ],
    commonMisconceptions: [
      {
        id: "post_is_idempotent",
        triggerPhrases: ["post is idempotent", "post method is idempotent"],
        description: "Claimed POST is idempotent",
        penaltyPoints: 20,
        whyIncorrect: "POST creates a new distinct subordinate resource on every call, making it strictly non-idempotent."
      },
      {
        id: "delete_not_idempotent",
        triggerPhrases: ["delete is not idempotent", "delete is non-idempotent"],
        description: "Claimed DELETE is not idempotent",
        penaltyPoints: 15,
        whyIncorrect: "DELETE is idempotent by HTTP RFC specification because deleting an already-deleted resource leaves the server resource in the same non-existent state (returning 404/204)."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "An idempotent HTTP method means that calling the endpoint multiple times with the exact same payload produces the exact same server state as calling it once. GET, PUT, and DELETE are idempotent. PUT replaces the entire resource so calling it 5 times leaves the resource identical. DELETE is idempotent because after deleting, repeating DELETE leaves the item gone. POST is not idempotent because repeating it inserts multiple duplicate records.",
        expectedScoreRange: [90, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Accurately defines idempotency, categorizes GET/PUT/DELETE, and explains why POST is non-idempotent."
      },
      {
        type: "alternative-phrasing",
        answerText: "In API architecture, idempotency ensures that network retries do not corrupt system state. Repeating the operation has no additional side effects: f(x) = f(f(x)). For instance, updating user profile via PUT or removing an account with DELETE results in the same final system state regardless of retry count. Conversely, submitting an order with POST creates a new transaction each time.",
        expectedScoreRange: [85, 95],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Uses unique mathematical and retry-oriented vocabulary while conveying complete technical correctness."
      },
      {
        type: "partially-correct",
        answerText: "GET and PUT are idempotent because they fetch or update data without creating new records. POST creates new things.",
        expectedScoreRange: [48, 60],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Correctly mentions GET/PUT/POST but omits DELETE, does not formalize the definition of idempotency, and is brief."
      },
      {
        type: "misconception",
        answerText: "All HTTP methods are idempotent in REST APIs including POST, GET, and PUT, because they all return HTTP status codes like 200 OK.",
        expectedScoreRange: [15, 30],
        expectedBand: "21\u201344: Limited Understanding",
        explanation: "Contains severe misconception that POST is idempotent and confuses HTTP response status codes with server-side state idempotence."
      },
      {
        type: "incorrect",
        answerText: "REST APIs communicate with databases using JSON envelopes over internet sockets to render HTML pages.",
        expectedScoreRange: [0, 15],
        expectedBand: "0\u201320: Incorrect or Irrelevant",
        explanation: "Off-topic general web description that fails to answer the question about idempotency."
      }
    ]
  },
  "cs_mysql_01": {
    questionId: "cs_mysql_01",
    department: "Computer Science & Engineering",
    subject: "Database Management Systems",
    difficulty: "Intermediate",
    expectedAnswer: "InnoDB uses B+Tree indexing where leaf nodes contain clustered data (primary key) or secondary index pointers. A query with WHERE age > 25 ORDER BY created_at causes a filesort because a range condition (age > 25) prevents subsequent columns in a composite index from being accessed in pre-sorted order, forcing the query optimizer to sort matching rows in a memory buffer (sort_buffer_size) or temporary disk files.",
    essentialConcepts: [
      {
        id: "btree_structure",
        name: "B+Tree Index Mechanics",
        description: "InnoDB organizes tables in B+Tree structures with clustered and secondary indexes",
        keyPhrases: ["b+tree", "btree", "clustered index", "leaf nodes", "secondary index"],
        synonyms: ["balanced tree", "index tree", "leaf pointers"],
        weight: 1
      },
      {
        id: "range_prevents_order",
        name: "Range Filter Blocks Index Sort Order",
        description: "Range inequality (> 25) breaks leftmost index order for subsequent sorting column",
        keyPhrases: ["range condition prevents ordering", "range filter", "leftmost prefix", "age > 25 stops sorting"],
        synonyms: ["inequality operator disrupts index order", "range scan breaks sort order"],
        weight: 1
      },
      {
        id: "filesort_explanation",
        name: "Filesort in Memory/Disk",
        description: "Filesort sorts rows in memory buffer or disk rather than using index ordering",
        keyPhrases: ["filesort", "sort buffer", "sort_buffer_size", "temporary sort in memory or disk"],
        synonyms: ["sorting outside of index", "manual sorting in ram", "extra filesort"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "composite_index",
        name: "Composite Index Strategy",
        description: "Creating composite index (created_at, age) or tuning query design",
        keyPhrases: ["composite index", "index(age, created_at)", "explain plan"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "filesort_explanation",
        phrasingPattern: "mysql has to perform an out-of-index sort pass using quicksort",
        explanation: "Accepted algorithmic explanation of filesort quicksort pass."
      }
    ],
    commonMisconceptions: [
      {
        id: "filesort_means_text_file",
        triggerPhrases: ["filesort means writing to text file", "filesort means it creates a text file on windows"],
        description: "Belief that filesort creates external text files",
        penaltyPoints: 15,
        whyIncorrect: "Filesort is MySQL internal nomenclature for sorting records without using the index tree order; it typically occurs in RAM (sort_buffer_size) and only touches disk if buffer overflows."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "In InnoDB, indexes are structured as balanced B+Trees where leaf nodes maintain sorted keys. In the query WHERE age > 25 ORDER BY created_at, the range comparison on age means matching index records are scattered across multiple branch ranges. Because of the leftmost prefix rule, MySQL cannot scan the index in sequential created_at order, so it extracts the matching rows into sort_buffer_size and performs an internal filesort pass.",
        expectedScoreRange: [88, 98],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Accurately connects B+Tree leaves, range operators breaking sorted order, and memory filesort mechanism."
      },
      {
        type: "partially-correct",
        answerText: "B-Trees store data sorted. When you do age > 25, MySQL does a range scan and cannot use the index for created_at, so it uses filesort.",
        expectedScoreRange: [50, 62],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Mentions range scan and filesort but lacks explanation of B+Tree leaf structure and sort buffer mechanics."
      },
      {
        type: "incorrect",
        answerText: "Filesort happens when MySQL cannot connect to the database hard drive so it stores tables in memory caches.",
        expectedScoreRange: [0, 15],
        expectedBand: "0\u201320: Incorrect or Irrelevant",
        explanation: "Completely erroneous description of database storage and file I/O."
      }
    ]
  },
  "cs_coding_twosum_01": {
    questionId: "cs_coding_twosum_01",
    department: "Computer Science & Engineering",
    subject: "Data Structures & Algorithms",
    difficulty: "Beginner",
    expectedAnswer: "Use a single-pass Hash Map storing (number -> index). As we iterate through nums, for each element num at index i, compute complement = target - num. If complement is already in the map, return [map.get(complement), i]. Otherwise insert num with index i into the map. Time complexity is O(n) and auxiliary space complexity is O(n).",
    essentialConcepts: [
      {
        id: "hash_map_lookup",
        name: "Hash Map Auxiliary Storage",
        description: "Using Hash Map/Dictionary to achieve O(1) complement lookup",
        keyPhrases: ["hash map", "hashmap", "dictionary", "hash table", "map"],
        synonyms: ["associative array", "key value lookup", "unordered_map"],
        weight: 1
      },
      {
        id: "complement_calculation",
        name: "Target Complement Calculation",
        description: "Calculating complement = target - current_element",
        keyPhrases: ["target - num", "complement", "target - current", "difference target"],
        synonyms: ["remainder target minus value", "delta calculation"],
        weight: 1
      },
      {
        id: "complexity_linear",
        name: "O(n) Time and Space Complexity",
        description: "Single-pass linear time O(n) and auxiliary space O(n)",
        keyPhrases: ["o(n) time", "linear time", "o(n) space", "single pass"],
        synonyms: ["linear complexity", "time complexity o(n)"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "two_pointer_tradeoff",
        name: "Two Pointer on Sorted Array Tradeoff",
        description: "Sorting array takes O(n log n) but reduces space to O(1)",
        keyPhrases: ["two pointer", "sorted array", "o(n log n)"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "hash_map_lookup",
        phrasingPattern: "store visited numbers in an associative lookup table to check the delta in constant time",
        explanation: "Accepted algorithmic phrasing for hash map lookup."
      }
    ],
    commonMisconceptions: [
      {
        id: "nested_loops_optimal",
        triggerPhrases: ["nested for loops are o(n)", "two loops give o(n)"],
        description: "Claimed nested brute-force loops achieve O(n)",
        penaltyPoints: 20,
        whyIncorrect: "Nested loops checking all pairs (nums[i] + nums[j] == target) run in quadratic O(n^2) time, which violates the O(n) requirement."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "We maintain a hash map where keys are numbers seen and values are their array indices. In one pass through the list, we calculate complement = target - nums[i]. If complement is in our map, we immediately return [map[complement], i]. Otherwise we store nums[i] -> i. This solves the problem in O(n) linear time and O(n) auxiliary memory.",
        expectedScoreRange: [90, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Complete and optimal explanation of Two Sum."
      },
      {
        type: "partially-correct",
        answerText: "We can loop through the array and check if target minus current element exists in a hashmap to return the indices.",
        expectedScoreRange: [55, 68],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Identifies hashmap and complement subtraction, but omits time/space complexity and duplicate index handling."
      },
      {
        type: "misconception",
        answerText: "Run two nested for loops from 0 to n and check if nums[i] + nums[j] == target. Since there are only two loops, the time complexity is O(n).",
        expectedScoreRange: [20, 35],
        expectedBand: "21\u201344: Limited Understanding",
        explanation: "Explains brute force O(n^2) algorithm while falsely claiming it is O(n)."
      }
    ]
  },
  // =========================================================================
  // ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // =========================================================================
  "ece_opamp_diagram_01": {
    questionId: "ece_opamp_diagram_01",
    department: "Electronics & Communication Engineering",
    subject: "Analog Circuits & Instrumentation",
    difficulty: "Beginner",
    expectedAnswer: "In the inverting amplifier circuit with Vin = 0.4V, Rin = 10k\u03A9, and Rf = 100k\u03A9: Closed loop voltage gain Av = -Rf / Rin = -100k / 10k = -10. Output voltage Vout = Av * Vin = -10 * 0.4V = -4.0V. The non-inverting terminal is connected to ground (0V). Due to infinite open-loop gain and negative feedback through Rf, the op-amp drives the inverting terminal to 0V as well, creating a Virtual Ground that draws no current into the high-impedance input terminals.",
    essentialConcepts: [
      {
        id: "gain_calculation",
        name: "Gain Formula (Av = -Rf / Rin = -10)",
        description: "Calculates closed loop voltage gain Av = -10",
        keyPhrases: ["-rf / rin", "-10", "gain of -10", "av = -10", "-100k / 10k"],
        synonyms: ["inverting gain equals minus ten", "closed loop amplification factor is -10"],
        weight: 1
      },
      {
        id: "vout_calculation",
        name: "Output Voltage (Vout = -4.0V)",
        description: "Calculates Vout = -4.0V for Vin = 0.4V",
        keyPhrases: ["-4v", "-4.0v", "output is -4 volts", "vout = -4"],
        synonyms: ["minus 4 volts", "negative 4 volts"],
        weight: 1
      },
      {
        id: "virtual_ground_concept",
        name: "Virtual Ground at Inverting Terminal",
        description: "Negative feedback forces inverting terminal to ground potential (0V)",
        keyPhrases: ["virtual ground", "inverting terminal is at 0v", "virtual earth", "negative feedback drives inverting pin to 0v"],
        synonyms: ["zero potential at node", "0v virtual reference"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "infinite_input_impedance",
        name: "Infinite Input Impedance",
        description: "Zero input bias current flows into op-amp internal stages",
        keyPhrases: ["infinite input impedance", "no current enters opamp", "zero bias current"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "virtual_ground_concept",
        phrasingPattern: "because the non-inverting input is grounded, feedback loop keeps difference v+ - v- at zero",
        explanation: "Accepted alternative derivation of virtual ground via differential voltage nulling."
      }
    ],
    commonMisconceptions: [
      {
        id: "positive_gain_inverting",
        triggerPhrases: ["gain is +10", "vout is +4v", "vout is 4v"],
        description: "Omitted negative inversion sign on gain or output voltage",
        penaltyPoints: 15,
        whyIncorrect: "In an inverting amplifier configuration, output signal is 180\xB0 out of phase with input, requiring a negative sign: Av = -Rf/Rin = -10 and Vout = -4.0V."
      },
      {
        id: "virtual_ground_carries_ground_current",
        triggerPhrases: ["virtual ground connects directly to physical earth to sink current"],
        description: "Confused virtual ground with physical earth ground",
        penaltyPoints: 15,
        whyIncorrect: "Virtual ground is an equipotential node held at 0V by negative feedback; no current flows from it into ground."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "For this inverting amplifier, the gain is Av = -Rf / Rin = -100k\u03A9 / 10k\u03A9 = -10. With Vin = 0.4V, the output voltage Vout = Av * Vin = -10 * 0.4V = -4.0V. The non-inverting pin is connected to ground (0V). Because the ideal op-amp has infinite open loop gain and negative feedback, the differential voltage (V+ - V-) is forced to zero, making the inverting input a virtual ground at 0V without drawing current.",
        expectedScoreRange: [90, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Accurate calculations (-10 gain, -4.0V output) and clear explanation of virtual ground mechanism."
      },
      {
        type: "partially-correct",
        answerText: "Gain is -10 and Vout is -4V. The inverting terminal is at 0V.",
        expectedScoreRange: [55, 65],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Calculations are correct, but answer is very brief and fails to explain the role of negative feedback in establishing virtual ground."
      },
      {
        type: "misconception",
        answerText: "The voltage gain is Av = Rf / Rin = 100k / 10k = 10, so output voltage is 4.0V. The inverting terminal is physically connected to ground.",
        expectedScoreRange: [25, 40],
        expectedBand: "21\u201344: Limited Understanding",
        explanation: "Lost negative inversion sign (+10 gain, +4V) and erroneously claimed inverting terminal is physically grounded."
      }
    ]
  },
  // =========================================================================
  // ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // =========================================================================
  "eee_buck_converter_diagram_02": {
    questionId: "eee_buck_converter_diagram_02",
    department: "Electrical & Electronics Engineering",
    subject: "Power Electronics & Drives",
    difficulty: "Intermediate",
    expectedAnswer: "In Continuous Conduction Mode (CCM), the average output voltage of a buck converter is Vout = D * Vin = 0.25 * 48V = 12.0V. When the power MOSFET switch S1 turns off, the inductor current cannot change instantaneously. The inductor voltage polarity flips, forward-biasing the freewheeling diode D1 to provide a continuous closed loop for inductor discharge through the load, maintaining continuous load current.",
    essentialConcepts: [
      {
        id: "buck_voltage_calc",
        name: "Output Voltage Calculation (Vout = D * Vin = 12V)",
        description: "Computes Vout = 0.25 * 48V = 12.0V",
        keyPhrases: ["vout = d * vin", "12v", "12.0v", "0.25 * 48", "step down to 12v"],
        synonyms: ["output voltage is 12 volts", "converts 48v to 12v"],
        weight: 1
      },
      {
        id: "freewheeling_diode_purpose",
        name: "Freewheeling Diode Discharge Loop",
        description: "Diode D1 conducts when switch is off, maintaining inductor current flow",
        keyPhrases: ["freewheeling diode provides path", "inductor current continuity", "discharges through d1", "diode conducts when switch turns off", "freewheeling diode conducts", "discharging stored inductor"],
        synonyms: ["circulates inductor current during off state", "freewheel path for magnetic energy", "freewheeling diode allows discharge"],
        weight: 1
      },
      {
        id: "volt_second_balance",
        name: "Inductor Volt-Second Balance in CCM",
        description: "Steady state requires average inductor voltage across period to be zero",
        keyPhrases: ["volt-second balance", "continuous conduction mode", "inductor stores energy during on-state", "ccm"],
        synonyms: ["volt second equilibrium", "net inductor flux balance"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "output_filter",
        name: "LC Low-Pass Filter Ripple Attenuation",
        description: "Inductor L and Capacitor C smooth triangular ripple",
        keyPhrases: ["lc filter", "output ripple", "capacitor smooths voltage"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "freewheeling_diode_purpose",
        phrasingPattern: "diode prevents inductive voltage spikes by clamping the switch node when mosfet opens",
        explanation: "Accepted transient protection description of freewheeling diode."
      }
    ],
    commonMisconceptions: [
      {
        id: "buck_steps_up_voltage",
        triggerPhrases: ["buck converter steps up voltage", "vout = vin / d"],
        description: "Claimed buck converter boosts voltage",
        penaltyPoints: 20,
        whyIncorrect: "Buck converter is strictly a step-down DC-DC converter with output Vout = D * Vin <= Vin. Boost converters step up voltage."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "In Continuous Conduction Mode, output voltage is governed by Vout = D * Vin = 0.25 * 48V = 12.0V. When MOSFET S1 is ON, diode D1 is reverse biased and inductor L charges. When S1 turns off, inductor current cannot drop to zero immediately. The inductor polarity reverses, forward biasing the freewheeling diode D1 to keep load current flowing continuously through the LC filter.",
        expectedScoreRange: [88, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Full mathematical calculation and thorough explanation of freewheeling current loop."
      },
      {
        type: "partially-correct",
        answerText: "Vout is 12V because duty cycle is 25%. Diode D1 is for freewheeling when the switch opens.",
        expectedScoreRange: [48, 60],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Gives the correct numerical value but lacks detail on inductor continuity, polarity reversal, and CCM dynamics."
      },
      {
        type: "misconception",
        answerText: "Buck converter steps up voltage from 48V to 192V using formula Vout = Vin / (1 - D). The diode boosts the power.",
        expectedScoreRange: [10, 25],
        expectedBand: "0\u201320: Incorrect or Irrelevant",
        explanation: "Confused Buck converter with Boost converter and used incorrect formula."
      }
    ]
  },
  // =========================================================================
  // CIVIL ENGINEERING
  // =========================================================================
  "ce_bmd_diagram_01": {
    questionId: "ce_bmd_diagram_01",
    department: "Civil Engineering",
    subject: "Structural Engineering & Mechanics",
    difficulty: "Beginner",
    expectedAnswer: "For span L = 6m and center load W = 20kN: Support reactions Ra = Rb = W / 2 = 10 kN due to symmetry. Maximum shear force Vmax = 10 kN. Maximum bending moment Mmax = (W * L) / 4 = (20 * 6) / 4 = 30.0 kNm at mid-span. The mathematical relationship is dM/dx = V (the derivative of bending moment with respect to span position equals shear force). Maximum bending moment occurs where shear force equals zero or changes sign.",
    essentialConcepts: [
      {
        id: "reaction_and_shear_calc",
        name: "Reactions Ra = Rb = 10kN & Vmax = 10kN",
        description: "Computes support reactions Ra = Rb = 10 kN",
        keyPhrases: ["ra = 10 kn", "rb = 10 kn", "reactions are 10kn", "vmax = 10 kn", "10 kn"],
        synonyms: ["both reactions equal ten kilonewtons", "half the load on each support"],
        weight: 1
      },
      {
        id: "moment_calc",
        name: "Max Bending Moment (Mmax = 30 kNm)",
        description: "Computes Mmax = (W*L)/4 = 30 kNm at mid-span",
        keyPhrases: ["30 knm", "30 kn-m", "(w * l) / 4 = 30", "maximum moment is 30"],
        synonyms: ["thirty kilonewton meters", "wl/4 equals 30"],
        weight: 1
      },
      {
        id: "sfd_bmd_differential_relation",
        name: "Relationship dM/dx = V (Zero Shear = Peak Moment)",
        description: "Derivative of bending moment is shear force; peak moment occurs at zero shear",
        keyPhrases: ["dm/dx = v", "shear is derivative of moment", "moment maximum where shear is zero", "shear changes sign"],
        synonyms: ["rate of change of moment is shear force", "slope of bmd equals shear"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "moment_diagram_shape",
        name: "Triangular BMD Shape",
        description: "Point load creates triangular bending moment profile and step SFD profile",
        keyPhrases: ["triangular bmd", "step sfd", "linear moment distribution"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "sfd_bmd_differential_relation",
        phrasingPattern: "the area under the shear force diagram gives the bending moment",
        explanation: "Accepted integral formulation (M = \u222B V dx)."
      }
    ],
    commonMisconceptions: [
      {
        id: "moment_wl_over_8_point_load",
        triggerPhrases: ["mmax = wl/8 for point load", "moment is wl^2/8 = 22.5"],
        description: "Used UDL moment formula (wL^2/8) for concentrated point load",
        penaltyPoints: 15,
        whyIncorrect: "WL^2/8 applies to Uniformly Distributed Loads (UDL). A central concentrated point load produces maximum bending moment of WL/4 = 30 kNm."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "Due to symmetry, support reactions are Ra = Rb = 20 kN / 2 = 10 kN, so maximum shear force is 10 kN. The maximum bending moment occurs at mid-span: Mmax = (W * L) / 4 = (20 * 6) / 4 = 30 kNm. The fundamental relation is dM/dx = V, which means the slope of the Bending Moment Diagram equals the shear force value, and maximum moment occurs where shear force crosses zero.",
        expectedScoreRange: [90, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Accurate values (10 kN reactions, 30 kNm moment) and sound differential calculus explanation."
      },
      {
        type: "partially-correct",
        answerText: "Reactions are 10 kN each. Max moment is 30 kNm. Bending moment is highest at center.",
        expectedScoreRange: [50, 62],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Correct numerical answers, but lacks explanation of dM/dx = V or the SFD-BMD mathematical relationship."
      },
      {
        type: "misconception",
        answerText: "Reactions are 10 kN. Max bending moment is calculated using M = wL^2/8 = 22.5 kNm. The shear force is unrelated to moment.",
        expectedScoreRange: [25, 38],
        expectedBand: "21\u201344: Limited Understanding",
        explanation: "Used UDL formula instead of point load formula and incorrectly claimed shear is unrelated to moment."
      }
    ]
  },
  // =========================================================================
  // MECHANICAL ENGINEERING
  // =========================================================================
  "me_otto_diagram_01": {
    questionId: "me_otto_diagram_01",
    department: "Mechanical Engineering",
    subject: "Thermodynamics & IC Engines",
    difficulty: "Beginner",
    expectedAnswer: "The four processes of the Air-Standard Otto Cycle are: 1-2 Isentropic compression, 2-3 Constant volume heat addition (spark combustion), 3-4 Isentropic expansion (power stroke), and 4-1 Constant volume heat rejection (exhaust). Thermal efficiency is derived as \u03B7 = 1 - 1 / r^(\u03B3-1) where r = V1/V2 is compression ratio and \u03B3 is heat capacity ratio. Petrol engine compression ratio is limited to around 10:1 to prevent premature auto-ignition (knocking or engine detonation).",
    essentialConcepts: [
      {
        id: "four_processes",
        name: "Four Thermodynamic Processes",
        description: "Identifies 1-2 isentropic compression, 2-3 constant volume addition, 3-4 isentropic expansion, 4-1 constant volume rejection",
        keyPhrases: ["isentropic compression", "constant volume heat addition", "isentropic expansion", "constant volume heat rejection"],
        synonyms: ["adiabatic compression and expansion with isochoric heat addition", "reversible adiabatic and constant volume"],
        weight: 1
      },
      {
        id: "efficiency_formula",
        name: "Otto Thermal Efficiency Formula",
        description: "States or derives \u03B7 = 1 - 1 / r^(\u03B3-1)",
        keyPhrases: ["1 - 1 / r^(\u03B3-1)", "1 - (1 / r^(gamma - 1))", "efficiency depends on compression ratio"],
        synonyms: ["one minus one over r to gamma minus one", "eta = 1 - r^(1-gamma)"],
        weight: 1
      },
      {
        id: "knocking_limitation",
        name: "Knocking / Pre-Ignition Limitation on Compression Ratio",
        description: "Explains compression ratio is capped at ~10:1 to avoid auto-ignition/knocking in petrol",
        keyPhrases: ["knocking", "detonation", "auto-ignition", "premature ignition", "pre-ignition"],
        synonyms: ["engine pinging", "uncontrolled fuel detonation at high pressure"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "clearance_volume",
        name: "Swept and Clearance Volume",
        description: "Compression ratio r = (Vs + Vc) / Vc",
        keyPhrases: ["clearance volume", "swept volume", "v1 / v2"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "knocking_limitation",
        phrasingPattern: "higher compression ratio raises temperature above the octane self-ignition threshold before spark fires",
        explanation: "Accepted chemical thermodynamics formulation of spark knock."
      }
    ],
    commonMisconceptions: [
      {
        id: "constant_pressure_otto",
        triggerPhrases: ["otto cycle has constant pressure heat addition", "otto cycle heat addition at constant pressure"],
        description: "Confused Otto cycle with Diesel cycle (constant pressure addition)",
        penaltyPoints: 20,
        whyIncorrect: "Otto cycle models spark-ignition with instantaneous constant-volume (isochoric) combustion. Diesel cycle has constant-pressure heat addition."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "The Otto cycle consists of 4 processes: 1-2 isentropic compression of air-fuel charge, 2-3 constant volume heat addition from spark ignition, 3-4 isentropic expansion (power stroke), and 4-1 constant volume heat rejection to exhaust. Efficiency is \u03B7 = 1 - (1 / r^(\u03B3-1)). Compression ratio in petrol engines cannot exceed ~10:1 or 11:1 because high compression temperatures cause the fuel to auto-ignite prematurely before the spark plug fires, causing destructive engine knocking.",
        expectedScoreRange: [90, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Accurate process descriptions, correct formula, and clear thermodynamics of engine knock."
      },
      {
        type: "partially-correct",
        answerText: "Processes are compression, combustion at constant volume, expansion, and exhaust. Efficiency is based on compression ratio r. Petrol engines limit r to 10 to avoid knocking.",
        expectedScoreRange: [52, 65],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Covers main points in colloquial terms, but omits isentropic/adiabatic technical terminology and full mathematical formula."
      },
      {
        type: "misconception",
        answerText: "Otto cycle has constant pressure heat addition where fuel injectors spray diesel into cylinder. Compression ratio is limited to 10 because pistons would break from mechanical force.",
        expectedScoreRange: [15, 30],
        expectedBand: "21\u201344: Limited Understanding",
        explanation: "Confused Otto cycle with Diesel cycle and missed thermodynamic auto-ignition knocking cause."
      }
    ]
  },
  // =========================================================================
  // AUTOMOBILE ENGINEERING
  // =========================================================================
  "ae_abs_diagram_01": {
    questionId: "ae_abs_diagram_01",
    department: "Automobile Engineering",
    subject: "Automotive Chassis & Braking Systems",
    difficulty: "Intermediate",
    expectedAnswer: "The ABS Modulator operates in three cycling phases: 1) Pressure Apply (master cylinder pressure fed to caliper), 2) Pressure Hold (inlet solenoid closes when wheel deceleration exceeds threshold), and 3) Pressure Dump (outlet solenoid opens to release fluid into accumulator, scavenged by return pump). Wheel Speed Sensors monitor pulse frequency to calculate wheel slip ratio. Wheel lockup eliminates lateral tire cornering stiffness, causing loss of steerability and vehicle spin.",
    essentialConcepts: [
      {
        id: "modulator_three_phases",
        name: "Three ABS Modulator Phases (Apply, Hold, Dump)",
        description: "Explains pressure apply, pressure hold, and pressure dump phases",
        keyPhrases: ["pressure apply", "pressure hold", "pressure dump", "inlet and outlet solenoid valves", "three phases"],
        synonyms: ["apply hold dump cycles", "solenoid modulation states"],
        weight: 1
      },
      {
        id: "wheel_speed_sensing",
        name: "Wheel Speed Sensor (WSS) Deceleration Detection",
        description: "Sensors track wheel rotational deceleration and slip threshold in real time",
        keyPhrases: ["wheel speed sensor", "wss", "detects deceleration", "slip ratio", "pulse frequency"],
        synonyms: ["hall effect sensor detects wheel stop", "tone ring pulse rate"],
        weight: 1
      },
      {
        id: "steering_lateral_stability",
        name: "Loss of Lateral Cornering Force on Lockup",
        description: "Locked wheels cannot generate lateral force, causing complete loss of steering control",
        keyPhrases: ["loss of steering", "lateral force", "cornering stiffness drops to zero", "skidding prevents steering"],
        synonyms: ["cannot steer when tires slide", "loss of directional stability"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "optimal_slip_ratio",
        name: "Optimal Braking Slip Ratio (15-20%)",
        description: "Peak tire friction coefficient occurs at 15-20% slip ratio",
        keyPhrases: ["15-20% slip", "optimal slip ratio", "peak friction coefficient"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "steering_lateral_stability",
        phrasingPattern: "when wheels lock the friction circle is consumed entirely by longitudinal braking leaving zero lateral force for turning",
        explanation: "Accepted Kamm friction circle formulation of tire cornering limits."
      }
    ],
    commonMisconceptions: [
      {
        id: "abs_guarantees_shorter_stopping_distance",
        triggerPhrases: ["abs always guarantees shorter stopping distance on all surfaces"],
        description: "Claimed ABS always stops shorter on every surface",
        penaltyPoints: 10,
        whyIncorrect: "On loose gravel or snow, a locked sliding wheel plows material and may stop shorter; ABS is designed primarily for steerability and directional stability."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "ABS continuously modulates hydraulic pressure in three stages: Pressure Apply (fluid flows to caliper), Pressure Hold (solenoid closes to maintain constant caliper force), and Pressure Dump (outlet valve opens to relieve pressure into an accumulator when wheel lockup is imminent, with the return pump pumping fluid back). Wheel Speed Sensors send pulse signals to the ECU to calculate slip. If a wheel locks up, lateral friction drops to zero according to the friction circle, making it impossible for the driver to steer.",
        expectedScoreRange: [90, 100],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Covers all three modulator phases, sensor pulse rate calculation, and friction circle loss of lateral control."
      },
      {
        type: "partially-correct",
        answerText: "ABS pumps the brakes really fast using solenoids so wheels do not lock. When wheels lock you slide and cannot steer.",
        expectedScoreRange: [45, 58],
        expectedBand: "45\u201364: Partially Correct",
        explanation: "Captures general principle and steerability loss, but omits the three explicit phases (Apply, Hold, Dump) and speed sensor mechanics."
      },
      {
        type: "incorrect",
        answerText: "ABS activates the electronic parking brake when the car crashes into obstacles to deploy airbags.",
        expectedScoreRange: [0, 15],
        expectedBand: "0\u201320: Incorrect or Irrelevant",
        explanation: "Confused ABS with autonomous emergency braking and airbag restraint systems."
      }
    ]
  },
  // =========================================================================
  // DATA SCIENCE & MACHINE LEARNING ENGINEERING
  // =========================================================================
  "ds_bias_variance_01": {
    questionId: "ds_bias_variance_01",
    department: "Data Science & Machine Learning Engineering",
    subject: "Machine Learning Theory & Statistics",
    difficulty: "Intermediate",
    expectedAnswer: "Total model error decomposes into Bias^2 + Variance + Irreducible error. High bias leads to underfitting due to overly simplistic assumptions, resulting in high training and test error. High variance causes overfitting by memorizing noise in the training set, causing low training error but poor generalization on test data. L1 (Lasso) regularization adds a penalty proportional to the absolute values of the weights (lambda * sum(|w|)), which shrinks weights and drives less important coefficients strictly to zero for sparse feature selection. L2 (Ridge) regularization adds a squared magnitude penalty (lambda * sum(w^2)), which shrinks weights smoothly toward zero without setting them exactly to zero.",
    essentialConcepts: [
      {
        id: "bias_underfitting",
        name: "Bias & Underfitting",
        description: "High bias represents model oversimplification leading to underfitting on both train and test data",
        keyPhrases: ["high bias", "underfitting", "oversimplified model", "high train and test error", "bias causes underfitting", "high bias results in underfitting"],
        synonyms: ["bias variance tradeoff", "model underfits due to high bias", "oversimplified assumptions"],
        weight: 1
      },
      {
        id: "variance_overfitting",
        name: "Variance & Overfitting",
        description: "High variance indicates sensitivity to training noise leading to poor test generalization",
        keyPhrases: ["high variance", "overfitting", "memorizing noise", "poor generalization", "variance causes overfitting", "high variance results in overfitting", "learning training set noise"],
        synonyms: ["high variance leads to overfitting", "overfitting on training set"],
        weight: 1
      },
      {
        id: "l1_lasso_sparsity",
        name: "L1 (Lasso) Regularization & Sparsity",
        description: "L1 regularization drives weights strictly to zero producing sparse feature selection",
        keyPhrases: ["l1 regularization", "lasso", "absolute weights", "drives weights to zero", "sparse feature selection", "sparsity", "coefficients strictly to zero"],
        synonyms: ["l1 penalty produces zero coefficients", "lasso performs feature selection", "l1 lasso"],
        weight: 1
      },
      {
        id: "l2_ridge_shrinkage",
        name: "L2 (Ridge) Regularization & Weight Decay",
        description: "L2 regularization adds squared weight penalty shrinking coefficients smoothly without zeroing them",
        keyPhrases: ["l2 regularization", "ridge", "squared weights", "shrinks weights toward zero", "weight decay", "smooth shrinkage", "shrinks weights smoothly", "l2 ridge"],
        synonyms: ["l2 penalty shrinks coefficients", "ridge regression weight decay"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "error_decomposition",
        name: "Error Decomposition Equation",
        description: "Error = Bias^2 + Variance + Irreducible error",
        keyPhrases: ["irreducible error", "error decomposition", "bias squared plus variance"]
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: "l1_lasso_sparsity",
        phrasingPattern: "manhattan norm penalty creates diamond constraint corners",
        explanation: "Geometric explanation of L1 Lasso diamond contours accepted."
      }
    ],
    commonMisconceptions: [
      {
        id: "l2_causes_sparsity",
        triggerPhrases: ["l2 sets weights to zero", "ridge drives coefficients to zero"],
        description: "Claimed L2 Ridge creates sparse features by zeroing weights",
        penaltyPoints: 20,
        whyIncorrect: "L2 Ridge penalty shrinks weights asymptotically toward zero but never drives them exactly to zero. Only L1 Lasso forces weights to zero."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: "High bias results in underfitting from oversimplified assumptions, whereas high variance results in overfitting by learning training set noise. L1 Lasso regularization drives non-essential coefficients strictly to zero for sparse feature selection, while L2 Ridge shrinks weights smoothly.",
        expectedScoreRange: [85, 95],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Clearly articulates bias/variance and distinguishes L1 sparsity from L2 shrinkage."
      }
    ]
  },
  // =========================================================================
  // CIVIL ENGINEERING
  // =========================================================================
  "ce_concrete_01": {
    questionId: "ce_concrete_01",
    department: "Civil Engineering",
    subject: "Structural Analysis & RCC Design",
    difficulty: "Intermediate",
    expectedAnswer: "According to IS 456, in an under-reinforced beam, the steel reinforcement percentage is less than the limiting value (pt < pt_lim). Consequently, the tensile steel reaches its yield stress before the compressive concrete reaches its ultimate strain. This ensures ductile failure with warning through visible cracking and deflection. In contrast, in an over-reinforced section (pt > pt_lim), concrete crushes first in brittle compression without warning, which is hazardous and prohibited by IS 456.",
    essentialConcepts: [
      {
        id: "under_reinforced_ductile",
        name: "Under-Reinforced Section & Ductile Yielding",
        description: "Steel yields before concrete crushes, providing visible deflection warning and ductile failure",
        keyPhrases: ["under-reinforced", "steel yields first", "ductile failure", "warning before failure", "visible deflection", "crack warning", "ductile mode"],
        synonyms: ["tension failure", "steel reaches yield stress first", "visible crack deflection warning"],
        weight: 1
      },
      {
        id: "over_reinforced_brittle",
        name: "Over-Reinforced Section & Brittle Crushing",
        description: "Concrete crushes suddenly before steel yields, leading to sudden catastrophic brittle failure",
        keyPhrases: ["over-reinforced", "concrete crushes first", "brittle failure", "sudden collapse", "failure without warning", "concrete crush first"],
        synonyms: ["compression failure", "concrete reaches ultimate strain first", "brittle compression failure"],
        weight: 1
      },
      {
        id: "is456_limiting_ratio",
        name: "IS 456 Limiting Steel Reinforcement Ratio",
        description: "IS 456 limits steel ratio to ensure all designs fail in ductile under-reinforced mode",
        keyPhrases: ["is 456", "limiting percentage", "neutral axis depth", "xu lim", "balanced section"],
        synonyms: ["indian standard 456", "code provisions", "limiting value"],
        weight: 1
      }
    ],
    supportingConcepts: [
      {
        id: "neutral_axis_depth",
        name: "Neutral Axis Depth Comparison",
        description: "xu < xu_max for under-reinforced; xu > xu_max for over-reinforced",
        keyPhrases: ["neutral axis", "xu", "xu_max", "depth of neutral axis"]
      }
    ],
    acceptedAlternatives: [],
    commonMisconceptions: [
      {
        id: "over_reinforced_is_safer",
        triggerPhrases: ["over reinforced is safer", "over reinforced gives warning"],
        description: "Claimed over-reinforced beams are safer",
        penaltyPoints: 25,
        whyIncorrect: "Over-reinforced beams fail in explosive brittle compression without warning. IS 456 strictly mandates under-reinforced design."
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: []
  }
};
function getQuestionEvaluationBenchmark(questionId, fallbackQuestionText, department = "Computer Science & Engineering", subject = "Core Technical Domain", difficulty = "Intermediate", keywords, idealAnswerPoints) {
  const existing = EVALUATION_BENCHMARK_DATASET[questionId];
  if (existing) {
    return existing;
  }
  const essentialConcepts = idealAnswerPoints && idealAnswerPoints.length > 0 ? idealAnswerPoints.map((point, idx) => {
    const rawTokens = point.toLowerCase().match(/[a-z0-9_+#.-]+/g) || [];
    const contentTokens = rawTokens.map((t) => t.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, "")).filter((t) => t.length > 2 && !STOP_WORDS.has(t));
    return {
      id: `concept_${idx + 1}`,
      name: point.length > 45 ? point.slice(0, 42) + "..." : point,
      description: point,
      keyPhrases: [point.toLowerCase(), ...contentTokens.slice(0, 5)],
      synonyms: contentTokens.slice(0, 4),
      weight: 1
    };
  }) : [
    {
      id: "core_principles",
      name: "Foundational Principles & Theory",
      description: "Demonstrates comprehension of fundamental engineering principles and governing laws",
      keyPhrases: keywords && keywords.length > 0 ? keywords.slice(0, 5) : ["architecture", "principle", "mechanism", "standard", "design"],
      synonyms: keywords && keywords.length > 2 ? keywords.slice(2, 6) : ["theoretical basis", "underlying principle", "system design"],
      weight: 1
    },
    {
      id: "operational_nuances",
      name: "Technical Implementation & Trade-offs",
      description: "Explains trade-offs, constraints, equations, or failure modes",
      keyPhrases: ["trade-off", "constraint", "efficiency", "performance", "safety"],
      synonyms: ["practical constraints", "system limitations", "engineering analysis"],
      weight: 1
    }
  ];
  return {
    questionId,
    department,
    subject,
    difficulty,
    expectedAnswer: fallbackQuestionText || "Technical engineering response covering system architecture, core equations, boundary conditions, and real-world trade-offs.",
    essentialConcepts,
    supportingConcepts: [
      {
        id: "industry_standards",
        name: "Industry Code & Standards",
        description: "References applicable IEEE, ASME, IS, or RFC industry standards",
        keyPhrases: ["rfc", "ieee", "asme", "is code", "standard specification"]
      }
    ],
    acceptedAlternatives: [],
    commonMisconceptions: [],
    scoringRubric: {
      technicalCorrectnessWeight: 0.4,
      essentialCoverageWeight: 0.3,
      relevanceSemanticWeight: 0.2,
      reasoningWeight: 0.1
    },
    exampleAnswers: [
      {
        type: "correct",
        answerText: fallbackQuestionText || "Detailed technical response articulating trade-offs, equations, and engineering constraints.",
        expectedScoreRange: [85, 95],
        expectedBand: "85\u2013100: Strong, Technically Correct Answer",
        explanation: "Satisfies core technical benchmark."
      }
    ]
  };
}

// src/nlp/evaluation/answerPreprocessor.ts
var COMMON_ABBREVIATIONS = {
  "db": "database",
  "dbs": "databases",
  "rdbms": "relational database management system",
  "az": "availability zone",
  "azs": "availability zones",
  "bmd": "bending moment diagram",
  "sfd": "shear force diagram",
  "bms": "battery management system",
  "pmsm": "permanent magnet synchronous motor",
  "ccm": "continuous conduction mode",
  "dcm": "discontinuous conduction mode",
  "sld": "single line diagram",
  "rcc": "reinforced concrete",
  "fpga": "field programmable gate array",
  "rtos": "real time operating system",
  "rest": "representational state transfer",
  "api": "application programming interface",
  "apis": "application programming interfaces",
  "sql": "structured query language",
  "nosql": "non relational database",
  "vm": "virtual machine",
  "vms": "virtual machines",
  "os": "operating system",
  "oss": "operating systems",
  "cpu": "central processing unit",
  "ram": "random access memory",
  "io": "input output",
  "i/o": "input output",
  "pr": "pull request",
  "ci": "continuous integration",
  "cd": "continuous deployment",
  "fsm": "finite state machine",
  "op-amp": "operational amplifier",
  "opamp": "operational amplifier",
  "ic": "internal combustion",
  "abs": "anti lock braking system",
  "ev": "electric vehicle",
  "evs": "electric vehicles",
  "fea": "finite element analysis",
  "cad": "computer aided design",
  "gdt": "geometric dimensioning and tolerancing",
  "gd&t": "geometric dimensioning and tolerancing",
  "sbc": "safe bearing capacity",
  "spt": "standard penetration test",
  "udl": "uniformly distributed load"
};
var REASONING_CONNECTORS = [
  "because",
  "therefore",
  "as a result",
  "since",
  "due to",
  "hence",
  "consequently",
  "thus",
  "leads to",
  "resulting in",
  "whereas",
  "in contrast",
  "which causes",
  "in order to",
  "so that",
  "this ensures",
  "this prevents",
  "which means"
];
var NEGATION_INDICATORS = [
  "not",
  "no",
  "never",
  "doesn't",
  "does not",
  "isn't",
  "is not",
  "aren't",
  "are not",
  "won't",
  "will not",
  "cannot",
  "can't",
  "without",
  "fails to",
  "neither",
  "nor"
];
function preprocessAnswer(rawAnswer) {
  if (!rawAnswer || !rawAnswer.trim()) {
    return {
      rawText: "",
      normalizedText: "",
      sentences: [],
      clauses: [],
      tokens: [],
      stemmedTokens: [],
      stemSet: /* @__PURE__ */ new Set(),
      negatedPhrases: [],
      negatedTokenSet: /* @__PURE__ */ new Set(),
      wordCount: 0,
      reasoningConnectorCount: 0,
      technicalTermCount: 0
    };
  }
  const raw = rawAnswer.trim();
  const sentences = raw.split(/(?<=[.?!])\s+(?=[A-Z0-9"'])/).map((s) => s.trim()).filter((s) => s.length > 0);
  const clauses = [];
  for (const s of sentences) {
    const sClauses = s.split(/[,;:—–]|(\s+(?:and|but|or|because|whereas|although|however|since)\s+)/i).map((c) => (c || "").trim()).filter((c) => c.length > 2);
    clauses.push(...sClauses);
  }
  let normalized = raw.toLowerCase();
  for (const [abbr, expansion] of Object.entries(COMMON_ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    normalized = normalized.replace(regex, expansion);
  }
  const rawMatches = normalized.match(/[a-z0-9_+#.-]+/g) || [];
  const tokenList = [];
  for (const raw2 of rawMatches) {
    const clean = raw2.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, "");
    if (clean.length > 1 && !STOP_WORDS.has(clean)) {
      tokenList.push(clean);
      if (clean.includes("-")) {
        const parts = clean.split("-").filter((p) => p.length > 1 && !STOP_WORDS.has(p));
        for (const p of parts) tokenList.push(p);
      }
    }
  }
  const tokens = tokenList;
  const stemmedTokens = tokens.map(stemToken);
  const stemSet = new Set(stemmedTokens);
  const negatedPhrases = [];
  const negatedTokenSet = /* @__PURE__ */ new Set();
  for (const clause of clauses) {
    const lowerClause = clause.toLowerCase();
    for (const neg of NEGATION_INDICATORS) {
      const idx = lowerClause.indexOf(neg);
      if (idx !== -1) {
        const afterNeg = lowerClause.substring(idx);
        negatedPhrases.push(afterNeg);
        const negRaw = afterNeg.match(/[a-z0-9_+#.-]+/g) || [];
        for (const nr of negRaw) {
          const cleanNt = nr.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, "");
          if (cleanNt.length > 1 && !STOP_WORDS.has(cleanNt)) {
            negatedTokenSet.add(stemToken(cleanNt));
          }
        }
      }
    }
  }
  let reasoningConnectorCount = 0;
  const lowerNorm = normalized;
  for (const conn of REASONING_CONNECTORS) {
    if (lowerNorm.includes(conn)) {
      reasoningConnectorCount++;
    }
  }
  const rawWords = raw.split(/\s+/).filter(Boolean);
  return {
    rawText: raw,
    normalizedText: normalized,
    sentences,
    clauses,
    tokens,
    stemmedTokens,
    stemSet,
    negatedPhrases,
    negatedTokenSet,
    wordCount: rawWords.length,
    reasoningConnectorCount,
    technicalTermCount: tokens.length
  };
}

// src/nlp/evaluation/semanticAnswerMatcher.ts
var TECHNICAL_SYNONYM_GROUPS = [
  ["idempotent", "repeatable", "same effect", "no extra side effect", "identical server state", "multiple identical requests", "system state", "network retries", "side effects", "no additional side effects"],
  ["safe method", "read only", "does not modify state", "non mutating"],
  ["b-tree", "balanced tree", "btree index", "clustered index", "hierarchical tree"],
  ["filesort", "memory sort", "disk sort", "unindexed sort", "sorting without index"],
  ["virtual ground", "zero potential", "0v potential", "ground potential at inverting pin", "zero volts"],
  ["negative feedback", "closed loop stabilization", "degenerative feedback", "attenuates gain"],
  ["setup time", "data arrival margin", "clock setup aperture", "prior to active edge"],
  ["hold time", "data hold margin", "post clock edge stability", "after clock trigger"],
  ["metastability", "indeterminate voltage", "intermediate logic state", "oscillation", "timing violation state"],
  ["open circuit test", "no load test", "core loss measurement", "iron loss test", "rated voltage lv test"],
  ["short circuit test", "copper loss measurement", "impedance test", "rated current test"],
  ["buck converter", "step down converter", "step-down dc-dc", "voltage reducer", "chopper"],
  ["duty cycle", "pulse width ratio", "on time fraction", "conduction ratio"],
  ["simply supported", "pin and roller", "two point support", "statically determinate beam"],
  ["bending moment", "internal flexural torque", "beam bending moment", "moment of resistance"],
  ["shear force", "transverse shear", "vertical shear", "shear load"],
  ["under-reinforced", "ductile failure", "steel yields first", "visible deflection warning", "tension controlled"],
  ["over-reinforced", "brittle failure", "concrete crushes first", "sudden collapse", "compression controlled"],
  ["bearing capacity", "allowable soil pressure", "foundation support limit", "terzaghi shear resistance"],
  ["otto cycle", "spark ignition cycle", "petrol engine cycle", "constant volume combustion cycle"],
  ["knocking", "detonation", "pre-ignition", "autoignition", "engine ping"],
  ["abs", "anti lock braking", "skid prevention", "wheel lockup prevention", "active brake modulation"],
  ["slip ratio", "wheel slip", "tire skid factor", "relative speed difference"],
  ["bms", "battery management", "pack protection", "cell monitoring", "soc estimation"],
  ["regenerative braking", "energy recovery", "kinetic recapture", "motor as generator", "regen"],
  ["bias variance", "overfitting underfitting", "generalization error", "model capacity tradeoff"],
  ["l1 regularization", "lasso", "sparse weights", "feature selection penalty", "manhattan norm"],
  ["l2 regularization", "ridge", "weight decay", "euclidean penalty", "shrinkage"],
  ["data drift", "covariate shift", "input distribution change", "feature drift"],
  ["concept drift", "target relationship change", "p(y|x) shift", "ground truth evolution"]
];
function matchSemanticAnswer(candidate, expectedAnswerText, acceptedAlternatives = []) {
  if (candidate.wordCount < 2) {
    return {
      similarityScore: 0,
      tfidfCosineScore: 0,
      propositionScore: 0,
      alternativeMatched: false,
      isOffTopic: true,
      matchedConcepts: [],
      explanation: "No substantive answer provided."
    };
  }
  const expectedPre = preprocessAnswer(expectedAnswerText);
  let alternativeMatched = false;
  let alternativeExplanationText;
  for (const alt of acceptedAlternatives) {
    const pattern = alt.phrasingPattern.toLowerCase();
    if (candidate.normalizedText.includes(pattern)) {
      alternativeMatched = true;
      alternativeExplanationText = alt.explanation;
      break;
    }
  }
  const allTokens = [...expectedPre.stemmedTokens, ...candidate.stemmedTokens];
  const uniqueVocab = Array.from(new Set(allTokens));
  const tfCand = {};
  const tfExp = {};
  for (const t of candidate.stemmedTokens) tfCand[t] = (tfCand[t] || 0) + 1;
  for (const t of expectedPre.stemmedTokens) tfExp[t] = (tfExp[t] || 0) + 1;
  let dotProduct = 0;
  let magCandSq = 0;
  let magExpSq = 0;
  for (const term of uniqueVocab) {
    const c = tfCand[term] || 0;
    const e = tfExp[term] || 0;
    const wC = c > 0 ? 1 + Math.log(c) : 0;
    const wE = e > 0 ? 1 + Math.log(e) : 0;
    dotProduct += wC * wE;
    magCandSq += wC * wC;
    magExpSq += wE * wE;
  }
  const tfidfCosineScore = magCandSq > 0 && magExpSq > 0 ? Math.min(1, dotProduct / (Math.sqrt(magCandSq) * Math.sqrt(magExpSq))) : 0;
  let synonymGroupHits = 0;
  const matchedConcepts = [];
  for (const group of TECHNICAL_SYNONYM_GROUPS) {
    const expectedHasGroup = group.some((term) => expectedPre.normalizedText.includes(term.toLowerCase()));
    if (expectedHasGroup) {
      const candidateHasGroup = group.some((term) => candidate.normalizedText.includes(term.toLowerCase()));
      if (candidateHasGroup) {
        synonymGroupHits++;
        matchedConcepts.push(group[0]);
      }
    }
  }
  let clauseOverlapCount = 0;
  const expectedClauses = expectedPre.clauses.filter((c) => c.split(/\s+/).length >= 4);
  for (const expClause of expectedClauses) {
    const expPreClause = preprocessAnswer(expClause);
    const expStems = new Set(expPreClause.stemmedTokens);
    if (expStems.size === 0) continue;
    let bestClauseOverlap = 0;
    for (const candClause of candidate.clauses) {
      const candPreClause = preprocessAnswer(candClause);
      let hits = 0;
      for (const t of candPreClause.stemmedTokens) {
        if (expStems.has(t)) hits++;
      }
      const overlap = hits / expStems.size;
      if (overlap > bestClauseOverlap) bestClauseOverlap = overlap;
    }
    if (bestClauseOverlap >= 0.35) {
      clauseOverlapCount++;
    }
  }
  const propositionScore = expectedClauses.length > 0 ? Math.min(1, clauseOverlapCount / expectedClauses.length) : tfidfCosineScore;
  let similarityScore = tfidfCosineScore * 0.45 + propositionScore * 0.4 + Math.min(1, synonymGroupHits * 0.15) * 0.15;
  if (alternativeMatched) {
    similarityScore = Math.max(similarityScore, 0.85);
  }
  const isOffTopic = tfidfCosineScore < 0.1 && propositionScore < 0.1 && synonymGroupHits === 0;
  let explanation = "";
  if (isOffTopic) {
    explanation = "The candidate response shows virtually no semantic alignment with the technical question topic.";
  } else if (alternativeMatched) {
    explanation = `Matched recognized alternative formulation: ${alternativeExplanationText || "Valid conceptual equivalence detected."}`;
  } else if (similarityScore >= 0.75) {
    explanation = "Strong semantic alignment with expected technical principles.";
  } else if (similarityScore >= 0.45) {
    explanation = "Moderate semantic alignment with core concepts.";
  } else {
    explanation = "Limited semantic alignment; misses several key technical propositions.";
  }
  return {
    similarityScore: Math.round(similarityScore * 100) / 100,
    tfidfCosineScore: Math.round(tfidfCosineScore * 100) / 100,
    propositionScore: Math.round(propositionScore * 100) / 100,
    alternativeMatched,
    alternativeExplanationText,
    isOffTopic,
    matchedConcepts,
    explanation
  };
}

// src/nlp/evaluation/technicalConceptCoverage.ts
function evaluateConceptCoverage(candidate, essentialConcepts, supportingConcepts = [], acceptedAlternatives = []) {
  if (essentialConcepts.length === 0) {
    return {
      essentialCoverageRatio: 1,
      coveredConcepts: [],
      missingConcepts: [],
      supportingConceptsCovered: [],
      totalEssentialCount: 0,
      coveredEssentialCount: 0
    };
  }
  const coveredConcepts = [];
  const missingConcepts = [];
  let weightedPointsEarned = 0;
  let totalWeightPossible = 0;
  for (const concept of essentialConcepts) {
    totalWeightPossible += concept.weight || 1;
    let isCovered = false;
    let isPartial = false;
    let evidenceSnippet;
    let isAlternativeMatch = false;
    for (const alt of acceptedAlternatives) {
      if (alt.targetConceptId === concept.id) {
        const pattern = alt.phrasingPattern.toLowerCase();
        const candNorm = candidate.normalizedText.replace(/[\s\(\)=]+/g, " ");
        const patNorm = pattern.replace(/[\s\(\)=]+/g, " ");
        if (candidate.normalizedText.includes(pattern) || patNorm.trim().length > 3 && candNorm.includes(patNorm.trim())) {
          isCovered = true;
          isAlternativeMatch = true;
          evidenceSnippet = `Alternative match: "${alt.phrasingPattern}"`;
          break;
        }
      }
    }
    if (!isCovered) {
      for (const phrase of concept.keyPhrases) {
        const cleanPhrase = phrase.toLowerCase();
        const rawPhraseTokens = cleanPhrase.match(/[a-z0-9_+#.-]+/g) || [];
        const contentTokens = rawPhraseTokens.map((t) => t.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, "")).filter((t) => t.length > 1 && !STOP_WORDS.has(t));
        const phraseStems = (contentTokens.length > 0 ? contentTokens : rawPhraseTokens).map(stemToken);
        if (candidate.normalizedText.includes(cleanPhrase)) {
          isCovered = true;
          evidenceSnippet = `Key phrase match: "${phrase}"`;
          break;
        }
        if (phraseStems.length > 1) {
          const matchedStems = phraseStems.filter((s) => candidate.stemSet.has(s));
          if (matchedStems.length === phraseStems.length) {
            isCovered = true;
            evidenceSnippet = `Stem combination: "${phrase}"`;
            break;
          } else if (matchedStems.length >= Math.ceil(phraseStems.length * 0.65)) {
            isPartial = true;
            evidenceSnippet = `Partial concept match: "${phrase}"`;
          }
        } else if (phraseStems.length === 1 && candidate.stemSet.has(phraseStems[0])) {
          isCovered = true;
          evidenceSnippet = `Key term match: "${phrase}"`;
          break;
        }
      }
    }
    if (!isCovered && concept.synonyms) {
      for (const syn of concept.synonyms) {
        const cleanSyn = syn.toLowerCase();
        if (candidate.normalizedText.includes(cleanSyn)) {
          isCovered = true;
          isAlternativeMatch = true;
          evidenceSnippet = `Synonym match: "${syn}"`;
          break;
        }
        const synTokens = cleanSyn.match(/[a-z0-9_+#.-]+/g) || [];
        const synContent = synTokens.map((t) => t.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, "")).filter((t) => t.length > 1 && !STOP_WORDS.has(t));
        const synStems = (synContent.length > 0 ? synContent : synTokens).map(stemToken);
        if (synStems.length > 1 && synStems.every((s) => candidate.stemSet.has(s))) {
          isCovered = true;
          isAlternativeMatch = true;
          evidenceSnippet = `Synonym stems match: "${syn}"`;
          break;
        }
      }
    }
    if (isCovered) {
      weightedPointsEarned += concept.weight || 1;
      coveredConcepts.push({
        conceptId: concept.id,
        name: concept.name,
        isCovered: true,
        isPartial: false,
        evidenceSnippet,
        isAlternativeMatch,
        explanation: `Demonstrated understanding of ${concept.name}.`
      });
    } else if (isPartial) {
      weightedPointsEarned += (concept.weight || 1) * 0.5;
      coveredConcepts.push({
        conceptId: concept.id,
        name: concept.name,
        isCovered: false,
        isPartial: true,
        evidenceSnippet,
        isAlternativeMatch: false,
        explanation: `Partially referenced ${concept.name}; needs fuller technical explanation.`
      });
      missingConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  }
  const supportingCovered = [];
  for (const sup of supportingConcepts) {
    let hit = false;
    for (const phrase of sup.keyPhrases) {
      if (candidate.normalizedText.includes(phrase.toLowerCase())) {
        hit = true;
        break;
      }
    }
    if (hit) {
      supportingCovered.push(sup.name);
    }
  }
  const essentialCoverageRatio = totalWeightPossible > 0 ? Math.min(1, weightedPointsEarned / totalWeightPossible) : 1;
  return {
    essentialCoverageRatio: Math.round(essentialCoverageRatio * 100) / 100,
    coveredConcepts,
    missingConcepts,
    supportingConceptsCovered: supportingCovered,
    totalEssentialCount: essentialConcepts.length,
    coveredEssentialCount: coveredConcepts.filter((c) => c.isCovered).length
  };
}

// src/nlp/evaluation/misconceptionDetector.ts
function detectMisconceptions(candidate, commonMisconceptions = []) {
  const penalties = [];
  const explanations = [];
  let totalPenaltyPoints = 0;
  if (candidate.wordCount < 2 || commonMisconceptions.length === 0) {
    return {
      hasMisconceptions: false,
      totalPenaltyPoints: 0,
      penalties: [],
      explanations: []
    };
  }
  const norm = candidate.normalizedText;
  for (const misc of commonMisconceptions) {
    let triggered = false;
    let snippet = "";
    if (misc.pattern) {
      try {
        const regex = new RegExp(misc.pattern, "i");
        const match = norm.match(regex);
        if (match) {
          triggered = true;
          snippet = match[0];
        }
      } catch (err) {
      }
    }
    if (!triggered) {
      for (const phrase of misc.triggerPhrases) {
        const cleanPhrase = phrase.toLowerCase();
        if (norm.includes(cleanPhrase)) {
          triggered = true;
          snippet = phrase;
          break;
        }
        const words = cleanPhrase.split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
          const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
          const patternStr = escaped.join("\\s+(?:(?!not|non|never|isn't)[a-z0-9_]+\\s+){0,2}");
          try {
            const flexRegex = new RegExp(`\\b${patternStr}\\b`, "i");
            const match = norm.match(flexRegex);
            if (match) {
              triggered = true;
              snippet = match[0];
              break;
            }
          } catch (err) {
          }
        }
      }
    }
    if (triggered) {
      const penaltyPts = misc.penaltyPoints || 15;
      totalPenaltyPoints += penaltyPts;
      const penaltyRecord = {
        misconceptionId: misc.id,
        description: misc.description,
        penaltyPoints: penaltyPts,
        detectedSnippet: snippet,
        whyIncorrect: misc.whyIncorrect
      };
      penalties.push(penaltyRecord);
      explanations.push(`Penalty -${penaltyPts} pts: Stated "${snippet}". ${misc.whyIncorrect}`);
    }
  }
  return {
    hasMisconceptions: penalties.length > 0,
    totalPenaltyPoints,
    penalties,
    explanations
  };
}

// src/nlp/evaluation/answerScoringEngine.ts
function getEvaluationBand(score) {
  if (score >= 85) {
    return { band: "85\u2013100: Strong, Technically Correct Answer", label: "Strong, Technically Correct Answer" };
  }
  if (score >= 65) {
    return { band: "65\u201384: Mostly Correct", label: "Mostly Correct" };
  }
  if (score >= 45) {
    return { band: "45\u201364: Partially Correct", label: "Partially Correct" };
  }
  if (score >= 21) {
    return { band: "21\u201344: Limited Understanding", label: "Limited Understanding" };
  }
  return { band: "0\u201320: Incorrect or Irrelevant", label: "Incorrect or Irrelevant" };
}
function scoreAnswer(rawAnswerText, benchmark, codingResult) {
  const preprocessed = preprocessAnswer(rawAnswerText);
  const rubric = benchmark.scoringRubric || {
    technicalCorrectnessWeight: 0.4,
    essentialCoverageWeight: 0.3,
    relevanceSemanticWeight: 0.2,
    reasoningWeight: 0.1
  };
  const auditLog = [];
  const strengths = [];
  const improvements = [];
  if (preprocessed.wordCount === 0 && !codingResult) {
    const zeroBreakdown = {
      technicalCorrectness: { score: 0, weight: rubric.technicalCorrectnessWeight, weightedPoints: 0, maxPoints: rubric.technicalCorrectnessWeight * 100, explanation: "No answer submitted." },
      essentialCoverage: { score: 0, weight: rubric.essentialCoverageWeight, weightedPoints: 0, maxPoints: rubric.essentialCoverageWeight * 100, explanation: "Zero concepts addressed." },
      relevanceSemantic: { score: 0, weight: rubric.relevanceSemanticWeight, weightedPoints: 0, maxPoints: rubric.relevanceSemanticWeight * 100, explanation: "No content to analyze." },
      reasoningAndClarity: { score: 0, weight: rubric.reasoningWeight, weightedPoints: 0, maxPoints: rubric.reasoningWeight * 100, explanation: "No explanation provided." }
    };
    return {
      finalScore: 0,
      band: "0\u201320: Incorrect or Irrelevant",
      bandLabel: "Incorrect or Irrelevant",
      rubricBreakdown: zeroBreakdown,
      conceptsCorrect: [],
      conceptsMissing: benchmark.essentialConcepts,
      supportingConceptsCovered: [],
      misconceptionsDetected: [],
      strengths: [],
      improvements: ["Submit a detailed technical response addressing the core question principles."],
      sampleIdealAnswer: benchmark.expectedAnswer,
      suggestedImprovedAnswer: benchmark.expectedAnswer,
      scoringAuditExplanation: ["0 points awarded: empty submission."],
      difficultyAdjustment: "demoted",
      topicsToPractice: [`${benchmark.subject}: Core Principles`],
      evaluationMethodologyNotice: "Scored via Deterministic NLP Semantic Concept Engine using explicit engineering rubrics."
    };
  }
  const semanticMatch = matchSemanticAnswer(
    preprocessed,
    benchmark.expectedAnswer,
    benchmark.acceptedAlternatives
  );
  const conceptAnalysis = evaluateConceptCoverage(
    preprocessed,
    benchmark.essentialConcepts,
    benchmark.supportingConcepts,
    benchmark.acceptedAlternatives
  );
  const misconceptionAnalysis = detectMisconceptions(
    preprocessed,
    benchmark.commonMisconceptions
  );
  if (codingResult) {
    const passRate = codingResult.passedCount / (codingResult.totalCount || 1);
    auditLog.push(`Coding execution: Passed ${codingResult.passedCount}/${codingResult.totalCount} test cases (${Math.round(passRate * 100)}%).`);
    if (codingResult.timeComplexityAnalysis) {
      auditLog.push(`Detected algorithmic complexity: ${codingResult.timeComplexityAnalysis}.`);
    }
  }
  const coverageScore = Math.round(conceptAnalysis.essentialCoverageRatio * 100);
  const coverageWeighted = Math.round(coverageScore * rubric.essentialCoverageWeight);
  auditLog.push(
    `Concept Coverage (${Math.round(rubric.essentialCoverageWeight * 100)}% weight): Covered ${conceptAnalysis.coveredEssentialCount}/${conceptAnalysis.totalEssentialCount} essential concepts (${coverageScore}% -> ${coverageWeighted} pts).`
  );
  let semanticScore = Math.round(semanticMatch.similarityScore * 100);
  if (semanticMatch.isOffTopic) {
    semanticScore = 0;
    auditLog.push(`Semantic Alignment: Detected off-topic or irrelevant submission (0 pts).`);
  } else {
    auditLog.push(
      `Semantic Alignment (${Math.round(rubric.relevanceSemanticWeight * 100)}% weight): Similarity ${semanticScore}% (TF-IDF: ${Math.round(semanticMatch.tfidfCosineScore * 100)}%, Propositions: ${Math.round(semanticMatch.propositionScore * 100)}%) -> ${Math.round(semanticScore * rubric.relevanceSemanticWeight)} pts.`
    );
  }
  const semanticWeighted = Math.round(semanticScore * rubric.relevanceSemanticWeight);
  let reasoningScore = 40;
  if (preprocessed.wordCount >= 35) reasoningScore += 25;
  else if (preprocessed.wordCount >= 20) reasoningScore += 15;
  else if (preprocessed.wordCount < 10) reasoningScore -= 20;
  if (preprocessed.reasoningConnectorCount >= 2) reasoningScore += 25;
  else if (preprocessed.reasoningConnectorCount === 1) reasoningScore += 15;
  if (conceptAnalysis.supportingConceptsCovered.length > 0) reasoningScore += 10;
  if (semanticMatch.isOffTopic) reasoningScore = 0;
  reasoningScore = Math.max(0, Math.min(100, reasoningScore));
  const reasoningWeighted = Math.round(reasoningScore * rubric.reasoningWeight);
  auditLog.push(
    `Reasoning & Clarity (${Math.round(rubric.reasoningWeight * 100)}% weight): Word count ${preprocessed.wordCount}, ${preprocessed.reasoningConnectorCount} reasoning connectors -> ${reasoningScore}% (${reasoningWeighted} pts).`
  );
  let correctnessScore = 0;
  if (codingResult) {
    const testRate = codingResult.passedCount / (codingResult.totalCount || 1);
    correctnessScore = Math.round(testRate * 100);
  } else if (!semanticMatch.isOffTopic) {
    const validRatio = conceptAnalysis.essentialCoverageRatio;
    correctnessScore = Math.round(validRatio * 85 + (semanticMatch.similarityScore >= 0.5 ? 15 : 0));
  }
  if (misconceptionAnalysis.hasMisconceptions) {
    const penaltyTotal = misconceptionAnalysis.totalPenaltyPoints;
    correctnessScore = Math.max(0, correctnessScore - penaltyTotal);
    for (const expl of misconceptionAnalysis.explanations) {
      auditLog.push(`[PENALTY] ${expl}`);
    }
  }
  correctnessScore = Math.max(0, Math.min(100, correctnessScore));
  const correctnessWeighted = Math.round(correctnessScore * rubric.technicalCorrectnessWeight);
  auditLog.push(
    `Technical Correctness (${Math.round(rubric.technicalCorrectnessWeight * 100)}% weight): Score ${correctnessScore}% -> ${correctnessWeighted} pts.`
  );
  let rawTotalScore = correctnessWeighted + coverageWeighted + semanticWeighted + reasoningWeighted;
  if (semanticMatch.isOffTopic && conceptAnalysis.coveredEssentialCount === 0) {
    rawTotalScore = Math.min(10, rawTotalScore);
  }
  const finalScore = Math.max(0, Math.min(100, Math.round(rawTotalScore)));
  const { band, label: bandLabel } = getEvaluationBand(finalScore);
  auditLog.push(`Final Score: ${finalScore}/100 (${band})`);
  for (const c of conceptAnalysis.coveredConcepts) {
    if (c.isCovered) {
      strengths.push(`Accurately addressed: ${c.name}${c.isAlternativeMatch ? " (accepted equivalent formulation)" : ""}.`);
    }
  }
  if (conceptAnalysis.supportingConceptsCovered.length > 0) {
    strengths.push(`Demonstrated depth on supporting topics: [${conceptAnalysis.supportingConceptsCovered.join(", ")}].`);
  }
  if (preprocessed.reasoningConnectorCount >= 2) {
    strengths.push("Articulated logical cause-and-effect reasoning with clear connectors.");
  }
  if (strengths.length === 0 && finalScore > 20) {
    strengths.push("Provided an introductory answer to the technical question.");
  }
  for (const mc of conceptAnalysis.missingConcepts) {
    improvements.push(`Missing key concept: ${mc.name} \u2014 ${mc.description}.`);
  }
  for (const p of misconceptionAnalysis.penalties) {
    improvements.push(`Correction needed: "${p.detectedSnippet}" is technically inaccurate. ${p.whyIncorrect}`);
  }
  if (preprocessed.wordCount < 25 && finalScore < 85) {
    improvements.push("Expand response with specific operational parameters, boundary conditions, and design trade-offs.");
  }
  let difficultyAdjustment = "maintained";
  let adjustedDifficulty = benchmark.difficulty;
  if (finalScore >= 85) {
    if (benchmark.difficulty === "Beginner") {
      difficultyAdjustment = "promoted";
      adjustedDifficulty = "Intermediate";
    } else if (benchmark.difficulty === "Intermediate") {
      difficultyAdjustment = "promoted";
      adjustedDifficulty = "Advanced";
    }
  } else if (finalScore < 45) {
    if (benchmark.difficulty === "Advanced") {
      difficultyAdjustment = "demoted";
      adjustedDifficulty = "Intermediate";
    } else if (benchmark.difficulty === "Intermediate") {
      difficultyAdjustment = "demoted";
      adjustedDifficulty = "Beginner";
    }
  }
  const topicsToPractice = [];
  if (conceptAnalysis.missingConcepts.length > 0) {
    topicsToPractice.push(`${benchmark.subject}: ${conceptAnalysis.missingConcepts[0].name}`);
  }
  if (misconceptionAnalysis.hasMisconceptions) {
    topicsToPractice.push(`${benchmark.subject}: Common Misconceptions & Pitfalls`);
  }
  const rubricBreakdown = {
    technicalCorrectness: {
      score: correctnessScore,
      weight: rubric.technicalCorrectnessWeight,
      weightedPoints: correctnessWeighted,
      maxPoints: rubric.technicalCorrectnessWeight * 100,
      explanation: misconceptionAnalysis.hasMisconceptions ? `Score reduced due to ${misconceptionAnalysis.penalties.length} technical inaccuracy/misconception.` : "Assessed against factual engineering criteria."
    },
    essentialCoverage: {
      score: coverageScore,
      weight: rubric.essentialCoverageWeight,
      weightedPoints: coverageWeighted,
      maxPoints: rubric.essentialCoverageWeight * 100,
      explanation: `Covered ${conceptAnalysis.coveredEssentialCount} of ${conceptAnalysis.totalEssentialCount} required concepts.`
    },
    relevanceSemantic: {
      score: semanticScore,
      weight: rubric.relevanceSemanticWeight,
      weightedPoints: semanticWeighted,
      maxPoints: rubric.relevanceSemanticWeight * 100,
      explanation: semanticMatch.isOffTopic ? "Response does not align with the question domain." : `Semantic similarity ${semanticScore}% using vector and proposition alignment.`
    },
    reasoningAndClarity: {
      score: reasoningScore,
      weight: rubric.reasoningWeight,
      weightedPoints: reasoningWeighted,
      maxPoints: rubric.reasoningWeight * 100,
      explanation: `Evaluated ${preprocessed.wordCount} words with ${preprocessed.reasoningConnectorCount} logical connectors.`
    }
  };
  return {
    finalScore,
    band,
    bandLabel,
    rubricBreakdown,
    conceptsCorrect: conceptAnalysis.coveredConcepts,
    conceptsMissing: conceptAnalysis.missingConcepts,
    supportingConceptsCovered: conceptAnalysis.supportingConceptsCovered,
    misconceptionsDetected: misconceptionAnalysis.penalties,
    strengths,
    improvements,
    sampleIdealAnswer: benchmark.expectedAnswer,
    suggestedImprovedAnswer: benchmark.expectedAnswer,
    scoringAuditExplanation: auditLog,
    difficultyAdjustment,
    adjustedDifficulty,
    codingResult,
    topicsToPractice,
    evaluationMethodologyNotice: "Evaluated using Multi-Factor NLP Semantic Engine (Correctness 40%, Concepts 30%, Semantic 20%, Reasoning 10%)."
  };
}

// src/nlp/nlpQuestionMatcher.ts
function buildIdfTable(documents) {
  const docCount = documents.length;
  const df = {};
  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      df[token] = (df[token] || 0) + 1;
    }
  }
  const idf = {};
  for (const [token, count] of Object.entries(df)) {
    idf[token] = Math.log((docCount + 1) / (count + 1)) + 1;
  }
  return idf;
}
function computeTfIdfVector(tokens, weights = {}, idfTable) {
  const tf = {};
  for (const token of tokens) {
    const w = weights[token] || 1;
    tf[token] = (tf[token] || 0) + w;
  }
  const vector = {};
  let sumSquares = 0;
  for (const [token, freq] of Object.entries(tf)) {
    const idf = idfTable[token] || 1;
    const tfScaled = 1 + Math.log(freq);
    const val = tfScaled * idf;
    vector[token] = val;
    sumSquares += val * val;
  }
  const magnitude = Math.sqrt(sumSquares);
  if (magnitude > 0) {
    for (const token of Object.keys(vector)) {
      vector[token] = vector[token] / magnitude;
    }
  }
  return vector;
}
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  const [small, large] = Object.keys(vecA).length <= Object.keys(vecB).length ? [vecA, vecB] : [vecB, vecA];
  for (const [term, valA] of Object.entries(small)) {
    const valB = large[term];
    if (valB !== void 0) {
      dotProduct += valA * valB;
    }
  }
  return Math.max(0, Math.min(1, dotProduct));
}
function buildCandidateTokens(extracted) {
  const tokens = [];
  const weights = {};
  const basePre = preprocessDocument(extracted.normalizedText);
  for (const t of basePre.stemmedTokens) {
    tokens.push(t);
  }
  for (const skill of extracted.extractedSkills) {
    const p = preprocessDocument(skill);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1, 3.5);
    }
  }
  for (const tech of extracted.projectTechnologies) {
    const p = preprocessDocument(tech);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1, 3);
    }
  }
  for (const title of extracted.projectTitles) {
    const p = preprocessDocument(title);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1, 2.5);
    }
  }
  for (const role of extracted.experienceRoles) {
    const p = preprocessDocument(role);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1, 2);
    }
  }
  return { tokens, weights };
}
function buildQuestionTokens(q) {
  const tokens = [];
  const weights = {};
  const qPre = preprocessDocument(q.question);
  for (const t of qPre.stemmedTokens) {
    tokens.push(t);
  }
  const skillPre = preprocessDocument(q.skill);
  for (const t of skillPre.stemmedTokens) {
    tokens.push(t);
    weights[t] = Math.max(weights[t] || 1, 3.5);
  }
  for (const kw of q.keywords) {
    const kwPre = preprocessDocument(kw);
    for (const t of kwPre.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1, 2.5);
    }
  }
  const topicPre = preprocessDocument(`${q.topic} ${q.subtopic}`);
  for (const t of topicPre.stemmedTokens) {
    tokens.push(t);
    weights[t] = Math.max(weights[t] || 1, 2);
  }
  return { tokens, weights };
}
function matchTechnicalQuestions(extracted, difficulty, targetCount = 4) {
  const targetDept = extracted.effectiveDepartment;
  const dynamicResumeQuestions = assembleTechnicalQuestions(extracted, difficulty, targetCount * 2);
  const deptQuestions = TECHNICAL_QUESTION_DATASET.filter((q) => q.department === targetDept);
  const combinedMap = /* @__PURE__ */ new Map();
  dynamicResumeQuestions.forEach((q) => combinedMap.set(q.id, q));
  deptQuestions.forEach((q) => {
    if (!combinedMap.has(q.id)) {
      combinedMap.set(q.id, q);
    }
  });
  const candidatePool = Array.from(combinedMap.values());
  const candidateTokensData = buildCandidateTokens(extracted);
  const questionTokensList = candidatePool.map((q) => buildQuestionTokens(q));
  const allCorpusDocs = [
    candidateTokensData.tokens,
    ...questionTokensList.map((qt) => qt.tokens)
  ];
  const idfTable = buildIdfTable(allCorpusDocs);
  const candidateVector = computeTfIdfVector(candidateTokensData.tokens, candidateTokensData.weights, idfTable);
  const scoredQuestions = candidatePool.map((q, idx) => {
    const qTokenData = questionTokensList[idx];
    const qVector = computeTfIdfVector(qTokenData.tokens, qTokenData.weights, idfTable);
    let score = cosineSimilarity(candidateVector, qVector);
    const skillNorm = q.skill.toLowerCase();
    const hasExactSkill = extracted.extractedSkills.some(
      (s) => s.toLowerCase() === skillNorm || skillNorm.includes(s.toLowerCase()) || s.toLowerCase().includes(skillNorm)
    );
    if (hasExactSkill) {
      score += 0.35;
    }
    const isProjectMatched = q.questionSource === "project" || extracted.projectTechnologies.some(
      (pt) => pt.toLowerCase() === skillNorm || skillNorm.includes(pt.toLowerCase())
    );
    if (isProjectMatched) {
      score += 0.3;
    }
    if (q.questionSource === "internship") {
      score += 0.28;
    } else if (q.questionSource === "certification") {
      score += 0.26;
    }
    if (q.difficulty === difficulty) {
      score *= 1.25;
    } else if (difficulty === "Intermediate" || difficulty === "Beginner" && q.difficulty === "Intermediate" || difficulty === "Advanced" && q.difficulty === "Intermediate") {
      score *= 1.05;
    } else {
      score *= 0.85;
    }
    const qTerms = new Set(qTokenData.tokens);
    const matchedKeywords = Array.from(new Set(candidateTokensData.tokens.filter((t) => qTerms.has(t))));
    let relevanceExplanation = "";
    if (q.questionSource === "project") {
      relevanceExplanation = `Directly generated from your resume project: "${q.associatedProjectName || q.skill}".`;
    } else if (q.questionSource === "internship") {
      relevanceExplanation = `Directly generated from your internship experience at: "${q.associatedInternshipCompany || "Host Organization"}".`;
    } else if (q.questionSource === "certification") {
      relevanceExplanation = `Directly generated from your resume certification: "${q.associatedCertificationName || q.skill}".`;
    } else if (hasExactSkill) {
      relevanceExplanation = `Direct match to your extracted resume skill: "${q.skill}" (${q.topic}).`;
    } else if (isProjectMatched) {
      relevanceExplanation = `Matched to technologies referenced in your resume projects: "${q.skill}".`;
    } else if (matchedKeywords.length > 0) {
      relevanceExplanation = `NLP TF-IDF keyword overlap on domain terms: [${matchedKeywords.slice(0, 3).join(", ")}].`;
    } else {
      relevanceExplanation = `Core foundational curriculum topic for ${targetDept} at ${q.difficulty} level.`;
    }
    return {
      question: {
        ...q,
        relevanceScore: Math.round(score * 100) / 100
      },
      score: Math.round(score * 100) / 100,
      matchedKeywords: matchedKeywords.slice(0, 6),
      matchedSkill: q.skill,
      relevanceExplanation,
      isProjectMatched
    };
  });
  scoredQuestions.sort((a, b) => b.score - a.score);
  const selected = [];
  const selectedTopics = /* @__PURE__ */ new Set();
  const selectedSkills = /* @__PURE__ */ new Set();
  for (const item of scoredQuestions) {
    if (selected.length >= targetCount) break;
    const topicKey = `${item.question.topic}:${item.question.subtopic}`;
    if (!selectedTopics.has(topicKey) && !selectedSkills.has(item.question.skill)) {
      selected.push(item.question);
      selectedTopics.add(topicKey);
      selectedSkills.add(item.question.skill);
    }
  }
  if (selected.length < targetCount) {
    for (const item of scoredQuestions) {
      if (selected.length >= targetCount) break;
      if (!selected.some((q) => q.id === item.question.id)) {
        selected.push(item.question);
      }
    }
  }
  return {
    selectedQuestions: selected,
    audit: scoredQuestions
  };
}
function evaluateAnswerNLP(question, answerText, codingResult) {
  const benchmark = getQuestionEvaluationBenchmark(
    question.id,
    question.idealAnswerPoints?.join(". ") || question.question,
    question.department,
    question.topic,
    question.difficulty,
    question.keywords,
    question.idealAnswerPoints
  );
  const evalResult = scoreAnswer(answerText, benchmark, codingResult);
  const foundConcepts = evalResult.conceptsCorrect.filter((c) => c.isCovered).map((c) => c.name);
  const missingConcepts = evalResult.conceptsMissing.map((m) => m.name);
  return {
    technicalAccuracyScore: evalResult.finalScore,
    communicationScore: evalResult.rubricBreakdown.reasoningAndClarity.score,
    relevanceScore: evalResult.rubricBreakdown.relevanceSemantic.score,
    overallRating: evalResult.bandLabel,
    strengths: evalResult.strengths,
    improvements: evalResult.improvements,
    sampleIdealAnswer: evalResult.sampleIdealAnswer,
    keywordCoverage: {
      found: foundConcepts,
      missing: missingConcepts
    },
    difficultyAdjustment: evalResult.difficultyAdjustment,
    adjustedDifficulty: evalResult.adjustedDifficulty,
    topicsToPractice: evalResult.topicsToPractice,
    evaluationBand: evalResult.band,
    rubricBreakdown: evalResult.rubricBreakdown,
    conceptsCorrect: evalResult.conceptsCorrect,
    conceptsMissing: evalResult.conceptsMissing,
    misconceptionsDetected: evalResult.misconceptionsDetected,
    scoringAuditExplanation: evalResult.scoringAuditExplanation,
    evaluationMethodologyNotice: evalResult.evaluationMethodologyNotice
  };
}
function generateFollowUpQuestion(question, answerText) {
  if (!question.followUpTemplates || question.followUpTemplates.length === 0) {
    return null;
  }
  const normAnswer = normalizeText(answerText);
  const pre = preprocessDocument(answerText);
  const words = pre.rawTokens;
  const templateIdx = words.length % question.followUpTemplates.length;
  const template = question.followUpTemplates[templateIdx];
  const matchedKeywords = question.keywords.filter((k) => normAnswer.includes(k.toLowerCase()));
  return {
    id: `followup_${question.id}_${Date.now()}`,
    parentQuestionId: question.id,
    question: template,
    topic: `Adaptive Follow-up: ${question.subtopic}`,
    templateUsed: template,
    triggerKeywords: matchedKeywords,
    explanation: `Follow-up deep dive targeting your previous answer on ${question.skill} (${question.topic}).`
  };
}

// src/nlp/technicalInterviewEngine.ts
var FrontendNLPTechnicalInterviewEngine = class {
  config;
  state;
  constructor(config) {
    this.config = config;
    this.state = this.initSession(config);
  }
  /**
   * Initializes or resets the interview session
   */
  initSession(config) {
    this.config = config;
    const extractedNLP = extractResumeNLP(
      config.resume,
      config.profileDepartment,
      config.targetDepartment
    );
    const storageKey = this.getPersistenceKeyForCandidate(extractedNLP, config.resume);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0 && Array.isArray(parsed.answers)) {
            const restoredState = {
              questions: parsed.questions,
              currentIndex: parsed.currentIndex || 0,
              currentQuestion: parsed.questions[parsed.currentIndex || 0] || null,
              answers: parsed.answers || [],
              activeFollowUp: null,
              isFollowUpActive: false,
              extractedNLP,
              difficulty: parsed.difficulty || config.difficulty,
              isComplete: parsed.isComplete || false,
              matchAudit: parsed.matchAudit || [],
              timeSpentSeconds: parsed.timeSpentSeconds || 0,
              topicMastery: parsed.topicMastery || {},
              codingSubmissions: parsed.codingSubmissions || {},
              currentSetNumber: parsed.currentSetNumber || Math.floor((parsed.currentIndex || 0) / 4) + 1,
              completedSets: parsed.completedSets || [],
              questionHistory: parsed.questionHistory || [],
              isSetCompleted: parsed.isSetCompleted || false,
              currentSetSummary: parsed.currentSetSummary || null
            };
            restoredState.skillDashboard = this.computeSkillDashboard(restoredState.answers, restoredState.completedSets, restoredState.questions);
            this.state = restoredState;
            return this.state;
          }
        }
      } catch (err) {
        console.warn("Could not restore technical practice session:", err);
      }
    }
    const initialSet = generateSetOfFourQuestions(extractedNLP, [], 1, config.difficulty);
    const { audit } = matchTechnicalQuestions(
      extractedNLP,
      config.difficulty,
      4
    );
    this.state = {
      questions: initialSet,
      currentIndex: 0,
      currentQuestion: initialSet.length > 0 ? initialSet[0] : null,
      answers: [],
      activeFollowUp: null,
      isFollowUpActive: false,
      extractedNLP,
      difficulty: config.difficulty,
      isComplete: false,
      matchAudit: audit,
      timeSpentSeconds: 0,
      topicMastery: {},
      codingSubmissions: {},
      currentSetNumber: 1,
      completedSets: [],
      questionHistory: [],
      isSetCompleted: false,
      currentSetSummary: null,
      skillDashboard: this.computeSkillDashboard([], [], initialSet)
    };
    this.persistState();
    return this.state;
  }
  /**
   * Submits candidate's answer to the active question with dynamic difficulty adjustment
   */
  submitAnswer(answerText, timeSpentSeconds, telemetry = { eyeContact: 92, confidence: 90 }, codingResult) {
    const activeQ = this.state.isFollowUpActive && this.state.activeFollowUp ? {
      id: this.state.activeFollowUp.id,
      department: this.state.extractedNLP.effectiveDepartment,
      topic: this.state.activeFollowUp.topic,
      subtopic: "Follow-up drill-down",
      skill: this.state.currentQuestion?.skill || "Technical Skills",
      difficulty: this.state.difficulty,
      question: this.state.activeFollowUp.question,
      questionType: "problem-solving",
      keywords: this.state.activeFollowUp.triggerKeywords,
      followUpTemplates: [],
      idealAnswerPoints: [
        "Clear analysis of constraints, trade-offs, and boundary conditions",
        "Practical real-world implementation methodology"
      ],
      explanation: this.state.activeFollowUp.explanation
    } : this.state.currentQuestion;
    if (!activeQ) {
      throw new Error("No active question in current interview state.");
    }
    const evaluation = evaluateAnswerNLP(activeQ, answerText, codingResult);
    if (evaluation.adjustedDifficulty && evaluation.adjustedDifficulty !== this.state.difficulty) {
      this.state.difficulty = evaluation.adjustedDifficulty;
    }
    const topicKey = activeQ.topic || "Core Engineering";
    const existingMastery = this.state.topicMastery[topicKey] || {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: 0,
      averageScore: 0,
      needsPractice: false
    };
    const newAttemptCount = existingMastery.questionsAttempted + 1;
    const newAvg = Math.round(
      (existingMastery.averageScore * existingMastery.questionsAttempted + evaluation.technicalAccuracyScore) / newAttemptCount
    );
    this.state.topicMastery[topicKey] = {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: newAttemptCount,
      averageScore: newAvg,
      needsPractice: newAvg < 70
    };
    let followUp = null;
    if (!this.state.isFollowUpActive) {
      followUp = generateFollowUpQuestion(activeQ, answerText);
    }
    const mistakeExplanation = evaluation.misconceptionsDetected && evaluation.misconceptionsDetected.length > 0 ? evaluation.misconceptionsDetected.map((m) => `${m.description}: ${m.whyIncorrect}`).join(". ") : evaluation.technicalAccuracyScore < 75 && evaluation.improvements.length > 0 ? evaluation.improvements[0] : void 0;
    const studyRec = activeQ.whatToStudyNext || (evaluation.topicsToPractice && evaluation.topicsToPractice.length > 0 ? evaluation.topicsToPractice.join(", ") : evaluation.improvements[0]);
    const practiceQ = activeQ.recommendedPracticeQuestion || `Practice intermediate problem-solving on ${activeQ.skill} (${activeQ.topic}).`;
    const answerRecord = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      userAnswer: answerText,
      isSkipped: false,
      questionSkill: activeQ.skill,
      questionTopic: activeQ.topic,
      questionDifficulty: activeQ.difficulty,
      questionSource: activeQ.questionSource || "resume-skill",
      learningExplanation: activeQ.learningExplanation || activeQ.explanation,
      aiFeedback: {
        technicalAccuracyScore: evaluation.technicalAccuracyScore,
        communicationScore: evaluation.communicationScore,
        relevanceScore: evaluation.relevanceScore,
        overallRating: evaluation.overallRating,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        sampleIdealAnswer: evaluation.sampleIdealAnswer,
        followUpQuestion: followUp?.question,
        evaluationMistakeExplanation: mistakeExplanation,
        studyRecommendation: studyRec,
        practiceQuestion: practiceQ
      },
      timeTakenSeconds: timeSpentSeconds,
      eyeContactScore: telemetry.eyeContact,
      confidenceScore: telemetry.confidence
    };
    this.state.answers = [...this.state.answers, answerRecord];
    this.state.activeFollowUp = followUp;
    const historyEntry = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      normalizedText: normalizeForDuplicateCheck(activeQ.question),
      skill: activeQ.skill,
      topic: activeQ.topic,
      subtopic: activeQ.subtopic,
      department: activeQ.department,
      difficulty: activeQ.difficulty,
      questionType: activeQ.questionType,
      setNumber: this.state.currentSetNumber,
      completionStatus: "answered",
      score: evaluation.technicalAccuracyScore,
      askedAtTimestamp: Date.now()
    };
    this.state.questionHistory = [...this.state.questionHistory, historyEntry];
    this.persistState();
    return { evaluation, followUp };
  }
  /**
   * Skips active question, awards 0 marks, and records learning explanation
   */
  skipQuestion(timeSpentSeconds) {
    const activeQ = this.state.isFollowUpActive && this.state.activeFollowUp ? {
      id: this.state.activeFollowUp.id,
      department: this.state.extractedNLP.effectiveDepartment,
      topic: this.state.activeFollowUp.topic,
      subtopic: "Follow-up drill-down",
      skill: this.state.currentQuestion?.skill || "Technical Skills",
      difficulty: this.state.difficulty,
      question: this.state.activeFollowUp.question,
      questionType: "problem-solving",
      keywords: this.state.activeFollowUp.triggerKeywords,
      followUpTemplates: [],
      idealAnswerPoints: [],
      explanation: this.state.activeFollowUp.explanation,
      learningExplanation: this.state.activeFollowUp.explanation,
      questionSource: "resume-skill",
      whatToStudyNext: `Review foundational concepts for ${this.state.currentQuestion?.skill || "this topic"}`,
      recommendedPracticeQuestion: `Practice basic implementation of ${this.state.currentQuestion?.skill || "this topic"}`
    } : this.state.currentQuestion;
    if (!activeQ) {
      throw new Error("No active question in current interview state.");
    }
    const learningExplanation = activeQ.learningExplanation || activeQ.explanation || "See technical documentation and fundamentals.";
    const whatToStudyNext = activeQ.whatToStudyNext || `Review core principles and syntax of ${activeQ.skill}.`;
    const recommendedPracticeQuestion = activeQ.recommendedPracticeQuestion || `Build a minimal prototype or solve a standard problem testing ${activeQ.skill}.`;
    const correctAnswer = activeQ.referenceAnswer || (activeQ.idealAnswerPoints && activeQ.idealAnswerPoints.length > 0 ? activeQ.idealAnswerPoints.map((pt, i) => `${i + 1}. ${pt}`).join("\n\n") : activeQ.learningExplanation || activeQ.explanation || "No reference answer recorded.");
    const explanation = activeQ.learningExplanation || activeQ.explanation || "Step-by-step conceptual walkthrough.";
    const importantConcepts = activeQ.idealAnswerPoints && activeQ.idealAnswerPoints.length > 0 ? activeQ.idealAnswerPoints : activeQ.keywords && activeQ.keywords.length > 0 ? activeQ.keywords : [activeQ.skill, activeQ.topic];
    const exampleSolution = activeQ.exampleSolution || (activeQ.codingProblem?.starterCodes ? activeQ.codingProblem.starterCodes[activeQ.codingProblem.defaultLanguage || "python"] : activeQ.practicalTask || (activeQ.recommendedPracticeQuestion ? `Example Scenario: ${activeQ.recommendedPracticeQuestion}` : void 0));
    const learningData = {
      questionText: activeQ.question,
      correctAnswer,
      explanation,
      importantConcepts,
      exampleSolution
    };
    const evaluation = {
      technicalAccuracyScore: 0,
      communicationScore: 0,
      relevanceScore: 0,
      overallRating: "Needs Practice",
      strengths: [],
      improvements: [
        "Question skipped by candidate \u2014 0 marks awarded.",
        `Review the learning reference explanation below to understand ${activeQ.skill} thoroughly.`
      ],
      sampleIdealAnswer: correctAnswer,
      keywordCoverage: {
        found: [],
        missing: activeQ.keywords || []
      },
      difficultyAdjustment: "maintained",
      adjustedDifficulty: this.state.difficulty,
      topicsToPractice: [activeQ.topic || activeQ.skill],
      evaluationBand: "0\u201320: Incorrect or Irrelevant",
      rubricBreakdown: {
        technicalCorrectness: { score: 0, weight: 0.4, weightedPoints: 0, maxPoints: 40, explanation: "Question skipped \u2014 0 marks" },
        essentialCoverage: { score: 0, weight: 0.3, weightedPoints: 0, maxPoints: 30, explanation: "Question skipped \u2014 0 marks" },
        relevanceSemantic: { score: 0, weight: 0.2, weightedPoints: 0, maxPoints: 20, explanation: "Question skipped \u2014 0 marks" },
        reasoningAndClarity: { score: 0, weight: 0.1, weightedPoints: 0, maxPoints: 10, explanation: "Question skipped \u2014 0 marks" }
      },
      conceptsCorrect: [],
      conceptsMissing: (activeQ.idealAnswerPoints || []).map((p, pIdx) => ({
        id: `missing_${activeQ.id}_${pIdx}`,
        name: p,
        description: p,
        keyPhrases: [p],
        synonyms: [],
        weight: 1
      })),
      misconceptionsDetected: [],
      scoringAuditExplanation: ["Candidate skipped this question. Zero marks awarded; reference learning explanation provided."],
      evaluationMethodologyNotice: "Deterministic evaluation: 0 marks for unattempted question."
    };
    const topicKey = activeQ.topic || "Core Engineering";
    const existingMastery = this.state.topicMastery[topicKey] || {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: 0,
      averageScore: 0,
      needsPractice: true
    };
    const newAttemptCount = existingMastery.questionsAttempted + 1;
    const newAvg = Math.round(
      (existingMastery.averageScore * existingMastery.questionsAttempted + 0) / newAttemptCount
    );
    this.state.topicMastery[topicKey] = {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: newAttemptCount,
      averageScore: newAvg,
      needsPractice: true
    };
    const answerRecord = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      userAnswer: "[SKIPPED BY CANDIDATE - 0 MARKS]",
      isSkipped: true,
      questionSkill: activeQ.skill,
      questionTopic: activeQ.topic,
      questionDifficulty: activeQ.difficulty,
      questionSource: activeQ.questionSource || "resume-skill",
      learningExplanation,
      referenceAnswer: correctAnswer,
      exampleSolution,
      importantConcepts,
      aiFeedback: {
        technicalAccuracyScore: 0,
        communicationScore: 0,
        relevanceScore: 0,
        overallRating: "Needs Practice",
        strengths: [],
        improvements: [
          "Question skipped by candidate (0/100).",
          `Study the learning explanation to master ${activeQ.skill}.`
        ],
        sampleIdealAnswer: correctAnswer,
        evaluationMistakeExplanation: "Question was skipped without attempting. Fundamental concepts were not demonstrated.",
        studyRecommendation: whatToStudyNext,
        practiceQuestion: recommendedPracticeQuestion
      },
      timeTakenSeconds: timeSpentSeconds,
      eyeContactScore: 0,
      confidenceScore: 0
    };
    this.state.answers = [...this.state.answers, answerRecord];
    this.state.activeFollowUp = null;
    const historyEntry = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      normalizedText: normalizeForDuplicateCheck(activeQ.question),
      skill: activeQ.skill,
      topic: activeQ.topic,
      subtopic: activeQ.subtopic,
      department: activeQ.department,
      difficulty: activeQ.difficulty,
      questionType: activeQ.questionType,
      setNumber: this.state.currentSetNumber,
      completionStatus: "skipped",
      score: 0,
      askedAtTimestamp: Date.now()
    };
    this.state.questionHistory = [...this.state.questionHistory, historyEntry];
    this.persistState();
    return { evaluation, learningExplanation, learningData };
  }
  /**
   * Submits coding solution directly from the CodingWorkspace
   */
  submitCodingSolution(code, language, result, timeSpentSeconds) {
    if (this.state.currentQuestion) {
      this.state.codingSubmissions[this.state.currentQuestion.id] = result;
    }
    const explanationText = `Code Solution (${language.toUpperCase()}):
\`\`\`${language}
${code}
\`\`\`

Execution Result: Passed ${result.passedCount}/${result.totalCount} test cases.
Analyzed Complexity: Time ${result.timeComplexityAnalysis || "O(n)"}, Space ${result.spaceComplexityAnalysis || "O(n)"}.`;
    return this.submitAnswer(explanationText, timeSpentSeconds, void 0, result);
  }
  /**
   * Activates the generated follow-up question in the session
   */
  activateFollowUp() {
    if (this.state.activeFollowUp) {
      this.state.isFollowUpActive = true;
      return true;
    }
    return false;
  }
  /**
   * Advances to next question in active set or completes set of 4
   */
  advanceNext() {
    this.state.isFollowUpActive = false;
    this.state.activeFollowUp = null;
    const nextIdx = this.state.currentIndex + 1;
    const setEndIndex = this.state.currentSetNumber * 4;
    if (nextIdx >= setEndIndex || nextIdx >= this.state.questions.length) {
      this.state.isSetCompleted = true;
      const summary = this.computeSetSummary(this.state.currentSetNumber);
      this.state.currentSetSummary = summary;
      const existingIdx = this.state.completedSets.findIndex((s) => s.setNumber === summary.setNumber);
      if (existingIdx >= 0) {
        this.state.completedSets[existingIdx] = summary;
      } else {
        this.state.completedSets.push(summary);
      }
      this.state.skillDashboard = this.computeSkillDashboard(this.state.answers, this.state.completedSets, this.state.questions);
      this.persistState();
      return { hasNext: false, nextQuestion: null, isComplete: false, isSetCompleted: true };
    }
    this.state.currentIndex = nextIdx;
    this.state.currentQuestion = this.state.questions[nextIdx];
    this.state.isSetCompleted = false;
    this.persistState();
    return { hasNext: true, nextQuestion: this.state.currentQuestion, isComplete: false, isSetCompleted: false };
  }
  /**
   * Starts the next set of four unique questions (Set 2: Q5-8, Set 3: Q9-12, etc.)
   */
  startNextSet() {
    const lastSummary = this.state.currentSetSummary || this.state.completedSets[this.state.completedSets.length - 1];
    if (lastSummary) {
      if (lastSummary.setScore >= 80) {
        if (this.state.difficulty === "Beginner") this.state.difficulty = "Intermediate";
        else if (this.state.difficulty === "Intermediate") this.state.difficulty = "Advanced";
      } else if (lastSummary.setScore < 60) {
        if (this.state.difficulty === "Advanced") this.state.difficulty = "Intermediate";
        else if (this.state.difficulty === "Intermediate") this.state.difficulty = "Beginner";
      }
    }
    const nextSetNumber = this.state.currentSetNumber + 1;
    this.state.currentSetNumber = nextSetNumber;
    const nextFourQuestions = generateSetOfFourQuestions(
      this.state.extractedNLP,
      this.state.questionHistory,
      nextSetNumber,
      this.state.difficulty
    );
    this.state.questions = [...this.state.questions, ...nextFourQuestions];
    const newIndex = (nextSetNumber - 1) * 4;
    this.state.currentIndex = newIndex;
    this.state.currentQuestion = this.state.questions[newIndex];
    this.state.isSetCompleted = false;
    this.state.currentSetSummary = null;
    this.persistState();
    return {
      questions: this.state.questions,
      setNumber: nextSetNumber,
      currentQuestion: this.state.currentQuestion
    };
  }
  /**
   * Calculates comprehensive set performance metrics for practice review
   */
  computeSetSummary(setNumber) {
    const startIndex = (setNumber - 1) * 4;
    const endIndex = startIndex + 4;
    const setAnswers = this.state.answers.slice(startIndex, endIndex);
    const questionsAttempted = setAnswers.length;
    const skippedQuestions = setAnswers.filter((a) => a.isSkipped).length;
    const correctAnswers = setAnswers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 70
    ).length;
    const partiallyCorrectAnswers = setAnswers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 30 && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 70
    ).length;
    const incorrectAnswers = setAnswers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 30
    ).length;
    const totalScore = setAnswers.reduce((sum, a) => sum + (a.aiFeedback?.technicalAccuracyScore || 0), 0);
    const setScore = Math.round(totalScore / (questionsAttempted || 1));
    const skillsTested = Array.from(new Set(setAnswers.map((a) => a.questionSkill).filter(Boolean)));
    const topicsTested = Array.from(new Set(setAnswers.map((a) => a.questionTopic).filter(Boolean)));
    const strengths = [];
    const improvements = [];
    setAnswers.forEach((a) => {
      if ((a.aiFeedback?.technicalAccuracyScore || 0) >= 70) {
        if (a.aiFeedback?.strengths?.[0]) strengths.push(a.aiFeedback.strengths[0]);
      } else {
        if (a.aiFeedback?.improvements?.[0]) improvements.push(a.aiFeedback.improvements[0]);
      }
    });
    return {
      setNumber,
      questionIndices: [startIndex, startIndex + 1, startIndex + 2, startIndex + 3],
      questionsAttempted,
      correctAnswers,
      partiallyCorrectAnswers,
      incorrectAnswers,
      skippedQuestions,
      setScore,
      skillsTested,
      topicsTested,
      strengths: Array.from(new Set(strengths)).slice(0, 3),
      improvements: Array.from(new Set(improvements)).slice(0, 3)
    };
  }
  /**
   * Computes Skill-Wise Progress Dashboard across all practiced sets (Requirement 10)
   */
  computeSkillDashboard(answers, completedSets, questionsPool = []) {
    const totalSetsCompleted = completedSets.length;
    const totalQuestionsAttempted = answers.length;
    const totalScore = answers.reduce((sum, a) => sum + (a.aiFeedback?.technicalAccuracyScore || 0), 0);
    const overallTechnicalScore = Math.round(totalScore / (totalQuestionsAttempted || 1));
    const allQuestions = questionsPool.length > 0 ? questionsPool : this.state?.questions || [];
    const codingAnswers = answers.filter((a) => {
      const q = allQuestions.find((x) => x.id === a.questionId);
      return q?.questionType === "coding" || a.userAnswer.includes("Code Solution") || a.questionSkill.toLowerCase().includes("algorithm") || a.questionSkill.toLowerCase().includes("data structure");
    });
    const sqlAnswers = answers.filter((a) => {
      const q = allQuestions.find((x) => x.id === a.questionId);
      return q?.questionType === "sql" || a.questionTopic.toLowerCase().includes("database") || a.questionSkill.toLowerCase().includes("sql") || a.questionSkill.toLowerCase().includes("mysql") || a.questionSkill.toLowerCase().includes("postgres");
    });
    const dsaAnswers = answers.filter((a) => {
      return a.questionTopic.toLowerCase().includes("core computer science") || a.questionSkill.toLowerCase().includes("data structure") || a.questionSkill.toLowerCase().includes("algorithm");
    });
    const aimlAnswers = answers.filter((a) => {
      return a.questionTopic.toLowerCase().includes("machine learning") || a.questionSkill.toLowerCase().includes("scikit") || a.questionSkill.toLowerCase().includes("learning") || a.questionSkill.toLowerCase().includes("tensorflow") || a.questionSkill.toLowerCase().includes("pytorch");
    });
    const deptCoreAnswers = answers.filter((a) => {
      return a.questionSource === "curriculum-foundational" || !a.questionSource;
    });
    const resumeSkillAnswers = answers.filter((a) => {
      return a.questionSource === "resume-skill" || a.questionSource === "project" || a.questionSource === "internship" || a.questionSource === "certification";
    });
    const buildCategoryPerf = (name, key, catAnswers) => {
      if (catAnswers.length === 0) return void 0;
      const sum = catAnswers.reduce((acc, curr) => acc + (curr.aiFeedback?.technicalAccuracyScore || 0), 0);
      const avg = Math.round(sum / catAnswers.length);
      const skills = Array.from(new Set(catAnswers.map((a) => a.questionSkill)));
      let status = "Developing";
      if (avg >= 75) status = "Strong";
      else if (avg < 60) status = "Needs Practice";
      return {
        category: name,
        categoryKey: key,
        averageScore: avg,
        attemptedCount: catAnswers.length,
        status,
        skills
      };
    };
    const strongTopics = [];
    const weakTopics = [];
    const topicScores = /* @__PURE__ */ new Map();
    answers.forEach((a) => {
      const topic = a.questionTopic || a.questionSkill || "Engineering Topic";
      const curr = topicScores.get(topic) || { total: 0, count: 0 };
      curr.total += a.aiFeedback?.technicalAccuracyScore || 0;
      curr.count += 1;
      topicScores.set(topic, curr);
    });
    topicScores.forEach((val, topic) => {
      const avg = Math.round(val.total / val.count);
      if (avg >= 75) strongTopics.push(topic);
      else weakTopics.push(topic);
    });
    const recommendedNextPracticeTopics = weakTopics.length > 0 ? weakTopics.slice(0, 4) : ["System Architecture & Scalability", "Production Debugging & Concurrency", "Edge-Case Analysis", "Comprehensive Engineering Integration"];
    return {
      totalSetsCompleted,
      totalQuestionsAttempted,
      overallTechnicalScore,
      codingPerformance: buildCategoryPerf("Coding & Practical Implementation", "coding", codingAnswers),
      sqlPerformance: buildCategoryPerf("SQL & Database Systems", "sql", sqlAnswers),
      dsaPerformance: buildCategoryPerf("Data Structures & Algorithms", "dsa", dsaAnswers),
      aimlPerformance: buildCategoryPerf("Artificial Intelligence & Machine Learning", "aiml", aimlAnswers),
      departmentCorePerformance: buildCategoryPerf("Department Core Engineering", "departmentCore", deptCoreAnswers),
      resumeSkillPerformance: buildCategoryPerf("Resume Technologies & Projects", "resumeSkills", resumeSkillAnswers),
      strongTopics,
      weakTopics,
      recommendedNextPracticeTopics
    };
  }
  getSetSummary(setNumber) {
    const targetSet = setNumber || this.state.currentSetNumber;
    return this.state.completedSets.find((s) => s.setNumber === targetSet) || this.state.currentSetSummary || null;
  }
  getSkillDashboard() {
    return this.state.skillDashboard || this.computeSkillDashboard(this.state.answers, this.state.completedSets, this.state.questions);
  }
  getPersistenceKeyForCandidate(extractedNLP, resume) {
    const candName = resume?.fullName || "student";
    const dept = extractedNLP.effectiveDepartment || "engineering";
    return `careercurve_practice_${encodeURIComponent(candName)}_${encodeURIComponent(dept)}`;
  }
  persistState() {
    if (typeof window !== "undefined" && window.localStorage && this.state?.extractedNLP) {
      try {
        const key = this.getPersistenceKeyForCandidate(this.state.extractedNLP, this.config.resume);
        const payload = {
          questions: this.state.questions,
          currentIndex: this.state.currentIndex,
          answers: this.state.answers,
          difficulty: this.state.difficulty,
          currentSetNumber: this.state.currentSetNumber,
          completedSets: this.state.completedSets,
          questionHistory: this.state.questionHistory,
          isSetCompleted: this.state.isSetCompleted,
          currentSetSummary: this.state.currentSetSummary,
          timeSpentSeconds: this.state.timeSpentSeconds,
          topicMastery: this.state.topicMastery,
          codingSubmissions: this.state.codingSubmissions
        };
        window.localStorage.setItem(key, JSON.stringify(payload));
      } catch (err) {
        console.warn("Failed to persist technical practice state:", err);
      }
    }
  }
  clearPracticeHistory() {
    if (typeof window !== "undefined" && window.localStorage && this.state?.extractedNLP) {
      try {
        const key = this.getPersistenceKeyForCandidate(this.state.extractedNLP, this.config.resume);
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn("Failed to clear practice state:", err);
      }
    }
  }
  /**
   * Restarts the session cleanly without clearing original resume
   */
  restartSession() {
    this.clearPracticeHistory();
    return this.initSession(this.config);
  }
  /**
   * Compiles the completed session into standard InterviewSession format with full honest scorecard
   */
  completeSession() {
    const answers = this.state.answers;
    const totalQuestions = answers.length;
    const skippedQuestions = answers.filter((a) => a.isSkipped).length;
    const answeredQuestions = answers.filter((a) => !a.isSkipped).length;
    const correctAnswers = answers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 80
    ).length;
    const partiallyCorrectAnswers = answers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 40 && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 80
    ).length;
    const incorrectAnswers = answers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 40
    ).length;
    const totalTechScoreSum = answers.reduce(
      (acc, curr) => acc + (curr.aiFeedback?.technicalAccuracyScore || 0),
      0
    );
    const overallTechnicalScore = Math.round(totalTechScoreSum / (totalQuestions || 1));
    const totalCommScoreSum = answers.reduce(
      (acc, curr) => acc + (curr.isSkipped ? 0 : curr.aiFeedback?.communicationScore || 70),
      0
    );
    const avgComm = Math.round(totalCommScoreSum / (totalQuestions || 1));
    const diffMap = {
      Beginner: { attempted: 0, totalScore: 0 },
      Intermediate: { attempted: 0, totalScore: 0 },
      Advanced: { attempted: 0, totalScore: 0 }
    };
    answers.forEach((ans) => {
      const diff = ans.questionDifficulty || this.state.difficulty || "Intermediate";
      const key = diff in diffMap ? diff : "Intermediate";
      diffMap[key].attempted += 1;
      diffMap[key].totalScore += ans.aiFeedback?.technicalAccuracyScore || 0;
    });
    const difficultyWise = {
      beginner: {
        attempted: diffMap.Beginner.attempted,
        avgScore: diffMap.Beginner.attempted > 0 ? Math.round(diffMap.Beginner.totalScore / diffMap.Beginner.attempted) : 0
      },
      intermediate: {
        attempted: diffMap.Intermediate.attempted,
        avgScore: diffMap.Intermediate.attempted > 0 ? Math.round(diffMap.Intermediate.totalScore / diffMap.Intermediate.attempted) : 0
      },
      advanced: {
        attempted: diffMap.Advanced.attempted,
        avgScore: diffMap.Advanced.attempted > 0 ? Math.round(diffMap.Advanced.totalScore / diffMap.Advanced.attempted) : 0
      }
    };
    const skillGroups = /* @__PURE__ */ new Map();
    answers.forEach((ans) => {
      const skillName = ans.questionSkill || ans.questionTopic || "Core Technical";
      if (!skillGroups.has(skillName)) {
        skillGroups.set(skillName, []);
      }
      skillGroups.get(skillName).push(ans);
    });
    const skillPerformance = [];
    const weakSkillsRemediation = [];
    const strengths = [];
    const weaknesses = [];
    skillGroups.forEach((groupAns, skillName) => {
      const groupTotal = groupAns.reduce(
        (sum, a) => sum + (a.aiFeedback?.technicalAccuracyScore || 0),
        0
      );
      const score = Math.round(groupTotal / groupAns.length);
      const source = groupAns[0].questionSource || "resume-skill";
      let performance = "Weak";
      if (score >= 80) performance = "Strong";
      else if (score >= 60) performance = "Good";
      else if (score >= 40) performance = "Needs Improvement";
      else performance = "Weak";
      const weakMistake = groupAns.find((a) => a.aiFeedback?.evaluationMistakeExplanation)?.aiFeedback?.evaluationMistakeExplanation || (groupAns.some((a) => a.isSkipped) ? "Question was skipped without attempting." : void 0);
      const correctExplanation = groupAns.find((a) => a.learningExplanation)?.learningExplanation || groupAns[0].aiFeedback?.sampleIdealAnswer;
      const whatToStudyNext = groupAns.find((a) => a.aiFeedback?.studyRecommendation)?.aiFeedback?.studyRecommendation || `Review comprehensive fundamentals of ${skillName}.`;
      const recommendedPracticeQuestion = groupAns.find((a) => a.aiFeedback?.practiceQuestion)?.aiFeedback?.practiceQuestion || `Solve an end-to-end practical exercise covering ${skillName}.`;
      skillPerformance.push({
        skill: skillName,
        source,
        performance,
        score,
        questionsAttempted: groupAns.length,
        weakMistake,
        correctExplanation,
        whatToStudyNext,
        recommendedPracticeQuestion
      });
      if (performance === "Strong" || performance === "Good") {
        strengths.push(`${skillName}: ${performance} (${score}%) \u2014 demonstrated good technical grasp.`);
      } else {
        const reason = groupAns.some((a) => a.isSkipped) ? "skipped during interview" : `scored ${score}% with gaps in technical depth`;
        weaknesses.push(`${skillName}: ${performance} (${score}%) \u2014 ${reason}.`);
        weakSkillsRemediation.push({
          skill: skillName,
          whatWasAnsweredIncorrectly: weakMistake || "Concept incomplete or key technical points missing.",
          correctExplanation: correctExplanation || "Refer to the comprehensive technical documentation.",
          whatToStudyNext,
          recommendedPracticeQuestion
        });
      }
    });
    const recommendedImprovements = [];
    if (skippedQuestions > 0) {
      recommendedImprovements.push(`Attempt all questions: ${skippedQuestions} question(s) were skipped resulting in 0 marks.`);
    }
    if (weakSkillsRemediation.length > 0) {
      recommendedImprovements.push(`Prioritize study on identified weak areas: ${weakSkillsRemediation.map((r) => r.skill).join(", ")}.`);
    }
    if (difficultyWise.advanced.attempted > 0 && difficultyWise.advanced.avgScore < 70) {
      recommendedImprovements.push("Practice complex architectural and edge-case questions to improve Advanced tier scores.");
    }
    if (recommendedImprovements.length === 0) {
      recommendedImprovements.push("Maintain consistent coding practice and keep reviewing system design fundamentals.");
    }
    const technicalScorecardSummary = {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      partiallyCorrectAnswers,
      incorrectAnswers,
      skippedQuestions,
      overallTechnicalScore,
      difficultyWise,
      skillPerformance,
      strengths: strengths.length > 0 ? strengths : ["Basic technical foundation established."],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["No critical technical weaknesses detected."],
      recommendedImprovements,
      weakSkillsRemediation
    };
    const sessionObj = {
      id: `nlp_tech_session_${Date.now()}`,
      type: "technical",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      difficulty: this.state.difficulty,
      answers,
      technicalScore: overallTechnicalScore,
      hrScore: avgComm,
      aptitudeScore: 88,
      overallScore: Math.round((overallTechnicalScore + avgComm) / 2),
      readinessPercentage: Math.round(overallTechnicalScore * 0.5 + avgComm * 0.3 + 88 * 0.2),
      completed: true,
      technicalScorecardSummary
    };
    return sessionObj;
  }
  /**
   * Returns current session snapshot
   */
  getState() {
    return this.state;
  }
};

// scripts/testDepartmentContinuousPractice.ts
console.log("================================================================");
console.log("CAREERCURVE CONTINUOUS PRACTICE ENGINE \u2014 MANDATORY 6-DEPT TEST");
console.log("================================================================\n");
var TEST_RESUMES = [
  {
    deptName: "Computer Science & Engineering",
    resume: {
      fullName: "Aarav Sharma",
      email: "aarav.sharma@example.edu",
      phone: "+91 9876543210",
      jobTitle: "Software Engineering Student",
      github: "github.com/aaravsharma",
      linkedin: "linkedin.com/in/aaravsharma",
      summary: "Computer Science student skilled in Python, JavaScript, SQL, React, Flask, and Scikit-learn.",
      department: "Computer Science & Engineering",
      education: [{ institution: "IIT Bombay", degree: "B.Tech in Computer Science", graduationYear: "2025" }],
      skills: [
        { category: "Languages", skills: ["Python", "JavaScript", "SQL"] },
        { category: "Frameworks", skills: ["React", "Flask", "Scikit-learn", "Node.js"] },
        { category: "Databases", skills: ["MySQL", "PostgreSQL"] },
        { category: "Core", skills: ["Data Structures", "Operating Systems", "Computer Networks"] }
      ],
      rawSkillsList: ["Python", "JavaScript", "SQL", "React", "Flask", "Scikit-learn", "MySQL", "Data Structures"],
      projects: [
        { title: "AI Placement Classifier", description: "Flask web app with React UI and Scikit-learn", technologies: ["Flask", "React", "Scikit-learn", "Python"] },
        { title: "E-Commerce Database Engine", description: "Relational data store with MySQL queries", technologies: ["MySQL", "SQL", "JavaScript"] }
      ],
      experience: [],
      certifications: [{ name: "Scikit-Learn Machine Learning Specialist", issuer: "Coursera" }]
    }
  },
  {
    deptName: "Electronics & Communication Engineering",
    resume: {
      fullName: "Priya Patel",
      email: "priya.patel@example.edu",
      phone: "+91 9876543211",
      jobTitle: "Embedded Systems & Hardware Engineer",
      github: "github.com/priyapatel",
      linkedin: "linkedin.com/in/priyapatel",
      summary: "ECE graduate with expertise in PCB design, embedded C, microcontrollers, and VLSI.",
      department: "Electronics & Communication Engineering",
      education: [{ institution: "NIT Trichy", degree: "B.Tech in ECE", graduationYear: "2025" }],
      skills: [
        { category: "Hardware", skills: ["PCB Design", "KiCAD", "Circuit Design", "Microcontrollers"] },
        { category: "Embedded", skills: ["Embedded C", "ARM Cortex", "Arduino", "ESP32"] },
        { category: "Core", skills: ["Digital Electronics", "VLSI Design", "Signals & Systems"] }
      ],
      rawSkillsList: ["PCB Design", "Embedded C", "Microcontrollers", "KiCAD", "ARM Cortex", "Digital Electronics", "VLSI Design"],
      projects: [
        { title: "4-Layer Sensor Hub PCB", description: "Designed high-speed STM32 acquisition board with KiCAD", technologies: ["KiCAD", "PCB Design", "Embedded C"] }
      ],
      experience: [{ company: "Bosch Automotive", role: "Embedded Firmware Intern", isInternship: true }],
      certifications: [{ name: "High-Speed PCB Layout & Signal Integrity", issuer: "IPC" }]
    }
  },
  {
    deptName: "Electrical & Electronics Engineering",
    resume: {
      fullName: "Rahul Verma",
      email: "rahul.verma@example.edu",
      phone: "+91 9876543212",
      jobTitle: "Electrical Systems Engineer",
      github: "github.com/rahulverma",
      linkedin: "linkedin.com/in/rahulverma",
      summary: "EEE student specializing in electrical machines, power systems, control systems, and power electronics.",
      department: "Electrical & Electronics Engineering",
      education: [{ institution: "BITS Pilani", degree: "B.E. in EEE", graduationYear: "2025" }],
      skills: [
        { category: "Machines & Power", skills: ["Electrical Machines", "Power Systems", "Transformers"] },
        { category: "Power Electronics", skills: ["Buck Converter", "Inverters", "Power Electronics"] },
        { category: "Control", skills: ["Control Systems", "MATLAB Simulink", "PID Controller"] }
      ],
      rawSkillsList: ["Electrical Machines", "Power Systems", "Transformers", "Control Systems", "Power Electronics", "MATLAB Simulink"],
      projects: [
        { title: "Solar Inverter with MPPT", description: "Buck-Boost converter and grid inverter in MATLAB", technologies: ["Power Electronics", "MATLAB Simulink", "Control Systems"] }
      ],
      experience: [{ company: "Tata Power", role: "Substation Engineering Intern", isInternship: true }],
      certifications: [{ name: "Grid Power Systems & Switchgear Protection", issuer: "IEEE" }]
    }
  },
  {
    deptName: "Mechanical Engineering",
    resume: {
      fullName: "Vikram Joshi",
      email: "vikram.joshi@example.edu",
      phone: "+91 9876543213",
      jobTitle: "Mechanical Design Engineer",
      github: "github.com/vikramjoshi",
      linkedin: "linkedin.com/in/vikramjoshi",
      summary: "Mechanical student focused on CAD modeling, thermodynamics, fluid mechanics, and manufacturing.",
      department: "Mechanical Engineering",
      education: [{ institution: "COEP Pune", degree: "B.Tech in Mechanical", graduationYear: "2025" }],
      skills: [
        { category: "Design & CAD", skills: ["SolidWorks", "CAD", "AutoCAD Mechanical", "Machine Design"] },
        { category: "Thermal", skills: ["Thermodynamics", "Fluid Mechanics", "Heat Transfer"] },
        { category: "Production", skills: ["Manufacturing Processes", "CNC Machining"] }
      ],
      rawSkillsList: ["SolidWorks", "CAD", "Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing Processes", "CNC Machining"],
      projects: [
        { title: "Electric Vehicle Gearbox Design", description: "CAD modeling and FEA fatigue stress analysis in SolidWorks", technologies: ["SolidWorks", "CAD", "Machine Design"] }
      ],
      experience: [{ company: "Mahindra & Mahindra", role: "Thermal Systems Intern", isInternship: true }],
      certifications: [{ name: "CSWA SolidWorks Associate", issuer: "Dassault Systemes" }]
    }
  },
  {
    deptName: "Civil Engineering",
    resume: {
      fullName: "Ananya Deshmukh",
      email: "ananya.deshmukh@example.edu",
      phone: "+91 9876543214",
      jobTitle: "Structural & Site Engineer",
      github: "github.com/ananyadeshmukh",
      linkedin: "linkedin.com/in/ananyadeshmukh",
      summary: "Civil Engineering candidate skilled in structural engineering, RCC, surveying, and geotechnical mechanics.",
      department: "Civil Engineering",
      education: [{ institution: "IIT Madras", degree: "B.Tech in Civil Engineering", graduationYear: "2025" }],
      skills: [
        { category: "Structures", skills: ["Structural Engineering", "RCC", "STAAD.Pro", "AutoCAD Civil"] },
        { category: "Geotech & Survey", skills: ["Geotechnical Engineering", "Surveying", "Total Station"] },
        { category: "Materials", skills: ["Concrete Technology", "Construction Materials"] }
      ],
      rawSkillsList: ["Structural Engineering", "RCC", "Surveying", "Geotechnical Engineering", "Concrete Technology", "STAAD.Pro"],
      projects: [
        { title: "G+5 Multi-Storey RCC Design", description: "Limit state structural design and load combination analysis", technologies: ["STAAD.Pro", "Structural Engineering", "RCC"] }
      ],
      experience: [{ company: "Larsen & Toubro", role: "Structural Engineering Intern", isInternship: true }],
      certifications: [{ name: "Advanced RCC Design & Limit State Method", issuer: "Bentley Institute" }]
    }
  },
  {
    deptName: "Automobile Engineering",
    resume: {
      fullName: "Karan Mehra",
      email: "karan.mehra@example.edu",
      phone: "+91 9876543215",
      jobTitle: "Automotive & EV Powertrain Engineer",
      github: "github.com/karanmehra",
      linkedin: "linkedin.com/in/karanmehra",
      summary: "Automobile engineering candidate specializing in IC engines, vehicle dynamics, and EV technologies.",
      department: "Automobile Engineering",
      education: [{ institution: "PSG College of Technology", degree: "B.E. in Automobile Engineering", graduationYear: "2025" }],
      skills: [
        { category: "Powertrain", skills: ["Internal Combustion Engines", "Electric Vehicles", "BMS"] },
        { category: "Chassis", skills: ["Vehicle Dynamics", "Braking Systems", "Transmission Systems"] },
        { category: "Diagnostics", skills: ["Automotive Diagnostics", "CAN Bus"] }
      ],
      rawSkillsList: ["Internal Combustion Engines", "Electric Vehicles", "Vehicle Dynamics", "Braking Systems", "Transmission Systems", "CAN Bus"],
      projects: [
        { title: "Formula Student EV Powertrain", description: "Li-ion battery pack BMS and regenerative braking control", technologies: ["Electric Vehicles", "Braking Systems", "CAN Bus"] }
      ],
      experience: [{ company: "Tata Motors", role: "EV Powertrain Intern", isInternship: true }],
      certifications: [{ name: "Automotive EV Battery Management Systems", issuer: "SAE India" }]
    }
  }
];
var totalPassed = 0;
var totalFailed = 0;
function assert(condition, msg) {
  if (condition) {
    console.log(`  \u2713 PASS: ${msg}`);
    totalPassed++;
  } else {
    console.error(`  \u2717 FAIL: ${msg}`);
    totalFailed++;
  }
}
for (let i = 0; i < TEST_RESUMES.length; i++) {
  const { deptName, resume } = TEST_RESUMES[i];
  console.log(`
----------------------------------------------------------------`);
  console.log(`TEST PROFILE ${i + 1}/6: [${deptName}] - ${resume.fullName}`);
  console.log(`----------------------------------------------------------------`);
  const engine = new FrontendNLPTechnicalInterviewEngine({
    resume,
    difficulty: "Intermediate",
    questionCount: 4
  });
  const state1 = engine.getState();
  assert(state1.questions.length === 4, `Set 1 generated exactly 4 questions (got ${state1.questions.length})`);
  assert(state1.currentSetNumber === 1, `Current set number is 1`);
  const set1Ids = new Set(state1.questions.map((q) => q.id));
  assert(set1Ids.size === 4, `All 4 questions in Set 1 have unique IDs (${Array.from(set1Ids).join(", ")})`);
  const set1Skills = state1.questions.map((q) => q.skill);
  console.log(`    Skills in Set 1: [${set1Skills.join(" | ")}]`);
  assert(set1Skills.length === 4, `Set 1 covers 4 distinct skills`);
  const getGoodAnswer = (q) => {
    if (!q) return "Comprehensive explanation of system architecture and engineering principles.";
    if (q.referenceAnswer) return q.referenceAnswer;
    if (q.idealAnswerPoints && q.idealAnswerPoints.length > 0) return q.idealAnswerPoints.join(". ");
    return `${q.skill} implementation adhering to standard engineering benchmarks and constraints.`;
  };
  const q1 = engine.getState().currentQuestion;
  engine.submitAnswer(getGoodAnswer(q1), 45);
  const adv1 = engine.advanceNext();
  assert(adv1.hasNext && adv1.nextQuestion !== null, `Advanced from Q1 to Q2`);
  const q2 = engine.getState().currentQuestion;
  engine.submitAnswer(getGoodAnswer(q2), 40);
  const adv2 = engine.advanceNext();
  assert(adv2.hasNext && adv2.nextQuestion !== null, `Advanced from Q2 to Q3`);
  const skipResult = engine.skipQuestion(15);
  assert(skipResult.evaluation.technicalAccuracyScore === 0, `Skipped Q3 awarded 0 marks`);
  assert(typeof skipResult.learningData.correctAnswer === "string" && skipResult.learningData.correctAnswer.length > 10, `Q3 has reference correct answer`);
  const adv3 = engine.advanceNext();
  assert(adv3.hasNext && adv3.nextQuestion !== null, `Advanced from Q3 to Q4`);
  const q4 = engine.getState().currentQuestion;
  engine.submitAnswer(getGoodAnswer(q4), 35);
  const adv4 = engine.advanceNext();
  assert(!adv4.hasNext && adv4.isSetCompleted === true, `Set 1 completed after 4th question (isSetCompleted: true)`);
  const set1Summary = engine.getSetSummary(1);
  assert(set1Summary !== null, `Set 1 summary generated`);
  assert(set1Summary?.questionsAttempted === 4, `Set 1 attempted: 4 questions`);
  assert(set1Summary?.skippedQuestions === 1, `Set 1 recorded exactly 1 skipped question`);
  assert((set1Summary?.correctAnswers || 0) >= 2, `Set 1 recorded correct answers (got ${set1Summary?.correctAnswers})`);
  console.log(`    Set 1 Score: ${set1Summary?.setScore}%`);
  const { questions: set2Questions, setNumber: newSetNum, currentQuestion: q5 } = engine.startNextSet();
  assert(newSetNum === 2, `Engine started Set 2 (newSetNum === 2)`);
  assert(set2Questions.length === 8, `Total questions expanded to 8 for Set 2`);
  assert(q5 !== null && engine.getState().currentIndex === 4, `Index correctly moved to Question 5 (index 4)`);
  const set2Only = set2Questions.slice(4, 8);
  assert(set2Only.length === 4, `Set 2 contains exactly 4 questions`);
  const historyEntries = engine.getState().questionHistory;
  assert(historyEntries.length === 4, `History tracks all 4 questions from Set 1`);
  let duplicateFoundInSet2 = false;
  for (const q of set2Only) {
    if (set1Ids.has(q.id)) {
      duplicateFoundInSet2 = true;
      console.error(`    DUPLICATE FOUND: Question ${q.id} in Set 2 was already in Set 1!`);
    }
  }
  assert(!duplicateFoundInSet2, `Zero questions from Set 1 were repeated in Set 2`);
  for (let sIdx = 0; sIdx < 4; sIdx++) {
    const curQ = engine.getState().currentQuestion;
    engine.submitAnswer(getGoodAnswer(curQ), 30);
    engine.advanceNext();
  }
  const { questions: set3Questions, setNumber: set3Num } = engine.startNextSet();
  assert(set3Num === 3, `Engine started Set 3`);
  assert(set3Questions.length === 12, `Total questions expanded to 12 for Set 3`);
  const set3Only = set3Questions.slice(8, 12);
  const set1And2Ids = new Set(set3Questions.slice(0, 8).map((q) => q.id));
  let duplicateFoundInSet3 = false;
  for (const q of set3Only) {
    if (set1And2Ids.has(q.id)) {
      duplicateFoundInSet3 = true;
      console.error(`    DUPLICATE FOUND: Question ${q.id} in Set 3 was in Set 1 or 2!`);
    }
  }
  assert(!duplicateFoundInSet3, `Zero questions from Set 1 or 2 were repeated in Set 3`);
  const dashboard = engine.getSkillDashboard();
  assert(dashboard.totalSetsCompleted >= 2, `Dashboard reports >= 2 sets completed (got ${dashboard.totalSetsCompleted})`);
  assert(dashboard.totalQuestionsAttempted === 8, `Dashboard reports 8 questions attempted`);
  assert(typeof dashboard.overallTechnicalScore === "number" && dashboard.overallTechnicalScore > 0, `Dashboard overall technical score is computed (${dashboard.overallTechnicalScore}%)`);
  assert(dashboard.strongTopics.length > 0 || dashboard.weakTopics.length > 0, `Strong/Weak topics classified`);
  assert(dashboard.recommendedNextPracticeTopics.length > 0, `Recommended next topics populated`);
  const finalSession = engine.completeSession();
  assert(finalSession.answers.length === 8, `Final scorecard contains all 8 answers`);
  assert(finalSession.technicalScorecardSummary?.skippedQuestions === 1, `Scorecard accurately counts 1 skipped question with 0 marks`);
  assert(finalSession.technicalScorecardSummary?.answeredQuestions === 7, `Scorecard accurately counts 7 answered questions`);
  console.log(`    Cumulative Technical Score: ${finalSession.technicalScore}%`);
}
console.log("\n================================================================");
console.log(`ALL 6 DEPARTMENT PROFILES TESTED: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("================================================================\n");
if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
