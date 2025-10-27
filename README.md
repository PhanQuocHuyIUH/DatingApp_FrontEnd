1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## 📝 THỨ TỰ CODE CHỈ GIAO DIỆN

### 1️⃣ Setup Foundation

### 2️⃣ Authentication Screens

```
⭐ app/(auth)/index.tsx         # Screen 3: Login (Apple, Facebook, Phone buttons)
```

### 3️⃣ Discovery/Swipe Screens

```
⭐ app/(main)/(discover)/index.tsx        # Screen 6: Swipe cards
⭐ app/(main)/(discover)/profile-detail.tsx  # Screen 8: Full profile
⭐ app/(main)/(discover)/filters.tsx      # Screen 10: Filters
⭐ app/modal/swipe-confirmation.tsx       # Screen 5: Confirm swipe
```

### 4️⃣ Matches Screens

```
⭐ app/(main)/(matches)/index.tsx         # Screen 13: Matches grid
⭐ app/modal/match-found.tsx              # Screen 1: Match celebration
```

### 5️⃣ Messages Screens

```
⭐ app/(main)/(messages)/index.tsx        # Screen 13: Conversations
⭐ app/(main)/(messages)/[chatId].tsx     # Screen 12: Chat UI
⭐ app/(main)/(messages)/video-call.tsx   # Screen 7: Video call
```

### 6️⃣ Profile Screens

```
⭐ app/(main)/(profile)/index.tsx         # Screen 4: Profile view
⭐ app/(main)/(profile)/edit.tsx          # Screen 9: Edit profile
⭐ app/(main)/(profile)/subscription.tsx  # Screen 4: Premium plans
```

---

## 🎯 CHỈ CẦN TẬP TRUNG 3 FOLDER

```
heartsync-app/
├── app/                    # ⭐ Tất cả screens ở đây
├── src/
│   ├── components/ui/      # ⭐ Base UI components
```

---
