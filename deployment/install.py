# After running upload.py,
#  install.py is to be run from /tmp/staging/deployment/ on the server at test.fa.mpeschel10.com
# install.py moves the files copied to /tmp/staging/ elsewhere as needed.

from pathlib import Path
import subprocess

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

def main():
	staging_dir = Path('/tmp/staging')
	for source_path, dest_path in file_upload_pairs:
		source_path = staging_dir.joinpath(source_path)
		dest_path = staging_dir.joinpath(dest_path)
		
		# If we switch to source_path.rename instead of 'mv',
		#  note that most of the relative destinations are directories,
		#  and rename doesn't like that.
		subprocess.run(['mv', source_path, dest_path])
	
	subprocess.run(['ln', '-s', '/etc/nginx/sites-available/facial-analytics-http.conf', '/etc/nginx/sites-enabled/'])

if __name__ == '__main__':
	main()
