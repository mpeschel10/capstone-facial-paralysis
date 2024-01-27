# How to deploy
This guide will eventually give a complete list of the commands for manually setting up a server with our code on it. It is intended to guide automated deployment.

## Preparing the server
```sh
ssh root@test.fa.mpeschel10.com
apt-get update
apt-get upgrade
apt-get install nodejs npm nginx git
```

## Setting up nginx
```sh
ssh root@test.fa.mpeschel10.com
systemctl enable nginx --now
```

## Setting up the next.js server
```sh
ssh root@test.fa.mpeschel10.com
rm -r /opt/fa-test
mkdir -p /opt/fa-test/uploads
npm run build
systemctl enable fa-test-server --now
```

## When you modify deployment/facial-analytics.conf
```sh
ssh root@test.fa.mpeschel10.com
ln -s /etc/nginx/sites-available/facial-analytics.conf /etc/nginx/sites-enabled/
nginx -t && nginx -s reload
```

## When you modify deployment/fa-test-server.service
```sh
ssh root@test.fa.mpeschel10.com
systemctl daemon-reload
systemctl restart fa-test-server
```

## When you modify other code
```sh
git remote add test root@test.fa.mpeschel10.com:/opt/fa-test
git push test main
```

## Other useful commands
```sh
git rev-parse --show-toplevel # Prints the git repo root. Handy for automation
```

<!-- ///////////////// TODO


('relative/path/in/repo', '/absolute/path/on/server')
file_upload_pairs = [
     	('deployment/facial-analytics-https.conf', '/etc/nginx/sites-available/'),
 	('deployment/facial-analytics.conf', '/etc/nginx/sites-available/'),

 	('deployment/fa-test-server.service', '/etc/systemd/system/'),
	

('app', '/opt/fa-test/'),
('node_modules', '/opt/fa-test/'),
('public', '/opt/fa-test/'),
('next.config.js', '/opt/fa-test/'),
('package-lock.json', '/opt/fa-test/'),
('package.json', '/opt/fa-test/'),
('lib', '/opt/fa-test/'),
 ] -->
