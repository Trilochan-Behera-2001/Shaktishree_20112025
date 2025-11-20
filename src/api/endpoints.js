export const endpoints = {
  addeventtype: {
    add: `sks/save-event-type`,
    list: `sks/get-event-type`,
    update: `sks/edit-event-type`,
    eventstatustype: `sks/event-status-type`,
    eventregiDetails: `sks/fetch-event-registration-details`,
  },
  addevent: {
    dropdowneventtype: `sks/get-event-type`,
    saveevent: `sks/save-event-and-training`,
    eventlist: `sks/get-event-details`,
    eventupdate: `sks/edit-event-training`,
    eventstatus: `sks/active-inactive-event`,
    viewimage: `allowAll/image/viewDocuments`,
  },
  learningtype: {
    addlearningtype: `sks/save-training-type`,
    list: `sks/get-training-type`,
    update: `sks/edit-training-type`,
    learningstatus: `sks/training-type-status`,
  },
  addlearning: {
    dropdownaddlearning: `sks/get-training-details`,
    savelearning: `sks/save-training`,
    editaddlearning: `sks/edit-learning-training`,
    statusaddlearn: `sks/active-inactive-learning-details`,
    viewDocuments:`/allowAll/image/viewDocuments`,
  },
  faqType: {
    faqTypeSave: "/faqType/saveOrUpdateFAQType",
    faqAll: "/faqType/getAllFAQTypes",
    statuschange: "/faqType/toggleFAQTypeStatus",
    editFAQtype: "/faqType/editFAQType",
  },
  faqQuestionAnswer: {
    getFaQs: "/faq/getAllFaqs",
    statusChange: "/faq/toggleFaqStatus",
    saveFaq: "/faq/saveOrUpdateFaq",
    editFaqQuestion: "/faq/editFaq",
  },
  administration: {
    registeredUsers: "/registeredUsersPage",
    incidentReports: "/report/incident/list",
    safetyCheckins: "/safety/checkIn/list",
    shaktiKahani: "/speakOutCirclePage",
  },
  knowledgeType: {
    knowledgeTypeAdd: "/sks/save-doc-type",
    getDocType: "/sks/get-doc-type",
    updateDocType: "/sks/update-doc-type",
    toggleDocTypeStatus: "/sks/doc-status-type",
  },
  addKnowledge: {
    getDocument: "/sks/get-document",
    saveDocument: "/sks/save-document",
    updateDoc: "/sks/update-document",
    changeDocStatus: "/sks/status-document",
  },
  registerApa: {
    options: "/register-for-apa",
    generateOTP: "/generate-otp",
    verifyOtp: "/verify-otp",
    apaDetails: "/save-sks-apa-data",
    getApaList:"/apa-list",
    emailCheck: "/duplicate/email",
  },
  adminrolemenumap: {
    getrolemenulist: "/admin/menu/role/list",
    getAssignedMenu: "/admin/menu",
    assignRolemenusave: "/admin/menu/assign",
  },
  allTraining: {
    add: `/sks/save-training`,
    list: `/sks/get-training-details`,
  },
  authtype: {
    login: `/allowAll/authenticate`,
    logout: `/sign-off`,
    getCaptcha: `/allowAll/captcha/generate`,
    userProfile: `/profile`,
  },
  changeCaptch: {
    list: `/allowAll/captcha/change-password/5`,
    add: `/change/password`,
  },
  forgotCaptcha: {
    list: `/allowAll/captcha/forgotpassword/5`,
    otpGenerate: `/allowAll/otp-sent-for-forgot-password`,
    updatePassword: `/allowAll/update-forgot-password`,
  },
  menuListAll: {
    list: `/admin/menu/list`,
  },
  userCreate: {
    add: `/add/shaktishree/user`,
    memberList: `/register`,
    staffDetails: `/staff/details`,
    userGenderList: `/gender/list`,
    memberNameCheck: `/duplicate_checkMemberName`,
    adharCheck: `/duplicate_aadharno_no`,
    emailCheck: `/duplicate_email`,
  },
  logViewer:{
    logviewerlist: `log/fetchLog`,
    catlogviewerlist:`log/fetch-cat-log`,
    downlodeLog:`log/downloadLog`,
    downlodcatlog:`log/download-cat-log`
  },

  commonCategory:{
    saveDataCategory:`quiz/save-category-master`,
    getCategoryTableData:`quiz/get-category`,
    editCategorydata:`quiz/edit-category`,
    statusCategory:`quiz/category-status`
  },

  addquestionpaper: {
    questionpaperlist: `/quiz/get-question-list`,
    checkcategorypresent:`/quiz/check-category-present`,
    quationpapersave: `/quiz/save-question`,
    quationtablelist:`/quiz/get-question-list`,
    quationpaperedit: `/quiz/edit-questions`,
    // quationpaperstatus: ``,
    // viewDocumentsquestion:``,
  },
  apaInteraction:{
    list:`/get-all-college-by-district`,
    add:`/save-intraction`,
    apatableList:`/get-all-intraction`
  },
  dashboardCard:{
    list:`/home`,
    registeredUserList:`/registeredUsersPage`,
    safetyCheckinsList:`/safety/checkIn/list`,
    speakOutCirclePageList:`/speakOutCirclePage`,
    reportIncidentList:`/report/incident/list`,
    sosReportList:`/sos-count`,
    monthWiseIncidentList:`/incident-count`,
    chartTrainingList:`/training`,
    topFiveIncident:`/top-incident`,
    bottomIncident:`/bottom-incident`

  },
  quizCreatorAll:{
    listFiled:`/quiz/get-quiz-question-map`,
    quizListSelect:`/quiz/check-quiz-present-in-map`,
    filterSubmit:`/quiz/question-filter-by-category`,
    saveQuizCreator:`/quiz/map-quiz-question`,
    editListFiled:`/quiz/edit-quiz-mapping`,
    statusChange:`/quiz/quiz-mapping-status`
  },

  quizMaster:{
    saveQuizMaster:`/quiz/save-quiz`,
    tableListQuizmasterData:`/quiz/get-quiz-list`,
    editQuizMaster:`/quiz/edit-quiz`,
    statusQuizMaster:`/quiz/quiz-status`,
  },

  reportIncedentList:{
    getreportIncedent:`/report/incident/list`,
    viewdetailsprofile:`/report/incident/dtls`,
    viewvideoandaudio:`allowAll/image/viewDocuments`,
    modelapprovedatasave:`/action/authority`
  },
  annualReportApi:{
    saveAnnualReport:`/sks/annualrprt/save`,
    getAnnualReport:`/sks/getAllAnnualReportFields`,
    editAnnualReport:`/sks/edit-annual-report`,
    statusAnnualReport:`/sks/annual-report-status`,
  },
  speakOutMsg:{
    allSpeakOutMsg:`/allowAll/post/getByShareCode`
  },
  meetingManagement:{
    getMeetingList:`/get-all-meetings`
  }
  // cms: {
  //   landingPage: `/cms/landing-page`,
  //   menuItems: `/cms/menu-items`,
  //   bannerContent: `/cms/banner-content`,
  //   footerContent: `/cms/footer-content`,
  // }
};