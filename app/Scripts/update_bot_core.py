import json
import sys

def update_package_json(package_name, version, file_path='package.json'):
    with open(file_path, 'r') as file:
        data = json.load(file)
    data['dependencies'][package_name] = f"github:AI-will-rule-the-world/BotCore#{version}"
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def main():
    if len(sys.argv) < 2:
        print('Please provide a version.')
        return

    version = sys.argv[1]
    package_name = '@bot/core'
    update_package_json(package_name, version)

if __name__ == "__main__":
    main()
