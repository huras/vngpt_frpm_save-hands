.PHONY: build start server

build:
	# Add commands to build your project here
	# Example: npm run build in ./src
	cd ./src && npm run build

start:
	# Add commands to start your project here
	# Example: npm run start in ./backend-api
	cd ./backend-api && npm run start

server:
	# Add commands to start a PHP server here
	# Example: php -S localhost:8000 in ./
	php -S localhost:8000

backend:
	# Add commands to start a PHP server here
	# Example: php -S localhost:8000 in ./
	cd ./backend-api && npm run start

all: build start server
