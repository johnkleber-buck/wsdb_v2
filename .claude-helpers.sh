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
