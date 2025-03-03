// src/config/campaignOptions.js
export const targetIndustriesOptions = [
    { value: 'Enterprise Software', label: 'Enterprise Software' },
    { value: 'FinTech', label: 'FinTech' },
    { value: 'Healthcare Tech', label: 'Healthcare Tech' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Professional Services', label: 'Professional Services' },
    { value: 'Retail Tech', label: 'Retail Tech' },
    { value: 'SaaS', label: 'SaaS' },
    { value: 'Telecommunications', label: 'Telecommunications' },
  ];
  
  export const companySizeOptions = [
    { value: '50-200 employees', label: '50-200 employees' },
    { value: '201-500 employees', label: '201-500 employees' },
    { value: '501-1000 employees', label: '501-1000 employees' },
    { value: '1001-5000 employees', label: '1001-5000 employees' },
    { value: '5000+ employees', label: '5000+ employees' },
  ];
  
  export const jobTitlesOptions = [
    { value: 'CTO', label: 'CTO' },
    { value: 'VP of Engineering', label: 'VP of Engineering' },
    { value: 'Head of IT', label: 'Head of IT' },
    { value: 'Director of Technology', label: 'Director of Technology' },
    { value: 'VP of Operations', label: 'VP of Operations' },
    { value: 'Head of Digital Transformation', label: 'Head of Digital Transformation' },
    { value: 'IT Manager', label: 'IT Manager' },
    { value: 'Technical Director', label: 'Technical Director' },
  ];
  
  export const personalizationVariablesOptions = [
    { value: 'firstName', label: '{firstName} - Prospect\'s first name' },
    { value: 'company', label: '{company} - Company name' },
    { value: 'industry', label: '{industry} - Company industry' },
    { value: 'pain_point', label: '{pain_point} - Main pain point' },
    { value: 'sender_name', label: '{sender_name} - Your name' },
  ];
  
  export const emailTemplates = [
    {
      id: 'pain-point',
      name: 'Pain Point Focus',
      subject: 'Solving {pain_point} at {company}',
      content: `Hi {firstName},\n\nI noticed {company} has been working on {initiative} and might be experiencing challenges with {pain_point}.\n\nWe've helped similar {industry} companies:\n• Reduce process time by 45%\n• Increase efficiency by 60%\n• Save $500K+ annually\n\nWould you be open to a 15-minute call to explore how we could achieve similar results for {company}?\n\nBest regards,\n{sender_name}`,
    },
    {
      id: 'social-proof',
      name: 'Industry Social Proof',
      subject: 'How {competitor} achieved {benefit}',
      content: `Hi {firstName},\n\nI recently helped {competitor} achieve {benefit} through our {solution_category} platform, and I thought {company} might be interested in similar results.\n\nSpecifically, they were able to:\n• {benefit_1}\n• {benefit_2}\n• {benefit_3}\n\nWould you be interested in a brief call to discuss how we could implement a similar solution for {company}?\n\nBest regards,\n{sender_name}`,
    },
    {
      id: 'trigger-event',
      name: 'Trigger Event',
      subject: 'Regarding {company}\'s recent {event}',
      content: `Hi {firstName},\n\nCongratulations on {company}'s recent {event}. This type of growth often leads to challenges in {pain_point}.\n\nWe've helped other {industry} companies navigate similar growth phases by:\n• {solution_1}\n• {solution_2}\n• {solution_3}\n\nWould you be open to a quick discussion about how we could support {company}'s growth?\n\nBest regards,\n{sender_name}`,
    },
  ];
  
  export const followUpTemplates = [
    {
      id: 'bump-1',
      name: 'Gentle Bump',
      subject: 'Re: {previous_subject}',
      content: `Hi {firstName},\n\nI wanted to follow up on my previous email about helping {company} with {pain_point}.\n\nWould you be open to a quick chat this week?\n\nBest regards,\n{sender_name}`,
    },
    {
      id: 'value-add',
      name: 'Value-Add Follow-up',
      subject: 'Resource: Solving {pain_point}',
      content: `Hi {firstName},\n\nI thought you might find this case study interesting - it shows how {similar_company} solved their {pain_point} challenges.\n\nKey highlights:\n• {highlight_1}\n• {highlight_2}\n• {highlight_3}\n\nWould you like to discuss how we could implement similar solutions at {company}?\n\nBest regards,\n{sender_name}`,
    },
  ];