
# Product Requirements Document (PRD)

**Project Title**: AI-Powered Reading App for Kids

**Version**: 1.0  
**Author**: Vijay  
**Platform**: React Native (with Expo)  
**Target Audience**: Children aged 5–12, globally

---

## 1. **Objective**
Create a fun, interactive, and personalized reading app to help children improve their reading and pronunciation skills using AI technologies. The app will start with English and scale to support other languages in the future.

---

## 2. **Key Features (MoSCoW Prioritization)**

### **Must Have**
- **Onboarding & Assessment**
  - Parent-driven onboarding with child profile creation
  - Each child gets a personalized reading level based on adaptive assessment
  - Avatar creation per child
  - Adaptive assessment to gauge reading level (words, sentences, pronunciation)
  - Categorize users: Beginner, Intermediate, Advanced

- **Pre-Made Reading Materials**
  - Words, sentences, short paragraphs, and stories
  - Categorized by theme and difficulty level
  - Personalized material allocation based on each child's level

- **Pronunciation Evaluation**
  - Azure Pronunciation Assessment integration
  - Word-level feedback and accuracy score
  - Visual feedback (smiley faces, stars, etc.)

- **Content Interaction**
  - Text highlighting with voice narration
  - Tap-to-hear individual words
  - Speech recognition for repetition practice

- **Progress Tracking**
  - Progress bar per unit
  - Weekly activity report
  - Visual indicators of growth (stars, badges)
  - Metrics tracked individually for each child profile

- **Kid-Friendly UI**
  - Bright colors, intuitive icons, large buttons
  - Safe navigation with minimal options per screen

- **Gamification**
  - Daily reading streaks
  - Badges for achievements (e.g., "Pronunciation Pro")
  - Avatars that grow or evolve with reading progress

### **Should Have**
- **User-Generated Content**
  - Story and text creation via Haiku-3 API
  - Image illustration using Replicate AI

- **Voice-Over Customization**
  - Users can record their own voice
  - Option to switch between system voice and own recording

- **Parental Dashboard**
  - Create and manage multiple child profiles
  - View each child's progress, pronunciation scores
  - Customize reading goals for each profile
  - Set or adjust reading levels manually if desired

- **Offline Mode**
  - Ability to download lessons/stories for offline use

### **Could Have**
- **Emotion Detection in Voice**
  - Suggest breaks or easier content if child sounds stressed

- **Interactive Games**
  - Word puzzles, matching games using learned vocabulary

- **Social Sharing (Kid-safe)**
  - Share badges or reading achievements (e.g., via QR code to parents)

### **Won't Have (for MVP)**
- Real-time chat or forums
- Extensive content marketplace
- In-app purchases (initially)

---

## 3. **User Roles**
- **Parent (Primary User)**
  - Creates and manages multiple child profiles
  - Tracks and monitors reading progress and pronunciation
- **Child (Secondary User)**
  - Engages with reading content personalized to their level
  - Earns badges and rewards based on progress

---

## 4. **Technical Requirements**
- **Frontend**: React Native (Expo)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Services**:
  - Azure Pronunciation Assessment
  - Haiku-3 API for story/text generation
  - Replicate AI for image generation
- **Multilingual Support**: i18n-based architecture
- **Voice & Audio**: Expo Audio APIs, optional TTS

---

## 5. **User Journey (Onboarding to Reading)**
1. Parent opens app
2. Animated welcome screen + mascot introduction
3. Parent sets up an account and creates child profiles
4. Each child completes an onboarding assessment (visual, audio + short tasks)
5. Each child is assigned a reading level
6. First reading mission unlocked for each profile
7. Child reads with real-time voice feedback
8. Rewards and progress update per child profile

---

## 6. **Success Metrics**
- Number of active parent accounts
- Average number of profiles per account
- Daily Active Users (DAU) per child profile
- Average Session Duration
- Reading Completion Rate
- Improvement in pronunciation scores (tracked over time)
- Number of custom stories created

---

## 7. **Design Notes**
- Use a mascot to guide the child through the app
- Make heavy use of audio prompts to reduce reliance on reading navigation
- Include positive reinforcement animations (e.g., fireworks, clapping)
- Allow easy switching between profiles under the same parent account

---

## 8. **Next Steps**
- Finalize wireframes and UI mockups
- Build prototype for onboarding + pronunciation test
- Conduct usability testing with parents and children (ages 5–12)
- Iterate based on feedback
