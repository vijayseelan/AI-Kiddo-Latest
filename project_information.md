# Reading Panda Project Information

This document summarizes the structure, technologies, and core concepts of the Reading Panda project based on code analysis.

## Project Overview

*   **Name:** Reading Panda (Based on directory name, `app.json` uses "expo-app")
*   **Type:** Mobile Application (React Native)
*   **Framework:** Expo SDK (~52.0.36) with Expo Router (~4.0.17) for file-based routing.
*   **Language:** TypeScript
*   **Styling:** NativeWind (Tailwind CSS for React Native)
*   **State Management:** Zustand
*   **Backend:** Supabase (Authentication, Database, Storage)
*   **Key Features (Inferred from `app` directory):**
    *   User Authentication (Login, Signup)
    *   User Profiles (Multiple profiles per account likely)
    *   Reading Assessment
    *   Onboarding Flow
    *   Core Reading Experience (Books, Categories)
    *   Pronunciation Practice (using Azure Cognitive Services Speech SDK)
    *   Gamification (Badges)

## Key Technologies & Libraries

*   **React Native:** Core mobile framework.
*   **Expo:** SDK and tools for building and deploying React Native apps.
*   **Expo Router:** File-system based routing.
*   **TypeScript:** Static typing.
*   **NativeWind:** Utility-first CSS styling.
*   **Zustand:** State management.
*   **Supabase Client:** Interacting with Supabase backend.
*   **Azure Cognitive Services Speech SDK:** Advanced speech features.
*   **Expo Modules:** `expo-av`, `expo-speech`, `expo-async-storage`, `expo-secure-store`, `expo-image-picker`, `expo-file-system`, `lucide-react-native`, etc.

## Project Structure

*   **`app/`:** Screens and navigation (Expo Router).
    *   `_layout.tsx`: Root layout, likely sets up providers.
    *   `index.tsx`: Entry point, likely handles auth redirection.
    *   `(tabs)/`: Main application sections after login.
    *   `onboarding/`: Screens for the initial user setup.
    *   Authentication screens (`login.tsx`, `signup.tsx`).
    *   Profile management (`add-profile.tsx`, `edit-profile.tsx`).
    *   Assessment flow (`assessment.tsx`, `assessment-processing.tsx`, `assessment-results.tsx`).
    *   Reading/Book related screens (`read/`, `book/`, `category/`).
    *   Other features (`badges.tsx`, `pronunciation-practice.tsx`).
*   **`components/`:** Reusable UI components.
*   **`constants/`:** Application constants (e.g., colors, themes, API keys - check `.env`).
*   **`context/`:** React Context providers.
*   **`hooks/`:** Custom React hooks.
*   **`lib/`:** Library code, utilities (e.g., `supabase.ts`).
*   **`services/`:** Modules for interacting with external services (Supabase, Azure).
*   **`store/`:** Zustand state stores.
*   **`types/`:** TypeScript type definitions.
*   **`assets/`:** Static assets (images, fonts).
*   **Configuration:** `package.json`, `app.json`, `babel.config.js`, `tsconfig.json`, `.env`.
*   **Documentation:** `.md` files (`AI Kiddo PRD.md`, `design.md`, etc.).

## Core Flow & State Management

*   **Entry Point:** `app/index.tsx` (Welcome Screen).
    *   Checks `isParentLoggedIn` flag in `useUserStore` (Zustand).
    *   If logged in, redirects to `/(tabs)`.
    *   If not logged in, shows Signup/Login options.
*   **Root Layout (`app/_layout.tsx`):**
    *   Wraps the app in `AuthProvider` (React Context, likely from `@/hooks/useAuth`) and `OnboardingProvider` (React Context).
    *   Loads fonts and applies theme (managed by `useThemeStore` - Zustand).
    *   Defines the main `Stack` navigator using Expo Router.
    *   Includes `useProtectedRoute` custom hook:
        *   Checks `session` state from `useAuth` hook.
        *   Redirects unauthenticated users trying to access `/(tabs)` routes to `/login`.
*   **State Management:**
    *   **Zustand:** Used for global state like theme (`useThemeStore`) and user login status/data (`useUserStore`).
    *   **React Context:** Used for providing authentication logic (`AuthProvider`/`useAuth`) and onboarding state (`OnboardingProvider`). The `AuthProvider` likely updates the `useUserStore` upon successful login/logout.
*   **User Data Management (`store/user-store.ts` - Zustand):**
    *   This store is the central place for application-level user data.
    *   Uses `persist` middleware to save state to `AsyncStorage` (parent profile, child profiles, active child, etc.).
    *   **State:** Holds `parent` profile, `childProfiles` array, `activeChild`, `activeChildId`, and the `isParentLoggedIn` flag used by `index.tsx`.
    *   **`initializeSession` Action:** This key action fetches the current Supabase user (`getCurrentUser` from `lib/supabase`), then fetches the detailed parent and child profiles (`fetchUserProfiles` from `lib/supabase`), populating the store's state. This synchronizes the local persisted state with the backend after authentication.
    *   **Backend Interaction:** Provides actions (e.g., `loginParent`, `createChildProfile`, `updateReadingProgress`) that manage local state *and* call corresponding functions in `lib/supabase.ts` to interact with the Supabase backend (auth, database CRUD operations).
    *   **Legacy State:** Includes `user` and `isLoggedIn` fields, mapped to the `activeChild`, likely for backward compatibility.
*   **Supabase Integration (`lib/supabase.ts`):**
    *   **Client Setup:** Initializes the Supabase JavaScript client (`createClient`).
    *   **Secure Storage:** Uses `expo-secure-store` for session persistence via a custom `ExpoSecureStoreAdapter`. This adapter implements chunking to handle potentially large session data, overcoming `SecureStore`'s size limitations.
    *   **Credentials:** **WARNING:** Supabase URL and Anon Key are currently hardcoded. These should be moved to environment variables (e.g., using `expo-constants` or a `.env` file managed securely).
    *   **API Layer:** Exports the `supabase` client instance and numerous helper functions that wrap direct Supabase calls (e.g., `signIn`, `signUp`, `signOut`, `getCurrentUser`, `fetchUserProfiles`, `createChildProfile`, `updateReadingProgress`, `saveAssessmentResult`, `setActiveChild` via RPC). This abstracts the direct Supabase interactions for the rest of the app (primarily `user-store.ts`).

## Main Application Navigation (`app/(tabs)/`)

*   **Tab Layout (`app/(tabs)/_layout.tsx`):**
    *   Uses `Tabs` from Expo Router to define the primary navigation after login.
    *   **Tabs:** Home (`index.tsx`), Discover (`search.tsx`), Library (`library.tsx`), Profile (`profile.tsx`).
    *   Uses `lucide-react-native` for icons.
    *   Applies custom styling to the tab bar.
    *   Hides default headers (`headerShown: false`), making individual screens responsible for their headers.
    *   Exports `TAB_BAR_HEIGHT` constant for layout adjustments in child screens.
*   **Home Screen (`app/(tabs)/index.tsx`):**
    *   Main dashboard screen after login.
    *   Displays a personalized greeting and the active child's avatar (links to profile).
    *   **Dynamic Data:** Fetches and displays the `activeChild` profile dynamically from Supabase using `getActiveChild` (includes stats shown in `ProgressStats` component).
    *   **Mock Data:** Uses mock data from `@/mocks/books` for:
        *   Daily practice words (`WordPronunciationCard`) - words selected based on dynamic level, but list is mock.
        *   Categories list (`CategoryCard`).
        *   Recommended books list (`BookCard`).
    *   Features complex gradient/blur background visuals.
    *   **LIMITATION:** Core content discovery relies heavily on mock data, hindering personalization and dynamic content presentation.
*   **Category Screen (`app/category/[id].tsx`):**
    *   Dynamic route displaying books for a specific category ID.
    *   Uses a `FlatList` and `BookCard` components for a 2-column grid.
    *   **LIMITATION:** Currently relies entirely on **mock data** from `@/mocks/books` for both category information and book lists. It does not dynamically fetch content from the database.
*   **Profile Screen (`app/(tabs)/profile.tsx`):**
    *   Displays parent account information (name, email from `useAuth`).
    *   Fetches and displays the `activeChild` profile card (avatar, name, age, level) using `getActiveChild` service.
    *   Allows switching the active child via a modal (`ChildSwitcherModal`).
    *   Provides navigation to edit profile and settings.
*   **Onboarding Flow (`app/onboarding/`):**

Managed by a `Stack` navigator (`_layout.tsx`) with hidden headers and slide animation.

*   **Parent Registration (`Register.tsx`):**
    *   Multi-step (Name, Email, Password) form within a single screen.
    *   Uses `OnboardingContext` (`context/OnboardingContext.tsx`) to store registration data progressively.
    *   Validates email uniqueness against Supabase `onboarding_profiles` and `parents` tables before proceeding.
    *   If email exists, prompts user to log in or use a different email.
    *   Navigates to `/onboarding/ChildInfo` upon completion.
*   **Child Info (`ChildInfo.tsx`):**
    *   Multi-step (Name, Age) form within a single screen.
    *   Collects child's name via `TextInput`.
    *   Collects child's age via `Slider` (3-13 years).
    *   Updates `childName` and `childAge` in `OnboardingContext` via `useEffect`.
    *   Navigates to `/onboarding/Avatar` upon completion.
*   **Avatar Selection (`Avatar.tsx`):**
    *   Displays a grid (`FlatList`) of hardcoded avatar options (images + names).
    *   Highlights the selected avatar.
    *   Updates `selectedAvatar` (ID) in `OnboardingContext` via `useEffect`.
    *   Uses `childName` from context for personalization.
    *   Navigates to `/onboarding/ReadingLevel` upon completion.
*   **Reading Level Selection (`ReadingLevel.tsx`):**
    *   Presents four options (Beginner, Intermediate, Advanced, Not Sure) as selectable cards.
    *   Each card has an icon, title, and description.
    *   Updates `readingLevel` (string) in `OnboardingContext` via `useEffect`.
    *   Navigates to `/onboarding/Capabilities` upon completion.
*   **Capabilities Showcase (`Capabilities.tsx`):**
    *   Presents the app's value proposition.
    *   Features an animated bar graph comparing 'Reading Panda' (85%) vs. 'Traditional' (45%) reading improvement.
    *   Uses `Animated` API for entry effects.
    *   Does not collect user input or update context.
    *   Navigates to `/onboarding/Goals` upon completion.
*   **Goals Selection (`Goals.tsx`):**
    *   Presents a list of hardcoded reading goals (Fluency, Vocabulary, etc.) as selectable cards.
    *   Allows multiple selections.
    *   Updates `goals` (array of strings) in `OnboardingContext` via `useEffect`.
    *   Navigates to `/onboarding/Affirmation1` upon completion (passing `childName` param).
*   **Affirmation (`Affirmation1.tsx`):**
    *   Displays motivational message and lists long-term benefits (cognitive, academic, etc.).
    *   Uses `childName` (from navigation params) for personalization.
    *   Features animations (`react-native-reanimated`) for entry and sequential card highlighting.
    *   Does not collect input or update context.
    *   Navigates to `/onboarding/ProjectionGraph` upon completion (passing params).
*   **Projection Graph (`ProjectionGraph.tsx`):**
    *   Displays an animated line graph (`react-native-svg`) showing projected 6-month reading level growth.
    *   Compares 'Reading Panda' trajectory vs. 'Traditional' baseline using hardcoded data.
    *   Includes axes, labels, data points, and a legend.
    *   Uses standard `Animated` API for entry effects.
    *   Does not collect input or update context.
    *   Navigates to `/onboarding/AssessmentIntro` upon completion (passing params).
*   **Assessment Intro (`AssessmentIntro.tsx`):**
    *   Introduces the reading assessment and its purpose (personalization).
    *   Lists assessment components (Word Recognition, Sentence Fluency, Pronunciation) using animated cards (hardcoded types).
    *   Provides info on duration and nature ('game-like').
    *   Personalizes title with `childName`.
    *   Uses `Animated` API for entry and staggered card animations.
    *   Does not collect input or update context.
    *   Navigates to `/onboarding/Assessment` upon completion (passing params).
*   **Assessment (`Assessment.tsx`):**
    *   Conducts the reading assessment (words, sentences, passages - from hardcoded `assessmentContent`).
    *   Manages states: `intro`, `recording`, `processing`, `results`.
    *   Uses `expo-speech` for text-to-speech of the item.
    *   Records user audio using `expo-av` (`Audio.Recording`), requesting microphone permissions.
    *   Sends audio to `services/azure-speech.ts` (`assessPronunciation`) for analysis.
    *   Displays pronunciation feedback (scores, word highlighting) based on `PronunciationFeedback` type.
    *   Saves aggregated `assessmentResults` to `OnboardingContext` upon completion.
    *   Navigates to `/onboarding/Analytics` after the final assessment item.
*   **Analytics (`Analytics.tsx`):**
    *   Displays assessment results (Accuracy, Fluency, etc.) from `OnboardingContext`.
    *   Calculates and shows derived Reading Level, Reading Age, and Percentile.
    *   Generates lists of Strengths and Areas for Improvement based on scores.
    *   Visualizes skills using an animated Radar Chart (`react-native-svg`).
    *   Uses standard `Animated` API for entry animations.
    *   Does not collect input or update context.
    *   Navigates to `/onboarding/ReadingPlan` upon completion.
*   **Reading Plan (`ReadingPlan.tsx`):**
    *   Displays recommended content and activities based on `readingLevel` from context.
    *   Final step before entering the main app.
    *   `handleContinue` saves all onboarding data to Supabase:
        *   Creates user via `supabase.auth.signUp`.
        *   Inserts records into `parents`, `children`, `onboarding_profiles`, and `assessments` tables.
        *   **SECURITY WARNING:** Saves raw `parentPassword` in `onboarding_profiles`. This is insecure and should be removed.
        *   `onboarding_profiles` table appears redundant.
    *   Handles saving errors with `Alert`.
    *   Upon successful save, navigates to the main app (`router.replace('/')`).

## Screens
*   **Login (`app/login.tsx`):**
    *   Standard email/password login screen.
    *   Styled with background gradients, SVG waves, and blur effect.
    *   Uses `supabase.auth.signInWithPassword` for authentication.
    *   Handles loading states and displays errors.
    *   Navigates to `/forgot-password` or `/signup`.
    *   On successful login, navigates to the main app (`/(tabs)`).
*   **Add Profile (`app/add-profile.tsx`):**
    *   Allows logged-in parents to add a new child profile.
    *   Collects child's name, age, avatar (from predefined options), and reading level (beginner/intermediate/advanced).
    *   Uses `useUserStore.createChildProfile` (Zustand) to create and persist the profile.
    *   Handles loading states and shows alerts on error.
    *   Navigates back upon successful creation.
*   **Edit Profile (`app/edit-profile.tsx`):**
    *   Allows editing the `activeChild` profile (fetched from `useUserStore`).
    *   UI is very similar to `Add Profile`, but fields are pre-populated.
    *   Allows updating name, age, avatar, and reading level.
    *   Uses `useUserStore.updateChildProfile` to save changes.
    *   Handles loading states and errors.
    *   Navigates back upon successful update.
*   **Reading Screen (`app/read/[id].tsx`):**
    *   Displays book content (regular or AI-generated) page by page.
    *   Handles navigation between pages (`handleAINextPage`, `handleAIPrevPage`).
    *   Tracks reading time and updates user progress (`useUserStore`).
    *   Includes features for word definitions and comprehension checks (modal based).
    *   Integrates `AIAssistant` for interactive elements like pronunciation practice.
    *   Calls `assessSentencePronunciationAzure` upon recording completion ([handlePracticeRecordingComplete](cci:1://file:///Users/vijayaseelanmuniandy/Downloads/Reading%20Panda/app/read/[id].tsx:186:2-261:4)).
    *   **LIMITATION:** Attempts to display sentence pronunciation results using the `PronunciationFeedback` component within a modal. This component is designed for single-word feedback and cannot correctly render the detailed `WordTimingResult` array (missing `isCorrect` derivation from `errorType`, cannot show `errorType`). A dedicated sentence feedback component is needed.
*   **Badges Screen (`app/badges.tsx`):**
    *   Displays earned badges retrieved from the active child's data in `user-store`.
    *   Shows **mock/hardcoded** locked badges that can be earned.
    *   Uses the `BadgeCard` component for rendering.
    *   LIMITATION: Locked badges are not dynamically fetched.
*   **Settings Modal (`components/SettingsModal.tsx`):**
    *   Provides settings access via a modal.
    *   Lists child profiles, allows switching active profile.
    *   Handles navigation to add/edit profile screens.
    *   Allows deleting the active profile (with confirmation).
    *   Includes Dark Mode toggle.
    *   Handles user logout.

## Components
*   **BookCard (`components/BookCard.tsx`):**
    *   Displays a single book item with cover, title, author, and age range.
    *   Takes a `Book` object and formatting props (`size`, `showProgress`).
    *   Handles navigation to the book detail screen (`/book/[id]`).
    *   Includes client-side favoriting logic using `useBooksStore`.
    *   Supports an optional `onDelete` callback, showing a delete icon if provided.
    *   Can display a 'NEW' badge and progress percentage.
*   **CategoryCard (`components/CategoryCard.tsx`):**
    *   Displays a single category with its name and an icon.
    *   Takes a `Category` object (id, name, icon, color).
    *   Uses a `LinearGradient` background based on the category color.
    *   Renders a specific `lucide-react-native` icon based on the `icon` string prop.
    *   Handles navigation to the category detail screen (`/category/[id]`).
*   **Pronunciation Feedback (`components/PronunciationFeedback.tsx`):**
    *   Displays feedback for a single word (accuracy score, suggestion).
    *   Shows the word, an accuracy badge (color/icon based on score), and an optional suggestion.
    *   Includes a button to trigger text-to-speech for the word.
    *   **LIMITATION:** Cannot display the detailed, word-by-word results from sentence-level assessment (e.g., `SentencePronunciationResultAzure`). A different component is needed for that.
*   **AI Content Viewer (`components/AIContentViewer.tsx`):**
    *   Displays pages of AI-generated content (`AIContentItem` array).
    *   Each item can contain text, an image (`image_url`), and audio (`audio_url`).
    *   Renders text, image (or placeholder), and an audio playback button (`expo-av`).
    *   Provides Previous/Next navigation buttons but relies on parent component for page state management (`currentPage`, `onNext`, `onPrevious`).

## Mock Data (`mocks/books.ts`)

This file centralizes hardcoded data used for content display and discovery, acting as a placeholder for dynamic database fetching.

*   **`categories` Array:** Defines the list of `Category` objects (Adventure, Animals, etc.) used on the Home screen and Category screen.
*   **`books` Array:** Defines a list of `Book` objects, including detailed page content, vocabulary, cover URLs, etc. This populates the book lists on the Home and Category screens.
*   **`practiceWords` Object:** Contains arrays of words, definitions, and images, keyed by reading level, used for the daily practice section on the Home screen.
*   **Helper Functions (`getBooksByCategory`, `getRecommendedBooks`, etc.):** Provide simple filtering logic over the mock arrays.
*   **`loadAIBooks` Function:** Attempts to load AI-generated content from the database on startup and merge it with the mock `books` array (cached).
*   **LIMITATION:** The extensive use of this mock data prevents dynamic, personalized content discovery based on real user data or a comprehensive content library in the database.

## Stat Calculation Logic

*   **Initial (Onboarding - `app/onboarding/Analytics.tsx`):**
    *   Reading Level, Reading Age, Percentile, Strengths, Areas for Improvement are calculated using simple formulas and thresholds based on the initial assessment results (`overallAccuracy`, `fluency`, `completeness`).
*   **Ongoing (Post-Onboarding):**
    *   **Reading Time (`totalMinutesRead`):** Updated in `app/read/[id].tsx` via a timer, calling `addMinutesRead` (user store) on screen unmount.
    *   **Book Progress (`completionPercentage`):** Updated in `app/read/[id].tsx` on page turns, calling `updateReadingProgress` (user store).
    *   **Overall Pronunciation Accuracy:** Updated via `saveAssessmentResult` in the user store, which calls `updatePronunciationAccuracy`. This sets the profile accuracy to the `overallAccuracy` from the **last saved full assessment** (e.g., onboarding), not averaged from sentence practices.
    *   **Total Books Read:** Incremented via `incrementBooksRead` in the user store, called by `updateReadingProgress` when a book's `completionPercentage` reaches 100.
    *   **Streak Days:** Incremented via `incrementStreakDays` in the user store. The specific **triggering logic/location** for this action (e.g., daily login, session completion) is **currently unclear/missing** in the analyzed code.

## AI Content Generation

**Workflow:**

1.  **Initiation:** User opens the `ContentGeneratorModal` component (likely triggered from somewhere like the Home screen).
2.  **Input:** 
    *   User enters a `title` for the content.
    *   User selects a `contentType` (words, sentences, passage, story).
    *   `readingLevel` is automatically determined from the `activeChild`'s profile in the `user-store`.
3.  **Trigger:** User presses a "Generate" button, calling the `handleGenerate` function within the modal.
4.  **Text Generation:** `handleGenerate` calls `generateTextContent(title, contentType, readingLevel)` ([services/ai-content.ts](cci:7://file:///Users/vijayaseelanmuniandy/Downloads/Reading%20Panda/services/ai-content.ts:0:0-0:0)).
    *   Uses **Anthropic Claude 3 Haiku** via API call.
    *   Returns the generated text.
5.  **Content Parsing:** The returned text is parsed based on `contentType`:
    *   For "words" or "sentences": Text is split into individual lines.
    *   For "passage" or "story": The entire text is treated as one item.
6.  **Media Generation (Loop):** `handleGenerate` iterates through each text line/item:
    *   Calls `generateImage(line)` ([services/image-generation.ts](cci:7://file:///Users/vijayaseelanmuniandy/Downloads/Reading%20Panda/services/image-generation.ts:0:0-0:0)) to get a corresponding image URL.
    *   Calls `generateVoice(line)` ([services/voice-generation.ts](cci:7://file:///Users/vijayaseelanmuniandy/Downloads/Reading%20Panda/services/voice-generation.ts:0:0-0:0)) to get a corresponding audio narration URL.
    *   (Details of image/voice generation APIs are within those specific service files).
7.  **Data Structuring:** An array of `AIContentItem` objects is created, each containing the text, `imageUrl`, and `audioUrl` for one line/item.
8.  **Database Saving:** `handleGenerate` calls `saveAIGeneratedContent` ([services/database.ts](cci:7://file:///Users/vijayaseelanmuniandy/Downloads/Reading%20Panda/services/database.ts:0:0-0:0)).
    *   This saves the main record (title, type, level, etc.) to the `ai_generated_content` table.
    *   It saves the array of items (text, image, audio URLs) to the `ai_content_items` table, linked to the main record.
9.  **Local State Update:** The new content object (structured like a `Book`) is added to the Zustand `books-store` via `addBook`.
10. **UI Feedback:** The modal shows a success message/animation and closes.

**Key Components/Services:**
*   **UI:** `components/ContentGeneratorModal.tsx`
*   **Text Generation:** `services/ai-content.ts` (using Anthropic Claude 3 Haiku)
*   **Image Generation:** `services/image-generation.ts` (API details TBD)
*   **Voice Generation:** `services/voice-generation.ts` (API details TBD)
*   **Database:** `services/database.ts` (using `saveAIGeneratedContent`)
*   **State:** `store/user-store.ts` (for reading level), `store/books-store.ts` (to add generated content)

**Previous Misconceptions/Findings:**

*   ~~**Mechanism Unknown:** The specific UI flow or service call used to *generate* new AI stories based on user input (e.g., prompts, selected words) has **not been identified** in the analyzed codebase.~~ (Now identified as `ContentGeneratorModal`)
*   **AIAssistant (`components/AIAssistant.tsx`):** This component provides *in-reading* assistance (pronunciation, definition) and manages the recording process for *sentence-level pronunciation practice* on existing text. It does **not** generate new story content. (Confirmed)
*   **Storage/Retrieval:** Generated content is stored in the `ai_generated_content` and `ai_content_items` tables in Supabase and retrieved via functions in `services/database.ts`. (Confirmed, saving done via `saveAIGeneratedContent` in the modal)

## Services

*   **Azure Speech Service (`services/azure-speech.ts`):**
    *   Interfaces with `microsoft-cognitiveservices-speech-sdk`.
    *   Uses Azure Key/Region from environment variables (`EXPO_PUBLIC_...`).
    *   Includes credential validation.
    *   Provides `assessPronunciation` for single-word assessment (implemented).
    *   Provides `textToSpeech` for speech synthesis (implemented).
    *   **IMPLEMENTED:** The `assessSentencePronunciationAzure` function, needed by the main reading screen (`app/read/[id].tsx`), is now implemented to perform sentence-level analysis via Azure, returning detailed word-level feedback.
    *   Defines types for assessment results (e.g., `SentencePronunciationResultAzure`).
*   **Database Service (`services/database.ts`):**
    *   Centralizes interactions with the Supabase database using the client from `lib/supabase.ts`.
    *   Defines interfaces for key data structures: `AIGeneratedContent`, `AIContentItem`, `Child`, `Badge`.
    *   Provides functions for managing child profiles (`getActiveChild`, `setActiveChild` using RPC).
    *   Provides functions for CRUD operations on AI-generated content:
        *   `saveAIGeneratedContent`: Saves main content record and associated page items.
        *   `getAIGeneratedContent`: Fetches a specific content piece and its items.
        *   `getAllAIGeneratedContent`: Fetches all content for a user.
        *   `deleteAIGeneratedContent`: Deletes content and items.
    *   Includes `convertAIContentToBook` utility to adapt AI content structure for the reader component.
    *   **AI Content Structure:** Content is stored in two tables: `ai_generated_contents` (main info: title, type, level) and `ai_content_items` (page info: text, image_url, audio_url, display_order, linked by `content_id`).

## Other Key Files & Concepts

*   **`lib/supabase.ts`:** Initializes the Supabase client.
*   **Onboarding Data Saving (`app/onboarding/ReadingPlan.tsx`):** Saves user, child, profile, and assessment data to Supabase tables (`parents`, `children`, `onboarding_profiles`, `assessments`) after user creation in Auth. Contains security flaw (saving raw password).

---
*Further details will be added as more files are analyzed.*
