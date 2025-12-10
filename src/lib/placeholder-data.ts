export const skills = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'GraphQL',
  'UI/UX Design',
  'Figma',
  'Web Development',
  'Firebase',
  'Tailwind CSS',
];

export const projects = [
  {
    title: 'E-commerce Platform',
    description:
      'A full-stack e-commerce solution with a custom CMS, payment integration, and a user-friendly interface.',
    tags: ['Next.js', 'TypeScript', 'Stripe', 'GraphQL'],
    imageId: 'project-1',
    link: '#',
  },
  {
    title: 'Data Analytics Dashboard',
    description:
      'A real-time data visualization dashboard for business intelligence and analytics, built with React and D3.js.',
    tags: ['React', 'D3.js', 'Node.js', 'WebSocket'],
    imageId: 'project-2',
    link: '#',
  },
  {
    title: 'SaaS Landing Page',
    description:
      'A high-converting, responsive landing page for a SaaS product, focusing on performance and SEO.',
    tags: ['Figma', 'UI/UX', 'Next.js', 'Tailwind CSS'],
    imageId: 'project-3',
    link: '#',
  },
];

export const blogPosts = [
  {
    title: 'The Future of Web Development with AI',
    description:
      'Exploring how artificial intelligence is reshaping the landscape of web development and what it means for developers.',
    author: 'Dipanjan S. PRANGON',
    date: '2024-07-20',
    tags: ['AI', 'Web Development', 'Future Tech'],
    imageId: 'blog-1',
  },
  {
    title: 'Mastering UI/UX: A Beginner\'s Guide',
    description:
      'A comprehensive guide to the fundamental principles of UI/UX design, with practical tips and resources.',
    author: 'Dipanjan S. PRANGON',
    date: '2024-06-15',
    tags: ['UI/UX', 'Design', 'Beginners'],
    imageId: 'blog-2',
  },
  {
    title: 'Why I Chose Next.js for My Personal Projects',
    description:
      'A deep dive into the features and benefits of Next.js that make it my go-to framework for modern web applications.',
    author: 'Dipanjan S. PRANGON',
    date: '2024-05-28',
    tags: ['Next.js', 'React', 'JavaScript'],
    imageId: 'blog-3',
  },
  {
    title: '10 Motivational Tips for Aspiring Developers',
    description:
      'Staying motivated is key to success. Here are 10 tips that have helped me on my journey as a developer.',
    author: 'Dipanjan S. PRANGON',
    date: '2024-04-10',
    tags: ['Motivation', 'Career', 'Development'],
    imageId: 'blog-4',
  },
];

export const ebooks = [
  {
    title: 'The Complete Guide to Modern React',
    description:
      'Everything you need to know about React, from hooks to context and beyond. Includes practical examples and projects.',
    imageId: 'ebook-1',
    downloadLink: '#',
  },
  {
    title: 'UI/UX for Dummies',
    description:
      'A simplified approach to understanding and implementing great UI/UX design in your projects. No jargon, just results.',
    imageId: 'ebook-2',
    downloadLink: '#',
  },
  {
    title: 'Freelancing 101: Your First Year',
    description:
      'A practical guide to navigating your first year as a freelance developer, from finding clients to managing finances.',
    imageId: 'ebook-3',
    downloadLink: '#',
  },
];

export const services = [
  {
    title: 'Web Development',
    description:
      'Building high-performance, scalable, and secure web applications using modern technologies. From static sites to complex single-page applications, I provide end-to-end development services tailored to your needs.',
    details: [
      'Front-end development with React and Next.js',
      'Back-end development with Node.js and Express',
      'Database design and management (SQL & NoSQL)',
      'API development and integration (REST & GraphQL)',
    ],
  },
  {
    title: 'UI/UX Design',
    description:
      'Crafting intuitive, engaging, and aesthetically pleasing user interfaces that provide a seamless user experience. My design process is user-centric, focusing on research, wireframing, prototyping, and testing.',
    details: [
      'User research and persona creation',
      'Wireframing and interactive prototyping with Figma',
      'User journey mapping and information architecture',
      'Responsive design for web and mobile',
    ],
  },
  {
    title: 'Consulting & Mentorship',
    description:
      'Providing expert advice on technology stacks, project architecture, and development best practices. I also offer personalized mentorship for aspiring developers looking to grow their skills and advance their careers.',
    details: [
      'Code reviews and performance optimization',
      'Technical strategy and roadmap planning',
      '1-on-1 mentorship sessions',
      'Team training and workshops',
    ],
  },
];

export const campaigns: {
    id: number;
    title: string;
    slug: string;
    description: string;
    goal: number;
    raised: number;
    imageId: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    category?: 'Seasonal' | 'Emergency' | 'Regular';
}[] = [
  {
    id: 1,
    title: 'Winter Clothing Drive',
    slug: 'winter-clothing-drive',
    description:
      'Help provide warm clothing to underprivileged communities during the harsh winter months.',
    goal: 50000,
    raised: 28000,
    imageId: 'project-1',
    status: 'active',
    category: 'Seasonal',
  },
  {
    id: 2,
    title: 'Education for All',
    slug: 'education-for-all',
    description:
      "Support children's education by providing books, stationery, and school fees.",
    goal: 100000,
    raised: 45000,
    imageId: 'project-2',
    status: 'active',
    category: 'Regular',
  },
  {
    id: 3,
    title: 'Emergency Flood Relief',
    slug: 'emergency-flood-relief',
    description:
      'Contribute to our fund for providing emergency flood relief and medical assistance to those in need.',
    goal: 75000,
    raised: 60000,
    imageId: 'project-3',
    status: 'active',
    category: 'Emergency',
  },
];
