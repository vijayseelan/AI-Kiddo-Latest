# Onboarding & Login Flow Planning for Reading Panda

---

## 1. How Apps Distinguish Between Onboarding and Login Flows

- **First Launch Detection:**
  - On first app launch (or if no user account/token is stored), show onboarding.
  - On subsequent launches (if user is logged out or logs out), show login.
- **Persistent Storage:**
  - Use AsyncStorage/SecureStore to save a flag like `hasOnboarded` or check for presence of a user token.
- **Navigation Logic:**
  - At app start, check:
    - If `hasOnboarded` is false or missing → show onboarding.
    - If `hasOnboarded` is true but no user token → show login.
    - If valid user token → go to main app.

---

## 2. Onboarding Flow (For New Users)

**Goals:**
- Welcome and excite the user.
- Explain the app’s value and features (briefly).
- Guide the user through setup (profile, preferences, permissions).
- End with account creation (sign up).

**Typical Steps:**
1. **Welcome Screen**
   - Friendly hero image, app name, tagline.
   - “Get Started” button.
2. **Feature Highlights**
   - 2–4 swipeable screens or cards showing:
     - AI-powered reading
     - Fun panda mascot
     - Personalized stories
     - Progress tracking & rewards
3. **Permissions & Personalization**
   - Ask for child’s name/age (if relevant).
   - Let user pick avatar/mascot.
   - Request permissions (notifications, mic for pronunciation).
4. **Sign Up / Create Account**
   - Email/password, or social sign-in.
   - Optionally, ask for parent email for verification.
5. **Finish & Enter App**
   - Success message, confetti, or fun animation.
   - Go to main app/home.

**Best Practices:**
- Keep each step short and visual.
- Use playful, kid-friendly language and characters.
- Allow skipping non-critical steps.
- Use progress indicators (dots, bars).
- Use claymorphism and your color palette for consistency.

---

## 3. Login Flow (For Returning Users)

**Goals:**
- Fast, frictionless access for existing users.
- Option to reset password if needed.

**Typical Steps:**
1. **Login Screen**
   - App logo/mascot.
   - Email & password fields (or social sign-in).
   - “Log In” button.
   - “Forgot password?” link.
   - “Sign up” link for new users.
2. **Post-Login**
   - On success, go to main app/home.
   - On failure, show friendly error.

**Best Practices:**
- Keep it simple and quick—one screen if possible.
- Use clear error messages and accessible input fields.
- Maintain playful, friendly visuals but keep distractions minimal.

---

## 4. Navigation Structure Example

- **App Entry Point:**
  - Splash/Loading → (check onboarding & auth state)
    - → Onboarding Stack (if new)
    - → Auth Stack (if returning, not logged in)
    - → Main App (if logged in)
- **Stacks:**
  - **OnboardingStack:** Welcome → Features → Personalize → Sign Up
  - **AuthStack:** Login → Forgot Password → Sign Up
  - **MainAppStack:** Home, etc.

---

## 5. Engagement Tips

- Use your panda mascot as a guide throughout onboarding.
- Add subtle animations, sound effects, and confetti for progress.
- Let kids/parents choose an avatar or theme during onboarding.
- Show progress dots or a “1 of 4” indicator.
- Allow skipping onboarding, but confirm before skipping.

---

### Summary Table

| Flow       | Trigger                 | Key Screens                             | Engagement Tips                      |
|------------|-------------------------|-----------------------------------------|--------------------------------------|
| Onboarding | First launch/no account | Welcome, Features, Personalize, Sign Up | Mascot guide, animations, progress   |
| Login      | Returning user          | Login, Forgot Password, Sign Up         | Simple, friendly, quick access       |

---

*This document serves as a blueprint for implementing user flows in Reading Panda. Use as a reference for navigation, UI/UX, and onboarding best practices.*
