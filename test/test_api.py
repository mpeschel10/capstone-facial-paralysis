import base64, datetime, json
from urllib.parse import urlparse
import logging
logger = logging.getLogger('test')

import requests

from test_lib import SERVER_URL
from test_lib import login, logout
from test_lib import reset_db, reset_uploads
from test_lib import test


def urlsafe_b64decode_padded(s):
    return base64.urlsafe_b64decode(s + "=" * ((4 - len(s)) % 4))

def jwt_to_dict(jwt):
    json_str = urlsafe_b64decode_padded(jwt.split(".")[1])
    return json.loads(json_str)

def chomp_left(s, prefix):
    if not s.startswith(prefix): return None
    return s[len(prefix):]



def test_file_visibility():
    from test_lib import owl_image_path, beaver_image_path
    all_ok = True
    s = requests.Session()
    
    test_name = 'GET /api/image unauthenticated'
    observed_str = 's.get(f"{SERVER_URL}/api/image/badger.jpg").status_code'
    expected = 401
    
    logger.debug(f'Begin test {test_name}')
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    test_name = 'GET /api/image admin auth'
    observed_str = f's.get("{SERVER_URL}/api/image/owl.jpg").content'
    expected_str = 'owl_image_path.open("rb").read()'
    
    logger.debug(f'Begin test {test_name}')
    login(s, 'mpeschel', 'mpeschel_password')
    expected = eval(expected_str)
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        all_ok = False
    
    test_name = 'GET /api/image owner auth'
    observed_str = f's.get("{SERVER_URL}/api/image/beaver.jpg").content'
    expected_str = 'beaver_image_path.open("rb").read()'
    
    logger.debug(f'Begin test {test_name}')
    login(s, 'rculling', 'rculling_password')
    expected = eval(expected_str)
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: {observed_str} != {expected_str}')
        all_ok = False
    
    test_name = 'GET /api/image unauthorized'
    observed_str = f's.get("{SERVER_URL}/api/image/dog.jpg").status_code'
    expected = 403
    
    logger.debug(f'Begin test {test_name}')
    observed = eval(observed_str)

    if expected != observed:
        logger.warning(f'Failure on test {test_name}: Expected {observed_str} == {expected} but got {observed}.')
        all_ok = False
    
    return all_ok

def test_api_image():
    from test_lib import cat_image_path
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

def test_api_login():
    from test_lib import subseteq
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
        
        segment_set = {s for s in segments}
        for segment in ['Secure', 'HttpOnly', 'Path=/']:
            if not segment in segment_set:
                return False
            segment_set.discard(segment)
        
        for segment in segment_set:
            if '=' in segment:
                key_value = segment
            elif segment.startswith('Expires '):
                expires_when = segment
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

        return True
    all_ok = all_ok and test(
        'POST /api/login creds in body',
        f's.post({url_str}, data={credentials_str}, allow_redirects=False).headers["Set-Cookie"]',
        'fa-test-session-jwt={hexadecimal stuff}; Expires sometime; Secure; HttpOnly; Path=/',
        comparison=is_cookie_ok
    )

    
    credentials_str = repr(('jcarson', 'jcarson_password'))
    all_ok = all_ok and test(
        'POST /api/login redirect to admin page',
        f'urlparse(s.post({url_str}, auth={credentials_str}).url).path',
        '/dashboard',
    )
    
    
    credentials_str = repr(('rculling', 'rculling_password'))
    all_ok = all_ok and test(
        'POST /api/login redirect to user page',
        f'urlparse(s.post({url_str}, auth={credentials_str}).url).path',
        '/home',
    )
    return all_ok

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

