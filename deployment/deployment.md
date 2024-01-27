## How to deploy
This guide will eventually give a complete list of the commands for manually setting up a server with our code on it. It is intended to guide automated deployment.

/////////////////// TODO
// 'git', 'rev-parse', '--show-toplevel'
// # ['apt-get', 'update'],
// # ['apt-get', 'upgrade'],
// # ['apt-get', 'install', 'nodejs', 'nginx'],

// # ['ln', '-s', '/etc/nginx/sites-available/facial-analytics-https.conf', '/etc/nginx/sites-enabled/'],

// # ['systemctl', 'enable', 'nginx', '--now'],
// # ['nginx', '-s', 'reload'],

// ['rm', '-r', '/opt/fa-test/public/uploads'],
// ['mkdir', '-p', '/opt/fa-test/uploads'],
// ['systemctl', 'daemon-reload'],
// # ['systemctl', 'enable', 'fa-test-server', '--now'],
// ['npm', 'run', 'build'],
// ['systemctl', 'restart', 'fa-test-server'],
// # ('relative/path/in/repo', '/absolute/path/on/server')
// file_upload_pairs = [
// 	('deployment/facial-analytics-https.conf', '/etc/nginx/sites-available/'),
// 	('deployment/facial-analytics.conf', '/etc/nginx/sites-available/'),

// 	('deployment/fa-test-server.service', '/etc/systemd/system/'),
	
// 	('deployment/install.py', '/tmp/staging/'),

// 	('app', '/opt/fa-test/'),
// 	('node_modules', '/opt/fa-test/'),
// 	('public', '/opt/fa-test/'),
// 	('next.config.js', '/opt/fa-test/'),
// 	('package-lock.json', '/opt/fa-test/'),
// 	('package.json', '/opt/fa-test/'),
// 	('lib', '/opt/fa-test/'),
// ]
