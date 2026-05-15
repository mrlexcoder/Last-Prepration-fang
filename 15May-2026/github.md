# GitHub Setup

username:- mrlexcoder
email:- mrlexcoder@gmail.com

---

## Commands Used to Create & Push This Repo

```bash
# 1. Initialize a new git repository
git init

# 2. Set local git user config
git config user.name "mrlexcoder"
git config user.email "mrlexcoder@gmail.com"

# 3. Stage all files
git add .

# 4. First commit
git commit -m "Initial commit"

# 5. Create a new GitHub repo using gh CLI and push
gh repo create Last-Prepration-fang --public --source=. --remote=origin --push

# --- OR if repo already exists ---

# 5a. Add remote manually
git remote add origin https://github.com/mrlexcoder/Last-Prepration-fang.git

# 5b. Rename branch to main
git branch -M main

# 5c. Push to GitHub
git push -u origin main
```

---

## Useful gh CLI Commands

```bash
# Check auth status
gh auth status

# Login to GitHub
gh auth login

# List your repos
gh repo list

# Clone a repo
gh repo clone mrlexcoder/Last-Prepration-fang

# View repo in browser
gh repo view --web

# Create a private repo
gh repo create my-repo --private --source=. --remote=origin --push

# Create an issue
gh issue create --title "Bug fix" --body "Description here"

# List issues
gh issue list

# Create a pull request
gh pr create --title "Feature" --body "Description" --base main

# List pull requests
gh pr list

# Merge a pull request
gh pr merge <pr-number>

# View repo details
gh repo view mrlexcoder/Last-Prepration-fang
```
