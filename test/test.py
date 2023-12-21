import argparse, os, time, signal, subprocess
import logging, traceback
import base64, json

import requests
from requests.adapters import HTTPAdapter, Retry



PORT = 3000
SERVER_URL = 'http://127.0.0.1:%d' % PORT



from pathlib import Path
def get_repo_dir():
    return Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode('utf-8').strip())

repo_dir = get_repo_dir()
uploads_dir = repo_dir.joinpath('uploads')
db_reset_path = repo_dir.joinpath('facial-analytics.sql')

test_dir = repo_dir.joinpath('test')
cat_image_path = test_dir.joinpath('resources', 'cat.jpg')
db_test_data_path = test_dir.joinpath('resources', 'test.sql')
server_pid_path = test_dir.joinpath('run', 'server_pid')



import logging
logger = logging.getLogger('test')

def subseteq(left, right):
    for lkey, lvalue in left.items():
        if not lkey in right:
            return False
        if not lvalue == right[lkey]:
            return False
    return True



def reset_uploads():
    for path in uploads_dir.iterdir():
        path.unlink()

def apply_sql(path):
    with path.open('rb') as sql_file:
        buffer = sql_file.read()
        p = subprocess.Popen(['mariadb', '--user=test_user', '--password=password', '-D', 'fa'], stdin=subprocess.PIPE)
        p.communicate(buffer)

def reset_db():
    logger.debug('Beginning reset database.')
    apply_sql(db_reset_path)
    apply_sql(db_test_data_path)
    logger.info('Reset database OK')

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
    all_ok = True
    s = requests.Session()
    
    # This should fail because it has no body or anything.
    test_name = 'POST /api/image empty'
    observed_str = 'response.status_code'
    expected = 400
    
    logger.debug(f'Begin test {test_name}')
    response = s.post(SERVER_URL + '/api/image')
    response.json() # Just confirm that it's valid JSON
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    # This should succeed. The file should appear in /uploads/.
    test_name = 'POST /api/image cat'
    observed_str = 'response.json()'
    expected = ['api/image/cat.jpg']
    
    logger.debug(f'Begin test {test_name}')
    image_file = cat_image_path.open('rb')
    response = s.post(SERVER_URL + '/api/image', files={'cat.jpg': image_file})
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    test_name = 'GET /api/image cat check upload'
    image_url = SERVER_URL + '/' + observed[0].lstrip('/')
    observed_str = f's.get({repr(image_url)}).content'
    expected_str = 'cat_image_path.open("rb").read()'

    expected = eval(expected_str)
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        all_ok = False
    
    if all_ok:
        logger.info('Test method test_api_image OK')
    
    return all_ok

def test_api_user():
    all_ok = True
    s = requests.Session()
    
    test_name = 'GET /api/user'
    observed_str = 'response.json()'
    expected = [
        {'id': 1, 'username': 'mpeschel', 'kind': 'ADMIN', 'clinician_id': None},
        {'id': 2, 'username': 'jcarson', 'kind': 'ADMIN', 'clinician_id': None},
        {'id': 3, 'username': 'jmiranda', 'kind': 'ADMIN', 'clinician_id': None},
        
        {'id': 4, 'username': 'ghouse', 'kind': 'ADMIN', 'clinician_id': None},
        
        {'id': 5, 'username': 'radler', 'kind': 'USER', 'clinician_id': 4},
        {'id': 6, 'username': 'rculling', 'kind': 'USER', 'clinician_id': None},
    ]
    
    logger.debug(f'Begin test {test_name}')
    response = s.get(SERVER_URL + '/api/user')
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == \n{expected} but got \n{observed}.')
        all_ok = False
    
    test_name = 'POST /api/user'
    
    def urlsafe_b64decode_padded(s):
        return base64.urlsafe_b64decode(s + "=" * ((4 - len(s)) % 4))
    
    # We expect a JWT (JSON Web Token) which is three b64 strings joined with periods.
    # The first string is metadata for the token (algorithm I guess).
    # The seconds string is what we actually check. Get it by splitting on periods.
    # The third string is the salted hash, which the server uses as a signature.

    # We decode the second string from b64, then from json to get a dict.
    # Along with some other stuff, the dict should have our username and id.
    observed_str = 'json.loads(urlsafe_b64decode_padded(response.json().split(".")[1]))'
    expected = { 'user_id':7, 'username':'lwimmel' }
    
    logger.debug(f'Begin test {test_name}')
    response = s.post(SERVER_URL + '/api/user', data={
        'username': 'lwimmel',
        'password': 'lwimmel_password',
        'kind': 'USER',
    })
    observed = eval(observed_str)

    if not subseteq(expected, observed):
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    test_name = 'POST /api/user duplicate'
    observed_str = 'response.json()'
    expected = 'Error: Duplicate username\r\nThe username "lwimmel" is already taken.\r\nPlease choose another.'
    
    logger.debug(f'Begin test {test_name}')
    response = s.post(SERVER_URL + '/api/user', data={
        'username': 'lwimmel',
        'password': 'lwimmel_password',
        'kind': 'USER',
    })
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    if all_ok:
        logger.info('Test method test_api_user OK')
    return all_ok

def main():
    '''Performs tests on the facial-analytics server. Prints failures to console.

    Assumes the server is up and running at port %d.
    ''' % PORT
    
    logger.debug('Start of main.')

    reset_uploads()
    reset_db()
    
    all_ok = True
    for test_method in [test_api_image, test_api_user]:
        try:
            all_ok = all_ok and test_method()
        except Exception as e:
            logger.error(f'Failure on test method {test_method.__name__}: Got exception {e}')
            print(traceback.format_exc())
            all_ok = False

    logger.debug('End of main.')
    logger.info('All tests finished; %s', 'all OK' if all_ok else 'some errors')



if __name__ == '__main__':
    # At the moment, the server creation stuff only works on my specific Arch machine.
    # Feel free to add Windows stuff as necessary.

    os.chdir(repo_dir)

    parser = argparse.ArgumentParser()
    parser.add_argument('--make_server', action='store_true')
    parser.add_argument('--dont_close_server', action='store_true')
    parser.add_argument('--log_level', default='INFO', choices=logging.getLevelNamesMapping().keys())
    args = parser.parse_args()

    logging.basicConfig(level=logging.CRITICAL) # Suppress URLLib3 warning about timeouts
    logger.setLevel(getattr(logging, args.log_level.upper()))
    
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
        # print('Exception:', e)
        raise e
    finally:
        if not p is None and not args.dont_close_server:
            time.sleep(2) # If there's an immediate exception, launc_server.sh will not write pid in time.
            server_pid = int(server_pid_path.open().read())
            os.kill(server_pid, signal.SIGTERM)
