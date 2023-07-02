splitByDot () {
    awk -F'.' '{ for( i=1; i<=NF; i++ ) print $i }' <<< $1
}

getGum () {
    case "$(uname -sr)" in

        Linux*)
            os='Linux'
            gum=./scripts/gum
        ;;

        CYGWIN*|MINGW*|MINGW32*|MSYS*)
            os='Windows'
            gum=./scripts/gum.exe

        ;;

        *)
            echo "Couldn't determine th OS, defaulting to Linux" >&2
            os='Linux'
            gum=./scripts/gum
        ;;
    esac

    echo $gum
}

promptVersion () {
    gum=$(getGum)
    PACKAGE_VERSION=$(npm pkg get version --workspaces=false | tr -d \")

    version=($(splitByDot $PACKAGE_VERSION))
    major=${version[0]}
    minor=${version[1]}
    patch=${version[2]}

    option1="$major.$minor.$patch"
    option2="$major.$minor.$((patch+1))"
    option3="$major.$((minor+1)).0"
    option4="$((major+1)).0.0"

    echo "Choose new package version (current $PACKAGE_VERSION)" >&2
    choosen_version=$(echo -e "$option1\n$option2\n$option3\n$option4" | $gum choose)
    echo $choosen_version
}

if ! command -v gh >/dev/null 2>&1; then
    echo "Couldn't find GitHub's CLI: 'gh'"
    exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
    gh auth login
fi


if [ -z "$1" ]; then
    if [[ -n $(git status -s) ]]; then
        echo "Commit changes before proceeding"
        exit 1
    fi

    choosen_version=$(promptVersion)
    
    npm pkg set version=$choosen_version

    ./scripts/apk-build.sh

elif [ $1 == "--skip-build" ]; then

    if [ -z "$choosen_version" ]; then
        choosen_version=$(promptVersion)
    fi

    apks=$(find ./releases -maxdepth 1 -name "*$choosen_version*")

    gh release create $choosen_version $apks

else 
    echo "Unknown argument: $1"
fi