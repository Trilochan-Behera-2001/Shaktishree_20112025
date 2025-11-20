import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { routes } from "./routeConfig";
import Loader from "../components/common/Loader";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import NotFound from "../pages/notfound/NotFound";
import SpeakOutMsg from "../pages/SpeakOutMsg/SpeakOutMsg";
import Home from "../pages/cms/Home";
import MeetingList from "../pages/meetingManagement/MeetingList";


const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const AnnualReport = lazy(() => import("../pages/AnnualReport/AnnualReport"));
const FaQType = lazy(() => import("../pages/FAQs/FaQType"));
const FaqQuestionAnswer = lazy(() => import("../pages/FAQs/FaqQuestionAnswer"));
const AddEventType = lazy(() => import("../pages/eventType/AddEventType"));
const AddEvent = lazy(() => import("../pages/eventType/AddEvent"));
const RegisterUser = lazy(() => import("../pages/RegisterUser/RegisterUser"));
const ChangePassword = lazy(() => import("../pages/ChangePassword/ChangePassword"));
const RegistrationUserList = lazy(() => import("../pages/administration/RegistrationUserList"));
const IncidentReportList = lazy(() => import("../pages/administration/IncidentReportList"));
const SafetyCheckInList = lazy(() => import("../pages/administration/SafetyCheckInList"));
const ShaktiRaKahani = lazy(() => import("../pages/administration/ShaktiRaKahani"));
const KnowledgeAdd = lazy(() => import("../pages/knowledge/KnowledgeAdd"));
const KnowledgeType = lazy(() => import("../pages/knowledge/KnowledgeType"));
const AddLearningType = lazy(() => import("../pages/learning/AddLearningType"));
const AddLearning = lazy(() => import("../pages/learning/AddLearning"));
const AdminRoleMenuMap = lazy(() => import("../pages/AdminRoleMenu/AdminRoleMenuMap"));
const ApaRegistration = lazy(() => import("../pages/registerForApa/ApaRegistration"));
const QuizCreator = lazy(() => import("../pages/Quiz/QuizCreator/QuizCreator"));
const QuizMaster = lazy(() => import("../pages/Quiz/QuizMaster/QuizMaster"));
const ApaInteraction = lazy(() => import("../pages/ApaInteraction/ApaInteraction"));
const ApaRegistergerList = lazy(() => import("../pages/registerForApa/ApaRegisterList"));
const LogViewer = lazy(() => import("../pages/logviewer/LogViewer"));
const CommonCategory = lazy(() => import("../pages/Quiz/CommonCategory"));
const AddQueationPaper = lazy(() => import("../pages/Quiz/AddQuestionPaper"));
const DashboardCardDetails = lazy(() => import("../pages/dashboard/DashboardCardDetails/DashboardCardDetails"));
const ReportIncidentList = lazy(() => import("../pages/reportIncendent/ReportIncidentList"));
const ReportIncedentViewList = lazy(() => import("../pages/reportIncendent/ReportIncedentViewList"));
const EventRegistraionList = lazy(() => import("../pages/eventType/EventRegistraionList"));

const withSuspense = (Component) => {
  const WrappedComponent = Component;
  return (
    <Suspense fallback={<Loader loading={true} />}>
      <WrappedComponent />
    </Suspense>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={routes.cmsLandingPage.path} element={<Home />} />
      <Route path={routes.speakOutMsg.path} element={<SpeakOutMsg />} />

      <Route element={<AuthLayout />}>
        <Route path={routes.login.path} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={routes.dashboard.path} element={withSuspense(DashboardPage)} />
          <Route path={routes.faqType.path} element={withSuspense(FaQType)} />
          <Route path={routes.faqQuestionAnswer.path} element={withSuspense(FaqQuestionAnswer)} />
          <Route path={routes.eventType.path} element={withSuspense(AddEventType)} />
          <Route path={routes.addevent.path} element={withSuspense(AddEvent)} />
          <Route path={routes.addregisteruser.path} element={withSuspense(RegisterUser)} />
          <Route path={routes.changepassword.path} element={withSuspense(ChangePassword)} />
          <Route path={routes.registeredUsersPage.path} element={withSuspense(RegistrationUserList)} />
          <Route path={routes.incidentReportsPage.path} element={withSuspense(IncidentReportList)} />
          <Route path={routes.safetyCheckinsPage.path} element={withSuspense(SafetyCheckInList)} />
          <Route path={routes.shaktiRaKahani.path} element={withSuspense(ShaktiRaKahani)} />
          <Route path={routes.addKnowlege.path} element={withSuspense(KnowledgeAdd)} />
          <Route path={routes.knowledgeType.path} element={withSuspense(KnowledgeType)} />
          <Route path={routes.addlearningtype.path} element={withSuspense(AddLearningType)} />
          <Route path={routes.addlearning.path} element={withSuspense(AddLearning)} />
          <Route path={routes.adminrolemenumap.path} element={withSuspense(AdminRoleMenuMap)} />
          <Route path={routes.registerForApa.path} element={withSuspense(ApaRegistration)} />
          <Route path={routes.aparegisterlist.path} element={withSuspense(ApaRegistergerList)} />
          <Route path={routes.logviewer.path} element={withSuspense(LogViewer)} />
          <Route path={routes.commoncategory.path} element={withSuspense(CommonCategory)} />
          <Route path={routes.addQuestionpaper.path} element={withSuspense(AddQueationPaper)} />
          <Route path={routes.quizCreators.path} element={withSuspense(QuizCreator)} />
          <Route path={routes.quizMaster.path} element={withSuspense(QuizMaster)} />
          <Route path={routes.apaInteraction.path} element={withSuspense(ApaInteraction)} />
          <Route path={routes.dashboardCardDetails.path} element={withSuspense(DashboardCardDetails)} />
          <Route path={routes.reportincedentlist.path} element={withSuspense(ReportIncidentList)} />
          <Route path={routes.reportincedentdetails.path} element={withSuspense(ReportIncedentViewList)} />
          <Route path={routes.annualReport.path} element={withSuspense(AnnualReport)} />
          <Route path={routes.eventRegiList.path} element={withSuspense(EventRegistraionList)} />

          <Route path={routes.meetingList.path} element={withSuspense(MeetingList)} />

        </Route>
      </Route>

      <Route path={routes.notFound.path} element={<NotFound />} />
      <Route path={routes.forbidden.path} element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;