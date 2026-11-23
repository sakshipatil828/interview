import { ParsedResume } from '../types';
import { EngineeringDepartment, ExtractedResumeNLP, SkillTopicMapping } from './types';
import { preprocessDocument, normalizeText } from './textPreprocessor';

/**
 * Canonical Technical Skill Taxonomy across all supported engineering branches
 */
export const CANONICAL_SKILL_TAXONOMY: SkillTopicMapping[] = [
  // ==========================================
  // COMPUTER SCIENCE & ENGINEERING
  // ==========================================
  {
    skill: 'Python',
    topic: 'Programming Languages',
    subtopic: 'Python Core & Concurrency',
    department: 'Computer Science & Engineering',
    aliases: ['python', 'py', 'python3', 'cpython']
  },
  {
    skill: 'Flask',
    topic: 'Backend Web & API Architecture',
    subtopic: 'Microframeworks & Routing',
    department: 'Computer Science & Engineering',
    aliases: ['flask', 'flask framework', 'flask api', 'flask-restful']
  },
  {
    skill: 'REST APIs',
    topic: 'Backend Web & API Architecture',
    subtopic: 'RESTful Protocols & Web Services',
    department: 'Computer Science & Engineering',
    aliases: ['rest api', 'rest apis', 'restful', 'restful api', 'rest', 'api design']
  },
  {
    skill: 'MySQL',
    topic: 'Database Systems',
    subtopic: 'Relational SQL & Indexing',
    department: 'Computer Science & Engineering',
    aliases: ['mysql', 'sql', 'rdbms', 'mariadb']
  },
  {
    skill: 'PostgreSQL',
    topic: 'Database Systems',
    subtopic: 'Advanced Relational Modeling',
    department: 'Computer Science & Engineering',
    aliases: ['postgres', 'postgresql', 'psql']
  },
  {
    skill: 'React',
    topic: 'Frontend & Web Engineering',
    subtopic: 'Component Architecture & State',
    department: 'Computer Science & Engineering',
    aliases: ['react', 'react.js', 'reactjs', 'react native']
  },
  {
    skill: 'Node.js',
    topic: 'Backend Web & API Architecture',
    subtopic: 'Asynchronous Event Loop',
    department: 'Computer Science & Engineering',
    aliases: ['node', 'node.js', 'nodejs', 'express', 'express.js']
  },
  {
    skill: 'Data Structures',
    topic: 'Core Computer Science',
    subtopic: 'Trees, Graphs & Hash Tables',
    department: 'Computer Science & Engineering',
    aliases: ['data structures', 'dsa', 'algorithms', 'trees', 'graphs', 'hashmaps']
  },
  {
    skill: 'Docker',
    topic: 'DevOps & Cloud Systems',
    subtopic: 'Containerization & Isolation',
    department: 'Computer Science & Engineering',
    aliases: ['docker', 'containers', 'dockerfile', 'docker compose']
  },
  {
    skill: 'Git',
    topic: 'Software Engineering Practices',
    subtopic: 'Version Control & Branching',
    department: 'Computer Science & Engineering',
    aliases: ['git', 'github', 'gitlab', 'version control']
  },
  {
    skill: 'System Design',
    topic: 'Distributed Systems',
    subtopic: 'Scalability & Load Balancing',
    department: 'Computer Science & Engineering',
    aliases: ['system design', 'distributed systems', 'microservices', 'caching']
  },
  {
    skill: 'Java',
    topic: 'Programming Languages',
    subtopic: 'OOP & JVM Ecosystem',
    department: 'Computer Science & Engineering',
    aliases: ['java', 'spring', 'spring boot', 'jvm']
  },
  {
    skill: 'C++',
    topic: 'Programming Languages',
    subtopic: 'Memory Management & STL',
    department: 'Computer Science & Engineering',
    aliases: ['c++', 'cpp', 'cplusplus', 'stl']
  },
  {
    skill: 'JavaScript',
    topic: 'Programming Languages',
    subtopic: 'Core JavaScript & Asynchronous Event Loop',
    department: 'Computer Science & Engineering',
    aliases: ['javascript', 'js', 'es6', 'ecmascript']
  },
  {
    skill: 'TypeScript',
    topic: 'Programming Languages',
    subtopic: 'Static Typing & Interfaces',
    department: 'Computer Science & Engineering',
    aliases: ['typescript', 'ts']
  },
  {
    skill: 'C',
    topic: 'Programming Languages',
    subtopic: 'Pointers & System Programming',
    department: 'Computer Science & Engineering',
    aliases: ['c language', 'ansi c', 'c programming']
  },
  {
    skill: 'C#',
    topic: 'Programming Languages',
    subtopic: '.NET & Enterprise Applications',
    department: 'Computer Science & Engineering',
    aliases: ['c#', 'csharp', '.net', 'dotnet']
  },
  {
    skill: 'PHP',
    topic: 'Programming Languages',
    subtopic: 'Server-Side Web Scripting',
    department: 'Computer Science & Engineering',
    aliases: ['php', 'php8', 'lamp']
  },
  {
    skill: 'Kotlin',
    topic: 'Programming Languages',
    subtopic: 'Modern JVM & Android Development',
    department: 'Computer Science & Engineering',
    aliases: ['kotlin', 'android kotlin']
  },
  {
    skill: 'SQL',
    topic: 'Database Systems',
    subtopic: 'Query Formulation & Joins',
    department: 'Computer Science & Engineering',
    aliases: ['sql', 'structured query language', 'rdbms', 'relational database']
  },
  {
    skill: 'SQLite',
    topic: 'Database Systems',
    subtopic: 'Embedded & File-based Relational Storage',
    department: 'Computer Science & Engineering',
    aliases: ['sqlite', 'sqlite3']
  },
  {
    skill: 'MongoDB',
    topic: 'Database Systems',
    subtopic: 'Document NoSQL & Aggregations',
    department: 'Computer Science & Engineering',
    aliases: ['mongodb', 'mongo', 'nosql', 'mongoose']
  },
  {
    skill: 'Supabase',
    topic: 'Database Systems',
    subtopic: 'Postgres Backend-as-a-Service',
    department: 'Computer Science & Engineering',
    aliases: ['supabase', 'supabase auth', 'supabase db']
  },
  {
    skill: 'Oracle',
    topic: 'Database Systems',
    subtopic: 'Enterprise RDBMS & PL/SQL',
    department: 'Computer Science & Engineering',
    aliases: ['oracle', 'oracle sql', 'pl/sql', 'plsql']
  },
  {
    skill: 'Express',
    topic: 'Backend Web & API Architecture',
    subtopic: 'Middleware & Node Routing',
    department: 'Computer Science & Engineering',
    aliases: ['express', 'express.js', 'expressjs']
  },
  {
    skill: 'Django',
    topic: 'Backend Web & API Architecture',
    subtopic: 'Full-Stack MVC & ORM',
    department: 'Computer Science & Engineering',
    aliases: ['django', 'django rest framework', 'drf']
  },
  {
    skill: 'Spring Boot',
    topic: 'Backend Web & API Architecture',
    subtopic: 'Dependency Injection & Microservices',
    department: 'Computer Science & Engineering',
    aliases: ['spring boot', 'spring', 'springboot']
  },
  {
    skill: 'TensorFlow',
    topic: 'Machine Learning & AI',
    subtopic: 'Deep Learning & Neural Tensors',
    department: 'Computer Science & Engineering',
    aliases: ['tensorflow', 'tf', 'keras']
  },
  {
    skill: 'Scikit-learn',
    topic: 'Machine Learning & AI',
    subtopic: 'Supervised & Unsupervised Modeling',
    department: 'Computer Science & Engineering',
    aliases: ['scikit-learn', 'sklearn']
  },
  {
    skill: 'NumPy',
    topic: 'Scientific Computing',
    subtopic: 'Vectorized Arrays & Matrix Math',
    department: 'Computer Science & Engineering',
    aliases: ['numpy']
  },
  {
    skill: 'Pandas',
    topic: 'Data Analysis & Manipulation',
    subtopic: 'DataFrames & Series Cleaning',
    department: 'Computer Science & Engineering',
    aliases: ['pandas', 'dataframe']
  },
  {
    skill: 'GitHub',
    topic: 'Software Engineering Practices',
    subtopic: 'Collaboration & Pull Requests',
    department: 'Computer Science & Engineering',
    aliases: ['github', 'github actions']
  },
  {
    skill: 'VS Code',
    topic: 'Development Tools & Platforms',
    subtopic: 'IDE, Extensions & Debugging',
    department: 'Computer Science & Engineering',
    aliases: ['vs code', 'vscode', 'visual studio code']
  },
  {
    skill: 'Postman',
    topic: 'Development Tools & Platforms',
    subtopic: 'API Testing & Documentation',
    department: 'Computer Science & Engineering',
    aliases: ['postman', 'api testing']
  },
  {
    skill: 'AWS',
    topic: 'DevOps & Cloud Systems',
    subtopic: 'Cloud Infrastructure & Serverless',
    department: 'Computer Science & Engineering',
    aliases: ['aws', 'amazon web services', 's3', 'ec2', 'lambda']
  },

  // ==========================================
  // MECHANICAL ENGINEERING
  // ==========================================
  {
    skill: 'AutoCAD Mechanical',
    topic: 'Engineering Drafting & Modeling',
    subtopic: '2D/3D Geometric Modeling',
    department: 'Mechanical Engineering',
    aliases: ['autocad', 'autocad mechanical', 'cad drafting', 'engineering drawing']
  },
  {
    skill: 'SolidWorks',
    topic: 'Parametric CAD & Machine Design',
    subtopic: 'Part Modeling & Assemblies',
    department: 'Mechanical Engineering',
    aliases: ['solidworks', 'solid works', 'cswp', 'part modeling', 'assembly design']
  },
  {
    skill: 'ANSYS FEA',
    topic: 'Finite Element Analysis',
    subtopic: 'Structural Stress & Meshing',
    department: 'Mechanical Engineering',
    aliases: ['ansys', 'fea', 'finite element analysis', 'ansys mechanical', 'mesh convergence']
  },
  {
    skill: 'Thermodynamics',
    topic: 'Thermal & Energy Systems',
    subtopic: 'Thermodynamic Cycles & Efficiency',
    department: 'Mechanical Engineering',
    aliases: ['thermodynamics', 'thermal engineering', 'otto cycle', 'diesel cycle', 'brayton']
  },
  {
    skill: 'Heat Transfer',
    topic: 'Thermal & Energy Systems',
    subtopic: 'Conduction, Convection & Exchangers',
    department: 'Mechanical Engineering',
    aliases: ['heat transfer', 'heat exchanger', 'conduction', 'convection', 'radiation', 'lmtd']
  },
  {
    skill: 'Fluid Mechanics',
    topic: 'Fluid Systems & Hydraulics',
    subtopic: 'Piping Losses & Turbomachinery',
    department: 'Mechanical Engineering',
    aliases: ['fluid mechanics', 'hydraulics', 'pneumatics', 'pumps', 'pressure drop', 'bernoulli']
  },
  {
    skill: 'GD&T',
    topic: 'Manufacturing & Tolerancing',
    subtopic: 'Geometric Dimensioning & Limits',
    department: 'Mechanical Engineering',
    aliases: ['gd&t', 'gdt', 'tolerancing', 'concentricity', 'runout', 'limits and fits']
  },
  {
    skill: 'CNC Machining',
    topic: 'Manufacturing Processes',
    subtopic: 'Toolpath Planning & G-Codes',
    department: 'Mechanical Engineering',
    aliases: ['cnc', 'cnc machining', 'machining', 'lathe', 'milling', 'g-code']
  },
  {
    skill: 'CATIA',
    topic: 'Surface Modeling & Aerospace CAD',
    subtopic: 'Surfacing & Sheet Metal',
    department: 'Mechanical Engineering',
    aliases: ['catia', 'catia v5', 'surfacing']
  },

  // ==========================================
  // CIVIL ENGINEERING
  // ==========================================
  {
    skill: 'AutoCAD Civil',
    topic: 'Civil Drafting & Floor Plans',
    subtopic: 'Architectural & Structural Drafting',
    department: 'Civil Engineering',
    aliases: ['autocad civil', 'autocad', 'civil drafting', 'building drawing']
  },
  {
    skill: 'ETABS',
    topic: 'Structural Analysis & Design',
    subtopic: 'Multi-Story Frame & Seismic Analysis',
    department: 'Civil Engineering',
    aliases: ['etabs', 'etabs v20', 'frame analysis', 'seismic analysis', 'lateral load']
  },
  {
    skill: 'STAAD.Pro',
    topic: 'Structural Analysis & Design',
    subtopic: 'Truss & Space Frame Analysis',
    department: 'Civil Engineering',
    aliases: ['staad', 'staad.pro', 'staad pro', 'staadpro', 'space frame']
  },
  {
    skill: 'Concrete Design',
    topic: 'Reinforced Concrete Design',
    subtopic: 'Limit State Method & IS 456',
    department: 'Civil Engineering',
    aliases: ['concrete design', 'reinforced concrete', 'rcc', 'is 456', 'limit state', 'working stress']
  },
  {
    skill: 'Soil Mechanics',
    topic: 'Geotechnical Engineering',
    subtopic: 'Bearing Capacity & Foundation Sizing',
    department: 'Civil Engineering',
    aliases: ['soil mechanics', 'geotechnical', 'bearing capacity', 'foundation', 'shallow foundation']
  },
  {
    skill: 'Surveying',
    topic: 'Geomatics & Site Surveying',
    subtopic: 'Total Station & Leveling',
    department: 'Civil Engineering',
    aliases: ['surveying', 'total station', 'theodolite', 'leveling', 'traverse']
  },
  {
    skill: 'REVIT Structure',
    topic: 'Building Information Modeling (BIM)',
    subtopic: 'Structural BIM & Rebar Detailing',
    department: 'Civil Engineering',
    aliases: ['revit', 'revit structure', 'bim', 'building information modeling']
  },
  {
    skill: 'Project Scheduling',
    topic: 'Construction Management',
    subtopic: 'CPM, PERT & Site Supervision',
    department: 'Civil Engineering',
    aliases: ['ms project', 'primavera', 'cpm', 'pert', 'project scheduling', 'costing']
  },

  // ==========================================
  // ELECTRONICS & COMMUNICATION ENGINEERING
  // ==========================================
  {
    skill: 'Verilog HDL',
    topic: 'Digital System Design & VLSI',
    subtopic: 'RTL Modeling & FSM Synthesis',
    department: 'Electronics & Communication Engineering',
    aliases: ['verilog', 'verilog hdl', 'vhdl', 'fpga', 'rtl', 'xilinx', 'vivado']
  },
  {
    skill: 'Embedded C',
    topic: 'Embedded Systems & Firmware',
    subtopic: 'Bare-Metal & Register Configuration',
    department: 'Electronics & Communication Engineering',
    aliases: ['embedded c', 'embedded systems', 'bare metal', 'firmware', 'c']
  },
  {
    skill: 'ARM Cortex',
    topic: 'Microcontrollers & Architecture',
    subtopic: 'ARM Cortex-M & Interrupt Handling',
    department: 'Electronics & Communication Engineering',
    aliases: ['arm', 'arm cortex', 'cortex-m', 'stm32', 'microcontroller', 'mcu']
  },
  {
    skill: 'KiCAD',
    topic: 'PCB Design & Hardware Layout',
    subtopic: 'Schematic Capture & Trace Routing',
    department: 'Electronics & Communication Engineering',
    aliases: ['kicad', 'pcb', 'pcb layout', 'altium', 'eagle', 'schematic']
  },
  {
    skill: 'Communication Protocols',
    topic: 'Bus & IoT Protocols',
    subtopic: 'I2C, SPI & UART Timing',
    department: 'Electronics & Communication Engineering',
    aliases: ['i2c', 'spi', 'uart', 'can bus', 'lora', 'ble', 'iot protocols']
  },
  {
    skill: 'Digital Signal Processing',
    topic: 'Signal Processing & Systems',
    subtopic: 'Sampling, FFT & Filter Design',
    department: 'Electronics & Communication Engineering',
    aliases: ['dsp', 'digital signal processing', 'fft', 'fir', 'iir', 'filters', 'matlab']
  },
  {
    skill: 'VLSI Design',
    topic: 'Semiconductor & VLSI',
    subtopic: 'CMOS Inverters & Setup/Hold Timing',
    department: 'Electronics & Communication Engineering',
    aliases: ['vlsi', 'cmos', 'setup time', 'hold time', 'timing closure', 'asic']
  },

  // ==========================================
  // INFORMATION TECHNOLOGY
  // ==========================================
  {
    skill: 'Computer Networks',
    topic: 'Networking & Protocols',
    subtopic: 'TCP/IP, OSI Model & Routing',
    department: 'Information Technology',
    aliases: ['computer networks', 'networking', 'tcp/ip', 'dns', 'dhcp', 'subnetting', 'http/https']
  },
  {
    skill: 'Cloud Architecture',
    topic: 'Cloud Computing & Infrastructure',
    subtopic: 'AWS, Azure & Virtualization',
    department: 'Information Technology',
    aliases: ['cloud', 'aws', 'azure', 'gcp', 'cloud computing', 's3', 'ec2', 'lambda']
  },
  {
    skill: 'Cybersecurity',
    topic: 'Information & Network Security',
    subtopic: 'Cryptography, Firewalls & OWASP',
    department: 'Information Technology',
    aliases: ['cybersecurity', 'security', 'cryptography', 'owasp', 'penetration testing', 'firewall']
  },
  {
    skill: 'Linux Administration',
    topic: 'Operating Systems & Shell',
    subtopic: 'Bash Scripting & Process Management',
    department: 'Information Technology',
    aliases: ['linux', 'unix', 'bash', 'shell scripting', 'ubuntu', 'sysadmin']
  },
  {
    skill: 'DevOps CI/CD',
    topic: 'DevOps & Automation',
    subtopic: 'Pipelines, Jenkins & GitHub Actions',
    department: 'Information Technology',
    aliases: ['devops', 'ci/cd', 'jenkins', 'github actions', 'kubernetes', 'terraform']
  },

  // ==========================================
  // ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // ==========================================
  {
    skill: 'Electrical Machines',
    topic: 'Electric Machines & Drives',
    subtopic: 'Transformers, Induction Motors & Alternators',
    department: 'Electrical & Electronics Engineering',
    aliases: ['electrical machines', 'transformers', 'induction motor', 'synchronous motor', 'dc motor']
  },
  {
    skill: 'Power Systems',
    topic: 'Power Generation & Transmission',
    subtopic: 'Load Flow, Fault Analysis & Grid Stability',
    department: 'Electrical & Electronics Engineering',
    aliases: ['power systems', 'load flow', 'fault analysis', 'transmission lines', 'substation', 'grid']
  },
  {
    skill: 'Power Electronics',
    topic: 'Converters & Inverters',
    subtopic: 'Buck-Boost, Rectifiers & IGBT Switching',
    department: 'Electrical & Electronics Engineering',
    aliases: ['power electronics', 'inverter', 'converter', 'rectifier', 'igbt', 'mosfet', 'chopper']
  },
  {
    skill: 'Control Systems',
    topic: 'Linear Feedback & Stability',
    subtopic: 'Bode Plots, PID Controllers & Root Locus',
    department: 'Electrical & Electronics Engineering',
    aliases: ['control systems', 'pid', 'bode plot', 'nyquist', 'root locus', 'transfer function']
  },
  {
    skill: 'MATLAB Simulink',
    topic: 'System Modeling & Simulation',
    subtopic: 'Electrical Simulation & State-Space',
    department: 'Electrical & Electronics Engineering',
    aliases: ['matlab', 'simulink', 'system modeling', 'state space']
  },

  // ==========================================
  // AUTOMOBILE ENGINEERING
  // ==========================================
  {
    skill: 'IC Engines',
    topic: 'Internal Combustion Engines',
    subtopic: '4-Stroke Cycles, Valve Timing & Combustion',
    department: 'Automobile Engineering',
    aliases: ['ic engine', 'internal combustion', '4-stroke', 'crankshaft', 'piston', 'combustion chamber']
  },
  {
    skill: 'Transmission Systems',
    topic: 'Automotive Drivetrain',
    subtopic: 'Gearbox, Differential & Clutches',
    department: 'Automobile Engineering',
    aliases: ['transmission', 'gearbox', 'differential', 'clutch', 'torque converter', 'cvt']
  },
  {
    skill: 'Braking & ABS',
    topic: 'Chassis & Active Safety',
    subtopic: 'Hydraulic Disc/Drum & Anti-Lock Braking',
    department: 'Automobile Engineering',
    aliases: ['braking', 'abs', 'disc brake', 'anti-lock braking', 'master cylinder', 'hydraulic brake']
  },
  {
    skill: 'Vehicle Dynamics',
    topic: 'Suspension, Steering & Handling',
    subtopic: 'Suspension Geometry, Steering & Stability',
    department: 'Automobile Engineering',
    aliases: ['vehicle dynamics', 'suspension', 'steering', 'camber', 'caster', 'aerodynamics']
  },
  {
    skill: 'EV Powertrain',
    topic: 'Electric Vehicles & Energy Storage',
    subtopic: 'Battery Management (BMS), Traction Motors & Inverters',
    department: 'Automobile Engineering',
    aliases: ['electric vehicle', 'ev', 'bms', 'battery management', 'traction motor', 'regenerative braking']
  },

  // ==========================================
  // DATA SCIENCE & MACHINE LEARNING
  // ==========================================
  {
    skill: 'Machine Learning',
    topic: 'Statistical & Predictive Modeling',
    subtopic: 'Supervised Algorithms & Regularization',
    department: 'Data Science & Machine Learning Engineering',
    aliases: ['machine learning', 'ml', 'scikit-learn', 'xgboost', 'random forest']
  },
  {
    skill: 'Deep Learning',
    topic: 'Neural Networks & Architectures',
    subtopic: 'PyTorch, Backpropagation & Transformers',
    department: 'Data Science & Machine Learning Engineering',
    aliases: ['deep learning', 'pytorch', 'tensorflow', 'neural networks', 'transformers']
  },
  {
    skill: 'Apache Spark',
    topic: 'Big Data & Distributed Computing',
    subtopic: 'PySpark & Distributed Shuffles',
    department: 'Data Science & Machine Learning Engineering',
    aliases: ['spark', 'apache spark', 'pyspark', 'big data', 'hadoop']
  },
  {
    skill: 'MLOps',
    topic: 'Production Machine Learning',
    subtopic: 'Model Serving & Drift Detection',
    department: 'Data Science & Machine Learning Engineering',
    aliases: ['mlops', 'mlflow', 'model deployment', 'data drift', 'evidently']
  }
];

/**
 * Normalizes any department string to a standard EngineeringDepartment
 */
export function normalizeDepartment(deptStr?: string): EngineeringDepartment {
  if (!deptStr) return 'Computer Science & Engineering';
  const lower = deptStr.toLowerCase();

  if (lower.includes('auto') || lower.includes('vehicle') || lower.includes('motor')) {
    return 'Automobile Engineering';
  }
  if (lower.includes('electrical') || lower.includes('eee') || lower.includes('power system')) {
    return 'Electrical & Electronics Engineering';
  }
  if (lower.includes('civil') || lower.includes('structural')) {
    return 'Civil Engineering';
  }
  if (lower.includes('mechanical') || lower.includes('thermal') || lower.includes('cad') || lower.includes('manufacturing')) {
    return 'Mechanical Engineering';
  }
  if (lower.includes('electronic') || lower.includes('communication') || lower.includes('ece') || lower.includes('embedded') || lower.includes('vlsi')) {
    return 'Electronics & Communication Engineering';
  }
  if (lower.includes('information technology') || lower.includes('it ') || lower.endsWith('it') || lower.includes('information science')) {
    return 'Information Technology';
  }
  if (lower.includes('data science') || lower.includes('machine learning') || lower.includes('analytics') || lower.includes('ai')) {
    return 'Data Science & Machine Learning Engineering';
  }
  return 'Computer Science & Engineering';
}

/**
 * Extracts and maps skills, topics, and projects from resume data
 */
export function extractResumeNLP(
  resume: ParsedResume | null,
  profileDepartment?: string,
  targetDepartment?: EngineeringDepartment
): ExtractedResumeNLP {
  // Aggregate all text sources from parsed resume
  const textCorpusParts: string[] = [];

  if (resume) {
    if (resume.summary) textCorpusParts.push(resume.summary);
    if (resume.extractedText) textCorpusParts.push(resume.extractedText);
    if (resume.rawSkillsList) textCorpusParts.push(resume.rawSkillsList.join(' '));

    resume.projects?.forEach((p) => {
      textCorpusParts.push(`${p.title} ${p.description} ${(p.technologies || []).join(' ')}`);
    });

    resume.experience?.forEach((e) => {
      textCorpusParts.push(`${e.role} ${e.company} ${e.description}`);
    });
  }

  const combinedRawText = textCorpusParts.join('\n');
  const preprocessed = preprocessDocument(combinedRawText);
  const normalizedCorpus = preprocessed.normalized;

  // 1. Detect department from resume document
  const detectedDept = resume?.department
    ? normalizeDepartment(resume.department)
    : 'Computer Science & Engineering';

  // 2. Department from user profile
  const userProfileDept = profileDepartment ? normalizeDepartment(profileDepartment) : undefined;

  // 3. Determine effective department
  let effectiveDepartment: EngineeringDepartment;
  let departmentDeterminerNote = '';

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
    effectiveDepartment = 'Computer Science & Engineering';
    departmentDeterminerNote = `General Engineering questions selected for ${effectiveDepartment}.`;
  }

  // Universal tech skills that can be present across any engineering student resume
  const UNIVERSAL_SKILL_NAMES = new Set([
    'Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript', 'PHP', 'C#', 'Kotlin',
    'SQL', 'MySQL', 'PostgreSQL', 'SQLite', 'MongoDB', 'Supabase', 'Oracle',
    'React', 'Node.js', 'Express', 'Flask', 'Django', 'Spring Boot', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas',
    'Git', 'GitHub', 'VS Code', 'Postman', 'Docker', 'Linux Administration', 'AWS', 'REST APIs', 'Data Structures'
  ]);

  // Match canonical skills in corpus
  const foundSkillsSet = new Set<string>();
  const skillTopicMap: { skill: string; topic: string; subtopic: string; category?: string }[] = [];

  // 1. Check against rawSkillsList directly
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

  // 2. Scan corpus text for skill aliases
  for (const item of CANONICAL_SKILL_TAXONOMY) {
    const isUniversal = UNIVERSAL_SKILL_NAMES.has(item.skill);
    const isDeptRelevant = item.department === effectiveDepartment || item.department === detectedDept;

    if (isUniversal || isDeptRelevant) {
      for (const alias of item.aliases) {
        const regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
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

  // Dynamic Skill Extraction: support any additional skills present on resume or projects
  const addDynamicSkill = (rawSkill: string, defaultTopic: string = 'Practical Engineering Skill', defaultSubtopic: string = 'Resume Competency') => {
    if (!rawSkill || typeof rawSkill !== 'string') return;
    const trimmed = rawSkill.trim();
    if (trimmed.length < 2) return;
    
    // Check if already represented (case-insensitive)
    const exists = Array.from(foundSkillsSet).some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      foundSkillsSet.add(trimmed);
      if (!skillTopicMap.some(m => m.skill.toLowerCase() === trimmed.toLowerCase())) {
        skillTopicMap.push({
          skill: trimmed,
          topic: defaultTopic,
          subtopic: defaultSubtopic
        });
      }
    }
  };

  // Add all raw skills and skills list from parsed resume
  if (Array.isArray(resume?.skills)) {
    resume.skills.forEach((cat: any) => {
      if (typeof cat === 'string') {
        addDynamicSkill(cat);
      } else if (Array.isArray(cat?.skills)) {
        cat.skills.forEach((s: string) => addDynamicSkill(s, cat.category));
      }
    });
  }
  if (Array.isArray(resume?.rawSkillsList)) {
    resume.rawSkillsList.forEach(s => addDynamicSkill(s));
  }
  resume?.projects?.forEach(p => {
    if (Array.isArray(p.technologies)) {
      p.technologies.forEach(t => addDynamicSkill(t, 'Project Technologies', 'Project Implementation'));
    }
  });

  // Categorize extracted skills into explicit buckets (Prompt Requirements 1 & 2)
  const PROG_LANG_REGEX = /^(python|java|c\+\+|cpp|c#|csharp|c\b|javascript|js|typescript|ts|php|kotlin|swift|go|golang|rust|ruby|scala|r\b|perl|dart|embedded c|verilog|vhdl)/i;
  const DB_REGEX = /(sql|mysql|postgresql|postgres|psql|sqlite|mongodb|mongo|nosql|redis|cassandra|oracle|mariadb|supabase|dynamodb|neo4j|couchdb)/i;
  const FRAMEWORK_REGEX = /(react|node|express|flask|django|spring|vue|angular|next\.js|nuxt|fastapi|laravel|asp\.net|tensorflow|pytorch|keras|scikit|pandas|numpy|opencv|bootstrap|tailwind|redux)/i;
  const AIML_REGEX = /(machine learning|deep learning|artificial intelligence|ai\/ml|nlp|natural language|computer vision|llm|generative ai|neural network|reinforcement learning|scikit-learn|tensorflow|pytorch|transformers|hugging face|bert|gpt|random forest|xgboost|cnn|rnn|lstm)/i;
  const ENG_TOOL_REGEX = /(pcb|kicad|altium|solidworks|autocad|catia|ansys|matlab|simulink|creo|staad|etabs|revit|proteus|labview|cnc|plc|scada|can bus|keil|modelsim|quartus)/i;
  const TOOL_REGEX = /(git|github|gitlab|docker|kubernetes|postman|vs code|vscode|linux|aws|azure|gcp|jira|jenkins|ci\/cd|webpack|vite|bash|shell|powershell)/i;

  const programmingLanguages: string[] = [];
  const databases: string[] = [];
  const frameworksAndLibraries: string[] = [];
  const toolsAndPlatforms: string[] = [];
  const aiAndMlTechnologies: string[] = [];
  const engineeringTools: string[] = [];

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

  // Extract structured projects
  const projectTech: string[] = [];
  const projectTitles: string[] = [];
  const projectsList: { title: string; description: string; technologies: string[] }[] = [];

  resume?.projects?.forEach((p) => {
    projectTitles.push(p.title);
    const techs = Array.isArray(p.technologies) ? p.technologies : [];
    techs.forEach((t) => projectTech.push(t));
    projectsList.push({
      title: p.title,
      description: p.description || '',
      technologies: techs,
    });
  });

  // Extract internships and experience
  const experienceRoles: string[] = [];
  const internshipsList: { company: string; role: string; duration?: string; description?: string }[] = [];

  const rawExpList = resume?.experience || [];
  rawExpList.forEach((e) => {
    if (e.role) experienceRoles.push(e.role);
    const isIntern = e.isInternship || (e.role && /intern|trainee|apprentice|fellow/i.test(e.role));
    if (isIntern) {
      internshipsList.push({
        company: e.company || 'Host Organization',
        role: e.role || 'Intern',
        duration: e.duration,
        description: e.description || '',
      });
    }
  });

  // If separated internships array exists on resume, merge
  if (resume?.internships && resume.internships.length > 0) {
    resume.internships.forEach((intern) => {
      if (!internshipsList.some((i) => i.company === intern.company && i.role === intern.role)) {
        internshipsList.push({
          company: intern.company || 'Host Organization',
          role: intern.role || 'Intern',
          duration: intern.duration,
          description: intern.description || '',
        });
      }
    });
  }

  // Extract certifications
  const certificationsList: { name: string; issuer?: string; topic?: string }[] = [];
  resume?.certifications?.forEach((c) => {
    certificationsList.push({
      name: c.name,
      issuer: c.issuer,
      topic: c.name,
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
    termFrequencies: preprocessed.termFreqs,
  };
}
