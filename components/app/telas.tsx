"use client";

import type { View } from "@/lib/app/nav";
import { HomeScreen } from "./screens/Home";
import { SearchScreen } from "./screens/Search";
import { CarsScreen, AddCarScreen } from "./screens/Cars";
import { CarHub } from "./screens/CarHub";
import { SymptomsScreen, SymptomDetail, SystemProblemsScreen, ChecklistScreen } from "./screens/Symptoms";
import { HealthScreen, HealthQuizScreen, SystemDetail } from "./screens/Health";
import { HistoryScreen, AddServiceScreen, ServiceDetail } from "./screens/History";
import { RevisionsScreen } from "./screens/Revisions";
import { LearnScreen, StudyTrackScreen, CourseScreen, ForYourCarScreen, SavedLessonsScreen } from "./screens/Learn";
import { ContentScreen } from "./screens/Content";
import { BielaChatScreen } from "./screens/Biela";
import { EquipmentScreen } from "./screens/Equipment";
import { EquipmentHowToScreen } from "./screens/EquipmentHowTo";
import { Obd2Screen, Obd2ScanScreen } from "./screens/Obd2";
import { FuelCompareScreen } from "./screens/FuelCompare";
import { CarSettingsScreen } from "./screens/CarSettings";
import { ProfileScreen } from "./screens/Profile";
import { SubscribeScreen } from "./screens/Subscribe";
import { CheckoutScreen } from "./screens/Checkout";
import { QuizScreen } from "./screens/Quiz";
import { QuizHistoricoScreen } from "./screens/QuizHistorico";
import { GamificationScreen, AchievementsScreen } from "./screens/Gamification";
import { AuthScreen } from "./screens/Auth";
// O mapa: qual view desenha qual tela.
//
// Uma coisa só, e é essa. Morava no meio do `Router`, cercado por efeitos de
// abertura, medição de funil e o botão de voltar do Android — e era a parte
// que mais gente precisa achar.
//
// A REGRA QUE ESTE ARQUIVO IMPÕE: o nome da view é o nome do arquivo da tela.
// `subscribe` → screens/Subscribe.tsx, `biela` → screens/Biela.tsx. Se um dia
// não bater, é sinal de que a tela foi parar no arquivo errado.
//
// O `switch` é exaustivo por construção: `View` é uma união fechada, então
// esquecer um caso aqui não compila. É por isso que ele não tem `default`.
export function telaDaView(view: View) {
  switch (view.name) {
      case "home": return <HomeScreen />;
      case "search": return <SearchScreen />;
      case "cars": return <CarsScreen />;
      case "addCar": return <AddCarScreen editId={view.editId} />;
      case "car": return <CarHub />;
      case "symptoms": return <SymptomsScreen />;
      case "symptom": return <SymptomDetail id={view.id} />;
      case "systemProblems": return <SystemProblemsScreen system={view.system} />;
      case "checklist": return <ChecklistScreen symptomId={view.symptomId} />;
      case "obd2": return <Obd2Screen />;
      case "health": return <HealthScreen />;
      case "healthQuiz": return <HealthQuizScreen />;
      case "system": return <SystemDetail system={view.system} />;
      case "history": return <HistoryScreen />;
      case "addService": return <AddServiceScreen preset={view.preset} editId={view.editId} />;
      case "service": return <ServiceDetail id={view.id} />;
      case "revisions": return <RevisionsScreen />;
      case "learn": return <LearnScreen />;
      case "equipment": return <EquipmentScreen />;
      case "equipmentHowTo": return <EquipmentHowToScreen itemId={view.itemId} />;
      case "studyTrack": return <StudyTrackScreen trackId={view.trackId} />;
      case "course": return <CourseScreen id={view.id} />;
      case "forYourCar": return <ForYourCarScreen />;
      case "savedLessons": return <SavedLessonsScreen />;
      case "biela": return <BielaChatScreen seed={view.seed} />;
      // "Aulas"-ferramenta abrem a página real (OBD2, Etanol × Gasolina).
      case "content":
        if (view.id === "read-obd2") return <Obd2Screen />;
        if (view.id === "obd2-scan") return <Obd2ScanScreen />;
        if (view.id === "fuel-compare") return <FuelCompareScreen />;
        return <ContentScreen id={view.id} />;
      case "carSettings": return <CarSettingsScreen />;
      case "profile": return <ProfileScreen />;
      case "quiz": return <QuizScreen />;
      case "quizHistorico": return <QuizHistoricoScreen />;
      case "gamification": return <GamificationScreen />;
      case "achievements": return <AchievementsScreen initialTab={view.tab} />;
      case "auth": return <AuthScreen />;
      case "subscribe": return <SubscribeScreen ctx={view.ctx} />;
      case "checkout": return <CheckoutScreen plan={view.plan} offer={view.offer} />;  }
}
