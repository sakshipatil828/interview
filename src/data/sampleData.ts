import { ParsedResume, Question } from '../types';

/**
 * Preset sample resume contents for different engineering branches.
 * These are used as fast one-click testing templates in the Resume Upload module,
 * as well as demonstrating that the parser dynamically extracts Civil, Mechanical, ECE, CS etc.
 */
export const PRESET_RESUME_TEXTS = {
  civil: `JOHN DOE
Civil Engineer | Structural Design Specialist
Email: john.doe@civilmail.com | Phone: +1-555-019-2834
LinkedIn: linkedin.com/in/johndoecivil | GitHub: github.com/johndoecivil

PROFESSIONAL SUMMARY
Dedicated Civil Engineering graduate with expertise in structural analysis, concrete design, AutoCAD drafting, and site surveying. Proficient in REVIT Structure, ETABS, and STAAD Pro.

EDUCATION
Bachelor of Engineering in Civil Engineering
National Institute of Technology | Graduated: 2025 | CGPA: 8.8 / 10.0

SKILLS
- Software & Tools: AutoCAD, ETABS, STAAD.Pro, REVIT Structure, MS Project, Surveying Total Station
- Technical Engineering Skills: Structural Analysis, Reinforced Concrete Design, Foundation Engineering, Estimating & Costing, Soil Mechanics
- Soft Skills: Site Supervision, Structural Safety Compliance, Project Scheduling

PROJECTS
1. Design of Multi-Story Earthquake Resistant Building (2024)
- Designed G+12 residential building using ETABS and IS 1893 seismic code guidelines.
- Executed foundation sizing and column load distribution calculations.

2. Eco-Friendly Pervious Concrete Pavement Study (2024)
- Conducted compressive strength and permeability testing on recycled aggregate concrete mixes.

CERTIFICATIONS
- Certified AutoCAD Structural Drafter - Autodesk (2024)
- STAAD.Pro V8i Structural Analysis Professional (2023)

LANGUAGES
English, Hindi, Spanish`,

  mechanical: `SARAH CONNOR
Mechanical Design & Thermal Engineer
Email: sarah.connor@mechtech.com | Phone: +1-555-028-4920
LinkedIn: linkedin.com/in/sarahconnormech | Location: Chicago, IL

SUMMARY
Analytical Mechanical Engineer specializing in CAD modeling, Finite Element Analysis (FEA), Computational Fluid Dynamics (CFD), and thermodynamic system optimization.

EDUCATION
Bachelor of Technology in Mechanical Engineering
State Technological University | Graduated: 2024 | CGPA: 8.9 / 10.0

SKILLS
- Design & Simulation Tools: SolidWorks, ANSYS Mechanical, CATIA V5, MATLAB, Fusion 360
- Core Technical Skills: Kinematics of Machinery, Heat Transfer, Thermodynamics, Hydraulics & Pneumatics, CNC Machining
- Soft Skills: Technical Documentation, Team Leadership, Quality Inspection

PROJECTS
1. Design & FEA Analysis of Automotive Chassis (2024)
- Modeled tubular spaceframe chassis in SolidWorks and performed static stress/vibration analysis in ANSYS.

2. Thermal Performance Analysis of Heat Exchanger (2023)
- Conducted CFD simulations to optimize fin geometry, improving heat transfer efficiency by 14%.

CERTIFICATIONS
- CSWP - Certified SolidWorks Professional (2024)
- Lean Six Sigma Green Belt in Manufacturing (2023)`,

  ece: `RAHUL SHARMA
Embedded Systems & VLSI Engineer
Email: rahul.ece@electro.org | Phone: +91-9876543210
LinkedIn: linkedin.com/in/rahulece | GitHub: github.com/rahulembedded

SUMMARY
Electronics & Communication Engineer focused on IoT hardware development, FPGA logic design, Verilog HDL, Microcontrollers (ARM Cortex, ESP32, Arduino), and Signal Processing.

EDUCATION
Bachelor of Engineering in Electronics & Communication Engineering
PNS Institute of Technology | Graduated: 2025 | CGPA: 9.1 / 10.0

SKILLS
- Hardware & EDA Tools: Verilog HDL, KiCAD PCB Layout, Xilinx Vivado, MATLAB Simulink, LTspice
- Microcontrollers & Systems: ARM Cortex-M, ESP32, STM32, Embedded C, SPI/I2C/UART Protocols, RTOS
- Soft Skills: Hardware Debugging, Protocol Analysis, Problem Solving

PROJECTS
1. Smart Agricultural IoT Monitoring Node (2024)
- Designed custom 2-layer PCB with ESP32 microcontroller, LoRa transceiver, and soil moisture sensors.

2. 8-Bit RISC Processor Implementation on FPGA (2023)
- Modeled complete instruction set architecture in Verilog HDL and verified timing on Xilinx Artix-7 FPGA.

CERTIFICATIONS
- ARM Accredited MCU Engineer (2024)
- Embedded C & RTOS Certification - NPTEL (2023)`,

  cse: `ALEX RIVERS
Software Development Engineer
Email: alex.rivers@devmail.com | Phone: +1-555-014-9988
LinkedIn: linkedin.com/in/alexriversdev | GitHub: github.com/alexrivers

SUMMARY
Passionate Computer Science student with strong foundation in Data Structures, Algorithms, Distributed Systems, Full-Stack Web Development, Node.js, React, and Python.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Metropolitan University | Graduated: 2025 | CGPA: 9.2 / 10.0

SKILLS
- Programming Languages: Python, JavaScript, TypeScript, C++, Java, SQL
- Frameworks & Tools: React, Node.js, Express, PostgreSQL, MongoDB, Git, Docker, REST APIs
- Soft Skills: Agile Development, Code Review, System Design

PROJECTS
1. Real-Time Collaborative Canvas Platform (2024)
- Built WebSocket-backed drawing application supporting multi-user synchronization and canvas state storage.

2. Microservices E-Commerce API Gateway (2023)
- Designed Dockerized Node.js services with Redis caching layer and JWT authorization.

CERTIFICATIONS
- AWS Certified Developer Associate (2024)
- Meta Front-End Developer Professional Certificate (2023)`,

  data: `ANANYA VERMA
Data Scientist & Machine Learning Engineer
Email: ananya.verma@dataai.io | Phone: +1-555-018-7733
LinkedIn: linkedin.com/in/ananyavermaml | GitHub: github.com/ananyaverma-ai

PROFESSIONAL SUMMARY
Results-driven Data Scientist & Machine Learning Engineer with strong foundation in production ML pipelines, predictive modeling, distributed data systems, and deep learning. Proficient in PyTorch, Scikit-Learn, Apache Spark, SQL, Airflow, and MLOps deployment with FastAPI and Docker.

EDUCATION
Bachelor of Technology in Data Science & Artificial Intelligence
Apex Institute of Technology | Graduated: 2025 | CGPA: 9.3 / 10.0

SKILLS
- Machine Learning & Deep Learning: PyTorch, TensorFlow, Scikit-Learn, XGBoost, Transformers, HuggingFace, Computer Vision, NLP
- Data Engineering & Big Data: Apache Spark, PySpark, Apache Kafka, Apache Airflow, Snowflake, PostgreSQL, dbt, Redis
- Programming & Cloud: Python, SQL, R, Docker, Kubernetes, Git, MLflow, AWS (S3, SageMaker, EMR), Linux
- Core Competencies: Statistical Modeling, A/B Testing, Feature Engineering, Distributed Computing, ETL Pipelines, Model Monitoring

PROJECTS
1. Real-Time Streaming Fraud Detection Pipeline (2024)
- Designed an end-to-end streaming fraud detection engine processing 10,000+ events/sec using Apache Kafka, PySpark Streaming, and XGBoost.
- Achieved 94.2% ROC-AUC and reduced false positive rate by 18% using SHAP feature attribution.
- Packaged model inference service using FastAPI and Docker on AWS with sub-25ms p99 latency.

2. Enterprise RAG Knowledge Assistant with Vector Search (2024)
- Built a Retrieval-Augmented Generation (RAG) assistant leveraging LangChain, ChromaDB vector database, and fine-tuned open-source LLMs.
- Implemented hybrid dense-sparse retrieval (BM25 + cosine similarity) with cross-encoder reranking.

3. Automated Data Warehouse ETL & Customer Churn Predictor (2023)
- Orchestrated daily batch ETL pipelines using Apache Airflow and dbt to process 50M+ records into Snowflake.
- Developed customer churn prediction classifier delivering 89% precision, triggering automated retention alerts.

CERTIFICATIONS
- AWS Certified Machine Learning - Specialty (2024)
- Databricks Certified Associate Developer for Apache Spark (2024)
- Deep Learning Specialization - DeepLearning.AI (2023)

LANGUAGES
English, Hindi, German`,

  fresher2027: `AARAV SHARMA
Computer Science Student | Aspiring Full-Stack & Cloud Engineer
Email: aarav.sharma@campus.edu | Phone: +91-98765-12345
LinkedIn: linkedin.com/in/aaravsharma2027 | GitHub: github.com/aaravsharma2027

CAREER OBJECTIVE
Passionate pre-final year Computer Science student (Batch of 2027) with hands-on foundations in Data Structures, React, Node.js, Python, and AWS cloud development. Seeking campus placement opportunities.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Apex Institute of Technology | Graduation: May 2027 | CGPA: 8.9 / 10.0

INTERNSHIP EXPERIENCE
Software Engineering Intern (Summer Internship)
CloudTech Innovations | Duration: 3 Months (June 2026 - August 2026)
- Developed responsive React frontend components and integrated RESTful microservices.
- Automated API test suites in Jest, increasing sprint unit test coverage by 22%.

TECHNICAL SKILLS
- Programming: Python, JavaScript, TypeScript, C++, Java, SQL
- Frameworks & Web: React, Node.js, Express, Tailwind CSS, PostgreSQL, MongoDB
- Cloud & Tools: Git, Docker, AWS (S3, Lambda), Postman, Linux

PROJECTS
1. Campus Placement Portal & Mock Exam Platform (2026)
- Built role-based student placement management system using React, Node.js, and PostgreSQL.
- Implemented automated scorecard generation and real-time announcement notifications.

2. Distributed Task Queue Service (2026)
- Created Redis-backed asynchronous background job processor with worker concurrency controls.

CERTIFICATIONS
- AWS Certified Cloud Practitioner (2026)
- Meta Front-End Developer Specialization (2025)

LANGUAGES
English, Hindi`,

  fresher2026Nov: `PRIYA NAIR
Embedded Systems & IoT Engineer
Email: priya.nair@electro.edu | Phone: +91-98123-45678
LinkedIn: linkedin.com/in/priyanair2026 | GitHub: github.com/priyanair-iot

SUMMARY
Motivated Electronics and Communication Engineer (Batch of 2026, Graduating November 2026) specializing in IoT firmware, ARM Cortex microcontrollers, Embedded C, and sensor interfacing.

EDUCATION
Bachelor of Engineering in Electronics & Communication Engineering
National Institute of Technology | Graduation: November 2026 | CGPA: 9.1 / 10.0

INTERNSHIP EXPERIENCE
IoT Firmware Trainee (Industrial Internship)
SmartEdge Embedded Systems | Duration: 6 Months (January 2026 - June 2026)
- Programmed ESP32 microcontrollers using FreeRTOS and Embedded C for low-power telematics nodes.
- Designed 2-layer sensor breakout PCBs in KiCAD and verified SPI/I2C peripheral communication.

TECHNICAL SKILLS
- Microcontrollers: ARM Cortex-M4, STM32, ESP32, Arduino
- Embedded Programming: Embedded C, C++, FreeRTOS, Python, Shell scripting
- Hardware Tools: KiCAD PCB Design, Oscilloscope, Logic Analyzer, LTspice, Vivado

PROJECTS
1. Smart Grid Industrial Telemetry Unit (2026)
- Implemented MQTT telemetry pipeline transmitting voltage and frequency sensor data to AWS IoT Core.
- Reduced deep-sleep idle power consumption by 35% through dynamic interrupt wakeups.

CERTIFICATIONS
- Embedded Systems & RTOS Design - NPTEL (2026)
- ARM Accredited Microcontroller Specialist (2025)`,

  experienced2025: `VIKRAM MALHOTRA
Mechanical Design & Thermal Systems Specialist
Email: vikram.malhotra@cadpro.org | Phone: +91-98777-88990
LinkedIn: linkedin.com/in/vikrammalhotra2025

PROFESSIONAL SUMMARY
Mechanical Engineer (Batch of 2025) with over 1.2 years of professional engineering experience in SolidWorks 3D modeling, FEA static/thermal simulation, and CAD drafting.

EDUCATION
Bachelor of Technology in Mechanical Engineering
Metropolitan Engineering Institute | Graduated: June 2025 | CGPA: 8.6 / 10.0

EMPLOYMENT HISTORY
Junior Design Engineer (Full-Time Employment)
Precision Dynamic Machines Ltd. | Duration: 1.2 Years (July 2025 - Present)
- Developed parametric CAD models and manufacturing production drawings in SolidWorks.
- Executed FEA static stress and thermal distribution simulations in ANSYS Mechanical.

INTERNSHIP EXPERIENCE
CAD Modeling Intern
AutoParts Manufacturing Corp. | Duration: 6 Months (Dec 2024 - May 2025)
- Assisted senior engineers in drafting GD&T compliant tooling components.

TECHNICAL SKILLS
- CAD/CAE: SolidWorks, ANSYS Mechanical, CATIA V5, AutoCAD Mechanical, Fusion 360
- Engineering Competencies: Finite Element Analysis (FEA), Thermal Optimization, GD&T, DFM/DFA

PROJECTS
1. Structural FEA Optimization of Heavy Machine Frame (2025)
- Reduced structural frame weight by 14% while maintaining minimum 2.5 safety factor under maximum dynamic load.`,

  experienced2024: `ROHAN KULKARNI
Structural Analysis & Civil Design Engineer
Email: rohan.kulkarni@structeng.com | Phone: +91-98444-22110
LinkedIn: linkedin.com/in/rohankulkarni2024

PROFESSIONAL SUMMARY
Accomplished Civil Engineer (Batch of 2024) with 2+ years of professional industry employment in structural analysis, reinforced concrete design, ETABS seismic modeling, and BIM coordination.

EDUCATION
Bachelor of Engineering in Civil Engineering
State Technological University | Graduated: May 2024 | CGPA: 8.8 / 10.0

EMPLOYMENT HISTORY
Structural Design Engineer (Full-Time Employment)
Apex Infra Structural Consultants | Duration: 2 Years (June 2024 - Present)
- Designed reinforced concrete superstructures for commercial and residential multi-story complexes using ETABS.
- Supervised seismic analysis according to IS 1893:2016 and prepared detailed structural drawings in Revit.

INTERNSHIP EXPERIENCE
Site Engineering Intern
Metro Infra Builders | Duration: 4 Months (Jan 2024 - April 2024)
- Verified foundation rebar arrangements and slump test concrete quality records on-site.

TECHNICAL SKILLS
- Software: ETABS, STAAD.Pro, AutoCAD, Revit Structure, MS Project, Primavera P6
- Core Competencies: RCC Design, Seismic Code Compliance, Foundation Sizing, Cost Estimation

PROJECTS
1. Seismic Retrofitting Analysis for Commercial Complex (2024)
- Modeled pushover non-linear analysis to identify plastic hinge locations and reinforced beam-column joints.`,

  missingGraduation: `SNEHA PATEL
Software Engineer | Front-End & JavaScript Specialist
Email: sneha.patel@devworld.io | Phone: +91-98000-33445
LinkedIn: linkedin.com/in/snehapatel-dev | GitHub: github.com/snehapatel-code

PROFESSIONAL SUMMARY
Enthusiastic software developer with solid competencies in React, TypeScript, Tailwind CSS, Node.js, and SQL databases. Experienced in responsive UI development and frontend state management.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
Institute of Science and Technology | CGPA: 8.9 / 10.0

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
- Frameworks & Libraries: React, Next.js, Redux Toolkit, Tailwind CSS, Express
- Tools: Git, GitHub, Vite, Jest, Figma

PROJECTS
1. Collaborative Code Snippet Manager (Recent)
- Developed interactive web application for developers to store, tag, and search syntax-highlighted code snippets.
- Implemented real-time search with debounce and client-side caching.

2. Responsive Financial Analytics Dashboard (Recent)
- Designed responsive metrics dashboard with customizable chart widgets and theme switching.

LANGUAGES
English, Hindi, Gujarati`,

  commerce: `RITU SEN
Commerce & Accounting Specialist | Financial Analyst Aspirant
Email: ritu.sen@commercemail.com | Phone: +91-98765-43210
LinkedIn: linkedin.com/in/ritusencfa

PROFESSIONAL SUMMARY
Motivated Bachelor of Commerce student specializing in Financial Accounting, Auditing, GST, and Corporate Taxation. Experienced in financial statement analysis, ratio analysis, and computerized accounting with TallyPrime and Advanced Excel.

EDUCATION
Bachelor of Commerce (B.Com) in Accounting & Finance
St. Xavier's College | Graduating: 2027 | CGPA: 8.9 / 10.0

CORE SKILLS & COMPETENCIES
- Accounting & Finance: Financial Accounting, Cost Accounting, Corporate Tax, Auditing, Bank Reconciliation, Ratio Analysis, Budgeting
- Software & Tools: TallyPrime, MS Excel (VLOOKUP, Pivot Tables, What-If Analysis), QuickBooks, PowerPoint
- Professional Competencies: Financial Reporting, Working Capital Assessment, Cash Flow Management, Commercial Compliance

PROJECTS
1. Corporate Financial Health Evaluation & Ratio Analysis (2024)
- Analyzed 3 years of audited balance sheets and profit & loss statements for public FMCG firms.
- Computed liquidity, solvency, profitability, and turnover ratios to evaluate operational efficiency.

2. GST Compliance & Reconciliation Simulation (2024)
- Simulated input tax credit (ITC) calculations and GSTR-3B monthly filing reconciliations across sample vendors.

CERTIFICATIONS
- Certified TallyPrime Professional (2024)
- Advanced Financial Modeling & Valuation with Excel (2024)`,

  businessAnalytics: `KAVITA NAIR
Business Analytics Aspirant | BI & Data Insights
Email: kavita.nair@analyticsmail.com | Phone: +91-98450-11223
LinkedIn: linkedin.com/in/kavitanair-ba

PROFESSIONAL SUMMARY
Detail-oriented Business Analytics student with strong foundational expertise in translating complex business questions into interactive dashboards, KPI reports, and descriptive statistical insights. Proficient in Power BI, Tableau, Advanced Excel, and SQL.

EDUCATION
Bachelor of Science (B.Sc) in Business Analytics & Applied Statistics
Symbiosis School of Business Analytics | Graduating: Nov 2026 | CGPA: 8.7 / 10.0

CORE SKILLS & TOOLS
- Business Intelligence: Power BI, Tableau Desktop, Advanced Excel (Macros, Power Query), Google Looker Studio
- Analytical Techniques: Descriptive Statistics, KPI Definition, Cohort Analysis, Market Basket Analysis, Customer Segmentation
- Databases & Languages: Business SQL (Joins, Aggregations, Window Functions), Basic Python for Data Analysis
- Business Communication: Executive Dashboard Presentation, Stakeholder Requirement Gathering

PROJECTS
1. Retail Chain Omni-Channel Sales Intelligence Dashboard (2024)
- Built interactive multi-page Power BI dashboard visualizing quarterly revenue, category margins, and regional sales performance.
- Identified underperforming product lines and presented actionable inventory rebalancing recommendations.

2. E-Commerce Customer Retention & Churn Driver Analysis (2024)
- Examined customer transaction logs to assess repeat purchase frequency and churn factors using RFM segmentation.

CERTIFICATIONS
- Microsoft Certified: Power BI Data Analyst Associate (2024)
- Google Business Intelligence Certificate (2024)`,

  bba: `ADITYA VARMA
Business Administration & Marketing Strategy Graduate
Email: aditya.varma@bbamail.com | Phone: +91-97112-99881
LinkedIn: linkedin.com/in/adityavarmabba

PROFESSIONAL SUMMARY
Ambitious BBA student with expertise in marketing management, brand positioning, digital campaigns, market research, and consumer behavior analysis. Proven leadership in college management events and student enterprise initiatives.

EDUCATION
Bachelor of Business Administration (BBA) in Marketing & Operations
Narsee Monjee Institute of Management Studies | Graduating: June 2026 | CGPA: 8.6 / 10.0

CORE SKILLS & COMPETENCIES
- Management & Strategy: Brand Strategy, Market Research, SWOT & PESTLE Analysis, Consumer Behavior, Channel Management
- Digital & Growth Tools: Google Analytics, HubSpot CRM, Meta Ads Manager, Mailchimp, Canva, Excel
- Soft Skills: Cross-Functional Team Leadership, Client Pitching, Negotiation, Public Speaking, Conflict Resolution

PROJECTS
1. New Consumer Product Go-To-Market & Brand Positioning (2024)
- Formulated comprehensive GTM launch roadmap for an eco-friendly consumer goods brand targeting Gen Z consumers.
- Designed customer journey map, pricing tiers, and digital acquisition funnel.

2. Consumer Perception Survey on Quick-Commerce Grocery Apps (2024)
- Surveyed 300+ urban consumers to identify primary drivers of app loyalty versus pricing sensitivity.

CERTIFICATIONS
- HubSpot Inbound Marketing & Sales Certification (2024)
- Google Analytics Individual Qualification (GA4) (2024)`,

  arts: `MEERA MENON
Arts & Corporate Communications Specialist
Email: meera.menon@artsmail.com | Phone: +91-99670-33445
LinkedIn: linkedin.com/in/meeramenon-comm

PROFESSIONAL SUMMARY
Creative and articulate graduate in English Literature and Communications with exceptional writing, qualitative research, and storytelling capabilities. Experienced in drafting corporate communications, press releases, editorial articles, and organizational newsletters.

EDUCATION
Bachelor of Arts (BA) in English Literature & Mass Communication
Lady Shri Ram College, Delhi University | Graduating: May 2026 | CGPA: 9.1 / 10.0

CORE SKILLS & COMPETENCIES
- Written & Spoken Communication: Corporate Writing, Technical Copywriting, Press Releases, Speech Writing, Editorial Proofreading
- Content & Media: Brand Storytelling, Social Media Content Strategy, Qualitative Interviewing, Media Relations, Crisis Communication Basics
- Tools: WordPress CMS, Notion, Canva, Grammarly Business, Google Workspace, MS PowerPoint
- Interpersonal Skills: Active Listening, Empathy-Led Communication, Persuasive Rhetoric, Public Speaking

PROJECTS
1. University Editorial Publication & Annual Magazine Editor-in-Chief (2024)
- Led team of 12 student writers and designers to publish a 96-page print and digital campus literary journal.
- Conducted interviews with visiting authors, alumni executives, and academic leaders.

2. CSR Communication Campaign Strategy for Local Non-Profit (2024)
- Drafted stakeholder newsletters, donor appeal letters, and social media storytelling arcs that increased volunteer registrations by 40%.

CERTIFICATIONS
- Professional Corporate Communication & PR Specialist (2024)
- Advanced Business English & Presentation Mastery (2024)`,

  customerServiceExperienced: `POOJA VERMA
Customer Service Executive | Client Support Specialist
Email: pooja.verma@clientsupport.com | Phone: +91-98765-88990
LinkedIn: linkedin.com/in/poojaverma-support

PROFESSIONAL SUMMARY
Experienced Customer Service Specialist with 2+ years of professional employment across client support, query resolution, CRM ticket management, and billing assistance. Proven track record in maintaining 96% first-contact resolution (FCR) and de-escalating complex customer issues.

EDUCATION
Bachelor of Commerce (B.Com)
Delhi University | Graduated: 2022 | CGPA: 8.4 / 10.0

EMPLOYMENT HISTORY
Customer Service Associate (Full-Time Employment)
Global Connect BPO Services | Duration: 2023 - Present (1.5 Years)
- Handled 80+ customer queries daily via phone, email, and live CRM chat.
- Resolved billing discrepancies, payment reconciliations, and account management requests.
- Maintained detailed incident records and ticket status updates in Salesforce CRM.

Sales Assistant & Support Associate (Full-Time Employment)
Retail Solutions Enterprise | Duration: 2022 - 2023 (1 Year)
- Managed customer order inquiries, billing support, and customer returns processing.
- Maintained client communication records in MS Excel and assisted store sales team.

CORE SKILLS & COMPETENCIES
- Customer Support: Customer Service, Complaint Handling, Escalation De-escalation, Billing Assistance, Sales Support, First-Contact Resolution
- Software & Tools: CRM Data Entry, Salesforce, Zendesk, MS Excel (VLOOKUP, Pivot Tables), MS Word, Email Etiquette, Record Management
- Professional Competencies: Active Listening, Empathy, Client Retention, Verbal & Written Business Communication

CERTIFICATIONS
- Certified Customer Service Specialist (CCSS) (2023)
- Advanced CRM & Client Retention Professional (2022)`,

  mbaExperiencedHR: `SHWETA KULKARNI
Human Resources Specialist | Talent Acquisition & Employee Relations
Email: shweta.kulkarni@hrconnect.org | Phone: +91-98111-22334
LinkedIn: linkedin.com/in/shwetakulkarni-hr

PROFESSIONAL SUMMARY
Dynamic Human Resources professional with 2+ years of verified industry employment in talent acquisition, employee onboarding, HR policy compliance, and conflict mediation. Specialized in end-to-end recruitment pipelines and HR metrics.

EDUCATION
Master of Business Administration (MBA in Human Resources)
Symbiosis Institute of Management Studies | Graduated: 2023 | CGPA: 8.8 / 10.0

Bachelor of Business Administration (BBA)
Pune University | Graduated: 2021 | CGPA: 8.5 / 10.0

EMPLOYMENT HISTORY
HR Generalist & Talent Acquisition Specialist (Full-Time Employment)
TalentEdge Corporate Solutions | Duration: 2023 - Present (2 Years)
- Managed end-to-end recruitment lifecycle for 60+ mid and senior-level corporate positions.
- Coordinated employee onboarding, documentation, statutory compliance, and payroll coordination.
- Facilitated employee grievance resolution and structured bi-weekly team pulse sessions.

CORE SKILLS & COMPETENCIES
- HR Specializations: Recruitment, Talent Acquisition, Employee Relations, Onboarding, Payroll Administration, HR Policy Compliance, Conflict Mediation
- Tools & HRIS: Workday, Darwinbox, LinkedIn Recruiter, MS Excel, Google Workspace
- Professional Competencies: Stakeholder Management, Empathy, Structured Interviewing, Workplace Ethics

CERTIFICATIONS
- SHRM Certified Professional (SHRM-CP) (2023)
- Strategic Talent Acquisition & People Analytics (2022)`,

  sampleNonTechnicalFresher: `DEEPA SHAH
Entry-Level Customer Support & Office Administration Specialist
Email: deepa.shah@commercestudent.edu | Phone: +91-98765-11223
LinkedIn: linkedin.com/in/deepashah-bcom

PROFESSIONAL SUMMARY
Motivated and detail-oriented Bachelor of Commerce (B.Com) graduate (Batch of 2026) seeking entry-level roles in Customer Support, Client Coordination, or Office Administration. Skilled in empathetic customer communication, business correspondence, spreadsheet data entry, and Google Workspace.

EDUCATION
Bachelor of Commerce (B.Com)
St. Xavier's College | Graduating: May 2026 | CGPA: 8.5 / 10.0

CORE SKILLS & COMPETENCIES
- Administration & Support: Customer Support, Office Administration, Email Correspondence, Document Filing, Call Handling
- Software & Productivity: Microsoft Word, Microsoft Excel (Basic Formulas, Data Formatting), PowerPoint, Google Workspace (Docs, Sheets, Slides)
- Soft Skills: Active Listening, Multi-Channel Communication, Conflict Resolution, Time Management, Team Collaboration

PROJECTS & ACADEMIC INITIATIVES
1. Campus Student Service & Feedback Survey Analysis (2025)
- Designed and distributed a digital survey assessing student cafeteria and campus service satisfaction across 450+ respondents.
- Tabulated responses in Google Sheets and created summary charts presented to the administrative committee.

2. College Annual Commerce Festival Event Coordinator (2024)
- Managed vendor communications, registrations, and formal email notifications for 200+ event participants.

VOLUNTEERING & CERTIFICATIONS
- Certificate in Professional Business Communication & Office Etiquette (2025)
- Volunteer Coordinator at Community Literacy Drive (2024)`
,

  ananyaSharmaBCom: `ANANYA SHARMA
Customer Support / Office Administration
Email: ananya.sharma@commercestudent.edu | Phone: +91-98765-43210
LinkedIn: linkedin.com/in/ananyasharma-commerce

CAREER OBJECTIVE
Customer Support / Office Administration

PROFESSIONAL SUMMARY
Motivated and detail-oriented Bachelor of Commerce (B.Com) graduate seeking entry-level opportunities in Customer Support and Office Administration. Strong competencies in empathetic customer communication, active listening, document filing, MS Office tools, and organized workplace operations.

EDUCATION
Bachelor of Commerce (B.Com)
St. Xavier's College | Graduating: May 2026 | CGPA: 8.4 / 10.0

CORE SKILLS & COMPETENCIES
- Customer Support & Service: Customer communication, active listening, billing and record keeping, conflict resolution, ticket handling
- Software & Office Productivity: MS Word, Excel, PowerPoint, Google Workspace, spreadsheet formatting, basic formulas, pivot tables
- Administrative Proficiencies: Email writing, data entry, document organization, filing systems, office administration, record management
- Interpersonal Strengths: Teamwork, time management, problem solving, workplace ethics, multi-tasking

EXPERIENCE & VOLUNTEERING
College Event Volunteer | Annual Commerce Festival (2024 - 2025)
- Assisted in attendee registrations, information desk queries, and document coordination for over 350 participants.
- Managed vendor communications and resolved participant on-spot questions politely.

ACADEMIC PROJECTS
1. Customer Feedback Survey using Excel (2025)
- Designed and distributed customer feedback survey assessing student service satisfaction across 300+ respondents.
- Tabulated responses using MS Excel formulas and pivot tables to identify operational improvement areas.

CERTIFICATIONS
- MS Office Fundamentals (2025)
- Business Communication & Workplace Etiquette (2024)`
};

export const sampleResumes = PRESET_RESUME_TEXTS;

// Aliases for explicit testing and automated evaluation
export const sampleAnanyaSharmaBCom = PRESET_RESUME_TEXTS.ananyaSharmaBCom;
export const Sample_Ananya_BCom_Resume = PRESET_RESUME_TEXTS.ananyaSharmaBCom;
export const Sample_NonTechnical_Experienced_Resume = PRESET_RESUME_TEXTS.customerServiceExperienced;
export const Sample_NonTechnical_Fresher_Resume = PRESET_RESUME_TEXTS.sampleNonTechnicalFresher;
export const sampleNonTechnicalExperienced = PRESET_RESUME_TEXTS.customerServiceExperienced;
export const sampleNonTechnicalFresher = PRESET_RESUME_TEXTS.sampleNonTechnicalFresher;

export { DATA_SCIENCE_TECHNICAL_QUESTIONS } from './dataTechnicalQuestions';

/**
 * Standard Aptitude Questions Bank (Quantitative, Logical, Verbal, Core CS)
 */
export const SAMPLE_APTITUDE_QUESTIONS: Question[] = [
  {
    id: 'apt_1',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Intermediate',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long at the same speed?',
    options: ['89 seconds', '65 seconds', '100 seconds', '72 seconds'],
    correctAnswer: 0,
    explanation: 'Speed of the train = 240 m / 24 s = 10 m/s. Total distance to pass platform = length of train + length of platform = 240 m + 650 m = 890 m. Time taken = 890 m / 10 m/s = 89 seconds.',
    wrongExplanations: {
      1: '65 seconds is calculated if you only divide the platform length (650m) by 10 m/s, forgetting the length of the train itself.',
      2: '100 seconds assumes an incorrect speed calculation of 8.9 m/s or miscalculates train length.',
      3: '72 seconds uses an incorrect ratio of platform to train length.'
    },
    learningTip: 'Always add the length of the train to the length of the platform or tunnel when computing total distance crossed.'
  },
  {
    id: 'apt_2',
    type: 'aptitude',
    category: 'Logical Reasoning',
    difficulty: 'Beginner',
    question: 'Find the next number in the sequence: 4, 9, 19, 39, 79, ?',
    options: ['119', '159', '149', '139'],
    correctAnswer: 1,
    explanation: 'The pattern is (Previous Number × 2) + 1. Specifically: 4×2+1=9, 9×2+1=19, 19×2+1=39, 39×2+1=79. Therefore, 79×2+1 = 159.',
    wrongExplanations: {
      0: '119 result occurs if you add 40 instead of applying the doubling rule (×2 + 1).',
      2: '149 comes from multiplying by 2 and subtracting 9.',
      3: '139 comes from applying an incorrect constant increment.'
    },
    learningTip: 'When differences between consecutive numbers double, check for recursive rules of form (n × k ± c).'
  },
  {
    id: 'apt_3',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Intermediate',
    question: 'A sum of money doubles itself at simple interest in 10 years. In how many years will it triple itself at the same rate?',
    options: ['15 years', '20 years', '25 years', '30 years'],
    correctAnswer: 1,
    explanation: 'Let Principal = P. Amount doubles in 10 yrs, so Simple Interest = P in 10 yrs. Rate R = (P × 100) / (P × 10) = 10% per annum. To triple, Interest needed = 2P. Time T = (2P × 100) / (P × 10) = 20 years.',
    wrongExplanations: {
      0: '15 years assumes compound growth or proportional multiplier on time without considering base principal.',
      2: '25 years miscalculates the rate as 8% per year.',
      3: '30 years incorrectly multiplies 10 years by 3 instead of analyzing simple interest growth.'
    },
    learningTip: 'In Simple Interest, equal amounts of interest accrue in equal time intervals. If P accrues in 10 yrs, 2P takes 20 yrs.'
  },
  {
    id: 'apt_4',
    type: 'aptitude',
    category: 'Logical Reasoning',
    difficulty: 'Intermediate',
    question: 'If "LOGIC" is coded as "MNHJB", how is "INPUT" coded in that language?',
    options: ['JMQTS', 'JMOTS', 'JOQUS', 'JMPVS'],
    correctAnswer: 0,
    explanation: 'Alternating shift pattern: L (+1) -> M, O (-1) -> N, G (+1) -> H, I (+1) -> J, C (-1) -> B. Applying this same pattern to INPUT: I(+1)=J, N(-1)=M, P(+1)=Q, U(+1)=T, T(-1)=S -> JMQTS.',
    wrongExplanations: {
      1: 'JMOTS misapplies the shift for the third letter P.',
      2: 'JOQUS shifts all letters forward by +1 uniformly.',
      3: 'JMPVS uses reverse alphabet mapping incorrectly.'
    },
    learningTip: 'Write out the alphabet index or shift difference for each character position before choosing the option.'
  },
  {
    id: 'apt_5',
    type: 'aptitude',
    category: 'Verbal Ability',
    difficulty: 'Beginner',
    question: 'Select the synonym for "PERSEVERANCE":',
    options: ['Indolence', 'Persistence', 'Apathy', 'Hesitation'],
    correctAnswer: 1,
    explanation: 'Perseverance means continued effort to achieve something despite difficulties, failure, or opposition. "Persistence" is an exact synonym.',
    wrongExplanations: {
      0: 'Indolence means laziness or avoidance of activity (an antonym).',
      2: 'Apathy means lack of interest, enthusiasm, or concern (an antonym).',
      3: 'Hesitation means pausing before saying or doing something due to uncertainty.'
    },
    learningTip: 'Eliminate antonyms first when looking for synonyms in verbal reasoning tasks.'
  },
  {
    id: 'apt_6',
    type: 'aptitude',
    category: 'Core Computer Fundamentals',
    difficulty: 'Intermediate',
    question: 'Which data structure follows the Last In First Out (LIFO) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctAnswer: 1,
    explanation: 'A Stack strictly operates on Last In First Out (LIFO) order, where elements pushed last are popped first.',
    wrongExplanations: {
      0: 'Queue operates on First In First Out (FIFO) order.',
      2: 'Linked List allows arbitrary insertion and deletion based on pointers.',
      3: 'Binary Tree is a hierarchical non-linear data structure.'
    },
    learningTip: 'Remember: Stacks are like a plate stack (LIFO); Queues are like a ticket counter line (FIFO).'
  },
  {
    id: 'apt_7',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Advanced',
    question: 'A bag contains 5 red balls and 3 green balls. If two balls are drawn at random without replacement, what is the probability that both are red?',
    options: ['5/14', '25/64', '15/56', '5/28'],
    correctAnswer: 0,
    explanation: 'Total balls = 8. P(1st Red) = 5/8. After drawing 1 red without replacement, 4 red and 7 total remain. P(2nd Red) = 4/7. Total P = (5/8) × (4/7) = 20/56 = 5/14.',
    wrongExplanations: {
      1: '25/64 assumes drawing with replacement (5/8 × 5/8).',
      2: '15/56 calculates drawing 1 red and 1 green ball.',
      3: '5/28 forgets to multiply by the first choice probability.'
    },
    learningTip: 'Pay close attention to "without replacement" which reduces both the matching count and the total pool size by 1.'
  },
  {
    id: 'apt_8',
    type: 'aptitude',
    category: 'Logical Reasoning',
    difficulty: 'Intermediate',
    question: 'Pointing to a photo, a man said "I have no brother or sister, but that man\'s father is my father\'s son." Who is in the photo?',
    options: ['His son', 'His father', 'His nephew', 'Himself'],
    correctAnswer: 0,
    explanation: '"My father\'s son" when the speaker has no brothers is the man himself. So "that man\'s father is [myself]". Thus, the photo is of his son.',
    wrongExplanations: {
      1: 'If the photo were his father, the phrase would be "that man is my father".',
      2: 'Nephew is impossible because he has no brothers or sisters.',
      3: 'If it were himself, "that man\'s father" would mean his father, not "my father\'s son".'
    },
    learningTip: 'Break down blood relation statements from right to left starting with "my father\'s son".'
  },
  {
    id: 'apt_9',
    type: 'aptitude',
    category: 'Core Computer Fundamentals',
    difficulty: 'Intermediate',
    question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    correctAnswer: 0,
    explanation: 'In a balanced BST, each comparison reduces the search space by half, resulting in logarithmic O(log n) time complexity.',
    wrongExplanations: {
      1: 'O(n) is the worst-case complexity for an unbalanced/skewed BST or linear linked list.',
      2: 'O(1) is the average constant time complexity for HashMap lookups.',
      3: 'O(n log n) is the time complexity for efficient comparison-based sorting algorithms like MergeSort.'
    },
    learningTip: 'Binary tree search is O(log n) when balanced, but degrades to O(n) if unbalanced (e.g. linked list shape).'
  },
  {
    id: 'apt_10',
    type: 'aptitude',
    category: 'Verbal Ability',
    difficulty: 'Intermediate',
    question: 'Identify the sentence with correct grammatical agreement:',
    options: [
      'Neither the manager nor the team members were aware of the delay.',
      'Neither the manager nor the team members was aware of the delay.',
      'Neither the manager or the team members were aware of the delay.',
      'Neither the manager nor the team members is aware of the delay.'
    ],
    correctAnswer: 0,
    explanation: 'In "neither... nor..." constructions, the verb agrees with the subject closest to it. "team members" is plural, so "were" is correct.',
    wrongExplanations: {
      1: '"was" is singular, but the closest subject "team members" is plural.',
      2: '"Neither" must pair with "nor", not "or".',
      3: '"is" is singular, which violates subject-verb agreement with plural "team members".'
    },
    learningTip: 'When subjects are joined by "neither... nor", match the verb to the subject immediately preceding the verb.'
  },
  {
    id: 'apt_11',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Advanced',
    question: 'A medical test for a disease has 95% sensitivity (true positive) and 90% specificity (true negative). The disease affects 1% of the population. If a patient tests positive, what is the approximate probability they actually have the disease?',
    options: ['8.7%', '95.0%', '50.0%', '15.2%'],
    correctAnswer: 0,
    explanation: 'By Bayes Theorem: P(D|+) = [P(+|D) * P(D)] / [P(+|D)*P(D) + P(+|no D)*P(no D)]. P(+|D)*P(D) = 0.95 * 0.01 = 0.0095. P(+|no D)*P(no D) = (1 - 0.90) * 0.99 = 0.10 * 0.99 = 0.099. P(+) = 0.0095 + 0.099 = 0.1085. P(D|+) = 0.0095 / 0.1085 ≈ 8.75%.',
    wrongExplanations: {
      1: '95% is the test sensitivity, ignoring the low base rate of disease prevalence.',
      2: '50% assumes false positive rate equals true positive rate.',
      3: '15.2% miscalculates the total false positive probability pool.'
    },
    learningTip: 'In rare event detection (base rate fallacy), false positives from the large healthy population easily dominate total positives.'
  },
  {
    id: 'apt_12',
    type: 'aptitude',
    category: 'Core Computer Fundamentals',
    difficulty: 'Intermediate',
    question: 'In SQL, which clause is evaluated FIRST in query execution order?',
    options: ['FROM', 'WHERE', 'SELECT', 'GROUP BY'],
    correctAnswer: 0,
    explanation: 'Logical SQL query execution order begins with FROM (and JOINs), followed by WHERE, GROUP BY, HAVING, SELECT, and finally ORDER BY / LIMIT.',
    wrongExplanations: {
      1: 'WHERE is evaluated second, after tables are located and joined in FROM.',
      2: 'SELECT is evaluated near the end, which is why column aliases in SELECT cannot be referenced in WHERE.',
      3: 'GROUP BY is evaluated after WHERE filters candidate rows.'
    },
    learningTip: 'Remember the SQL execution order mnemonic: FWGHSO (FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY).'
  },
  {
    id: 'apt_13',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Intermediate',
    question: 'A trader marks his goods 40% above the cost price and gives a discount of 15% on the marked price. What is his net profit percentage?',
    options: ['19%', '25%', '20%', '17.5%'],
    correctAnswer: 0,
    explanation: 'Let cost price CP = 100. Marked price MP = 140. Discount of 15% on 140 = 0.15 * 140 = 21. Selling price SP = 140 - 21 = 119. Profit = 119 - 100 = 19%.',
    wrongExplanations: {
      1: '25% is calculated by merely subtracting 15 from 40, ignoring that the discount is calculated on the higher marked price.',
      2: '20% assumes an incorrect discount calculation of 20 instead of 21.',
      3: '17.5% calculates discount on cost price instead of marked price.'
    },
    learningTip: 'Always calculate discount on the Marked Price, not on the original Cost Price.'
  },
  {
    id: 'apt_14',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Intermediate',
    question: 'A can do a piece of work in 12 days and B can do it in 15 days. If they work together for 4 days, what fraction of the total work remains to be completed?',
    options: ['2/5', '1/3', '3/5', '1/4'],
    correctAnswer: 0,
    explanation: 'Work done by A in 1 day = 1/12. Work done by B in 1 day = 1/15. Together in 1 day = 1/12 + 1/15 = 9/60 = 3/20. In 4 days, they complete 4 * (3/20) = 12/20 = 3/5 of the work. Remaining work = 1 - 3/5 = 2/5.',
    wrongExplanations: {
      1: '1/3 calculates the fraction completed instead of the fraction remaining.',
      2: '3/5 is the fraction of work completed in 4 days, not the remaining fraction.',
      3: '1/4 uses an incorrect LCM of work rates.'
    },
    learningTip: 'Check whether the question asks for the fraction completed or the fraction remaining.'
  },
  {
    id: 'apt_15',
    type: 'aptitude',
    category: 'Logical Reasoning',
    difficulty: 'Beginner',
    question: 'Find the next term in the series: 7, 14, 42, 168, ?',
    options: ['840', '672', '504', '720'],
    correctAnswer: 0,
    explanation: 'The pattern is multiplying by successive integers: 7 * 2 = 14; 14 * 3 = 42; 42 * 4 = 168; 168 * 5 = 840.',
    wrongExplanations: {
      1: '672 multiplies 168 by 4 instead of incrementing the multiplier to 5.',
      2: '504 multiplies 168 by 3.',
      3: '720 is an arithmetic extrapolation error.'
    },
    learningTip: 'Look for growing factorial/successive integer multipliers when terms increase rapidly.'
  },
  {
    id: 'apt_16',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Intermediate',
    question: 'In a 60-liter mixture, the ratio of milk to water is 2:1. How many liters of water must be added so the ratio becomes 1:2?',
    options: ['60 liters', '30 liters', '40 liters', '45 liters'],
    correctAnswer: 0,
    explanation: 'Initial milk = (2/3) * 60 = 40 liters; water = 20 liters. In the new mixture, milk remains 40 liters. For a 1:2 ratio, water required = 40 * 2 = 80 liters. Water to add = 80 - 20 = 60 liters.',
    wrongExplanations: {
      1: '30 liters results in 40 liters milk to 50 liters water, which is a 4:5 ratio.',
      2: '40 liters brings total water to 60 liters, giving a 2:3 ratio.',
      3: '45 liters confuses the total water volume with additional volume.'
    },
    learningTip: 'Keep the constant component unchanged and solve for the variable component.'
  },
  {
    id: 'apt_17',
    type: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Intermediate',
    question: 'A business revenue increased by 20% in the first year and then decreased by 10% in the second year. What was the net percentage change over the two-year period?',
    options: ['8% increase', '10% increase', '5% increase', '12% increase'],
    correctAnswer: 0,
    explanation: 'Net change = a + b + (a*b)/100 = 20 - 10 + (20 * -10)/100 = 10 - 2 = +8% increase.',
    wrongExplanations: {
      1: '10% is calculated by simply subtracting 10% from 20%, ignoring compounding.',
      2: '5% averages the two percentages.',
      3: '12% adds the compound product instead of subtracting.'
    },
    learningTip: 'For successive percentage changes, use the net formula: x + y + (xy/100).'
  },
  {
    id: 'apt_18',
    type: 'aptitude',
    category: 'Verbal Ability',
    difficulty: 'Beginner',
    question: 'Choose the word that is most nearly identical in meaning to "METICULOUS":',
    options: ['Thorough and precise', 'Hasty and impulsive', 'Generous and kind', 'Indifferent and calm'],
    correctAnswer: 0,
    explanation: '"Meticulous" means showing great attention to detail; very careful and precise.',
    wrongExplanations: {
      1: 'Hasty and impulsive is the exact antonym of meticulous.',
      2: 'Generous and kind relates to benevolence, not attention to detail.',
      3: 'Indifferent refers to lack of interest or concern.'
    },
    learningTip: '"Meticulous" stems from attention to minute details with precision.'
  },
  {
    id: 'apt_19',
    type: 'aptitude',
    category: 'Logical Reasoning',
    difficulty: 'Beginner',
    question: 'In a code language, if SMART is coded as TNBSU, how is TALENT coded in the same language?',
    options: ['UBMFOU', 'UBMENV', 'VCMFOU', 'UBMEOT'],
    correctAnswer: 0,
    explanation: 'Each letter is shifted by +1 in the alphabet: S->T, M->N, A->B, R->S, T->U. For TALENT: T->U, A->B, L->M, E->F, N->O, T->U = UBMFOU.',
    wrongExplanations: {
      1: 'UBMENV fails to increment the last letter T.',
      2: 'VCMFOU shifts the first letter by +2 instead of +1.',
      3: 'UBMEOT fails to shift E and decrements T.'
    },
    learningTip: 'Verify the shift offset (+1) on each consecutive letter to prevent transposition errors.'
  }
];
