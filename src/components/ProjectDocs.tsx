import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Code2, 
  FolderTree, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  Terminal,
  Video
} from 'lucide-react';

export const ProjectDocs: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'flask' | 'webrtc' | 'structure'>('sql');

  const mysqlSchema = `-- MySQL Database Schema Script for CareerCurve Platform
-- Database Creation
CREATE DATABASE IF NOT EXISTS careercurve_db;
USE careercurve_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    phone VARCHAR(32),
    password_hash VARCHAR(255) NOT NULL,
    target_role VARCHAR(128),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    full_name VARCHAR(128),
    job_title VARCHAR(128),
    department VARCHAR(128) NOT NULL,
    summary TEXT,
    ats_score INT DEFAULT 0,
    resume_score INT DEFAULT 0,
    match_rank VARCHAR(64),
    raw_skills JSON,
    education_json JSON,
    projects_json JSON,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    round_type ENUM('technical', 'hr', 'aptitude', 'comprehensive') NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    technical_score INT DEFAULT 0,
    hr_score INT DEFAULT 0,
    aptitude_score INT DEFAULT 0,
    overall_score INT DEFAULT 0,
    readiness_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Interview Answers & Feedback Table
CREATE TABLE IF NOT EXISTS interview_answers (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    technical_accuracy INT DEFAULT 0,
    communication_score INT DEFAULT 0,
    overall_rating VARCHAR(64),
    eye_contact_score INT DEFAULT 0,
    confidence_score INT DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);
`;

  const flaskAppCode = `# Python Flask Backend app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_KEY"))
model = genai.GenerativeModel('gemini-3.6-flash')

@app.route('/api/resume/parse', methods=['POST'])
def parse_resume():
    data = request.get_json()
    resume_text = data.get('resumeText', '')
    
    prompt = f"""Extract exact candidate facts from resume text. Output strictly JSON:
    {{
      "fullName": "", "jobTitle": "", "email": "", "phone": "",
      "department": "", "education": [], "skills": [], "projects": [],
      "atsScore": 88, "resumeScore": 90, "matchRank": "Top 10%"
    }}
    Resume: {resume_text}"""
    
    response = model.generate_content(prompt)
    return jsonify({"success": True, "raw": response.text})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(mysqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([mysqlSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careercurve_db_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Final Year Project Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Architecture, MySQL DDL & Source Export
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete database schema scripts, Python Flask backend implementation, and directory structure for academic submissions.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'sql'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MySQL Database Schema (DDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('flask')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'flask'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Python Flask Backend (app.py)</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'structure'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Modular Directory Hierarchy</span>
        </button>
      </div>

      {/* Tab Content: MySQL Schema */}
      {activeTab === 'sql' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <p className="text-xs font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>careercurve_db_schema.sql</span>
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>

              <button
                onClick={handleDownloadSql}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .SQL Script</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-[450px]">
            {mysqlSchema}
          </pre>
        </div>
      )}

      {/* Tab Content: Python Flask */}
      {activeTab === 'flask' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <p className="text-xs font-bold text-white flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Python Flask Reference Implementation</span>
            </p>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-[450px]">
            {flaskAppCode}
          </pre>
        </div>
      )}

      {/* Tab Content: Directory Structure */}
      {activeTab === 'structure' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <p className="text-xs font-bold text-white mb-2">Platform Folder Structure & Modular Hierarchy</p>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-mono">
{`careercurve/
├── .env.example
├── package.json
├── metadata.json
├── server.ts                  # Express API & Gemini AI endpoints
├── vite.config.ts             # Vite server with API proxy plugin
└── src/
    ├── App.tsx                # Main App Router & session state
    ├── types.ts               # Strict TypeScript interfaces
    ├── data/
    │   └── sampleData.ts      # Multi-branch presets & Aptitude question bank
    └── components/
        ├── Navbar.tsx         # Header navigation bar
        ├── LandingPage.tsx    # Landing Page with Hero & Features
        ├── AuthModal.tsx       # Sign In, Registration & Email verification
        ├── OnboardingModal.tsx # Interactive tutorial
        ├── Dashboard.tsx      # Candidate dashboard & scorecards
        ├── ResumeModule.tsx   # Dynamic ATS resume parser (No hardcoded data)
        ├── InterviewSelection.tsx # Round launcher (Tech, HR, Aptitude)
        ├── AIInterviewModule.tsx  # Tailored Q&A + TTS + Speech Input
        ├── WebcamFeed.tsx     # WebRTC Live Camera & Eye-contact telemetry
        ├── AptitudeModule.tsx # Timed MCQ test (Fixed loop restart bug)
        ├── FacialVoiceAnalysisDesign.tsx # Vision & Audio Telemetry Lab
        ├── FinalReport.tsx    # Printable AI scorecard report
        └── ProjectDocs.tsx    # MySQL schema & architecture center`}
          </pre>
        </div>
      )}
    </div>
  );
};
