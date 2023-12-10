import subprocess
from pathlib import Path
import os # chdir

# ('relative/path/in/repo', '/absolute/path/on/server')
file_upload_pairs = [
	('deployment/facial-analytics-http.conf', '/etc/nginx/sites-available/'),
	('deployment/facial-analytics.conf', '/etc/nginx/sites-available/'),
	
	('fa/index.html', '/var/www/fa/'),
	
	# install.py has to be uploaded in order to run it, but it should not be "installed" anywhere.
	# I guess it's cleaner to say we move it to itself than to put an exception in paths_to_upload?
	# Idk.
	('deployment/install.py', 'deployment/install.py'),
]

flags = '-' + ''.join([
	'R', # Keep relative paths.
	# Otherwise, rsync dumps all the files in the same directory,
	#  and if we have index.html and users/index.html they would clobber each other.
])

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
	
	paths_to_upload = [source for source, dest in file_upload_pairs]
	command = ['rsync', flags] + paths_to_upload + ['/home/mpeschel/projects/temp/deploy_test']
	subprocess.run(command)

if __name__ == '__main__':
	main()
