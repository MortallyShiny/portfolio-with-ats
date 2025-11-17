fswatch -o ./src ./public | xargs -n1 -I{} sh -c "git add . && git commit -m \"Auto update $(date +%H:%M:%S)\" && git push"
