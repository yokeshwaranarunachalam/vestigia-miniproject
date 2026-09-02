// User
export const mockUser = {
  id: 1,
  name: 'Yokesh',
  email: 'yokesh@example.com',
  initials: 'YK',
  institution: 'Your College Name',
};

// Stats
export const mockStats = {
  cgpa: 8.42,
  certificates: 14,
  projects: 6,
  hackathons: 3,
};

// Semesters with subjects
export const mockSemesters = [
  {
    number: 1,
    gpa: 8.2,
    subjects: [
      { name: 'Mathematics-I', credits: 4, grade: 'A', gradePoint: 8 },
      { name: 'Physics', credits: 3, grade: 'A+', gradePoint: 9 },
      { name: 'Engineering Graphics', credits: 3, grade: 'B', gradePoint: 7 },
      { name: 'Basic Electrical Eng', credits: 3, grade: 'A', gradePoint: 8 },
      { name: 'Programming in C', credits: 4, grade: 'O', gradePoint: 10 },
    ],
  },
  {
    number: 2,
    gpa: 8.5,
    subjects: [
      { name: 'Mathematics-II', credits: 4, grade: 'A+', gradePoint: 9 },
      { name: 'Chemistry', credits: 3, grade: 'A', gradePoint: 8 },
      { name: 'Eng Mechanics', credits: 3, grade: 'B+', gradePoint: 7.5 },
      { name: 'Basic Electronics', credits: 3, grade: 'A+', gradePoint: 9 },
      { name: 'Data Structures', credits: 4, grade: 'A', gradePoint: 8 },
    ],
  },
  {
    number: 3,
    gpa: 8.3,
    subjects: [
      { name: 'Discrete Mathematics', credits: 4, grade: 'A', gradePoint: 8 },
      { name: 'OOP with C++', credits: 3, grade: 'A+', gradePoint: 9 },
      { name: 'Digital Logic Design', credits: 3, grade: 'B', gradePoint: 7 },
      { name: 'Computer Org', credits: 3, grade: 'A', gradePoint: 8 },
      { name: 'Data Structures Lab', credits: 2, grade: 'O', gradePoint: 10 },
    ],
  },
  {
    number: 4,
    gpa: 8.6,
    subjects: [
      { name: 'Operating Systems', credits: 4, grade: 'A+', gradePoint: 9 },
      { name: 'Database Management', credits: 4, grade: 'O', gradePoint: 10 },
      { name: 'Software Engineering', credits: 3, grade: 'A', gradePoint: 8 },
      { name: 'Java Programming', credits: 3, grade: 'A+', gradePoint: 9 },
      { name: 'Algorithms', credits: 4, grade: 'B+', gradePoint: 7.5 },
    ],
  },
  {
    number: 5,
    gpa: 8.8,
    subjects: [
      { name: 'Computer Networks', credits: 4, grade: 'O', gradePoint: 10 },
      { name: 'Web Technology', credits: 3, grade: 'A+', gradePoint: 9 },
      { name: 'Theory of Computation', credits: 4, grade: 'A', gradePoint: 8 },
      { name: 'Compiler Design', credits: 3, grade: 'A', gradePoint: 8 },
      { name: 'Artificial Intelligence', credits: 4, grade: 'A+', gradePoint: 9 },
    ],
  },
];

// Certificates (14 total)
export const mockCertificates = [
  { id: 1, name: 'AWS Solutions Architect', provider: 'AWS', issueDate: '2024-01-15' },
  { id: 2, name: 'Google Cloud Professional', provider: 'Google Cloud', issueDate: '2024-02-20' },
  { id: 3, name: 'Microsoft Azure Fundamentals', provider: 'Microsoft', issueDate: '2023-11-10' },
  { id: 4, name: 'React Advanced Certificate', provider: 'Meta', issueDate: '2023-09-05' },
  { id: 5, name: 'Full-Stack Web Development', provider: 'FreeCodeCamp', issueDate: '2023-08-12' },
  { id: 6, name: 'Python for Data Science', provider: 'IBM', issueDate: '2023-06-25' },
  { id: 7, name: 'Introduction to Cybersecurity', provider: 'Cisco', issueDate: '2023-04-14' },
  { id: 8, name: 'Scrum Product Owner', provider: 'Scrum Alliance', issueDate: '2023-03-01' },
  { id: 9, name: 'Deep Learning Specialization', provider: 'DeepLearning.AI', issueDate: '2024-03-30' },
  { id: 10, name: 'MongoDB Associate Developer', provider: 'MongoDB', issueDate: '2024-04-10' },
  { id: 11, name: 'Docker Certified Associate', provider: 'Docker', issueDate: '2024-05-15' },
  { id: 12, name: 'Kubernetes Administrator (CKA)', provider: 'CNCF', issueDate: '2024-06-20' },
  { id: 13, name: 'UI/UX Design Essentials', provider: 'Adobe', issueDate: '2023-05-18' },
  { id: 14, name: 'JavaScript Algorithms', provider: 'HackerRank', issueDate: '2023-02-28' },
];

// Projects (6 total)
export const mockProjects = [
  {
    id: 1,
    title: 'Student Skill Tracker',
    description: 'Academic achievement platform',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 2,
    title: 'E-commerce API Gateway',
    description: 'Scalable microservices routing gateway',
    technologies: ['Node.js', 'Express', 'Redis', 'Docker'],
  },
  {
    id: 3,
    title: 'Health Monitoring App',
    description: 'Android application tracking steps, vitals and sleep',
    technologies: ['Kotlin', 'Android SDK', 'SQLite', 'Firebase'],
  },
  {
    id: 4,
    title: 'Portfolio Website',
    description: 'Responsive developer portfolio website with animations',
    technologies: ['HTML', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    id: 5,
    title: 'AI Smart Chatbot',
    description: 'NLP based conversational chatbot for query resolution',
    technologies: ['Python', 'TensorFlow', 'Flask', 'NLTK'],
  },
  {
    id: 6,
    title: 'Task Management System',
    description: 'Collaborative task planner with real-time updates',
    technologies: ['React', 'Redux', 'MongoDB', 'Socket.io'],
  },
];

// Achievements (8 total)
export const mockAchievements = [
  {
    id: 1,
    title: 'Won Hackathon',
    date: '2024-03-15',
    organization: 'College',
    description: '1st prize in AI/ML track for development of smart medical triage tool.',
  },
  {
    id: 2,
    title: 'Smart India Hackathon Finalist',
    date: '2023-12-20',
    organization: 'Govt. of India',
    description: 'Selected in top 5 teams nationally for agricultural waste management track.',
  },
  {
    id: 3,
    title: 'Published Research Paper',
    date: '2024-01-10',
    organization: 'IEEE Access',
    description: 'Co-authored a paper on predictive models for edge-based IoT devices.',
  },
  {
    id: 4,
    title: 'Dean List Academic Honors',
    date: '2023-06-30',
    organization: 'University Dean Office',
    description: 'Achieved semester GPA of 9.0+ consecutively for two terms.',
  },
  {
    id: 5,
    title: 'Open Source Contributor Award',
    date: '2023-10-31',
    organization: 'GitHub',
    description: 'Recognized for outstanding contributions to open source projects during Hacktoberfest.',
  },
  {
    id: 6,
    title: 'Coding Contest 1st Place',
    date: '2023-05-12',
    organization: 'HackerRank College Chapter',
    description: 'Ranked 1st among 250+ participants in intra-college competitive programming marathon.',
  },
  {
    id: 7,
    title: 'Leadership Excellence Certificate',
    date: '2023-09-18',
    organization: 'Rotaract Club',
    description: 'Appreciated for leading a team of 30+ volunteers for local digital literacy drive.',
  },
  {
    id: 8,
    title: 'Certified Google Cloud Leader',
    date: '2024-04-05',
    organization: 'Google Developer Student Clubs',
    description: 'Received certificate of merit for completing Cloud Engineering learning pathway.',
  },
];

// Hackathons (3 total)
export const mockHackathons = [
  {
    id: 1,
    name: 'HackInnovate 2024',
    date: '2024-02-10',
    location: 'Convention Center',
    projectTitle: 'Student Skill Tracker',
    teamSize: 3,
    technologies: ['React', 'Node.js', 'MongoDB'],
    outcome: '3rd Prize',
  },
  {
    id: 2,
    name: 'DefHacks Global',
    date: '2023-10-14',
    location: 'Online',
    projectTitle: 'Smart Triage Assist',
    teamSize: 4,
    technologies: ['Python', 'Flask', 'OpenCV'],
    outcome: 'Best Healthcare Project',
  },
  {
    id: 3,
    name: 'MakeUC Hackathon',
    date: '2023-11-05',
    location: 'University Campus',
    projectTitle: 'EcoRoute Planner',
    teamSize: 2,
    technologies: ['React Native', 'Google Maps API', 'Express'],
    outcome: 'Finalist / Runner Up',
  },
];

// Recent uploads
export const mockRecentUploads = [
  { id: 1, name: 'AWS certificate.pdf' },
  { id: 2, name: 'Sem 4 marksheet.pdf' },
  { id: 3, name: 'Hackathon photo.jpg' },
];
