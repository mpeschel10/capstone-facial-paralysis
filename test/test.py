import argparse, os, time, signal, subprocess
import logging, traceback
import base64, datetime, json

import inspect

import requests
from requests.adapters import HTTPAdapter, Retry



from test_lib import SERVER_URL


import shutil
from pathlib import Path

from test_lib import repo_dir
uploads_dir = repo_dir.joinpath('uploads')
badger_upload_path = uploads_dir.joinpath('badger.jpg')
beaver_upload_path = uploads_dir.joinpath('beaver.jpg')
dog_upload_path = uploads_dir.joinpath('dog.jpg')
owl_upload_path = uploads_dir.joinpath('owl.jpg')

db_reset_path = repo_dir.joinpath('facial-analytics.sql')

from test_lib import test_dir
from test_lib import cat_image_path, badger_image_path, beaver_image_path, dog_image_path, owl_image_path

db_test_data_path = test_dir.joinpath('resources', 'test.sql')
server_pid_path = test_dir.joinpath('run', 'server_pid')



import logging
logger = logging.getLogger('test')



def eq(left, right):
    return left == right

def subseteq(left, right):
    for lkey, lvalue in left.items():
        if not lkey in right:
            return False
        if not lvalue == right[lkey]:
            return False
    return True



def urlsafe_b64decode_padded(s):
    return base64.urlsafe_b64decode(s + "=" * ((4 - len(s)) % 4))

def jwt_to_dict(jwt):
    json_str = urlsafe_b64decode_padded(jwt.split(".")[1])
    return json.loads(json_str)

def chomp_left(s, prefix):
    if not s.startswith(prefix): return None
    return s[len(prefix):]


def reset_uploads():
    for path in uploads_dir.iterdir():
        path.unlink()
    shutil.copyfile(badger_image_path, badger_upload_path)
    shutil.copyfile(beaver_image_path, beaver_upload_path)
    shutil.copyfile(dog_image_path, dog_upload_path)
    shutil.copyfile(owl_image_path, owl_upload_path)

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

from test_lib import login, logout
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


def test(test_name, observed_str, expected=None, expected_str=None, comparison=eq):
    if expected == None and expected_str == None:
        raise Exception(f'Bad test {test_name}; both expected and expected_str are None.')
    if expected != None and expected_str != None:
        raise Exception(f'Bad test {test_name}; both expected and expected_str are not None.')
    
    
    logger.debug(f'Begin test {test_name}')
    context_locals = inspect.currentframe().f_back.f_locals
    if expected_str != None:
        expected = eval(expected_str, None, context_locals)
    observed = eval(observed_str, None, context_locals)

    if not comparison(expected, observed):
        if expected_str is None:
            logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        else:
            logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        return False

    return True


def test_api_user():
    all_ok = True
    s = requests.Session()
    endpoint_str = repr(SERVER_URL + '/api/user')
    

    logout(s)
    all_ok = all_ok and test(
        'GET /api/user unauthenticated',
        f's.get({endpoint_str}).status_code',
        401,
    )
    
    
    login(s, "rculling", "rculling_password")
    all_ok = all_ok and test(
        'GET /api/user user permissions',
        f's.get({endpoint_str}).status_code',
        403,
    )
    

    login(s, "jcarson", "jcarson_password")
    expected = [
        {'id': 1, 'username': 'mpeschel', 'kind': 'ADMIN', 'clinician_id': None},
        {'id': 2, 'username': 'jcarson', 'kind': 'ADMIN', 'clinician_id': None},
        {'id': 3, 'username': 'jmiranda', 'kind': 'ADMIN', 'clinician_id': None},
        
        {'id': 4, 'username': 'ghouse', 'kind': 'ADMIN', 'clinician_id': None},
        
        {'id': 5, 'username': 'radler', 'kind': 'USER', 'clinician_id': 4},
        {'id': 6, 'username': 'rculling', 'kind': 'USER', 'clinician_id': None},
    ]
    all_ok = all_ok and test(
        'GET /api/user admin permissions',
        f's.get({endpoint_str}).json()',
        expected,
    )

    
    logout(s)
    user_data = {
        'username': 'lwimmel',
        'password': 'lwimmel_password',
        'kind': 'USER',
    }
    all_ok = all_ok and test(
        'POST /api/user unauthenticated',
        f's.post({endpoint_str}, data=user_data).status_code',
        401,
    )

    
    login(s, 'radler', 'radler_password')
    # Normal users are forbidden from creating more users.
    all_ok = all_ok and test(
        'POST /api/user user permissions',
        f's.post({endpoint_str}, data=user_data).status_code',
        403,
    )
    
    
    login(s, 'jmiranda', 'jmiranda_password')
    # Admins can create anything.
    all_ok = all_ok and test(
        'POST /api/user admin permissions',
        f's.post({endpoint_str}, data=user_data).json()',
        { 'user_id':7, 'username':'lwimmel', 'kind':'USER' },
    )

    
    all_ok = all_ok and test(
        'POST /api/user duplicate',
        f's.post({endpoint_str}, data=user_data).status_code',
        409,
    )
    
    return all_ok

def test_api_login():
    all_ok = True
    s = requests.Session()
    url_str = repr(SERVER_URL + "/api/login")

    all_ok = all_ok and test(
        'POST /api/login no parameters',
        f's.post({url_str}).status_code',
        400,
    )

    
    all_ok = all_ok and test(
        'POST /api/login missing parameter',
        f's.post({url_str}, data={{"username": "mpeschel"}}).status_code',
        400,
    )

    
    credentials_str = repr({
        'username': 'mpeschel',
        'password': 'x'
    })
    all_ok = all_ok and test(
        'POST /api/login wrong password',
        f's.post({url_str}, data={credentials_str}).status_code',
        401,
    )
    
    
    credentials_str = repr({
        'username': 'mpeschel',
        'password': 'mpeschel_password'
    })
    expected_token_contents = { 'user_id':1, 'username':'mpeschel' }
    def is_cookie_ok(expected, observed):
        segments = observed.split('; ')
        if len(segments) != 5: return False
        key_value = segments[0]
        expires_when, secure, http_only, path = None, None, None, None
        for segment in segments[1:]:
            if segment.startswith('Expires '):
                expires_when = segment
            elif segment == 'Secure':
                secure = segment
            elif segment == 'HttpOnly':
                http_only = segment
            elif segment == 'Path=/':
                path = segment
            else:
                return False

        key, value = key_value.split('=', 1)
        if key != 'fa-test-session-jwt': return False
        if not subseteq(expected_token_contents, jwt_to_dict(value)): return False

        when = chomp_left(expires_when, 'Expires ')
        try:
            datetime.datetime.strptime(when, '%a, %d %b %Y %H:%M:%S GMT')
        except ValueError:
            logging.warn(f'Rejecting cookie {observed} due to time formatting error.')
            return False

        if secure != 'Secure': secure, http_only = http_only, secure
        if secure != 'Secure' or http_only != 'HttpOnly': return False

        return True
    all_ok = all_ok and test(
        'POST /api/login credts in body',
        f's.post({url_str}, data={credentials_str}).headers["Set-Cookie"]',
        'fa-test-session-jwt={hexadecimal stuff}; Expires sometime; Secure; HttpOnly; Path=/',
        comparison=is_cookie_ok
    )

    
    credentials_str = repr(('jcarson', 'jcarson_password'))
    all_ok = all_ok and test(
        'POST /api/login creds in Auth header',
        f'jwt_to_dict(s.post({url_str}, auth={credentials_str}).cookies.get("fa-test-session-jwt"))',
        { 'user_id':2, 'username':'jcarson', 'kind':'ADMIN' },
        comparison=subseteq
    )
    
    return all_ok

def test_api_image():
    all_ok = True
    s = requests.Session()
    endpoint_str = repr(SERVER_URL + '/api/image')
    
    # This should fail because it has no body or anything.
    login(s, "radler", "radler_password")
    all_ok = all_ok and test(
        'POST /api/image empty',
        f's.post({endpoint_str}).status_code',
        400,
    )
    
    # This should succeed. The file should appear in /uploads/.
    cat_relative_url = 'api/image/cat.jpg'
    image_file = cat_image_path.open('rb')
    all_ok = all_ok and test(
        'POST /api/image cat',
        f's.post({endpoint_str}, files={{"cat.jpg": image_file}}).json()',
        [cat_relative_url],
    )

    # Confirm file contents same.
    cat_url = SERVER_URL + '/' + cat_relative_url
    all_ok = all_ok and test(
        'GET /api/image cat check upload',
        observed_str=f's.get({repr(cat_url)}).content',
        expected_str='cat_image_path.open("rb").read()',
    )

    return all_ok

def test_api_image_get_list():
    reset_uploads()
    reset_db()

    all_ok = True
    s = requests.Session()

    login(s, "mpeschel", "mpeschel_password") # cat badger beaver dog owl
    all_ok = all_ok and test(
        'GET /api/image admin',
        's.get(SERVER_URL + "/api/image").json()',
        [{'id': 1, 'url': '/api/image/badger.jpg'}, {'id': 2, 'url': '/api/image/beaver.jpg'}, {'id': 3, 'url': '/api/image/dog.jpg'}, {'id': 4, 'url': '/api/image/owl.jpg'}]
    )
    
    login(s, "rculling", "rculling_password") # beaver owl
    all_ok = all_ok and test(
        'GET /api/image rculling beaver owl',
        's.get(SERVER_URL + "/api/image").json()',
        [{'id': 2, 'url': '/api/image/beaver.jpg'}, {'id': 4, 'url': '/api/image/owl.jpg'}]
    )
    
    login(s, "radler", "radler_password") # dog owl
    all_ok = all_ok and test(
        'GET /api/image radler dog owl',
        's.get(SERVER_URL + "/api/image").json()',
        [{'id': 3, 'url': '/api/image/dog.jpg'}, {'id': 4, 'url': '/api/image/owl.jpg'}]
    )
    
    logout(s) # 401 Unauthorized
    all_ok = all_ok and test('GET /api/image unauthorized', 's.get(SERVER_URL + "/api/image").status_code', 401)

    return all_ok

from test_api import test_file_visibility

def main(test_methods=None):
    '''Performs tests on the facial-analytics server. Prints failures to console.

    Assumes the server is up and running at url %s.
    ''' % SERVER_URL

    if test_methods == None:
        def __f(): pass
        function = type(__f)
        globals = inspect.currentframe().f_globals
        test_methods = [value for key, value in globals.items() if key.startswith("test_") and type(value) == function]
    
    logger.debug('Start of main.')

    reset_uploads()
    reset_db()
    
    all_ok = True
    for test_method in test_methods:
        try:
            result = test_method()
            all_ok = all_ok and result
            if result:
                logger.info(f'Test method {test_method.__name__} OK')
            else:
                break
        except Exception as e:
            logger.error(f'Failure on test method {test_method.__name__}: Got exception {e}')
            print(traceback.format_exc())
            all_ok = False
            break

    logger.debug('End of main.')
    logger.info('All tests finished; %s', 'all OK' if all_ok else 'some errors')



if __name__ == '__main__':
    # At the moment, the server creation stuff only works on my specific Arch machine.
    # Feel free to add Windows stuff as necessary.

    os.chdir(repo_dir)

    parser = argparse.ArgumentParser()
    parser.add_argument('--make-server', action='store_true')
    parser.add_argument('--keep-server', action='store_true')
    parser.add_argument('--log-level', default='INFO', choices=logging.getLevelNamesMapping().keys())
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
        main(None)
    except BaseException as e:
        # print('Exception:', e)
        raise e
    finally:
        if not p is None and not args.keep_server:
            time.sleep(2) # If there's an immediate exception, launch_server.sh will not write pid in time.
            server_pid = int(server_pid_path.open().read())
            os.kill(server_pid, signal.SIGTERM)
