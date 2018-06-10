# Whonow Changelog

# v1.2.0

- Add CSV logging with `--logfile`. 
- More logging to stdout with `--verbose`.

# v1.1.2

- Unique domain names and their program state are now case-insensitive.

# v1.1.1

- Fix bug that was causing all domain queries to affect the program state of A rebind rules, not just A requests themselves.
- Add a few tests
- Fix Github urls in `package.json`

# v1.1.0

- Package can now be installed globally with `npm install --cli -g whonow@latest`

# v1.0.1

- Package can now be installed globally with `npm install -g whonow`

# v1.0.0

- Initial release
