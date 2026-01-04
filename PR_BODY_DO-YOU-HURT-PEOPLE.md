Title: Add: "Do You Hurt People On Purpose?" quiz

Branch: add/do-you-hurt-people-quiz

Commit message: Add: "Do You Hurt People On Purpose?" quiz and update links

Summary:
- Adds a new quiz page at `quiz/do-you-hurt-people-on-purpose.html` (22 questions mapping awareness, conscience, intent).
- Updates `quizzes.html` and `quiz/is-my-partner-a-narc.html` so the site links to the new page and uses the preferred phrasing.
- NOTE: the earlier file `quiz/do-they-hurt-on-purpose.html` remains in the repo (kept intentionally as requested).

Files added/changed:
- Added: `quiz/do-you-hurt-people-on-purpose.html`
- Existing (kept): `quiz/do-they-hurt-on-purpose.html` (duplicate)
- Modified: `quizzes.html` (quiz card link + title)
- Modified: `quiz/is-my-partner-a-narc.html` (CTA links)

Why:
Make the quiz available under the preferred phrasing and ensure index & related pages link to it.

Testing / QA steps:
1. Locally serve site: `python -m http.server 8000`
2. Open: http://localhost:8000/quiz/do-you-hurt-people-on-purpose.html
3. Verify the quiz loads, navigation works, results display, and the links from `/quizzes.html` and `quiz/is-my-partner-a-narc.html` point to the new page.

Notes:
- If you want to remove the old `do-they-hurt-on-purpose.html` (dedupe), I can create a follow-up commit.

Suggested reviewers:
- @site-owner (replace with actual handle)
- @content-lead (replace with actual handle)

Labels: content, quiz, site-update

Commands to apply patch & create branch locally:

```bash
# create branch
git checkout -b add/do-you-hurt-people-quiz

# apply the patch
git apply do-you-hurt-people-on-purpose.patch

# stage and commit
git add quiz/do-you-hurt-people-on-purpose.html quizzes.html quiz/is-my-partner-a-narc.html
git commit -m "Add: \"Do You Hurt People On Purpose?\" quiz and update links"

# push and open PR
git push -u origin add/do-you-hurt-people-quiz
```