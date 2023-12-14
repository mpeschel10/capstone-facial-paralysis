# To push changes to the test website run python upload.py.

import subprocess
from pathlib import Path
import os # chdir

# ('relative/path/in/repo', '/absolute/path/on/server')
file_upload_pairs = [
	('deployment/facial-analytics-https.conf', '/etc/nginx/sites-available/'),
	('deployment/facial-analytics.conf', '/etc/nginx/sites-available/'),

	('deployment/fa-test-server.service', '/etc/systemd/system/'),
	
	('deployment/install.py', '/tmp/staging/'),

	('app', '/opt/fa-test/'),
	('node_modules', '/opt/fa-test/'),
	('public', '/opt/fa-test/'),
	('next.config.js', '/opt/fa-test/'),
	('package-lock.json', '/opt/fa-test/'),
	('package.json', '/opt/fa-test/'),
]

UPLOAD_URI = 'fa-test'

short_flags = '-' + ''.join([
	'a', # Archive: Recursive, preserve relative paths and permissions, misc. other stuff.
	'v', # Verbose: Print to you, the viewer, what is being done.
])

long_flags = [
	'--delete', # If we delete something here, also delete it on the server.
]

def get_repo_dir():
	'''
	Returns a path containing the root directory of the git repository.
	
	This is necessary so you can call this script from inside ../deployment
		and not get a bunch of errors because the paths were supposed to be relative to the repo root.
	This function is buggy if you call it from another git repository,
		but I think that's out of scope.
	'''

	# strip() is necessary since git rev-parse includes a newline at the end.
	return Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode('utf-8').strip())

def main():
	# Temporarily move to repo root since all our paths are relative to it.
	os.chdir(get_repo_dir())
	
	for source, dest in file_upload_pairs:
		command = ['rsync', short_flags] + long_flags + [source, UPLOAD_URI + ':' + dest]
		print('Running command', ' '.join(command))
		subprocess.run(command)
	
	subprocess.run(['ssh', UPLOAD_URI, 'python3', '/tmp/staging/install.py'])
	print('Upload script done.')

if __name__ == '__main__':
	main()
