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
  - `goals[]`
  - `desiredOutcomes[]`
  - `dailyMaterials` (1–5)
  - `assessmentResults`, `readingPlan`
- Wrap all onboarding screens with this provider.

## 3. Navigation Setup
Use Expo Router under `/app/onboarding/`:
1. `Register.tsx`
2. `ChildInfo.tsx`
3. `Avatar.tsx`
4. `ReadingLevel.tsx`
5. `CapabilitiesGraph.tsx`
6. `GoalSelection.tsx`
7. `DesiredOutcomes.tsx`
8. `Affirmation1.tsx`
9. `DailyMaterials.tsx`
10. `Affirmation2.tsx`
11. `ProjectionGraph.tsx`
12. `AssessmentIntro.tsx`
13. `Assessment.tsx` (word/sentence/passage)
14. `Analytics.tsx`
15. `ReadingPlan.tsx`
16. `Subscription.tsx`

## 4. UI Components & Design
- Reusable form components: `TextInput`, `PasswordInput`, `Button`, `Slider`, `AvatarPicker`.
- Charts: `react-native-svg-charts` or `victory-native` for graphs.
- Claymorphism styling:
  - Rounded corners (16–24px)
  - Multi-layer shadows & matte finish
  - Poppins font family (Regular, Medium, SemiBold, Bold)
  - Brand colors (red #ff595e, yellow #ffca3a, green #8ac926, blue #1982c4, purple #6a4c93)

## 5. Screen-by-Screen Tasks
1. **Register**: Collect parent name, email, password → Supabase signup.
2. **ChildInfo**: Input child's name & age.
3. **Avatar**: Avatar selection.
4. **ReadingLevel**: Buttons for Beginner, Intermediate, Advanced, Not Sure.
5. **CapabilitiesGraph**: Static chart comparing traditional vs AI-based practice.
6. **GoalSelection**: Multi-select reading goals.
7. **DesiredOutcomes**: Choose up to 3 outcomes.
8. **Affirmation1**: Display success statistics (e.g., 90% achieve their goals).
9. **DailyMaterials**: Slider (1–5) for daily reading materials.
10. **Affirmation2**: Reassurance message.
11. **ProjectionGraph**: Projected progress at 1, 3, 6 months.
12. **AssessmentIntro**: Overview of assessment types.
13. **Assessment**: Embed word, sentence, passage assessments.
14. **Analytics**: Fetch & display Azure Pronunciation API results.
15. **ReadingPlan**: Show personalized baseline & reading plan.
16. **Subscription**: Present monthly & annual plans, “Start Journey” button.

## 6. Testing & QA
- Unit tests for form validation & context updates.
- End-to-end flow test: sign-up → onboarding → subscription.
- Visual review for design consistency.

## 7. Phasing & Timeline
- **Phase 1**: Data model, context, screens 1–4.
- **Phase 2**: Graphs (Capabilities & Projection), Goals, Outcomes, Affirmations, Slider.
- **Phase 3**: Assessment, Analytics, Reading Plan, Subscription.
