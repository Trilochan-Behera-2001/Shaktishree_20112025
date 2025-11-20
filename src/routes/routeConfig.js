export const routes = {
  login: { path: "/login", label: "Login", protected: false },
  speakOutMsg: { path: "/share-post/:shareCode" , label: "speakOutMsg", protected: false },
  dashboard: { path: "/home", label: "Dashboard", protected: true },
  users: { path: "/users", label: "Users", protected: true },
  settings: { path: "/settings", label: "Settings", protected: true },
  addregisteruser: { path: '/register', label: 'addregisteruser', protected: true },
  changepassword: { path: '/changepassword', label: 'changepassword', protected: true },

faqType: { path: '/faqType/getAllFAQTypes', label: 'faqtype', protected: true },
  faqQuestionAnswer: { path: '/faq/getAllFaqs', label: 'faqQuestionAnswer', protected: true },
  registeredUsersPage: { path: '/registeredUsersPage', label: 'registeredUsersPage', protected: true },
  incidentReportsPage: { path: '/reportincedentlist', label: 'incidentReportsPage', protected: true },
  addKnowlege: { path: '/sks/get-document', label: 'addKnowlege', protected: true },
  knowledgeType: { path: '/sks/get-doc-type', label: 'knowledgeType', protected: true },
  safetyCheckinsPage: { path: '/safetyCheckinsPage', label: 'safetyCheckinsPage', protected: true },
  shaktiRaKahani: { path: '/speakOutCirclePage', label: 'shaktiRaKahani', protected: true },
  registerForApa:{ path: '/register-for-apa', label: 'Register APA', protected: true },


  eventType: { path: '/sks/get-event-type', label: 'eventtype', protected: true },
  addevent: { path: '/sks/get-event-training', label: 'addevent', protected: true },
  addlearning: { path: '/sks/get-Learning-details', label: 'addlearning', protected: true },
  addlearningtype: { path: '/sks/get-learning-type', label: 'addlearningtype', protected: true },
  adminrolemenumap: { path: '/admin/menu/role/list', label: 'adminrolemenumap', protected: true },
  
  // CMS Routes
  cmsLandingPage: { path: "/", label: 'CMS Landing Page', protected: true },
  cmsEditor: { path: '/cms/editor', label: 'CMS Editor', protected: true },
  quizCreators: { path: '/quiz/get-quiz-question-map', label: 'QuizCreator', protected: true },
  quizMaster: { path: '/quiz/get-quiz-list', label: 'Quiz Master', protected: true },
  apaInteraction: { path: '/get-all-college-by-district', label: 'ApaInteraction', protected: true },

  logviewer:{path:'/logviewer', label:'logviewer',protected:true},
  aparegisterlist:{path:'/apa-list', label:'aparegisterlist',protected:true},
  commoncategory:{path:'/quiz/get-category', label:'commoncategory',protected:true},
  addQuestionpaper:{path:'/quiz/get-question-list', label:'addquestionpaper',protected:true},
  dashboardCardDetails: { path: '/dashboard/card/:cardType', label: 'Dashboard Card Details', protected: true },
  reportincedentlist:{path:'/incidentReportsPage', label:'reportincedentlist',protected:true},
  reportincedentdetails:{path:'/reportincedentdetails', label:'reportincedentdetails',protected:true},
  annualReport:{path:'/annualreport', label:'Annual Report',protected:true},
  eventRegiList:{path:'/sks/fetch-event-registration-details', label:'Event Registration List',protected:true},


  meetingList:{path:'/meetingList', label:'Meeting List',protected:true},



  
  notFound: { path: "*", label: "Not Found", protected: false },
  forbidden: { path: "/forbidden", label: "Forbidden", protected: false },
};