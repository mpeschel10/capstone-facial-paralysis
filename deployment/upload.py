# To push changes to the test website,
#  run upload.py, then ssh into the site and run /tmp/staging/deployment/install.py

import subprocess
from pathlib import Path
import os # chdir

# Note: If you are adding a file to be uploaded,
#  put it in file_upload_pairs in install.py.
from install import file_upload_pairs

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
	command = ['rsync', flags] + paths_to_upload + ['fa-test:/tmp/staging/']
	subprocess.run(command)

if __name__ == '__main__':
	main()
