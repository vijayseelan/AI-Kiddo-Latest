# Onboarding Flow

This document outlines the new combined Sign Up + Onboarding flow for Reading Panda.

## 1. Data & Backend
- **Supabase Tables**:
  - `users` (parent): id, name, email, password_hash, created_at
  - `children`: id, user_id, name, age, avatar, reading_level
  - `onboarding_profiles`: user_id, goals, desired_outcomes, daily_materials, created_at
  - `assessments`: user_id, type, results, timestamp
- Extend existing `signUp` logic to insert into `users` and initialize an empty `onboarding_profiles`.

## 2. State Management
- Create `OnboardingContext` (or hook) to hold:
  - `parentInfo` (name, email, password)
  - `childInfo` (name, age, avatar, reading_level)
  - `goals[]` (combines goals and desired outcomes)
  - ~~`dailyMaterials` (1–5)~~ (removed)
  - `assessmentResults`, `readingPlan`
- Wrap all onboarding screens with this provider.

## 3. Navigation Setup
Use Expo Router under `/app/onboarding/`:
1. `Register.tsx`
2. `ChildInfo.tsx`
3. `Avatar.tsx`
4. `ReadingLevel.tsx`
5. `Capabilities.tsx` (renamed from CapabilitiesGraph.tsx)
6. `Goals.tsx` (renamed from GoalSelection.tsx, combines goals and desired outcomes)
7. `Affirmation1.tsx`
8. `ProjectionGraph.tsx`
9. `AssessmentIntro.tsx`
10. `Assessment.tsx` (word/sentence/passage)
11. `Analytics.tsx`
12. `ReadingPlan.tsx`
13. `Subscription.tsx`

## 4. UI Components & Design
- Reusable form components: `TextInput`, `PasswordInput`, `Button`, `Slider`, `AvatarPicker`.
- Charts: `react-native-svg-charts` or `victory-native` for graphs.
- Claymorphism styling:
  - Rounded corners (24-28px)
  - Multi-layer shadows with white borders
  - Soft, extruded shapes with subtle shadows and highlights
  - Poppins font family (Regular, Medium, SemiBold, Bold)
  - Modern color palette:
    - Sunflower: #ffb703
    - Orange: #fb8500
    - Blue: #219ebc
    - Sky Blue: #8ecae6
    - Deep Navy: #023047
  - Consistent gradient background with blur effect in OnboardingContainer

## 5. Screen-by-Screen Tasks
1. **Register**: Collect parent name, email, password → Supabase signup.
2. **ChildInfo**: Input child's name & age.
3. **Avatar**: Avatar selection.
4. **ReadingLevel**: Buttons for Beginner, Intermediate, Advanced, Not Sure.
5. **CapabilitiesGraph**: Static chart comparing traditional vs AI-based practice.
6. **GoalSelection**: Multi-select reading goals.
7. **DesiredOutcomes**: Choose up to 3 outcomes.
8. **Affirmation1**: Display success statistics (e.g., 90% achieve their goals).
  ~~9. **DailyMaterials**: Slider (1–5) for daily reading materials.~~ (removed)
  ~~10. **Affirmation2**: Reassurance message.~~ (removed)
  9. **ProjectionGraph**: Projected progress at 1, 3, 6 months.
  10. **AssessmentIntro**: Overview of assessment types.
  11. **Assessment**: Embed word, sentence, passage assessments.
  12. **Analytics**: Fetch & display Azure Pronunciation API results.
  13. **ReadingPlan**: Show personalized baseline & reading plan.
  14. **Subscription**: Present monthly & annual plans, "Start Journey" button.

## 6. Testing & QA
- Unit tests for form validation & context updates.
- End-to-end flow test: sign-up → onboarding → subscription.
- Visual review for design consistency.

## 7. Phasing & Timeline
- **Phase 1**: Data model, context, screens 1–4.
- **Phase 2**: Graphs (Capabilities & Projection), Goals, Outcomes, Affirmations, Slider.
- **Phase 3**: Assessment, Analytics, Reading Plan, Subscription.
