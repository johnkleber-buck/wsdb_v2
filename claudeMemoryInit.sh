#!/bin/bash

# Claude Version Control Integration Setup Script
# This script sets up a hybrid version control system that combines:
# - Standard Git version control
# - Claude project memory tracking for conceptual history
# - Helper functions for efficient version management

echo "🔧 Setting up Claude Version Control Integration..."

# Check if git is initialized, if not initialize it
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
  
  # Ask for remote repository URL
  read -p "Enter your remote repository URL (or leave blank to skip): " REPO_URL
  
  if [ ! -z "$REPO_URL" ]; then
    git remote add origin "$REPO_URL"
    echo "✅ Remote repository configured: $REPO_URL"
  else
    echo "⚠️ No remote repository configured. You can add one later with: git remote add origin YOUR_REPO_URL"
  fi
else
  echo "✅ Git repository already initialized"
  
  # Check if remote is configured
  if ! git config --get remote.origin.url > /dev/null; then
    read -p "Enter your remote repository URL (or leave blank to skip): " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
      git remote add origin "$REPO_URL"
      echo "✅ Remote repository configured: $REPO_URL"
    fi
  else
    echo "✅ Remote repository already configured: $(git config --get remote.origin.url)"
  fi
fi

# Create project memory file
echo "Creating project memory file..."
cat > .claude-project-memory.md << 'EOF'
# PROJECT VERSION HISTORY

## Current State ($(date +%Y-%m-%d))
- Project initialized with Claude version control integration
- Setup script executed
EOF

# Create git guidelines file
echo "Creating git guidelines file..."
cat > .claude-git-guidelines.md << 'EOF'
# VERSION CONTROL PROCEDURES

## Commit Frequency
- Commit after each functional component is completed
- Commit after significant styling changes
- Commit after bug fixes
- Use atomic commits (one logical change per commit)

## Commit Message Format
- Use imperative mood ("Add feature" not "Added feature")
- Structure: "<type>: <description>"
- Types: feat, fix, style, refactor, docs, test, chore

## Branch Strategy
- main: production-ready code
- develop: integration branch
- feature/<name>: for new features
- bugfix/<name>: for bug fixes

## Git Commands to Use
- New feature: git checkout -b feature/name
- Save work: git add . && git commit -m "type: description"
- Push changes: git push -u origin feature/name
- Pull latest changes: git pull origin main
- Merge completed feature: git checkout main && git merge feature/name
- Push merged changes: git push origin main
- Revert change: git revert <commit-hash>
EOF

# Create helper functions
echo "Creating helper functions..."
cat > .claude-helpers.sh << 'EOF'
#!/bin/bash

# Function to update project memory
update_project_memory() {
  local section="$1"
  local description="$2"
  local commit_hash="$(git rev-parse HEAD 2>/dev/null || echo 'no-commit')"
  local commit_msg="$(git log -1 --pretty=%B 2>/dev/null || echo 'No commit message')"
  
  # Create temporary file with new entry
  cat << INNEREOF > .temp-memory-entry
## $section ($(date +%Y-%m-%d))
$description
- Git: commit $commit_hash "$commit_msg"

INNEREOF
  
  # Insert new entry after header
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS requires a backup extension with sed -i
    sed -i '' "2r .temp-memory-entry" .claude-project-memory.md
  else
    # Linux and others
    sed -i "2r .temp-memory-entry" .claude-project-memory.md
  fi
  
  rm .temp-memory-entry
  
  echo "Project memory updated with $section"
}

# Function to create a feature branch and push to remote
create_feature() {
  local branch_name="feature/$1"
  git checkout -b $branch_name
  
  # Try to push to remote, but don't fail if it doesn't work
  git push -u origin $branch_name 2>/dev/null || echo "Warning: Could not push to remote, continuing locally"
  
  echo "Created branch $branch_name"
}

# Function to complete a feature and push to main
complete_feature() {
  local branch_name="$(git symbolic-ref --short HEAD 2>/dev/null || echo 'unknown')"
  
  # Try to push branch changes
  git push origin $branch_name 2>/dev/null || echo "Warning: Could not push to remote, continuing locally"
  
  # Try to check out main (or master for older repos)
  git checkout main 2>/dev/null || git checkout master 2>/dev/null || echo "Warning: Could not switch to main branch"
  
  # Try to pull latest changes
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "Warning: Could not pull from remote"
  
  # Merge the feature branch
  git merge $branch_name
  
  # Try to push the merged changes
  git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo "Warning: Could not push to remote"
  
  echo "Merged $branch_name to main branch"
}

# Export functions
export -f update_project_memory
export -f create_feature
export -f complete_feature
EOF

# Make helper script executable
chmod +x .claude-helpers.sh

# Create Claude memory with instructions
echo "Creating Claude memory file..."
cat > .claude-memory << 'EOF'
This project uses a hybrid version control approach:
- Git for technical version control (.git/)
- Project memory for conceptual history (.claude-project-memory.md)
- Version control guidelines (.claude-git-guidelines.md)

When making changes:
1. Always pull latest changes before starting work
2. Create feature branches for new components
3. Make atomic commits with proper messages
4. Update project memory with high-level descriptions
5. Reference Git commits in project memory entries

For remote repository operations:
1. Always pull latest changes before starting work
2. Create feature branches and push to origin
3. Keep the remote repository in sync with local changes
4. After merging, push changes to the remote repository
5. Update project memory after significant pushes
EOF

# Create workflow example
echo "Creating workflow example file..."
cat > .claude-workflow-example.md << 'EOF'
# Example Workflow with Remote Repository

## Starting a New Feature
```
claude do "git pull origin main && source .claude-helpers.sh && create_feature example-feature"
```

## Implementing Changes
[Claude implements the feature]

## Committing and Pushing
```
claude do "git add . && git commit -m 'feat: add example feature' && git push origin feature/example-feature"
```

## Updating Project Memory
```
claude do "source .claude-helpers.sh && update_project_memory 'Example Feature' '- Added example feature
- Implemented key functionality
- Added tests and documentation'"
```

## Completing and Merging
```
claude do "source .claude-helpers.sh && complete_feature"
```
EOF

# Update .gitignore to include Claude files
echo "Updating .gitignore..."
if [ ! -f ".gitignore" ]; then
  touch .gitignore
fi

if ! grep -q "claude" .gitignore; then
  cat >> .gitignore << 'EOF'

# Claude helper files - uncomment to exclude from repository
# .claude-memory
# .claude-project-memory.md
# .claude-git-guidelines.md
# .claude-helpers.sh
# .claude-workflow-example.md
EOF
fi

# Make initial commit with Claude files
echo "Making initial commit..."
git add .claude-* .gitignore
git commit -m "chore: add Claude version control integration" || echo "No commit made - you may need to configure Git user.name and user.email"

# Show completion message
echo "✅ Claude Version Control Integration setup complete!"
echo ""
echo "To use this system:"
echo "1. Source the helpers: source .claude-helpers.sh"
echo "2. Create a feature branch: create_feature my-feature"
echo "3. Make changes and commit them"
echo "4. Update project memory: update_project_memory 'My Feature' '- Added feature X'"
echo "5. Complete and merge: complete_feature"
echo ""
echo "See .claude-workflow-example.md for more detailed examples."