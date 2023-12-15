# After running upload.py,
#  install.py is to be run from /tmp/staging/ on the server at test.fa.mpeschel10.com

import os, subprocess
from pathlib import Path

def main():
	commands = [
		# ['apt-get', 'update'],
		# ['apt-get', 'upgrade'],
		# ['apt-get', 'install', 'nodejs', 'nginx'],

		# ['ln', '-s', '/etc/nginx/sites-available/facial-analytics-https.conf', '/etc/nginx/sites-enabled/'],

		# ['systemctl', 'enable', 'nginx', '--now'],
		# ['nginx', '-s', 'reload'],

		['mkdir', '-p', '/opt/fa-test/public/uploads'],
		['systemctl', 'daemon-reload'],
		# ['systemctl', 'enable', 'fa-test-server', '--now'],
		['npm', 'run', 'build'],
		['systemctl', 'restart', 'fa-test-server'],
	]

	os.chdir('/opt/fa-test/')
	for command in commands:
		subprocess.run(command)
	
	print('Install script done.')


if __name__ == '__main__':
	main()
