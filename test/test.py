import argparse, logging, os, time, signal, subprocess
import filecmp

import requests
from requests.adapters import HTTPAdapter, Retry



PORT = 3000
SERVER_URL = 'http://127.0.0.1:%d' % PORT



from pathlib import Path
def get_repo_dir():
    return Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode('utf-8').strip())

repo_dir = get_repo_dir()
uploads_dir = repo_dir.joinpath('public', 'uploads')
test_dir = repo_dir.joinpath('test')
cat_image_path = test_dir.joinpath('resources', 'CatInBox.jpg')
server_pid_path = test_dir.joinpath('run', 'server_pid')



import logging
logger = logging.getLogger('test')



def clear_uploads():
    for path in uploads_dir.iterdir():
        path.unlink()

def await_server():
    # From https://stackoverflow.com/a/35504626
    # Begin copyrighted material
    s = requests.Session()

    retries = Retry(total=10,
                    backoff_factor=0.1,
                    status_forcelist=[ 500, 502, 503, 504 ])

    s.mount('http://', HTTPAdapter(max_retries=retries))
    # End of copyrighted material
    # See LICENSE.md for details

    logger.debug('Awaiting server at %s' % SERVER_URL)
    s.get(SERVER_URL)
    logger.info('Server ready.')


def test_api_image():
    s = requests.Session()
    
    # This should fail because it has no body or anything.
    test_name = 'POST /api/image empty'
    observed_str = 'response.status_code'
    expected = 400
    
    logger.debug(f'Begin test {test_name}.')
    response = s.post(SERVER_URL + '/api/image')
    response.json() # Just confirm that it's valid JSON
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
    
    # This should succeed. The file should appear in /public/uploads/.
    test_name = 'POST /api/image cat'
    observed_str = 'response.json()'
    expected = ['api/image/CatInBox.jpg']
    
    logger.debug(f'Begin test {test_name}.')
    image_file = cat_image_path.open('rb')
    response = s.post(SERVER_URL + '/api/image', files={'CatInBox.jpg': image_file})
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
    
    test_name = 'GET /api/image cat check upload'
    image_url = SERVER_URL + '/' + observed[0].lstrip('/')
    observed_str = f's.get({repr(image_url)}).content'
    expected_str = 'cat_image_path.open("rb").read()'

    expected = eval(expected_str)
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
    

def main():
    '''Performs tests on the facial-analysis server. Prints failures to console.

    Assumes the server is up and running at port %d.
    ''' % PORT
    
    logger.info('Start of main.')

    clear_uploads()
    
    for test_method in [test_api_image, ]:
        try:
            test_method()
        except Exception as e:
            logger.error(f'Failure on test method {test_method.__name__}: Got exception {e}')
    
    logger.info('End of main.')



if __name__ == '__main__':
    logging.basicConfig(level=logging.CRITICAL) # Suppress URLLib3 warning about timeouts
    logger.setLevel(logging.DEBUG)
    
    # At the moment, I've only implemented tests that work on my specific Arch machine.
    # Feel free to add Windows stuff as necessary.

    os.chdir(repo_dir)

    parser = argparse.ArgumentParser()
    parser.add_argument('--make_server', action='store_true')
    args = parser.parse_args()
    
    if args.make_server:
        # Launch the server in a new window, for neatness.
        # launch_server.sh will server the PID in a test/run/server_pid so we can kill it later.
        p = subprocess.Popen(['gnome-terminal', '--', test_dir.joinpath('launch_server.sh')])
    else:
        p = None

    try:
        await_server()
        main()
    except BaseException as e:
        print(e)
    finally:
        if not p is None:
            time.sleep(2) # If there's an immediate exception, launc_server.sh will not write pid in time.
            server_pid = int(server_pid_path.open().read())
            os.kill(server_pid, signal.SIGTERM)
