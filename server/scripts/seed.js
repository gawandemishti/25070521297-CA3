require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const College = require('../models/College');
const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Team = require('../models/Team');
const Connection = require('../models/Connection');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Initializing connection to MongoDB...');
    const conn = await connectDB();
    if (!conn) {
      throw new Error('Could not establish database connection for seeding.');
    }
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections for clean demo reset...');
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Club.deleteMany({}),
      ClubMembership.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      Team.deleteMany({}),
      Connection.deleteMany({}),
      Post.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    console.log('[Seed] 1. Creating 5 Fictional Demonstration Colleges across India...');
    // Five fictional colleges across different states in India
    const collegesData = [
      {
        name: 'Apex Institute of Technology',
        slug: 'apex-institute-of-technology',
        description: 'Premier institute renowned for engineering, computer science research, and deep tech innovation in Bangalore.',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        website: 'https://apex-tech.edu.in',
        logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop',
        verificationStatus: 'verified',
        establishedYear: 1998,
        achievements: ['Ranked #1 in Inter-College Robotics 2025', 'Host of HackBengaluru 2026'],
      },
      {
        name: 'Horizon College of Engineering & Arts',
        slug: 'horizon-college-of-engineering-arts',
        description: 'Multi-disciplinary powerhouse focusing on cross-domain collaboration, entrepreneurship, and cultural excellence.',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        website: 'https://horizon.edu.in',
        logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop',
        verificationStatus: 'verified',
        establishedYear: 2004,
        achievements: ['National E-Cell Excellence Award 2025', 'Annual Cultural Fest Footfall > 15,000'],
      },
      {
        name: 'Vanguard University of Science',
        slug: 'vanguard-university-of-science',
        description: 'Pioneering cutting-edge research in artificial intelligence, bio-robotics, and sustainable aerospace engineering.',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        website: 'https://vanguard-univ.edu.in',
        logo: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&h=400&fit=crop',
        verificationStatus: 'verified',
        establishedYear: 2010,
        achievements: ['Winner of National Smart India Hackathon Track', 'Top 5 AI Research Hub in South Asia'],
      },
      {
        name: 'St. Jude Metropolitan College',
        slug: 'st-jude-metropolitan-college',
        description: 'Vibrant historical campus famous for performing arts, international diplomacy, debate tournaments, and photography.',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        website: 'https://stjude-metro.edu.in',
        logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=400&fit=crop',
        verificationStatus: 'verified',
        establishedYear: 1985,
        achievements: ['All-India Inter-University Youth Festival Champions', 'National Model UN Best Delegation'],
      },
      {
        name: 'Zenith Global Institute of Technology',
        slug: 'zenith-global-institute-of-technology',
        description: 'Rapidly emerging tech and design institute in Chennai, specializing in UI/UX, Game Design, and Cloud computing.',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        website: 'https://zenith-tech.edu.in',
        logo: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop',
        verificationStatus: 'pending', // Testing pending verification approval workflow!
        establishedYear: 2018,
        achievements: ['Winner of Global Game Jam Chennai 2025', 'Active Open Source Student Collective'],
      },
    ];

    const colleges = await College.insertMany(collegesData);
    const [c1, c2, c3, c4, c5] = colleges;
    console.log(`[Seed] Created ${colleges.length} colleges.`);

    console.log('[Seed] 2. Creating User Accounts across all 4 roles...');
    // Platform Administrator
    const platformAdmin = await User.create({
      name: 'Aditya Verma (Admin)',
      email: 'admin@campusconnect.edu',
      passwordHash,
      role: 'platform_admin',
      bio: 'CampusConnect Head Administrator managing multi-college platform operations and verifications.',
      skills: ['Platform Architecture', 'Ecosystem Operations', 'Verification'],
      interests: ['Higher Education', 'EdTech Innovation', 'Student Networking'],
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      isActive: true,
    });

    // College Administrators
    const collegeAdmin1 = await User.create({
      name: 'Prof. Rajesh Kulkarni',
      email: 'admin@apex-tech.edu.in',
      passwordHash,
      role: 'college_admin',
      college: c1._id,
      department: 'Dean of Student Affairs',
      year: 'Faculty / Staff',
      bio: 'Dean of Student Affairs at Apex Institute of Technology Bengaluru.',
      skills: ['Institutional Affairs', 'Academic Mentorship'],
      interests: ['Hackathons', 'Student Leadership'],
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      isActive: true,
    });

    const collegeAdmin2 = await User.create({
      name: 'Dr. Sunita Sharma',
      email: 'admin@horizon.edu.in',
      passwordHash,
      role: 'college_admin',
      college: c2._id,
      department: 'Director of Cultural & Technical Affairs',
      year: 'Faculty / Staff',
      bio: 'Director of Student Welfare at Horizon College of Engineering & Arts Mumbai.',
      skills: ['Event Planning', 'E-Cell Mentor'],
      interests: ['Entrepreneurship', 'Cultural Exchange'],
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
      isActive: true,
    });

    // Organizers
    const organizer1 = await User.create({
      name: 'Vikram Malhotra',
      email: 'organizer.apex@campusconnect.edu',
      passwordHash,
      role: 'organizer',
      college: c1._id,
      department: 'Computer Science & Engineering',
      year: '4th Year',
      bio: 'Lead Organizer at Apex Tech Club & President of Developer Student Chapter.',
      skills: ['Full Stack Web', 'Event Management', 'DevOps', 'Docker'],
      interests: ['Hackathons', 'Cloud Native', 'Cybersecurity'],
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      isActive: true,
    });

    const organizer2 = await User.create({
      name: 'Ananya Iyer',
      email: 'organizer.horizon@campusconnect.edu',
      passwordHash,
      role: 'organizer',
      college: c2._id,
      department: 'Information Technology',
      year: '3rd Year',
      bio: 'Chief Coordinator at Horizon E-Cell and Design Collective.',
      skills: ['UI/UX Design', 'Figma', 'Pitching', 'Public Relations'],
      interests: ['Startups', 'Venture Capital', 'Product Design'],
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      isActive: true,
    });

    const organizer3 = await User.create({
      name: 'Rohan Deshmukh',
      email: 'organizer.vanguard@campusconnect.edu',
      passwordHash,
      role: 'organizer',
      college: c3._id,
      department: 'Robotics & Automation',
      year: '4th Year',
      bio: 'Vanguard Robotics Society Captain and Autonomous Drone researcher.',
      skills: ['ROS', 'Arduino', 'Python', 'C++', 'Computer Vision'],
      interests: ['Robotics Battles', 'AI Hardware', 'Space Tech'],
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop',
      isActive: true,
    });

    // Students across different colleges
    const student1 = await User.create({
      name: 'Aarav Mehta',
      email: 'aarav.student@campusconnect.edu',
      passwordHash,
      role: 'student',
      college: c1._id,
      department: 'Computer Science',
      year: '3rd Year',
      bio: 'Passionate MERN full-stack developer eager to collaborate on inter-college hackathons and AI projects.',
      skills: ['React.js', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'Git'],
      interests: ['Web3', 'AI Agents', 'Open Source', 'Hackathons'],
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
      isActive: true,
    });

    const student2 = await User.create({
      name: 'Pooja Nair',
      email: 'pooja.student@campusconnect.edu',
      passwordHash,
      role: 'student',
      college: c2._id,
      department: 'Artificial Intelligence & Data Science',
      year: '2nd Year',
      bio: 'ML enthusiast working on NLP, LLM fine-tuning, and PyTorch computer vision models.',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Data Science', 'Pandas', 'FastAPI'],
      interests: ['Deep Learning', 'Generative AI', 'Robotics', 'Debating'],
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
      isActive: true,
    });

    const student3 = await User.create({
      name: 'Kabir Singhania',
      email: 'kabir.student@campusconnect.edu',
      passwordHash,
      role: 'student',
      college: c3._id,
      department: 'Electronics & Communication',
      year: '3rd Year',
      bio: 'Hardware geek building IoT sensor nodes and embedded robotics systems. Looking for frontend teammates!',
      skills: ['Embedded C', 'Raspberry Pi', 'IoT', 'PCB Design', 'MATLAB'],
      interests: ['Smart Automation', 'Drones', 'Sports', 'Photography'],
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
      isActive: true,
    });

    const student4 = await User.create({
      name: 'Diya Sen',
      email: 'diya.student@campusconnect.edu',
      passwordHash,
      role: 'student',
      college: c4._id,
      department: 'Media & Design',
      year: '2nd Year',
      bio: 'Creative UI/UX designer and digital illustrator. Love participating in inter-college design jams!',
      skills: ['Figma', 'UI/UX', 'Adobe Photoshop', 'Wireframing', 'User Research'],
      interests: ['Design Systems', 'Graphic Arts', 'Music', 'Cultural Fests'],
      profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
      isActive: true,
    });

    const student5 = await User.create({
      name: 'Karan Patel',
      email: 'karan.student@campusconnect.edu',
      passwordHash,
      role: 'student',
      college: c5._id,
      department: 'Software Engineering',
      year: '4th Year',
      bio: 'Mobile App developer building cross-platform React Native and Flutter experiences.',
      skills: ['React Native', 'Flutter', 'Firebase', 'TypeScript', 'GraphQL'],
      interests: ['Mobile Dev', 'Game Jams', 'E-Sports', 'Fitness'],
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop',
      isActive: true,
    });

    console.log(`[Seed] Created users (Admin, College Admins, Organizers, Students).`);

    console.log('[Seed] 3. Creating 8+ Active Clubs across colleges with Cross-College Membership policies...');
    const clubsData = [
      {
        name: 'Apex Coders Collective',
        slug: 'apex-coders-collective',
        description: 'Elite competitive programming, web development, and open source guild at Apex Tech.',
        category: 'Coding & Development',
        logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop',
        college: c1._id,
        organizer: organizer1._id,
        membershipPolicy: 'Open to passionate developers across all colleges! Cross-college members welcome.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['Weekly LeetCode Sprints', 'Open Source Hacktoberfest', 'Full Stack Project Pods'],
        achievements: ['Won Inter-College ICPC Prelims 2025', 'Built 12 open source apps'],
      },
      {
        name: 'Vanguard AI & Machine Learning Lab',
        slug: 'vanguard-ai-machine-learning-lab',
        description: 'Applied machine learning, deep learning research, and generative AI incubator.',
        category: 'Artificial Intelligence & Data',
        logo: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
        college: c3._id,
        organizer: organizer3._id,
        membershipPolicy: 'Welcomes AI enthusiasts with Python fundamentals from all participating colleges.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['Paper Reading Groups', 'Kaggle Competitions', 'Hands-on Model Training'],
        achievements: ['Published 3 papers in Student AI Conferences', 'Kaggle Grandmaster mentorship'],
      },
      {
        name: 'Horizon E-Cell (Entrepreneurship)',
        slug: 'horizon-e-cell',
        description: 'Incubating startup ideas, connecting student founders with angels, and organizing Shark Tank events.',
        category: 'Entrepreneurship & E-Cell',
        logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
        college: c2._id,
        organizer: organizer2._id,
        membershipPolicy: 'Cross-college founders welcome. We help you pitch to real seed investors.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['Annual Startup Pitching Day', 'Founder Fireside Chats', 'Angel Network Matchmaking'],
        achievements: ['Helped 5 student ventures raise initial angel grants', 'Featured in TechInAsia'],
      },
      {
        name: 'Vanguard Robotics & Autonomous Guild',
        slug: 'vanguard-robotics-guild',
        description: 'Building fighting combat bots, line followers, autonomous rovers, and quadcopters.',
        category: 'Robotics & IoT',
        logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop',
        college: c3._id,
        organizer: organizer3._id,
        membershipPolicy: 'Open to electronics, mechanical, and software engineers from partner colleges.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['RoboWars Arena Prep', 'Drone Simulator Workshops', 'IoT Smart Farm project'],
        achievements: ['National Robocon 2025 Runners-up', 'Best Autonomous Navigation Prize'],
      },
      {
        name: 'St. Jude Photography & Visual Media Guild',
        slug: 'st-jude-photography-guild',
        description: 'Capturing moments, mastering street photography, documentary filmmaking, and drone cinematography.',
        category: 'Photography & Media',
        logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=400&fit=crop',
        college: c4._id,
        organizer: organizer1._id,
        membershipPolicy: 'Open to all creative shutterbugs regardless of camera gear.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['Heritage Photo Walks', 'Lightroom Masterclasses', 'Campus Photo Exhibitions'],
        achievements: ['Exhibition in National Gallery of Modern Art Youth Gallery'],
      },
      {
        name: 'Zenith UI/UX & Design Society',
        slug: 'zenith-ui-ux-design-society',
        description: 'Figma wizards, interaction designers, brand architects, and design systems researchers.',
        category: 'Design & UI/UX',
        logo: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=400&fit=crop',
        college: c5._id,
        organizer: organizer2._id,
        membershipPolicy: 'Cross-college collaboration open for UI/UX portfolios.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['Figma 48-Hour UI Jams', 'Portfolio Reviews with FAANG Designers', 'Typography Workshops'],
        achievements: ['Dribbble Student Chapter of the Year 2025'],
      },
      {
        name: 'Horizon Rhythm & Dance Troupe',
        slug: 'horizon-rhythm-dance-troupe',
        description: 'Contemporary, Hip-Hop, Classical, and Street Dance crew participating in national college fests.',
        category: 'Dance & Choreography',
        logo: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=400&fit=crop',
        college: c2._id,
        organizer: organizer2._id,
        membershipPolicy: 'Internal college students preferred, guest guest slots open for inter-college choreo.',
        externalMembershipAllowed: false, // College specific to demonstrate restriction!
        status: 'active',
        activities: ['Choreography camps', 'Street Battle Face-offs', 'Flash mobs'],
        achievements: ['Mood Indigo Dance Showcase Top 3'],
      },
      {
        name: 'St. Jude Debating & Literary Society',
        slug: 'st-jude-debating-society',
        description: 'Parliamentary debating, Model United Nations, and critical philosophical discourse.',
        category: 'Literary & Debating',
        logo: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200&h=200&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop',
        college: c4._id,
        organizer: organizer1._id,
        membershipPolicy: 'Open to eloquent speakers across colleges in the NCR region.',
        externalMembershipAllowed: true,
        status: 'active',
        activities: ['Asian Parliamentary Debates', 'Model UN Mock Sessions', 'Editorial Newsletter'],
        achievements: ['Harvard MUN Best Delegate Citation 2025'],
      },
    ];

    const clubs = await Club.insertMany(clubsData);
    const [club1, club2, club3, club4, club5, club6, club7, club8] = clubs;
    console.log(`[Seed] Created ${clubs.length} clubs.`);

    console.log('[Seed] 4. Creating 10+ Diverse Events with varying Multi-College Scopes...');
    const now = new Date();
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'HackBengaluru 2026 — Pan-India Inter-College 36hr Hackathon',
        description: 'The flagship annual 36-hour hackathon hosted by Apex Institute of Technology. Build revolutionary solutions in Generative AI, Sustainable Tech, HealthTech, and Web3. Top mentors from Google, Microsoft, and Bangalore startups.',
        category: 'Hackathon',
        bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=500&fit=crop',
        organizer: organizer1._id,
        organizingCollege: c1._id,
        organizingClub: club1._id,
        startDate: futureDate(14),
        endDate: futureDate(16),
        registrationDeadline: futureDate(10),
        venue: 'APEX Innovation Arena, Block 4, Electronic City, Bengaluru',
        deliveryMode: 'offline',
        city: 'Bengaluru',
        eligibility: 'Open to undergraduate and postgraduate students from all registered colleges across India.',
        participationScope: 'all', // Open to ALL colleges!
        capacity: 250,
        registeredCount: 0,
        fee: 0,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 2,
        maxTeamSize: 4,
        tags: ['Hackathon', 'AI', 'FullStack', 'Bangalore', 'Prizes'],
        prizes: '₹2,50,000 Cash Pool + Cloud Credits + Direct Internship Interviews',
        contactEmail: 'hack@apex-tech.edu.in',
        contactPhone: '+91 98765 43210',
      },
      {
        title: 'National AI Summit & Kaggle War 2026',
        description: 'A 24-hour intense machine learning competition. Solve predictive modeling challenges, fine-tune open weights LLMs, and present live model interpretability dashboards.',
        category: 'Coding Competition',
        bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=500&fit=crop',
        organizer: organizer3._id,
        organizingCollege: c3._id,
        organizingClub: club2._id,
        startDate: futureDate(20),
        endDate: futureDate(21),
        registrationDeadline: futureDate(17),
        venue: 'Hybrid: Online Kaggle Portal + Vanguard High-Performance Computing Lab, Hyderabad',
        deliveryMode: 'hybrid',
        city: 'Hyderabad',
        eligibility: 'Open to engineering, statistics, and mathematics students from all colleges.',
        participationScope: 'all',
        capacity: 150,
        registeredCount: 0,
        fee: 0,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 1,
        maxTeamSize: 3,
        tags: ['MachineLearning', 'Python', 'Kaggle', 'DataScience'],
        prizes: '₹1,50,000 + GPU Compute Vouchers + Swag Kits',
        contactEmail: 'ai-summit@vanguard-univ.edu.in',
        contactPhone: '+91 98765 11223',
      },
      {
        title: 'Mumbai Venture Conclave: Student Startup Pitch 2026',
        description: 'Pitch your startup idea to top angel investors, early-stage VC funds, and successful startup founders. Seed funding and incubation support guaranteed for top 3 teams.',
        category: 'Technical Symposium',
        bannerImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=500&fit=crop',
        organizer: organizer2._id,
        organizingCollege: c2._id,
        organizingClub: club3._id,
        startDate: futureDate(25),
        endDate: futureDate(26),
        registrationDeadline: futureDate(22),
        venue: 'Auditorium A, Horizon Campus, Bandra Kurla Complex, Mumbai',
        deliveryMode: 'offline',
        city: 'Mumbai',
        eligibility: 'Student founders with an MVP or scalable business prototype.',
        participationScope: 'all',
        capacity: 80,
        registeredCount: 0,
        fee: 200,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 1,
        maxTeamSize: 4,
        tags: ['Startups', 'Pitching', 'VentureCapital', 'E-Cell', 'Mumbai'],
        prizes: '₹10,00,000 Seed Grant Consideration + Incubation Office Space',
        contactEmail: 'ecell@horizon.edu.in',
        contactPhone: '+91 98200 54321',
      },
      {
        title: 'RoboWars 2026 — Heavyweight Combat Arena',
        description: 'Design and fight heavyweight and featherweight combat robots in an armored bulletproof arena. Sparks will fly!',
        category: 'Robotics & Gaming',
        bannerImage: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&h=500&fit=crop',
        organizer: organizer3._id,
        organizingCollege: c3._id,
        organizingClub: club4._id,
        startDate: futureDate(30),
        endDate: futureDate(31),
        registrationDeadline: futureDate(24),
        venue: 'Vanguard Stadium Arena, HITEC City, Hyderabad',
        deliveryMode: 'offline',
        city: 'Hyderabad',
        eligibility: 'Inter-college robotics teams with certified battery and safety kill switches.',
        participationScope: 'selected_colleges', // Selected colleges only!
        allowedColleges: [c1._id, c2._id, c3._id, c5._id],
        capacity: 40,
        registeredCount: 0,
        fee: 500,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 2,
        maxTeamSize: 6,
        tags: ['RoboWars', 'CombatRobotics', 'Hardware', 'Engineering'],
        prizes: '₹1,00,000 Championship Trophy + Gold Medals',
        contactEmail: 'robotics@vanguard-univ.edu.in',
        contactPhone: '+91 98765 88990',
      },
      {
        title: 'Modern Full-Stack Cloud Architecture Workshop',
        description: 'Hands-on live virtual bootcamp covering React 19, Microservices, Node.js, Redis Caching, and AWS ECS deployments.',
        category: 'Workshop & Bootcamp',
        bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=500&fit=crop',
        organizer: organizer1._id,
        organizingCollege: c1._id,
        organizingClub: club1._id,
        startDate: futureDate(7),
        endDate: futureDate(8),
        registrationDeadline: futureDate(6),
        venue: 'Google Meet / Zoom Live Interactive Broadcast',
        deliveryMode: 'online',
        city: 'Online',
        eligibility: 'All college students interested in backend architecture.',
        participationScope: 'all',
        capacity: 500,
        registeredCount: 0,
        fee: 0,
        status: 'published',
        isTeamEvent: false,
        tags: ['Workshop', 'Cloud', 'NodeJS', 'SystemDesign', 'WebDev'],
        prizes: 'Verified Certificate of Completion + GitHub Repo Star Badges',
        contactEmail: 'events@apex-tech.edu.in',
      },
      {
        title: 'Apex Intra-College Algorithm Championship 2026',
        description: 'Internal competitive programming showdown exclusive to enrolled students of Apex Institute of Technology.',
        category: 'Coding Competition',
        bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=500&fit=crop',
        organizer: organizer1._id,
        organizingCollege: c1._id,
        organizingClub: club1._id,
        startDate: futureDate(12),
        endDate: futureDate(12),
        registrationDeadline: futureDate(11),
        venue: 'Computer Science Lab 3, Apex Campus, Bengaluru',
        deliveryMode: 'offline',
        city: 'Bengaluru',
        eligibility: 'Strictly restricted to Apex Institute of Technology students.',
        participationScope: 'own_college_only', // Own college only!
        capacity: 60,
        registeredCount: 0,
        fee: 0,
        status: 'published',
        isTeamEvent: false,
        tags: ['Algorithms', 'DataStructures', 'IntraCollege', 'ApexOnly'],
        prizes: '₹25,000 + College Trophy',
        contactEmail: 'internal-cp@apex-tech.edu.in',
      },
      {
        title: 'All-India Inter-University Youth Cultural Fest: TARANG 2026',
        description: 'Three days of music bands, battle of the DJs, street theatre, mono-acting, and classical fusion dance.',
        category: 'Cultural Fest',
        bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop',
        organizer: organizer2._id,
        organizingCollege: c2._id,
        organizingClub: club7._id,
        startDate: futureDate(40),
        endDate: futureDate(43),
        registrationDeadline: futureDate(35),
        venue: 'Open Air Amphitheatre, Horizon College, Mumbai',
        deliveryMode: 'offline',
        city: 'Mumbai',
        eligibility: 'College cultural contingents from any recognized university.',
        participationScope: 'all',
        capacity: 1000,
        registeredCount: 0,
        fee: 100,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 1,
        maxTeamSize: 15,
        tags: ['CulturalFest', 'Music', 'Dance', 'Theatre', 'Mumbai'],
        prizes: '₹3,00,000 Total Prizes across 18 competitive categories',
        contactEmail: 'tarang@horizon.edu.in',
      },
      {
        title: 'National Parliamentary Debate: The Delhi Dialectic 2026',
        description: 'Elite Asian Parliamentary format debating championship debating geopolitical strategy, AI ethics, and economic reform.',
        category: 'Seminar & Guest Lecture',
        bannerImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&h=500&fit=crop',
        organizer: organizer1._id,
        organizingCollege: c4._id,
        organizingClub: club8._id,
        startDate: futureDate(18),
        endDate: futureDate(19),
        registrationDeadline: futureDate(15),
        venue: 'Council Hall, St. Jude Metropolitan College, New Delhi',
        deliveryMode: 'offline',
        city: 'New Delhi',
        eligibility: '3-member institutional debate contingents.',
        participationScope: 'all',
        capacity: 120,
        registeredCount: 0,
        fee: 300,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 3,
        maxTeamSize: 3,
        tags: ['Debate', 'ModelUN', 'PublicSpeaking', 'Delhi'],
        prizes: 'The St. Jude Rolling Trophy + ₹75,000 Cash',
        contactEmail: 'debatesoc@stjude-metro.edu.in',
      },
      {
        title: 'UI/UX Design Sprint 2026: Designing for Next Billion Users',
        description: '48-hour remote design hackathon. Redesign accessible mobile products for rural commerce, public healthcare, and regional education.',
        category: 'Workshop & Bootcamp',
        bannerImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&h=500&fit=crop',
        organizer: organizer2._id,
        organizingCollege: c5._id,
        organizingClub: club6._id,
        startDate: futureDate(22),
        endDate: futureDate(24),
        registrationDeadline: futureDate(19),
        venue: 'Discord & Figma Online Jam Room',
        deliveryMode: 'online',
        city: 'Online',
        eligibility: 'Student product designers, visual artists, and user researchers.',
        participationScope: 'all',
        capacity: 200,
        registeredCount: 0,
        fee: 0,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 1,
        maxTeamSize: 3,
        tags: ['UIUX', 'Figma', 'DesignSprint', 'ProductDesign'],
        prizes: '₹80,000 + 1-Year Figma Professional Licenses + Mentorship',
        contactEmail: 'design@zenith-tech.edu.in',
      },
      {
        title: 'CyberDefend 2026: Capture The Flag (CTF) Tournament',
        description: 'Jeopardy-style offensive and defensive cybersecurity tournament. Cryptography, Reverse Engineering, Binary Exploitation, and Web Exploits.',
        category: 'Coding Competition',
        bannerImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=500&fit=crop',
        organizer: organizer1._id,
        organizingCollege: c1._id,
        organizingClub: club1._id,
        startDate: futureDate(35),
        endDate: futureDate(36),
        registrationDeadline: futureDate(32),
        venue: 'Online CTF Arena',
        deliveryMode: 'online',
        city: 'Online',
        eligibility: 'Open to ethical hackers and cybersecurity students across India.',
        participationScope: 'all',
        capacity: 300,
        registeredCount: 0,
        fee: 0,
        status: 'published',
        isTeamEvent: true,
        minTeamSize: 1,
        maxTeamSize: 4,
        tags: ['Cybersecurity', 'CTF', 'Hacking', 'Infosec'],
        prizes: '₹1,20,000 + Security Certifications Vouchers',
        contactEmail: 'ctf@apex-tech.edu.in',
      },
      {
        title: 'Previous Autumn Inter-College Hackathon 2025 (Concluded)',
        description: 'The previous edition of our inter-college hackathon showcasing historical event records and participation.',
        category: 'Hackathon',
        bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&h=500&fit=crop',
        organizer: organizer1._id,
        organizingCollege: c1._id,
        startDate: pastDate(60),
        endDate: pastDate(58),
        registrationDeadline: pastDate(65),
        venue: 'Bengaluru Convention Hall',
        deliveryMode: 'offline',
        city: 'Bengaluru',
        eligibility: 'All colleges',
        participationScope: 'all',
        capacity: 200,
        registeredCount: 180,
        fee: 0,
        status: 'completed',
        isTeamEvent: true,
        tags: ['Hackathon', 'PastEvent'],
        contactEmail: 'hack@apex-tech.edu.in',
      },
    ];

    const events = await Event.insertMany(eventsData);
    const [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11] = events;
    console.log(`[Seed] Created ${events.length} events.`);

    console.log('[Seed] 5. Creating Demonstrative Inter-College Event Registrations...');
    // Aarav (Student from Apex c1) registers for HackBengaluru (e1)
    const reg1 = await EventRegistration.create({
      event: e1._id,
      student: student1._id,
      college: c1._id,
      registrationStatus: 'confirmed',
      notes: 'Leading Team ByteCraft in the AI track.',
    });
    e1.registeredCount += 1;
    await e1.save();

    // Pooja (Student from Horizon c2) registers for HackBengaluru (e1) — Cross-College discovery & registration!
    const reg2 = await EventRegistration.create({
      event: e1._id,
      student: student2._id,
      college: c2._id,
      registrationStatus: 'confirmed',
      notes: 'Interested in partnering on multi-modal AI systems.',
    });
    e1.registeredCount += 1;
    await e1.save();

    // Kabir (Student from Vanguard c3) registers for Workshop (e5)
    const reg3 = await EventRegistration.create({
      event: e5._id,
      student: student3._id,
      college: c3._id,
      registrationStatus: 'confirmed',
    });
    e5.registeredCount += 1;
    await e5.save();

    // Diya (Student from St. Jude c4) registers for UI/UX Sprint (e9)
    const reg4 = await EventRegistration.create({
      event: e9._id,
      student: student4._id,
      college: c4._id,
      registrationStatus: 'confirmed',
    });
    e9.registeredCount += 1;
    await e9.save();

    // Aarav attended past event e11
    await EventRegistration.create({
      event: e11._id,
      student: student1._id,
      college: c1._id,
      registrationStatus: 'attended',
      attendanceStatus: true,
    });

    console.log('[Seed] 6. Creating Sample Club Membership Requests & Approvals...');
    // Aarav joined Apex Coders Collective (approved)
    await ClubMembership.create({
      club: club1._id,
      student: student1._id,
      college: c1._id,
      status: 'approved',
      reviewedBy: organizer1._id,
      reviewedAt: new Date(),
    });

    // Pooja (c2) requested membership in Vanguard AI Lab (c3) — Demonstrating Cross-College Club Request!
    await ClubMembership.create({
      club: club2._id,
      student: student2._id,
      college: c2._id,
      status: 'pending',
      requestMessage: 'I am an AI & Data Science sophomore at Horizon Mumbai and would love to join research sprints.',
    });

    // Kabir (c3) requested membership in Apex Coders (c1) (pending)
    await ClubMembership.create({
      club: club1._id,
      student: student3._id,
      college: c3._id,
      status: 'pending',
      requestMessage: 'Looking forward to participating in open source dev pods.',
    });

    console.log('[Seed] 7. Creating Teammate Collaboration Posts...');
    await Post.create({
      author: student1._id,
      college: c1._id,
      title: 'Looking for a Machine Learning engineer for HackBengaluru 2026!',
      content: 'Hey everyone! We have a full-stack developer (React/Node) and a product designer ready for HackBengaluru 2026. We need a strong teammate skilled in Python and PyTorch / LangChain to build an automated emergency response assistant.',
      type: 'collaboration',
      requiredSkills: ['Python', 'PyTorch', 'LangChain', 'FastAPI'],
      relatedEvent: e1._id,
      comments: [
        {
          user: student2._id,
          text: 'Hey Aarav! I am working on LLM fine-tuning at Horizon Mumbai. Would love to team up! Sent you a connection request.',
          createdAt: new Date(),
        },
      ],
    });

    await Post.create({
      author: student3._id,
      college: c3._id,
      title: 'Seeking Frontend & UI/UX wizard for autonomous drone ground station app',
      content: 'We are developing an IoT hardware telemetry viewer for search-and-rescue quadcopters. Need someone to create a sleek dashboard in React or Tailwind.',
      type: 'collaboration',
      requiredSkills: ['React.js', 'Tailwind CSS', 'Figma', 'WebSockets'],
    });

    console.log('[Seed] 8. Creating Inter-College Student Connections...');
    // Pooja connected with Aarav
    await Connection.create({
      requester: student2._id,
      recipient: student1._id,
      status: 'accepted',
      message: 'Hi Aarav, loved your post about HackBengaluru. Let us connect!',
    });

    // Kabir sent pending connection to Aarav
    await Connection.create({
      requester: student3._id,
      recipient: student1._id,
      status: 'pending',
      message: 'Hey Aarav, saw your profile on CampusConnect! Great skill set.',
    });

    console.log('[Seed] 9. Creating Sample Notifications...');
    await Notification.create({
      recipient: student1._id,
      type: 'registration_status',
      title: 'Registration Confirmed: HackBengaluru 2026',
      message: `Your ticket ID is ${reg1.ticketCode}. Check event details for schedule.`,
      link: `/events/${e1._id}`,
    });

    await Notification.create({
      recipient: student2._id,
      type: 'connection_request',
      title: 'Connected with Aarav Mehta',
      message: 'Aarav Mehta accepted your connection request.',
      link: '/teammates',
    });

    console.log('[Seed] 10. Creating Inter-College Team...');
    const sampleTeam = await Team.create({
      name: 'Team ByteCraft',
      event: e1._id,
      leader: student1._id,
      projectIdea: 'Autonomous Crisis Dispatcher using AI Agents and real-time mesh routing.',
      maxMembers: 4,
      status: 'forming',
      members: [
        {
          user: student1._id,
          roleInTeam: 'Team Lead & Backend',
          joinedAt: new Date(),
        },
        {
          user: student2._id,
          roleInTeam: 'AI / Model Engineer',
          joinedAt: new Date(),
        },
      ],
    });

    console.log('====================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Credentials for Evaluation:');
    console.log('Password for all demo accounts: password123');
    console.log('----------------------------------------------------');
    console.log('👑 Platform Administrator:');
    console.log('   Email: admin@campusconnect.edu');
    console.log('   (Can verify colleges, suspend users, view platform-wide charts)');
    console.log('');
    console.log('🏛️ College Administrators:');
    console.log('   Apex Institute: admin@apex-tech.edu.in');
    console.log('   Horizon College: admin@horizon.edu.in');
    console.log('');
    console.log('🎪 Organizers:');
    console.log('   Apex Organizer: organizer.apex@campusconnect.edu');
    console.log('   Horizon Organizer: organizer.horizon@campusconnect.edu');
    console.log('   Vanguard Organizer: organizer.vanguard@campusconnect.edu');
    console.log('');
    console.log('🎓 Students (Multi-College):');
    console.log('   Apex Tech Student: aarav.student@campusconnect.edu');
    console.log('   Horizon College Student: pooja.student@campusconnect.edu');
    console.log('   Vanguard Student: kabir.student@campusconnect.edu');
    console.log('   St. Jude Student: diya.student@campusconnect.edu');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
