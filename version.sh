#! /bin/bash
echo
echo
echo "Version Bump"
echo

printf "What's the new version?"
read -e input
VERSION="${input:-y}"


# readme.txt
gsed -i -e "s/Stable tag: [^\s]*/Stable tag: $VERSION/" readme.txt
# Main plugin file
gsed -i -e "s/Version:\s*[^\s]*/Version:           $VERSION/" photography-portfolio.php
# In-PHP Version
gsed -i -e "s/version = [^\s]*;/version = '$VERSION';/g" Colormelon_Photography_Portfolio.php