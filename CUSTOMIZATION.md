# 🎨 Customization Guide

How to make this app truly YOURS.

---

## ✏️ Editing Daily Tasks

### In the App (Coming Soon):
The "Edit Today's Tasks" button will let you customize each day's tasks.

### In the Code (Now):
Open `app.js` and find this section (around line 6):

```javascript
tasks: {
    craft: { completed: false, points: 30, name: '3 Focus Sessions' },
    vitality: { completed: false, points: 15, name: 'Training Run' },
    domain: { completed: false, points: 25, name: "Today's Cleaning Quest" },
    kin: { completed: false, points: 10, name: 'Quality Time with Family' },
    essence: { completed: false, points: 10, name: '30 Minutes for Yourself' }
}
```

**Change the `name` values to whatever you want:**

```javascript
craft: { completed: false, points: 30, name: 'LinkedIn Post + 2 Focus Sessions' },
vitality: { completed: false, points: 15, name: '5 Mile Run' },
domain: { completed: false, points: 25, name: "Clean Kitchen + Laundry" },
kin: { completed: false, points: 10, name: 'Read to Kids' },
essence: { completed: false, points: 10, name: 'Crochet 30 min' }
```

**Change points too if you want:**

```javascript
essence: { completed: false, points: 20, name: 'Crochet 30 min' }
// Now Essence is worth more points!
```

Save the file, refresh the page, done!

---

## 🎨 Changing Colors

Want different colors? Open `styles.css` and change these (top of file):

```css
:root {
    --color-gold: #C9A961;      /* Warm gold */
    --color-olive: #5C5F4A;     /* Main green */
    --color-forest: #3E4A3D;    /* Dark green */
    --color-sage: #9CAF88;      /* Light green */
    
    --color-parchment: #F4EDE3; /* Background */
}
```

**Example - Make it more Slytherin:**

```css
:root {
    --color-gold: #C9A961;      /* Keep gold */
    --color-olive: #2A4A2E;     /* Darker green */
    --color-forest: #1A3A1D;    /* Much darker */
    --color-parchment: #E8E4DC; /* Slightly cooler */
}
```

---

## 🔢 Changing Point Goals

In `app.js`, find this line (around line 458):

```javascript
const weekProgress = (weekPoints / 600) * 100;
```

Change `600` to whatever weekly goal you want:

```javascript
const weekProgress = (weekPoints / 500) * 100; // Lower goal
const weekProgress = (weekPoints / 800) * 100; // Higher goal
```

---

## ⏱️ Changing Timer Duration

In `app.js`, find the timer initialization (around line 12):

```javascript
timerState: {
    minutes: 25,  // ← Change this!
    seconds: 0,
    // ...
}
```

Want 30-minute sessions?

```javascript
timerState: {
    minutes: 30,
    seconds: 0,
    // ...
}
```

Also update the timer display and completion check:

Search for `25 * 60` in the file and replace with `30 * 60` (or whatever minutes × 60)

---

## 📝 Adding Custom Wisdom

In `index.html`, find the wisdom cards and add your own quotes:

```html
<p class="wisdom-text">"Deep work is a form of magic"</p>
```

Change to:

```html
<p class="wisdom-text">"Your own inspiring quote here"</p>
```

---

## 🏆 Adding More Achievements

In `app.js`, find the `checkAchievements()` function:

```javascript
// Add new achievement
if (appState.streak === 14) {
    showAchievement('twoweeks', 'Two Weeks Strong', 
        'You've shown up for 14 days straight. This is building something real.');
}
```

---

## 🎯 Changing Area Icons

In `index.html`, find each task card and change the emoji:

```html
<span class="area-icon">📜</span> <!-- Change to any emoji! -->
```

Want different icons?
- Craft: 🖋️ ✍️ 💼 🎨
- Vitality: 🏃‍♀️ 💪 ⚡ 🔥
- Domain: 🏡 🏰 🧹 ✨
- Kin: 💕 👨‍👩‍👧 💛 🤗
- Essence: ✨ 📚 🧶 🎨

---

## 📱 Changing App Name & Icon

### App Name:
In `manifest.json`:

```json
"name": "The Keeper's Mandate",
"short_name": "Keeper",
```

Change to whatever you want:

```json
"name": "My Life System",
"short_name": "MLS",
```

### App Icon:
Create two PNG images:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

Put them in the same folder. The manifest already references them!

**Icon Ideas:**
- 🦡🐍 together
- Just your initials
- A badger
- Your house crest
- Whatever resonates!

---

## 🔧 Advanced Customizations

### Add More Areas:
You could add a 6th area (like "Business" or "Learning"). This requires:
1. Add to `appState.tasks` in `app.js`
2. Add task card in `index.html`
3. Update stats calculations

### Change Layout:
Edit `styles.css` to change spacing, sizes, etc.

### Add Features:
- Custom task library
- Notes section
- Habit streaks per area
- Weekly review prompts

---

## 💡 Quick Wins

**Most Common Customizations:**

1. **Daily task names** → `app.js` line 6
2. **Colors** → `styles.css` line 10
3. **Timer length** → `app.js` line 12
4. **Weekly goal** → `app.js` line 458
5. **Wisdom quotes** → `index.html` search for "wisdom-text"

---

## 🚀 After Changes

1. Save the file(s)
2. If hosting: Upload to Netlify/Vercel/GitHub
3. If local: Refresh page
4. Changes should appear immediately!

---

## Need More Help?

The code is commented and organized. Look for:
- `// ============================================`
- These mark major sections

Files:
- `index.html` - Structure & content
- `styles.css` - All visual design
- `app.js` - All functionality

---

**Make it yours! This is YOUR ledger.** 🦡🐍✨
