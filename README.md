# 🧩 TaskQuest: Gamify Your Daily Habits

## 💡 Inspiration

Inspired by *Michael Bolduc's* _Science of Achievement_, TaskQuest was born from a powerful idea:  
> Help people become more aware of how they spend their time—joyfully and intentionally.

Coming from an engineering background, I was blown away by the no-code tool **Bolt**. It gave me the feeling that I could build *anything*. So I dove in headfirst—and quickly became obsessed. I truly believe this will be the new standard for building.

## 🛠️ What it does

TaskQuest is a gamified task management app that transforms daily to-dos into quests.  
Users can:
- Create and complete daily tasks
- Track streaks and feel a sense of progress
- Stay motivated through a reward-like interface

The goal is to make productivity feel fun and build positive habit loops—without stress.

## 🧱 How we built it

- **Frontend & logic**: Fully built using **Bolt**
- **Backend**: Integrated with **Supabase** (auth, data storage)
- **UI/UX**: Minimalist but gamified (checklists, streaks, stars)
- **Gamification**: Task streaks, quest badges, and completion rewards

## 😵 Challenges we ran into

Supabase integration was the biggest hurdle—especially around authentication flows and user profile management.  
Things like nickname storage and avatar uploads didn’t translate well through Bolt’s prompt-based logic, so I deprioritized them to focus on the core value.

## 🏆 Accomplishments that we're proud of

- Designed and shipped a fully functioning MVP using no-code
- Built an intuitive and fun user experience from scratch
- Learned to work around backend limitations with creative problem-solving
- Got initial user feedback that it helped them enjoy their daily routine more

## 📚 What we learned

- **No-code tools are powerful**, but knowing their boundaries is key  
- It’s okay to pivot or pause features when they get in the way of delivering core value  
- Simple ideas, when made delightful, can have real emotional impact

## 🔮 What's next for TaskQuest

I plan to evolve TaskQuest into an **AI-driven goal coach**.  
Instead of manually entering tasks, users will input a goal like “learn English” or “lose 5kg,” and the app will generate a full, personalized quest roadmap to achieve it.

The long-term vision:  
Build an **Agentic AI Coaching App** that helps people live intentionally, joyfully, and in control of their own time.

## 🛠️ Built with

- **Languages**  
  - JavaScript (primary scripting language)  
  - HTML & CSS (for UI and styling)

- **Frameworks & Libraries**  
  - React (default front-end framework)  
  - Vite (build tool and development server)  
  - Tailwind CSS (utility-first CSS framework)

- **Platforms & IDE**  
  - Bolt (AI-powered no-code/low-code web development environment)  
  - StackBlitz WebContainers (enables full Node.js environment in the browser)

- **Cloud Services**  
  - Supabase (used for authentication, database, and storage)

- **Database**  
  - PostgreSQL (managed by Supabase)

- **Authentication**  
  - Supabase Auth (email link login and social OAuth support)

- **APIs**  
  - Supabase Client SDK (to access auth, database, and storage via RESTful APIs)

- **Hosting / Deployment**  
  - Runs in-browser via StackBlitz by default  
  - Can be exported to platforms like Netlify or Vercel for production deployment